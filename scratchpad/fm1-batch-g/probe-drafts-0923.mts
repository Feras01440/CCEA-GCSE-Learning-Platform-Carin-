/**
 * 23 Sep (job 3): the diagnostics, find-the-mistake items and prompts of eight FM1 topics that were never shipped (no
 * verification logs), marked ON DISK through the app's own markers before they go live.
 *   npx tsx scratchpad/fm1-batch-g/probe-drafts-0923.mts [--all]
 *   - find-the-mistake: markFix (the fix box's verdict) refuses every line of the student's working typed back, and
 *     accepts every correction line and the natural ways of writing the fix;
 *   - diagnostics: one correct option, unique ids and texts, every post-check distractor tagged with a registered
 *     misconception, and the matrix items re-derived from the matrices printed in their own stems;
 *   - prompts: answer and key words present; every prompt the note embeds exists.
 */
import fs from "node:fs";
import { markFix } from "../../src/components/items/mistake-marking.ts";
import { markAnswer } from "../../src/components/items/mark.ts";

const SLUGS = [
  "area-under-curve", "indicial-equations", "log-log-graphs", "logarithms-from-indices",
  "matrix-arithmetic", "matrix-inverse-2x2", "matrix-equations", "matrix-simultaneous-equations",
];
const registry = new Set(JSON.parse(fs.readFileSync("packs/further-maths/insights/misconceptions.json", "utf8")).map((m: any) => m.id));
let fails = 0;
let passes = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  if (cond) passes++;
  else fails++;
  if (!cond || process.argv.includes("--all")) console.log(`${cond ? "ok  " : "FAIL"} ${label}${detail ? `  :: ${detail}` : ""}`);
};

/**
 * Fixes a learner would plausibly type, beyond the correction's own lines (second run, 19:30: widened from one or two
 * per item to the spellings a phone keyboard with a "^" key invites).
 */
const EXTRA_FIXES: Record<string, string[]> = {
  "ftm.fm.u1.area-under-curve.01": ["Area = 16", "area = 16", "16", "A = 16", "Area = |-16| = 16"],
  "ftm.fm.u1.indicial-equations.01": ["(3x - 1) log 7 = log 200", "(3x-1)log7 = log200", "3x - 1 = log 200 / log 7", "x = 1.24", "x = 1.2409"],
  // "log k = 0.602, so k = 4" moved to engine-fix-gaps-0923.json: accepted at 19:30, refused after the engine's
  // mistake-marking.ts changed at 19:49 (reported to the lead as a possible regression)
  "ftm.fm.u1.log-log-graphs.01": ["k = 4", "k = 4.0", "k = 10^0.602 = 4.0", "4", "F = 4 h^1.5"],
  "ftm.fm.u1.matrix-arithmetic.01": ["row 1, column 1: (3)(5) + (-1)(-1) = 16", "(3)(5) + (-1)(-1) = 16", "3 x 5 + (-1)(-1) = 16", "15 + 1 = 16", "16", "AB = (16 6 ; 6 4)"],
  "ftm.fm.u1.matrix-inverse-2x2.01": ["N inverse = 1/(-5) x (-1 -2 ; -4 -3)", "N inverse = (1/5 2/5 ; 4/5 3/5)", "(1/5 2/5 ; 4/5 3/5)"],
  "ftm.fm.u1.matrix-equations.01": ["X = A inverse x B", "X = (-7 -3 ; 3 2)", "(-7 -3 ; 3 2)"],
  "ftm.fm.u1.matrix-simultaneous-equations.01": ["AX = B", "X = A inverse x B", "A = (4 3 ; 2 5) and B = (18 ; 16)"],
};
/** What is not the fix: the values or lines her working already has, and the misconception itself in other words. */
const NOT_FIXES: Record<string, string[]> = {
  "ftm.fm.u1.area-under-curve.01": ["Area = -16", "-16", "-16 - (0) = -16"],
  "ftm.fm.u1.indicial-equations.01": ["3x - 1 log 7 = log 200", "x = 1.05", "3x = log 200 + log 7", "3x = 3.146128"],
  "ftm.fm.u1.log-log-graphs.01": ["k = 0.602", "0.602", "F = 0.602 h^1.5", "n = 1.5"],
  "ftm.fm.u1.matrix-arithmetic.01": ["15", "(3)(5) = 15", "AB = (15 -2 ; -2 0)"],
  "ftm.fm.u1.matrix-inverse-2x2.01": ["N^-1 = (-1/5 -2/5 ; -4/5 -3/5)", "det N = -5", "(-1 -2 ; -4 -3)"],
  "ftm.fm.u1.matrix-equations.01": ["X = B A^-1", "X = BA^-1", "X = (-1 3 ; 3 -4)", "det A = 1"],
  "ftm.fm.u1.matrix-simultaneous-equations.01": ["x = 3 and y = 2", "x = 3, y = 2", "x = 3", "y = 2", "4x + 10y = 32", "(3 ; 2)", "X = (3 ; 2)"],
};
/**
 * Right fixes the fix box refuses for reasons in the engine, not in the item (reported to the lead 23 Sep, job 3):
 * "A^-1" is not read as "A inverse"; "10^0.602" is not read as a value; a matrix written in decimals is not the same
 * matrix in fractions; a unit of "units²" is not stripped. Printed as "engine" lines, not counted as failures; if one
 * starts to pass, the probe says so, so the list can be cut when the engine closes the gap. The list lives in
 * engine-fix-gaps-0923.json, which both batch libraries also read, so each item's log names its own gaps.
 */
const { _about, ...ENGINE_REFUSED }: Record<string, string[]> & { _about?: string } = JSON.parse(
  fs.readFileSync("scratchpad/fm1-batch-g/engine-fix-gaps-0923.json", "utf8"),
);
let engineRefused = 0;

/* ---- matrices, for re-deriving the matrix diagnostics from their own stems ---- */
type Mat = number[][];
const frac = (s: string): number => {
  const t = s.replace(/\s+/g, "");
  const m = /^(-?)\\frac\{(-?\d+)\}\{(\d+)\}$/.exec(t);
  if (m) return (m[1] === "-" ? -1 : 1) * (Number(m[2]) / Number(m[3]));
  return Number(t);
};
const pmats = (s: string): Mat[] =>
  [...String(s).matchAll(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g)].map((m) => m[1].split("\\\\").map((row) => row.split("&").map(frac)));
const mul = (A: Mat, B: Mat): Mat => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
const add = (A: Mat, B: Mat): Mat => A.map((r, i) => r.map((v, j) => v + B[i][j]));
const det = (A: Mat) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
const inv = (A: Mat): Mat => {
  const d = det(A);
  return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
};
const eq = (A: Mat, B: Mat) => A.length === B.length && A.every((r, i) => r.length === B[i].length && r.every((v, j) => Math.abs(v - B[i][j]) < 1e-9));
/** The item's stem names what is asked; re-derive it from the matrices the stem prints. */
function matrixExpected(slug: string, it: any): Mat | number | null {
  const M = pmats(it.stem);
  if (slug === "matrix-arithmetic" && it.id === "d1") return add(M[0], M[1]);
  if (slug === "matrix-arithmetic" && it.id === "d2") return mul(M[0], M[1]);
  if (slug === "matrix-inverse-2x2" && it.id === "d1") return det(M[0]);
  if (slug === "matrix-inverse-2x2" && it.id === "d3") return inv(M[0]);
  if (slug === "matrix-equations" && it.id === "p1") return inv(M[0]);
  if (slug === "matrix-equations" && it.id === "d3") return mul(inv(M[0]), M[1]);
  if (slug === "matrix-simultaneous-equations" && it.id === "p2") return inv(M[0]);
  return null;
}

for (const slug of SLUGS) {
  const b = JSON.parse(fs.readFileSync(`packs/further-maths/content/fm1/${slug}/bundle.json`, "utf8"));
  const n = JSON.parse(fs.readFileSync(`packs/further-maths/content/fm1/${slug}/note.blocks.json`, "utf8"));

  // find-the-mistake
  for (const f of b.findTheMistake) {
    const tag = `${slug} ${f.id.split(".").pop()}`;
    ok(f.mistakeLine >= 1 && f.mistakeLine <= f.studentWorking.length, `${tag}: mistakeLine inside the working`);
    ok(registry.has(f.misconception), `${tag}: misconception ${f.misconception} is registered`);
    for (const t of f.studentWorking) ok(!markFix(t, f).match, `${tag}: refuses her line ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
    for (const t of [...f.correction, ...(EXTRA_FIXES[f.id] ?? [])]) ok(markFix(t, f).match, `${tag}: accepts ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
    for (const t of NOT_FIXES[f.id] ?? []) ok(!markFix(t, f).match, `${tag}: refuses the non-fix ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
    for (const t of ENGINE_REFUSED[f.id] ?? []) {
      if (markFix(t, f).match) console.log(`info ${tag}: the engine now accepts ${JSON.stringify(t)}; cut it from ENGINE_REFUSED`);
      else {
        engineRefused++;
        console.log(`engine ${tag}: a right fix refused by the engine: ${JSON.stringify(t)}`);
      }
    }
  }

  // diagnostics
  for (const d of b.diagnostics) {
    for (const it of d.items) {
      const tag = `${slug} ${d.when}/${it.id}`;
      ok(it.options.filter((o: any) => o.correct).length === 1, `${tag}: exactly one correct option`);
      ok(new Set(it.options.map((o: any) => o.id)).size === it.options.length, `${tag}: option ids unique`);
      ok(new Set(it.options.map((o: any) => String(o.text).replace(/\s+/g, ""))).size === it.options.length, `${tag}: option texts distinct`);
      for (const o of it.options) {
        if (o.misconception) ok(registry.has(o.misconception), `${tag} ${o.id}: ${o.misconception} is registered`);
        if (d.when === "post" && !o.correct && !o.misconception) console.log(`note ${tag} ${o.id}: an untagged post-check distractor (${String(o.text).slice(0, 40)})`);
      }
      // the item marks as a multiple-choice answer the way the app marks it: by option id
      const right = it.options.find((o: any) => o.correct);
      const spec = { kind: "mcq", options: it.options.map((o: any) => ({ id: o.id, text: o.text, correct: o.correct })) };
      const r: any = markAnswer(right.id, spec as never, { marks: 1 } as never);
      ok(r.correct, `${tag}: the correct option's id marks correct`, String(r.explanation).slice(0, 60));
      const expect = matrixExpected(slug, it);
      if (expect !== null) {
        const got = typeof expect === "number" ? frac(String(right.text).replace(/\$/g, "")) : pmats(right.text)[0];
        const same = typeof expect === "number" ? Math.abs((got as number) - expect) < 1e-9 : eq(got as Mat, expect);
        ok(same, `${tag}: the correct option is re-derived from the stem's matrices`, JSON.stringify(expect));
      }
    }
  }

  // prompts
  for (const p of b.prompts) {
    ok(String(p.answer).trim().length > 0 && (p.keyWords ?? []).length > 0, `${slug} ${p.id.split(".").pop()}: answer and key words present`);
  }
  for (const blk of n.filter((x: any) => x.type === "prompt")) ok(b.prompts.some((p: any) => p.id === blk.promptId), `${slug}: the note's prompt ${blk.promptId} exists`);
}

console.log(`probe-drafts-0923: ${passes} ok, ${fails} FAIL, ${engineRefused} right fix(es) refused by the engine (listed above; not the items')`);
process.exitCode = fails ? 1 : 0;
