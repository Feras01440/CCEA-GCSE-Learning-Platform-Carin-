import fs from "node:fs";

const src = "public/content/maths/maths.m4.histograms-unequal-widths.json";
const b = JSON.parse(fs.readFileSync(src, "utf8"));
const nb = b.noteBlocks;

const pick = {
  hero: nb.find((x) => x.type === "hero"),
  firstFigure: nb.find((x) => x.type === "figure"),
  paras: nb.filter((x) => x.type === "p").slice(0, 4),
  headings: nb.filter((x) => x.type === "h").map((x) => x.text),
  gates: nb.filter((x) => x.type === "gate").slice(0, 3),
  why: nb.find((x) => x.kind === "why"),
  mustknow: nb.find((x) => x.kind === "mustknow"),
  examiner: nb.find((x) => x.kind === "examiner"),
  sheet: b.note.sheet,
  insight: b.insight,
  question1: b.questions[0],
  question2: b.questions.find((q) => q.parts.length > 1) ?? b.questions[1],
  workedExample: b.workedExamples?.[0],
  topicMeta: { title: b.note.title, unit: b.note.unit, specRefs: b.note.specRefs, hardness: b.note.hardness, formulaSheet: b.note.formulaSheet },
};

fs.mkdirSync("scratchpad/art-direction/data", { recursive: true });
fs.writeFileSync("scratchpad/art-direction/data/histograms.json", JSON.stringify(pick, null, 2));
fs.writeFileSync("scratchpad/art-direction/data/figure.svg", pick.firstFigure.svg);
console.log("figure svg bytes:", pick.firstFigure.svg.length);
console.log("headings:", pick.headings.join(" | "));
console.log("\nwhy:", JSON.stringify(pick.why).slice(0, 700));
console.log("\nmustknow:", JSON.stringify(pick.mustknow).slice(0, 700));
console.log("\nexaminer:", JSON.stringify(pick.examiner).slice(0, 900));
console.log("\nsheet:", JSON.stringify(pick.sheet).slice(0, 1400));
console.log("\ninsight:", JSON.stringify(pick.insight).slice(0, 1200));
console.log("\nq2:", JSON.stringify(pick.question2).slice(0, 1600));
console.log("\nfigure caption:", pick.firstFigure.caption ?? "(none)");
console.log("\nfigure alt:", pick.firstFigure.alt);
