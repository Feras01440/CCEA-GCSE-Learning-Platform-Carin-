import examMap from "../../../data/exams/exam-map.json";

/**
 * Her exam plan: the units she is entered for, each in one series, read against CCEA's timetable.
 *
 * The plan is data, not code (the owner's rule of 23 September 2026: "she picks and chooses her plan, and English
 * and other subjects will be added later"). A plan is a list of entries — subject, unit, series and, where the unit
 * is entered at a tier, the tier — and everything Today, Papers, the Map and Settings show is derived from those
 * entries and from data/exams/exam-map.json: which units exist (a unit is anything the timetable sets a sitting
 * for), in which series, on which dates, and what each is called (its `subjects` block). Nothing here lists the
 * current units or subjects, so a new subject is a data addition: its rows, names and rules in the exam map.
 *
 * DEFAULT_PLAN is the plan first run pre-fills and she confirmed; it is a default, never a fact about her.
 */

/** The subjects the rest of the app knows by name in its types (the taxonomy, the grade engine, the papers archive). */
export type Subject = "maths" | "further-maths" | "science";
const TYPED_SUBJECTS: readonly string[] = ["maths", "further-maths", "science"];

/** A subject the typed layers (taxonomy, grades, archive) know. A plan may hold others; those layers skip them. */
export function isTypedSubject(subject: string): subject is Subject {
  return TYPED_SUBJECTS.includes(subject);
}

export type Tier = "F" | "H";

/** One unit she is entered for, in one series. */
export interface PlanEntry {
  /** A subject key of the exam map ("maths", "further-maths", "science", …). */
  subject: string;
  /** A unit the exam map sets a sitting for ("M4", "FM1", "B1", "U7", …). */
  unit: string;
  /** The series she is entered in ("2027-Summer"). A series already past means the unit has been sat. */
  series: string;
  /** The tier she is entered at, where the unit is set at both; null where the unit code fixes it or there is none. */
  tier: Tier | null;
}

export interface ExamPlan {
  version: 2;
  learnerName: string | null;
  entries: PlanEntry[];
  sessionsPerWeek: number;
}

/** A paper of her plan: the sitting of one entry, on its date. */
export interface PlanPaper {
  subject: string;
  unit: string;
  /** What lists call the paper: "M4", "Biology Unit 1", "Further Maths Unit 1 (Pure)". */
  label: string;
  series: string;
  date: string; // ISO yyyy-mm-dd
  start: string | null; // "09:15"
  durationMinutes: number | null;
  daysAway: number;
  /** The tier it is sat at: the entry's, or the one the unit code fixes, or null. */
  tier: Tier | null;
  /** A unit sat as two papers on one morning (M5–M8): each paper's start and length. */
  parts?: Array<{ paper: number; start: string; durationMinutes: number | null }>;
  /** What is sat straight after on the same morning (a Unit 7 Booklet B after a science Unit 2 paper). */
  then?: { unit: string; start: string; durationMinutes: number };
  /** A unit sat in pieces straight after other papers (Unit 7 Booklet B): each piece, and the paper it follows. */
  booklets?: Array<{ date: string; start: string; durationMinutes: number; after: string }>;
}

/** A paper whose subject the typed layers know. */
export interface UpcomingPaper extends PlanPaper {
  subject: Subject;
}

// ---------------------------------------------------------------------------
// The timetable and its names (data/exams/exam-map.json)
// ---------------------------------------------------------------------------

interface Then {
  unit: string;
  start: string;
  durationMinutes: number;
}
interface Row {
  subject: string;
  unit: string;
  series: string;
  date: string;
  start?: string;
  session?: string;
  durationMinutes?: number | Record<string, number>;
  papers?: Array<{ paper: number; start: string; durationMinutes: Record<string, number> }>;
  then?: Then;
}
interface UnitNames {
  label: string;
  name: string;
  tier?: Tier;
}
interface SubjectNames {
  title: string;
  short: string;
  tierByEntry?: boolean;
  units: Record<string, UnitNames>;
}

const ROWS = examMap.papers as unknown as Row[];
const NAMES = examMap.subjects as unknown as Record<string, SubjectNames>;
const RULES = examMap.rules as unknown as Record<string, string[]>;
const WINDOWS = examMap.practicalWindows as unknown as Array<{ subject: string; unit: string; series: string; from: string; to: string; note?: string }>;

/** The unit a code in the exam map belongs to: "U7-Biology-BkB" and "U7-BookletA" are Unit 7. */
const unitOf = (code: string) => code.split("-")[0];
const rowUnits = (r: Row) => r.unit.split("|");

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISO + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function titleCase(id: string): string {
  const words = id.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Every subject the timetable sets a sitting for: the named ones in the order the exam map names them, then the rest. */
function subjectIds(): string[] {
  const out = Object.keys(NAMES);
  for (const r of ROWS) if (!out.includes(r.subject)) out.push(r.subject);
  return out;
}

/** Every unit of a subject that has a sitting: the named ones in the order named, then the rest in timetable order. */
function unitIds(subject: string): string[] {
  const found: string[] = [];
  for (const r of ROWS) {
    if (r.subject !== subject) continue;
    for (const u of rowUnits(r)) if (!found.includes(u)) found.push(u);
    if (r.then && !found.includes(unitOf(r.then.unit))) found.push(unitOf(r.then.unit));
  }
  const named = Object.keys(NAMES[subject]?.units ?? {}).filter((u) => found.includes(u));
  return [...named, ...found.filter((u) => !named.includes(u))];
}

export function subjectTitle(subject: string): string {
  return NAMES[subject]?.title ?? titleCase(subject);
}

export function subjectShort(subject: string): string {
  return NAMES[subject]?.short ?? subjectTitle(subject);
}

/** What lists call a unit's paper. */
export function unitLabel(subject: string, unit: string): string {
  return NAMES[subject]?.units[unit]?.label ?? unit;
}

/** What the plan and the Map call a unit: "FM1 · Pure Mathematics". */
export function unitName(subject: string, unit: string): string {
  return NAMES[subject]?.units[unit]?.name ?? unit;
}

/** A tier the unit code fixes (M4 is Higher), else null. */
export function fixedTier(subject: string, unit: string): Tier | null {
  return NAMES[subject]?.units[unit]?.tier ?? null;
}

/** Whether the subject's units are entered at a tier she chooses (Double Award Science). */
export function tieredByEntry(subject: string): boolean {
  return NAMES[subject]?.tierByEntry === true;
}

/** The lines of the exam map that say how a subject is graded and entered. */
export function rulesFor(subject: string): string[] {
  return RULES[subject] ?? [];
}

export function seriesLabel(key: string): string {
  return examMap.series.find((s) => s.key === key)?.label ?? key;
}

export function seriesOptions(): Array<{ key: string; label: string }> {
  return examMap.series.map((s) => ({ key: s.key, label: s.label }));
}

/**
 * The series in which CCEA sets a sitting for this unit, in the exam map's order, each with its date (for a unit
 * that follows other papers, the first of them). A plan can only name one of these: a series with no sitting would
 * silently drop the unit from every list that reads the plan.
 */
export function seriesFor(subject: string, unit: string): Array<{ key: string; label: string; date: string }> {
  const dates = new Map<string, string>();
  for (const r of ROWS) {
    if (r.subject !== subject) continue;
    const ownUnit = rowUnits(r).includes(unit);
    const follows = r.then !== undefined && unitOf(r.then.unit) === unit;
    if (!ownUnit && !follows) continue;
    const had = dates.get(r.series);
    if (!had || r.date < had) dates.set(r.series, r.date);
  }
  return examMap.series.filter((s) => dates.has(s.key)).map((s) => ({ key: s.key, label: s.label, date: dates.get(s.key)! }));
}

export interface CatalogueUnit {
  subject: string;
  unit: string;
  label: string;
  name: string;
  tier: Tier | null;
  series: Array<{ key: string; label: string; date: string }>;
}

export interface CatalogueSubject {
  id: string;
  title: string;
  short: string;
  tieredByEntry: boolean;
  rules: string[];
  units: CatalogueUnit[];
}

/** Everything a plan can hold, from the exam map alone: every subject and unit CCEA sets a sitting for. */
export function catalogue(): CatalogueSubject[] {
  return subjectIds().map((id) => ({
    id,
    title: subjectTitle(id),
    short: subjectShort(id),
    tieredByEntry: tieredByEntry(id),
    rules: rulesFor(id),
    units: unitIds(id).map((unit) => ({ subject: id, unit, label: unitLabel(id, unit), name: unitName(id, unit), tier: fixedTier(id, unit), series: seriesFor(id, unit) })),
  }));
}

/** The in-class window of a unit's practical part (Unit 7 Booklet A) in a series, when the exam map has one. */
export function practicalWindow(subject: string, unit: string, series: string): { from: string; to: string; note: string | null } | null {
  const w = WINDOWS.find((p) => p.subject === subject && unitOf(p.unit) === unit && p.series === series);
  return w ? { from: w.from, to: w.to, note: w.note ?? null } : null;
}

// ---------------------------------------------------------------------------
// The plan
// ---------------------------------------------------------------------------

/**
 * The series first run pre-fills for B1, C1 and P1. Whether she sat them in Summer 2026 is hers to say (the owner
 * has been asked); if she did, this one value becomes "2026-Summer" and the three read "Sat on …" everywhere.
 */
export const DEFAULT_UNIT_1_SCIENCE_SERIES = "2027-Summer";

const entry = (subject: string, unit: string, series: string, tier: Tier | null = null): PlanEntry => ({ subject, unit, series, tier });

export const DEFAULT_PLAN: ExamPlan = {
  version: 2,
  learnerName: null,
  entries: [
    entry("maths", "M4", "2027-Summer"),
    entry("maths", "M8", "2027-Summer"),
    entry("further-maths", "FM1", "2027-Summer"),
    entry("further-maths", "FM2", "2027-Summer"),
    entry("further-maths", "FM3", "2027-Summer"),
    entry("science", "B1", DEFAULT_UNIT_1_SCIENCE_SERIES, "H"),
    entry("science", "C1", DEFAULT_UNIT_1_SCIENCE_SERIES, "H"),
    entry("science", "P1", DEFAULT_UNIT_1_SCIENCE_SERIES, "H"),
    entry("science", "B2", "2027-Summer", "H"),
    entry("science", "C2", "2027-Summer", "H"),
    entry("science", "P2", "2027-Summer", "H"),
    entry("science", "U7", "2027-Summer", "H"),
  ],
  sessionsPerWeek: 4,
};

/** The plan as it was stored until 23 September 2026: three subjects in fixed fields. */
export interface ExamPlanV1 {
  version: 1;
  learnerName: string | null;
  maths: { gateway: string; completion: string; gatewaySeries: string; completionSeries: string } | null;
  furtherMaths: { units: string[]; series: string } | null;
  science: { tier: Tier; unit1Series: string; unit2Series: string } | null;
  sessionsPerWeek: number;
}

/** The first-run default as it was stored before 23 September; a stored v1 plan was always this plus her edits. */
const DEFAULT_V1: ExamPlanV1 = {
  version: 1,
  learnerName: null,
  maths: { gateway: "M4", completion: "M8", gatewaySeries: "2027-Summer", completionSeries: "2027-Summer" },
  furtherMaths: { units: ["FM1", "FM2", "FM3"], series: "2027-Summer" },
  science: { tier: "H", unit1Series: "2027-Summer", unit2Series: "2027-Summer" },
  sessionsPerWeek: 4,
};

/**
 * A v1 plan as entries. The only place that still knows v1's shape. Unit 7 was never a field of v1 because it rode
 * with the science Unit 2 papers, so it is entered in the Unit 2 series at the science tier.
 */
function fromV1(v: ExamPlanV1): ExamPlan {
  const entries: PlanEntry[] = [];
  if (v.maths) {
    entries.push(entry("maths", v.maths.gateway, v.maths.gatewaySeries));
    entries.push(entry("maths", v.maths.completion, v.maths.completionSeries));
  }
  if (v.furtherMaths) for (const u of v.furtherMaths.units) entries.push(entry("further-maths", u, v.furtherMaths.series));
  if (v.science) {
    for (const u of ["B1", "C1", "P1"]) entries.push(entry("science", u, v.science.unit1Series, v.science.tier));
    for (const u of ["B2", "C2", "P2", "U7"]) entries.push(entry("science", u, v.science.unit2Series, v.science.tier));
  }
  return { version: 2, learnerName: v.learnerName ?? null, entries, sessionsPerWeek: v.sessionsPerWeek ?? 4 };
}

const isTier = (t: unknown): t is Tier => t === "F" || t === "H";

/**
 * Any stored plan, as a v2 plan: a v1 plan is converted, a v2 plan is cleaned (one entry per unit, the first kept),
 * anything else is the default. Pure, so it is safe inside a live query: nothing is written until she saves.
 */
export function migratePlan(value: unknown): ExamPlan {
  if (!value || typeof value !== "object") return DEFAULT_PLAN;
  const v = value as { version?: unknown; entries?: unknown; learnerName?: unknown; sessionsPerWeek?: unknown };
  if (v.version === 1) return fromV1({ ...DEFAULT_V1, ...(value as Partial<ExamPlanV1>) } as ExamPlanV1);
  if (v.version !== 2 || !Array.isArray(v.entries)) return DEFAULT_PLAN;
  const seen = new Set<string>();
  const entries: PlanEntry[] = [];
  for (const e of v.entries as Array<Partial<PlanEntry>>) {
    if (!e || typeof e.subject !== "string" || typeof e.unit !== "string" || typeof e.series !== "string") continue;
    const key = `${e.subject}:${e.unit}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ subject: e.subject, unit: e.unit, series: e.series, tier: isTier(e.tier) ? e.tier : null });
  }
  return {
    version: 2,
    learnerName: typeof v.learnerName === "string" ? v.learnerName : null,
    entries,
    sessionsPerWeek: typeof v.sessionsPerWeek === "number" ? v.sessionsPerWeek : 4,
  };
}

/** The tier an entry is sat at: the one chosen at entry, else the one the unit code fixes. */
export function entryTier(e: Pick<PlanEntry, "subject" | "unit" | "tier">): Tier | null {
  return e.tier ?? fixedTier(e.subject, e.unit);
}

function durationFor(row: Row, unit: string, tier: Tier | null): number | null {
  const d = row.durationMinutes;
  if (typeof d === "number") return d;
  if (d && typeof d === "object") return d[unit] ?? (tier ? (d[tier] ?? null) : null);
  if (row.papers && tier) return row.papers.reduce((s, p) => s + (p.durationMinutes[tier] ?? 0), 0);
  return null;
}

/** An entry's sitting, from the exam map: its own row, or the papers it follows (Unit 7 Booklet B). Null when none. */
function sittingOf(e: PlanEntry, today: string): PlanPaper | null {
  const tier = entryTier(e);
  const base = { subject: e.subject, unit: e.unit, label: unitLabel(e.subject, e.unit), series: e.series, tier };
  const own = ROWS.find((r) => r.subject === e.subject && r.series === e.series && rowUnits(r).includes(e.unit));
  if (own) {
    return {
      ...base,
      date: own.date,
      start: own.start ?? (own.session === "pm" ? "13:30" : "09:15"),
      durationMinutes: durationFor(own, e.unit, tier),
      daysAway: daysBetween(today, own.date),
      ...(own.papers && tier ? { parts: own.papers.map((p) => ({ paper: p.paper, start: p.start, durationMinutes: p.durationMinutes[tier] ?? null })) } : {}),
      ...(own.then ? { then: { unit: own.then.unit, start: own.then.start, durationMinutes: own.then.durationMinutes } } : {}),
    };
  }
  const after = ROWS.filter((r) => r.subject === e.subject && r.series === e.series && r.then !== undefined && unitOf(r.then.unit) === e.unit).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  if (after.length === 0) return null;
  const first = after[0];
  return {
    ...base,
    date: first.date,
    start: first.then!.start,
    durationMinutes: first.then!.durationMinutes,
    daysAway: daysBetween(today, first.date),
    booklets: after.map((r) => ({ date: r.date, start: r.then!.start, durationMinutes: r.then!.durationMinutes, after: r.unit })),
  };
}

/** Every paper of the plan, soonest first, relative to `today` (ISO date): past ones included, with daysAway < 0. */
export function planPapers(plan: ExamPlan, today: string): PlanPaper[] {
  const out: PlanPaper[] = [];
  for (const e of plan.entries) {
    const p = sittingOf(e, today);
    if (p) out.push(p);
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** The plan's papers in the subjects the typed layers know, soonest first. */
export function upcomingPapers(plan: ExamPlan, today: string): UpcomingPaper[] {
  return planPapers(plan, today).filter((p): p is UpcomingPaper => isTypedSubject(p.subject));
}

/** The next paper in a subject the typed layers know. */
export function nextPaper(plan: ExamPlan, today: string): UpcomingPaper | null {
  return upcomingPapers(plan, today).find((p) => p.daysAway >= 0) ?? null;
}

/** The next paper of the plan, whatever its subject. */
export function nextPlanPaper(plan: ExamPlan, today: string): PlanPaper | null {
  return planPapers(plan, today).find((p) => p.daysAway >= 0) ?? null;
}

/**
 * "for your paper on 18 May": a unit's own paper still to come, as a place on the calendar and never a countdown;
 * null when she is not entered for the unit or has sat it.
 */
export function paperPhrase(plan: ExamPlan, subject: string, unit: string, today: string): string | null {
  const paper = planPapers(plan, today).find((p) => p.subject === subject && p.unit === unit && p.daysAway >= 0);
  if (!paper) return null;
  const date = new Date(`${paper.date}T12:00:00`);
  return `for your paper on ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}

/** "Maths M4, M8 · Further Maths FM1, FM2, FM3 · Science B1, C1, P1, B2, C2, P2, U7 (Higher)", in catalogue order. */
export function planSummary(plan: ExamPlan | ExamPlanV1): string {
  const p = migratePlan(plan);
  const order = subjectIds();
  const subjects = [...new Set(p.entries.map((e) => e.subject))].sort((a, b) => rank(order, a) - rank(order, b));
  if (subjects.length === 0) return "No papers yet";
  return subjects
    .map((s) => {
      const es = p.entries.filter((e) => e.subject === s);
      const units = sortUnits(s, es.map((e) => e.unit)).join(", ");
      const tiers = [...new Set(es.map((e) => e.tier).filter(isTier))];
      return `${subjectShort(s)} ${units}${tiers.length === 1 ? ` (${tiers[0] === "H" ? "Higher" : "Foundation"})` : ""}`;
    })
    .join(" · ");
}

const rank = (order: readonly string[], x: string) => (order.includes(x) ? order.indexOf(x) : order.length);

/** Units in the exam map's own order for their subject. */
export function sortUnits(subject: string, units: readonly string[]): string[] {
  const order = unitIds(subject);
  return [...units].sort((a, b) => rank(order, a) - rank(order, b) || a.localeCompare(b));
}

// ---------------------------------------------------------------------------
// The units of her plan, in the order the surfaces show them
// ---------------------------------------------------------------------------

/**
 * Where an entry stands: this school year's papers first ("Year 12 first", as an ordering rule over whatever the plan
 * holds, not a list of units), then papers in a later year, then what has been sat, then an entry whose series has
 * no sitting for it (so it is never silently lost).
 */
export type PlanGroup = "this-year" | "later" | "sat" | "unscheduled";

export interface PlanUnit {
  entry: PlanEntry;
  subject: string;
  unit: string;
  /** "FM1 · Pure Mathematics". */
  name: string;
  /** Its sitting, or null when the series has none for it. */
  paper: PlanPaper | null;
  group: PlanGroup;
  /** The sitting's date, or "" when there is none. */
  date: string;
  daysAway: number;
}

/** The school year a date falls in, by the year it starts: 1 September to 31 August. */
export function schoolYearOf(iso: string): number {
  const [y, m] = iso.split("-").map(Number);
  return m >= 9 ? y : y - 1;
}

const GROUP_ORDER: PlanGroup[] = ["this-year", "later", "sat", "unscheduled"];

export function planUnits(plan: ExamPlan, today: string): PlanUnit[] {
  const year = schoolYearOf(today);
  const order = subjectIds();
  const out: PlanUnit[] = plan.entries.map((e) => {
    const paper = sittingOf(e, today);
    const group: PlanGroup = !paper ? "unscheduled" : paper.daysAway < 0 ? "sat" : schoolYearOf(paper.date) > year ? "later" : "this-year";
    return { entry: e, subject: e.subject, unit: e.unit, name: unitName(e.subject, e.unit), paper, group, date: paper?.date ?? "", daysAway: paper?.daysAway ?? Number.POSITIVE_INFINITY };
  });
  return out.sort(
    (a, b) =>
      GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) ||
      rank(order, a.subject) - rank(order, b.subject) ||
      (a.paper?.booklets ? 1 : 0) - (b.paper?.booklets ? 1 : 0) ||
      a.date.localeCompare(b.date) ||
      rank(unitIds(a.subject), a.unit) - rank(unitIds(b.subject), b.unit),
  );
}

// ---------------------------------------------------------------------------
// Wording
// ---------------------------------------------------------------------------

/** A length the way a timetable says it: "2 h", "1 h 15 min", "30 min". */
export function formatLength(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** "B2, C2 and P2". */
function listOf(items: readonly string[]): string {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * A paper as a line she can read: "Tue 18 May 2027, 09:15 · 2 h". A unit sat as two papers names both ("Thu 27 May
 * 2027 · Paper 1 at 09:15, Paper 2 at 10:45, 1 h 15 min each"); a unit sat after other papers says after which;
 * a paper whose date has passed says it was sat rather than counting towards it.
 */
export function entryWhen(p: Pick<PlanPaper, "date" | "start" | "durationMinutes" | "daysAway" | "parts" | "booklets">): string {
  const day = formatPaperDate(p.date);
  if (p.daysAway < 0) return `Sat on ${day}`;
  if (p.booklets && p.booklets.length > 0) {
    const b = p.booklets[0];
    const each = p.booklets.length > 1 ? " each" : "";
    return `After ${listOf(p.booklets.map((x) => x.after))}, from ${day} · ${b.start}, ${formatLength(b.durationMinutes)}${each}`;
  }
  if (p.parts && p.parts.length > 1) {
    const first = p.parts[0].durationMinutes;
    const each = first !== null && p.parts.every((x) => x.durationMinutes === first) ? `, ${formatLength(first)} each` : "";
    return `${day} · ${p.parts.map((x) => `Paper ${x.paper} at ${x.start}`).join(", ")}${each}`;
  }
  return `${day}${p.start ? `, ${p.start}` : ""}${p.durationMinutes ? ` · ${formatLength(p.durationMinutes)}` : ""}`;
}

export function formatPaperDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
