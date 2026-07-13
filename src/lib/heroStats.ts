import type { HeroStatPoint } from "@/data/types";

export const RADAR_AXES = ["生存力", "火力", "防御力", "機動力", "継戦力"];

const MAX = { hp: 10000, power: 320, def: 200, moveSpeed: 300, atkSpeed: 150 };

export function toRadarValues(stat: HeroStatPoint): number[] {
  const power = Math.max(stat.physAtk, stat.magicPower);
  return [
    Math.min(100, (stat.hp / MAX.hp) * 100),
    Math.min(100, (power / MAX.power) * 100),
    Math.min(100, ((stat.physDef + stat.magicDef) / MAX.def) * 100),
    Math.min(100, (stat.moveSpeed / MAX.moveSpeed) * 100),
    Math.min(100, ((stat.atkSpeed * 100) / MAX.atkSpeed) * 100),
  ];
}
