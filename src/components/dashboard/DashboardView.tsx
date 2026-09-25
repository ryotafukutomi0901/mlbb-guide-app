import Link from "next/link";
import { ArrowRight, Bot, Target, TrendingUp } from "lucide-react";
import { DashboardUnavailable } from "@/components/dashboard/DashboardNotice";
import { Card } from "@/components/ui/Card";
import { DataPending } from "@/components/ui/DataBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import type { CoachReportPayload } from "@/lib/coach/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ReportRow {
  id: string;
  created_at: string;
  report: CoachReportPayload;
}

/**
 * ログイン後の Personal Command Center。
 * 実データ(coach_reports)だけを表示し、記録がない項目は正直に「これから」を出す。
 */
export async function DashboardView({ userId }: { userId: string }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = supabase
    ? await supabase
        .from("coach_reports")
        .select("id, created_at, report")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: null, error: null };
  // 読めなかったのに「まだ分析記録がありません」と出さない
  if (error) return <DashboardUnavailable />;

  const reports = (data ?? []) as ReportRow[];
  const latest = reports[0];
  const averageScore =
    reports.length > 0
      ? Math.round(reports.reduce((sum, r) => sum + r.report.score, 0) / reports.length)
      : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="ダッシュボード"
        titleEn="Dashboard"
        description="直近の分析結果と、今日意識することをまとめています。"
      />

      {!latest ? (
        <Card accent className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
            <Bot size={22} />
          </span>
          <h2 className="mt-4 text-base font-bold">まだ分析記録がありません</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            試合データを1件分析すると、ここに課題と進捗が表示されるようになります。
          </p>
          <Link
            href="/coach"
            className="gradient-primary mt-5 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          >
            最初の分析をする
            <ArrowRight size={15} />
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-xs text-text-muted">直近のスコア</p>
              <p className="mt-1 font-display text-3xl font-black text-gradient-gold">
                {latest.report.score}
                <span className="text-sm text-text-faint">/100</span>
              </p>
              <p className="mt-1 text-[11px] text-text-faint">評価 {latest.report.grade}</p>
            </Card>
            <Card>
              <p className="text-xs text-text-muted">平均スコア(直近{reports.length}件)</p>
              <p className="mt-1 font-display text-3xl font-black">{averageScore ?? "—"}</p>
              <p className="mt-1 text-[11px] text-text-faint">分析を重ねると推移が見えます</p>
            </Card>
            <Card>
              <p className="text-xs text-text-muted">分析回数</p>
              <p className="mt-1 font-display text-3xl font-black">{reports.length}</p>
              <p className="mt-1 text-[11px] text-text-faint">保存済みレポート</p>
            </Card>
          </div>

          <Card accent>
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary">
              <Target size={15} />
              今日のフォーカス
            </h2>
            <p className="mt-2 text-base font-bold">{latest.report.todayFocus.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
              {latest.report.todayFocus.detail}
            </p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h2 className="text-sm font-bold text-danger">最大の課題</h2>
              <p className="mt-2 font-bold">{latest.report.biggestWeakness.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                {latest.report.biggestWeakness.detail}
              </p>
            </Card>
            <Card>
              <h2 className="text-sm font-bold text-success">最大の強み</h2>
              <p className="mt-2 font-bold">{latest.report.biggestStrength.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
                {latest.report.biggestStrength.detail}
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
              <TrendingUp size={15} className="text-neon" />
              最近の分析
            </h2>
            {reports.length > 1 ? (
              <ul className="flex flex-col divide-y divide-border/50">
                {reports.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.report.headline}</p>
                      <p className="mt-0.5 font-display text-[10px] text-text-faint">
                        {new Date(row.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <span className="shrink-0 font-display text-sm font-bold text-gold">
                      {row.report.score}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <DataPending what="スコアの推移" />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
