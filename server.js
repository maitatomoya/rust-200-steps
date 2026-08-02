/**
 * Rust 200 Steps 開発サーバー
 *
 * 依存パッケージゼロ（Node標準ライブラリのみ）で動作する。
 * - public/ 配下の静的ファイル配信
 * - POST /api/run：Rustコードのコンパイル・実行
 *   - ローカルにrustcがあれば一時ディレクトリでコンパイル・実行する
 *   - なければRust Playground APIへサーバー側からプロキシする
 *     （ブラウザから直接呼ぶとCORSで弾かれるためサーバーを経由する）
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3939;
const PUBLIC_DIR = path.join(__dirname, "public");
const MAX_CODE_BYTES = 64 * 1024;
const COMPILE_TIMEOUT_MS = 20000;
const RUN_TIMEOUT_MS = 8000;

// 起動時に一度だけローカルrustcの有無を判定する
const rustcCheck = spawnSync("rustc", ["--version"], { encoding: "utf8" });
const HAS_LOCAL_RUSTC = rustcCheck.status === 0;
const RUSTC_VERSION = HAS_LOCAL_RUSTC ? rustcCheck.stdout.trim() : null;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

/** ローカルのrustcでコンパイル・実行する */
function runWithLocalRustc(code) {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "rust-tutor-"));
  const srcPath = path.join(workDir, "main.rs");
  const binPath = path.join(workDir, "main");
  try {
    fs.writeFileSync(srcPath, code, "utf8");

    const compile = spawnSync(
      "rustc",
      ["--edition", "2021", "-o", binPath, srcPath],
      { encoding: "utf8", timeout: COMPILE_TIMEOUT_MS }
    );
    if (compile.error && compile.error.code === "ETIMEDOUT") {
      return {
        success: false,
        compiler: "コンパイルがタイムアウトしました（20秒）。",
        stdout: "",
        stderr: "",
        backend: "local",
      };
    }
    if (compile.status !== 0) {
      return {
        success: false,
        compiler: compile.stderr || "コンパイルに失敗しました。",
        stdout: "",
        stderr: "",
        backend: "local",
      };
    }

    const run = spawnSync(binPath, [], {
      encoding: "utf8",
      timeout: RUN_TIMEOUT_MS,
      cwd: workDir,
    });
    const timedOut = run.error && run.error.code === "ETIMEDOUT";
    return {
      success: !timedOut && run.status === 0,
      compiler: compile.stderr || "",
      stdout: run.stdout || "",
      stderr: timedOut
        ? "実行がタイムアウトしました（8秒）。無限ループがないか確認してください。"
        : run.stderr || "",
      backend: "local",
    };
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

/** Rust Playground APIにプロキシする */
async function runWithPlayground(code) {
  const res = await fetch("https://play.rust-lang.org/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channel: "stable",
      mode: "debug",
      edition: "2021",
      crateType: "bin",
      tests: false,
      code,
      backtrace: false,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    throw new Error("Playground APIエラー: HTTP " + res.status);
  }
  const data = await res.json();
  // Playgroundのstderrはコンパイラ出力と実行時stderrが混在するため、
  // フロントでは「コンパイラ／標準エラー出力」としてまとめて表示する
  return {
    success: Boolean(data.success),
    compiler: data.stderr || "",
    stdout: data.stdout || "",
    stderr: "",
    backend: "playground",
  };
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (urlPath === "/") urlPath = "/index.html";

  // ディレクトリトラバーサル対策：public配下に正規化されるパスのみ許可
  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/status") {
    sendJson(res, 200, {
      backend: HAS_LOCAL_RUSTC ? "local" : "playground",
      rustcVersion: RUSTC_VERSION,
    });
    return;
  }

  if (req.method === "POST" && req.url === "/api/run") {
    let body = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_CODE_BYTES) {
        sendJson(res, 413, { error: "コードが大きすぎます（上限64KB）。" });
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", async () => {
      let code;
      try {
        const parsed = JSON.parse(body);
        code = parsed.code;
      } catch {
        sendJson(res, 400, { error: "リクエストの形式が不正です。" });
        return;
      }
      if (typeof code !== "string" || code.trim() === "") {
        sendJson(res, 400, { error: "コードが空です。" });
        return;
      }
      try {
        const result = HAS_LOCAL_RUSTC
          ? runWithLocalRustc(code)
          : await runWithPlayground(code);
        sendJson(res, 200, result);
      } catch (e) {
        sendJson(res, 502, {
          error:
            "実行サービスに接続できませんでした。ネットワーク接続を確認してください。" +
            "（ローカルにRustをインストールするとオフラインでも実行できます）",
          detail: String(e && e.message ? e.message : e),
        });
      }
    });
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method Not Allowed");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Rust 200 Steps: http://localhost:" + PORT);
  console.log(
    "実行バックエンド: " +
      (HAS_LOCAL_RUSTC
        ? "ローカルrustc（" + RUSTC_VERSION + "）"
        : "Rust Playground API（rustcをインストールするとローカル実行に切り替わります）")
  );
});
