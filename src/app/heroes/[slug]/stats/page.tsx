import { notFound } from "next/navigation";
import { HeroPageShell } from "@/components/hero/HeroPageShell";
import { HeroStats } from "@/components/hero/sections/HeroStats";
import { heroMetadata, heroSectionLabel } from "@/lib/heroMeta";
import { getDetailedHeroes, getHeroBySlug, getHeroDetail } from "@/repositories/heroRepository";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDetailedHeroes().map((hero) => ({ slug: hero.slug }));
}

export async function generateMetadata(props: PageProps<"/heroes/[slug]/stats">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  return hero ? heroMetadata(hero, "stats") : { title: "ステータス" };
}

export default async function HeroStatsPage(props: PageProps<"/heroes/[slug]/stats">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  const detail = getHeroDetail(slug);
  if (!hero || !detail) notFound();

  return (
    <HeroPageShell
      hero={hero}
      sectionLabel={heroSectionLabel("stats")}
      sectionPath={`/heroes/${slug}/stats`}
    >
      <HeroStats hero={detail} />
    </HeroPageShell>
  );
}
