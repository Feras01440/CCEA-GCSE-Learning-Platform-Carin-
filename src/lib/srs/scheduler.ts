import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from "ts-fsrs";

export type ReviewGrade = "again" | "hard" | "good" | "easy";

const gradeMap: Record<ReviewGrade, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

/**
 * FSRS-6 scheduler. desiredRetention defaults to 0.90 (evidence: workload explodes above ~0.97);
 * raise toward 0.93-0.95 in the final six weeks before a paper.
 */
export function makeScheduler(desiredRetention = 0.9, maximumIntervalDays = 120) {
  const params = generatorParameters({
    request_retention: desiredRetention,
    maximum_interval: maximumIntervalDays,
    enable_fuzz: true,
  });
  return fsrs(params);
}

export function newCard(now = new Date()): Card {
  return createEmptyCard(now);
}

export function review(card: Card, grade: ReviewGrade, now = new Date(), scheduler = makeScheduler()) {
  const { card: next, log } = scheduler.next(card, now, gradeMap[grade]);
  return { card: next, log };
}

/** Probability the item is still remembered right now (0..1). */
export function retrievability(card: Card, now = new Date(), scheduler = makeScheduler()): number {
  if (card.state === State.New) return 0;
  const r = scheduler.get_retrievability(card, now, false);
  return typeof r === "number" ? r : Number.parseFloat(String(r)) / 100;
}

/**
 * Exam-date mode: cap the interval so the last review lands before the paper,
 * and tighten retention as the paper approaches.
 */
export function retentionForExam(examDate: Date, now = new Date()): number {
  const days = (examDate.getTime() - now.getTime()) / 86_400_000;
  if (days <= 14) return 0.95;
  if (days <= 42) return 0.93;
  return 0.9;
}
