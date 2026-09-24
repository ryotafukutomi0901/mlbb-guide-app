"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Crosshair,
  Lightbulb,
  ShieldQuestion,
  Swords,
  Wrench,
} from "lucide-react";
import { Heatmap } from "@/components/coach/Heatmap";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { ItemIcon } from "@/components/item/ItemIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { StatBar } from "@/components/ui/StatBar";
import {
  COACH_INSIGHT_LABEL,
  TIMELINE_SCENE_LABEL,
  type CoachInsightKind,
  type CoachReport,
  type MatchRecord,
} from "@/data/types";
import { formatClock } from "@/lib/format";
import { getHeroBySlug } from "@/repositories/heroRepository";
import { getItemBySlug } from "@/repositories/itemRepository";
import { cn } from "@/lib/utils";

const INSIGHT_STYLE: Record<CoachInsightKind, { icon: React.ReactNode; tone: string }> = {
  improve: { icon: <Crosshair size={15} />, tone: "text-danger border-danger/30 bg-danger/10" },
  warning: { icon: <AlertTriangle size={15} />, tone: "text-warning border-warning/30 bg-warning/10" },
  build: { icon: <Wrench size={15} />, tone: "text-primary-2 border-primary-2/30 bg-primary-2/10" },
  judgement: { icon: <ShieldQuestion size={15} />, tone: "text-primary border-primary/30 bg-primary/10" },
  good: { icon: <CheckCircle2 size={15} />, tone: "text-success border-success/30 bg-success/10" },
};

export function CoachReportView({
  report,
  match,
}: {
  report: CoachReport;
  match?: MatchRecord;
}) {
  const [selectedScene, setSelectedScene] = useState(report.scenes[0]);
  const duration = match?.durationSeconds ?? Math.max(...report.scenes.map((s) => s.atSeconds)) + 60;
  const hero = match ? getHeroBySlug(match.heroSlug) : undefined;

  const teamTotals = useMemo(() => {
    if (!match) return null;
    const sum = (side: MatchRecord["allies"]) => ({
      kills: side.reduce((acc, p) => acc + p.kda[0], 0),
      gold: side.reduce((acc, p) => acc + p.gold, 0),
      damage: side.reduce((acc, p) => acc + p.damage, 0),
    });
    return { allies: sum(match.allies), enemies: sum(match.enemies) };
  }, [match]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card accent className="flex items-center gap-5 lg:col-span-1">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-surface-2)" strokeWidth="7" />
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#grade-gradient)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - report.score / 100) }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="grade-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffd76a" />
                  <stop offset="100%" stopColor="#fb7a2b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <p className="font-display text-3xl font-black text-gradient-gold">{report.grade}</p>
              <p className="font-display text-[9px] text-text-faint">
                <CountUp value={report.score} />/100
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              AI総合評価
            </p>
            <p className="mt-1 text-sm font-bold leading-snug">{report.headline}</p>
            <p className="mt-2 text-xs text-success">
              改善で勝率 +{report.winRateDelta.toFixed(1)}% の見込み
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">試合データ</h2>
            {match && (
              <div className="flex items-center gap-2">
                {hero && <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="sm" />}
                <Badge variant={match.result === "victory" ? "success" : "danger"}>
                  {match.result === "victory" ? "勝利" : "敗北"}
                </Badge>
                <span className="font-display text-[10px] text-text-faint">{match.playedAt}</span>
              </div>
            )}
          </div>
          {match && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "KDA", value: match.kda.join(" / ") },
                { label: "ゴールド", value: match.gold.toLocaleString() },
                { label: "ダメージ/分", value: match.damagePerMin.toLocaleString() },
                { label: "キル参加率", value: `${match.killParticipation}%` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border/60 bg-surface-2/50 p-3 text-center">
                  <p className="font-display text-base font-black">{stat.value}</p>
                  <p className="text-[10px] text-text-faint">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
          {teamTotals && (
            <div className="mt-3 flex flex-col gap-1.5">
              {(
                [
                  ["キル", teamTotals.allies.kills, teamTotals.enemies.kills],
                  ["ゴールド", teamTotals.allies.gold, teamTotals.enemies.gold],
                  ["ダメージ", teamTotals.allies.damage, teamTotals.enemies.damage],
                ] as const
              ).map(([label, ally, enemy]) => {
                const total = ally + enemy || 1;
                return (
                  <div key={label} className="flex items-center gap-2 text-[10px]">
                    <span className="w-14 shrink-0 text-text-faint">{label}</span>
                    <span className="w-12 shrink-0 text-right font-display font-bold text-primary-2">
                      {ally >= 1000 ? `${(ally / 1000).toFixed(1)}k` : ally}
                    </span>
                    <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="bg-primary-2" style={{ width: `${(ally / total) * 100}%` }} />
                      <div className="bg-danger" style={{ width: `${(enemy / total) * 100}%` }} />
                    </div>
                    <span className="w-12 shrink-0 font-display font-bold text-danger">
                      {enemy >= 1000 ? `${(enemy / 1000).toFixed(1)}k` : enemy}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-bold">AIによる試合分析</h2>
          <div className="flex flex-col gap-2.5">
            {report.insights.map((insight) => {
              const style = INSIGHT_STYLE[insight.kind];
              return (
                <div
                  key={`${insight.atSeconds}:${insight.kind}`}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface-2/40 p-3 transition-colors hover:bg-surface-2/70"
                >
                  <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border", style.tone)}>
                    {style.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs">
                      <span className="font-display font-bold text-neon">{formatClock(insight.atSeconds)}</span>
                      <span className={cn("font-bold", style.tone.split(" ")[0])}>
                        {COACH_INSIGHT_LABEL[insight.kind]}
                      </span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-text-muted">{insight.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-3 text-sm font-bold">パフォーマンス評価</h2>
            <div className="flex flex-col gap-3">
              {report.categories.map((category) => (
                <div key={category.label}>
                  <StatBar
                    label={category.label}
                    value={category.score}
                    color={category.score >= 70 ? "success" : category.score >= 55 ? "primary" : "danger"}
                  />
                  <p className="mt-0.5 pl-27 text-[10px] text-text-faint">{category.comment}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
              <Lightbulb size={14} className="text-gold" />
              MVP行動
            </h2>
            <ul className="flex flex-col gap-1.5">
              {report.mvpActions.map((action) => (
                <li key={action} className="flex gap-2 text-xs text-text-muted">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-success" />
                  {action}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-bold">タイムライン(重要シーン)</h2>
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
          {report.scenes.map((scene) => {
            const active = scene === selectedScene;
            return (
              <button
                key={`${scene.atSeconds}:${scene.kind}`}
                onClick={() => setSelectedScene(scene)}
                className={cn(
                  "group w-36 shrink-0 cursor-pointer overflow-hidden rounded-xl border text-left transition-all duration-200",
                  active
                    ? "border-primary/60 shadow-[0_0_18px_rgba(139,92,246,0.3)]"
                    : "border-border hover:border-border-bright"
                )}
              >
                <div className="relative flex h-20 items-center justify-center bg-gradient-to-br from-surface-2 to-bg-deep">
                  <span
                    className={cn(
                      "font-display text-lg font-black transition-colors",
                      active ? "text-primary" : "text-text-faint group-hover:text-text-muted"
                    )}
                  >
                    {formatClock(scene.atSeconds)}
                  </span>
                </div>
                <p className={cn("truncate px-2 py-1.5 text-[10px] font-bold", active ? "text-primary" : "text-text-muted")}>
                  {TIMELINE_SCENE_LABEL[scene.kind]}
                </p>
              </button>
            );
          })}
        </div>

        <div className="relative mt-2 h-1.5 rounded-full bg-surface-2">
          {report.scenes.map((scene) => (
            <button
              key={`marker-${scene.atSeconds}`}
              onClick={() => setSelectedScene(scene)}
              aria-label={`${formatClock(scene.atSeconds)} ${TIMELINE_SCENE_LABEL[scene.kind]}`}
              className={cn(
                "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-bg transition-all",
                scene === selectedScene
                  ? "scale-125 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                  : "bg-text-faint hover:bg-primary/70"
              )}
              style={{ left: `${(scene.atSeconds / duration) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between font-display text-[9px] text-text-faint">
          <span>00:00</span>
          <span>{formatClock(duration)}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedScene.atSeconds}:${selectedScene.kind}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3"
          >
            <p className="text-xs">
              <span className="font-display font-bold text-neon">{formatClock(selectedScene.atSeconds)}</span>
              <span className="ml-2 font-bold text-primary">{TIMELINE_SCENE_LABEL[selectedScene.kind]}</span>
              <span className="ml-2 text-text-muted">{selectedScene.description}</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-3 text-sm font-bold">移動・行動ヒートマップ</h2>
          <Heatmap
            movement={report.heatmap.movement}
            deaths={report.heatmap.deaths}
            vision={report.heatmap.vision}
          />
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">おすすめビルド(この試合向け)</h2>
              <Link
                href={`/simulator${match ? `?hero=${match.heroSlug}` : ""}`}
                className="flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-neon"
              >
                <Swords size={12} />
                ビルドをシミュレート
              </Link>
            </div>
            <p className="mt-1 text-[10px] text-text-faint">この試合の敵構成に合わせた最適ビルドです</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {report.recommendedBuild.map((slug, i) => {
                const item = getItemBySlug(slug);
                if (!item) return null;
                return (
                  <div key={slug} className="flex items-center gap-1.5">
                    <div className="rounded-xl border border-border bg-surface-2/60 p-1.5" title={item.name}>
                      <ItemIcon slug={item.slug} name={item.name} size={40} />
                    </div>
                    {i < report.recommendedBuild.length - 1 && (
                      <ArrowRight size={11} className="text-text-faint" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-border/50 pt-3">
              {report.buildAdvice.map((advice) => {
                const item = getItemBySlug(advice.itemSlug);
                return (
                  <div key={advice.itemSlug} className="flex items-center gap-2.5 text-xs">
                    {item && <ItemIcon slug={item.slug} name={item.name} size={28} />}
                    <span className="font-semibold">{item?.name}</span>
                    <span className="text-text-faint">—</span>
                    <span className="min-w-0 flex-1 text-text-muted">{advice.reason}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="mb-2 text-sm font-bold">ドラフト分析</h2>
            <p className="text-xs leading-relaxed text-text-muted">{report.draftReview}</p>
          </Card>
        </div>
      </div>

      <Card accent>
        <h2 className="mb-4 text-sm font-bold">次回の意識ポイント TOP3</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {report.focusPoints.map((point, i) => (
            <div key={point.title} className="flex gap-3 rounded-xl border border-border/60 bg-surface-2/40 p-4">
              <span className="font-display text-2xl font-black text-gradient-gold">{i + 1}</span>
              <div>
                <p className="text-xs font-bold">{point.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold">おすすめ練習メニュー</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {report.practiceMenu.map((menu) => (
            <div key={menu.title} className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <p className="text-xs font-bold text-primary">{menu.title}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-text-muted">{menu.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
