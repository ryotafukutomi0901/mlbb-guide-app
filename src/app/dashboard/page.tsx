import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, LogIn } from "lucide-react";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ダッシュボード",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = isSupabaseConfigured() ? await getSessionUser() : null;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
        <PageHeader
          title="ダッシュボード"
          titleEn="Dashboard"
          description="分析結果・進捗・今日のフォーカスをまとめる、あなた専用の画面です。"
        />
        <Card accent className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
            <LogIn size={22} />
          </span>
          <h2 className="mt-4 text-base font-bold">
            {isSupabaseConfigured() ? "ログインが必要です" : "アカウント機能は準備中です"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {isSupabaseConfigured()
              ? "ログインすると、分析結果の保存・弱点の推移・今日のフォーカスが表示されます。"
              : "分析結果の保存と進捗の可視化は現在準備中です。まずは登録不要のAIコーチ体験をお試しください。"}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/coach"
              className="gradient-primary inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
            >
              <Bot size={15} />
              AIコーチを試す
              <ArrowRight size={15} />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <DashboardView userId={user.id} />;
}
