import { NextResponse } from "next/server";
import { CoachUnavailableError, isCoachConfigured } from "@/lib/coach/analyze";
import {
  checkQuota,
  identifyCaller,
  quotaExceededBody,
  recordUsage,
  serviceUnavailableBody,
  type Caller,
} from "@/lib/coach/quota";
import { parseMatchScreenshot, readScreenshotUpload, SCREENSHOT_MAX_BYTES } from "@/lib/coach/vision";

export const runtime = "nodejs";

/** multipart の境界やヘッダの分だけ上乗せした、本文全体の上限 */
const MAX_REQUEST_BYTES = SCREENSHOT_MAX_BYTES + 256 * 1024;

const fail = (status: number, error: string, message: string) =>
  NextResponse.json({ error, message }, { status });

/**
 * 試合結果スクショを読み取り、分析フォームに入れる値を返す。
 * 画像は保存しない(解析のためにメモリ上で扱うだけで、ログにも残さない)。
 */
export async function POST(request: Request) {
  // 1. 大きすぎる本文は読む前に断る
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_REQUEST_BYTES) {
    return fail(413, "too_large", "画像は5MB以下にしてください。");
  }

  // 2. 本人特定。スクショ読み取りは登録ユーザーのみ(Vision は原価が高い)
  let caller: Caller;
  try {
    caller = await identifyCaller(request);
  } catch (error) {
    const unavailable = serviceUnavailableBody(error);
    if (unavailable) return NextResponse.json(unavailable, { status: 503 });
    throw error;
  }
  const { user, plan, identity } = caller;
  if (!user) {
    return fail(401, "login_required", "スクショ読み取りはログインすると使えます。");
  }
  // APIキー未設定なら、画像を受け取る前に断る(読み取ったふりをしない)
  if (!isCoachConfigured("screenshot_parse")) {
    return fail(503, "unavailable", "スクショ読み取りは現在利用できません。手入力で分析できます。");
  }

  // 3. 入力検証(申告された MIME は信用せず、中身で判定する)
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "invalid_form", "画像を添付して送信してください。");
  }
  const upload = await readScreenshotUpload(form);
  if (!upload.ok) return fail(upload.status, upload.error, upload.message);

  // 4. 利用上限(数えられないときは通さない)
  let quota;
  try {
    quota = await checkQuota(plan, "screenshot_parse", identity);
  } catch (error) {
    const unavailable = serviceUnavailableBody(error);
    if (unavailable) return NextResponse.json(unavailable, { status: 503 });
    throw error;
  }
  if (!quota.allowed) return NextResponse.json(quotaExceededBody(quota), { status: 402 });

  // 5. 読み取り
  try {
    const outcome = await parseMatchScreenshot({ mediaType: upload.mediaType, data: upload.data });
    // トークンを使った結果はすべて記録する(読み取れなかった場合も原価は発生している)
    await recordUsage({
      task: "screenshot_parse",
      model: outcome.model,
      identity,
      usage: outcome.usage,
      costUsd: outcome.costUsd,
    });

    if (outcome.kind === "not_match") {
      return fail(422, "not_match_result", "試合結果の画面が見つかりませんでした。結果画面のスクショを選んでください。");
    }
    if (outcome.kind === "invalid") {
      return fail(502, "invalid_ai_output", "読み取りに失敗しました。手入力で分析を続けられます。");
    }
    return NextResponse.json({
      fields: outcome.fields,
      unreadable: outcome.unreadable,
      unresolvedHeroNames: outcome.unresolvedHeroNames,
      remaining: Math.max(0, quota.limit - quota.used - 1),
    });
  } catch (error) {
    // APIキー未設定: 読み取ったふりをせず、使えないことをそのまま返す
    if (error instanceof CoachUnavailableError) {
      return fail(503, "unavailable", "スクショ読み取りは現在利用できません。手入力で分析できます。");
    }
    return fail(500, "parse_failed", "読み取りに失敗しました。手入力で分析を続けられます。");
  }
}
