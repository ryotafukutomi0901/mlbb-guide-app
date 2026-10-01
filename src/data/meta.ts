import type { HeroMeta } from "./types";

// 編集部がキュレーションしたメタ数値。ここに無いヒーローは数値を表示しない
// (推測・乱数生成による「事実」の表示は禁止 — docs/redesign/02_DATA_SPEC.md 2-3)。
const PATCH = "1.9.42";
const UPDATED_AT = "2026-07-12";

type CuratedMeta = Omit<HeroMeta, "slug" | "patch" | "updatedAt">;

const CURATED: Record<string, CuratedMeta> = {
  marcel: { winRate: 55.8, pickRate: 3.1, banRate: 62.4, trend: 2.1 },
  masha: { winRate: 54.9, pickRate: 2.4, banRate: 48.2, trend: 1.4 },
  sora: { winRate: 54.2, pickRate: 1.9, banRate: 41.7, trend: 3.2 },
  ixia: { winRate: 53.6, pickRate: 4.2, banRate: 35.1, trend: 0.8 },
  gloo: { winRate: 53.4, pickRate: 1.2, banRate: 22.8, trend: 1.9 },
  khufra: { winRate: 52.9, pickRate: 3.8, banRate: 31.5, trend: -0.4 },
  rafaela: { winRate: 52.8, pickRate: 2.6, banRate: 8.4, trend: 0.6 },
  karrie: { winRate: 52.6, pickRate: 3.4, banRate: 18.9, trend: 1.1 },
  gord: { winRate: 52.5, pickRate: 2.1, banRate: 4.2, trend: 0.3 },
  diggie: { winRate: 52.3, pickRate: 1.4, banRate: 12.6, trend: 0.9 },
  floryn: { winRate: 52.2, pickRate: 2.2, banRate: 15.3, trend: 0.5 },
  kagura: { winRate: 51.8, pickRate: 4.6, banRate: 24.1, trend: 1.6 },
  claude: { winRate: 51.7, pickRate: 5.2, banRate: 28.7, trend: -0.8 },
  chou: { winRate: 51.5, pickRate: 8.9, banRate: 33.4, trend: 0.4 },
  granger: { winRate: 51.4, pickRate: 6.1, banRate: 19.8, trend: 1.2 },
  selena: { winRate: 51.2, pickRate: 3.9, banRate: 26.5, trend: -1.1 },
  valentina: { winRate: 51.1, pickRate: 3.2, banRate: 29.8, trend: 0.7 },
  ling: { winRate: 50.9, pickRate: 4.8, banRate: 38.2, trend: 2.4 },
  franco: { winRate: 50.8, pickRate: 5.5, banRate: 21.3, trend: 0.2 },
  lancelot: { winRate: 50.6, pickRate: 6.8, banRate: 30.9, trend: 1.8 },
  alucard: { winRate: 49.8, pickRate: 4.1, banRate: 6.8, trend: 6.2 },
  fanny: { winRate: 48.9, pickRate: 2.8, banRate: 44.6, trend: 5.1 },
  gusion: { winRate: 49.4, pickRate: 5.9, banRate: 27.2, trend: 4.3 },
  layla: { winRate: 48.2, pickRate: 7.4, banRate: 1.2, trend: 3.8 },
  eudora: { winRate: 50.2, pickRate: 4.4, banRate: 3.6, trend: 3.2 },
  tigreal: { winRate: 50.4, pickRate: 4.9, banRate: 9.7, trend: 0.9 },
  angela: { winRate: 51.0, pickRate: 3.6, banRate: 11.2, trend: 1.3 },
  estes: { winRate: 51.9, pickRate: 2.9, banRate: 14.8, trend: -0.6 },
  miya: { winRate: 49.1, pickRate: 6.2, banRate: 0.9, trend: 1.7 },
};

export const CURATED_META: Record<string, HeroMeta> = Object.fromEntries(
  Object.entries(CURATED).map(([slug, m]) => [
    slug,
    { slug, ...m, patch: PATCH, updatedAt: UPDATED_AT },
  ])
);

export const META_PATCH = PATCH;
export const META_UPDATED_AT = UPDATED_AT;
