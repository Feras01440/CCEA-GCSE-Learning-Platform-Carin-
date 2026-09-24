/**
 * Loader for the CCEA past-paper index (data/papers/index.json) and the page map
 * (data/papers/questions-index.json). Both JSON files are imported statically and are
 * large, so import this module from server components / build steps only; client
 * components take the compact `PickerPaper` / `RunnerPaper` objects as props and use
 * the pure helpers in `./meta`.
 *
 * Copyright rules (data/papers/README.md §2): link only, never re-host, never embed.
 */
import papersIndex from "../../../data/papers/index.json";
import questionsIndex from "../../../data/papers/questions-index.json";
import {
  compareSessionsDesc,
  defaultFormulaSheetPage,
  defaultTemplate,
  paperDurationMinutes,
  paperMarks,
  unitLabel,
  type Discipline,
  type PaperMeta,
  type PaperSubject,
  type PickerPaper,
  type QuestionRow,
  type QuestionTemplate,
  type RunnerPaper,
  type Tier,
} from "./meta";

export * from "./meta";

// ---------------------------------------------------------------------------
// Types of the JSON files (see data/papers/README.md §3)
// ---------------------------------------------------------------------------

export interface IndexEntry {
  id: string;
  subject: PaperSubject;
  qualificationId: string;
  series: string;
  year: number;
  sessionKey: string;
  type: "Standard" | "Modified" | "Irish Medium";
  kind: "paper" | "ms";
  tier: Tier | null;
  unit: string;
  unitName: string;
  paperNumber: 1 | 2 | null;
  calculator: boolean | null;
  discipline: Discipline | null;
  booklet: "A" | "B" | null;
  variant: string | null;
  title: string;
  url: string;
  changed: string;
  pairId: string;
  counterpartIds: string[];
  duplicateOf: string | null;
  notes: string[];
}

export interface IndexSession {
  subject: PaperSubject;
  sessionKey: string;
  year: number;
  series: string;
  units: string[];
  standard: { papers: number; markSchemes: number; papersWithoutMarkScheme: number };
  modified: { papers: number; markSchemes: number };
  irishMedium: { papers: number; markSchemes: number };
  hasMarkSchemes: boolean;
}

interface PapersIndexFile {
  $schema: string;
  origin: string;
  papers: IndexEntry[];
  sessions: IndexSession[];
}

interface PageMapQuestion {
  number: string;
  located: boolean;
  marks: number | null;
  page: number | null;
  label?: string | null;
}

interface PageMapPaper {
  feedId: string;
  totalMarks: number | null;
  totalMarksStated: number | null;
  totalMatches: boolean;
  questionCount: number;
  formulaSheetPage: number | null;
  pageCount: number | null;
  questions: PageMapQuestion[];
}

interface QuestionsIndexFile {
  papers: PageMapPaper[];
}

const INDEX = papersIndex as unknown as PapersIndexFile;
const PAGE_MAP = questionsIndex as unknown as QuestionsIndexFile;

/** The session in which mark schemes are not yet published (data/papers/README.md §5). */
export const UNPUBLISHED_MS_SESSION = "2026-Summer";

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

const BY_ID = new Map<string, IndexEntry>(INDEX.papers.map((p) => [p.id, p]));
const PAGE_MAP_BY_ID = new Map<string, PageMapPaper>(PAGE_MAP.papers.map((p) => [p.feedId, p]));

/** Every entry of the feed, all types and kinds. */
export function allEntries(): readonly IndexEntry[] {
  return INDEX.papers;
}

export function getEntry(id: string): IndexEntry | undefined {
  return BY_ID.get(id);
}

/** Follow `duplicateOf` to the upload a UI should show. */
export function canonicalEntry(entry: IndexEntry): IndexEntry {
  return entry.duplicateOf ? (BY_ID.get(entry.duplicateOf) ?? entry) : entry;
}

/** Ordinary English-medium question papers, one per document (duplicate uploads folded away). */
export function standardPapers(): IndexEntry[] {
  return INDEX.papers.filter((p) => p.type === "Standard" && p.kind === "paper" && !p.duplicateOf);
}

/**
 * Papers a learner can sit at a desk against the clock. Unit 7 Booklet A is the
 * pre-release lab practical (15 marks per discipline, externally marked), so it is
 * excluded: there is nothing to time and no self-mark grid to fill.
 */
export function sittablePapers(): IndexEntry[] {
  return standardPapers().filter((p) => !(p.unit === "U7" && p.booklet === "A"));
}

/** The published Standard mark scheme for a paper, or null (e.g. Summer 2026). */
export function pairWithMarkScheme(paper: IndexEntry): IndexEntry | null {
  const candidates = paper.counterpartIds
    .map((id) => BY_ID.get(id))
    .filter((e): e is IndexEntry => !!e && e.kind === "ms")
    .map(canonicalEntry);
  if (candidates.length === 0) return null;
  // Prefer the canonical upload of a Standard scheme; the feed occasionally lists two.
  return candidates.find((c) => c.type === "Standard" && !c.duplicateOf) ?? candidates[0];
}

export function hasPublishedMarkScheme(paper: IndexEntry): boolean {
  return pairWithMarkScheme(paper) !== null;
}

/** Runner pages exist for sittable papers with a mark scheme, plus the not-yet-marked Summer 2026 set. */
export function isRunnable(paper: IndexEntry): boolean {
  if (paper.type !== "Standard" || paper.kind !== "paper" || paper.duplicateOf) return false;
  if (paper.unit === "U7" && paper.booklet === "A") return false;
  return hasPublishedMarkScheme(paper) || paper.sessionKey === UNPUBLISHED_MS_SESSION;
}

export function runnablePaperIds(): string[] {
  return sittablePapers()
    .filter(isRunnable)
    .map((p) => p.id);
}

/** Sittings of a subject that have at least one sittable Standard paper, newest first. */
export function listSessions(subject: PaperSubject): IndexSession[] {
  const withPapers = new Set(sittablePapers().filter((p) => p.subject === subject).map((p) => p.sessionKey));
  return INDEX.sessions
    .filter((s) => s.subject === subject && withPapers.has(s.sessionKey))
    .sort((a, b) => compareSessionsDesc(a.sessionKey, b.sessionKey));
}

const TIER_ORDER: Record<string, number> = { H: 0, F: 1 };
const DISCIPLINE_ORDER: Record<string, number> = { Biology: 0, Chemistry: 1, Physics: 2 };

function comparePapers(a: IndexEntry, b: IndexEntry): number {
  return (
    compareSessionsDesc(a.sessionKey, b.sessionKey) ||
    a.unit.localeCompare(b.unit, "en", { numeric: true }) ||
    (a.booklet ?? "").localeCompare(b.booklet ?? "") ||
    (DISCIPLINE_ORDER[a.discipline ?? ""] ?? 9) - (DISCIPLINE_ORDER[b.discipline ?? ""] ?? 9) ||
    (TIER_ORDER[a.tier ?? ""] ?? 9) - (TIER_ORDER[b.tier ?? ""] ?? 9) ||
    (a.paperNumber ?? 0) - (b.paperNumber ?? 0)
  );
}

/** Sittable Standard papers of a subject (optionally one unit), newest sitting first. */
export function papersFor(subject: PaperSubject, unit?: string): IndexEntry[] {
  return sittablePapers()
    .filter((p) => p.subject === subject && (unit === undefined || p.unit === unit))
    .sort(comparePapers);
}

// ---------------------------------------------------------------------------
// Compact objects for the UI
// ---------------------------------------------------------------------------

function toMeta(p: IndexEntry): PaperMeta {
  return {
    id: p.id,
    subject: p.subject,
    sessionKey: p.sessionKey,
    series: p.series,
    year: p.year,
    unit: p.unit,
    tier: p.tier,
    paperNumber: p.paperNumber,
    calculator: p.calculator,
    discipline: p.discipline,
    booklet: p.booklet,
    url: p.url,
  };
}

export function toPickerPaper(p: IndexEntry): PickerPaper {
  const ms = pairWithMarkScheme(p);
  return {
    ...toMeta(p),
    markSchemeUrl: ms?.url ?? null,
    markSchemeId: ms?.id ?? null,
    durationMinutes: paperDurationMinutes(p),
    marks: paperMarks(p),
    runnable: isRunnable(p),
  };
}

export function pickerPapers(subject: PaperSubject): PickerPaper[] {
  return papersFor(subject).map(toPickerPaper);
}

/**
 * Self-mark rows for a paper from the page map (question number, marks, PDF page).
 * Falls back to the default template when the page map disagrees with the paper's
 * front page by more than a fifth or found fewer than two questions (one Booklet B in
 * the corpus was read as a single 15-mark question).
 */
export function questionTemplate(p: IndexEntry): QuestionTemplate {
  const map = PAGE_MAP_BY_ID.get(p.id);
  const fallback = defaultTemplate(p);
  if (!map) return fallback;
  const rows: QuestionRow[] = map.questions.map((q) => {
    const row: QuestionRow = { q: q.number };
    if (typeof q.marks === "number" && q.marks > 0) row.available = q.marks;
    if (typeof q.page === "number" && q.page > 0) row.page = q.page;
    if (q.label) row.label = q.label;
    return row;
  });
  const expected = paperMarks(p);
  const sum = rows.reduce((s, r) => s + (r.available ?? 0), 0);
  const plausible = rows.length >= 2 && Math.abs(sum - expected) <= Math.max(2, expected / 5);
  const formulaSheetPage = map.formulaSheetPage ?? defaultFormulaSheetPage(p);
  if (!plausible) return { ...fallback, pageCount: map.pageCount, formulaSheetPage };
  return {
    rows,
    verified: map.totalMatches && sum === expected,
    source: "page-map",
    pageCount: map.pageCount,
    formulaSheetPage,
  };
}

/** The other paper of a completion test in the same sitting (Paper 1 ↔ Paper 2). */
function siblingOf(p: IndexEntry): RunnerPaper["sibling"] {
  if (!p.paperNumber) return null;
  const other = p.paperNumber === 1 ? 2 : 1;
  const wanted = p.pairId.replace(/:P[12]\b/, `:P${other}`);
  const sib = sittablePapers().find((e) => e.pairId === wanted);
  return sib ? { id: sib.id, label: unitLabel(sib), paperNumber: other, runnable: isRunnable(sib) } : null;
}

/** Everything the runner page needs for one paper; undefined when the id is not runnable. */
export function runnerPaper(id: string): RunnerPaper | undefined {
  const entry = BY_ID.get(id);
  if (!entry || !isRunnable(entry)) return undefined;
  return { ...toPickerPaper(entry), template: questionTemplate(entry), sibling: siblingOf(entry) };
}
