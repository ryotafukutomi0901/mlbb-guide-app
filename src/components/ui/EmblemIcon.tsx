import Image from "next/image";
import { emblemImage } from "@/lib/assets";
import { cn } from "@/lib/utils";

/** エンブレムのアイコン。画像が無い場合は従来の色付きバッジにフォールバックする */
export function EmblemIcon({
  slug,
  name,
  nameEn,
  color,
  size = 44,
  className,
}: {
  slug: string;
  name: string;
  nameEn: string;
  color: string;
  size?: number;
  className?: string;
}) {
  const src = emblemImage(slug);

  if (!src) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl border font-display font-black",
          className
        )}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.32,
          color,
          borderColor: `${color}55`,
          backgroundColor: `${color}14`,
          boxShadow: `0 0 18px ${color}33`,
        }}
        aria-hidden
      >
        {nameEn.slice(0, 1)}
      </span>
    );
  }

  return (
    <span
      className={cn("relative shrink-0 overflow-hidden rounded-2xl border", className)}
      style={{
        width: size,
        height: size,
        borderColor: `${color}55`,
        backgroundColor: `${color}14`,
        boxShadow: `0 0 18px ${color}33`,
      }}
    >
      <Image src={src} alt={name} fill sizes={`${size}px`} className="object-contain p-1" />
    </span>
  );
}
