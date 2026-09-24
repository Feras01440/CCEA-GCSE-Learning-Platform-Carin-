"use client";

/**
 * When a recall card comes back for each grade, printed under Again, Good and Easy before the tap (benchmarks page 15,
 * Anki's rule), and the tap that stores exactly that (audit CQ-02, LD-07).
 *
 * The three dates are computed once, at the moment she shows the answer, with the product's own scheduler in the unit's
 * exam mode, from the card's real state when it already has one and from a new card otherwise. The tap then records the
 * grade with that same moment: the scheduler is deterministic for a given card, time and grade (ts-fsrs seeds its fuzz
 * from the review time, the repetitions and the memory state), so the day stored is the day printed, to the second. A
 * first grade creates the card with the grade she chose (Easy is Easy, not Good); a later grade moves the existing card
 * on, as the review inbox does. Nothing here guesses: if the scheduler cannot be read, the caller shows no date.
 */
import { getDB } from "@/lib/db/db";
import { loadPlan } from "@/lib/plan/store";
import { todayISO } from "@/lib/plan/exam-plan";
import { examModeFor } from "@/lib/srs/exam-mode";
import { makeScheduler, newCard, review, type ReviewGrade } from "@/lib/srs/scheduler";
import { ensureCard, refreshMastery, reviewInboxCard, type ItemRef } from "@/lib/session/record";

export type RecallGrade = "again" | "good" | "easy";

export async function gradeReturnDates(subject: "maths" | "further-maths" | "science", unit: string, promptId: string, now = new Date()): Promise<Record<RecallGrade, Date>> {
  const plan = await loadPlan();
  const mode = examModeFor(plan, subject, unit, todayISO(now), now);
  const scheduler = makeScheduler(mode.desiredRetention, mode.maximumIntervalDays);
  let base = newCard(now);
  try {
    const row = await getDB().cards.get(promptId);
    if (row) base = row.card;
  } catch {
    // No stored card: the dates are a new card's.
  }
  const due = (grade: ReviewGrade) => review(base, grade, now, scheduler).card.due;
  return { again: due("again"), good: due("good"), easy: due("easy") };
}

/**
 * Records a recall card's grade at `now`, the moment its three dates were computed and printed. A prompt she has never
 * graded gets its card here, scheduled by the grade she chose, and one attempt row; a prompt that already has a card
 * (graded in Read, in an earlier run, in the review inbox) is reviewed with that grade, with one attempt row, exactly as
 * the review inbox reviews it. The item kind is "prompt", as Read records it, so progress is one record.
 */
export async function recordRecallGrade(item: ItemRef, grade: RecallGrade, now: Date): Promise<void> {
  const db = getDB();
  if (await db.cards.get(item.id)) {
    await reviewInboxCard(item.id, grade, item, "prompt", now);
    return;
  }
  await ensureCard(item, grade, now);
  await db.attempts.add({
    at: now,
    subject: item.subject,
    topicSlug: item.topicSlug,
    itemId: item.id,
    itemKind: "prompt",
    correct: grade !== "again",
    marksAwarded: null,
    marksAvailable: null,
    confidence: null,
    rating: grade === "again" ? 1 : grade === "good" ? 3 : 4,
    misconceptionTags: [],
    timeMs: null,
    answerRaw: null,
  });
  await refreshMastery(item.subject, item.unit, item.topicSlug, now);
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/**
 * The return, said briefly and exactly enough to tell the three buttons apart: "in a minute", "in 10 minutes", "later
 * today", "tomorrow", "Thursday" (within six days, so a weekday name never means the same day next week), "in a week",
 * "in 3 weeks", "on 14 October". A new card's first steps are minutes apart (Again a minute, Good ten), and saying
 * "later today" for both hid the one difference the choice makes.
 */
export function returnWord(due: Date, now = new Date()): string {
  const ms = due.getTime() - now.getTime();
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return minutes <= 1 ? "in a minute" : `in ${minutes} minutes`;
  const days = Math.round((startOfDay(due) - startOfDay(now)) / 86_400_000);
  if (days <= 0) return "later today";
  if (days === 1) return "tomorrow";
  if (days <= 6) return WEEKDAYS[due.getDay()];
  if (days < 60) {
    const weeks = Math.max(1, Math.round(days / 7));
    return weeks === 1 ? "in a week" : `in ${weeks} weeks`;
  }
  return `on ${due.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}
