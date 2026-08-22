/**
 * Cloudflare Pages Function：Rustコード実行API
 *
 * ローカル開発時のserver.jsと同じインターフェースで、
 * Rust Playground APIへサーバーサイドからプロキシする。
 */
const MAX_CODE_BYTES = 64 * 1024;

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function onRequestPost(context) {
  let code;
  try {
    const body = await context.request.json();
    code = body.code;
  } catch {
    return json({ error: "リクエストの形式が不正です。" }, 400);
  }
  if (typeof code !== "string" || code.trim() === "") {
    return json({ error: "コードが空です。" }, 400);
  }
  if (code.length > MAX_CODE_BYTES) {
    return json({ error: "コードが大きすぎます（上限64KB）。" }, 413);
  }

  try {
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
    });
    if (!res.ok) {
      return json(
        { error: "実行サービスが混み合っています。少し待って再実行してください。" },
        502
      );
    }
    const data = await res.json();
    return json({
      success: Boolean(data.success),
      compiler: data.stderr || "",
      stdout: data.stdout || "",
      stderr: "",
      backend: "playground",
    });
  } catch (e) {
    return json(
      { error: "実行サービスに接続できませんでした。", detail: String(e && e.message ? e.message : e) },
      502
    );
  }
}
