// docs/redesign/data/heroes-canonical.json から src/data/heroes.roster.ts を生成する。
// 正準データを唯一の情報源にし、誰が実装しても同一の出力になることを保証する。
// 実行: node scripts/gen/heroes.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "docs/redesign/data/heroes-canonical.json");
const OUT = path.join(ROOT, "src/data/heroes.roster.ts");
const IMAGE_DIR = path.join(ROOT, "public/images/heroes");

/** 英語名 -> public/images/heroes のファイル名 */
function imageFile(nameEn) {
  return `${nameEn.replace(/ and /g, "_and_").replace(/'/g, "").replace(/ /g, "_")}.png`;
}

const { heroes } = JSON.parse(fs.readFileSync(SRC, "utf8"));
const available = new Set(fs.readdirSync(IMAGE_DIR));

const errors = [];
const seen = new Set();
for (const h of heroes) {
  if (seen.has(h.slug)) errors.push(`slug重複: ${h.slug}`);
  seen.add(h.slug);
  if (!available.has(imageFile(h.en))) errors.push(`画像なし: ${h.en} -> ${imageFile(h.en)}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const arr = (xs) => `[${xs.map((x) => JSON.stringify(x)).join(", ")}]`;

const rosterLines = heroes.map((h) => {
  const parts = [
    `slug: ${JSON.stringify(h.slug)}`,
    `name: ${JSON.stringify(h.ja)}`,
    `nameEn: ${JSON.stringify(h.en)}`,
  ];
  if (h.aliases?.length) parts.push(`aliases: ${arr(h.aliases)}`);
  parts.push(`roles: ${arr(h.roles)}`);
  parts.push(`lane: ${JSON.stringify(h.lane)}`);
  if (h.altLanes?.length) parts.push(`altLanes: ${arr(h.altLanes)}`);
  parts.push(`difficulty: ${h.difficulty}`);
  parts.push(`tier: ${JSON.stringify(h.tier)}`);
  parts.push(`releaseYear: ${h.year}`);
  if (h.verify) parts.push(`needsVerification: true`);
  return `  { ${parts.join(", ")} },`;
});

const imageLines = heroes.map(
  (h) => `  ${JSON.stringify(h.slug)}: "/images/heroes/${imageFile(h.en)}",`
);

const out = `// このファイルは scripts/gen/heroes.mjs が生成します。直接編集しないでください。
// 情報源: docs/redesign/data/heroes-canonical.json (全${heroes.length}体)
import type { HeroSummary } from "./types";

export const HERO_ROSTER: HeroSummary[] = [
${rosterLines.join("\n")}
];

export const HERO_PORTRAITS: Record<string, string> = {
${imageLines.join("\n")}
};
`;

fs.writeFileSync(OUT, out);
console.log(`generated ${path.relative(ROOT, OUT)} (${heroes.length} heroes)`);
