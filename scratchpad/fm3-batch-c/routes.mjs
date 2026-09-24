/**
 * FM3 batch C: every context's numbers, every correct answer as an exact rational, and every
 * error route as the described mistake CARRIED OUT in code. `route(where, misconception, i)` is
 * the only way a distractor value enters a bundle, and verify-published.mjs re-runs `allRoutes()`
 * against the published JSON.
 *
 * A route is { where, misconception, describe, run } where `run()` returns the exact rational the
 * slip produces. `where` names a question part ("q.<topic>.0006#main"), a worked-example twin, or a
 * diagnostic option ("dx.<topic>.post#d2:b").
 */
import { bAdd, bSub, bMul, big } from "./lib.mjs";
import { Binom, Normal, ONE, ZERO, d4, roundTo, rat, phi, ROWS as ROWS_, expandTex, termTex } from "./stat.mjs";

/* ---- binomial-probabilities contexts ---------------------------------------------------------- */

export const BT = "fm.u3.binomial-probabilities";

/** Every binomial context, with the success named in the question's own words. */
export const BIN = {
  // the lesson's running example: free throws
  throws: { n: 4, p: "0.8", success: "scores", thing: "free throw" },
  // worked example 1 (exactly r, the stated probability is of the other outcome)
  bus: { n: 5, p: "0.15", success: "late", onTime: "0.85" },
  // its twin
  bulbs: { n: 6, p: "0.04", success: "faulty" },
  // worked example 2 (at least r by the complement)
  archer: { n: 6, p: "0.3", success: "hits the gold" },
  // its twin
  quiz: { n: 5, p: "0.25", success: "right" },
  // practice ladder
  serve: { n: 6, p: "0.65", r: 4 },
  recycle: { n: 7, p: "0.25", r: 2, recycles: "0.75" },
  level: { n: 3, p: "0.4" },
  parcels: { n: 5, p: "0.12" },
  mugs: { n: 8, p: "0.1", r: 2 },
  trains: { n: 6, p: "0.25", r: 2 },
  hotel: { n: 8, p: "0.7", r: 6 },
  dice: { n: 5, p: "1/6", r: 1 },
  // exam-style
  cafe: { n: 6, p: "0.48", exactly: 2, atLeast: 2 },
  fair: { n: 8, p: "0.4", exactly: 3, fewer: 2 },
  // find the mistake
  cards: { n: 6, p: "0.1" },
  sprint: { n: 4, p: "0.1", legal: "0.9" },
  // lesson gates and diagnostics
  kicks: { n: 5, p: "0.3" },
  raffle: { n: 5, p: "0.1" },
  loaves: { n: 7, p: "0.12", rises: "0.88" },
  // diagnostics
  minibus: { n: 5, p: "0.3", full: "0.7" },
  trio: { n: 3, p: "0.2" },
  games: { n: 3, p: "0.9" },
  // depth pass (23 Sep): the top practice rung, a points total that is really a count of 50s
  darts: { n: 3, p: "0.2", high: 50, low: 10, total: 100 },
};

export const M = {
  swap: "fm.binomial.p-q-swapped",
  coef: "fm.binomial.coefficient-omitted",
  atLeast: "fm.binomial.at-least-ignored",
  bracket: "fm.binomial.brackets-in-complement",
  rounding: "fm.binomial.early-rounding",
  wrongTerms: "fm.binomial.wrong-terms-selected",
  notNeeded: "fm.binomial.complement-not-needed",
  power: "fm.binomial.wrong-power",
};

export const model = (key) => {
  const c = BIN[key];
  return new Binom(c.n, c.p);
};

/** The same model with p and q exchanged: what a candidate who labels the wrong outcome works with. */
export const swapped = (key) => {
  const b = model(key);
  const s = new Binom(b.n, b.qStr);
  return s;
};

/** A term with the coefficient from Pascal's triangle left out. */
const noCoef = (b, r) => b.term(r, { coef: 1 });

/** 1 - P(0) + P(1) + … + P(r - 1): the bracket left off, so only P(0) is subtracted. */
const missingBracket = (b, r) => {
  let v = bSub(ONE, b.term(0));
  for (let k = 1; k < r; k += 1) v = bAdd(v, b.term(k));
  return v;
};

/** Each term rounded to `places` decimals before it is combined; the result is exact from there. */
const roundedTermsAtLeast = (b, r, places) => {
  let excluded = ZERO;
  for (let k = 0; k < r; k += 1) excluded = bAdd(excluded, roundTo(b.term(k), places));
  return bSub(ONE, excluded);
};
const roundedTermsSum = (b, from, to, places) => {
  let s = ZERO;
  for (let k = from; k <= to; k += 1) s = bAdd(s, roundTo(b.term(k), places));
  return s;
};

/** The value cut off (not rounded) after `places` decimals: 0.18689… becomes 0.1868. */
const truncate = (x, places) => {
  const scale = 10n ** BigInt(places);
  return big((x.n * scale) / x.d, scale);
};

const Q = (n, part = "main") => `q.${BT}.${n}#${part}`;

const ROUTES = [];
const add = (where, misconception, describe, run) => ROUTES.push({ where, misconception, describe, run });

/* practice 0002: exactly 4 serves in from 6, p = 0.65 */
add(Q("0002"), M.swap, "p and q exchanged: 15 x 0.35^4 x 0.65^2", () => swapped("serve").term(BIN.serve.r));
add(Q("0002"), M.coef, "the 15 from Pascal's triangle left out: 0.65^4 x 0.35^2", () => noCoef(model("serve"), BIN.serve.r));

/* practice 0003: exactly 2 of 7 households do not recycle; the stem gives P(recycles) = 0.75 */
add(Q("0003"), M.swap, "0.75 (the probability of recycling) used as p for 'does not recycle': 21 x 0.75^2 x 0.25^5", () => swapped("recycle").term(BIN.recycle.r));
add(Q("0003"), M.coef, "the 21 left out: 0.25^2 x 0.75^5", () => noCoef(model("recycle"), BIN.recycle.r));

/* practice 0004: (a) all three levels completed, (b) none completed, p = 0.4 */
add(Q("0004", "a"), M.notNeeded, "the right value subtracted from 1: 1 - 0.4^3", () => bSub(ONE, model("level").term(3)));
add(Q("0004", "b"), M.swap, "0.4 used where 0.6 belonged: 0.4^3", () => swapped("level").term(0));
add(Q("0004", "b"), M.notNeeded, "the right value subtracted from 1: 1 - 0.6^3", () => bSub(ONE, model("level").term(0)));

/* practice 0005: at least one of five parcels late, p = 0.12 */
add(Q("0005"), M.atLeast, "the complement worked out and not taken from 1: 0.88^5", () => model("parcels").term(0));
add(Q("0005"), M.wrongTerms, "'at least one' read as 'exactly one': 5 x 0.12 x 0.88^4", () => model("parcels").term(1));

/* practice 0006: at least 2 of 8 mugs faulty, p = 0.1 */
add(Q("0006"), M.bracket, "1 - P(0) + P(1): the bracket left off", () => missingBracket(model("mugs"), 2));
add(Q("0006"), M.atLeast, "P(0) + P(1) worked out and never taken from 1", () => model("mugs").sum(0, 1));
add(Q("0006"), M.rounding, "the final value cut off after four decimal places instead of rounded", () => truncate(model("mugs").atLeast(2), 4));

/* practice 0007: at most 2 of 6 trains delayed, p = 0.25 */
add(Q("0007"), M.wrongTerms, "'at most 2' stopped one term short: P(0) + P(1)", () => model("trains").sum(0, 1));
add(Q("0007"), M.notNeeded, "the complement taken as if the question said 'more than 2': 1 - (P(0) + P(1) + P(2))", () => bSub(ONE, model("trains").sum(0, 2)));

/* practice 0008: more than 6 of 8 guests have breakfast, p = 0.7 */
add(Q("0008"), M.wrongTerms, "'more than 6' read as '6 or more': P(6) + P(7) + P(8)", () => model("hotel").sum(6, 8));
add(Q("0008"), M.swap, "0.3 used as p: P(7) + P(8) with p and q exchanged", () => swapped("hotel").sum(7, 8));

/* practice 0009: exactly one six in five rolls, p = 1/6 */
add(Q("0009"), M.swap, "p and q exchanged: 5 x (5/6) x (1/6)^4", () => swapped("dice").term(1));
add(Q("0009"), M.coef, "the 5 left out: (1/6) x (5/6)^4", () => noCoef(model("dice"), 1));

/* exam-style 0010 (cafe, n = 6, p = 0.48) */
add(Q("0010", "c"), M.swap, "p and q exchanged: 15 x 0.52^2 x 0.48^4", () => swapped("cafe").term(BIN.cafe.exactly));
add(Q("0010", "c"), M.coef, "the 15 left out: 0.48^2 x 0.52^4", () => noCoef(model("cafe"), BIN.cafe.exactly));
add(Q("0010", "d"), M.bracket, "1 - P(0) + P(1): the bracket left off", () => missingBracket(model("cafe"), BIN.cafe.atLeast));
add(Q("0010", "d"), M.atLeast, "P(0) + P(1) worked out and never taken from 1", () => model("cafe").sum(0, BIN.cafe.atLeast - 1));
add(Q("0010", "d"), M.coef, "the 6 left out of P(1): 1 - (0.52^6 + 0.48 x 0.52^5)", () => bSub(ONE, bAdd(model("cafe").term(0), noCoef(model("cafe"), 1))));

/* exam-style 0011 (fair, n = 8, p = 0.4) */
add(Q("0011", "b"), M.swap, "0.6 used as p: 56 x 0.6^3 x 0.4^5", () => swapped("fair").term(BIN.fair.exactly));
add(Q("0011", "b"), M.coef, "the 56 left out: 0.4^3 x 0.6^5", () => noCoef(model("fair"), BIN.fair.exactly));
add(Q("0011", "c"), M.wrongTerms, "'fewer than 2' read as '2 or fewer': P(0) + P(1) + P(2)", () => model("fair").sum(0, 2));
add(Q("0011", "c"), M.notNeeded, "the answer taken from 1 as if 'at least 2' had been asked", () => bSub(ONE, model("fair").sum(0, 1)));
add(Q("0011", "d"), M.bracket, "1 - P(0) + P(1): the bracket left off", () => missingBracket(model("fair"), 2));
add(Q("0011", "d"), M.atLeast, "part (c)'s value copied as the answer, never taken from 1", () => model("fair").sum(0, 1));

/* practice 0001: loaves (p = 0.12 for 'splits', stated as 88% rise) */
add(Q("0001", "a"), M.swap, "the stated 0.88 (rises) given as p for 'splits'", () => rat(BIN.loaves.rises));
add(Q("0001", "b"), M.coef, "the 7 left out: 0.12 x 0.88^6", () => noCoef(model("loaves"), 1));
add(Q("0001", "b"), M.rounding, "the final value cut off after four decimal places instead of rounded", () => truncate(model("loaves").term(1), 4));

/* exam-style extras */
add(Q("0010", "c"), M.rounding, "the final value cut off after four decimal places instead of rounded", () => truncate(model("cafe").term(BIN.cafe.exactly), 4));
add(Q("0011", "a"), M.swap, "the probability of winning, 0.4, given where not winning was asked", () => rat(BIN.fair.p));
add(Q("0011", "b"), M.rounding, "the final value cut off after four decimal places instead of rounded", () => truncate(model("fair").term(BIN.fair.exactly), 4));

/* practice 0012 (depth pass): three darts, a 50 with p = 0.2 or else a 10; at least 100 points needs at least two 50s */
add(Q("0012"), M.wrongTerms, "only two 50s counted: the three-50s total of 150 left out, P(2) alone", () => model("darts").term(2));
add(Q("0012"), M.swap, "0.8, the chance of a 10, used as p for a 50: P(2) + P(3) with p and q exchanged", () => swapped("darts").sum(2, 3));
add(Q("0012"), M.coef, "the 3 left out of P(2): 0.2^2 x 0.8 + 0.2^3", () => bAdd(noCoef(model("darts"), 2), model("darts").term(3)));

/* the note's bracket examples (values printed in the lesson, not commonErrors) */
add("note#bracket", M.bracket, "Aoife's four throws: 1 - P(0) + P(1)", () => missingBracket(model("throws"), 2));
add("note#raffle", M.bracket, "five raffle tickets: 1 - P(0) + P(1)", () => missingBracket(model("raffle"), 2));

/* find-the-mistake working */
add("ftm1", M.bracket, "six scratch cards: 1 - P(0) + P(1)", () => missingBracket(model("cards"), 2));
add("ftm2", M.swap, "four starts: 4 x 0.9 x 0.1^3 with p and q exchanged", () => swapped("sprint").term(1));

/* diagnostic options: every distractor value is a route */
const DX = (item, option) => `dx.${BT}.post#${item}:${option}`;
add(DX("d4", "b"), M.bracket, "1 - P(0) + P(1) for 3 trials with p = 0.2", () => missingBracket(model("trio"), 2));
add(DX("d4", "c"), M.atLeast, "P(0) + P(1) given without taking it from 1", () => model("trio").sum(0, 1));
add(DX("d6", "b"), M.notNeeded, "1 - 0.9^3: the right value subtracted from 1", () => bSub(ONE, model("games").term(3)));
add(DX("d6", "c"), M.swap, "0.1^3: q used where p belonged", () => swapped("games").term(3));

/* worked-example twins carry no commonErrors; their values are the models' own terms */

/* ---- normal-distribution-z-probabilities contexts ---------------------------------------------- */

export const NT = "fm.u3.normal-distribution-z-probabilities";

/** Every normal context: mean, standard deviation and unit as the stem gives them. */
export const NORM = {
  // the lesson's running example
  trout: { mean: 34, sd: 5, unit: "cm" },
  // worked example 1 (right tail, positive z) and its twin
  chocolate: { mean: 102, sd: 1.6, unit: "g", x: 104.32 },
  cyclists: { mean: 24, sd: 4, unit: "minutes", x: 25.4 },
  // worked example 2 (left tail, negative z) and its twin
  washers: { mean: 12, sd: 0.05, unit: "mm", x: 11.885 },
  sand: { mean: 25.4, sd: 0.6, unit: "kg", x: 24.47 },
  // practice
  commute: { mean: 38, sd: 6, unit: "minutes", x: 44.3 },
  carrots: { mean: 1020, sd: 12, unit: "g", x: 1045.2 },
  deer: { mean: 118, sd: 8, unit: "cm", x: 108.8 },
  led: { mean: 25000, sd: 1500, unit: "hours", x: 23725 },
  bread: { mean: 800, sd: 20, unit: "g", x: 832.4 },
  desk: { mean: 98, sd: 10, unit: "minutes", x: 120 },
  french: { mean: 63, sd: 5, x: 71 },
  history: { mean: 65, sd: 6, x: 74 },
  parcel: { mean: 1.85, sd: 0.2, unit: "kg", x: 2.12 },
  // exam-style
  cans: { mean: 332, sd: 1.5, unit: "ml", xa: 334.475, xb: 330.65 },
  parkrun: { mean: 31.5, sd: 4.5, unit: "minutes", xa: 28.35, xc: 22.95 },
  // find the mistake
  lambs: { mean: 4.6, sd: 0.8, unit: "kg", x: 3.76 },
  pencils: { mean: 17.5, sd: 0.4, unit: "cm", x: 16.82 },
  // depth pass (23 Sep): the 'given that' chain, xa above the mean (z = 1.7), xb below it (z = -1.3)
  cucumbers: { mean: 32, sd: 2.5, unit: "cm", xa: 36.25, xb: 28.75 },
};

/** The conditional-probability ids the 'given that' part draws on (registered by the FM3 B author). */
export const MC = {
  subset: "fm.condprob.subset-event-multiplied",
  independent: "fm.prob.independence-assumed",
};

export const MN = {
  notSubtracted: "fm.normal.tail-not-subtracted",
  negative: "fm.normal.negative-z",
  wrongTail: "fm.normal.wrong-tail-subtracted",
  zFormula: "fm.normal.z-formula-unknown",
  zRounded: "fm.normal.z-rounded-before-table",
  sdFormula: "fm.normal.sd-formula-used-instead",
};

export const nmodel = (key) => new Normal(NORM[key].mean, NORM[key].sd);

/** Phi(|z|) from the table, as an exact rational of the four printed decimals. */
const table = (z) => new Normal(0, 1).table(z).r;
/** The probability for a tail at a given z, read the table's way (1 - Phi when the shading needs it). */
const tailAt = (z, tail) => {
  const t = table(z);
  if (tail === "below") return z >= 0 ? t : bSub(ONE, t);
  return z >= 0 ? bSub(ONE, t) : t;
};
const round2 = (v) => Math.round(v * 100) / 100;
const round1 = (v) => Math.round(v * 10) / 10;

/** The table value itself, where the shading needed 1 minus it (or the reverse). */
const tableOnly = (key, x) => table(nmodel(key).z(x));
const oneMinusTable = (key, x) => bSub(ONE, table(nmodel(key).z(x)));
/** z formed with the mean and the standard deviation exchanged, rounded to 2 d.p. for the table. */
const swappedZ = (key, x, tail) => {
  const { mean, sd } = NORM[key];
  return tailAt(round2((x - sd) / mean), tail);
};
/** z formed by dividing by the variance instead of the standard deviation. */
const varianceZ = (key, x, tail) => {
  const { mean, sd } = NORM[key];
  return tailAt(round2((x - mean) / (sd * sd)), tail);
};
/** z rounded to 1 d.p. before the table is read. */
const roundedZ = (key, x, tail) => tailAt(round1(nmodel(key).z(x)), tail);

const NQ = (n, part = "main") => `q.${NT}.${n}#${part}`;
const NR = [];
const nadd = (where, misconception, describe, run) => NR.push({ where, misconception, describe, run, slug: "normal-distribution-z-probabilities" });

/* 0001: P(Z > 1.84) read from the extract */
nadd(NQ("0001", "b"), MN.notSubtracted, "the table value Phi(1.84) given for the right-hand tail", () => table(1.84));

/* 0002: commute P(T < 44.3), z = 1.05, a left tail read straight from the table */
nadd(NQ("0002"), MN.wrongTail, "1 - Phi(1.05): subtracted from 1 when the shading was to the left", () => oneMinusTable("commute", NORM.commute.x));
nadd(NQ("0002"), MN.zFormula, "mean and standard deviation exchanged: z = (44.3 - 6)/38", () => swappedZ("commute", NORM.commute.x, "below"));

/* 0003: carrots P(M > 1045.2), z = 2.1 */
nadd(NQ("0003"), MN.notSubtracted, "Phi(2.1) left as the answer for a right-hand tail", () => tableOnly("carrots", NORM.carrots.x));
nadd(NQ("0003"), MN.zFormula, "mean and standard deviation exchanged: z = (1045.2 - 12)/1020", () => swappedZ("carrots", NORM.carrots.x, "above"));

/* 0004: deer P(H < 108.8), z = -1.15 */
nadd(NQ("0004"), MN.negative, "Phi(1.15) read for z = -1.15 and left as the answer", () => tableOnly("deer", NORM.deer.x));
nadd(NQ("0004"), MN.zFormula, "mean and standard deviation exchanged: z = (108.8 - 8)/118", () => swappedZ("deer", NORM.deer.x, "below"));

/* 0005: LED P(L > 23725), z = -0.85 */
nadd(NQ("0005"), MN.wrongTail, "1 - Phi(0.85): subtracted from 1 although more than half the curve is shaded", () => oneMinusTable("led", NORM.led.x));

/* 0006: bread P(M > 832.4), z = 1.62 */
nadd(NQ("0006"), MN.zRounded, "z = 1.62 rounded to 1.6 before the table was read", () => roundedZ("bread", NORM.bread.x, "above"));
nadd(NQ("0006"), MN.notSubtracted, "Phi(1.62) left as the answer for a right-hand tail", () => tableOnly("bread", NORM.bread.x));

/* 0007: desk P(T > 2 hours), z = 2.2 */
nadd(NQ("0007"), MN.notSubtracted, "Phi(2.2) left as the answer for a right-hand tail", () => tableOnly("desk", NORM.desk.x));

/* 0008: French and History z-scores, the division left out */
nadd(NQ("0008", "a"), MN.zFormula, "71 - 63 with no division by the standard deviation", () => bSub(rat(String(NORM.french.x)), rat(String(NORM.french.mean))));
nadd(NQ("0008", "b"), MN.zFormula, "74 - 65 with no division by the standard deviation", () => bSub(rat(String(NORM.history.x)), rat(String(NORM.history.mean))));

/* 0009: parcel P(M <= 2.12), z = 1.35, 'does not cost extra' */
nadd(NQ("0009"), MN.wrongTail, "1 - Phi(1.35): the probability of costing extra given instead", () => oneMinusTable("parcel", NORM.parcel.x));

/* 0010: cans (a) P(V > 334.475), z = 1.65; (b) P(V < 330.65), z = -0.9 */
nadd(NQ("0010", "a"), MN.notSubtracted, "Phi(1.65) left as the answer for a right-hand tail", () => tableOnly("cans", NORM.cans.xa));
nadd(NQ("0010", "a"), MN.zFormula, "mean and standard deviation exchanged: z = (334.475 - 1.5)/332", () => swappedZ("cans", NORM.cans.xa, "above"));
nadd(NQ("0010", "b"), MN.negative, "Phi(0.9) read for z = -0.9 and left as the answer", () => tableOnly("cans", NORM.cans.xb));

/* 0011: parkrun (b) P(T < 28.35), z = -0.7; (c) P(T > 22.95), z = -1.9 */
nadd(NQ("0011", "b"), MN.negative, "Phi(0.7) read for z = -0.7 and left as the answer", () => tableOnly("parkrun", NORM.parkrun.xa));
nadd(NQ("0011", "c"), MN.wrongTail, "1 - Phi(1.9): subtracted from 1 although more than half the curve is shaded", () => oneMinusTable("parkrun", NORM.parkrun.xc));

/* 0011(a): the z-value itself */
const ratDiv = (x, y) => big(x.n * y.d, x.d * y.n);
const pr = NORM.parkrun;
nadd(NQ("0011", "a"), MN.zFormula, "x - mean with no division by the standard deviation: 28.35 - 31.5", () => bSub(rat(String(pr.xa)), rat(String(pr.mean))));
nadd(NQ("0011", "a"), MN.zFormula, "the subtraction done the other way round, so the sign is lost: (31.5 - 28.35)/4.5", () => ratDiv(bSub(rat(String(pr.mean)), rat(String(pr.xa))), rat(String(pr.sd))));

/* 0012 (depth pass): cucumbers, (a) P(L < 36.25) z = 1.7, (b) P(L < 28.75) z = -1.3, (c) (b) given (a) */
{
  const cu = NORM.cucumbers;
  const pa = tailAt(nmodel("cucumbers").z(cu.xa), "below");
  const pb = tailAt(nmodel("cucumbers").z(cu.xb), "below");
  nadd(NQ("0012", "a"), MN.wrongTail, "1 - Phi(1.7): subtracted from 1 when the shading was to the left", () => oneMinusTable("cucumbers", cu.xa));
  nadd(NQ("0012", "a"), MN.zFormula, "mean and standard deviation exchanged: z = (36.25 - 2.5)/32", () => swappedZ("cucumbers", cu.xa, "below"));
  nadd(NQ("0012", "b"), MN.negative, "Phi(1.3) read for z = -1.3 and left as the answer", () => tableOnly("cucumbers", cu.xb));
  nadd(NQ("0012", "b"), MN.zFormula, "mean and standard deviation exchanged: z = (28.75 - 2.5)/32", () => swappedZ("cucumbers", cu.xb, "below"));
  nadd(NQ("0012", "c"), MC.subset, "P(b) x P(a) on the top, divided by P(a): the product undoes itself and leaves part (b)", () => ratDiv(bMul(pb, pa), pa));
  nadd(NQ("0012", "c"), MC.independent, "P(b) x P(a) taken as the answer: the events treated as independent and nothing divided", () => bMul(pb, pa));
}

/* find the mistake */
nadd("normal-ftm1", MN.negative, "lambs: Phi(1.05) left for P(M < 3.76)", () => tableOnly("lambs", NORM.lambs.x));
nadd("normal-ftm2", MN.wrongTail, "pencils: 1 - Phi(1.7) for P(L > 16.82)", () => oneMinusTable("pencils", NORM.pencils.x));

/* the note: the value a candidate who forgets to subtract would give for the trout above 40.5 cm */
nadd("znote#trout-right", MN.notSubtracted, "trout: Phi(1.3) left as the answer for P(L > 40.5)", () => tableOnly("trout", 40.5));

/* diagnostics: every numeric distractor is a route */
export const NDXD = {
  d1: { mean: 35, sd: 4, x: 43 },
  d3: { z: -0.95 },
  d4: { mean: 50, sd: 10, x: 63 },
  d5: { mean: 50, sd: 10, x: 41 },
};
const NDX = (item, option) => `dx.${NT}.post#${item}:${option}`;
nadd(NDX("d1", "b"), MN.zFormula, "x - mean with no division: 43 - 35", () => rat(String(NDXD.d1.x - NDXD.d1.mean)));
nadd(NDX("d1", "c"), MN.zFormula, "divided by the variance 16: (43 - 35)/16", () => big(BigInt(NDXD.d1.x - NDXD.d1.mean), BigInt(NDXD.d1.sd * NDXD.d1.sd)));
nadd(NDX("d3", "b"), MN.negative, "Phi(0.95) left as P(Z < -0.95)", () => table(NDXD.d3.z));
nadd(NDX("d3", "c"), MN.zRounded, "-0.95 rounded to -1.0 before the table: 1 - Phi(1.0)", () => tailAt(-1.0, "below"));

ROUTES.push(...NR);
export { tailAt, table as tableValue };

/* ---- normal-distribution-bell-curve: the 68/95 figures and ranges ------------------------------ */

export const BC = "fm.u3.normal-distribution-bell-curve";

/** Every context in the bell-curve topic: a mean and a standard deviation as the stem gives them. */
export const BELL = {
  women: { mean: 164, sd: 6, unit: "cm" }, // worked example
  leaves: { mean: 8.2, sd: 0.9, unit: "cm" }, // its twin
  flour: { mean: 1005, sd: 4, unit: "g" }, // see it done
  babies: { mean: 3.4, sd: 0.5, unit: "kg" }, // the note's examples, 0006 and the find-the-mistake
  marks: { mean: 55, sd: 7, unit: "" }, // gate g5
  apples: { mean: 152, sd: 9, unit: "g" }, // 0004 and 0005
  boys: { mean: 176, sd: 7, unit: "cm" }, // exam-style 0007
};

export const MB = {
  proportion: "fm.normal.proportion-misread",
  oneSided: "fm.normal.interval-one-sided",
  sdFormula: "fm.normal.sd-formula-used-instead",
  tail: "fm.normal.tail-not-subtracted",
};

/** The rule-of-thumb shares, computed: within k standard deviations, as a whole percentage (68, 95), or 99.7 for k = 3. */
export const within = (k) => (k === 3 ? Math.round(1000 * (2 * phi(3) - 1)) / 10 : Math.round(100 * (2 * phi(k) - 1)));
/** The share beyond k standard deviations on one side, by the rule of thumb: (100 - within) / 2. */
export const oneTail = (k) => (100 - within(k)) / 2;
/** The share between the mean and k standard deviations on one side: within / 2. */
export const halfBand = (k) => within(k) / 2;
if (within(1) !== 68 || within(2) !== 95 || within(3) !== 99.7 || oneTail(1) !== 16 || oneTail(2) !== 2.5) throw new Error("the 68-95-99.7 figures are not what the note prints");

/** A value k standard deviations from the mean, as an exact rational printed without float noise. */
export const kSd = (key, k) => bAdd(rat(String(BELL[key].mean)), bMul(big(BigInt(k)), rat(String(BELL[key].sd))));

const BQ = (id, part = "main") => `q.${BC}.${id}#${part}`;
const BR = [];
const badd = (where, misconception, describe, run) => BR.push({ where, misconception, describe, run, slug: "normal-distribution-bell-curve" });
const pctRat = (v) => rat(String(v));

/* 0003: the share within two standard deviations */
badd(BQ("0003"), MB.proportion, "the one-standard-deviation figure, 68%, given for two", () => pctRat(within(1)));
badd(BQ("0003"), MB.proportion, "the three-standard-deviation figure, 99.7%, given for two", () => pctRat(within(3)));
/* 0004: apples, the lower end of the middle 95% */
badd(BQ("0004"), MB.proportion, "one standard deviation taken off where two were needed: 152 - 9", () => kSd("apples", -1));
badd(BQ("0004"), MB.oneSided, "the interval started at the mean: the two standard deviations added on one side only", () => kSd("apples", 0));
/* 0005: apples heavier than the mean plus one standard deviation */
badd(BQ("0005"), MB.proportion, "the band between the mean and one standard deviation, 34%, given for the tail beyond it", () => pctRat(halfBand(1)));
badd(BQ("0005"), MB.proportion, "the 32% outside one standard deviation not halved between the two tails", () => pctRat(100 - within(1)));
badd(BQ("0005"), MB.tail, "the share below the value, 84%, given for the share above it", () => pctRat(100 - oneTail(1)));
/* 0007: boys' heights */
badd(BQ("0007", "b"), MB.proportion, "one standard deviation taken off where two were needed: 176 - 7", () => kSd("boys", -1));
badd(BQ("0007", "b"), MB.oneSided, "the interval started at the mean", () => kSd("boys", 0));
badd(BQ("0007", "c"), MB.proportion, "the 5% outside two standard deviations not halved", () => pctRat(100 - within(2)));
badd(BQ("0007", "c"), MB.proportion, "the band between the mean and two standard deviations, 47.5%, given for the tail beyond it", () => pctRat(halfBand(2)));
/* the find-the-mistake working: the 32% outside one standard deviation given as the one tail */
badd("bell-ftm1", MB.proportion, "the 32% outside one standard deviation not halved", () => pctRat(100 - within(1)));

ROUTES.push(...BR);

/* ---- pascals-triangle-binomial-expansion: algebraic routes ------------------------------------- */

export const PT = "fm.u3.pascals-triangle-binomial-expansion";
export const MP = {
  wrongRow: "fm.binomial.wrong-power",
  coef: "fm.binomial.coefficient-omitted",
  swap: "fm.binomial.p-q-swapped",
  signs: "fm.binomial.negative-term-signs-lost",
  notRaised: "fm.binomial.bracket-number-not-raised",
  notWritten: "fm.binomial.triangle-not-written",
};

/** (a + bx)^n with the power applied to x but not to the number b: C a^(n-r) b x^r. */
export function notRaisedTex(n, a, b) {
  const parts = [];
  for (let r = 0; r <= n; r += 1) {
    const c = ROWS_[n][r] * a ** (n - r) * (r === 0 ? 1 : b);
    const xp = r === 0 ? "" : r === 1 ? "x" : `x^{${r}}`;
    parts.push(`${c === 1 && xp ? "" : c}${xp}`);
  }
  return parts.join(" + ");
}
/** (a + bx)^n expanded and simplified: C a^(n-r) b^r x^r. */
export function numberExpansionTex(n, a, b) {
  const parts = [];
  for (let r = 0; r <= n; r += 1) {
    const c = ROWS_[n][r] * a ** (n - r) * b ** r;
    const xp = r === 0 ? "" : r === 1 ? "x" : `x^{${r}}`;
    parts.push(`${c === 1 && xp ? "" : c}${xp}`);
  }
  return parts.join(" + ");
}

const PQ = (id, part = "main") => `q.${PT}.${id}#${part}`;
const LATEX_ROUTES = [];
const ladd = (where, misconception, describe, run) => LATEX_ROUTES.push({ where, misconception, describe, run });

ladd(PQ("0002"), MP.wrongRow, "row 4 used for the fifth power: the expansion of (p + q)^4", () => expandTex(4));
ladd(PQ("0003"), MP.wrongRow, "row 6 used for the seventh power: the expansion of (p + q)^6", () => expandTex(6));
ladd(PQ("0003"), MP.coef, "every coefficient left out: the powers alone", () => expandTex(7, { coefs: new Array(8).fill(1) }));
ladd(PQ("0004"), MP.wrongRow, "the entry in the same place in row 7: 21", () => termTex(8, 5, { coef: ROWS_[7][5] }));
ladd(PQ("0004"), MP.swap, "the powers of p and q exchanged: the term in p^5 q^3", () => termTex(8, 3));
ladd(PQ("0005"), MP.signs, "every sign written as plus: the expansion of (p + q)^4", () => expandTex(4));
ladd(PQ("0006"), MP.notRaised, "the power applied to x but not to the 2", () => notRaisedTex(4, 1, 2));
ladd(PQ("0007", "b"), MP.wrongRow, "row 5 used for the sixth power: the expansion of (p + q)^5", () => expandTex(5));
ladd(PQ("0007", "c"), MP.swap, "the powers exchanged: the term in p^2 q^4", () => termTex(6, 4));
ladd(PQ("0007", "d"), MP.signs, "every sign written as plus: the expansion of (p + q)^6", () => expandTex(6));

export function latexRoutes() {
  return LATEX_ROUTES.map((r) => ({ ...r, latex: r.run() }));
}
export function latexRoute(where, misconception, nth = 0) {
  const hits = LATEX_ROUTES.filter((r) => r.where === where && r.misconception === misconception);
  if (!hits[nth]) throw new Error(`latexRoute(): no route #${nth} for ${where} / ${misconception}`);
  return hits[nth].run();
}

export function allRoutes() {
  return ROUTES.map((r) => {
    const exact = r.run();
    return { ...r, exact, dp4: d4(exact) };
  });
}

/** The value an authored commonError carries: the route's exact result at six decimals. */
export function route(where, misconception, nth = 0) {
  const hits = ROUTES.filter((r) => r.where === where && r.misconception === misconception);
  if (!hits[nth]) throw new Error(`route(): no route #${nth} for ${where} / ${misconception}`);
  return hits[nth].run();
}

export { ROUTES, Normal, rat, big, bMul };
