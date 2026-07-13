export type Role =
  | "tank"
  | "fighter"
  | "assassin"
  | "mage"
  | "marksman"
  | "support";

export const ROLE_LABEL: Record<Role, string> = {
  tank: "タンク",
  fighter: "ファイター",
  assassin: "アサシン",
  mage: "メイジ",
  marksman: "マークスマン",
  support: "サポート",
};

export type Lane = "gold" | "exp" | "mid" | "jungle" | "roam";

export const LANE_LABEL: Record<Lane, string> = {
  gold: "ゴールドレーン",
  exp: "EXPレーン",
  mid: "ミッドレーン",
  jungle: "ジャングル",
  roam: "ローム",
};

export type Tier = "S+" | "S" | "A+" | "A" | "B+" | "B";

export interface HeroSummary {
  slug: string;
  name: string;
  nameEn: string;
  roles: Role[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  tier: Tier;
  releaseYear: number;
}

export interface HeroMeta {
  slug: string;
  winRate: number;
  pickRate: number;
  banRate: number;
  trend: number;
}

export interface HeroStatPoint {
  level: number;
  hp: number;
  hpRegen: number;
  mana: number;
  manaRegen: number;
  physAtk: number;
  magicPower: number;
  physDef: number;
  magicDef: number;
  atkSpeed: number;
  moveSpeed: number;
}

export type SkillSlot = "passive" | "skill1" | "skill2" | "ultimate";

export const SKILL_SLOT_LABEL: Record<SkillSlot, string> = {
  passive: "パッシブ",
  skill1: "スキル1",
  skill2: "スキル2",
  ultimate: "アルティメット",
};

export interface HeroSkill {
  name: string;
  type: SkillSlot;
  description: string;
  cooldown?: number[];
  cost?: number[];
  tags?: string[];
}

export interface HeroDetail extends HeroSummary {
  stats: HeroStatPoint[];
  skills: HeroSkill[];
  recommendedBuild: string[];
  story: string;
  lane?: Lane;
  recommendedSpells?: string[];
  recommendedEmblem?: string;
  counters?: string[];
  counteredBy?: string[];
  synergies?: string[];
}

export type ItemCategory =
  | "attack"
  | "magic"
  | "defense"
  | "movement"
  | "jungle"
  | "support";

export const ITEM_CATEGORY_LABEL: Record<ItemCategory, string> = {
  attack: "攻撃",
  magic: "魔法",
  defense: "防御",
  movement: "移動",
  jungle: "ジャングル",
  support: "サポート",
};

export interface ItemBonus {
  hp?: number;
  mana?: number;
  physAtk?: number;
  magicPower?: number;
  physDef?: number;
  magicDef?: number;
  moveSpeed?: number;
  moveSpeedPct?: number;
  atkSpeedPct?: number;
  critChancePct?: number;
  cdrPct?: number;
  physPenPct?: number;
  magicPenPct?: number;
  lifestealPct?: number;
  spellVampPct?: number;
  hpRegen?: number;
}

export interface Item {
  slug: string;
  name: string;
  category: ItemCategory;
  price: number;
  stats: string[];
  passive: string;
  bonus: ItemBonus;
  buildsFrom?: string[];
  recommendedFor?: Role[];
}

export type JungleMonsterCategory = "little" | "turtle" | "lord";

export interface JungleMonster {
  slug: string;
  name: string;
  category: JungleMonsterCategory;
  firstSpawn: string;
  respawn: string;
  firstSpawnSeconds: number;
  respawnSeconds: number;
  effect: string;
  teamReward?: string;
  hp?: number;
  gold?: number;
  exp?: number;
  mapArea?: string;
}

export type NewsCategory = "collab" | "skin" | "event" | "patch";

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  collab: "コラボ",
  skin: "新スキン",
  event: "イベント",
  patch: "パッチ",
};

export interface NewsItem {
  slug: string;
  title: string;
  category: NewsCategory;
  date: string;
  summary: string;
  body?: string[];
}

export interface BattleSpell {
  slug: string;
  name: string;
  nameEn: string;
  unlockLevel: number;
  cooldown: number;
  description: string;
  bestFor: Role[];
  effectSummary: string;
}

export interface EmblemTalent {
  name: string;
  tier: 1 | 2 | 3;
  description: string;
}

export interface Emblem {
  slug: string;
  name: string;
  nameEn: string;
  color: string;
  stats: string[];
  bonus: ItemBonus;
  talents: EmblemTalent[];
  bestFor: Role[];
}

export type SkinRarity = "basic" | "elite" | "special" | "epic" | "legend" | "collector" | "collab";

export const SKIN_RARITY_LABEL: Record<SkinRarity, string> = {
  basic: "ベーシック",
  elite: "エリート",
  special: "スペシャル",
  epic: "エピック",
  legend: "レジェンド",
  collector: "コレクター",
  collab: "コラボ",
};

export interface Skin {
  slug: string;
  heroSlug: string;
  name: string;
  rarity: SkinRarity;
  releaseDate: string;
  price: string;
  description: string;
  effects: string[];
  owned?: boolean;
}

export interface GachaPool {
  slug: string;
  name: string;
  bannerText: string;
  costSingle: number;
  costTen: number;
  endsAt: string;
  rates: { rarity: SkinRarity; rate: number }[];
  featured: string[];
  pity: number;
}

export interface GameEvent {
  slug: string;
  name: string;
  category: "collab" | "season" | "login" | "shop";
  startDate: string;
  endDate: string;
  description: string;
  rewards: string[];
  progress?: number;
}

export type PatchChangeType = "buff" | "nerf" | "adjust" | "new" | "rework";

export const PATCH_CHANGE_LABEL: Record<PatchChangeType, string> = {
  buff: "強化",
  nerf: "弱体化",
  adjust: "調整",
  new: "新規",
  rework: "リワーク",
};

export interface PatchChange {
  target: string;
  targetSlug?: string;
  kind: "hero" | "item" | "system";
  type: PatchChangeType;
  notes: string[];
}

export interface PatchNote {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  changes: PatchChange[];
}

export type RankTier =
  | "warrior"
  | "elite"
  | "master"
  | "grandmaster"
  | "epic"
  | "legend"
  | "mythic"
  | "mythical-glory";

export const RANK_TIER_LABEL: Record<RankTier, string> = {
  warrior: "ウォリアー",
  elite: "エリート",
  master: "マスター",
  grandmaster: "グランドマスター",
  epic: "エピック",
  legend: "レジェンド",
  mythic: "ミシック",
  "mythical-glory": "ミシックグローリー",
};

export interface RankingPlayer {
  rank: number;
  name: string;
  tag: string;
  tier: RankTier;
  points: number;
  winRate: number;
  matches: number;
  mainHeroes: string[];
  region: string;
}

export interface PlayerProfile {
  name: string;
  tag: string;
  level: number;
  avatarHero: string;
  rankTier: RankTier;
  rankStars: number;
  totalMatches: number;
  winRate: number;
  favoriteRole: Role;
  mainHeroes: { slug: string; matches: number; winRate: number }[];
  seasonHighlights: { label: string; value: string }[];
  skinCount: number;
  collectionScore: number;
}

export interface MatchPlayerLine {
  heroSlug: string;
  playerName: string;
  kda: [number, number, number];
  gold: number;
  damage: number;
  isSelf?: boolean;
}

export interface MatchRecord {
  id: string;
  result: "victory" | "defeat";
  mode: string;
  heroSlug: string;
  kda: [number, number, number];
  gold: number;
  damagePerMin: number;
  killParticipation: number;
  durationSeconds: number;
  playedAt: string;
  mvp?: boolean;
  allies: MatchPlayerLine[];
  enemies: MatchPlayerLine[];
  hasCoachReport?: boolean;
}

export type CoachInsightKind = "improve" | "warning" | "build" | "judgement" | "good";

export const COACH_INSIGHT_LABEL: Record<CoachInsightKind, string> = {
  improve: "改善ポイント",
  warning: "注意ポイント",
  build: "ビルドアドバイス",
  judgement: "判断アドバイス",
  good: "良かったポイント",
};

export interface CoachInsight {
  atSeconds: number;
  kind: CoachInsightKind;
  text: string;
}

export type TimelineSceneKind =
  | "death"
  | "turtle"
  | "teamfight"
  | "lord"
  | "gank"
  | "comeback"
  | "kill"
  | "objective";

export const TIMELINE_SCENE_LABEL: Record<TimelineSceneKind, string> = {
  death: "デスシーン",
  turtle: "タートル戦",
  teamfight: "集団戦",
  lord: "ロード戦",
  gank: "ガンク成功",
  comeback: "逆転の起点",
  kill: "キル",
  objective: "オブジェクト",
};

export interface TimelineScene {
  atSeconds: number;
  kind: TimelineSceneKind;
  description: string;
}

export interface CoachCategoryScore {
  label: string;
  score: number;
  comment: string;
}

export interface CoachReport {
  matchId: string;
  grade: string;
  score: number;
  headline: string;
  mvpActions: string[];
  insights: CoachInsight[];
  scenes: TimelineScene[];
  categories: CoachCategoryScore[];
  buildAdvice: { itemSlug: string; reason: string }[];
  recommendedBuild: string[];
  draftReview: string;
  winRateDelta: number;
  practiceMenu: { title: string; description: string }[];
  focusPoints: { title: string; description: string }[];
  heatmap: { movement: number[][]; deaths: [number, number][]; vision: number[][] };
  farmScore: number;
  objectiveScore: number;
  rotationScore: number;
  visionScore: number;
  laningScore: number;
  teamfightScore: number;
}
