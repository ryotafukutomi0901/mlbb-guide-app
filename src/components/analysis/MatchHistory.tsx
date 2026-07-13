"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, Crown } from "lucide-react";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { Badge } from "@/components/ui/Badge";
import { formatClock } from "@/lib/format";
import type { MatchPlayerLine, MatchRecord } from "@/data/types";
import { getHeroBySlug } from "@/repositories/heroRepository";
import { getMatchHistory } from "@/repositories/matchRepository";
import { cn } from "@/lib/utils";

function ScoreboardSide({ title, players, tone }: { title: string; players: MatchPlayerLine[]; tone: string }) {
  return (
    <div>
      <p className={cn("mb-2 text-[10px] font-bold uppercase tracking-widest", tone)}>{title}</p>
      <div className="flex flex-col gap-1">
        {players.map((player) => {
          const hero = getHeroBySlug(player.heroSlug);
          return (
            <div
              key={player.playerName}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs",
                player.isSelf && "border border-primary/40 bg-primary/10"
              )}
            >
              {hero && <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="xs" />}
              <span className={cn("min-w-0 flex-1 truncate", player.isSelf ? "font-bold" : "text-text-muted")}>
                {player.playerName}
              </span>
              <span className="w-16 shrink-0 text-right font-display">{player.kda.join("/")}</span>
              <span className="hidden w-14 shrink-0 text-right font-display text-gold sm:block">
                {(player.gold / 1000).toFixed(1)}k
              </span>
              <span className="hidden w-16 shrink-0 text-right font-display text-text-faint md:block">
                {(player.damage / 1000).toFixed(0)}k
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MatchHistory() {
  const matches = getMatchHistory();
  const [openId, setOpenId] = useState<string | null>(matches[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-3">
      {matches.map((match: MatchRecord) => {
        const hero = getHeroBySlug(match.heroSlug);
        const open = openId === match.id;
        const victory = match.result === "victory";
        return (
          <div
            key={match.id}
            className={cn(
              "overflow-hidden rounded-2xl border backdrop-blur transition-colors",
              victory ? "border-success/30" : "border-danger/30"
            )}
          >
            <button
              onClick={() => setOpenId(open ? null : match.id)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 p-4 text-left",
                victory
                  ? "bg-gradient-to-r from-success/10 to-transparent"
                  : "bg-gradient-to-r from-danger/10 to-transparent"
              )}
            >
              <span
                className={cn(
                  "w-1 shrink-0 self-stretch rounded-full",
                  victory ? "bg-success shadow-[0_0_10px_rgba(52,211,153,0.7)]" : "bg-danger shadow-[0_0_10px_rgba(244,63,94,0.7)]"
                )}
              />
              {hero && <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="md" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("font-display text-sm font-black", victory ? "text-success" : "text-danger")}>
                    {victory ? "VICTORY" : "DEFEAT"}
                  </span>
                  {match.mvp && (
                    <Badge variant="gold">
                      <Crown size={10} />
                      MVP
                    </Badge>
                  )}
                  <span className="text-[10px] text-text-faint">{match.mode}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-text-faint">
                  {match.playedAt} ・ {formatClock(match.durationSeconds)}
                </p>
              </div>

              <div className="hidden gap-5 text-center sm:flex">
                <div>
                  <p className="font-display text-sm font-bold">{match.kda.join("/")}</p>
                  <p className="text-[9px] text-text-faint">KDA</p>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-gold">{(match.gold / 1000).toFixed(1)}k</p>
                  <p className="text-[9px] text-text-faint">ゴールド</p>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-neon">{match.killParticipation}%</p>
                  <p className="text-[9px] text-text-faint">キル参加</p>
                </div>
              </div>

              <ChevronDown
                size={16}
                className={cn("shrink-0 text-text-faint transition-transform duration-300", open && "rotate-180")}
              />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="border-t border-border/50 bg-bg-deep/40 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <ScoreboardSide title="味方チーム" players={match.allies} tone="text-primary-2" />
                      <ScoreboardSide title="敵チーム" players={match.enemies} tone="text-danger" />
                    </div>
                    {match.hasCoachReport && (
                      <Link
                        href="/coach"
                        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/20"
                      >
                        <Bot size={13} />
                        この試合のAIコーチレポートを見る
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
