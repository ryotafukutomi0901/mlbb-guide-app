import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { DashboardNotice, DashboardUnavailable } from "@/components/dashboard/DashboardNotice";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { AuthUnavailableError, getSessionUserOrThrow, type SessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ダッシュボード",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <DashboardNotice icon={<LogIn size={22} />} title="アカウント機能は準備中です">
        分析結果の保存と進捗の可視化は現在準備中です。まずは登録不要のAIコーチ体験をお試しください。
      </DashboardNotice>
    );
  }

  let user: SessionUser | null;
  try {
    user = await getSessionUserOrThrow();
  } catch (error) {
    if (!(error instanceof AuthUnavailableError)) throw error;
    // 障害中にログイン済みの人へ「ログインが必要です」と出さない
    return <DashboardUnavailable />;
  }

  if (!user) {
    return (
      <DashboardNotice icon={<LogIn size={22} />} title="ログインが必要です">
        ログインすると、分析結果の保存・弱点の推移・今日のフォーカスが表示されます。
      </DashboardNotice>
    );
  }

  return <DashboardView userId={user.id} />;
}

