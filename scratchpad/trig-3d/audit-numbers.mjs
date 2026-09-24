/**
 * Audit: every decimal printed anywhere in the bundle or the note must be a rounding
 * (or a truncation) of a value this generator computed. Prints anything it cannot match.
 *
 * Run: node scratchpad/trig-3d/audit-numbers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cuboidFacts, pyramidFacts, wedgeFacts, coneFacts, cubeFromDiagonal, atanDeg, hyp2, sf } from "./core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "packs/maths/content/m8/pythagoras-and-trigonometry-in-3d");
const bundle = JSON.parse(fs.readFileSync(path.join(DIR, "bundle.json"), "utf8"));
const blocks = JSON.parse(fs.readFileSync(path.join(DIR, "note.blocks.json"), "utf8"));

// --- every value this topic computes --------------------------------------
const values = new Set();
const add = (...xs) => xs.forEach((x) => Number.isFinite(x) && values.add(x));

const solids = [
  cuboidFacts(8, 6, 5, "a"),
  cuboidFacts(12, 9, 8, "a"),
  cuboidFacts(8, 15, 6, "a"),
  cuboidFacts(4, 4, 7, "a"),
  cuboidFacts(6, 6, 6, "a"),
  cuboidFacts(6, 8, 7, "a"),
  cuboidFacts(9, 12, 4, "a"),
  cuboidFacts(130, 90, 50, "a"),
  cuboidFacts(6, 6, 12, "a"),
  cuboidFacts(5, 12, 9, "a"),
  cuboidFacts(3, 4, 12, "a"),
  cuboidFacts(7, 4, 6, "a"),
  cuboidFacts(10, 5, 4, "a"),
  cuboidFacts(9, 12, 15 * Math.tan((40 * Math.PI) / 180), "a"),
];
for (const s of solids) add(s.ac, s.ag, s.angle, 90 - s.angle, s.w, s.d, s.h, s.ac ** 2, s.ag ** 2);

const pyramids = [
  pyramidFacts(10, 12, "p"),
  pyramidFacts(14, 24, "p"),
  pyramidFacts(8, 15, "p"),
  pyramidFacts(12, 9, "p"),
  pyramidFacts(16, 15, "p"),
  pyramidFacts(16, Math.sqrt(17 * 17 - 128), "p"),
  pyramidFacts(18, 12, "p"),
  pyramidFacts(12, 8, "p"),
];
for (const p of pyramids) {
  add(p.diag, p.half, p.slantEdge, p.edgeAngle, p.faceAngle, p.slantHeight, p.halfBase, p.ht, p.half ** 2, 90 - p.edgeAngle);
}

const wedges = [wedgeFacts(9, 4, 2.5, "w"), wedgeFacts(12, 5, 3.5, "w"), wedgeFacts(8, 6, 3, "w"), wedgeFacts(15, 8, 4.5, "w")];
for (const w of wedges) add(w.ac, w.ag, w.angle, w.h, 90 - w.angle, w.ag ** 2, w.h ** 2);

const cones = [coneFacts(7, 24, "c")];
for (const c of cones) add(c.l, c.base, c.apex);

for (const d of [12, 15, 20, 9]) {
  const c = cubeFromDiagonal(d, "cube");
  add(c.x, c.xSq);
}

// values that appear as named wrong routes in feedback
add(
  atanDeg(2.5, 9.8),
  atanDeg(2.5, 10),
  atanDeg(2.5, 9.85),
  atanDeg(7, 6),
  atanDeg(9, 5),
  atanDeg(4, 10),
  atanDeg(3, 8),
  atanDeg(3, 6),
  atanDeg(9, 12),
  atanDeg(12, 18),
  atanDeg(10, 6),
  atanDeg(6, 10),
  atanDeg(15, 4),
  atanDeg(12, 25.455844122715714),
  atanDeg(4, 15),
  atanDeg(4.5, 15),
  atanDeg(9, 15.8),
  atanDeg(12.7, 8),
  hyp2(4, 15),
  hyp2(12, 9),
  hyp2(17, 11.313708498984761),
  Math.sqrt(24 * 24 - 7 * 7),
  Math.sqrt(289 - 64),
  Math.sqrt(1.3 ** 2 + 90 ** 2 + 0.5 ** 2),
  20 / 3,
  20 / Math.SQRT2,
  15 / Math.tan((40 * Math.PI) / 180),
  7.0710678118654755 ** 2,
  7.07 ** 2, // the 49.98 a rounded 7.07 produces, quoted in the WE2 why-menu
  Math.sqrt(101),
  Math.sqrt(65),
  Math.sqrt(141),
  Math.sqrt(125),
  Math.sqrt(27),
  Math.sqrt(48),
  Math.sqrt(75),
  Math.sqrt(108),
  Math.sqrt(216),
  Math.sqrt(194),
  Math.sqrt(257),
  Math.sqrt(250),
  Math.sqrt(103.25),
  Math.sqrt(309.25),
  Math.sqrt(97),
  Math.sqrt(161),
  Math.sqrt(241),
  Math.sqrt(32),
  Math.sqrt(162),
  Math.sqrt(128),
  2.5,
  4.5,
  3.5,
  1.3,
  0.5,
  1.5,
  1.6,
  0.3,
  0.7,
);

/** Accepted spellings of a computed value: any rounding or truncation from 1 to 6 places, and 2-4 s.f. */
const accepted = new Set();
for (const v of values) {
  for (let p = 0; p <= 6; p++) {
    accepted.add(v.toFixed(p));
    const t = Math.trunc(v * 10 ** p) / 10 ** p;
    accepted.add(t.toFixed(p));
  }
  for (const n of [2, 3, 4, 5, 6]) accepted.add(sf(v, n));
}
// trailing zeros are not written, so add the trimmed forms too
for (const a of [...accepted]) accepted.add(a.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, ""));

// --- every decimal printed in prose ---------------------------------------
function* strings(node, where = "") {
  if (typeof node === "string") return yield [where, node];
  if (Array.isArray(node)) {
    for (const [i, v] of node.entries()) yield* strings(v, `${where}[${i}]`);
    return;
  }
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) yield* strings(v, where ? `${where}.${k}` : k);
}

const unmatched = new Map();
let seen = 0;
for (const [where, s] of [...strings(bundle, "bundle"), ...strings(blocks, "note")]) {
  if (where.includes(".svg") || where.includes(".src") || where.includes(".url") || where.includes("$schema")) continue;
  if (where.includes("solutionProgram") || where.includes("verification[")) continue; // generator transcripts, already exact
  for (const m of s.matchAll(/(?<![\d.])(\d+\.\d+)(?![\d])/g)) {
    seen += 1;
    const tok = m[1];
    if (accepted.has(tok)) continue;
    if (!unmatched.has(tok)) unmatched.set(tok, []);
    unmatched.get(tok).push(where);
  }
}

console.log(`decimals printed in prose: ${seen}; distinct unmatched: ${unmatched.size}`);
for (const [tok, wheres] of [...unmatched].sort()) {
  console.log(`  ${tok}  (${wheres.length}x)  e.g. ${wheres[0]}`);
}
if (unmatched.size === 0) console.log("every printed decimal is a rounding of a computed value");
