"use client";

import { useState } from "react";
import { Bot, Upload } from "lucide-react";
import { CoachReportView } from "@/components/coach/CoachReportView";
import { HeroAvatar } from "@/components/hero/HeroAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getHeroBySlug } from "@/repositories/heroRepository";
import { getCoachReports, getMatchById } from "@/repositories/matchRepository";
import { cn } from "@/lib/utils";

export function CoachDashboard() {
  const reports = getCoachReports();
  const [matchId, setMatchId] = useState(reports[0].matchId);
  const report = reports.find((r) => r.matchId === matchId) ?? reports[0];
  const match = getMatchById(report.matchId);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="scrollbar-none flex flex-1 gap-2 overflow-x-auto">
          {reports.map((r) => {
            const m = getMatchById(r.matchId);
            const hero = m ? getHeroBySlug(m.heroSlug) : undefined;
            const active = r.matchId === matchId;
            return (
              <button
                key={r.matchId}
                onClick={() => setMatchId(r.matchId)}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200",
                  active
                    ? "border-primary/60 bg-primary/15 shadow-[0_0_16px_rgba(139,92,246,0.25)]"
                    : "glass hover:border-border-bright"
                )}
              >
                {hero && <HeroAvatar name={hero.name} role={hero.roles[0]} slug={hero.slug} size="sm" />}
                <span className="text-left">
                  <span className="block text-xs font-bold">{hero?.name}</span>
                  <span className="block font-display text-[9px] text-text-faint">{m?.playedAt}</span>
                </span>
                <Badge variant={m?.result === "victory" ? "success" : "danger"}>
                  {m?.result === "victory" ? "勝利" : "敗北"}
                </Badge>
              </button>
            );
          })}
        </div>
        <Button variant="secondary" size="sm" title="ダミー動作: 実際のアップロードはフェーズ2で対応">
          <Upload size={14} />
          動画をアップロード
        </Button>
        <Button size="sm" title="ダミー動作: 実際の解析はフェーズ2で対応">
          <Bot size={14} />
          新しい分析
        </Button>
      </div>

      <CoachReportView report={report} match={match} />
    </div>
  );
}
