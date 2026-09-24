/**
 * Marks every answer in the similar-shapes bundle back through the app's own engines,
 * marks every note gate through the app's gate marker, and compiles every $…$ with KaTeX.
 *
 * Run: npx tsx scratchpad/similar/check.mts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import katex from "katex";
import { checkNumeric } from "../../src/lib/marking/numeric.ts";
import { toNumericSpec } from "../../src/components/items/spec-map.ts";
import { markText } from "../../src/components/items/text-marking.ts";
import { markGate, wordsBetweenGates, type NoteBlock } from "../../src/components/items/gates.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, "packs", "maths", "content", "m7", "similar-shapes-length-area-and-volume-scale-factors");
const bundle = JSON.parse(fs.readFileSync(path.join(DIR, "bundle.json"), "utf8"));
const blocks: NoteBlock[] = JSON.parse(fs.readFileSync(path.join(DIR, "note.blocks.json"), "utf8"));

const fails: string[] = [];
let numericAccepted = 0;
let numericRejectedErrors = 0;
let textAccepted = 0;
let gatesChecked = 0;
let katexSegments = 0;

/** The string a candidate would write for a numeric answer. */
function spell(value: number, unit?: string, sf?: number): string[] {
  const out: string[] = [];
  const exact = String(value);
  out.push(exact);
  if (sf) out.push(String(Number(value.toPrecision(sf))));
  if (unit) out.push(`${sf ? Number(value.toPrecision(sf)) : exact} ${unit}`);
  return out;
}

function markNumeric(spec: any, typed: string) {
  return checkNumeric(typed, toNumericSpec(spec));
}

function checkAnswer(where: string, answer: any, commonErrors: any[] = []) {
  if (answer.kind === "numeric") {
    const sf = answer.tolerance?.type === "sf" ? answer.tolerance.figures : undefined;
    for (const typed of spell(answer.value, answer.unit, sf)) {
      const v = markNumeric(answer, typed);
      // An answer without a unit is rejected only when the unit is required.
      const expectPass = !(answer.unitRequired && !typed.includes(answer.unit ?? "@@"));
      if (v.correct) numericAccepted += 1;
      else if (expectPass) fails.push(`${where}: model answer "${typed}" not accepted (${v.reason})`);
    }
    for (const ce of commonErrors) {
      if (ce.pattern.kind !== "numeric") continue;
      const typed = answer.unitRequired && answer.unit ? `${ce.pattern.value} ${answer.unit}` : String(ce.pattern.value);
      const v = markNumeric(answer, typed);
      if (v.correct) fails.push(`${where}: commonError value ${ce.pattern.value} is marked correct`);
      else numericRejectedErrors += 1;
    }
  } else if (answer.kind === "text") {
    for (const a of answer.accepted) {
      const r = markText(a, answer);
      if (r.correct || r.marksAwarded === r.marksAvailable) textAccepted += 1;
      else fails.push(`${where}: accepted text "${a}" not marked correct`);
    }
    // the spelling a candidate actually types for a ratio
    for (const a of answer.accepted) {
      const squashed = a.replace(/\s*:\s*/g, ":");
      const r = markText(squashed, answer);
      if (r.correct || r.marksAwarded === r.marksAvailable) textAccepted += 1;
      else fails.push(`${where}: unspaced spelling "${squashed}" not marked correct`);
    }
  } else if (answer.kind === "mcq") {
    const n = answer.options.filter((o: any) => o.correct).length;
    if (n !== 1) fails.push(`${where}: ${n} correct mcq options`);
  }
}

for (const q of bundle.questions) {
  for (const p of q.parts) checkAnswer(`${q.id}(${p.id})`, p.answer, p.commonErrors);
}
for (const w of bundle.workedExamples) checkAnswer(`${w.id} twin`, w.twin.answer);
for (const set of bundle.diagnostics) {
  for (const it of set.items) {
    const correct = it.options.filter((o: any) => o.correct);
    if (correct.length !== 1) fails.push(`${set.id}/${it.id}: ${correct.length} correct options`);
    for (const o of it.options) if (!o.correct && !o.misconception) fails.push(`${set.id}/${it.id}: unnamed distractor ${o.id}`);
  }
}

// --- note gates -------------------------------------------------------------
for (const b of blocks) {
  if (b.type !== "gate") continue;
  gatesChecked += 1;
  const alternatives = b.answer.split("|").map((s) => s.trim());
  for (const alt of alternatives) {
    if (!markGate(b, alt)) fails.push(`gate ${b.id}: does not accept its own answer "${alt}"`);
  }
  if (b.kind === "choice") {
    for (const o of b.options ?? []) {
      const shouldPass = o === b.answer;
      if (markGate(b, o) !== shouldPass) fails.push(`gate ${b.id}: option "${o}" marked ${shouldPass ? "incorrectly" : "as correct"}`);
    }
  }
}
const runs = wordsBetweenGates(blocks);
const longest = Math.max(...runs);
if (longest > 150) fails.push(`longest stretch between gates is ${longest} words`);

// --- KaTeX ------------------------------------------------------------------
function collectStrings(v: any, key?: string, out: string[] = []): string[] {
  if (typeof v === "string") {
    if (key !== "regex" && key !== "src") out.push(v);
  } else if (Array.isArray(v)) v.forEach((x) => collectStrings(x, key, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) collectStrings(x, k, out);
  return out;
}
for (const s of [...collectStrings(bundle), ...collectStrings(blocks)]) {
  const parts = s.split("$");
  if (parts.length < 3) continue;
  for (let i = 1; i < parts.length; i += 2) {
    const tex = parts[i];
    if (!tex.trim()) continue;
    katexSegments += 1;
    try {
      katex.renderToString(tex, { throwOnError: true, displayMode: false });
    } catch (e) {
      fails.push(`KaTeX failed on "${tex}" (${(e as Error).message.slice(0, 80)})`);
    }
  }
}

// --- report -----------------------------------------------------------------
if (fails.length) {
  console.error("CHECK FAILED:");
  for (const f of fails) console.error("  - " + f);
  process.exit(1);
}
console.log("all checks passed");
console.log(`  numeric model answers accepted: ${numericAccepted}`);
console.log(`  commonError values correctly rejected: ${numericRejectedErrors}`);
console.log(`  text (ratio) spellings accepted: ${textAccepted}`);
console.log(`  note gates marked: ${gatesChecked}; longest stretch between gates: ${longest} words`);
console.log(`  KaTeX segments compiled: ${katexSegments}`);
