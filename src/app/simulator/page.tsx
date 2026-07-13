import type { Metadata } from "next";
import { BuildSimulator } from "@/components/simulator/BuildSimulator";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "ビルドシミュレーター" };

export default async function SimulatorPage(props: PageProps<"/simulator">) {
  const { hero } = await props.searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="ビルドシミュレーター"
        titleEn="Build Simulator"
        description="レベル・装備・エンブレムを組み合わせて、最終ステータスをリアルタイムに計算。"
      />
      <BuildSimulator initialHeroSlug={typeof hero === "string" ? hero : undefined} />
    </div>
  );
}
