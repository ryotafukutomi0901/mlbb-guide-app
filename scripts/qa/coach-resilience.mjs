// Supabase の停止・遅延・障害時にAIコーチのAPIが「断る」ことの検証。docs/redesign/06_VERIFICATION.md 6-2d。
// ルートハンドラを直接呼び、Supabase と OpenRouter は fetch の差し替えで模擬する
// (外部には一切送らない。実アカウントもAPIキーも不要)。
// 実行: node scripts/qa/coach-resilience.mjs
import path from "node:path";
import { createJiti } from "jiti";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SUPABASE = "http://localhost:54321";

// 環境変数はモジュール読み込み時に読まれるため、構成ごとにモジュールを読み直す
const load = (file) =>
  createJiti(import.meta.url, {
    moduleCache: false,
    alias: {
      "@": path.join(ROOT, "src"),
      "next/headers": path.join(import.meta.dirname, "fixtures/next-headers.mjs"),
    },
  }).import(path.join(ROOT, file));

function configure({ supabase = true, serviceRole = true, ai = true } = {}) {
  const set = (key, value) => (value ? (process.env[key] = value) : delete process.env[key]);
  set("NEXT_PUBLIC_SUPABASE_URL", supabase && SUPABASE);
  set("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabase && "anon-key");
  set("SUPABASE_SERVICE_ROLE_KEY", serviceRole && "service-role-key");
  set("OPENROUTER_API_KEY", ai && "test");
}

const results = [];
const check = (name, cond, detail = "") => results.push({ name, ok: !!cond, detail });

// ── 模擬サーバー ─────────────────────────────────────────
const b64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const USER = { id: "11111111-1111-4111-8111-111111111111", email: "player@example.com" };
const exp = Math.floor(Date.now() / 1000) + 3600;
const ACCESS_TOKEN = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.sig`;
const SESSION_COOKIE = {
  name: "sb-localhost-auth-token",
  value:
    "base64-" +
    b64url({
      access_token: ACCESS_TOKEN,
      refresh_token: "refresh",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: exp,
      user: { ...USER, aud: "authenticated", role: "authenticated" },
    }),
};

const { SAMPLE_COACH_RESULT } = await load("src/lib/coach/sample.ts");

/** 挙動: "ok" | "down"(503) | "hang"(応答しない) | "unauthorized"(401) */
let mode;
let calls;
let aiReplies;

function reset(next = {}) {
  mode = { auth: "ok", count: 0, countFails: false, insertFails: false, plan: "free", ...next };
  calls = { auth: 0, count: 0, usageInserts: [], reports: 0, ai: 0 };
  aiReplies = [];
  globalThis.__TEST_COOKIES__ = next.loggedIn ? [SESSION_COOKIE] : [];
}

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

/** 中断されるまで応答しない(停止中のDBを模擬)。中断されたら fetch と同じく例外にする */
const hang = (signal) =>
  new Promise((_, reject) => {
    if (!signal) return;
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url);
  const method = (init.method ?? "GET").toUpperCase();
  const signal = init.signal;

  if (url.hostname === "openrouter.ai") {
    calls.ai++;
    const content = aiReplies.shift() ?? JSON.stringify(SAMPLE_COACH_RESULT);
    return json({
      model: "anthropic/claude-sonnet-5",
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 1000, completion_tokens: 100 },
    });
  }

  if (url.origin !== SUPABASE) throw new Error(`想定外の送信先: ${url}`);

  if (url.pathname === "/auth/v1/user") {
    calls.auth++;
    if (mode.auth === "hang") return hang(signal);
    if (mode.auth === "down") return json({ message: "Service Unavailable" }, 503);
    if (mode.auth === "unauthorized") return json({ code: 401, msg: "invalid JWT" }, 401);
    return json({ ...USER, aud: "authenticated", role: "authenticated" });
  }

  if (url.pathname === "/rest/v1/usage_events") {
    if (method === "HEAD" || method === "GET") {
      calls.count++;
      if (mode.countFails) return json({ message: "upstream timeout" }, 503);
      return new Response(null, { status: 200, headers: { "content-range": `*/${mode.count}` } });
    }
    calls.usageInserts.push(JSON.parse(init.body));
    return mode.insertFails ? json({ message: "insert failed" }, 500) : new Response(null, { status: 201 });
  }

  if (url.pathname === "/rest/v1/profiles") {
    const row = { plan: mode.plan };
    const accept = new Headers(init.headers).get("accept") ?? "";
    return json(accept.includes("vnd.pgrst.object") ? row : [row]);
  }

  if (url.pathname === "/rest/v1/coach_reports") {
    calls.reports++;
    return new Response(null, { status: 201 });
  }

  throw new Error(`想定外の Supabase 呼び出し: ${method} ${url.pathname}`);
};

// ── 呼び出し ─────────────────────────────────────────────
const MATCH = { heroSlug: "layla", result: "defeat", kills: 3, deaths: 7, assists: 5, durationMinutes: 15 };

async function analyze(env, scenario) {
  configure(env);
  reset(scenario);
  const { POST } = await load("src/app/api/coach/analyze/route.ts");
  const started = Date.now();
  const res = await POST(
    new Request("http://localhost/api/coach/analyze", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", "user-agent": "qa" },
      body: JSON.stringify(MATCH),
    })
  );
  return { status: res.status, body: await res.json(), ms: Date.now() - started };
}

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAfbLI3wAAAABJRU5ErkJggg==",
  "base64"
);

async function parseScreenshot(env, scenario) {
  configure(env);
  reset(scenario);
  const { POST } = await load("src/app/api/coach/parse-screenshot/route.ts");
  const form = new FormData();
  form.append("image", new Blob([PNG], { type: "image/png" }), "shot.png");
  const res = await POST(new Request("http://localhost/api/coach/parse-screenshot", { method: "POST", body: form }));
  return { status: res.status, body: await res.json() };
}

// ── 1. 分析API ────────────────────────────────────────────
{
  const r = await analyze({ ai: false, serviceRole: false }, {});
  check("AI未設定: 利用量に触れずサンプルを返す", r.status === 200 && r.body.source === "sample", r);
  check("AI未設定: Supabase にも AI にも問い合わせない", calls.count === 0 && calls.auth === 0 && calls.ai === 0, calls);
}
{
  const r = await analyze({ serviceRole: false }, {});
  check("service role未設定: 数えられないので 503", r.status === 503 && r.body.error === "service_unavailable", r);
  check("service role未設定: AIを呼ばない(原価を出さない)", calls.ai === 0, calls);
}
{
  const r = await analyze({}, { countFails: true });
  check("利用量DBの障害: 0件と数えず 503", r.status === 503 && r.body.error === "service_unavailable", r);
  check("利用量DBの障害: AIを呼ばない", calls.ai === 0, calls);
}
{
  const r = await analyze({}, { loggedIn: true, auth: "down" });
  check("認証基盤の障害: 未ログイン扱いにせず 503", r.status === 503, r);
  check("認証基盤の障害: AIを呼ばない", calls.ai === 0 && calls.count === 0, calls);
}
{
  const r = await analyze({}, { loggedIn: true, auth: "hang" });
  check("認証基盤が無応答: 打ち切って 503", r.status === 503, r);
  check("認証基盤が無応答: 3秒の上限で打ち切る(4.5秒以内に返す)", r.ms < 4500, `${r.ms}ms`);
}
{
  const r = await analyze({}, { loggedIn: true, auth: "unauthorized" });
  check("トークン失効(401): 未ログインとして分析を続ける", r.status === 200 && r.body.source === "ai", r);
  check("トークン失効(401): 未登録の枠で数える", calls.usageInserts[0]?.anon_key && !calls.usageInserts[0]?.user_id, calls.usageInserts);
}
{
  const r = await analyze({}, {});
  check("未登録・枠内: AIで分析する", r.status === 200 && r.body.source === "ai" && r.body.remaining === 0, r);
  const row = calls.usageInserts[0];
  check("未登録・枠内: 原価を記録する", row?.kind === "match_review" && row.input_tokens === 1000 && row.cost_usd === 0.003, row);
}
{
  const r = await analyze({}, { count: 1 });
  check("未登録・枠超過: 402", r.status === 402 && r.body.error === "quota_exceeded", r);
  check("未登録・枠超過: AIを呼ばない", calls.ai === 0, calls);
}
{
  const invalid = "これはJSONではない";
  configure({});
  const r = await (async () => {
    reset({});
    aiReplies.push(invalid, invalid);
    const { POST } = await load("src/app/api/coach/analyze/route.ts");
    const res = await POST(
      new Request("http://localhost/api/coach/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(MATCH),
      })
    );
    return { status: res.status, body: await res.json() };
  })();
  check("出力不正×2: 502 で偽レポートを返さない", r.status === 502, r);
  const row = calls.usageInserts[0];
  check("出力不正×2: 2回分の原価を記録する", row?.input_tokens === 2000 && row.output_tokens === 200 && row.cost_usd === 0.006, row);
}
{
  const r = await analyze({}, { loggedIn: true });
  check("ログイン済み: 分析してレポートを保存する", r.status === 200 && r.body.plan === "free" && calls.reports === 1, { r, calls });
  check("ログイン済み: 利用量を本人に紐づける", calls.usageInserts[0]?.user_id === USER.id, calls.usageInserts);
}
{
  const r = await analyze({}, { insertFails: true });
  check("利用量の記録失敗: 分析結果は返す(AIの処理は済んでいる)", r.status === 200 && r.body.source === "ai", r);
}

// ── 2. スクショ読み取りAPI ────────────────────────────────
{
  const r = await parseScreenshot({}, { loggedIn: true, auth: "down" });
  check("スクショ・認証障害: 503", r.status === 503 && r.body.error === "service_unavailable", r);
}
{
  const r = await parseScreenshot({}, {});
  check("スクショ・未ログイン: 401", r.status === 401 && r.body.error === "login_required", r);
}
{
  const r = await parseScreenshot({ ai: false }, { loggedIn: true });
  check("スクショ・AI未設定: 読み取ったふりをせず 503", r.status === 503 && r.body.error === "unavailable", r);
  check("スクショ・AI未設定: 利用量に触れない", calls.count === 0 && calls.ai === 0, calls);
}
{
  const r = await parseScreenshot({}, { loggedIn: true, countFails: true });
  check("スクショ・利用量DBの障害: 503", r.status === 503 && r.body.error === "service_unavailable", r);
  check("スクショ・利用量DBの障害: AIを呼ばない", calls.ai === 0, calls);
}
{
  const extraction = {
    isMatchResultScreen: true, result: "victory", kills: 8, deaths: 2, assists: 11,
    durationText: "13:05", gold: 10432, heroName: "Layla", allyHeroNames: [], enemyHeroNames: [],
  };
  configure({});
  reset({ loggedIn: true });
  aiReplies.push(JSON.stringify(extraction));
  const { POST } = await load("src/app/api/coach/parse-screenshot/route.ts");
  const form = new FormData();
  form.append("image", new Blob([PNG], { type: "image/png" }), "shot.png");
  const res = await POST(new Request("http://localhost/api/coach/parse-screenshot", { method: "POST", body: form }));
  const body = await res.json();
  check("スクショ・正常: 値を返す", res.status === 200 && body.fields.heroSlug === "layla" && body.fields.kills === 8, body);
  check("スクショ・正常: 原価を記録する", calls.usageInserts[0]?.kind === "screenshot_parse", calls.usageInserts);
}

// ── 3. proxy(全ページの前段) ────────────────────────────
{
  configure({});
  reset({ loggedIn: true, auth: "hang" });
  const { proxy } = await load("src/proxy.ts");
  const { NextRequest } = await import("next/server.js");
  const started = Date.now();
  const res = await proxy(
    new NextRequest("http://localhost/heroes", {
      headers: { cookie: `${SESSION_COOKIE.name}=${SESSION_COOKIE.value}` },
    })
  );
  const ms = Date.now() - started;
  check("proxy・認証基盤が無応答: ページ表示を止めず先へ進める", res.headers.get("x-middleware-next") === "1", [...res.headers]);
  check("proxy・認証基盤が無応答: 1.5秒の上限で打ち切る(2.5秒以内)", ms < 2500, `${ms}ms`);
}

// ── 4. fetchWithTimeout ──────────────────────────────────
{
  const { fetchWithTimeout } = await load("src/lib/supabase/fetch.ts");
  reset({ auth: "hang" });
  const timed = fetchWithTimeout(50);
  let reason;
  try { await timed(`${SUPABASE}/auth/v1/user`); } catch (e) { reason = e; }
  check("時間切れ: TimeoutError で中断する", reason?.name === "TimeoutError", String(reason));

  const outer = new AbortController();
  const pending = timed(`${SUPABASE}/auth/v1/user`, { signal: outer.signal }).catch((e) => e);
  outer.abort(new Error("caller cancelled"));
  const cancelled = await pending;
  check("呼び出し側の中断: その理由のまま中断する", cancelled?.message === "caller cancelled", String(cancelled));
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.ok || r.detail === "" ? "" : `  (${JSON.stringify(r.detail).slice(0, 600)})`}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
