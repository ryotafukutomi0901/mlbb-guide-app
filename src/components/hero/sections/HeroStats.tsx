import Link from "next/link";
import { CoachCTA } from "@/components/coach/CoachCTA";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatBar } from "@/components/ui/StatBar";
import { SKIN_RARITY_LABEL, type HeroDetail, type Skin } from "@/data/types";
import { getSkinsForHero } from "@/repositories/skinRepository";
import { cn } from "@/lib/utils";

const RARITY_COLOR: Record<Skin["rarity"], string> = {
  basic: "text-text-muted",
  elite: "text-primary-2",
  special: "text-neon",
  epic: "text-primary",
  legend: "text-gold",
  collector: "text-ember",
  collab: "text-danger",
};

export function HeroStats({ hero }: { hero: HeroDetail }) {
  const latestStat = hero.stats[hero.stats.length - 1];
  const skins = getSkinsForHero(hero.slug);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2 className="mb-4 text-sm font-bold">Lv.{latestStat.level} ステータス</h2>
        <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          <StatBar label="HP" value={latestStat.hp} max={9000} displayValue={String(latestStat.hp)} color="success" />
          <StatBar label="物理攻撃" value={latestStat.physAtk} max={320} displayValue={String(latestStat.physAtk || "-")} color="danger" />
          <StatBar label="魔法攻撃" value={latestStat.magicPower} max={320} displayValue={String(latestStat.magicPower || "-")} color="neon" />
          <StatBar label="物理防御" value={latestStat.physDef} max={120} displayValue={String(latestStat.physDef)} />
          <StatBar label="魔法防御" value={latestStat.magicDef} max={120} displayValue={String(latestStat.magicDef)} />
          <StatBar label="攻撃速度" value={latestStat.atkSpeed * 100} max={160} displayValue={latestStat.atkSpeed.toFixed(2)} color="gold" />
          <StatBar label="移動速度" value={latestStat.moveSpeed} max={300} displayValue={String(latestStat.moveSpeed)} color="gold" />
          <StatBar label="HP回復" value={latestStat.hpRegen} max={25} displayValue={latestStat.hpRegen.toFixed(1)} color="success" />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold">レベル別成長</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="py-2 pr-4 font-medium">レベル</th>
                <th className="py-2 pr-4 font-medium">HP</th>
                <th className="py-2 pr-4 font-medium">物理攻撃</th>
                <th className="py-2 pr-4 font-medium">魔法攻撃</th>
                <th className="py-2 pr-4 font-medium">物理防御</th>
                <th className="py-2 pr-4 font-medium">魔法防御</th>
                <th className="py-2 pr-4 font-medium">攻撃速度</th>
                <th className="py-2 pr-4 font-medium">移動速度</th>
              </tr>
            </thead>
            <tbody>
              {hero.stats.map((s) => (
                <tr key={s.level} className="border-b border-border/40 transition-colors hover:bg-surface-hover/40">
                  <td className="py-2.5 pr-4 font-display font-bold text-primary">Lv.{s.level}</td>
                  <td className="py-2.5 pr-4">{s.hp.toLocaleString()}</td>
                  <td className="py-2.5 pr-4">{s.physAtk || "-"}</td>
                  <td className="py-2.5 pr-4">{s.magicPower || "-"}</td>
                  <td className="py-2.5 pr-4">{s.physDef}</td>
                  <td className="py-2.5 pr-4">{s.magicDef}</td>
                  <td className="py-2.5 pr-4">{s.atkSpeed.toFixed(2)}</td>
                  <td className="py-2.5 pr-4">{s.moveSpeed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {skins.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-bold">スキン</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skins.map((skin) => (
              <Link key={skin.slug} href={`/skins/${skin.slug}`}>
                <Card interactive className="h-full">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs font-bold uppercase tracking-wider", RARITY_COLOR[skin.rarity])}>
                      {SKIN_RARITY_LABEL[skin.rarity]}
                    </p>
                    {skin.owned && <Badge variant="success">所持</Badge>}
                  </div>
                  <p className="mt-1 font-semibold">{skin.name}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-text-muted">{skin.description}</p>
                  <p className="mt-2 text-xs font-medium text-gold">{skin.price}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <CoachCTA heroName={hero.name} />
    </div>
  );
}
