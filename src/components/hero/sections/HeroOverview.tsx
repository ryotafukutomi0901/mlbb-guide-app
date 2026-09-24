import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { CoachCTA } from "@/components/coach/CoachCTA";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { RadarChart } from "@/components/hero/RadarChart";
import { ItemIcon } from "@/components/item/ItemIcon";
import { Card } from "@/components/ui/Card";
import { EmblemIcon } from "@/components/ui/EmblemIcon";
import type { HeroDetail } from "@/data/types";
import { RADAR_AXES, toRadarValues } from "@/lib/heroStats";
import { getBattleSpellBySlug, getEmblemBySlug } from "@/repositories/contentRepository";
import { getMatchups } from "@/repositories/heroRepository";
import { resolveItems } from "@/repositories/itemRepository";

export function HeroOverview({ hero }: { hero: HeroDetail }) {
  const latestStat = hero.stats[hero.stats.length - 1];
  const buildItems = resolveItems(hero.recommendedBuild);
  const emblem = hero.recommendedEmblem ? getEmblemBySlug(hero.recommendedEmblem) : undefined;
  const spells = (hero.recommendedSpells ?? [])
    .map(getBattleSpellBySlug)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const matchups = getMatchups(hero.slug);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-bold">
            ステータスバランス{" "}
            <span className="text-xs font-normal text-text-muted">(Lv.{latestStat.level})</span>
          </h2>
          <div className="flex justify-center">
            <RadarChart
              axes={RADAR_AXES}
              series={[{ name: hero.name, color: "#8b5cf6", values: toRadarValues(latestStat) }]}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-3 text-sm font-bold">おすすめビルド</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {buildItems.map((item, i) => (
                <div key={item.slug} className="flex items-center gap-1.5">
                  <div
                    className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface-2 p-2 transition-colors hover:border-primary/50"
                    title={`${item.name} — ${item.passive}`}
                  >
                    <ItemIcon slug={item.slug} name={item.name} size={40} />
                    <span className="max-w-14 truncate text-[10px] text-text-muted">{item.name}</span>
                  </div>
                  {i < buildItems.length - 1 && <ArrowRight size={12} className="text-text-faint" />}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <Link
                href={`/heroes/${hero.slug}/build`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-neon"
              >
                ビルドの詳細を見る
                <ArrowRight size={12} />
              </Link>
              <Link
                href={`/simulator?hero=${hero.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-neon"
              >
                ビルドシミュレーターで試す
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-bold">推奨セットアップ</h2>
            <div className="flex flex-col gap-2.5 text-sm">
              {emblem && (
                <div className="flex items-center gap-2">
                  <EmblemIcon
                    slug={emblem.slug}
                    name={emblem.name}
                    nameEn={emblem.nameEn}
                    color={emblem.color}
                    size={22}
                    className="rounded-lg"
                  />
                  <span className="text-text-muted">エンブレム:</span>
                  <Link href="/compendium/emblems" className="font-semibold hover:text-primary">
                    {emblem.name}
                  </Link>
                </div>
              )}
              {spells.length > 0 && (
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-gold" />
                  <span className="text-text-muted">バトルスペル:</span>
                  <span className="font-semibold">{spells.map((s) => s.name).join(" / ")}</span>
                </div>
              )}
              {matchups && matchups.synergies.length > 0 && (
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-neon" />
                  <span className="text-text-muted">シナジー:</span>
                  <div className="flex items-center gap-1">
                    {matchups.synergies.slice(0, 3).map((e) => (
                      <Link
                        key={e.slug}
                        href={`/heroes/${e.slug}`}
                        title={`${e.hero.name} — ${e.reason}`}
                      >
                        <HeroAvatar
                          name={e.hero.name}
                          role={e.hero.roles[0]}
                          slug={e.hero.slug}
                          size="sm"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-bold">ストーリー</h2>
        <p className="leading-loose text-text-muted">{hero.story}</p>
      </Card>

      <CoachCTA heroName={hero.name} />
    </div>
  );
}
