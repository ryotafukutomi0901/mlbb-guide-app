"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * ログイン状態の表示。
 * サーバー側でcookieを読むと全ページが動的レンダリングになりSEO/性能を損なうため、
 * ここはクライアントでセッションを見る(静的生成を維持するための設計判断)。
 */
export function AuthMenu() {
  const router = useRouter();
  const [state, setState] = useState<{ ready: boolean; label: string | null }>({
    ready: false,
    label: null,
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    // 未設定環境ではセッションを判定できないため、何も表示しないまま終える
    if (!supabase) return;

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setState({ ready: true, label: data.user?.email?.split("@")[0] ?? null });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ ready: true, label: session?.user.email?.split("@")[0] ?? null });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // 未設定環境・判定前は何も出さない(表示のちらつきを避ける)
  if (!state.ready) return null;

  if (!state.label) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
      >
        <LogIn size={14} />
        <span className="hidden sm:inline">ログイン</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-1.5 transition-colors hover:border-primary/50"
      >
        <User size={14} className="text-primary" />
        <span className="hidden max-w-24 truncate text-xs font-semibold md:block">
          {state.label}
        </span>
      </Link>
      <button
        type="button"
        onClick={signOut}
        aria-label="ログアウト"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface/60 text-text-muted transition-colors hover:border-danger/50 hover:text-danger"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}
