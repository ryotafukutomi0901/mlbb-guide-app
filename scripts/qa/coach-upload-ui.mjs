// スクショ取り込みUI(Phase 4 B3)の検証。docs/redesign/06_VERIFICATION.md 6-3b。
// 実アカウント・APIキー・本番Supabaseを使わない。Supabase の向き先を使われていないローカルの番地にした
// ビルドを起動し、ブラウザ側の認証とスクショ読み取りAPIは Playwright の差し替えで模擬する。
//
//   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=qa npm run build
//   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=qa npm run start -- -p 3002
//   node coach-upload-ui.mjs [出力先]   (playwright を入れた場所で実行する。audit.mjs と同じ)
//
// 終わったら通常の環境変数でビルドし直すこと。
import fs from "node:fs";
import zlib from "node:zlib";
import { chromium } from "playwright";

const BASE = "http://localhost:3002";
const SUPABASE = "http://localhost:54321";
const OUT = process.argv[2] || "shots-upload";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, cond, detail = "") => results.push({ name, ok: !!cond, detail });

// ── 模擬データ ───────────────────────────────────────────
const b64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const USER = { id: "11111111-1111-4111-8111-111111111111", email: "player@example.com", aud: "authenticated", role: "authenticated" };
const exp = Math.floor(Date.now() / 1000) + 3600;
const SESSION_COOKIE = {
  name: "sb-localhost-auth-token",
  value:
    "base64-" +
    b64url({
      access_token: `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ sub: USER.id, exp, role: "authenticated" })}.sig`,
      refresh_token: "refresh",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: exp,
      user: USER,
    }),
  domain: "localhost",
  path: "/",
};

/** 単色ではないPNGを作る(縮小・再エンコードの経路を通すため、長辺1600pxを超える大きさにできる) */
function makePng(width, height) {
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.set([8, 2, 0, 0, 0], 8); // 8bit RGB
  const rows = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const off = y * (width * 3 + 1);
    for (let x = 0; x < width; x++) {
      rows[off + 1 + x * 3] = (x * 7) & 255;
      rows[off + 2 + x * 3] = (y * 5) & 255;
      rows[off + 3 + x * 3] = ((x ^ y) * 3) & 255;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
const BIG_PNG = makePng(2400, 1080);
const SMALL_PNG = makePng(800, 360);

const PARSED = {
  fields: {
    heroSlug: "layla",
    result: "victory",
    kills: 8,
    deaths: 2,
    assists: 11,
    durationMinutes: 13,
    gold: null,
    allyHeroes: ["tigreal"],
    enemyHeroes: [],
  },
  unreadable: ["gold"],
  unresolvedHeroNames: ["Laylaa"],
  remaining: 2,
};

// ── 共通 ─────────────────────────────────────────────────
const browser = await chromium.launch();

async function open({ viewport, loggedIn, auth = "ok", parse, analyze }) {
  const ctx = await browser.newContext({
    viewport,
    isMobile: viewport.width < 768,
    hasTouch: viewport.width < 768,
    deviceScaleFactor: 2,
    locale: "ja-JP",
    reducedMotion: "reduce",
  });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem("mlbb:splash-seen", "1"); } catch {}
  });
  if (loggedIn) await ctx.addCookies([SESSION_COOKIE]);

  const seen = { parse: [], analyze: [], authCalls: 0 };
  await ctx.route(`${SUPABASE}/**`, (route) => {
    seen.authCalls++;
    if (auth === "down") return route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
    if (new URL(route.request().url()).pathname === "/auth/v1/user") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
    }
    return route.fulfill({ status: 404, body: "" });
  });
  await ctx.route("**/api/coach/parse-screenshot", async (route) => {
    const req = route.request();
    seen.parse.push({ body: req.postDataBuffer(), contentType: req.headers()["content-type"] });
    const reply = parse.shift();
    if (reply === "abort") return route.abort();
    return route.fulfill({ status: reply.status ?? 200, contentType: "application/json", body: JSON.stringify(reply.body) });
  });
  if (analyze) {
    await ctx.route("**/api/coach/analyze", async (route) => {
      seen.analyze.push(JSON.parse(route.request().postData()));
      const reply = analyze.shift();
      return route.fulfill({ status: reply.status ?? 200, contentType: "application/json", body: JSON.stringify(reply.body) });
    });
  }

  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => {
    // テスト自身が返した 4xx/5xx の読み込み失敗ログは除く(アプリのエラーではない)
    if (m.type() === "error" && !/^Failed to load resource: the server responded with a status of/.test(m.text())) {
      errors.push(m.text().slice(0, 200));
    }
  });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 200)));
  await page.goto(`${BASE}/coach`, { waitUntil: "load" });
  // ストリーミングの差し替え前は隠れた複製が一時的に残るため、1つに確定するまで待つ
  await page.waitForFunction(() => document.querySelectorAll("#kills").length === 1);
  // リンク先の先読みが続くため、静かになるのを待ちすぎない(ログイン判定の反映を待つのが目的)
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  return { ctx, page, seen, errors };
}

const upload = (page, buffer, name = "result.png") =>
  page.setInputFiles("#screenshot", { name, mimeType: "image/png", buffer });
const overflowX = (page) =>
  page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);

// ── 1. 未ログイン ─────────────────────────────────────────
{
  const { ctx, page, errors } = await open({ viewport: { width: 375, height: 812 }, loggedIn: false, parse: [] });
  const notice = page.getByText("すると、試合結果のスクショからKDAや試合時間を自動入力できます");
  check("未ログイン: ログインすれば使えると案内する", await notice.isVisible());
  check("未ログイン: 画像の選択欄を出さない", (await page.locator("#screenshot").count()) === 0);
  check("未ログイン: コンソールエラーなし", errors.length === 0, errors);
  await page.screenshot({ path: `${OUT}/mobile--logged-out.png`, fullPage: true });
  await ctx.close();
}

// ── 2. 認証基盤の障害 ─────────────────────────────────────
{
  const { ctx, page } = await open({ viewport: { width: 375, height: 812 }, loggedIn: true, auth: "down", parse: [] });
  await page.waitForTimeout(500);
  check("認証障害: 選択欄もログイン案内も出さない(ログイン済みの人にログインを促さない)",
    (await page.locator("#screenshot").count()) === 0 &&
      !(await page.getByText("自動入力できます").isVisible()));
  check("認証障害: ヘッダーにログインボタンを出さない", (await page.getByRole("link", { name: "ログイン" }).count()) === 0);
  await ctx.close();
}

// ── 3. 読み取り → 自動入力 → 確認・修正 → 送信(スマホ・PC) ──────────
for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
  const vp = viewport.width < 768 ? "mobile" : "desktop";
  const { ctx, page, seen, errors } = await open({
    viewport,
    loggedIn: true,
    parse: [{ body: PARSED }],
    analyze: [{ status: 402, body: { error: "quota_exceeded", plan: "free", used: 3, limit: 3, resetAt: "2026-11-01T00:00:00.000Z", upgradeUrl: "/pricing" } }],
  });
  check(`${vp}: ログイン済みなら選択欄を出す`, await page.getByText("試合結果のスクショから入力する").isVisible());
  await page.locator("#screenshot").focus();
  const ring = await page.locator("label:has(#screenshot)").evaluate((el) => getComputedStyle(el).boxShadow);
  check(`${vp}: キーボードで選ぶと欄に枠が出る`, ring !== "none", ring);

  await upload(page, BIG_PNG);
  await page.getByText("AIが読み取った値を入力しました").waitFor();

  const sent = seen.parse[0];
  check(`${vp}: 大きい画像は端末で縮小してJPEGで送る`,
    sent && /image\/jpeg/.test(sent.body.toString("latin1")) && sent.body.length < BIG_PNG.length,
    sent && { bytes: sent.body.length, original: BIG_PNG.length });
  check(`${vp}: ヒーローを入力`, (await page.locator("#hero").inputValue()) === "layla");
  check(`${vp}: KDA・時間を入力`,
    (await page.locator("#kills").inputValue()) === "8" &&
      (await page.locator("#deaths").inputValue()) === "2" &&
      (await page.locator("#assists").inputValue()) === "11" &&
      (await page.locator("#durationMinutes").inputValue()) === "13");
  check(`${vp}: 勝敗を入力`, (await page.getByRole("button", { name: "勝利", exact: true }).getAttribute("aria-pressed")) === "true");
  check(`${vp}: 読めなかったゴールドは空欄`, (await page.locator("#gold").inputValue()) === "");
  check(`${vp}: 味方ヒーローを入力`, await page.getByRole("button", { name: "ティグラルを外す" }).isVisible());
  check(`${vp}: AIが入れた値に目印(ヒーロー・勝敗・K/D/A・時間・味方 = 7)`,
    (await page.locator('span[title="AIがスクショから読み取った値"]').count()) === 7);
  check(`${vp}: 読めなかった項目と特定できなかった名前を示す`,
    await page.getByText("読み取れなかった項目: ゴールド").isVisible() &&
      await page.getByText("特定できなかったヒーロー名: Laylaa").isVisible());
  check(`${vp}: 残り回数を示す`, await page.getByText("スクショ読み取りの残り 2回").isVisible());
  check(`${vp}: スクショを見比べられる`, await page.getByText("選んだスクショを表示").isVisible());
  await page.screenshot({ path: `${OUT}/${vp}--filled.png`, fullPage: true });

  // 本人が直したら目印を外す
  await page.locator("#kills").fill("9");
  check(`${vp}: 直した項目は目印が外れる`, (await page.locator('span[title="AIがスクショから読み取った値"]').count()) === 6);

  await page.getByRole("button", { name: "無料で分析する" }).click();
  await page.getByText("今月の無料分析を使い切りました").waitFor();
  const body = seen.analyze[0];
  check(`${vp}: 確認後の値で送信する`,
    body?.heroSlug === "layla" && body.result === "victory" && body.kills === 9 && body.durationMinutes === 13 &&
      !("gold" in body) && JSON.stringify(body.allyHeroes) === '["tigreal"]', body);
  check(`${vp}: 登録済み(free)の上限には登録を促さない`,
    !(await page.getByText("無料で登録する").isVisible()) && await page.getByText("11月1日").isVisible());
  check(`${vp}: 横はみ出しなし`, (await overflowX(page)) <= 1, await overflowX(page));
  check(`${vp}: コンソールエラーなし`, errors.length === 0, errors);
  await ctx.close();
}

// ── 4. 読めなかった必須項目は送信前に止める ──────────────────
{
  const { ctx, page, seen } = await open({
    viewport: { width: 375, height: 812 },
    loggedIn: true,
    parse: [{ body: { ...PARSED, fields: { ...PARSED.fields, kills: null, heroSlug: null }, unreadable: ["heroSlug", "kills", "gold"] } }],
    analyze: [],
  });
  await upload(page, SMALL_PNG);
  await page.getByText("AIが読み取った値を入力しました").waitFor();
  const sent = seen.parse[0];
  check("小さいPNGは縮小せずそのまま送る", sent && /image\/png/.test(sent.body.toString("latin1")));
  check("読めなかったヒーローは未選択にする(先頭のヒーローで分析しない)", (await page.locator("#hero").inputValue()) === "");
  await page.getByRole("button", { name: "無料で分析する" }).click();
  check("必須が空欄なら送信しない", seen.analyze.length === 0);
  check("空欄の項目をまとめて名指しする", await page.getByText("未入力の項目があります: 使用ヒーロー・キル").isVisible());
  check("黄色枠の項目を示す", await page.getByText("枠が黄色の項目はスクショから読み取れませんでした").isVisible());
  await page.screenshot({ path: `${OUT}/mobile--missing.png`, fullPage: true });
  await ctx.close();
}

// ── 5. 失敗時の案内(どれも手入力で続けられる) ──────────────
{
  const replies = [
    { status: 402, body: { error: "quota_exceeded", plan: "free", used: 3, limit: 3, resetAt: "2026-11-01T00:00:00.000Z", upgradeUrl: "/pricing" } },
    { status: 401, body: { error: "login_required", message: "x" } },
    { status: 503, body: { error: "unavailable", message: "スクショ読み取りは現在利用できません。手入力で分析できます。" } },
    { status: 422, body: { error: "not_match_result", message: "試合結果の画面が見つかりませんでした。結果画面のスクショを選んでください。" } },
    { status: 415, body: { error: "unsupported_type", message: "PNG・JPEG・WebP の画像を選んでください。" } },
    "abort",
  ];
  const expected = [
    ["402: 回数切れと戻る日・プランへの導線", "スクショ読み取りの回数を使い切りました", "プランを見る"],
    ["401: 再ログインへの導線", "ログインの有効期限が切れました", "ログイン"],
    ["503: サーバーの説明をそのまま出す", "スクショ読み取りは現在利用できません", null],
    ["422: 結果画面ではない", "試合結果の画面が見つかりませんでした", null],
    ["415: 画像の選び直し", "PNG・JPEG・WebP の画像を選んでください", null],
    ["通信失敗", "通信に失敗しました", null],
  ];
  const { ctx, page } = await open({ viewport: { width: 375, height: 812 }, loggedIn: true, parse: replies });
  for (const [name, text, link] of expected) {
    await upload(page, SMALL_PNG);
    const alert = page.getByRole("alert").filter({ hasText: text });
    await alert.waitFor({ timeout: 5000 }).catch(() => {});
    const linked = link ? (await alert.getByRole("link", { name: link }).count()) === 1 : true;
    check(`失敗 ${name}`, (await alert.count()) === 1 && linked);
    check(`失敗 ${name}: フォームは手入力のまま使える`, await page.locator("#kills").isEnabled());
  }
  await page.screenshot({ path: `${OUT}/mobile--error.png`, fullPage: true });
  await ctx.close();
}

// ── 6. 未登録の上限・料金表 ───────────────────────────────
{
  const { ctx, page } = await open({
    viewport: { width: 375, height: 812 },
    loggedIn: false,
    parse: [],
    analyze: [{ status: 402, body: { error: "quota_exceeded", plan: "anon", used: 1, limit: 1, upgradeUrl: "/pricing" } }],
  });
  await page.getByRole("button", { name: "無料で分析する" }).click();
  await page.getByText("無料体験の分析を使いました").waitFor();
  check("未登録の上限: 登録を案内する", await page.getByRole("link", { name: "無料で登録する" }).isVisible());
  await page.goto(`${BASE}/pricing`, { waitUntil: "load" });
  const row = page.locator("tr", { hasText: "試合結果のスクショから自動入力" });
  check("料金表: スクショ読み取りの行(Free 月3回 / Pro 1日5回・月100回)",
    (await row.count()) === 1 && /月3回/.test(await row.innerText()) && /1日5回 \/ 月100回/.test(await row.innerText()));
  await ctx.close();
}

// ── 7. 320px で崩れない ───────────────────────────────────
{
  const { ctx, page } = await open({ viewport: { width: 320, height: 720 }, loggedIn: true, parse: [{ body: PARSED }] });
  await upload(page, SMALL_PNG);
  await page.getByText("AIが読み取った値を入力しました").waitFor();
  check("320px: 横はみ出しなし", (await overflowX(page)) <= 1, await overflowX(page));
  await page.screenshot({ path: `${OUT}/mobile320--filled.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.ok || r.detail === "" ? "" : `  (${JSON.stringify(r.detail).slice(0, 400)})`}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
