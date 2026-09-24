/** Audit every SVG in the nine M3 NA bundles against the house rule. */
import fs from "node:fs";
import path from "node:path";

const SLUGS = [
  "hcf-and-lcm-from-prime-factor-form",
  "upper-and-lower-bounds-addition-and-multiplication",
  "identities-and-expanding-double-brackets",
  "factorising-quadratics-x2-plus-bx-plus-c",
  "difference-of-two-squares",
  "algebraic-fractions-with-numerical-denominators",
  "simplifying-multiplying-and-dividing-algebraic-fractions",
  "solving-quadratic-equations-by-factorising",
  "straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines",
];

const FORBIDDEN = [
  [/<style[\s>]/i, "<style> element"],
  [/<script[\s>]/i, "<script> element"],
  [/\s on[a-z]+\s*=/i, "event handler attribute"],
  [/xlink:href/i, "xlink:href"],
  [/\shref\s*=/i, "href attribute"],
  [/prefers-color-scheme/i, "prefers-color-scheme media query"],
  [/<image[\s>]/i, "<image> element"],
  [/<foreignObject/i, "<foreignObject>"],
  [/<use[\s>]/i, "<use> element"],
  [/@media/i, "@media rule"],
];

let svgCount = 0, problems = 0;
const rows = [];

function checkSvg(where, svg, alt) {
  svgCount++;
  const issues = [];
  for (const [re, label] of FORBIDDEN) if (re.test(svg)) issues.push(label);
  if (!/viewBox\s*=/.test(svg)) issues.push("no viewBox");
  if (svg.includes("#")) issues.push('raw "#"');
  const bytes = Buffer.byteLength(svg, "utf8");
  if (bytes > 12000) issues.push(`${bytes} bytes (over 12 KB)`);
  // every stroke/fill must be currentColor, none, a fill-opacity tint, or a plain number
  for (const m of svg.matchAll(/(stroke|fill)\s*=\s*['"]([^'"]*)['"]/g)) {
    const v = m[2].trim();
    if (v !== "currentColor" && v !== "none") issues.push(`${m[1]}="${v}" is not currentColor/none`);
  }
  if (!alt || alt.length < 20) issues.push("alt text missing or too short");
  if (issues.length) { problems++; console.log(`FAIL ${where}: ${issues.join("; ")}`); }
  rows.push({ where, bytes, ok: issues.length === 0 });
}

for (const slug of SLUGS) {
  const dir = path.join("packs", "maths", "content", "m3", slug);
  const b = JSON.parse(fs.readFileSync(path.join(dir, "bundle.json"), "utf8"));
  const blocks = JSON.parse(fs.readFileSync(path.join(dir, "note.blocks.json"), "utf8"));

  const visitFig = (fig, where) => {
    if (!fig) return;
    if (fig.kind === "svg") {
      const src = fig.src;
      if (!src.startsWith("data:image/svg+xml;utf8,")) { problems++; console.log(`FAIL ${where}: bad data URI prefix`); return; }
      checkSvg(where, src.slice("data:image/svg+xml;utf8,".length), fig.alt);
    } else if (fig.kind !== undefined) {
      rows.push({ where: `${where} (kind ${fig.kind})`, bytes: 0, ok: true });
    }
  };
  b.workedExamples.forEach((we) => visitFig(we.figure, `${slug} ${we.id}.figure`));
  b.workedExamples.forEach((we) => visitFig(we.twin?.figure, `${slug} ${we.id}.twin.figure`));
  b.questions.forEach((q) => q.figures.forEach((f, i) => visitFig(f, `${slug} ${q.id}.figures[${i}]`)));
  b.diagnostics.forEach((d) => d.items.forEach((it) => visitFig(it.figure, `${slug} ${d.id}/${it.id}.figure`)));
  b.prompts.forEach((p) => visitFig(p.image, `${slug} ${p.id}.image`));
  blocks.forEach((blk, i) => {
    if (blk.type === "figure") checkSvg(`${slug} note.blocks[${i}]`, blk.svg, blk.alt);
  });
}

console.log(`\n${svgCount} SVG(s) checked, ${problems} problem(s).`);
const biggest = rows.filter((r) => r.bytes).sort((a, b) => b.bytes - a.bytes).slice(0, 5);
console.log("largest:", biggest.map((r) => `${r.bytes}B ${r.where}`).join("\n          "));
if (problems) process.exitCode = 1;
