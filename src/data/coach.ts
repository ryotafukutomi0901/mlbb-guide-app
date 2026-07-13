import type { CoachReport } from "./types";
import { seededFloat } from "@/lib/seed";

function heatGrid(seed: string, size = 12, hotspots: [number, number, number][] = []): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      let v = seededFloat(`${seed}:${x}:${y}`, 0, 0.25, 3);
      for (const [hx, hy, strength] of hotspots) {
        const d = Math.hypot(x - hx, y - hy);
        v += strength * Math.exp(-(d * d) / 6);
      }
      row.push(Math.min(1, Math.round(v * 1000) / 1000));
    }
    grid.push(row);
  }
  return grid;
}

export const COACH_REPORTS: CoachReport[] = [
  {
    matchId: "m-20260712-01",
    grade: "B+",
    score: 72,
    headline: "あと一歩で完璧な試合運びでした！",
    mvpActions: [
      "13:45のガンク成功で敵キャリーを孤立させ、チームに有利を作った",
      "終盤の集団戦で安全なポジションから最大火力を維持した",
      "ロード戦の直前にウェーブクリアを済ませ、人数有利を確保した",
    ],
    insights: [
      { atSeconds: 194, kind: "improve", text: "敵ジャングラーが見えていない状態で前進しています。ミニマップを確認してから動きましょう。" },
      { atSeconds: 291, kind: "warning", text: "タートル優先の時間帯です。味方と合わせてタートルを取りに行くべきでした。" },
      { atSeconds: 482, kind: "build", text: "敵メイジが育ってきています。魔法防御アイテムの購入を検討しましょう。" },
      { atSeconds: 680, kind: "judgement", text: "この場面はロードよりもミッドタワーを優先する判断が良かったです。" },
      { atSeconds: 825, kind: "good", text: "ナイスガンク！敵キャリーを捕まえてチームに有利を作りました。" },
    ],
    scenes: [
      { atSeconds: 194, kind: "death", description: "視界のないブッシュでガンクを受けてデス" },
      { atSeconds: 328, kind: "turtle", description: "2体目のタートルを確保" },
      { atSeconds: 620, kind: "teamfight", description: "ミッドでの5v5集団戦に勝利" },
      { atSeconds: 748, kind: "lord", description: "ロード戦。スティール警戒でリトリビューション温存" },
      { atSeconds: 825, kind: "gank", description: "サイドレーンで敵キャリーを捕縛" },
      { atSeconds: 926, kind: "comeback", description: "ゴールド差を逆転する起点となった防衛戦" },
    ],
    categories: [
      { label: "レーン戦", score: 78, comment: "CS精度が高く、序盤のダメージトレードも優秀。" },
      { label: "ファーム効率", score: 64, comment: "中盤にフリーファームの時間を2回逃しています。" },
      { label: "オブジェクト", score: 58, comment: "タートルへの反応が平均4.2秒遅れています。" },
      { label: "ローテーション", score: 66, comment: "ミッド寄りの動きは良いが、視界のない移動が多め。" },
      { label: "視界管理", score: 52, comment: "ブッシュチェックの頻度が低く、被ガンク2回に直結。" },
      { label: "集団戦", score: 84, comment: "立ち位置とフォーカスが安定。火力貢献はロビー1位。" },
    ],
    buildAdvice: [
      { itemSlug: "wind-of-nature", reason: "敵アサシンの飛び込みに対して物理無効で生存率を上げる" },
      { itemSlug: "athenas-shield", reason: "敵メイジのバーストが伸びる12分以降に備える" },
    ],
    recommendedBuild: ["swift-boots", "windtalker", "berserkers-fury", "blade-of-despair", "wind-of-nature", "malefic-roar"],
    draftReview: "敵構成はダイブ2枚+ポーク1枚。味方のピールが薄いため、自衛スペル(ピュリファイ)か防御装備の早期購入が有効でした。ドラフト自体は相性五分です。",
    winRateDelta: 8.4,
    practiceMenu: [
      { title: "マップ確認を3秒に1回", description: "敵の動きを把握して安全に行動しましょう。リプレイの3:14を見返すと効果的です。" },
      { title: "オブジェクト優先意識", description: "タートル・ロードの時間を意識して30秒前からポジションを取りましょう。" },
      { title: "防御アイテムの購入タイミング", description: "敵の火力に合わせて早めに防御を積みましょう。" },
    ],
    focusPoints: [
      { title: "マップ確認を3秒に1回", description: "敵の動きを把握して安全に行動しましょう。" },
      { title: "オブジェクト優先意識", description: "タートル・ロードの時間を意識して動きましょう。" },
      { title: "防御アイテムの購入タイミング", description: "敵の火力に合わせて早めに防御を積みましょう。" },
    ],
    heatmap: {
      movement: heatGrid("m1-move", 12, [
        [9, 2, 0.9],
        [6, 6, 0.7],
        [3, 9, 0.4],
      ]),
      deaths: [
        [4, 3],
        [7, 6],
        [9, 8],
      ],
      vision: heatGrid("m1-vision", 12, [
        [8, 3, 0.6],
        [5, 7, 0.5],
      ]),
    },
    farmScore: 64,
    objectiveScore: 58,
    rotationScore: 66,
    visionScore: 52,
    laningScore: 78,
    teamfightScore: 84,
  },
  {
    matchId: "m-20260712-02",
    grade: "C+",
    score: 58,
    headline: "序盤の劣勢を引きずった試合。立て直しの判断を磨きましょう。",
    mvpActions: [
      "10:20の防衛戦でタワー下のダメージトレードを制した",
      "劣勢でもファーム差を最小限に抑えた",
    ],
    insights: [
      { atSeconds: 152, kind: "warning", text: "敵リン(Lv4)に対してレベル3で仕掛けています。レベル差のある交戦は避けましょう。" },
      { atSeconds: 274, kind: "improve", text: "デス後のリスポーン直後に単独でジャングルへ侵入しています。味方との合流を待つべきです。" },
      { atSeconds: 431, kind: "build", text: "敵カリーの真実ダメージにはHPよりも回避・シールド系が有効です。" },
      { atSeconds: 592, kind: "judgement", text: "この人数不利での集団戦参加は避け、サイドプッシュで圧力をかける選択がありました。" },
      { atSeconds: 810, kind: "good", text: "冷静なタワー下防衛。ミニオン処理の優先順位が正確でした。" },
    ],
    scenes: [
      { atSeconds: 152, kind: "death", description: "レベル差のある交戦でファーストデス" },
      { atSeconds: 274, kind: "death", description: "単独行動中にコレクションされる" },
      { atSeconds: 620, kind: "teamfight", description: "人数不利の集団戦で敗北" },
      { atSeconds: 810, kind: "objective", description: "タワー下防衛でウェーブを完璧に処理" },
      { atSeconds: 1105, kind: "lord", description: "敵のロード起動。スティール失敗" },
    ],
    categories: [
      { label: "レーン戦", score: 55, comment: "序盤のトレードで被ダメージが多く、回復に時間を消費。" },
      { label: "ファーム効率", score: 68, comment: "劣勢時のファーム維持は良好。" },
      { label: "オブジェクト", score: 42, comment: "タートル0/3。ジャングラーとの連携を強化しましょう。" },
      { label: "ローテーション", score: 51, comment: "単独行動が3回。マップ全体の人数把握を意識して。" },
      { label: "視界管理", score: 48, comment: "敵ジャングラーの位置を見失う時間が長い。" },
      { label: "集団戦", score: 62, comment: "エンゲージのタイミングは良いが、継続火力が不足。" },
    ],
    buildAdvice: [
      { itemSlug: "wind-of-nature", reason: "カリーの真実ダメージを物理無効でしのぐ" },
      { itemSlug: "immortality", reason: "集団戦での復活で数的不利を緩和する" },
    ],
    recommendedBuild: ["warrior-boots", "endless-battle", "berserkers-fury", "wind-of-nature", "blade-of-despair", "immortality"],
    draftReview: "敵のリン+カリーは後半スケール型。序盤に有利を作れなかった時点で不利が確定しやすい構成でした。序盤に強いドラフトなら、10分までにオブジェクトを集める意識を。",
    winRateDelta: 12.1,
    practiceMenu: [
      { title: "レベル差の把握", description: "交戦前に敵のレベルとアイテムを確認する癖をつけましょう。" },
      { title: "デス後の行動", description: "リスポーン後は必ずミニマップで味方の位置を確認してから移動を。" },
      { title: "劣勢時の選択肢", description: "人数不利ではサイドプッシュ・視界確保など「戦わない貢献」を選びましょう。" },
    ],
    focusPoints: [
      { title: "交戦前のレベル確認", description: "レベル差がある相手との交戦は避けましょう。" },
      { title: "単独行動の削減", description: "味方との合流を待ってから動きましょう。" },
      { title: "対真実ダメージの装備", description: "回避・シールド系装備を活用しましょう。" },
    ],
    heatmap: {
      movement: heatGrid("m2-move", 12, [
        [3, 8, 0.9],
        [6, 5, 0.5],
      ]),
      deaths: [
        [8, 2],
        [6, 5],
        [4, 4],
        [9, 7],
        [5, 9],
        [7, 3],
        [3, 6],
      ],
      vision: heatGrid("m2-vision", 12, [[4, 7, 0.45]]),
    },
    farmScore: 68,
    objectiveScore: 42,
    rotationScore: 51,
    visionScore: 48,
    laningScore: 55,
    teamfightScore: 62,
  },
];
