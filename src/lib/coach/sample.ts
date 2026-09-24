import type { CoachReportPayload } from "./schema";

/**
 * APIキー未設定時に表示するサンプル。
 * 「AIが分析した結果」として見せてはならない(UI側で必ずサンプルと明示する)。
 */
export const SAMPLE_COACH_RESULT: CoachReportPayload = {
  grade: "B+",
  score: 72,
  headline: "終盤の集団戦は良好。中盤のローテーションに伸びしろがあります。",
  summary:
    "序盤のレーン戦とファーム効率は安定しており、終盤の集団戦では立ち位置を保ったまま火力を出せています。一方、中盤にオブジェクトへの反応が遅れる場面があり、視界のない移動で被ガンクを招いています。中盤の動き出しを整えるだけで勝率は目に見えて変わります。",
  biggestWeakness: {
    title: "中盤のローテーション",
    detail:
      "タートルが湧く時間帯に自レーンへ留まる時間が長く、人数不利の状態で集団戦が始まっています。オブジェクトの30秒前にはウェーブを押し込み、マップ中央側へ寄る動きを固定しましょう。",
  },
  biggestStrength: {
    title: "集団戦のポジショニング",
    detail:
      "前に出過ぎず、射程の内側から火力を出し続けられています。この距離感は維持してください。",
  },
  todayFocus: {
    title: "オブジェクト30秒前に動き出す",
    detail:
      "タートル・ロードの湧き時間を意識し、30秒前からウェーブ処理と位置取りを始める。これだけを次の3試合で徹底してください。",
  },
  mvpActions: [
    "終盤の集団戦で安全な位置から最大火力を維持した",
    "劣勢の時間帯でもファーム差を最小限に抑えた",
  ],
  insights: [
    { atSeconds: 190, kind: "improve", text: "視界のない状態で前進する時間帯です。ミニマップの確認を挟みましょう。" },
    { atSeconds: 300, kind: "warning", text: "タートル優先の時間帯。味方と合わせて動く判断が必要でした。" },
    { atSeconds: 640, kind: "good", text: "集団戦での立ち位置は理想的です。この形を再現しましょう。" },
  ],
  scenes: [
    { atSeconds: 300, kind: "turtle", description: "タートル戦。人数が揃う前に接敵" },
    { atSeconds: 640, kind: "teamfight", description: "ミッドでの集団戦に勝利" },
  ],
  categories: [
    { label: "レーン戦", score: 78, comment: "序盤のダメージトレードは安定しています。" },
    { label: "ファーム効率", score: 70, comment: "中盤にフリーファームの時間を活かしきれていません。" },
    { label: "オブジェクト", score: 58, comment: "タートルへの反応が遅れがちです。" },
    { label: "ローテーション", score: 62, comment: "視界のない移動が多めです。" },
    { label: "視界管理", score: 55, comment: "ブッシュチェックの頻度を上げましょう。" },
    { label: "集団戦", score: 84, comment: "立ち位置とフォーカスが安定しています。" },
  ],
  buildAdvice: [],
  recommendedBuild: [],
  draftReview:
    "これはサンプルレポートのため、実際のドラフト分析は行っていません。APIキーを設定すると、あなたの試合の敵味方構成に基づいた分析が表示されます。",
  nextMatchActions: [
    "タートルの30秒前にウェーブを押し込む",
    "移動前に必ずミニマップを1度見る",
    "集団戦では今の距離感を維持する",
  ],
  practiceMenu: [
    {
      title: "オブジェクト時間の把握",
      description: "試合開始からタートル湧きまでの時間を数える練習を3試合続けてみてください。",
    },
  ],
};
