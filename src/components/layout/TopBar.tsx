"use client";

import Link from "next/link";
import { Gem, Search, Ticket } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { PLAYER_PROFILE } from "@/data/profile";
import { formatCompact } from "@/lib/format";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-16 md:px-6">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary font-display text-xs font-black text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]">
            ML
          </span>
          <span className="font-display text-xs font-bold tracking-widest">
            MLBB <span className="text-gradient-gold">LAB</span>
          </span>
        </Link>

        <Link
          href="/search"
          className="group hidden flex-1 items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2 text-sm text-text-faint transition-colors hover:border-primary/50 hover:text-text-muted md:flex md:max-w-md"
        >
          <Search size={15} className="group-hover:text-primary" />
          ヒーロー・アイテム・ビルドを検索
          <kbd className="ml-auto rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-display text-[10px] text-text-faint">
            /
          </kbd>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/search"
            aria-label="検索"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface/60 text-text-muted transition-colors hover:border-primary/50 hover:text-text md:hidden"
          >
            <Search size={16} />
          </Link>

          <div className="hidden items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3 py-1.5 sm:flex">
            <Gem size={14} className="text-neon" />
            <span className="font-display text-xs font-bold">2,840</span>
          </div>
          <div className="hidden items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3 py-1.5 sm:flex">
            <Ticket size={14} className="text-gold" />
            <span className="font-display text-xs font-bold">{formatCompact(56800)}</span>
          </div>

          <Link
            href="/profile"
            className="group flex items-center gap-2 rounded-xl border border-border bg-surface/60 py-1 pl-1 pr-3 transition-colors hover:border-primary/50"
          >
            <HeroAvatar
              name={PLAYER_PROFILE.name}
              role={PLAYER_PROFILE.favoriteRole}
              slug={PLAYER_PROFILE.avatarHero}
              size="sm"
              className="ring-1 ring-primary/50"
            />
            <span className="hidden text-left md:block">
              <span className="block text-xs font-semibold leading-tight">{PLAYER_PROFILE.name}</span>
              <span className="block text-[10px] leading-tight text-gold">
                Lv.{PLAYER_PROFILE.level}
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
