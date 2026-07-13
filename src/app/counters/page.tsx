import type { Metadata } from "next";
import { CounterExplorer } from "@/components/meta/CounterExplorer";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "カウンター一覧" };

export default function CountersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="カウンター一覧"
        titleEn="Counter Picks"
        description="ヒーローを選ぶと、有利対面・不利対面・シナジーを一目で確認できます。ドラフト中のチェックに。"
      />
      <CounterExplorer />
    </div>
  );
}
