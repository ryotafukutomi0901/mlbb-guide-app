import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isAuthApiError, isAuthSessionMissingError } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";
import { SUPABASE_TIMEOUT_MS, fetchWithTimeout } from "./fetch";

/**
 * Server Component / Route Handler用クライアント。
 * 未設定環境では null を返し、呼び出し側が未ログイン扱いにフォールバックする。
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { fetch: fetchWithTimeout(SUPABASE_TIMEOUT_MS.server) },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Componentからの書き込みは無視(セッション更新はproxyが担当)
        }
      },
    },
  });
}

export interface SessionUser {
  id: string;
  email?: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null;
}

/** 認証基盤に問い合わせられない(停止・障害・時間切れ)。未ログインとは区別する */
export class AuthUnavailableError extends Error {}

/**
 * ルートハンドラ用のログイン判定。未ログインは null を返し、
 * 認証基盤に届かないときは例外にする(障害中に「未ログイン」と誤って扱わないため)。
 * トークンが無効・期限切れ(4xx)は未ログイン扱い。
 */
export async function getSessionUserOrThrow(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error && !isAuthSessionMissingError(error)) {
    const status = isAuthApiError(error) ? error.status : 0;
    if (!(status >= 400 && status < 500)) {
      throw new AuthUnavailableError(`認証基盤に問い合わせられません: ${error.message}`);
    }
  }
  return data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null;
}
