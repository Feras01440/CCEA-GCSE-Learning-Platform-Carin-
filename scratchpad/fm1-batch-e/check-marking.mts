/**
 * FM1 batch E marker self-check.
 * Feeds the app's own marker (src/components/items/mark.ts) every part of the four bundles:
 *   - the correct answer in every natural spelling -> must score full marks
 *   - every text part's own workedSolution         -> must score full marks
 *   - every commonError's own value                -> must fire that pattern and earn what it claims
 * Exits 1 on any finding.
 */
import fs from "node:fs";
import path from "node:path";
import { markAnswer, matchesCommonError } from "../../src/components/items/mark.ts";
import type { AnswerSpec, CommonError, TopicBundle } from "../../src/lib/content/schema.ts";

const SLUGS = ["curve-sketching-quadratic-cubic", "optimisation", "integration-as-inverse", "definite-integrals"];
const findings: string[] = [];
let checks = 0;

const deLatex = (s: string): string =>
  s
    .replace(/\\left|\\right/g, "")
    .replace(/\^\{([^{}]*)\}/g, "^($1)")
    .replace(/\\dfrac|\\tfrac|\\frac/g, "frac")
    .replace(/frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\times/g, "*")
    .replace(/\\,|\\;|\\ /g, " ")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Natural spellings a learner could type for a correct answer. */
function spellings(spec: AnswerSpec, workedSolution: string): string[] {
  switch (spec.kind) {
    case "numeric": {
      const v = spec.value;
      const out = new Set<string>();
      const bare = [String(v)];
      if (!Number.isInteger(v)) {
        bare.push(v.toFixed(2));
        bare.push(v.toFixed(3));
      }
      // A spec that demands a unit is only ever answered with one, so the natural spellings carry it.
      for (const b of bare) out.add(spec.unitRequired && spec.unit ? `${b} ${spec.unit}` : b);
      if (spec.unit && !spec.unitRequired) out.add(`${v} ${spec.unit}`);
      return [...out];
    }
    case "algebraic": {
      const out = new Set<string>([spec.latex, deLatex(spec.latex)]);
      out.add(spec.latex.replace(/\s+/g, ""));
      return [...out];
    }
    case "mcq":
      return [spec.options.filter((o) => o.correct).map((o) => o.id).join(" ")];
    case "text":
      return [...spec.accepted, workedSolution];
    case "graph": {
      const e = spec.expect as Record<string, unknown>;
      if (e.plot === "curve") return [JSON.stringify({ points: e.samples })];
      if (e.plot === "points-line") {
        const body: Record<string, unknown> = { points: e.points };
        if (e.lineRequired && Array.isArray(e.lineThrough) && (e.lineThrough as unknown[]).length === 2) body.line = e.lineThrough;
        return [JSON.stringify(body)];
      }
      return [];
    }
    default:
      return [];
  }
}

/** The response a learner who made this error would have typed. */
function errorResponse(e: CommonError): string | null {
  const p = e.pattern;
  if (p.kind === "numeric") return String(p.value);
  if (p.kind === "algebraic") return p.latex;
  if (p.kind === "graph") {
    const coords = [...p.test.matchAll(/\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    return coords.length > 0 ? JSON.stringify({ points: coords }) : null;
  }
  return null; // text regexes are probed with an authored sample below
}

/** Probe strings for text commonErrors: the author supplies them in the regex itself where possible. */
const TEXT_PROBES: Record<string, string[]> = {
  "(positive|greater than zero|above zero)[^;\\n]*(maximum)|(maximum)[^;\\n]*(positive)": [
    "the second derivative is positive so it is a maximum",
  ],
  "(negative|less than zero|below zero)[^;\\n]*(minimum)|(minimum)[^;\\n]*(negative)": [
    "the second derivative is negative so it is a minimum",
  ],
  "^\\s*(y\\s*=\\s*)?(x\\^?3|x³)[^\\n]{0,45}$": ["y = x^3 - 12x^2 + 36x - 32"],
  "\\(\\s*2\\s*,\\s*0\\s*\\)[^()]*\\(\\s*2\\s*,\\s*0\\s*\\)": ["(2, 0), (2, 0), (8, 0)"],
  "^\\s*108(\\.0+)?\\s*$": ["108"],
  "^\\s*588(\\.0+)?\\s*$": ["588"],
  "^\\s*(a\\s*=\\s*)?8w\\s*\\+\\s*348[^\\n]{0,30}$": ["A = 8w + 348 + 1800/w"],
  "(negative|less than zero|below zero)[^;\\n]*(minimum|least)|(minimum|least)[^;\\n]*(negative)": [
    "d2C/dx2 = 1600/x^3, and at x = 20 that is negative, so the cost is a minimum",
  ],
  "\\b2x\\s*\\+\\s*2y\\b": ["L = 2x + 2y = 2x + 576/x"],
};

function checkPart(where: string, part: { stem: string; marks: number; answer: AnswerSpec; commonErrors: CommonError[]; workedSolution: string }) {
  const spec = part.answer;
  for (const raw of spellings(spec, part.workedSolution)) {
    checks++;
    const r = markAnswer(raw, spec, { marks: part.marks, commonErrors: part.commonErrors, prompt: part.stem } as never);
    if (!r.correct || r.marksAwarded !== part.marks) {
      findings.push(`${where}: correct spelling "${raw.slice(0, 70)}" scored ${r.marksAwarded}/${part.marks} (correct=${r.correct}) :: ${String(r.explanation).slice(0, 110)}`);
    }
  }
  for (const [i, e] of part.commonErrors.entries()) {
    const probes = e.pattern.kind === "text" ? (TEXT_PROBES[e.pattern.regex] ?? []) : [errorResponse(e)].filter((x): x is string => x !== null);
    if (probes.length === 0) {
      findings.push(`${where}: commonError ${i + 1} (${e.misconception}) has no probe, so it was never shown to fire`);
      continue;
    }
    for (const raw of probes) {
      checks++;
      if (!matchesCommonError(raw, e)) {
        findings.push(`${where}: commonError ${i + 1} (${e.misconception}) does not fire on its own route value "${raw.slice(0, 60)}"`);
        continue;
      }
      const r = markAnswer(raw, spec, { marks: part.marks, commonErrors: part.commonErrors, prompt: part.stem } as never);
      if (r.correct) {
        findings.push(`${where}: commonError ${i + 1} (${e.misconception}) value "${raw.slice(0, 40)}" is marked correct by the spec, so it can never fire`);
      } else if (r.marksAwarded !== e.marksTypicallyEarned) {
        findings.push(`${where}: commonError ${i + 1} (${e.misconception}) claims ${e.marksTypicallyEarned} marks but the marker awarded ${r.marksAwarded}`);
      } else if (!(r.tags ?? []).includes(e.misconception)) {
        findings.push(`${where}: commonError ${i + 1} fired but the marker tagged ${JSON.stringify(r.tags)} instead of ${e.misconception}`);
      }
    }
  }
}

/**
 * Named fixtures from the peer pre-read (docs/dev/qa/pre-read/fm1-e-1.md): the responses that
 * must score what they score. `[response, marks]`, keyed by "<question id>(<part>)".
 * They cover the reversed-nature answers (CS-1, CS-2, OP-3), the symbolic sign spelling,
 * the repeated root (CS-5), the show-that copy-down (CS-3), the paraphrases (OP-4 to OP-6)
 * and the capital-C constant of integration (II-1, fixed in the engine).
 */
const FIXTURES: Record<string, Array<[string, number]>> = {
  // CS-2: the turning point is a maximum, so a "minimum" conclusion must earn nothing
  "q.fm.u1.curve-sketching-quadratic-cubic.0010(d)": [
    ["The second derivative is -2, which is negative, so this is a maximum", 1],
    ["d^2y/dx^2 = -2 < 0, so it is a maximum", 1],
    ["The second derivative is -2, which is negative, so this is a minimum", 0],
    ["Because -2 is less than zero the point is a minimum", 0],
  ],
  // CS-1: the turning point is a minimum, so a "maximum" conclusion must earn nothing
  "q.fm.u1.curve-sketching-quadratic-cubic.0011(e)": [
    ["12 is positive so it is a minimum", 1],
    ["d2y/dx2 = 12 > 0, so it is a minimum", 1],
    ["At x = 6 the second derivative is 12, which is above zero, so the point is a minimum", 1],
    ["12 is positive so it is a maximum", 0],
    ["The second derivative is 12, which is positive, so this turning point is a maximum", 0],
    ["The second derivative is 12, which is negative, so it is a minimum", 0],
  ],
  // CS-3: the show-that regex fires on the copy-down and stays quiet on a real derivation
  "q.fm.u1.curve-sketching-quadratic-cubic.0011(c)": [
    ["y = x^3 - 12x^2 + 36x - 32", 0],
    ["x³ - 12x² + 36x - 32", 0],
    ["x^2 - 4x + 4 times x - 8 gives x^3 - 12x^2 + 36x - 32", 2],
  ],
  // CS-5: the repeated root written twice keeps the method mark
  "q.fm.u1.curve-sketching-quadratic-cubic.0011(a)": [
    ["(2, 0), (2, 0), (8, 0)", 1],
    ["(2, 0), (8, 0)", 2],
  ],
  // CS-4: one turning point of two earns the derivative and the setting-to-zero only
  "q.fm.u1.curve-sketching-quadratic-cubic.0008(main)": [
    ["(1, 4)", 2],
    ["(1, 4), (3, 0)", 4],
  ],
  // OP-3: the cost is least, so "greatest" or "maximum" must not earn the second mark
  "q.fm.u1.optimisation.0016(c)": [
    ["1600/x^3 at x = 20 is 0.2 > 0, so it is a minimum", 2],
    ["The second derivative is 1600 over x cubed; at 20 trays that is one fifth, which is positive, so the cost is least", 2],
    ["The second derivative is 1600/x^3, which at x = 20 is 1/5, which is positive, so this is a maximum", 1],
    ["d2C/dx2 = 1600x^-3 = 1/5 at x = 20, a positive number, so the cost is greatest there", 1],
  ],
  // OP-4: a paraphrase of the bundle's own accepted wording
  "q.fm.u1.optimisation.0014(b)": [
    ["The card is (w + 6) by (h + 8). Multiplying out gives wh + 8w + 6h + 48, and substituting h = 300/w gives 8w + 348 + 1800/w.", 2],
    ["A = 8w + 348 + 1800/w", 0],
  ],
  // OP-5 and OP-6: natural spellings of the constraint and a one-step substitution
  "q.fm.u1.optimisation.0017(a)": [
    ["x times y = 288, so y = 288/x", 1],
    ["Because the area xy is 288, dividing both sides by x gives y = 288/x", 1],
    ["y = 288/x", 0],
  ],
  "q.fm.u1.optimisation.0017(b)": [
    ["Only three sides are fenced: L = x + 2y. Replacing y with 288/x gives L = x + 576/x.", 2],
    ["L = x + 576/x", 0],
  ],
  // OP-7: the right number with no unit keeps the substitution mark
  "q.fm.u1.optimisation.0012(main)": [["108", 1], ["108 m²", 2], ["6", 0]],
  "q.fm.u1.optimisation.0014(d)": [["588", 1], ["588 cm²", 2]],
  "q.fm.u1.optimisation.0015(d)": [["108", 1], ["108 m²", 2]],
  // II-1: the engine now reads a capital C as the constant of integration
  "q.fm.u1.integration-as-inverse.0001(main)": [["2x^4 + C", 2], ["2x^4 + c", 2], ["2x^4", 1]],
  "q.fm.u1.integration-as-inverse.0005(main)": [["-3x^-3 + C", 3], ["-3/x^3 + c", 3]],
  "q.fm.u1.integration-as-inverse.0016(a)": [["x^5 + 3x + 4/x^2 + C", 4], ["x^5 + 3x + 4/x^2 + c", 4]],
  // II-2 / DI-1: the tidied coefficients still mark every spelling
  "q.fm.u1.integration-as-inverse.0008(main)": [
    ["x^4/4 - 2x^3 + 4x + c", 3],
    ["0.25x^4 - 2x^3 + 4x + c", 3],
    ["(1/4)x^4 - 2x^3 + 4x + c", 3],
  ],
  "q.fm.u1.definite-integrals.0003(main)": [["14/3", 3], ["4.67", 3], ["4.666", 3]],
};

function runFixtures(id: string, part: { stem: string; marks: number; answer: AnswerSpec; commonErrors: CommonError[] }) {
  for (const [raw, want] of FIXTURES[id] ?? []) {
    checks++;
    const r = markAnswer(raw, part.answer, { marks: part.marks, commonErrors: part.commonErrors, prompt: part.stem } as never);
    if (r.marksAwarded !== want) {
      findings.push(`${id}: fixture "${raw.slice(0, 64)}" scored ${r.marksAwarded}/${part.marks}, expected ${want} :: ${String(r.explanation).slice(0, 90)}`);
    }
  }
}

const fixtureKeys = new Set(Object.keys(FIXTURES));
const fixturesSeen = new Set<string>();

for (const slug of SLUGS) {
  const file = path.resolve("packs/further-maths/content/fm1", slug, "bundle.json");
  if (!fs.existsSync(file)) {
    console.log(`(skipping ${slug}: not written yet)`);
    continue;
  }
  const b = JSON.parse(fs.readFileSync(file, "utf8")) as TopicBundle;
  for (const q of b.questions)
    for (const p of q.parts) {
      checkPart(`${slug} ${q.id}(${p.id})`, p as never);
      const key = `${q.id}(${p.id})`;
      if (fixtureKeys.has(key)) fixturesSeen.add(key);
      runFixtures(key, p as never);
    }
  for (const we of b.workedExamples) {
    const t = we.twin;
    checks++;
    const spellingsForTwin = spellings(t.answer, "");
    for (const raw of spellingsForTwin) {
      const r = markAnswer(raw, t.answer, { marks: 1 });
      if (!r.correct) findings.push(`${slug} ${we.id} twin: correct spelling "${raw.slice(0, 60)}" was not accepted :: ${String(r.explanation).slice(0, 100)}`);
    }
  }
}

for (const key of fixtureKeys) if (!fixturesSeen.has(key)) findings.push(`fixture key ${key} matched no part in any bundle`);

console.log(`marker self-check: ${checks} probes, ${[...fixtureKeys].reduce((n, k) => n + FIXTURES[k].length, 0)} of them named fixtures from the pre-read`);
if (findings.length === 0) console.log("no findings");
else {
  for (const f of findings) console.log("FINDING", f);
  process.exitCode = 1;
}
