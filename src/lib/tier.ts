import type { Tier } from "@/data/types";

export const TIER_ORDER: Tier[] = ["S+", "S", "A+", "A", "B+", "B"];

export function tierRank(tier: Tier): number {
  return TIER_ORDER.indexOf(tier);
}
