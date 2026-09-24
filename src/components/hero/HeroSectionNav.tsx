"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface HeroSection {
  href: string;
  label: string;
}

/**
 * ヒーロー詳細のセクション切替。
 * タブの見た目のままURLを持つ(各セクションが独立したSEO対象ページになる)。
 */
export function HeroSectionNav({ sections }: { sections: HeroSection[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="scrollbar-none mb-5 flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface/70 p-1 backdrop-blur"
      aria-label="ヒーロー情報の切り替え"
    >
      {sections.map((section) => {
        const active = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors md:text-sm",
              active ? "text-white" : "text-text-muted hover:text-text"
            )}
          >
            {active && (
              <motion.span
                layoutId="hero-section-nav"
                className="absolute inset-0 rounded-lg gradient-primary shadow-[0_0_16px_rgba(139,92,246,0.4)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{section.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
