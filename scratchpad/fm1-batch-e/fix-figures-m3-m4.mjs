/**
 * M3 and M4 have no live author, so the FIGURE warnings the strict build prints on them are
 * cleared here by script: parse the bundle, edit the figure's text nodes and its accessible text,
 * write it back. The question copy withholds whatever its own part asks for; the annotated copy in
 * the note is untouched; every alt and <title> stays truthful.
 *
 * Two guards:
 *   - a bundle modified in the last 30 minutes belongs to whoever is editing it, and is skipped;
 *   - every answer spec and commonError pattern is hashed before and after and must match.
 *
 *   node scratchpad/fm1-batch-e/fix-figures-m3-m4.mjs [--dry]
 */
import fs from "node:fs";
import crypto from "node:crypto";

const DRY = process.argv.includes("--dry");
const RECENT_MINUTES = 30;

/** Each edit is an exact string swap applied to the whole bundle file, with the reason it is safe. */
const FIXES = [
  {
    file: "packs/maths/content/m3/box-plots-and-comparing-distributions/bundle.json",
    item: "q.…0009(b)",
    why: 'part (b) asks why another sample might not give the same median, so the plots are titled by school rather than by the word "sample"',
    swaps: [
      ["Sample from Cloghan High", "Cloghan High"],
      ["Sample from Drumlin College", "Drumlin College"],
      ["The sample from Cloghan High:", "Cloghan High:"],
      ["The sample from Drumlin College:", "Drumlin College:"],
    ],
  },
  {
    file: "packs/maths/content/m3/straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines/bundle.json",
    item: "q.…0010(a) and (b)",
    why: "the caption worked the gradient out and said what it represents, which is both parts' answers; the gradient triangle stays so she can still read 36 and 3 off the scales",
    swaps: [
      ["gradient = 36 / 3 = 12 pounds per day, read with the scales - not by counting squares", "read the rise and the run off the scales, not by counting squares"],
      [
        "A dashed triangle spans 3 days horizontally and 36 pounds vertically, and a caption gives gradient = 36 over 3 = 12 pounds per day, read with the scales rather than by counting squares.",
        "A dashed triangle spans 3 days horizontally and 36 pounds vertically, with a note to read the rise and the run off the scales rather than by counting squares.",
      ],
    ],
  },
  {
    file: "packs/maths/content/m4/circle-theorems/bundle.json",
    item: "q.…0014(a)",
    why: "angles in the same segment make the answer equal to the given angle, so the diagram marks the angle at P with an arc and the stem keeps the 68 degrees it already states",
    swaps: [
      [">68°<", ">arc<"],
      [
        "The angle APB is marked 68 degrees; the angle AQB and the angle ARB are each marked with a question mark, the angle at R with a double arc.",
        "The angle APB is marked with a single arc and its size is given in the question; the angle AQB and the angle ARB are each marked with a question mark, the angle at R with a double arc.",
      ],
    ],
  },
  {
    file: "packs/maths/content/m4/quadratic-formula-and-harder-quadratic-equations/bundle.json",
    item: "we.…03",
    why: 'the side labels read "(x + 4) cm", whose last two words are the worked example\'s own answer for PQ; the unit moves to a single note under the diagram',
    swaps: [
      [">(x + 4) cm<", ">x + 4<"],
      [">(2x + 1) cm<", ">2x + 1<"],
      [">diagram not drawn accurately<", ">lengths in cm; diagram not drawn accurately<"],
      [
        "The vertical side PQ is labelled (x + 4) cm and the horizontal side QR is labelled (2x + 1) cm.",
        "The vertical side PQ is labelled x + 4 and the horizontal side QR is labelled 2x + 1, with a note that the lengths are in centimetres.",
      ],
      [
        "Right-angled triangle PQR with the right angle at Q, PQ = (x + 4) cm and QR = (2x + 1) cm",
        "Right-angled triangle PQR with the right angle at Q, PQ = x + 4 and QR = 2x + 1, lengths in centimetres",
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
for (const fix of FIXES) {
  if (!fs.existsSync(fix.file)) {
    console.log(`MISSING  ${fix.file}`);
    continue;
  }
  const ageMin = (now - fs.statSync(fix.file).mtimeMs) / 60000;
  if (ageMin < RECENT_MINUTES) {
    console.log(`SKIPPED  ${fix.item.padEnd(22)} ${fix.file}\n         modified ${ageMin.toFixed(1)} min ago — another session may be editing it; run again once it settles`);
    continue;
  }

  const before = JSON.parse(fs.readFileSync(fix.file, "utf8"));
  const beforeMaths = mathematics(before);
  let text = fs.readFileSync(fix.file, "utf8");
  const applied = [];
  for (const [from, to] of fix.swaps) {
    // the SVG lives in a data URI inside a JSON string, so the needle is percent- and JSON-escaped
    for (const [needle, replacement] of [
      [JSON.stringify(from).slice(1, -1), JSON.stringify(to).slice(1, -1)],
      [encodeURIComponent(from), encodeURIComponent(to)],
    ]) {
      const hits = text.split(needle).length - 1;
      if (hits === 0) continue;
      text = text.split(needle).join(replacement);
      applied.push({ from: from.slice(0, 60), hits });
    }
  }
  if (applied.length === 0) {
    console.log(`NO MATCH ${fix.item.padEnd(22)} ${fix.file}`);
    continue;
  }
  if (!DRY) {
    fs.writeFileSync(fix.file, text);
    const afterMaths = mathematics(JSON.parse(fs.readFileSync(fix.file, "utf8")));
    if (afterMaths.length !== beforeMaths.length || digest(afterMaths) !== digest(beforeMaths)) {
      console.error(`FAIL ${fix.file}: an answer spec or commonError pattern changed`);
      process.exit(1);
    }
  }
  edited++;
  console.log(`${DRY ? "WOULD FIX" : "FIXED   "} ${fix.item.padEnd(22)} ${fix.file.split("/").slice(3).join("/")}`);
  console.log(`         ${fix.why}`);
  for (const a of applied) console.log(`         ×${a.hits}  "${a.from}"`);
  console.log(`         ${beforeMaths.length} answer specs and patterns, sha ${digest(beforeMaths).slice(0, 16)} unchanged`);
}
console.log(`\n${DRY ? "would edit" : "edited"} ${edited} of ${FIXES.length} bundles`);
