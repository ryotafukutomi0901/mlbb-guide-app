"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Compass, Shield, Sparkles, Zap } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { ItemIcon } from "@/components/item/ItemIcon";
import { TierBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { NAV_GROUPS } from "@/lib/nav";
import { ROLE_LABEL, SKIN_RARITY_LABEL } from "@/data/types";
import { searchHeroes } from "@/repositories/heroRepository";
import { searchItems } from "@/repositories/itemRepository";
import { getAllSkins } from "@/repositories/skinRepository";
import { getBattleSpells, getEmblems } from "@/repositories/contentRepository";
import { staggerFast, fadeUp } from "@/animations/variants";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return null;
    return {
      heroes: searchHeroes(query).slice(0, 8),
      items: searchItems(query).slice(0, 6),
      skins: getAllSkins()
        .filter((s) => s.name.toLowerCase().includes(q))
        .slice(0, 4),
      spells: getBattleSpells()
        .filter((s) => s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q))
        .slice(0, 4),
      emblems: getEmblems()
        .filter((e) => e.name.toLowerCase().includes(q) || e.nameEn.toLowerCase().includes(q))
        .slice(0, 4),
    };
  }, [q, query]);

  const hasResults =
    results &&
    (results.heroes.length > 0 ||
      results.items.length > 0 ||
      results.skins.length > 0 ||
      results.spells.length > 0 ||
      results.emblems.length > 0);

  return (
    <div>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="ヒーロー・アイテム・スキン・スペルを検索"
        autoFocus
        className="mb-6"
      />

      {!results && (
        <div>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
            <Compass size={14} className="text-primary" />
            クイックアクセス
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {NAV_GROUPS.flatMap((g) => g.items).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="glass flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_18px_rgba(139,92,246,0.15)]"
              >
                <Icon size={15} className="shrink-0 text-primary" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {results && !hasResults && (
        <EmptyState title={`「${query}」は見つかりませんでした`} description="別のキーワードでお試しください。" />
      )}

      {results && hasResults && (
        <motion.div variants={staggerFast} initial="hidden" animate="visible" className="flex flex-col gap-6">
          {results.heroes.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-faint">ヒーロー</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {results.heroes.map((hero) => (
                  <motion.div key={hero.slug} variants={fadeUp}>
                    <Link
                      href={`/heroes/${hero.slug}`}
                      className="glass flex items-center gap-3 rounded-xl p-3 transition-colors hover:border-primary/50"
                    >
                      <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{hero.name}</span>
                        <span className="block truncate text-[10px] text-text-faint">
                          {hero.roles.map((r) => ROLE_LABEL[r]).join(" / ")}
                        </span>
                      </span>
                      <TierBadge tier={hero.tier} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {results.items.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-text-faint">
                <BookOpen size={12} />
                アイテム
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {results.items.map((item) => (
                  <motion.div key={item.slug} variants={fadeUp}>
                    <Link
                      href="/compendium/items"
                      className="glass flex items-center gap-3 rounded-xl p-3 transition-colors hover:border-primary/50"
                    >
                      <ItemIcon slug={item.slug} name={item.name} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.name}</span>
                        <span className="block truncate text-[10px] text-text-faint">{item.stats.join(" / ")}</span>
                      </span>
                      <span className="font-display text-xs font-bold text-gold">{item.price}G</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {results.skins.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-text-faint">
                <Sparkles size={12} />
                スキン
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {results.skins.map((skin) => (
                  <motion.div key={skin.slug} variants={fadeUp}>
                    <Link
                      href={`/skins/${skin.slug}`}
                      className="glass flex items-center justify-between gap-3 rounded-xl p-3 transition-colors hover:border-primary/50"
                    >
                      <span className="truncate text-sm font-semibold">{skin.name}</span>
                      <span className="shrink-0 text-[10px] text-gold">{SKIN_RARITY_LABEL[skin.rarity]}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {(results.spells.length > 0 || results.emblems.length > 0) && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-text-faint">
                <Zap size={12} />
                スペル / エンブレム
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {results.spells.map((spell) => (
                  <motion.div key={spell.slug} variants={fadeUp}>
                    <Link
                      href="/compendium/spells"
                      className="glass flex items-center gap-3 rounded-xl p-3 transition-colors hover:border-primary/50"
                    >
                      <Zap size={16} className="shrink-0 text-gold" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{spell.name}</span>
                        <span className="block truncate text-[10px] text-text-faint">{spell.effectSummary}</span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
                {results.emblems.map((emblem) => (
                  <motion.div key={emblem.slug} variants={fadeUp}>
                    <Link
                      href="/compendium/emblems"
                      className="glass flex items-center gap-3 rounded-xl p-3 transition-colors hover:border-primary/50"
                    >
                      <Shield size={16} className="shrink-0" style={{ color: emblem.color }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{emblem.name}</span>
                        <span className="block truncate text-[10px] text-text-faint">{emblem.stats.join(" / ")}</span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </motion.div>
      )}
    </div>
  );
}
