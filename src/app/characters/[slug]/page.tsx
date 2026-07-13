import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CharacterDetailTabs } from "@/components/hero/CharacterDetailTabs";
import { FavoriteButton } from "@/components/hero/FavoriteButton";
import { RecentHeroTracker } from "@/components/hero/RecentHeroTracker";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { LANE_LABEL, ROLE_LABEL } from "@/data/types";
import { bannerImage, heroImage } from "@/lib/assets";
import { hashSeed } from "@/lib/seed";
import {
  getAllHeroes,
  getHeroBySlug,
  getHeroDetail,
  getHeroMeta,
} from "@/repositories/heroRepository";

export function generateStaticParams() {
  return getAllHeroes().map((hero) => ({ slug: hero.slug }));
}

export async function generateMetadata(props: PageProps<"/characters/[slug]">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  return { title: hero ? `${hero.name} (${hero.nameEn})` : "ヒーロー詳細" };
}

export default async function CharacterDetailPage(props: PageProps<"/characters/[slug]">) {
  const { slug } = await props.params;
  const summary = getHeroBySlug(slug);
  if (!summary) notFound();

  const detail = getHeroDetail(slug);
  const meta = getHeroMeta(slug);
  const portrait = heroImage(slug);
  const banner = bannerImage(hashSeed(slug));

  const metaStats = [
    { label: "勝率", value: meta.winRate, color: "text-success" },
    { label: "ピック率", value: meta.pickRate, color: "text-neon" },
    { label: "バン率", value: meta.banRate, color: "text-danger" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <RecentHeroTracker slug={slug} />

      <Link
        href="/characters"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text"
      >
        <ChevronLeft size={16} />
        ヒーロー一覧へ戻る
      </Link>

      <div className="relative mb-6 overflow-hidden rounded-3xl border border-border">
        <div className="absolute inset-0">
          <Image src={banner} alt="" fill className="object-cover opacity-30" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-bg-deep/80 to-bg-deep/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-transparent to-transparent" />
        </div>

        <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="flex items-end gap-4 md:gap-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/50 shadow-[0_0_28px_rgba(139,92,246,0.4)] md:h-32 md:w-32">
              {portrait ? (
                <Image src={portrait} alt={summary.name} fill sizes="128px" className="object-cover object-top" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-2 font-display text-3xl font-black text-text-faint">
                  {summary.nameEn.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-primary md:text-xs">
                {summary.nameEn}
              </p>
              <h1 className="mt-1 text-2xl font-black md:text-4xl">{summary.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TierBadge tier={summary.tier} />
                {summary.roles.map((role) => (
                  <Badge key={role} variant="primary">
                    {ROLE_LABEL[role]}
                  </Badge>
                ))}
                {detail?.lane && <Badge variant="gold">{LANE_LABEL[detail.lane]}</Badge>}
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  難易度
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-4 rounded-full ${i < summary.difficulty ? "bg-gold" : "bg-surface-hover"}`}
                      />
                    ))}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {metaStats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass min-w-[76px] rounded-xl px-3 py-2 text-center"
                >
                  <p className={`font-display text-lg font-bold ${stat.color}`}>
                    <CountUp value={stat.value} decimals={1} suffix="%" />
                  </p>
                  <p className="text-[10px] text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
            <FavoriteButton slug={slug} />
          </div>
        </div>
      </div>

      {detail ? (
        <CharacterDetailTabs hero={detail} />
      ) : (
        <Card>
          <p className="text-sm text-text-muted">
            このヒーローの詳細データ(ステータス・スキル・ビルド)は準備中です。順次追加していきます。
          </p>
        </Card>
      )}
    </div>
  );
}
