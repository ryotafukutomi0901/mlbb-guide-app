"use client";

import Link from "next/link";
import { Heart, History } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { Card } from "@/components/ui/Card";
import { getHeroBySlug } from "@/repositories/heroRepository";
import { useAppState } from "@/providers/AppStateProvider";

function HeroChipRow({ slugs, emptyText }: { slugs: string[]; emptyText: string }) {
  const heroes = slugs
    .map(getHeroBySlug)
    .filter((h): h is NonNullable<typeof h> => Boolean(h))
    .slice(0, 6);

  if (heroes.length === 0) {
    return <p className="py-3 text-xs text-text-faint">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {heroes.map((hero) => (
        <Link
          key={hero.slug}
          href={`/characters/${hero.slug}`}
          title={hero.name}
          className="flex flex-col items-center gap-1 transition-transform hover:scale-105"
        >
          <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="md" className="ring-1 ring-border" />
          <span className="max-w-14 truncate text-[10px] text-text-muted">{hero.name}</span>
        </Link>
      ))}
    </div>
  );
}

export function RecentAndFavorites() {
  const { recentHeroes, favorites, hydrated } = useAppState();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
          <History size={14} className="text-neon" />
          最近見たヒーロー
        </h2>
        <HeroChipRow
          slugs={hydrated ? recentHeroes : []}
          emptyText="ヒーロー詳細を見ると、ここに履歴が並びます。"
        />
      </Card>
      <Card>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
          <Heart size={14} className="text-danger" />
          お気に入り
        </h2>
        <HeroChipRow
          slugs={hydrated ? favorites : []}
          emptyText="ヒーロー詳細の♥ボタンでお気に入り登録できます。"
        />
      </Card>
    </div>
  );
}
