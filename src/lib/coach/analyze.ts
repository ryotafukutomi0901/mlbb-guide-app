import { COACH_JSON_SPEC, coachReportSchema, type CoachInput, type CoachReportPayload } from "./schema";
import { MODEL_ROUTES, estimateCostUsd } from "./models";
import { buildCoachContext, formatMatchData } from "./context";
import { SYSTEM_PROMPT } from "@/prompts/systemPrompt";
import { createAIProvider } from "@/services/ai";

export interface AnalyzeOutcome {
  report: CoachReportPayload;
  model: string;
  usage?: { inputTokens: number; outputTokens: number };
  costUsd?: number;
}

function stripFence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
}

/** 提示していない装備slugをAIが出した場合は落とす(存在しないデータを表示しない) */
function sanitize(report: CoachReportPayload, allowedItemSlugs: string[]): CoachReportPayload {
  const allowed = new Set(allowedItemSlugs);
  return {
    ...report,
    buildAdvice: report.buildAdvice.filter((a) => allowed.has(a.itemSlug)),
    recommendedBuild: report.recommendedBuild.filter((s) => allowed.has(s)),
  };
}

export class CoachUnavailableError extends Error {}
export class CoachInvalidOutputError extends Error {}

/**
 * 試合データをAIで分析する。
 * APIキー未設定なら CoachUnavailableError を投げ、呼び出し側がサンプル表示に切り替える。
 * 検証に失敗した出力は捨てる(偽レポートを返さない)。
 */
export async function analyzeMatch(input: CoachInput): Promise<AnalyzeOutcome> {
  const route = MODEL_ROUTES.match_review;
  const provider = createAIProvider(route.provider);
  if (!provider.isConfigured()) throw new CoachUnavailableError("AI provider is not configured");

  const context = buildCoachContext(input);
  const userPrompt = [
    "<knowledge>",
    context.text,
    "</knowledge>",
    "",
    "<match_data>",
    formatMatchData(input),
    "</match_data>",
    "",
    input.locale === "en"
      ? "Respond in English."
      : "日本語で回答してください。",
    "",
    "次のJSONスキーマに厳密に従って出力してください:",
    COACH_JSON_SPEC,
  ].join("\n");

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userPrompt },
  ];

  // 検証に落ちたら1度だけ再試行する
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await provider.complete(messages, {
      model: route.model,
      temperature: route.temperature,
      maxTokens: route.maxTokens,
      jsonMode: true,
    });
    try {
      const parsed = coachReportSchema.parse(JSON.parse(stripFence(result.content)));
      return {
        report: sanitize(parsed, context.allowedItemSlugs),
        model: result.model,
        usage: result.usage,
        costUsd: estimateCostUsd("match_review", result.usage),
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw new CoachInvalidOutputError(
    `AIの出力がスキーマに適合しませんでした: ${String(lastError).slice(0, 200)}`
  );
}
