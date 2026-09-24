/**
 * The thirteen older M7 topics (authored 2026-09-13) have no live author, so their FIGURE warnings
 * are cleared here. The four newest (2026-09-20: adding-and-multiplying-probabilities,
 * enlargements-with-fractional-scale-factors, product-rule-for-counting,
 * tree-diagrams-for-independent-events) belong to their author and are not touched.
 *
 * Five of the six warnings are accessible text reciting coordinates the item's own answer gives:
 * the drawings are fine, the alt reads the answer out. One is a pair of labels drawn on top of
 * each other. Same guards as the M3/M4 pass: a bundle modified in the last 30 minutes is skipped,
 * and every answer spec and commonError pattern is hashed before and after.
 *
 *   node scratchpad/fm1-batch-e/fix-figures-m7.mjs [--dry]
 */
import fs from "node:fs";
import crypto from "node:crypto";

const DRY = process.argv.includes("--dry");
const RECENT_MINUTES = 30;
const DIR = "packs/maths/content/m7";

const FIXES = [
  {
    slug: "combined-transformations-and-reflections-in-y-equals-plus-or-minus-x",
    items: "we.01, we.02, q.0012, q.0009",
    why: "the alt of each worked example recited the object triangle's vertices, whose adjacent numbers spell an image coordinate the answer gives; and on q.0012 the two mirror-line labels sat on the x-axis tick labels",
    swaps: [
      // we.01: the vertices are in the stem; the picture only has to say what is drawn
      [
        "A coordinate grid from -8 to 8 with the dashed mirror line y = x. Triangle T has vertices at (2, 1), (2, 7) and (6, 1). A ringed cross marks the point (-5, -2).",
        "A coordinate grid from -8 to 8 with the dashed mirror line y = x. Triangle T is drawn in the first quadrant, with the vertices the question gives. A ringed cross marks the centre of enlargement, labelled on the grid.",
      ],
      // we.02
      [
        "A coordinate grid from -8 to 8 with both dashed diagonals y = x and y = -x. Triangle C has vertices at (2, 5), (2, 7) and (5, 5).",
        "A coordinate grid from -8 to 8 with both dashed diagonals y = x and y = -x. Triangle C is drawn in the first quadrant, with the vertices the question gives.",
      ],
      // q.0012: lift the mirror-line labels off the axis numbers
      ["y='165.3'>x = -3<", "y='28'>x = -3<"],
      ["y='165.3'>x = 1<", "y='28'>x = 1<"],
    ],
  },
  {
    slug: "inequalities-in-two-variables-and-regions",
    items: "we.02",
    why: "the alt listed the corners of the region, which is what the worked example works out; the drawing is the solution picture a worked example may show",
    swaps: [
      [
        "The triangle they enclose is shaded and labelled R, with dots at its corners (2, 2), (6, 2) and (4, 4).",
        "The triangle they enclose is shaded and labelled R, with a dot at each of its three corners.",
      ],
    ],
  },
  {
    slug: "quadratic-graphs-and-intersections-with-straight-lines",
    items: "we.03",
    why: "the alt read out the seven plotted points, two of which are the intersections the worked example asks for; the crossings and the minimum stay, since neither is an answer here",
    swaps: [
      [
        "The curve passes through (-2, 5), (-1, 0), (0, -3), (1, -4), (2, -3), (3, 0), (4, 5), crosses the x-axis at -1 and 3, and dips to its lowest point at (1, -4).",
        "The curve passes through the seven points of the table, crosses the x-axis at -1 and 3, and dips to its lowest point at (1, -4).",
      ],
    ],
  },
];

/* ---------------- the assertion ---------------- */

function mathematics(node, out = []) {
  if (Array.isArray(node)) {
    for (const v of node) mathematics(v, out);
    return out;
  }
  if (!node || typeof node !== "object") return out;
  if (node.answer && typeof node.answer === "object") out.push(JSON.stringify(node.answer));
  if (node.pattern && typeof node.pattern === "object") out.push(JSON.stringify(node.pattern));
  if (node.expect && typeof node.expect === "object") out.push(JSON.stringify(node.expect));
  for (const v of Object.values(node)) mathematics(v, out);
  return out;
}
const digest = (l) => crypto.createHash("sha256").update(l.join("\n")).digest("hex");

/* ---------------- apply ---------------- */

const now = Date.now();
let edited = 0;
let waiting = 0;
for (const fix of FIXES) {
  const file = `${DIR}/${fix.slug}/bundle.json`;
  if (!fs.existsSync(file)) {
    console.log(`MISSING  ${file}`);
    continue;
  }
  const ageMin = (now - fs.statSync(file).mtimeMs) / 60000;
  if (ageMin < RECENT_MINUTES) {
    waiting++;
    console.log(`SKIPPED  ${fix.slug}\n         modified ${ageMin.toFixed(1)} min ago — another session is in this unit; run again once it settles`);
    continue;
  }
  // re-read from disk every pass: the file may have moved since the plan was made
  const beforeText = fs.readFileSync(file, "utf8");
  const beforeMaths = mathematics(JSON.parse(beforeText));
  let text = beforeText;
  const applied = [];
  for (const [from, to] of fix.swaps) {
    for (const [needle, replacement] of [
      [JSON.stringify(from).slice(1, -1), JSON.stringify(to).slice(1, -1)],
      [encodeURIComponent(from), encodeURIComponent(to)],
    ]) {
      const hits = text.split(needle).length - 1;
      if (hits === 0) continue;
      text = text.split(needle).join(replacement);
      applied.push({ from: from.slice(0, 58), hits });
    }
  }
  if (applied.length === 0) {
    console.log(`NO MATCH ${fix.slug} (already fixed, or the wording moved)`);
    continue;
  }
  if (!DRY) {
    fs.writeFileSync(file, text);
    const afterMaths = mathematics(JSON.parse(fs.readFileSync(file, "utf8")));
    if (afterMaths.length !== beforeMaths.length || digest(afterMaths) !== digest(beforeMaths)) {
      console.error(`FAIL ${file}: an answer spec or commonError pattern changed`);
      process.exit(1);
    }
  }
  edited++;
  console.log(`${DRY ? "WOULD FIX" : "FIXED   "} ${fix.slug}  (${fix.items})`);
  console.log(`         ${fix.why}`);
  for (const a of applied) console.log(`         ×${a.hits}  "${a.from}"`);
  console.log(`         ${beforeMaths.length} answer specs and patterns, sha ${digest(beforeMaths).slice(0, 16)} unchanged`);
}
console.log(`\n${DRY ? "would edit" : "edited"} ${edited} of ${FIXES.length} bundles, ${waiting} still warm`);
