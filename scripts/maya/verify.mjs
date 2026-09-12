// Verify the /v16 motion layer: console cleanliness + that every new
// animation actually fires (not just "the page renders").
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.argv[2] ?? "http://localhost:3120/v16";
const TAG = process.argv[3] ?? "verify";
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
  if (m.type() === "error") errs.push(m.text().slice(0, 240));
});
page.on("pageerror", (e) => errs.push("PAGEERR " + String(e).slice(0, 240)));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });

// preloader should exist first, then vanish
const preAtStart = await page.locator(".maya-preloader").count();
await page.waitForTimeout(4000);
const preAfter = await page.locator(".maya-preloader").count();
const progressAfter = await page.locator(".maya-progress-container").count();

const sections = await page.evaluate(() =>
  Array.from(document.querySelectorAll("main > section, main > div > section")).map((el) => ({
    id: el.id || null,
    h: Math.round(el.offsetHeight),
    text: (el.innerText || "").replace(/\s+/g, " ").slice(0, 60),
  })),
);

// chrome presence
const chrome = await page.evaluate(() => ({
  scrollbar: !!document.querySelector(".maya-scrollbar-thumb"),
  dock: !!document.querySelector(".maya-dock"),
  dockVisible: document.querySelector(".maya-dock")?.dataset.visible,
  scrollingText: !!document.querySelector(".maya-scrolling-text-track"),
  stackedGrid: !!document.querySelector(".maya-stacked-grid"),
  stackedItems: document.querySelectorAll(".maya-stacked-item").length,
  scrollHeight: document.body.scrollHeight,
}));

// scroll the whole page so every ScrollTrigger fires
const step = 700;
const total = chrome.scrollHeight;
for (let y = 0; y < total; y += step) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(220);
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1500);

// audit: did the new reveals actually reach their visible state?
const audit = await page.evaluate(() => {
  const stacked = Array.from(document.querySelectorAll(".maya-stacked-item"));
  const stackedIn = stacked.filter((e) => e.dataset.inView === "true").length;
  const stackedVisible = stacked.filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.9).length;
  const scrollThumb = document.querySelector(".maya-scrollbar-thumb");
  const thumbMoved = scrollThumb ? getComputedStyle(scrollThumb).transform : "none";
  return {
    stackedIn,
    stackedVisible,
    stackedTotal: stacked.length,
    thumbMoved,
    dockVisibleAtBottom: document.querySelector(".maya-dock")?.dataset.visible,
    totopVisible: document.querySelector(".maya-totop")?.dataset.visible,
  };
});

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(OUT, `${TAG}-full.png`), fullPage: true });

console.log("=== /v16 motion verify ===");
console.log("preloader at load:", preAtStart, "| after 4s:", preAfter, "| progress bar after:", progressAfter);
console.log("chrome:", JSON.stringify(chrome, null, 1));
console.log("audit:", JSON.stringify(audit, null, 1));
console.log("sections (" + sections.length + "):");
sections.forEach((s) => console.log(`  h=${String(s.h).padStart(5)} ${s.id ?? "-"} :: ${s.text}`));
console.log("console errors:", errs.length);
errs.slice(0, 10).forEach((e) => console.log("  -", e));

await browser.close();
