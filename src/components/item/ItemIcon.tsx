import Image from "next/image";
import { ITEM_IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";

export function ItemIcon({ slug, name, size = 48 }: { slug: string; name: string; size?: number }) {
  const src = ITEM_IMAGES[slug];
  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-lg border border-border bg-surface-hover")}
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
