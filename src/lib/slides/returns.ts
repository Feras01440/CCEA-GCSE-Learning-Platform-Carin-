"use client";

/**
 * When a recall card comes back for each grade, so the three buttons say it before the tap (benchmarks page 15, Anki's
 * rule). Computed with the product's own scheduler in the unit's exam mode, from the card's real state when it already
 * has one and from a new card otherwise. Never a guess: if the scheduler cannot be read, the caller shows no date.
 */
import { getDB } from "@/lib/db/db";
import { loadPlan } from "@/lib/plan/store";
import { todayISO } from "@/lib/plan/exam-plan";
import { examModeFor } from "@/lib/srs/exam-mode";
import { makeScheduler, newCard, review, type ReviewGrade } from "@/lib/srs/scheduler";
import { dayNameWithin } from "@/lib/companion";

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

/** "later today", "tomorrow", "Thursday", "in 3 weeks", "on 14 October": the day a card returns, said briefly. */
export function returnWord(due: Date, now = new Date()): string {
  const within = dayNameWithin(due, now);
  if (within) return within;
  const days = Math.round((due.getTime() - now.getTime()) / 86_400_000);
  if (days < 21) return `in ${Math.max(1, Math.round(days / 7))} ${Math.round(days / 7) <= 1 ? "week" : "weeks"}`;
  if (days < 60) return `in ${Math.round(days / 7)} weeks`;
  return `on ${due.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}
