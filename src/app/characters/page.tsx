import type { Metadata } from "next";
import { CharacterExplorer } from "@/components/hero/CharacterExplorer";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "ヒーロー一覧" };

export default async function CharactersPage(props: PageProps<"/characters">) {
  const { role } = await props.searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="ヒーロー一覧"
        titleEn="Hero Roster"
        description="全ヒーローのTier・勝率・ロールをチェックして、次にピックする1体を見つけよう。"
      />
      <CharacterExplorer initialRole={typeof role === "string" ? role : undefined} />
    </div>
  );
}
