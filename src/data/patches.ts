import type { PatchNote } from "./types";

export const PATCH_NOTES: PatchNote[] = [
  {
    version: "1.9.42",
    date: "2026-07-08",
    title: "シーズン38バランス調整 — ロームメタの見直し",
    highlights: [
      "マルセルのバリアフィールドを弱体化",
      "マークスマン系装備の価格調整",
      "ロードのHPを中盤帯で増加",
    ],
    changes: [
      {
        target: "マルセル",
        targetSlug: "marcel",
        kind: "hero",
        type: "nerf",
        notes: ["バリアフィールドのシールド量 850-1450 → 750-1300", "アルティメットCD 60/55/50 → 68/60/52"],
      },
      {
        target: "アルカード",
        targetSlug: "alucard",
        kind: "hero",
        type: "buff",
        notes: ["パッシブのライフスティール 20% → 24%", "グルームソードの物理攻撃係数 +10%"],
      },
      {
        target: "レイラ",
        targetSlug: "layla",
        kind: "hero",
        type: "buff",
        notes: ["射程パッシブの成長値を上方修正", "マレフィックキャノンのスロウ 30% → 40%"],
      },
      {
        target: "ファニー",
        targetSlug: "fanny",
        kind: "hero",
        type: "adjust",
        notes: ["ワイヤーのエネルギー消費 25 → 23", "ブレイド七連の基礎ダメージを微減"],
      },
      {
        target: "バーサーカーズ・フューリー",
        targetSlug: "berserkers-fury",
        kind: "item",
        type: "nerf",
        notes: ["価格 2530 → 2620", "クリティカルダメージ +30% → +25%"],
      },
      {
        target: "ロード",
        kind: "system",
        type: "adjust",
        notes: ["8:00-14:00帯のHPを8%増加", "討伐報酬ゴールド 220 → 200"],
      },
    ],
  },
  {
    version: "1.9.36",
    date: "2026-06-17",
    title: "新ヒーロー「ゼティアン」登場と魔法装備リワーク",
    highlights: [
      "新ヒーロー ゼティアン(ファイター/メイジ)実装",
      "クロック・オブ・デスティニーのリワーク",
      "タートルの出現時間を2:00に統一",
    ],
    changes: [
      {
        target: "ゼティアン",
        targetSlug: "zetian",
        kind: "hero",
        type: "new",
        notes: ["魔法剣士型の新ヒーロー。スキル連携でスタックを貯め、強化通常攻撃で爆発ダメージを与える。"],
      },
      {
        target: "クロック・オブ・デスティニー",
        targetSlug: "clock-of-destiny",
        kind: "item",
        type: "rework",
        notes: ["成長上限到達時に魔法攻撃+5%の新効果", "基礎HP 500 → 450"],
      },
      {
        target: "グシオン",
        targetSlug: "gusion",
        kind: "hero",
        type: "nerf",
        notes: ["ミンサースラストのダメージ係数 -8%"],
      },
      {
        target: "エスタス",
        targetSlug: "estes",
        kind: "hero",
        type: "buff",
        notes: ["ライフウッドブルームの回復量 +12%"],
      },
    ],
  },
  {
    version: "1.9.28",
    date: "2026-05-20",
    title: "ジャングル環境調整とタンク強化",
    highlights: ["ジャングルモンスターの経験値を増加", "タンク系エンブレムの防御値上方", "フックの当たり判定を統一"],
    changes: [
      {
        target: "ジャングルモンスター",
        kind: "system",
        type: "buff",
        notes: ["小型モンスターの経験値 +10%", "リトワンダーラーの移速バフ持続 +2秒"],
      },
      {
        target: "ティグレル",
        targetSlug: "tigreal",
        kind: "hero",
        type: "buff",
        notes: ["サクリッドブリッジの引き寄せ範囲 +15%"],
      },
      {
        target: "フランコ",
        targetSlug: "franco",
        kind: "hero",
        type: "adjust",
        notes: ["アイアンフックの判定幅を他フック系スキルと統一", "フックCD 9.5秒 → 10秒"],
      },
      {
        target: "カリー",
        targetSlug: "karrie",
        kind: "hero",
        type: "nerf",
        notes: ["真実のダメージ係数 -5%"],
      },
    ],
  },
];
