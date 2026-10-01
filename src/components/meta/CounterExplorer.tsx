"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, Sword, Users } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { TierBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataBadge, DataPending } from "@/components/ui/DataBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { COUNTER_FACTOR_LABEL } from "@/data/types";
import { getLatestPatch } from "@/repositories/contentRepository";
import {
  getAllHeroes,
  getHeroesWithMatchups,
  getMatchups,
  type ResolvedCounterEdge,
} from "@/repositories/heroRepository";
import { cn } from "@/lib/utils";

export function CounterExplorer() {
  const heroes = getAllHeroes();
  const patch = getLatestPatch();
  const curatedSlugs = useMemo(
    () => new Set(getHeroesWithMatchups().map((h) => h.slug)),
    []
  );
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(
    () => getHeroesWithMatchups()[0]?.slug ?? heroes[0].slug
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return heroes;
    return heroes.filter(
      (h) =>
        h.name.includes(query) ||
        h.nameEn.toLowerCase().includes(q) ||
        h.aliases?.some((a) => a.includes(query))
    );
  }, [heroes, query]);

  const selected = heroes.find((h) => h.slug === selectedSlug) ?? heroes[0];
  const matchups = getMatchups(selected.slug);

  const sections: {
    title: string;
    description: string;
    icon: React.ReactNode;
    tone: string;
    edges: ResolvedCounterEdge[];
  }[] = matchups
    ? [
        {
          title: "有利な相手",
          description: `${selected.name}が対面で勝ちやすい相手と、その理由`,
          icon: <Sword size={16} />,
          tone: "text-success border-success/30 bg-success/10",
          edges: matchups.counters,
        },
        {
          title: "不利な相手",
          description: `${selected.name}を出しにくくする相手と、その理由`,
          icon: <ShieldAlert size={16} />,
          tone: "text-danger border-danger/30 bg-danger/10",
          edges: matchups.counteredBy,
        },
        {
          title: "シナジー",
          description: `${selected.name}と組ませたい味方と、その理由`,
          icon: <Users size={16} />,
          tone: "text-neon border-neon/30 bg-neon/10",
          edges: matchups.synergies,
        },
      ]
    : [];

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
                {curatedSlugs.has(hero.slug) && (
                  <span className="shrink-0 rounded-md border border-primary/40 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                    解説
                  </span>
                )}
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
                href={`/heroes/${selected.slug}`}
                className="ml-auto text-xs font-semibold text-primary transition-colors hover:text-neon"
              >
                詳細ページへ →
              </Link>
            </Card>

            {!matchups && (
              <Card>
                <DataPending what={`${selected.name}の相性データ`} />
              </Card>
            )}

            {sections.map((section) => (
              <Card key={section.title}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl border", section.tone)}>
                    {section.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">{section.title}</h3>
                    <p className="text-[11px] text-text-faint">{section.description}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {section.edges.map((edge) => (
                    <div
                      key={edge.slug}
                      className="rounded-xl border border-border/60 bg-surface-2/50 p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <HeroAvatar
                          name={edge.hero.name}
                          role={edge.hero.roles[0]}
                          slug={edge.hero.slug}
                          size="sm"
                        />
                        <Link
                          href={`/heroes/${edge.hero.slug}`}
                          className="text-sm font-bold transition-colors hover:text-primary"
                        >
                          {edge.hero.name}
                        </Link>
                        <TierBadge tier={edge.hero.tier} className="h-4 min-w-7 text-[9px]" />
                        <span className="ml-auto flex flex-wrap gap-1">
                          {edge.factors.map((f) => (
                            <span
                              key={f}
                              className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[9px] text-text-muted"
                            >
                              {COUNTER_FACTOR_LABEL[f]}
                            </span>
                          ))}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-text-muted">{edge.reason}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}

            {matchups && <DataBadge patch={patch.version} updatedAt={patch.date} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
