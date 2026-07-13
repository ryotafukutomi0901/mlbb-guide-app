"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { SKIN_RARITY_LABEL, type Skin } from "@/data/types";
import { heroImage } from "@/lib/assets";
import { getHeroBySlug } from "@/repositories/heroRepository";
import { fadeUp } from "@/animations/variants";
import { cn } from "@/lib/utils";
import { RARITY_BORDER, RARITY_GLOW, RARITY_TEXT } from "./skinStyle";

export function SkinCard({ skin }: { skin: Skin }) {
  const hero = getHeroBySlug(skin.heroSlug);
  const image = heroImage(skin.heroSlug);

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -5 }} transition={{ duration: 0.25 }}>
      <Link
        href={`/skins/${skin.slug}`}
        className={cn(
          "group block overflow-hidden rounded-2xl border bg-surface transition-all duration-300",
          RARITY_BORDER[skin.rarity],
          RARITY_GLOW[skin.rarity]
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
          {image ? (
            <Image
              src={image}
              alt={skin.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-4xl font-black text-text-faint">
              ?
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/10 to-transparent" />
          {skin.owned && (
            <div className="absolute right-2 top-2">
              <Badge variant="success">所持</Badge>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className={cn("font-display text-[9px] font-bold uppercase tracking-[0.2em]", RARITY_TEXT[skin.rarity])}>
              {SKIN_RARITY_LABEL[skin.rarity]}
            </p>
            <p className="mt-0.5 truncate text-sm font-bold text-white">{skin.name}</p>
            <p className="truncate text-[10px] text-text-muted">{hero?.name}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
