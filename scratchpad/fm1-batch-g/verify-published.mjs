/**
 * FM1 batch G — independent re-execution of every matrix route against the PUBLISHED JSON.
 * Nothing is imported from matlib.mjs or from the topic generators: the matrices are re-entered as
 * plain number arrays (or parsed out of the published stems), and every operation is written again
 * here, so a mistake in the shared library cannot hide behind itself.
 *
 * Covers, for all four batch G topics:
 *   - sums, differences, scalar multiples, products both ways, elementwise products, transposed pairings
 *   - determinants, including the reversed subtraction bc - ad
 *   - adjugates, including "not swapped" and "not negated"
 *   - inverses, including "not divided by the determinant", each back-multiplied to the identity
 *   - X = A^-1 B and the reversed order, and (for the simultaneous topic) the printed equations
 *     re-solved by Cramer's rule and substituted back
 * Exits 1 on any mismatch.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SLUGS = ["matrix-arithmetic", "matrix-inverse-2x2", "matrix-equations", "matrix-simultaneous-equations"];

const near = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-6;
const r9 = (v) => Math.round(v * 1e9) / 1e9;

/* ---- plain matrix arithmetic, written out again ------------------------------------------------- */

const shape = (A) => `${A.length}x${A[0].length}`;
const same = (A, B) => shape(A) === shape(B);
const add = (A, B) => A.map((r, i) => r.map((v, j) => v + B[i][j]));
const sub = (A, B) => A.map((r, i) => r.map((v, j) => v - B[i][j]));
const scale = (k, A) => A.map((r) => r.map((v) => k * v));
const mul = (A, B) => (A[0].length !== B.length ? null : A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0))));
const transpose = (A) => A[0].map((_, j) => A.map((r) => r[j]));
const hadamard = (A, B) => A.map((r, i) => r.map((v, j) => v * B[i][j]));
const det = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
const detReversed = (A) => A[0][1] * A[1][0] - A[0][0] * A[1][1];
const adj = (A) => [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]];
const adjNotSwapped = (A) => [[A[0][0], -A[0][1]], [-A[1][0], A[1][1]]];
const adjNotNegated = (A) => [[A[1][1], A[0][1]], [A[1][0], A[0][0]]];
const inv = (A) => (det(A) === 0 ? null : scale(1 / det(A), adj(A)));
const is2x2 = (A) => A.length === 2 && A[0].length === 2;
const key = (A) => `${shape(A)}:${A.flat().map(r9).join(",")}`;

/** Every inverse this file builds is proved both ways before it is used. */
function provenInverse(A, findings, label) {
  const X = inv(A);
  if (!X) return null;
  for (const [P, side] of [[mul(A, X), "A A^-1"], [mul(X, A), "A^-1 A"]]) {
    if (!near(P[0][0], 1) || !near(P[1][1], 1) || !near(P[0][1], 0) || !near(P[1][0], 0)) {
      findings.push(`${label}: ${side} is not the identity`);
      return null;
    }
  }
  return X;
}

/* ---- the matrices each topic prints, re-entered by hand from the published stems ---------------- */

const SOURCE = {
  "matrix-arithmetic": [
    [[3, -1], [2, 4]],
    [[5, 2], [-1, 0]],
    [[1, 4, -2], [3, 0, 5]],
  ],
  "matrix-inverse-2x2": [
    [[4, 1], [3, 2]],
    [[-3, 2], [4, -1]],
    [[3, 6], [2, 4]],
    [[1, 4], [2, 9]],
    [[2, 6], [1, 4]],
    [[7, 3], [4, 2]],
    [[6, 9], [2, 3]],
  ],
  "matrix-equations": [
    [[4, -2], [3, 5]],
    [[9, 1], [0, 8]],
    [[6, 2], [1, 7]],
    [[2, 5], [4, 3]],
    [[3, 1], [5, 2]],
    [[7], [12]],
    [[2, 5], [1, 3]],
    [[1, 4], [2, 3]],
    [[4, 2], [3, 4]],
    [[10], [20]],
    [[4, 7], [1, 2]],
    [[3], [1]],
    [[11], [4]],
    [[2, 6], [1, 3]],
  ],
  "matrix-simultaneous-equations": [
    [[4, 3], [2, 5]],
    [[18], [16]],
    [[3, 2], [1, -1]],
    [[12], [-1]],
    [[5, 2], [3, 4]],
    [[11], [15]],
    [[4, 1], [0, 2]],
    [[9], [6]],
    [[3, 2], [5, 4]],
    [[19], [33]],
    [[2, 3], [3, 5]],
    [[14], [22]],
    [[2, 3], [4, 6]],
    [[7], [11]],
  ],
};

/** Everything the topic's routes can legitimately print, as matrices and as loose numbers. */
function closure(seeds, findings, slug) {
  const mats = new Map();
  const keep = (A) => { if (A && A.every((r) => r.every((v) => Number.isFinite(v)))) mats.set(key(A), A); };
  for (const S of seeds) keep(S);

  // one matrix at a time
  for (const A of [...mats.values()]) {
    keep(transpose(A));
    for (const k of [-1, 2, 3, 0.5, 4]) keep(scale(k, A));
    if (!is2x2(A)) continue;
    keep(adj(A));
    keep(adjNotSwapped(A));
    keep(adjNotNegated(A));
    const X = provenInverse(A, findings, `${slug} ${JSON.stringify(A)}`);
    if (X) {
      keep(X);
      keep(scale(-1, X));
      // the 1/det applied to one entry only, which is the route the feedback describes
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const P = adj(A).map((r) => [...r]);
          P[i][j] = P[i][j] / det(A);
          keep(P);
        }
      }
    }
  }

  // pairs
  const first = [...mats.values()];
  for (const A of first) {
    for (const B of first) {
      if (same(A, B)) { keep(add(A, B)); keep(sub(A, B)); keep(hadamard(A, B)); }
      keep(mul(A, B));
      keep(mul(A, transpose(B)));
      if (is2x2(A)) {
        const X = inv(A);
        if (X) { keep(mul(X, B)); keep(mul(B, X)); }
      }
    }
  }

  // a column written into the coefficient matrix instead of standing on its own side
  for (const A of seeds.filter(is2x2)) {
    for (const B of seeds.filter((M) => M.length === 2 && M[0].length === 1)) {
      keep([[A[0][0], B[0][0]], [A[1][0], B[1][0]]]);
      keep([[B[0][0], A[0][1]], [B[1][0], A[1][1]]]);
    }
  }

  // one more product, so A^-1 (C - B) and its kin are reached
  const second = [...mats.values()];
  for (const A of seeds.filter(is2x2)) {
    const X = inv(A);
    if (!X) continue;
    for (const B of second) { keep(mul(X, B)); keep(mul(B, X)); }
  }

  const values = new Set();
  for (const A of mats.values()) for (const v of A.flat()) values.add(r9(v));
  // the determinant, its reversed subtraction, and (22 Sep, MI-1/MI-2) its two diagonal products added
  for (const A of mats.values()) if (is2x2(A)) { values.add(r9(det(A))); values.add(r9(detReversed(A))); values.add(r9(A[0][0] * A[1][1] + A[0][1] * A[1][0])); }
  return { mats, values };
}

/* ---- reading the published JSON -------------------------------------------------------------------- */

const asNumber = (e) => {
  const s = String(e).trim().replace(/[−‒-―]/g, "-");
  const f = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(s);
  if (f) return Number(f[1]) / Number(f[2]);
  return Number(s);
};
const entriesToMatrix = (entries) => entries.map((r) => r.map(asNumber));

/**
 * The equations a stem prints, parsed into a1 x + b1 y = c1 without looking at the generator.
 * With `keepSign`, a term that crosses the equals sign keeps the sign it was written with, which is
 * the transcription route "moved across without changing sign".
 */
function parseEquations(stem, keepSign = false) {
  const out = [];
  for (const seg of String(stem).matchAll(/\$([^$]*)\$/g)) {
    const body = seg[1].trim();
    if (!body.includes("=") || /\\|pmatrix|det|times|\^/.test(body)) continue;
    const [lhs, rhs] = body.split("=");
    if (rhs === undefined || body.split("=").length !== 2) continue;
    const side = (s) => {
      const terms = s.replace(/\s+/g, "").replace(/-/g, "+-").split("+").filter(Boolean);
      const acc = { vars: {}, k: 0 };
      for (const t of terms) {
        const m = /^(-?)(\d*(?:\.\d+)?)([a-z])?$/.exec(t);
        if (!m) return null;
        const sign = m[1] === "-" ? -1 : 1;
        if (m[3]) acc.vars[m[3]] = (acc.vars[m[3]] ?? 0) + sign * (m[2] === "" ? 1 : Number(m[2]));
        else if (m[2] === "") return null;
        else acc.k += sign * Number(m[2]);
      }
      return acc;
    };
    const L = side(lhs);
    const R = side(rhs);
    if (!L || !R) continue;
    const vars = {};
    for (const v of new Set([...Object.keys(L.vars), ...Object.keys(R.vars)])) {
      vars[v] = keepSign ? (L.vars[v] ?? 0) + (R.vars[v] ?? 0) : (L.vars[v] ?? 0) - (R.vars[v] ?? 0);
    }
    const k = R.k - L.k;
    if (Object.keys(vars).length === 0) continue;
    out.push({ vars, k });
  }
  return out;
}

/** Every pmatrix a published string prints, as plain number arrays. */
function pmatrices(text) {
  const out = [];
  for (const m of String(text).matchAll(/\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/g)) {
    const rows = m[1].split(/\\\\/).map((r) => r.split("&").map((c) => asNumber(c.trim())));
    if (rows.every((r) => r.length === rows[0].length && r.every((v) => Number.isFinite(v)))) out.push(rows);
  }
  return out;
}

/** The matrices a transcription route reaches from the equations a stem prints. */
function stemRoutes(stem) {
  const out = [];
  for (const keepSign of [false, true]) {
    const eqs = parseEquations(stem, keepSign);
    const names = [...new Set(eqs.flatMap((e) => Object.keys(e.vars)))].sort();
    if (eqs.length !== 2 || names.length !== 2) continue;
    const A = eqs.map((e) => names.map((n) => e.vars[n] ?? 0));
    const B = eqs.map((e) => [e.k]);
    out.push(A, transpose(A));
    out.push([[A[0][0], B[0][0]], [A[1][0], B[1][0]]]);
    out.push([[B[0][0], A[0][1]], [B[1][0], A[1][1]]]);
  }
  return out;
}

/** Cramer's rule, written out here, plus a substitution check. */
function solvePair(eqs, names) {
  if (eqs.length !== 2) return null;
  const [a1, b1] = [eqs[0].vars[names[0]] ?? 0, eqs[0].vars[names[1]] ?? 0];
  const [a2, b2] = [eqs[1].vars[names[0]] ?? 0, eqs[1].vars[names[1]] ?? 0];
  const D = a1 * b2 - a2 * b1;
  if (D === 0) return null;
  const x = (eqs[0].k * b2 - eqs[1].k * b1) / D;
  const y = (a1 * eqs[1].k - a2 * eqs[0].k) / D;
  if (!near(a1 * x + b1 * y, eqs[0].k) || !near(a2 * x + b2 * y, eqs[1].k)) return null;
  return { x, y, D, A: [[a1, b1], [a2, b2]] };
}

let checked = 0;
const findings = [];

for (const slug of SLUGS) {
  const file = path.join(ROOT, "packs/further-maths/content/fm1", slug, "bundle.json");
  if (!fs.existsSync(file)) { console.log(`(skipping ${slug}: not written yet)`); continue; }
  const b = JSON.parse(fs.readFileSync(file, "utf8"));
  const { mats, values } = closure(SOURCE[slug], findings, slug);
  const hasValue = (v) => [...values].some((x) => near(x, v));
  const hasMatrix = (A) => mats.has(key(A)) || [...mats.values()].some((M) => same(M, A) && M.flat().every((v, i) => near(v, A.flat()[i])));

  for (const q of b.questions) {
    const stems = q.parts.map((p) => p.stem).join("\n");
    for (const p of q.parts) {
      const where = `${slug} ${q.id}(${p.id})`;
      // matrices a transcription route reaches from this part's own printed equations
      const extra = stemRoutes(p.stem);
      const reachable = (M) => hasMatrix(M) || extra.some((E) => same(E, M) && key(E) === key(M));

      if (p.answer.kind === "numeric") {
        checked++;
        if (!hasValue(p.answer.value)) findings.push(`${where}: answer ${p.answer.value} is reached by no route`);
      }
      if (p.answer.kind === "table") {
        for (const c of p.answer.cells) {
          checked++;
          if (typeof c.value === "number" && !hasValue(c.value)) findings.push(`${where}: answer cell (${c.row}, ${c.col}) = ${c.value} is reached by no route`);
        }
      }
      if (p.answer.kind === "matrix") {
        checked++;
        const M = entriesToMatrix(p.answer.entries);
        if (M.length !== p.answer.rows || M[0].length !== p.answer.cols) findings.push(`${where}: the entries are not ${p.answer.rows} by ${p.answer.cols}`);
        else if (!reachable(M)) findings.push(`${where}: the answer matrix ${JSON.stringify(M)} is reached by no route`);
      }
      // the coefficient matrix of a pair must be the coefficients the stem prints, after rearranging
      if (p.answer.kind === "matrix" && /coefficient matrix/.test(p.stem)) {
        const eqs = parseEquations(p.stem);
        const names = [...new Set(eqs.flatMap((e) => Object.keys(e.vars)))].sort();
        if (eqs.length === 2 && names.length === 2) {
          checked++;
          const want = eqs.map((e) => names.map((n) => e.vars[n] ?? 0));
          const got = entriesToMatrix(p.answer.entries);
          if (key(want) !== key(got)) findings.push(`${where}: the stem's equations give ${JSON.stringify(want)}, but the answer is ${JSON.stringify(got)}`);
        } else findings.push(`${where}: the stem's equations could not be parsed, so the answer was not re-derived`);
      }
      // a solution pair: re-solve the printed equations by Cramer and substitute back
      if (p.answer.kind === "algebraic" && /^\(\s*-?[\d./]+\s*,\s*-?[\d./]+\s*\)$/.test(p.answer.latex.trim())) {
        const eqs = parseEquations(p.stem).length === 2 ? parseEquations(p.stem) : parseEquations(stems);
        const names = p.answer.variables;
        let sol = solvePair(eqs, names);
        // A worded pair prints no equations, so the matrices of its own worked solution are used:
        // A and B are read back out, inverted here and multiplied here, then substituted back.
        if (!sol) {
          const ms = pmatrices(p.workedSolution ?? "");
          const A = ms.find(is2x2);
          const B = ms.find((M) => M.length === 2 && M[0].length === 1);
          if (A && B && det(A) !== 0) {
            const X = provenInverse(A, findings, `${where} worked solution`);
            const P = X && mul(X, B);
            if (P && near(mul(A, P)[0][0], B[0][0]) && near(mul(A, P)[1][0], B[1][0])) sol = { x: P[0][0], y: P[1][0], D: det(A), A };
          }
        }
        checked++;
        if (!sol) findings.push(`${where}: the printed equations could not be re-solved independently`);
        else {
          const [, sx, sy] = /^\(\s*(-?[\d./]+)\s*,\s*(-?[\d./]+)\s*\)$/.exec(p.answer.latex.trim());
          if (!near(asNumber(sx), sol.x) || !near(asNumber(sy), sol.y)) {
            findings.push(`${where}: published ${p.answer.latex} but re-solving independently gives (${r9(sol.x)}, ${r9(sol.y)})`);
          }
        }
      }

      for (const [i, e] of (p.commonErrors ?? []).entries()) {
        const tag = `${where} commonError ${i + 1} (${e.misconception})`;
        if (e.pattern.kind === "numeric") {
          checked++;
          if (!hasValue(e.pattern.value)) findings.push(`${tag} value ${e.pattern.value} is reached by no route`);
          if (p.answer.kind === "numeric" && near(p.answer.value, e.pattern.value)) findings.push(`${tag} equals the part's own answer`);
        }
        if (e.pattern.kind === "matrix") {
          checked++;
          const M = entriesToMatrix(e.pattern.entries);
          if (!reachable(M)) findings.push(`${tag} matrix ${JSON.stringify(M)} is reached by no route`);
          if (p.answer.kind === "matrix" && key(entriesToMatrix(p.answer.entries)) === key(M)) findings.push(`${tag} equals the part's own answer`);
        }
        if (e.pattern.kind === "algebraic" && p.answer.kind === "algebraic" && e.pattern.latex.trim() === p.answer.latex.trim()) {
          findings.push(`${tag} equals the part's own answer`);
        }
      }

      if (p.answer.kind === "mcq") {
        for (const o of p.answer.options) {
          if (!/pmatrix/.test(String(o.text))) continue;
          checked++;
          const nums = [...String(o.text).matchAll(/-?\d+(?:\.\d+)?(?:\/\d+)?/g)].map((m) => asNumber(m[0]));
          const stray = nums.filter((v) => !hasValue(v));
          if (stray.length) findings.push(`${where} option ${o.id} holds ${stray.join(", ")}, reached by no route`);
        }
      }
    }
  }

  // 22 Sep: every worked-example twin re-solved from the matrices its own stem prints, independent of matlib.
  for (const we of b.workedExamples ?? []) {
    const t = we.twin;
    const where = `${slug} ${we.id} twin`;
    const Ms = pmatrices(t.stem);
    let want = null;
    if (/AX \+ C = B/.test(t.stem) && Ms.length === 3) {
      const [A, C, B] = Ms;
      const X = provenInverse(A, findings, where);
      want = X ? mul(X, sub(B, C)) : null;
      if (want && key(add(mul(A, want), C)) !== key(B)) findings.push(`${where}: X does not substitute back into AX + C = B`);
    } else if (/AX = B/.test(t.stem) && Ms.length === 2) {
      const [A, B] = Ms;
      const X = provenInverse(A, findings, where);
      want = X ? mul(X, B) : null;
    } else if (/A \+ X = B/.test(t.stem) && Ms.length === 2) want = sub(Ms[1], Ms[0]);
    else if (/\^\{-1\}/.test(t.stem) && Ms.length === 1) want = provenInverse(Ms[0], findings, where);
    else if (/work out \$BA\$/i.test(t.stem)) want = mul(SOURCE[slug][1], SOURCE[slug][0]);
    else if (t.answer.kind === "algebraic") {
      const eqs = parseEquations(t.stem);
      const names = [...new Set(eqs.flatMap((e) => Object.keys(e.vars)))].sort();
      const sol = solvePair(eqs, names);
      if (sol) {
        checked++;
        const tuple = /^\(\s*(-?[\d./]+)\s*,\s*(-?[\d./]+)\s*\)$/.exec(t.answer.latex.trim());
        if (!tuple || !near(asNumber(tuple[1]), sol.x) || !near(asNumber(tuple[2]), sol.y)) findings.push(`${where}: published ${t.answer.latex} but the stem's pair gives (${r9(sol.x)}, ${r9(sol.y)})`);
      } else findings.push(`${where}: the stem's pair could not be re-solved`);
      continue;
    }
    if (!want) { findings.push(`${where}: the stem's form was not recognised, so the twin was not re-solved`); continue; }
    checked++;
    if (t.answer.kind !== "matrix" || key(entriesToMatrix(t.answer.entries)) !== key(want)) findings.push(`${where}: published ${JSON.stringify(t.answer.entries ?? t.answer)} but re-solving gives ${JSON.stringify(want)}`);
  }
}

console.log(`verify-published: ${checked} route checks`);
if (findings.length === 0) console.log("no findings");
else {
  for (const f of findings) console.log("FINDING", f);
  process.exitCode = 1;
}
