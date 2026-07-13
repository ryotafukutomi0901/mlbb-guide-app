import type { Metadata } from "next";
import { MatchHistory } from "@/components/analysis/MatchHistory";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMatchHistory, getPlayerProfile } from "@/repositories/matchRepository";

export const metadata: Metadata = { title: "試合分析" };

export default function AnalysisPage() {
  const profile = getPlayerProfile();
  const matches = getMatchHistory();
  const wins = matches.filter((m) => m.result === "victory").length;
  const avgKda =
    matches.reduce((acc, m) => acc + (m.kda[0] + m.kda[2]) / Math.max(1, m.kda[1]), 0) / matches.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="試合分析"
        titleEn="Match Analysis"
        description="直近の戦績を振り返り、AIコーチレポートへ。試合をタップするとスコアボードが開きます。"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "直近勝率", node: <CountUp value={(wins / matches.length) * 100} decimals={0} suffix="%" />, tone: "text-success" },
          { label: "平均KDA", node: <CountUp value={avgKda} decimals={2} />, tone: "text-neon" },
          { label: "シーズン勝率", node: <CountUp value={profile.winRate} decimals={1} suffix="%" />, tone: "text-primary" },
          { label: "総試合数", node: <CountUp value={profile.totalMatches} />, tone: "text-gold" },
        ].map((stat) => (
          <Card key={stat.label} className="py-4 text-center">
            <p className={`font-display text-2xl font-black ${stat.tone}`}>{stat.node}</p>
            <p className="mt-1 text-[10px] text-text-faint">{stat.label}</p>
          </Card>
        ))}
      </div>

      <MatchHistory />
    </div>
  );
}
