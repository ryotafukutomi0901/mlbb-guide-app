import { EMBLEM_IMAGES, HERO_IMAGES, ITEM_IMAGES, JUNGLE_IMAGES, SKILL_IMAGES } from "@/data/images";

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

export function emblemImage(slug: string): string | undefined {
  return EMBLEM_IMAGES[slug];
}

// ホーム/詳細ページのバナー用アートワーク。差し替えはこの配列を編集する。
export const BANNER_IMAGES = [
  "/images/entrance/MLBB-Earthquake-1.jpg",
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

// スプラッシュ用ライブ壁紙(entrance画像からffmpegで生成したループ動画)。
// 差し替え時はpublic/videos/splash/に置いてここへ追記する。
export const SPLASH_VIDEOS = Array.from(
  { length: 10 },
  (_, i) => `/videos/splash/splash-${String(i + 1).padStart(2, "0")}.mp4`
);

export function randomSplashVideo(): string {
  return SPLASH_VIDEOS[Math.floor(Math.random() * SPLASH_VIDEOS.length)];
}
