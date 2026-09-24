/**
 * Runs the app's own marking engines over the published maths.m7.standard-form bundle:
 * every numeric AnswerSpec is fed the answers a learner would actually type, and the
 * verdicts are asserted. Also marks every note gate with markGate.
 *
 * Run: npx tsx scratchpad/standard-form/check-marking.mts
 */
import fs from "node:fs";
import path from "node:path";
import { checkNumeric } from "../../src/lib/marking/numeric.ts";
import { toNumericSpec } from "../../src/components/items/spec-map.ts";
import { markGate, wordsBetweenGates, type NoteBlock } from "../../src/components/items/gates.ts";

const DIR = path.resolve("packs/maths/content/m7/standard-form");
const bundle = JSON.parse(fs.readFileSync(path.join(DIR, "bundle.json"), "utf8"));
const blocks: NoteBlock[] = JSON.parse(fs.readFileSync(path.join(DIR, "note.blocks.json"), "utf8"));

let bad = 0;
const say = (ok: boolean, msg: string) => {
  if (!ok) {
    bad += 1;
    console.error("FAIL " + msg);
  }
};

/** Superscript / E / caret spellings a learner might type for a × 10^n. */
function spellings(a: number, n: number): string[] {
  const sup = String(n).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);
  return [`${a} × 10^${n}`, `${a} x 10^${n}`, `${a}×10^${n}`, `${a} × 10${sup}`, `${a}e${n}`];
}

/** Break a value into the standard-form pair it should be typed as. */
function pairOf(v: number): { a: number; n: number } {
  const n = Math.floor(Math.log10(Math.abs(v)));
  const a = Number((v / 10 ** n).toPrecision(12));
  return { a, n };
}

type Checked = { where: string; spec: any };
const numericSpecs: Checked[] = [];
for (const q of bundle.questions) {
  for (const p of q.parts) if (p.answer.kind === "numeric") numericSpecs.push({ where: `${q.id}#${p.id}`, spec: p.answer });
}
for (const we of bundle.workedExamples) {
  if (we.twin.answer.kind === "numeric") numericSpecs.push({ where: `${we.id}#twin`, spec: we.twin.answer });
}

for (const { where, spec } of numericSpecs) {
  const ns = toNumericSpec(spec);
  const wantsStandardForm = spec.acceptForms.length === 1 && spec.acceptForms[0] === "standardForm";
  say(wantsStandardForm === (ns.requiredForm === "standard-form"), `${where}: requiredForm is ${ns.requiredForm}, acceptForms ${JSON.stringify(spec.acceptForms)}`);

  const { a, n } = pairOf(spec.value);
  if (wantsStandardForm) {
    for (const typed of spellings(a, n)) {
      const v = checkNumeric(typed, ns);
      say(v.correct, `${where}: "${typed}" marked incorrect (${v.reason}: ${v.feedback})`);
    }
    // The ordinary-number spelling must be refused as the wrong form, not as the wrong value.
    const plain = checkNumeric(String(spec.value), ns);
    say(!plain.correct && plain.reason === "wrong-form", `${where}: plain "${spec.value}" gave ${plain.reason} (expected wrong-form)`);
    // A front number outside 1..10 must be refused too.
    const denorm = checkNumeric(`${a * 10} × 10^${n - 1}`, ns);
    say(!denorm.correct && denorm.reason === "wrong-form", `${where}: "${a * 10} × 10^${n - 1}" gave ${denorm.reason} (expected wrong-form)`);
  } else {
    const v = checkNumeric(String(spec.value), ns);
    say(v.correct, `${where}: plain "${spec.value}" marked incorrect (${v.reason}: ${v.feedback})`);
  }

  // Every commonError value must be marked incorrect (they are wrong answers, after all).
  const part = bundle.questions.flatMap((q: any) => q.parts.map((p: any) => ({ q, p }))).find(({ q, p }: any) => `${q.id}#${p.id}` === where);
  for (const ce of part?.p.commonErrors ?? []) {
    if (ce.pattern.kind !== "numeric") continue;
    const v = checkNumeric(String(ce.pattern.value), ns);
    say(!v.correct, `${where}: commonError value ${ce.pattern.value} is marked CORRECT`);
  }
}

// Stated-accuracy items: the fuller decimal must be refused with a rounding message.
const sf3 = numericSpecs.find((s) => s.where.endsWith("0013#main"));
if (sf3) {
  const ns = toNumericSpec(sf3.spec);
  const v = checkNumeric("2.961 × 10^6", ns);
  say(!v.correct && v.reason === "wrong-accuracy", `${sf3.where}: "2.961 × 10^6" gave ${v.reason} (expected wrong-accuracy)`);
}

// Gates.
let gates = 0;
for (const b of blocks) {
  if (b.type !== "gate") continue;
  gates += 1;
  for (const alt of b.answer.split("|").map((s) => s.trim())) {
    say(markGate(b, alt), `gate ${b.id}: accepted answer "${alt}" does not mark as correct`);
  }
  say(!markGate(b, "0"), `gate ${b.id}: "0" marks as correct`);
  if (b.kind === "choice") {
    for (const o of b.options ?? []) {
      const isAnswer = o === b.answer;
      say(markGate(b, o) === isAnswer, `gate ${b.id}: option "${o}" marks as ${markGate(b, o)}`);
    }
  }
}

// Standard-form spellings must also satisfy the number gates whose answer is the ordinary value.
for (const b of blocks) {
  if (b.type !== "gate" || b.kind !== "number") continue;
  const v = Number(b.answer);
  if (!Number.isFinite(v) || v === 0) continue;
  const { a, n } = pairOf(v);
  say(markGate(b, `${a} × 10^${n}`), `gate ${b.id}: standard-form spelling "${a} × 10^${n}" is not accepted for ${b.answer}`);
}

const runs = wordsBetweenGates(blocks);
say(Math.max(...runs) <= 150, `longest stretch between gates is ${Math.max(...runs)} words`);

console.log(`${numericSpecs.length} numeric specs, ${gates} gates, longest gate stretch ${Math.max(...runs)} words`);
console.log(bad === 0 ? "marking check: OK" : `marking check: ${bad} failure(s)`);
if (bad > 0) process.exitCode = 1;
