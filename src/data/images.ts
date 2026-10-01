import { ITEM_IMAGES_GENERATED } from "./images.generated";

// 画像URLをもらうたびにここへ追記していく(スラッグ -> /images/... のパス)。
// 未登録のスラッグは各コンポーネント側でプレースホルダー表示にフォールバックする。

// ヒーロー画像は scripts/gen/heroes.mjs が正準データから生成する(heroes.roster.ts)。
export { HERO_PORTRAITS as HERO_IMAGES } from "./heroes.roster";

// 画像ファイル名は英語アイテム名のkebab-case(public/images/items/)。
// ゲーム内リネーム済みアイテムは現行名の画像を割当(winter-truncheon→Winter Crown, magic-shoes→Magic Boots)。
export const ITEM_IMAGES: Record<string, string> = {
  "blade-of-despair": "/images/items/blade-of-despair.png",
  "berserkers-fury": "/images/items/berserker-s-fury.png",
  "endless-battle": "/images/items/endless-battle.png",
  windtalker: "/images/items/windtalker.png",
  "malefic-roar": "/images/items/malefic-roar.png",
  "haas-claws": "/images/items/haas-s-claws.png",
  "war-axe": "/images/items/war-axe.png",
  "corrosion-scythe": "/images/items/corrosion-scythe.png",
  "demon-hunter-sword": "/images/items/demon-hunter-sword.png",
  "rose-gold-meteor": "/images/items/rose-gold-meteor.png",
  "genius-wand": "/images/items/genius-wand.png",
  "holy-crystal": "/images/items/holy-crystal.png",
  "lightning-truncheon": "/images/items/lightning-truncheon.png",
  "clock-of-destiny": "/images/items/clock-of-destiny.png",
  "winter-truncheon": "/images/items/winter-crown.png",
  "concentrated-energy": "/images/items/concentrated-energy.png",
  "divine-glaive": "/images/items/divine-glaive.png",
  "athenas-shield": "/images/items/athena-s-shield.png",
  "antique-cuirass": "/images/items/antique-cuirass.png",
  "dominance-ice": "/images/items/dominance-ice.png",
  immortality: "/images/items/immortality.png",
  "radiant-armor": "/images/items/radiant-armor.png",
  "brute-force-breastplate": "/images/items/brute-force-breastplate.png",
  "cursed-helmet": "/images/items/cursed-helmet.png",
  "queens-wings": "/images/items/queen-s-wings.png",
  "wind-of-nature": "/images/items/wind-of-nature.png",
  "warrior-boots": "/images/items/warrior-boots.png",
  "swift-boots": "/images/items/swift-boots.png",
  "arcane-boots": "/images/items/arcane-boots.png",
  "magic-shoes": "/images/items/magic-boots.png",
  "tough-boots": "/images/items/tough-boots.png",
  "rapid-boots": "/images/items/rapid-boots.png",
  "enchanted-talisman": "/images/items/enchanted-talisman.png",
  "fleeting-time": "/images/items/fleeting-time.png",
  oracle: "/images/items/oracle.png",
  "blade-of-the-heptaseas": "/images/items/blade-of-the-heptaseas.png",
  "golden-staff": "/images/items/golden-staff.png",
  "great-dragon-spear": "/images/items/great-dragon-spear.png",
  "hunter-strike": "/images/items/hunter-strike.png",
  "malefic-gun": "/images/items/malefic-gun.png",
  "sea-halberd": "/images/items/sea-halberd.png",
  "sky-piercer": "/images/items/sky-piercer.png",
  "blood-wings": "/images/items/blood-wings.png",
  "feather-of-heaven": "/images/items/feather-of-heaven.png",
  "glowing-wand": "/images/items/glowing-wand.png",
  "ice-queen-wand": "/images/items/ice-queen-wand.png",
  "starlium-scythe": "/images/items/starlium-scythe.png",
  "wishing-lantern": "/images/items/wishing-lantern.png",
  "blade-armor": "/images/items/blade-armor.png",
  "guardian-helmet": "/images/items/guardian-helmet.png",
  "thunder-belt": "/images/items/thunder-belt.png",
  "twilight-armor": "/images/items/twilight-armor.png",
  "demon-boots": "/images/items/demon-boots.png",
  "flask-of-the-oasis": "/images/items/flask-of-the-oasis.png",
  "chastise-pauldron": "/images/items/chastise-pauldron.png",
  ...ITEM_IMAGES_GENERATED,
};

// スキル・ジャングル・エンブレム画像は scripts/gen/assets.mjs が生成する
// (docs/redesign/data/assets-manifest.json が情報源)。
export {
  EMBLEM_IMAGES,
  JUNGLE_IMAGES_GENERATED as JUNGLE_IMAGES,
  SKILL_IMAGES_GENERATED as SKILL_IMAGES,
} from "./images.generated";
