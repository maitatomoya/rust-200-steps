/**
 * Cloudflare Pages Function：実行バックエンドの情報
 */
export function onRequestGet() {
  return new Response(
    JSON.stringify({ backend: "playground", rustcVersion: null }),
    { headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}
