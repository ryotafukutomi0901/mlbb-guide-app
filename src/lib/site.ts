/** サイト全体のメタ情報。canonical・OGP・sitemapの基点 */
export const SITE = {
  name: "MLBB LAB",
  title: "MLBB LAB — Mobile Legends 攻略・ビルド・AIコーチ",
  description:
    "Mobile Legends: Bang Bang(モバイルレジェンド)の攻略プラットフォーム。全133ヒーローのビルド・カウンター・Tierリスト・ビルドシミュレーター・AIコーチを日本語で。",
  locale: "ja_JP",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002",
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}
