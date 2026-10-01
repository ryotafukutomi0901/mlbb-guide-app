import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Bot, CloudOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

/** ダッシュボードを表示できないときの案内(未ログイン・準備中・一時的な障害) */
export function DashboardNotice({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="ダッシュボード"
        titleEn="Dashboard"
        description="分析結果・進捗・今日のフォーカスをまとめる、あなた専用の画面です。"
      />
      <Card accent className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="mt-4 text-base font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{children}</p>
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

/** 認証基盤・DBに届かないとき。ログイン済みの人に「ログインが必要」「記録がない」と誤って出さない */
export function DashboardUnavailable() {
  return (
    <DashboardNotice icon={<CloudOff size={22} />} title="一時的に表示できません">
      アカウント情報を読み込めませんでした。時間をおいて再読み込みしてください。AIコーチの分析は引き続きお試しいただけます。
    </DashboardNotice>
  );
}
