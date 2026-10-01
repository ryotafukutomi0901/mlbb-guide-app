import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";

/**
 * 攻略ページからAIコーチへ収束させる共通導線。
 * 「一般論の攻略」から「あなたの試合の話」へ橋渡しする。
 */
export function CoachCTA({ heroName }: { heroName?: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-5 sm:flex-row sm:items-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-primary">
        <Bot size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">
          {heroName ? `${heroName}を使った自分の試合は、どこが問題だった?` : "自分の試合は、どこが問題だった?"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          攻略情報が示すのは一般的な正解です。AIコーチはあなたの試合データを読んで、次の1試合で直すべき点を名指しします。
        </p>
      </div>
      <Link
        href="/coach"
        className="gradient-primary inline-flex shrink-0 items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(139,92,246,0.4)] transition-shadow hover:shadow-[0_0_28px_rgba(139,92,246,0.6)]"
      >
        AIコーチで分析
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
