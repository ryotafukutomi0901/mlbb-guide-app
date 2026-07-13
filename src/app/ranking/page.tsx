import type { Metadata } from "next";
import Link from "next/link";
import { Crown } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { PageHeader } from "@/components/ui/PageHeader";
import { RANK_TIER_LABEL } from "@/data/types";
import { getRankings } from "@/repositories/contentRepository";
import { getHeroBySlug } from "@/repositories/heroRepository";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "ランキング" };

const PODIUM_STYLE = [
  "border-gold/60 bg-gold/10 shadow-[0_0_28px_rgba(240,180,41,0.2)]",
  "border-border-bright bg-surface-hover/40",
  "border-ember/50 bg-ember/10",
];

export default function RankingPage() {
  const rankings = getRankings();
  const podium = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="ランキング"
        titleEn="Leaderboard"
        description="日本サーバーのトッププレイヤー。メインヒーローから今のメタを読もう。"
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {podium.map((player, i) => (
          <div
            key={player.tag}
            className={cn(
              "relative flex flex-col items-center rounded-2xl border p-5 text-center backdrop-blur",
              PODIUM_STYLE[i],
              i === 0 && "md:order-2 md:-translate-y-2",
              i === 1 && "md:order-1",
              i === 2 && "md:order-3"
            )}
          >
            {i === 0 && <Crown size={22} className="animate-float mb-1 text-gold" />}
            <span
              className={cn(
                "font-display text-3xl font-black",
                i === 0 ? "text-gradient-gold" : i === 1 ? "text-text" : "text-ember"
              )}
            >
              #{player.rank}
            </span>
            <p className="mt-1 font-bold">{player.name}</p>
            <p className="font-display text-[10px] text-text-faint">{player.tag}</p>
            <p className="mt-1 text-[10px] text-gold">{RANK_TIER_LABEL[player.tier]}</p>
            <p className="mt-2 font-display text-xl font-black text-primary">{player.points}</p>
            <p className="text-[9px] text-text-faint">ポイント</p>
            <div className="mt-3 flex gap-1.5">
              {player.mainHeroes.map((slug) => {
                const hero = getHeroBySlug(slug);
                if (!hero) return null;
                return (
                  <Link key={slug} href={`/characters/${slug}`} title={hero.name}>
                    <HeroAvatar name={hero.name} role={hero.roles[0]} slug={slug} size="sm" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="hidden items-center gap-3 border-b border-border px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-text-faint md:flex">
          <span className="w-10 text-center">順位</span>
          <span className="flex-1">プレイヤー</span>
          <span className="w-28">ティア</span>
          <span className="w-24">メイン</span>
          <span className="w-16 text-right">勝率</span>
          <span className="w-16 text-right">ポイント</span>
        </div>
        {rest.map((player) => (
          <div
            key={player.tag}
            className="flex items-center gap-3 border-b border-border/40 px-4 py-3 transition-colors last:border-0 hover:bg-surface-hover/40"
          >
            <span className="w-10 shrink-0 text-center font-display text-sm font-black text-text-faint">
              {player.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{player.name}</p>
              <p className="font-display text-[9px] text-text-faint">{player.tag}</p>
            </div>
            <span className="hidden w-28 shrink-0 truncate text-xs text-text-muted md:block">
              {RANK_TIER_LABEL[player.tier]}
            </span>
            <div className="hidden w-24 shrink-0 gap-1 md:flex">
              {player.mainHeroes.slice(0, 3).map((slug) => {
                const hero = getHeroBySlug(slug);
                if (!hero) return null;
                return (
                  <Link key={slug} href={`/characters/${slug}`} title={hero.name}>
                    <HeroAvatar name={hero.name} role={hero.roles[0]} slug={slug} size="xs" />
                  </Link>
                );
              })}
            </div>
            <span className="w-16 shrink-0 text-right font-display text-xs font-bold text-success">
              {player.winRate.toFixed(1)}%
            </span>
            <span className="w-16 shrink-0 text-right font-display text-sm font-black text-primary">
              {player.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
