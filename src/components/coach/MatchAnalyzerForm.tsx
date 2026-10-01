"use client";

import { useState } from "react";
import { Bot, Loader2, Sparkles, X } from "lucide-react";
import {
  PARSED_FIELD_LABEL,
  ScreenshotImport,
  type ScreenshotParseResponse,
} from "@/components/coach/ScreenshotImport";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LANE_LABEL, type HeroSummary, type Lane } from "@/data/types";
import type { CoachReportPayload } from "@/lib/coach/schema";
import type { ParsedMatchFields } from "@/lib/coach/vision";
import { getAllHeroes, getHeroBySlug } from "@/repositories/heroRepository";
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
const labelClass = "mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-muted";

type NumberKey = "kills" | "deaths" | "assists" | "durationMinutes" | "gold";

/** 数値は文字列で持つ(空欄 = 未入力。読み取れなかった値を0などで埋めない) */
interface FormState {
  heroSlug: string;
  lane: Lane | "";
  result: "victory" | "defeat" | null;
  kills: string;
  deaths: string;
  assists: string;
  durationMinutes: string;
  gold: string;
  allyHeroes: string[];
  enemyHeroes: string[];
  notes: string;
}

type FieldKey = keyof ParsedMatchFields;

/** 分析に必須の数値(ゴールドは任意なので別に置く) */
const NUMBER_FIELDS: { key: Exclude<NumberKey, "gold">; label: string; min: number; max: number }[] = [
  { key: "kills", label: "キル", min: 0, max: 99 },
  { key: "deaths", label: "デス", min: 0, max: 99 },
  { key: "assists", label: "アシスト", min: 0, max: 99 },
  { key: "durationMinutes", label: "試合時間(分)", min: 1, max: 60 },
];

function AiMark() {
  return (
    <span
      title="AIがスクショから読み取った値"
      className="inline-flex items-center gap-0.5 rounded-md bg-primary/15 px-1 py-px text-[11px] font-bold text-primary"
    >
      <Sparkles size={10} />
      AI
    </span>
  );
}

/** 味方・敵の構成。任意項目なので、読み取れた分だけ入り、本人が足し引きできる */
function HeroTeamInput({
  id,
  label,
  max,
  value,
  exclude,
  heroes,
  ai,
  onChange,
}: {
  id: string;
  label: string;
  max: number;
  value: string[];
  exclude?: string;
  heroes: HeroSummary[];
  ai: boolean;
  onChange: (next: string[]) => void;
}) {
  const options = heroes.filter((h) => !value.includes(h.slug) && h.slug !== exclude);
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}(任意・{max}体まで)
        {ai && <AiMark />}
      </label>
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((slug) => {
          const name = getHeroBySlug(slug)?.name ?? slug;
          return (
            <span
              key={slug}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border py-1 pl-2.5 pr-1 text-xs font-semibold",
                ai ? "border-primary/50 bg-primary/10" : "border-border bg-surface"
              )}
            >
              {name}
              <button
                type="button"
                onClick={() => onChange(value.filter((s) => s !== slug))}
                aria-label={`${name}を外す`}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
              >
                <X size={12} />
              </button>
            </span>
          );
        })}
        {value.length < max && (
          <select
            id={id}
            value=""
            onChange={(e) => e.target.value && onChange([...value, e.target.value])}
            className="cursor-pointer rounded-lg border border-dashed border-border bg-surface px-2 py-1 text-xs text-text-muted outline-none focus:border-primary/60"
          >
            <option value="">＋ 追加</option>
            {options.map((hero) => (
              <option key={hero.slug} value={hero.slug}>
                {hero.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

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
  const [form, setForm] = useState<FormState>({
    heroSlug: heroes[0].slug,
    lane: "",
    result: "defeat",
    kills: "3",
    deaths: "5",
    assists: "6",
    durationMinutes: "15",
    gold: "",
    allyHeroes: [],
    enemyHeroes: [],
    notes: "",
  });
  /** AIが入れた値。本人が触ったら外す */
  const [aiFilled, setAiFilled] = useState<Set<FieldKey>>(new Set());
  /** 読み取れず空欄にした項目。埋まるまで目印を付ける */
  const [unreadable, setUnreadable] = useState<Set<FieldKey>>(new Set());
  /** 本人が手で入れた項目。読み取れなかったときに、その値を消さない */
  const [edited, setEdited] = useState<Set<keyof FormState>>(new Set());

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setEdited((s) => new Set(s).add(key));
    setAiFilled((s) => {
      const next = new Set(s);
      next.delete(key as FieldKey);
      return next;
    });
  };

  function applyParsed({ fields, unreadable: missed }: ScreenshotParseResponse) {
    // 読めた値は入れ替える。読めなかった値は空欄にする(本人が手で入れていた値は残す)
    setForm((prev) => {
      const keep = <K extends keyof FormState>(key: K, blank: FormState[K]) =>
        edited.has(key) ? prev[key] : blank;
      const num = (key: NumberKey) => (fields[key] !== null ? String(fields[key]) : keep(key, ""));
      return {
        ...prev,
        heroSlug: fields.heroSlug ?? keep("heroSlug", ""),
        result: fields.result ?? keep("result", null),
        kills: num("kills"),
        deaths: num("deaths"),
        assists: num("assists"),
        durationMinutes: num("durationMinutes"),
        gold: num("gold"),
        // 構成は画面に名前が書かれていないことが多い。読めなかったときは今の入力を残す
        allyHeroes: fields.allyHeroes.length > 0 ? fields.allyHeroes : prev.allyHeroes,
        enemyHeroes: fields.enemyHeroes.length > 0 ? fields.enemyHeroes : prev.enemyHeroes,
      };
    });
    setAiFilled(
      new Set(
        (Object.keys(fields) as FieldKey[]).filter((key) => {
          const value = fields[key];
          return Array.isArray(value) ? value.length > 0 : value !== null;
        })
      )
    );
    setUnreadable(new Set(missed));
    setError(null);
  }

  /** 読み取れずに空欄のままの項目 */
  const needsInput = (key: FieldKey) => unreadable.has(key) && (form[key] === "" || form[key] === null);
  const fieldClass = (key: FieldKey) =>
    cn(
      inputClass,
      aiFilled.has(key) && "border-primary/50 bg-primary/5",
      needsInput(key) && "border-gold/60"
    );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const missing = [
      !form.heroSlug && "使用ヒーロー",
      !form.result && "試合結果",
      ...NUMBER_FIELDS.filter((f) => form[f.key] === "").map((f) => f.label),
    ].filter(Boolean);
    if (missing.length > 0) {
      setError(`未入力の項目があります: ${missing.join("・")}`);
      return;
    }

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
          kills: Number(form.kills),
          deaths: Number(form.deaths),
          assists: Number(form.assists),
          durationMinutes: Number(form.durationMinutes),
          gold: form.gold === "" ? undefined : Number(form.gold),
          notes: form.notes.trim() || undefined,
          enemyHeroes: form.enemyHeroes,
          allyHeroes: form.allyHeroes.filter((slug) => slug !== form.heroSlug),
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
            : response.status === 503
              ? "現在一時的に分析できません。時間をおいてもう一度お試しください。"
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

      <div className="mt-4">
        <ScreenshotImport onParsed={applyParsed} />
      </div>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="hero">
              使用ヒーロー
              {aiFilled.has("heroSlug") && <AiMark />}
            </label>
            <select
              id="hero"
              value={form.heroSlug}
              onChange={(e) => set("heroSlug", e.target.value)}
              className={cn(fieldClass("heroSlug"), "cursor-pointer")}
            >
              <option value="" disabled>
                選択してください
              </option>
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
          <span className={labelClass}>
            試合結果
            {aiFilled.has("result") && <AiMark />}
          </span>
          <div className={cn("flex gap-2 rounded-xl", needsInput("result") && "ring-1 ring-gold/60")}>
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
          {NUMBER_FIELDS.map(({ key, label, min, max }) => (
            <div key={key}>
              <label className={labelClass} htmlFor={key}>
                {label}
                {aiFilled.has(key) && <AiMark />}
              </label>
              <input
                id={key}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                aria-invalid={needsInput(key) || undefined}
                className={fieldClass(key)}
              />
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="gold">
              獲得ゴールド(任意)
              {aiFilled.has("gold") && <AiMark />}
            </label>
            <input
              id="gold"
              type="number"
              inputMode="numeric"
              min={0}
              max={60000}
              value={form.gold}
              onChange={(e) => set("gold", e.target.value)}
              placeholder="例: 9800"
              className={fieldClass("gold")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <HeroTeamInput
            id="allies"
            label="味方ヒーロー"
            max={4}
            value={form.allyHeroes}
            exclude={form.heroSlug}
            heroes={heroes}
            ai={aiFilled.has("allyHeroes")}
            onChange={(next) => set("allyHeroes", next)}
          />
          <HeroTeamInput
            id="enemies"
            label="敵ヒーロー"
            max={5}
            value={form.enemyHeroes}
            heroes={heroes}
            ai={aiFilled.has("enemyHeroes")}
            onChange={(next) => set("enemyHeroes", next)}
          />
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

        {unreadable.size > 0 && [...unreadable].some(needsInput) && (
          <p className="text-xs text-gold">
            枠が黄色の項目はスクショから読み取れませんでした:{" "}
            {[...unreadable].filter(needsInput).map((key) => PARSED_FIELD_LABEL[key]).join("・")}
          </p>
        )}

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
