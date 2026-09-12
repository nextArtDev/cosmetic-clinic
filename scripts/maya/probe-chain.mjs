// Dump the video-marquee box chain using transform-free offsets.
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

const dump = await page.evaluate(() => {
  const list = document.querySelector(".maya-vt-list");
  const row = document.querySelector("[data-vt-content] .maya-scrollrow");
  const track = row?.querySelector(".maya-scrollrow-track");
  const span = track?.querySelector("span span span");
  const info = (n, label) => {
    if (!n) return { label, missing: true };
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    return {
      label,
      cls: n.className.slice(0, 60),
      offsetTop: n.offsetTop,
      offsetH: n.offsetHeight,
      offsetW: n.offsetWidth,
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      rotate: cs.rotate,
      transform: cs.transform,
      overflow: cs.overflow,
      lineHeight: cs.lineHeight,
      fontSize: cs.fontSize,
      color: cs.color,
      zIndex: cs.zIndex,
    };
  };
  return [info(list, "list"), info(row, "row"), info(track, "track"), info(span, "span")];
});
console.log(JSON.stringify(dump, null, 1));
await browser.close();
