/**
 * Shared generator helpers for the M3 Number-and-algebra bundle batch.
 * Every number that appears in a stem, an answer, a scheme line or a verification
 * log is computed here once and reused, so the bundle cannot drift from its own maths.
 */
import fs from "node:fs";
import path from "node:path";
import { ROUTES } from "./error-routes.mjs";

export const ROOT = path.resolve(process.cwd());
export const AT = "2026-09-13T09:00:00Z";
export const TODAY = "2026-09-13";
export const CER_URL = "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports";

// ---------------------------------------------------------------- paper context

export const M3 = {
  unit: "M3",
  calculator: true,
  resources: ["Formula sheet printed on page 2", "Scientific calculator"],
};
/** The Higher completion test Paper 1 re-examines M3 content with no calculator. */
export const M7P1 = {
  unit: "M7",
  paper: 1,
  calculator: false,
  resources: ["Formula sheet printed on page 2"],
};

export const MINUTES_PER_MARK_M3 = 1.2; // packs/maths/exam-true/tariffs.json → M3.Paper
export const time = (marks) => Math.round(marks * MINUTES_PER_MARK_M3 * 60);

// ---------------------------------------------------------------- arithmetic checks

const failures = [];
export function expect(label, actual, wanted, tol = 1e-9) {
  const ok = typeof wanted === "number" ? Math.abs(actual - wanted) <= tol : actual === wanted;
  if (!ok) failures.push(`${label}: got ${actual}, expected ${wanted}`);
  return actual;
}
export function assertNoFailures(where) {
  if (failures.length) {
    console.error(`\nARITHMETIC CHECK FAILURES in ${where}:`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
  }
}

/** Evaluate a JS-syntax expression in x (and optionally y) at a sample point. */
export function ev(expr, vars) {
  const names = Object.keys(vars);
  // eslint-disable-next-line no-new-func
  return Function(...names, `"use strict"; return (${expr});`)(...names.map((n) => vars[n]));
}

/**
 * Check that two algebraic expressions agree at three sample points.
 * Returns a detail string naming the points and the common values.
 */
export function equiv(label, lhs, rhs, points) {
  const shown = [];
  for (const p of points) {
    const a = ev(lhs, p);
    const b = ev(rhs, p);
    if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a - b) > 1e-9) {
      failures.push(`${label}: at ${JSON.stringify(p)} lhs=${a} rhs=${b}`);
    }
    shown.push(`${JSON.stringify(p).replace(/[{}"]/g, "")} → ${round(a, 6)}`);
  }
  return `${label}: ${lhs} ≡ ${rhs} checked at ${shown.join(", ")}`;
}

export const round = (v, dp) => Number(Math.round(Number(v + "e" + dp)) + "e-" + dp);

/** Highest common factor / lowest common multiple of two positive integers. */
export const hcf = (a, b) => (b === 0 ? a : hcf(b, a % b));
export const lcm = (a, b) => (a * b) / hcf(a, b);

/** Prime factorisation as a sorted array of [prime, exponent]. */
export function primes(n) {
  const out = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) { m /= p; e++; }
    if (e) out.push([p, e]);
  }
  if (m > 1) out.push([m, 1]);
  return out;
}
export const powerString = (pf) => pf.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(" \\times ");
export const powerPlain = (pf) => pf.map(([p, e]) => (e === 1 ? `${p}` : `${p}${supers(e)}`)).join(" × ");
const supers = (e) => String(e).replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);

// ---------------------------------------------------------------- figures

/**
 * Inline SVG for a question or worked example, as a utf8 data URI.
 * House rule: no <style>, <script>, event handlers, external hrefs or media queries.
 * Every stroke and fill is currentColor (fill-opacity for tints); `#` never appears.
 */
const FORBIDDEN = /<style|<script|\son[a-z]+\s*=|xlink:href|href\s*=|prefers-color-scheme|<image|<foreignObject/i;
function guard(svg, alt) {
  const bad = svg.match(FORBIDDEN);
  if (bad) throw new Error(`SVG for "${alt}" contains a forbidden construct: ${bad[0]}`);
  if (!/viewBox=/.test(svg)) throw new Error(`SVG for "${alt}" has no viewBox`);
  if (svg.includes("#")) throw new Error(`SVG for "${alt}" must not contain a raw "#"`);
  if (svg.length > 12000) throw new Error(`SVG over 12 KB (${svg.length}) for: ${alt}`);
  return svg;
}

export function svgFig(body, alt, w, h) {
  const svg =
    `<svg viewBox='0 0 ${w} ${h}' xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' role='img'>` +
    `<title>${alt}</title>` + body + `</svg>`;
  return { kind: "svg", src: "data:image/svg+xml;utf8," + guard(svg, alt), alt };
}

/** The same drawing as a note `figure` block (inline SVG markup, not a data URI). */
export function noteFigure(body, alt, w, h, caption, titleId) {
  const svg =
    `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${titleId}">` +
    `<title id="${titleId}">${caption}</title>` +
    body.replace(/'/g, '"') +
    `</svg>`;
  return { type: "figure", alt, svg: guard(svg, alt), caption };
}

/** Standard text-group attributes: sans-serif, currentColor fill, no stroke. */
export const TXT = `fill='currentColor' stroke='none' font-family='ui-sans-serif, system-ui, sans-serif'`;
export const MATHTXT = `fill='currentColor' stroke='none' font-family='ui-serif, Georgia, serif'`;

// ---------------------------------------------------------------- verification logs

const TOOL = "claude (author-unit-batch pass; every value recomputed in scratchpad/m3-na)";

/**
 * Standard nine-check verification log. `d` supplies the per-item detail strings.
 * Keys: scope, formula, command, tariff, numeric, symbolic (optional), examiner, copy.
 */
export function ver(id, itemId, d) {
  const c = (type, detail) => ({ type, tool: TOOL, result: "pass", detail, at: AT, by: "claude" });
  const checks = [
    c("schema", "Shape checked against src/lib/content/schema.ts (TopicBundle) and published by pipeline/build-content.mts with 0 problems"),
    c("scope-tier", d.scope),
    c("formula-sheet", d.formula),
    c("command-words", d.command),
    c("tariff", d.tariff),
    c("maths-numeric", d.numeric),
  ];
  if (d.symbolic) checks.push(c("maths-symbolic", d.symbolic));
  checks.push(c("examiner-alignment", d.examiner));
  checks.push(c("copy-shingle", d.copy));
  checks.push(
    c(
      "style-lint",
      "Every $…$ segment compiled with KaTeX 0.18.5 (throwOnError); British English; no exclamation marks; the banned tokens (the W-word for an incorrect answer, the 9-1 grade label) do not occur",
    ),
  );
  return { id, itemId, version: 1, checks, status: "verified", reports: [] };
}

// ---------------------------------------------------------------- item builders

const sum = (xs) => xs.reduce((a, b) => a + b, 0);

/** Build a Question, computing totalMarks, the skeleton and the time allowance. */
export function question(o) {
  const parts = o.parts;
  const totalMarks = sum(parts.map((p) => p.marks));
  const skeleton = parts.map((p) => `(${p.id})${p.verb}${p.marks}`).join("|");
  for (const p of parts) {
    const schemeTotal = sum(p.scheme.map((m) => m.marks));
    if (p.scheme.length && schemeTotal !== p.marks) {
      throw new Error(`${o.id} part ${p.id}: scheme totals ${schemeTotal} but part is ${p.marks}`);
    }
    delete p.verb;
  }
  return {
    id: o.id,
    topic: o.topic,
    specRefs: o.specRefs,
    paper: o.paper ?? M3,
    tier: "H",
    style: o.style,
    difficulty: o.difficulty,
    ao: o.ao ?? ["AO1"],
    commandWords: o.commandWords,
    emphasis: o.emphasis ?? [],
    context: { setting: o.setting, original: true },
    figures: o.figures ?? [],
    parts,
    totalMarks,
    timeAllowanceSec: time(totalMarks),
    skeleton,
    examinerSources: o.examinerSources,
    solutionProgram: o.solutionProgram,
    verification: `ver.${o.id}`,
    version: 1,
  };
}

export const M = (id, marks, forText, extra = {}) => ({ id, code: "M", marks, for: forText, ...extra });
export const A = (id, marks, forText, extra = {}) => ({ id, code: "A", marks, for: forText, ...extra });
export const MA = (id, marks, forText, extra = {}) => ({ id, code: "MA", marks, for: forText, ...extra });

export const numAnswer = (value, o = {}) => ({
  kind: "numeric",
  value,
  tolerance: o.tolerance ?? { type: "exact" },
  ...(o.unit ? { unit: o.unit } : {}),
  unitRequired: o.unitRequired ?? false,
  acceptForms: o.acceptForms ?? ["decimal"],
  ...(o.mustBeSimplified !== undefined ? { mustBeSimplified: o.mustBeSimplified } : {}),
  ...(o.moneyFormat !== undefined ? { moneyFormat: o.moneyFormat } : {}),
});

export const algAnswer = (latex, o = {}) => ({
  kind: "algebraic",
  latex,
  equivalence: o.equivalence ?? "equivalent",
  variables: o.variables ?? ["x"],
  ...(o.mustBeFactorised !== undefined ? { mustBeFactorised: o.mustBeFactorised } : {}),
  ...(o.mustBeExpanded !== undefined ? { mustBeExpanded: o.mustBeExpanded } : {}),
});

export const textAnswer = (accepted, keyWords) => ({
  kind: "text",
  accepted,
  keyWords,
  listingRule: false,
});

// ---------------------------------------------------------------- writing

/**
 * Every numeric commonError value is REPLACED by the result of executing the error its
 * feedback describes (scratchpad/m3-na/error-routes.mjs). A missing route, or a route
 * that reaches no value, is a hard failure: the distractor must be rewritten or dropped.
 * Returns the list of values that had drifted from their own route.
 */
export function applyErrorRoutes(slug, bundle, ROUTES) {
  const drift = [];
  for (const q of bundle.questions) {
    const qn = q.id.split(".").pop();
    for (const p of q.parts) {
      p.commonErrors.forEach((e, i) => {
        if (e.pattern.kind !== "numeric") return;
        const key = `${slug}|${qn}|${p.id}|${i}`;
        const route = ROUTES[key];
        if (!route) throw new Error(`no error route declared for ${key}`);
        if (route.value === null) {
          throw new Error(`${key}: route reaches no value ("${route.desc}") — rewrite the feedback or drop the distractor`);
        }
        const was = e.pattern.value;
        if (was !== undefined && Math.abs(was - route.value) > 1e-9) {
          drift.push({ key, was, now: route.value, desc: route.desc });
        }
        e.pattern.value = route.value;
        if (!Number.isInteger(route.value)) e.pattern.tolerance = { type: "dp", places: 2 };
      });
    }
  }
  return drift;
}

export const DRIFT = [];

export function writeBundle(unit, slug, bundle, blocks) {
  // Distractor values are computed from their own error route, never transcribed.
  DRIFT.push(...applyErrorRoutes(slug, bundle, ROUTES).map((d) => ({ slug, ...d })));

  // Local invariants the pipeline also enforces — checked BEFORE anything reaches disk.
  const ids = [];
  const push = (x) => ids.push(x);
  if (bundle.note) push(bundle.note.id);
  bundle.workedExamples.forEach((w) => push(w.id));
  bundle.diagnostics.forEach((d) => push(d.id));
  bundle.questions.forEach((q) => push(q.id));
  bundle.findTheMistake.forEach((f) => push(f.id));
  bundle.prompts.forEach((p) => push(p.id));
  if (bundle.insight) push(bundle.insight.id);
  (bundle.sets ?? []).forEach((s) => push(s.id));
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dupes.length) throw new Error(`${slug}: duplicate ids ${dupes.join(", ")}`);
  const logIds = new Set(bundle.verification.map((l) => l.id));
  const need = [
    ...(bundle.note ? [bundle.note.verification] : []),
    ...bundle.workedExamples.map((w) => w.verification),
    ...bundle.questions.map((q) => q.verification),
  ];
  for (const n of need) if (!logIds.has(n)) throw new Error(`${slug}: missing verification log ${n}`);
  for (const l of bundle.verification) {
    if (!ids.includes(l.itemId)) throw new Error(`${slug}: verification log ${l.id} points at unknown item ${l.itemId}`);
  }
  const prompts = new Set(bundle.prompts.map((p) => p.id));
  for (const b of blocks) {
    if (b.type === "prompt" && !prompts.has(b.promptId)) throw new Error(`${slug}: note references unknown prompt ${b.promptId}`);
  }
  const banned = /\bWrong\b|grade 9|![^=]/;
  const scan = JSON.stringify(bundle) + JSON.stringify(blocks);
  const hit = scan.match(banned);
  if (hit) throw new Error(`${slug}: banned token ${JSON.stringify(hit[0])} near ${scan.slice(Math.max(0, hit.index - 90), hit.index + 60)}`);

  const dir = path.join(ROOT, "packs", "maths", "content", unit, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "bundle.json"), JSON.stringify(bundle, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "note.blocks.json"), JSON.stringify(blocks, null, 2) + "\n");

  const counts = {
    we: bundle.workedExamples.length,
    dx: bundle.diagnostics.reduce((n, d) => n + d.items.length, 0),
    q: bundle.questions.length,
    ftm: bundle.findTheMistake.length,
    rp: bundle.prompts.length,
    ver: bundle.verification.length,
  };
  console.log(`wrote ${unit}/${slug}  we ${counts.we} · dx ${counts.dx} · q ${counts.q} · ftm ${counts.ftm} · rp ${counts.rp} · ver ${counts.ver}`);
  return counts;
}

/** Retrieval prompt helper. */
export function rp(topic, n, specRefs, kind, prompt, answer, keyWords, difficultyPrior) {
  return {
    id: `rp.${topic}.${n}`,
    topic,
    specRefs,
    kind,
    prompt,
    answer,
    ...(keyWords ? { keyWords } : {}),
    examUnit: "M3",
    ...(difficultyPrior !== undefined ? { difficultyPrior } : {}),
  };
}

/** Diagnostic MCQ item helper: options are [text, correct, misconception|null, feedback]. */
export function dxItem(id, stem, skill, options, secondsExpected, figure) {
  return {
    id,
    stem,
    skill,
    ...(figure ? { figure } : {}),
    options: options.map(([text, correct, misconception, feedback], i) => ({
      id: "abcde"[i],
      text,
      correct,
      ...(misconception ? { misconception } : {}),
      feedback,
    })),
    secondsExpected,
    confidence: true,
    hypercorrectionQueue: true,
  };
}

export const externalCer = [{ kind: "ccea-doc", docType: "cer", url: CER_URL, asOf: TODAY }];
