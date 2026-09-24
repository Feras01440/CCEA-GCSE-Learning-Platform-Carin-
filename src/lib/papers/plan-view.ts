/**
 * The plan view of /papers: her exam entries first, the catalogue second.
 *
 * Her entries (src/lib/plan/exam-plan.ts, dated from data/exams/exam-map.json) decide what
 * the page shows: one card per upcoming unit, soonest first, carrying only the papers of
 * that unit at the tier she sits, newest sitting first, plus the best and the latest saved
 * run of that unit. Units she is not entered for never appear here; they are in the full
 * catalogue below the plan.
 *
 * Pure: the page hands over the plan, today's date, the build-time paper index and the
 * saved runs, and gets back everything the cards render. No Dexie, no clock, no DOM.
 */
import type { Mock } from "@/lib/db/db";
import { entryWhen, planPapers, type ExamPlan, type PlanPaper } from "@/lib/plan/exam-plan";
import { compareSessionsDesc, tierWord, type PickerPaper, type Tier } from "./meta";

/** Shown on a card of a unit CCEA has never set a paper for at her tier. */
export const NO_PAPERS_NOTE = "No past papers for this unit in the CCEA archive yet.";

/** One saved timed run, reduced to what a plan card shows. */
export interface RunSummary {
  id: number | null;
  paperId: string;
  sessionKey: string;
  at: Date;
  raw: number;
  rawMax: number;
  ums: number;
  grade: string;
  estimated: boolean;
}

/** The papers of one sitting, e.g. Summer 2026 M8 Paper 1 and Paper 2. */
export interface PlanSitting {
  sessionKey: string;
  papers: PickerPaper[];
}

/** One entry of her plan, with the papers she can sit for it. */
export interface PlanCard {
  key: string;
  /** Any subject of her plan; one the archive does not cover has no papers and says so. */
  subject: string;
  unit: string;
  /** "M4", "Biology Unit 1", "Further Maths Unit 1 (Pure)" — the exam map's own label. */
  label: string;
  tier: Tier | null;
  /** Entry series, e.g. "2027-Summer". */
  series: string;
  /** Exam date, ISO. */
  date: string;
  start: string | null;
  daysAway: number;
  /** Minutes of the real sitting (both papers for M5–M8), or null when the map has none. */
  durationMinutes: number | null;
  /** The sitting in words, as the plan says it: both papers of M8, the three Booklet Bs of Unit 7. */
  when: string;
  sittings: PlanSitting[];
  papers: PickerPaper[];
  /** Papers of this unit left out because they are the other tier. */
  hiddenTierCount: number;
  /** Saved timed runs of this unit. */
  runCount: number;
  best: RunSummary | null;
  latest: RunSummary | null;
  /** One honest sentence when there is nothing to list, else null. */
  note: string | null;
}

export interface PlanView {
  /** Upcoming entries, soonest first: the next paper is `cards[0]`. */
  cards: PlanCard[];
  /** Papers the tier filter left out across the whole plan. */
  hiddenTierCount: number;
  /** Papers listed across the plan cards. */
  planPaperCount: number;
  /** Papers in the full catalogue (every subject, unit and tier). */
  cataloguePaperCount: number;
  /** Saved runs that belong to a unit in the plan. */
  runCount: number;
  /** Units of the plan with at least one saved run. */
  unitsWithRuns: number;
}

// ---------------------------------------------------------------------------
// Tier of an entry
// ---------------------------------------------------------------------------

/** A paper belongs on a card when neither side names a tier, or both name the same one. */
function tierMatches(entryTier: Tier | null, paperTier: Tier | null): boolean {
  return entryTier === null || paperTier === null || entryTier === paperTier;
}

function otherTier(tier: Tier): Tier {
  return tier === "H" ? "F" : "H";
}

// ---------------------------------------------------------------------------
// Ordering and grouping
// ---------------------------------------------------------------------------

/** Newest sitting first; inside a sitting, Paper 1 before Paper 2. */
function comparePlanPapers(a: PickerPaper, b: PickerPaper): number {
  return (
    compareSessionsDesc(a.sessionKey, b.sessionKey) ||
    (a.paperNumber ?? 0) - (b.paperNumber ?? 0) ||
    (a.booklet ?? "").localeCompare(b.booklet ?? "") ||
    a.id.localeCompare(b.id)
  );
}

function groupSittings(papers: readonly PickerPaper[]): PlanSitting[] {
  const out: PlanSitting[] = [];
  for (const p of papers) {
    const last = out[out.length - 1];
    if (last && last.sessionKey === p.sessionKey) last.papers.push(p);
    else out.push({ sessionKey: p.sessionKey, papers: [p] });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Saved runs
// ---------------------------------------------------------------------------

function toSummary(m: Mock): RunSummary {
  return {
    id: m.id ?? null,
    paperId: m.paperId,
    sessionKey: m.sessionKey,
    at: new Date(m.at),
    raw: m.raw,
    rawMax: m.rawMax,
    ums: m.ums,
    grade: m.grade,
    estimated: m.estimated,
  };
}

/** Highest UMS; the newer run wins a tie. */
function bestRun(runs: readonly RunSummary[]): RunSummary | null {
  return runs.reduce<RunSummary | null>(
    (best, r) => (!best || r.ums > best.ums || (r.ums === best.ums && +r.at > +best.at) ? r : best),
    null,
  );
}

/** Newest run; the higher UMS wins a tie. */
function latestRun(runs: readonly RunSummary[]): RunSummary | null {
  return runs.reduce<RunSummary | null>(
    (latest, r) => (!latest || +r.at > +latest.at || (+r.at === +latest.at && r.ums > latest.ums) ? r : latest),
    null,
  );
}

/** True when two summaries are the same saved run. */
export function sameRun(a: RunSummary | null, b: RunSummary | null): boolean {
  if (!a || !b) return false;
  if (a.id !== null && b.id !== null) return a.id === b.id;
  return a.paperId === b.paperId && +a.at === +b.at;
}

// ---------------------------------------------------------------------------
// The view
// ---------------------------------------------------------------------------

function buildCard(
  entry: PlanPaper,
  tier: Tier | null,
  pool: readonly PickerPaper[],
  mocks: readonly Mock[],
): PlanCard {
  const ofUnit = pool.filter((p) => p.unit === entry.unit);
  const mine = ofUnit.filter((p) => tierMatches(tier, p.tier)).sort(comparePlanPapers);
  const hiddenTierCount = ofUnit.length - mine.length;

  const runs = mocks
    .filter((m) => m.subject === entry.subject && m.unit === entry.unit && tierMatches(tier, m.tier))
    .map(toSummary);

  const note =
    mine.length > 0
      ? null
      : hiddenTierCount > 0 && tier
        ? `No ${tierWord(tier)} papers for this unit in the archive; the ${tierWord(otherTier(tier))} ones are in the full catalogue below.`
        : NO_PAPERS_NOTE;

  return {
    key: `${entry.subject}:${entry.unit}:${entry.series}`,
    subject: entry.subject,
    unit: entry.unit,
    label: entry.label,
    tier,
    series: entry.series,
    date: entry.date,
    start: entry.start,
    daysAway: entry.daysAway,
    durationMinutes: entry.durationMinutes,
    when: entryWhen(entry),
    sittings: groupSittings(mine),
    papers: mine,
    hiddenTierCount,
    runCount: runs.length,
    best: bestRun(runs),
    latest: latestRun(runs),
    note,
  };
}

/**
 * Her plan as cards. `papers` is the build-time index per subject (what the catalogue
 * shows); `mocks` is every saved run on the device.
 */
export function buildPlanView({
  plan,
  today,
  papers,
  mocks,
}: {
  plan: ExamPlan;
  today: string;
  papers: Readonly<Partial<Record<string, readonly PickerPaper[]>>>;
  mocks: readonly Mock[];
}): PlanView {
  // Every paper of her plan still to come, whatever its subject: the tier is the entry's (or the one its unit code
  // fixes), and a subject the archive does not cover gets a card with its date and an honest note.
  const cards = planPapers(plan, today)
    .filter((e) => e.daysAway >= 0)
    .map((e) => buildCard(e, e.tier, papers[e.subject] ?? [], mocks));

  return {
    cards,
    hiddenTierCount: cards.reduce((n, c) => n + c.hiddenTierCount, 0),
    planPaperCount: cards.reduce((n, c) => n + c.papers.length, 0),
    cataloguePaperCount: Object.values(papers).reduce((n, list) => n + (list?.length ?? 0), 0),
    runCount: cards.reduce((n, c) => n + c.runCount, 0),
    unitsWithRuns: cards.reduce((n, c) => n + (c.runCount > 0 ? 1 : 0), 0),
  };
}

// ---------------------------------------------------------------------------
// Wording
// ---------------------------------------------------------------------------

/** "today", "tomorrow", "in 234 days" — the days remaining, said plainly. */
export function daysAwayWord(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

/** "78 of 100 raw → 166 UMS → grade a", with "(estimated)" where the engine says so. */
export function umsLine(run: Pick<RunSummary, "raw" | "rawMax" | "ums" | "grade" | "estimated">): string {
  return `${run.raw} of ${run.rawMax} raw → ${run.ums} UMS → grade ${run.grade}${run.estimated ? " (estimated)" : ""}`;
}
