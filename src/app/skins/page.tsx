import type { Metadata } from "next";
import { SkinExplorer } from "@/components/skin/SkinExplorer";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "スキン一覧" };

export default function SkinsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="スキン一覧"
        titleEn="Skin Vault"
        description="レアリティ別にスキンをコレクション。所持状況もここで管理。"
      />
      <SkinExplorer />
    </div>
  );
}
