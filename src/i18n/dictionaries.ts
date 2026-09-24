import type { Locale } from "./config";

/**
 * UI文字列の辞書。ゲームデータ(ヒーロー名・スキル名等)はここではなく
 * src/data/ の正準データが持つ(docs/redesign/02_DATA_SPEC.md)。
 */
const ja = {
  nav: {
    heroes: "ヒーロー一覧",
    tierList: "Tierリスト",
    counters: "カウンター",
    build: "ビルド",
    skills: "スキル",
    stats: "ステータス",
    overview: "概要",
    coach: "AIコーチ",
  },
  hero: {
    backToList: "ヒーロー一覧へ戻る",
    difficulty: "難易度",
    winRate: "勝率",
    pickRate: "ピック率",
    banRate: "バン率",
    recommendedBuild: "おすすめビルド",
    recommendedSetup: "推奨セットアップ",
    emblem: "エンブレム",
    battleSpell: "バトルスペル",
    synergy: "シナジー",
    story: "ストーリー",
    strongAgainst: "有利な相手",
    weakAgainst: "不利な相手",
    goodWith: "相性の良い味方",
  },
  data: {
    editorial: "編集部評価",
    updated: "更新",
    pendingSuffix: "は準備中です。編集部が確認できたものから順に公開しています。",
    winRatePending: "勝率データは準備中",
  },
  common: {
    search: "検索",
    seeAll: "すべて見る",
    sample: "サンプル",
  },
};

export type Dictionary = typeof ja;

const en: Dictionary = {
  nav: {
    heroes: "Heroes",
    tierList: "Tier List",
    counters: "Counters",
    build: "Build",
    skills: "Skills",
    stats: "Stats",
    overview: "Overview",
    coach: "AI Coach",
  },
  hero: {
    backToList: "Back to hero list",
    difficulty: "Difficulty",
    winRate: "Win rate",
    pickRate: "Pick rate",
    banRate: "Ban rate",
    recommendedBuild: "Recommended build",
    recommendedSetup: "Recommended setup",
    emblem: "Emblem",
    battleSpell: "Battle spell",
    synergy: "Synergy",
    story: "Story",
    strongAgainst: "Strong against",
    weakAgainst: "Weak against",
    goodWith: "Good with",
  },
  data: {
    editorial: "Editorial rating",
    updated: "updated",
    pendingSuffix: " is being prepared. We publish entries as we verify them.",
    winRatePending: "Win rate data pending",
  },
  common: {
    search: "Search",
    seeAll: "See all",
    sample: "Sample",
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = { ja, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
