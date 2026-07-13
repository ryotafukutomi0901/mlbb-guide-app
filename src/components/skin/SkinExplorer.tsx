"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchInput } from "@/components/ui/SearchInput";
import { SKIN_RARITY_LABEL, type SkinRarity } from "@/data/types";
import { getAllSkins } from "@/repositories/skinRepository";
import { getHeroBySlug } from "@/repositories/heroRepository";
import { staggerFast } from "@/animations/variants";
import { SkinCard } from "./SkinCard";

const RARITY_OPTIONS = (Object.keys(SKIN_RARITY_LABEL) as SkinRarity[]).map((r) => ({
  value: r,
  label: SKIN_RARITY_LABEL[r],
}));

export function SkinExplorer() {
  const [rarity, setRarity] = useState<SkinRarity | "all">("all");
  const [query, setQuery] = useState("");
  const [ownedOnly, setOwnedOnly] = useState(false);

  const skins = useMemo(() => {
    return getAllSkins().filter((skin) => {
      const hero = getHeroBySlug(skin.heroSlug);
      const matchesRarity = rarity === "all" || skin.rarity === rarity;
      const matchesOwned = !ownedOnly || skin.owned;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        skin.name.toLowerCase().includes(q) ||
        (hero && (hero.name.includes(query) || hero.nameEn.toLowerCase().includes(q)));
      return matchesRarity && matchesOwned && matchesQuery;
    });
  }, [rarity, query, ownedOnly]);

  const ownedCount = getAllSkins().filter((s) => s.owned).length;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="スキン・ヒーロー名で検索" className="sm:w-72" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOwnedOnly((v) => !v)}
            aria-pressed={ownedOnly}
            className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
              ownedOnly
                ? "border-success/60 bg-success/10 text-success"
                : "border-border bg-surface text-text-muted hover:text-text"
            }`}
          >
            所持のみ ({ownedCount})
          </button>
          <span className="font-display text-xs text-text-muted">{skins.length}件</span>
        </div>
      </div>

      <FilterChips options={RARITY_OPTIONS} value={rarity} onChange={setRarity} className="mb-6" />

      {skins.length > 0 ? (
        <motion.div
          key={`${rarity}:${query}:${ownedOnly}`}
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {skins.map((skin) => (
            <SkinCard key={skin.slug} skin={skin} />
          ))}
        </motion.div>
      ) : (
        <EmptyState description="検索条件を変更してもう一度お試しください。" />
      )}
    </div>
  );
}
