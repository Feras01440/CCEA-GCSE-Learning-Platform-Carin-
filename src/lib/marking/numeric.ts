/**
 * Numeric answer-checking engine for GCSE Maths / Science marking.
 *
 * `parseNumeric` turns whatever a student types ("2½", "3√2", "0.(3)",
 * "3.2 × 10⁵", "£4.41", "x = 12.5%") into a value plus, where possible, an
 * exact symbolic form of the shape  (num/den) · √rad · π^pi.
 *
 * `checkNumeric` marks a parsed answer against a `NumericSpec`, producing a
 * verdict with a diagnostic reason and short tutor-voice feedback.
 *
 * Nothing in this module throws on user input.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type NumericForm =
  | "integer"
  | "decimal"
  | "fraction"
  | "mixed"
  | "surd"
  | "pi"
  | "standard-form"
  | "percent"
  | "recurring";

/**
 * Exact value  (num / den) · √rad · π^pi.
 * For plain rationals `rad === 1` and `pi === 0`, so `{num, den}` alone is
 * the rational value.
 */
export interface ExactValue {
  num: number;
  den: number;
  rad: number;
  pi: number;
}

export interface ParsedNumber {
  value: number;
  exact?: ExactValue | null;
  form: NumericForm;
  unit: string | null;
  raw: string;
  sigFigs: number | null;
  decimalPlaces: number | null;
  /** Whether a fraction / surd was already written in its simplest form. Null when not applicable. */
  simplified?: boolean | null;
  /** Present for standard-form input, e.g. 3.2 × 10^5 → { mantissa: 3.2, exponent: 5 }. */
  standardForm?: { mantissa: number; exponent: number };
}

export type Tolerance =
  | { type: "absolute"; value: number }
  | { type: "relative"; value: number }
  | { type: "sigfigs"; n: number }
  | { type: "dp"; n: number }
  | { type: "range"; min: number; max: number };

export type RequiredForm =
  | "fraction"
  | "surd"
  | "pi"
  | "standard-form"
  | "simplest-fraction"
  | "decimal-dp"
  | "sigfigs";

export interface NumericSpec {
  /** Target value: a number, or an exact expression string such as '3√2', '7/4', '2π', '0.(3)'. */
  value: number | string;
  /**
   * How close is close enough. When omitted: exact / 1e-9 relative; if `dp` /
   * `sigfigs` are set, rounding to that accuracy; otherwise, when the spec value
   * is a rounded decimal (≥ 2 s.f. and ≥ 1 d.p.), any more precise answer —
   * a longer decimal or an exact form such as 3√2 — that rounds to it.
   * Use `{ type: "absolute", value: 0 }` to insist on the value as written.
   */
  tolerance?: Tolerance;
  /** Expected unit (e.g. 'cm²', '£', '%'). Missing units are accepted with a flag unless `requireUnit`. */
  unit?: string | null;
  requireUnit?: boolean;
  /** Only these forms are accepted (any other form is 'wrong-form' even when the value is right). */
  acceptedForms?: NumericForm[];
  /** A single form demanded by the question wording ("in its simplest form", "in standard form"...). */
  requiredForm?: RequiredForm;
  /** Required accuracy in decimal places ("correct to 2 decimal places"). */
  dp?: number;
  /** Required accuracy in significant figures ("correct to 3 significant figures"). */
  sigfigs?: number;
  /** Other fully-correct values (e.g. the second root of a quadratic). */
  alternatives?: Array<number | string>;
  /** Reserved for follow-through marking. Currently ignored. */
  followThrough?: { from: number };
  /**
   * Letters the question uses as variables (mark.ts variableLetters). Against a unit-free key, one of them typed after
   * the number is the variable, not a unit: "4m" for 3m⁰ + m⁰ is not 4 metres (24 Sep 2026).
   */
  variables?: readonly string[];
}

export type VerdictReason =
  | "exact"
  | "within-tolerance"
  | "wrong-value"
  | "unparseable"
  | "wrong-form"
  | "not-simplest"
  | "wrong-unit"
  | "missing-unit"
  | "wrong-accuracy"
  | "sign-error"
  | "reciprocal"
  | "off-by-factor-10"
  | "percent-decimal-confusion"
  | "premature-rounding-suspected";

export interface NumericVerdict {
  correct: boolean;
  parsed: ParsedNumber | null;
  reason: VerdictReason;
  /** Short, tutor-voice, British English. */
  feedback: string;
  nearMiss?: string;
  /** True when the spec expects a unit, the student omitted it, and the answer was still accepted. */
  missingUnit?: boolean;
  /**
   * True when the value is right and only the required unit is missing or wrong: the answer's last mark is the
   * unit's, so a multi-mark part keeps the rest (mark.ts; addenda (B), 24 Sep 2026).
   */
  valueRight?: boolean;
  /**
   * True when the value is right and only its form is not the one asked for (a decimal for a fraction, a fraction not
   * in its lowest terms, a number not in standard form). mark.ts pays marks − 1 unless the form is the task (MK-01).
   */
  formOnly?: boolean;
  /**
   * True when the value is right and only the accuracy the stem instructs is not met: rounded to fewer places or
   * figures than asked, or an exact form where a decimal is asked (the numeric-form ruling, 25 Sep 2026, is symmetric).
   * mark.ts pays marks − 1. More places than asked, and a dropped final zero, are right (the reversal of 27 Sep 2026).
   */
  accuracyOnly?: boolean;
  /** True when a right value was given in another unit of the same kind and converted ("0.08 A" for 80 mA). */
  converted?: boolean;
}

// ---------------------------------------------------------------------------
// Small numeric helpers
// ---------------------------------------------------------------------------

const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a || 1;
}

/** Round half away from zero, guarding against binary noise such as 1.005 → 100.49999. */
export function roundDp(value: number, dp: number): number {
  if (!Number.isFinite(value)) return value;
  const f = Math.pow(10, dp);
  const x = Math.abs(value) * f;
  const nudge = Math.max(Number.EPSILON * x * 8, 1e-12);
  const r = Math.round(x + nudge) / f;
  return value < 0 ? -r : r;
}

function exponent10(value: number): number {
  const a = Math.abs(value);
  let e = Math.floor(Math.log10(a));
  if (Math.pow(10, e + 1) <= a) e += 1;
  if (Math.pow(10, e) > a) e -= 1;
  return e;
}

export function roundSf(value: number, sf: number): number {
  if (!Number.isFinite(value) || value === 0) return value;
  const n = Math.max(1, Math.floor(sf));
  const e = exponent10(value);
  const dp = n - 1 - e;
  if (dp >= 0) return roundDp(value, dp);
  const f = Math.pow(10, -dp);
  const x = Math.abs(value) / f;
  const r = Math.round(x + Number.EPSILON * x * 8) * f;
  return value < 0 ? -r : r;
}

/** Formats a number for display, optionally to a fixed number of d.p. or s.f. */
export function formatNumber(value: number, opts: { dp?: number; sigfigs?: number } = {}): string {
  if (!Number.isFinite(value)) return String(value);
  if (opts.dp !== undefined && opts.dp !== null) {
    const dp = Math.max(0, Math.min(20, Math.floor(opts.dp)));
    const r = roundDp(value, dp);
    const s = (Object.is(r, -0) ? 0 : r).toFixed(dp);
    return s === "-0" || /^-0\.0*$/.test(s) ? s.slice(1) : s;
  }
  if (opts.sigfigs !== undefined && opts.sigfigs !== null) {
    const sf = Math.max(1, Math.min(21, Math.floor(opts.sigfigs)));
    if (value === 0) return sf > 1 ? "0." + "0".repeat(sf - 1) : "0";
    const r = roundSf(value, sf);
    const e = exponent10(r);
    const dp = sf - 1 - e;
    if (dp >= 0) return r.toFixed(Math.min(dp, 100));
    // Large numbers: trailing zeros are needed but toFixed(0) of the rounded value already has them.
    return r.toFixed(0);
  }
  const s = Number(value.toPrecision(12)).toString();
  return s;
}

function nearlyEqual(a: number, b: number, rel = 1e-9): boolean {
  if (a === b) return true;
  const scale = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) <= rel * scale;
}

// ---------------------------------------------------------------------------
// Exact term arithmetic:  (num/den) · √rad · π^pi
// ---------------------------------------------------------------------------

type Term = ExactValue;

interface Node {
  value: number;
  term: Term | null;
}

class ParseFail extends Error {}

const RATIONAL_ONE: Term = { num: 1, den: 1, rad: 1, pi: 0 };

function termValue(t: Term): number {
  return (t.num / t.den) * Math.sqrt(t.rad) * Math.pow(Math.PI, t.pi);
}

function rational(num: number, den: number): Term {
  if (den === 0 || !Number.isFinite(num) || !Number.isFinite(den)) throw new ParseFail("division by zero");
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  return { num: num / g, den: den / g, rad: 1, pi: 0 };
}

/** Whether the term as written could be simplified (tracked by the parser). */
interface SimplifyResult {
  term: Term;
  changed: boolean;
}

/**
 * Square factors are only searched for up to this trial divisor, which bounds
 * the work on a huge radicand (√ of a 16-digit prime) to about a million cheap
 * steps. Every GCSE surd is factorised completely long before that.
 */
const MAX_TRIAL_FACTOR = 1e6;

function simplifyTerm(t: Term): SimplifyResult {
  let { num, den, rad, pi } = t;
  let changed = false;
  if (rad <= 0 || !Number.isFinite(rad)) throw new ParseFail("bad radicand");
  // Pull square factors out of the radicand.
  let i = 2;
  while (i * i <= rad && i <= MAX_TRIAL_FACTOR) {
    while (rad % (i * i) === 0) {
      rad /= i * i;
      num *= i;
      changed = true;
    }
    i += 1;
  }
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  if (g > 1) {
    num /= g;
    den /= g;
    changed = true;
  }
  if (Math.abs(num) > MAX_SAFE || den > MAX_SAFE || rad > MAX_SAFE) throw new ParseFail("overflow");
  return { term: { num, den, rad, pi }, changed };
}

/**
 * `simplifyTerm` for intermediate results: a term that overflows the exact
 * representation simply loses its exact form (the numeric value survives)
 * rather than failing the whole parse.
 */
function trySimplify(t: Term): SimplifyResult | null {
  try {
    return simplifyTerm(t);
  } catch (e) {
    if (e instanceof ParseFail) return null;
    throw e;
  }
}

function termEquals(a: Term, b: Term): boolean {
  const sa = simplifyTerm(a).term;
  const sb = simplifyTerm(b).term;
  if (sa.num === 0 && sb.num === 0) return true;
  return sa.num === sb.num && sa.den === sb.den && sa.rad === sb.rad && sa.pi === sb.pi;
}

function termMul(a: Term, b: Term): Term {
  return { num: a.num * b.num, den: a.den * b.den, rad: a.rad * b.rad, pi: a.pi + b.pi };
}

/** 1 / t  = den / (num √rad π^pi) = den √rad / (num · rad) · π^-pi */
function termInv(t: Term): Term {
  if (t.num === 0) throw new ParseFail("division by zero");
  return { num: t.den, den: t.num * t.rad, rad: t.rad, pi: -t.pi };
}

function termIsRepresentable(t: Term): boolean {
  return t.pi === 0 || t.pi === 1;
}

/** Converts a decimal literal such as '4.41', '.5', '3.2e5' to an exact rational. */
function rationalFromDecimalString(s: string): Term | null {
  const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(s.trim());
  if (!m) return null;
  const [, sign, intPart, fracPart = "", expPart] = m;
  if (intPart === "" && fracPart === "") return null;
  const digits = (intPart || "0") + fracPart;
  if (digits.length > 15) return null;
  let num = Number(digits);
  let den = Math.pow(10, fracPart.length);
  if (expPart !== undefined) {
    const e = Number(expPart);
    if (Math.abs(e) > 15) return null;
    if (e >= 0) num *= Math.pow(10, e);
    else den *= Math.pow(10, -e);
  }
  if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den)) return null;
  if (sign === "-") num = -num;
  return rational(num, den);
}

/** Best-effort exact rational from a JS number that prints with a short decimal expansion. */
function rationalFromNumber(v: number): Term | null {
  if (!Number.isFinite(v)) return null;
  const s = v.toString();
  if (/e/i.test(s)) {
    const r = rationalFromDecimalString(s);
    return r;
  }
  return rationalFromDecimalString(s);
}

// ---------------------------------------------------------------------------
// Character maps
// ---------------------------------------------------------------------------

const VULGAR: Record<string, [number, number]> = {
  "½": [1, 2],
  "⅓": [1, 3],
  "⅔": [2, 3],
  "¼": [1, 4],
  "¾": [3, 4],
  "⅕": [1, 5],
  "⅖": [2, 5],
  "⅗": [3, 5],
  "⅘": [4, 5],
  "⅙": [1, 6],
  "⅚": [5, 6],
  "⅐": [1, 7],
  "⅛": [1, 8],
  "⅜": [3, 8],
  "⅝": [5, 8],
  "⅞": [7, 8],
  "⅑": [1, 9],
  "⅒": [1, 10],
};
const VULGAR_CLASS = "[" + Object.keys(VULGAR).join("") + "]";

const SUPERSCRIPT: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁻": "-",
  "⁺": "+",
};

function superscriptToAscii(s: string): string {
  return s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => SUPERSCRIPT[c] ?? c);
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

interface UnitInfo {
  dim: string;
  /** Scale factor to the dimension's base unit, as an exact rational [num, den]. */
  factor: [number, number];
}

const UNIT_TABLE: Record<string, UnitInfo> = {
  // money
  "£": { dim: "money", factor: [1, 1] },
  p: { dim: "money", factor: [1, 100] },
  $: { dim: "dollars", factor: [1, 1] },
  "€": { dim: "euros", factor: [1, 1] },
  // length
  mm: { dim: "length", factor: [1, 1000] },
  cm: { dim: "length", factor: [1, 100] },
  m: { dim: "length", factor: [1, 1] },
  km: { dim: "length", factor: [1000, 1] },
  // area
  "mm²": { dim: "area", factor: [1, 1000000] },
  "cm²": { dim: "area", factor: [1, 10000] },
  "m²": { dim: "area", factor: [1, 1] },
  "km²": { dim: "area", factor: [1000000, 1] },
  // volume
  // The volume base unit is the litre (1 l = 1 dm³), so 1 mm³ = 10⁻⁶ l.
  "mm³": { dim: "volume", factor: [1, 1000000] },
  "cm³": { dim: "volume", factor: [1, 1000] },
  "m³": { dim: "volume", factor: [1000, 1] },
  ml: { dim: "volume", factor: [1, 1000] },
  cl: { dim: "volume", factor: [1, 100] },
  l: { dim: "volume", factor: [1, 1] },
  // CCEA's chemistry volume unit: 1 dm³ = 1 litre (C2 E, 27 Sep 2026: "0.35 litres" was the wrong unit for dm³).
  "dm³": { dim: "volume", factor: [1, 1] },
  // mass
  mg: { dim: "mass", factor: [1, 1000000] },
  g: { dim: "mass", factor: [1, 1000] },
  kg: { dim: "mass", factor: [1, 1] },
  t: { dim: "mass", factor: [1000, 1] },
  // amount of substance (CCEA C2): "5 × 10⁻³ mol" and "5 mmol" are the same amount.
  mol: { dim: "amount", factor: [1, 1] },
  mmol: { dim: "amount", factor: [1, 1000] },
  // time
  ms: { dim: "time", factor: [1, 1000] },
  s: { dim: "time", factor: [1, 1] },
  min: { dim: "time", factor: [60, 1] },
  h: { dim: "time", factor: [3600, 1] },
  // speed / acceleration
  "m/s": { dim: "speed", factor: [1, 1] },
  "km/h": { dim: "speed", factor: [5, 18] },
  mph: { dim: "speed", factor: [44704, 100000] },
  "m/s²": { dim: "acceleration", factor: [1, 1] },
  // physics
  N: { dim: "force", factor: [1, 1] },
  // The moment of a force (CCEA FM2), in newton metres: "N m", "N·m", "Nm" (FM2 D, 25 Sep 2026: only "Nm" half read).
  "N m": { dim: "moment", factor: [1, 1] },
  kN: { dim: "force", factor: [1000, 1] },
  J: { dim: "energy", factor: [1, 1] },
  kJ: { dim: "energy", factor: [1000, 1] },
  MJ: { dim: "energy", factor: [1000000, 1] },
  // The giga prefix (C2 E, al q0012: "5.7 GJ" was not 5700 MJ).
  GJ: { dim: "energy", factor: [1000000000, 1] },
  kWh: { dim: "energy", factor: [3600000, 1] },
  W: { dim: "power", factor: [1, 1] },
  kW: { dim: "power", factor: [1000, 1] },
  MW: { dim: "power", factor: [1000000, 1] },
  V: { dim: "voltage", factor: [1, 1] },
  A: { dim: "current", factor: [1, 1] },
  mA: { dim: "current", factor: [1, 1000] },
  // Charge, in coulombs (CCEA P2: Q = I × t). Before this entry "36 C" could not be read at all (P2D-R1, 24 Sep 2026).
  C: { dim: "charge", factor: [1, 1] },
  // Kilocoulombs and millicoulombs (P2 D, E6, 27 Sep 2026: "1.32 kC" was read as a thousandth of 1320 C).
  kC: { dim: "charge", factor: [1000, 1] },
  mC: { dim: "charge", factor: [1, 1000] },
  "Ω": { dim: "resistance", factor: [1, 1] },
  // The gradient of a resistance–length graph (CCEA Unit 7 Booklet B: "ohm/metre or Ω/m"; P2D-R2, 24 Sep 2026).
  "Ω/m": { dim: "resistance per length", factor: [1, 1] },
  Hz: { dim: "frequency", factor: [1, 1] },
  kHz: { dim: "frequency", factor: [1000, 1] },
  Pa: { dim: "pressure", factor: [1, 1] },
  kPa: { dim: "pressure", factor: [1000, 1] },
  "°": { dim: "angle", factor: [1, 1] },
  "°C": { dim: "temperature", factor: [1, 1] },
  "%": { dim: "percent", factor: [1, 1] },
};

/** Spellings → canonical unit. Matched case-insensitively, longest first. */
const UNIT_ALIASES: Array<[RegExp, string]> = [
  [/^(?:mm\^?2|mm²|sq\.? ?mm|square millimet(?:re|er)s?)$/i, "mm²"],
  [/^(?:cm\^?2|cm²|sq\.? ?cm|cm ?sq(?:uared)?|square centimet(?:re|er)s?)$/i, "cm²"],
  [/^(?:m\^?2|m²|sq\.? ?m|m ?sq(?:uared)?|square met(?:re|er)s?)$/i, "m²"],
  [/^(?:km\^?2|km²|sq\.? ?km|square kilomet(?:re|er)s?)$/i, "km²"],
  [/^(?:mm\^?3|mm³|cu\.? ?mm|cubic millimet(?:re|er)s?)$/i, "mm³"],
  [/^(?:cm\^?3|cm³|cu\.? ?cm|cm ?cubed|cubic centimet(?:re|er)s?)$/i, "cm³"],
  [/^(?:m\^?3|m³|cu\.? ?m|m ?cubed|cubic met(?:re|er)s?)$/i, "m³"],
  [/^(?:m\/s\^?2|m\/s²|m\/s\/s|ms\^?-2|ms⁻²|m s\^?-2|m s⁻²|metres? per second squared|metres? per second per second)$/i, "m/s²"],
  [/^(?:m\/s|ms\^?-1|ms⁻¹|m s\^?-1|m s⁻¹|mps|metres? per second)$/i, "m/s"],
  [/^(?:km\/h|kmh|kph|km ?per ?h(?:ou)?r|kmh\^?-1|kilomet(?:re|er)s? per hour)$/i, "km/h"],
  [/^(?:mph|miles? per hour)$/i, "mph"],
  [/^(?:mm|millimet(?:re|er)s?)$/i, "mm"],
  [/^(?:cms?|centimet(?:re|er)s?)$/i, "cm"],
  [/^(?:km|kilomet(?:re|er)s?)$/i, "km"],
  [/^(?:m|met(?:re|er)s?)$/i, "m"],
  [/^(?:ml|millilit(?:re|er)s?)$/i, "ml"],
  [/^(?:cl|centilit(?:re|er)s?)$/i, "cl"],
  [/^(?:l|lit(?:re|er)s?)$/i, "l"],
  [/^(?:dm\^?3|dm³|cubic decimet(?:re|er)s?)$/i, "dm³"],
  [/^(?:mol|moles?)$/i, "mol"],
  [/^(?:mmol|millimoles?)$/i, "mmol"],
  [/^(?:mg|milligrams?)$/i, "mg"],
  [/^(?:kg|kilos?|kilograms?)$/i, "kg"],
  [/^(?:g|grams?)$/i, "g"],
  [/^(?:t|tonnes?)$/i, "t"],
  [/^(?:ms|milliseconds?)$/i, "ms"],
  [/^(?:s|secs?|seconds?)$/i, "s"],
  [/^(?:min|mins|minutes?)$/i, "min"],
  [/^(?:h|hr|hrs|hours?)$/i, "h"],
  // Before the newton, so "N m" is never a newton with a stray metre. Case-sensitive: "nm" is a nanometre, not N m.
  [/^(?:N ?[·⋅]? ?m|N-m)$/, "N m"],
  [/^newtons?[ -]?met(?:re|er)s?$/i, "N m"],
  [/^(?:n|newtons?)$/i, "N"],
  [/^(?:kn|kilonewtons?)$/i, "kN"],
  [/^(?:j|joules?)$/i, "J"],
  [/^(?:kj|kilojoules?)$/i, "kJ"],
  [/^(?:mj|megajoules?)$/i, "MJ"],
  [/^(?:gj|gigajoules?)$/i, "GJ"],
  [/^(?:kwh|kilowatt[- ]?hours?)$/i, "kWh"],
  [/^(?:w|watts?)$/i, "W"],
  [/^(?:kw|kilowatts?)$/i, "kW"],
  [/^(?:mw|megawatts?)$/i, "MW"],
  [/^(?:v|volts?)$/i, "V"],
  [/^(?:a|amps?|amperes?)$/i, "A"],
  [/^(?:ma|milliamps?)$/i, "mA"],
  // Before the plain ohm, so "Ω/m" is never read as an ohm with a stray "/m".
  [/^(?:(?:Ω|ohms?) ?(?:\/|per) ?met(?:re|er)|(?:Ω|ohms?) ?(?:\/|per) ?m|Ω ?m\^?-1|Ω ?m⁻¹|ohms? m\^?-1|ohms? m⁻¹)$/i, "Ω/m"],
  [/^(?:ohms?|Ω)$/i, "Ω"],
  [/^(?:hz|hertz)$/i, "Hz"],
  [/^(?:khz|kilohertz)$/i, "kHz"],
  [/^(?:pa|pascals?)$/i, "Pa"],
  [/^(?:kpa|kilopascals?)$/i, "kPa"],
  // Celsius as a keyboard allows it (B2E-02, 24 Sep 2026): "25oC" and "25 ºC" (the ordinal º sits where ° should)
  // and the word alone. A bare "C" is the coulomb below; reconcileUnits reads it as °C against a temperature key.
  [/^(?:[°º] ?c|oc|degrees? ?c(?:elsius)?|deg ?c|degrees? centigrade|celsius|centigrade)$/i, "°C"],
  // After the Celsius spellings, so "°C" and "degrees C" stay temperatures (P2D-R1).
  [/^(?:c|coulombs?)$/i, "C"],
  // Case-sensitive: "mc" is not a unit anyone types for a millicoulomb, and "KC" is not a kilocoulomb.
  [/^(?:kC|kilocoulombs?)$/, "kC"],
  [/^(?:mC|millicoulombs?)$/, "mC"],
  [/^(?:[°º]|deg|degrees?)$/i, "°"],
  [/^(?:%|percent|per cent|pc)$/i, "%"],
  [/^(?:£|pounds?|gbp|quid)$/i, "£"],
  [/^(?:p|pence|penny)$/i, "p"],
  [/^(?:\$|dollars?|usd)$/i, "$"],
  [/^(?:€|euros?|eur)$/i, "€"],
];

/** Normalises a unit string to its canonical spelling; unknown units are returned trimmed. */
export function normaliseUnit(unit: string | null | undefined): string | null {
  if (unit === null || unit === undefined) return null;
  const u = superscriptToAscii(unit).trim().replace(/\s+/g, " ").replace(/\.$/, "");
  if (u === "") return null;
  // Re-attach unicode superscripts for direct lookup after ascii-ification.
  for (const [re, canon] of UNIT_ALIASES) {
    if (re.test(u) || re.test(unit.trim())) return canon;
  }
  return unit.trim();
}

/** The kind of quantity a unit measures ("force" for N and kN, "mass" for kg); null for a unit the marker does not know. */
export function unitDimension(unit: string | null | undefined): string | null {
  const u = knownUnit(unit);
  return u ? (UNIT_TABLE[u]?.dim ?? null) : null;
}

/** A unit the marker knows, as it writes it; null for anything else ("in total" names no unit). */
export function knownUnit(unit: string | null | undefined): string | null {
  if (unit === null || unit === undefined) return null;
  const u = superscriptToAscii(unit).trim().replace(/\s+/g, " ").replace(/\.$/, "");
  if (u === "") return null;
  for (const [re, canon] of UNIT_ALIASES) if (re.test(u) || re.test(unit.trim())) return canon;
  return null;
}

/**
 * The trailing-unit regex is built from every alias alternation. A unit must
 * be preceded by a digit, ')', 'π', 'pi', a vulgar fraction, '%', or a superscript.
 */
const TRAILING_UNIT_RE = (() => {
  const alts = UNIT_ALIASES.map(([re]) => re.source.replace(/^\^\(\?:/, "").replace(/\)\$$/, ""));
  return new RegExp(
    "(?<=(?:\\d|\\)|π|pi|" + VULGAR_CLASS + "|[⁰¹²³⁴⁵⁶⁷⁸⁹]))\\s*(" + alts.join("|") + ")\\s*$",
    "i",
  );
})();

// ---------------------------------------------------------------------------
// Tokeniser + recursive-descent parser for the expression grammar
// ---------------------------------------------------------------------------

type Tok =
  | { k: "num"; text: string }
  | { k: "vulgar"; n: number; d: number }
  | { k: "sqrt" }
  | { k: "pi" }
  | { k: "lp" }
  | { k: "rp" }
  | { k: "mul" }
  | { k: "div" }
  | { k: "plus" }
  | { k: "minus" }
  | { k: "pow"; n: number };

function tokenise(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const s = src;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    const rest = s.slice(i);
    let m: RegExpExecArray | null;
    if ((m = /^(\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i.exec(rest))) {
      toks.push({ k: "num", text: m[0] });
      i += m[0].length;
      continue;
    }
    if (VULGAR[c]) {
      const [n, d] = VULGAR[c];
      toks.push({ k: "vulgar", n, d });
      i += 1;
      continue;
    }
    if ((m = /^(?:√|sqrt|root)/i.exec(rest))) {
      toks.push({ k: "sqrt" });
      i += m[0].length;
      continue;
    }
    if ((m = /^(?:π|pi)(?![a-z])/i.exec(rest))) {
      toks.push({ k: "pi" });
      i += m[0].length;
      continue;
    }
    // ^5, ^-2, ^(5): a closing bracket is only part of the power when it was opened here,
    // otherwise (2^3) would swallow its own ')'.
    if ((m = /^\^\s*(?:\(\s*([+-]?\d+)\s*\)|([+-]?\d+))/.exec(rest))) {
      toks.push({ k: "pow", n: Number(m[1] ?? m[2]) });
      i += m[0].length;
      continue;
    }
    if ((m = /^[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/.exec(rest))) {
      const n = Number(superscriptToAscii(m[0]));
      if (!Number.isFinite(n)) throw new ParseFail("bad superscript");
      toks.push({ k: "pow", n });
      i += m[0].length;
      continue;
    }
    if (c === "(" || c === "[") {
      toks.push({ k: "lp" });
      i += 1;
      continue;
    }
    if (c === ")" || c === "]") {
      toks.push({ k: "rp" });
      i += 1;
      continue;
    }
    if (c === "*" || c === "×" || c === "·" || c === "x" || c === "X" || c === "⋅") {
      toks.push({ k: "mul" });
      i += 1;
      continue;
    }
    if ((m = /^times\b/i.exec(rest))) {
      toks.push({ k: "mul" });
      i += m[0].length;
      continue;
    }
    if (c === "/" || c === "÷" || c === "⁄") {
      toks.push({ k: "div" });
      i += 1;
      continue;
    }
    if (c === "+") {
      toks.push({ k: "plus" });
      i += 1;
      continue;
    }
    if (c === "-") {
      toks.push({ k: "minus" });
      i += 1;
      continue;
    }
    throw new ParseFail("unexpected character " + c);
  }
  return toks;
}

interface ParserState {
  toks: Tok[];
  pos: number;
  /** Set whenever a fraction or surd as written was reducible. */
  unsimplified: boolean;
  sawFractionBar: boolean;
}

function peek(st: ParserState): Tok | undefined {
  return st.toks[st.pos];
}

function nodeFromTerm(t: Term): Node {
  return { value: termValue(t), term: t };
}

function combine(a: Node, b: Node, op: "mul" | "div", st: ParserState): Node {
  let value: number;
  if (op === "mul") value = a.value * b.value;
  else {
    if (b.value === 0) throw new ParseFail("division by zero");
    value = a.value / b.value;
  }
  if (!a.term || !b.term) return { value, term: null };
  let raw: Term;
  if (op === "mul") raw = termMul(a.term, b.term);
  else {
    const inv = termInv(b.term);
    raw = termMul(a.term, inv);
    // Dividing by a surd means the answer was not rationalised as written.
    if (b.term.rad !== 1) st.unsimplified = true;
    // A fraction whose numerator or denominator is itself a fraction / decimal
    // (e.g. (1/2)/(3/4), 0.5/2) is not in simplest written form either.
    if (b.term.den !== 1 || a.term.den !== 1) st.unsimplified = true;
  }
  if (!termIsRepresentable(raw)) return { value, term: null };
  const simplified = trySimplify(raw);
  if (!simplified) return { value, term: null };
  if (simplified.changed) st.unsimplified = true;
  return { value: termValue(simplified.term), term: simplified.term };
}

function addNodes(a: Node, b: Node, sign: 1 | -1): Node {
  const value = a.value + sign * b.value;
  if (!a.term || !b.term) return { value, term: null };
  const sa = trySimplify(a.term);
  const sb = trySimplify(b.term);
  if (!sa || !sb) return { value, term: null };
  const ta = sa.term;
  const tb = sb.term;
  if (ta.num === 0) return sign === 1 ? nodeFromTerm(tb) : nodeFromTerm({ ...tb, num: -tb.num });
  if (tb.num === 0) return nodeFromTerm(ta);
  if (ta.rad !== tb.rad || ta.pi !== tb.pi) return { value, term: null };
  const num = ta.num * tb.den + sign * tb.num * ta.den;
  const den = ta.den * tb.den;
  const sum = trySimplify({ num, den, rad: ta.rad, pi: ta.pi });
  if (!sum) return { value, term: null };
  return nodeFromTerm(sum.term);
}

function powNode(base: Node, n: number): Node {
  const value = Math.pow(base.value, n);
  if (!Number.isFinite(value)) throw new ParseFail("overflow");
  if (!base.term || Math.abs(n) > 40) return { value, term: null };
  let acc: Term = RATIONAL_ONE;
  const b = n < 0 ? termInv(base.term) : base.term;
  for (let i = 0; i < Math.abs(n); i += 1) {
    acc = termMul(acc, b);
    if (!termIsRepresentable(acc)) return { value, term: null };
    const s = trySimplify(acc);
    if (!s) return { value, term: null };
    acc = s.term;
  }
  return nodeFromTerm(acc);
}

function parsePrimary(st: ParserState): Node {
  const t = peek(st);
  if (!t) throw new ParseFail("unexpected end");
  if (t.k === "num") {
    st.pos += 1;
    const r = rationalFromDecimalString(t.text);
    const v = Number(t.text);
    if (!Number.isFinite(v)) throw new ParseFail("bad number");
    return { value: v, term: r };
  }
  if (t.k === "vulgar") {
    st.pos += 1;
    st.sawFractionBar = true;
    return nodeFromTerm(rational(t.n, t.d));
  }
  if (t.k === "pi") {
    st.pos += 1;
    return nodeFromTerm({ num: 1, den: 1, rad: 1, pi: 1 });
  }
  if (t.k === "lp") {
    st.pos += 1;
    const inner = parseExpr(st);
    if (peek(st)?.k !== "rp") throw new ParseFail("missing )");
    st.pos += 1;
    return inner;
  }
  if (t.k === "sqrt") {
    st.pos += 1;
    // √ binds to the next primary (with its power), e.g. √2, √(8), sqrt 16, √2²
    const arg = parseUnary(st, true);
    if (arg.value < 0) throw new ParseFail("negative radicand");
    const value = Math.sqrt(arg.value);
    if (!arg.term || arg.term.pi !== 0 || arg.term.rad !== 1) return { value, term: null };
    // √(p/q) = √(pq) / q
    const p = arg.term.num;
    const q = arg.term.den;
    if (p === 0) return nodeFromTerm(rational(0, 1));
    const raw: Term = { num: 1, den: q, rad: p * q, pi: 0 };
    const simplified = trySimplify(raw);
    if (!simplified) return { value, term: null };
    const { term, changed } = simplified;
    if (changed || q !== 1) st.unsimplified = true;
    if (term.rad === 1) {
      // A perfect square such as √16: written as a surd but really an integer.
      st.unsimplified = true;
    }
    return { value: termValue(term), term };
  }
  if (t.k === "minus") {
    st.pos += 1;
    const inner = parseUnary(st, false);
    return { value: -inner.value, term: inner.term ? { ...inner.term, num: -inner.term.num } : null };
  }
  if (t.k === "plus") {
    st.pos += 1;
    return parseUnary(st, false);
  }
  throw new ParseFail("unexpected token");
}

function parseUnary(st: ParserState, tight: boolean): Node {
  let node = parsePrimary(st);
  // postfix powers
  while (peek(st)?.k === "pow") {
    const p = peek(st) as { k: "pow"; n: number };
    st.pos += 1;
    node = powNode(node, p.n);
  }
  if (tight) return node;
  // Implicit multiplication: 3√2, 2π, 3(4), (1/2)π, 2½
  for (;;) {
    const n = peek(st);
    if (!n) break;
    if (n.k === "sqrt" || n.k === "pi" || n.k === "lp" || n.k === "vulgar") {
      const rhs = parseUnary(st, n.k === "sqrt");
      node = combine(node, rhs, "mul", st);
      continue;
    }
    break;
  }
  return node;
}

function parseTerm(st: ParserState): Node {
  let node = parseUnary(st, false);
  for (;;) {
    const t = peek(st);
    if (!t) break;
    if (t.k === "mul" || t.k === "div") {
      st.pos += 1;
      if (t.k === "div") st.sawFractionBar = true;
      const rhs = parseUnary(st, false);
      node = combine(node, rhs, t.k, st);
      continue;
    }
    break;
  }
  return node;
}

function parseExpr(st: ParserState): Node {
  let node = parseTerm(st);
  for (;;) {
    const t = peek(st);
    if (!t) break;
    if (t.k === "plus" || t.k === "minus") {
      st.pos += 1;
      const rhs = parseTerm(st);
      node = addNodes(node, rhs, t.k === "plus" ? 1 : -1);
      continue;
    }
    break;
  }
  return node;
}

function parseExpression(core: string): { node: Node; st: ParserState } {
  const toks = tokenise(core);
  if (toks.length === 0) throw new ParseFail("empty");
  const st: ParserState = { toks, pos: 0, unsimplified: false, sawFractionBar: false };
  const node = parseExpr(st);
  if (st.pos !== toks.length) throw new ParseFail("trailing tokens");
  if (!Number.isFinite(node.value)) throw new ParseFail("not finite");
  return { node, st };
}

// ---------------------------------------------------------------------------
// Digit-string accuracy helpers
// ---------------------------------------------------------------------------

function accuracyOfLiteral(lit: string): { sigFigs: number; decimalPlaces: number } {
  const s = lit.replace(/^[+-]/, "");
  const [intPart = "", fracPart = ""] = s.split(".");
  const decimalPlaces = fracPart.length;
  let digits: string;
  if (s.includes(".")) {
    digits = (intPart + fracPart).replace(/^0+/, "");
    // "0.0050" → digits after stripping leading zeros = "50" → 2 s.f.
  } else {
    digits = intPart.replace(/^0+/, "").replace(/0+$/, "");
  }
  const sigFigs = digits.length === 0 ? 1 : digits.length;
  return { sigFigs, decimalPlaces };
}

// ---------------------------------------------------------------------------
// parseNumeric
// ---------------------------------------------------------------------------

const PLAIN_LITERAL_RE = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

function stripPrefixes(s: string): string {
  let t = s;
  // "answer:", "ans =", "approx", "≈", "~"
  t = t.replace(/^(?:answer|ans|approx(?:imately)?|about|roughly)\s*[:=]?\s*/i, "");
  // "The answer is 7", "it is 5 m", "so it's 12": the sentence around the number.
  t = t.replace(/^(?:(?:so|therefore|hence|thus)\s+)?(?:the (?:answer|result|total|value)|it|it's|this)\s+(?:is\s+)?(?=[-+£$€]?\d)/i, "");
  t = t.replace(/^[≈~]\s*/, "");
  // "x = ", "y=", "n = ", "= ", and a Greek letter ("θ = 31.89", "λ = 0.03 m"; the FM2 and P2 reviews, 27 Sep 2026).
  t = t.replace(/^[a-zA-Zα-ωΑ-Ω]\s*[=≈]\s*/, "");
  // A multiple of a symbol, the scheme's own line ("3R = 112.5" for the reaction 3R): the value it states.
  // Not the first statement of a chain ("5R = 1050, R = 210"), which the chain rules read.
  t = t.replace(/^\d+(?:\.\d+)?\s*[A-Za-zα-ω](?:_\{?[A-Za-z0-9]+\}?)?\s*[=≈]\s*(?=[-+−]?\d[^,;=]*$)/, "");
  // A quantity's name: "Mr = 62.5", "M_r = 62.5", "relative formula mass = 62.5", "Mr of C2H3Cl = 62.5",
  // "O2 molecules needed = 3" (C2 D F06, 24 Sep 2026: only a one-letter name came off, so an answer written as the
  // worked solutions write it could not be read). A function of a letter ("cos x = 0.5") is working, not a name.
  const name = NAME_LABEL_RE.exec(t);
  if (name && !name[1]!.split(/\s+/).some((w) => NOT_A_NAME.has(w.toLowerCase()))) t = t.slice(name[0].length);
  // A probability's name: "P(A) = 0.3", "P(A ∩ B) = 0.12", "P(not red) = 0.75".
  t = t.replace(/^P\s*\(\s*[^()=\d]{1,30}\)\s*[=≈]\s*/, "");
  t = t.replace(/^[=≈]\s*/, "");
  return t.trim();
}

/** A word of a quantity's name: letters with an optional subscript ("M_r", "M_{r}"), or a formula ("C2H3Cl"). */
const NAME_WORD = String.raw`(?:[A-Za-z]+(?:_\{?[A-Za-z0-9]+\}?)?|(?:[A-Z][a-z]?\d*){1,8})`;
const NAME_LABEL_RE = new RegExp(String.raw`^(${NAME_WORD}(?:\s+${NAME_WORD}){0,5})\s*[=≈]\s*`);
/** Words that make the text before "=" working or a list, not a name. */
const NOT_A_NAME = new Set(["sin", "cos", "tan", "log", "ln", "lg", "sqrt", "exp", "arcsin", "arccos", "arctan", "or", "and"]);

/** A small whole number in words, the whole answer ("three"), as a stem that shows "___ O₂" invites. */
const NUMBER_WORDS = new Map<string, number>(
  ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen",
    "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"].map((w, i) => [w, i]),
);

/**
 * A coefficient against the formula it counts, as a balanced equation writes it: "3O2", "3O₂", "2CO2" (C2 D F06).
 * The formula is kept as the answer's unit, as "3 O2" with a space already was. It must hold a digit or two element
 * symbols, so a unit letter joined to a number ("36C", "5N") is still read as that unit first.
 */
const COEFFICIENT_RE = /^([+-]?\d+)\s*((?:[A-Z][a-z]?[\d₀-₉]*){1,8})$/;

/** A decimal followed by an ellipsis: 0.333..., 0.1666…, -0.27... */
const RECURRING_ELLIPSIS_RE = /^([+-]?\d*\.\d+)\s*(?:\.{2,}|…)$/;

function normaliseInput(raw: string): string {
  let s = raw;
  s = s.replace(/[−–—]/g, "-");
  s = s.replace(/ | | /g, " ");
  s = s.replace(/⁄/g, "/");
  // The ohm sign (U+2126) that symbol pickers offer is the Greek capital omega (U+03A9) the unit table uses.
  s = s.replace(/Ω/g, "Ω");
  s = s.replace(/√\s+/g, "√");
  // A unit or a word in TeX text ("91 \text{ m}^2", "\mathrm{cm}^3") is the text itself; TeX spaces are spaces.
  s = s.replace(/\\(?:text|mathrm|textrm|mbox|operatorname)\s*\{([^{}]*)\}/g, "$1").replace(/\\[,;: ]/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  // Trailing sentence punctuation — but a recurring-decimal ellipsis (0.333...) is meaningful.
  if (!RECURRING_ELLIPSIS_RE.test(s)) s = s.replace(/[.,;:]+$/, "").trim();
  return s;
}

function recurringToRational(intPart: string, nonRep: string, rep: string): Term {
  const m = nonRep.length;
  const n = rep.length;
  if (n === 0 || n > 9 || m > 9) throw new ParseFail("recurring too long");
  const A = nonRep === "" ? 0 : Number(nonRep);
  const B = Number(rep);
  const tenN = Math.pow(10, n) - 1;
  const tenM = Math.pow(10, m);
  const num = A * tenN + B;
  const den = tenM * tenN;
  const I = intPart === "" ? 0 : Number(intPart);
  return rational(I * den + num, den);
}

/** Detects recurring-decimal notations. Returns null when the string is not recurring. */
function parseRecurring(core: string): { term: Term; negative: boolean } | null {
  let s = core.trim();
  let negative = false;
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1).trim();
  } else if (s.startsWith("+")) {
    s = s.slice(1).trim();
  }
  let m: RegExpExecArray | null;
  // 0.(3), 0.1(6), 2.(36)
  if ((m = /^(\d*)\.(\d*?)\((\d+)\)$/.exec(s))) {
    return { term: recurringToRational(m[1], m[2], m[3]), negative };
  }
  // 0.3r, 0.16r, 0.3 r, 0.3 recurring, 0.3 rec
  if ((m = /^(\d*)\.(\d*?)(\d)\s*(?:r|rec|recurring|repeating)$/i.exec(s))) {
    return { term: recurringToRational(m[1], m[2], m[3]), negative };
  }
  // Combining dot above: 0.3̇  or 0.1̇2̇  (block from first to last dotted digit)
  if ((m = /^(\d*)\.(\d*?)(\d)̇(?:(\d*)(\d)̇)?$/.exec(s))) {
    const rep = m[4] !== undefined ? m[3] + m[4] + m[5] : m[3];
    return { term: recurringToRational(m[1], m[2], rep), negative };
  }
  // Overline: 0.\overline{3} or 0.3̅ (combining overline)
  if ((m = /^(\d*)\.(\d*?)\\overline\{(\d+)\}$/.exec(s))) {
    return { term: recurringToRational(m[1], m[2], m[3]), negative };
  }
  if ((m = /^(\d*)\.(\d*?)((?:\d̅)+)$/.exec(s))) {
    return { term: recurringToRational(m[1], m[2], m[3].replace(/̅/g, "")), negative };
  }
  // 0.333... / 0.3333… / 0.166... / 0.142857142857...
  if ((m = /^(\d*)\.(\d+)\s*(?:\.{2,}|…)$/.exec(s))) {
    const digits = m[2];
    // A single digit before the dots is that digit recurring: 0.3... = 0.333...
    if (digits.length === 1) return { term: recurringToRational(m[1], "", digits), negative };
    for (let len = 1; len <= 6; len += 1) {
      if (digits.length < len * 2) break;
      const block = digits.slice(-len);
      // The block must be written at least twice at the end: 0.166..., 0.1212...
      if (digits.slice(-2 * len, -len) !== block) continue;
      // The non-repeating prefix is what is left after removing every trailing copy of the block.
      let prefix = digits;
      while (prefix.endsWith(block)) prefix = prefix.slice(0, -len);
      return { term: recurringToRational(m[1], prefix, block), negative };
    }
    // No repeating block found (0.2857...): not recurring notation, the caller treats it as a truncated decimal.
    return null;
  }
  return null;
}

/**
 * 3.2 x 10^5, 3.2 × 10^(−3), 3.2×10⁵, 3.2e5. Groups: 1 mantissa; 2 bracketed
 * caret exponent; 3 bare caret exponent; 4 superscript exponent; 5 e-notation exponent.
 */
const STANDARD_FORM_RE =
  /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:(?:[x×*·⋅]|times)\s*10\s*(?:\^\s*(?:\(\s*([+-]?\d+)\s*\)|([+-]?\d+))|([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+))|[eE]\s*([+-]?\d+))$/i;

const MIXED_RE = /^([+-]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/;
const MIXED_VULGAR_RE = new RegExp("^([+-]?)(\\d+)\\s*(" + VULGAR_CLASS + ")$");

function finish(p: ParsedNumber): ParsedNumber | null {
  if (!Number.isFinite(p.value)) return null;
  if (Object.is(p.value, -0)) p.value = 0;
  return p;
}

export function parseNumeric(input: string): ParsedNumber | null {
  try {
    return parseNumericInner(input);
  } catch {
    return null;
  }
}

/** No GCSE numeric answer is anywhere near this long; longer input is refused before any parsing work. */
const MAX_INPUT_LENGTH = 256;

/**
 * An unknown trailing unit phrase after the number is kept as an unknown unit: "5 apples", "36 breaths per
 * minute", "9 mmol/dm³", "-5.5 °C per minute", "4.5 cm3 per min". The phrase must open with two letters (so
 * "3 x 4" stays an expression) and may carry exponents, slashes and further words.
 */
// The unit tail may carry unicode superscripts, so "mol dm⁻³" and "m s⁻²" read as unit phrases.
// A single-letter unit counts when a slash or a power follows it ("g/s", "s⁻¹", "m³"); a bare letter is a variable.
// A power typed with a plain hyphen is a power too: no keyboard has ⁻¹, so "0.031 s-1" and "9.8 m s-2" are how the
// unit gets typed (engine item 5, 23 Sep 2026: both were "could not be read").
// The ohm sign counts as a unit letter, so a composite such as "Ω/cm" or "Ω per km" reads as a unit (P2D-R2).
const UNKNOWN_UNIT_RE = /^(.*?[\d)π½¼¾⅓⅔⅛⁰¹²³⁴⁵⁶⁷⁸⁹])\s+((?:\/[a-zA-Z°µΩ]{1,4}|[a-zA-Z°µΩ]{2,}|[a-zA-Z°µΩ](?=[²³\d/^⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]|-\d| per\b|\s[a-zA-Z]+(?:[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺^]|-\d)))(?:[a-zA-Z°µΩ⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺^\d/.·-]|\s(?=\S))*)$/;
const MAX_UNIT_LENGTH = 48;

/**
 * A direction after the number is not a unit: "1 m/s² downwards", "5 N to the left", "0.4, directed downwards",
 * "3 m/s² up the slope", "12 km north-east", "2 anticlockwise". The number is marked on its own; a part that
 * asks for the direction carries it as its own text or mcq part, since a numeric spec cannot state one.
 */
const DIRECTION_TAIL_RE = /(?<=[\d)²³⁰-⁹⁻a-zA-Z°µ%])(?:\s+,?\s*|,\s*)(?:(?:directed|acting|pointing|going|moving|heading|travelling|vertically|horizontally|straight|in the direction)\s+)*(?:downwards?|upwards?|down|up|leftwards?|rightwards?|to the (?:left|right)|(?:to the |towards the )?(?:north|south|east|west)(?:[- ]?(?:east|west))?|forwards?|backwards?|clockwise|anticlockwise|anti-clockwise|counterclockwise|(?:up|down|along) the (?:slope|plane|incline|hill|ramp|surface))\.?\s*$/i;

/** "breaths per minute" ~ "breaths/min" ~ "breath per min": the same unknown unit spelt differently. */
function looseUnitKey(unit: string): string {
  return superscriptToAscii(unit)
    .toLowerCase()
    .replace(/\^/g, "")
    // "g s-1" is "g/s" and "mol dm-3" is "mol/dm3": a unit with a negative power after another unit is a
    // denominator, whatever the power (C2 E, 24 Sep 2026: only -1 folded, so "mol dm⁻³" was not "mol/dm³").
    .replace(/\s+([a-z]+)-1\b/g, "/$1")
    .replace(/\s+([a-z]+)-([2-9])\b/g, "/$1$2")
    .replace(/\bper\b/g, "/")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\b(?:minutes?|mins?)\b/g, "min")
    .replace(/\b(?:seconds?|secs?)\b/g, "s")
    // Unit words and their symbols are the same unit: "grams per second" is "g/s".
    .replace(/\b(?:grams?|grammes?)\b/g, "g")
    .replace(/\b(?:kilograms?|kilogrammes?)\b/g, "kg")
    .replace(/\b(?:milligrams?)\b/g, "mg")
    .replace(/\b(?:metres?|meters?)\b/g, "m")
    .replace(/\b(?:centimetres?|centimeters?)\b/g, "cm")
    .replace(/\b(?:millimetres?|millimeters?)\b/g, "mm")
    .replace(/\b(?:kilometres?|kilometers?)\b/g, "km")
    .replace(/\b(?:litres?|liters?)\b/g, "l")
    // A litre is a cubic decimetre: "mmol/L" is "mmol/dm³" (P2 C, 25 Sep 2026: "9 mmol/L" was the wrong unit).
    .replace(/(^|\/|\s)l\b/g, "$1dm³")
    .replace(/\bdm(?:3|\^3)(?![\d])/g, "dm³")
    .replace(/\b(?:moles?)\b/g, "mol")
    .replace(/\b(?:joules?)\b/g, "j")
    .replace(/\b(?:kilojoules?)\b/g, "kj")
    .replace(/\b(?:newtons?)\b/g, "n")
    // "Ω" lower-cases to "ω"; the word is the same unit (P2D-R2).
    .replace(/\b(?:ohms?)\b/g, "ω")
    .replace(/\b(?:degrees? (?:celsius|c))\b/g, "°c")
    .replace(/\bcubic (cm|m|mm|dm)\b/g, "$1³")
    .replace(/\b(cm|m|mm|dm)(?:3|\^3)\b/g, "$1³")
    .replace(/\b(cm|m|mm|km)(?:2|\^2)\b/g, "$1²")
    .replace(/\b(?:hours?|hrs?)\b/g, "h")
    .replace(/\b(?:weeks?|wks?)\b/g, "wk")
    .replace(/\b(?:years?|yrs?)\b/g, "yr")
    .replace(/\b([a-z]{3,})s\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    // A bare reciprocal unit is the same whichever way it is written: "s-1", "/s" and "per second" are all "1/s".
    .replace(/^([a-z°]+)-1$/, "1/$1")
    .replace(/^\/\s*/, "1/");
}

function parseNumericInner(input: string): ParsedNumber | null {
  if (typeof input !== "string") return null;
  const raw = input;
  if (input.length > MAX_INPUT_LENGTH) return null;
  let s = normaliseInput(input);
  if (s === "") return null;
  s = stripPrefixes(s);
  if (s === "") return null;
  {
    const word = NUMBER_WORDS.get(s.toLowerCase());
    if (word !== undefined) s = String(word);
  }
  // What a typed answer carries around its number (the P2 C and P2 D reviews, 25–27 Sep 2026):
  //  - a reason after it: "5 A because the current is the same", "R = 24 Ω, because 1/R = …": the part before;
  //  - its unit in brackets, "36 (C)", or a restatement in brackets, "4800 seconds (80 minutes)": the unit is read,
  //    the restatement dropped;
  //  - an article before it: "a 13 A fuse";
  //  - a time in two units: "1 hour 20 minutes" is 80 min, "2 minutes 30 seconds" is 150 s;
  //  - a composite unit with no space: "9mmol/dm3".
  {
    // A reason or a check after the value, in the same sentence: "5 A because …", "160 cm², which agrees with …". A
    // sentence that starts with "Since" is working before the answer, not a reason after it.
    const dropReason = (t: string): string => {
      const reason = /^([^.;]*?\d[^;]*?)\s*,?\s*\b(?:because|since|as this|so that|which (?:is because|agrees|checks|matches|is the same))\b.*$/i.exec(t);
      return reason && !/\.(?:\s|$)/.test(reason[1]!.trim()) ? reason[1]!.trim() : t;
    };
    s = dropReason(s);
    // The answer in the last clause of a line of working: "…, so 13.6 litres", "…, so the average speed is \dfrac{1500}{300}
    // = 5 m/s", "R = 80 − 25 = 55 N." (the parts' own worked solutions typed into the box; 27 Sep 2026). The clause's
    // words before "is" ("the average speed is") are the answer's name; a quantity's name before "=" comes off as it
    // does for the whole answer.
    {
      // A check after the answer ("x = 4. Check: 2(4) + 1 = 9") is not the answer: it comes off first.
      let clauses = s.split(/\s*[.;:]\s+(?=\S)|\s*,?\s+\b(?:so|therefore|hence|thus|giving)\b\s+/i);
      const check = clauses.findIndex((c, i) => i > 0 && /^(?:check(?:ing)?|to check|as a check|this (?:agrees|checks))\b/i.test(c));
      if (check > 0) {
        clauses = clauses.slice(0, check);
        if (clauses.length === 1) s = clauses[0]!;
      }
      let last = (clauses[clauses.length - 1] ?? "").replace(/\.\s*$/, "").trim();
      if (clauses.length >= 2 && /\d/.test(last)) {
        last = dropReason(last.replace(/^(?:so|therefore|hence|thus)\s+/i, ""));
        last = last.replace(/^(?:[A-Za-z' ]{1,60}?\s)?(?:is|are|was|equals)\s+(?=[-+−£$€(\\]?[\d\\(-])/i, "");
        s = stripPrefixes(last);
      }
    }
    // An accuracy remark after the value: "254469 cm³ to the nearest cubic centimetre", "13.6 (1 d.p.)", "4.24 to 3 s.f.".
    s = s.replace(/\s*,?\s*\(?\s*(?:to the nearest [a-z ]+|(?:correct )?to (?:\d+|one|two|three|four) (?:d\.?\s?p\.?|s\.?\s?f\.?|decimal places?|significant figures?)|\d+ ?(?:d\.?\s?p|s\.?\s?f)\.?)\s*\)?\s*$/i, "");
    const bracket = /^(.*?\S)\s*\(([^()]*)\)\s*$/.exec(s);
    if (bracket && /\d/.test(bracket[1]!)) {
      const inner = bracket[2]!.trim();
      if (!/\d/.test(inner) && knownUnit(inner)) s = `${bracket[1]} ${inner}`;
      // A restatement ("(80 minutes)") after a value with its unit, or a remark ("(to the nearest cm)") comes off.
      else if (/\d/.test(inner) ? /\d\s*[A-Za-zµΩ°%£]/.test(bracket[1]!) : /\s[a-z]+\s/i.test(` ${inner} `) && inner.split(/\s+/).length >= 2) s = bracket[1]!;
    }
    s = s.replace(/^(?:a|an|the)\s+(?=[-+£$€]?\d)/i, "");
    const hm = /^(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\s*(?:and\s+)?(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min)$/i.exec(s);
    if (hm) s = `${Number(hm[1]) * 60 + Number(hm[2])} min`;
    const ms = /^(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min)\s*(?:and\s+)?(\d+(?:\.\d+)?)\s*(?:seconds?|secs?|s)$/i.exec(s);
    if (ms) s = `${Number(ms[1]) * 60 + Number(ms[2])} s`;
    s = s.replace(/^([-+]?\d+(?:\.\d+)?)(?=[A-Za-zµ]{2,}[A-Za-z]*\s*(?:\/|per\b))/, "$1 ");
  }
  let preUnit: string | null = null;
  // A number word with its noun ("three sections"): the number, the noun kept as the unit (B2 D, 25 Sep 2026).
  {
    const m = /^([a-z]+)(\s+[A-Za-z][A-Za-z ]*)$/i.exec(s);
    const word = m ? NUMBER_WORDS.get(m[1]!.toLowerCase()) : undefined;
    // A fraction's name after it ("one half", "three quarters") is a fraction, not a count of things.
    if (m && word !== undefined && !/^\s*(?:halfs?|halves|thirds?|quarters?|fourths?|fifths?|sixths?|sevenths?|eighths?|ninths?|tenths?|fold)\b/i.test(m[2]!)) s = `${word}${m[2]}`;
  }
  // The stem's noun before the number ("gap 8", "in gap 8", "day 28", "on day 0"): the number is the answer. A
  // function ("log 5", "sin 30") is working, not a noun, and one letter is a variable ("x 5").
  {
    const m = /^(?:(?:in|on|at|by)\s+)?([A-Za-z]{2,12})\s+(?=[-+]?\d)/i.exec(s);
    if (m && !NOT_A_NAME.has(m[1]!.toLowerCase()) && !/^(?:root|sqrt|exp|approx|about)$/i.test(m[1]!)) s = s.slice(m[0].length);
  }
  // A magnification or a multiplier: "x6", "×6", "6x", "6×", "6-fold", "6 times". The number, with "×" as its unit, so
  // a unit-free key reads it and a letter the question uses as a variable ("6x" where x is one) is still refused.
  {
    const pre = /^[x×]\s*(\d+(?:\.\d+)?)$/i.exec(s);
    const post = /^(\d+(?:\.\d+)?)(?:[x×]|\s*-?\s*fold|\s+times)$/i.exec(s);
    const n = pre?.[1] ?? post?.[1];
    if (n !== undefined) {
      preUnit = /[xX]$/.test(s) ? s[s.length - 1]! : "×";
      s = n;
    }
  }
  // Statements joined by commas, each with its working ("20 + 20 = 40, 100 − 40 = 60, 60 / 2 = 30%"): the last one's
  // value. A pair of letters' values ("x = 5, y = 3") is not this: every statement must do arithmetic before its "=".
  {
    const parts = s.split(/\s*[,;]\s*/);
    if (parts.length >= 2 && parts.every((part) => /=/.test(part) && /\d\s*[+\-−×x*÷/^]\s*\d|\d\s*\(/.test(part.split("=")[0] ?? ""))) s = parts[parts.length - 1]!;
    // A chain of statements, each a quantity's value, with the working somewhere in it ("300 mA = 0.3 A, V = 0.3 × 45
    // = 13.5 V"; "1/R = 1/40 + 1/60, R = 24 Ω"): the last statement's value. Letters' values alone ("x = 5, y = 3")
    // do no working, and stay a pair.
    else if (
      parts.length >= 2 &&
      parts.every((part) => /=/.test(part)) &&
      parts.some((part) => /[\d)]\s*[+\-−×x*÷/^]\s*[\d(]|\\(?:times|div|d?frac)\b/.test(part))
    ) {
      s = stripPrefixes(parts[parts.length - 1]!);
    }
    // An equation and its solution ("20 = 5a, a = 4", "5R = 1050, R = 210", "25 + F = 40, F = 15"; the FM2 review):
    // the last statement solves for a symbol every earlier statement contains, so its value is the answer. Two letters'
    // values ("x = 5, y = 3") share no symbol and stay a pair.
    else if (parts.length >= 2) {
      const last = /^\s*([A-Za-zα-ω](?:_\{?[A-Za-z0-9]+\}?)?)\s*=\s*[-+−]?\d/.exec(parts[parts.length - 1]!);
      const symbol = last?.[1];
      const holds = (part: string) => new RegExp(`(?<![A-Za-z_])${symbol?.replace(/[{}]/g, "\\$&")}(?![A-Za-z])`).test(part);
      if (symbol && parts.slice(0, -1).every((part) => /=/.test(part) && holds(part))) s = stripPrefixes(parts[parts.length - 1]!);
    }
  }
  // A direction as an angle after a value with its unit ("67.88 N at 45°", "20 m/s at 30° to the horizontal"): the
  // magnitude is the answer; the direction is its own part.
  s = s.replace(/(\d\s*[A-Za-zΩµ/²]+)\s+at\s+[-−]?\d+(?:\.\d+)?\s*(?:°|degrees?)(?:\s+(?:to|above|below|from|with)\b.*)?$/i, "$1");
  // A unit then prose ("2 days after", "2 days after the injection", "0.9 m beyond D"): the prose comes off when what is
  // left ends on a unit the engine knows. "5 m per s" keeps its "per s", which is part of the unit.
  {
    const m = /^(.*?\d\s*[A-Za-z°%µΩ][A-Za-z°%µΩ/²³⁻¹]*)((?:\s+(?:[a-z]+|[A-Z]))+)$/.exec(s);
    if (m) {
      const rest = m[2]!.trim().split(/\s+/);
      const unitWord = (w: string) => w === "per" || UNIT_ALIASES.some(([re]) => re.test(w)) || /^(?:squared|cubed|minutes?|hours?|seconds?|days?|weeks?|years?)$/i.test(w);
      const endsOnUnit = TRAILING_UNIT_RE.test(m[1]!) || /\d\s*(?:days?|weeks?|months?|years?|hours?|minutes?|mins?|seconds?|secs?)$/i.test(m[1]!);
      // A capital letter after "of", "from", "beyond" … is a point's name ("1.2 m to the left of A"), not the ampere.
      const pointName = (w: string, i: number) => /^[A-Z]$/.test(w) && /^(?:of|from|beyond|past|at|to|towards|below|above|behind)$/i.test(rest[i - 1] ?? "");
      if (!rest.some((w, i) => unitWord(w) && !pointName(w, i)) && endsOnUnit) s = m[1]!;
    }
  }
  // Working typed into the box ("3 × 10 = 30", "F = ma = 3 × 10 = 30 N"): the answer is what follows the last
  // "=", but only when what precedes it is arithmetic and the line is not a pair ("x = 5, y = 3").
  {
    const eq = Math.max(s.lastIndexOf("="), s.lastIndexOf("≈"));
    // TeX operators count as working too ("800 \times \dfrac{21}{40} = 420"): before quantity names came off (F06)
    // such a line read only because the name in front happened to hold an x or a bracket.
    const before = s.slice(0, eq);
    // A formula in letters before it is working too ("P = I × V = 36 W"; the P2 C review, 25 Sep 2026).
    const formula = /[A-Za-zΩ)]\s*[×*÷/+\-]\s*[A-Za-z(]|[A-Za-zΩ]\s+x\s+[A-Za-z]/.test(before);
    // A trigonometric or logarithmic function of a number is working ("150\sin 32° = 79.49", "150 sin 32 = 79.49").
    const fn = /\\?(?:sin|cos|tan|log|ln)\b/.test(before) && /\d/.test(before);
    if (eq > 0 && !/[,;]|\b(?:or|and)\b/i.test(s) && (fn || (/[×x*÷/+\-^()√]|\\(?:times|cdot|div|d?frac|tfrac|sqrt)\b/.test(before) && (/\d/.test(before) || formula)))) {
      s = s.slice(eq + 1).trim();
      if (s === "") return null;
    }
  }
  // "1 m/s² downwards": the direction comes off before the unit is read, so it is never taken for one.
  s = s.replace(DIRECTION_TAIL_RE, "").trim();
  if (s === "") return null;

  let unit: string | null = preUnit;

  // Currency prefix: £4.41, -£3, £ 4.41, $2
  let m: RegExpExecArray | null;
  if ((m = /^([+-]?)\s*([£$€])\s*/.exec(s))) {
    unit = normaliseUnit(m[2]);
    s = (m[1] + s.slice(m[0].length)).trim();
  }

  // Trailing unit (including %, p, £, °)
  if ((m = TRAILING_UNIT_RE.exec(s))) {
    const u = normaliseUnit(m[1]);
    const before = s.slice(0, m.index).trim();
    // Guard: '3 x 4' should not treat nothing as a unit; also '2pi' must remain π.
    if (before !== "" && !(u === "p" && /pi$/i.test(s))) {
      if (unit === null || unit === u) unit = u;
      else if (unit === "£" && u === "p") {
        // "£4.41p" — keep pounds
      } else {
        // conflicting units such as "£3 cm" — unparseable as a unit; keep the first, ignore the rest
      }
      s = before;
    }
  }

  if (s === "") return null;
  if (unit === null && (m = COEFFICIENT_RE.exec(s))) {
    const formula = m[2]!.replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080));
    if (/\d/.test(formula) || (formula.match(/[A-Z]/g) ?? []).length >= 2) {
      unit = formula;
      s = m[1]!;
    }
  }
  return parseBody(s, unit, raw, true);
}

/**
 * Parses the number itself, after prefixes and any recognised unit have been
 * removed. `allowUnknownUnit` permits one retry with an unrecognised trailing
 * word ("5 apples") treated as the unit.
 */
function parseBody(s: string, unit: string | null, raw: string, allowUnknownUnit: boolean): ParsedNumber | null {
  const percent = unit === "%";
  const retryWithUnknownUnit = (): ParsedNumber | null => {
    const um = allowUnknownUnit && unit === null ? UNKNOWN_UNIT_RE.exec(s) : null;
    if (!um || um[2]!.length > MAX_UNIT_LENGTH) return null;
    // "4 or -4", "5 and 16": a second answer is not a unit; the response stays unparseable rather than scoring the first.
    if (/^(?:or|and|nor)\b/i.test(um[2]!) || /(?:^|\s)[-+−]?\d+(?:\.\d+)?(?=\s|$)/.test(um[2]!)) return null;
    return parseBody(um[1]!, normaliseUnit(um[2]) ?? um[2]!, raw, false);
  };

  // Thousands separators: 1,250  1,250,000  1 250
  if (/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(s)) s = s.replace(/,/g, "");
  if (/^[+-]?\d{1,3}(?: \d{3})+(?:\.\d+)?$/.test(s)) s = s.replace(/ /g, "");

  // A comma used as a decimal point (12,5) is ambiguous and not accepted.
  if (s.includes(",")) return retryWithUnknownUnit();

  // An ellipsis with no repeating block (0.2857...) is read as the truncated decimal it shows.
  let m: RegExpExecArray | null;
  if ((m = RECURRING_ELLIPSIS_RE.exec(s)) && !parseRecurring(s)) s = m[1];

  // --- Plain literal -------------------------------------------------------
  if (PLAIN_LITERAL_RE.test(s)) {
    const value = Number(s);
    const term = rationalFromDecimalString(s);
    const acc = accuracyOfLiteral(s);
    if (percent) {
      const t = term ? rational(term.num, term.den * 100) : null;
      return finish({
        value: value / 100,
        exact: t,
        form: "percent",
        unit: "%",
        raw,
        sigFigs: acc.sigFigs,
        decimalPlaces: acc.decimalPlaces,
        simplified: null,
      });
    }
    return finish({
      value,
      exact: term,
      form: s.includes(".") ? "decimal" : "integer",
      unit,
      raw,
      sigFigs: acc.sigFigs,
      decimalPlaces: acc.decimalPlaces,
      simplified: null,
    });
  }

  // --- Standard form ---------------------------------------------------------
  if ((m = STANDARD_FORM_RE.exec(s))) {
    const mantissaStr = m[1];
    const expStr = m[2] ?? m[3] ?? (m[4] !== undefined ? superscriptToAscii(m[4]) : m[5]);
    const exponent = Number(expStr);
    const mantissa = Number(mantissaStr);
    if (!Number.isFinite(exponent) || !Number.isFinite(mantissa)) return null;
    const value = mantissa * Math.pow(10, exponent);
    let term: Term | null = null;
    const mr = rationalFromDecimalString(mantissaStr);
    if (mr && Math.abs(exponent) <= 15) {
      term = exponent >= 0 ? rational(mr.num * Math.pow(10, exponent), mr.den) : rational(mr.num, mr.den * Math.pow(10, -exponent));
      if (!Number.isSafeInteger(term.num) || !Number.isSafeInteger(term.den)) term = null;
    }
    const acc = accuracyOfLiteral(mantissaStr);
    return finish({
      value: percent ? value / 100 : value,
      exact: percent && term ? rational(term.num, term.den * 100) : term,
      form: percent ? "percent" : "standard-form",
      unit,
      raw,
      sigFigs: acc.sigFigs,
      decimalPlaces: null,
      simplified: null,
      standardForm: { mantissa, exponent },
    });
  }

  // --- Recurring decimals ----------------------------------------------------
  const rec = parseRecurring(s);
  if (rec) {
    const t = rec.negative ? { ...rec.term, num: -rec.term.num } : rec.term;
    const exact = percent ? rational(t.num, t.den * 100) : t;
    return finish({
      value: termValue(exact),
      exact,
      form: percent ? "percent" : "recurring",
      unit,
      raw,
      sigFigs: null,
      decimalPlaces: null,
      simplified: null,
    });
  }

  // --- Mixed numbers -----------------------------------------------------------
  if ((m = MIXED_RE.exec(s)) || (m = MIXED_VULGAR_RE.exec(s))) {
    const sign = m[1] === "-" ? -1 : 1;
    const whole = Number(m[2]);
    let n: number;
    let d: number;
    if (m.length === 5) {
      n = Number(m[3]);
      d = Number(m[4]);
    } else {
      [n, d] = VULGAR[m[3]];
    }
    if (d === 0) return null;
    const simplified = gcd(n, d) === 1 && n < d && n !== 0;
    const t = rational(sign * (whole * d + n), d);
    const exact = percent ? rational(t.num, t.den * 100) : t;
    return finish({
      value: termValue(exact),
      exact,
      form: percent ? "percent" : "mixed",
      unit,
      raw,
      sigFigs: null,
      decimalPlaces: null,
      simplified,
    });
  }

  // --- General expression ------------------------------------------------------
  let parsed: { node: Node; st: ParserState };
  try {
    parsed = parseExpression(s);
  } catch (e) {
    if (!(e instanceof ParseFail)) throw e;
    // Unknown trailing word (e.g. "5 apples", "12 sweets") → re-parse with it as the unit.
    return retryWithUnknownUnit();
  }
  const { node, st } = parsed;
  const rawTerm = node.term;
  let form: NumericForm;
  let simplified: boolean | null = null;
  const hasSurd = /√|sqrt|root/i.test(s);
  const hasPi = /π|pi/i.test(s);
  if (!rawTerm) {
    form = hasSurd ? "surd" : hasPi ? "pi" : "decimal";
  } else {
    const t = rawTerm;
    if (t.pi === 1 && t.num !== 0) {
      form = "pi";
      simplified = !st.unsimplified;
    } else if (t.rad !== 1 && t.num !== 0) {
      form = "surd";
      simplified = !st.unsimplified;
    } else if (t.den !== 1) {
      form = st.sawFractionBar ? "fraction" : "decimal";
      simplified = st.sawFractionBar ? !st.unsimplified : null;
    } else if (hasSurd || hasPi || st.sawFractionBar) {
      // e.g. √16 = 4, 8/4 = 2, π/π = 1 — an integer written in a roundabout way
      form = hasSurd ? "surd" : hasPi ? "pi" : "fraction";
      simplified = false;
    } else {
      form = s.includes(".") ? "decimal" : "integer";
    }
  }
  const exact = rawTerm ? (percent ? rational(rawTerm.num, rawTerm.den * 100) : rawTerm) : null;
  if (percent && exact) {
    // keep surd/pi info if present
    if (rawTerm && (rawTerm.rad !== 1 || rawTerm.pi !== 0)) {
      exact.rad = rawTerm.rad;
      exact.pi = rawTerm.pi;
    }
  }
  return finish({
    value: percent ? node.value / 100 : node.value,
    exact,
    form: percent ? "percent" : form,
    unit,
    raw,
    sigFigs: null,
    decimalPlaces: null,
    simplified,
  });
}

// ---------------------------------------------------------------------------
// checkNumeric
// ---------------------------------------------------------------------------

interface Target {
  /** Comparison value, expressed in the spec's unit (percentages as the percent number, e.g. 8 for 8%). */
  value: number;
  term: Term | null;
  unit: string | null;
  /** How the target was written in the spec, for feedback. */
  display: string;
  parsed: ParsedNumber | null;
}

function resolveTarget(v: number | string, specUnit: string | null): Target | null {
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return null;
    return { value: v, term: rationalFromNumber(v), unit: specUnit, display: formatNumber(v), parsed: null };
  }
  const p = parseNumeric(String(v));
  if (!p) return null;
  let unit = specUnit;
  let value = p.value;
  let term = p.exact ?? null;
  if (p.unit === "%") {
    // spec written as '12.5%': target is the percent number, unit '%'
    value = term ? termValue({ ...term, num: term.num * 100 }) : p.value * 100;
    term = term ? simplifyTerm({ ...term, num: term.num * 100 }).term : null;
    if (unit === null) unit = "%";
  } else if (p.unit && unit === null) {
    unit = p.unit;
  }
  return { value, term, unit, display: String(v).trim(), parsed: p };
}

interface Reconciled {
  value: number;
  term: Term | null;
  /** "degrees": a bare degree unit against a temperature key (right unless the unit is marked). */
  status: "ok" | "missing" | "wrong" | "converted" | "ignored" | "degrees";
}

function scaleTerm(t: Term | null, num: number, den: number): Term | null {
  if (!t) return null;
  try {
    return simplifyTerm({ num: t.num * num, den: t.den * den, rad: t.rad, pi: t.pi }).term;
  } catch {
    return null;
  }
}

function reconcileUnits(p: ParsedNumber, targetUnit: string | null): Reconciled {
  const term = p.exact ?? null;
  const aUnit = p.unit;
  if (targetUnit === null) {
    return { value: p.value, term, status: aUnit === null ? "ok" : "ignored" };
  }
  if (targetUnit === "%") {
    if (aUnit === "%") {
      return { value: term ? termValue({ ...term, num: term.num * 100 }) : p.value * 100, term: scaleTerm(term, 100, 1), status: "ok" };
    }
    if (aUnit === null) return { value: p.value, term, status: "missing" };
    return { value: p.value, term, status: "wrong" };
  }
  if (aUnit === null) return { value: p.value, term, status: "missing" };
  if (aUnit === targetUnit) return { value: p.value, term, status: "ok" };
  if (targetUnit === "°C") {
    // A bare letter C reads as the coulomb, but against a temperature it is degrees Celsius typed without the degree
    // sign, which no keyboard offers. The word "coulombs" is never a temperature, so only the letter counts (B2E-02).
    if (aUnit === "C" && /(?:^|[^a-z])c$/i.test(p.raw.trim().replace(/[.,;:]+$/, ""))) return { value: p.value, term, status: "ok" };
    // "25 degrees" for a temperature means Celsius, but on its own it is also the angle's unit: right where the unit
    // is not marked, with a reminder; the unit's mark needs °C (checkNumericInner).
    if (aUnit === "°") return { value: p.value, term, status: "degrees" };
  }
  const a = UNIT_TABLE[aUnit];
  const t = UNIT_TABLE[targetUnit];
  if (a && t && a.dim === t.dim) {
    // value_in_target = value × (a.factor / t.factor)
    const num = a.factor[0] * t.factor[1];
    const den = a.factor[1] * t.factor[0];
    return { value: (p.value * num) / den, term: scaleTerm(term, num, den), status: "converted" };
  }
  // Units outside the table (rates such as "breaths per minute") match by spelling, loosely.
  if (!a && !t && looseUnitKey(aUnit) === looseUnitKey(targetUnit)) return { value: p.value, term, status: "ok" };
  // A counted noun with words after it describes the same count: "58 loaves an hour" for loaves, "10 containers can
  // be filled completely" for containers (the worked solutions typed into the box, 27 Sep 2026). A rate ("per", "/")
  // after the noun is a different unit and does not count.
  if (!a && !t) {
    const [ka, kt] = [looseUnitKey(aUnit), looseUnitKey(targetUnit)];
    const [short, long] = ka.length <= kt.length ? [ka, kt] : [kt, ka];
    if (/^[a-z]+$/.test(short) && long.startsWith(`${short} `) && !/\//.test(long)) return { value: p.value, term, status: "ok" };
  }
  return { value: p.value, term, status: "wrong" };
}

/**
 * When the answer key is a rounded decimal (4.24 written for 3√2, 0.33 for 1/3),
 * this is the number of decimal places it was written to; null when the key is
 * exact (a fraction, surd, integer, 1-s.f. decimal...) and must be matched precisely.
 */
function roundedKeyDp(target: Target): number | null {
  let dp: number | null = null;
  let sigFigs = 0;
  if (target.parsed) {
    const p = target.parsed;
    if ((p.form === "decimal" || p.form === "percent") && p.decimalPlaces !== null) {
      dp = p.decimalPlaces;
      sigFigs = p.sigFigs ?? 0;
    }
  } else {
    const s = target.value.toString();
    const dpm = /\.(\d+)$/.exec(s);
    if (dpm && !/e/i.test(s)) {
      dp = dpm[1].length;
      sigFigs = accuracyOfLiteral(s).sigFigs;
    }
  }
  return dp !== null && dp >= 1 && sigFigs >= 2 ? dp : null;
}

/**
 * Decimal places the student's answer is good to: what they wrote for a decimal
 * literal, unlimited for an exact form (fraction, surd, π, recurring, standard form).
 */
function answerPrecision(p: ParsedNumber): number | null {
  if (p.decimalPlaces !== null) return p.decimalPlaces;
  if (p.exact || p.form === "surd" || p.form === "pi") return Infinity;
  return null;
}

function withinTolerance(aVal: number, aTerm: Term | null, answer: ParsedNumber, target: Target, tol: Tolerance | undefined): "exact" | "within-tolerance" | null {
  const T = target.value;
  if (aTerm && target.term) {
    try {
      if (termEquals(aTerm, target.term)) return "exact";
    } catch {
      /* fall through to numeric */
    }
  }
  if (nearlyEqual(aVal, T, 1e-9)) return "exact";
  if (tol) {
    switch (tol.type) {
      case "absolute":
        return Math.abs(aVal - T) <= tol.value + 1e-12 ? "within-tolerance" : null;
      case "relative":
        return Math.abs(aVal - T) <= tol.value * Math.abs(T) + 1e-12 ? "within-tolerance" : null;
      case "sigfigs": {
        // Two readings of "correct to n s.f." both count: the answer rounds to the same n figures as the target, or
        // it lies within half a unit of the target's n-th figure. The second saves a correct, MORE precise rounding
        // that sits on a rounding boundary (0.635 for 0.63461… rounds to 0.64 at two figures, not 0.63).
        if (nearlyEqual(roundSf(aVal, tol.n), roundSf(T, tol.n), 1e-9)) return "within-tolerance";
        if (T !== 0 && Math.abs(aVal - T) <= 0.5 * Math.pow(10, Math.floor(Math.log10(Math.abs(T))) - (tol.n - 1)) + 1e-12) return "within-tolerance";
        return null;
      }
      case "dp": {
        // As for s.f.: rounds to the same n places, or within half a unit in the n-th place. The boundary case
        // (0.635 for 0.63461… at 2 d.p.) was found by the FM3 probability pre-read, docs/dev/qa/pre-read/fm3-b-1.md E1.
        if (nearlyEqual(roundDp(aVal, tol.n), roundDp(T, tol.n), 1e-9)) return "within-tolerance";
        if (Math.abs(aVal - T) <= 0.5 * Math.pow(10, -tol.n) + 1e-12) return "within-tolerance";
        return null;
      }
      case "range":
        return aVal >= tol.min - 1e-12 && aVal <= tol.max + 1e-12 ? "within-tolerance" : null;
      default:
        return null;
    }
  }
  // Spec value written as a rounded number (e.g. 4.24 for 3√2): accept a more precise
  // answer that rounds to it — a longer decimal, or an exact form such as 3√2 or 1/3.
  // Only when the spec has at least 2 s.f. and 1 d.p.
  const keyDp = roundedKeyDp(target);
  const precision = answerPrecision(answer);
  if (keyDp !== null && precision !== null && precision > keyDp && nearlyEqual(roundDp(aVal, keyDp), T, 1e-9)) return "within-tolerance";
  return null;
}

/** Loose equality for diagnostics: a student's rounded answer against a candidate value. */
function looselyEquals(p: ParsedNumber, aVal: number, candidate: number): boolean {
  if (!Number.isFinite(candidate)) return false;
  // Zero is never "a rounded version" of anything else (0 to 0 d.p. is not a sign error for 0.0004).
  if (aVal === 0 || candidate === 0) return aVal === candidate;
  if (nearlyEqual(aVal, candidate, 1e-6)) return true;
  if (p.decimalPlaces !== null && p.form !== "percent") {
    return nearlyEqual(roundDp(candidate, p.decimalPlaces), aVal, 1e-9);
  }
  if (p.sigFigs !== null && p.form !== "percent") {
    return nearlyEqual(roundSf(candidate, p.sigFigs), aVal, 1e-9);
  }
  return false;
}

function describeForm(form: NumericForm): string {
  switch (form) {
    case "integer":
      return "a whole number";
    case "decimal":
      return "a decimal";
    case "fraction":
      return "a fraction";
    case "mixed":
      return "a mixed number";
    case "surd":
      return "a surd";
    case "pi":
      return "a multiple of π";
    case "standard-form":
      return "standard form";
    case "percent":
      return "a percentage";
    case "recurring":
      return "a recurring decimal";
    default:
      return String(form);
  }
}

function describeRequiredForm(rf: RequiredForm, spec: NumericSpec): string {
  switch (rf) {
    case "fraction":
      return "a fraction";
    case "simplest-fraction":
      return "a fraction in its simplest form";
    case "surd":
      return "a surd in its simplest form";
    case "pi":
      return "an exact multiple of π";
    case "standard-form":
      return "standard form";
    case "decimal-dp":
      return `a decimal correct to ${spec.dp ?? 0} decimal place${spec.dp === 1 ? "" : "s"}`;
    case "sigfigs":
      return `${spec.sigfigs ?? 3} significant figure${spec.sigfigs === 1 ? "" : "s"}`;
    default:
      return String(rf);
  }
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function verdict(
  parsed: ParsedNumber | null,
  reason: VerdictReason,
  feedback: string,
  extra: { correct?: boolean; nearMiss?: string; missingUnit?: boolean; valueRight?: boolean; formOnly?: boolean; accuracyOnly?: boolean } = {},
): NumericVerdict {
  const v: NumericVerdict = {
    correct: extra.correct ?? (reason === "exact" || reason === "within-tolerance"),
    parsed,
    reason,
    feedback,
  };
  if (extra.nearMiss) v.nearMiss = extra.nearMiss;
  if (extra.valueRight) v.valueRight = true;
  if (extra.formOnly) v.formOnly = true;
  if (extra.accuracyOnly) v.accuracyOnly = true;
  if (extra.missingUnit) v.missingUnit = true;
  return v;
}

const FORM_OK_FOR_FRACTION: NumericForm[] = ["fraction", "mixed", "integer"];

export function checkNumeric(answer: string, spec: NumericSpec): NumericVerdict {
  try {
    return checkNumericInner(answer, spec);
  } catch {
    return verdict(null, "unparseable", "That answer could not be read. Try typing just the number, with any unit after it.", { correct: false });
  }
}

function checkNumericInner(answer: string, spec: NumericSpec): NumericVerdict {
  const parsed = parseNumeric(typeof answer === "string" ? answer : String(answer ?? ""));
  if (!parsed) {
    return verdict(null, "unparseable", "That answer could not be read. Try typing just the number, with any unit after it.", { correct: false });
  }

  const specUnit = normaliseUnit(spec?.unit ?? null);
  // A unit-free key ignores a unit, so a letter of the question typed after the number would be paid as one: "4m" for
  // 3m⁰ + m⁰ = 4 is the very misconception the part tests. Such a letter is the variable, not a unit.
  if (specUnit === null && parsed.unit !== null && spec.variables && spec.variables.length > 0) {
    const tail = /(?:^|[\d).\s])([A-Za-z])$/.exec(normaliseInput(String(answer)));
    if (tail && spec.variables.includes(tail[1]!)) {
      return verdict(parsed, "wrong-form", `${tail[1]} is a letter in this question, not a unit: the answer is the number on its own.`, { correct: false });
    }
  }
  const target = resolveTarget(spec?.value, specUnit);
  if (!target) {
    return verdict(parsed, "unparseable", "This question's answer key could not be read, so the answer has not been marked.", { correct: false });
  }
  const targetUnit = target.unit;
  const alternatives = (spec.alternatives ?? []).map((a) => resolveTarget(a, targetUnit)).filter((t): t is Target => t !== null);

  // Effective tolerance: explicit, else implied by required accuracy.
  let tol = spec.tolerance;
  const requiredDp = spec.dp ?? (spec.requiredForm === "decimal-dp" ? 0 : undefined);
  const requiredSf = spec.sigfigs;
  if (!tol && requiredDp !== undefined && Number.isFinite(requiredDp)) tol = { type: "dp", n: requiredDp };
  else if (!tol && requiredSf !== undefined && Number.isFinite(requiredSf)) tol = { type: "sigfigs", n: requiredSf };

  const reconciled = reconcileUnits(parsed, targetUnit);
  // Degrees alone for a temperature: where the unit earns a mark it must be °C, so it is the wrong unit there.
  const rec: Reconciled = reconciled.status === "degrees" && spec.requireUnit ? { ...reconciled, status: "wrong" } : reconciled;
  const aVal = rec.value;
  const aTerm = rec.term;

  // --- Value match against target and alternatives ------------------------------
  let match: "exact" | "within-tolerance" | null = withinTolerance(aVal, aTerm, parsed, target, tol);
  let matchedTarget = target;
  if (!match) {
    for (const alt of alternatives) {
      const m = withinTolerance(aVal, aTerm, parsed, alt, tol);
      if (m) {
        match = m;
        matchedTarget = alt;
        break;
      }
    }
  }
  if (rec.status === "wrong" && !match) {
    // Maybe the value is right in the student's own unit (e.g. cm² vs cm³).
    const rawMatch = withinTolerance(parsed.value, parsed.exact ?? null, parsed, target, tol);
    if (rawMatch) {
      return verdict(parsed, "wrong-unit", `The number is right but the unit is not. The answer should be in ${targetUnit}, not ${parsed.unit}.`, { correct: false, valueRight: true });
    }
  }

  if (match) {
    // --- Unit problems take precedence over form problems only when the unit is wrong.
    if (rec.status === "wrong") {
      return verdict(parsed, "wrong-unit", `The number is right but the unit is not. The answer should be in ${targetUnit}, not ${parsed.unit}.`, { correct: false, valueRight: true });
    }

    // --- Required form -----------------------------------------------------------------
    const rf = spec.requiredForm;
    if (rf) {
      const formVerdict = checkRequiredForm(parsed, rf, spec, matchedTarget);
      if (formVerdict) return formVerdict;
    }
    // When the spec's unit is "%", a percent sign on the answer is that unit, not a choice of form: "45%" for a
    // 45% target is the decimal 45 with its unit, so it passes an acceptForms of ["decimal"].
    const writtenForm = targetUnit === "%" && parsed.form === "percent" ? "decimal" : parsed.form;
    if (spec.acceptedForms && spec.acceptedForms.length > 0 && !spec.acceptedForms.includes(writtenForm)) {
      const list = spec.acceptedForms.map(describeForm).join(" or ");
      return verdict(parsed, "wrong-form", `The value is right, but the question wants ${list} rather than ${describeForm(parsed.form)}.`, { correct: false, formOnly: true });
    }

    // --- Required accuracy -------------------------------------------------------------
    // (Not for an answer converted from another unit: the d.p. of "1.5 m" say nothing about 150 cm.)
    if (rf !== "decimal-dp" && rf !== "sigfigs" && rec.status !== "converted") {
      const acc = checkAccuracy(parsed, spec, requiredDp, requiredSf, matchedTarget);
      if (acc) return acc;
    }

    // A right value written with fewer decimal places than the question demands (150 for 150.00) is not
    // marked down, but the paper would: say so.
    const note = rf !== "decimal-dp" && rf !== "sigfigs" && rec.status !== "converted" ? droppedZerosNote(parsed, requiredDp, matchedTarget) : null;
    const withNote = (v: NumericVerdict): NumericVerdict => (note ? { ...v, feedback: `${v.feedback} ${note}` } : v);

    // --- Units -------------------------------------------------------------------------
    if (rec.status === "missing") {
      if (spec.requireUnit) {
        return verdict(parsed, "missing-unit", `The number is right, but the answer needs a unit. Give it in ${targetUnit}.`, { correct: false, valueRight: true });
      }
      return withNote(
        verdict(parsed, match, match === "exact" ? `Correct. Remember to include the unit (${targetUnit}) in an exam.` : `Correct, within the accepted accuracy. Remember to include the unit (${targetUnit}).`, {
          missingUnit: true,
        }),
      );
    }
    if (rec.status === "converted") {
      // A unit of the same size ("litres" for dm³) converts nothing: only a changed number is a conversion.
      const converted = !nearlyEqual(parsed.value, aVal, 1e-9);
      return { ...verdict(parsed, match, `Correct. ${parsed.raw.trim()} is equivalent to the expected answer in ${targetUnit}.`), ...(converted ? { converted: true } : {}) };
    }
    if (rec.status === "degrees") {
      return withNote(verdict(parsed, match, `${match === "exact" ? "Correct." : "Correct, within the accepted accuracy."} On the paper write the unit as °C: degrees alone could be an angle.`));
    }
    return withNote(verdict(parsed, match, match === "exact" ? "Correct." : "Correct, within the accepted accuracy."));
  }

  // --- Wrong value: diagnostics ---------------------------------------------------------
  return diagnoseWrongValue(parsed, aVal, rec, target, spec, requiredDp, requiredSf);
}

function checkRequiredForm(parsed: ParsedNumber, rf: RequiredForm, spec: NumericSpec, target: Target): NumericVerdict | null {
  const wants = describeRequiredForm(rf, spec);
  const wrongForm = () =>
    verdict(parsed, "wrong-form", `${parsed.raw.trim()} has the right value, but the question asks for ${wants}.`, { correct: false, formOnly: true });
  const notSimplest = (msg: string) => verdict(parsed, "not-simplest", msg, { correct: false, formOnly: true });

  switch (rf) {
    case "fraction": {
      if (!FORM_OK_FOR_FRACTION.includes(parsed.form)) return wrongForm();
      return null;
    }
    case "simplest-fraction": {
      if (!FORM_OK_FOR_FRACTION.includes(parsed.form)) return wrongForm();
      if (parsed.form !== "integer" && parsed.simplified === false) {
        return notSimplest(`${parsed.raw.trim()} is the right value but it is not in its simplest form. Divide the numerator and denominator by their highest common factor.`);
      }
      return null;
    }
    case "surd": {
      const targetIsSurd = target.term ? target.term.rad !== 1 : true;
      if (!targetIsSurd) {
        // The exact answer happens to be rational; accept integer/fraction forms.
        if (parsed.form === "decimal" && parsed.exact && parsed.exact.den !== 1) return wrongForm();
        return null;
      }
      if (parsed.form !== "surd") return wrongForm();
      if (parsed.simplified === false) {
        return notSimplest(`${parsed.raw.trim()} is the right value but is not in its simplest form. Take out any square factors and rationalise the denominator.`);
      }
      return null;
    }
    case "pi": {
      const targetHasPi = target.term ? target.term.pi === 1 : true;
      if (!targetHasPi) return null;
      if (parsed.form !== "pi") return wrongForm();
      if (parsed.simplified === false) return notSimplest(`${parsed.raw.trim()} is right but can be simplified further.`);
      return null;
    }
    case "standard-form": {
      if (parsed.form !== "standard-form") return wrongForm();
      const mant = Math.abs(parsed.standardForm?.mantissa ?? NaN);
      if (!(mant >= 1 && mant < 10)) {
        return verdict(parsed, "wrong-form", `${parsed.raw.trim()} has the right value, but in standard form the first number must be at least 1 and less than 10.`, { correct: false, formOnly: true });
      }
      return null;
    }
    case "decimal-dp": {
      const dp = spec.dp ?? 0;
      if (parsed.form !== "decimal" && parsed.form !== "integer") return wrongForm();
      if (parsed.decimalPlaces !== dp) {
        return verdict(parsed, "wrong-accuracy", `The value is right, but give it to exactly ${plural(dp, "decimal place")}: ${formatNumber(target.value, { dp })}.`, { correct: false });
      }
      return null;
    }
    case "sigfigs": {
      const sf = spec.sigfigs ?? 3;
      if (parsed.form !== "decimal" && parsed.form !== "integer" && parsed.form !== "standard-form") return wrongForm();
      const expected = roundSf(target.value, sf);
      const okBySf = parsed.sigFigs === sf;
      const okByValue = nearlyEqual(parsed.value, expected, 1e-12) && parsed.form === "integer";
      if (!okBySf && !okByValue) {
        return verdict(parsed, "wrong-accuracy", `The value is right, but give it to ${plural(sf, "significant figure")}: ${formatNumber(expected, { sigfigs: sf })}.`, { correct: false });
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * "150" when the question asks for 2 d.p.: the value is exact, so it is accepted, but on the paper the trailing
 * zeros are the difference between the last mark and none. Returns the reminder, or null when nothing was dropped.
 */
function droppedZerosNote(parsed: ParsedNumber, requiredDp: number | undefined, target: Target): string | null {
  if (requiredDp === undefined || !Number.isFinite(requiredDp) || requiredDp <= 0) return null;
  const given = parsed.decimalPlaces;
  if (given === null || given === requiredDp) return null;
  // Too few places with the zeros dropped, or more places than asked: the value is right, and the reminder shows the
  // places the question asks for.
  if (!nearlyEqual(roundDp(parsed.value, requiredDp), roundDp(target.value, requiredDp), 1e-9)) return null;
  if (given < requiredDp && !nearlyEqual(parsed.value, roundDp(target.value, requiredDp), 1e-9)) return null;
  // No claim that a mark is lost: CCEA's general marking instructions accept the dropped zero ("Accept 1.5 instead of
  // 1.50 for an answer required to 2 dp", Further Mathematics Unit 2, Summer 2021). The zeros show the accuracy asked
  // for, and that is all the reminder says (engine item 14, 23 Sep 2026).
  return droppedZerosReminder(requiredDp, [formatNumber(target.value, { dp: requiredDp })]);
}

/** "The question asks for 2 decimal places, so write 2.90 and 3.60 on the paper, to show the accuracy asked for." */
export function droppedZerosReminder(places: number, written: readonly string[]): string {
  const list = written.length > 1 ? `${written.slice(0, -1).join(", ")} and ${written[written.length - 1]}` : (written[0] ?? "");
  return `The question asks for ${plural(places, "decimal place")}, so write ${list} on the paper, to show the accuracy asked for.`;
}

function checkAccuracy(parsed: ParsedNumber, spec: NumericSpec, requiredDp: number | undefined, requiredSf: number | undefined, target: Target): NumericVerdict | null {
  // Exact forms (fractions, surds, π) are always at least as accurate as any rounding.
  const isExactForm = parsed.form === "fraction" || parsed.form === "mixed" || parsed.form === "surd" || parsed.form === "pi" || parsed.form === "recurring";
  if (isExactForm) {
    if (requiredDp !== undefined && Number.isFinite(requiredDp)) {
      return verdict(parsed, "wrong-accuracy", `The value is right, but the question asks for a decimal to ${plural(requiredDp, "decimal place")}: ${formatNumber(target.value, { dp: requiredDp })}.`, { correct: false, accuracyOnly: true });
    }
    if (requiredSf !== undefined && Number.isFinite(requiredSf)) {
      return verdict(parsed, "wrong-accuracy", `The value is right, but the question asks for ${plural(requiredSf, "significant figure")}: ${formatNumber(roundSf(target.value, requiredSf), { sigfigs: requiredSf })}.`, { correct: false, accuracyOnly: true });
    }
    return null;
  }
  // "12%" for a percent target is the written number 12, not the parsed 0.12: the unit is the form.
  const writtenValue = spec.unit === "%" && parsed.form === "percent" ? parsed.value * 100 : parsed.value;
  // CCEA's general marking guidance (FM2 MS 2021: "Accept 1.5 instead of 1.50 for an answer required to 2 dp";
  // "Unless specifically stated in the mark scheme, accept one or more dp, or 3 significant figures"; the 2019 MS
  // prints "2.458 2.46"; the lead's reversal of 27 Sep 2026): a dropped final zero and more places than asked are
  // right when they round to the answer; only fewer places than asked lose the accuracy mark.
  if (requiredDp !== undefined && Number.isFinite(requiredDp)) {
    const given = parsed.decimalPlaces;
    if (given !== null && given !== requiredDp) {
      const expected = formatNumber(target.value, { dp: requiredDp });
      const rounded = roundDp(target.value, requiredDp);
      if (given > requiredDp) {
        if (nearlyEqual(roundDp(writtenValue, requiredDp), rounded, 1e-9)) return null;
        return verdict(parsed, "wrong-accuracy", `The value is right, but the question asks for ${plural(requiredDp, "decimal place")}, so write ${expected}.`, { correct: false, accuracyOnly: true });
      }
      // Fewer places: the answer with its final zeros dropped (4.2 for 4.20) is right; a value rounded to fewer places
      // than asked (3.4 for 3.44) keeps every mark but the accuracy mark.
      if (!nearlyEqual(writtenValue, rounded, 1e-9)) {
        return verdict(parsed, "wrong-accuracy", `${parsed.raw.trim()} is rounded to fewer places than the question asks. Give the answer to ${plural(requiredDp, "decimal place")}: ${expected}.`, { correct: false, accuracyOnly: true });
      }
    }
    return null;
  }
  if (requiredSf !== undefined && Number.isFinite(requiredSf)) {
    const expected = roundSf(target.value, requiredSf);
    const given = parsed.sigFigs;
    if (given !== null && given !== requiredSf) {
      // Trailing zeros in an integer are ambiguous: 4500 is a fine 3 s.f. answer for 4498.
      if ((parsed.form === "integer" || parsed.form === "percent") && nearlyEqual(writtenValue, expected, 1e-12)) return null;
      // More figures than asked that round to the answer, or the answer with a final zero dropped (4.5 for 4.50), are
      // right (CCEA's guidance, as for decimal places above).
      if (given > requiredSf && nearlyEqual(roundSf(writtenValue, requiredSf), expected, 1e-9)) return null;
      if (given < requiredSf && parsed.form !== "standard-form" && nearlyEqual(writtenValue, expected, 1e-12)) return null;
      if (parsed.form === "standard-form" && nearlyEqual(parsed.value, expected, 1e-12) && given < requiredSf) {
        return verdict(parsed, "wrong-accuracy", `Write the answer to ${plural(requiredSf, "significant figure")}, keeping any trailing zeros.`, { correct: false, accuracyOnly: true });
      }
      return verdict(parsed, "wrong-accuracy", `The value is right, but the question asks for ${plural(requiredSf, "significant figure")}: ${formatNumber(expected, { sigfigs: requiredSf })}.`, { correct: false, accuracyOnly: true });
    }
  }
  return null;
}

function diagnoseWrongValue(
  parsed: ParsedNumber,
  aVal: number,
  rec: Reconciled,
  target: Target,
  spec: NumericSpec,
  requiredDp: number | undefined,
  requiredSf: number | undefined,
): NumericVerdict {
  const T = target.value;
  const unitLabel = target.unit ? ` ${target.unit}` : "";
  const eq = (candidate: number) => looselyEquals(parsed, aVal, candidate);

  // Percent / decimal confusion when the spec is a percentage and the student typed the decimal (0.08 for 8%).
  if (target.unit === "%" && rec.status === "missing" && eq(T / 100)) {
    const what = parsed.form === "fraction" || parsed.form === "mixed" ? "the fraction equivalent" : "the decimal equivalent";
    return verdict(parsed, "percent-decimal-confusion", `${parsed.raw.trim()} is ${what}. Multiply by 100 to give it as a percentage.`, { correct: false });
  }
  // Percent typed where a decimal / multiplier was expected (8% for 0.08 with no unit on the spec).
  if (parsed.form === "percent" && target.unit === null && nearlyEqual(parsed.value * 100, T, 1e-9)) {
    // student wrote e.g. "50%" for target 50 with no unit: value 0.5 vs 50 — accept as the percent number.
    return verdict(parsed, "exact", "Correct.");
  }

  // Rounded-too-early / accuracy issues.
  if (parsed.decimalPlaces !== null || parsed.sigFigs !== null) {
    const dpGiven = parsed.decimalPlaces;
    const sfGiven = parsed.sigFigs;
    const sfForm = parsed.form === "integer" || parsed.form === "standard-form";
    // Never on a one-figure coincidence ("20" for 22.5, a read-off "3" for 2.7: P2 D, 25 Sep 2026): the value must carry a
    // decimal place or at least 2 significant figures, and be within 10 % of the answer.
    const close = T !== 0 && Math.abs(aVal - T) <= 0.1 * Math.abs(T);
    const roundsToTarget =
      close &&
      ((dpGiven !== null && dpGiven >= 1 && nearlyEqual(roundDp(T, dpGiven), aVal, 1e-9)) ||
        (sfForm && sfGiven !== null && sfGiven >= 2 && nearlyEqual(roundSf(T, sfGiven), aVal, 1e-9) && !nearlyEqual(T, aVal, 1e-9)));
    if (roundsToTarget) {
      if (requiredDp !== undefined) {
        return verdict(parsed, "wrong-accuracy", `${parsed.raw.trim()} is rounded to fewer places than the question asks. Give the answer to ${plural(requiredDp, "decimal place")}: ${formatNumber(T, { dp: requiredDp })}${unitLabel}.`, { correct: false, accuracyOnly: true });
      }
      if (requiredSf !== undefined) {
        return verdict(parsed, "wrong-accuracy", `${parsed.raw.trim()} is rounded to fewer figures than the question asks. Give the answer to ${plural(requiredSf, "significant figure")}: ${formatNumber(T, { sigfigs: requiredSf })}${unitLabel}.`, { correct: false, accuracyOnly: true });
      }
      const exactHint = target.parsed && target.parsed.form !== "decimal" && target.parsed.form !== "integer" ? ` The exact answer is ${target.display}.` : "";
      return verdict(parsed, "premature-rounding-suspected", `${parsed.raw.trim()} is only the rounded value. Keep the exact value, or more figures, until the final step.${exactHint}`, {
        correct: false,
        nearMiss: `rounds to ${parsed.raw.trim()} at ${dpGiven !== null && dpGiven >= 1 ? plural(dpGiven, "decimal place") : plural(sfGiven ?? 1, "significant figure")}`,
      });
    }
  }

  // Sign error.
  if (T !== 0 && eq(-T)) {
    return verdict(parsed, "sign-error", "The size of the answer is right but the sign is wrong. Check the signs in your working.", { correct: false, nearMiss: "negative of the expected value" });
  }
  // Reciprocal.
  if (T !== 0 && aVal !== 0 && eq(1 / T)) {
    return verdict(parsed, "reciprocal", "Your answer is the reciprocal of the expected value. Check which quantity should be divided by which.", { correct: false, nearMiss: "reciprocal of the expected value" });
  }
  // Powers of ten.
  const currencyLike = target.unit === "£" || target.unit === "p" || parsed.unit === "£" || parsed.unit === "p";
  for (const k of [1, -1, 2, -2, 3, -3]) {
    if (eq(T * Math.pow(10, k))) {
      if (Math.abs(k) === 2 && !currencyLike && target.unit !== "%" && parsed.form !== "percent" && rec.status !== "converted" && target.unit === null) {
        return verdict(
          parsed,
          "percent-decimal-confusion",
          k > 0 ? "Your answer is 100 times too big. Check whether you have mixed up a percentage and a decimal." : "Your answer is 100 times too small. Check whether you have mixed up a percentage and a decimal.",
          { correct: false, nearMiss: `expected value × 10^${k}` },
        );
      }
      let hint = "";
      if (currencyLike && Math.abs(k) === 2) hint = k > 0 ? " It looks like an amount in pence where pounds were expected." : " It looks like an amount in pounds where pence were expected.";
      else if (target.unit && UNIT_TABLE[target.unit]) hint = ` Check the units you have used; the answer should be in ${target.unit}.`;
      else if (target.unit === "%") hint = " Check whether you have mixed up a percentage and a decimal.";
      return verdict(parsed, "off-by-factor-10", `Your answer is ${k > 0 ? "" : "1/"}${formatNumber(Math.pow(10, Math.abs(k)))} times the expected value.${hint}`, {
        correct: false,
        nearMiss: `expected value × 10^${k}`,
      });
    }
  }

  // Percentage change vs. multiplier.
  if (target.unit === "%" && nearlyEqual(Math.abs(aVal - T), 100, 1e-9)) {
    return verdict(parsed, "wrong-value", aVal > T ? `${formatNumber(aVal)}% is the new amount as a percentage of the original. The question asks for the percentage change, which is 100% less than that.` : `${formatNumber(aVal)}% is the change, not the new total. Add it to 100%.`, {
      correct: false,
      nearMiss: aVal > T ? "percentage of original rather than percentage change" : "percentage change rather than percentage of original",
    });
  }
  if (target.unit === null && T > 0 && T < 3 && nearlyEqual(Math.abs(aVal - T), 1, 1e-9)) {
    return verdict(parsed, "wrong-value", aVal > T ? "That looks like a multiplier (1 + change) rather than the change itself." : "That looks like the change itself rather than the multiplier. Add 1.", {
      correct: false,
      nearMiss: "multiplier vs. change confusion",
    });
  }

  if (rec.status === "wrong") {
    return verdict(parsed, "wrong-unit", `That is not the expected answer, and the unit should be ${target.unit}, not ${parsed.unit}.`, { correct: false });
  }
  const closeish = T !== 0 && Math.abs(aVal - T) / Math.abs(T) < 0.05 && !nearlyEqual(aVal, T, 1e-9);
  if (closeish) {
    return verdict(parsed, "wrong-value", "Close, but not accurate enough. Check your rounding and use the full value of any intermediate results.", { correct: false, nearMiss: "within 5% of the expected value" });
  }
  return verdict(parsed, "wrong-value", "That is not the expected answer. Check each step of your working.", { correct: false });
}
