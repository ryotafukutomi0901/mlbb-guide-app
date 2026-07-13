import type { Metadata } from "next";
import { GachaSimulator } from "@/components/gacha/GachaSimulator";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "ガチャシミュレーター" };

export default function GachaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="ガチャシミュレーター"
        titleEn="Gacha Simulator"
        description="実際の提供割合でガチャを試し、天井までの期待コストを体感しよう。"
      />
      <GachaSimulator />
    </div>
  );
}
