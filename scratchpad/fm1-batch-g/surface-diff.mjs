/**
 * Marker-surface diff between a backed-up bundle and the one on disk (22 Sep fix pass).
 *   node scratchpad/fm1-batch-g/surface-diff.mjs <old bundle.json> <new bundle.json>
 * Compares, item by item: every part's answer spec, marks, commonErrors (pattern, tag, marks, feedback) and
 * scheme; every mcq / diagnostic option (text, correct, tag, feedback); every worked example's step codes and
 * twin answer; every find-the-mistake's working, mistake line, tag, earned codes and correction. Prints each
 * changed field, so a fix can be checked to touch exactly what its finding names and nothing else.
 */
import fs from "node:fs";

const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));

function surface(bundle) {
  const out = {};
  for (const q of bundle.questions) {
    for (const p of q.parts) {
      const k = `${q.id}(${p.id})`;
      out[`${k}.marks`] = p.marks;
      out[`${k}.stem`] = p.stem;
      if (p.answer.kind === "mcq") {
        for (const o of p.answer.options) out[`${k}.option.${o.id}`] = JSON.stringify({ text: o.text, correct: o.correct, tag: o.misconception ?? null, feedback: o.feedback });
      } else out[`${k}.answer`] = JSON.stringify(p.answer);
      (p.commonErrors ?? []).forEach((e, i) => { out[`${k}.ce${i + 1}`] = JSON.stringify(e); });
      out[`${k}.ceCount`] = (p.commonErrors ?? []).length;
      out[`${k}.scheme`] = JSON.stringify(p.scheme);
      out[`${k}.workedSolution`] = p.workedSolution;
    }
  }
  for (const d of bundle.diagnostics) for (const it of d.items) {
    out[`${d.id}/${it.id}.stem`] = it.stem;
    for (const o of it.options) out[`${d.id}/${it.id}.${o.id}`] = JSON.stringify({ text: o.text, correct: o.correct, tag: o.misconception ?? null, feedback: o.feedback });
  }
  for (const we of bundle.workedExamples) {
    out[`${we.id}.earns`] = JSON.stringify(we.steps.map((s) => s.earns ?? null));
    we.steps.forEach((s) => { out[`${we.id}.step${s.n}`] = JSON.stringify({ working: s.working, decision: s.decision }); });
    out[`${we.id}.twin`] = JSON.stringify(we.twin);
  }
  for (const f of bundle.findTheMistake ?? []) {
    out[`${f.id}.working`] = JSON.stringify(f.studentWorking);
    out[`${f.id}.mistakeLine`] = f.mistakeLine;
    out[`${f.id}.tag`] = f.misconception;
    out[`${f.id}.earned`] = JSON.stringify(f.marksEarnedAsWritten);
    out[`${f.id}.correction`] = JSON.stringify(f.correction);
    out[`${f.id}.whatWentWrong`] = f.whatWentWrong;
    out[`${f.id}.feedback`] = f.feedback;
  }
  out["note.sheet.traps"] = JSON.stringify(bundle.note?.sheet?.traps ?? []);
  return out;
}

const A = surface(a);
const B = surface(b);
let n = 0;
for (const k of [...new Set([...Object.keys(A), ...Object.keys(B)])].sort()) {
  if (JSON.stringify(A[k]) === JSON.stringify(B[k])) continue;
  n++;
  console.log(`~ ${k}\n    was: ${String(A[k]).slice(0, 400)}\n    now: ${String(B[k]).slice(0, 400)}`);
}
console.log(`\n${n} changed field(s) of ${Object.keys(B).length}`);
