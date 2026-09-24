import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TierGrid } from "@/components/hero/TierGrid";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { DataBadge } from "@/components/ui/DataBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { LANE_LABEL, type Lane } from "@/data/types";
import { alternateLanguages } from "@/i18n/config";
import { getLatestPatch } from "@/repositories/contentRepository";
import { getTierList } from "@/repositories/heroRepository";

const LANES = Object.keys(LANE_LABEL) as Lane[];

export const dynamicParams = false;

export function generateStaticParams() {
  return LANES.map((lane) => ({ lane }));
}

function isLane(value: string): value is Lane {
  return (LANES as string[]).includes(value);
}

export async function generateMetadata(
  props: PageProps<"/tier-list/[lane]">
): Promise<Metadata> {
  const { lane } = await props.params;
  if (!isLane(lane)) return { title: "Tierリスト" };
  const label = LANE_LABEL[lane];
  const title = `${label}のTierリスト`;
  const description = `MLBB(モバイルレジェンド)の${label}で強いヒーローをTier順に。編集部評価による最新のランク戦評価を日本語でまとめています。`;
  return {
    title,
    description,
    alternates: {
      canonical: `/tier-list/${lane}`,
      languages: alternateLanguages(`/tier-list/${lane}`),
    },
    openGraph: { title: `${title} | MLBB LAB`, description, url: `/tier-list/${lane}` },
  };
}

export default async function LaneTierListPage(props: PageProps<"/tier-list/[lane]">) {
  const { lane } = await props.params;
  if (!isLane(lane)) notFound();

  const tierList = getTierList(lane);
  const patch = getLatestPatch();
  const label = LANE_LABEL[lane];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "ホーム", path: "/" },
          { name: "Tierリスト", path: "/tier-list" },
          { name: label, path: `/tier-list/${lane}` },
        ])}
      />
      <PageHeader
        title={`${label}のTierリスト`}
        titleEn="Tier List"
        description={`パッチ${patch.version}時点で${label}に適性のあるヒーローをTier順に並べています。`}
      />

      <nav className="mb-5 flex flex-wrap gap-2" aria-label="レーン別Tierリスト">
        <Link
          href="/tier-list"
          className="rounded-xl border border-border bg-surface/60 px-3.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary/50 hover:text-text"
        >
          総合
        </Link>
        {LANES.map((l) => (
          <Link
            key={l}
            href={`/tier-list/${l}`}
            aria-current={l === lane ? "page" : undefined}
            className={
              l === lane
                ? "rounded-xl border border-primary/50 bg-primary/15 px-3.5 py-1.5 text-xs font-bold text-primary"
                : "rounded-xl border border-border bg-surface/60 px-3.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary/50 hover:text-text"
            }
          >
            {LANE_LABEL[l]}
          </Link>
        ))}
      </nav>

      <TierGrid rows={tierList} />
      <DataBadge patch={patch.version} updatedAt={patch.date} className="mt-4" />
    </div>
  );
}
