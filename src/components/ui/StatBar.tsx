"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatBar({
  label,
  value,
  max = 100,
  displayValue,
  color = "primary",
  className,
}: {
  label: string;
  value: number;
  max?: number;
  displayValue?: string;
  color?: "primary" | "gold" | "neon" | "success" | "danger";
  className?: string;
}) {
  const ratio = Math.max(0, Math.min(1, value / max));
  const colors: Record<string, string> = {
    primary: "gradient-primary",
    gold: "gradient-gold",
    neon: "bg-neon",
    success: "bg-success",
    danger: "bg-danger",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="w-24 shrink-0 text-xs text-text-muted">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className={cn("h-full rounded-full", colors[color])}
          initial={{ width: 0 }}
          whileInView={{ width: `${ratio * 100}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="w-14 shrink-0 text-right font-display text-xs font-bold">
        {displayValue ?? value}
      </span>
    </div>
  );
}
