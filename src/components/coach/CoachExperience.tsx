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

/** 無料体験 → 結果 → Pro導線の一連の流れ */
export function CoachExperience() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [quotaError, setQuotaError] = useState<QuotaError | null>(null);

  if (quotaError) {
    return (
      <Card accent className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 text-gold">
          <Lock size={22} />
        </span>
        <h2 className="mt-4 text-base font-bold">無料分析の回数を使い切りました</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          今回の分析で見つかった課題を、次の試合で試してみてください。
          継続して分析したい場合は、アカウント登録で毎月3回まで無料で使えます。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="gradient-primary inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          >
            プランを見る
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
