"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, X, Zap } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { RadarChart } from "@/components/hero/RadarChart";
import { ItemIcon } from "@/components/item/ItemIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FilterChips } from "@/components/ui/FilterChips";
import { ITEM_CATEGORY_LABEL, type Emblem, type ItemCategory } from "@/data/types";
import {
  PERCENT_STATS,
  STAT_LABEL,
  baseStatsAt,
  computeBuildStats,
  totalBuildPrice,
  type ComputedStats,
} from "@/lib/buildStats";
import { RADAR_AXES, toRadarValues } from "@/lib/heroStats";
import { interpolateStats } from "@/lib/buildStats";
import { getDetailedHeroes, getHeroDetail } from "@/repositories/heroRepository";
import { getAllItems, getItemBySlug } from "@/repositories/itemRepository";
import { getBattleSpells, getEmblems } from "@/repositories/contentRepository";
import { cn } from "@/lib/utils";

const MAX_SLOTS = 6;
const MAX_SPELLS = 2;
const CATEGORY_OPTIONS = (Object.keys(ITEM_CATEGORY_LABEL) as ItemCategory[]).map((c) => ({
  value: c,
  label: ITEM_CATEGORY_LABEL[c],
}));

const DISPLAY_STATS: (keyof ComputedStats)[] = [
  "hp",
  "mana",
  "physAtk",
  "magicPower",
  "physDef",
  "magicDef",
  "atkSpeed",
  "moveSpeed",
  "cdrPct",
  "critChancePct",
  "physPenPct",
  "magicPenPct",
  "lifestealPct",
  "spellVampPct",
];

function formatStat(key: keyof ComputedStats, value: number): string {
  if (PERCENT_STATS.includes(key)) return `${value.toFixed(0)}%`;
  if (key === "atkSpeed") return value.toFixed(2);
  return Math.round(value).toLocaleString();
}

export function BuildSimulator({ initialHeroSlug }: { initialHeroSlug?: string }) {
  const detailedHeroes = getDetailedHeroes();
  const [heroSlug, setHeroSlug] = useState(
    initialHeroSlug && getHeroDetail(initialHeroSlug) ? initialHeroSlug : detailedHeroes[0].slug
  );
  const [level, setLevel] = useState(15);
  const [slots, setSlots] = useState<(string | null)[]>(Array(MAX_SLOTS).fill(null));
  const [category, setCategory] = useState<ItemCategory | "all">("attack");
  const [emblemSlug, setEmblemSlug] = useState<string | null>(null);
  const [spellSlugs, setSpellSlugs] = useState<string[]>([]);

  const hero = getHeroDetail(heroSlug)!;
  const emblems = getEmblems();
  const spells = getBattleSpells();
  const emblem: Emblem | undefined = emblems.find((e) => e.slug === emblemSlug);

  const equippedItems = slots.flatMap((slug) => (slug ? (getItemBySlug(slug) ?? []) : []));
  const baseStats = baseStatsAt(hero, level);
  const builtStats = computeBuildStats(hero, level, equippedItems, emblem);
  const totalPrice = totalBuildPrice(equippedItems);

  const radarBase = toRadarValues(interpolateStats(hero.stats, level));
  const radarBuilt = toRadarValues({
    level,
    hp: builtStats.hp,
    hpRegen: builtStats.hpRegen,
    mana: builtStats.mana,
    manaRegen: builtStats.manaRegen,
    physAtk: builtStats.physAtk,
    magicPower: builtStats.magicPower,
    physDef: builtStats.physDef,
    magicDef: builtStats.magicDef,
    atkSpeed: builtStats.atkSpeed,
    moveSpeed: builtStats.moveSpeed,
  });

  function addItem(slug: string) {
    setSlots((prev) => {
      if (prev.includes(slug)) return prev;
      const emptyIdx = prev.findIndex((s) => s === null);
      if (emptyIdx === -1) return prev;
      const next = [...prev];
      next[emptyIdx] = slug;
      return next;
    });
  }

  function removeSlot(idx: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  }

  function toggleSpell(slug: string) {
    setSpellSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_SPELLS) return [prev[1], slug];
      return [...prev, slug];
    });
  }

  const visibleItems = getAllItems().filter((i) => category === "all" || i.category === category);

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <div className="flex flex-col gap-4 xl:col-span-3">
        <Card>
          <h3 className="mb-3 text-sm font-bold">ヒーロー選択</h3>
          <div className="flex flex-wrap gap-2">
            {detailedHeroes.map((h) => (
              <button
                key={h.slug}
                onClick={() => setHeroSlug(h.slug)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200",
                  heroSlug === h.slug
                    ? "border-primary/60 bg-primary/15 text-white shadow-[0_0_14px_rgba(139,92,246,0.3)]"
                    : "border-border text-text-muted hover:border-border-bright hover:text-text"
                )}
              >
                <HeroAvatar name={h.name} role={h.roles[0]} slug={h.slug} size="xs" />
                {h.name}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-4">
            <span className="shrink-0 text-sm font-bold">
              レベル <span className="font-display text-primary">{level}</span>
            </span>
            <input
              type="range"
              min={1}
              max={15}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              aria-label="レベル"
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-2 accent-[#8b5cf6]"
            />
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold">
              装備スロット
              <span className="ml-2 text-xs font-normal text-text-muted">
                {equippedItems.length}/{MAX_SLOTS}
              </span>
            </h3>
            <span className="flex items-center gap-1.5 font-display text-sm font-bold text-gold">
              <Coins size={14} />
              {totalPrice.toLocaleString()}G
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {slots.map((slug, idx) => {
              const item = slug ? getItemBySlug(slug) : null;
              return (
                <motion.button
                  key={idx}
                  whileHover={item ? { scale: 1.05 } : undefined}
                  whileTap={item ? { scale: 0.95 } : undefined}
                  onClick={() => item && removeSlot(idx)}
                  title={item ? `${item.name} (クリックで外す)` : "空きスロット"}
                  className={cn(
                    "group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border text-[9px] text-text-faint transition-colors",
                    item
                      ? "border-primary/40 bg-primary/5 shadow-[inset_0_0_16px_rgba(139,92,246,0.1)]"
                      : "border-dashed border-border bg-surface-2/50 hover:border-border-bright"
                  )}
                >
                  {item ? (
                    <>
                      <ItemIcon slug={item.slug} name={item.name} size={38} />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <X size={10} />
                      </span>
                    </>
                  ) : (
                    `SLOT ${idx + 1}`
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-5">
            <FilterChips options={CATEGORY_OPTIONS} value={category} onChange={setCategory} className="mb-3" />
            <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {visibleItems.map((item) => {
                const equipped = slots.includes(item.slug);
                return (
                  <button
                    key={item.slug}
                    onClick={() => addItem(item.slug)}
                    disabled={equipped}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-2/60 p-2 text-left text-xs transition-all duration-200",
                      equipped
                        ? "opacity-35"
                        : "hover:border-primary/50 hover:shadow-[0_0_14px_rgba(139,92,246,0.15)]"
                    )}
                  >
                    <ItemIcon slug={item.slug} name={item.name} size={32} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{item.name}</span>
                      <span className="font-display text-[10px] text-gold">{item.price}G</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="mb-3 text-sm font-bold">エンブレム</h3>
            <div className="flex flex-col gap-1.5">
              {emblems.map((e) => (
                <button
                  key={e.slug}
                  onClick={() => setEmblemSlug(emblemSlug === e.slug ? null : e.slug)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all duration-200",
                    emblemSlug === e.slug
                      ? "border-primary/60 bg-primary/10 text-white"
                      : "border-border text-text-muted hover:border-border-bright"
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: e.color, boxShadow: `0 0 8px ${e.color}` }}
                  />
                  <span className="flex-1 truncate">{e.name}</span>
                  {emblemSlug === e.slug && <Badge variant="primary">装着中</Badge>}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-1 text-sm font-bold">バトルスペル</h3>
            <p className="mb-3 text-[10px] text-text-faint">最大{MAX_SPELLS}つまで選択(ステータスには影響しません)</p>
            <div className="grid grid-cols-2 gap-1.5">
              {spells.map((s) => {
                const selected = spellSlugs.includes(s.slug);
                return (
                  <button
                    key={s.slug}
                    onClick={() => toggleSpell(s.slug)}
                    title={s.description}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition-all duration-200",
                      selected
                        ? "border-gold/60 bg-gold/10 text-gold shadow-[0_0_14px_rgba(240,180,41,0.2)]"
                        : "border-border text-text-muted hover:border-border-bright"
                    )}
                  >
                    <Zap size={12} className={selected ? "text-gold" : "text-text-faint"} />
                    <span className="truncate">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:col-span-2">
        <Card accent>
          <h3 className="mb-3 text-sm font-bold">
            ステータス比較 <span className="text-xs font-normal text-text-muted">Lv.{level}</span>
          </h3>
          <div className="flex justify-center">
            <RadarChart
              axes={RADAR_AXES}
              series={[
                { name: "素のステータス", color: "#5a627c", values: radarBase },
                { name: "ビルド後", color: "#8b5cf6", values: radarBuilt },
              ]}
              size={230}
            />
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-bold">最終ステータス</h3>
          <div className="flex flex-col">
            {DISPLAY_STATS.map((key) => {
              const before = baseStats[key];
              const after = builtStats[key];
              const delta = after - before;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between border-b border-border/40 py-2 text-xs last:border-0"
                >
                  <span className="text-text-muted">{STAT_LABEL[key]}</span>
                  <span className="flex items-center gap-2 font-display">
                    <span className="text-text-faint">{formatStat(key, before)}</span>
                    <span
                      className={cn(
                        "min-w-16 text-right font-bold",
                        delta > 0 ? "text-primary" : "text-text"
                      )}
                    >
                      {formatStat(key, after)}
                    </span>
                    {delta > 0 && (
                      <span className="min-w-14 text-right text-[10px] font-semibold text-success">
                        +{formatStat(key, delta)}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
