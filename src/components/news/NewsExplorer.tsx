"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FilterChips } from "@/components/ui/FilterChips";
import { NEWS_CATEGORY_LABEL, type NewsCategory } from "@/data/types";
import { bannerImage } from "@/lib/assets";
import { hashSeed } from "@/lib/seed";
import { getNews } from "@/repositories/contentRepository";
import { fadeUp, staggerContainer } from "@/animations/variants";

const CATEGORY_OPTIONS = (Object.keys(NEWS_CATEGORY_LABEL) as NewsCategory[]).map((c) => ({
  value: c,
  label: NEWS_CATEGORY_LABEL[c],
}));

const CATEGORY_BADGE: Record<NewsCategory, "danger" | "gold" | "neon" | "primary"> = {
  collab: "danger",
  skin: "gold",
  event: "neon",
  patch: "primary",
};

export function NewsExplorer() {
  const [category, setCategory] = useState<NewsCategory | "all">("all");

  const items = useMemo(
    () => getNews(category === "all" ? undefined : category),
    [category]
  );

  const [featured, ...rest] = items;

  return (
    <div>
      <FilterChips options={CATEGORY_OPTIONS} value={category} onChange={setCategory} className="mb-6" />

      <motion.div
        key={category}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        {featured && (
          <motion.div variants={fadeUp}>
            <Card interactive className="overflow-hidden p-0">
              <div className="relative h-44 md:h-56">
                <Image
                  src={bannerImage(hashSeed(featured.slug))}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={CATEGORY_BADGE[featured.category]}>
                      {NEWS_CATEGORY_LABEL[featured.category]}
                    </Badge>
                    <span className="font-display text-[10px] text-text-muted">{featured.date}</span>
                  </div>
                  <h2 className="text-lg font-black md:text-xl">{featured.title}</h2>
                  <p className="mt-1 line-clamp-2 max-w-2xl text-xs text-text-muted md:text-sm">
                    {featured.summary}
                  </p>
                </div>
              </div>
              {featured.body && (
                <div className="flex flex-col gap-2 p-5 pt-4 text-sm leading-relaxed text-text-muted">
                  {featured.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {rest.map((item) => (
            <motion.div key={item.slug} variants={fadeUp}>
              <Card interactive className="h-full">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant={CATEGORY_BADGE[item.category]}>
                    {NEWS_CATEGORY_LABEL[item.category]}
                  </Badge>
                  <span className="font-display text-[10px] text-text-faint">{item.date}</span>
                </div>
                <p className="font-bold leading-snug">{item.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{item.summary}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
