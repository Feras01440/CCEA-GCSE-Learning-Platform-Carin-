/**
 * 23 Sep depth pilot, laws-of-logarithms: every item the depth pass added, marked ON DISK through the app's own
 * markers (markAnswer, markGate, markFix), with the natural spellings a learner types and each misuse's own value.
 *   npx tsx scratchpad/fm1-batch-g/depth-pilot/probe-depth-laws.mts
 */
import fs from "node:fs";
import { markAnswer } from "../../../src/components/items/mark.ts";
import { markFix } from "../../../src/components/items/mistake-marking.ts";
import { markGate } from "../../../src/components/items/gates.ts";
import { normaliseText } from "../../../src/components/items/text-marking.ts";

const DIR = "packs/further-maths/content/fm1/laws-of-logarithms";
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

/** Each raw must score `want` marks; `tag` (when given) must be among the marker's tags. */
function expect(n: string, p: string, cases: Array<[string, number, string?]>) {
  const pt = part(n, p);
  for (const [raw, want, tag] of cases) {
    const r = mark(raw, pt);
    ok(r.marksAwarded === want && (!tag || (r.tags ?? []).includes(tag)), `q${n}(${p}) ${JSON.stringify(raw)} -> ${want}/${pt.marks}${tag ? ` ${tag}` : ""}`, show(r));
  }
}

// q0017, the synoptic chain
expect("0017", "a", [
  ["\\log 9x", 3], ["log 9x", 3], ["log(9x)", 3], ["\\log\\frac{36x^{2}}{4x}", 3], ["log(36x^2/(4x))", 3],
  ["\\log\\frac{3x}{2}", 1, "fm.logs.coefficient-not-raised"], ["log 1.5x", 1, "fm.logs.coefficient-not-raised"],
  ["\\log 3", 0, "fm.logs.power-as-multiplier-inside"], ["\\log\\frac{1}{9x}", 2, "fm.logs.subtraction-rule-misapplied"],
  ["log 9 + log x", 2], ["\\log 9x^{2}", 0],
]);
expect("0017", "b", [["4 + t", 2], ["t + 4", 2], ["8 + t", 1, "fm.logs.unknown-base-divided"], ["4t", 0, "fm.logs.product-to-sum"], ["16 + t", 0]]);
expect("0017", "c", [["3", 1], ["a = 3", 1], ["8", 0]]);
expect("0017", "d", [
  ["1.46", 4], ["x = 1.46", 4], ["1.4605", 4], ["1.5", 0], ["1.6", 1, "fm.logs.brackets-omitted"], ["1.60", 1, "fm.logs.brackets-omitted"],
  ["0.94", 2, "fm.logs.terms-not-collected"],
]);
// q0018, q0019
expect("0018", "main", [["3 + 2k", 2], ["2k + 3", 2], ["3 + k^2", 1, "fm.logs.power-as-multiplier-inside"], ["4 + 2k", 1, "fm.logs.unknown-base-divided"], ["6k", 0, "fm.logs.product-to-sum"], ["3k + 2", 0]]);
expect("0019", "main", [
  ["y = -\\frac{3}{2}z", 3], ["y = -3z/2", 3], ["y = -1.5z", 3], ["2y = -3z", 3], ["y = -(3/2)z", 3],
  ["y = 3z/2", 1, "fm.logs.negative-index-sign-dropped"], ["y = 1.5z", 1, "fm.logs.negative-index-sign-dropped"], ["y = -\\frac{2}{3}z", 0],
]);
// q0020, the context
expect("0020", "a", [["\\log k + n\\log v", 2], ["log k + n log v", 2], ["n log v + log k", 2], ["log k + log v^n", 1], ["\\log k \\times n\\log v", 0, "fm.logs.product-to-sum"]]);
expect("0020", "b", [["3", 3], ["n = 3", 3], ["1/3", 0, "fm.logs.gradient-inverted"], ["0.333", 0, "fm.logs.gradient-inverted"]]);
expect("0020", "c", [["2", 2], ["k = 2", 2], ["0.301", 1, "fm.logs.log-a-given-as-a"]]);

// structure of the new questions
{
  const q17 = Q("0017");
  ok(q17.style === "exam-style" && q17.parts.length === 4 && q17.totalMarks === 10, "q0017 is the synoptic chain: exam-style, 4 parts, 10 marks", `${q17.parts.length} parts ${q17.totalMarks} marks`);
  ok(q17.skeleton === "(a)express3|(b)express2|(c)write-down1|(d)solve4", "q0017 skeleton", q17.skeleton);
  ok(!!q17.methodLock && /hence/i.test(q17.parts[3].stem), "q0017(d) is a hence with a method lock");
  for (const n of ["0017", "0018", "0019", "0020"]) {
    for (const p of Q(n).parts) ok(p.scheme.reduce((a: number, s: any) => a + s.marks, 0) === p.marks, `q${n}(${p.id}) scheme sums to ${p.marks}`);
  }
  const ladder = B.questions.map((q: any) => `${q.id.slice(-4)}:${q.style[0]}${q.difficulty}`).join(" ");
  ok(/^0001:p1 0002:p1 0003:p2 .* 0019:p5 0014:e4/.test(ladder), "questions run as a ladder, then the exam-style set", ladder);
}

// 23 Sep evening: q0021, the tail-only item (depth standard section 9 refinement 4)
expect("0021", "main", [
  ["2", 4], ["x = 2", 4], ["x=2", 4], ["2.0", 4],
  ["3", 0, "fm.logs.sum-inside-the-log"], ["x = 3", 0, "fm.logs.sum-inside-the-log"],
  ["1.65", 1, "fm.logs.unknown-base-divided"], ["1.646", 1, "fm.logs.unknown-base-divided"], ["x = 1.65", 1, "fm.logs.unknown-base-divided"],
  ["2 or -4", 3, "fm.qin.context-not-applied"], ["x = 2 or x = -4", 3, "fm.qin.context-not-applied"], ["-4 or 2", 3, "fm.qin.context-not-applied"],
  ["-4", 0], ["1", 0], ["8", 0],
]);
{
  const q21 = Q("0021");
  const last = B.questions[B.questions.length - 1];
  ok(last.id === q21.id, "the tail-only item is last in questions[]", last.id);
  ok(q21.style === "practice" && q21.emphasis.includes("mixed-tail"), "q0021 is a practice question marked mixed-tail", JSON.stringify(q21.emphasis));
  ok(q21.specRefs.includes("FM1-LOG-02") && q21.specRefs.includes("FM1-LOG-01"), "q0021 names FM1-LOG-01 beside the topic's own statement", JSON.stringify(q21.specRefs));
  ok(B.sets[0].itemIds.includes(q21.id), "q0021 is in the mixed set");
  ok(q21.parts[0].scheme.reduce((a: number, s: any) => a + s.marks, 0) === q21.totalMarks, "q0021 scheme sums to its marks");
  // no other practice question, worked example or twin solves a logarithm equal to a number by the index form
  const others = [...B.questions.filter((q: any) => q.id !== q21.id).flatMap((q: any) => q.parts.map((p: any) => p.stem)), ...B.workedExamples.flatMap((w: any) => [w.stem, w.twin.stem])];
  ok(!others.some((s: string) => /\\log_\{\d+\}[^$]*=\s*\d+\$/.test(s) && /Solve/.test(s)), "no ladder item already solves log_b(...) = a number, so q0021 is new to her");
}

// worked examples 04 and 05: twins marked, tariff equal to the earns count
for (const [id, good, bad] of [
  ["04", ["y = 2x^{\\frac{2}{3}}", "y = 2x^(2/3)", "y = 2 x^{2/3}", "y = (8x^2)^(1/3)"], ["y^3 = 8x^2", "y = 2x^(3/2)", "y = 8x^2"]],
  ["05", ["2 + \\frac{1}{2}p - 2q", "2 + p/2 - 2q", "2 + 0.5p - 2q", "0.5p - 2q + 2"], ["1 + p/2 - 2q", "2 + 2p - 2q", "25 + p/2 - 2q"]],
] as const) {
  const we = B.workedExamples.find((w: any) => w.id.endsWith(`.${id}`));
  const marks = we.steps.reduce((a: number, s: any) => a + (s.earns?.length ?? 0), 0);
  ok(marks === 3, `we${id} twin is out of ${marks} (3 expected)`);
  ok(we.faded.length >= 2 && we.faded[0].studentSupplies.length === 1 && we.faded[0].studentSupplies[0] === we.steps.length, `we${id} fades backwards, last step first`, JSON.stringify(we.faded));
  ok(we.steps.some((s: any) => s.whyMenu), `we${id} has a whyMenu`);
  for (const raw of good) {
    const r = markAnswer(raw, we.twin.answer, { marks, prompt: we.twin.stem } as never) as any;
    ok(r.correct && r.marksAwarded === marks, `we${id} twin accepts ${JSON.stringify(raw)}`, show(r));
  }
  for (const raw of bad) {
    const r = markAnswer(raw, we.twin.answer, { marks, prompt: we.twin.stem } as never) as any;
    ok(!r.correct, `we${id} twin refuses ${JSON.stringify(raw)}`, show(r));
  }
}

// 23 Sep fix pass: worked examples 01 and 03 rebalanced from four codes to their task's 3-mark scheme (q0005, q0010);
// the twin is marked out of the codes the steps earn, and 03's twin is now its own shape on 4.5.
for (const [id, codes, good, bad] of [
  [
    "01",
    [["M1"], [], ["M2"], ["W1"]],
    ["\\log\\frac{p^{2}q}{r^{3}}", "log(p^2 q / r^3)", "log((p^2 q)/(r^3))", "log(p^2q/r^3)"],
    ["log(p^2 q r^3)", "log(r^3 / (p^2 q))", "log(2pq / 3r)", "log(p^2 + q - r^3)"],
  ],
  [
    "03",
    [["M1"], [], ["M2"], ["W1"]],
    ["2p + q - 1", "2p - 1 + q", "q + 2p - 1", "2p + q − 1", "2p - (1 - q)"],
    ["2p - 1 - q", "p + 2q - 1", "2p + q", "2p - q + 1", "p^2 + q - 1"],
  ],
] as const) {
  const we = B.workedExamples.find((w: any) => w.id.endsWith(`.${id}`));
  const got = we.steps.map((s: any) => s.earns ?? []);
  ok(JSON.stringify(got) === JSON.stringify(codes), `we${id} steps earn ${JSON.stringify(codes)}`, JSON.stringify(got));
  const marks = we.steps.reduce((a: number, s: any) => a + (s.earns?.length ?? 0), 0);
  ok(marks === 3, `we${id} twin is out of ${marks} (3 expected, the scheme of ${id === "01" ? "q0005" : "q0010"})`);
  const sameTask = Q(id === "01" ? "0005" : "0010");
  ok(sameTask.totalMarks === marks, `we${id} earns what ${sameTask.id.split(".").pop()} is worth`, `${sameTask.totalMarks}`);
  for (const raw of good) {
    const r = markAnswer(raw, we.twin.answer, { marks, prompt: we.twin.stem } as never) as any;
    ok(r.correct && r.marksAwarded === marks, `we${id} twin accepts ${JSON.stringify(raw)}`, show(r));
  }
  for (const raw of bad) {
    const r = markAnswer(raw, we.twin.answer, { marks, prompt: we.twin.stem } as never) as any;
    ok(!r.correct, `we${id} twin refuses ${JSON.stringify(raw)}`, show(r));
  }
}
{
  // no twin repeats a practice question word for word
  const stems = new Set(B.questions.flatMap((q: any) => q.parts.map((p: any) => String(p.stem).replace(/\s+/g, " ").trim())));
  for (const we of B.workedExamples) {
    const twin = String(we.twin.stem).replace(/\s+/g, " ").trim();
    const clash = [...stems].some((s) => s === twin || s.startsWith(twin));
    if (["01"].includes(we.id.split(".").pop())) {
      if (clash) console.log(`note we01 twin repeats q0005 word for word (reported to the lead; not changed in the fix pass)`);
      continue;
    }
    ok(!clash, `we${we.id.split(".").pop()} twin is not a practice question word for word`);
  }
}

// find-the-mistake, through markFix (the fix box's own verdict since the engine brief item 1 landed at 14:31 today):
// every line of her working, typed back as it stands, fixes nothing; the flagged line under a looser reading is still
// refused; the correction's lines, and the natural ways of writing them, are the fix.
const FTM_CASES: Record<string, { refuse: string[]; accept: string[] }> = {
  "01": { refuse: ["log 2x^3", "= log 2x^3"], accept: ["= log 8x^3", "log 8x^3"] },
  "02": { refuse: ["log(x+5)/log(x-1) = log 3", "x = 4"], accept: ["log((x + 5) / (x - 1)) = log 3", "log((x+5)/(x-1)) = log 3"] },
  "03": { refuse: ["log(ac/b^2)"], accept: ["= log(a b^2) - log c", "= log(a b^2 / c)", "log(ab^2/c)"] },
  "04": { refuse: ["x + log 3 = log 40", "x = 1.12", "1.12"], accept: ["(x + 1) log 3 = log 40", "(x+1)log 3 = log 40", "x + 1 = log 40 / log 3", "x = 2.36", "2.36"] },
};
for (const [id, cases] of Object.entries(FTM_CASES)) {
  const f = B.findTheMistake.find((x: any) => x.id.endsWith(`.${id}`));
  for (const t of [...f.studentWorking, ...cases.refuse]) ok(!markFix(t, f).match, `ftm${id} refuses ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
  for (const t of cases.accept) ok(markFix(t, f).match, `ftm${id} accepts ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
}
{
  const f = B.findTheMistake.find((x: any) => x.id.endsWith(".04"));
  ok(f.mistakeLine === 2 && f.misconception === "fm.logs.brackets-omitted", "ftm04 names line 2 and brackets-omitted");
}
// every diagnostic set, every find-the-mistake item and every prompt now carries a log, so the build ships them
for (const id of [...B.diagnostics.map((d: any) => d.id), ...B.findTheMistake.map((f: any) => f.id), ...B.prompts.map((p: any) => p.id)]) {
  ok(B.verification.some((l: any) => l.itemId === id && l.status === "verified"), `${id} is logged as verified`);
}
for (const b of N.filter((x: any) => x.type === "prompt")) ok(B.prompts.some((p: any) => p.id === b.promptId), `the note's prompt block ${b.promptId} names a prompt in the bundle`);

// gates: every answer marks, every other option does not, no two options alike (even to the marker), and no
// answer that claims a change lands on its own prompt's line (the lesson-v2 rule of 23 Sep)
{
  const spans = (s: string) => String(s ?? "").split("$").filter((_, i) => i % 2 === 1).map((x) => x.replace(/\s+/g, " ").trim());
  for (const g of N.filter((b: any) => b.type === "gate")) {
    ok(markGate(g, g.answer), `gate ${g.id} marks its own answer`);
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
  const g9 = N.find((b: any) => b.id === "g9");
  ok(markGate(g9, "2.30103") && !markGate(g9, "2.3") && !markGate(g9, "1.301"), "g9 takes 2.301 and more places, not 2.3 or log 20");
}

// the mixed tail
{
  const s = B.sets?.[0];
  ok(!!s && s.kind === "mixed" && s.showTopicLabels === false && s.itemIds.length >= 5, "the mixed tail: kind mixed, unlabelled, five or more items", JSON.stringify(s?.itemIds));
  ok(s.itemIds.every((id: string) => B.questions.some((q: any) => q.id === id)), "every tail id resolves in this bundle");
  ok(s.itemIds.includes(`q.fm.u1.laws-of-logarithms.0020`), "the tail holds the neighbouring topic's item (q0020(b): a gradient from two readings)");
}

console.log(`probe-depth-laws: ${passes} ok, ${fails} FAIL`);
process.exitCode = fails ? 1 : 0;
