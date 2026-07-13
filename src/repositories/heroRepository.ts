import { HERO_ROSTER, HERO_DETAILS } from "@/data/heroes";
import { HERO_EXTRAS } from "@/data/hero-extras";
import { CURATED_META } from "@/data/meta";
import type { HeroDetail, HeroMeta, HeroSummary, Role, Tier } from "@/data/types";
import { seededFloat, seededPick } from "@/lib/seed";
import { tierRank } from "@/lib/tier";

const ROSTER_SLUGS = HERO_ROSTER.map((h) => h.slug);

export function getAllHeroes(): HeroSummary[] {
  return HERO_ROSTER;
}

export function getHeroBySlug(slug: string): HeroSummary | undefined {
  return HERO_ROSTER.find((h) => h.slug === slug) ?? HERO_DETAILS[slug];
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

const TIER_WIN_BASE: Record<Tier, number> = {
  "S+": 54.5,
  S: 52.8,
  "A+": 51.4,
  A: 50.4,
  "B+": 49.4,
  B: 48.2,
};

export function getHeroMeta(slug: string): HeroMeta {
  const curated = CURATED_META[slug];
  if (curated) return { slug, ...curated };
  const hero = getHeroBySlug(slug);
  const base = hero ? TIER_WIN_BASE[hero.tier] : 50;
  return {
    slug,
    winRate: seededFloat(`${slug}:wr`, base - 1.2, base + 1.2),
    pickRate: seededFloat(`${slug}:pr`, 0.4, 6.5),
    banRate: seededFloat(`${slug}:br`, 0.2, hero && tierRank(hero.tier) <= 1 ? 45 : 12),
    trend: seededFloat(`${slug}:tr`, -2.5, 2.5),
  };
}

export function getAllHeroMeta(): HeroMeta[] {
  return ROSTER_SLUGS.map(getHeroMeta);
}

export function getTierList(): { tier: Tier; heroes: HeroSummary[] }[] {
  const tiers: Tier[] = ["S+", "S", "A+", "A", "B+", "B"];
  return tiers.map((tier) => ({
    tier,
    heroes: HERO_ROSTER.filter((h) => h.tier === tier),
  }));
}

export function getTopMeta(count: number): (HeroSummary & { meta: HeroMeta })[] {
  return [...HERO_ROSTER]
    .map((h) => ({ ...h, meta: getHeroMeta(h.slug) }))
    .sort((a, b) => b.meta.winRate - a.meta.winRate)
    .slice(0, count);
}

export function getRisingHeroes(count: number): (HeroSummary & { meta: HeroMeta })[] {
  return [...HERO_ROSTER]
    .map((h) => ({ ...h, meta: getHeroMeta(h.slug) }))
    .sort((a, b) => b.meta.trend - a.meta.trend)
    .slice(0, count);
}

export interface HeroMatchups {
  counters: HeroSummary[];
  counteredBy: HeroSummary[];
  synergies: HeroSummary[];
}

function resolveHeroes(slugs: string[]): HeroSummary[] {
  return slugs
    .map((s) => getHeroBySlug(s))
    .filter((h): h is HeroSummary => Boolean(h));
}

export function getMatchups(slug: string): HeroMatchups {
  const extras = HERO_EXTRAS[slug];
  if (extras?.counters && extras.counteredBy) {
    return {
      counters: resolveHeroes(extras.counters),
      counteredBy: resolveHeroes(extras.counteredBy),
      synergies: resolveHeroes(extras.synergies ?? []),
    };
  }
  return {
    counters: resolveHeroes(seededPick(`${slug}:counters`, ROSTER_SLUGS, 3, slug)),
    counteredBy: resolveHeroes(seededPick(`${slug}:countered`, ROSTER_SLUGS, 3, slug)),
    synergies: resolveHeroes(seededPick(`${slug}:synergy`, ROSTER_SLUGS, 3, slug)),
  };
}

export function searchHeroes(query: string, role?: Role): HeroSummary[] {
  const q = query.trim().toLowerCase();
  return HERO_ROSTER.filter((hero) => {
    const matchesRole = !role || hero.roles.includes(role);
    const matchesQuery =
      !q || hero.name.toLowerCase().includes(q) || hero.nameEn.toLowerCase().includes(q);
    return matchesRole && matchesQuery;
  });
}
