import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { alternateLanguages } from "@/i18n/config";
import { QUOTA } from "@/lib/coach/quota";

const DESCRIPTION =
  "MLBB LABのプラン。攻略情報とAIコーチの無料枠は誰でも使えます。Proでは分析回数の拡大と、弱点の推移・練習メニュー・ヒーロー別コーチングが利用できます。";

export const metadata: Metadata = {
  title: "プラン",
  description: DESCRIPTION,
  alternates: { canonical: "/pricing", languages: alternateLanguages("/pricing") },
  openGraph: { title: "プラン | MLBB LAB", description: DESCRIPTION, url: "/pricing" },
};

interface Row {
  label: string;
  free: string | boolean;
  pro: string | boolean;
}

const ROWS: Row[] = [
  { label: "ヒーロー・ビルド・カウンター・Tierリスト", free: true, pro: true },
  { label: "ビルドシミュレーター", free: true, pro: true },
  {
    label: "AIコーチのフル分析",
    free: `月${QUOTA.free.matchReview.perMonth}回`,
    pro: `1日${QUOTA.pro.matchReview.perDay}回 / 月${QUOTA.pro.matchReview.perMonth}回`,
  },
  {
    label: "レポートへの追質問",
    free: `1日${QUOTA.free.followupPerDay}回`,
    pro: `1日${QUOTA.pro.followupPerDay}回`,
  },
  { label: "分析結果の保存と見返し", free: true, pro: true },
  { label: "弱点の推移(過去20試合)", free: false, pro: true },
  { label: "6カテゴリ別の詳細評価", free: false, pro: true },
  { label: "あなた専用の練習メニュー", free: false, pro: true },
  { label: "ヒーロー別コーチング", free: false, pro: true },
  { label: "敵構成に応じたビルド提案", free: false, pro: true },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check size={16} className="mx-auto text-success" />;
  if (value === false) return <Minus size={16} className="mx-auto text-text-faint" />;
  return <span className="text-xs font-semibold">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "ホーム", path: "/" },
          { name: "プラン", path: "/pricing" },
        ])}
      />
      <PageHeader
        title="プラン"
        titleEn="Pricing"
        description="攻略情報はすべて無料です。Proは「もっと上手くなりたい」人のための分析枠です。"
      />

      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
            Free
          </p>
          <p className="mt-2 font-display text-3xl font-black">¥0</p>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            攻略情報の閲覧と、月{QUOTA.free.matchReview.perMonth}回のAI分析。
            まずはここから始めて、分析が役に立つかを確かめてください。
          </p>
          <Link
            href="/coach"
            className="glass-bright mt-4 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            無料で分析を試す
            <ArrowRight size={15} />
          </Link>
        </Card>

        <Card accent>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold">Pro</p>
          <p className="mt-2 font-display text-2xl font-black text-gradient-gold">準備中</p>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            価格は日本・フィリピン・インドネシアの各市場に合わせて検討しています。
            提供開始時にお知らせできるよう、事前登録を受け付ける予定です。
          </p>
          <span className="mt-4 inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-text-faint">
            提供開始までお待ちください
          </span>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-bold">できることの比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="py-2 pr-4 text-left font-medium">機能</th>
                <th className="w-24 py-2 text-center font-medium">Free</th>
                <th className="w-40 py-2 text-center font-medium text-gold">Pro</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-border/40 last:border-0">
                  <td className="py-2.5 pr-4 text-text-muted">{row.label}</td>
                  <td className="py-2.5 text-center">
                    <Cell value={row.free} />
                  </td>
                  <td className="py-2.5 text-center">
                    <Cell value={row.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-xs leading-relaxed text-text-faint">
        MLBB LABはMoonton社の公式サービスではありません。Mobile Legends: Bang Bangは同社の登録商標です。
      </p>
    </div>
  );
}
