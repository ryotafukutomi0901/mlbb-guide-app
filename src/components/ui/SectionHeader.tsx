import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  icon,
  href,
  hrefLabel = "すべて見る",
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide md:text-base">
        <span className="h-4 w-1 rounded-full gradient-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
        {icon}
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="group flex items-center gap-0.5 text-xs font-medium text-primary transition-colors hover:text-neon"
        >
          {hrefLabel}
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
