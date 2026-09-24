"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { TierBadge } from "@/components/ui/Badge";
import { FilterChips } from "@/components/ui/FilterChips";
import { ROLE_LABEL, type Role } from "@/data/types";
import { formatSigned } from "@/lib/format";
import { getHeroesWithMeta } from "@/repositories/heroRepository";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as Role[]).map((r) => ({
  value: r,
  label: ROLE_LABEL[r],
}));

type MetricKey = "winRate" | "pickRate" | "banRate" | "trend";

const METRICS: { value: MetricKey; label: string }[] = [
  { value: "winRate", label: "勝率" },
  { value: "pickRate", label: "ピック率" },
  { value: "banRate", label: "バン率" },
  { value: "trend", label: "上昇率" },
];

export function MetaRankingTable() {
  const [role, setRole] = useState<Role | "all">("all");
  const [metric, setMetric] = useState<MetricKey>("winRate");

  const rows = useMemo(() => {
    return getHeroesWithMeta()
      .filter((h) => role === "all" || h.roles.includes(role))
      .map((hero) => ({ hero, meta: hero.meta }))
      .sort((a, b) => b.meta[metric] - a.meta[metric])
      .slice(0, 30);
  }, [role, metric]);

  const maxValue = Math.max(...rows.map((r) => Math.abs(r.meta[metric])), 1);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3">
        <FilterChips options={ROLE_OPTIONS} value={role} onChange={setRole} />
        <div className="flex gap-2">
          {METRICS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              className={cn(
                "cursor-pointer rounded-xl border px-4 py-2 text-xs font-bold transition-all duration-200",
                metric === m.value
                  ? "border-neon/60 bg-neon/10 text-neon shadow-[0_0_14px_rgba(56,214,255,0.2)]"
                  : "border-border bg-surface/60 text-text-muted hover:text-text"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {rows.map(({ hero, meta }, index) => {
          const value = meta[metric];
          const isTrend = metric === "trend";
          return (
            <Link
              key={hero.slug}
              href={`/heroes/${hero.slug}`}
              className="group relative flex items-center gap-3 border-b border-border/40 px-4 py-3 transition-colors last:border-0 hover:bg-surface-hover/40 md:gap-4"
            >
              <span
                className={cn(
                  "w-8 shrink-0 text-center font-display text-sm font-black",
                  index === 0
                    ? "text-gold"
                    : index === 1
                      ? "text-text"
                      : index === 2
                        ? "text-ember"
                        : "text-text-faint"
                )}
              >
                {index + 1}
              </span>
              <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold group-hover:text-white">{hero.name}</p>
                <p className="truncate text-[10px] text-text-faint">
                  {hero.roles.map((r) => ROLE_LABEL[r]).join(" / ")}
                </p>
              </div>
              <TierBadge tier={hero.tier} className="hidden sm:inline-flex" />

              <div className="hidden w-40 md:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(Math.abs(value) / maxValue) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "h-full rounded-full",
                      isTrend && value < 0 ? "bg-danger" : "gradient-primary"
                    )}
                  />
                </div>
              </div>

              <span
                className={cn(
                  "w-20 shrink-0 text-right font-display text-sm font-bold",
                  isTrend ? (value >= 0 ? "text-success" : "text-danger") : "text-text"
                )}
              >
                {isTrend ? (
                  <span className="inline-flex items-center gap-1">
                    {value >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {formatSigned(value)}%
                  </span>
                ) : (
                  `${value.toFixed(1)}%`
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
