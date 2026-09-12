// Fetch the original Maya Shopify storefront for analysis.
import fs from "node:fs";
import path from "node:path";

const BASE = "https://maya-theme-empower.myshopify.com/";
const OUT = path.resolve(".tmp-maya");
fs.mkdirSync(OUT, { recursive: true });

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

async function get(url, asText = true) {
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return asText ? res.text() : Buffer.from(await res.arrayBuffer());
}

function save(rel, buf) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, buf);
  return p;
}

const html = await get(BASE);
save("original.html", html);
console.log("HTML bytes:", html.length);

// Extract same-origin asset refs
const urls = new Set();
const re = /(?:src|href)=["']([^"']+)["']/g;
let m;
while ((m = re.exec(html))) {
  let u = m[1];
  if (u.startsWith("//")) u = "https:" + u;
  if (u.startsWith("/")) u = "https://maya-theme-empower.myshopify.com" + u;
  if (!u.startsWith("http")) continue;
  if (/\.(js|css|json)(\?|$)/.test(u)) urls.add(u);
}

// Inline script src from the html (shopify uses /cdn/shop/t/...)
console.log("asset refs found:", urls.size);
const list = [...urls];
fs.writeFileSync(path.join(OUT, "assets.json"), JSON.stringify(list, null, 2));

let ok = 0, fail = 0;
for (const u of list) {
  try {
    const u2 = new URL(u);
    const rel = "assets/" + u2.pathname.replace(/^\//, "").replace(/[?&]/g, "_");
    const buf = await get(u, false);
    save(rel, buf);
    ok++;
  } catch (e) {
    fail++;
    console.log("FAIL", e.message);
  }
}
console.log(`assets ok=${ok} fail=${fail}`);
