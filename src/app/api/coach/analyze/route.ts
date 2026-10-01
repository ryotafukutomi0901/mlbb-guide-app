import { NextResponse } from "next/server";
import {
  analyzeMatch,
  CoachInvalidOutputError,
  CoachUnavailableError,
  isCoachConfigured,
} from "@/lib/coach/analyze";
import {
  checkQuota,
  identifyCaller,
  quotaExceededBody,
  recordUsage,
  serviceUnavailableBody,
  type Caller,
  type QuotaDecision,
} from "@/lib/coach/quota";
import { coachInputSchema } from "@/lib/coach/schema";
import { SAMPLE_COACH_RESULT } from "@/lib/coach/sample";
import { getLatestPatch } from "@/repositories/contentRepository";

export const runtime = "nodejs";

/** APIキー未設定: AI処理を装わず、サンプルであることを明示して返す(原価ゼロなので利用量は数えない) */
const sampleResponse = () =>
  NextResponse.json({
    source: "sample" as const,
    report: SAMPLE_COACH_RESULT,
    notice:
      "AIプロバイダのAPIキーが未設定のため、サンプルレポートを表示しています。これはあなたの試合の分析結果ではありません。",
  });

export async function POST(request: Request) {
  // 1. 入力検証(信頼しない)
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = coachInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues.map((i) => i.path.join(".")) },
      { status: 400 }
    );
  }
  const input = parsed.data;

  if (!isCoachConfigured("match_review")) return sampleResponse();

  // 2. 本人特定・プラン判定・quota判定(数えられないときは通さない)
  let caller: Caller;
  let quota: QuotaDecision;
  try {
    caller = await identifyCaller(request);
    quota = await checkQuota(caller.plan, "match_review", caller.identity);
  } catch (error) {
    const unavailable = serviceUnavailableBody(error);
    if (unavailable) return NextResponse.json(unavailable, { status: 503 });
    throw error;
  }
  const { user, plan, identity, supabase } = caller;
  if (!quota.allowed) {
    return NextResponse.json(quotaExceededBody(quota), { status: 402 });
  }

  // 3. 分析
  try {
    const outcome = await analyzeMatch(input);

    await recordUsage({
      task: "match_review",
      model: outcome.model,
      identity,
      usage: outcome.usage,
      costUsd: outcome.costUsd,
    });

    // 4. ログイン済みなら永続化(未ログインは保存しない)
    if (user && supabase) {
      const { error } = await supabase.from("coach_reports").insert({
        user_id: user.id,
        report: outcome.report,
        model: outcome.model,
        input_tokens: outcome.usage?.inputTokens ?? null,
        output_tokens: outcome.usage?.outputTokens ?? null,
        cost_usd: outcome.costUsd ?? null,
        patch: getLatestPatch().version,
      });
      // 分析結果は返す(保存できなかったことはログに残す)
      if (error) console.error(`[coach] レポートの保存に失敗しました: ${error.message}`);
    }

    return NextResponse.json({
      source: "ai" as const,
      report: outcome.report,
      plan,
      remaining: Math.max(0, quota.limit - quota.used - 1),
    });
  } catch (error) {
    // 事前確認の後にキーが外れた場合も、偽の分析は返さない
    if (error instanceof CoachUnavailableError) return sampleResponse();
    if (error instanceof CoachInvalidOutputError) {
      // 表示はしないが、消費したトークンの原価は記録する
      await recordUsage({ task: "match_review", identity, ...error.spend });
      return NextResponse.json({ error: "invalid_ai_output" }, { status: 502 });
    }
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }
}
