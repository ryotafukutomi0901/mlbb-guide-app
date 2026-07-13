import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ROLE_LABEL } from "@/data/types";
import { getEmblems } from "@/repositories/contentRepository";

export const metadata: Metadata = { title: "エンブレム" };

export default function EmblemsPage() {
  const emblems = getEmblems();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="エンブレム"
        titleEn="Emblem System"
        description="ロールごとの基礎ステータスと3段階タレントを確認して、最適なセットアップを組もう。"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {emblems.map((emblem) => (
          <Card key={emblem.slug} interactive className="p-5">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl border font-display text-sm font-black"
                style={{
                  color: emblem.color,
                  borderColor: `${emblem.color}55`,
                  backgroundColor: `${emblem.color}14`,
                  boxShadow: `0 0 18px ${emblem.color}33`,
                }}
              >
                {emblem.nameEn.slice(0, 1)}
              </span>
              <div>
                <h2 className="font-bold">{emblem.name}</h2>
                <div className="mt-1 flex gap-1.5">
                  {emblem.bestFor.map((role) => (
                    <Badge key={role}>{ROLE_LABEL[role]}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-neon">{emblem.stats.join(" / ")}</p>

            <div className="mt-4 flex flex-col gap-2">
              {emblem.talents.map((talent) => (
                <div key={talent.name} className="rounded-xl border border-border/60 bg-surface-2/50 p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-display text-[10px] font-bold"
                      style={{ color: emblem.color }}
                    >
                      TIER {talent.tier}
                    </span>
                    <p className="text-sm font-semibold">{talent.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{talent.description}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
