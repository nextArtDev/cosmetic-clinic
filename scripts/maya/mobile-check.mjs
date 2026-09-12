// Mobile (390x844) sanity pass: layout, dock, marquee visibility, no errors.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.argv[2] ?? "http://localhost:3050/v16";
const OUT = path.resolve(".tmp-maya/shots");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text().slice(0, 240));
});
page.on("pageerror", (e) => errs.push("PAGEERR " + String(e).slice(0, 240)));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(4000);

const info = await page.evaluate(() => ({
  preloader: document.querySelectorAll(".maya-preloader").length,
  dock: !!document.querySelector(".maya-dock"),
  scrollbar: !!document.querySelector(".maya-scrollbar"),
  masonryCols: document.querySelectorAll(".maya-bundle-masonry [data-masonry]").length,
  bundleCards: document.querySelectorAll("[data-bundle-card]").length,
  stackedItems: document.querySelectorAll(".maya-stacked-item").length,
  scrollingText: !!document.querySelector(".maya-scrolling-text-track"),
  scrollHeight: document.body.scrollHeight,
  overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
}));

// sweep to trigger everything
const H = info.scrollHeight;
for (let y = 0; y < H; y += 500) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(110);
}
await page.waitForTimeout(800);

const after = await page.evaluate(() => {
  const spans = Array.from(document.querySelectorAll(".maya-scrollrow span span span"));
  const vw = window.innerWidth;
  const inView = spans.filter((s) => {
    const r = s.getBoundingClientRect();
    return r.x < vw && r.x + r.width > 0;
  }).length;
  const stacked = Array.from(document.querySelectorAll(".maya-stacked-item"));
  return {
    dockVisible: document.querySelector(".maya-dock")?.dataset.visible,
    marqueeSpansInView: inView,
    marqueeSpansTotal: spans.length,
    stackedInView: stacked.filter((e) => e.dataset.inView === "true").length,
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
  };
});

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(OUT, "mobile-top.png") });

console.log("initial:", JSON.stringify(info, null, 1));
console.log("after sweep:", JSON.stringify(after, null, 1));
console.log("console errors:", errs.length);
errs.slice(0, 8).forEach((e) => console.log("  -", e));
await browser.close();
