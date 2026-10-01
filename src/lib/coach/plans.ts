import type { CoachTask } from "./models";

/*
 * プランと利用上限の定義。ブラウザからも読むため、サーバー専用の処理(DB・暗号)を持ち込まない。
 * 集計と判定は quota.ts(サーバー専用)が行う。
 */

export type Plan = "anon" | "free" | "pro";

/** 上限の指定。複数あるときは lifetime → perDay → perMonth の順に判定する。0 は利用不可 */
export interface LimitRule {
  perDay?: number;
  perMonth?: number;
  lifetime?: number;
}

/**
 * プラン別・用途別の利用上限。
 * 未登録でも1回はフル分析を体験できる(価値を実感してから登録・課金させる導線)。
 * スクショ読み取りは Vision で原価が高いため登録ユーザーに限る(登録の動機にもなる)。
 */
export const QUOTA: Record<Plan, Record<CoachTask, LimitRule>> = {
  anon: {
    match_review: { lifetime: 1 },
    followup: { perDay: 0 },
    screenshot_parse: { lifetime: 0 },
  },
  free: {
    match_review: { perMonth: 3 },
    followup: { perDay: 3 },
    screenshot_parse: { perMonth: 3 },
  },
  pro: {
    match_review: { perDay: 5, perMonth: 100 },
    followup: { perDay: 50 },
    screenshot_parse: { perDay: 5, perMonth: 100 },
  },
};

/** 上限が戻る時刻を「10月2日 9:00」の形で返す(生涯上限など、戻らないものは null) */
export function describeReset(resetAt?: string): string | null {
  if (!resetAt) return null;
  const date = new Date(resetAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("ja-JP", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}
