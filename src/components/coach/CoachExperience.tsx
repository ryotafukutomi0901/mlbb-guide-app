"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { FreeAnalysisResult } from "@/components/coach/FreeAnalysisResult";
import {
  MatchAnalyzerForm,
  type AnalyzeResponse,
  type QuotaError,
} from "@/components/coach/MatchAnalyzerForm";
import { Card } from "@/components/ui/Card";
import { QUOTA, describeReset } from "@/lib/coach/plans";

/** 上限に達したときの案内。登録済みの人に「登録すると使える」と言わないよう、プランで出し分ける */
function quotaCopy(error: QuotaError) {
  const reset = describeReset(error.resetAt);
  const comeback = reset ? `${reset}に回数が戻ります。` : "";
  if (error.plan === "anon") {
    return {
      title: "無料体験の分析を使いました",
      body: `登録すると、毎月${QUOTA.free.match_review.perMonth}回まで無料で分析でき、結果も保存されて弱点の推移を追えるようになります。`,
      cta: { href: "/login", label: "無料で登録する" },
    };
  }
  if (error.plan === "free") {
    return {
      title: "今月の無料分析を使い切りました",
      body: `${comeback}今回見つかった課題を、次の試合で試してみてください。`,
      cta: { href: "/pricing", label: "プランを見る" },
    };
  }
  return {
    title: "分析回数の上限に達しました",
    body: `${comeback}今回見つかった課題を、次の試合で試してみてください。`,
    cta: { href: "/dashboard", label: "これまでの分析を見る" },
  };
}

/** 無料体験 → 結果 → Pro導線の一連の流れ */
export function CoachExperience() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [quotaError, setQuotaError] = useState<QuotaError | null>(null);

  if (quotaError) {
    const copy = quotaCopy(quotaError);
    return (
      <Card accent className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 text-gold">
          <Lock size={22} />
        </span>
        <h2 className="mt-4 text-base font-bold">{copy.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{copy.body}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href={copy.cta.href}
            className="gradient-primary inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          >
            {copy.cta.label}
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/heroes"
            className="glass-bright inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold"
          >
            攻略情報を見る
          </Link>
        </div>
      </Card>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col gap-4">
        <FreeAnalysisResult
          report={result.report}
          source={result.source}
          notice={result.notice}
        />
        <button
          type="button"
          onClick={() => setResult(null)}
          className="cursor-pointer text-center text-xs font-semibold text-primary transition-colors hover:text-neon"
        >
          別の試合を分析する
        </button>
      </div>
    );
  }

  return <MatchAnalyzerForm onResult={setResult} onQuotaExceeded={setQuotaError} />;
}
