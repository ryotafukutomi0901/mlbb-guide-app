"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HeroCard } from "@/components/hero/HeroCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchInput } from "@/components/ui/SearchInput";
import { ROLE_LABEL, type HeroSummary, type Role } from "@/data/types";
import { getAllHeroes, getHeroMeta } from "@/repositories/heroRepository";
import { tierRank } from "@/lib/tier";
import { staggerFast } from "@/animations/variants";

const ROLES = Object.keys(ROLE_LABEL) as Role[];
const ROLE_OPTIONS = ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }));

type SortKey = "tier" | "winRate" | "name" | "release";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "tier", label: "Tier順" },
  { value: "winRate", label: "勝率順" },
  { value: "name", label: "名前順" },
  { value: "release", label: "実装順" },
];

const SORTERS: Record<SortKey, (a: HeroSummary, b: HeroSummary) => number> = {
  tier: (a, b) => tierRank(a.tier) - tierRank(b.tier),
  winRate: (a, b) => getHeroMeta(b.slug).winRate - getHeroMeta(a.slug).winRate,
  name: (a, b) => a.name.localeCompare(b.name, "ja"),
  release: (a, b) => b.releaseYear - a.releaseYear,
};

export function CharacterExplorer({ initialRole }: { initialRole?: string }) {
  const [role, setRole] = useState<Role | "all">(
    initialRole && ROLES.includes(initialRole as Role) ? (initialRole as Role) : "all"
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("tier");

  const allHeroes = getAllHeroes();

  const heroes = useMemo(() => {
    const filtered = allHeroes.filter((hero) => {
      const matchesRole = role === "all" || hero.roles.includes(role);
      const matchesQuery =
        query.trim() === "" ||
        hero.name.includes(query) ||
        hero.nameEn.toLowerCase().includes(query.toLowerCase());
      return matchesRole && matchesQuery;
    });
    return [...filtered].sort(SORTERS[sort]);
  }, [allHeroes, role, query, sort]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="ヒーロー名で検索" className="sm:w-72" />
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="並び替え"
            className="cursor-pointer rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-muted outline-none transition-colors hover:border-border-bright focus:border-primary/60"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="shrink-0 font-display text-xs text-text-muted">
            {heroes.length} <span className="text-text-faint">/ {allHeroes.length}</span>
          </span>
        </div>
      </div>

      <FilterChips options={ROLE_OPTIONS} value={role} onChange={setRole} className="mb-6" />

      {heroes.length > 0 ? (
        <motion.div
          key={`${role}:${sort}:${query}`}
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          {heroes.map((hero) => (
            <HeroCard key={hero.slug} hero={hero} meta={getHeroMeta(hero.slug)} />
          ))}
        </motion.div>
      ) : (
        <EmptyState description="検索条件を変更してもう一度お試しください。" />
      )}
    </div>
  );
}
