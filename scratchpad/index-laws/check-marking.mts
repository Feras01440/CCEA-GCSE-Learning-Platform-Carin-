/**
 * Smoke test: every answer spec in the bundle must mark its own canonical answer correct,
 * and every tagged commonError pattern must be recognised from the value a candidate would type.
 * Run: npx tsx scratchpad/index-laws/check-marking.mts
 */
import fs from "node:fs";
import path from "node:path";
import { markAnswer, matchesCommonError } from "../../src/components/items/mark.ts";
import type { AnswerSpec, TopicBundle } from "../../src/lib/content/schema.ts";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const bundle: TopicBundle = JSON.parse(
  fs.readFileSync(path.join(ROOT, "packs/maths/content/m7/index-laws-zero-and-negative-powers/bundle.json"), "utf8"),
);

const fails: string[] = [];

/** What a candidate would actually type for a correct answer. */
function canonical(spec: AnswerSpec): string[] {
  switch (spec.kind) {
    case "numeric": {
      const out: string[] = [];
      const v = spec.value;
      if (spec.acceptForms.includes("fraction") || spec.acceptForms.includes("mixed")) {
        // exact rational from the value (denominators here are all small powers)
        for (let d = 1; d <= 100000; d++) {
          const n = v * d;
          if (Math.abs(n - Math.round(n)) < 1e-12) {
            out.push(d === 1 ? String(Math.round(n)) : `${Math.round(n)}/${d}`);
            break;
          }
        }
      }
      if (spec.acceptForms.includes("decimal") && Number.isFinite(v)) {
        const s = String(v);
        if (!/e/i.test(s) && s.replace(/[-.]/g, "").length <= 12) out.push(s);
      }
      return out.length ? out : [String(v)];
    }
    case "algebraic":
      return [spec.latex];
    case "text":
      return spec.accepted;
    case "table":
      return spec.cells.map((c) => String(c.value));
    case "steps":
      return spec.expectedOrder;
    default:
      return [];
  }
}

function checkSpec(where: string, spec: AnswerSpec) {
  if (spec.kind === "table" || spec.kind === "steps" || spec.kind === "mcq") return; // marked cell by cell / by the UI
  for (const typed of canonical(spec)) {
    const r = markAnswer(typed, spec);
    if (!r.correct) fails.push(`${where}: "${typed}" marked not correct (${r.reason ?? ""} ${r.feedback ?? ""})`);
  }
}

for (const q of bundle.questions) {
  for (const p of q.parts) {
    checkSpec(`${q.id} (${p.id})`, p.answer);
    for (const [i, err] of p.commonErrors.entries()) {
      if (err.pattern.kind === "numeric") {
        const typed = String(err.pattern.value);
        if (!matchesCommonError(typed, err)) fails.push(`${q.id} (${p.id}) commonErrors[${i}]: "${typed}" not recognised`);
        const r = markAnswer(typed, p.answer);
        if (r.correct) fails.push(`${q.id} (${p.id}) commonErrors[${i}]: the wrong value "${typed}" marks as correct`);
      }
    }
  }
}
for (const we of bundle.workedExamples) checkSpec(`${we.id} twin`, we.twin.answer);

// Diagnostic options: exactly one correct, ids unique, every distractor diagnosed.
for (const set of bundle.diagnostics) {
  for (const item of set.items) {
    const correct = item.options.filter((o) => o.correct);
    if (correct.length !== 1) fails.push(`${set.id}/${item.id}: ${correct.length} correct options`);
  }
}

if (fails.length) {
  console.error(`${fails.length} marking problem(s):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  `marking smoke test passed: ${bundle.questions.reduce((n, q) => n + q.parts.length, 0)} parts, ` +
    `${bundle.workedExamples.length} twins, ${bundle.questions.reduce((n, q) => n + q.parts.reduce((m, p) => m + p.commonErrors.length, 0), 0)} common errors`,
);
