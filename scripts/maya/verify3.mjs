// Robust verification of the /v16 motion layer.
// Lenis hijacks programmatic window.scrollTo, so instead of jumping to exact
// fractions we sweep the whole page and record the min/max each tracked
// property reaches. If an animation fires, its range will show up here.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.argv[2] ?? "http://localhost:3050/v16";
const OUT = path.resolve(".tmp-maya/shots");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
});
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text().slice(0, 260));
});
page.on("pageerror", (e) => errs.push("PAGEERR " + String(e).slice(0, 260)));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(4500);

// install the sampler: records min/max of each tracked selector
await page.evaluate(() => {
  const decode = (t) => {
    if (!t || t === "none") return { x: 0, y: 0, rot: 0, scale: 1 };
    const nums = t.match(/-?[\d.]+(?:e-?\d+)?/g)?.map(Number) ?? [];
    if (t.startsWith("matrix3d(")) {
      return {
        x: nums[12] ?? 0,
        y: nums[13] ?? 0,
        rot: (Math.atan2(nums[6] ?? 0, nums[5] ?? 1) * 180) / Math.PI,
        scale: Math.hypot(nums[0] ?? 1, nums[1] ?? 0),
      };
    }
    return {
      x: nums[4] ?? 0,
      y: nums[5] ?? 0,
      rot: (Math.atan2(nums[1] ?? 0, nums[0] ?? 1) * 180) / Math.PI,
      scale: Math.hypot(nums[0] ?? 1, nums[1] ?? 0),
    };
  };
  window.__track = {
    "[data-vt-media]": {},
    "[data-vt-marquee]": {},
    "[data-ft-image]": {},
    "[data-ft-fill]": {},
    "[data-ft-desc-inner]": {},
    "[data-bs-title]": {},
    '[data-masonry="even"]': {},
    '[data-masonry="odd"]': {},
    "[data-duo]": {},
  };
  window.__sample = () => {
    for (const sel of Object.keys(window.__track)) {
      const n = document.querySelector(sel);
      if (!n) continue;
      const cs = getComputedStyle(n);
      const d = decode(cs.transform);
      const t = window.__track[sel];
      const push = (k, v) => {
        if (t[k] === undefined) t[k] = { min: v, max: v };
        else {
          t[k].min = Math.min(t[k].min, v);
          t[k].max = Math.max(t[k].max, v);
        }
      };
      push("x", Math.round(d.x));
      push("y", Math.round(d.y));
      push("rot", +d.rot.toFixed(2));
      push("scale", +d.scale.toFixed(3));
      push("op", +parseFloat(cs.opacity).toFixed(2));
      if (sel.includes("fill") || sel.includes("desc")) push("w", Math.round(n.getBoundingClientRect().width));
    }
  };
});

// sweep the page
const H = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 320) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.evaluate(() => window.__sample());
  await page.waitForTimeout(130);
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.evaluate(() => window.__sample());
await page.waitForTimeout(1200);

const track = await page.evaluate(() => window.__track);
const extra = await page.evaluate(() => ({
  tabsPinned: !!document.querySelector(".maya-ft-pinned"),
  ftChars: document.querySelectorAll(".maya-ft-char").length,
  vtContentActive: !!document.querySelector(".maya-vt-content-active"),
  masonryCols: document.querySelectorAll(".maya-bundle-masonry [data-masonry]").length,
  bundleCards: document.querySelectorAll("[data-bundle-card]").length,
  duoCount: document.querySelectorAll("[data-duo]").length,
}));

console.log("=== range reached by each tracked element ===");
for (const [sel, vals] of Object.entries(track)) {
  const parts = Object.entries(vals).map(([k, v]) => `${k}:${v.min}→${v.max}`);
  console.log(`  ${sel.padEnd(24)} ${parts.join("  ") || "(not found)"}`);
}
console.log("\nextra:", JSON.stringify(extra));
console.log("\nconsole errors:", errs.length);
errs.slice(0, 12).forEach((e) => console.log("  -", e));

await browser.close();
