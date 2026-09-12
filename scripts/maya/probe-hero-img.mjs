import { chromium } from "playwright-core";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const URL = process.argv[2] ?? "http://localhost:3050/v16";
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
for (const vp of [
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "desktop", width: 1440, height: 900, isMobile: false },
]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.isMobile });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(5000);
  const out = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("[data-hero-media] img, [data-hero-media] picture img, [data-hero-media] video"));
    return imgs.slice(0, 4).map((n) => ({
      tag: n.tagName,
      src: (n.currentSrc || n.src || "").split("/").slice(-2).join("/"),
      natural: n.naturalWidth ? `${n.naturalWidth}x${n.naturalHeight}` : null,
      rect: (() => {
        const r = n.getBoundingClientRect();
        return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
      })(),
      display: getComputedStyle(n).display,
      opacity: getComputedStyle(n).opacity,
      objectFit: getComputedStyle(n).objectFit,
    }));
  });
  console.log(vp.name, JSON.stringify(out, null, 1));
  await ctx.close();
}
await browser.close();
