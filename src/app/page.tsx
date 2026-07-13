import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Crown,
  FileText,
  Newspaper,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";
import { HomeHero } from "@/components/home/HomeHero";
import { RecentAndFavorites } from "@/components/home/RecentAndFavorites";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { ItemIcon } from "@/components/item/ItemIcon";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NEWS_CATEGORY_LABEL, PATCH_CHANGE_LABEL, RANK_TIER_LABEL } from "@/data/types";
import { bannerImage, heroImage } from "@/lib/assets";
import { formatSigned } from "@/lib/format";
import { getEvents, getLatestPatch, getNews, getRankings } from "@/repositories/contentRepository";
import { getDetailedHeroes, getRisingHeroes, getTopMeta } from "@/repositories/heroRepository";
import { getLatestCoachReport, getMatchById } from "@/repositories/matchRepository";
import { resolveItems } from "@/repositories/itemRepository";

const CHANGE_BADGE: Record<string, "success" | "danger" | "warning" | "primary" | "neon"> = {
  buff: "success",
  nerf: "danger",
  adjust: "warning",
  new: "neon",
  rework: "primary",
};

export default function Home() {
  const topMeta = getTopMeta(5);
  const rising = getRisingHeroes(5);
  const latestNews = getNews().slice(0, 4);
  const events = getEvents().slice(0, 3);
  const patch = getLatestPatch();
  const rankings = getRankings().slice(0, 5);
  const report = getLatestCoachReport();
  const reportMatch = getMatchById(report.matchId);
  const featured = topMeta[0];
  const buildHero = getDetailedHeroes()[0];
  const buildItems = resolveItems(buildHero.recommendedBuild).slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <HomeHero
        hero={featured}
        meta={featured.meta}
        banner={bannerImage(0)}
        patchVersion={patch.version}
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="今日のMETA" icon={<Crown size={15} className="text-gold" />} href="/tier-list" />
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {topMeta.map((hero, i) => {
              const image = heroImage(hero.slug);
              return (
                <Link key={hero.slug} href={`/characters/${hero.slug}`} className="group text-center">
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-24 overflow-hidden rounded-xl border border-border transition-all duration-300 group-hover:border-gold/60 group-hover:shadow-[0_0_20px_rgba(240,180,41,0.3)]">
                    {image ? (
                      <Image
                        src={image}
                        alt={hero.name}
                        fill
                        sizes="96px"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-surface-2 font-display font-black text-text-faint">
                        {hero.nameEn.slice(0, 1)}
                      </div>
                    )}
                    <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-bg-deep/80 font-display text-[10px] font-black text-gold backdrop-blur">
                      {i + 1}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-deep to-transparent p-1 pt-4">
                      <TierBadge tier={hero.tier} className="h-4 min-w-7 text-[9px]" />
                    </div>
                  </div>
                  <p className="mt-1.5 truncate text-xs font-semibold">{hero.name}</p>
                  <p className="font-display text-[10px] font-bold text-success">
                    {hero.meta.winRate.toFixed(1)}%
                  </p>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="勝率上昇中"
            icon={<TrendingUp size={15} className="text-success" />}
            href="/meta"
          />
          <ul className="flex flex-col">
            {rising.map(({ meta, ...hero }) => (
              <li key={hero.slug}>
                <Link
                  href={`/characters/${hero.slug}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-hover/60"
                >
                  <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="sm" />
                  <span className="flex-1 truncate text-sm font-medium">{hero.name}</span>
                  <span className="font-display text-xs font-bold text-success">
                    {formatSigned(meta.trend)}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader title="ニュース" icon={<Newspaper size={15} className="text-neon" />} href="/news" />
          <ul className="flex flex-col divide-y divide-border/50">
            {latestNews.map((item) => (
              <li key={item.slug} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 font-display text-[10px] text-text-faint">{item.date}</p>
                </div>
                <Badge variant="primary">{NEWS_CATEGORY_LABEL[item.category]}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionHeader
            title="開催中イベント"
            icon={<CalendarDays size={15} className="text-gold" />}
            href="/events"
          />
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <div key={event.slug} className="rounded-xl border border-border/60 bg-surface-2/50 p-3">
                <p className="truncate text-xs font-semibold">{event.name}</p>
                <p className="mt-0.5 font-display text-[10px] text-text-faint">〜{event.endDate}</p>
                {event.progress !== undefined && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full gradient-gold" style={{ width: `${event.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionHeader
            title={`パッチ ${patch.version}`}
            icon={<FileText size={15} className="text-primary" />}
            href="/patches"
          />
          <p className="mb-3 text-xs text-text-muted">{patch.title}</p>
          <div className="flex flex-col gap-2">
            {patch.changes.slice(0, 4).map((change) => (
              <div key={change.target} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium">{change.target}</span>
                <Badge variant={CHANGE_BADGE[change.type]}>{PATCH_CHANGE_LABEL[change.type]}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="ランキング" icon={<Trophy size={15} className="text-gold" />} href="/ranking" />
          <ul className="flex flex-col gap-1.5">
            {rankings.map((player) => (
              <li key={player.tag} className="flex items-center gap-2.5 text-xs">
                <span
                  className={`w-5 text-center font-display font-black ${
                    player.rank === 1 ? "text-gold" : player.rank <= 3 ? "text-text" : "text-text-faint"
                  }`}
                >
                  {player.rank}
                </span>
                <span className="flex-1 truncate font-semibold">{player.name}</span>
                <span className="truncate text-[10px] text-text-faint">{RANK_TIER_LABEL[player.tier]}</span>
                <span className="font-display font-bold text-primary">{player.points}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card accent>
          <SectionHeader title="AIコーチレポート" icon={<Bot size={15} className="text-neon" />} href="/coach" />
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 shadow-[0_0_20px_rgba(240,180,41,0.2)]">
              <span className="font-display text-2xl font-black text-gradient-gold">{report.grade}</span>
              <span className="font-display text-[9px] text-text-faint">{report.score}/100</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-snug">{report.headline}</p>
              {reportMatch && (
                <p className="mt-1 text-[10px] text-text-faint">
                  {reportMatch.mode} / KDA {reportMatch.kda.join("/")} / {reportMatch.playedAt}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/coach"
            className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-primary/40 bg-primary/10 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_16px_rgba(139,92,246,0.3)]"
          >
            分析レポートを見る
            <ArrowRight size={13} />
          </Link>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader
            title={`おすすめビルド — ${buildHero.name}`}
            href={`/simulator?hero=${buildHero.slug}`}
            hrefLabel="シミュレーターで開く"
          />
          <div className="flex flex-wrap items-center gap-2">
            {buildItems.map((item, i) => (
              <div key={item.slug} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface-2/60 p-2">
                  <ItemIcon slug={item.slug} name={item.name} size={44} />
                  <span className="max-w-16 truncate text-[10px] text-text-muted">{item.name}</span>
                </div>
                {i < buildItems.length - 1 && <ArrowRight size={13} className="text-text-faint" />}
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-1">
          <RecentAndFavorites />
        </div>
      </div>

      <div className="mt-6">
        <AdSlot />
      </div>
    </div>
  );
}
