import { notFound } from "next/navigation";
import { HeroPageShell } from "@/components/hero/HeroPageShell";
import { HeroOverview } from "@/components/hero/sections/HeroOverview";
import { Card } from "@/components/ui/Card";
import { CoachCTA } from "@/components/coach/CoachCTA";
import { heroMetadata } from "@/lib/heroMeta";
import { getAllHeroes, getHeroBySlug, getHeroDetail } from "@/repositories/heroRepository";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllHeroes().map((hero) => ({ slug: hero.slug }));
}

export async function generateMetadata(props: PageProps<"/heroes/[slug]">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  return hero ? heroMetadata(hero, "overview") : { title: "ヒーロー詳細" };
}

export default async function HeroOverviewPage(props: PageProps<"/heroes/[slug]">) {
  const { slug } = await props.params;
  const hero = getHeroBySlug(slug);
  if (!hero) notFound();
  const detail = getHeroDetail(slug);

  return (
    <HeroPageShell hero={hero} sectionPath={`/heroes/${slug}`}>
      {detail ? (
        <HeroOverview hero={detail} />
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <p className="text-sm text-text-muted">
              このヒーローの詳細データ(ステータス・スキル・ビルド)は準備中です。順次追加していきます。
            </p>
          </Card>
          <CoachCTA heroName={hero.name} />
        </div>
      )}
    </HeroPageShell>
  );
}
