import { absoluteUrl, SITE } from "@/lib/site";

/** 構造化データを埋め込む。値はすべて自前のデータから生成する */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function webPageJsonLd({
  name,
  description,
  path,
  updatedAt,
}: {
  name: string;
  description: string;
  path: string;
  updatedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "ja",
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    about: {
      "@type": "VideoGame",
      name: "Mobile Legends: Bang Bang",
      alternateName: ["MLBB", "モバイルレジェンド"],
    },
    ...(updatedAt ? { dateModified: updatedAt } : {}),
  };
}
