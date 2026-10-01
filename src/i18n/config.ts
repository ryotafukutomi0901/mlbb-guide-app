/**
 * 多言語対応の基盤。
 * ja はURL接頭辞なし(既存URL=SEO資産を維持)、それ以外は /{locale}/ 配下。
 * 翻訳が完成していないロケールは noindex で公開し、機械翻訳の一括公開はしない。
 */
export const LOCALES = ["ja", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ja";

export const LOCALE_META: Record<
  Locale,
  { label: string; htmlLang: string; ogLocale: string; hreflang: string }
> = {
  ja: { label: "日本語", htmlLang: "ja", ogLocale: "ja_JP", hreflang: "ja" },
  en: { label: "English", htmlLang: "en", ogLocale: "en_US", hreflang: "en" },
};

/**
 * 翻訳の完成度。false の間は検索エンジンに載せない(§18: 翻訳SEOにしない)。
 * ゲームデータ(英語名・数値)は揃っているが、解説文の英訳が未了のため en は false。
 */
export const LOCALE_READY: Record<Locale, boolean> = {
  ja: true,
  en: false,
};

export function localePath(locale: Locale, path: string): string {
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path === "/" ? "" : path}`;
}

/** hreflang の相互参照。x-default は既定ロケールを指す */
export function alternateLanguages(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[LOCALE_META[locale].hreflang] = localePath(locale, path);
  }
  languages["x-default"] = localePath(DEFAULT_LOCALE, path);
  return languages;
}
