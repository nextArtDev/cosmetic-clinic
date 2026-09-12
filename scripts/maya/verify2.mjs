// Verify the /v16 motion layer added in this pass:
//   - video-with-text-overlay (tilt / scale / marquee rise)
//   - featured-collections-tabs (pinned image slide + fill sweep + char reveal)
//   - best-selling-products (pinned rows + rolling titles)
//   - mix-and-match-bundle (masonry columns + differential drift)
//   - media-with-text (square slide-in)
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
await page.waitForTimeout(4500); // let the preloader finish

/** Scroll to `frac` of the way through `sel`'s pin range and read props. */
async function sample(sel, frac, props) {
  return page.evaluate(
    ([s, f, p]) => {
      const el = document.querySelector(s);
      if (!el) return { missing: s };
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const range = Math.max(0, el.offsetHeight - window.innerHeight);
      window.scrollTo(0, top + range * f);
      return new Promise((res) =>
        requestAnimationFrame(() =>
          setTimeout(() => {
            const out = { scrollY: Math.round(window.scrollY) };
            for (const [key, target] of Object.entries(p)) {
              const n = document.querySelector(target);
              if (!n) {
                out[key] = null;
                continue;
              }
              const cs = getComputedStyle(n);
              out[key] = {
                transform: cs.transform,
                opacity: +parseFloat(cs.opacity).toFixed(2),
                width: Math.round(n.getBoundingClientRect().width),
                cls: n.className.split(" ").filter((c) => /maya-|active|pinned|tabs-pos/.test(c)).slice(0, 4),
              };
            }
            res(out);
          }, 420),
        ),
      );
    },
    [sel, frac, props],
  );
}

const report = {};

/* ---------- video with text overlay ---------- */
report.video = {
  start: await sample("[data-vt-media]", 0, { media: "[data-vt-media]", marquee: "[data-vt-marquee]" }),
  mid: await sample("[data-vt-media]", 0.55, { media: "[data-vt-media]", marquee: "[data-vt-marquee]" }),
  end: await sample("[data-vt-media]", 1, { media: "[data-vt-media]", marquee: "[data-vt-marquee]" }),
};

/* ---------- featured collections tabs ---------- */
report.tabs = {
  start: await sample(".maya-ft-panel", 0, {
    image: "[data-ft-image]",
    fill: "[data-ft-fill]",
    desc: "[data-ft-desc-inner]",
    chars: ".maya-ft-char",
  }),
  end: await sample(".maya-ft-panel", 1, {
    image: "[data-ft-image]",
    fill: "[data-ft-fill]",
    desc: "[data-ft-desc-inner]",
    chars: ".maya-ft-char",
  }),
};

/* ---------- best selling products ---------- */
report.best = {
  start: await sample("#maya-bestsellers", 0, { title: "[data-bs-title]", row: "[data-bs-row]" }),
  end: await sample("#maya-bestsellers", 1, { title: "[data-bs-title]", row: "[data-bs-row]" }),
};

/* ---------- bundle masonry ---------- */
report.bundle = await page.evaluate(() => {
  const masonry = document.querySelector(".maya-bundle-masonry");
  if (!masonry) return { missing: true };
  const cols = Array.from(masonry.querySelectorAll("[data-masonry]"));
  return {
    cols: cols.length,
    even: cols.filter((c) => c.dataset.masonry === "even").length,
    odd: cols.filter((c) => c.dataset.masonry === "odd").length,
    cards: masonry.querySelectorAll("[data-bundle-card]").length,
    perCol: cols.map((c) => c.querySelectorAll("[data-bundle-card]").length),
  };
});

/* ---------- media with text (square slide) ---------- */
report.duo = {
  start: await sample("[data-duo]", 0.02, { a: "[data-duo]:nth-of-type(1)", b: "[data-duo]:nth-of-type(2)" }),
  end: await sample("[data-duo]", 1, { a: "[data-duo]:nth-of-type(1)", b: "[data-duo]:nth-of-type(2)" }),
};

/* ---------- screenshots of the rebuilt sections ---------- */
const shots = [
  ["video", "[data-vt-media]", 0.55],
  ["tabs", ".maya-ft-panel", 0.85],
  ["best", "#maya-bestsellers", 0.6],
  ["bundle", ".maya-bundle-masonry", 0.4],
  ["duo", "[data-duo]", 1],
];
for (const [tag, sel, frac] of shots) {
  await sample(sel, frac, {});
  await page.screenshot({ path: path.join(OUT, `v16-${tag}-pin.png`) });
}

console.log(JSON.stringify(report, null, 1));
console.log("console errors:", errs.length);
errs.slice(0, 12).forEach((e) => console.log("  -", e));

await browser.close();
