import type { Metadata } from "next";
import { MetaRankingTable } from "@/components/meta/MetaRankingTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLatestPatch } from "@/repositories/contentRepository";

export const metadata: Metadata = { title: "Metaランキング" };

export default function MetaPage() {
  const patch = getLatestPatch();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="Metaランキング"
        titleEn="Meta Ranking"
        description={`パッチ${patch.version}のランク戦統計。勝率・ピック率・バン率・上昇率で今の環境を読み解こう。`}
      />
      <MetaRankingTable />
    </div>
  );
}
