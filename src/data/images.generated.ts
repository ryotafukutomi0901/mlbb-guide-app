// このファイルは scripts/gen/assets.mjs が生成します。直接編集しないでください。
// 情報源: docs/redesign/data/assets-manifest.json
// 画像の著作権はMoonton社に帰属します(本サイトは非公式ファンサイト)。

/** エンブレムslug -> 画像パス */
export const EMBLEM_IMAGES: Record<string, string> = {
  "assassin": "/images/emblems/assassin.png",
  "mage": "/images/emblems/mage.png",
  "marksman": "/images/emblems/marksman.png",
  "fighter": "/images/emblems/fighter.png",
  "tank": "/images/emblems/tank.png",
  "support": "/images/emblems/support.png",
  "jungle": "/images/emblems/jungle.png",
};

/** ジャングルモンスターslug -> 画像パス */
export const JUNGLE_IMAGES_GENERATED: Record<string, string> = {
  "crab": "/images/jungle/crab.png",
  "fiend": "/images/jungle/fiend.png",
  "serpent": "/images/jungle/serpent.png",
  "rockursa": "/images/jungle/rockursa.png",
  "scaled-lizard": "/images/jungle/scaled-lizard.png",
  "lithowanderer": "/images/jungle/lithowanderer.png",
  "turtle": "/images/jungle/turtle.png",
  "lord": "/images/jungle/lord.png",
};

/** `${heroSlug}/${slot}` -> 画像パス */
export const SKILL_IMAGES_GENERATED: Record<string, string> = {
  "alucard/passive": "/images/skills/alucard-passive.png",
  "alucard/skill1": "/images/skills/alucard-skill1.png",
  "alucard/skill2": "/images/skills/alucard-skill2.png",
  "alucard/ultimate": "/images/skills/alucard-ultimate.png",
  "tigreal/passive": "/images/skills/tigreal-passive.png",
  "tigreal/skill1": "/images/skills/tigreal-skill1.png",
  "tigreal/skill2": "/images/skills/tigreal-skill2.png",
  "tigreal/ultimate": "/images/skills/tigreal-ultimate.png",
  "franco/passive": "/images/skills/franco-passive.png",
  "franco/skill1": "/images/skills/franco-skill1.png",
  "franco/skill2": "/images/skills/franco-skill2.png",
  "franco/ultimate": "/images/skills/franco-ultimate.png",
  "layla/passive": "/images/skills/layla-passive.png",
  "layla/skill1": "/images/skills/layla-skill1.png",
  "layla/skill2": "/images/skills/layla-skill2.png",
  "layla/ultimate": "/images/skills/layla-ultimate.png",
  "eudora/passive": "/images/skills/eudora-passive.png",
  "eudora/skill1": "/images/skills/eudora-skill1.png",
  "eudora/skill2": "/images/skills/eudora-skill2.png",
  "eudora/ultimate": "/images/skills/eudora-ultimate.png",
  "gusion/passive": "/images/skills/gusion-passive.png",
  "gusion/skill1": "/images/skills/gusion-skill1.png",
  "gusion/skill2": "/images/skills/gusion-skill2.png",
  "gusion/ultimate": "/images/skills/gusion-ultimate.png",
  "angela/passive": "/images/skills/angela-passive.png",
  "angela/skill1": "/images/skills/angela-skill1.png",
  "angela/skill2": "/images/skills/angela-skill2.png",
  "angela/ultimate": "/images/skills/angela-ultimate.png",
  "estes/passive": "/images/skills/estes-passive.png",
  "estes/skill1": "/images/skills/estes-skill1.png",
  "estes/skill2": "/images/skills/estes-skill2.png",
  "estes/ultimate": "/images/skills/estes-ultimate.png",
  "fanny/passive": "/images/skills/fanny-passive.png",
  "fanny/skill1": "/images/skills/fanny-skill1.png",
  "fanny/skill2": "/images/skills/fanny-skill2.png",
  "fanny/ultimate": "/images/skills/fanny-ultimate.png",
};

/** アイテムslug -> 画像パス(既存ITEM_IMAGESへの追加分) */
export const ITEM_IMAGES_GENERATED: Record<string, string> = {
  "raptor-machete": "/images/items/raptor-machete.png",
  "hunters-knife": "/images/items/hunter-s-knife.png",
  "rogue-meteor": "/images/items/rogue-meteor.png",
  "ogre-tomahawk": "/images/items/ogre-tomahawk.png",
  "windtalker-scarlet": "/images/items/scarlet-phantom.png",
  "magic-blade": "/images/items/magic-blade.png",
  "mystic-container": "/images/items/mystic-container.png",
};
