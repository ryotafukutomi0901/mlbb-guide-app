import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { PageHeader } from "@/components/ui/PageHeader";
import { PATCH_CHANGE_LABEL, type PatchChange } from "@/data/types";
import { getPatchNotes } from "@/repositories/contentRepository";
import { getHeroBySlug } from "@/repositories/heroRepository";

export const metadata: Metadata = { title: "パッチノート" };

const CHANGE_BADGE: Record<PatchChange["type"], "success" | "danger" | "warning" | "neon" | "primary"> = {
  buff: "success",
  nerf: "danger",
  adjust: "warning",
  new: "neon",
  rework: "primary",
};

export default function PatchesPage() {
  const patches = getPatchNotes();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="パッチノート"
        titleEn="Patch Notes"
        description="バランス調整の履歴を時系列で。強化・弱体の流れからメタの行き先を読もう。"
      />

      <div className="relative flex flex-col gap-6 before:absolute before:inset-y-2 before:left-[7px] before:hidden before:w-px before:bg-border md:before:block">
        {patches.map((patch, index) => (
          <div key={patch.version} className="relative md:pl-8">
            <span
              className={`absolute left-0 top-6 hidden h-3.5 w-3.5 rounded-full border-2 border-bg md:block ${
                index === 0 ? "gradient-primary shadow-[0_0_10px_rgba(139,92,246,0.7)]" : "bg-surface-hover"
              }`}
            />
            <Card accent={index === 0}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-lg font-black text-gradient-primary">
                  v{patch.version}
                </span>
                <span className="font-display text-xs text-text-faint">{patch.date}</span>
                {index === 0 && <Badge variant="gold">最新</Badge>}
              </div>
              <h2 className="mt-1 font-bold">{patch.title}</h2>

              <ul className="mt-3 flex flex-wrap gap-2">
                {patch.highlights.map((highlight) => (
                  <li key={highlight}>
                    <Badge variant="primary">{highlight}</Badge>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-3">
                {patch.changes.map((change) => {
                  const hero = change.kind === "hero" && change.targetSlug ? getHeroBySlug(change.targetSlug) : undefined;
                  return (
                    <div
                      key={`${patch.version}:${change.target}`}
                      className="rounded-xl border border-border/60 bg-surface-2/50 p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        {hero && (
                          <Link href={`/characters/${hero.slug}`}>
                            <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="sm" />
                          </Link>
                        )}
                        <p className="flex-1 truncate text-sm font-semibold">{change.target}</p>
                        <Badge variant={CHANGE_BADGE[change.type]}>{PATCH_CHANGE_LABEL[change.type]}</Badge>
                      </div>
                      <ul className="mt-2 flex flex-col gap-1 text-xs text-text-muted">
                        {change.notes.map((note) => (
                          <li key={note} className="flex gap-2">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
