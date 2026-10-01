"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Target } from "lucide-react";
import { LockedSection } from "@/components/coach/LockedSection";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { PRO_LOCKED_SECTIONS } from "@/lib/coach/freeTrial";
import type { CoachReportPayload } from "@/lib/coach/schema";

/**
 * 無料分析の結果。
 * スコア・最大の弱点・今日直せる1点までを全文表示し、その先はProでロックする。
 */
export function FreeAnalysisResult({
  report,
  source,
  notice,
}: {
  report: CoachReportPayload;
  source: "ai" | "sample";
  notice?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4"
    >
      {source === "sample" && notice && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3.5">
          <Info size={16} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <p className="text-xs font-bold text-warning">サンプルレポート</p>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">{notice}</p>
          </div>
        </div>
      )}

      <Card accent className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-surface-2)" strokeWidth="7" />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#free-grade-gradient)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - report.score / 100) }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
            <defs>
              <linearGradient id="free-grade-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffd76a" />
                <stop offset="100%" stopColor="#fb7a2b" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <p className="font-display text-3xl font-black text-gradient-gold">{report.grade}</p>
            <p className="font-display text-[9px] text-text-faint">
              <CountUp value={report.score} />
              /100
            </p>
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            総合評価
          </p>
          <p className="mt-1 text-sm font-bold leading-snug">{report.headline}</p>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">{report.summary}</p>
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-sm font-bold text-danger">
          <AlertTriangle size={15} />
          最大の課題
        </h2>
        <p className="mt-2 text-base font-bold">{report.biggestWeakness.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
          {report.biggestWeakness.detail}
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-sm font-bold text-success">
            <CheckCircle2 size={15} />
            最大の強み
          </h2>
          <p className="mt-2 text-base font-bold">{report.biggestStrength.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
            {report.biggestStrength.detail}
          </p>
        </Card>

        <Card accent>
          <h2 className="flex items-center gap-2 text-sm font-bold text-primary">
            <Target size={15} />
            次の試合で意識すること
          </h2>
          <p className="mt-2 text-base font-bold">{report.todayFocus.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{report.todayFocus.detail}</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-bold">次の1試合でやること</h2>
        <ol className="flex flex-col gap-2.5">
          {report.nextMatchActions.map((action, i) => (
            <li key={action} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg gradient-primary font-display text-[11px] font-black text-white">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-text-muted">{action}</span>
            </li>
          ))}
        </ol>
      </Card>

      {PRO_LOCKED_SECTIONS.map((section) => (
        <LockedSection key={section.title} title={section.title} items={section.items} />
      ))}
    </motion.div>
  );
}
