import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  AuthUnavailableError,
  createSupabaseServerClient,
  getSessionUserOrThrow,
  type SessionUser,
} from "@/lib/supabase/server";
import type { CoachTask } from "./models";

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

/**
 * 利用量を数えられない(DB停止・障害・service role 未設定)。
 * 数えられないまま通すと原価の高いAIを無制限に呼べてしまうので、呼び出し側は 503 で断る。
 */
export class UsageUnavailableError extends Error {}

async function countUsage(
  kind: CoachTask,
  since: Date | null,
  identity: { userId?: string; anonKey?: string }
): Promise<number> {
  // 利用量は RLS で本人の行しか読めず、未登録ユーザーの行は誰も読めない。
  // 正しく数えるには service role が要る(anon キーで数えると未登録の行が見えず常に0になる)。
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    // DB自体を使わない開発環境では計測しない
    if (!isSupabaseConfigured()) return 0;
    throw new UsageUnavailableError("SUPABASE_SERVICE_ROLE_KEY が未設定のため利用量を数えられません");
  }

  let query = supabase.from("usage_events").select("id", { count: "exact", head: true }).eq("kind", kind);
  query = identity.userId
    ? query.eq("user_id", identity.userId)
    : query.eq("anon_key", identity.anonKey ?? "");
  if (since) query = query.gte("created_at", since.toISOString());

  const { count, error } = await query;
  if (error) throw new UsageUnavailableError(`利用量を数えられません: ${error.message}`);
  return count ?? 0;
}

/** 実行前に必ず呼ぶ。超過時はAPIが402を返す */
export async function checkQuota(
  plan: Plan,
  task: CoachTask,
  identity: { userId?: string; anonKey?: string }
): Promise<QuotaDecision> {
  const rule = QUOTA[plan][task];
  const allow = (used: number, limit: number, resetAt?: string): QuotaDecision => ({
    allowed: true,
    plan,
    used,
    limit,
    resetAt,
  });
  const deny = (used: number, limit: number, resetAt?: string): QuotaDecision => ({
    allowed: false,
    plan,
    reason: "quota_exceeded",
    used,
    limit,
    resetAt,
  });

  if (rule.lifetime !== undefined) {
    // 0 はそのプランでは使えないという意味。集計するまでもない
    if (rule.lifetime === 0) return deny(0, 0);
    const used = await countUsage(task, null, identity);
    return used < rule.lifetime ? allow(used, rule.lifetime) : deny(used, rule.lifetime);
  }

  if (rule.perDay !== undefined) {
    const usedToday = await countUsage(task, startOfDay(), identity);
    if (usedToday >= rule.perDay) return deny(usedToday, rule.perDay, nextDay());
    if (rule.perMonth === undefined) return allow(usedToday, rule.perDay, nextDay());
  }

  if (rule.perMonth !== undefined) {
    const usedMonth = await countUsage(task, startOfMonth(), identity);
    return usedMonth < rule.perMonth
      ? allow(usedMonth, rule.perMonth, nextMonth())
      : deny(usedMonth, rule.perMonth, nextMonth());
  }

  return allow(0, Number.MAX_SAFE_INTEGER);
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
  // ここに来る時点でAIの処理は終わっているので、記録に失敗しても結果は返し、失敗をログに残す。
  const supabase = createSupabaseAdminClient();
  if (!supabase) return; // DBを使わない開発環境(countUsage が通った以上、本番ではここに来ない)
  const { error } = await supabase.from("usage_events").insert({
    user_id: params.identity.userId ?? null,
    anon_key: params.identity.userId ? null : (params.identity.anonKey ?? null),
    kind: params.task,
    model: params.model,
    input_tokens: params.usage?.inputTokens ?? null,
    output_tokens: params.usage?.outputTokens ?? null,
    cost_usd: params.costUsd ?? null,
  });
  if (error) {
    console.error(`[coach] 利用量の記録に失敗しました(${params.task}): ${error.message}`);
  }
}

export interface Caller {
  user: SessionUser | null;
  plan: Plan;
  identity: { userId?: string; anonKey?: string };
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}

/**
 * リクエストの送り主とプランを特定する(未ログインは IP と UA のハッシュで識別する)。
 * 認証基盤に届かないときは AuthUnavailableError を投げる(障害中に未ログイン扱いにしない)。
 */
export async function identifyCaller(request: Request): Promise<Caller> {
  const user = await getSessionUserOrThrow();
  const supabase = await createSupabaseServerClient();
  let plan: Plan = "anon";
  if (user && supabase) {
    const { data } = await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle();
    plan = data?.plan === "pro" ? "pro" : "free";
  }
  const identity = user
    ? { userId: user.id }
    : {
        anonKey: anonKeyFrom(
          request.headers.get("x-forwarded-for"),
          request.headers.get("user-agent")
        ),
      };
  return { user, plan, identity, supabase };
}

/**
 * 認証基盤・利用量DBに届かないときのレスポンス本文(503 で返す)。
 * 数えられないまま原価の高いAIを通さないため、この場合は断る。該当しなければ null。
 */
export function serviceUnavailableBody(error: unknown) {
  if (!(error instanceof AuthUnavailableError) && !(error instanceof UsageUnavailableError)) return null;
  console.error(`[coach] ${error.message}`);
  return {
    error: "service_unavailable" as const,
    message: "現在一時的に利用できません。時間をおいてもう一度お試しください。",
  };
}

/** 上限超過時のレスポンス本文(402 で返す) */
export function quotaExceededBody(quota: QuotaDecision) {
  return {
    error: "quota_exceeded" as const,
    plan: quota.plan,
    used: quota.used,
    limit: quota.limit,
    resetAt: quota.resetAt,
    upgradeUrl: "/pricing",
  };
}
