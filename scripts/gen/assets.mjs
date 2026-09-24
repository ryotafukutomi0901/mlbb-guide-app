// docs/redesign/data/assets-manifest.json を読み、Fandom Wiki から画像を取得して
// public/images/{category}/ へ配置し、src/data/images.generated.ts を出力する。
//
// 冪等: 取得済みファイルはスキップする。失敗しても止まらず、最後に一覧で報告する。
// 実行: node scripts/gen/assets.mjs [--force]
//
// 画像の著作権はMoonton社に帰属する(本サイトは非公式ファンサイト)。
// 取得元は manifest の source に記録され、帰属表示の根拠になる。

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const MANIFEST = path.join(ROOT, "docs/redesign/data/assets-manifest.json");
const OUT_TS = path.join(ROOT, "src/data/images.generated.ts");
const API = "https://mobile-legends.fandom.com/api.php";
const FORCE = process.argv.includes("--force");

const { assets } = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

/** File:名 -> 実URL を50件ずつまとめて解決する */
async function resolveUrls(sources) {
  const urls = new Map();
  for (let i = 0; i < sources.length; i += 50) {
    const batch = sources.slice(i, i + 50);
    const params = new URLSearchParams({
      action: "query",
      titles: batch.map((s) => `File:${s}`).join("|"),
      prop: "imageinfo",
      iiprop: "url",
      format: "json",
    });
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) throw new Error(`Fandom API error: ${res.status}`);
    const data = await res.json();
    for (const page of Object.values(data.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (info) urls.set(page.title.replace(/^File:/, ""), info.url.split("/revision")[0]);
    }
  }
  return urls;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "MLBB-LAB/1.0 (asset sync)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length === 0) throw new Error("empty body");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buffer);
  return buffer.length;
}

const urls = await resolveUrls([...new Set(assets.map((a) => a.source))]);

const done = [];
const failed = [];

for (const asset of assets) {
  const dest = path.join(ROOT, "public/images", asset.category, asset.file);
  const publicPath = `/images/${asset.category}/${asset.file}`;

  if (!FORCE && fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    done.push({ ...asset, publicPath, skipped: true });
    continue;
  }
  const url = urls.get(asset.source);
  if (!url) {
    failed.push({ ...asset, reason: "Fandomに該当ファイルが無い" });
    continue;
  }
  try {
    const bytes = await download(url, dest);
    done.push({ ...asset, publicPath, bytes });
  } catch (error) {
    failed.push({ ...asset, reason: String(error).slice(0, 80) });
  }
}

// ── 生成 ────────────────────────────────────────────────
const byCategory = (category) =>
  done
    .filter((a) => a.category === category)
    .map((a) => `  ${JSON.stringify(a.key)}: ${JSON.stringify(a.publicPath)},`)
    .join("\n");

const out = `// このファイルは scripts/gen/assets.mjs が生成します。直接編集しないでください。
// 情報源: docs/redesign/data/assets-manifest.json
// 画像の著作権はMoonton社に帰属します(本サイトは非公式ファンサイト)。

/** エンブレムslug -> 画像パス */
export const EMBLEM_IMAGES: Record<string, string> = {
${byCategory("emblems")}
};

/** ジャングルモンスターslug -> 画像パス */
export const JUNGLE_IMAGES_GENERATED: Record<string, string> = {
${byCategory("jungle")}
};

/** \`\${heroSlug}/\${slot}\` -> 画像パス */
export const SKILL_IMAGES_GENERATED: Record<string, string> = {
${byCategory("skills")}
};

/** アイテムslug -> 画像パス(既存ITEM_IMAGESへの追加分) */
export const ITEM_IMAGES_GENERATED: Record<string, string> = {
${byCategory("items")}
};
`;
fs.writeFileSync(OUT_TS, out);

const fetched = done.filter((a) => !a.skipped).length;
console.log(
  `✓ ${done.length}件を登録 (新規取得 ${fetched} / 既存 ${done.length - fetched})  → ${path.relative(ROOT, OUT_TS)}`
);
if (failed.length) {
  console.warn(`\n✗ ${failed.length}件が取得できませんでした:`);
  for (const f of failed) console.warn(`  - [${f.category}] ${f.key} (${f.source}): ${f.reason}`);
}
