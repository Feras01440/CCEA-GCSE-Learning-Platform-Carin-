/**
 * The UMS result model for one timed run: raw on this paper → raw on the engine unit →
 * UMS → unit grade → the top-grade band on this unit and what the other unit(s) need.
 *
 * Pure functions over the grade engine (src/lib/grades/ums.ts) and saved runs, so the
 * UI stays thin and the arithmetic is testable.
 *
 * Unit composition:
 *  - M1–M4, FM1–FM4, B1/C1/P1/B2/C2/P2: one paper is the whole unit.
 *  - M5–M8: Paper 1 + Paper 2 make the unit (100 raw). The other paper's raw comes from
 *    the latest saved run of it; failing that it is assumed equal to this paper's score
 *    and the result is flagged as assumed.
 *  - Unit 7 Booklet B: three 35-mark discipline booklets make the 105-mark unit; same rule.
 *
 * Top-grade band ("A* bracket"):
 *  - Maths: the pathway's best grade (A* for M4 + M8, B for M3 + M7, …) needs at least
 *    `subject threshold − partner unit's UMS maximum` from this unit even with a perfect
 *    partner paper. That floor is the bracket.
 *  - Further Maths: A* needs `A* threshold − 100` on U1 (the other two units max 50 each)
 *    and `A* threshold − 150` on an option unit.
 *  - Science: CCEA publishes no unit raw boundaries, so the whole result is a proportional
 *    estimate; the band is the pro-rata share of the A*A* threshold (541/600 in 2026).
 */
import type { Mock } from "@/lib/db/db";
import {
  SINGLE_GRADE_ORDER,
  getUnitSpec,
  gradeLadder,
  gradeRank,
  minRawForUms,
  subjectGradeFromRaw,
  subjectMaxUms,
  umsGapReport,
  unitGradeFromRaw,
  validateCombination,
  whatIfForAStar,
  type Grade,
  type Series,
  type SubjectResult,
  type UmsGapReport,
  type UnitResult,
  type WhatIfResult,
} from "@/lib/grades/ums";
import {
  SERIES_LABEL,
  engineSubject,
  engineUnit,
  isMathsCompletion,
  mathsPartnerUnit,
  partKeyOf,
  partsNeeded,
  sessionLabel,
  type PaperMeta,
  type RunnerPaper,
} from "./meta";

// ---------------------------------------------------------------------------
// Saved runs → latest raw per unit part
// ---------------------------------------------------------------------------

export interface SavedPart {
  raw: number;
  rawMax: number;
  paperId: string;
  sessionKey: string;
  at: Date;
  label: string;
}

/** `{ [engineUnit]: { [partKey]: latest saved part } }`, e.g. `{ M8: { P1: …, P2: … } }`. */
export type SavedUnits = Record<string, Record<string, SavedPart>>;

function mockPartLabel(m: Mock): string {
  const session = sessionLabel(m.sessionKey);
  if (m.subject === "maths" && isMathsCompletion(m.unit) && m.paperNumber) return `${m.unit} Paper ${m.paperNumber} · ${session}`;
  if (m.subject === "science" && m.unit === "U7") return `Booklet ${m.booklet ?? "B"} ${m.discipline ?? ""} ${m.tier ?? ""} · ${session}`.replace(/\s+/g, " ");
  if (m.subject === "science") return `${m.unit} ${m.tier ?? ""} · ${session}`.replace(/\s+/g, " ");
  return `${m.unit} · ${session}`;
}

/** Latest saved raw per (engine unit, part); the newest run of each part wins. */
export function composeSavedUnits(mocks: readonly Mock[]): SavedUnits {
  const out: SavedUnits = {};
  const newestFirst = [...mocks].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  for (const m of newestFirst) {
    const key = partKeyOf({ subject: m.subject, unit: m.unit, paperNumber: m.paperNumber, discipline: m.discipline });
    const unit = (out[m.engineUnit] ??= {});
    if (!unit[key]) {
      unit[key] = { raw: m.raw, rawMax: m.rawMax, paperId: m.paperId, sessionKey: m.sessionKey, at: new Date(m.at), label: mockPartLabel(m) };
    }
  }
  return out;
}

/** Raw on a whole engine unit from saved parts, or null when a part is missing. */
export function savedUnitRaw(saved: SavedUnits, unit: string, needed: readonly string[]): { raw: number; parts: SavedPart[] } | null {
  const parts = saved[unit];
  if (!parts) return null;
  const list: SavedPart[] = [];
  for (const k of needed) {
    const p = parts[k];
    if (!p) return null;
    list.push(p);
  }
  return { raw: list.reduce((s, p) => s + p.raw, 0), parts: list };
}

// ---------------------------------------------------------------------------
// The result model
// ---------------------------------------------------------------------------

export interface CompositionPart {
  key: string;
  label: string;
  raw: number;
  rawMax: number;
  source: "this-run" | "saved" | "assumed";
}

export interface Bracket {
  grade: Grade;
  fromUms: number;
  toUms: number;
  /** Smallest raw on the unit inside the band, or null when the band starts above the unit's reach. */
  fromRaw: number | null;
  kind: "floor" | "pro-rata";
  /** Plain-English reading of the band. */
  text: string;
}

export interface WhatIfLine {
  grade: Grade;
  rawNeeded: number | null;
  rawMax: number;
  text: string;
}

export interface PaperResultModel {
  series: Series;
  engineSubject: ReturnType<typeof engineSubject>;
  engineUnit: string;
  paperRaw: number;
  paperRawMax: number;
  parts: CompositionPart[];
  /** True when a missing part of the unit was assumed equal to this paper's score. */
  assumed: boolean;
  unit: UnitResult;
  umsMax: number;
  /** Whole-scale maximum of the unit (Higher scale; equals umsMax except for Foundation Science). */
  scaleMax: number;
  estimated: boolean;
  bracket: Bracket | null;
  /** Raw marks short of the band on this unit (0 when inside; null without a reachable band). */
  gapRaw: number | null;
  /** What the other unit(s) would need, given this one. */
  whatIf: { unit: string; rawMax: number; lines: WhatIfLine[]; note: string } | null;
  /** Subject-level grade when saved runs complete the combination. */
  subject: { result: SubjectResult; gap: UmsGapReport; usedParts: SavedPart[] } | null;
  notes: string[];
}

function withArticle(grade: Grade): string {
  return /^[AEF]/.test(grade) ? `an ${grade}` : `a ${grade}`;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Sum of the unit's parts for this run (this paper + saved or assumed parts). */
export function composeThisRun(paper: RunnerPaper, paperRaw: number, saved: SavedUnits): { parts: CompositionPart[]; assumed: boolean } {
  const eu = engineUnit(paper);
  const mine = partKeyOf(paper);
  const needed = partsNeeded(paper);
  const parts: CompositionPart[] = [];
  let assumed = false;
  for (const key of needed) {
    if (key === mine) {
      parts.push({ key, label: partLabel(paper, key), raw: paperRaw, rawMax: paper.marks, source: "this-run" });
      continue;
    }
    const s = saved[eu]?.[key];
    if (s) {
      parts.push({ key, label: s.label, raw: s.raw, rawMax: s.rawMax, source: "saved" });
    } else {
      // Same proportion as this paper (P1/P2 and the three booklets all share one maximum).
      parts.push({ key, label: partLabel(paper, key), raw: paperRaw, rawMax: paper.marks, source: "assumed" });
      assumed = true;
    }
  }
  return { parts, assumed };
}

function partLabel(paper: Pick<PaperMeta, "subject" | "unit" | "tier">, key: string): string {
  if (key === "P1" || key === "P2") return `${paper.unit} Paper ${key.slice(1)}`;
  if (key === "main") return paper.unit;
  return `Booklet B ${key}`;
}

/** The top-grade band on this unit (see the file header). */
export function bracketFor(paper: Pick<PaperMeta, "subject" | "unit" | "tier" | "booklet">, series: Series): Bracket | null {
  const subj = engineSubject(paper.subject);
  const eu = engineUnit(paper);
  const spec = getUnitSpec(subj, eu);
  const ladder = new Map(gradeLadder(subj, series));

  if (subj === "maths") {
    const partner = mathsPartnerUnit(eu);
    if (!partner) return null;
    const cap = validateCombination("maths", [eu, partner], series).maxGrade;
    const threshold = ladder.get(cap);
    if (threshold === undefined) return null;
    const partnerMax = getUnitSpec("maths", partner).umsMax;
    const fromUms = Math.max(0, threshold - partnerMax);
    if (fromUms > spec.umsMax) return null;
    const fromRaw = minRawForUms("maths", eu, fromUms, series);
    return {
      grade: cap,
      fromUms,
      toUms: spec.umsMax,
      fromRaw,
      kind: "floor",
      text: `Grade ${cap} needs at least ${fromUms} of ${spec.umsMax} UMS from ${eu}${fromRaw !== null ? ` (${fromRaw}/${spec.rawMax} raw)` : ""}, even with full marks on ${partner}.`,
    };
  }

  if (subj === "further-maths") {
    const aStar = ladder.get("A*");
    if (aStar === undefined) return null;
    const othersMax = subjectMaxUms("further-maths") - spec.umsMax;
    const fromUms = Math.max(0, aStar - othersMax);
    if (fromUms > spec.umsMax) return null;
    const fromRaw = minRawForUms("further-maths", eu, fromUms, series);
    return {
      grade: "A*",
      fromUms,
      toUms: spec.umsMax,
      fromRaw,
      kind: "floor",
      text: `Grade A* needs at least ${fromUms} of ${spec.umsMax} UMS from ${eu}${fromRaw !== null ? ` (${fromRaw}/${spec.rawMax} raw)` : ""}, even with full marks on the other two units.`,
    };
  }

  // Double Award Science: proportional estimate, Higher papers only.
  if (paper.tier !== "H") return null;
  const top = ladder.get("A*A*");
  if (top === undefined) return null;
  const fromUms = Math.ceil((top * spec.umsMax) / subjectMaxUms(subj));
  if (fromUms > spec.umsMax) return null;
  const fromRaw = minRawForUms(subj, eu, fromUms, series);
  return {
    grade: "A*A*",
    fromUms,
    toUms: spec.umsMax,
    fromRaw,
    kind: "pro-rata",
    text: `On A*A* pace this unit contributes about ${fromUms} of ${spec.umsMax} UMS${fromRaw !== null ? ` (${fromRaw}/${spec.rawMax} raw)` : ""}: the pro-rata share of ${top}/600 (estimated).`,
  };
}

function targetsUnderCap(subject: "maths" | "further-maths", cap: Grade): Grade[] {
  const start = gradeRank(subject, cap);
  return SINGLE_GRADE_ORDER.slice(start, start + 3).filter((g) => g !== "U");
}

function whatIfLines(r: WhatIfResult): WhatIfLine[] {
  return r.targets.map((t) => ({
    grade: t.grade,
    rawNeeded: t.rawNeeded,
    rawMax: r.unitRawMax,
    text:
      t.rawNeeded === null
        ? `${t.grade}: out of reach from here`
        : t.rawNeeded === 0
          ? `${t.grade}: already secured`
          : `${t.grade}: ${t.rawNeeded}/${r.unitRawMax} on ${r.unit}`,
  }));
}

/** Build the full result model for one run. `saved` comes from `composeSavedUnits(all mocks)`. */
export function computePaperResult(paper: RunnerPaper, rawEntered: number, series: Series, saved: SavedUnits): PaperResultModel {
  // A typed-in total can exceed the paper maximum when tariffs were unknown; the engine must never see that.
  const paperRaw = Math.min(paper.marks, Math.max(0, Math.round(rawEntered)));
  const subj = engineSubject(paper.subject);
  const eu = engineUnit(paper);
  const spec = getUnitSpec(subj, eu);
  const { parts, assumed } = composeThisRun(paper, paperRaw, saved);
  const unitRaw = Math.min(spec.rawMax, Math.max(0, Math.round(parts.reduce((s, p) => s + p.raw, 0))));
  const unit = unitGradeFromRaw(subj, eu, unitRaw, series);
  const bracket = bracketFor(paper, series);
  const notes: string[] = [];

  let gapRaw: number | null = null;
  if (bracket && bracket.fromRaw !== null) gapRaw = Math.max(0, bracket.fromRaw - unitRaw);

  if (unit.estimated) {
    notes.push("CCEA publishes no unit raw boundaries for Science, so this UMS is a proportional estimate (raw ÷ paper maximum × unit UMS). The double grade is set on the whole 600-UMS scale.");
  }
  if (assumed) {
    const missing = parts.filter((p) => p.source === "assumed").map((p) => p.label);
    notes.push(`${missing.join(" and ")} not sat yet: assumed the same proportion as this paper. Save a run of ${missing.length === 1 ? "it" : "them"} and the unit will use the real marks.`);
  }
  const seriesYear = series === "summer-2025" ? 2025 : 2026;
  if (paper.year !== seriesYear) {
    notes.push(`Boundaries: ${SERIES_LABEL[series]} (the ${paper.year === 2026 || paper.year === 2025 ? "other" : "closest published"} series). CCEA sets raw boundaries afresh each sitting; unit UMS scales and subject boundaries below A* are fixed.`);
  }

  // What the other unit(s) need, and the subject grade where saved runs complete the picture.
  let whatIf: PaperResultModel["whatIf"] = null;
  let subject: PaperResultModel["subject"] = null;

  if (subj === "maths") {
    const partner = mathsPartnerUnit(eu);
    if (partner) {
      const cap = validateCombination("maths", [eu, partner], series).maxGrade;
      const targets = targetsUnderCap("maths", cap);
      try {
        const r = whatIfForAStar("maths", { [eu]: unitRaw }, series, { missingUnit: partner, targets })[0];
        whatIf = {
          unit: partner,
          rawMax: r.unitRawMax,
          lines: whatIfLines(r),
          note: cap === "A*" ? `${eu} + ${partner} is the only route to an A*.` : `${eu} + ${partner} tops out at ${cap}; an A* needs M4 + M8.`,
        };
      } catch {
        whatIf = null;
      }
      const partnerSaved = savedUnitRaw(saved, partner, partsNeeded({ subject: "maths", unit: partner }));
      if (partnerSaved) {
        try {
          const result = subjectGradeFromRaw("maths", { [eu]: unitRaw, [partner]: partnerSaved.raw }, series);
          const gap = umsGapReport("maths", { [eu]: unitRaw, [partner]: partnerSaved.raw }, series);
          subject = { result, gap, usedParts: partnerSaved.parts };
        } catch {
          subject = null;
        }
      }
    }
  } else if (subj === "further-maths") {
    const options = ["U2", "U3", "U4"].filter((u) => u !== eu);
    const savedU1 = eu === "U1" ? null : savedUnitRaw(saved, "U1", ["main"]);
    const savedOptions = options
      .map((u) => ({ unit: u, saved: savedUnitRaw(saved, u, ["main"]) }))
      .filter((x): x is { unit: string; saved: NonNullable<ReturnType<typeof savedUnitRaw>> } => x.saved !== null);
    const given: Record<string, number> = { [eu]: unitRaw };
    const usedParts: SavedPart[] = [];
    if (eu === "U1") {
      // Need two options for a grade; one option lets us ask what the remaining one needs.
      const [first, second] = savedOptions;
      if (first) {
        given[first.unit] = first.saved.raw;
        usedParts.push(...first.saved.parts);
      }
      if (second) {
        given[second.unit] = second.saved.raw;
        usedParts.push(...second.saved.parts);
      }
    } else {
      if (savedU1) {
        given.U1 = savedU1.raw;
        usedParts.push(...savedU1.parts);
      }
      const other = savedOptions[0];
      if (savedU1 && other) {
        given[other.unit] = other.saved.raw;
        usedParts.push(...other.saved.parts);
      }
    }
    const units = Object.keys(given);
    if (units.length === 3) {
      try {
        const result = subjectGradeFromRaw("further-maths", given, series);
        const gap = umsGapReport("further-maths", given, series);
        subject = { result, gap, usedParts };
      } catch {
        subject = null;
      }
    } else if (units.length === 2) {
      try {
        const rs = whatIfForAStar("further-maths", given, series);
        const r = rs.find((x) => x.unit !== "U4") ?? rs[0];
        if (r) {
          whatIf = {
            unit: r.unit,
            rawMax: r.unitRawMax,
            lines: whatIfLines(r),
            note: `Given ${units.join(" + ")} (saved runs), on ${r.unit}:`,
          };
        }
      } catch {
        whatIf = null;
      }
    } else {
      notes.push("Save runs of the other Further Maths units and this card will show the subject grade and what each remaining unit needs.");
    }
  } else {
    notes.push("The double grade needs all eight Science units; this card shows the unit on its own.");
  }

  return {
    series,
    engineSubject: subj,
    engineUnit: eu,
    paperRaw,
    paperRawMax: paper.marks,
    parts,
    assumed,
    unit,
    umsMax: spec.umsMax,
    scaleMax: spec.scaleMax,
    estimated: unit.estimated,
    bracket,
    gapRaw,
    whatIf,
    subject,
    notes,
  };
}

/** One-line caption under the dial: the gap in raw marks on this unit. */
export function gapCaption(m: PaperResultModel): string {
  const b = m.bracket;
  if (!b) {
    if (m.engineSubject === "double-award-science" && m.unit.estimated) {
      return "Foundation papers cap the unit UMS; the A*A* band applies to Higher papers.";
    }
    return "No top-grade band is reachable from this unit alone.";
  }
  if (b.fromRaw === null) return `${b.grade} band starts above this unit's reach.`;
  if (m.gapRaw === 0) {
    return `Inside the ${b.grade} band on ${m.engineUnit}: ${m.unit.ums} UMS, ${m.unit.ums - b.fromUms} above the floor of ${b.fromUms}.`;
  }
  const unitWord = m.parts.length > 1 ? ` (${m.parts.length === 2 ? "both papers" : "all three booklets"})` : "";
  return `${plural(m.gapRaw ?? 0, "raw mark")} short of the ${b.grade} band on ${m.engineUnit}${unitWord}${m.estimated ? ", estimated" : ""}.`;
}
