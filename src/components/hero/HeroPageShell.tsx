import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { FavoriteButton } from "@/components/hero/FavoriteButton";
import { HeroSectionNav, type HeroSection } from "@/components/hero/HeroSectionNav";
import { RecentHeroTracker } from "@/components/hero/RecentHeroTracker";
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from "@/components/seo/JsonLd";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { CountUp } from "@/components/ui/CountUp";
import { DataBadge } from "@/components/ui/DataBadge";
import { LANE_LABEL, ROLE_LABEL, type HeroSummary } from "@/data/types";
import { bannerImage, heroImage } from "@/lib/assets";
import { hashSeed } from "@/lib/seed";
import { getHeroMeta, hasDetail } from "@/repositories/heroRepository";

/** 詳細データがあるヒーローだけセクションを出す */
export function heroSections(slug: string): HeroSection[] {
  const base = `/heroes/${slug}`;
  if (!hasDetail(slug)) return [{ href: base, label: "概要" }];
  return [
    { href: base, label: "概要" },
    { href: `${base}/skills`, label: "スキル" },
    { href: `${base}/build`, label: "ビルド" },
    { href: `${base}/counters`, label: "カウンター" },
    { href: `${base}/stats`, label: "ステータス" },
  ];
}

/**
 * 全ヒーローページ共通のヘッダー+セクションナビ。
 * 各セクションページはこのシェルの中に本文を差し込む。
 */
export function HeroPageShell({
  hero,
  sectionLabel,
  sectionPath,
  children,
}: {
  hero: HeroSummary;
  /** 概要ページでは undefined */
  sectionLabel?: string;
  sectionPath: string;
  children: React.ReactNode;
}) {
  const meta = getHeroMeta(hero.slug);
  const portrait = heroImage(hero.slug);
  const banner = bannerImage(hashSeed(hero.slug));

  const metaStats = meta
    ? [
        { label: "勝率", value: meta.winRate, color: "text-success" },
        { label: "ピック率", value: meta.pickRate, color: "text-neon" },
        { label: "バン率", value: meta.banRate, color: "text-danger" },
      ]
    : [];

  const crumbs = [
    { name: "ホーム", path: "/" },
    { name: "ヒーロー一覧", path: "/heroes" },
    { name: hero.name, path: `/heroes/${hero.slug}` },
    ...(sectionLabel ? [{ name: sectionLabel, path: sectionPath }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <RecentHeroTracker slug={hero.slug} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={webPageJsonLd({
          name: sectionLabel ? `${hero.name}の${sectionLabel}` : `${hero.name} (${hero.nameEn})`,
          description: `${hero.name}の${sectionLabel ?? "ビルド・カウンター・スキル解説"}`,
          path: sectionPath,
          updatedAt: meta?.updatedAt,
        })}
      />

      <Link
        href="/heroes"
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
                <Image
                  src={portrait}
                  alt={hero.name}
                  fill
                  sizes="128px"
                  className="object-cover object-top"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-2 font-display text-3xl font-black text-text-faint">
                  {hero.nameEn.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-primary md:text-xs">
                {hero.nameEn}
              </p>
              <h1 className="mt-1 text-2xl font-black md:text-4xl">
                {hero.name}
                {sectionLabel && (
                  <span className="ml-2 text-base font-bold text-text-muted md:text-2xl">
                    の{sectionLabel}
                  </span>
                )}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TierBadge tier={hero.tier} />
                {hero.roles.map((role) => (
                  <Badge key={role} variant="primary">
                    {ROLE_LABEL[role]}
                  </Badge>
                ))}
                <Badge variant="gold">{LANE_LABEL[hero.lane]}</Badge>
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  難易度
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-4 rounded-full ${i < hero.difficulty ? "bg-gold" : "bg-surface-hover"}`}
                      />
                    ))}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {metaStats.length > 0 ? (
              <div>
                <div className="flex gap-2">
                  {metaStats.map((stat) => (
                    <div key={stat.label} className="glass min-w-[76px] rounded-xl px-3 py-2 text-center">
                      <p className={`font-display text-lg font-bold ${stat.color}`}>
                        <CountUp value={stat.value} decimals={1} suffix="%" />
                      </p>
                      <p className="text-[10px] text-text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <DataBadge patch={meta?.patch} updatedAt={meta?.updatedAt} className="mt-1.5" />
              </div>
            ) : (
              <div className="glass rounded-xl px-3 py-2">
                <p className="font-display text-lg font-bold text-text-muted">Tier {hero.tier}</p>
                <p className="text-[10px] text-text-faint">勝率データは準備中</p>
              </div>
            )}
            <FavoriteButton slug={hero.slug} />
          </div>
        </div>
      </div>

      <HeroSectionNav sections={heroSections(hero.slug)} />

      {children}
    </div>
  );
}
