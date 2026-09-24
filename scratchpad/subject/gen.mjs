#!/usr/bin/env node
/**
 * Verifier for every formula rearrangement used in
 * packs/maths/content/m7/changing-the-subject-harder-formulae/.
 *
 * For each item: pick random values for the free variables, work the SUBJECT out from the
 * claimed rearrangement, substitute every value back into the ORIGINAL formula and check
 * that the two sides agree. That is the same check the lesson teaches the learner to do.
 *
 * Run: node scratchpad/subject/gen.mjs
 */

const PI = Math.PI;
const N = 40;
const TOL = 1e-9;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const close = (a, b) => Math.abs(a - b) <= 1e-7 * (1 + Math.abs(a) + Math.abs(b));

/**
 * @param {string} id
 * @param {string} formula   printed form, for the report
 * @param {string} subject   the letter being made the subject
 * @param {string} rearranged  the claimed answer, for the report
 * @param {Record<string,[number,number]>} free  ranges for the free variables
 * @param {(v: Record<string, number>) => number} solve  subject from the free variables
 * @param {(v: Record<string, number>) => number} lhs
 * @param {(v: Record<string, number>) => number} rhs
 */
function item(id, formula, subject, rearranged, free, solve, lhs, rhs) {
  return { id, formula, subject, rearranged, free, solve, lhs, rhs };
}

const items = [
  // ---- worked examples ----
  item("we.01", "V = (1/3)·pi·r^2·h", "r", "r = sqrt(3V / (pi·h))",
    { V: [1, 60], h: [0.5, 20] },
    ({ V, h }) => Math.sqrt((3 * V) / (PI * h)),
    ({ V }) => V, ({ r, h }) => (1 / 3) * PI * r * r * h),
  item("we.01.twin", "E = (1/2)·m·v^2", "v", "v = sqrt(2E / m)",
    { E: [1, 400], m: [0.4, 30] },
    ({ E, m }) => Math.sqrt((2 * E) / m),
    ({ E }) => E, ({ m, v }) => 0.5 * m * v * v),
  item("we.02", "8x - 3w = wx + 12", "x", "x = (12 + 3w) / (8 - w)",
    { w: [-9, 6] },
    ({ w }) => (12 + 3 * w) / (8 - w),
    ({ x, w }) => 8 * x - 3 * w, ({ x, w }) => w * x + 12),
  item("we.02.twin", "5y + 2c = cy + 14", "y", "y = (14 - 2c) / (5 - c)",
    { c: [-8, 4] },
    ({ c }) => (14 - 2 * c) / (5 - c),
    ({ y, c }) => 5 * y + 2 * c, ({ y, c }) => c * y + 14),
  item("we.03", "k = 2n / (n + 5)", "n", "n = 5k / (2 - k)",
    { k: [-4, 1.7] },
    ({ k }) => (5 * k) / (2 - k),
    ({ k }) => k, ({ n }) => (2 * n) / (n + 5)),
  item("we.03.twin", "g = 3t / (t - 4)", "t", "t = 4g / (g - 3)",
    { g: [3.4, 14] },
    ({ g }) => (4 * g) / (g - 3),
    ({ g }) => g, ({ t }) => (3 * t) / (t - 4)),
  item("we.04", "T = 3x^2 / (x^2 + 4)", "x", "x = 2·sqrt(T / (3 - T))  (positive x)",
    { T: [0.05, 2.7] },
    ({ T }) => 2 * Math.sqrt(T / (3 - T)),
    ({ T }) => T, ({ x }) => (3 * x * x) / (x * x + 4)),
  item("we.04.twin", "W = 5y^2 / (y^2 - 2)", "y", "y = sqrt(2W / (W - 5))  (positive y)",
    { W: [5.4, 40] },
    ({ W }) => Math.sqrt((2 * W) / (W - 5)),
    ({ W }) => W, ({ y }) => (5 * y * y) / (y * y - 2)),

  // ---- practice ladder ----
  item("q.0001", "y = 5x - 8", "x", "x = (y + 8) / 5",
    { y: [-30, 30] }, ({ y }) => (y + 8) / 5,
    ({ y }) => y, ({ x }) => 5 * x - 8),
  item("q.0002", "y = x/3 + 4", "x", "x = 3(y - 4)",
    { y: [-20, 20] }, ({ y }) => 3 * (y - 4),
    ({ y }) => y, ({ x }) => x / 3 + 4),
  item("q.0003", "y = (x - 6)/7", "x", "x = 7y + 6",
    { y: [-10, 10] }, ({ y }) => 7 * y + 6,
    ({ y }) => y, ({ x }) => (x - 6) / 7),
  item("q.0004", "y = x^2 + 11  (x > 0)", "x", "x = sqrt(y - 11)",
    { y: [11.2, 90] }, ({ y }) => Math.sqrt(y - 11),
    ({ y }) => y, ({ x }) => x * x + 11),
  item("q.0005", "A = pi·r^2", "r", "r = sqrt(A / pi)",
    { A: [0.5, 200] }, ({ A }) => Math.sqrt(A / PI),
    ({ A }) => A, ({ r }) => PI * r * r),
  item("q.0006", "y = sqrt(2x - 1)", "x", "x = (y^2 + 1) / 2",
    { y: [0.1, 12] }, ({ y }) => (y * y + 1) / 2,
    ({ y }) => y, ({ x }) => Math.sqrt(2 * x - 1)),
  item("q.0007", "c^2 = a^2 + b^2  (b > 0)", "b", "b = sqrt(c^2 - a^2)",
    { a: [1, 9], c: [10, 20] }, ({ a, c }) => Math.sqrt(c * c - a * a),
    ({ c }) => c * c, ({ a, b }) => a * a + b * b),
  item("q.0008", "6x = 2x + w", "x", "x = w / 4",
    { w: [-40, 40] }, ({ w }) => w / 4,
    ({ x }) => 6 * x, ({ x, w }) => 2 * x + w),
  item("q.0009", "9x - c = cx + 4", "x", "x = (4 + c) / (9 - c)",
    { c: [-10, 7] }, ({ c }) => (4 + c) / (9 - c),
    ({ x, c }) => 9 * x - c, ({ x, c }) => c * x + 4),
  item("q.0010", "ax + 3 = 5x - b", "x", "x = (b + 3) / (5 - a)",
    { a: [-8, 3.5], b: [-12, 12] }, ({ a, b }) => (b + 3) / (5 - a),
    ({ a, x }) => a * x + 3, ({ x, b }) => 5 * x - b),
  item("q.0011", "y = 4 / (x + 2)", "x", "x = (4 - 2y) / y",
    { y: [0.2, 9] }, ({ y }) => (4 - 2 * y) / y,
    ({ y }) => y, ({ x }) => 4 / (x + 2)),
  item("q.0012", "g = (h + 3) / (h - 1)", "h", "h = (g + 3) / (g - 1)",
    { g: [1.6, 12] }, ({ g }) => (g + 3) / (g - 1),
    ({ g }) => g, ({ h }) => (h + 3) / (h - 1)),
  item("q.0013", "P = 100(s - c) / c", "s", "s = c(P + 100) / 100",
    { P: [-40, 150], c: [2, 80] }, ({ P, c }) => (c * (P + 100)) / 100,
    ({ P }) => P, ({ s, c }) => (100 * (s - c)) / c),

  // ---- exam-style ----
  item("q.0014", "4a + 9b = ab", "a", "a = 9b / (b - 4)",
    { b: [5, 20] }, ({ b }) => (9 * b) / (b - 4),
    ({ a, b }) => 4 * a + 9 * b, ({ a, b }) => a * b),
  item("q.0015", "S = 2·pi·r^2 + 2·pi·r·h", "h", "h = (S - 2·pi·r^2) / (2·pi·r)",
    { S: [200, 900], r: [1, 5] }, ({ S, r }) => (S - 2 * PI * r * r) / (2 * PI * r),
    ({ S }) => S, ({ r, h }) => 2 * PI * r * r + 2 * PI * r * h),
  item("q.0016", "T = 2·pi·sqrt(L / g)", "L", "L = g·T^2 / (4·pi^2)",
    { T: [0.4, 8], g: [4, 15] }, ({ T, g }) => (g * T * T) / (4 * PI * PI),
    ({ T }) => T, ({ L, g }) => 2 * PI * Math.sqrt(L / g)),
  item("q.0017", "y = 5x^2 / (x^2 - 3)", "x", "x^2 = 3y / (y - 5), x = sqrt(3y/(y-5))",
    { y: [5.4, 30] }, ({ y }) => Math.sqrt((3 * y) / (y - 5)),
    ({ y }) => y, ({ x }) => (5 * x * x) / (x * x - 3)),

  // ---- find-the-mistake corrections ----
  item("ftm.01", "6x = wx + 15", "x", "x = 15 / (6 - w)",
    { w: [-10, 4] }, ({ w }) => 15 / (6 - w),
    ({ x }) => 6 * x, ({ x, w }) => w * x + 15),
  item("ftm.02", "B = A·r^2 + 5  (r > 0)", "r", "r = sqrt((B - 5) / A)",
    { A: [0.5, 9], B: [6, 90] }, ({ A, B }) => Math.sqrt((B - 5) / A),
    ({ B }) => B, ({ A, r }) => A * r * r + 5),
  item("ftm.03", "p - 5n = q", "n", "n = (p - q) / 5",
    { p: [-20, 20], q: [-20, 20] }, ({ p, q }) => (p - q) / 5,
    ({ p, n }) => p - 5 * n, ({ q }) => q),

  // ---- diagnostics / gates ----
  item("dx.02", "a = b^2 - c  (b can be either sign)", "b", "b = ±sqrt(a + c), positive branch",
    { a: [1, 50], c: [1, 20] }, ({ a, c }) => Math.sqrt(a + c),
    ({ a }) => a, ({ b, c }) => b * b - c),
  item("dx.03", "m = sqrt(n + 7)", "n", "n = m^2 - 7",
    { m: [0.2, 10] }, ({ m }) => m * m - 7,
    ({ m }) => m, ({ n }) => Math.sqrt(n + 7)),
  item("dx.04", "5t = ht + 9", "t", "t = 9 / (5 - h)",
    { h: [-8, 3] }, ({ h }) => 9 / (5 - h),
    ({ t }) => 5 * t, ({ t, h }) => h * t + 9),
  item("dx.07", "y = (3w + 1) / 5", "w", "w = (5y - 1) / 3",
    { y: [-8, 8] }, ({ y }) => (5 * y - 1) / 3,
    ({ y }) => y, ({ w }) => (3 * w + 1) / 5),
  item("gate.g4", "F = 9C/5 + 32", "C", "C = 5(F - 32) / 9",
    { F: [-40, 212] }, ({ F }) => (5 * (F - 32)) / 9,
    ({ F }) => F, ({ C }) => (9 * C) / 5 + 32),
  // the flow diagram drawn in the note: x -> x3 -> +5 -> root -> y, and the inverse chain back
  item("fig.flow", "y = sqrt(3x + 5)", "x", "x = (y^2 - 5) / 3",
    { y: [0.2, 12] }, ({ y }) => (y * y - 5) / 3,
    ({ y }) => y, ({ x }) => Math.sqrt(3 * x + 5)),
  // the balance-scale figure in the note
  item("fig.balance", "3x + 4 = 19", "x", "x = 5",
    {}, () => 5,
    ({ x }) => 3 * x + 4, () => 19),
];

let failures = 0;
console.log("SUBSTITUTION CHECK — subject worked out from the rearrangement, put back in the original\n");
for (const it of items) {
  const rnd = rng(it.id.split("").reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7));
  let tested = 0;
  let worst = 0;
  let firstBad = null;
  for (let k = 0; k < 400 && tested < N; k++) {
    const v = {};
    for (const [name, [lo, hi]] of Object.entries(it.free)) v[name] = lo + (hi - lo) * rnd();
    const s = it.solve(v);
    if (!Number.isFinite(s)) continue;
    v[it.subject] = s;
    const L = it.lhs(v);
    const R = it.rhs(v);
    if (!Number.isFinite(L) || !Number.isFinite(R)) continue;
    tested++;
    const err = Math.abs(L - R) / (1 + Math.abs(L) + Math.abs(R));
    worst = Math.max(worst, err);
    if (!close(L, R) && firstBad === null) firstBad = { v, L, R };
  }
  const ok = tested >= 20 && firstBad === null && worst < 1e-7;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${it.id.padEnd(12)} ${it.formula.padEnd(34)} make ${it.subject}:  ${it.rearranged}`,
  );
  console.log(`        ${tested} substitutions, worst relative gap ${worst.toExponential(2)}`);
  if (firstBad) console.log(`        counter-example ${JSON.stringify(firstBad)}`);
}

// ---------------------------------------------------------------------------
// Numeric answers quoted in the questions, recomputed here
// ---------------------------------------------------------------------------
const round = (x, dp) => Number(x.toFixed(dp));
const sf = (x, n) => Number(x.toPrecision(n));

const nums = [
  ["q.0015(b)  S = 340, r = 4  ->  h = (340 - 32pi)/(8pi)", (340 - 32 * PI) / (8 * PI)],
  ["q.0015(b)  to 1 dp", round((340 - 32 * PI) / (8 * PI), 1)],
  ["q.0016(b)  T = 3, g = 10  ->  L = 90/(4pi^2)", 90 / (4 * PI * PI)],
  ["q.0016(b)  to 2 dp", round(90 / (4 * PI * PI), 2)],
  ["q.0016(b)  distractor: g T /(4pi^2) with T not squared", (10 * 3) / (4 * PI * PI)],
  ["q.0008  6x = 2x + w, w = 20 -> x", 20 / 4],
  ["q.0017(b)  y = 8  ->  x^2 = 24/3", 24 / 3],
  ["q.0017(b)  x = sqrt(8)", Math.sqrt(8)],
  ["q.0017(b)  to 3 sf", sf(Math.sqrt(8), 3)],
  ["q.0005 check  A = 50 -> r", Math.sqrt(50 / PI)],
  ["q.0005 check  to 2 dp", round(Math.sqrt(50 / PI), 2)],
  ["q.0007 check  a = 8, c = 17 -> b", Math.sqrt(17 * 17 - 8 * 8)],
  ["we.01 check   V = 96pi, h = 8 -> r", Math.sqrt((3 * 96 * PI) / (PI * 8))],
  ["we.01 substitution check: (1/3)pi(6^2)(8)/pi", ((1 / 3) * PI * 36 * 8) / PI],
  ["we.03 check   k = 1.5 -> n = 5(1.5)/(2-1.5)", (5 * 1.5) / (2 - 1.5)],
  ["we.03 back    2(15)/(15+5)", (2 * 15) / (15 + 5)],
  ["we.04 check   T = 2 -> x = 2 sqrt(2/(3-2))", 2 * Math.sqrt(2 / (3 - 2))],
  ["we.04 back    3(8)/(8+4)", (3 * 8) / (8 + 4)],
  ["we.02 check   w = 2 -> x = (12+6)/(8-2)", (12 + 3 * 2) / (8 - 2)],
  ["we.02 back    8(3) - 3(2)  vs  2(3) + 12", 8 * 3 - 3 * 2, 2 * 3 + 12],
  ["q.0013 check  P = 25, c = 40 -> s", (40 * (25 + 100)) / 100],
  ["q.0013 back   100(50-40)/40", (100 * (50 - 40)) / 40],
  ["q.0009 check  c = 1 -> x = 5/8", (4 + 1) / (9 - 1)],
  ["q.0012 check  g = 5 -> h = 8/4", (5 + 3) / (5 - 1)],
  ["q.0012 back   (2+3)/(2-1)", (2 + 3) / (2 - 1)],
  ["q.0014 check  b = 6 -> a = 54/2", (9 * 6) / (6 - 4)],
  ["q.0014 back   4(27) + 9(6)  vs  27 x 6", 4 * 27 + 9 * 6, 27 * 6],
  ["gate g4  F = 68 -> C", (5 * (68 - 32)) / 9],
  ["dx.04 check   h = 2 -> t = 9/3", 9 / (5 - 2)],
  ["ftm.01 check  w = 1 -> x = 15/5", 15 / (6 - 1)],
  ["ftm.02 check  A = 4, B = 21 -> r", Math.sqrt((21 - 5) / 4)],
  ["ftm.03 check  p = 17, q = 2 -> n", (17 - 2) / 5],
  ["q.0011 check  y = 0.5 -> x = (4-1)/0.5", (4 - 2 * 0.5) / 0.5],
  ["q.0011 back   4/(6+2)", 4 / (6 + 2)],
  ["q.0010 check  a = 2, b = 7 -> x = 10/3", (7 + 3) / (5 - 2)],
  ["q.0006 check  y = 5 -> x = 26/2", (25 + 1) / 2],
  ["q.0006 back   sqrt(2(13)-1)", Math.sqrt(2 * 13 - 1)],
];
console.log("\nNUMERIC VALUES USED IN THE ITEMS\n");
for (const [label, ...vals] of nums) console.log(`  ${label.padEnd(52)} = ${vals.map((v) => (typeof v === "number" ? v : v)).join("   |   ")}`);

console.log(`\n${items.length} rearrangements checked, ${failures} failure(s).`);
process.exitCode = failures ? 1 : 0;
