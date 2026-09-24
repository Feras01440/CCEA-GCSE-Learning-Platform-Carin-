/**
 * FM1 batch G marker self-check.
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

const SLUGS = ["matrix-arithmetic", "matrix-inverse-2x2", "matrix-equations", "matrix-simultaneous-equations"];
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
      const bare: string[] = Number.isInteger(v) || (spec.acceptForms ?? []).includes("decimal") ? [String(v)] : [];
      // Under a dp tolerance the written form is what a learner types, so probe that form only:
      // a value written to fewer places than the stem instructs is a wrong answer, not a spelling.
      const tol = spec.tolerance as { type: string; places?: number };
      const forms = spec.acceptForms ?? [];
      const exactOnly = forms.length > 0 && !forms.includes("decimal");
      if (!Number.isInteger(v)) {
        // A spec that refuses decimals is answered as a fraction, so that is the spelling to probe.
        for (let d = 2; d <= 64 && exactOnly; d++) {
          if (Math.abs(v * d - Math.round(v * d)) < 1e-9) {
            // The numeric field is a plain input, not a maths editor, so "32/3" is the spelling a
            // learner types; \frac{32}{3} is not offered to her and is not probed.
            bare.push(`${Math.round(v * d)}/${d}`);
            break;
          }
        }
      }
      if (tol.type === "dp" && typeof tol.places === "number") bare.push(v.toFixed(tol.places));
      else if (!Number.isInteger(v) && !exactOnly) {
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
      // A solution pair is written on the paper's own answer line as "x = 3, y = 2", and she may
      // also type the bare tuple or the values with "and" between them.
      const tuple = /^\(\s*(-?[\d./]+)\s*,\s*(-?[\d./]+)\s*\)$/.exec(spec.latex.trim());
      if (tuple && spec.variables.length === 2) {
        const [, a, b] = tuple;
        const [u, v] = spec.variables;
        out.add(`${u} = ${a}, ${v} = ${b}`);
        out.add(`${u} = ${a} and ${v} = ${b}`);
        out.add(`${v} = ${b}, ${u} = ${a}`);
        // A bare "3, 2" with no brackets and no letters is refused, and the engine answers it with
        // "Give each pair as (x, y), or as x = … and y = …", so it is not probed as a spelling.
      }
      out.add(spec.latex.replace(/\s+/g, ""));
      return [...out];
    }
    case "mcq":
      return [spec.options.filter((o) => o.correct).map((o) => o.id).join(" ")];
    case "text":
      return [...spec.accepted, workedSolution];
    // Every input form the engine's matrix kind accepts (probe-matrix-kind.mts), so a conversion
    // cannot quietly narrow what a learner may type.
    case "matrix": {
      const rows = (spec as unknown as { entries: string[][] }).entries;
      const grid = (open: string, close: string) => `\\begin{${open}}${rows.map((r) => r.join(" & ")).join(" \\\\ ")}\\end{${close}}`;
      const out = [
        grid("pmatrix", "pmatrix"),
        `$${grid("pmatrix", "pmatrix")}$`,
        grid("bmatrix", "bmatrix"),
        grid("matrix", "matrix"),
        `[[${rows.map((r) => r.join(",")).join("],[")}]]`,
        rows.map((r) => r.join(" ")).join("; "),
        `X = ${grid("pmatrix", "pmatrix")}`,
        // any minus glyph
        grid("pmatrix", "pmatrix").replace(/-/g, "−"),
      ];
      // A leading scalar is multiplied through, so an inverse written CCEA's way must also pass:
      // pull out the common denominator of the entries and offer 1/d in front of the numerators.
      const dens = rows.flat().map((e) => {
        const m = /^(-?\d+)\/(\d+)$/.exec(String(e).trim());
        return m ? Number(m[2]) : 1;
      });
      const lcm = dens.reduce((a, b) => (a * b) / ((x, y) => { while (y) [x, y] = [y, x % y]; return x; })(a, b), 1);
      if (lcm > 1) {
        const scaled = rows.map((r) => r.map((e) => {
          const m = /^(-?\d+)\/(\d+)$/.exec(String(e).trim());
          return m ? String((Number(m[1]) * lcm) / Number(m[2])) : String(Number(e) * lcm);
        }));
        out.push(`\\frac{1}{${lcm}}\\begin{pmatrix}${scaled.map((r) => r.join(" & ")).join(" \\\\ ")}\\end{pmatrix}`);
      }
      return out;
    }
    case "table":
      // The field submits one entry per expected cell, as the table marker parses it.
      return [JSON.stringify({ cells: spec.cells.map((c) => ({ row: c.row, col: c.col, value: String(c.value) })) })];
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
  if (p.kind === "matrix") {
    const rows = (p as unknown as { entries: string[][] }).entries;
    return `\\begin{pmatrix}${rows.map((r) => r.join(" & ")).join(" \\\\ ")}\\end{pmatrix}`;
  }
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
  "^[^=\\n]{0,40}(x\\^?3|x³)[^\\n]{0,60}$": ["x^3 - 12x^2 + 36x - 32"],
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

for (const slug of SLUGS) {
  const file = path.resolve("packs/further-maths/content/fm1", slug, "bundle.json");
  if (!fs.existsSync(file)) {
    console.log(`(skipping ${slug}: not written yet)`);
    continue;
  }
  const b = JSON.parse(fs.readFileSync(file, "utf8")) as TopicBundle;
  for (const q of b.questions) for (const p of q.parts) checkPart(`${slug} ${q.id}(${p.id})`, p as never);
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

console.log(`marker self-check: ${checks} probes`);
if (findings.length === 0) console.log("no findings");
else {
  for (const f of findings) console.log("FINDING", f);
  process.exitCode = 1;
}
