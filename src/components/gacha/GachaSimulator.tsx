"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gem, RotateCcw, Sparkles } from "lucide-react";
import { RARITY_BORDER, RARITY_TEXT } from "@/components/skin/skinStyle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SKIN_RARITY_LABEL, type GachaPool, type SkinRarity } from "@/data/types";
import { getGachaPools } from "@/repositories/contentRepository";
import { getSkinBySlug } from "@/repositories/skinRepository";
import { cn } from "@/lib/utils";

interface PullResult {
  id: number;
  rarity: SkinRarity;
  label: string;
  isFeatured: boolean;
}

const FALLBACK_LABEL: Record<SkinRarity, string[]> = {
  basic: ["スキンかけら x5"],
  elite: ["エリートスキン選択かけら", "レアボーダー"],
  special: ["スペシャルスキンかけら", "エモート「ナイス！」", "リコールエフェクト"],
  epic: ["エピックスキンかけら x20", "限定ボーダー「星海」"],
  legend: ["レジェンド演出チケット"],
  collector: ["コレクター保証ポイント"],
  collab: ["コラボ限定通貨 x10"],
};

let pullSeq = 0;

function rollRarity(pool: GachaPool): SkinRarity {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const { rarity, rate } of pool.rates) {
    acc += rate;
    if (roll < acc) return rarity;
  }
  return pool.rates[pool.rates.length - 1].rarity;
}

function rollResult(pool: GachaPool, pity: number): PullResult {
  const topRarity = pool.rates[0].rarity;
  const hitPity = pity + 1 >= pool.pity;
  const rarity = hitPity ? topRarity : rollRarity(pool);
  const isTop = rarity === topRarity;
  const featuredSkin = isTop
    ? getSkinBySlug(pool.featured[Math.floor(Math.random() * pool.featured.length)])
    : undefined;
  const fallbacks = FALLBACK_LABEL[rarity];
  return {
    id: pullSeq++,
    rarity,
    label: featuredSkin ? featuredSkin.name : fallbacks[Math.floor(Math.random() * fallbacks.length)],
    isFeatured: Boolean(featuredSkin),
  };
}

export function GachaSimulator() {
  const pools = getGachaPools();
  const [poolSlug, setPoolSlug] = useState(pools[0].slug);
  const pool = pools.find((p) => p.slug === poolSlug) ?? pools[0];

  const [results, setResults] = useState<PullResult[]>([]);
  const [spent, setSpent] = useState(0);
  const [pity, setPity] = useState(0);
  const [totalPulls, setTotalPulls] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);

  const topRarity = pool.rates[0].rarity;

  const stats = useMemo(() => {
    const counts = new Map<SkinRarity, number>();
    for (const r of results) counts.set(r.rarity, (counts.get(r.rarity) ?? 0) + 1);
    return counts;
  }, [results]);

  function pull(count: 1 | 10) {
    if (rolling) return;
    const cost = count === 1 ? pool.costSingle : pool.costTen;
    const newResults: PullResult[] = [];
    let currentPity = pity;
    for (let i = 0; i < count; i++) {
      const result = rollResult(pool, currentPity);
      currentPity = result.rarity === topRarity ? 0 : currentPity + 1;
      newResults.push(result);
    }
    setSpent((s) => s + cost);
    setTotalPulls((t) => t + count);
    setPity(currentPity);
    setResults(newResults);
    if (!skipAnimation) {
      setRolling(true);
      window.setTimeout(() => setRolling(false), 900);
    }
  }

  function reset() {
    setResults([]);
    setSpent(0);
    setPity(0);
    setTotalPulls(0);
    setRolling(false);
  }

  function selectPool(slug: string) {
    setPoolSlug(slug);
    reset();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="flex flex-col gap-4 lg:col-span-3">
        <div className="flex gap-2">
          {pools.map((p) => (
            <button
              key={p.slug}
              onClick={() => selectPool(p.slug)}
              className={cn(
                "flex-1 cursor-pointer rounded-xl border p-3 text-left text-xs font-bold transition-all duration-200",
                p.slug === poolSlug
                  ? "border-primary/60 bg-primary/15 text-white shadow-[0_0_18px_rgba(139,92,246,0.25)]"
                  : "glass text-text-muted hover:border-border-bright"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        <Card accent className="relative overflow-hidden p-6 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="animate-aurora absolute -top-1/2 left-1/2 h-[120%] w-[120%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative">
            <h2 className="font-display text-sm font-bold tracking-widest text-gradient-primary">
              {pool.name}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs text-text-muted">{pool.bannerText}</p>
            <p className="mt-1 font-display text-[10px] text-text-faint">開催期限 {pool.endsAt}</p>

            <div className="relative mx-auto mt-6 flex h-40 items-center justify-center">
              <AnimatePresence mode="wait">
                {rolling ? (
                  <motion.div
                    key="rolling"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [0.8, 1.15, 1], opacity: 1, rotate: [0, 8, -8, 0] }}
                    exit={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-primary/60 bg-primary/15 shadow-[0_0_48px_rgba(139,92,246,0.6)]"
                  >
                    <Sparkles size={44} className="animate-pulse-glow text-gold" />
                  </motion.div>
                ) : results.length > 0 ? (
                  <motion.div
                    key={`results-${results[0].id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "grid w-full gap-1.5",
                      results.length === 1 ? "mx-auto max-w-56 grid-cols-1" : "grid-cols-5"
                    )}
                  >
                    {results.map((result, i) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 16, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: skipAnimation ? 0 : i * 0.06, duration: 0.3 }}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-xl border bg-surface-2/80 px-1 py-2.5",
                          RARITY_BORDER[result.rarity],
                          result.isFeatured && "shadow-[0_0_20px_rgba(240,180,41,0.4)]"
                        )}
                      >
                        <span
                          className={cn(
                            "font-display text-[8px] font-bold uppercase tracking-wider",
                            RARITY_TEXT[result.rarity]
                          )}
                        >
                          {SKIN_RARITY_LABEL[result.rarity]}
                        </span>
                        <span className="mt-1 line-clamp-2 px-0.5 text-center text-[9px] font-semibold leading-tight">
                          {result.label}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-text-faint"
                  >
                    ガチャを引くと結果がここに表示されます
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => pull(1)} disabled={rolling} variant="secondary" size="lg">
                <Gem size={15} className="text-neon" />
                1回引く {pool.costSingle}
              </Button>
              <Button onClick={() => pull(10)} disabled={rolling} variant="gold" size="lg">
                <Gem size={15} />
                10回引く {pool.costTen}
              </Button>
            </div>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-[11px] text-text-muted">
              <input
                type="checkbox"
                checked={skipAnimation}
                onChange={(e) => setSkipAnimation(e.target.checked)}
                className="accent-[#8b5cf6]"
              />
              演出をスキップする
            </label>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card>
          <h3 className="mb-3 text-sm font-bold">シミュレーション結果</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-border/60 bg-surface-2/50 p-3">
              <p className="font-display text-xl font-black text-neon">{totalPulls}</p>
              <p className="text-[10px] text-text-faint">累計回数</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-surface-2/50 p-3">
              <p className="font-display text-xl font-black text-gold">{spent.toLocaleString()}</p>
              <p className="text-[10px] text-text-faint">消費ダイヤ</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-surface-2/50 p-3">
              <p className="font-display text-xl font-black text-primary">
                {pity}<span className="text-xs text-text-faint">/{pool.pity}</span>
              </p>
              <p className="text-[10px] text-text-faint">天井まで</p>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${(pity / pool.pity) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-text-faint">
            {pool.pity}回以内に最高レアリティが確定します。
          </p>

          <Button variant="ghost" size="sm" onClick={reset} className="mt-3">
            <RotateCcw size={13} />
            結果をリセット
          </Button>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-bold">提供割合</h3>
          <div className="flex flex-col gap-2">
            {pool.rates.map(({ rarity, rate }) => (
              <div key={rarity} className="flex items-center justify-between text-xs">
                <span className={cn("font-semibold", RARITY_TEXT[rarity])}>
                  {SKIN_RARITY_LABEL[rarity]}
                </span>
                <span className="flex items-center gap-2">
                  {stats.get(rarity) && <Badge variant="primary">{stats.get(rarity)}回</Badge>}
                  <span className="font-display font-bold">{rate.toFixed(2)}%</span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-bold">ピックアップ</h3>
          <div className="flex flex-col gap-2">
            {pool.featured.map((slug) => {
              const skin = getSkinBySlug(slug);
              if (!skin) return null;
              return (
                <div key={slug} className="flex items-center justify-between gap-2 rounded-xl border border-gold/30 bg-gold/5 px-3 py-2">
                  <span className="truncate text-xs font-semibold">{skin.name}</span>
                  <span className={cn("shrink-0 font-display text-[9px] font-bold uppercase", RARITY_TEXT[skin.rarity])}>
                    {SKIN_RARITY_LABEL[skin.rarity]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-text-faint">
            ※ これはシミュレーターです。実際のゲーム内ガチャの結果を保証するものではありません。
          </p>
        </Card>
      </div>
    </div>
  );
}
