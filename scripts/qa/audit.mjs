import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3002";
const OUT = process.argv[2] || "shots";
const ROUTES = [
  "/", "/heroes", "/heroes/layla", "/heroes/layla/skills", "/heroes/layla/build",
  "/heroes/layla/counters", "/heroes/layla/stats", "/heroes/balmond",
  "/tier-list", "/tier-list/jungle", "/tier-list/roam", "/meta", "/counters", "/simulator",
  "/compendium", "/compendium/items", "/compendium/jungle", "/compendium/emblems", "/compendium/spells",
  "/coach", "/pricing", "/dashboard", "/login", "/analysis", "/ranking", "/skins", "/gacha",
  "/news", "/events", "/patches", "/profile", "/search", "/settings",
];
const VIEWPORTS = [
  { name: "mobile320", width: 320, height: 720, isMobile: true, hasTouch: true },
  { name: "mobile", width: 375, height: 812, isMobile: true, hasTouch: true },
  { name: "mobile414", width: 414, height: 896, isMobile: true, hasTouch: true },
  { name: "tablet", width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: "tablet820", width: 820, height: 1180, isMobile: true, hasTouch: true },
  { name: "desktop", width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: "wide", width: 1920, height: 1080, isMobile: false, hasTouch: false },
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const report = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    deviceScaleFactor: 2,
    locale: "ja-JP",
    reducedMotion: "reduce",
  });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem("mlbb:splash-seen", "1"); } catch {}
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => consoleErrors.push("PAGEERROR: " + String(e).slice(0, 200)));

  for (const route of ROUTES) {
    const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(900);
      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const vw = window.innerWidth;
        const overflowX = Math.max(doc.scrollWidth, document.body.scrollWidth) - vw;
        const offenders = [];
        if (overflowX > 1) {
          for (const el of document.querySelectorAll("body *")) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
              const style = getComputedStyle(el);
              // 意図的な横スクロールコンテナ内は除外
              let p = el.parentElement; let scrollable = false;
              while (p && p !== document.body) {
                const ps = getComputedStyle(p);
                if (/(auto|scroll)/.test(ps.overflowX)) { scrollable = true; break; }
                p = p.parentElement;
              }
              if (!scrollable && style.position !== "fixed") {
                offenders.push({
                  tag: el.tagName.toLowerCase(),
                  cls: String(el.className).slice(0, 90),
                  right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width),
                });
              }
            }
          }
        }
        return { vw, overflowX: Math.round(overflowX), offenders: offenders.slice(0, 6), title: document.title };
      });
      await page.screenshot({ path: `${OUT}/${vp.name}--${slug}.png`, fullPage: true });
      report.push({ vp: vp.name, route, ...metrics, consoleErrors: consoleErrors.splice(0) });
    } catch (e) {
      report.push({ vp: vp.name, route, error: String(e).slice(0, 200) });
    }
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
const bad = report.filter((r) => r.error || r.overflowX > 1 || (r.consoleErrors && r.consoleErrors.length));
console.log("=== ISSUES ===");
console.log(JSON.stringify(bad, null, 2));
console.log(`total=${report.length} issues=${bad.length}`);
