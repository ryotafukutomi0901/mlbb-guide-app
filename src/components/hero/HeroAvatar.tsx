import Image from "next/image";
import type { Role } from "@/data/types";
import { cn } from "@/lib/utils";
import { HERO_IMAGES } from "@/data/images";

const ROLE_COLOR: Record<Role, string> = {
  tank: "bg-primary-2/30 text-primary-2",
  fighter: "bg-danger/25 text-danger",
  assassin: "bg-primary/30 text-primary",
  mage: "bg-primary-2/25 text-primary-2",
  marksman: "bg-gold/25 text-gold",
  support: "bg-success/25 text-success",
};

const SIZE_PX = { xs: 20, sm: 36, md: 48, lg: 80 };

export function HeroAvatar({
  name,
  role,
  slug,
  size = "md",
  className,
}: {
  name: string;
  role: Role;
  slug?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = {
    xs: "h-5 w-5 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-20 w-20 text-lg",
  }[size];

  const imageSrc = slug ? HERO_IMAGES[slug] : undefined;

  if (imageSrc) {
    const px = SIZE_PX[size];
    return (
      <div
        className={cn("relative shrink-0 overflow-hidden rounded-full border border-border", sizeClass, className)}
      >
        <Image src={imageSrc} alt={name} width={px} height={px} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border font-bold",
        sizeClass,
        ROLE_COLOR[role],
        className
      )}
    >
      {name.slice(0, 1)}
    </div>
  );
}
