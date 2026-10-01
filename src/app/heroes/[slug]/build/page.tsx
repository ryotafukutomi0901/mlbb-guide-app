import { notFound } from "next/navigation";
import { HeroPageShell } from "@/components/hero/HeroPageShell";
import { HeroBuild } from "@/components/hero/sections/HeroBuild";
import { heroMetadata, heroSectionLabel } from "@/lib/heroMeta";
import { getDetailedHeroes, getHeroBySlug, getHeroDetail } from "@/repositories/heroRepository";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDetailedHeroes().map((hero) => ({ slug: hero.slug }));
}

export async function generateMetadata(props: PageProps<"/heroes/[slug]/build">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  return hero ? heroMetadata(hero, "build") : { title: "ビルド" };
}

export default async function HeroBuildPage(props: PageProps<"/heroes/[slug]/build">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  const detail = getHeroDetail(slug);
  if (!hero || !detail) notFound();

  return (
    <HeroPageShell
      hero={hero}
      sectionLabel={heroSectionLabel("build")}
      sectionPath={`/heroes/${slug}/build`}
    >
      <HeroBuild hero={detail} />
    </HeroPageShell>
  );
}
