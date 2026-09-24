import Link from "next/link";
import { CoachCTA } from "@/components/coach/CoachCTA";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { TierBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataBadge, DataPending } from "@/components/ui/DataBadge";
import { COUNTER_FACTOR_LABEL, type HeroDetail } from "@/data/types";
import { getLatestPatch } from "@/repositories/contentRepository";
import { getMatchups } from "@/repositories/heroRepository";
import { cn } from "@/lib/utils";

export function HeroCounters({ hero }: { hero: HeroDetail }) {
  const matchups = getMatchups(hero.slug);
  const patch = getLatestPatch();

  if (!matchups) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <DataPending what={`${hero.name}の相性データ`} />
        </Card>
        <CoachCTA heroName={hero.name} />
      </div>
    );
  }

  const sections = [
    {
      title: "有利な相手",
      subtitle: `${hero.name}が対面で勝ちやすい相手と、その理由`,
      edges: matchups.counters,
      tone: "text-success",
    },
    {
      title: "不利な相手",
      subtitle: `${hero.name}が対面で苦しい相手と、その理由`,
      edges: matchups.counteredBy,
      tone: "text-danger",
    },
    {
      title: "相性の良い味方",
      subtitle: `${hero.name}と組ませたい味方と、その理由`,
      edges: matchups.synergies,
      tone: "text-neon",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title}>
            <h2 className={cn("text-sm font-bold", section.tone)}>{section.title}</h2>
            <p className="mb-3 text-xs text-text-faint">{section.subtitle}</p>
            <div className="flex flex-col gap-2.5">
              {section.edges.map((e) => (
                <div key={e.slug} className="rounded-xl border border-border/60 bg-surface-2/40 p-2.5">
                  <div className="flex items-center gap-2.5">
                    <HeroAvatar
                      name={e.hero.name}
                      role={e.hero.roles[0]}
                      slug={e.hero.slug}
                      size="sm"
                    />
                    <Link
                      href={`/heroes/${e.hero.slug}`}
                      className="flex-1 truncate text-sm font-medium transition-colors hover:text-primary"
                    >
                      {e.hero.name}
                    </Link>
                    <TierBadge tier={e.hero.tier} />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-text-muted">{e.reason}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {e.factors.map((f) => (
                      <span
                        key={f}
                        className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[9px] text-text-faint"
                      >
                        {COUNTER_FACTOR_LABEL[f]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <DataBadge patch={patch.version} updatedAt={patch.date} />
      <CoachCTA heroName={hero.name} />
    </div>
  );
}
