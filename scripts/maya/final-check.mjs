// Final pass: numeric ranges for every ported animation + screenshots of the
// rebuilt sections parked at their pin midpoints (wheel-driven, so Lenis agrees).
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.argv[2] ?? "http://localhost:3050/v16";
const OUT = path.resolve(".tmp-maya/shots");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text().slice(0, 260));
});
page.on("pageerror", (e) => errs.push("PAGEERR " + String(e).slice(0, 260)));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(4500);

/* ---------- 1. numeric sweep ---------- */
await page.evaluate(() => {
  const decode = (t) => {
    if (!t || t === "none") return { x: 0, y: 0, rot: 0 };
    const n = t.match(/-?[\d.]+(?:e-?\d+)?/g)?.map(Number) ?? [];
    if (t.startsWith("matrix3d(")) {
      return { x: n[12] ?? 0, y: n[13] ?? 0, rot: (Math.atan2(n[6] ?? 0, n[5] ?? 1) * 180) / Math.PI };
    }
    return { x: n[4] ?? 0, y: n[5] ?? 0, rot: (Math.atan2(n[1] ?? 0, n[0] ?? 1) * 180) / Math.PI };
  };
  window.__t = {};
  window.__s = () => {
    for (const sel of [
      "[data-vt-media]",
      "[data-vt-marquee]",
      "[data-ft-image]",
      "[data-ft-fill]",
      "[data-ft-desc-inner]",
      "[data-bs-title]",
      '[data-masonry="even"]',
      '[data-masonry="odd"]',
      "[data-duo]",
      "[data-hero-marquee] .maya-scrollrow-track",
      "[data-banner-overlay-track]",
    ]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      const d = decode(cs.transform);
      const t = (window.__t[sel] ??= {});
      const push = (k, v) => {
        t[k] = t[k] ? { min: Math.min(t[k].min, v), max: Math.max(t[k].max, v) } : { min: v, max: v };
      };
      push("x", Math.round(d.x));
      push("y", Math.round(d.y));
      push("rot", +d.rot.toFixed(1));
      push("op", +parseFloat(cs.opacity).toFixed(2));
      if (sel.includes("desc")) push("w", Math.round(el.getBoundingClientRect().width));
    }
  };
});
const H = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 320) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.evaluate(() => window.__s());
  await page.waitForTimeout(120);
}
await page.waitForTimeout(900);
const track = await page.evaluate(() => window.__t);
console.log("=== animation ranges reached ===");
for (const [sel, v] of Object.entries(track)) {
  console.log("  " + sel.padEnd(42) + Object.entries(v).map(([k, r]) => `${k}:${r.min}→${r.max}`).join("  "));
}

/* ---------- 2. screenshots at pin midpoints ---------- */
async function parkAndShoot(sel, frac, tag) {
  // walk up to the nearest ancestor that is taller than the viewport —
  // that is the pin stage driving the scrub, not the animated child
  const geo = await page.evaluate((s) => {
    let el = document.querySelector(s);
    if (!el) return null;
    let stage = el;
    while (stage && stage.offsetHeight <= window.innerHeight + 40 && stage.parentElement) {
      stage = stage.parentElement;
      if (stage === document.body) break;
    }
    const r = stage.getBoundingClientRect();
    return { top: r.top + window.scrollY, h: stage.offsetHeight, inner: window.innerHeight };
  }, sel);
  if (!geo) return console.log("  ! missing", sel);
  const target = geo.top + Math.max(0, geo.h - geo.inner) * frac;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  let g = 0;
  while (g++ < 1400) {
    const y = await page.evaluate(() => window.scrollY);
    if (y >= target - 20) break;
    await page.mouse.wheel(0, 110);
    await page.waitForTimeout(12);
  }
  await page.waitForTimeout(1300);
  await page.screenshot({ path: path.join(OUT, `final-${tag}.png`) });
  console.log("  shot", tag, "at", Math.round(await page.evaluate(() => window.scrollY)), "of", Math.round(target));
}
console.log("=== screenshots ===");
await parkAndShoot("main", 0, "hero");
await parkAndShoot("[data-ft-image]", 0.9, "tabs");
await parkAndShoot("#maya-bestsellers", 0.9, "best");
await parkAndShoot("#maya-bundle", 0.5, "bundle");
await parkAndShoot("[data-duo]", 1, "duo");

console.log("\nconsole errors:", errs.length);
errs.slice(0, 12).forEach((e) => console.log("  -", e));
await browser.close();
