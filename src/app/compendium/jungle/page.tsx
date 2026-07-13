import type { Metadata } from "next";
import { JungleExplorer } from "@/components/jungle/JungleExplorer";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "ジャングル図鑑・タイマー" };

export default function JunglePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="ジャングル図鑑・タイマー"
        titleEn="Jungle Intel"
        description="モンスターの出現サイクルを把握して、オブジェクトの主導権を握ろう。"
      />
      <JungleExplorer />
    </div>
  );
}
