"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, Sword, Users } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { TierBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import type { HeroSummary } from "@/data/types";
import { getAllHeroes, getMatchups } from "@/repositories/heroRepository";
import { cn } from "@/lib/utils";

export function CounterExplorer() {
  const heroes = getAllHeroes();
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(heroes[0].slug);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return heroes;
    return heroes.filter(
      (h) => h.name.includes(query) || h.nameEn.toLowerCase().includes(q)
    );
  }, [heroes, query]);

  const selected = heroes.find((h) => h.slug === selectedSlug) ?? heroes[0];
  const matchups = getMatchups(selected.slug);

  const sections: { title: string; description: string; icon: React.ReactNode; tone: string; heroes: HeroSummary[] }[] = [
    {
      title: "有利な相手",
      description: `${selected.name}が対面で勝ちやすい相手`,
      icon: <Sword size={16} />,
      tone: "text-success border-success/30 bg-success/10",
      heroes: matchups.counters,
    },
    {
      title: "不利な相手",
      description: `${selected.name}を出しにくくする相手`,
      icon: <ShieldAlert size={16} />,
      tone: "text-danger border-danger/30 bg-danger/10",
      heroes: matchups.counteredBy,
    },
    {
      title: "シナジー",
      description: `${selected.name}と組ませたい味方`,
      icon: <Users size={16} />,
      tone: "text-neon border-neon/30 bg-neon/10",
      heroes: matchups.synergies,
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <SearchInput value={query} onChange={setQuery} placeholder="ヒーローを検索" className="mb-3" />
        <div className="glass max-h-[560px] overflow-y-auto rounded-2xl p-2">
          {filtered.map((hero) => {
            const active = hero.slug === selected.slug;
            return (
              <button
                key={hero.slug}
                onClick={() => setSelectedSlug(hero.slug)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                  active ? "border border-primary/50 bg-primary/15" : "hover:bg-surface-hover/50"
                )}
              >
                <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="sm" />
                <span className="flex-1 truncate text-sm font-medium">{hero.name}</span>
                <TierBadge tier={hero.tier} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <Card accent className="flex items-center gap-4">
              <HeroAvatar name={selected.name} role={selected.roles[0]} slug={selected.slug} size="lg" />
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary">
                  {selected.nameEn}
                </p>
                <h2 className="text-xl font-black">{selected.name}</h2>
              </div>
              <Link
                href={`/characters/${selected.slug}`}
                className="ml-auto text-xs font-semibold text-primary transition-colors hover:text-neon"
              >
                詳細ページへ →
              </Link>
            </Card>

            {sections.map((section) => (
              <Card key={section.title}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl border", section.tone)}>
                    {section.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">{section.title}</h3>
                    <p className="text-[10px] text-text-faint">{section.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {section.heroes.map((h) => (
                    <Link
                      key={h.slug}
                      href={`/characters/${h.slug}`}
                      className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-surface-2/50 px-3 py-2 transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_14px_rgba(139,92,246,0.15)]"
                    >
                      <HeroAvatar name={h.name} role={h.roles[0]} slug={h.slug} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold">{h.name}</span>
                        <TierBadge tier={h.tier} className="mt-0.5 h-4 min-w-7 text-[9px]" />
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
