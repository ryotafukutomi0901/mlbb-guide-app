import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Shield, Timer, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "図鑑" };

const SECTIONS = [
  {
    href: "/compendium/items",
    icon: BookOpen,
    tone: "text-primary bg-primary/15",
    title: "アイテム図鑑",
    description: "攻撃・魔法・防御・移動など全アイテムのステータスと派生ツリー",
  },
  {
    href: "/compendium/jungle",
    icon: Timer,
    tone: "text-success bg-success/15",
    title: "ジャングル図鑑・タイマー",
    description: "モンスターの出現時間・報酬・リアルタイム討伐タイマー",
  },
  {
    href: "/compendium/emblems",
    icon: Shield,
    tone: "text-neon bg-neon/10",
    title: "エンブレム",
    description: "全エンブレムのステータスとタレント構成",
  },
  {
    href: "/compendium/spells",
    icon: Zap,
    tone: "text-gold bg-gold/15",
    title: "バトルスペル",
    description: "全スペルの効果・クールダウン・おすすめロール",
  },
];

export default function CompendiumPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader title="図鑑" titleEn="Compendium" description="バトルに関わるすべての知識をここに集約。" />
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ href, icon: Icon, tone, title, description }) => (
          <Link key={href} href={href}>
            <Card interactive className="flex h-full items-center gap-4 p-5">
              <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl p-3.5 ${tone}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-xs text-text-muted">{description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
