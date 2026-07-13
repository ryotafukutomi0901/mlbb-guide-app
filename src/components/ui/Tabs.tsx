"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  layoutId,
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "scrollbar-none flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface/70 p-1 backdrop-blur",
        className
      )}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative shrink-0 cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors md:text-sm",
              active ? "text-white" : "text-text-muted hover:text-text"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg gradient-primary shadow-[0_0_16px_rgba(139,92,246,0.4)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
