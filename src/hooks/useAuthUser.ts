"use client";

import { useEffect, useState } from "react";
import { isAuthApiError, isAuthSessionMissingError } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthState =
  /** Supabase 未設定(アカウント機能なし) */
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; user: { id: string; email?: string } }
  /** 認証基盤に届かない。未ログインとは区別する(ログイン済みの人にログインを促さない) */
  | { status: "unavailable" };

/**
 * ブラウザ側のログイン状態。表示の出し分けにだけ使う(権限の判定は必ずサーバーで行う)。
 * サーバーでcookieを読むと全ページが動的レンダリングになるため、ここで判定する。
 */
export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>(() =>
    isSupabaseConfigured() ? { status: "loading" } : { status: "unconfigured" }
  );

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const toState = (user: { id: string; email?: string } | null | undefined): AuthState =>
      user ? { status: "signedIn", user: { id: user.id, email: user.email } } : { status: "signedOut" };

    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      // セッションなし・トークン失効(4xx)は未ログイン。それ以外(5xx・通信失敗・時間切れ)は障害
      const outage =
        error &&
        !isAuthSessionMissingError(error) &&
        !(isAuthApiError(error) && error.status >= 400 && error.status < 500);
      setState(outage ? { status: "unavailable" } : toState(data.user));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // 初回通知は手元のcookieを読むだけで検証していないため、getUser() の結果を待つ
      if (event === "INITIAL_SESSION") return;
      setState(toState(session?.user));
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
