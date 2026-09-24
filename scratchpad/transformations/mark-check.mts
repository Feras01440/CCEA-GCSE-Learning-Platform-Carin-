/** Marks every text AnswerSpec in the bundle against its own model answer, with the app's engine. */
import fs from "node:fs";
import path from "node:path";
import { markText } from "../../src/components/items/text-marking.ts";
import {
  checkTransformation,
  describeMapping,
  formatVertices,
  graphTestMatches,
  sameVertexSet,
  type Vertex,
} from "../../src/lib/marking/transformation.ts";
import { guidesFromStem } from "../../src/components/items/grid-guides.ts";

const file = path.resolve(
  import.meta.dirname,
  "../../packs/maths/content/m7/combined-transformations-and-reflections-in-y-equals-plus-or-minus-x/bundle.json",
);
const bundle = JSON.parse(fs.readFileSync(file, "utf8"));

type Spec = { kind: string; accepted: string[]; keyWords: { any: string[]; marks: number; reject?: string[] }[]; listingRule: boolean };
const rows: Array<{ where: string; spec: Spec }> = [];
for (const q of bundle.questions) {
  for (const p of q.parts) if (p.answer.kind === "text") rows.push({ where: `${q.id}/${p.id}`, spec: p.answer });
}
for (const we of bundle.workedExamples) {
  if (we.twin.answer.kind === "text") rows.push({ where: `${we.id}/twin`, spec: we.twin.answer });
}

let fails = 0;
for (const { where, spec } of rows) {
  // 1. the exact accepted string
  for (const a of spec.accepted) {
    const r = markText(a, spec as never);
    if (!r.correct) {
      fails += 1;
      console.log(`FAIL exact  ${where}: "${a}" -> ${r.marksAwarded}/${r.marksAvailable} ${r.feedback}`);
    }
  }
  // 2. one answer built from the first alternative of every key-word group (a realistic learner sentence)
  const built = spec.keyWords.map((g) => g.any[0]).join(", ");
  const r = markText(built, spec as never);
  if (!r.correct) {
    fails += 1;
    console.log(`FAIL groups ${where}: "${built}" -> ${r.marksAwarded}/${r.marksAvailable} ${r.feedback}`);
  }
  // 3. every alternative inside every group must fire on its own
  spec.keyWords.forEach((g, i) => {
    for (const alt of g.any) {
      const sentence = spec.keyWords.map((gg, j) => (j === i ? alt : gg.any[0])).join(", ");
      const rr = markText(sentence, spec as never);
      if (!rr.correct) {
        fails += 1;
        console.log(`FAIL alt    ${where} group ${i} "${alt}": "${sentence}" -> ${rr.marksAwarded}/${rr.marksAvailable}`);
      }
    }
  });
}
// 4. answers the examiners call wrong must not reach full marks.
const negatives: Array<[string, string]> = [
  ["q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0005/main", "Reflection in the line y = -x"],
  ["q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0005/main", "Reflection in y = x then a translation 3 down"],
  ["q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0010/main", "Turned 90 clockwise about (-1, -1)"],
  ["q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0010/main", "Rotation, 90 anticlockwise, about (-1, -1)"],
  ["q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0010/main", "Rotation about (-1, -1)"],
  ["q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0011/main", "Enlargement, scale factor 1/3"],
  ["q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0011/main", "Enlargement, scale factor 3, centre (3, 3)"],
  ["q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0009/main", "Reflection in y = x then reflection in y = -x"],
  ["q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0012/main", "Translation 4 right"],
];
for (const [where, answer] of negatives) {
  const row = rows.find((r) => r.where === where);
  if (!row) {
    fails += 1;
    console.log(`FAIL setup  no spec at ${where}`);
    continue;
  }
  const r = markText(answer, row.spec as never);
  if (r.correct) {
    fails += 1;
    console.log(`FAIL neg    ${where}: "${answer}" was marked correct`);
  } else {
    console.log(`ok   neg    ${where.split(".").pop()}: "${answer}" -> ${r.marksAwarded}/${r.marksAvailable}`);
  }
}

// ---------------------------------------------------------------------------
// Draw-the-image parts, through the transformation engine.
// ---------------------------------------------------------------------------
type Graph = { object: Vertex[]; image: Vertex[] };
let graphs = 0;
let tests = 0;
for (const q of bundle.questions) {
  for (const p of q.parts) {
    if (p.answer.kind !== "graph" || p.answer.expect.plot !== "transformation") continue;
    graphs += 1;
    const spec = p.answer.expect as Graph;
    const where = `${q.id.split(".").pop()}/${p.id}`;

    // The model image is marked correct, whatever order the vertices go in.
    for (const order of [spec.image, [...spec.image].reverse()]) {
      const r = checkTransformation(formatVertices(order), spec);
      if (!r.correct) {
        fails += 1;
        console.log(`FAIL graph  ${where}: model image scored ${r.inPlace}/${r.total} — ${r.feedback}`);
      }
    }
    // The object left unmoved must not be accepted.
    if (!sameVertexSet(spec.object, spec.image) && checkTransformation(formatVertices(spec.object), spec).correct) {
      fails += 1;
      console.log(`FAIL graph  ${where}: the unmoved object was marked correct`);
    }
    // The engine must be able to name what was asked, so wrong-shape feedback reads properly.
    const asked = describeMapping(spec.object, spec.image);
    if (!asked) {
      fails += 1;
      console.log(`FAIL name   ${where}: no single transformation in the library maps the object onto the image`);
    } else {
      // The transformation the engine finds must be the one the stem names: if the engine prefers a
      // different single transformation, the shape is ambiguous and a describe part would have two answers.
      const family = (s: string) =>
        /reflect/i.test(s) ? "reflection" : /rotat/i.test(s) ? "rotation" : /enlarge/i.test(s) ? "enlargement" : /translat/i.test(s) ? "translation" : "?";
      const wantedFrom = p.stem.split("(So ")[0]!;
      if (family(asked) !== family(wantedFrom)) {
        fails += 1;
        console.log(`FAIL ambig  ${where}: the stem asks for a ${family(wantedFrom)} but the engine names "${asked}"`);
      }
    }
    // The stem must give the grid its guide where the transformation has a line or a centre.
    const guides = guidesFromStem(p.stem);
    const needsGuide = /\bline\s+\$?y\s*=|\bcentre\b/.test(p.stem);
    if (needsGuide && guides.length === 0) {
      fails += 1;
      console.log(`FAIL guide  ${where}: stem names a line or centre but no guide is parsed`);
    }
    // Every graph common error fires on its own vertex list and on nothing else.
    for (const e of p.commonErrors) {
      if (e.pattern.kind !== "graph") continue;
      tests += 1;
      const listed = e.pattern.test;
      const wrong = [...listed.matchAll(/\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g)].map(
        (m) => [Number(m[1]), Number(m[2])] as Vertex,
      );
      if (!graphTestMatches(formatVertices(wrong), listed)) {
        fails += 1;
        console.log(`FAIL test   ${where}: "${listed}" does not match its own vertex list`);
      }
      if (graphTestMatches(formatVertices(spec.image), listed)) {
        fails += 1;
        console.log(`FAIL test   ${where}: the common error fires on the correct image`);
      }
      const named = describeMapping(spec.object, wrong);
      console.log(`ok   graph  ${where}: "${e.misconception.split(".").pop()}" -> ${named ?? "not a single transformation of the object"}`);
    }
    console.log(`ok   asked  ${where}: ${asked}${guides.length ? ` · guide ${guides.map((g) => g.label).join(", ")}` : ""}`);
  }
}

console.log(
  `\n${rows.length} text specs checked, ${negatives.length} wrong answers rejected, ${graphs} graph specs checked, ${tests} graph common-error tests, ${fails} failure(s)`,
);
if (fails) process.exitCode = 1;
