import { HERO_IMAGES, ITEM_IMAGES, JUNGLE_IMAGES, SKILL_IMAGES } from "@/data/images";

export function heroImage(slug: string): string | undefined {
  return HERO_IMAGES[slug];
}

export function itemImage(slug: string): string | undefined {
  return ITEM_IMAGES[slug];
}

export function skillImage(heroSlug: string, slot: string): string | undefined {
  return SKILL_IMAGES[`${heroSlug}/${slot}`];
}

export function jungleImage(slug: string): string | undefined {
  return JUNGLE_IMAGES[slug];
}

// ホーム/詳細ページのバナー用アートワーク。差し替えはこの配列を編集する。
export const BANNER_IMAGES = [
  "/images/entrance/MLBB-Earthquake-1.jpg",
  "/images/entrance/ca80df9051c8d2423f60fc017a61e39a.jpg",
  "/images/entrance/images.jpeg",
  "/images/entrance/images%20(1).jpeg",
  "/images/entrance/images%20(2).jpeg",
  "/images/entrance/images%20(3).jpeg",
  "/images/entrance/images%20(4).jpeg",
  "/images/entrance/images%20(5).jpeg",
  "/images/entrance/images%20(6).jpeg",
  "/images/entrance/images%20(7).jpeg",
  "/images/entrance/images%20(8).jpeg",
  "/images/entrance/images%20(9).jpeg",
  "/images/entrance/images%20(10).jpeg",
];

export function bannerImage(index: number): string {
  return BANNER_IMAGES[Math.abs(index) % BANNER_IMAGES.length];
}
