import { BATTLE_SPELLS } from "@/data/battle-spells";
import { EMBLEMS } from "@/data/emblems";
import { EVENTS } from "@/data/events";
import { GACHA_POOLS } from "@/data/gacha";
import { JUNGLE_MONSTERS } from "@/data/jungle";
import { NEWS } from "@/data/news";
import { PATCH_NOTES } from "@/data/patches";
import { RANKINGS } from "@/data/rankings";
import type {
  BattleSpell,
  Emblem,
  GachaPool,
  GameEvent,
  JungleMonster,
  NewsCategory,
  NewsItem,
  PatchNote,
  RankingPlayer,
} from "@/data/types";

export function getBattleSpells(): BattleSpell[] {
  return BATTLE_SPELLS;
}

export function getBattleSpellBySlug(slug: string): BattleSpell | undefined {
  return BATTLE_SPELLS.find((s) => s.slug === slug);
}

export function getEmblems(): Emblem[] {
  return EMBLEMS;
}

export function getEmblemBySlug(slug: string): Emblem | undefined {
  return EMBLEMS.find((e) => e.slug === slug);
}

export function getJungleMonsters(): JungleMonster[] {
  return JUNGLE_MONSTERS;
}

export function getNews(category?: NewsCategory): NewsItem[] {
  const sorted = [...NEWS].sort((a, b) => b.date.localeCompare(a.date));
  return category ? sorted.filter((n) => n.category === category) : sorted;
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return NEWS.find((n) => n.slug === slug);
}

export function getEvents(): GameEvent[] {
  return EVENTS;
}

export function getPatchNotes(): PatchNote[] {
  return PATCH_NOTES;
}

export function getLatestPatch(): PatchNote {
  return PATCH_NOTES[0];
}

export function getRankings(): RankingPlayer[] {
  return RANKINGS;
}

export function getGachaPools(): GachaPool[] {
  return GACHA_POOLS;
}

export function getGachaPoolBySlug(slug: string): GachaPool | undefined {
  return GACHA_POOLS.find((p) => p.slug === slug);
}
