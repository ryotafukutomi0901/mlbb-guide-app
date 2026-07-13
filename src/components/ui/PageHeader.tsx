"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  titleEn,
  description,
  actions,
  className,
}: {
  title: string;
  titleEn?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8", className)}
    >
      <div>
        {titleEn && (
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-primary md:text-xs">
            {titleEn}
          </p>
        )}
        <h1 className="mt-1 text-xl font-black tracking-wide md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-xs text-text-muted md:text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
