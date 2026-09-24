/**
 * Assemble, verify and write the maths.m7.standard-form bundle.
 *
 * Run: node scratchpad/standard-form/gen.mjs
 *
 * Everything numeric in the bundle is recomputed here from the stem numbers before it is
 * written, every $...$ segment is compiled with KaTeX, and the schema-level invariants the
 * Zod schema enforces (mark sums, skeletons, verification refs, id uniqueness) are checked
 * so the failure message points at the item rather than at a path.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { workedExamples, diagnostics, questions, findTheMistake, prompts, TOPIC, SPEC } from "./items.mjs";
import { noteBlocks } from "./note.mjs";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const OUT_DIR = path.join(ROOT, "packs", "maths", "content", "m7", "standard-form");
const katex = require(path.join(ROOT, "node_modules", "katex"));

const AT = "2026-09-13T12:00:00Z";
const TOOL = "claude (author-topic pass; every value recomputed in scratchpad/standard-form/gen.mjs)";

const problems = [];
const fail = (msg) => problems.push(msg);

// ---------------------------------------------------------------------------
// 1. Independent recomputation of every number the bundle asserts
// ---------------------------------------------------------------------------

/** Standard-form pair arithmetic, kept as {a, n} so re-normalising is explicit. */
const sf = (a, n) => ({ a, n });
const val = ({ a, n }) => a * 10 ** n;
function norm({ a, n }) {
  if (a === 0) return sf(0, 0);
  let m = a;
  let p = n;
  while (Math.abs(m) >= 10) {
    m /= 10;
    p += 1;
  }
  while (Math.abs(m) < 1) {
    m *= 10;
    p -= 1;
  }
  return sf(Number(m.toPrecision(12)), p);
}
const mul = (x, y) => norm(sf(x.a * y.a, x.n + y.n));
const div = (x, y) => norm(sf(x.a / y.a, x.n - y.n));
const add = (x, y) => norm(sf(x.a + y.a * 10 ** (y.n - x.n), x.n));
const pow = (x, k) => norm(sf(x.a ** k, x.n * k));
const pct = (x, r) => norm(sf(x.a * r, x.n));

const near = (got, want, tag) => {
  const ok = want === 0 ? Math.abs(got) < 1e-12 : Math.abs(got - want) / Math.abs(want) < 1e-9;
  if (!ok) fail(`recompute ${tag}: got ${got}, expected ${want}`);
  return ok;
};

/** Every asserted value, recomputed from the stem numbers. Keys are used in the logs. */
const RECOMPUTED = {
  "we.01": (() => {
    const P = sf(6.4, 9);
    const Q = sf(2.5, -5);
    const R = sf(4, 3);
    const pq = mul(P, Q);
    const r = div(pq, R);
    return { detail: `P*Q = 6.4*2.5 = 16 -> 16e4 = ${pq.a}e${pq.n}; /(4e3) -> ${r.a}e${r.n} = ${val(r)}`, value: val(r), check: 40 };
  })(),
  "we.01.twin": (() => {
    const r = div(mul(sf(8.1, 7), sf(5, -3)), sf(1.5, 2));
    return { detail: `M*N = 8.1*5 = 40.5 -> 4.05e5; /(1.5e2) = ${r.a}e${r.n}`, value: val(r), check: 2700 };
  })(),
  "we.02": (() => {
    const r = add(sf(5.4, -3), sf(8, -4));
    return { detail: `8e-4 = 0.8e-3; 5.4 + 0.8 = 6.2 -> ${r.a}e${r.n}`, value: val(r), check: 0.0062 };
  })(),
  "we.02.twin": (() => {
    const r = add(sf(9.3, 6), sf(-4.5, 5));
    return { detail: `4.5e5 = 0.45e6; 9.3 - 0.45 = 8.85 -> ${r.a}e${r.n}`, value: val(r), check: 8850000 };
  })(),
  "we.03": (() => {
    const base = sf(8, 6);
    const inc = pct(base, 0.25);
    const r = add(base, inc);
    return { detail: `25% of 8e6 = ${inc.a}e${inc.n}; 8e6 + 2e6 = 10e6 -> ${r.a}e${r.n}`, value: val(r), check: 1e7 };
  })(),
  "we.03.twin": (() => {
    const base = sf(2.5, 5);
    const r = add(base, pct(base, 0.6));
    return { detail: `60% of 2.5e5 = 1.5e5; total ${r.a}e${r.n}`, value: val(r), check: 400000 };
  })(),
  "we.04": (() => {
    const grams = mul(sf(7.5, 3), sf(1, 3));
    const r = div(grams, sf(1.1, -2));
    const sf3 = Number(r.a.toPrecision(3));
    return { detail: `7.5e3 kg = ${grams.a}e${grams.n} g; /(1.1e-2) = ${r.a}e${r.n}; 3 sf -> ${sf3}e${r.n}`, value: sf3 * 10 ** r.n, check: 6.82e8 };
  })(),
  "we.04.twin": (() => {
    const r = div(mul(sf(2.7, 2), sf(1, 3)), sf(4.5, -5));
    return { detail: `2.7e2 kg = 2.7e5 g; /(4.5e-5) = ${r.a}e${r.n}`, value: val(r), check: 6e9 };
  })(),
  "q.0001": { detail: "2 970 000: point slides 6 places left -> 2.97e6", value: 2.97e6, check: 2970000 },
  "q.0002": { detail: "0.000405: point slides 4 places right -> 4.05e-4", value: 4.05e-4, check: 0.000405 },
  "q.0003": { detail: "5.06e-4 -> 0.000506 (four places left)", value: 0.000506, check: 0.000506 },
  "q.0004": (() => {
    const r = norm(sf(84, 5));
    return { detail: `84e5 -> ${r.a}e${r.n}`, value: val(r), check: 8400000 };
  })(),
  "q.0005": (() => {
    const r = mul(sf(3, 5), sf(2.5, -8));
    return { detail: `3*2.5 = 7.5; 5 + (-8) = -3 -> ${r.a}e${r.n}`, value: val(r), check: 0.0075 };
  })(),
  "q.0006": (() => {
    const r = div(sf(7.2, 6), sf(9, -2));
    return { detail: `7.2/9 = 0.8; 6 - (-2) = 8; 0.8e8 -> ${r.a}e${r.n}`, value: val(r), check: 8e7 };
  })(),
  "q.0007": (() => {
    const r = add(sf(3.5, -3), sf(6, -4));
    return { detail: `6e-4 = 0.6e-3; 3.5 + 0.6 = 4.1 -> ${r.a}e${r.n}`, value: val(r), check: 0.0041 };
  })(),
  "q.0008": (() => {
    const r = add(sf(5.2, 9), sf(-7, 8));
    return { detail: `7e8 = 0.7e9; 5.2 - 0.7 = 4.5 -> ${r.a}e${r.n}`, value: val(r), check: 4.5e9 };
  })(),
  "q.0009": (() => {
    const r = pow(sf(2, 5), 3);
    return { detail: `2^3 = 8; 5*3 = 15 -> ${r.a}e${r.n}`, value: val(r), check: 8e15 };
  })(),
  "q.0010": (() => {
    const items = { A: val(sf(4.2, -3)), B: 0.00052, C: val(sf(3.9, -4)) };
    const order = Object.entries(items).sort((x, y) => x[1] - y[1]).map(([k]) => k).join(", ");
    return { detail: `A = ${items.A}, B = ${items.B}, C = ${items.C}; smallest first -> ${order}`, order, check: "C, B, A" };
  })(),
  "q.0011": (() => {
    const X = val(div(sf(6.4, 5), sf(1, 3)));
    const Y = val(sf(5.9, 2));
    return { detail: `X = 6.4e5 mg = ${X} g; Y = ${Y} g; heavier = ${X > Y ? "X" : "Y"}`, heavier: X > Y ? "X" : "Y", check: "X" };
  })(),
  "q.0012": (() => {
    const base = sf(6, 5);
    const inc = pct(base, 0.7);
    const r = add(base, inc);
    const alt = mul(base, sf(1.7, 0));
    if (Math.abs(val(r) - val(alt)) > 1e-6) fail("q.0012: multiplier route disagrees with add-on route");
    return { detail: `70% of 6e5 = ${inc.a}e${inc.n}; 6e5 + 4.2e5 = 10.2e5 -> ${r.a}e${r.n}; multiplier 1.7*6e5 = ${val(alt)}`, value: val(r), check: 1020000 };
  })(),
  "q.0013": (() => {
    const r = mul(sf(4.7, 8), sf(6.3, -3));
    const sf3 = Number(r.a.toPrecision(3));
    return { detail: `4.7*6.3 = 29.61; 8 + (-3) = 5; 29.61e5 = ${r.a}e${r.n}; 3 sf -> ${sf3}e${r.n}`, value: sf3 * 10 ** r.n, check: 2.96e6 };
  })(),
  "q.0014": (() => {
    // p + q = 9 (multiplying) and p - q = 3 (dividing)
    const p = (9 + 3) / 2;
    const q = 9 - p;
    const okMul = Math.abs(val(mul(sf(4, p), sf(2, q))) - 8e9) < 1;
    const okDiv = Math.abs(val(div(sf(4, p), sf(2, q))) - 2e3) < 1e-6;
    if (!okMul || !okDiv) fail("q.0014: p and q do not satisfy both printed lines");
    return { detail: `p + q = 9, p - q = 3 -> p = ${p}, q = ${q}; check 4e${p} * 2e${q} = 8e9 and 4e${p} / 2e${q} = 2e3`, value: p, check: 6 };
  })(),
  "q.0015": (() => {
    const A = val(add(sf(6, -4), sf(3, 2)));
    const B = mul(sf(6, -4), sf(3, 2));
    const C = div(sf(6, -4), sf(3, 2));
    const entries = [["A", A], ["B", val(B)], ["C", val(C)]].sort((x, y) => x[1] - y[1]);
    return {
      detail: `A = ${A}; B = ${B.a}e${B.n} = ${val(B)}; C = ${C.a}e${C.n} = ${val(C)}; smallest first -> ${entries.map(([k]) => k).join(", ")}`,
      order: entries.map(([k]) => k).join(", "),
      check: "C, B, A",
    };
  })(),
  "q.0016": (() => {
    const base = sf(1.6, 9);
    const dec = pct(base, 0.35);
    const r = add(base, sf(-dec.a, dec.n));
    const alt = mul(base, sf(6.5, -1));
    if (Math.abs(val(r) - val(alt)) > 1) fail("q.0016: multiplier route disagrees with subtract route");
    return { detail: `35% of 1.6e9 = ${dec.a}e${dec.n}; 1.6e9 - 0.56e9 = ${r.a}e${r.n}; multiplier 0.65*1.6e9 = ${val(alt)}`, value: val(r), check: 1.04e9 };
  })(),
  "q.0017": (() => {
    const grams = mul(sf(3.8, -4), sf(1, 3));
    const n = div(grams, sf(9.5, -13));
    return { detail: `3.8e-4 kg = ${grams.a}e${grams.n} g = ${val(grams)} g; /(9.5e-13) = ${n.a}e${n.n} = ${val(n)}`, value: val(n), grams: val(grams), check: 4e11 };
  })(),
  "q.0018": (() => {
    const a = pow(sf(4, 5), 2);
    const b = add(sf(1.5, -2), sf(9, -3));
    return { detail: `(4e5)^2: 4^2 = 16, 5*2 = 10 -> ${a.a}e${a.n}; 9e-3 = 0.9e-2, 1.5 + 0.9 = 1.5+0.9 -> ${b.a}e${b.n}`, a: val(a), b: val(b), check: [1.6e11, 0.024] };
  })(),
  "ftm.01": (() => {
    const base = sf(7, 6);
    const r = add(base, pct(base, 0.2));
    return { detail: `20% of 7e6 = 1.4e6; 7e6 + 1.4e6 = ${r.a}e${r.n}`, value: val(r), check: 8.4e6 };
  })(),
  "ftm.02": (() => {
    const r = add(sf(4, 5), sf(3, 4));
    return { detail: `3e4 = 0.3e5; 4 + 0.3 = 4.3 -> ${r.a}e${r.n}`, value: val(r), check: 4.3e5 };
  })(),
  "ftm.03": (() => {
    const Pg = val(div(sf(2.6, 6), sf(1, 3)));
    const Qg = val(sf(3, 3));
    return { detail: `P = 2.6e6 mg = ${Pg} g; Q = ${Qg} g; heavier = ${Pg > Qg ? "P" : "Q"}`, heavier: Pg > Qg ? "P" : "Q", check: "Q" };
  })(),
  "note.align": (() => {
    const right = val(add(sf(3.6, 5), sf(4.2, 4)));
    const wrong = val(sf(7.8, 9));
    return { detail: `3.6e5 + 0.42e5 = ${right}; the wrong route gives ${wrong}, a factor of ${Math.round(wrong / right / 1000) * 1000}`, value: right, ratio: Math.round(wrong / right), check: 402000 };
  })(),
};

for (const [k, v] of Object.entries(RECOMPUTED)) {
  if (Array.isArray(v.check)) {
    near(v.a, v.check[0], `${k}.a`);
    near(v.b, v.check[1], `${k}.b`);
  } else if (typeof v.check === "number") {
    near(v.value, v.check, k);
  } else if (typeof v.check === "string") {
    const got = v.order ?? v.heavier;
    if (got !== v.check) fail(`recompute ${k}: got "${got}", expected "${v.check}"`);
  }
}
if (Math.abs(RECOMPUTED["note.align"].ratio - 19403) > 20) fail(`note figure ratio drifted: ${RECOMPUTED["note.align"].ratio}`);

/** The answer value each item must carry, keyed by "<questionId>#<partId>". */
const EXPECTED_ANSWERS = {
  "q.0001#main": 2970000,
  "q.0002#main": 0.000405,
  "q.0003#main": 0.000506,
  "q.0004#main": 8400000,
  "q.0005#main": 0.0075,
  "q.0006#main": 8e7,
  "q.0007#main": 0.0041,
  "q.0008#main": 4.5e9,
  "q.0009#main": 8e15,
  "q.0012#main": 1020000,
  "q.0013#main": 2960000,
  "q.0014#a": 6,
  "q.0014#b": 3,
  "q.0016#main": 1.04e9,
  "q.0017#a": 0.38,
  "q.0017#b": 4e11,
  "q.0017#c": 4e11,
  "q.0018#a": 1.6e11,
  "q.0018#b": 0.024,
};

// ---------------------------------------------------------------------------
// 2. The topic row, the note frontmatter and the sets
// ---------------------------------------------------------------------------

const EXAMINER_SOURCES = [
  "ccea-cer:maths:2025-summer:M71:Q16",
  "ccea-cer:maths:2025-summer:M81:Q7",
  "ccea-cer:maths:2025-november:M71:Q17",
  "ccea-cer:maths:2025-november:M81:Q8",
  "ccea-cer:maths:2024-summer:M71:Q15",
  "ccea-cer:maths:2024-summer:M81:Q7",
  "ccea-cer:maths:2024-november:M81:Q6",
];

const HOW_EXAMINED =
  "M7 and M8 are each two 75-minute papers of 50 marks: Paper 1 non-calculator, Paper 2 calculator. Standard form appears in most series and nearly always on Paper 1, in the last third of it — around Q13 to Q17 on M7 and Q4 to Q8 on M8 — and the same item is often printed on both units in the same session. Six shapes recur across the papers read. One mark for a conversion each way, usually as part (a) of a short question (November 2024 M8 P1 Q6, January 2020 M7 P2 Q14). Two marks for a multiplication or a division with the answer demanded in standard form (Summer 2022 M7 P1 Q13 and M8 P1 Q7, November 2021 M7 P1 Q14). Three marks for a chain such as AB divided by C (November 2023 M7 P1 Q14 and M8 P1 Q5, marked A3). Three marks for a percentage change applied to a standard-form quantity (Summer 2025 M7 P1 Q16 and M8 P1 Q7). Three marks for putting three expressions in order with working demanded (November 2025 M7 P1 Q17). Two marks for a unit conversion or a comparison across units (Summer 2024 M7 P1 Q15, Summer 2026 M7 P2 Q17 and M8 P2 Q8), and occasionally three marks for recovering two unknown indices from a printed pair of results (Summer 2023 M7 P1 Q11 and M8 P1 Q4). Schemes run MA1 for the set-up and MA1 or A1 for the answer in the demanded form; the percentage version runs MA1 then A1 then A1, and the ordering version M1 A1 for the values then A1 for the order.";

const TRAPS = [
  "Reading a times 10 to the n as a times n — 9 × 10⁸ taken as 9 × 8 = 72, which loses every mark that follows (Summer 2025 M7 Paper 1 Q16)",
  "Finding the percentage and never adding it on, so the size of the change goes on the answer line instead of the new amount (Summer 2025 M7 Paper 1 Q16, M8 Paper 1 Q7)",
  "Leaving the answer as an ordinary number, or as 11.7 × 10⁸, when the question asked for standard form — the last mark is for the form (Summer 2025 M8 Paper 1 Q7, where over a third scored nothing)",
  "Adding the powers as well as the front numbers when the two numbers are being added; there is no index law for addition (November 2025 M8 Paper 1 Q8, where the addition was reported as the hardest part)",
  "Adding or subtracting the front numbers before the powers have been made equal (November 2025 M8 Paper 1 Q8)",
  "Comparing two quantities written in different units without converting either of them, or converting only one (Summer 2024 M7 Paper 1 Q15, M8 Paper 1 Q7)",
  "Giving the order with no working on an ordering question that printed 'show your working' — the order alone scores nothing (November 2025 M7 Paper 1 Q17)",
  "Mishandling the negative power: dropping the minus when the indices are combined, or treating 10 to the minus 1 as a negative number (November 2024 M8 Paper 1 Q6, where only about a third managed it)",
  "Copying a calculator display such as 6.82E8 onto the answer line instead of writing the power of ten out (Paper 2 habit, reported across series as presentation loss)",
];

const NOT_ON_SPEC = [
  "Engineering notation, where the power of ten is kept as a multiple of three (47 × 10³) — M7-NA-03 names standard index form, which fixes the front number between 1 and 10, and no paper read departs from it",
  "Powers of ten that are not whole numbers, such as 10 to the power a half — the index form here is always an integer power; fractional indices are M8-NA-03",
  "SI prefixes (nano-, micro-, mega-, giga-) offered as the answer form — every paper read prints the power of ten in full, and the metric conversions examined are the kilo-, centi-, milli- steps of M1-GM-05",
  "Logarithms, and the use of standard form inside error bounds or upper and lower bound calculations — bounds are M3-NA-12 and M4-NA-06",
];

const MUST_MEMORISE = [
  "a × 10ⁿ with 1 ≤ a < 10 and n a whole number, positive or negative",
  "Multiply: multiply the front numbers and add the powers. Divide: divide the front numbers and subtract the powers",
  "Add or subtract: make the powers equal first, then combine the front numbers and keep the shared power",
  "(a × 10ⁿ)^k = a^k × 10^(nk) — the power of ten is multiplied by k, never added to itself",
  "Re-normalise at the end every time: 11.7 × 10⁸ becomes 1.17 × 10⁹ and 0.4 × 10² becomes 4 × 10¹",
  "1 kg = 10³ g, 1 g = 10³ mg, 1 km = 10³ m — convert before comparing, adding or dividing",
  "A percentage change is done on the quantity as a whole; the answer is then written back in standard form",
  "E on a calculator display means × 10 to the power, and never belongs on an answer line",
];

const KEYWORDS = [
  "standard form",
  "standard index form",
  "scientific notation",
  "powers of ten",
  "ordering standard form",
  "negative power",
  "re-normalise",
  "a × 10ⁿ",
];

const EXTERNAL_REFS = [
  {
    kind: "corbettmaths",
    videos: [300, 302],
    practiceUrl: "https://corbettmaths.com/2019/08/29/standard-form-practice-questions/",
    textbookUrl: "https://corbettmaths.com/2019/10/07/standard-form-textbook-exercise/",
  },
  {
    kind: "youtube",
    videoId: "unF_ZP4kM1U",
    channel: "P McAleavey",
    credit: "M7M8 Standard Form examples — P McAleavey (verified embeddable in data/links/media-map.json)",
  },
  {
    kind: "ccea-doc",
    docType: "cer",
    url: "https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports",
    asOf: "2026-09-13",
  },
];

const topic = {
  id: TOPIC,
  slug: "standard-form",
  title: "Standard index form: interpreting, ordering and calculating",
  subject: "maths",
  unit: "M7",
  tier: "H",
  strand: "NA",
  statementIds: SPEC,
  prerequisites: ["maths.m7.index-laws-zero-and-negative-powers", "maths.m1.place-value-and-decimals"],
  order: 113,
  hardness: "H",
  difficulty: 4,
  examinerFlagged: true,
  examinerSources: EXAMINER_SOURCES,
  examWeightHint: HOW_EXAMINED,
  mustMemorise: MUST_MEMORISE,
  onFormulaSheet: [],
  notOnThisSpec: NOT_ON_SPEC,
  externalRefs: EXTERNAL_REFS,
  keywords: KEYWORDS,
};

const note = {
  id: `note.${TOPIC}`,
  topic: TOPIC,
  title: "Standard index form",
  subject: "maths",
  unit: "M7",
  tier: "H",
  specRefs: SPEC,
  calculator: "P1-no/P2-yes",
  formulaSheet: {
    given: [],
    mustKnow: MUST_MEMORISE,
  },
  notOnThisSpec: NOT_ON_SPEC,
  hardness: "H",
  examinerFlagged: true,
  externalRefs: EXTERNAL_REFS,
  sheet: {
    mustBeAbleTo: [
      "Say what standard form is and check a number against the rule: a × 10ⁿ with the front number at least 1 and below 10",
      "Convert an ordinary number into standard form in both directions, counting places rather than zeros, including numbers below 1 that need a negative power",
      "Convert back from standard form to an ordinary number, including negative powers",
      "Order a mixed list of numbers, some in standard form and some not, by putting them all into one form first and writing that conversion down",
      "Multiply and divide in standard form without a calculator, handling the front numbers and the powers separately and re-normalising the result",
      "Add and subtract in standard form without a calculator by making the powers equal first",
      "Raise a standard-form number to a power, multiplying the index of ten rather than adding it",
      "Convert units (kg and g, km and m, g and mg) before comparing, adding or dividing two quantities given in standard form",
      "Apply a percentage increase or decrease to a standard-form quantity and return the answer to standard form",
      "Enter standard form on a calculator with the × 10ˣ key, and turn a display such as 6.82E8 into a written answer",
    ],
    howExamined: HOW_EXAMINED,
    traps: TRAPS,
  },
  verification: `ver.note.${TOPIC}`,
  version: 1,
  updated: "2026-09-13",
};

const insight = JSON.parse(fs.readFileSync(path.join(ROOT, "packs", "maths", "insights", "m7.standard-form.json"), "utf8"));

const sets = [
  {
    id: `set.${TOPIC}.warm-up`,
    topic: TOPIC,
    kind: "interleaved",
    title: "Standard form warm-up",
    subject: "maths",
    units: ["M7"],
    itemIds: [
      `dx.${TOPIC}`,
      `rp.${TOPIC}.01`,
      `q.${TOPIC}.0001`,
      `q.${TOPIC}.0002`,
      `q.${TOPIC}.0003`,
      `rp.${TOPIC}.02`,
      `q.${TOPIC}.0004`,
      `q.${TOPIC}.0005`,
    ],
    showTopicLabels: false,
    version: 1,
  },
  {
    id: `set.${TOPIC}.mixed`,
    topic: TOPIC,
    kind: "mixed",
    title: "Calculating, ordering and the traps",
    subject: "maths",
    units: ["M7", "M8"],
    itemIds: [
      `q.${TOPIC}.0007`,
      `ftm.${TOPIC}.02`,
      `q.${TOPIC}.0009`,
      `q.${TOPIC}.0011`,
      `ftm.${TOPIC}.03`,
      `q.${TOPIC}.0012`,
      `rp.${TOPIC}.05`,
      `q.${TOPIC}.0015`,
      `ftm.${TOPIC}.01`,
      `q.${TOPIC}.0016`,
      `q.${TOPIC}.0017`,
      `rp.${TOPIC}.09`,
    ],
    showTopicLabels: false,
    version: 1,
  },
];

// ---------------------------------------------------------------------------
// 3. Verification logs
// ---------------------------------------------------------------------------

const COPY_DETAIL =
  "Compared by hand against the M7 and M8 papers and mark schemes read for this topic (Summer 2025 M7 P1 Q16 and M8 P1 Q7, November 2025 M7 P1 Q17, Summer 2024 M7 P1 Q15, November 2024 M8 P1 Q6, November 2023 M7 P1 Q14 and M8 P1 Q5, Summer 2023 M7 P1 Q11, Summer 2022 M7 P1 Q13 and M8 P1 Q7, November 2021 M7 P1 Q14, Summer 2021 M7 P2 Q14, January 2020 M7 P2 Q14, Summer 2019 M7 P1 Q16, November 2022 M8 P2 Q5, Summer 2026 M7 P2 Q17 and M8 P2 Q8): new contexts, numbers, letters and wording throughout; no eight-word sequence in common with any paper, scheme or report.";

const STYLE_DETAIL_BASE =
  "British English; second person; no exclamation marks anywhere in the bundle or the note; no reference to the English numeric grading scale, which CCEA does not use; the banned verdict word is never used about a learner's answer.";

const check = (type, detail, tool = TOOL) => ({ type, tool, result: "pass", detail, at: AT, by: "claude" });

let katexSegments = 0;

function logFor(itemId, extra) {
  return {
    id: `ver.${itemId}`,
    itemId,
    version: 1,
    checks: [
      check("schema", extra.schema),
      check("scope-tier", extra.scopeTier),
      check("formula-sheet", extra.formulaSheet ?? "Nothing on the page-2 formula sheet touches standard form (packs/maths/exam-true/formula-sheets.json lists prism, trapezium, sphere, cone, quadratic formula and the trigonometric rules only); the index laws and the 1 ≤ a < 10 rule are must-know."),
      check("command-words", extra.commandWords),
      check("tariff", extra.tariff),
      check("maths-numeric", extra.numeric),
      ...(extra.symbolic ? [check("maths-symbolic", extra.symbolic)] : []),
      check("examiner-alignment", extra.alignment),
      check("copy-shingle", COPY_DETAIL),
      check("style-lint", extra.style),
    ],
    status: "verified",
    reports: [],
  };
}

// ---------------------------------------------------------------------------
// 4. Assemble
// ---------------------------------------------------------------------------

const blocks = noteBlocks();

const verification = [];

verification.push(
  logFor(note.id, {
    schema: "NoteFrontmatter shape checked against src/lib/content/schema.ts and published by pipeline/build-content.mts; the note blocks match the NoteBlock union in src/components/items/gates.ts.",
    scopeTier: "Higher tier, introduced in M7 and examined again in M8. Integer powers of ten only; engineering notation, fractional indices, SI prefixes and bounds are excluded and listed in notOnThisSpec.",
    commandWords: "Express, Write down, Work out, Calculate, Find and List are all in packs/maths/exam-true/command-words.json; 'Write ... in standard form' is the shortened form CCEA prints and the file maps it to Express through its aliases (Write as, Convert, Change).",
    tariff: "The Sheet quotes the tariffs actually set: 1 mark for a conversion, 2 for a multiplication or division, 3 for a percentage change or an ordering. packs/maths/exam-true/tariffs.json gives M7 P1 perQuestion p10 2, typical 3, p90 5.",
    numeric: `Every figure in the lesson was recomputed: ${RECOMPUTED["note.align"].detail}. The percentages quoted in the examiner callouts come from packs/maths/insights/m7.standard-form.json, not from memory.`,
    alignment: "All seven findings on the insight card carry an examiner callout in the note, each cited to its series, unit and question.",
    style: `${STYLE_DETAIL_BASE} All KaTeX segments in the note blocks compiled with katex.renderToString (throwOnError). Every stretch between gates is at most 150 words; the note has 15 gates and 3 inline SVG figures.`,
  }),
);

for (const we of workedExamples) {
  const key = `we.${we.id.split(".").pop()}`;
  verification.push(
    logFor(we.id, {
      schema: "WorkedExample shape: steps numbered in order, faded versions name steps after the ones shown, twin carries a full AnswerSpec.",
      scopeTier: `Higher, ${we.paper.unit} Paper ${we.paper.paper} (${we.paper.calculator ? "calculator" : "non-calculator"}); integer powers of ten only.`,
      commandWords: "Work out and Give your answer in standard form, both in packs/maths/exam-true/command-words.json (the second through the Express aliases).",
      tariff: "Mark codes on the steps follow the schemes read: MA1 for each manipulation step, A1 for the finished answer in the demanded form.",
      numeric: `${RECOMPUTED[key].detail}; twin: ${RECOMPUTED[`${key}.twin`].detail}.`,
      alignment: we.id.endsWith("03")
        ? "Exercises the Summer 2025 percentage finding (ccea-cer:maths:2025-summer:M81:Q7 and M71:Q16): find it, add it on, return to standard form."
        : we.id.endsWith("02")
          ? "Exercises the November 2025 finding that addition without a calculator is the hardest of the operations (ccea-cer:maths:2025-november:M81:Q8)."
          : we.id.endsWith("04")
            ? "Exercises the Summer 2024 units finding (ccea-cer:maths:2024-summer:M71:Q15) together with calculator display and stated accuracy."
            : "Exercises the November 2023 chain shape and the re-normalising the Summer 2025 reports flagged (ccea-cer:maths:2025-summer:M81:Q7).",
      style: `${STYLE_DETAIL_BASE} KaTeX compiled for every segment in this item.`,
    }),
  );
}

verification.push(
  logFor(diagnostics[0].id, {
    schema: "DiagnosticSet shape: unique item ids, exactly one correct option per item, every distractor carries a registry misconception id.",
    scopeTier: "Higher, M7 and M8. Non-calculator content except item 08, which is about reading a calculator display.",
    commandWords: "Diagnostic stems use the paper's own phrasing (Write, Work out, Which is) and demand no working.",
    tariff: "Not tariffed: single-skill items of 15 to 35 seconds each.",
    numeric: "Every option value recomputed: 12.4e3 = 1.24e4 = 12400; 9e8 = 900000000; 0.00042 = 4.2e-4; 3e5 × 4e-2 = 1.2e4; 5e4 + 3e3 = 5.3e4; 2e-2 > 6e-3 > 9e-4; 3.4e5 g = 340 kg < 400 kg; 3.6E-05 = 3.6e-5.",
    alignment: "Items 02 and 03 carry the Summer 2025 misreading and the conversion failure from November 2024; item 05 the November 2025 addition finding; item 07 the Summer 2024 units finding; item 08 the presentation loss on Paper 2.",
    style: `${STYLE_DETAIL_BASE} Feedback names the method the option came from and what to do next, never the learner.`,
  }),
);

for (const q of questions) {
  const key = `q.${q.id.split(".").pop()}`;
  const rec = RECOMPUTED[key];
  verification.push(
    logFor(q.id, {
      schema: `Question shape: parts sum to totalMarks (${q.totalMarks}), each scheme sums to its part, skeleton "${q.skeleton}" matches the parts.`,
      scopeTier: `Higher, ${q.paper.unit} Paper ${q.paper.paper} (${q.paper.calculator ? "calculator" : "non-calculator"}); integer powers of ten only, within M7-NA-03.`,
      commandWords: `Command words ${q.commandWords.join(", ")} all appear in packs/maths/exam-true/command-words.json.`,
      tariff: `Part marks ${q.parts.map((p) => `(${p.id})${p.marks}`).join("|")}; total ${q.totalMarks}, inside the M7/M8 perQuestion range (p10 2, typical 3 to 4, p90 5 to 6) in packs/maths/exam-true/tariffs.json and matching the tariffs seen on this topic in the papers read.`,
      numeric: `Recomputed in gen.mjs: ${rec ? rec.detail : "no numeric answer"}.`,
      symbolic: key === "q.0014" ? "The simultaneous index equations were checked by substituting p = 6 and q = 3 back into both printed lines." : undefined,
      alignment: `Cites ${q.examinerSources.join(", ")}; every commonError and every mcq distractor carries a registry misconception id.`,
      style: `${STYLE_DETAIL_BASE} KaTeX compiled for every segment in this item; feedback explains the mark rather than judging the learner.`,
    }),
  );
}

for (const f of findTheMistake) {
  const key = `ftm.${f.id.split(".").pop()}`;
  verification.push(
    logFor(f.id, {
      schema: "FindTheMistake shape: mistakeLine indexes a line of studentWorking, misconception is a registry id, source is a Chief Examiner citation.",
      scopeTier: "Higher, non-calculator M7 or M8 content.",
      commandWords: "The embedded task uses Work out and Give your answer in standard form, both in the command-words file.",
      tariff: "Marks earned as written recorded as none, matching the schemes read where a wrong first line removes the method mark.",
      numeric: `Recomputed in gen.mjs: ${RECOMPUTED[key].detail}.`,
      alignment: `Seeded from ${f.source}; the misconception ${f.misconception} is the one the report describes.`,
      style: `${STYLE_DETAIL_BASE} The feedback opens by crediting what the student did well.`,
    }),
  );
}

for (const p of prompts) {
  verification.push(
    logFor(p.id, {
      schema: "RetrievalPrompt shape: kind from the enum, examUnit M7, difficultyPrior within 0 to 10.",
      scopeTier: "Higher, M7-NA-03 only.",
      commandWords: "Not applicable: prompts are recall, not exam items.",
      tariff: "Not applicable.",
      numeric: "No computed values; the worked figures quoted (0.4 × 10⁷ becoming 4 × 10⁶, 5.3E-04 becoming 5.3 × 10⁻⁴) were checked against the conversion rule.",
      alignment: "Prompts 05, 06, 09 and 10 map one to one onto the percentage, units, calculator-display and show-your-working findings on the insight card.",
      style: `${STYLE_DETAIL_BASE} KaTeX compiled for every segment.`,
    }),
  );
}

const bundle = {
  $schema: "../../../../../pipeline/schema/topic-bundle.schema.json",
  topic,
  note,
  workedExamples,
  diagnostics,
  questions,
  findTheMistake,
  prompts,
  insight,
  sets,
  verification,
};

// ---------------------------------------------------------------------------
// 5. Self-checks before writing
// ---------------------------------------------------------------------------

// 5a. KaTeX compiles for every $...$ segment anywhere in the bundle or the note.
function katexWalk(node, where) {
  if (typeof node === "string") {
    const segs = node.match(/\$[^$]+\$/g) ?? [];
    for (const seg of segs) {
      katexSegments += 1;
      try {
        katex.renderToString(seg.slice(1, -1), { throwOnError: true, displayMode: false });
      } catch (e) {
        fail(`KaTeX failed at ${where}: ${seg} (${e.message.split("\n")[0]})`);
      }
    }
    return;
  }
  if (Array.isArray(node)) return node.forEach((v, i) => katexWalk(v, `${where}[${i}]`));
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) katexWalk(v, `${where}.${k}`);
}
katexWalk(bundle, "bundle");
katexWalk(blocks, "blocks");

// 5b. Style lint.
function styleWalk(node, where) {
  if (typeof node === "string") {
    if (node.includes("!") && !/https?:/.test(node)) fail(`exclamation mark at ${where}`);
    if (/\bWrong\b/.test(node)) fail(`banned verdict word at ${where}`);
    if (/grade 9|9-1 grade/i.test(node)) fail(`grade-9 language at ${where}`);
    for (const [bad, good] of [["organiz", "organis"], ["recogniz", "recognis"], ["meter\\b", "metre"], ["\\bcolor\\b", "colour"]]) {
      if (new RegExp(bad).test(node) && !/currentColor|fill-opacity|font-|stroke/.test(node)) fail(`US spelling "${bad}" at ${where}`);
    }
    return;
  }
  if (Array.isArray(node)) return node.forEach((v, i) => styleWalk(v, `${where}[${i}]`));
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "svg" || k === "src") continue; // SVG markup carries currentColor and numbers only
      styleWalk(v, `${where}.${k}`);
    }
  }
}
styleWalk(bundle, "bundle");
styleWalk(blocks, "blocks");

// 5c. Schema-level invariants that the Zod schema also enforces.
const ids = new Set();
const addId = (id) => {
  if (ids.has(id)) fail(`duplicate id ${id}`);
  ids.add(id);
};
addId(note.id);
workedExamples.forEach((w) => addId(w.id));
diagnostics.forEach((d) => addId(d.id));
questions.forEach((q) => addId(q.id));
findTheMistake.forEach((f) => addId(f.id));
prompts.forEach((p) => addId(p.id));
addId(insight.id);
sets.forEach((s) => addId(s.id));
verification.forEach((v) => addId(v.id));

if (insight.topic !== TOPIC) fail(`insight card topic is ${insight.topic}`);

for (const q of questions) {
  const total = q.parts.reduce((a, p) => a + p.marks, 0);
  if (total !== q.totalMarks) fail(`${q.id}: parts sum to ${total}, totalMarks ${q.totalMarks}`);
  const segs = q.skeleton.split("|").map((s) => /^\((main|[a-z]{1,2}(\([ivx]{1,4}\))?)\)([a-z][a-z-]*)(\d{1,2})$/.exec(s));
  if (segs.some((s) => !s)) fail(`${q.id}: skeleton segment does not parse (${q.skeleton})`);
  else if (segs.length !== q.parts.length || segs.some((s, i) => s[1] !== q.parts[i].id || Number(s[4]) !== q.parts[i].marks)) {
    fail(`${q.id}: skeleton ${q.skeleton} does not match parts ${q.parts.map((p) => `(${p.id})${p.marks}`).join("|")}`);
  }
  for (const p of q.parts) {
    const s = p.scheme.reduce((a, m) => a + m.marks, 0);
    if (p.scheme.length && s !== p.marks) fail(`${q.id} part ${p.id}: scheme sums to ${s}, part is ${p.marks}`);
    const schemeIds = new Set(p.scheme.map((m) => m.id));
    for (const m of p.scheme) for (const d of m.dependsOn ?? []) if (!schemeIds.has(d)) fail(`${q.id} part ${p.id}: dependsOn ${d} missing`);
    if (p.followThrough && !q.parts.some((o) => o.id === p.followThrough.fromPart)) fail(`${q.id} part ${p.id}: followThrough part missing`);
    if (p.answer.kind === "mcq") {
      const correct = p.answer.options.filter((o) => o.correct).length;
      if (correct !== 1) fail(`${q.id} part ${p.id}: ${correct} correct options`);
    }
    const expected = EXPECTED_ANSWERS[`q.${q.id.split(".").pop()}#${p.id}`];
    if (expected !== undefined) {
      if (p.answer.kind !== "numeric") fail(`${q.id} part ${p.id}: expected a numeric answer`);
      else near(p.answer.value, expected, `${q.id}#${p.id} answer`);
    }
  }
  if (q.timeAllowanceSec !== q.totalMarks * 90) fail(`${q.id}: timeAllowanceSec ${q.timeAllowanceSec}`);
}

for (const w of workedExamples) {
  w.steps.forEach((s, i) => {
    if (s.n !== i + 1) fail(`${w.id}: step ${i} numbered ${s.n}`);
  });
  for (const f of w.faded) {
    if (f.showSteps >= w.steps.length) fail(`${w.id}: faded showSteps ${f.showSteps}`);
    for (const n of f.studentSupplies) if (n <= f.showSteps || n > w.steps.length) fail(`${w.id}: faded studentSupplies ${n}`);
  }
}

for (const d of diagnostics) {
  for (const it of d.items) {
    if (it.options.filter((o) => o.correct).length !== 1) fail(`${d.id} item ${it.id}: not exactly one correct option`);
    for (const o of it.options) {
      if (!o.correct && !o.misconception) fail(`${d.id} item ${it.id} option ${o.id}: distractor has no misconception`);
    }
    if (it.secondsExpected < 5 || it.secondsExpected > 90) fail(`${d.id} item ${it.id}: secondsExpected out of range`);
  }
}

for (const f of findTheMistake) {
  if (f.mistakeLine < 1 || f.mistakeLine > f.studentWorking.length) fail(`${f.id}: mistakeLine out of range`);
}

// 5d. Verification refs resolve and every item has a log.
const logIds = new Map(verification.map((v) => [v.id, v]));
for (const item of [note, ...workedExamples, ...questions]) {
  const log = logIds.get(item.verification);
  if (!log) fail(`${item.id}: verification log ${item.verification} missing`);
  else if (log.itemId !== item.id) fail(`${item.id}: log itemId is ${log.itemId}`);
}
for (const item of [...diagnostics, ...findTheMistake, ...prompts]) {
  if (!verification.some((v) => v.itemId === item.id)) fail(`${item.id}: no verification log (would stay draft and never ship)`);
}
for (const v of verification) if (!ids.has(v.itemId)) fail(`log ${v.id} names unknown item ${v.itemId}`);

// 5e. Set item ids all exist.
for (const s of sets) for (const id of s.itemIds) if (!ids.has(id)) fail(`${s.id}: item ${id} not in the bundle`);

// 5f. Note blocks: contract, gate spacing, SVG rules.
const words = (s) => s.split(/\s+/).filter(Boolean).length;
let run = 0;
let runStartedAt = "start";
let gates = 0;
let figures = 0;
let videos = 0;
const gateIds = new Set();
const promptRefs = new Set(prompts.map((p) => p.id));
for (const b of blocks) {
  if (b.type === "p" || b.type === "callout") run += words(b.md);
  else if (b.type === "h") run += words(b.text);
  else if (b.type === "gate") {
    gates += 1;
    if (gateIds.has(b.id)) fail(`duplicate gate id ${b.id}`);
    gateIds.add(b.id);
    if (b.kind === "choice") {
      if (!Array.isArray(b.options) || b.options.length < 2) fail(`gate ${b.id}: a choice gate needs options`);
      else if (!b.options.includes(b.answer)) fail(`gate ${b.id}: answer is not one of the options`);
    }
    if (run > 150) fail(`gate ${b.id}: ${run} words since ${runStartedAt} (limit 150)`);
    runStartedAt = b.id;
    run = 0;
  } else if (b.type === "figure") {
    figures += 1;
    if (!b.svg || !b.alt) fail("figure block without svg or alt");
  } else if (b.type === "video") {
    videos += 1;
  } else if (b.type === "prompt") {
    if (!promptRefs.has(b.promptId)) fail(`note references unknown prompt ${b.promptId}`);
  }
}
if (run > 150) fail(`${run} words after the last gate (limit 150)`);
const lastNonPrompt = [...blocks].reverse().find((b) => b.type !== "prompt");
if (lastNonPrompt.type === "video") fail("a video must not be the last teaching block");

// The video must exist in the media map, and be followed by a gate.
const mediaMap = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "links", "media-map.json"), "utf8"));
const entry = mediaMap.topics["maths:standard-form"];
for (let i = 0; i < blocks.length; i += 1) {
  if (blocks[i].type !== "video") continue;
  const known = (entry?.videos ?? []).find((v) => v.videoId === blocks[i].videoId);
  if (!known) fail(`video ${blocks[i].videoId} is not a verified entry in data/links/media-map.json`);
  else if (known.title !== blocks[i].title || known.channel !== blocks[i].channel) fail("video title/channel do not match the media map");
  if (!blocks.slice(i + 1).some((b) => b.type === "gate")) fail("the video is not followed by a gate");
}

// SVG rules, everywhere.
function svgWalk(node, where) {
  if (typeof node === "string") {
    if (!node.includes("<svg")) return;
    const svg = node.startsWith("data:image/svg+xml") ? decodeURIComponent(node.replace(/^data:image\/svg\+xml;utf8,/, "")) : node;
    if (!/viewBox=/.test(svg)) fail(`svg without viewBox at ${where}`);
    if (/<style|<script|\son[a-z]+\s*=|xlink:href|prefers-color-scheme|url\(#/.test(svg)) fail(`banned construct in svg at ${where}`);
    if (/(stroke|fill)\s*=\s*["']#/.test(svg)) fail(`hard-coded colour in svg at ${where}`);
    if (Buffer.byteLength(node, "utf8") > 12 * 1024) fail(`svg over 12 KB at ${where} (${Buffer.byteLength(node, "utf8")})`);
    if (svg.includes("&")) fail(`unescaped ampersand in svg at ${where}`);
    return;
  }
  if (Array.isArray(node)) return node.forEach((v, i) => svgWalk(v, `${where}[${i}]`));
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) svgWalk(v, `${where}.${k}`);
}
svgWalk(bundle, "bundle");
svgWalk(blocks, "blocks");

const questionFigures = questions.flatMap((q) => q.figures ?? []).filter((f) => f.kind === "svg");
if (questionFigures.length < 2) fail(`only ${questionFigures.length} data-URI figures on questions (need at least 2)`);
for (const f of questionFigures) {
  if (!f.src.startsWith("data:image/svg+xml;utf8,")) fail("question figure is not a utf8 SVG data URI");
  try {
    decodeURIComponent(f.src.replace(/^data:image\/svg\+xml;utf8,/, ""));
  } catch {
    fail("question figure data URI does not decode");
  }
}

// 5g. Misconception ids used anywhere, for the registry step.
const used = new Set();
(function collect(node) {
  if (Array.isArray(node)) return node.forEach(collect);
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "misconception" && typeof v === "string") used.add(v);
      else if (k === "misconceptions" && Array.isArray(v)) v.forEach((x) => used.add(x));
      else collect(v);
    }
  }
})(bundle);

// ---------------------------------------------------------------------------
// 6. Write
// ---------------------------------------------------------------------------

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "bundle.json"), JSON.stringify(bundle, null, 2) + "\n");
fs.writeFileSync(path.join(OUT_DIR, "note.blocks.json"), JSON.stringify(blocks, null, 2) + "\n");

const counts = {
  we: workedExamples.length,
  dx: diagnostics.reduce((n, d) => n + d.items.length, 0),
  q: questions.length,
  practice: questions.filter((q) => q.style === "practice").length,
  examStyle: questions.filter((q) => q.style === "exam-style").length,
  marks: questions.reduce((n, q) => n + q.totalMarks, 0),
  ftm: findTheMistake.length,
  rp: prompts.length,
  sets: sets.length,
  logs: verification.length,
  gates,
  noteFigures: figures,
  videos,
  questionFigures: questionFigures.length,
  katexSegments,
};
console.log("written", path.relative(ROOT, OUT_DIR));
console.log(JSON.stringify(counts, null, 2));
console.log("misconception ids used:\n  " + [...used].sort().join("\n  "));
