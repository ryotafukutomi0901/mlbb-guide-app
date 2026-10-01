"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** ログイン状態の表示(判定は useAuthUser。静的生成を維持するためクライアントで見る) */
export function AuthMenu() {
  const router = useRouter();
  const auth = useAuthUser();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // 未設定環境・判定前・障害中は何も出さない(ちらつきと、ログイン済みの人への誤ったログイン案内を避ける)
  if (auth.status !== "signedIn" && auth.status !== "signedOut") return null;

  if (auth.status === "signedOut") {
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
          {auth.user.email?.split("@")[0] ?? "マイページ"}
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
