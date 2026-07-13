import { cn } from "@/lib/utils";

/**
 * 広告枠のプレースホルダー。
 * Google AdSenseの審査が通ったら、この中身を <ins className="adsbygoogle" ...> に差し替える。
 * それまではレイアウト崩れ確認用の枠として表示する。
 */
export function AdSlot({
  label = "広告",
  variant = "horizontal",
}: {
  label?: string;
  variant?: "horizontal" | "rail";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-dashed border-border bg-surface-hover text-center text-xs text-text-muted",
        variant === "horizontal" && "min-h-24",
        variant === "rail" && "min-h-[600px] w-40 px-2 [writing-mode:vertical-rl]"
      )}
    >
      {label}スペース(AdSense審査後にここに広告が表示されます)
    </div>
  );
}
