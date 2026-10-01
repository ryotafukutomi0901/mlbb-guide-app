"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TierBadge } from "@/components/ui/Badge";
import type { HeroMeta, HeroSummary } from "@/data/types";
import { ROLE_LABEL } from "@/data/types";
import { heroImage } from "@/lib/assets";
import { fadeUp } from "@/animations/variants";

export function HeroCard({ hero, meta }: { hero: HeroSummary; meta?: HeroMeta }) {
  const image = heroImage(hero.slug);

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -5 }} transition={{ duration: 0.25 }}>
      <Link
        href={`/heroes/${hero.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_28px_rgba(139,92,246,0.25)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
          {image ? (
            <Image
              src={image}
              alt={hero.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-4xl font-black text-text-faint">
              {hero.nameEn.slice(0, 1)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/20 to-transparent" />
          <div className="absolute left-2 top-2">
            <TierBadge tier={hero.tier} />
          </div>
          {meta && (
            <div className="absolute right-2 top-2 rounded-md bg-bg-deep/70 px-1.5 py-0.5 font-display text-[10px] font-bold text-success backdrop-blur">
              {meta.winRate.toFixed(1)}%
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="truncate text-sm font-bold text-white">{hero.name}</p>
            <p className="truncate text-[10px] text-text-muted">
              {hero.roles.map((r) => ROLE_LABEL[r]).join(" / ")}
            </p>
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/25 to-transparent" />
          </div>
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="flex items-center gap-0.5" aria-label={`難易度 ${hero.difficulty}/5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`h-1 w-3 rounded-full ${i < hero.difficulty ? "bg-gold" : "bg-surface-hover"}`}
              />
            ))}
          </span>
          <span className="font-display text-[10px] text-text-faint">{hero.releaseYear}</span>
        </div>
      </Link>
    </motion.div>
  );
}
