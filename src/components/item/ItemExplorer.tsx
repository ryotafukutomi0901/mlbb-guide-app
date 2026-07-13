"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp, Coins } from "lucide-react";
import { ItemIcon } from "@/components/item/ItemIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { SearchInput } from "@/components/ui/SearchInput";
import { ITEM_CATEGORY_LABEL, ROLE_LABEL, type Item, type ItemCategory } from "@/data/types";
import { getAllItems, getBuildsInto, resolveItems } from "@/repositories/itemRepository";
import { staggerFast, fadeUp } from "@/animations/variants";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = (Object.keys(ITEM_CATEGORY_LABEL) as ItemCategory[]).map((c) => ({
  value: c,
  label: ITEM_CATEGORY_LABEL[c],
}));

export function ItemExplorer() {
  const [category, setCategory] = useState<ItemCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [priceDesc, setPriceDesc] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);

  const items = useMemo(() => {
    const filtered = getAllItems().filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery =
        query.trim() === "" || item.name.includes(query) || item.passive.includes(query);
      return matchesCategory && matchesQuery;
    });
    return [...filtered].sort((a, b) => (priceDesc ? b.price - a.price : a.price - b.price));
  }, [category, query, priceDesc]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="アイテム名・効果で検索" className="sm:w-72" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPriceDesc((v) => !v)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-border-bright hover:text-text"
          >
            <ArrowDownUp size={13} />
            価格{priceDesc ? "高い順" : "安い順"}
          </button>
          <span className="font-display text-xs text-text-muted">{items.length}件</span>
        </div>
      </div>

      <FilterChips options={CATEGORY_OPTIONS} value={category} onChange={setCategory} className="mb-6" />

      {items.length > 0 ? (
        <motion.div
          key={`${category}:${query}:${priceDesc}`}
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => (
            <motion.button
              key={item.slug}
              variants={fadeUp}
              onClick={() => setSelected(selected?.slug === item.slug ? null : item)}
              className={cn(
                "cursor-pointer text-left",
                selected?.slug === item.slug && "[&>div]:border-primary/60"
              )}
            >
              <Card interactive className="flex h-full gap-3">
                <ItemIcon slug={item.slug} name={item.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <span className="flex shrink-0 items-center gap-1 font-display text-xs font-bold text-gold">
                      <Coins size={11} />
                      {item.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-neon">{item.stats.join(" / ")}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-text-muted">{item.passive}</p>
                </div>
              </Card>
            </motion.button>
          ))}
        </motion.div>
      ) : (
        <EmptyState description="検索条件を変更してもう一度お試しください。" />
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-16 z-30 px-4 lg:bottom-6 lg:pl-64"
          >
            <div className="glass-bright edge-glow mx-auto max-w-3xl rounded-2xl p-5 shadow-2xl">
              <div className="flex items-start gap-4">
                <ItemIcon slug={selected.slug} name={selected.name} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold">{selected.name}</h3>
                    <Badge variant="primary">{ITEM_CATEGORY_LABEL[selected.category]}</Badge>
                    <span className="flex items-center gap-1 font-display text-sm font-bold text-gold">
                      <Coins size={12} />
                      {selected.price.toLocaleString()}G
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neon">{selected.stats.join(" / ")}</p>
                  <p className="mt-2 text-sm text-text-muted">{selected.passive}</p>

                  <ItemRelations item={selected} onNavigate={setSelected} />

                  {selected.recommendedFor && selected.recommendedFor.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-text-faint">おすすめロール:</span>
                      {selected.recommendedFor.map((role) => (
                        <Badge key={role}>{ROLE_LABEL[role]}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="閉じる"
                  className="shrink-0 cursor-pointer rounded-lg p-1 text-text-faint transition-colors hover:text-text"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemRelations({
  item,
  onNavigate,
}: {
  item: Item;
  onNavigate: (item: Item) => void;
}) {
  const buildsFrom = resolveItems(item.buildsFrom ?? []);
  const buildsInto = getBuildsInto(item.slug);
  if (buildsFrom.length === 0 && buildsInto.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/60 pt-3">
      {buildsFrom.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-faint">素材:</span>
          {buildsFrom.map((rel) => (
            <button
              key={rel.slug}
              onClick={() => onNavigate(rel)}
              title={rel.name}
              className="cursor-pointer transition-transform hover:scale-110"
            >
              <ItemIcon slug={rel.slug} name={rel.name} size={30} />
            </button>
          ))}
        </div>
      )}
      {buildsInto.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-faint">派生先:</span>
          {buildsInto.map((rel) => (
            <button
              key={rel.slug}
              onClick={() => onNavigate(rel)}
              title={rel.name}
              className="cursor-pointer transition-transform hover:scale-110"
            >
              <ItemIcon slug={rel.slug} name={rel.name} size={30} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
