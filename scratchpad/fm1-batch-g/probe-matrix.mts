/**
 * FM1 batch G — what typed form of a 2 x 2 matrix, if any, does the app's marker accept?
 * Probed before a single answer spec is designed, because the FM2 B author found pmatrix
 * rejected for vectors. Every spec kind that could plausibly hold a matrix is tried.
 */
import { markAnswer } from "../../src/components/items/mark.ts";
import type { AnswerSpec } from "../../src/lib/content/schema.ts";

const TYPED = [
  "\\begin{pmatrix}5&2\\\\1&4\\end{pmatrix}",
  "\\begin{bmatrix}5&2\\\\1&4\\end{bmatrix}",
  "\\begin{matrix}5&2\\\\1&4\\end{matrix}",
  "[[5,2],[1,4]]",
  "(5 2; 1 4)",
  "5 2 1 4",
  "5, 2, 1, 4",
];

const specs: Array<[string, AnswerSpec]> = [
  [
    "algebraic pmatrix",
    { kind: "algebraic", latex: "\\begin{pmatrix}5&2\\\\1&4\\end{pmatrix}", equivalence: "equivalent", variables: [] },
  ],
  [
    "algebraic bmatrix",
    { kind: "algebraic", latex: "\\begin{bmatrix}5&2\\\\1&4\\end{bmatrix}", equivalence: "equivalent", variables: [] },
  ],
  [
    "algebraic bracket list",
    { kind: "algebraic", latex: "[[5,2],[1,4]]", equivalence: "equivalent", variables: [] },
  ],
  [
    "text with accepted spellings",
    {
      kind: "text",
      accepted: ["5 2 1 4", "(5 2; 1 4)", "[[5,2],[1,4]]"],
      keyWords: [
        { any: ["5"], marks: 1 },
        { any: ["2"], marks: 1 },
      ],
      listingRule: false,
    },
  ],
  [
    "table, one input per entry",
    {
      kind: "table",
      cells: [
        { row: 0, col: 0, value: 5 },
        { row: 0, col: 1, value: 2 },
        { row: 1, col: 0, value: 1 },
        { row: 1, col: 1, value: 4 },
      ],
    },
  ],
];

for (const [label, spec] of specs) {
  console.log("==", label);
  const probes =
    spec.kind === "table"
      ? [JSON.stringify({ cells: [
          { row: 0, col: 0, value: "5" },
          { row: 0, col: 1, value: "2" },
          { row: 1, col: 0, value: "1" },
          { row: 1, col: 1, value: "4" },
        ] })]
      : TYPED;
  for (const raw of probes) {
    const r = markAnswer(raw, spec, { marks: 2 });
    console.log(`   ${JSON.stringify(raw).slice(0, 52).padEnd(54)} -> correct=${r.correct} marks=${r.marksAwarded}/2 | ${String(r.explanation).slice(0, 80)}`);
  }
}

// Does the algebraic engine tell a wrong matrix from a right one at all?
console.log("== algebraic pmatrix, a WRONG matrix");
for (const raw of ["\\begin{pmatrix}5&2\\\\1&5\\end{pmatrix}", "\\begin{pmatrix}2&5\\\\4&1\\end{pmatrix}"]) {
  const spec: AnswerSpec = { kind: "algebraic", latex: "\\begin{pmatrix}5&2\\\\1&4\\end{pmatrix}", equivalence: "equivalent", variables: [] };
  const r = markAnswer(raw, spec, { marks: 2 });
  console.log(`   ${JSON.stringify(raw).slice(0, 52).padEnd(54)} -> correct=${r.correct} | ${String(r.explanation).slice(0, 80)}`);
}

// A single numeric entry, which is the fallback encoding.
console.log("== numeric single entry");
const n: AnswerSpec = { kind: "numeric", value: -26, tolerance: { type: "absolute", value: 0.0005 }, unitRequired: false, acceptForms: ["decimal", "fraction"] };
for (const raw of ["-26", "−26", "- 26"]) {
  const r = markAnswer(raw, n, { marks: 1 });
  console.log(`   ${JSON.stringify(raw).padEnd(54)} -> correct=${r.correct} | ${String(r.explanation).slice(0, 60)}`);
}
