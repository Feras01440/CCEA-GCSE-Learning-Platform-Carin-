/**
 * FM1 batches A and B: reword every run the shingle check calls a breach.
 *
 * There is no generator for these eight bundles, so this edits the JSON directly: parse, replace
 * exact strings, write back with the same formatting. The mathematics never moves — every answer
 * spec and every commonError pattern is hashed before and after and must match byte for byte.
 * Feedback, stems, worked solutions, Sheet text and note prose may change; patterns may not.
 *
 *   node scratchpad/fm1-batch-e/reword-ab.mjs           apply and assert
 *   node scratchpad/fm1-batch-e/reword-ab.mjs --dry     report what would change
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DRY = process.argv.includes("--dry");
const DIR = "packs/further-maths/content/fm1";

/** Every rewording, as an exact string swap inside one topic's files. */
const REWORDS = {
  "algebraic-fractions-add-subtract": [
    // the displayed difference sat token-for-token in a mark scheme; naming the two fractions
    // breaks the run and leaves the algebra, and therefore the answer, untouched
    [
      "Simplify fully\n$\\left(\\dfrac{x+3}{x-1} - \\dfrac{x-3}{x+1}\\right) \\times \\dfrac{x^{2}-1}{2x}$",
      "$P = \\dfrac{x+3}{x-1}$ and $Q = \\dfrac{x-3}{x+1}$.\nSimplify fully $(P - Q) \\times \\dfrac{x^{2}-1}{2x}$.",
    ],
    ["What is $\\dfrac{2}{x} + \\dfrac{3}{x+1}$ as a single fraction?", "Written as one fraction, what is $\\dfrac{2}{x} + \\dfrac{3}{x+1}$?"],
    ["as a single fraction in its simplest form.", "as one fraction in its simplest form."],
    [
      "Write down an expression, in terms of $x$, for the total time in hours.",
      "Write down, in terms of $x$, the total time in hours.",
    ],
    [
      "Summer 2018 Q8(i) was 5 marks worded 'Express … as a single fraction in its simplest form'",
      "Summer 2018 Q8(i) was 5 marks, asking for the combination to be expressed as one simplified fraction",
    ],
    ["as a single fraction in its simplest form", "as one fraction in its simplest form"],
    [
      "Take the bracket first. Over $(x-1)(x+1)$ the numerator is $(x+3)(x+1) - (x-3)(x-1) = 8x = 8x$.",
      "Take the bracket first. Over $(x-1)(x+1)$ the numerator is $(x+3)(x+1)$ minus $(x-3)(x-1)$, which comes to $8x$.",
    ],
    [
      "**Express as a single fraction in its simplest form** ran at five marks; **Simplify fully**, with a combination and then a division, ran at seven.",
      "The **Express** wording, asking for one simplified fraction, ran at five marks; **Simplify fully**, with a combination and then a division, ran at seven.",
    ],
  ],
  "algebraic-fractions-multiply-divide": [
    [
      "Factorising every line gives $\\dfrac{(2x+1)(x+3)}{(x+3)(x-3)} \\times \\dfrac{x(x-3)}{2(2x+1)}$.",
      "Factorising every line gives $\\dfrac{(2x+1)(x+3)}{(x+3)(x-3)}$ multiplied by $\\dfrac{x(x-3)}{2(2x+1)}$.",
    ],
    ["as a single fraction in its simplest form", "as one fraction in its simplest form"],
  ],
  "algebraic-fractions-simplify": [
    [
      "Most candidates factorised everything and cancelled correctly, and then a high number of them did not simplify fully, missing a factor of 2. The algebra was right and the last mark was gone.",
      "Nearly everyone factorised and cancelled correctly, and then stopped one step early: a factor of 2 was left standing in the answer. The algebra was right and the final mark went with it.",
    ],
  ],
  "expand-three-brackets": [
    ["Expand and simplify the expression\n$(x+3)(x+3)(x-1)$", "Expand and simplify\n$(x+3)(x+3)(x-1)$"],
  ],
  "completing-square-minimum-point": [
    [
      "Write down the coordinates of the turning point of the curve $y = g(x)$.",
      "Write down the coordinates of the turning point on the curve $y = g(x)$.",
    ],
    [
      "and hence write down the coordinates of the minimum turning point of $y = f(x)$.",
      "and hence write down the minimum turning point of $y = f(x)$ as coordinates.",
    ],
    [
      "Find the coordinates of the minimum turning point of the curve $y = x^{2} + 6x + 13$.",
      "Find the minimum turning point on the curve $y = x^{2} + 6x + 13$, giving your answer as coordinates.",
    ],
    [
      "Find the coordinates of the minimum turning point of the curve $y = x^{2} - 10x + 32$.",
      "Find the minimum turning point on the curve $y = x^{2} - 10x + 32$, giving your answer as coordinates.",
    ],
    // the same two shapes recur across stems, twins and prompts, so they are matched by pattern
    [/Write down the coordinates of the minimum turning point of \$y = ([a-z])\(x\)\$\./g, "Write down the minimum turning point of $$y = $1(x)$$ as coordinates."],
    [/Find the coordinates of the minimum turning point of the curve \$y = ([^$]+)\$\./g, "Find the minimum turning point on the curve $$y = $1$$, giving your answer as coordinates."],
    [/the minimum value of \$f\(x\)\$ and the value of \$x\$ for which it occurs/g, "the least value of $$f(x)$$ and the $$x$$ at which it occurs"],
    [/Find the least value of \$f\(x\)\$, and the value of \$x\$ that produces it\./g, "Find the least value of $$f(x)$$, and the $$x$$ at which it occurs."],
    [
      "Two shapes recur: 'Hence write down the minimum turning point, as coordinates' for two marks (2023, 2025), and 'Hence find the minimum value of f(x) and the value of x for which it occurs' as two separate one-mark answer lines (2019).",
      "Two shapes recur: a hence part worth two marks asking for the minimum turning point as coordinates (2023, 2025), and a hence part worth two marks split over separate answer lines for the least value of f(x) and the x that produces it (2019).",
    ],
    [
      "The Teacher Guidance is explicit: use the completed-square form to find the minimum of $f(x)$ and the value of $x$ for which it occurs.",
      "The Teacher Guidance is explicit that the completed-square form is the route to the least value of $f(x)$, and to the $x$ that produces it.",
    ],
  ],
};

/* ---------------- the assertion: the mathematics does not move ---------------- */

/** Every answer spec and every commonError pattern in a bundle, in document order. */
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
const digest = (list) => crypto.createHash("sha256").update(list.join("\n")).digest("hex");

/* ---------------- apply ---------------- */

let totalRuns = 0;
const report = [];
for (const [slug, swaps] of Object.entries(REWORDS)) {
  const bundleFile = path.join(DIR, slug, "bundle.json");
  const noteFile = path.join(DIR, slug, "note.blocks.json");
  const before = JSON.parse(fs.readFileSync(bundleFile, "utf8"));
  const beforeMaths = mathematics(before);
  const beforeDigest = digest(beforeMaths);

  const applied = [];
  for (const file of [bundleFile, noteFile]) {
    if (!fs.existsSync(file)) continue;
    let text = fs.readFileSync(file, "utf8");
    const original = text;
    for (const [from, to] of swaps) {
      // Swaps are written as the author wrote the prose; in the file it is JSON-escaped, so both
      // sides are escaped before matching. A regular expression matches the escaped text directly.
      let hits = 0;
      if (from instanceof RegExp) {
        const escaped = new RegExp(from.source.replace(/\\\$/g, "\\$"), from.flags);
        hits = (text.match(escaped) ?? []).length;
        if (hits) text = text.replace(escaped, to);
      } else {
        const needle = JSON.stringify(from).slice(1, -1);
        hits = text.split(needle).length - 1;
        if (hits) text = text.split(needle).join(JSON.stringify(to).slice(1, -1));
      }
      if (hits === 0) continue;
      applied.push({ file: path.basename(file), from: String(from.source ?? from).replace(/\n/g, " ⏎ ").slice(0, 72), hits });
      totalRuns += hits;
    }
    if (text !== original && !DRY) fs.writeFileSync(file, text);
  }

  if (!DRY) {
    const after = JSON.parse(fs.readFileSync(bundleFile, "utf8"));
    const afterMaths = mathematics(after);
    if (afterMaths.length !== beforeMaths.length || digest(afterMaths) !== beforeDigest) {
      console.error(`FAIL ${slug}: an answer spec or commonError pattern changed`);
      for (let i = 0; i < Math.max(afterMaths.length, beforeMaths.length); i++)
        if (afterMaths[i] !== beforeMaths[i]) console.error(`  was ${beforeMaths[i]}\n  now ${afterMaths[i]}`);
      process.exit(1);
    }
  }
  report.push({ slug, applied, specs: beforeMaths.length, digest: beforeDigest.slice(0, 16) });
}

for (const r of report) {
  console.log(`\n${r.slug}  (${r.specs} answer specs and patterns, sha ${r.digest} unchanged)`);
  for (const a of r.applied) console.log(`  ${a.file.padEnd(17)} ×${a.hits}  "${a.from}"`);
  if (r.applied.length === 0) console.log("  (nothing matched)");
}
console.log(`\n${DRY ? "would reword" : "reworded"} ${totalRuns} string(s) across ${report.length} topics; every answer spec and commonError pattern byte-identical`);
