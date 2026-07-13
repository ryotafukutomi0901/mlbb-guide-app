import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/AdSlot";
import { NewsExplorer } from "@/components/news/NewsExplorer";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "ニュース" };

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="ニュース"
        titleEn="News Feed"
        description="コラボ・新スキン・イベント・パッチ情報を最速でキャッチ。"
      />
      <NewsExplorer />
      <div className="mt-6">
        <AdSlot />
      </div>
    </div>
  );
}
