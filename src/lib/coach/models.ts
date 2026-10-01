import type { AIProviderName } from "@/services/ai";

export type CoachTask = "match_review" | "followup";

interface ModelRoute {
  provider: AIProviderName;
  model: string;
  maxTokens: number;
  /** 対応モデルのときだけ指定する(anthropic/claude-sonnet-5 は非対応で、送ると拒否されうる) */
  temperature?: number;
  /** 100万トークンあたりのUSD。usage_eventsの原価計算に使う */
  inputCostPerMTok: number;
  outputCostPerMTok: number;
}

/**
 * 用途ごとにモデルを振り分ける。
 * フル分析は品質が収益の源泉なので上位モデル、追質問は軽量モデル。
 * ビルド/カウンター提案はKnowledge Layerから生成するためAIを使わない(原価ゼロ)。
 */
export const MODEL_ROUTES: Record<CoachTask, ModelRoute> = {
  match_review: {
    provider: "openrouter",
    model: "anthropic/claude-sonnet-5",
    maxTokens: 4096,
    // 単価はOpenRouterの公開値(2026-09確認)。画像は入力トークンとして課金される
    inputCostPerMTok: 2,
    outputCostPerMTok: 10,
  },
  followup: {
    provider: "openrouter",
    // OpenRouter上のslug。日付付きの "claude-haiku-4-5-20251001" はOpenRouterに存在しない
    model: "anthropic/claude-haiku-4.5",
    maxTokens: 1024,
    temperature: 0.4,
    inputCostPerMTok: 1,
    outputCostPerMTok: 5,
  },
};

export function estimateCostUsd(
  task: CoachTask,
  usage?: { inputTokens: number; outputTokens: number }
): number | undefined {
  if (!usage) return undefined;
  const route = MODEL_ROUTES[task];
  const cost =
    (usage.inputTokens / 1_000_000) * route.inputCostPerMTok +
    (usage.outputTokens / 1_000_000) * route.outputCostPerMTok;
  return Math.round(cost * 1_000_000) / 1_000_000;
}
