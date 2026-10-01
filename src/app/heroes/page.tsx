import type { Metadata } from "next";
import { CharacterExplorer } from "@/components/hero/CharacterExplorer";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { alternateLanguages } from "@/i18n/config";

const DESCRIPTION =
  "MLBB(モバイルレジェンド)の全133ヒーローを一覧で。ロール・レーン・Tierで絞り込み、ビルドやカウンターをすぐ確認できます。";

export const metadata: Metadata = {
  title: "ヒーロー一覧",
  description: DESCRIPTION,
  alternates: { canonical: "/heroes", languages: alternateLanguages("/heroes") },
  openGraph: { title: "ヒーロー一覧 | MLBB LAB", description: DESCRIPTION, url: "/heroes" },
};

export default async function HeroesPage(props: PageProps<"/heroes">) {
  const { role, lane } = await props.searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "ホーム", path: "/" },
          { name: "ヒーロー一覧", path: "/heroes" },
        ])}
      />
      <PageHeader
        title="ヒーロー一覧"
        titleEn="Hero Roster"
        description="全133ヒーローのTier・勝率・ロール・レーンをチェックして、次にピックする1体を見つけよう。"
      />
      <CharacterExplorer
        initialRole={typeof role === "string" ? role : undefined}
        initialLane={typeof lane === "string" ? lane : undefined}
      />
    </div>
  );
}
