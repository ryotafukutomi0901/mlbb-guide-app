import type { Metadata } from "next";
import { LANE_LABEL, ROLE_LABEL, type HeroSummary } from "@/data/types";
import { alternateLanguages } from "@/i18n/config";

type SectionKey = "overview" | "skills" | "build" | "counters" | "stats";

const SECTION_COPY: Record<
  SectionKey,
  { label?: string; title: (h: HeroSummary) => string; description: (h: HeroSummary) => string }
> = {
  overview: {
    title: (h) => `${h.name} (${h.nameEn})`,
    description: (h) =>
      `${h.name}のビルド・カウンター・スキル・立ち回りを日本語で解説。${h.roles.map((r) => ROLE_LABEL[r]).join("・")} / ${LANE_LABEL[h.lane]} / Tier ${h.tier}。MLBB(モバイルレジェンド)攻略はMLBB LAB。`,
  },
  skills: {
    label: "スキル",
    title: (h) => `${h.name}のスキル解説`,
    description: (h) =>
      `${h.name}(${h.nameEn})の全スキルの効果を日本語で解説。パッシブ・スキル1・スキル2・アルティメットの性能をまとめています。`,
  },
  build: {
    label: "ビルド",
    title: (h) => `${h.name}のおすすめビルド`,
    description: (h) =>
      `${h.name}(${h.nameEn})の最強ビルドと装備を積む理由。エンブレム・バトルスペルの推奨構成、シミュレーターでの検証もできます。`,
  },
  counters: {
    label: "カウンター",
    title: (h) => `${h.name}のカウンター`,
    description: (h) =>
      `${h.name}(${h.nameEn})に強いヒーロー・弱いヒーローを理由付きで解説。レーン相性・行動妨害・機動力などの観点から整理しています。`,
  },
  stats: {
    label: "ステータス",
    title: (h) => `${h.name}のステータス`,
    description: (h) =>
      `${h.name}(${h.nameEn})のレベル別ステータス。HP・攻撃力・防御力・攻撃速度・移動速度の成長とスキンをまとめています。`,
  },
};

export function heroSectionLabel(section: SectionKey): string | undefined {
  return SECTION_COPY[section].label;
}

/** ヒーローページ共通のmetadata生成(セクションごとに固有のtitle/description) */
export function heroMetadata(hero: HeroSummary, section: SectionKey): Metadata {
  const copy = SECTION_COPY[section];
  const title = copy.title(hero);
  const description = copy.description(hero);
  const path = section === "overview" ? `/heroes/${hero.slug}` : `/heroes/${hero.slug}/${section}`;

  return {
    title,
    description,
    alternates: { canonical: path, languages: alternateLanguages(path) },
    openGraph: {
      title: `${title} | MLBB LAB`,
      description,
      url: path,
      type: "article",
    },
    twitter: { card: "summary_large_image", title: `${title} | MLBB LAB`, description },
  };
}
