import type { Metadata } from "next";
import { Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ROLE_LABEL } from "@/data/types";
import { getBattleSpells } from "@/repositories/contentRepository";

export const metadata: Metadata = { title: "バトルスペル" };

export default function SpellsPage() {
  const spells = getBattleSpells();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="バトルスペル"
        titleEn="Battle Spells"
        description="解放レベル・クールダウン・効果を一覧で比較して、構成に合う2枠を選ぼう。"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spells.map((spell) => (
          <Card key={spell.slug} interactive className="flex h-full flex-col p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 text-gold shadow-[0_0_16px_rgba(240,180,41,0.2)]">
                <Zap size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-bold">{spell.name}</h2>
                <p className="font-display text-[10px] uppercase tracking-wider text-text-faint">
                  {spell.nameEn}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-neon" />
                CD {spell.cooldown}秒
              </span>
              <span>解放 Lv.{spell.unlockLevel}</span>
            </div>

            <p className="mt-2 text-xs font-semibold text-neon">{spell.effectSummary}</p>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-text-muted">{spell.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-3">
              {spell.bestFor.map((role) => (
                <Badge key={role}>{ROLE_LABEL[role]}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
