import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  accent?: boolean;
};

export function Card({ className, interactive, accent, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-4",
        interactive &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_28px_rgba(139,92,246,0.18)]",
        accent && "edge-glow",
        className
      )}
      {...props}
    />
  );
}
