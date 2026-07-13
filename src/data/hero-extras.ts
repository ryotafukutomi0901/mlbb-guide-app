import type { HeroDetail } from "./types";

type HeroExtras = Pick<
  HeroDetail,
  "lane" | "recommendedSpells" | "recommendedEmblem" | "counters" | "counteredBy" | "synergies"
>;

export const HERO_EXTRAS: Record<string, HeroExtras> = {
  alucard: {
    lane: "jungle",
    recommendedSpells: ["retribution", "execute"],
    recommendedEmblem: "assassin",
    counters: ["layla", "miya", "eudora"],
    counteredBy: ["franco", "khufra", "chou"],
    synergies: ["angela", "rafaela", "tigreal"],
  },
  tigreal: {
    lane: "roam",
    recommendedSpells: ["flicker", "petrify"],
    recommendedEmblem: "tank",
    counters: ["layla", "gord", "cecilion"],
    counteredBy: ["diggie", "valentina", "khufra"],
    synergies: ["eudora", "gord", "layla"],
  },
  franco: {
    lane: "roam",
    recommendedSpells: ["flicker", "aegis"],
    recommendedEmblem: "tank",
    counters: ["layla", "eudora", "estes"],
    counteredBy: ["diggie", "tigreal", "gloo"],
    synergies: ["eudora", "kagura", "gusion"],
  },
  layla: {
    lane: "gold",
    recommendedSpells: ["inspire", "flicker"],
    recommendedEmblem: "marksman",
    counters: ["tigreal", "belerick", "gatotkaca"],
    counteredBy: ["fanny", "gusion", "ling"],
    synergies: ["tigreal", "estes", "angela"],
  },
  eudora: {
    lane: "mid",
    recommendedSpells: ["flicker", "purify"],
    recommendedEmblem: "mage",
    counters: ["layla", "miya", "fanny"],
    counteredBy: ["diggie", "valentina", "gloo"],
    synergies: ["franco", "tigreal", "kaja"],
  },
  gusion: {
    lane: "jungle",
    recommendedSpells: ["retribution", "flicker"],
    recommendedEmblem: "mage",
    counters: ["eudora", "gord", "layla"],
    counteredBy: ["khufra", "chou", "phoveus"],
    synergies: ["angela", "diggie", "franco"],
  },
  angela: {
    lane: "roam",
    recommendedSpells: ["flicker", "revitalize"],
    recommendedEmblem: "support",
    counters: ["alucard", "sun", "argus"],
    counteredBy: ["franco", "khufra", "selena"],
    synergies: ["alucard", "fanny", "ling"],
  },
  estes: {
    lane: "roam",
    recommendedSpells: ["flicker", "revitalize"],
    recommendedEmblem: "support",
    counters: ["dyrroth", "sun", "alucard"],
    counteredBy: ["baxia", "dominance-users", "khufra"],
    synergies: ["miya", "layla", "irithel"],
  },
  fanny: {
    lane: "jungle",
    recommendedSpells: ["retribution", "aegis"],
    recommendedEmblem: "assassin",
    counters: ["layla", "gord", "eudora"],
    counteredBy: ["khufra", "franco", "saber"],
    synergies: ["angela", "diggie", "tigreal"],
  },
};
