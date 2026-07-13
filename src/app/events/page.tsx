import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, Gift } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { bannerImage } from "@/lib/assets";
import { hashSeed } from "@/lib/seed";
import { getEvents } from "@/repositories/contentRepository";

export const metadata: Metadata = { title: "イベント" };

const CATEGORY_LABEL: Record<string, string> = {
  collab: "コラボ",
  season: "シーズン",
  login: "ログイン",
  shop: "ショップ",
};

const CATEGORY_BADGE: Record<string, "danger" | "primary" | "neon" | "gold"> = {
  collab: "danger",
  season: "primary",
  login: "neon",
  shop: "gold",
};

export default function EventsPage() {
  const events = getEvents();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="イベント"
        titleEn="Live Events"
        description="開催中のイベントと報酬を確認して、受け取り忘れをゼロに。"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <Card key={event.slug} interactive className="overflow-hidden p-0">
            <div className="relative h-32">
              <Image
                src={bannerImage(hashSeed(event.slug))}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/30 to-transparent" />
              <div className="absolute left-4 top-4">
                <Badge variant={CATEGORY_BADGE[event.category]}>{CATEGORY_LABEL[event.category]}</Badge>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h2 className="font-bold leading-snug">{event.name}</h2>
              </div>
            </div>

            <div className="p-4">
              <p className="flex items-center gap-1.5 font-display text-[10px] text-text-faint">
                <CalendarDays size={11} />
                {event.startDate} 〜 {event.endDate}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">{event.description}</p>

              {event.progress !== undefined && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] text-text-faint">
                    <span>進行度</span>
                    <span className="font-display font-bold text-gold">{event.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full gradient-gold" style={{ width: `${event.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-3">
                <Gift size={13} className="text-gold" />
                {event.rewards.map((reward) => (
                  <Badge key={reward}>{reward}</Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
