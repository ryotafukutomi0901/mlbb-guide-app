"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, Droplet, Shield, Sparkles, Zap } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { RadarChart } from "@/components/hero/RadarChart";
import { ItemIcon } from "@/components/item/ItemIcon";
import { Badge, TierBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatBar } from "@/components/ui/StatBar";
import { Tabs } from "@/components/ui/Tabs";
import {
  SKILL_SLOT_LABEL,
  SKIN_RARITY_LABEL,
  type HeroDetail,
  type HeroSkill,
  type Skin,
} from "@/data/types";
import { skillImage } from "@/lib/assets";
import { RADAR_AXES, toRadarValues } from "@/lib/heroStats";
import { getMatchups, type HeroMatchups } from "@/repositories/heroRepository";
import { resolveItems } from "@/repositories/itemRepository";
import { getBattleSpellBySlug, getEmblemBySlug } from "@/repositories/contentRepository";
import { getSkinsForHero } from "@/repositories/skinRepository";
import { cn } from "@/lib/utils";

const TAB_ITEMS = [
  { value: "overview", label: "概要" },
  { value: "skills", label: "スキル" },
  { value: "build", label: "ビルド" },
  { value: "counters", label: "カウンター" },
  { value: "stats", label: "ステータス" },
  { value: "skins", label: "スキン" },
  { value: "lore", label: "ストーリー" },
] as const;

type TabValue = (typeof TAB_ITEMS)[number]["value"];

const RARITY_COLOR: Record<Skin["rarity"], string> = {
  basic: "text-text-muted",
  elite: "text-primary-2",
  special: "text-neon",
  epic: "text-primary",
  legend: "text-gold",
  collector: "text-ember",
  collab: "text-danger",
};

export function CharacterDetailTabs({ hero }: { hero: HeroDetail }) {
  const [tab, setTab] = useState<TabValue>("overview");
  const matchups = getMatchups(hero.slug);
  const skins = getSkinsForHero(hero.slug);

  return (
    <div>
      <Tabs
        items={[...TAB_ITEMS]}
        value={tab}
        onChange={setTab}
        layoutId="hero-detail-tabs"
        className="mb-5"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "overview" && <OverviewTab hero={hero} matchups={matchups} />}
          {tab === "skills" && <SkillsTab hero={hero} />}
          {tab === "build" && <BuildTab hero={hero} />}
          {tab === "counters" && <CountersTab matchups={matchups} />}
          {tab === "stats" && <StatsTab hero={hero} />}
          {tab === "skins" && <SkinsTab skins={skins} />}
          {tab === "lore" && (
            <Card>
              <p className="leading-loose text-text-muted">{hero.story}</p>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ hero, matchups }: { hero: HeroDetail; matchups: HeroMatchups }) {
  const latestStat = hero.stats[hero.stats.length - 1];
  const buildItems = resolveItems(hero.recommendedBuild);
  const emblem = hero.recommendedEmblem ? getEmblemBySlug(hero.recommendedEmblem) : undefined;
  const spells = (hero.recommendedSpells ?? [])
    .map(getBattleSpellBySlug)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-sm font-bold">ステータスバランス <span className="text-xs font-normal text-text-muted">(Lv.{latestStat.level})</span></h3>
        <div className="flex justify-center">
          <RadarChart
            axes={RADAR_AXES}
            series={[{ name: hero.name, color: "#8b5cf6", values: toRadarValues(latestStat) }]}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <h3 className="mb-3 text-sm font-bold">おすすめビルド</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {buildItems.map((item, i) => (
              <div key={item.slug} className="flex items-center gap-1.5">
                <div
                  className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface-2 p-2 transition-colors hover:border-primary/50"
                  title={`${item.name} — ${item.passive}`}
                >
                  <ItemIcon slug={item.slug} name={item.name} size={40} />
                  <span className="max-w-14 truncate text-[10px] text-text-muted">{item.name}</span>
                </div>
                {i < buildItems.length - 1 && <ArrowRight size={12} className="text-text-faint" />}
              </div>
            ))}
          </div>
          <Link
            href={`/simulator?hero=${hero.slug}`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-neon"
          >
            ビルドシミュレーターで試す
            <ArrowRight size={12} />
          </Link>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-bold">推奨セットアップ</h3>
          <div className="flex flex-col gap-2.5 text-sm">
            {emblem && (
              <div className="flex items-center gap-2">
                <Shield size={15} style={{ color: emblem.color }} />
                <span className="text-text-muted">エンブレム:</span>
                <Link href="/compendium/emblems" className="font-semibold hover:text-primary">
                  {emblem.name}
                </Link>
              </div>
            )}
            {spells.length > 0 && (
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-gold" />
                <span className="text-text-muted">バトルスペル:</span>
                <span className="font-semibold">{spells.map((s) => s.name).join(" / ")}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-neon" />
              <span className="text-text-muted">シナジー:</span>
              <div className="flex items-center gap-1">
                {matchups.synergies.slice(0, 3).map((h) => (
                  <Link key={h.slug} href={`/characters/${h.slug}`} title={h.name}>
                    <HeroAvatar name={h.name} role={h.roles[0]} slug={h.slug} size="sm" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SkillsTab({ hero }: { hero: HeroDetail }) {
  const [selected, setSelected] = useState<HeroSkill>(hero.skills[0]);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="flex flex-col gap-2 lg:col-span-2">
        {hero.skills.map((skill) => {
          const active = skill.name === selected.name;
          const img = skillImage(hero.slug, skill.type);
          return (
            <button
              key={skill.name}
              onClick={() => setSelected(skill)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                active
                  ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                  : "glass hover:border-border-bright"
              )}
            >
              <div
                className={cn(
                  "relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border",
                  active ? "border-primary/60" : "border-border"
                )}
              >
                {img ? (
                  <Image src={img} alt={skill.name} width={48} height={48} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-2 font-display text-xs font-bold text-text-faint">
                    {skill.type === "passive" ? "P" : skill.type === "ultimate" ? "ULT" : skill.type.slice(-1)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {SKILL_SLOT_LABEL[skill.type]}
                </p>
                <p className="truncate text-sm font-semibold">{skill.name}</p>
              </div>
            </button>
          );
        })}
      </div>

      <Card className="lg:col-span-3" accent>
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="primary">{SKILL_SLOT_LABEL[selected.type]}</Badge>
              {selected.tags?.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <h3 className="text-lg font-bold">{selected.name}</h3>
            <p className="mt-3 leading-relaxed text-text-muted">{selected.description}</p>
            {(selected.cooldown || selected.cost) && (
              <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-text-muted">
                {selected.cooldown && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-neon" />
                    CD: {selected.cooldown.join(" / ")}秒
                  </span>
                )}
                {selected.cost && (
                  <span className="flex items-center gap-1.5">
                    <Droplet size={13} className="text-primary-2" />
                    消費: {selected.cost.join(" / ")}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}

function BuildTab({ hero }: { hero: HeroDetail }) {
  const buildItems = resolveItems(hero.recommendedBuild);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {buildItems.map((item, i) => (
        <Card key={item.slug} interactive className="flex gap-3">
          <div className="relative">
            <ItemIcon slug={item.slug} name={item.name} />
            <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full gradient-primary font-display text-[10px] font-bold text-white">
              {i + 1}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold">{item.name}</p>
              <span className="shrink-0 font-display text-xs font-bold text-gold">
                {item.price.toLocaleString()}G
              </span>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">{item.stats.join(" / ")}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-text-faint">{item.passive}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function CountersTab({ matchups }: { matchups: HeroMatchups }) {
  const sections = [
    { title: "有利な相手", subtitle: "このヒーローが強い相手", heroes: matchups.counters, tone: "text-success" },
    { title: "不利な相手", subtitle: "対面で注意すべき相手", heroes: matchups.counteredBy, tone: "text-danger" },
    { title: "相性の良い味方", subtitle: "組ませたいシナジー", heroes: matchups.synergies, tone: "text-neon" },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {sections.map((section) => (
        <Card key={section.title}>
          <h3 className={cn("text-sm font-bold", section.tone)}>{section.title}</h3>
          <p className="mb-3 text-xs text-text-faint">{section.subtitle}</p>
          <div className="flex flex-col gap-2">
            {section.heroes.map((h) => (
              <Link
                key={h.slug}
                href={`/characters/${h.slug}`}
                className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border-bright hover:bg-surface-hover/50"
              >
                <HeroAvatar name={h.name} role={h.roles[0]} slug={h.slug} size="sm" />
                <span className="flex-1 truncate text-sm font-medium">{h.name}</span>
                <TierBadge tier={h.tier} />
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function StatsTab({ hero }: { hero: HeroDetail }) {
  const latestStat = hero.stats[hero.stats.length - 1];
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="mb-4 text-sm font-bold">Lv.{latestStat.level} ステータス</h3>
        <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          <StatBar label="HP" value={latestStat.hp} max={9000} displayValue={String(latestStat.hp)} color="success" />
          <StatBar label="物理攻撃" value={latestStat.physAtk} max={320} displayValue={String(latestStat.physAtk || "-")} color="danger" />
          <StatBar label="魔法攻撃" value={latestStat.magicPower} max={320} displayValue={String(latestStat.magicPower || "-")} color="neon" />
          <StatBar label="物理防御" value={latestStat.physDef} max={120} displayValue={String(latestStat.physDef)} />
          <StatBar label="魔法防御" value={latestStat.magicDef} max={120} displayValue={String(latestStat.magicDef)} />
          <StatBar label="攻撃速度" value={latestStat.atkSpeed * 100} max={160} displayValue={latestStat.atkSpeed.toFixed(2)} color="gold" />
          <StatBar label="移動速度" value={latestStat.moveSpeed} max={300} displayValue={String(latestStat.moveSpeed)} color="gold" />
          <StatBar label="HP回復" value={latestStat.hpRegen} max={25} displayValue={latestStat.hpRegen.toFixed(1)} color="success" />
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-bold">レベル別成長</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="py-2 pr-4 font-medium">レベル</th>
                <th className="py-2 pr-4 font-medium">HP</th>
                <th className="py-2 pr-4 font-medium">物理攻撃</th>
                <th className="py-2 pr-4 font-medium">魔法攻撃</th>
                <th className="py-2 pr-4 font-medium">物理防御</th>
                <th className="py-2 pr-4 font-medium">魔法防御</th>
                <th className="py-2 pr-4 font-medium">攻撃速度</th>
                <th className="py-2 pr-4 font-medium">移動速度</th>
              </tr>
            </thead>
            <tbody>
              {hero.stats.map((s) => (
                <tr key={s.level} className="border-b border-border/40 transition-colors hover:bg-surface-hover/40">
                  <td className="py-2.5 pr-4 font-display font-bold text-primary">Lv.{s.level}</td>
                  <td className="py-2.5 pr-4">{s.hp.toLocaleString()}</td>
                  <td className="py-2.5 pr-4">{s.physAtk || "-"}</td>
                  <td className="py-2.5 pr-4">{s.magicPower || "-"}</td>
                  <td className="py-2.5 pr-4">{s.physDef}</td>
                  <td className="py-2.5 pr-4">{s.magicDef}</td>
                  <td className="py-2.5 pr-4">{s.atkSpeed.toFixed(2)}</td>
                  <td className="py-2.5 pr-4">{s.moveSpeed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SkinsTab({ skins }: { skins: Skin[] }) {
  if (skins.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-muted">このヒーローのスキンデータは準備中です。</p>
      </Card>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {skins.map((skin) => (
        <Link key={skin.slug} href={`/skins/${skin.slug}`}>
          <Card interactive className="h-full">
            <div className="flex items-center justify-between gap-2">
              <p className={cn("text-xs font-bold uppercase tracking-wider", RARITY_COLOR[skin.rarity])}>
                {SKIN_RARITY_LABEL[skin.rarity]}
              </p>
              {skin.owned && <Badge variant="success">所持</Badge>}
            </div>
            <p className="mt-1 font-semibold">{skin.name}</p>
            <p className="mt-1.5 line-clamp-2 text-xs text-text-muted">{skin.description}</p>
            <p className="mt-2 text-xs font-medium text-gold">{skin.price}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
