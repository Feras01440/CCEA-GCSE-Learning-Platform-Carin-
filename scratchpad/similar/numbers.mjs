/**
 * Every number used anywhere in the bundle or the note, computed here once.
 * Nothing downstream may type a numeral that is not formatted through fmt().
 */

/** Trailing-zero-free decimal of a computed value. Throws on anything not finite. */
export function fmt(x, dp = 6) {
  const v = Number(x);
  if (!Number.isFinite(v)) throw new Error(`fmt: not a finite number: ${String(x)}`);
  let s = v.toFixed(dp);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s === "-0" ? "0" : s;
}

/** Fixed decimal places, for a stated accuracy. */
export const dp = (x, n) => Number(x).toFixed(n);

/** Strips binary-floating-point noise so no raw float is ever stored or printed. */
export const clean = (x) => {
  const v = Number(x);
  if (!Number.isFinite(v)) throw new Error(`clean: not a finite number: ${String(x)}`);
  return Number(v.toPrecision(12));
};

/** Round to n significant figures, as a stated accuracy demands. */
export const sf = (x, n) => Number(Number(x).toPrecision(n));

const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** Simplify a : b to its lowest terms, as a pair of integers. */
export function simplify(a, b) {
  const g = gcd(a, b);
  return [a / g, b / g];
}
export const ratio = (a, b) => `${fmt(a)} : ${fmt(b)}`;

/** a/b in lowest terms as KaTeX; an integer when it divides exactly. */
export function frac(a, b) {
  const [p, q] = simplify(a, b);
  return q === 1 ? fmt(p) : `\\dfrac{${fmt(p)}}{${fmt(q)}}`;
}
/** a/b in lowest terms as plain text, for mark-scheme and student-working lines. */
export function fracPlain(a, b) {
  const [p, q] = simplify(a, b);
  return q === 1 ? fmt(p) : `${fmt(p)}/${fmt(q)}`;
}

const isInt = (x) => Number.isInteger(Math.round(x * 1e9) / 1e9);
/** Assert an exactly-integral value and return it as a true integer. */
function int(x, what) {
  const r = Math.round(x);
  if (!isInt(x) || Math.abs(x - r) > 1e-9) throw new Error(`${what} is not an integer: ${x}`);
  return r;
}

// --- note gates -------------------------------------------------------------
const g1 = { k: 3 };
const g2 = { k: 5 };
const g3 = { k: 4 };
const back = { a: 1, b: 16 };
const backV = { a: 8, b: 125 };
const g4 = { areaRatio: 49 };

const g5areaSmall = 12;
const g5areaLarge = 300;
const g5areaRatio = g5areaLarge / g5areaSmall;
const g5k = Math.sqrt(g5areaRatio);
const g5heightLarge = 35;
const g5 = {
  areaSmall: g5areaSmall,
  areaLarge: g5areaLarge,
  areaRatio: g5areaRatio,
  k: g5k,
  heightLarge: g5heightLarge,
  heightSmall: g5heightLarge / g5k,
};

const nestedAd = 6;
const nestedDb = 9;
const nestedAb = nestedAd + nestedDb;
const nestedK = nestedAb / nestedAd;
const nestedDe = 8;
const nested = { ad: nestedAd, db: nestedDb, ab: nestedAb, k: nestedK, de: nestedDe, bc: nestedDe * nestedK };

const chainA2 = 9;
const chainB2 = 25;
const chainA = Math.sqrt(chainA2);
const chainB = Math.sqrt(chainB2);
const chain = { a2: chainA2, b2: chainB2, a: chainA, b: chainB, a3: chainA ** 3, b3: chainB ** 3 };

// --- the three note figures -------------------------------------------------
const figTrio = (() => {
  const kSq = 3;
  const kCu = 2;
  return { kSq, kCu, squares: kSq * kSq, cubes: kCu ** 3 };
})();
const figCorr = (() => {
  const small1 = 6;
  const large1 = 15;
  const small2 = 8;
  const k = large1 / small1;
  return { small1, large1, small2, large2: small2 * k, k };
})();
const figChain = (() => {
  const a2 = 4;
  const b2 = 25;
  const a = Math.sqrt(a2);
  const b = Math.sqrt(b2);
  return { a2, b2, a, b, a3: a ** 3, b3: b ** 3 };
})();

// --- worked examples --------------------------------------------------------
function areaScale(baseSmall, baseLarge, areaSmall) {
  const k = baseLarge / baseSmall;
  const k2 = k * k;
  const [kn, kd] = simplify(baseLarge, baseSmall);
  return {
    baseSmall, baseLarge, areaSmall, k, k2, areaLarge: areaSmall * k2,
    kn, kd, k2n: kn * kn, k2d: kd * kd,
  };
}

const we1 = areaScale(4, 10, 22);
const we1twin = areaScale(6, 15, 28);

function areaBack(areaSmall, areaLarge, sideLarge) {
  const [ra, rb] = simplify(areaSmall, areaLarge);
  const la = Math.sqrt(ra);
  const lb = Math.sqrt(rb);
  return { areaSmall, areaLarge, ra, rb, la, lb, sideLarge, sideSmall: (sideLarge * la) / lb };
}
const we2 = areaBack(45, 125, 20);
const we2twin = areaBack(8, 98, 21);

function chainVolume(saA, saB, volSmall) {
  const [ra, rb] = simplify(saA, saB);
  const la = Math.sqrt(ra);
  const lb = Math.sqrt(rb);
  const va = la ** 3;
  const vb = lb ** 3;
  return { saA: ra, saB: rb, la, lb, va, vb, volSmall, volLarge: (volSmall * vb) / va };
}
const we3 = chainVolume(4, 25, 48);
const we3twin = chainVolume(9, 16, 54);

function nestedTri(ad, db, de, ae) {
  const ab = ad + db;
  const k = ab / ad;
  const [kn, kd] = simplify(ab, ad);
  const out = { ad, db, ab, k, kn, kd, de, bc: de * k };
  if (ae !== undefined) {
    out.ae = ae;
    out.ac = ae * k;
    out.ec = ae * k - ae;
  }
  return out;
}
const we4 = nestedTri(12, 8, 18, 15);
const we4twin = nestedTri(10, 5, 14);

// --- questions --------------------------------------------------------------
const q1 = (() => {
  const k = 6;
  return { k, area: k * k, volume: k ** 3, doubled: 2 * k, trebled: 3 * k };
})();
const q3 = (() => {
  const areaFactor = 121;
  return { areaFactor, k: Math.sqrt(areaFactor), halved: areaFactor / 2 };
})();
const q4 = (() => {
  const lenA = 5;
  const areaA = 12;
  const lenB = 20;
  const k = lenB / lenA;
  return { lenA, areaA, lenB, k, k2: k * k, areaB: areaA * k * k, linear: areaA * k, cubed: areaA * k ** 3 };
})();
const q5 = (() => {
  const vol = 45;
  const k = 3;
  return { vol, k, k3: k ** 3, newVol: vol * k ** 3, linear: vol * k, squared: vol * k * k };
})();
const q6 = (() => {
  const volA = 5;
  const volB = 320;
  const factor = volB / volA;
  return { volA, volB, factor, k: Math.cbrt(factor), rooted: Math.sqrt(factor) };
})();
const q7 = (() => {
  const areaA = 18;
  const areaB = 162;
  const factor = areaB / areaA;
  const k = Math.sqrt(factor);
  const heightB = 21;
  return { areaA, areaB, factor, k, heightB, heightA: heightB / k, usedAreaFactor: heightB / factor, inverted: heightB * k };
})();
const q8 = (() => {
  const small = 9;
  const large = 15;
  const k = large / small;
  const other = 12;
  return { small, large, k, other, answer: other * k, inverted: other / k, mismatched: (small * large) / other };
})();
const q9 = (() => {
  const hSmall = 8;
  const hLarge = 20;
  const k = hLarge / hSmall;
  const volSmall = 35;
  return {
    hSmall, hLarge, k, k3: k ** 3, volSmall,
    volLarge: volSmall * k ** 3,
    linear: volSmall * k,
    squared: volSmall * k * k,
  };
})();
const q10 = chainVolume(9, 49, 1);
const q11 = (() => {
  const volSmall = 250;
  const volLarge = 1500;
  const factor = volLarge / volSmall;
  const k = Math.cbrt(factor);
  const hSmall = 12;
  return { volSmall, volLarge, factor, k, hSmall, hLarge: hSmall * k, rooted: hSmall * Math.sqrt(factor), linear: hSmall * factor };
})();
const q12 = (() => {
  const areaIncrease = 44;
  const areaFactor = 1 + areaIncrease / 100;
  const k = Math.sqrt(areaFactor);
  return { areaIncrease, areaFactor, k, lengthIncrease: (k - 1) * 100 };
})();
const q13 = (() => {
  const areaA = 8;
  const areaB = 98;
  const [ra, rb] = simplify(areaA, areaB);
  const la = Math.sqrt(ra);
  const lb = Math.sqrt(rb);
  const gapConst = 10; // heights are x and x + gapConst
  // lb * x = la * (x + gapConst)  ->  x (lb - la) = la * gapConst
  const x = (la * gapConst) / (lb - la);
  // what the area ratio used as a length ratio would give
  const wrongX = (ra * gapConst) / (rb - ra);
  return { areaA, areaB, ra, rb, la, lb, gapConst, x, wrongX, heightA: x, heightB: x + gapConst };
})();
const q14 = (() => {
  const ps = 8;
  const sq = 12;
  const pq = ps + sq;
  const k = pq / ps;
  const st = 14;
  const [ar, br] = simplify(ps * ps, pq * pq);
  return { ps, sq, pq, k, st, qr: st * k, areaRatioA: ar, areaRatioB: br };
})();
const q15 = (() => {
  const c = chainVolume(16, 81, 128);
  return c;
})();
const q16 = (() => {
  const labelSmall = 60;
  const labelLarge = 135;
  const c = chainVolume(labelSmall, labelLarge, 400);
  return { ...c, labelSmall, labelLarge };
})();

// --- find the mistake -------------------------------------------------------
const ftm1 = (() => {
  const areaA = 14;
  const areaB = 126;
  const factor = areaB / areaA;
  const k = Math.sqrt(factor);
  const heightB = 27;
  return { areaA, areaB, factor, k, heightB, heightA: heightB / k, studentAnswer: heightB / factor };
})();
const ftm2 = (() => {
  const vol = 40;
  const k = 3;
  return { vol, k, k3: k ** 3, correct: vol * k ** 3, studentAnswer: vol * k };
})();
const ftm3 = (() => {
  const small = 6;
  const large = 14;
  const k = large / small;
  const other = 9;
  return { small, large, k, other, correct: other * k, difference: large - small, studentAnswer: other + (large - small) };
})();

// --- diagnostics ------------------------------------------------------------
const dx1 = (() => {
  const k = 4;
  return { k, area: k * k, cube: k ** 3, doubled: 2 * k };
})();
const dx2 = (() => {
  const k = 3;
  return { k, volume: k ** 3, square: k * k, doubled: 2 * k };
})();
const dx3 = (() => {
  const areaRatio = 36;
  return { areaRatio, length: Math.sqrt(areaRatio), halved: areaRatio / 2, squared: areaRatio * areaRatio };
})();
const dx4 = (() => {
  const volRatio = 64;
  return { volRatio, length: Math.cbrt(volRatio), rooted: Math.sqrt(volRatio), halved: volRatio / 2 };
})();
const dx5 = (() => {
  const small = 6;
  const large = 15;
  const k = large / small;
  const other = 8;
  return {
    small,
    large,
    k,
    other,
    answer: other * k,
    additive: other + (large - small),
    inverted: other / k,
    mismatched: (small * large) / other,
  };
})();
const dx6 = (() => {
  const vol = 20;
  const k = 3;
  return { vol, k, answer: vol * k ** 3, linear: vol * k, squared: vol * k * k, additive: vol + k };
})();
const dx7 = (() => {
  const perimeter = 12;
  const k = 3;
  return { perimeter, k, answer: perimeter * k, squared: perimeter * k * k, additive: perimeter + k, inverted: perimeter / k };
})();
const dx8 = (() => {
  const areaA = 12;
  const areaB = 108;
  const [ra, rb] = simplify(areaA, areaB);
  const la = Math.sqrt(ra);
  const lb = Math.sqrt(rb);
  const gapConst = 8;
  const x = (la * gapConst) / (lb - la);
  return { areaA, areaB, ra, rb, la, lb, gapConst, x, difference: areaB - areaA };
})();

export const N = {
  g1, g2, g3, back, backV, g4, g5, nested, chain,
  figTrio, figCorr, figChain,
  we1, we1twin, we2, we2twin, we3, we3twin, we4, we4twin,
  q1, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16,
  ftm1, ftm2, ftm3,
  dx1, dx2, dx3, dx4, dx5, dx6, dx7, dx8,
};

/** Independent re-derivation of every headline value; throws if anything drifted. */
export function selfCheck() {
  const eq = (a, b, what) => {
    if (Math.abs(a - b) > 1e-9) throw new Error(`${what}: ${a} !== ${b}`);
  };
  eq(we1.areaLarge, 22 * (10 / 4) ** 2, "we1 area");
  eq(we1.areaLarge, 137.5, "we1 area literal");
  eq(we1twin.areaLarge, 175, "we1 twin");
  eq(we2.sideSmall, 12, "we2 side");
  eq(we2twin.sideSmall, 6, "we2 twin");
  eq(we3.volLarge, 750, "we3 volume");
  eq(we3twin.volLarge, 128, "we3 twin");
  eq(we4.bc, 30, "we4 bc");
  eq(we4.ec, 10, "we4 ec");
  eq(we4twin.bc, 21, "we4 twin bc");
  eq(q4.areaB, 192, "q4");
  eq(q5.newVol, 1215, "q5");
  eq(q6.k, 4, "q6");
  eq(q7.heightA, 7, "q7");
  eq(q8.answer, 20, "q8");
  eq(q9.volLarge, 546.875, "q9");
  eq(Number(q9.volLarge.toPrecision(3)), 547, "q9 to 3sf");
  eq(Number(q11.hLarge.toPrecision(3)), 21.8, "q11 to 3sf");
  eq(q10.la, 3, "q10 heights a");
  eq(q10.lb, 7, "q10 heights b");
  eq(q10.va, 27, "q10 volumes a");
  eq(q10.vb, 343, "q10 volumes b");
  eq(q12.lengthIncrease, 20, "q12");
  eq(q3.k, 11, "q3");
  eq(q13.x, 4, "q13 x");
  // the two heights really are in the ratio la : lb, and their areas in the given ratio
  eq(q13.heightB / q13.heightA, q13.lb / q13.la, "q13 height ratio");
  eq((q13.heightB / q13.heightA) ** 2, q13.areaB / q13.areaA, "q13 area ratio");
  eq(q14.qr, 35, "q14 qr");
  eq(q14.areaRatioA, 4, "q14 area ratio a");
  eq(q14.areaRatioB, 25, "q14 area ratio b");
  eq(q15.volLarge, 1458, "q15");
  eq(q15.la, 4, "q15 heights a");
  eq(q15.lb, 9, "q15 heights b");
  eq(q16.volLarge, 1350, "q16");
  eq(q16.la, 2, "q16 heights a");
  eq(q16.lb, 3, "q16 heights b");
  eq(ftm1.heightA, 9, "ftm1 correct");
  eq(ftm1.studentAnswer, 3, "ftm1 student");
  eq(ftm2.correct, 1080, "ftm2 correct");
  eq(ftm2.studentAnswer, 120, "ftm2 student");
  eq(ftm3.correct, 21, "ftm3 correct");
  eq(ftm3.studentAnswer, 17, "ftm3 student");
  eq(dx5.answer, 20, "dx5");
  eq(dx5.mismatched, 11.25, "dx5 mismatched");
  eq(dx8.x, 4, "dx8 x");
  eq(g5.heightSmall, 7, "g5 height");
  eq(nested.bc, 20, "note nested bc");
  eq(chain.b3, 125, "note chain");
  eq(figTrio.squares, 9, "trio squares");
  eq(figTrio.cubes, 8, "trio cubes");
  eq(figCorr.large2, 20, "corr large2");
  eq(figChain.b3, 125, "fig chain b3");
  eq(figChain.a3, 8, "fig chain a3");
  // integers where the prose claims integers
  [we2.la, we2.lb, we3.la, we3.lb, q10.la, q10.lb, q15.la, q15.lb, q16.la, q16.lb, dx3.length, dx4.length].forEach(
    (v, i) => int(v, `integral ratio part #${i}`),
  );
  return true;
}
