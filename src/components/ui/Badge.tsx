import { cn } from "@/lib/utils";

const TIER_STYLES: Record<string, string> = {
  "S+": "gradient-gold text-black shadow-[0_0_12px_rgba(240,180,41,0.45)]",
  S: "bg-gold/85 text-black shadow-[0_0_10px_rgba(240,180,41,0.3)]",
  "A+": "bg-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]",
  A: "bg-primary/65 text-white",
  "B+": "bg-primary-2/60 text-white",
  B: "bg-surface-hover text-text-muted",
};

export function TierBadge({ tier, className }: { tier: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-9 items-center justify-center rounded-md px-1.5 font-display text-xs font-bold",
        TIER_STYLES[tier] ?? "bg-surface-hover text-text-muted",
        className
      )}
    >
      {tier}
    </span>
  );
}

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "primary" | "gold" | "neon";
}) {
  const variantStyles: Record<string, string> = {
    default: "bg-surface-hover text-text-muted border border-border",
    success: "bg-success/15 text-success border border-success/25",
    warning: "bg-warning/15 text-warning border border-warning/25",
    danger: "bg-danger/15 text-danger border border-danger/25",
    primary: "bg-primary/15 text-primary border border-primary/30",
    gold: "bg-gold/15 text-gold border border-gold/30",
    neon: "bg-neon/10 text-neon border border-neon/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
