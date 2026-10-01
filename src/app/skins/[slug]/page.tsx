import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft, Sparkles } from "lucide-react";
import { SkinCard } from "@/components/skin/SkinCard";
import { RARITY_TEXT } from "@/components/skin/skinStyle";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SKIN_RARITY_LABEL } from "@/data/types";
import { bannerImage, heroImage } from "@/lib/assets";
import { hashSeed } from "@/lib/seed";
import { getHeroBySlug } from "@/repositories/heroRepository";
import { getAllSkins, getSkinBySlug, getSkinsForHero } from "@/repositories/skinRepository";

export function generateStaticParams() {
  return getAllSkins().map((skin) => ({ slug: skin.slug }));
}

export async function generateMetadata(props: PageProps<"/skins/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const skin = getSkinBySlug(slug);
  return { title: skin ? `${skin.name} — スキン詳細` : "スキン詳細" };
}

export default async function SkinDetailPage(props: PageProps<"/skins/[slug]">) {
  const { slug } = await props.params;
  const skin = getSkinBySlug(slug);
  if (!skin) notFound();

  const hero = getHeroBySlug(skin.heroSlug);
  const portrait = heroImage(skin.heroSlug);
  const related = getSkinsForHero(skin.heroSlug).filter((s) => s.slug !== skin.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <Link
        href="/skins"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text"
      >
        <ChevronLeft size={16} />
        スキン一覧へ戻る
      </Link>

      <div className="relative overflow-hidden rounded-3xl border border-border">
        <div className="absolute inset-0">
          <Image
            src={bannerImage(hashSeed(skin.slug))}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-bg-deep/70 to-bg-deep/30" />
        </div>

        <div className="relative grid gap-6 p-6 md:grid-cols-5 md:p-10">
          <div className="md:col-span-3">
            <p className={`font-display text-xs font-bold uppercase tracking-[0.3em] ${RARITY_TEXT[skin.rarity]}`}>
              {SKIN_RARITY_LABEL[skin.rarity]}
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">{skin.name}</h1>
            {hero && (
              <Link
                href={`/heroes/${hero.slug}`}
                className="mt-1 inline-block text-sm text-text-muted transition-colors hover:text-primary"
              >
                {hero.name} ({hero.nameEn})
              </Link>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="gold">{skin.price}</Badge>
              <span className="font-display text-[10px] text-text-faint">リリース {skin.releaseDate}</span>
              {skin.owned && <Badge variant="success">所持済み</Badge>}
            </div>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-muted">{skin.description}</p>

            <div className="mt-6">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                <Sparkles size={14} className="text-gold" />
                スキン効果
              </h2>
              <ul className="flex flex-col gap-1.5">
                {skin.effects.map((effect) => (
                  <li key={effect} className="flex items-center gap-2 text-xs text-text-muted">
                    <Check size={13} className="shrink-0 text-success" />
                    {effect}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative hidden min-h-[300px] md:col-span-2 md:block">
            {portrait && (
              <div className="animate-float absolute inset-y-0 right-0 my-auto aspect-[4/5] max-h-full">
                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-3xl" />
                <Image
                  src={portrait}
                  alt={skin.name}
                  fill
                  sizes="320px"
                  className="relative rounded-2xl border border-primary/30 object-cover object-top shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-8">
          <SectionHeader title={`${hero?.name}の他のスキン`} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((s) => (
              <SkinCard key={s.slug} skin={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
