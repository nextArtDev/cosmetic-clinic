// Capture the original Maya storefront + the local /v16 port for comparison.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.resolve(".tmp-maya/shots");
fs.mkdirSync(OUT, { recursive: true });

const ORIGINAL = "https://maya-theme-empower.myshopify.com/";
const LOCAL = "http://localhost:3120/v16";

async function capture(browser, url, tag, { scrollFrames = true } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => errors.push("PAGEERR " + String(e).slice(0, 300)));

  console.log(`\n=== ${tag} -> ${url}`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  } catch (e) {
    console.log("  goto failed:", e.message);
  }
  await page.waitForTimeout(6000);

  // section inventory
  const inv = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("section, [id^='shopify-section'], [mayaaThemeSection]").forEach((el) => {
      const r = el.getBoundingClientRect();
      out.push({
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: (el.className || "").toString().slice(0, 120),
        method: el.getAttribute("methodCalled") || el.getAttribute("methodcalled") || null,
        h: Math.round(el.offsetHeight),
        y: Math.round(r.top + window.scrollY),
        text: (el.innerText || "").replace(/\s+/g, " ").slice(0, 90),
      });
    });
    return { total: document.body.scrollHeight, inv: out };
  });
  fs.writeFileSync(path.join(OUT, `${tag}-sections.json`), JSON.stringify(inv, null, 2));
  console.log("  page height:", inv.total, "sections:", inv.inv.length);

  // full page screenshot
  await page.screenshot({ path: path.join(OUT, `${tag}-full.png`), fullPage: true });

  if (scrollFrames) {
    const step = 800;
    const max = inv.total;
    let i = 0;
    for (let y = 0; y < max; y += step) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(OUT, `${tag}-f${String(i).padStart(2, "0")}.png`) });
      i++;
      if (i > 40) break;
    }
    console.log("  scroll frames:", i);
  }

  console.log("  console errors:", errors.length);
  errors.slice(0, 8).forEach((e) => console.log("   -", e));
  await ctx.close();
  return inv;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  await capture(browser, ORIGINAL, "orig");
  await capture(browser, LOCAL, "v16");
} finally {
  await browser.close();
}
console.log("\ndone");
