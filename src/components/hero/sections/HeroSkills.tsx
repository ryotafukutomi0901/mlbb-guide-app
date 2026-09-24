import Image from "next/image";
import { Clock, Droplet } from "lucide-react";
import { CoachCTA } from "@/components/coach/CoachCTA";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SKILL_SLOT_LABEL, type HeroDetail } from "@/data/types";
import { skillImage } from "@/lib/assets";

/**
 * 全スキルをHTMLに出力する(検索エンジンから見える形にするため、
 * 選択式ではなく一覧で表示する)。
 */
export function HeroSkills({ hero }: { hero: HeroDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {hero.skills.map((skill) => {
          const img = skillImage(hero.slug, skill.type);
          return (
            <Card key={skill.name} className="flex gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border">
                {img ? (
                  <Image
                    src={img}
                    alt={skill.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-2 font-display text-xs font-bold text-text-faint">
                    {skill.type === "passive"
                      ? "P"
                      : skill.type === "ultimate"
                        ? "ULT"
                        : skill.type.slice(-1)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary">{SKILL_SLOT_LABEL[skill.type]}</Badge>
                  {skill.tags?.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                </div>
                <h2 className="mt-1.5 text-base font-bold">{skill.name}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{skill.description}</p>
                {(skill.cooldown || skill.cost) && (
                  <div className="mt-3 flex flex-wrap gap-4 border-t border-border/60 pt-2.5 text-xs text-text-muted">
                    {skill.cooldown && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-neon" />
                        CD: {skill.cooldown.join(" / ")}秒
                      </span>
                    )}
                    {skill.cost && (
                      <span className="flex items-center gap-1.5">
                        <Droplet size={13} className="text-primary-2" />
                        消費: {skill.cost.join(" / ")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <CoachCTA heroName={hero.name} />
    </div>
  );
}
