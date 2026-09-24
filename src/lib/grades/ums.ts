/**
 * CCEA GCSE grade / UMS engine for Mathematics (G9602), Further Mathematics (G2337)
 * and Double Award Science (G9824).
 *
 * All numbers live in data/grades/ccea-gcse-boundaries.json. Sources (see the JSON
 * `sources` arrays and docs/research/01, 02, 03, 09):
 *  - Maths unit UMS ladders and subject boundaries: CCEA "Guidance for teachers on
 *    Grading, Aggregation, Resit and Terminal Rules" (2020) p.8 and the Raw to Uniform
 *    Mark Boundaries PDFs (Summer 2025 / Summer 2026), research 01 §2.2–2.3.
 *  - Further Maths: Raw to Uniform Mark Boundaries PDFs 2025/2026, research 02 §2.
 *  - Double Award Science: Subject Level Uniform Mark Grade Boundaries with A* (2026),
 *    research 09 (2025 A*A* and A*A) and the CCEA "Grade Outcomes for Double Award Science
 *    Tier Combinations" PDF (docs/sources/science/DA-Grade-Outcomes-Tier-Combinations.pdf).
 *
 * RAW → UMS CONVERSION (assumption, documented): CCEA publishes only the raw mark at
 * which each fixed unit-grade UMS threshold is awarded. Between two adjacent published
 * boundaries we interpolate linearly. Above the top published boundary we interpolate
 * linearly from that boundary's UMS to the unit's maximum UMS at the maximum raw mark.
 * Below the lowest published boundary we interpolate linearly down to 0 UMS at raw 0.
 * Results are rounded to the nearest whole UMS. This mirrors the usual awarding-body
 * "piecewise linear" conversion but the exact in-between values are not published, so a
 * predicted UMS can differ from the real one by a mark or two near the ends of a band.
 *
 * Double Award Science has no published unit raw boundaries in the research files, so its
 * raw → UMS is a proportional estimate (raw/rawMax × tier UMS cap), flagged `estimated`.
 */
import boundaries from "../../../data/grades/ccea-gcse-boundaries.json";

export type Subject = "maths" | "further-maths" | "double-award-science";
export type Series = "summer-2025" | "summer-2026";

export type UnitGrade = "a" | "b" | "c*" | "c" | "d" | "e" | "f" | "g" | "u";
export type SingleGrade = "A*" | "A" | "B" | "C*" | "C" | "D" | "E" | "F" | "G" | "U";
export type DoubleGrade =
  | "A*A*" | "A*A" | "AA" | "AB" | "BB" | "BC*" | "C*C*" | "C*C" | "CC"
  | "CD" | "DD" | "DE" | "EE" | "EF" | "FF" | "FG" | "GG" | "U";
export type Grade = SingleGrade | DoubleGrade;

export type MathsUnit = "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "M8";
export type FurtherMathsUnit = "U1" | "U2" | "U3" | "U4";
/** Double Award Science units carry their tier as a suffix: "B1H", "B1F", … "U7AH", "U7BF". */
export type ScienceBaseUnit = "B1" | "C1" | "P1" | "B2" | "C2" | "P2" | "U7A" | "U7B";
export type ScienceTier = "H" | "F";
export type ScienceUnit = `${ScienceBaseUnit}${ScienceTier}`;
export type UnitId = MathsUnit | FurtherMathsUnit | ScienceUnit | string;

export const SERIES: readonly Series[] = ["summer-2025", "summer-2026"];
export const UNIT_GRADE_ORDER: readonly UnitGrade[] = ["a", "b", "c*", "c", "d", "e", "f", "g", "u"];
export const SINGLE_GRADE_ORDER: readonly SingleGrade[] = ["A*", "A", "B", "C*", "C", "D", "E", "F", "G", "U"];
export const DOUBLE_GRADE_ORDER: readonly DoubleGrade[] = [
  "A*A*", "A*A", "AA", "AB", "BB", "BC*", "C*C*", "C*C", "CC", "CD", "DD", "DE", "EE", "EF", "FF", "FG", "GG", "U",
];

const MATHS = boundaries.maths;
const FM = boundaries.furtherMaths;
const DAS = boundaries.doubleAwardScience;

const MATHS_UNITS = Object.keys(MATHS.units) as MathsUnit[];
const FM_UNITS = Object.keys(FM.units) as FurtherMathsUnit[];
const DAS_BASE_UNITS: readonly ScienceBaseUnit[] = ["B1", "C1", "P1", "B2", "C2", "P2", "U7A", "U7B"];

// ---------------------------------------------------------------------------
// Unit specification lookup
// ---------------------------------------------------------------------------

export interface UnitSpec {
  subject: Subject;
  /** Unit id as passed in (for Science this includes the tier suffix). */
  unit: string;
  /** Base unit without tier (Science) — same as `unit` for Maths / Further Maths. */
  baseUnit: string;
  tier?: ScienceTier;
  rawMax: number;
  /** Maximum UMS reachable on this unit (for a Foundation Science unit this is the Foundation cap). */
  umsMax: number;
  /** Maximum UMS of the unit at the subject level (Higher / full scale). */
  scaleMax: number;
  /** Fixed unit-grade UMS thresholds, best grade first. */
  thresholds: Array<{ grade: UnitGrade; ums: number }>;
  /** Whether the unit ladder / conversion is an estimate rather than published data. */
  estimated: boolean;
}

function assertSeries(series: string): asserts series is Series {
  if (!SERIES.includes(series as Series)) {
    throw new RangeError(`Unknown series "${series}"; expected one of ${SERIES.join(", ")}`);
  }
}

function parseScienceUnit(unit: string): { base: ScienceBaseUnit; tier: ScienceTier } {
  const tier = unit.slice(-1) as ScienceTier;
  const base = unit.slice(0, -1) as ScienceBaseUnit;
  if ((tier !== "H" && tier !== "F") || !DAS_BASE_UNITS.includes(base)) {
    throw new RangeError(
      `Unknown Double Award Science unit "${unit}"; expected e.g. "B1H" or "U7AF" (base unit + tier H/F)`,
    );
  }
  return { base, tier };
}

interface FixedUnitData {
  rawMax: number;
  umsMax: number;
  thresholds: Record<string, number>;
}

/** Resolve the fixed specification of a unit (raw max, UMS max, fixed grade thresholds). */
export function getUnitSpec(subject: Subject, unit: string): UnitSpec {
  if (subject === "maths") {
    const u = (MATHS.units as unknown as Record<string, FixedUnitData | undefined>)[unit];
    if (!u) throw new RangeError(`Unknown Mathematics unit "${unit}"; expected M1–M8`);
    return {
      subject, unit, baseUnit: unit, rawMax: u.rawMax, umsMax: u.umsMax, scaleMax: u.umsMax,
      thresholds: sortThresholds(u.thresholds), estimated: false,
    };
  }
  if (subject === "further-maths") {
    const u = (FM.units as unknown as Record<string, FixedUnitData | undefined>)[unit];
    if (!u) throw new RangeError(`Unknown Further Mathematics unit "${unit}"; expected U1–U4`);
    return {
      subject, unit, baseUnit: unit, rawMax: u.rawMax, umsMax: u.umsMax, scaleMax: u.umsMax,
      thresholds: sortThresholds(u.thresholds), estimated: false,
    };
  }
  const { base, tier } = parseScienceUnit(unit);
  const u = DAS.units[base];
  const pct = DAS.unitThresholdPercent;
  const thresholds: Record<string, number> = {};
  for (const g of boundaries.unitGradeOrder as Exclude<UnitGrade, "u">[]) {
    thresholds[g] = Math.ceil(pct[g] * u.umsMax);
  }
  return {
    subject, unit, baseUnit: base, tier,
    rawMax: u.rawMax[tier],
    umsMax: tier === "H" ? u.umsMax : u.foundationUmsCap,
    scaleMax: u.umsMax,
    thresholds: sortThresholds(thresholds),
    estimated: true,
  };
}

function sortThresholds(t: Record<string, number>): Array<{ grade: UnitGrade; ums: number }> {
  return UNIT_GRADE_ORDER.filter((g) => g !== "u" && typeof t[g] === "number").map((g) => ({ grade: g, ums: t[g] }));
}

/** Raw-mark boundaries published for a unit in a series (undefined for Science: none published). */
function rawBoundaryTable(subject: Subject, unit: string, series: Series): Record<string, number> | undefined {
  if (subject === "maths") return (MATHS.rawBoundaries[series] as Record<string, Record<string, number>>)[unit];
  if (subject === "further-maths") return (FM.rawBoundaries[series] as Record<string, Record<string, number>>)[unit];
  return undefined;
}

// ---------------------------------------------------------------------------
// Raw → UMS
// ---------------------------------------------------------------------------

export interface RawToUmsResult {
  ums: number;
  estimated: boolean;
  /** The piecewise-linear anchors used, [raw, ums], ascending. */
  anchors: Array<[number, number]>;
}

/** Piecewise-linear anchors [raw, ums] for a unit in a series (see file header for the assumption). */
export function conversionAnchors(subject: Subject, unit: string, series: Series): RawToUmsResult["anchors"] {
  assertSeries(series);
  const spec = getUnitSpec(subject, unit);
  const table = rawBoundaryTable(subject, unit, series);
  const pts: Array<[number, number]> = [[0, 0]];
  if (table) {
    for (const { grade, ums } of [...spec.thresholds].reverse()) {
      const raw = table[grade];
      if (typeof raw === "number") pts.push([raw, ums]);
    }
  }
  pts.push([spec.rawMax, spec.umsMax]);
  // Keep the anchors strictly increasing in raw (guards against a malformed table).
  const out: Array<[number, number]> = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (last && p[0] <= last[0]) {
      if (p[1] > last[1]) last[1] = p[1];
      continue;
    }
    out.push([p[0], p[1]]);
  }
  return out;
}

/** Detailed raw → UMS conversion. */
export function rawToUmsDetail(subject: Subject, unit: string, raw: number, series: Series): RawToUmsResult {
  const spec = getUnitSpec(subject, unit);
  if (!Number.isFinite(raw) || raw < 0 || raw > spec.rawMax) {
    throw new RangeError(`Raw mark ${raw} is outside 0–${spec.rawMax} for ${subject} ${unit}`);
  }
  const anchors = conversionAnchors(subject, unit, series);
  let ums = spec.umsMax;
  for (let i = 1; i < anchors.length; i++) {
    const [r0, u0] = anchors[i - 1];
    const [r1, u1] = anchors[i];
    if (raw <= r1) {
      ums = r1 === r0 ? u1 : u0 + ((raw - r0) * (u1 - u0)) / (r1 - r0);
      break;
    }
  }
  return { ums: Math.min(spec.umsMax, Math.max(0, Math.round(ums))), estimated: spec.estimated, anchors };
}

/**
 * Convert a raw mark on one unit to UMS for the given series.
 * Maths / Further Maths use the published raw boundaries with linear interpolation;
 * Double Award Science is a proportional estimate (no unit raw boundaries published).
 */
export function rawToUms(subject: Subject, unit: string, raw: number, series: Series): number {
  return rawToUmsDetail(subject, unit, raw, series).ums;
}

/** Smallest whole raw mark on `unit` that yields at least `umsNeeded`, or null if unreachable. */
export function minRawForUms(subject: Subject, unit: string, umsNeeded: number, series: Series): number | null {
  const spec = getUnitSpec(subject, unit);
  if (umsNeeded <= 0) return 0;
  if (umsNeeded > spec.umsMax) return null;
  // Conversion is monotone non-decreasing, so a linear scan of whole marks is exact and cheap.
  for (let raw = 0; raw <= spec.rawMax; raw++) {
    if (rawToUms(subject, unit, raw, series) >= umsNeeded) return raw;
  }
  return null;
}

// ---------------------------------------------------------------------------
// UMS → grade
// ---------------------------------------------------------------------------

/** Ordered grade ladder (best first) for a subject and series: [grade, minimum UMS]. */
export function gradeLadder(subject: Subject, series: Series): Array<[Grade, number]> {
  assertSeries(series);
  if (subject === "double-award-science") {
    const ladder = DAS.doubleGradeLadders[series] as Record<string, number>;
    return (DAS.doubleGradeOrder as DoubleGrade[]).map((g) => [g, ladder[g]] as [Grade, number]);
  }
  const s = subject === "maths" ? MATHS : FM;
  const fixed = s.subjectBoundaries as Record<string, number>;
  const out: Array<[Grade, number]> = [["A*", s.aStarBySeries[series]]];
  for (const g of ["A", "B", "C*", "C", "D", "E", "F", "G"] as SingleGrade[]) out.push([g, fixed[g]]);
  return out;
}

/** Maximum subject UMS (400 Maths, 200 Further Maths, 600 Double Award). */
export function subjectMaxUms(subject: Subject): number {
  return subject === "maths" ? MATHS.subjectMaxUms : subject === "further-maths" ? FM.subjectMaxUms : DAS.subjectMaxUms;
}

/** Subject grade for a total UMS. Returns "A*"/"C*" style grades, or the double grade for Science. */
export function umsToGrade(subject: Subject, totalUms: number, series: Series): Grade {
  for (const [grade, min] of gradeLadder(subject, series)) {
    if (totalUms >= min) return grade;
  }
  return "U";
}

/** Unit grade (lower-case, "c*" included) from a unit UMS using the fixed unit ladder. */
export function unitGradeFromUms(subject: Subject, unit: string, ums: number): UnitGrade {
  const spec = getUnitSpec(subject, unit);
  for (const { grade, ums: min } of spec.thresholds) if (ums >= min) return grade;
  return "u";
}

export interface UnitResult {
  unit: string;
  raw: number;
  rawMax: number;
  ums: number;
  umsMax: number;
  grade: UnitGrade;
  estimated: boolean;
}

/** Raw mark on a unit → UMS and unit grade. */
export function unitGradeFromRaw(subject: Subject, unit: string, raw: number, series: Series): UnitResult {
  const spec = getUnitSpec(subject, unit);
  const { ums, estimated } = rawToUmsDetail(subject, unit, raw, series);
  return { unit, raw, rawMax: spec.rawMax, ums, umsMax: spec.umsMax, grade: unitGradeFromUms(subject, unit, ums), estimated };
}

// ---------------------------------------------------------------------------
// Grade ordering helpers
// ---------------------------------------------------------------------------

function gradeOrder(subject: Subject): readonly Grade[] {
  return subject === "double-award-science" ? DOUBLE_GRADE_ORDER : SINGLE_GRADE_ORDER;
}

/** 0 = best grade. Throws on a grade that does not belong to the subject's scale. */
export function gradeRank(subject: Subject, grade: Grade): number {
  const i = gradeOrder(subject).indexOf(grade);
  if (i < 0) throw new RangeError(`Grade "${grade}" is not on the ${subject} scale`);
  return i;
}

/** The lower (worse) of two grades — used to apply a combination cap. */
export function capGrade(subject: Subject, grade: Grade, cap: Grade): Grade {
  return gradeRank(subject, grade) < gradeRank(subject, cap) ? cap : grade;
}

// ---------------------------------------------------------------------------
// Unit combinations
// ---------------------------------------------------------------------------

export interface CombinationCheck {
  valid: boolean;
  reason?: string;
  units: string[];
  /** Best subject grade reachable with this combination (A* only where the UMS allow it). */
  maxGrade: Grade;
  /** Sum of the unit UMS maxima for the combination. */
  maxUms: number;
  description: string;
}

function isMathsModular(u: string) {
  return u === "M1" || u === "M2" || u === "M3" || u === "M4";
}
function isMathsCompletion(u: string) {
  return u === "M5" || u === "M6" || u === "M7" || u === "M8";
}

/**
 * Validate a unit combination and work out the grade cap.
 *  - Maths: one of M1–M4 plus one of M5–M8 (spec §4.5; cross-tier pairs allowed, cap from UMS maxima).
 *  - Further Maths: U1 plus exactly two of U2–U4.
 *  - Double Award: every base unit exactly once, U7A and U7B at the same tier; cap from the
 *    CCEA tier-combination table.
 */
export function validateCombination(subject: Subject, units: readonly string[], series: Series): CombinationCheck {
  assertSeries(series);
  const list = [...new Set(units)];
  const fail = (reason: string): CombinationCheck => ({
    valid: false, reason, units: list, maxGrade: "U", maxUms: 0, description: list.join(" + "),
  });

  if (subject === "maths") {
    const unknown = list.filter((u) => !MATHS_UNITS.includes(u as MathsUnit));
    if (unknown.length) return fail(`Unknown Mathematics unit(s): ${unknown.join(", ")}`);
    const modular = list.filter(isMathsModular);
    const completion = list.filter(isMathsCompletion);
    if (list.length !== 2 || modular.length !== 1 || completion.length !== 1) {
      return fail("GCSE Mathematics needs exactly one of M1–M4 and exactly one of M5–M8");
    }
    const ordered = [modular[0], completion[0]];
    const maxUms = ordered.reduce((s, u) => s + getUnitSpec(subject, u).umsMax, 0);
    return {
      valid: true, units: ordered, maxUms, maxGrade: umsToGrade(subject, maxUms, series),
      description: ordered.join(" + "),
    };
  }

  if (subject === "further-maths") {
    const unknown = list.filter((u) => !FM_UNITS.includes(u as FurtherMathsUnit));
    if (unknown.length) return fail(`Unknown Further Mathematics unit(s): ${unknown.join(", ")}`);
    const options = list.filter((u) => u !== "U1");
    if (!list.includes("U1") || list.length !== 3 || options.length !== 2) {
      return fail("GCSE Further Mathematics needs U1 plus exactly two of U2, U3, U4");
    }
    const ordered = ["U1", ...options.sort()];
    const maxUms = ordered.reduce((s, u) => s + getUnitSpec(subject, u).umsMax, 0);
    return {
      valid: true, units: ordered, maxUms, maxGrade: umsToGrade(subject, maxUms, series),
      description: ordered.join(" + "),
    };
  }

  // Double Award Science
  const parsed: Array<{ unit: string; base: ScienceBaseUnit; tier: ScienceTier }> = [];
  for (const u of list) {
    try {
      const p = parseScienceUnit(u);
      parsed.push({ unit: u, ...p });
    } catch (e) {
      return fail((e as Error).message);
    }
  }
  const byBase = new Map<ScienceBaseUnit, ScienceTier>();
  for (const p of parsed) {
    if (byBase.has(p.base)) return fail(`Unit ${p.base} entered at two tiers`);
    byBase.set(p.base, p.tier);
  }
  const missing = DAS_BASE_UNITS.filter((b) => !byBase.has(b));
  if (missing.length) return fail(`Double Award Science needs every unit once; missing ${missing.join(", ")}`);
  if (byBase.get("U7A") !== byBase.get("U7B")) return fail("Unit 7 Booklets A and B must be at the same tier");
  const f1 = (["B1", "C1", "P1"] as const).filter((b) => byBase.get(b) === "F").length;
  const f2 = (["B2", "C2", "P2"] as const).filter((b) => byBase.get(b) === "F").length;
  const u7 = byBase.get("U7A") === "H" ? "unit7Higher" : "unit7Foundation";
  const maxGrade = (DAS.tierCombinationMaxGrade[u7] as Record<string, string>)[`${f1},${f2}`] as DoubleGrade;
  const ordered = DAS_BASE_UNITS.map((b) => `${b}${byBase.get(b)}`);
  const maxUms = ordered.reduce((s, u) => s + getUnitSpec(subject, u).umsMax, 0);
  return {
    valid: true, units: ordered, maxUms, maxGrade,
    description: `${3 - f1}/3 Unit 1 papers Higher, ${3 - f2}/3 Unit 2 papers Higher, Unit 7 ${u7 === "unit7Higher" ? "Higher" : "Foundation"}`,
  };
}

// ---------------------------------------------------------------------------
// Subject grade from raw marks
// ---------------------------------------------------------------------------

export interface SubjectResult {
  subject: Subject;
  series: Series;
  units: UnitResult[];
  totalUms: number;
  /** Maximum UMS for this combination of units. */
  maxUms: number;
  /** Subject UMS scale maximum (400 / 200 / 600). */
  scaleMax: number;
  /** Grade implied by the UMS alone. */
  uncappedGrade: Grade;
  /** Final grade after applying the combination cap. */
  grade: Grade;
  cap: Grade;
  capped: boolean;
  estimated: boolean;
  combination: CombinationCheck;
}

/**
 * Aggregate raw marks on a legal combination of units into a subject grade.
 * Throws on an illegal combination or out-of-range raw mark.
 */
export function subjectGradeFromRaw(subject: Subject, rawByUnit: Record<string, number>, series: Series): SubjectResult {
  const combination = validateCombination(subject, Object.keys(rawByUnit), series);
  if (!combination.valid) throw new Error(combination.reason);
  const units = combination.units.map((u) => unitGradeFromRaw(subject, u, rawByUnit[u], series));
  const totalUms = units.reduce((s, u) => s + u.ums, 0);
  const uncappedGrade = umsToGrade(subject, totalUms, series);
  const grade = capGrade(subject, uncappedGrade, combination.maxGrade);
  return {
    subject, series, units, totalUms, maxUms: combination.maxUms, scaleMax: subjectMaxUms(subject),
    uncappedGrade, grade, cap: combination.maxGrade, capped: grade !== uncappedGrade,
    estimated: units.some((u) => u.estimated), combination,
  };
}

// ---------------------------------------------------------------------------
// What-if: raw marks needed on the remaining unit
// ---------------------------------------------------------------------------

export interface WhatIfTarget {
  grade: Grade;
  /** Subject UMS needed for the grade. */
  targetUms: number;
  /** UMS still needed on the missing unit (may be ≤ 0 if already secured). */
  umsNeeded: number;
  /** Smallest raw mark on the missing unit that secures the grade; null if impossible. */
  rawNeeded: number | null;
  /** Raw needed as a percentage of the unit's raw maximum (null if impossible). */
  rawPercent: number | null;
  reachable: boolean;
}

export interface WhatIfResult {
  subject: Subject;
  series: Series;
  /** The unit still to be sat. */
  unit: string;
  unitRawMax: number;
  unitUmsMax: number;
  /** Units already known and their UMS. */
  given: UnitResult[];
  givenUms: number;
  combination: CombinationCheck;
  targets: WhatIfTarget[];
  estimated: boolean;
}

function defaultTargets(subject: Subject): Grade[] {
  return subject === "double-award-science" ? ["A*A*", "A*A", "AA"] : ["A*", "A", "B"];
}

/** Candidate units that would complete a legal combination containing `given`. */
function candidateMissingUnits(subject: Subject, given: string[]): string[] {
  if (subject === "maths") {
    if (given.length !== 1) return [];
    const pool = isMathsModular(given[0]) ? ["M8", "M7", "M6", "M5"] : isMathsCompletion(given[0]) ? ["M4", "M3", "M2", "M1"] : [];
    return pool;
  }
  if (subject === "further-maths") {
    if (given.length !== 2) return [];
    return FM_UNITS.filter((u) => !given.includes(u));
  }
  if (given.length !== 7) return [];
  const bases = new Set(given.map((u) => parseScienceUnit(u).base));
  const missing = DAS_BASE_UNITS.filter((b) => !bases.has(b));
  if (missing.length !== 1) return [];
  const m = missing[0];
  if (m === "U7A" || m === "U7B") {
    const other = given.find((u) => parseScienceUnit(u).base === (m === "U7A" ? "U7B" : "U7A"));
    return other ? [`${m}${parseScienceUnit(other).tier}`] : [`${m}H`, `${m}F`];
  }
  return [`${m}H`, `${m}F`];
}

/**
 * Given raw marks on all but one unit, the raw mark needed on the remaining unit for each
 * target grade (default A*, A, B — or A*A*, A*A, AA for Science).
 *  - Maths: pass `{ M4: raw }` → results for M8 first (then M7, M6, M5), or `{ M8: raw }` → M4 first.
 *  - Further Maths: pass U1 plus one option → one result per remaining option unit.
 *  - Science: pass seven tiered units → the eighth (both tiers where not implied).
 * Restrict with `options.missingUnit`; override the grades with `options.targets`.
 */
export function whatIfForAStar(
  subject: Subject,
  currentUnitRaw: Record<string, number>,
  series: Series,
  options: { missingUnit?: string; targets?: Grade[] } = {},
): WhatIfResult[] {
  assertSeries(series);
  const givenUnits = Object.keys(currentUnitRaw);
  const candidates = options.missingUnit ? [options.missingUnit] : candidateMissingUnits(subject, givenUnits);
  if (candidates.length === 0) {
    throw new Error(
      `Cannot infer the missing unit from ${givenUnits.join(", ") || "no units"}; pass exactly all-but-one unit of a legal combination`,
    );
  }
  const given = givenUnits.map((u) => unitGradeFromRaw(subject, u, currentUnitRaw[u], series));
  const givenUms = given.reduce((s, u) => s + u.ums, 0);
  const targets = options.targets ?? defaultTargets(subject);
  const ladder = new Map(gradeLadder(subject, series));
  const results: WhatIfResult[] = [];

  for (const unit of candidates) {
    const combination = validateCombination(subject, [...givenUnits, unit], series);
    if (!combination.valid) throw new Error(combination.reason);
    const spec = getUnitSpec(subject, unit);
    const targetResults: WhatIfTarget[] = targets.map((grade) => {
      const targetUms = ladder.get(grade);
      if (targetUms === undefined) throw new RangeError(`Grade "${grade}" is not on the ${subject} scale`);
      const umsNeeded = targetUms - givenUms;
      const withinCap = gradeRank(subject, grade) >= gradeRank(subject, combination.maxGrade);
      const rawNeeded = withinCap ? minRawForUms(subject, unit, umsNeeded, series) : null;
      return {
        grade, targetUms, umsNeeded, rawNeeded,
        rawPercent: rawNeeded === null ? null : Math.round((100 * rawNeeded) / spec.rawMax),
        reachable: rawNeeded !== null,
      };
    });
    results.push({
      subject, series, unit, unitRawMax: spec.rawMax, unitUmsMax: spec.umsMax, given, givenUms, combination,
      targets: targetResults, estimated: spec.estimated || given.some((g) => g.estimated),
    });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Human-readable gap report
// ---------------------------------------------------------------------------

export interface UmsGapReport {
  text: string;
  current: SubjectResult;
  target: Grade;
  targetUms: number;
  /** UMS still needed (0 if already achieved). */
  gapUms: number;
  /** Unit the raw-mark advice refers to. */
  focusUnit: string;
  /** Extra raw marks needed on the focus unit alone; null if the focus unit cannot close the gap by itself. */
  extraRawOnFocus: number | null;
  reachable: boolean;
  achieved: boolean;
  estimated: boolean;
}

function withArticle(grade: Grade): string {
  return /^[AEF]/.test(grade) ? `an ${grade}` : `a ${grade}`;
}

/**
 * Plain-English distance to a target grade, e.g.
 * "You are 14 UMS from an A; that is about 8 more raw marks on M8."
 * Default target: the next grade above the current one (respecting the combination cap).
 * Default focus unit: the unit with the most UMS headroom.
 */
export function umsGapReport(
  subject: Subject,
  rawByUnit: Record<string, number>,
  series: Series,
  options: { target?: Grade; focusUnit?: string } = {},
): UmsGapReport {
  const current = subjectGradeFromRaw(subject, rawByUnit, series);
  const ladder = gradeLadder(subject, series);
  const order = gradeOrder(subject);

  let target = options.target;
  if (!target) {
    const rank = gradeRank(subject, current.grade);
    target = rank === 0 ? current.grade : order[rank - 1];
  }
  const targetUms = new Map(ladder).get(target);
  if (targetUms === undefined) throw new RangeError(`Grade "${target}" is not on the ${subject} scale`);

  const focusUnit =
    options.focusUnit ??
    [...current.units].sort((a, b) => b.umsMax - b.ums - (a.umsMax - a.ums) || b.umsMax - a.umsMax)[0].unit;
  const focus = current.units.find((u) => u.unit === focusUnit);
  if (!focus) throw new RangeError(`Unit "${focusUnit}" is not part of the combination`);

  const gapUms = Math.max(0, targetUms - current.totalUms);
  const capBlocked = gradeRank(subject, target) < gradeRank(subject, current.cap);
  const achieved = gapUms === 0 && !capBlocked;
  const estimated = current.estimated;
  const approx = estimated ? " (estimated)" : "";

  if (capBlocked) {
    return {
      text: `Grade ${target} is not available with ${current.combination.description}; the best grade for that combination is ${current.cap}.`,
      current, target, targetUms, gapUms, focusUnit, extraRawOnFocus: null, reachable: false, achieved: false, estimated,
    };
  }
  if (achieved) {
    return {
      text: `You already have ${withArticle(target)}: ${current.totalUms}/${current.scaleMax} UMS is ${current.totalUms - targetUms} UMS above the ${target} boundary (${targetUms})${approx}.`,
      current, target, targetUms, gapUms, focusUnit, extraRawOnFocus: 0, reachable: true, achieved: true, estimated,
    };
  }

  const neededOnFocus = minRawForUms(subject, focusUnit, focus.ums + gapUms, series);
  if (neededOnFocus !== null) {
    const extra = Math.max(0, neededOnFocus - focus.raw);
    return {
      text: `You are ${gapUms} UMS from ${withArticle(target)}; that is about ${extra} more raw mark${extra === 1 ? "" : "s"} on ${focusUnit} (${focus.raw} → ${neededOnFocus}/${focus.rawMax})${approx}.`,
      current, target, targetUms, gapUms, focusUnit, extraRawOnFocus: extra, reachable: true, achieved: false, estimated,
    };
  }

  // The focus unit alone cannot close the gap; report the residue and where else it must come from.
  const focusHeadroom = focus.umsMax - focus.ums;
  const residue = gapUms - focusHeadroom;
  const totalHeadroom = current.units.reduce((s, u) => s + (u.umsMax - u.ums), 0);
  const others = current.units.filter((u) => u.unit !== focusUnit);
  const reachable = totalHeadroom >= gapUms;
  const otherText = others
    .map((u) => {
      const need = minRawForUms(subject, u.unit, u.ums + residue, series);
      return need === null ? `${u.unit} (not enough headroom alone)` : `${Math.max(0, need - u.raw)} more raw marks on ${u.unit}`;
    })
    .join(" or ");
  return {
    text: reachable
      ? `You are ${gapUms} UMS from ${withArticle(target)}; even full marks on ${focusUnit} (${focus.raw} → ${focus.rawMax}, +${focusHeadroom} UMS) leave ${residue} UMS, so you would also need ${otherText}${approx}.`
      : `You are ${gapUms} UMS from ${withArticle(target)}, but the most this combination can still add is ${totalHeadroom} UMS, so ${withArticle(target)} is out of reach with these units${approx}.`,
    current, target, targetUms, gapUms, focusUnit, extraRawOnFocus: null, reachable, achieved: false, estimated,
  };
}

/** Raw data, exported for UI tables and tests. */
export const CCEA_BOUNDARIES = boundaries;
