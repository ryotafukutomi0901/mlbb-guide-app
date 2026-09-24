// データ整合性検証(docs/redesign/06_VERIFICATION.md 6-2)。
// 実装者が誰でも同じ合否になるよう、ソースを静的に検査する。
// 実行: node scripts/qa/verify-data.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const errors = [];
const check = (cond, msg) => { if (!cond) errors.push(msg); };

const canonical = JSON.parse(read("docs/redesign/data/heroes-canonical.json")).heroes;
const rosterSrc = read("src/data/heroes.roster.ts");

// 1. 件数
const rosterCount = (rosterSrc.match(/^\s*\{ slug: /gm) ?? []).length;
check(rosterCount === canonical.length, `ロースター件数不一致: roster=${rosterCount} canonical=${canonical.length}`);

// 2. 全項目一致
for (const h of canonical) {
  const line = rosterSrc.split("\n").find((l) => l.includes(`slug: ${JSON.stringify(h.slug)},`));
  if (!line) { errors.push(`ロースターに ${h.slug} が無い`); continue; }
  check(line.includes(`name: ${JSON.stringify(h.ja)}`), `${h.slug}: 日本語名不一致`);
  check(line.includes(`nameEn: ${JSON.stringify(h.en)}`), `${h.slug}: 英語名不一致`);
  check(line.includes(`lane: ${JSON.stringify(h.lane)}`), `${h.slug}: レーン不一致`);
  check(line.includes(`tier: ${JSON.stringify(h.tier)}`), `${h.slug}: Tier不一致`);
  check(line.includes(`difficulty: ${h.difficulty}`), `${h.slug}: 難易度不一致`);
  check(line.includes(`releaseYear: ${h.year}`), `${h.slug}: 実装年不一致`);
}

// 3. 画像の実在
const heroImages = fs.readdirSync(path.join(ROOT, "public/images/heroes"));
for (const h of canonical) {
  const file = `${h.en.replace(/ and /g, "_and_").replace(/'/g, "").replace(/ /g, "_")}.png`;
  check(heroImages.includes(file), `${h.slug}: 画像が無い (${file})`);
  check(rosterSrc.includes(`"/images/heroes/${file}"`), `${h.slug}: HERO_PORTRAITS に未登録`);
}

// 4-5. 旧slug・捏造データの痕跡
const srcFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) srcFiles.push(p);
  }
})(path.join(ROOT, "src"));

const FORBIDDEN = [
  ["hylos2", "旧slug"], ["helcurt2", "旧slug"], ["belerick2", "旧slug"],
  ["bennett", "旧slug"], ["auloz", "旧slug"], ["fredrinn2", "旧slug"],
  ["popolkupa", "旧slug"], ["yisunshin", "旧slug"], ["ヘルムート", "捏造ヒーロー"],
  ["dominance-users", "ヒーローでないslug"],
];
for (const file of srcFiles) {
  const body = fs.readFileSync(file, "utf8");
  for (const [needle, why] of FORBIDDEN) {
    if (body.includes(needle)) {
      errors.push(`${path.relative(ROOT, file)}: ${why} "${needle}" が残っている`);
    }
  }
}

// 6. 乱数生成がゲーム事実の経路にない
const heroRepo = read("src/repositories/heroRepository.ts");
check(!/seededFloat|seededPick/.test(heroRepo), "heroRepository に乱数生成が残っている");

// 7. CURATED_META の鮮度
const metaSrc = read("src/data/meta.ts");
check(/patch: PATCH/.test(metaSrc) && /updatedAt: UPDATED_AT/.test(metaSrc), "CURATED_META に patch/updatedAt が無い");

// 8. 参照slugの実在(hero-extras, HERO_DETAILS の recommendedBuild)
const slugs = new Set(canonical.map((h) => h.slug));
const extrasSrc = read("src/data/hero-extras.ts");
for (const m of extrasSrc.matchAll(/edge\("([a-z0-9-]+)"/g)) {
  check(slugs.has(m[1]), `hero-extras: 存在しないヒーロー "${m[1]}"`);
}
const itemsSrc = read("src/data/items.ts");
const itemSlugs = new Set([...itemsSrc.matchAll(/^\s*slug: "([a-z0-9-]+)"/gm)].map((m) => m[1]));
const heroesSrc = read("src/data/heroes.ts");
for (const m of heroesSrc.matchAll(/recommendedBuild: \[([^\]]+)\]/g)) {
  for (const s of m[1].matchAll(/"([a-z0-9-]+)"/g)) {
    check(itemSlugs.has(s[1]), `recommendedBuild: 存在しない装備 "${s[1]}"`);
  }
}


// 9. 画像アセットのカバレッジ(Phase 4)
const manifest = JSON.parse(read("docs/redesign/data/assets-manifest.json"));
const generated = read("src/data/images.generated.ts");
for (const asset of manifest.assets) {
  const file = path.join(ROOT, "public/images", asset.category, asset.file);
  check(fs.existsSync(file), `画像が無い: ${asset.category}/${asset.file} (${asset.source})`);
  check(
    generated.includes(JSON.stringify(asset.key)),
    `images.generated.ts に未登録: ${asset.category} ${asset.key}`
  );
}

// 9b. 取得画像は本物のPNGで、アイコンとして妥当な容量であること
// (拡張子pngのWebPや、1MB超のメタデータ入り画像が混入した実例があったため)
const PNG_SIGNATURE = "89504e470d0a1a0a";
const MAX_ASSET_BYTES = 64 * 1024;
for (const asset of manifest.assets) {
  const file = path.join(ROOT, "public/images", asset.category, asset.file);
  if (!fs.existsSync(file)) continue;
  const buf = fs.readFileSync(file);
  check(buf.subarray(0, 8).toString("hex") === PNG_SIGNATURE, `PNGではない: ${asset.category}/${asset.file}`);
  check(buf.length <= MAX_ASSET_BYTES, `容量超過(${Math.round(buf.length / 1024)}KB > 64KB): ${asset.category}/${asset.file}`);
}

// 10. 詳細データのある9体は全4スロットのスキル画像が揃っていること
const SLOTS = ["passive", "skill1", "skill2", "ultimate"];
const detailSlugs = [...heroesSrc.matchAll(/^  ([a-z0-9-]+): \{$/gm)].map((m) => m[1]);
for (const slug of detailSlugs) {
  for (const slot of SLOTS) {
    check(
      generated.includes(`"${slug}/${slot}"`),
      `スキル画像が未登録: ${slug}/${slot}`
    );
  }
}

// 11. 画像パスの直書き参照がすべて実在すること
// (削除済みのバナー画像を参照し続け、4体のページでバナーが欠けていた実例があったため)
for (const file of srcFiles) {
  const body = fs.readFileSync(file, "utf8");
  for (const m of body.matchAll(/["'`](\/(?:images|videos)\/[^"'`$]+)["'`]/g)) {
    const target = path.join(ROOT, "public", decodeURIComponent(m[1]));
    check(fs.existsSync(target), `${path.relative(ROOT, file)}: 参照先が無い ${m[1]}`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length}件の問題:\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(
  `✓ データ整合性OK (ヒーロー${canonical.length}体 / アセット${manifest.assets.length}件 / slug参照 / 鮮度メタ)`
);
