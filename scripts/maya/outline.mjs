// Print a structural outline of an HTML file: tag + key attributes, indented,
// with text truncated. Collapses runs of identical siblings.
import fs from "node:fs";

const file = process.argv[2];
const maxDepth = Number(process.argv[3] ?? 40);
let html = fs.readFileSync(file, "utf8");

// strip style/script/svg innards
html = html.replace(/<style[\s\S]*?<\/style>/gi, "<style/>");
html = html.replace(/<script[\s\S]*?<\/script>/gi, "<script/>");
html = html.replace(/<svg[\s\S]*?<\/svg>/gi, "<svg/>");
html = html.replace(/<!--[\s\S]*?-->/g, "");

const VOID = new Set(["br", "img", "input", "hr", "meta", "link", "source", "path", "circle", "rect", "use", "stop", "line", "polygon", "polyline", "ellipse", "style", "script", "svg", "area", "col", "embed", "track", "wbr"]);

const tokens = html.match(/<[^>]+>|[^<]+/g) || [];
let depth = 0;
const lines = [];
const KEYS = ["class", "id", "data-section", "methodcalled", "methodCalled", "data-animation-type", "data-animation-style", "data-block-size", "data-column-count", "data-direction", "data-speed", "data-effect", "data-section-index", "animation-type", "data-collection-count", "data-has-header", "data-counter-enable", "data-line-animation", "data-scroll-direction"];

function attrs(tag) {
  const out = [];
  for (const k of KEYS) {
    const m = tag.match(new RegExp(`${k}=["']([^"']*)["']`, "i"));
    if (m) out.push(`${k}="${m[1]}"`);
  }
  return out.length ? " " + out.join(" ") : "";
}

let lastTag = "";
let runCount = 0;

function flush() {
  if (runCount > 1) lines.push(`${"  ".repeat(depth)}… ×${runCount} identical siblings`);
  runCount = 0;
}

for (const tk of tokens) {
  if (tk.startsWith("</")) {
    flush();
    depth = Math.max(0, depth - 1);
    continue;
  }
  if (tk.startsWith("<")) {
    const name = (tk.match(/^<([a-zA-Z0-9-]+)/) || [, "?"])[1];
    const closing = /\/>$/.test(tk);
    const key = name + attrs(tk);
    if (key === lastTag && !closing) {
      runCount++;
      continue;
    }
    flush();
    lastTag = key;
    if (depth < maxDepth) lines.push(`${"  ".repeat(depth)}<${name}${attrs(tk)}>`);
    if (!closing && !VOID.has(name.toLowerCase())) depth++;
    continue;
  }
  const text = tk.replace(/\s+/g, " ").trim();
  if (text && text.length > 1 && depth < maxDepth) {
    lastTag = "";
    lines.push(`${"  ".repeat(depth)}"${text.slice(0, 110)}"`);
  }
}
flush();
console.log(lines.join("\n"));
