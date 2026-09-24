import type { MetadataRoute } from "next";
import { META_UPDATED_AT } from "@/data/meta";
import { LANE_LABEL, type Lane } from "@/data/types";
import { getAllHeroes, getDetailedHeroes } from "@/repositories/heroRepository";
import { getAllSkins } from "@/repositories/skinRepository";
import { absoluteUrl } from "@/lib/site";

/** 検索対象にしないルート(個人向け・シミュレーター系) */
const NOINDEX = new Set([
  "/profile",
  "/settings",
  "/search",
  "/analysis",
  "/gacha",
  "/privacy",
  "/dashboard",
]);

const STATIC_ROUTES = [
  "/",
  "/heroes",
  "/tier-list",
  "/meta",
  "/counters",
  "/simulator",
  "/compendium",
  "/compendium/items",
  "/compendium/jungle",
  "/compendium/emblems",
  "/compendium/spells",
  "/coach",
  "/pricing",
  "/ranking",
  "/skins",
  "/news",
  "/events",
  "/patches",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const dataUpdatedAt = new Date(META_UPDATED_AT);

  const staticEntries = STATIC_ROUTES.filter((r) => !NOINDEX.has(r)).map((route) => ({
    url: absoluteUrl(route),
    lastModified: dataUpdatedAt,
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));

  const laneEntries = (Object.keys(LANE_LABEL) as Lane[]).map((lane) => ({
    url: absoluteUrl(`/tier-list/${lane}`),
    lastModified: dataUpdatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 概要は全ヒーロー、セクションページは詳細データがあるヒーローのみ生成される
  const detailedSlugs = new Set(getDetailedHeroes().map((h) => h.slug));
  const heroEntries = getAllHeroes().flatMap((hero) => {
    const overview = {
      url: absoluteUrl(`/heroes/${hero.slug}`),
      lastModified: dataUpdatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    };
    if (!detailedSlugs.has(hero.slug)) return [overview];
    return [
      overview,
      ...["skills", "build", "counters", "stats"].map((section) => ({
        url: absoluteUrl(`/heroes/${hero.slug}/${section}`),
        lastModified: dataUpdatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),
    ];
  });

  const skinEntries = getAllSkins().map((skin) => ({
    url: absoluteUrl(`/skins/${skin.slug}`),
    lastModified: dataUpdatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...laneEntries, ...heroEntries, ...skinEntries];
}
