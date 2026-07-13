import type { Metadata } from "next";
import { ItemExplorer } from "@/components/item/ItemExplorer";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "アイテム図鑑" };

export default function ItemsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="アイテム図鑑"
        titleEn="Item Encyclopedia"
        description="価格・ステータス・パッシブ・派生ツリーを網羅。カードをクリックすると詳細を表示します。"
      />
      <ItemExplorer />
    </div>
  );
}
