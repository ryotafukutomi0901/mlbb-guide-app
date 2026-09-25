"use client";

import { useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LANE_LABEL, type Lane } from "@/data/types";
import type { CoachReportPayload } from "@/lib/coach/schema";
import { getAllHeroes } from "@/repositories/heroRepository";
import { cn } from "@/lib/utils";

const LANES = Object.keys(LANE_LABEL) as Lane[];

export interface AnalyzeResponse {
  source: "ai" | "sample";
  report: CoachReportPayload;
  /** AIで分析したときだけ返る(サンプル表示では利用量を数えないため) */
  plan?: string;
  remaining?: number;
  notice?: string;
}

export interface QuotaError {
  error: "quota_exceeded";
  plan: string;
  used: number;
  limit: number;
  resetAt?: string;
  upgradeUrl: string;
}

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60";
const labelClass = "mb-1.5 block text-xs font-semibold text-text-muted";

export function MatchAnalyzerForm({
  onResult,
  onQuotaExceeded,
}: {
  onResult: (result: AnalyzeResponse) => void;
  onQuotaExceeded: (error: QuotaError) => void;
}) {
  const heroes = getAllHeroes();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    heroSlug: heroes[0].slug,
    lane: "" as Lane | "",
    result: "defeat" as "victory" | "defeat",
    kills: 3,
    deaths: 5,
    assists: 6,
    durationMinutes: 15,
    notes: "",
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/coach/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroSlug: form.heroSlug,
          lane: form.lane || undefined,
          result: form.result,
          kills: form.kills,
          deaths: form.deaths,
          assists: form.assists,
          durationMinutes: form.durationMinutes,
          notes: form.notes.trim() || undefined,
          enemyHeroes: [],
          allyHeroes: [],
          locale: "ja",
        }),
      });

      if (response.status === 402) {
        onQuotaExceeded((await response.json()) as QuotaError);
        return;
      }
      if (!response.ok) {
        setError(
          response.status === 502
            ? "分析結果の形式が不正だったため、表示を中止しました。もう一度お試しください。"
            : "分析に失敗しました。時間をおいてもう一度お試しください。"
        );
        return;
      }
      onResult((await response.json()) as AnalyzeResponse);
    } catch {
      setError("通信に失敗しました。接続を確認してもう一度お試しください。");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card accent>
      <h2 className="text-sm font-bold">試合データを入力する</h2>
      <p className="mt-1 text-xs text-text-muted">
        直近の試合の結果を入力すると、次の1試合で直すべき点を分析します。
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="hero">
              使用ヒーロー
            </label>
            <select
              id="hero"
              value={form.heroSlug}
              onChange={(e) => set("heroSlug", e.target.value)}
              className={cn(inputClass, "cursor-pointer")}
            >
              {heroes.map((hero) => (
                <option key={hero.slug} value={hero.slug}>
                  {hero.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="lane">
              レーン
            </label>
            <select
              id="lane"
              value={form.lane}
              onChange={(e) => set("lane", e.target.value as Lane | "")}
              className={cn(inputClass, "cursor-pointer")}
            >
              <option value="">指定しない</option>
              {LANES.map((lane) => (
                <option key={lane} value={lane}>
                  {LANE_LABEL[lane]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className={labelClass}>試合結果</span>
          <div className="flex gap-2">
            {(["victory", "defeat"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => set("result", value)}
                aria-pressed={form.result === value}
                className={cn(
                  "flex-1 cursor-pointer rounded-xl border px-4 py-2 text-sm font-bold transition-colors",
                  form.result === value
                    ? value === "victory"
                      ? "border-success/60 bg-success/15 text-success"
                      : "border-danger/60 bg-danger/15 text-danger"
                    : "border-border bg-surface text-text-muted hover:text-text"
                )}
              >
                {value === "victory" ? "勝利" : "敗北"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["kills", "キル", 0, 99],
              ["deaths", "デス", 0, 99],
              ["assists", "アシスト", 0, 99],
              ["durationMinutes", "試合時間(分)", 1, 60],
            ] as const
          ).map(([key, label, min, max]) => (
            <div key={key}>
              <label className={labelClass} htmlFor={key}>
                {label}
              </label>
              <input
                id={key}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                value={form[key]}
                onChange={(e) => set(key, Number(e.target.value))}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <div>
          <label className={labelClass} htmlFor="notes">
            気になったこと(任意)
          </label>
          <textarea
            id="notes"
            rows={3}
            maxLength={600}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="例: 中盤で何度も孤立して落とされた。タートルに間に合わないことが多い。"
            className={cn(inputClass, "resize-y")}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Bot size={15} />}
          {pending ? "分析中..." : "無料で分析する"}
        </Button>
      </form>
    </Card>
  );
}
