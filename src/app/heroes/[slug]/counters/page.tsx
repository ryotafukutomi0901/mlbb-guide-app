import { notFound } from "next/navigation";
import { HeroPageShell } from "@/components/hero/HeroPageShell";
import { HeroCounters } from "@/components/hero/sections/HeroCounters";
import { heroMetadata, heroSectionLabel } from "@/lib/heroMeta";
import { getDetailedHeroes, getHeroBySlug, getHeroDetail } from "@/repositories/heroRepository";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDetailedHeroes().map((hero) => ({ slug: hero.slug }));
}

export async function generateMetadata(props: PageProps<"/heroes/[slug]/counters">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  return hero ? heroMetadata(hero, "counters") : { title: "カウンター" };
}

export default async function HeroCountersPage(props: PageProps<"/heroes/[slug]/counters">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  const detail = getHeroDetail(slug);
  if (!hero || !detail) notFound();

  return (
    <HeroPageShell
      hero={hero}
      sectionLabel={heroSectionLabel("counters")}
      sectionPath={`/heroes/${slug}/counters`}
    >
      <HeroCounters hero={detail} />
    </HeroPageShell>
  );
}
