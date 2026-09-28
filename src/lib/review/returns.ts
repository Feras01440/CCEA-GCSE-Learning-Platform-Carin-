/**
 * When a review card comes back for each grade, printed under Again, Good and Easy in the review inbox, and the moment the
 * tap records it with (the independent review of 27 Sep 2026, item 3).
 *
 * The inbox printed its returns with the default scheduler (retention 0.90, intervals up to 120 days) while the tap stored
 * them with the unit's exam mode (src/lib/session/record.ts: retention 0.93 to 0.95 in the last six weeks, and no interval
 * past the day before the paper), and at the moment of the tap rather than the moment the dates were printed. Near a
 * paper the buttons promised weeks the card would never wait. Here the dates come from the same exam mode, from the
 * card's own state, at one moment `now` that the inbox also hands to the tap: ts-fsrs seeds its fuzz from the review
 * time, the repetitions and the memory state, so the day stored is the day printed (the Slides recall cards' rule,
 * src/lib/slides/returns.ts).
 */
import type { ReviewCard } from "@/lib/db/db";
import { todayISO, type ExamPlan } from "@/lib/plan/exam-plan";
import { examModeFor } from "@/lib/srs/exam-mode";
import { makeScheduler, review, type ReviewGrade } from "@/lib/srs/scheduler";

export type ReturnGrade = Extract<ReviewGrade, "again" | "good" | "easy">;

/** The card's next due date for each grade, in its unit's exam mode, graded at `now`. */
export function inboxReturns(card: ReviewCard, plan: ExamPlan, subject: ReviewCard["subject"], unit: string, now: Date): Record<ReturnGrade, Date> {
  const mode = examModeFor(plan, subject, unit, todayISO(now), now);
  const scheduler = makeScheduler(mode.desiredRetention, mode.maximumIntervalDays);
  const due = (g: ReturnGrade) => review(card.card, g, now, scheduler).card.due;
  return { again: due("again"), good: due("good"), easy: due("easy") };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * How long until a return, briefly, in words that read right under a button and after "back in": "10 min", "5 h",
 * "1 day", "4 days", "3 wk", "3 mo". The old labels printed "today", which read "back in today" once graded.
 */
export function returnLabel(due: Date, now: Date): string {
  const ms = Math.max(0, due.getTime() - now.getTime());
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))} min`;
  if (ms < DAY) return `${Math.max(1, Math.round(ms / HOUR))} h`;
  const days = Math.round(ms / DAY);
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  if (days < 60) return `${Math.round(days / 7)} wk`;
  return `${Math.round(days / 30)} mo`;
}
