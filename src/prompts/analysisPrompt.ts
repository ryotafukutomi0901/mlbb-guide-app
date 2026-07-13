export const ANALYSIS_PROMPT = `以下の試合データを分析し、JSONで返答してください。

分析対象:
- KDA、ゴールド、経験値、ダメージ、視界スコアの推移
- デス位置とタイミング(ヒートマップ座標)
- オブジェクト(タートル/ロード)への関与
- ローテーションと視界管理
- ビルド選択とドラフト相性

出力JSONスキーマ:
{
  "grade": "S | A+ | A | B+ | B | C+ | C",
  "score": 0-100,
  "headline": "総合評価の一言",
  "mvpActions": ["MVP級の行動"],
  "insights": [{ "atSeconds": number, "kind": "improve|warning|build|judgement|good", "text": "..." }],
  "scenes": [{ "atSeconds": number, "kind": "death|turtle|teamfight|lord|gank|comeback|kill|objective", "description": "..." }],
  "categories": [{ "label": "...", "score": 0-100, "comment": "..." }],
  "buildAdvice": [{ "itemSlug": "...", "reason": "..." }],
  "recommendedBuild": ["item-slug"],
  "draftReview": "ドラフト分析",
  "winRateDelta": number,
  "practiceMenu": [{ "title": "...", "description": "..." }],
  "focusPoints": [{ "title": "...", "description": "..." }],
  "heatmap": { "movement": number[][], "deaths": [number, number][], "vision": number[][] },
  "kda": [k, d, a], "farmScore": number, "goldEfficiency": number, "xpEfficiency": number,
  "damageShare": number, "visionScore": number
}`;
