// Capture the video-overlay pin at three progress points with fine wheel steps.
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

const s = await page.evaluate(() => {
  const el = document.querySelector("[data-vt-media]").closest("section");
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: el.offsetHeight, inner: window.innerHeight };
});

for (const frac of [0.2, 0.5, 0.85]) {
  const target = s.top + (s.h - s.inner) * frac;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  let guard = 0;
  while (guard++ < 900) {
    const y = await page.evaluate(() => window.scrollY);
    if (y >= target - 20) break;
    await page.mouse.wheel(0, 90);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(1400);
  const st = await page.evaluate(() => {
    const m = document.querySelector("[data-vt-media]");
    const q = document.querySelector("[data-vt-marquee]");
    const c = document.querySelector("[data-vt-content]");
    return {
      y: Math.round(window.scrollY),
      media: getComputedStyle(m).transform,
      marqueeY: Math.round(q.getBoundingClientRect().y),
      contentY: Math.round(c.getBoundingClientRect().y),
      active: c.classList.contains("maya-vt-content-active"),
    };
  });
  console.log(frac, JSON.stringify(st));
  await page.screenshot({ path: path.join(OUT, "vt-" + Math.round(frac * 100) + ".png") });
}

await browser.close();
