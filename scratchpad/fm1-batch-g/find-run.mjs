/** Where does a given word run sit in a published bundle or note? node find-run.mjs <slug> "<run>" */
import fs from "node:fs";

const slug = process.argv[2];
const run = process.argv.slice(3).join(" ").toLowerCase();
const n = run.split(/\s+/).length;

const words = (s) =>
  s
    .toLowerCase()
    .replace(/\$[^$]*\$/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

let hits = 0;
function walk(o, p) {
  if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${p}[${i}]`));
  if (o && typeof o === "object") return Object.entries(o).forEach(([k, v]) => walk(v, `${p}.${k}`));
  if (typeof o !== "string") return;
  const w = words(o);
  for (let i = 0; i + n <= w.length; i++) {
    if (w.slice(i, i + n).join(" ") === run) {
      hits++;
      console.log(`${p}\n   ${o.slice(0, 200)}`);
      return;
    }
  }
}
for (const f of ["bundle.json", "note.blocks.json"]) {
  const path = `packs/further-maths/content/fm1/${slug}/${f}`;
  if (fs.existsSync(path)) walk(JSON.parse(fs.readFileSync(path, "utf8")), `${slug}/${f}`);
}
console.log(`${hits} site(s)`);
