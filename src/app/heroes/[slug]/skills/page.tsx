import { notFound } from "next/navigation";
import { HeroPageShell } from "@/components/hero/HeroPageShell";
import { HeroSkills } from "@/components/hero/sections/HeroSkills";
import { heroMetadata, heroSectionLabel } from "@/lib/heroMeta";
import { getDetailedHeroes, getHeroBySlug, getHeroDetail } from "@/repositories/heroRepository";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDetailedHeroes().map((hero) => ({ slug: hero.slug }));
}

export async function generateMetadata(props: PageProps<"/heroes/[slug]/skills">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  return hero ? heroMetadata(hero, "skills") : { title: "スキル" };
}

export default async function HeroSkillsPage(props: PageProps<"/heroes/[slug]/skills">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  const detail = getHeroDetail(slug);
  if (!hero || !detail) notFound();

  return (
    <HeroPageShell
      hero={hero}
      sectionLabel={heroSectionLabel("skills")}
      sectionPath={`/heroes/${slug}/skills`}
    >
      <HeroSkills hero={detail} />
    </HeroPageShell>
  );
}
