/**
 * 23 Sep depth pilot, tangents-and-normals: every item the depth pass added, marked ON DISK through the app's own
 * markers (markAnswer, markGate, markFix), with the spellings a learner types and each misuse's own value.
 *   npx tsx scratchpad/fm1-batch-g/depth-pilot/probe-depth-tangents.mts
 */
import fs from "node:fs";
import { markAnswer } from "../../../src/components/items/mark.ts";
import { markFix } from "../../../src/components/items/mistake-marking.ts";
import { markGate } from "../../../src/components/items/gates.ts";
import { normaliseText } from "../../../src/components/items/text-marking.ts";

const DIR = "packs/further-maths/content/fm1/tangents-and-normals";
const B = JSON.parse(fs.readFileSync(`${DIR}/bundle.json`, "utf8"));
const N = JSON.parse(fs.readFileSync(`${DIR}/note.blocks.json`, "utf8"));
let fails = 0;
let passes = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  if (cond) passes++;
  else fails++;
  if (!cond || process.argv.includes("--all")) console.log(`${cond ? "ok  " : "FAIL"} ${label}${detail ? `  :: ${detail}` : ""}`);
};
const Q = (n: string) => B.questions.find((q: any) => q.id.endsWith(`.${n}`));
const part = (n: string, p: string) => Q(n).parts.find((x: any) => x.id === p);
const mark = (raw: string, p: any) => markAnswer(raw, p.answer, { marks: p.marks, commonErrors: p.commonErrors, prompt: p.stem } as never) as any;
const show = (r: any) => `${r.marksAwarded} ${JSON.stringify(r.tags ?? [])} ${String(r.explanation).slice(0, 90)}`;
function expect(n: string, p: string, cases: Array<[string, number, string?]>) {
  const pt = part(n, p);
  for (const [raw, want, tag] of cases) {
    const r = mark(raw, pt);
    ok(r.marksAwarded === want && (!tag || (r.tags ?? []).includes(tag)), `q${n}(${p}) ${JSON.stringify(raw)} -> ${want}/${pt.marks}${tag ? ` ${tag}` : ""}`, show(r));
  }
}

// q0017: a from a stated normal gradient (tangent gradient 5, a = 4)
expect("0017", "main", [
  ["4", 3], ["a = 4", 3], ["-1", 1, "fm.calc.normal-sign-not-flipped"], ["1.6", 1, "fm.calc.normal-gradient-not-reciprocated"],
  ["8/5", 1, "fm.calc.normal-gradient-not-reciprocated"], ["1.4", 1, "fm.calc.normal-gradient-not-reciprocated"], ["1.5", 0, "fm.calc.default-to-derivative-zero"], ["5", 0],
]);
// q0018: the first rung
expect("0018", "main", [["3", 1], ["m = 3", 1], ["-1/3", 0, "fm.calc.normal-gradient-not-reciprocated"], ["-0.333", 0], ["4", 0]]);
// q0019: the horizontal tangent
expect("0019", "main", [
  ["(2, 8)", 4], ["(2,8)", 4], ["x = 2, y = 8", 4], ["(2, 0)", 3, "fm.calc.stationary-y-from-derivative"], ["(-2, -8)", 3, "fm.qin.context-not-applied"], ["(8, 2)", 0],
]);
// structure: schemes sum, the ladder, the stems' verbs
for (const n of ["0017", "0018", "0019"]) for (const p of Q(n).parts) ok(p.scheme.reduce((a: number, s: any) => a + s.marks, 0) === p.marks, `q${n}(${p.id}) scheme sums to ${p.marks}`);
{
  const ladder = B.questions.map((q: any) => `${q.id.slice(-4)}:${q.style[0]}${q.difficulty}`).join(" ");
  ok(/^0018:p1 .* 0017:p5 0013:e4/.test(ladder), "questions run as a ladder from difficulty 1 to 5, then the exam-style set", ladder);
}

// worked example 04: the twin, its tariff and backward fading
{
  const we = B.workedExamples.find((w: any) => w.id.endsWith(".04"));
  const marks = we.steps.reduce((a: number, s: any) => a + (s.earns?.length ?? 0), 0);
  ok(marks === 5, `we04 twin is out of ${marks} (5 expected: the 2025 Q13(i) tariff)`);
  ok(we.faded[0].showSteps === 4 && JSON.stringify(we.faded[0].studentSupplies) === "[5]", "we04 fades backwards, the last step first", JSON.stringify(we.faded));
  ok(we.steps.some((s: any) => s.whyMenu), "we04 has a whyMenu");
  for (const raw of ["y = 7x - 5", "y=7x-5", "y - 9 = 7(x - 2)", "7x - y = 5"]) {
    const r = markAnswer(raw, we.twin.answer, { marks, prompt: we.twin.stem } as never) as any;
    ok(r.correct, `we04 twin accepts ${JSON.stringify(raw)}`, show(r));
  }
  for (const raw of ["y = 7x + 5", "y = 7x - 9", "y = 3x - 14", "(2, 9)"]) {
    const r = markAnswer(raw, we.twin.answer, { marks, prompt: we.twin.stem } as never) as any;
    ok(!r.correct, `we04 twin refuses ${JSON.stringify(raw)}`, show(r));
  }
}

// find-the-mistake: every line of each student's working typed back fixes nothing; the corrections do
const FTM: Record<string, { refuse: string[]; accept: string[] }> = {
  "04": { refuse: ["x = 3", "(3, -5)", "2x - 6 = 0"], accept: ["2x - 6 = 2", "x = 4", "P = (4, -4)", "(4, -4)"] },
};
for (const f of B.findTheMistake) {
  const extra = FTM[f.id.slice(-2)] ?? { refuse: [], accept: [] };
  for (const t of [...f.studentWorking, ...extra.refuse]) ok(!markFix(t, f).match, `ftm${f.id.slice(-2)} refuses ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
  for (const t of [...f.correction, ...extra.accept]) ok(markFix(t, f).match, `ftm${f.id.slice(-2)} accepts ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
}

// gates: answers mark, other options do not, options distinct to the marker, no self-answering gate
{
  const spans = (s: string) => String(s ?? "").split("$").filter((_, i) => i % 2 === 1).map((x) => x.replace(/\s+/g, " ").trim());
  for (const g of N.filter((b: any) => b.type === "gate")) {
    const alts = String(g.answer).split("|").map((s) => s.trim());
    ok(markGate(g, alts[0]), `gate ${g.id} marks its own answer`);
    if (g.kind === "choice") {
      ok(g.options.includes(g.answer), `gate ${g.id} answer is one of its options`);
      const wrong = g.options.filter((o: string) => o !== g.answer && markGate(g, o));
      ok(wrong.length === 0, `gate ${g.id} marks no other option right`, JSON.stringify(wrong));
      const norm = g.options.map((o: string) => normaliseText(o));
      ok(new Set(norm).size === norm.length, `gate ${g.id} options are distinct to the marker`);
    }
    const a = spans(g.answer);
    const claims = /^(no|not)\b|\b(becomes?|giving|gives|simplifies to|cancels to|leaves|leaving)\b/i.test(g.answer);
    ok(!(claims && a.length && spans(g.prompt).includes(a[a.length - 1])), `gate ${g.id} does not answer with its own prompt's line`);
  }
  const byId = (id: string) => N.find((b: any) => b.id === id);
  ok(markGate(byId("g10"), "4") && !markGate(byId("g10"), "8"), "g10: a = 4");
  ok(markGate(byId("g12"), "2") && !markGate(byId("g12"), "5"), "g12: the lines cross at x = 2");
}

// the mixed tail, the logs, the embedded prompts
{
  const s = B.sets?.[0];
  ok(!!s && s.kind === "mixed" && s.showTopicLabels === false && s.itemIds.length >= 4, "the mixed tail: kind mixed, unlabelled, four or more items", JSON.stringify(s?.itemIds));
  ok(s.itemIds.every((id: string) => B.questions.some((q: any) => q.id === id)), "every tail id resolves in this bundle");
  ok(s.itemIds.includes("q.fm.u1.tangents-and-normals.0019"), "the tail holds the neighbouring topic's item (q0019: dy/dx = 0, the stationary-point method)");
  for (const id of [...B.workedExamples, ...B.diagnostics, ...B.questions, ...B.findTheMistake, ...B.prompts].map((x: any) => x.id)) {
    ok(B.verification.some((l: any) => l.itemId === id && l.status === "verified"), `${id} is logged as verified`);
  }
  for (const b of N.filter((x: any) => x.type === "prompt")) ok(B.prompts.some((p: any) => p.id === b.promptId), `the note's prompt block ${b.promptId} names a prompt in the bundle`);
}

// 23 Sep evening: q0020, the tail-only item (depth standard section 9 refinement 4): the curve from dy/dx and a point
expect("0020", "main", [
  ["y = 7x - 10", 5], ["y=7x-10", 5], ["y = -10 + 7x", 5], ["y - 4 = 7(x - 2)", 5], ["7x - y - 10 = 0", 5], ["y = 7x − 10", 5],
  ["y = 7x - 12", 2, "fm.int.constant-omitted"],
  ["y = 7x - 11", 2, "fm.int.point-substituted-into-gradient"],
  ["y = 7x - 7", 3, "fm.calc.stationary-y-from-derivative"],
  ["y = 10x - 13", 0, "fm.int.gradient-word-triggers-differentiation"],
  ["y = 7x + 18", 4, "fm.calc.tangent-constant-slip"],
  ["y = 7x", 0], ["y = x^3 - x^2 - x + 2", 0], ["7", 0],
]);
{
  const q20 = Q("0020");
  const last = B.questions[B.questions.length - 1];
  ok(last.id === q20.id, "the tail-only item is last in questions[]", last.id);
  ok(q20.style === "practice" && q20.emphasis.includes("mixed-tail"), "q0020 is a practice question marked mixed-tail", JSON.stringify(q20.emphasis));
  ok(q20.specRefs.includes("FM1-DIF-02") && q20.specRefs.some((r: string) => r.startsWith("FM1-INT-")), "q0020 names an integration statement beside the topic's own", JSON.stringify(q20.specRefs));
  ok(B.sets[0].itemIds.includes(q20.id), "q0020 is in the mixed set");
  ok(q20.parts[0].scheme.reduce((a: number, s: any) => a + s.marks, 0) === q20.totalMarks, "q0020 scheme sums to its marks");
  // nothing else in the bundle gives dy/dx and asks for the curve's tangent: the item is new to her
  const others = B.questions.filter((q: any) => q.id !== q20.id).flatMap((q: any) => q.parts.map((p: any) => String(p.stem)));
  // a stem that gives dy/dx as the data and names a point on the curve (q0018 gives dy/dx but no point; q0016(b)
  // names a point but gives the curve)
  const givesGradientAndPoint = (s: string) => /\\frac\{dy\}\{dx\}\s*=/.test(s) && /passes through the point|lies on (this|the) curve/i.test(s);
  ok(givesGradientAndPoint(q20.parts[0].stem), "q0020 gives the gradient function and a point on the curve");
  ok(!others.some(givesGradientAndPoint), "no ladder item already gives only the gradient function and a point");
}

console.log(`probe-depth-tangents: ${passes} ok, ${fails} FAIL`);
process.exitCode = fails ? 1 : 0;
