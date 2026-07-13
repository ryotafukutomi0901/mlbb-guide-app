import type { Metadata } from "next";
import { CoachDashboard } from "@/components/coach/CoachDashboard";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "AIコーチ" };

export default function CoachPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="試合分析AIコーチ"
        titleEn="AI Coach"
        description="試合終了データをAIが多角的に分析。改善点・重要シーン・練習メニューまで一気通貫でレポート。"
      />
      <CoachDashboard />
    </div>
  );
}
