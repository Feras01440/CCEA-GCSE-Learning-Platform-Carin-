/**
 * Paper Runner metadata that is safe to import from client components: types, unit
 * labels, durations and marks (hard-coded from the CCEA specifications, see
 * docs/research/01–03 and data/exams/exam-map.json), default self-mark templates and
 * the mapping from data/papers/index.json codes to the grade engine's unit ids.
 *
 * The 1.5 MB index itself is loaded only in `./index.ts` (server side, at build time).
 */
import type { Series, Subject as EngineSubject } from "@/lib/grades/ums";
import type { MockMarkTag } from "@/lib/db/db";

export type PaperSubject = "maths" | "further-maths" | "science";
export type Tier = "H" | "F";
export type Discipline = "Biology" | "Chemistry" | "Physics";

/** The fields of a data/papers/index.json entry the runner needs (see data/papers/README.md §3). */
export interface PaperMeta {
  id: string;
  subject: PaperSubject;
  sessionKey: string;
  series: string;
  year: number;
  unit: string;
  tier: Tier | null;
  paperNumber: 1 | 2 | null;
  calculator: boolean | null;
  discipline: Discipline | null;
  booklet: "A" | "B" | null;
  url: string;
}

/** A paper as shown on the picker: metadata plus its official links. */
export interface PickerPaper extends PaperMeta {
  markSchemeUrl: string | null;
  markSchemeId: string | null;
  durationMinutes: number;
  marks: number;
  /** Whether the runner has a static page for it (published mark scheme or Summer 2026). */
  runnable: boolean;
}

/** One row of the self-mark grid, derived from the page map or a default template. */
export interface QuestionRow {
  q: string;
  /** Marks available; undefined when unknown (free entry). */
  available?: number;
  /** PDF page the question starts on (for `#page=` deep links). */
  page?: number;
  /** Fixed lexicon label from the page map, never question wording. */
  label?: string;
}

export interface QuestionTemplate {
  rows: QuestionRow[];
  /** True when the rows come from the page map and their marks add up to the paper total. */
  verified: boolean;
  /** Where the rows came from. */
  source: "page-map" | "default";
  pageCount: number | null;
  /** Page of the formula sheet inside the paper, or null when there is none. */
  formulaSheetPage: number | null;
}

/** Everything the runner page needs for one paper (passed from the server component). */
export interface RunnerPaper extends PickerPaper {
  template: QuestionTemplate;
  /** The other paper of a two-paper completion test (M5–M8), or null. */
  sibling: { id: string; label: string; paperNumber: 1 | 2; runnable: boolean } | null;
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

export const SUBJECTS: ReadonlyArray<{ id: PaperSubject; label: string; engine: EngineSubject }> = [
  { id: "maths", label: "Maths", engine: "maths" },
  { id: "further-maths", label: "Further Maths", engine: "further-maths" },
  { id: "science", label: "Science", engine: "double-award-science" },
];

export function engineSubject(subject: PaperSubject): EngineSubject {
  return subject === "science" ? "double-award-science" : subject;
}

export function subjectLabel(subject: PaperSubject): string {
  return SUBJECTS.find((s) => s.id === subject)?.label ?? subject;
}

// ---------------------------------------------------------------------------
// Units, tiers, labels
// ---------------------------------------------------------------------------

export const MATHS_MODULAR = ["M1", "M2", "M3", "M4"] as const;
export const MATHS_COMPLETION = ["M5", "M6", "M7", "M8"] as const;
export const FM_UNITS = ["FM1", "FM2", "FM3", "FM4"] as const;
export const SCIENCE_UNITS = ["B1", "C1", "P1", "B2", "C2", "P2", "U7"] as const;

export const FM_UNIT_NAMES: Record<string, string> = {
  FM1: "Pure Mathematics",
  FM2: "Mechanics",
  FM3: "Statistics",
  FM4: "Discrete and Decision Mathematics",
};

export const SCIENCE_UNIT_NAMES: Record<string, string> = {
  B1: "Biology Unit 1",
  C1: "Chemistry Unit 1",
  P1: "Physics Unit 1",
  B2: "Biology Unit 2",
  C2: "Chemistry Unit 2",
  P2: "Physics Unit 2",
  U7: "Unit 7 Practical Skills",
};

export function isMathsModular(unit: string): boolean {
  return (MATHS_MODULAR as readonly string[]).includes(unit);
}
export function isMathsCompletion(unit: string): boolean {
  return (MATHS_COMPLETION as readonly string[]).includes(unit);
}

/** Recommended partner unit in the Maths pathway (spec §4.5): M4 ↔ M8, M3 ↔ M7, M2 ↔ M6, M1 ↔ M5. */
export function mathsPartnerUnit(unit: string): string | null {
  const pairs: Record<string, string> = { M1: "M5", M2: "M6", M3: "M7", M4: "M8", M5: "M1", M6: "M2", M7: "M3", M8: "M4" };
  return pairs[unit] ?? null;
}

/** Tier of a Maths unit (fixed by the unit code). */
export function mathsUnitTier(unit: string): Tier | null {
  if (unit === "M1" || unit === "M2" || unit === "M5" || unit === "M6") return "F";
  if (unit === "M3" || unit === "M4" || unit === "M7" || unit === "M8") return "H";
  return null;
}

export function tierWord(tier: Tier | null): string {
  return tier === "H" ? "Higher" : tier === "F" ? "Foundation" : "";
}

/** Units offered in the picker's unit filter for a subject. */
export function unitsForSubject(subject: PaperSubject): readonly string[] {
  if (subject === "maths") return [...MATHS_MODULAR, ...MATHS_COMPLETION];
  if (subject === "further-maths") return FM_UNITS;
  return SCIENCE_UNITS;
}

/** Short unit filter label, e.g. "M4 · Higher", "FM2 · Mechanics", "U7 · Unit 7 Practical Skills". */
export function unitFilterLabel(subject: PaperSubject, unit: string): string {
  if (subject === "maths") {
    const t = tierWord(mathsUnitTier(unit));
    return `${unit} · ${t}${isMathsCompletion(unit) ? " completion" : ""}`;
  }
  if (subject === "further-maths") return `${unit} · ${FM_UNIT_NAMES[unit] ?? unit}`;
  return `${unit} · ${SCIENCE_UNIT_NAMES[unit] ?? unit}`;
}

function calcWord(calculator: boolean | null): string {
  return calculator === null ? "" : calculator ? "calculator" : "non-calculator";
}

/**
 * Human label for a paper:
 *  - M4 → "M4 Higher (calculator)"; M8 Paper 1 → "M8 Paper 1 (non-calculator)"
 *  - FM1 → "FM1 Pure Mathematics"
 *  - B1 H → "B1 Higher"; Unit 7 Booklet B Physics H → "Unit 7 Booklet B Physics Higher"
 */
export function unitLabel(p: Omit<PaperMeta, "id" | "sessionKey" | "series" | "year" | "url">): string {
  if (p.subject === "maths") {
    if (isMathsCompletion(p.unit) && p.paperNumber) {
      return `${p.unit} Paper ${p.paperNumber} (${calcWord(p.calculator ?? p.paperNumber === 2)})`;
    }
    const tier = tierWord(p.tier ?? mathsUnitTier(p.unit));
    const calc = calcWord(p.calculator ?? true);
    return `${p.unit} ${tier}${calc ? ` (${calc})` : ""}`;
  }
  if (p.subject === "further-maths") return `${p.unit} ${FM_UNIT_NAMES[p.unit] ?? ""}`.trim();
  if (p.unit === "U7") {
    return `Unit 7 Booklet ${p.booklet ?? "?"} ${p.discipline ?? ""} ${tierWord(p.tier)}`.replace(/\s+/g, " ").trim();
  }
  return `${p.unit} ${tierWord(p.tier)}`.trim();
}

/** "2025-Summer" → "Summer 2025". */
export function sessionLabel(sessionKey: string): string {
  const [year, series] = sessionKey.split("-");
  return `${series} ${year}`;
}

const SERIES_ORDER: Record<string, number> = { January: 1, March: 2, Summer: 3, November: 4 };

/** Sort comparator: newest sitting first. */
export function compareSessionsDesc(a: string, b: string): number {
  const [ya, sa] = a.split("-");
  const [yb, sb] = b.split("-");
  if (ya !== yb) return Number(yb) - Number(ya);
  return (SERIES_ORDER[sb] ?? 0) - (SERIES_ORDER[sa] ?? 0);
}

// ---------------------------------------------------------------------------
// Durations and marks (CCEA specifications; data/exams/exam-map.json agrees)
// ---------------------------------------------------------------------------

/** Minutes allowed for one paper entry of the index. */
export function paperDurationMinutes(p: Pick<PaperMeta, "subject" | "unit" | "booklet">): number {
  if (p.subject === "maths") {
    if (p.unit === "M1" || p.unit === "M2") return 105;
    if (p.unit === "M3" || p.unit === "M4") return 120;
    if (p.unit === "M5" || p.unit === "M6") return 60;
    return 75; // M7, M8: each of Paper 1 and Paper 2
  }
  if (p.subject === "further-maths") return p.unit === "FM1" ? 120 : 60;
  if (p.unit === "U7") return p.booklet === "B" ? 30 : 60;
  return p.unit.endsWith("1") ? 60 : 75;
}

/** Raw marks on one paper entry of the index. */
export function paperMarks(p: Pick<PaperMeta, "subject" | "unit" | "tier" | "booklet">): number {
  if (p.subject === "maths") return isMathsCompletion(p.unit) ? 50 : 100;
  if (p.subject === "further-maths") return p.unit === "FM1" ? 100 : 50;
  if (p.unit === "U7") return p.booklet === "B" ? 35 : 15;
  if (p.unit.endsWith("1")) return p.tier === "F" ? 60 : 70;
  return p.tier === "F" ? 70 : 80;
}

/** Typical number of questions, for the default self-mark template. */
export function defaultQuestionCount(p: Pick<PaperMeta, "subject" | "unit" | "paperNumber" | "booklet">): number {
  if (p.subject === "maths") {
    const counts: Record<string, number> = { M1: 28, M2: 28, M3: 27, M4: 22, M5: 15, M6: 15, M7: 14, M8: 14 };
    return counts[p.unit] ?? 20;
  }
  if (p.subject === "further-maths") return p.unit === "FM1" ? 12 : 6;
  if (p.unit === "U7") return p.booklet === "B" ? 4 : 1;
  return 9;
}

/** Maths papers carry the formula sheet on page 2; FM Units 1–3 too; Science has none. */
export function defaultFormulaSheetPage(p: Pick<PaperMeta, "subject" | "unit">): number | null {
  if (p.subject === "maths") return 2;
  if (p.subject === "further-maths") return p.unit === "FM4" ? null : 2;
  return null;
}

/** Default template: one row per question, free mark entry. */
export function defaultTemplate(p: Pick<PaperMeta, "subject" | "unit" | "paperNumber" | "booklet">): QuestionTemplate {
  const n = defaultQuestionCount(p);
  return {
    rows: Array.from({ length: n }, (_, i) => ({ q: String(i + 1) })),
    verified: false,
    source: "default",
    pageCount: null,
    formulaSheetPage: defaultFormulaSheetPage(p),
  };
}

// ---------------------------------------------------------------------------
// Grade-engine mapping
// ---------------------------------------------------------------------------

/**
 * The grade engine's unit id for a paper: Maths M1–M8 as is; FM1 → U1; Science base unit
 * plus tier (B1 + H → "B1H"); Unit 7 → "U7A"/"U7B" plus tier.
 */
export function engineUnit(p: Pick<PaperMeta, "subject" | "unit" | "tier" | "booklet">): string {
  if (p.subject === "maths") return p.unit;
  if (p.subject === "further-maths") return `U${p.unit.slice(2)}`;
  const tier = p.tier ?? "H";
  if (p.unit === "U7") return `U7${p.booklet ?? "B"}${tier}`;
  return `${p.unit}${tier}`;
}

/** Key of this paper inside its engine unit: "P1"/"P2" (completion tests), the discipline (Unit 7), or "main". */
export function partKeyOf(p: Pick<PaperMeta, "subject" | "unit" | "paperNumber" | "discipline">): string {
  if (p.subject === "maths" && isMathsCompletion(p.unit) && p.paperNumber) return `P${p.paperNumber}`;
  if (p.subject === "science" && p.unit === "U7" && p.discipline) return p.discipline;
  return "main";
}

/** The parts that make up one engine unit: Paper 1 + Paper 2, or the three Booklet B disciplines, or just this paper. */
export function partsNeeded(p: Pick<PaperMeta, "subject" | "unit">): string[] {
  if (p.subject === "maths" && isMathsCompletion(p.unit)) return ["P1", "P2"];
  if (p.subject === "science" && p.unit === "U7") return ["Biology", "Chemistry", "Physics"];
  return ["main"];
}

/** Boundary series to use by default: the paper's own year where published, else the latest. */
export function defaultSeriesFor(p: Pick<PaperMeta, "year">): Series {
  return p.year <= 2025 ? "summer-2025" : "summer-2026";
}

export const SERIES_LABEL: Record<Series, string> = {
  "summer-2025": "Summer 2025",
  "summer-2026": "Summer 2026",
};

// ---------------------------------------------------------------------------
// Self-mark tags
// ---------------------------------------------------------------------------

export const MARK_TAGS: ReadonlyArray<{ id: MockMarkTag; label: string; hint: string }> = [
  { id: "method", label: "Method", hint: "Did not know, or chose, the method the scheme wanted" },
  { id: "accuracy", label: "Accuracy", hint: "Right method, slip in the working or the final answer" },
  { id: "misread", label: "Misread", hint: "Answered a different question from the one asked" },
  { id: "presentation", label: "Presentation", hint: "Units, rounding, notation or working not shown" },
  { id: "not-attempted", label: "Not attempted", hint: "Left blank or ran out of time" },
];

/** Compact copyright / provenance line shown beside every official link. */
export const CCEA_LINK_NOTICE = "Opens the official PDF on ccea.org.uk. We never copy papers.";

/** Route of the runner page for a paper id (trailing slash: static export). */
export function runnerHref(paperId: string): string {
  return `/papers/${paperId}/`;
}

/** Deep link into the official PDF at a page (`#page=N` is honoured by desktop PDF viewers). */
export function pdfPageHref(url: string, page: number | undefined): string {
  return page ? `${url}#page=${page}` : url;
}

/** "1 h 45 min", "60 min". */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
