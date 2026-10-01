import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Bot, Target, TrendingUp } from "lucide-react";
import { CoachExperience } from "@/components/coach/CoachExperience";
import { CoachDashboard } from "@/components/coach/CoachDashboard";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { alternateLanguages } from "@/i18n/config";

const DESCRIPTION =
  "MLBB(モバイルレジェンド)のAIコーチ。試合データを入力すると、最大の課題と次の1試合で直すべき点を分析します。無料で試せます。";

export const metadata: Metadata = {
  title: "AIコーチ",
  description: DESCRIPTION,
  alternates: { canonical: "/coach", languages: alternateLanguages("/coach") },
  openGraph: { title: "AIコーチ | MLBB LAB", description: DESCRIPTION, url: "/coach" },
};

const VALUE_POINTS = [
  {
    icon: Target,
    title: "課題を1つに絞る",
    body: "改善点を並べても実行できません。次の試合で直すべき点を1つに絞って示します。",
  },
  {
    icon: BarChart3,
    title: "攻略データに基づく",
    body: "ヒーローのスキル・装備・相性データを参照して分析します。一般論では終わりません。",
  },
  {
    icon: TrendingUp,
    title: "続けると変化が見える",
    body: "分析を重ねると、直したはずの癖が戻っていないかを追えるようになります。",
  },
];

export default function CoachPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "ホーム", path: "/" },
          { name: "AIコーチ", path: "/coach" },
        ])}
      />
      <PageHeader
        title="AIコーチ"
        titleEn="AI Coach"
        description="試合データを入力すると、あなたの最大の課題と、次の1試合で直せる具体的な行動を返します。"
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {VALUE_POINTS.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
              <Icon size={17} />
            </span>
            <h2 className="mt-3 text-sm font-bold">{title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{body}</p>
          </Card>
        ))}
      </div>

      <CoachExperience />

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Bot size={15} className="text-primary" />
            レポートの見本
          </h2>
          <Link href="/pricing" className="text-xs font-semibold text-primary hover:text-neon">
            Proでできること →
          </Link>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-text-muted">
          継続して分析を重ねると、次のような詳細レポートが蓄積されます。以下はサンプルデータによる表示です。
        </p>
        <CoachDashboard />
      </section>
    </div>
  );
}
