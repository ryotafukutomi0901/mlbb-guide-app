import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ログイン",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const configured = isSupabaseConfigured();
  if (configured && (await getSessionUser())) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-md px-4 py-6 md:px-6 md:py-10">
      <PageHeader
        title="ログイン"
        titleEn="Sign in"
        description="登録すると分析結果が保存され、弱点の推移を追えるようになります。"
      />
      <AuthForm configured={configured} />
    </div>
  );
}
