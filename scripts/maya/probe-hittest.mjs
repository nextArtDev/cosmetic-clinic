// What is actually painted over the video band, and where are the text spans?
import { chromium } from "playwright-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.argv[2] ?? "http://localhost:3050/v16";

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
const target = s.top + (s.h - s.inner) * 0.5;
let guard = 0;
while (guard++ < 900) {
  const y = await page.evaluate(() => window.scrollY);
  if (y >= target - 20) break;
  await page.mouse.wheel(0, 90);
  await page.waitForTimeout(16);
}
await page.waitForTimeout(1400);

const out = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll("[data-vt-content] .maya-scrollrow"));
  const spans = Array.from(document.querySelectorAll("[data-vt-content] .maya-scrollrow span span span"));
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const rectOf = (n) => {
    const r = n.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const inView = (r) => r.x < vw && r.x + r.w > 0 && r.y < vh && r.y + r.h > 0;
  return {
    rows: rows.map((n) => {
      const r = rectOf(n);
      return { r, inView: inView(r) };
    }),
    spansInView: spans
      .map((n) => rectOf(n))
      .filter(inView)
      .slice(0, 6),
    spanTotal: spans.length,
    contentOpacity: getComputedStyle(document.querySelector("[data-vt-content]")).opacity,
    contentFilter: getComputedStyle(document.querySelector("[data-vt-content]")).filter,
    // what's on top at the band centre of each row
    hitTests: rows.map((n) => {
      const r = n.getBoundingClientRect();
      const cx = Math.min(Math.max(r.x + r.width / 2, 4), vw - 4);
      const cy = Math.min(Math.max(r.y + r.height / 2, 4), vh - 4);
      const el = document.elementFromPoint(cx, cy);
      return {
        at: [Math.round(cx), Math.round(cy)],
        top: el ? el.tagName + "." + String(el.className).slice(0, 50) : null,
      };
    }),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
