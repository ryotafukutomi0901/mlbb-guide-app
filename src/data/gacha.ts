import type { GachaPool } from "./types";

export const GACHA_POOLS: GachaPool[] = [
  {
    slug: "kibou-collab",
    name: "ブレイドオブキボウ コラボガチャ",
    bannerText: "人気アニメコラボ限定スキンが登場！期間限定で「ブレイドオブキボウ」シリーズを手に入れよう。",
    costSingle: 50,
    costTen: 450,
    endsAt: "2026-07-31",
    rates: [
      { rarity: "collab", rate: 1.0 },
      { rarity: "legend", rate: 2.5 },
      { rarity: "epic", rate: 15.0 },
      { rarity: "special", rate: 81.5 },
    ],
    featured: ["fanny-blade-of-kibou", "chou-king-of-fighter"],
    pity: 60,
  },
  {
    slug: "cosmic-gleam",
    name: "コズミックグリーム レジェンドガチャ",
    bannerText: "星海を統べるレジェンドスキン「コズミックグリーム」がピックアップ中。",
    costSingle: 60,
    costTen: 540,
    endsAt: "2026-08-15",
    rates: [
      { rarity: "legend", rate: 1.5 },
      { rarity: "collector", rate: 3.0 },
      { rarity: "epic", rate: 20.0 },
      { rarity: "special", rate: 75.5 },
    ],
    featured: ["gusion-cosmic-gleam", "layla-cannon-and-roses"],
    pity: 50,
  },
];
