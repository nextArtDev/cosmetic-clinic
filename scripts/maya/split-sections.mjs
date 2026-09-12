// Extract each shopify-section's markup from the original HTML into separate files.
import fs from "node:fs";
import path from "node:path";

const html = fs.readFileSync(".tmp-maya/original.html", "utf8");
const OUT = path.resolve(".tmp-maya/sections");
fs.mkdirSync(OUT, { recursive: true });

const re = /<(?:section|header|div|aside|footer) id="shopify-section-([^"]+)"/g;
const marks = [];
let m;
while ((m = re.exec(html))) marks.push({ id: m[1], start: m.index });

console.log("sections:", marks.length);
for (let i = 0; i < marks.length; i++) {
  const start = marks[i].start;
  const end = i + 1 < marks.length ? marks[i + 1].start : html.length;
  const chunk = html.slice(start, end);
  const name = `${String(i).padStart(2, "0")}-${marks[i].id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  fs.writeFileSync(path.join(OUT, name + ".html"), chunk);
  console.log(` ${String(i).padStart(2)} ${String(chunk.length).padStart(7)}  ${name}`);
}
