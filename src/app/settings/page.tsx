import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "設定" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader title="設定" titleEn="Settings" description="表示・地域・ローカルデータを管理します。" />
      <SettingsPanel />
    </div>
  );
}
