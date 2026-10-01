import Image from "next/image";
import Link from "next/link";
import { TierBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROLE_LABEL, type HeroSummary, type Tier } from "@/data/types";
import { heroImage } from "@/lib/assets";

const TIER_TONE: Record<Tier, string> = {
  "S+": "from-gold/25 border-gold/40",
  S: "from-gold/15 border-gold/25",
  "A+": "from-primary/25 border-primary/40",
  A: "from-primary/15 border-primary/25",
  "B+": "from-primary-2/15 border-primary-2/25",
  B: "from-surface-hover/40 border-border",
};

export function TierGrid({ rows }: { rows: { tier: Tier; heroes: HeroSummary[] }[] }) {
  const visible = rows.filter((r) => r.heroes.length > 0);
  if (visible.length === 0) {
    return <EmptyState description="このレーンのヒーローデータは準備中です。" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {visible.map(({ tier, heroes }) => (
        <div
          key={tier}
          className={`flex flex-col gap-4 rounded-2xl border bg-gradient-to-r to-transparent p-4 backdrop-blur md:flex-row md:items-start ${TIER_TONE[tier]}`}
        >
          <div className="flex w-full shrink-0 items-center gap-3 md:w-20 md:flex-col md:gap-1 md:pt-1">
            <TierBadge tier={tier} className="h-9 min-w-14 text-lg" />
            <span className="text-[10px] text-text-faint">{heroes.length}体</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {heroes.map((hero) => {
              const image = heroImage(hero.slug);
              return (
                <Link
                  key={hero.slug}
                  href={`/heroes/${hero.slug}`}
                  title={`${hero.name} (${hero.roles.map((r) => ROLE_LABEL[r]).join("/")})`}
                  className="group flex w-16 flex-col items-center gap-1.5"
                >
                  <span className="relative h-14 w-14 overflow-hidden rounded-xl border border-border transition-all duration-300 group-hover:scale-105 group-hover:border-primary/70 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.4)]">
                    {image ? (
                      <Image
                        src={image}
                        alt={hero.name}
                        fill
                        sizes="56px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-surface-2 font-display text-lg font-black text-text-faint">
                        {hero.nameEn.slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <span className="w-full truncate text-center text-[10px] text-text-muted transition-colors group-hover:text-text">
                    {hero.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
