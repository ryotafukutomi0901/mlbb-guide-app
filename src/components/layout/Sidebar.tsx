"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FOOTER_NAV_ITEMS, NAV_GROUPS, isNavActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-bg-deep/80 backdrop-blur-xl lg:flex">
      <Link href="/" className="group flex h-16 shrink-0 items-center gap-3 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary font-display text-sm font-black text-white shadow-[0_0_16px_rgba(139,92,246,0.5)] transition-shadow group-hover:shadow-[0_0_24px_rgba(139,92,246,0.7)]">
          ML
        </span>
        <span className="font-display text-sm font-bold tracking-widest">
          MLBB <span className="text-gradient-gold">LAB</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 font-display text-[10px] font-bold uppercase tracking-[0.3em] text-text-faint">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isNavActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                        active ? "text-white" : "text-text-muted hover:bg-surface-hover/60 hover:text-text"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl border border-primary/40 bg-primary/15 shadow-[inset_0_0_18px_rgba(139,92,246,0.15)]"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icon
                        size={16}
                        className={cn(
                          "relative z-10 shrink-0 transition-colors",
                          active ? "text-primary" : "text-text-faint group-hover:text-primary"
                        )}
                      />
                      <span className="relative z-10">{label}</span>
                      {active && (
                        <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_rgba(56,214,255,0.9)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <ul className="space-y-0.5">
          {FOOTER_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "border border-primary/40 bg-primary/15 text-white"
                      : "text-text-muted hover:bg-surface-hover/60 hover:text-text"
                  )}
                >
                  <Icon size={16} className={active ? "text-primary" : "text-text-faint"} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
