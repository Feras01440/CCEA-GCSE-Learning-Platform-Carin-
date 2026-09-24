"use client";

/**
 * The one place the companion touches the database at render time.
 *
 * context.ts stays pure so it can be tested and so the identity test can hold the clock still; this
 * file does the reading and hands the pure builder its rows. Everything is wrapped so that a missing
 * database (server render, private mode, a failed upgrade) produces silence rather than an error.
 *
 * Rule for the querier: reads only. Dexie forbids a write inside a liveQuery (it throws ReadOnlyError,
 * "Readwrite transaction in liveQuery context"), and the catch below would turn that into permanent
 * silence. So the state row is read here without seeding; the seed happens in an effect, outside the
 * query, the first time the hook sees that no row exists, which anchors plain mode's fortnight to the
 * first real open rather than to the first write.
 *
 * Three facts are prepared here so the lines that use them are true:
 * - tonight's cards are put in the review inbox's own order (pickQueue, weighted by how near each unit's
 *   paper is, exactly as src/lib/review/resolve.ts does), so "starting with" names what comes first;
 * - every card's topic is named by its catalogue title, not by its slug;
 * - a filed mock carries its unit's topic slugs, so "due back from that unit" counts that unit only.
 */

import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB, type ReviewCard } from "@/lib/db/db";
import { topicsFor, unitsFor, type Subject } from "@/lib/content/taxonomy";
import { DEFAULT_PLAN, upcomingPapers, type ExamPlan } from "@/lib/plan/exam-plan";
import { loadPlan } from "@/lib/plan/store";
import { pickQueue } from "@/lib/srs/queue";
import { buildCompanionContext, type CompanionContext, type CompanionInput, type MockContextInput } from "./context";
import { COMPANION_STATE_ID, freshState, getCompanionState, noteLineShown, presenceOf, todayISOFrom, type CompanionPresence, type CompanionState } from "./memory";

const DAY = 86_400_000;

export type CompanionRows = Awaited<ReturnType<typeof readCompanionRows>>;

/** The state row as stored, merged over the defaults, or the defaults when no row exists yet. Never writes. */
export async function readCompanionState(now: Date): Promise<{ state: CompanionState; stored: boolean }> {
  const row = await getDB().companionState.get(COMPANION_STATE_ID);
  return row ? { state: { ...freshState(now), ...row, id: COMPANION_STATE_ID }, stored: true } : { state: freshState(now), stored: false };
}

const topicIndex = new Map<string, { unit: string; title: string } | null>();

/** A topic's unit and catalogue title, from the taxonomy; null for a slug the catalogue does not know. */
export function topicEntry(subject: Subject, slug: string): { unit: string; title: string } | null {
  const key = `${subject}:${slug}`;
  if (topicIndex.has(key)) return topicIndex.get(key)!;
  let found: { unit: string; title: string } | null = null;
  for (const u of unitsFor(subject)) {
    const t = topicsFor(subject, u.code).find((x) => x.slug === slug);
    if (t) {
      found = { unit: u.code, title: t.title };
      break;
    }
  }
  topicIndex.set(key, found);
  return found;
}

/**
 * Tonight's cards with the one the review inbox will show first at the front. The inbox (useInboxQueue)
 * ranks by pickQueue with each topic weighted by how near its unit's paper is; this asks the same function
 * the same question. Every card is kept: the count is the whole of tonight, as the Today tile shows it.
 */
export function inInboxOrder(due: ReviewCard[], plan: ExamPlan, now: Date): ReviewCard[] {
  if (due.length < 2) return due;
  const daysToPaper: Record<string, number> = {};
  for (const p of upcomingPapers(plan, todayISOFrom(now))) daysToPaper[`${p.subject}:${p.unit}`] = p.daysAway;
  const byTopic: Record<string, number | null> = {};
  for (const c of due) {
    const entry = topicEntry(c.subject, c.topicSlug);
    byTopic[`${c.subject}:${c.topicSlug}`] = entry ? (daysToPaper[`${c.subject}:${entry.unit}`] ?? null) : null;
  }
  const first = pickQueue(due, now, { cap: 1, daysToPaper: byTopic })[0];
  return first ? [first, ...due.filter((c) => c !== first)] : due;
}

/** Catalogue titles for every topic a card belongs to, so "what returns" is said in the topics' own names. */
export function titlesForCards(cards: ReviewCard[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const c of cards) {
    if (out[c.topicSlug]) continue;
    const entry = topicEntry(c.subject, c.topicSlug);
    if (entry) out[c.topicSlug] = entry.title;
  }
  return out;
}

/** A filed mock with its unit's topic slugs, so what comes back can be counted for that unit alone. */
export function withUnitTopics(mock: MockContextInput): MockContextInput {
  if (mock.topicSlugs) return mock;
  return { ...mock, topicSlugs: topicsFor(mock.subject, mock.unit).map((t) => t.slug) };
}

/**
 * Everything the context builder needs, read in one pass. Safe to call inside a liveQuery: every call
 * here is a read (loadPlan reads the settings row and never writes).
 */
export async function readCompanionRows(now: Date) {
  const db = getDB();
  const [plan, stateRead, mastery, attempts, cards, sessions, notes, firstRun] = await Promise.all([
    loadPlan(),
    readCompanionState(now),
    db.mastery.toArray(),
    db.attempts.where("at").aboveOrEqual(new Date(now.getTime() - 28 * DAY)).toArray(),
    db.cards.toArray(),
    db.sessions.orderBy("startedAt").reverse().limit(20).toArray(),
    db.companionNotes.orderBy("at").reverse().limit(50).toArray(),
    db.settings.get("firstRunDone"),
  ]);
  const due = cards.filter((c) => c.due.getTime() <= now.getTime());
  return {
    plan: plan as ExamPlan,
    state: stateRead.state,
    stateStored: stateRead.stored,
    mastery,
    attempts,
    dueCards: inInboxOrder(due, plan as ExamPlan, now),
    futureCards: cards.filter((c) => c.due.getTime() > now.getTime()),
    topicTitles: titlesForCards(cards),
    sessions,
    notes,
    firstRunDone: firstRun?.value === true,
  };
}

/**
 * The live context, or `undefined` while it loads. Every component treats `undefined` as silence,
 * so nothing ever flashes in and out on first paint.
 */
export function useCompanionContext(overrides: Partial<CompanionInput> = {}): CompanionContext | undefined {
  const now = overrides.now ?? new Date();
  const rows = useLiveQuery(async (): Promise<CompanionRows | null> => {
    try {
      return await readCompanionRows(now);
    } catch {
      return null;
    }
    // The clock is deliberately not a dependency: a re-render refreshes it, a tick does not requery.
  }, []);

  // Seed the state row once, outside the query, so plain mode's fortnight starts on the first real open.
  const needsSeed = rows !== undefined && rows !== null && !rows.stateStored;
  useEffect(() => {
    if (!needsSeed) return;
    getCompanionState(now).catch(() => {
      // A failed seed only delays the fortnight's start to the first real write.
    });
    // `now` is intentionally not a dependency: seeding once is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSeed]);

  if (rows === undefined) return undefined;
  const base: CompanionInput = rows
    ? {
        now,
        plan: rows.plan,
        state: rows.state,
        mastery: rows.mastery,
        attempts: rows.attempts,
        dueCards: rows.dueCards,
        futureCards: rows.futureCards,
        topicTitles: rows.topicTitles,
        sessions: rows.sessions,
        notes: rows.notes,
        firstRunDone: rows.firstRunDone,
      }
    : { now, plan: DEFAULT_PLAN, state: { ...freshState(now), silenced: true } };
  const input: CompanionInput = { ...base, ...overrides, now };
  if (overrides.topicTitles) input.topicTitles = { ...(base.topicTitles ?? {}), ...overrides.topicTitles };
  if (input.mock) input.mock = withUnitTopics(input.mock);
  return buildCompanionContext(input);
}

/**
 * What she sees of it (Full, Words only, Quiet), read live from the state row alone, or `undefined` while it loads.
 * For a surface that draws Rowan's mark and reads no line, such as the Map's place: it needs nothing else of the
 * context, and never writes. A missing database reads as Quiet, so nothing is drawn on a device that cannot say why.
 */
export function useCompanionPresence(): CompanionPresence | undefined {
  return useLiveQuery(async (): Promise<CompanionPresence> => {
    try {
      return presenceOf((await readCompanionState(new Date())).state);
    } catch {
      return "quiet";
    }
  }, []);
}

/** Records that a line was said, so it is not said again inside the cooldown. Never throws. */
export async function rememberLineShown(lineId: string, now = new Date()): Promise<void> {
  try {
    await noteLineShown(lineId, now);
  } catch {
    // Nothing to do: a line said twice is a smaller harm than a crash on a study screen.
  }
}
