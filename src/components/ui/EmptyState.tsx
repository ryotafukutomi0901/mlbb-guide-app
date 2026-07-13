import { SearchX } from "lucide-react";

export function EmptyState({
  title = "見つかりませんでした",
  description,
  icon,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-2 text-text-faint">
        {icon ?? <SearchX size={24} />}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="max-w-sm text-xs text-text-muted">{description}</p>}
    </div>
  );
}
