import { HERO_ROSTER, HERO_DETAILS } from "@/data/heroes";
import { HERO_EXTRAS } from "@/data/hero-extras";
import { CURATED_META } from "@/data/meta";
import type { CounterEdge, HeroDetail, HeroMeta, HeroSummary, Lane, Role, Tier } from "@/data/types";

export function getAllHeroes(): HeroSummary[] {
  return HERO_ROSTER;
}

export function getHeroBySlug(slug: string): HeroSummary | undefined {
  return HERO_ROSTER.find((h) => h.slug === slug);
}

export function getHeroDetail(slug: string): HeroDetail | undefined {
  const detail = HERO_DETAILS[slug];
  if (!detail) return undefined;
  return { ...detail, ...HERO_EXTRAS[slug] };
}

export function getDetailedHeroes(): HeroDetail[] {
  return Object.keys(HERO_DETAILS).map((slug) => getHeroDetail(slug)!);
}

export function hasDetail(slug: string): boolean {
  return slug in HERO_DETAILS;
}

/**
 * 編集部がキュレーションしたメタ数値のみを返す。
 * 未整備のヒーローは undefined。推測値・生成値は返さない。
 */
export function getHeroMeta(slug: string): HeroMeta | undefined {
  return CURATED_META[slug];
}

/** メタ数値が存在するヒーローだけを返す */
export function getAllHeroMeta(): HeroMeta[] {
  return HERO_ROSTER.map((h) => CURATED_META[h.slug]).filter((m): m is HeroMeta => Boolean(m));
}

export type HeroWithMeta = HeroSummary & { meta: HeroMeta };

/** メタ数値を持つヒーローのみ(ランキング表示用) */
export function getHeroesWithMeta(): HeroWithMeta[] {
  return HERO_ROSTER.flatMap((h) => {
    const meta = CURATED_META[h.slug];
    return meta ? [{ ...h, meta }] : [];
  });
}

const TIER_ORDER: Tier[] = ["S+", "S", "A+", "A", "B+", "B"];

/** レーンを指定するとそのレーンで使われるヒーローに絞る */
export function getTierList(lane?: Lane): { tier: Tier; heroes: HeroSummary[] }[] {
  const pool = lane
    ? HERO_ROSTER.filter((h) => h.lane === lane || h.altLanes?.includes(lane))
    : HERO_ROSTER;
  return TIER_ORDER.map((tier) => ({
    tier,
    heroes: pool.filter((h) => h.tier === tier),
  }));
}

export function getHeroesByLane(lane: Lane): HeroSummary[] {
  return HERO_ROSTER.filter((h) => h.lane === lane || h.altLanes?.includes(lane));
}

export function getTopMeta(count: number): HeroWithMeta[] {
  return getHeroesWithMeta()
    .sort((a, b) => b.meta.winRate - a.meta.winRate)
    .slice(0, count);
}

export function getRisingHeroes(count: number): HeroWithMeta[] {
  return getHeroesWithMeta()
    .sort((a, b) => b.meta.trend - a.meta.trend)
    .slice(0, count);
}

/** 相性データ1辺に相手ヒーローの情報を添えたもの */
export interface ResolvedCounterEdge extends CounterEdge {
  hero: HeroSummary;
}

export interface HeroMatchups {
  counters: ResolvedCounterEdge[];
  counteredBy: ResolvedCounterEdge[];
  synergies: ResolvedCounterEdge[];
}

function resolveEdges(edges: CounterEdge[] | undefined): ResolvedCounterEdge[] {
  return (edges ?? []).flatMap((e) => {
    const hero = getHeroBySlug(e.slug);
    return hero ? [{ ...e, hero }] : [];
  });
}

/**
 * 理由付きでキュレーションされた相性のみを返す。
 * データが無いヒーローは undefined(UIは「準備中」を表示する)。
 */
export function getMatchups(slug: string): HeroMatchups | undefined {
  const extras = HERO_EXTRAS[slug];
  if (!extras?.counters?.length && !extras?.counteredBy?.length) return undefined;
  return {
    counters: resolveEdges(extras.counters),
    counteredBy: resolveEdges(extras.counteredBy),
    synergies: resolveEdges(extras.synergies),
  };
}

/** 相性データがキュレーション済みのヒーロー */
export function getHeroesWithMatchups(): HeroSummary[] {
  return HERO_ROSTER.filter((h) => Boolean(HERO_EXTRAS[h.slug]?.counters?.length));
}

export function searchHeroes(query: string, role?: Role, lane?: Lane): HeroSummary[] {
  const q = query.trim().toLowerCase();
  return HERO_ROSTER.filter((hero) => {
    const matchesRole = !role || hero.roles.includes(role);
    const matchesLane = !lane || hero.lane === lane || hero.altLanes?.includes(lane);
    const matchesQuery =
      !q ||
      hero.name.toLowerCase().includes(q) ||
      hero.nameEn.toLowerCase().includes(q) ||
      hero.aliases?.some((a) => a.toLowerCase().includes(q)) === true;
    return matchesRole && matchesLane && matchesQuery;
  });
}
