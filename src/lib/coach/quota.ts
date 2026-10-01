import { createHash } from "node:crypto";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CoachTask } from "./models";

export type Plan = "anon" | "free" | "pro";

export interface QuotaRule {
  /** フル分析の上限 */
  matchReview: { perDay?: number; perMonth?: number; lifetime?: number };
  /** 追質問の上限(1日あたり) */
  followupPerDay: number;
}

/**
 * プラン別の利用上限。
 * 未登録でも1回はフル分析を体験できる(価値を実感してから登録・課金させる導線)。
 */
export const QUOTA: Record<Plan, QuotaRule> = {
  anon: { matchReview: { lifetime: 1 }, followupPerDay: 0 },
  free: { matchReview: { perMonth: 3 }, followupPerDay: 3 },
  pro: { matchReview: { perDay: 5, perMonth: 100 }, followupPerDay: 50 },
};

export interface QuotaDecision {
  allowed: boolean;
  plan: Plan;
  reason?: "quota_exceeded";
  used: number;
  limit: number;
  /** 上限がリセットされる時刻(lifetimeの場合はなし) */
  resetAt?: string;
}

/** 未登録ユーザーの識別子。IPとUAのハッシュで、個人情報は保存しない */
export function anonKeyFrom(ip: string | null, userAgent: string | null): string {
  return createHash("sha256")
    .update(`${ip ?? "unknown"}|${userAgent ?? "unknown"}`)
    .digest("hex")
    .slice(0, 32);
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function startOfDay(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function nextMonth(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
}

function nextDay(): string {
  const d = startOfDay();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

async function countUsage(
  kind: CoachTask,
  since: Date | null,
  identity: { userId?: string; anonKey?: string }
): Promise<number> {
  // 利用量はRLSで本人の行しか読めず、未登録ユーザーの行は誰も読めない。
  // quota判定は正確さが要るためservice roleで集計する。
  const supabase = createSupabaseAdminClient() ?? (await createSupabaseServerClient());
  // DB未設定時は計測できないため、体験を止めずに0扱いにする(本番では必ず設定する)
  if (!supabase) return 0;

  let query = supabase.from("usage_events").select("id", { count: "exact", head: true }).eq("kind", kind);
  query = identity.userId
    ? query.eq("user_id", identity.userId)
    : query.eq("anon_key", identity.anonKey ?? "");
  if (since) query = query.gte("created_at", since.toISOString());

  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

/** 実行前に必ず呼ぶ。超過時はAPIが402を返す */
export async function checkQuota(
  plan: Plan,
  task: CoachTask,
  identity: { userId?: string; anonKey?: string }
): Promise<QuotaDecision> {
  const rule = QUOTA[plan];

  if (task === "followup") {
    const used = await countUsage("followup", startOfDay(), identity);
    return {
      allowed: used < rule.followupPerDay,
      plan,
      reason: used < rule.followupPerDay ? undefined : "quota_exceeded",
      used,
      limit: rule.followupPerDay,
      resetAt: nextDay(),
    };
  }

  const { lifetime, perDay, perMonth } = rule.matchReview;

  if (lifetime !== undefined) {
    const used = await countUsage("match_review", null, identity);
    return {
      allowed: used < lifetime,
      plan,
      reason: used < lifetime ? undefined : "quota_exceeded",
      used,
      limit: lifetime,
    };
  }

  if (perDay !== undefined) {
    const usedToday = await countUsage("match_review", startOfDay(), identity);
    if (usedToday >= perDay) {
      return { allowed: false, plan, reason: "quota_exceeded", used: usedToday, limit: perDay, resetAt: nextDay() };
    }
  }

  const usedMonth = await countUsage("match_review", startOfMonth(), identity);
  const monthLimit = perMonth ?? Number.MAX_SAFE_INTEGER;
  return {
    allowed: usedMonth < monthLimit,
    plan,
    reason: usedMonth < monthLimit ? undefined : "quota_exceeded",
    used: usedMonth,
    limit: monthLimit,
    resetAt: nextMonth(),
  };
}

/** 実行後に必ず呼ぶ。トークン数と原価を残してコストを可視化する */
export async function recordUsage(params: {
  task: CoachTask;
  model: string;
  identity: { userId?: string; anonKey?: string };
  usage?: { inputTokens: number; outputTokens: number };
  costUsd?: number;
}): Promise<void> {
  // usage_events にはINSERTポリシーを置いていない(ユーザーが自分の利用量を
  // 書き換えられないようにするため)。書き込みは必ずservice roleで行う。
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    if (isSupabaseAdminConfigured()) return;
    // 本番でキー未設定のまま動かすと利用量が記録されずquotaが機能しない
    console.warn(
      "[coach] SUPABASE_SERVICE_ROLE_KEY が未設定のため利用量を記録できません。quotaは機能しません。"
    );
    return;
  }
  await supabase.from("usage_events").insert({
    user_id: params.identity.userId ?? null,
    anon_key: params.identity.userId ? null : (params.identity.anonKey ?? null),
    kind: params.task,
    model: params.model,
    input_tokens: params.usage?.inputTokens ?? null,
    output_tokens: params.usage?.outputTokens ?? null,
    cost_usd: params.costUsd ?? null,
  });
}
