"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "gold" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "gradient-primary text-white shadow-[0_0_18px_rgba(139,92,246,0.35)] hover:shadow-[0_0_28px_rgba(139,92,246,0.55)]",
  gold:
    "gradient-gold text-black font-bold shadow-[0_0_18px_rgba(240,180,41,0.3)] hover:shadow-[0_0_28px_rgba(240,180,41,0.5)]",
  secondary: "glass-bright text-text hover:border-primary/60 hover:text-white",
  ghost: "text-text-muted hover:text-text hover:bg-surface-hover",
  danger: "bg-danger/85 text-white shadow-[0_0_18px_rgba(244,63,94,0.3)] hover:bg-danger",
};

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-shadow duration-300 disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
