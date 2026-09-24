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
const man = JSON.parse(fs.readFileSync("src/generated/manifest.json", "utf8"));
const short = (id) => id.replace(/^([a-z]+)\.maths\.m3\.[a-z0-9-]+\.?/, "$1.");
let totQ = 0;

for (const slug of SLUGS) {
  const b = JSON.parse(fs.readFileSync(path.join("packs/maths/content/m3", slug, "bundle.json"), "utf8"));
  const blocks = JSON.parse(fs.readFileSync(path.join("packs/maths/content/m3", slug, "note.blocks.json"), "utf8"));
  const mt = man.topics.find((t) => t.slug === slug);
  const figs = new Set();
  b.workedExamples.forEach((w) => w.figure && figs.add(w.figure.alt.slice(0, 45)));
  b.questions.forEach((q) => q.figures.forEach((f) => figs.add(f.alt.slice(0, 45))));
  const noteFigs = blocks.filter((x) => x.type === "figure").length;
  const gates = blocks.filter((x) => x.type === "gate").length;
  const exam = b.questions.filter((q) => q.style === "exam-style").length;
  const prac = b.questions.filter((q) => q.style === "practice").length;
  const nonCalc = b.questions.filter((q) => q.paper.calculator === false).length;
  const marks = b.questions.reduce((n, q) => n + q.totalMarks, 0);
  totQ += b.questions.length;
  console.log(`\n### ${b.topic.id}  [${b.topic.hardness}, difficulty ${b.topic.difficulty}, order ${b.topic.order}]`);
  console.log(`published: we ${mt.counts.we} · dx ${mt.counts.dx} · q ${mt.counts.q} (${prac} practice + ${exam} exam-style, ${marks} marks, ${nonCalc} set on M7 P1 non-calculator) · ftm ${mt.counts.ftm} · rp ${mt.counts.rp} · note ${mt.hasNote} · blocks ${mt.hasBlocks} (${gates} gates) · insight ${b.insight ? "yes" : "no"} · sets ${(b.sets ?? []).length} · ver ${b.verification.length}`);
  console.log(`statements: ${b.topic.statementIds.join(", ")}   prerequisites: ${b.topic.prerequisites.join(", ")}`);
  console.log(`we:  ${b.workedExamples.map((w) => short(w.id)).join(", ")}`);
  console.log(`dx:  ${b.diagnostics.map((d) => `${short(d.id)} (${d.items.length} items: ${d.items.map((i) => i.id).join(",")})`).join("; ")}`);
  console.log(`q:   ${b.questions.map((q) => short(q.id)).join(", ")}`);
  console.log(`ftm: ${b.findTheMistake.map((f) => short(f.id)).join(", ")}`);
  console.log(`rp:  ${b.prompts.map((p) => short(p.id)).join(", ")}`);
  console.log(`figures (${figs.size} distinct in items, ${noteFigs} in the note):`);
  for (const f of figs) console.log(`     - ${f}...`);
}
console.log(`\nTOTAL questions across the nine bundles: ${totQ}`);
