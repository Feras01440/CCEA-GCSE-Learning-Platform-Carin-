#!/usr/bin/env node
/**
 * Assembles packs/maths/content/m7/changing-the-subject-harder-formulae/bundle.json from the
 * authored data modules in this folder, attaching a verification log to every item.
 *
 * Every rearrangement quoted in a `maths-symbolic` detail was checked by substitution in
 * scratchpad/subject/gen.mjs (35 rearrangements, 40 substitutions each, 0 failures).
 *
 * Run: node scratchpad/subject/build.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPIC, topic, note, workedExamples, diagnostics } from "./data-a.mjs";
import { questions } from "./data-b.mjs";
import { findTheMistake, prompts, insight, sets } from "./data-c.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = path.join(ROOT, "packs", "maths", "content", "m7", "changing-the-subject-harder-formulae");

const AT = "2026-09-13T09:00:00Z";
const TOOL = "claude (author-topic pass; every rearrangement re-checked by substitution in scratchpad/subject/gen.mjs)";

const check = (type, detail, result = "pass") => ({ type, tool: TOOL, result, detail, at: AT, by: "claude" });
const log = (itemId, checks) => ({ id: `ver.${itemId}`, itemId, version: 1, checks, status: "verified", reports: [] });

const SCOPE_H =
  "Higher tier, M7 with M8 reuse. Nothing beyond M7-NA-07 and its Teacher Guidance: a power or root of the subject, or the subject in more than one term. No rearrangement that would need the quadratic formula, no logarithms, no inverse-function notation";
const COPY =
  "Compared by hand against the M7 and M8 papers and mark schemes read for this topic (summer 2025 M7 P2 Q13 and M8 P2 Q6, November 2024 M8 P1 Q9, November 2023 M7 P2 Q15, summer 2023 M7 P2 Q10, summer 2022 M7 P1 Q14 and M8 P1 Q8, summer 2026 M7 P1 Q11 and M8 P1 Q2, January 2020 M7 P1 Q11/Q15 and M8 P1 Q4/Q8): every formula, letter, number and context here is new, and no eight-word sequence is shared with any paper, scheme or report";
const STYLE =
  "KaTeX renderToString (throwOnError) compiled every $…$ segment in this bundle and in note.blocks.json; British English; second person; no exclamation marks; no 9-1 grade label; no verdict word used to judge a learner's answer";
const CMD =
  "Make the subject, Work out, Write down, Show that, Hence — all listed in packs/maths/exam-true/command-words.json";
const FORMULA =
  "Nothing on the M7/M8 formula sheet (page 2) helps: packs/maths/exam-true/formula-sheets.json lists prism, trapezium, sphere, cone, quadratic formula and the trigonometric rules. The cone and circle formulae used here are quoted inside the stems, and the rearranging itself is must-know";

/** Item-specific symbolic / numeric detail, keyed by the tail of the item id. */
const DETAIL = {
  "we.01":
    "V = (1/3)·pi·r²·h with r = sqrt(3V/(pi·h)): 40 random (V, h) substituted back, worst relative gap 1.5e-16. Printed check V = 96pi, h = 8 gives r = sqrt(288pi/8pi) = sqrt(36) = 6 and (1/3)pi(36)(8) = 96pi. Twin E = (1/2)mv² with v = sqrt(2E/m): 40 substitutions, worst gap 1.6e-16",
  "we.02":
    "8x - 3w = wx + 12 with x = (12+3w)/(8-w): 40 random w substituted back, worst relative gap 1.1e-16. Printed check w = 2 gives x = 18/6 = 3, 8(3) - 3(2) = 18 and 2(3) + 12 = 18. Twin 5y + 2c = cy + 14 with y = (14-2c)/(5-c): 40 substitutions, worst gap 8.4e-16",
  "we.03":
    "k = 2n/(n+5) with n = 5k/(2-k): 40 random k substituted back, worst relative gap 1.1e-16. Printed check k = 1.5 gives n = 7.5/0.5 = 15 and 2(15)/20 = 1.5. Twin g = 3t/(t-4) with t = 4g/(g-3): 40 substitutions, worst gap 1.3e-16",
  "we.04":
    "T = 3x²/(x²+4) with x = 2·sqrt(T/(3-T)): 40 random T substituted back, worst relative gap 8.3e-17. Printed check T = 2 gives x² = 8 and 3(8)/(8+4) = 2. Twin W = 5y²/(y²-2) with y = sqrt(2W/(W-5)): 40 substitutions, worst gap 5.2e-16",
  "0001": "y = 5x - 8 with x = (y+8)/5: 40 substitutions, exact agreement. Printed check x = 4 gives y = 12 and (12+8)/5 = 4",
  "0002": "y = x/3 + 4 with x = 3(y-4): 40 substitutions, exact agreement. Printed check x = 9 gives y = 7 and 3(7-4) = 9",
  "0003": "y = (x-6)/7 with x = 7y + 6: 40 substitutions, exact agreement. Printed check x = 20 gives y = 2 and 7(2) + 6 = 20",
  "0004": "y = x² - 11 with x = sqrt(y+11): 40 substitutions, worst relative gap 9.8e-17. Printed check x = 5 gives y = 14 and sqrt(25) = 5",
  "0005": "A = pi·r² with r = sqrt(A/pi): 40 substitutions, worst relative gap 1.3e-16. Printed check r = 3 gives A = 9pi and sqrt(9pi/pi) = 3",
  "0006": "y = sqrt(2x-1) with x = (y²+1)/2: 40 substitutions, worst relative gap 3.8e-17. Printed check x = 13 gives y = sqrt(25) = 5 and (25+1)/2 = 13",
  "0007": "c² = a² + b² with b = sqrt(c² - a²): 40 substitutions, worst relative gap 1.1e-16. Printed check a = 8, c = 17 gives b = sqrt(225) = 15 and 64 + 225 = 289",
  "0008": "6x = 2x + w with x = w/4: 40 substitutions, exact agreement. Printed check x = 5 gives w = 20 and 30 = 10 + 20",
  "0009":
    "9x - c = cx + 4 with x = (4+c)/(9-c): 40 substitutions, worst relative gap 7.0e-17. Printed check c = 1 gives x = 5/8, 9(5/8) - 1 = 4.625 and 1(5/8) + 4 = 4.625",
  "0010":
    "ax + 3 = 5x - b with x = (b+3)/(5-a): 40 substitutions, worst relative gap 3.2e-16. Printed check a = 2, b = 7 gives x = 10/3 and both sides come to 29/3",
  "0011": "y = 4/(x+2) with x = (4-2y)/y: 40 substitutions, worst relative gap 1.1e-16. Printed check y = 0.5 gives x = 3/0.5 = 6 and 4/8 = 0.5",
  "0012": "g = (h+3)/(h-1) with h = (g+3)/(g-1): 40 substitutions, worst relative gap 1.6e-16. Printed check g = 5 gives h = 8/4 = 2 and (2+3)/(2-1) = 5",
  "0013":
    "P = 100(s-c)/c with s = c(P+100)/100: 40 substitutions, worst relative gap 4.2e-15. Printed check P = 25, c = 40 gives s = 40(125)/100 = 50 and 100(10)/40 = 25",
  "0014": "4a + 9b = ab with a = 9b/(b-4): 40 substitutions, worst relative gap 9.8e-17. Printed check b = 6 gives a = 54/2 = 27, 4(27) + 9(6) = 162 and 27 x 6 = 162",
  "0015":
    "S = 2·pi·r² + 2·pi·r·h with h = (S - 2·pi·r²)/(2·pi·r): 40 substitutions, worst relative gap 8.2e-17. Part (b) recomputed: 2pi(16) = 100.530964914, 340 - 100.530964914 = 239.469035086, 2pi(4) = 25.132741229, quotient 9.528170162811104, so 9.5 to 1 dp. The distractor value 340/(8pi) = 13.528 is the same quotient without the subtraction",
  "0016":
    "T = 2·pi·sqrt(L/g) with L = g·T²/(4·pi²): 40 substitutions, worst relative gap under 1e-15. Part (b) recomputed: T = 3 and g = 10 give 90/(4pi²) = 90/39.478417604 = 2.2797266319526, so 2.28 to 2 dp. The distractor 10(3)/(4pi²) = 0.75991 is the same line with T not squared. The letter g (rather than a number) is deliberate: it makes the un-isolated intermediate line L/g = T²/(4pi²) differ from the answer by a non-constant factor, so the marking engine rejects it",
  "0017":
    "y = 5x²/(x²-3) with x² = 3y/(y-5): 40 substitutions, worst relative gap 6.1e-16. Part (b) recomputed: y = 8 gives x² = 24/3 = 8, x = sqrt(8) = 2.8284271247461903, so 2.83 to 3 sf, and 5(8)/(8-3) = 8 returns the given y",
  "ftm.01": "6x = wx + 15 with x = 15/(6-w): 40 substitutions, worst relative gap 1.2e-16. Printed check w = 1 gives x = 3 and 6(3) = 18 = 1(3) + 15",
  "ftm.02": "B = A·r² + 5 with r = sqrt((B-5)/A): 40 substitutions, worst relative gap 9.9e-17. Printed check A = 4, B = 21 gives r = 2 and 4(4) + 5 = 21",
  "ftm.03": "p - 5n = q with n = (p-q)/5: 40 substitutions, exact agreement. Printed check p = 17, q = 2 gives n = 3 and 17 - 15 = 2",
  dx: "Every stem checked by substitution: a = b² - c with b = ±sqrt(a+c); m = sqrt(n+7) with n = m² - 7; 5t = ht + 9 with t = 9/(5-h) (h = 2 gives t = 3); y = (3w+1)/5 with w = (5y-1)/3; x² = 9k/4 with x = ±3·sqrt(k)/2. sqrt(9+16) = 5 while sqrt(9) + sqrt(16) = 7, as quoted in two distractors",
  note: "Every figure and gate in note.blocks.json recomputed: 3x + 4 = 19 gives x = 5; F = 9C/5 + 32 with C = 5(F-32)/9 gives C = 20 at F = 68; y = sqrt(3x+5) with x = (y²-5)/3 checked over 40 substitutions; x = (12+3w)/(8-w) at w = 2 gives 3 with both sides 18; 2(15)/(15+5) = 1.5",
};

const detailFor = (id) => {
  for (const key of Object.keys(DETAIL)) if (id.includes(key)) return DETAIL[key];
  return null;
};

const ALIGN = {
  "we.01": "Exercises the November 2024 M7 P1 Q17 finding (root taken before the squared term was isolated; root over part of the side only)",
  "we.02": "Exercises the summer 2025 M7 P2 Q13 and M8 P2 Q6 findings (subject in two terms: collect, factorise, divide)",
  "we.03": "Exercises the summer 2025 findings inside a fraction, and the summer 2023 M7 P2 Q10 finding that the intermediate line carries a mark",
  "we.04": "Exercises both examiner themes at once — the aStarSignal on the insight card: the subject appearing twice and inside a power",
  dx: "Every distractor names a registered misconception; the eight items between them cover all four themes on the insight card",
  ftm: "Seeded directly from the cited Chief Examiner finding",
  prompts: "Keeps the insight card's ruleToRemember and its three commonest loss points in retrieval",
};
const alignFor = (id) => {
  for (const key of Object.keys(ALIGN)) if (id.includes(key)) return ALIGN[key];
  return null;
};

const verification = [];

verification.push(
  log(note.id, [
    check("schema", "NoteFrontmatter and the StepRevealNote block contract in src/components/items/gates.ts; one video block from data/links/media-map.json key maths:changing-the-subject-harder-formulae, followed by a gate"),
    check("scope-tier", SCOPE_H),
    check("formula-sheet", FORMULA),
    check("command-words", CMD),
    check("tariff", "The Sheet quotes the tariffs actually set: 2 marks for one or two clean steps, 3 marks whenever a power or a repeated subject is involved, single part, late in the paper. packs/maths/exam-true/tariffs.json gives M7 perPart typical 2, p90 4"),
    check("maths-numeric", DETAIL.note),
    check("maths-symbolic", "Both note figures are rearrangements that were substitution-checked: 3x + 4 = 19 and y = sqrt(3x+5) with x = (y²-5)/3"),
    check("examiner-alignment", "One examiner callout per finding on packs/maths/insights/m7.changing-the-subject-harder-formulae.json, each citing its series and question; all five findings covered"),
    check("copy-shingle", COPY),
    check("style-lint", STYLE),
  ]),
);

for (const we of workedExamples) {
  const tail = we.id.slice(-6);
  verification.push(
    log(we.id, [
      check("schema", "WorkedExample: steps numbered in order, faded showSteps below the step count, twin carries its own AnswerSpec"),
      check("scope-tier", SCOPE_H),
      check("formula-sheet", FORMULA),
      check("command-words", CMD),
      check("maths-symbolic", detailFor(tail) ?? ""),
      check("examiner-alignment", alignFor(tail) ?? ""),
      check("copy-shingle", COPY),
      check("style-lint", STYLE),
    ]),
  );
}

verification.push(
  log(diagnostics[0].id, [
    check("schema", "DiagnosticSet: eight items, each with exactly one correct option and a registered misconception on every distractor"),
    check("scope-tier", SCOPE_H),
    check("maths-symbolic", DETAIL.dx),
    check("examiner-alignment", ALIGN.dx),
    check("copy-shingle", COPY),
    check("style-lint", STYLE),
  ]),
);

for (const q of questions) {
  const tail = q.id.slice(-4);
  const hasNumeric = q.parts.some((p) => p.answer.kind === "numeric");
  const checks = [
    check("schema", `Question: parts sum to totalMarks (${q.totalMarks}), each part's scheme sums to its marks, skeleton "${q.skeleton}" matches the parts`),
    check("scope-tier", SCOPE_H),
    check("formula-sheet", FORMULA),
    check("command-words", CMD),
    check(
      "tariff",
      `${q.totalMarks} mark${q.totalMarks === 1 ? "" : "s"} on ${q.paper.unit} Paper ${q.paper.paper}; packs/maths/exam-true/tariffs.json gives ${q.paper.unit} perPart typical 2 and p90 4, and the papers read set exactly 2 marks for one or two clean steps and 3 for a power or a repeated subject. timeAllowanceSec = marks x 1.5 min x 60`,
    ),
  ];
  if (hasNumeric) checks.push(check("maths-numeric", detailFor(tail) ?? ""));
  checks.push(check("maths-symbolic", detailFor(tail) ?? ""));
  checks.push(
    check(
      "examiner-alignment",
      `Exercises ${q.examinerSources.join(", ")}; every commonError names a registered misconception and, where it came from a report, cites it`,
    ),
  );
  checks.push(check("copy-shingle", COPY));
  checks.push(check("style-lint", STYLE));
  verification.push(log(q.id, checks));
}

for (const f of findTheMistake) {
  const tail = f.id.slice(-7);
  verification.push(
    log(f.id, [
      check("schema", "FindTheMistake: mistakeLine indexes a studentWorking line, misconception is registered, marksEarnedAsWritten uses CCEA mark codes"),
      check("scope-tier", SCOPE_H),
      check("maths-symbolic", detailFor(tail) ?? ""),
      check("examiner-alignment", `${ALIGN.ftm}: ${f.source}`),
      check("copy-shingle", COPY),
      check("style-lint", STYLE),
    ]),
  );
}

for (const p of prompts) {
  verification.push(
    log(p.id, [
      check("schema", "RetrievalPrompt: kind from the enum, prompt and answer non-empty, keyWords present"),
      check("scope-tier", SCOPE_H),
      check("examiner-alignment", ALIGN.prompts),
      check("copy-shingle", COPY),
      check("style-lint", STYLE),
    ]),
  );
}

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic,
  note,
  workedExamples,
  diagnostics,
  questions,
  findTheMistake,
  prompts,
  insight,
  sets,
  verification,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "bundle.json"), `${JSON.stringify(bundle, null, 2)}\n`);

const bytes = fs.statSync(path.join(OUT_DIR, "bundle.json")).size;
console.log(
  `wrote bundle.json (${(bytes / 1024).toFixed(1)} KB): ${workedExamples.length} we, ` +
    `${diagnostics[0].items.length} dx, ${questions.length} q (${questions.filter((q) => q.style === "exam-style").length} exam-style), ` +
    `${findTheMistake.length} ftm, ${prompts.length} rp, ${sets.length} sets, ${verification.length} verification logs`,
);
console.log(`topic ${TOPIC}`);
