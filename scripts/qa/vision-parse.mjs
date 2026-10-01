// スクショ読み取り(Phase 4 B2)の検証。docs/redesign/06_VERIFICATION.md 6-2c。
// fetch を差し替えてAIの応答を模擬するので、APIキーも通信も不要(外部APIには一切送らない)。
// 実行: node scripts/qa/vision-parse.mjs
import path from "node:path";
import { createJiti } from "jiti";

const ROOT = path.resolve(import.meta.dirname, "../..");
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(ROOT, "src") } });
const vision = await jiti.import(path.join(ROOT, "src/lib/coach/vision.ts"));
const { CoachUnavailableError } = await jiti.import(path.join(ROOT, "src/lib/coach/analyze.ts"));

const results = [];
const check = (name, cond, detail = "") => results.push({ name, ok: !!cond, detail });
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const extraction = (over = {}) => ({
  isMatchResultScreen: true,
  result: "defeat",
  kills: 3,
  deaths: 7,
  assists: 5,
  durationText: "14:32",
  gold: 9876,
  heroName: "Layla",
  allyHeroNames: [],
  enemyHeroNames: [],
  ...over,
});

// ── 1. 値の対応づけ ─────────────────────────────────────
{
  const r = vision.toFormFields(extraction());
  check("対応: 読めた値をそのまま採用", r.fields.kills === 3 && r.fields.deaths === 7 && r.fields.gold === 9876);
  check("対応: 英語名のヒーローを正準slugへ", r.fields.heroSlug === "layla");
  check("対応: 試合時間 14:32 → 15分", r.fields.durationMinutes === 15, r.fields.durationMinutes);
  check("対応: 全部読めたら unreadable は空", eq(r.unreadable, []), r.unreadable);
}
{
  const r = vision.toFormFields(extraction({ kills: 120, gold: -5, durationText: "99:99" }));
  check("範囲外: キル120は採用しない", r.fields.kills === null);
  check("範囲外: 負のゴールドは採用しない", r.fields.gold === null);
  check("範囲外: 不正な時間表記は採用しない", r.fields.durationMinutes === null);
  check("範囲外: 捨てた項目を unreadable に挙げる", ["kills", "gold", "durationMinutes"].every((k) => r.unreadable.includes(k)), r.unreadable);
}
{
  const r = vision.toFormFields(extraction({ heroName: "ライラ", kills: null, result: null }));
  check("未読: null はそのまま空欄にする(推測で埋めない)", r.fields.kills === null && r.fields.result === null);
  check("未読: 日本語表記のヒーローも解決", r.fields.heroSlug === "layla");
}
{
  const r = vision.toFormFields(extraction({ heroName: "Laylaa" }));
  check("解決不能: 近い名前に当て推量しない", r.fields.heroSlug === null);
  check("解決不能: 名前を unresolvedHeroNames で返す", eq(r.unresolvedHeroNames, ["Laylaa"]), r.unresolvedHeroNames);
}
{
  const r = vision.toFormFields(
    extraction({
      allyHeroNames: ["Layla", "ティグラル", "Tigreal", "Estes", "隼", "ゴセン", "Unknown"],
      enemyHeroNames: ["Fanny", "Franco"],
    })
  );
  check("味方: 本人・重複を除き4体まで", eq(r.fields.allyHeroes, ["tigreal", "estes", "hayabusa", "gusion"]), r.fields.allyHeroes);
  check("敵: 解決できた名前を採用", eq(r.fields.enemyHeroes, ["fanny", "franco"]));
  check("味方: 解決不能な名前を報告", r.unresolvedHeroNames.includes("Unknown"));
}
check("時間: 0:45 → 最低1分", vision.durationToMinutes("0:45") === 1);
check("時間: 12分05秒 → 12分", vision.durationToMinutes("12分05秒") === 12);
check("時間: 全角 １２：３４ → 13分", vision.durationToMinutes("１２：３４") === 13);
check("時間: 61:00 は分析の上限(60分)を超えるので不採用",
  vision.toFormFields(extraction({ durationText: "61:00" })).fields.durationMinutes === null);

// ── 2. アップロード検証(申告MIMEではなく中身で判定) ───────────
const PNG = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAfbLI3wAAAABJRU5ErkJggg==", "base64"));
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const WEBP = new Uint8Array([...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBPVP8 ")]);
check("形式: PNG を判定", vision.sniffImageType(PNG) === "image/png");
check("形式: JPEG を判定", vision.sniffImageType(JPEG) === "image/jpeg");
check("形式: WebP を判定", vision.sniffImageType(WEBP) === "image/webp");
check("形式: テキストは拒否", vision.sniffImageType(new TextEncoder().encode("hello world!!")) === null);

const form = (...files) => {
  const f = new FormData();
  for (const [bytes, type] of files) f.append("image", new Blob([bytes], { type }), "shot.png");
  return f;
};
{
  const ok = await vision.readScreenshotUpload(form([PNG, "image/png"]));
  check("受付: 正しいPNGは通す", ok.ok && ok.mediaType === "image/png" && ok.data === Buffer.from(PNG).toString("base64"));
  const lied = await vision.readScreenshotUpload(form([new TextEncoder().encode("<script>x</script>"), "image/png"]));
  check("受付: MIMEをimage/pngと偽ったテキストは415", !lied.ok && lied.status === 415);
  const realJpegClaimedPng = await vision.readScreenshotUpload(form([JPEG, "image/png"]));
  check("受付: 申告と中身が違えば中身の形式を採る", realJpegClaimedPng.ok && realJpegClaimedPng.mediaType === "image/jpeg");
  const none = await vision.readScreenshotUpload(new FormData());
  check("受付: 画像なしは400", !none.ok && none.status === 400);
  const two = await vision.readScreenshotUpload(form([PNG, "image/png"], [PNG, "image/png"]));
  check("受付: 2枚は400", !two.ok && two.status === 400);
  const empty = await vision.readScreenshotUpload(form([new Uint8Array(0), "image/png"]));
  check("受付: 空ファイルは400", !empty.ok && empty.status === 400);
  const big = new Uint8Array(vision.SCREENSHOT_MAX_BYTES + 1);
  big.set(PNG);
  const tooBig = await vision.readScreenshotUpload(form([big, "image/png"]));
  check("受付: 5MB超は413", !tooBig.ok && tooBig.status === 413);
}

// ── 3. AI呼び出し(OpenRouter を模擬) ─────────────────────
const replies = [];
let requests = [];
globalThis.fetch = async (_url, init) => {
  requests.push(JSON.parse(init.body));
  const content = replies.shift();
  return new Response(
    JSON.stringify({ model: "anthropic/claude-sonnet-5", choices: [{ message: { content } }], usage: { prompt_tokens: 1000, completion_tokens: 100 } }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
};
const image = { mediaType: "image/png", data: Buffer.from(PNG).toString("base64") };

delete process.env.OPENROUTER_API_KEY;
let unavailable = false;
try { await vision.parseMatchScreenshot(image); } catch (e) { unavailable = e instanceof CoachUnavailableError; }
check("キー未設定: 読み取ったふりをせず CoachUnavailableError", unavailable);
check("キー未設定: AIを一切呼ばない", requests.length === 0);
process.env.OPENROUTER_API_KEY = "test";

requests = []; replies.push(JSON.stringify(extraction()));
{
  const out = await vision.parseMatchScreenshot(image);
  const req = requests[0];
  check("送信: 画像を image_url で添付", req.messages[1].content.some((p) => p.type === "image_url" && p.image_url.url.startsWith("data:image/png;base64,")));
  check("送信: 構造化出力(json_schema, strict)で拘束", req.response_format?.type === "json_schema" && req.response_format.json_schema.strict === true);
  check("送信: スキーマの全objectが additionalProperties:false", req.response_format.json_schema.schema.additionalProperties === false);
  check("送信: sonnet-5 に temperature を送らない", !("temperature" in req));
  check("成功: parsed を返す", out.kind === "parsed" && out.fields.heroSlug === "layla");
  check("成功: 原価を計算(1000入力+100出力 = $0.003)", out.costUsd === 0.003, out.costUsd);
}

requests = []; replies.push("これはJSONではない", JSON.stringify(extraction()));
{
  const out = await vision.parseMatchScreenshot(image);
  check("再試行: 1回目が不正でも2回目で成功", out.kind === "parsed" && requests.length === 2);
  check("再試行: 2回分のトークンを合算して記録", out.usage.inputTokens === 2000 && out.usage.outputTokens === 200, out.usage);
}

requests = []; replies.push("{}", JSON.stringify({ ...extraction(), kills: "three" }));
{
  const out = await vision.parseMatchScreenshot(image);
  check("失敗: 2回とも不正なら invalid(値を返さない)", out.kind === "invalid" && !("fields" in out));
  check("失敗: それでも消費トークンは返す", out.usage.inputTokens === 2000, out.usage);
}

requests = []; replies.push(JSON.stringify({ ...extraction(), isMatchResultScreen: false }));
check("別画面: 試合結果でなければ not_match", (await vision.parseMatchScreenshot(image)).kind === "not_match");

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.ok || r.detail === "" ? "" : `  (${JSON.stringify(r.detail)})`}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
