import Image from "next/image";
import { JUNGLE_IMAGES } from "@/data/images";

export function JungleIcon({ slug, name, size = 56 }: { slug: string; name: string; size?: number }) {
  const src = JUNGLE_IMAGES[slug];
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-surface-hover"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={name} width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-border" />
      )}
    </div>
  );
}
