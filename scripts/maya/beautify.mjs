// Crude beautifier good enough for reading minified theme JS/CSS.
import fs from "node:fs";
import path from "node:path";

const files = process.argv.slice(2);
const OUT = path.resolve(".tmp-maya/pretty");
fs.mkdirSync(OUT, { recursive: true });

function beautifyJs(src) {
  let out = "";
  let depth = 0;
  let inStr = null; // quote char
  let inTpl = 0;
  let inLine = false;
  let inBlock = false;
  const pad = () => "  ".repeat(Math.max(0, depth));
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (inLine) {
      out += c;
      if (c === "\n") inLine = false;
      continue;
    }
    if (inBlock) {
      out += c;
      if (c === "*" && n === "/") { out += n; i++; inBlock = false; }
      continue;
    }
    if (inStr) {
      out += c;
      if (c === "\\") { out += src[i + 1] ?? ""; i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (inTpl) {
      out += c;
      if (c === "\\") { out += src[i + 1] ?? ""; i++; continue; }
      if (c === "`") inTpl = 0;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; out += c; continue; }
    if (c === "`") { inTpl = 1; out += c; continue; }
    if (c === "/" && n === "/") { inLine = true; out += c; continue; }
    if (c === "/" && n === "*") { inBlock = true; out += c + n; i++; continue; }
    if (c === "{") { depth++; out += "{\n" + pad(); continue; }
    if (c === "}") { depth--; out += "\n" + pad() + "}"; if (n !== ";" && n !== "," && n !== ")" ) out += "\n" + pad(); continue; }
    if (c === ";") { out += ";\n" + pad(); continue; }
    out += c;
  }
  return out.replace(/\n{3,}/g, "\n\n");
}

function beautifyCss(src) {
  return src
    .replace(/\s*\{\s*/g, " {\n  ")
    .replace(/;\s*/g, ";\n  ")
    .replace(/\s*\}/g, "\n}\n")
    .replace(/\n{3,}/g, "\n\n");
}

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const isCss = f.endsWith(".css");
  const out = isCss ? beautifyCss(src) : beautifyJs(src);
  const name = path.basename(f).replace(/\.(js|css)$/, ".pretty.$1");
  fs.writeFileSync(path.join(OUT, name), out);
  console.log("wrote", name, out.split("\n").length, "lines");
}
