"use client";

import { useEffect } from "react";
import { useAppState } from "@/providers/AppStateProvider";

export function RecentHeroTracker({ slug }: { slug: string }) {
  const { pushRecentHero, hydrated } = useAppState();

  useEffect(() => {
    if (hydrated) pushRecentHero(slug);
  }, [slug, hydrated, pushRecentHero]);

  return null;
}
