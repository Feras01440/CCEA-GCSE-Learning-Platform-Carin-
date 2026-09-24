/**
 * One-off backfill of review cards for answers recorded before every item kind earned one (19 September 2026).
 *
 * Until then only prompts, diagnostics and flashcards created a card, so a question, a gate or a
 * find-the-mistake item she missed in her first days never came back. This creates the missing card for each
 * distinct card id, as if on the day of her latest answer to it, graded from that answer, so what she missed
 * then is due now. It runs once per device from the database's ready hook, records that it ran in settings,
 * and never throws: a study screen must not fail on a migration.
 */
import type { Attempt, ReviewCard, StudyDB } from "./db";
import { makeScheduler, newCard, review, type ReviewGrade } from "@/lib/srs/scheduler";
import { cardIdFor, gradeFromMarks } from "@/lib/session/card-id";

export const BACKFILL_FLAG = "cardsBackfilled";

/** The grade an attempt row implies, or null when nothing about it was marked. */
export function gradeOfAttempt(a: Pick<Attempt, "correct" | "marksAwarded" | "marksAvailable">): ReviewGrade | null {
  if (a.marksAvailable != null && a.marksAvailable > 0 && a.marksAwarded != null) return gradeFromMarks(a.marksAwarded, a.marksAvailable);
  if (a.correct === true) return "good";
  if (a.correct === false) return "again";
  return null;
}

/** Creates the cards, returns how many; 0 when it already ran, when there is nothing to do, or on any failure. */
export async function backfillCards(db: StudyDB): Promise<number> {
  try {
    const done = await db.settings.get(BACKFILL_FLAG);
    if (done?.value === true) return 0;
    const attempts = await db.attempts.orderBy("at").toArray();
    // Ordered by time, so the last write for an id is her latest answer to it.
    const latest = new Map<string, Attempt>();
    for (const a of attempts) latest.set(cardIdFor(a.itemId), a);
    const existing = new Set((await db.cards.toArray()).map((c) => c.id));
    const scheduler = makeScheduler();
    const rows: ReviewCard[] = [];
    for (const [id, a] of latest) {
      if (existing.has(id)) continue;
      const grade = gradeOfAttempt(a);
      if (!grade) continue;
      const { card } = review(newCard(a.at), grade, a.at, scheduler);
      rows.push({ id, subject: a.subject, topicSlug: a.topicSlug, card, due: card.due, createdAt: a.at });
    }
    if (rows.length > 0) await db.cards.bulkAdd(rows);
    await db.settings.put({ key: BACKFILL_FLAG, value: true });
    return rows.length;
  } catch {
    return 0;
  }
}
