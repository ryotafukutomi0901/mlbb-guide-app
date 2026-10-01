// docs/redesign/data/assets-manifest.json を読み、Fandom Wiki から画像を取得して
// public/images/{category}/ へ配置し、src/data/images.generated.ts を出力する。
//
// 冪等: 取得済みファイルは再取得しない(ただし未正規化ならその場でPNGへ正規化する)。
// 失敗しても止まらず、最後に一覧で報告する。
// 注意: 一括取得を繰り返すとFandomのCDNがボット判定(403 "Just a moment...")を返す。
// その判定を回避する細工(Referer偽装等)はしない。時間を置くか、手動で取得して配置する。
// 実行: node scripts/gen/assets.mjs [--force]
//
// 画像の著作権はMoonton社に帰属する(本サイトは非公式ファンサイト)。
// 取得元は manifest の source に記録され、帰属表示の根拠になる。

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

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

/** アイコンとして十分な上限。これより大きい画像は縮小する */
const MAX_EDGE = 256;
const MAX_BYTES = 64 * 1024;
const PNG_SIGNATURE = "89504e470d0a1a0a";

/**
 * FandomのCDNは .png のURLにもWebPを返し、元画像に1MB超のメタデータを含むものもある。
 * 静止画の本物のPNGへ正規化する(sharpは既定でメタデータを落とし、先頭フレームだけを読む)。
 */
async function toStaticPng(raw) {
  return sharp(raw)
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** 手元のファイルが正規化済みでなければ、再取得せずにその場で正規化する */
async function normalizeInPlace(file) {
  const buf = fs.readFileSync(file);
  const isPng = buf.subarray(0, 8).toString("hex") === PNG_SIGNATURE;
  if (isPng && buf.length <= MAX_BYTES) return false;
  fs.writeFileSync(file, await toStaticPng(buf));
  return true;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "MLBB-LAB/1.0 (asset sync)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = Buffer.from(await res.arrayBuffer());
  if (raw.length === 0) throw new Error("empty body");
  const png = await toStaticPng(raw);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, png);
  return png.length;
}

const urls = await resolveUrls([...new Set(assets.map((a) => a.source))]);

const done = [];
const failed = [];
let normalized = 0;

for (const asset of assets) {
  const dest = path.join(ROOT, "public/images", asset.category, asset.file);
  const publicPath = `/images/${asset.category}/${asset.file}`;

  if (!FORCE && fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    if (await normalizeInPlace(dest)) normalized++;
    done.push({ ...asset, publicPath, skipped: true });
    continue;
  }
  // 再取得に失敗しても、手元に前回の画像があれば登録は維持する
  // (取得失敗でレジストリが空になり、画面から画像が消えた実例があったため)
  const keepExisting = (reason) => {
    const exists = fs.existsSync(dest) && fs.statSync(dest).size > 0;
    failed.push({ ...asset, reason: exists ? `${reason}(既存ファイルを維持)` : reason });
    if (exists) done.push({ ...asset, publicPath, skipped: true });
  };
  const url = urls.get(asset.source);
  if (!url) {
    keepExisting("Fandomに該当ファイルが無い");
    continue;
  }
  try {
    const bytes = await download(url, dest);
    done.push({ ...asset, publicPath, bytes });
  } catch (error) {
    keepExisting(String(error).slice(0, 80));
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
  `✓ ${done.length}件を登録 (新規取得 ${fetched} / 既存 ${done.length - fetched} / うち正規化 ${normalized})  → ${path.relative(ROOT, OUT_TS)}`
);
if (failed.length) {
  console.warn(`\n✗ ${failed.length}件が取得できませんでした:`);
  for (const f of failed) console.warn(`  - [${f.category}] ${f.key} (${f.source}): ${f.reason}`);
}
