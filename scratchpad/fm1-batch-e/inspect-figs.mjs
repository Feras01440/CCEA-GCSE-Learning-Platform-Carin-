/** Print the figure text nodes, alt and title of the M3/M4 items the FIGURE lint names. */
import fs from "node:fs";

const TARGETS = [
  ["maths/m3/box-plots-and-comparing-distributions", "q.maths.m3.box-plots-and-comparing-distributions.0009"],
  ["maths/m3/straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines", "q.maths.m3.straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines.0010"],
  ["maths/m4/circle-theorems", "q.maths.m4.circle-theorems.0014"],
  ["maths/m4/quadratic-formula-and-harder-quadratic-equations", "we.maths.m4.quadratic-formula-and-harder-quadratic-equations.03"],
];

const svgText = (src) => {
  if (src.startsWith("<svg")) return src;
  const comma = src.indexOf(",");
  return comma < 0 ? null : decodeURIComponent(src.slice(comma + 1));
};

for (const [dir, id] of TARGETS) {
  const file = `packs/${dir.split("/")[0]}/content/${dir.split("/")[1]}/${dir.split("/")[2]}/bundle.json`;
  const b = JSON.parse(fs.readFileSync(file, "utf8"));
  const item = [...b.questions, ...b.workedExamples].find((x) => x.id === id);
  if (!item) {
    console.log(`\n### ${id}: NOT FOUND in ${file}`);
    continue;
  }
  console.log(`\n### ${id}   (${file})`);
  const figs = item.figures ?? (item.figure ? [item.figure] : []);
  figs.forEach((f, i) => {
    const t = svgText(f.src ?? "");
    console.log(`  figure ${i + 1} alt: ${f.alt}`);
    if (!t) return;
    console.log(`    <title>: ${(t.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "(none)"}`);
    console.log(`    aria-label: ${(t.match(/aria-label='([^']*)'/) ?? [])[1] ?? "(none)"}`);
    const texts = [...t.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
    console.log(`    text nodes (${texts.length}): ${texts.join(" | ")}`);
  });
  for (const p of item.parts ?? []) {
    console.log(`  part (${p.id}) [${p.marks}]: ${p.stem.replace(/\n/g, " ⏎ ").slice(0, 150)}`);
    console.log(`      answer: ${JSON.stringify(p.answer).slice(0, 160)}`);
  }
  if (item.finalAnswer) console.log(`  finalAnswer: ${item.finalAnswer.slice(0, 120)}`);
  if (item.stem && !item.parts) console.log(`  stem: ${item.stem.replace(/\n/g, " ⏎ ").slice(0, 160)}`);
}
