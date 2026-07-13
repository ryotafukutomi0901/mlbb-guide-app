import type { Metadata } from "next";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "検索" };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="検索"
        titleEn="Search"
        description="プラットフォーム全体を横断検索。すべての機能への入り口です。"
      />
      <GlobalSearch />
    </div>
  );
}
