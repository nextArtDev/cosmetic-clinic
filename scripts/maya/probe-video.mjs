// Targeted probe: park inside the video-overlay pin using real wheel events
// (Lenis handles those) and dump the marquee/content geometry.
import { chromium } from "playwright-core";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.argv[2] ?? "http://localhost:3050/v16";
const OUT = path.resolve(".tmp-maya/shots");

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(4500);

const stageTop = await page.evaluate(() => {
  const s = document.querySelector("[data-vt-media]")?.closest("section");
  if (!s) return null;
  const r = s.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: s.offsetHeight, inner: window.innerHeight };
});
console.log("stage:", JSON.stringify(stageTop));

// walk down in wheel steps until we are ~60% through the pin
const target = stageTop.top + (stageTop.h - stageTop.inner) * 0.6;
let guard = 0;
while (guard++ < 400) {
  const y = await page.evaluate(() => window.scrollY);
  if (y >= target) break;
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(1200);

const dump = await page.evaluate(() => {
  const pick = (sel) => {
    const n = document.querySelector(sel);
    if (!n) return { sel, missing: true };
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    return {
      sel,
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      transform: cs.transform,
      opacity: cs.opacity,
      filter: cs.filter,
      display: cs.display,
      overflow: cs.overflow,
      cls: n.className.slice(0, 90),
    };
  };
  return {
    scrollY: Math.round(window.scrollY),
    stageTop: Math.round(document.querySelector("[data-vt-media]").closest("section").getBoundingClientRect().top),
    items: [
      pick("[data-vt-marquee]"),
      pick("[data-vt-content]"),
      pick("[data-vt-content] .maya-scrollrow"),
      pick("[data-vt-content] .maya-scrollrow-track"),
      pick("[data-vt-content] .maya-scrollrow span span span"),
    ],
  };
});
console.log(JSON.stringify(dump, null, 1));

await page.screenshot({ path: path.join(OUT, "probe-video.png") });
await browser.close();
