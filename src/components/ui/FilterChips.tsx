"use client";

import { cn } from "@/lib/utils";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  allLabel = "すべて",
  className,
}: {
  options: ChipOption<T>[];
  value: T | "all";
  onChange: (value: T | "all") => void;
  allLabel?: string | null;
  className?: string;
}) {
  const chips: { value: T | "all"; label: string }[] = [
    ...(allLabel ? [{ value: "all" as const, label: allLabel }] : []),
    ...options,
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {chips.map((chip) => {
        const active = chip.value === value;
        return (
          <button
            key={chip.value}
            onClick={() => onChange(chip.value)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              active
                ? "border-primary/60 bg-primary/20 text-white shadow-[0_0_14px_rgba(139,92,246,0.3)]"
                : "border-border bg-surface/60 text-text-muted hover:border-border-bright hover:text-text"
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
