import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  Crown,
  Dices,
  FileText,
  Home,
  ListOrdered,
  Newspaper,
  Search,
  Settings,
  Shield,
  Sparkles,
  Swords,
  Target,
  Timer,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "PLAY",
    items: [{ href: "/", label: "ホーム", icon: Home }],
  },
  {
    label: "HEROES",
    items: [
      { href: "/characters", label: "ヒーロー一覧", icon: Users },
      { href: "/tier-list", label: "Tierリスト", icon: Crown },
      { href: "/meta", label: "Metaランキング", icon: BarChart3 },
      { href: "/counters", label: "カウンター", icon: Target },
    ],
  },
  {
    label: "BUILD",
    items: [
      { href: "/simulator", label: "ビルドシミュレーター", icon: Swords },
      { href: "/compendium/items", label: "アイテム図鑑", icon: BookOpen },
      { href: "/compendium/emblems", label: "エンブレム", icon: Shield },
      { href: "/compendium/spells", label: "バトルスペル", icon: Zap },
    ],
  },
  {
    label: "INTEL",
    items: [
      { href: "/compendium/jungle", label: "ジャングル / タイマー", icon: Timer },
      { href: "/coach", label: "AIコーチ", icon: Bot },
      { href: "/analysis", label: "試合分析", icon: ListOrdered },
      { href: "/ranking", label: "ランキング", icon: Trophy },
    ],
  },
  {
    label: "VAULT",
    items: [
      { href: "/skins", label: "スキン一覧", icon: Sparkles },
      { href: "/gacha", label: "ガチャシミュレーター", icon: Dices },
    ],
  },
  {
    label: "NEWS",
    items: [
      { href: "/news", label: "ニュース", icon: Newspaper },
      { href: "/events", label: "イベント", icon: CalendarDays },
      { href: "/patches", label: "パッチノート", icon: FileText },
    ],
  },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { href: "/profile", label: "プロフィール", icon: User },
  { href: "/settings", label: "設定", icon: Settings },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/characters", label: "ヒーロー", icon: Users },
  { href: "/simulator", label: "ビルド", icon: Swords },
  { href: "/coach", label: "コーチ", icon: Bot },
  { href: "/search", label: "メニュー", icon: Search },
];

export const SEARCH_NAV_ITEM: NavItem = { href: "/search", label: "検索", icon: Search };

export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...FOOTER_NAV_ITEMS,
  SEARCH_NAV_ITEM,
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
