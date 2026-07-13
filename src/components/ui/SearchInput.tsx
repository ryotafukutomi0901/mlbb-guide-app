"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchInput({
  value,
  onChange,
  placeholder = "検索...",
  className,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl border border-border bg-surface/80 px-3 py-2.5 backdrop-blur transition-colors focus-within:border-primary/60 focus-within:shadow-[0_0_16px_rgba(139,92,246,0.2)]",
        className
      )}
    >
      <Search size={16} className="shrink-0 text-text-faint group-focus-within:text-primary" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          aria-label="クリア"
          onClick={() => onChange("")}
          className="shrink-0 cursor-pointer text-text-faint hover:text-text"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
