"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Heart, Pause, Play, RotateCcw, Star, Swords } from "lucide-react";
import { JungleIcon } from "@/components/jungle/JungleIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { JUNGLE_MONSTERS } from "@/data/jungle";
import type { JungleMonster } from "@/data/types";
import { staggerContainer, fadeUp } from "@/animations/variants";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL = { little: "小型モンスター", turtle: "タートル", lord: "ロード" } as const;

const TAB_ITEMS = [
  { value: "compendium", label: "図鑑" },
  { value: "timer", label: "タイマー" },
] as const;

type TabValue = (typeof TAB_ITEMS)[number]["value"];

function formatClock(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "-" : "";
  const s = Math.abs(Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${sign}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function nextSpawnAt(monster: JungleMonster, killedAt: number | null): number {
  if (killedAt === null) return monster.firstSpawnSeconds;
  if (monster.slug === "lord") {
    const respawn = killedAt < 18 * 60 ? 180 : 120;
    return killedAt + respawn;
  }
  return killedAt + monster.respawnSeconds;
}

export function JungleExplorer() {
  const [tab, setTab] = useState<TabValue>("compendium");

  return (
    <div>
      <Tabs items={[...TAB_ITEMS]} value={tab} onChange={setTab} layoutId="jungle-tabs" className="mb-6 w-fit" />
      {tab === "compendium" ? <JungleCompendium /> : <JungleTimer />}
    </div>
  );
}

function JungleCompendium() {
  const groups: JungleMonster["category"][] = ["little", "turtle", "lord"];
  return (
    <div className="flex flex-col gap-8">
      {groups.map((cat) => (
        <div key={cat}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <span className="h-4 w-1 rounded-full gradient-primary" />
            {CATEGORY_LABEL[cat]}
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-3 md:grid-cols-2"
          >
            {JUNGLE_MONSTERS.filter((m) => m.category === cat).map((m) => (
              <motion.div key={m.slug} variants={fadeUp}>
                <Card interactive className="h-full">
                  <div className="flex gap-4">
                    <JungleIcon slug={m.slug} name={m.name} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{m.name}</p>
                      <p className="mt-0.5 text-[11px] text-text-faint">{m.mapArea}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
                        <span>初回 <span className="font-display font-bold text-neon">{m.firstSpawn}</span></span>
                        <span>再出現 <span className="font-display font-bold text-neon">{m.respawn}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/50 pt-3 text-center">
                    <div>
                      <p className="flex items-center justify-center gap-1 font-display text-sm font-bold text-danger">
                        <Heart size={11} />
                        {m.hp?.toLocaleString() ?? "-"}
                      </p>
                      <p className="text-[10px] text-text-faint">HP</p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1 font-display text-sm font-bold text-gold">
                        <Coins size={11} />
                        {m.gold ?? "-"}
                      </p>
                      <p className="text-[10px] text-text-faint">ゴールド</p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1 font-display text-sm font-bold text-primary">
                        <Star size={11} />
                        {m.exp ?? "-"}
                      </p>
                      <p className="text-[10px] text-text-faint">経験値</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-text-muted">{m.effect}</p>
                  {m.teamReward && <p className="mt-1.5 text-xs text-primary">{m.teamReward}</p>}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

function JungleTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [killedAt, setKilledAt] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(JUNGLE_MONSTERS.map((m) => [m.slug, null]))
  );

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const rows = useMemo(() => {
    return JUNGLE_MONSTERS.map((m) => {
      const spawnAt = nextSpawnAt(m, killedAt[m.slug]);
      return { monster: m, spawnAt, remaining: spawnAt - elapsed };
    }).sort((a, b) => a.remaining - b.remaining);
  }, [elapsed, killedAt]);

  return (
    <div>
      <Card accent className="mb-4 flex flex-wrap items-center gap-4 md:gap-6">
        <div className="hud-corners rounded-xl border border-primary/30 bg-bg-deep/60 px-5 py-2 text-primary">
          <span
            className={cn(
              "font-display text-3xl font-black tabular-nums tracking-wider",
              running ? "text-neon" : "text-text"
            )}
          >
            {formatClock(elapsed)}
          </span>
        </div>
        <Button onClick={() => setRunning((r) => !r)} variant={running ? "secondary" : "primary"}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "一時停止" : "試合開始"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setRunning(false);
            setElapsed(0);
            setKilledAt(Object.fromEntries(JUNGLE_MONSTERS.map((m) => [m.slug, null])));
          }}
        >
          <RotateCcw size={16} />
          リセット
        </Button>
        <span className="text-xs text-text-faint">
          「討伐」を押すと次回出現までのカウントダウンを自動で再計算します。
        </span>
      </Card>

      <div className="flex flex-col gap-2">
        {rows.map(({ monster, remaining }) => {
          const spawned = remaining <= 0;
          const urgent = !spawned && remaining <= 15;
          return (
            <motion.div
              key={monster.slug}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur transition-colors",
                spawned
                  ? "border-success/50 bg-success/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                  : urgent
                    ? "animate-pulse-glow border-warning/50 bg-warning/5"
                    : "glass"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <JungleIcon slug={monster.slug} name={monster.name} size={44} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{monster.name}</p>
                  <p className="text-[11px] text-text-faint">{CATEGORY_LABEL[monster.category]}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {spawned ? (
                  <Badge variant="success">出現中</Badge>
                ) : (
                  <span
                    className={cn(
                      "font-display text-xl font-bold tabular-nums",
                      urgent ? "text-warning" : "text-text"
                    )}
                  >
                    {formatClock(remaining)}
                  </span>
                )}
                <button
                  onClick={() => setKilledAt((prev) => ({ ...prev, [monster.slug]: elapsed }))}
                  className="flex cursor-pointer items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition-all hover:border-danger/60 hover:text-danger hover:shadow-[0_0_14px_rgba(244,63,94,0.2)]"
                >
                  <Swords size={12} />
                  討伐
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
