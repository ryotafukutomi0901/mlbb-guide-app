import { z } from "zod";
import { LANES } from "@/lib/enums";

/** AIコーチへの入力。route handlerで必ず検証する(信頼しない) */
export const coachInputSchema = z.object({
  heroSlug: z.string().min(1).max(64),
  lane: z.enum(LANES).optional(),
  result: z.enum(["victory", "defeat"]),
  kills: z.number().int().min(0).max(99),
  deaths: z.number().int().min(0).max(99),
  assists: z.number().int().min(0).max(99),
  durationMinutes: z.number().int().min(1).max(60),
  gold: z.number().int().min(0).max(60000).optional(),
  enemyHeroes: z.array(z.string().min(1).max(64)).max(5).default([]),
  allyHeroes: z.array(z.string().min(1).max(64)).max(4).default([]),
  /** ユーザーの自由記述。プロンプト内では「データ」として扱う */
  notes: z.string().max(600).optional(),
  rankTier: z.string().max(32).optional(),
  locale: z.enum(["ja", "en"]).default("ja"),
});

export type CoachInput = z.infer<typeof coachInputSchema>;

const insightKind = z.enum(["improve", "warning", "build", "judgement", "good"]);
const sceneKind = z.enum([
  "death",
  "turtle",
  "teamfight",
  "lord",
  "gank",
  "comeback",
  "kill",
  "objective",
]);

/** AIの出力。検証に失敗したレポートは表示しない(偽情報を出さない) */
export const coachReportSchema = z.object({
  grade: z.enum(["S", "A+", "A", "B+", "B", "C+", "C", "D"]),
  score: z.number().int().min(0).max(100),
  headline: z.string().min(1).max(120),
  summary: z.string().min(1).max(400),
  biggestWeakness: z.object({
    title: z.string().min(1).max(60),
    detail: z.string().min(1).max(400),
  }),
  biggestStrength: z.object({
    title: z.string().min(1).max(60),
    detail: z.string().min(1).max(400),
  }),
  todayFocus: z.object({
    title: z.string().min(1).max(60),
    detail: z.string().min(1).max(400),
  }),
  mvpActions: z.array(z.string().max(200)).max(5).default([]),
  insights: z
    .array(
      z.object({
        atSeconds: z.number().int().min(0).max(5400),
        kind: insightKind,
        text: z.string().min(1).max(300),
      })
    )
    .max(8)
    .default([]),
  scenes: z
    .array(
      z.object({
        atSeconds: z.number().int().min(0).max(5400),
        kind: sceneKind,
        description: z.string().min(1).max(200),
      })
    )
    .max(8)
    .default([]),
  categories: z
    .array(
      z.object({
        label: z.string().min(1).max(24),
        score: z.number().int().min(0).max(100),
        comment: z.string().min(1).max(200),
      })
    )
    .max(6)
    .default([]),
  buildAdvice: z
    .array(z.object({ itemSlug: z.string().max(64), reason: z.string().min(1).max(200) }))
    .max(4)
    .default([]),
  recommendedBuild: z.array(z.string().max(64)).max(6).default([]),
  draftReview: z.string().max(600).default(""),
  nextMatchActions: z.array(z.string().min(1).max(200)).min(1).max(3),
  practiceMenu: z
    .array(z.object({ title: z.string().min(1).max(60), description: z.string().min(1).max(300) }))
    .max(3)
    .default([]),
});

export type CoachReportPayload = z.infer<typeof coachReportSchema>;

/** LLMに渡す出力仕様(スキーマと1対1で対応させる) */
export const COACH_JSON_SPEC = `{
  "grade": "S|A+|A|B+|B|C+|C|D",
  "score": 0-100,
  "headline": "総合評価の一言(120字以内)",
  "summary": "この試合の要約(400字以内)",
  "biggestWeakness": { "title": "最大の課題", "detail": "根拠と直し方" },
  "biggestStrength": { "title": "最大の強み", "detail": "根拠" },
  "todayFocus": { "title": "次の試合で意識すること1つ", "detail": "具体的な行動" },
  "mvpActions": ["良かった行動(最大5件)"],
  "insights": [{ "atSeconds": 0以上の秒数, "kind": "improve|warning|build|judgement|good", "text": "..." }],
  "scenes": [{ "atSeconds": 秒数, "kind": "death|turtle|teamfight|lord|gank|comeback|kill|objective", "description": "..." }],
  "categories": [{ "label": "レーン戦|ファーム効率|オブジェクト|ローテーション|視界管理|集団戦", "score": 0-100, "comment": "..." }],
  "buildAdvice": [{ "itemSlug": "提示された装備slugのみ", "reason": "..." }],
  "recommendedBuild": ["提示された装備slugのみ(最大6)"],
  "draftReview": "ドラフト分析(600字以内)",
  "nextMatchActions": ["次の試合で実行する行動(1〜3件)"],
  "practiceMenu": [{ "title": "...", "description": "..." }]
}`;
