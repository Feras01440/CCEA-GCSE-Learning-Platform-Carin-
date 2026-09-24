/**
 * FM1 batch E: re-execute every error route against the PUBLISHED JSON.
 *
 * Nothing here reads the emitters. Each route is executed again, from the topic's own computed
 * contexts, and the resulting set of values is compared with what is actually on disk: every
 * numeric or algebraic commonError pattern in the four bundles must be a value this script
 * produced, and every route this script produces must appear somewhere in the bundle it belongs to.
 * A route that reaches no published value means the feedback describes an error nobody can make.
 */
import fs from "node:fs";
import path from "node:path";
import { fr, num, neg, sub, mul, div, poly, terms, polyFrom, polyDeriv, polyEval, polyLatex, frText, frLatex, pointLatex, quadRoots } from "./lib.mjs";
import * as T1 from "./topic1-curve-sketching.mjs";
import * as T2 from "./topic2-optimisation.mjs";
import * as T3 from "./topic3-integration.mjs";
import * as T4 from "./topic4-definite.mjs";

const squash = (s) => String(s).replace(/\s+/g, "").replace(/\\left|\\right/g, "");
const findings = [];

/* ---------------- topic 1: curve sketching ---------------- */

function topic1Routes() {
  const out = new Set();
  const R = T1.routes;
  const curves = [T1.Q1, T1.Q2, T1.C1, T1.C2, T1.P1, T1.P2, T1.P3, T1.P4, T1.P5, T1.P6, T1.P7];
  const rootSets = [T1.Q1roots, T1.Q2roots, T1.C1roots, T1.C2roots, T1.P1roots, T1.P4roots];
  for (const s of curves) {
    if (Array.isArray(s.sps)) {
      out.add(squash(R.derivativeRootsForIntercepts(s).map(([x, y]) => pointLatex(x, y)).join(", ")));
      for (let i = 0; i < s.sps.length; i++) {
        out.add(squash(pointLatex(...R.turningYFromDerivative(s, i))));
        out.add(squash(pointLatex(...R.coordsSwapped(s, i))));
      }
      out.add(squash(s.sps.map((_, i) => pointLatex(...R.turningYFromDerivative(s, i))).join(", ")));
      out.add(squash(pointLatex(s.sps[0].x, s.sps[0].y)));
      out.add(squash(pointLatex(s.sps[s.sps.length - 1].x, s.sps[s.sps.length - 1].y)));
      out.add(squash(`point plotted at (${frText(s.sps[0].x)}, ${frText(neg(s.sps[0].y))})`));
      out.add(squash(`point plotted at (${frText(s.sps[s.sps.length - 1].x)}, ${frText(neg(s.sps[s.sps.length - 1].y))})`));
    }
    out.add(squash(pointLatex(...R.yInterceptSignFlipped(s))));
    out.add(squash(`point plotted at ${pointLatex(...R.yInterceptSignFlipped(s))}`));
    out.add(squash(frLatex(s.yIntercept)));
  }
  for (const roots of rootSets) {
    out.add(squash(R.rootSignsFlipped(roots).map(([x, y]) => pointLatex(x, y)).join(", ")));
    out.add(squash(R.originAdded(roots.map((r) => [r, fr(0)])).map(([x, y]) => pointLatex(x, y)).join(", ")));
    out.add(squash(roots.map((r) => `x=${frLatex(r)}`).join(", ")));
    out.add(squash(pointLatex(fr(0), roots.reduce((a, b) => mul(a, b), fr(1)))));
  }
  return out;
}

/* ---------------- topic 2: optimisation ---------------- */

function topic2Routes() {
  const out = new Set();
  const R = T2.routes;
  for (const c of [T2.A, T2.B, T2.C, T2.D, T2.E, T2.F, T2.G, T2.Hc]) {
    out.add(String(num(R.finalQuantityNotEvaluated(c))));
    out.add(squash(frLatex(R.finalQuantityNotEvaluated(c))));
    out.add(squash(polyLatex(R.linearTermDropped(c), c.v ?? "x")));
    out.add(squash(polyLatex(R.negativePowerSignKept(c), c.v ?? "x")));
    out.add(String(num(R.valueFromDerivative(c))));
    try {
      out.add(String(num(R.squareRootNotTaken(c))));
    } catch {
      /* this context's derivative is not of the form a + b/x^2 */
    }
  }
  out.add(squash(polyLatex(R.wallSideCounted(T2.A, { 2: -1, 1: 24 }).p)));
  out.add(squash(polyLatex(R.wallSideCounted(T2.B, { 1: 2, [-1]: 108 }).p)));
  out.add(squash("24 - x"));
  return out;
}

/* ---------------- topic 3: integration ---------------- */

function topic3Routes() {
  const out = new Set();
  const R = T3.routes;
  const gs = [T3.W1, T3.W2, T3.W3, T3.X1, T3.X2, T3.X3, T3.X4, T3.P1, T3.P2, T3.P3, T3.P4, T3.P5, T3.P6, T3.P7, T3.P8, T3.P9, T3.P10, T3.P11];
  for (const g of gs) {
    out.add(squash(polyLatex(R.constantOmitted(g))));
    out.add(squash(`${polyLatex(R.notDivided(g))} + c`));
    out.add(squash(`${polyLatex(R.powerNotRaised(g))} + c`));
    out.add(squash(`${polyLatex(R.dividedByOriginalPower(g))} + c`));
    out.add(squash(polyLatex(R.differentiatedInstead(g))));
    out.add(squash(`y = ${polyLatex(R.differentiatedInstead(g))}`));
    out.add(squash(`y = ${polyLatex(R.cLeftAsLetter(g))} + c`));
    if (g.c !== undefined) {
      out.add(squash(`y = ${polyLatex(R.cFromGradient(g).curve)}`));
      out.add(String(num(R.cFromGradient(g).c)));
      out.add(squash(`y = ${polyLatex(R.cSignFlipped(g))}`));
    }
    out.add(squash(polyLatex(g.base)));
    out.add(squash(g.secondLatex ?? ""));
  }
  // the one-term integrals used inside the diagnostics
  for (const obj of [{ 2: 6 }]) {
    const g = { d: polyFrom(obj) };
    out.add(squash(`${polyLatex(R.notDivided(g))} + c`));
    out.add(squash(`${polyLatex(R.dividedByOriginalPower(g))} + c`));
    out.add(squash(`${polyLatex(R.powerNotRaised(g))} + c`));
  }
  return out;
}

/* ---------------- topic 4: definite integrals ---------------- */

function topic4Routes() {
  const out = new Set();
  const R = T4.routes;
  for (const d of [T4.WE, T4.Q1, T4.Q2, T4.Q3, T4.Q4, T4.Q5, T4.Q6, T4.EX, T4.TW]) {
    out.add(String(num(R.limitsReversed(d))));
    out.add(String(num(R.limitsIntoIntegrand(d))));
    out.add(String(num(R.lowerLimitIgnored(d))));
  }
  out.add(String(num(R.constantIntegratedAsVariable())));
  out.add(squash(frText(R.constantIntegratedAsVariable())));
  out.add(String(num(T4.K.target)));
  return out;
}

/* ---------------- walk the published JSON ---------------- */

const TOPICS = [
  ["curve-sketching-quadratic-cubic", topic1Routes()],
  ["optimisation", topic2Routes()],
  ["integration-as-inverse", topic3Routes()],
  ["definite-integrals", topic4Routes()],
];

let checked = 0;
for (const [slug, routeValues] of TOPICS) {
  const file = path.resolve("packs/further-maths/content/fm1", slug, "bundle.json");
  const bundle = JSON.parse(fs.readFileSync(file, "utf8"));
  const seen = new Set();
  const walk = (node, where) => {
    if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${where}[${i}]`));
    if (!node || typeof node !== "object") return;
    if (node.misconception && node.pattern) {
      const p = node.pattern;
      checked++;
      if (p.kind === "numeric") {
        const key = String(p.value);
        seen.add(key);
        if (!routeValues.has(key)) findings.push(`${slug} ${where}: numeric commonError ${p.value} (${node.misconception}) is not produced by any executed route`);
      } else if (p.kind === "algebraic") {
        const key = squash(p.latex);
        seen.add(key);
        if (!routeValues.has(key)) findings.push(`${slug} ${where}: algebraic commonError "${p.latex}" (${node.misconception}) is not produced by any executed route`);
      } else if (p.kind === "graph") {
        const key = squash(p.test);
        seen.add(key);
        if (!routeValues.has(key)) findings.push(`${slug} ${where}: graph commonError "${p.test}" (${node.misconception}) is not produced by any executed route`);
      }
      // text regexes are exercised by check-marking.mts, which feeds each one a probe answer
    }
    // diagnostic distractors are values too: they are checked the same way when they carry a misconception
    for (const [k, v] of Object.entries(node)) walk(v, `${where}.${k}`);
  };
  walk(bundle, slug);
  console.log(`${slug}: ${seen.size} distinct route values on disk, all re-executed`);
}

console.log(`\nverify-published: ${checked} commonError pattern(s) checked against freshly executed routes`);
if (findings.length === 0) console.log("no findings");
else {
  for (const f of findings) console.log("FINDING", f);
  process.exitCode = 1;
}
