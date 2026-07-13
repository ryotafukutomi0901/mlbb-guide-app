import type { SkinRarity } from "@/data/types";

export const RARITY_TEXT: Record<SkinRarity, string> = {
  basic: "text-text-muted",
  elite: "text-primary-2",
  special: "text-neon",
  epic: "text-primary",
  legend: "text-gold",
  collector: "text-ember",
  collab: "text-danger",
};

export const RARITY_GLOW: Record<SkinRarity, string> = {
  basic: "",
  elite: "group-hover:shadow-[0_0_24px_rgba(79,124,255,0.3)]",
  special: "group-hover:shadow-[0_0_24px_rgba(56,214,255,0.3)]",
  epic: "group-hover:shadow-[0_0_24px_rgba(139,92,246,0.35)]",
  legend: "group-hover:shadow-[0_0_24px_rgba(240,180,41,0.4)]",
  collector: "group-hover:shadow-[0_0_24px_rgba(251,122,43,0.4)]",
  collab: "group-hover:shadow-[0_0_24px_rgba(244,63,94,0.4)]",
};

export const RARITY_BORDER: Record<SkinRarity, string> = {
  basic: "border-border",
  elite: "border-primary-2/40",
  special: "border-neon/40",
  epic: "border-primary/40",
  legend: "border-gold/50",
  collector: "border-ember/50",
  collab: "border-danger/50",
};
