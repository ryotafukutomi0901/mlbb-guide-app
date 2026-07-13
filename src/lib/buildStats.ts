import type { Emblem, HeroDetail, HeroStatPoint, Item, ItemBonus } from "@/data/types";

export interface ComputedStats {
  hp: number;
  mana: number;
  physAtk: number;
  magicPower: number;
  physDef: number;
  magicDef: number;
  atkSpeed: number;
  moveSpeed: number;
  cdrPct: number;
  critChancePct: number;
  physPenPct: number;
  magicPenPct: number;
  lifestealPct: number;
  spellVampPct: number;
  hpRegen: number;
  manaRegen: number;
}

export const STAT_LABEL: Record<keyof ComputedStats, string> = {
  hp: "HP",
  mana: "マナ",
  physAtk: "物理攻撃",
  magicPower: "魔法攻撃",
  physDef: "物理防御",
  magicDef: "魔法防御",
  atkSpeed: "攻撃速度",
  moveSpeed: "移動速度",
  cdrPct: "CD短縮",
  critChancePct: "クリティカル率",
  physPenPct: "物理貫通",
  magicPenPct: "魔法貫通",
  lifestealPct: "ライフスティール",
  spellVampPct: "スペルヴァンプ",
  hpRegen: "HP自動回復",
  manaRegen: "マナ自動回復",
};

export const PERCENT_STATS: (keyof ComputedStats)[] = [
  "cdrPct",
  "critChancePct",
  "physPenPct",
  "magicPenPct",
  "lifestealPct",
  "spellVampPct",
];

const CDR_CAP = 40;
const CRIT_CAP = 100;

export function interpolateStats(points: HeroStatPoint[], level: number): HeroStatPoint {
  const sorted = [...points].sort((a, b) => a.level - b.level);
  const exact = sorted.find((p) => p.level === level);
  if (exact) return exact;

  const lower = [...sorted].reverse().find((p) => p.level < level) ?? sorted[0];
  const upper = sorted.find((p) => p.level > level) ?? sorted[sorted.length - 1];
  if (lower.level === upper.level) return { ...lower, level };

  const t = (level - lower.level) / (upper.level - lower.level);
  const lerp = (a: number, b: number) => Math.round((a + (b - a) * t) * 100) / 100;
  return {
    level,
    hp: Math.round(lower.hp + (upper.hp - lower.hp) * t),
    hpRegen: lerp(lower.hpRegen, upper.hpRegen),
    mana: Math.round(lower.mana + (upper.mana - lower.mana) * t),
    manaRegen: lerp(lower.manaRegen, upper.manaRegen),
    physAtk: Math.round(lower.physAtk + (upper.physAtk - lower.physAtk) * t),
    magicPower: Math.round(lower.magicPower + (upper.magicPower - lower.magicPower) * t),
    physDef: Math.round(lower.physDef + (upper.physDef - lower.physDef) * t),
    magicDef: Math.round(lower.magicDef + (upper.magicDef - lower.magicDef) * t),
    atkSpeed: lerp(lower.atkSpeed, upper.atkSpeed),
    moveSpeed: Math.round(lower.moveSpeed + (upper.moveSpeed - lower.moveSpeed) * t),
  };
}

export function baseStatsAt(hero: HeroDetail, level: number): ComputedStats {
  const p = interpolateStats(hero.stats, level);
  return {
    hp: p.hp,
    mana: p.mana,
    physAtk: p.physAtk,
    magicPower: p.magicPower,
    physDef: p.physDef,
    magicDef: p.magicDef,
    atkSpeed: p.atkSpeed,
    moveSpeed: p.moveSpeed,
    cdrPct: 0,
    critChancePct: 0,
    physPenPct: 0,
    magicPenPct: 0,
    lifestealPct: 0,
    spellVampPct: 0,
    hpRegen: p.hpRegen,
    manaRegen: p.manaRegen,
  };
}

function applyBonus(stats: ComputedStats, bonus: ItemBonus, moveSpeedPctAcc: { value: number }) {
  stats.hp += bonus.hp ?? 0;
  stats.mana += bonus.mana ?? 0;
  stats.physAtk += bonus.physAtk ?? 0;
  stats.magicPower += bonus.magicPower ?? 0;
  stats.physDef += bonus.physDef ?? 0;
  stats.magicDef += bonus.magicDef ?? 0;
  stats.moveSpeed += bonus.moveSpeed ?? 0;
  stats.atkSpeed += (bonus.atkSpeedPct ?? 0) / 100;
  stats.cdrPct += bonus.cdrPct ?? 0;
  stats.critChancePct += bonus.critChancePct ?? 0;
  stats.physPenPct += bonus.physPenPct ?? 0;
  stats.magicPenPct += bonus.magicPenPct ?? 0;
  stats.lifestealPct += bonus.lifestealPct ?? 0;
  stats.spellVampPct += bonus.spellVampPct ?? 0;
  stats.hpRegen += bonus.hpRegen ?? 0;
  moveSpeedPctAcc.value += bonus.moveSpeedPct ?? 0;
}

export function computeBuildStats(
  hero: HeroDetail,
  level: number,
  items: Item[],
  emblem?: Emblem
): ComputedStats {
  const stats = baseStatsAt(hero, level);
  const moveSpeedPct = { value: 0 };

  for (const item of items) applyBonus(stats, item.bonus, moveSpeedPct);
  if (emblem) applyBonus(stats, emblem.bonus, moveSpeedPct);

  stats.moveSpeed = Math.round(stats.moveSpeed * (1 + moveSpeedPct.value / 100));
  stats.atkSpeed = Math.round(stats.atkSpeed * 100) / 100;
  stats.cdrPct = Math.min(stats.cdrPct, CDR_CAP);
  stats.critChancePct = Math.min(stats.critChancePct, CRIT_CAP);
  return stats;
}

export function totalBuildPrice(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
