/**
 * 模範解答の実行検証スクリプト
 *
 * 全ステップのsolutionを実際にコンパイル・実行し、
 * expectedOutputが標準出力に含まれるかを検証する。
 *
 * ローカルにrustcがあればローカルで、なければRust Playground APIで検証する。
 * Playground使用時は負荷をかけないよう1件ずつ間隔を空けて実行する。
 *
 * 使い方：
 *   node scripts/check-solutions.js            # 全200ステップ
 *   node scripts/check-solutions.js 41 60      # ステップ41〜60のみ
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const CONTENT_DIR = path.join(__dirname, "..", "public", "content");
const chapters = [];
global.registerChapter = (ch) => chapters.push(ch);
global.window = { RUST_TUTOR_CHAPTERS: chapters };

for (const f of fs.readdirSync(CONTENT_DIR).filter((f) => /^chapter\d{2}\.js$/.test(f))) {
  require(path.join(CONTENT_DIR, f));
}

const steps = chapters
  .flatMap((c) => c.steps || [])
  .sort((a, b) => a.id - b.id);

const from = Number(process.argv[2] || 1);
const to = Number(process.argv[3] || 200);
const targets = steps.filter((s) => s.id >= from && s.id <= to);

const hasRustc = spawnSync("rustc", ["--version"]).status === 0;
const DELAY_MS = hasRustc ? 0 : 800;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runLocal(code) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rust-check-"));
  try {
    const src = path.join(dir, "main.rs");
    const bin = path.join(dir, "main");
    fs.writeFileSync(src, code);
    const c = spawnSync("rustc", ["--edition", "2021", "-o", bin, src], {
      encoding: "utf8",
      timeout: 30000,
    });
    if (c.status !== 0) return { success: false, stdout: "", stderr: c.stderr };
    const r = spawnSync(bin, [], { encoding: "utf8", timeout: 10000 });
    return { success: r.status === 0, stdout: r.stdout || "", stderr: r.stderr || "" };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function runPlayground(code) {
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
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  return { success: data.success, stdout: data.stdout || "", stderr: data.stderr || "" };
}

(async () => {
  console.log(
    `検証対象: ステップ${from}〜${to}（${targets.length}件）` +
      ` バックエンド: ${hasRustc ? "ローカルrustc" : "Playground API"}`
  );
  const failures = [];

  for (const s of targets) {
    let result;
    try {
      result = hasRustc ? runLocal(s.solution) : await runPlayground(s.solution);
    } catch (e) {
      // ネットワークエラー等は1回だけリトライする
      await sleep(3000);
      try {
        result = hasRustc ? runLocal(s.solution) : await runPlayground(s.solution);
      } catch (e2) {
        failures.push({ id: s.id, title: s.title, reason: "通信エラー: " + e2.message });
        console.log(`  ${s.id}: 通信エラー`);
        continue;
      }
    }

    if (!result.success) {
      failures.push({
        id: s.id,
        title: s.title,
        reason: "コンパイル/実行失敗",
        detail: (result.stderr || "").slice(0, 1500),
      });
      console.log(`  ${s.id}: 失敗（コンパイル/実行エラー）`);
    } else if (
      s.expectedOutput != null &&
      s.expectedOutput !== "" &&
      !result.stdout.includes(s.expectedOutput)
    ) {
      failures.push({
        id: s.id,
        title: s.title,
        reason: "expectedOutput不一致",
        detail:
          "期待: " + JSON.stringify(s.expectedOutput) +
          "\n実際: " + JSON.stringify(result.stdout.slice(0, 500)),
      });
      console.log(`  ${s.id}: 失敗（期待出力の不一致）`);
    } else {
      console.log(`  ${s.id}: OK`);
    }
    if (DELAY_MS) await sleep(DELAY_MS);
  }

  console.log("");
  if (failures.length === 0) {
    console.log("全件OK");
  } else {
    console.log(`失敗: ${failures.length}件`);
    for (const f of failures) {
      console.log(`\n--- ステップ${f.id}: ${f.title}（${f.reason}）---`);
      if (f.detail) console.log(f.detail);
    }
    process.exit(1);
  }
})();
