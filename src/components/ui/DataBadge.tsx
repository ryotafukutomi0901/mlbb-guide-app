import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 編集部評価データであることと鮮度を明示する。
 * 実測統計ではない数値を表示する箇所には必ず添える(docs/redesign/02_DATA_SPEC.md 2-3)。
 */
export function DataBadge({
  patch,
  updatedAt,
  label = "編集部評価",
  className,
}: {
  patch?: string;
  updatedAt?: string;
  label?: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-text-faint",
        className
      )}
    >
      <Info size={11} className="shrink-0" />
      <span>{label}</span>
      {patch && <span className="font-display">Patch {patch}</span>}
      {updatedAt && <span>{updatedAt} 更新</span>}
    </p>
  );
}

/** データ未整備であることを正直に伝える */
export function DataPending({ what, className }: { what: string; className?: string }) {
  return (
    <p className={cn("text-xs text-text-faint", className)}>
      {what}は準備中です。編集部が確認できたものから順に公開しています。
    </p>
  );
}
