"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60";

export function AuthForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!configured) {
    return (
      <Card>
        <h2 className="text-sm font-bold">アカウント機能は準備中です</h2>
        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          この環境ではデータベースが接続されていないため、登録・ログインは利用できません。
          登録不要のAIコーチ体験はそのままお使いいただけます。
        </p>
      </Card>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("認証クライアントを初期化できませんでした。");
      setPending(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (signUpError) throw signUpError;
        setNotice(
          "確認メールを送信しました。メール内のリンクを開くと登録が完了します。"
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(
        /Invalid login credentials/i.test(message)
          ? "メールアドレスまたはパスワードが違います。"
          : /already registered/i.test(message)
            ? "このメールアドレスは登録済みです。ログインをお試しください。"
            : /Password should be at least/i.test(message)
              ? "パスワードは6文字以上で設定してください。"
              : "処理に失敗しました。時間をおいてもう一度お試しください。"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card accent>
      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-surface/70 p-1">
        {(
          [
            ["signin", "ログイン"],
            ["signup", "新規登録"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setError(null);
              setNotice(null);
            }}
            aria-pressed={mode === value}
            className={cn(
              "flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition-colors",
              mode === value ? "gradient-primary text-white" : "text-text-muted hover:text-text"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted" htmlFor="email">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted" htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          {mode === "signup" && (
            <p className="mt-1 text-[11px] text-text-faint">6文字以上で設定してください。</p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-xl border border-success/40 bg-success/10 px-3 py-2 text-xs text-success">
            {notice}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : mode === "signup" ? (
            <UserPlus size={15} />
          ) : (
            <LogIn size={15} />
          )}
          {mode === "signup" ? "登録する" : "ログイン"}
        </Button>
      </form>
    </Card>
  );
}
