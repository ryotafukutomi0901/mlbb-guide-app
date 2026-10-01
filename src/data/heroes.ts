import { HERO_ROSTER } from "./heroes.roster";
import type { HeroDetail } from "./types";

export { HERO_ROSTER };

const summary = (slug: string) => {
  const hero = HERO_ROSTER.find((h) => h.slug === slug);
  if (!hero) throw new Error(`HERO_ROSTER に ${slug} が存在しません`);
  return hero;
};

// スキル名・効果は日本語クライアント表記に準拠(出典: mljpwiki.com/heros, wikiwiki.jp/mobilelegend)。
// 確認できない情報は書かない — docs/redesign/02_DATA_SPEC.md 2-5
export const HERO_DETAILS: Record<string, HeroDetail> = {
  alucard: {
    ...summary("alucard"),
    stats: [
      { level: 1, hp: 2535, hpRegen: 6.4, mana: 0, manaRegen: 0, physAtk: 117, magicPower: 0, physDef: 21, magicDef: 15, atkSpeed: 0.92, moveSpeed: 260 },
      { level: 5, hp: 3890, hpRegen: 9.8, mana: 0, manaRegen: 0, physAtk: 168, magicPower: 0, physDef: 61, magicDef: 32, atkSpeed: 1.02, moveSpeed: 260 },
      { level: 10, hp: 5870, hpRegen: 13.5, mana: 0, manaRegen: 0, physAtk: 208, magicPower: 0, physDef: 78, magicDef: 42, atkSpeed: 1.12, moveSpeed: 260 },
      { level: 15, hp: 7397, hpRegen: 17.6, mana: 0, manaRegen: 0, physAtk: 248, magicPower: 0, physDef: 92, magicDef: 51, atkSpeed: 1.21, moveSpeed: 260 },
    ],
    skills: [
      { name: "チェイス", type: "passive", description: "スキル使用後の通常攻撃が対象へ踏み込む攻撃になり、ダメージを与える。" },
      { name: "グランドスプリッター", type: "skill1", description: "指定方向へ飛び込み、範囲内の敵に物理ダメージと移動速度低下を与える。" },
      { name: "サークルスマッシュ", type: "skill2", description: "周囲の敵を斬りつけて物理ダメージを与える。" },
      { name: "フィッションウェーブ", type: "ultimate", description: "指定エリアの敵からエネルギーを吸収してステータスを変化させ、再使用で衝撃波を放つ。" },
    ],
    recommendedBuild: ["endless-battle", "berserkers-fury", "blade-of-despair", "immortality", "warrior-boots", "queens-wings"],
    story: "アルカードは、光の力によって蘇った半吸血鬼の戦士。かつて闇に堕ちた自らの過去と戦いながら、剣の力で人々を守る道を選んだ。",
  },
  tigreal: {
    ...summary("tigreal"),
    stats: [
      { level: 1, hp: 2807, hpRegen: 8.2, mana: 430, manaRegen: 2.5, physAtk: 111, magicPower: 0, physDef: 23, magicDef: 15, atkSpeed: 0.84, moveSpeed: 250 },
      { level: 5, hp: 3987, hpRegen: 11.4, mana: 570, manaRegen: 3.4, physAtk: 145, magicPower: 0, physDef: 55, magicDef: 30, atkSpeed: 0.9, moveSpeed: 250 },
      { level: 10, hp: 5642, hpRegen: 15.6, mana: 738, manaRegen: 4.5, physAtk: 187, magicPower: 0, physDef: 68, magicDef: 38, atkSpeed: 0.97, moveSpeed: 250 },
      { level: 15, hp: 7002, hpRegen: 19.9, mana: 906, manaRegen: 5.6, physAtk: 229, magicPower: 0, physDef: 79, magicDef: 45, atkSpeed: 1.05, moveSpeed: 250 },
    ],
    skills: [
      { name: "フィアレス", type: "passive", description: "スキル使用や通常攻撃で祝福マークを蓄積し、4個溜まると次に受ける通常攻撃のダメージを無効化する。" },
      { name: "アタックウェイブ", type: "skill1", description: "ハンマーで地面を叩き、指定方向へ3回の衝撃波を放って物理ダメージと減速を与える。" },
      { name: "セイントハンマー", type: "skill2", description: "指定方向へ突撃して敵を押し、再使用で正面の敵に追加ダメージとノックアップを与える。" },
      { name: "インプロージョン", type: "ultimate", description: "周囲の敵に物理ダメージを与えて引き寄せ、1.8秒間スタンさせる。" },
    ],
    recommendedBuild: ["athenas-shield", "antique-cuirass", "dominance-ice", "immortality", "tough-boots", "cursed-helmet"],
    story: "神聖同盟の若き騎士団長ティグラル。正義感が強く、味方を守るために最前線で戦うことをためらわない。",
  },
  franco: {
    ...summary("franco"),
    stats: [
      { level: 1, hp: 2823, hpRegen: 8.0, mana: 480, manaRegen: 2.6, physAtk: 114, magicPower: 0, physDef: 22, magicDef: 15, atkSpeed: 0.83, moveSpeed: 250 },
      { level: 15, hp: 7120, hpRegen: 19.4, mana: 968, manaRegen: 5.8, physAtk: 232, magicPower: 0, physDef: 80, magicDef: 46, atkSpeed: 1.02, moveSpeed: 250 },
    ],
    skills: [
      { name: "ワイルドフォース", type: "passive", description: "5秒間ダメージを受けないと移動速度が上昇し、毎秒HPを回復する。" },
      { name: "アイアンフック", type: "skill1", description: "指定方向へ鉄のフックを放ち、最初に命中した敵に物理ダメージを与えて引き寄せる。" },
      { name: "レイジショック", type: "skill2", description: "周囲の敵に物理ダメージを与え、1.5秒間の大幅な移動速度低下を付与する。" },
      { name: "マサクル", type: "ultimate", description: "指定した敵ヒーローを1.8秒間制圧し、6回連続で斬りつけて物理ダメージを与える。" },
    ],
    recommendedBuild: ["antique-cuirass", "athenas-shield", "dominance-ice", "immortality", "tough-boots", "brute-force-breastplate"],
    story: "荒野からやってきた無骨な戦士フランコ。巨大なフックを武器に、敵を的確に捕らえてチームに勝機をもたらす。",
  },
  layla: {
    ...summary("layla"),
    stats: [
      { level: 1, hp: 2372, hpRegen: 6.0, mana: 430, manaRegen: 2.5, physAtk: 116, magicPower: 0, physDef: 15, magicDef: 15, atkSpeed: 0.93, moveSpeed: 260 },
      { level: 15, hp: 6210, hpRegen: 14.8, mana: 906, manaRegen: 5.6, physAtk: 236, magicPower: 0, physDef: 47, magicDef: 45, atkSpeed: 1.31, moveSpeed: 260 },
    ],
    skills: [
      { name: "マジックガン", type: "passive", description: "敵との距離が遠いほど、通常攻撃とスキルのダメージが最大115%まで増加する。" },
      { name: "マジックボム", type: "skill1", description: "指定方向の敵を攻撃し、命中すると一時的に射程と移動速度が強化される。" },
      { name: "ボイドショット", type: "skill2", description: "敵にマークを付与し、対象とその周囲の敵に物理ダメージを与える。" },
      { name: "ディストラクトキャノン", type: "ultimate", description: "指定方向へエネルギー砲を放ち、経路上の敵に大きな物理ダメージを与える。パッシブで射程が拡張される。" },
    ],
    recommendedBuild: ["berserkers-fury", "blade-of-despair", "windtalker", "wind-of-nature", "swift-boots", "malefic-roar"],
    story: "科学者の娘であるライラは、亡き父の遺した砲を武器に、遠距離から敵を正確に撃ち抜く。",
  },
  eudora: {
    ...summary("eudora"),
    stats: [
      { level: 1, hp: 2372, hpRegen: 6.4, mana: 480, manaRegen: 2.8, physAtk: 111, magicPower: 0, physDef: 15, magicDef: 15, atkSpeed: 0.85, moveSpeed: 260 },
      { level: 15, hp: 6210, hpRegen: 15.6, mana: 1020, manaRegen: 6.4, physAtk: 199, magicPower: 0, physDef: 47, magicDef: 45, atkSpeed: 0.85, moveSpeed: 260 },
    ],
    skills: [
      { name: "スーパーコンダクター", type: "passive", description: "スキルが命中した敵を3秒間超電導状態にし、以降のスキルを強化する。" },
      { name: "フォークライトニング", type: "skill1", description: "扇状範囲に稲妻を放ち、超電導状態の敵には追加ダメージを与える。" },
      { name: "エレキアロー", type: "skill2", description: "対象をスタンさせて魔法防御を低下させる。超電導状態なら周囲の敵にも拡散する。" },
      { name: "サンダーストローク", type: "ultimate", description: "対象に強力な魔法ダメージを与える。超電導状態なら遅延ダメージと拡散ダメージが追加される。" },
    ],
    recommendedBuild: ["lightning-truncheon", "clock-of-destiny", "holy-crystal", "genius-wand", "arcane-boots", "winter-truncheon"],
    story: "雷の力を操る魔法使いエウドラ。かつての恩師の仇を討つため、その力を磨き続けている。",
  },
  gusion: {
    ...summary("gusion"),
    stats: [
      { level: 1, hp: 2422, hpRegen: 6.6, mana: 480, manaRegen: 3.0, physAtk: 0, magicPower: 111, physDef: 16, magicDef: 15, atkSpeed: 0.88, moveSpeed: 260 },
      { level: 15, hp: 6320, hpRegen: 15.9, mana: 1020, manaRegen: 6.8, physAtk: 0, magicPower: 249, physDef: 48, magicDef: 45, atkSpeed: 0.88, moveSpeed: 260 },
    ],
    skills: [
      { name: "ダガーマスタリー", type: "passive", description: "スキル使用でダガーにルーンが蓄積し、次の通常攻撃が強化されて追加ダメージと回復効果を得る。" },
      { name: "ソードスパイク", type: "skill1", description: "ダガーを投げて敵にマークを付け、再使用でその背後へ移動して追加ダメージを与える。" },
      { name: "シャドーブレイド", type: "skill2", description: "複数のダガーを投げてダメージと減速を与え、再使用でダガーを呼び戻して再度ダメージを与える。" },
      { name: "ライトワープ", type: "ultimate", description: "指定地点へ瞬間移動し、他スキルのクールダウンをリセットしてダガーの数を増やす。" },
    ],
    recommendedBuild: ["genius-wand", "clock-of-destiny", "lightning-truncheon", "holy-crystal", "magic-shoes", "winter-truncheon"],
    story: "名門の血を引く魔剣士ゴセン。ダガーを操る華麗な戦闘スタイルで、瞬時に敵の急所を突く。",
  },
  angela: {
    ...summary("angela"),
    stats: [
      { level: 1, hp: 2270, hpRegen: 6.2, mana: 480, manaRegen: 2.9, physAtk: 100, magicPower: 0, physDef: 15, magicDef: 15, atkSpeed: 0.85, moveSpeed: 260 },
      { level: 15, hp: 5890, hpRegen: 14.5, mana: 1020, manaRegen: 6.6, physAtk: 170, magicPower: 0, physDef: 47, magicDef: 45, atkSpeed: 0.85, moveSpeed: 260 },
    ],
    skills: [
      { name: "スピリチュアルハート", type: "passive", description: "スキル使用時に移動速度が上昇し、憑依中の味方にもその効果が適用される。" },
      { name: "ラブウェーブ", type: "skill1", description: "敵に魔法ダメージとラブマークを与え、味方には回復を提供する。" },
      { name: "マリオネットバインド", type: "skill2", description: "敵に段階的な減速を与え、一定時間後にバインド状態にして追加ダメージを与える。" },
      { name: "ラブデリバリー", type: "ultimate", description: "指定した味方にシールドを付与して憑依し、MP消費なしでスキルを使用できる状態になる。" },
    ],
    recommendedBuild: ["dominance-ice", "enchanted-talisman", "wish-bracelet", "rapid-boots"],
    story: "機械人形のアンジェラは、大切な人を守るために自らの意識を味方に重ね合わせる。",
  },
  estes: {
    ...summary("estes"),
    stats: [
      { level: 1, hp: 2540, hpRegen: 7.0, mana: 480, manaRegen: 3.0, physAtk: 104, magicPower: 0, physDef: 17, magicDef: 15, atkSpeed: 0.83, moveSpeed: 260 },
      { level: 15, hp: 6540, hpRegen: 16.4, mana: 1020, manaRegen: 6.8, physAtk: 178, magicPower: 0, physDef: 49, magicDef: 45, atkSpeed: 0.83, moveSpeed: 260 },
    ],
    skills: [
      { name: "月の聖典", type: "passive", description: "通常攻撃が強化され、対象と周囲の敵に魔法ダメージを与えて移動速度を低下させる。" },
      { name: "月光の神秘", type: "skill1", description: "指定した味方を回復し、リンクを張って継続的な回復と防御強化を与える。" },
      { name: "月神の領域", type: "skill2", description: "指定地点に月光を落として敵にダメージを与え、その範囲内の敵の位置を表示して減速させる。" },
      { name: "月神の賜物", type: "ultimate", description: "周囲の味方全員に強化された月光の神秘をかけ、自身のHPも大きく回復する。" },
    ],
    recommendedBuild: ["enchanted-talisman", "dominance-ice", "wish-bracelet", "rapid-boots"],
    story: "森の精霊エスタス。自然の力を借りて仲間を癒やし、パーティの生命線を支える。",
  },
  fanny: {
    ...summary("fanny"),
    stats: [
      { level: 1, hp: 2450, hpRegen: 6.6, mana: 480, manaRegen: 0, physAtk: 118, magicPower: 0, physDef: 16, magicDef: 15, atkSpeed: 0.86, moveSpeed: 260 },
      { level: 15, hp: 6360, hpRegen: 15.8, mana: 1020, manaRegen: 0, physAtk: 252, magicPower: 0, physDef: 48, magicDef: 45, atkSpeed: 0.86, moveSpeed: 260 },
    ],
    skills: [
      { name: "エアムーブ", type: "passive", description: "飛行中はダメージが増加し、敵にハンターマークを付与する。マーク1つにつきエネルギーが回復する。" },
      { name: "トルネードストライク", type: "skill1", description: "刃を回転させて周囲の敵に物理ダメージを与える。" },
      { name: "スチールケーブル", type: "skill2", description: "ケーブルを射出して障害物へ飛行する。敵に接触するとトルネードストライクが自動発動する。" },
      { name: "フラッタースラッシュ", type: "ultimate", description: "対象に斬撃を放つ。付与されたハンターマーク1つにつきダメージが30%増加する。" },
    ],
    recommendedBuild: ["endless-battle", "blade-of-despair", "berserkers-fury", "warrior-boots"],
    story: "ワイヤーアクションを駆使する凄腕のアサシン、ファニー。空中を縦横無尽に駆け巡り敵を翻弄する。",
  },
};
