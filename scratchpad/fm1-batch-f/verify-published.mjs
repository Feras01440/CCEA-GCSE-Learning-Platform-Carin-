/**
 * FM1 batch F — independent re-execution of every error route against the PUBLISHED JSON.
 * Nothing is imported from the topic generators: the routes are written out again here and the
 * values they produce are matched to the commonError values that are actually on disk.
 * Exits 1 on any mismatch or on any commonError no route reaches.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SLUGS = ["logarithms-from-indices", "area-under-curve", "laws-of-logarithms", "log-log-graphs", "indicial-equations"];

const near = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-6;
const r9 = (v) => Math.round(v * 1e9) / 1e9;

/** Every route this batch claims, written independently of the generators. */
const ROUTES = {
  // logarithms-from-indices
  "base-and-index-swapped": () => [r9(64 ** (1 / 2)), r9(625 ** (1 / 5)), 3 ** 4],
  "divided-by-base": () => [64 / 2, 625 / 5, 36 / 6],
  "multiplied-not-raised": () => [4 * 3],
  "unknown-base-divided": () => [216 / 3],
  "sign-dropped": () => [3, 2, r9(0.25 ** (1 / 2))],
  "anchors-swapped": () => [0, 1],
  "rounded-2dp": () => [Math.round(Math.log10(470) * 100) / 100],
  // the answer line filled with a number copied out of the question rather than the index
  "base-echoed": () => [9, 4, 6, 2, 10],
  "argument-echoed": () => [0.01, 1, 7],

  // area-under-curve. Every curve is re-entered here as a plain coefficient list, independent of
  // polylib.mjs, and every route is re-run with a 200 000-strip numerical integral as the check.
  "area-routes": () => {
    const P = {
      j1: [[2, 1], [1, 0]], j2: [[3, 2]], j3: [[1, 2], [2, 1]], j4: [[-1, 2], [4, 0]],
      j5: [[1, 2], [-9, 0]], j6: [[3, 2], [-12, 0]], j7: [[1, 2], [-4, 0]], j8: [[-1, 2], [6, 1]],
      j9: [[1, 2]], j10: [[2, 1], [-8, 0]], ja: [[1, 2], [-5, 1], [4, 0]], jb: [[-2, 2], [8, 0]],
    };
    const F = (p, x) => p.reduce((s, [c, n]) => s + (c / (n + 1)) * x ** (n + 1), 0);
    const I = (p, a, b) => F(p, b) - F(p, a);
    const out = [];
    // negative integral left on the answer line
    out.push(I(P.j5, 0, 3), I(P.j6, 0, 2), I(P.j10, 1, 4), I(P.ja, 1, 4), I(P.jb, 2, 3));
    // limits reversed
    out.push(-I(P.j1, 1, 4));
    // crossing region integrated straight across
    out.push(Math.abs(I(P.j7, 0, 4)));
    // the index left where it was: a x^n -> a x^n / (n + 1)
    const powerNotRaised = (p, a, b) => p.reduce((s, [c, n]) => s + (c / (n + 1)) * (b ** n - a ** n), 0);
    out.push(powerNotRaised(P.j2, 1, 2), powerNotRaised(P.j9, 1, 2));
    // the coefficient never divided: a x^n -> a x^(n+1)
    const coefNotDivided = (p, a, b) => p.reduce((s, [c, n]) => s + c * (b ** (n + 1) - a ** (n + 1)), 0);
    out.push(coefNotDivided(P.j3, 0, 3), coefNotDivided(P.jb, 0, 2));
    // differentiated instead of integrated
    const differentiated = (p, a, b) => p.filter(([, n]) => n > 0).reduce((s, [c, n]) => s + c * n * (b ** (n - 1) - a ** (n - 1)), 0);
    out.push(differentiated(P.j3, 0, 3));
    // only the top limit substituted
    out.push(Math.abs(F(P.j4, 2)));
    // the limits put into the curve instead of the integral
    const curveVal = (p, x) => p.reduce((s, [c, n]) => s + c * x ** n, 0);
    out.push(Math.abs(curveVal(P.j8, 6) - curveVal(P.j8, 0)));
    // only the piece above the axis counted, the piece below it dropped
    out.push(I(P.j7, 2, 4));
    // 22 Sep: post-check d3 as re-authored in the 20 Sep fix pass, y = -x^2 + 9 between its intercepts -3 and 3:
    // the limits reversed, and the top limit alone
    const jd3 = [[-1, 2], [9, 0]];
    out.push(-I(jd3, -3, 3), F(jd3, 3));
    return out.map(r9);
  },

  // log-log-graphs. Both data sets are re-derived here from k and n alone.
  "loglog-routes": () => {
    const d3 = (v) => Math.round(v * 1000) / 1000;
    const sets = [
      { k: 4, n: 1.5, xs: [1, 4, 9, 16, 25], pred: 12.25 },
      { k: 5, n: 2, xs: [2, 4, 6, 8, 10], pred: 7 },
    ];
    const out = [];
    for (const s of sets) {
      const ys = s.xs.map((x) => s.k * x ** s.n);
      const logx = s.xs.map((x) => d3(Math.log10(x)));
      const logy = ys.map((y) => d3(Math.log10(y)));
      const gradient = (logy[4] - logy[0]) / (logx[4] - logx[0]);
      out.push(d3(Math.log10(s.k)));                       // the intercept handed in as the constant
      out.push(1 / gradient);                              // the gradient fraction upside down
      out.push(gradient);                                  // the gradient read onto the constant's line
      out.push(Math.round(10 ** d3(Math.log10(s.k)) * 10) / 10); // the constant, un-logged
      out.push(s.k * Math.log10(s.pred) ** s.n);           // the logarithm put into the power law
      out.push(d3(logy[2]));                               // a log value from the table
      out.push(Math.round(logy[2] * 100) / 100);           // the same value to two decimal places
      out.push(Math.round(s.k * s.pred ** s.n * 1e9) / 1e9); // the prediction itself
      out.push(logy[4] - logy[0]);                         // the vertical change taken as the gradient
    }
    // a contextual quantity rounded down instead of up
    const flow = 4 * 12.25 ** 1.5;
    out.push(Math.floor(flow / 50), Math.ceil(flow / 50));
    return out.map(r9);
  },

  // indicial-equations. Each equation L^(m x + c) = R^(p x + q) is re-entered and each route re-run.
  "indicial-routes": () => {
    const lg = (v) => Math.log10(v);
    const eqs = [
      { L: 5, m: 3, c: -2, R: 40, p: 0, q: 1 },
      { L: 2, m: 1, c: 0, R: 40, p: 0, q: 1 },
      { L: 5, m: 1, c: 2, R: 90, p: 0, q: 1 },
      { L: 7, m: 3, c: -1, R: 200, p: 0, q: 1 },
      { L: 4, m: 1, c: 0, R: 2, p: 1, q: 3 },
      { L: 5, m: 2, c: 0, R: 3, p: 1, q: 4 },
      { L: 3, m: 1, c: 0, R: 11, p: 0, q: 1 },
      { L: 2, m: 4, c: 1, R: 7, p: 1, q: 3 },
      { L: 8, m: 1, c: 0, R: 2, p: 1, q: 4 },
    ];
    const out = [];
    for (const e of eqs) {
      const denom = e.m * lg(e.L) - e.p * lg(e.R);
      const numer = e.q * lg(e.R) - e.c * lg(e.L);
      if (Math.abs(denom) > 1e-12) out.push(numer / denom); // the correct solution
      // brackets dropped where there was a bracket
      const lb = e.c !== 0 && e.m !== 0;
      const rb = e.p !== 0 && e.q !== 0;
      const lc = lb ? e.m : e.m * lg(e.L);
      const lk = lb ? e.c * lg(e.L) : 0;
      const rc = e.p === 0 ? 0 : rb ? e.p : e.p * lg(e.R);
      const rk = e.q * lg(e.R);
      if (Math.abs(lc - rc) > 1e-12) out.push((rk - lk) / (lc - rc));
      // an x term moved without changing sign
      const d2 = e.m * lg(e.L) + e.p * lg(e.R);
      if (Math.abs(d2) > 1e-12) out.push(numer / d2);
      // the numerator's difference carried out as a division
      if (e.c !== 0 && Math.abs(denom) > 1e-12) out.push((e.q * lg(e.R)) / (e.c * lg(e.L)) / denom);
      // every logarithm rounded to two decimal places first
      const lL = Math.round(lg(e.L) * 100) / 100;
      const lR = Math.round(lg(e.R) * 100) / 100;
      const dR = e.m * lL - e.p * lR;
      if (Math.abs(dR) > 1e-12) out.push((e.q * lR - e.c * lL) / dR);
      // the power undone by dividing, and the quotient of logs carried out as a difference
      out.push(e.R / e.L, e.q * lg(e.R) - e.m * lg(e.L));
    }
    return out.map(r9);
  },

  // laws-of-logarithms: the equations, and the value each misuse of a law reaches on the answer line.
  "laws-routes": () => [
    // log x + log 4 = log 20 -> 4x = 20, and the sum-inside slip -> x + 4 = 20
    20 / 4,
    20 - 4,
    // log(x + 5) - log(x - 1) = log 3 -> x + 5 = 3(x - 1)
    8 / 2,
    // log(2x - 1) = log 3 + log 4 -> 2x - 1 = 12, and the sum-inside slip -> 2x - 1 = 7
    13 / 2,
    (7 + 1) / 2,
    // log(x + 2) + log(x - 2) = log 12 -> x^2 - 4 = 12, and the sum-inside slip -> 2x = 12
    4,
    -4,
    12 / 2,
  ].map(r9),

  // laws-of-logarithms, depth pass 23 Sep: each new numeric common error re-derived here from its equation alone.
  "laws-depth-routes": () => {
    const lg = Math.log10;
    // q0017(d): 5^(2x - 1) = 8 x 2^x = 2^(x + 3).
    //   brackets left off both sides: 2x - log 5 = x + 3 log 2, so x = 3 log 2 + log 5
    //   the x log 2 term carried across without its sign changing: x(2 log 5 + log 2) = 3 log 2 + log 5
    const noBrackets = 3 * lg(2) + lg(5);
    const signKept = (3 * lg(2) + lg(5)) / (2 * lg(5) + lg(2));
    // q0020: P = k v^n through (5, 250) and (10, 2000): the gradient upside down, and log k handed in as k
    const n = (lg(2000) - lg(250)) / (lg(10) - lg(5));
    const inverted = 1 / n;
    const logK = lg(250) - n * lg(5);
    return [noBrackets, signKept, inverted, logK].map(r9);
  },

  // laws-of-logarithms, 23 Sep evening: the tail-only item q0021, log_2 x + log_2(x + 2) = 3, from its equation alone.
  "laws-tail-routes": () => {
    // x^2 + 2x - k = 0, the positive root first
    const roots = (k) => [-1 + Math.sqrt(1 + k), -1 - Math.sqrt(1 + k)];
    return [
      ...roots(2 ** 3), // the index form, x(x + 2) = 2^3: 2, and -4 which is rejected
      (2 ** 3 - 2) / 2, // the sum put inside, 2x + 2 = 2^3: 3
      roots(2 * 3)[0], // the base multiplied by the index, x(x + 2) = 6: -1 + root 7
    ].map(r9);
  },
};

const allRouteValues = new Set();
for (const fn of Object.values(ROUTES)) for (const v of fn()) allRouteValues.add(r9(v));

/**
 * The numeric value an option's text carries, read from the spellings the bundles use:
 * a bare number, a signed number, or a \frac{a}{b}. Anything else returns NaN and is skipped.
 */
function readValue(text) {
  const t = text.replace(/\$/g, "").trim();
  const f = /^(-?)\\d?frac\{(-?\d+)\}\{(-?\d+)\}$/.exec(t.replace(/\\frac/g, "\\frac"));
  const fr = /^(-?)\\frac\{(-?\d+)\}\{(-?\d+)\}$/.exec(t);
  if (fr) return (fr[1] === "-" ? -1 : 1) * (Number(fr[2]) / Number(fr[3]));
  if (f) return (f[1] === "-" ? -1 : 1) * (Number(f[2]) / Number(f[3]));
  return Number(t);
}

/**
 * Is `v` one of the route values, as a learner would write it? A stem that instructs an accuracy
 * makes the written answer the rounded one, so a rounding of a route value counts as that route.
 */
const shownAs = (x) => [x, Math.round(x * 1000) / 1000, Math.round(x * 100) / 100, Math.round(x * 10) / 10];
const matchesRoute = (v) => [...allRouteValues].some((x) => shownAs(x).some((r) => near(r, v)));

let checked = 0;
const findings = [];

for (const slug of SLUGS) {
  const file = path.join(ROOT, "packs/further-maths/content/fm1", slug, "bundle.json");
  if (!fs.existsSync(file)) {
    console.log(`(skipping ${slug}: not written yet)`);
    continue;
  }
  const b = JSON.parse(fs.readFileSync(file, "utf8"));

  // numeric commonErrors must each be a value one of the routes above produces
  for (const q of b.questions) {
    for (const p of q.parts) {
      for (const [i, e] of (p.commonErrors ?? []).entries()) {
        if (e.pattern.kind !== "numeric") continue;
        checked++;
        if (!matchesRoute(e.pattern.value)) {
          findings.push(`${slug} ${q.id}(${p.id}) commonError ${i + 1} (${e.misconception}) value ${e.pattern.value} is reached by no route`);
        }
        if (p.answer.kind === "numeric" && near(p.answer.value, e.pattern.value)) {
          findings.push(`${slug} ${q.id}(${p.id}) commonError ${i + 1} equals the part's own answer`);
        }
      }
      // the printed answer must survive an independent recomputation where one is possible
      if (p.answer.kind === "numeric") {
        const m = /\\log_\{(\d+)\}\s*(\d+(?:\.\d+)?)(?![.\d])/.exec(p.stem);
        if (m) {
          checked++;
          const want = Math.log(Number(m[2])) / Math.log(Number(m[1]));
          if (!near(want, p.answer.value)) findings.push(`${slug} ${q.id}(${p.id}) answer ${p.answer.value} is not log base ${m[1]} of ${m[2]} (= ${want})`);
        }
      }
    }
  }

  // every distractor of every diagnostic must also be a route value or the right answer
  for (const set of b.diagnostics) {
    for (const item of set.items) {
      for (const o of item.options) {
        if (!o.misconception) continue;
        checked++;
        const v = readValue(String(o.text));
        if (Number.isFinite(v) && !matchesRoute(v)) {
          findings.push(`${slug} ${set.id}/${item.id} distractor "${o.text}" (${o.misconception}) is reached by no route`);
        }
      }
    }
  }
}

console.log(`verify-published: ${checked} route checks`);
if (findings.length === 0) console.log("no findings");
else {
  for (const f of findings) console.log("FINDING", f);
  process.exitCode = 1;
}
