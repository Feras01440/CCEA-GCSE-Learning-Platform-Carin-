/**
 * Geometry sanity check on every generated SVG: nothing may sit outside its own viewBox,
 * and every figure must carry at least one text label and one drawn shape.
 *
 * Run: node scratchpad/similar/bounds.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, "packs", "maths", "content", "m7", "similar-shapes-length-area-and-volume-scale-factors");
const bundle = JSON.parse(fs.readFileSync(path.join(DIR, "bundle.json"), "utf8"));
const blocks = JSON.parse(fs.readFileSync(path.join(DIR, "note.blocks.json"), "utf8"));
const decode = (src) => decodeURIComponent(/^data:image\/svg\+xml;utf8,(.*)$/is.exec(src.trim())[1]);

const figures = [];
for (const b of blocks) if (b.type === "figure") figures.push([`note "${b.caption}"`, b.svg]);
for (const w of bundle.workedExamples) figures.push([w.id.split(".").pop(), decode(w.figure.src)]);
for (const s of bundle.diagnostics) for (const it of s.items) if (it.figure) figures.push([`dx ${it.id}`, decode(it.figure.src)]);
for (const q of bundle.questions) for (const f of q.figures) figures.push([q.id.split(".").pop(), decode(f.src)]);

const fails = [];
const MARGIN = 2; // a stroke width of slack

for (const [name, svg] of figures) {
  const vb = /viewBox='0 0 ([\d.]+) ([\d.]+)'/.exec(svg);
  if (!vb) {
    fails.push(`${name}: no parsable viewBox`);
    continue;
  }
  const W = Number(vb[1]);
  const H = Number(vb[2]);
  const xs = [];
  const ys = [];

  // absolute path commands (M/L) and the explicit h/v runs we emit
  for (const m of svg.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)) {
    xs.push(Number(m[1]));
    ys.push(Number(m[2]));
  }
  for (const m of svg.matchAll(/<text x='(-?[\d.]+)' y='(-?[\d.]+)' text-anchor='(\w+)'[^>]*>([^<]*)</g)) {
    const x = Number(m[1]);
    const y = Number(m[2]);
    const label = m[4];
    // crude advance width: 0.55 em per character at the given font size
    const size = Number(/font-size='([\d.]+)'/.exec(m[0])?.[1] ?? 12.5);
    const w = label.length * size * 0.55;
    const left = m[3] === "end" ? x - w : m[3] === "middle" ? x - w / 2 : x;
    xs.push(left, left + w);
    ys.push(y - size, y + size * 0.25);
  }
  for (const m of svg.matchAll(/<ellipse cx='(-?[\d.]+)' cy='(-?[\d.]+)' rx='([\d.]+)' ry='([\d.]+)'/g)) {
    xs.push(Number(m[1]) - Number(m[3]), Number(m[1]) + Number(m[3]));
    ys.push(Number(m[2]) - Number(m[4]), Number(m[2]) + Number(m[4]));
  }
  for (const m of svg.matchAll(/<circle cx='(-?[\d.]+)' cy='(-?[\d.]+)' r='([\d.]+)'/g)) {
    xs.push(Number(m[1]) - Number(m[3]), Number(m[1]) + Number(m[3]));
    ys.push(Number(m[2]) - Number(m[3]), Number(m[2]) + Number(m[3]));
  }

  if (!xs.length) fails.push(`${name}: nothing drawn`);
  if (!/<text/.test(svg)) fails.push(`${name}: no text label`);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  if (minX < -MARGIN) fails.push(`${name}: content ${(-minX).toFixed(1)} px off the left edge`);
  if (maxX > W + MARGIN) fails.push(`${name}: content ${(maxX - W).toFixed(1)} px past the right edge (viewBox ${W})`);
  if (minY < -MARGIN) fails.push(`${name}: content ${(-minY).toFixed(1)} px above the top edge`);
  if (maxY > H + MARGIN) fails.push(`${name}: content ${(maxY - H).toFixed(1)} px below the bottom edge (viewBox ${H})`);
}

if (fails.length) {
  console.error("BOUNDS FAILED:");
  for (const f of fails) console.error("  - " + f);
  process.exit(1);
}
console.log(`all ${figures.length} figures sit inside their viewBox and carry labels`);
