"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useAppState } from "@/providers/AppStateProvider";
import { cn } from "@/lib/utils";

export function FavoriteButton({ slug, className }: { slug: string; className?: string }) {
  const { isFavorite, toggleFavorite, hydrated } = useAppState();
  const active = hydrated && isFavorite(slug);

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => toggleFavorite(slug)}
      aria-label={active ? "お気に入りから外す" : "お気に入りに追加"}
      aria-pressed={active}
      className={cn(
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all duration-300",
        active
          ? "border-danger/60 bg-danger/15 text-danger shadow-[0_0_16px_rgba(244,63,94,0.3)]"
          : "border-border bg-surface/60 text-text-muted hover:border-danger/40 hover:text-danger",
        className
      )}
    >
      <motion.span
        key={String(active)}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
      >
        <Heart size={18} fill={active ? "currentColor" : "none"} />
      </motion.span>
    </motion.button>
  );
}
