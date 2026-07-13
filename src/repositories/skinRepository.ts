import { SKINS } from "@/data/skins";
import type { Skin, SkinRarity } from "@/data/types";

export function getAllSkins(): Skin[] {
  return SKINS;
}

export function getSkinBySlug(slug: string): Skin | undefined {
  return SKINS.find((s) => s.slug === slug);
}

export function getSkinsForHero(heroSlug: string): Skin[] {
  return SKINS.filter((s) => s.heroSlug === heroSlug);
}

export function getSkinsByRarity(rarity: SkinRarity): Skin[] {
  return SKINS.filter((s) => s.rarity === rarity);
}

export function getOwnedSkins(): Skin[] {
  return SKINS.filter((s) => s.owned);
}
