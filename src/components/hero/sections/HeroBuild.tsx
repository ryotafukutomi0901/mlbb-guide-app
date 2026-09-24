import Link from "next/link";
import { ArrowRight, Shield, Swords, Zap } from "lucide-react";
import { CoachCTA } from "@/components/coach/CoachCTA";
import { ItemIcon } from "@/components/item/ItemIcon";
import { Card } from "@/components/ui/Card";
import { DataBadge, DataPending } from "@/components/ui/DataBadge";
import { EmblemIcon } from "@/components/ui/EmblemIcon";
import { ITEM_CATEGORY_LABEL, type HeroDetail } from "@/data/types";
import { getBattleSpellBySlug, getEmblemBySlug, getLatestPatch } from "@/repositories/contentRepository";
import { resolveItems } from "@/repositories/itemRepository";

export function HeroBuild({ hero }: { hero: HeroDetail }) {
  const buildItems = resolveItems(hero.recommendedBuild);
  const emblem = hero.recommendedEmblem ? getEmblemBySlug(hero.recommendedEmblem) : undefined;
  const spells = (hero.recommendedSpells ?? [])
    .map(getBattleSpellBySlug)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const patch = getLatestPatch();
  const totalPrice = buildItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="flex flex-col gap-4">
      <Card accent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold">標準ビルド(推奨購入順)</h2>
          <span className="font-display text-xs font-bold text-gold">
            合計 {totalPrice.toLocaleString()}G
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {buildItems.map((item, i) => (
            <div key={item.slug} className="flex items-center gap-1.5">
              <Link
                href="/compendium/items"
                className="flex w-[74px] flex-col items-center gap-1 rounded-xl border border-border bg-surface-2 p-2 transition-colors hover:border-primary/50"
                title={item.passive}
              >
                <ItemIcon slug={item.slug} name={item.name} size={40} />
                <span className="w-full truncate text-center text-[10px] text-text-muted">
                  {item.name}
                </span>
              </Link>
              {i < buildItems.length - 1 && <ArrowRight size={12} className="text-text-faint" />}
            </div>
          ))}
        </div>
        <Link
          href={`/simulator?hero=${hero.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
        >
          <Swords size={14} />
          このビルドをシミュレーターで試す
        </Link>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-bold">各装備を積む理由</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {buildItems.map((item, i) => (
            <Card key={item.slug} className="flex gap-3">
              <div className="relative shrink-0">
                <ItemIcon slug={item.slug} name={item.name} />
                <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full gradient-primary font-display text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-semibold">{item.name}</h3>
                  <span className="shrink-0 font-display text-xs font-bold text-gold">
                    {item.price.toLocaleString()}G
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-text-faint">
                  {ITEM_CATEGORY_LABEL[item.category]}
                </p>
                <p className="mt-1 text-xs text-text-muted">{item.stats.join(" / ")}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-text-faint">{item.passive}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
            <Shield size={14} className="text-primary" />
            エンブレム
          </h2>
          {emblem ? (
            <div>
              <div className="flex items-center gap-2.5">
                <EmblemIcon
                  slug={emblem.slug}
                  name={emblem.name}
                  nameEn={emblem.nameEn}
                  color={emblem.color}
                  size={36}
                />
                <p className="font-semibold" style={{ color: emblem.color }}>
                  {emblem.name}
                </p>
              </div>
              <p className="mt-1 text-xs text-text-muted">{emblem.stats.join(" / ")}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {emblem.talents.map((t) => (
                  <li key={t.name} className="text-xs text-text-faint">
                    <span className="font-semibold text-text-muted">{t.name}</span> — {t.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <DataPending what="エンブレムの推奨データ" />
          )}
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
            <Zap size={14} className="text-gold" />
            バトルスペル
          </h2>
          {spells.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {spells.map((s) => (
                <li key={s.slug}>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{s.effectSummary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <DataPending what="バトルスペルの推奨データ" />
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-bold">状況別ビルド</h2>
        <DataPending what="敵構成・ランク帯に応じた分岐ビルド" />
        <p className="mt-2 text-xs text-text-faint">
          今の試合の敵構成に合わせた組み替えは、AIコーチが個別に提案します。
        </p>
      </Card>

      <DataBadge patch={patch.version} updatedAt={patch.date} />
      <CoachCTA heroName={hero.name} />
    </div>
  );
}
