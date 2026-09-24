/**
 * For every numeric commonError in the nine M3 NA bundles, the error its feedback
 * describes, written as executable code and run from the stem numbers.
 *
 * key = "<slug>|<question number>|<part id>|<index in commonErrors>"
 * each entry: { desc, value }  — `value` null means "no natural route reaches any value".
 *
 * Nothing here is a transcribed answer: every number is produced by running the route.
 */

// ---------------------------------------------------------------- helpers
export const hcf = (a, b) => (b === 0 ? a : hcf(b, a % b));
export const lcm = (a, b) => (a * b) / hcf(a, b);
const r10 = (v) => Number(v.toFixed(10));

/** Solve a linear equation given as f(x) = 0, with f linear. */
export function solveLinear(f) {
  const f0 = f(0), f1 = f(1);
  return r10(-f0 / (f1 - f0));
}
/** Real roots of ax^2 + bx + c = 0, ascending. */
export function roots(a, b, c) {
  const d = b * b - 4 * a * c;
  if (d < 0) return [];
  const s = Math.sqrt(d);
  return [(-b - s) / (2 * a), (-b + s) / (2 * a)].map(r10).sort((p, q) => p - q);
}
export const posRoot = (a, b, c) => roots(a, b, c).filter((x) => x > 0).pop();
export const negRoot = (a, b, c) => roots(a, b, c).find((x) => x < 0);
export const bigRoot = (a, b, c) => roots(a, b, c).pop();
/** Round to n decimal places, the way a candidate would. */
export const dp = (v, n) => r10(Math.round(v * 10 ** n) / 10 ** n);
/** Round to n significant figures. */
export const sf = (v, n) => {
  if (v === 0) return 0;
  const e = Math.ceil(Math.log10(Math.abs(v)));
  return r10(Math.round(v * 10 ** (n - e)) / 10 ** (n - e));
};

const R = (desc, value) => ({ desc, value: value === null ? null : r10(value) });

// ---------------------------------------------------------------- routes
export const ROUTES = {};
const add = (slug, entries) => {
  for (const [k, v] of Object.entries(entries)) ROUTES[`${slug}|${k}`] = v;
};

// ============================================ 1. HCF and LCM
add("hcf-and-lcm-from-prime-factor-form", {
  "0001|main|0": R("gives the LCM of 45 and 60 where the HCF was asked", lcm(45, 60)),
  "0002|main|0": R("multiplies the two numbers instead of taking the LCM", 45 * 60),
  "0003|a|0": R("takes the HIGHER power of each shared prime, which builds the LCM of 84 and 126", lcm(84, 126)),
  "0003|b|0": R("repeats part (a): the HCF of 84 and 126 where the LCM was asked", hcf(84, 126)),
  "0004|a|0": R("higher power each time: the LCM of A = 5500 and B = 9680", lcm(5500, 9680)),
  "0004|b|0": R("adds the indices, i.e. multiplies A by B", 5500 * 9680),
  "0005|b|0": R("offers the smaller number itself as the HCF of 360 and 84", Math.min(360, 84)),
  "0006|a|0": R("higher powers: the LCM of 96 and 108 where the HCF was asked", lcm(96, 108)),
  "0006|b|0": R("multiplies 96 by 108 instead of taking the LCM", 96 * 108),
  "0007|main|0": R("stops at the LCM of 18 and 24 in seconds, without converting to minutes and seconds", lcm(18, 24)),
  "0007|main|1": R("gives the HCF of 18 and 24 where a common multiple was needed", hcf(18, 24)),
  "0008|a|0": R("gives the LCM of 126 and 198 where the HCF was asked", lcm(126, 198)),
  "0008|b|0": R("counts only the pieces from the first ribbon: 126 divided by the HCF", 126 / hcf(126, 198)),
  "0009|a|0": R("higher powers: the LCM of P = 120 and Q = 450 where the HCF was asked", lcm(120, 450)),
  "0009|b|0": R("agrees with Rory and gives P times Q", 120 * 450),
  "0010|main|0": R("stops at the LCM of 24 and 18, the number of badges rather than packs", lcm(24, 18)),
  "0010|main|1": R("counts packs of lanyards instead of badges: LCM divided by 18", lcm(24, 18) / 18),
  "0010|main|2": R("gives the HCF of 24 and 18 where a common multiple was needed", hcf(24, 18)),
  "0011|b|0": R("gives the LCM of 550 and 396 where the HCF was asked", lcm(550, 396)),
  "0011|c|0": R("multiplies 550 by 396 instead of taking the LCM", 550 * 396),
});

// ============================================ 2. Bounds
add("upper-and-lower-bounds-addition-and-multiplication", {
  "0001|a|0": R("subtracts a whole 0.1 instead of half of it", 6.4 - 0.1),
  "0001|b|0": R("adds a whole 0.1 instead of half of it", 6.4 + 0.1),
  "0002|a|0": R("uses the half unit for the nearest metre instead of the nearest 10 m", 80 - 0.5),
  "0002|b|0": R("adds the whole 5 kg instead of half of it", 30 + 5),
  "0002|c|0": R("adds a whole 0.01 instead of half of it", 3.27 + 0.01),
  "0003|a|0": R("adds the three measured masses, then adds one half unit to the total", 2.4 + 3.7 + 1.9 + 0.05),
  "0003|b|0": R("gives the total of the measured values", 2.4 + 3.7 + 1.9),
  "0004|a|0": R("multiplies the measured side lengths", 8 * 5),
  "0004|b|0": R("mixes an upper bound with a lower bound", 8.5 * 4.5),
  "0005|a|0": R("adds a whole 5 kg to each crate: 8 times 50", 8 * 50),
  "0005|b|0": R("uses the recorded mass: 8 times 45", 8 * 45),
  "0006|a|0": R("bounds correctly, then rounds the bound to 3 significant figures", sf(5.65 * 3.45, 3)),
  "0006|a|1": R("multiplies the measured values, then adds one half unit", 5.6 * 3.4 + 0.05),
  "0006|b|0": R("finds the perimeter from the measured values, then adds one half unit", 2 * (5.6 + 3.4) + 0.05),
  "0007|main|0": R("substitutes the recorded density and volume", 2.7 * 45),
  "0007|main|1": R("bounds the density but leaves the volume as measured", 2.75 * 45),
  "0008|a|0": R("bounds correctly, then rounds the volume to the nearest whole number", Math.round(4.25 * 2.55 * 1.85)),
  "0008|b|0": R("mixes bounds: upper, lower, upper", 4.25 * 2.45 * 1.85),
  "0009|a|0": R("adds a whole 5 cm to each side: 90 by 45", 90 * 45),
  "0010|main|0": R("leaves the halving out of the trapezium formula", (7.25 + 11.65) * 5.05),
  "0010|main|1": R("substitutes the recorded measurements into the formula", 0.5 * (7.2 + 11.6) * 5.0),
  "0010|main|2": R("bounds correctly, then rounds the bound to 1 decimal place", dp(0.5 * (7.25 + 11.65) * 5.05, 1)),
});

// ============================================ 3. Identities and double brackets
add("identities-and-expanding-double-brackets", {
  "0005|b|0": R("adds the 6 instead of subtracting it: 4x = 26 + 6", solveLinear((x) => 4 * x - (26 + 6))),
  "0010|main|0": R("reads the 7 from 7x straight off as a", 7),
  "0010|main|1": R("copies the 3 from the other bracket as a", 3),
});

// ============================================ 4. Difference of two squares
add("difference-of-two-squares", {
  "0008|a|0": R("squares the difference instead of using the identity", (83 - 17) ** 2),
  "0008|b|0": R("squares the difference instead of using the identity", (45 - 35) ** 2),
  "0012|main|0": R("takes the remaining shape as a square of side x - 3, with x = 10", (10 - 3) ** 2),
  "0014|b|0": R("squares the difference instead of using the identity", (57 - 43) ** 2),
});

// ============================================ 5. Algebraic fractions, numerical denominators
add("algebraic-fractions-with-numerical-denominators", {
  "0006|main|0": R("leaves the right-hand side as 7: solves 5x - 2 = 7",
    solveLinear((x) => 5 * x - 2 - 7)),
  "0007|main|0": R("does not multiply the 5 by 6: solves 3(x + 4) + 2(x - 1) = 5",
    solveLinear((x) => 3 * (x + 4) + 2 * (x - 1) - 5)),
  "0007|main|1": R("works in rounded decimals: solves 0.5(x + 4) + 0.33(x - 1) = 5 and rounds to 2 d.p.",
    dp(solveLinear((x) => 0.5 * (x + 4) + 0.33 * (x - 1) - 5), 2)),
  "0008|main|0": R("expands -2(x - 5) as -2x - 10: solves 9x - 3 - 2x - 10 = 84",
    solveLinear((x) => 9 * x - 3 - 2 * x - 10 - 84)),
  "0009|main|0": R("crosses both denominators out: solves x + 9 = 2x + 3",
    solveLinear((x) => x + 9 - (2 * x + 3))),
  "0010|main|0": R("expands -5(x - 4) as -5x - 20: solves 4x + 12 - 5x - 20 = 10",
    solveLinear((x) => 4 * x + 12 - 5 * x - 20 - 10)),
  "0010|main|1": R("does not multiply the 1 by 10: solves 4(x + 3) - 5(x - 4) = 1",
    solveLinear((x) => 4 * (x + 3) - 5 * (x - 4) - 1)),
  "0011|main|0": R("works in rounded decimals: solves 0.17(2x + 5) + 0.33(3x - 1) = 4.5 and rounds to 2 d.p.",
    dp(solveLinear((x) => 0.17 * (2 * x + 5) + 0.33 * (3 * x - 1) - 4.5), 2)),
  "0012|main|0": R("does not multiply the 75 by 12: solves 5x = 75",
    solveLinear((x) => 5 * x - 75)),
  "0012|main|1": R("adds the denominators: solves 2x/10 = 75",
    solveLinear((x) => (2 * x) / 10 - 75)),
  "0013|main|0": R("mis-reads the wording: solves n/2 + 5 + n/3 - 1 = 8",
    solveLinear((n) => n / 2 + 5 + n / 3 - 1 - 8)),
  "0015|main|0": R("expands -5(x - 2) as -5x - 10: solves 8x + 6 - 5x - 10 = 40",
    solveLinear((x) => 8 * x + 6 - 5 * x - 10 - 40)),
  "0015|main|1": R("does not multiply the 4 by 10: solves 2(4x + 3) - 5(x - 2) = 4",
    solveLinear((x) => 2 * (4 * x + 3) - 5 * (x - 2) - 4)),
  "0016|b|0": R("rounds the exact answer 41/4 to 1 decimal place", dp(41 / 4, 1)),
  "0017|b|0": R("treats the 8 as already multiplied: solves 8n = 720 - 120 - 120",
    solveLinear((n) => 8 * n - (720 - 120 - 120))),
});

// ============================================ 7. Solving quadratics by factorising
add("solving-quadratic-equations-by-factorising", {
  "0001|main|0": R("copies the constant out of (x + 4) without solving the bracket", 4),
  "0002|a|0": R("gives only the larger root of x^2 - 10x + 21 = 0", bigRoot(1, -10, 21)),
  "0002|b|0": R("gives only the positive root of x^2 + 5x - 24 = 0", posRoot(1, 5, -24)),
  "0003|b|1": R("gives only the positive root of x^2 + 2x - 35 = 0", posRoot(1, 2, -35)),
  "0004|a|0": R("treats x^2 + 3x = 40 as linear and writes x = 40 - 3", 40 - 3),
  "0004|b|0": R("gives only the positive root of x^2 + 4x - 12 = 0", posRoot(1, 4, -12)),
  "0005|a|0": R("divides by x, keeping only the non-zero root of x^2 = 9x", 9),
  "0005|b|0": R("takes only the positive square root in 2x^2 - 18 = 0", posRoot(2, 0, -18)),
  "0006|b|0": R("copies the constant out of (y - 6) without solving the bracket", -6),
  "0007|main|0": R("gives the negative root of x^2 + 3x - 40 = 0, which the context forbids", negRoot(1, 3, -40)),
  "0007|main|1": R("uses the perimeter instead of the area: solves 2x + 2(x + 3) = 40",
    solveLinear((x) => 2 * x + 2 * (x + 3) - 40)),
  "0008|main|0": R("treats the two consecutive numbers as equal: 156 divided by 2", 156 / 2),
  "0009|main|0": R("gives x rather than the base x + 4, from x^2 + 3x - 40 = 0", posRoot(1, 3, -40)),
  "0009|main|1": R("leaves the halving out: solves (x + 4)(x - 1) = 18, i.e. x^2 + 3x - 22 = 0",
    dp(posRoot(1, 3, -22), 2)),
  "0010|main|0": R("gives only the positive root of x^2 - 6x - 27 = 0", posRoot(1, -6, -27)),
  "0011|b|0": R("gives only the larger root of x^2 - 31x + 168 = 0", bigRoot(1, -31, 168)),
  "0013|b|1": R("gives only the positive root of x^2 - 5x - 14 = 0", posRoot(1, -5, -14)),
  "0014|b|0": R("gives the negative root of x^2 + 9x - 22 = 0, which the context forbids", negRoot(1, 9, -22)),
  "0014|b|1": R("gives x rather than the length x + 7, from x^2 + 9x - 22 = 0", posRoot(1, 9, -22)),
  "0015|main|0": R("gives the framed width x + 2, with x the positive root of x^2 + 9x - 162 = 0",
    posRoot(1, 9, -162) + 2),
  "0015|main|1": R("gives the negative root of x^2 + 9x - 162 = 0, which the context forbids", negRoot(1, 9, -162)),
});

// ============================================ 9. Straight lines
add("straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines", {
  "0001|a|0": R("gives the y-intercept of y = 5x - 2 where the gradient was asked", -2),
  "0001|b|0": R("drops the minus sign from the gradient of y = 7 - 3x", 3),
  // 0001|c|0 and 0008|b|0 now carry text patterns (coordinate answers), so they need no numeric route.
  "0005|a|0": R("stops at c for gradient 2 through (4, -3): c = -3 - 2 x 4", -3 - 2 * 4),
  "0007|a|0": R("stops at the gradient of y = 4x - 1", 4),
  "0010|a|0": R("counts squares: 36 pounds is 1.8 squares up, over 3 squares across", (36 / 20) / 3),
  "0010|c|0": R("drops the fixed charge: 12 x 3 with no + 25", 12 * 3),
  "0013|main|2": R("stops at the gradient of the line through (-2, 9) and (3, -1)", (-1 - 9) / (3 - -2)),
  "0016|a|0": R("counts squares: 36 pounds is 1.8 squares up, over 3 squares across", (36 / 20) / 3),
  "0016|b|0": R("drops the fixed charge: 12 x 9 with no + 25", 12 * 9),
});
