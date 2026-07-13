import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Star, Swords } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatBar } from "@/components/ui/StatBar";
import { RANK_TIER_LABEL, ROLE_LABEL } from "@/data/types";
import { bannerImage, heroImage } from "@/lib/assets";
import { getHeroBySlug } from "@/repositories/heroRepository";
import { getPlayerProfile } from "@/repositories/matchRepository";
import { getOwnedSkins } from "@/repositories/skinRepository";
import { SkinCard } from "@/components/skin/SkinCard";

export const metadata: Metadata = { title: "プロフィール" };

export default function ProfilePage() {
  const profile = getPlayerProfile();
  const avatar = heroImage(profile.avatarHero);
  const ownedSkins = getOwnedSkins().slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader title="プロフィール" titleEn="Commander Profile" />

      <div className="relative mb-6 overflow-hidden rounded-3xl border border-border">
        <div className="absolute inset-0">
          <Image src={bannerImage(3)} alt="" fill sizes="100vw" className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-bg-deep/70 to-bg-deep/40" />
        </div>
        <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:p-8">
          <div className="relative h-24 w-24 shrink-0">
            <div className="absolute -inset-1 animate-spin-slow rounded-full border border-dashed border-gold/50" />
            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-gold/60 shadow-[0_0_24px_rgba(240,180,41,0.35)]">
              {avatar && (
                <Image src={avatar} alt={profile.name} fill sizes="96px" className="object-cover object-top" />
              )}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full gradient-gold px-2 py-0.5 font-display text-[9px] font-black text-black">
              Lv.{profile.level}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black">{profile.name}</h2>
              <span className="font-display text-xs text-text-faint">{profile.tag}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="gold">
                <Star size={10} />
                {RANK_TIER_LABEL[profile.rankTier]} ×{profile.rankStars}
              </Badge>
              <Badge variant="primary">メインロール: {ROLE_LABEL[profile.favoriteRole]}</Badge>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-3 text-center">
            <div className="glass rounded-xl px-4 py-3">
              <p className="font-display text-xl font-black text-success">
                <CountUp value={profile.winRate} decimals={1} suffix="%" />
              </p>
              <p className="text-[9px] text-text-faint">勝率</p>
            </div>
            <div className="glass rounded-xl px-4 py-3">
              <p className="font-display text-xl font-black text-neon">
                <CountUp value={profile.totalMatches} />
              </p>
              <p className="text-[9px] text-text-faint">総試合数</p>
            </div>
            <div className="glass rounded-xl px-4 py-3">
              <p className="font-display text-xl font-black text-gold">
                <CountUp value={profile.collectionScore} />
              </p>
              <p className="text-[9px] text-text-faint">コレクション</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader title="メインヒーロー" icon={<Swords size={15} className="text-primary" />} />
          <div className="flex flex-col gap-3">
            {profile.mainHeroes.map((main) => {
              const hero = getHeroBySlug(main.slug);
              if (!hero) return null;
              return (
                <Link
                  key={main.slug}
                  href={`/characters/${main.slug}`}
                  className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-surface-hover/50"
                >
                  <HeroAvatar name={hero.name} role={hero.roles[0]} slug={main.slug} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{hero.name}</p>
                    <StatBar
                      label={`${main.matches}試合`}
                      value={main.winRate}
                      displayValue={`${main.winRate.toFixed(1)}%`}
                      color={main.winRate >= 55 ? "success" : "primary"}
                      className="mt-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <SectionHeader title="シーズンハイライト" icon={<Star size={15} className="text-gold" />} />
            <div className="grid grid-cols-2 gap-3">
              {profile.seasonHighlights.map((highlight) => (
                <div key={highlight.label} className="rounded-xl border border-border/60 bg-surface-2/50 p-3 text-center">
                  <p className="font-display text-lg font-black text-gradient-gold">{highlight.value}</p>
                  <p className="mt-0.5 text-[10px] text-text-faint">{highlight.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader
              title={`スキンコレクション (${profile.skinCount})`}
              icon={<Sparkles size={15} className="text-neon" />}
              href="/skins"
            />
            <div className="grid grid-cols-4 gap-2">
              {ownedSkins.map((skin) => (
                <SkinCard key={skin.slug} skin={skin} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
