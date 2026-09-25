import { NextResponse } from "next/server";
import { analyzeMatch, CoachInvalidOutputError, CoachUnavailableError } from "@/lib/coach/analyze";
import { checkQuota, identifyCaller, quotaExceededBody, recordUsage } from "@/lib/coach/quota";
import { coachInputSchema } from "@/lib/coach/schema";
import { SAMPLE_COACH_RESULT } from "@/lib/coach/sample";
import { getLatestPatch } from "@/repositories/contentRepository";

export const runtime = "nodejs";

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

  // 2. 本人特定とプラン判定
  const { user, plan, identity, supabase } = await identifyCaller(request);

  // 3. quota判定
  const quota = await checkQuota(plan, "match_review", identity);
  if (!quota.allowed) {
    return NextResponse.json(quotaExceededBody(quota), { status: 402 });
  }

  // 4. 分析
  try {
    const outcome = await analyzeMatch(input);

    await recordUsage({
      task: "match_review",
      model: outcome.model,
      identity,
      usage: outcome.usage,
      costUsd: outcome.costUsd,
    });

    // 5. ログイン済みなら永続化(未ログインは保存しない)
    if (user && supabase) {
      await supabase.from("coach_reports").insert({
        user_id: user.id,
        report: outcome.report,
        model: outcome.model,
        input_tokens: outcome.usage?.inputTokens ?? null,
        output_tokens: outcome.usage?.outputTokens ?? null,
        cost_usd: outcome.costUsd ?? null,
        patch: getLatestPatch().version,
      });
    }

    return NextResponse.json({
      source: "ai" as const,
      report: outcome.report,
      plan,
      remaining: Math.max(0, quota.limit - quota.used - 1),
    });
  } catch (error) {
    // APIキー未設定: AI処理を装わず、サンプルであることを明示して返す
    if (error instanceof CoachUnavailableError) {
      return NextResponse.json({
        source: "sample" as const,
        report: SAMPLE_COACH_RESULT,
        plan,
        remaining: quota.limit - quota.used,
        notice:
          "AIプロバイダのAPIキーが未設定のため、サンプルレポートを表示しています。これはあなたの試合の分析結果ではありません。",
      });
    }
    if (error instanceof CoachInvalidOutputError) {
      return NextResponse.json({ error: "invalid_ai_output" }, { status: 502 });
    }
    return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
  }
}
