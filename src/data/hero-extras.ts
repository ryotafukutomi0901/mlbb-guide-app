import type { CounterEdge, HeroDetail } from "./types";

// 相性データは「なぜそうなるか」を書ける組み合わせだけを掲載する。
// 理由を説明できない相性は載せない(推測の禁止 — docs/redesign/02_DATA_SPEC.md 2-4)。
// このデータはAIコーチのKnowledge Layerも兼ねる。
type HeroExtras = Pick<
  HeroDetail,
  "recommendedSpells" | "recommendedEmblem" | "counters" | "counteredBy" | "synergies"
>;

const edge = (slug: string, reason: string, factors: CounterEdge["factors"]): CounterEdge => ({
  slug,
  reason,
  factors,
});

export const HERO_EXTRAS: Record<string, HeroExtras> = {
  alucard: {
    recommendedSpells: ["retribution", "execute"],
    recommendedEmblem: "assassin",
    counters: [
      edge("layla", "移動スキルを持たないマークスマンには、突進からの連続攻撃で一気に距離を詰められる。", ["mobility", "burst"]),
      edge("miya", "序盤の単体戦闘力が高く、レーンでのダメージトレードで押し勝てる。", ["lane", "burst"]),
    ],
    counteredBy: [
      edge("franco", "フックで動きを止められると、ライフスティールで回復する前に集中砲火を受ける。", ["cc", "pick"]),
      edge("khufra", "突進を封じられると、離脱手段を失ったまま囲まれる。", ["cc", "mobility"]),
    ],
    synergies: [
      edge("angela", "アルティメットで守られると、被弾を恐れず敵陣へ踏み込める。", ["sustain"]),
      edge("tigreal", "敵を一箇所に集めてもらえると、範囲攻撃の回復量が最大化する。", ["cc"]),
    ],
  },
  tigreal: {
    recommendedSpells: ["flicker", "petrify"],
    recommendedEmblem: "tank",
    counters: [
      edge("layla", "移動スキルがない後衛は、アルティメットで引き寄せられると逃げられない。", ["cc", "mobility"]),
      edge("gord", "詠唱位置が固定されがちなメイジは、集団拘束の的になりやすい。", ["cc"]),
    ],
    counteredBy: [
      edge("diggie", "アルティメットで味方の行動妨害を解除されると、集団拘束が空振りになる。", ["cc"]),
      edge("valentina", "アルティメットを複製されると、こちらの集団拘束をそのまま撃ち返される。", ["cc"]),
    ],
    synergies: [
      edge("eudora", "引き寄せた敵にスタンと範囲バーストを重ねられる。", ["cc", "burst"]),
      edge("gord", "拘束中の敵に長時間の範囲ダメージを当て続けられる。", ["cc", "burst"]),
    ],
  },
  franco: {
    recommendedSpells: ["flicker", "aegis"],
    recommendedEmblem: "tank",
    counters: [
      edge("layla", "移動スキルを持たない後衛は、フック1回で戦線から引き剥がされる。", ["pick", "cc"]),
      edge("estes", "回復役を単体で捕獲できると、味方の継続力を一度に削げる。", ["pick"]),
    ],
    counteredBy: [
      edge("diggie", "行動妨害の解除と免疫を配られると、フックを当てても継続しない。", ["cc"]),
      edge("khufra", "こちらが踏み込む位置を制圧されると、フックの射程に入る前に止められる。", ["cc"]),
    ],
    synergies: [
      edge("eudora", "捕獲した敵にスタンと高倍率のバーストを重ねて即座に落とせる。", ["burst", "cc"]),
      edge("kagura", "引き寄せ地点に事前設置した範囲スキルを重ねられる。", ["burst"]),
    ],
  },
  layla: {
    recommendedSpells: ["inspire", "flicker"],
    recommendedEmblem: "marksman",
    counters: [
      edge("belerick", "射程が長く、近接主体のタンクに対して安全な距離から削り続けられる。", ["range"]),
      edge("gatotkaca", "接近前に射程外から攻撃を通せるため、単独では捕まえられにくい。", ["range"]),
    ],
    counteredBy: [
      edge("fanny", "移動スキルがないため、高速で接近されると回避手段が一切ない。", ["mobility", "burst"]),
      edge("gusion", "コンボ一巡で耐久値を超えるダメージを受ける。", ["burst"]),
      edge("ling", "壁を越えて接近されると、位置取りだけでは守り切れない。", ["mobility", "burst"]),
    ],
    synergies: [
      edge("tigreal", "敵を拘束してもらえれば、最大射程から一方的に撃ち込める。", ["cc", "range"]),
      edge("estes", "継続回復を受けると、前線に近い位置でも撃ち続けられる。", ["sustain"]),
    ],
  },
  eudora: {
    recommendedSpells: ["flicker", "purify"],
    recommendedEmblem: "mage",
    counters: [
      edge("layla", "スタンから繋ぐバーストで、耐久値の低い後衛を一度に落とせる。", ["burst", "cc"]),
      edge("miya", "近距離でのバースト勝負になれば、こちらの方が先に撃ち切れる。", ["burst"]),
    ],
    counteredBy: [
      edge("diggie", "行動妨害を解除されるとコンボの起点が消える。", ["cc"]),
      edge("valentina", "アルティメットを複製されると、同等のバーストを撃ち返される。", ["burst"]),
    ],
    synergies: [
      edge("franco", "捕獲された敵に確実にコンボを叩き込める。", ["cc", "burst"]),
      edge("tigreal", "集団拘束に合わせて範囲バーストを最大化できる。", ["cc", "burst"]),
    ],
  },
  gusion: {
    recommendedSpells: ["retribution", "flicker"],
    recommendedEmblem: "mage",
    counters: [
      edge("layla", "コンボ一巡のバーストが耐久値を上回る。", ["burst"]),
      edge("gord", "移動スキルの乏しいメイジには、接近から即座に撃ち切れる。", ["burst", "mobility"]),
    ],
    counteredBy: [
      edge("khufra", "突進を封じられるとコンボが繋がらず、そのまま反撃を受ける。", ["mobility", "cc"]),
      edge("chou", "行動妨害耐性のある突進と打ち上げで、踏み込んだ瞬間に返される。", ["cc"]),
      edge("phoveus", "突進スキルの使用そのものが追撃の起点にされる。", ["mobility"]),
    ],
    synergies: [
      edge("angela", "守りを付けてもらえると、深い位置まで踏み込んでから離脱できる。", ["sustain"]),
      edge("franco", "捕獲された敵にコンボを確実に当てられる。", ["cc", "burst"]),
    ],
  },
  angela: {
    recommendedSpells: ["flicker", "revitalize"],
    recommendedEmblem: "support",
    counters: [
      edge("alucard", "回復に依存する前衛でも、こちらの支援を受けた味方の火力で押し切れる。", ["sustain"]),
    ],
    counteredBy: [
      edge("franco", "自衛手段が乏しく、単体で捕獲されると何もできずに落ちる。", ["pick", "cc"]),
      edge("khufra", "位置を制圧されると、味方から切り離されて狙われる。", ["cc", "pick"]),
    ],
    synergies: [
      edge("alucard", "アルティメットで守りを付ければ、敵陣に踏み込む前衛の生存率が上がる。", ["sustain"]),
      edge("fanny", "高機動アサシンに遠隔から守りを届けられる。", ["sustain", "mobility"]),
      edge("ling", "単独で踏み込むアサシンを離れた位置から支援できる。", ["sustain"]),
    ],
  },
  estes: {
    recommendedSpells: ["flicker", "revitalize"],
    recommendedEmblem: "support",
    counters: [
      edge("dyrroth", "継続回復でレーンの削りを打ち消し、味方の耐久勝負を成立させる。", ["sustain"]),
      edge("alucard", "こちらの回復量が相手の削り速度を上回る。", ["sustain"]),
    ],
    counteredBy: [
      edge("baxia", "パッシブで回復量を抑え込まれると、こちらの強みが機能しない。", ["sustain"]),
      edge("franco", "単体で捕獲されると、回復を届ける前に戦線から外される。", ["pick", "cc"]),
    ],
    synergies: [
      edge("miya", "継続回復を受けたマークスマンが前線を維持し続けられる。", ["sustain"]),
      edge("layla", "耐久値の低い後衛を支え、射程を活かした位置取りを可能にする。", ["sustain"]),
      edge("irithel", "移動しながら撃つマークスマンと回復範囲の相性が良い。", ["sustain"]),
    ],
  },
  fanny: {
    recommendedSpells: ["retribution", "aegis"],
    recommendedEmblem: "assassin",
    counters: [
      edge("layla", "移動スキルのない後衛は、高速接近に対して何もできない。", ["mobility", "burst"]),
      edge("gord", "詠唱を狙って一瞬で接近し、撃ち切る前に落とせる。", ["mobility", "burst"]),
    ],
    counteredBy: [
      edge("khufra", "移動スキルを封じられると、機動力を前提にした戦い方が完全に止まる。", ["mobility", "cc"]),
      edge("franco", "移動中にフックで止められると、そのまま撃ち落とされる。", ["cc", "pick"]),
      edge("phoveus", "移動スキルの使用が相手の追撃条件になり、離脱しても追われる。", ["mobility"]),
    ],
    synergies: [
      edge("angela", "遠隔から守りを付けてもらえると、踏み込みの成功率が上がる。", ["sustain"]),
      edge("diggie", "行動妨害を解除してもらえれば、捕まっても離脱を続けられる。", ["cc"]),
    ],
  },
};
