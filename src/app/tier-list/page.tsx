import type { Metadata } from "next";
import Link from "next/link";
import { TierGrid } from "@/components/hero/TierGrid";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { DataBadge } from "@/components/ui/DataBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { alternateLanguages } from "@/i18n/config";
import { LANE_LABEL, type Lane } from "@/data/types";
import { getLatestPatch } from "@/repositories/contentRepository";
import { getTierList } from "@/repositories/heroRepository";

const DESCRIPTION =
  "MLBB(モバイルレジェンド)の最新Tierリスト。編集部評価によるランク帯別の強さを、ロール・レーンごとに日本語で整理しています。";

export const metadata: Metadata = {
  title: "Tierリスト",
  description: DESCRIPTION,
  alternates: { canonical: "/tier-list", languages: alternateLanguages("/tier-list") },
  openGraph: { title: "Tierリスト | MLBB LAB", description: DESCRIPTION, url: "/tier-list" },
};

const LANES = Object.keys(LANE_LABEL) as Lane[];

export default function TierListPage() {
  const tierList = getTierList();
  const patch = getLatestPatch();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "ホーム", path: "/" },
          { name: "Tierリスト", path: "/tier-list" },
        ])}
      />
      <PageHeader
        title="Tierリスト"
        titleEn="Tier List"
        description={`パッチ${patch.version}時点のランク戦評価。環境の変化に合わせて随時更新されます。`}
      />

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="レーン別Tierリスト">
        <span className="rounded-xl border border-primary/50 bg-primary/15 px-3.5 py-1.5 text-xs font-bold text-primary">
          総合
        </span>
        {LANES.map((lane) => (
          <Link
            key={lane}
            href={`/tier-list/${lane}`}
            className="rounded-xl border border-border bg-surface/60 px-3.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary/50 hover:text-text"
          >
            {LANE_LABEL[lane]}
          </Link>
        ))}
      </nav>

      <TierGrid rows={tierList} />
      <DataBadge patch={patch.version} updatedAt={patch.date} className="mt-4" />
    </div>
  );
}
