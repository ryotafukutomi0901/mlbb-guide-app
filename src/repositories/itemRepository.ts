import { ITEMS } from "@/data/items";
import type { Item, ItemCategory } from "@/data/types";

export function getAllItems(): Item[] {
  return ITEMS;
}

export function getItemBySlug(slug: string): Item | undefined {
  return ITEMS.find((i) => i.slug === slug);
}

export function resolveItems(slugs: string[]): Item[] {
  return slugs.map(getItemBySlug).filter((i): i is Item => Boolean(i));
}

export function getItemsByCategory(category: ItemCategory): Item[] {
  return ITEMS.filter((i) => i.category === category);
}

export function getBuildsInto(slug: string): Item[] {
  return ITEMS.filter((i) => i.buildsFrom?.includes(slug));
}

export function searchItems(query: string, category?: ItemCategory): Item[] {
  const q = query.trim().toLowerCase();
  return ITEMS.filter((item) => {
    const matchesCategory = !category || item.category === category;
    const matchesQuery =
      !q || item.name.toLowerCase().includes(q) || item.passive.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}
