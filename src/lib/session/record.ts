"use client";

import type { Attempt, ReviewCard, TopicMastery } from "@/lib/db/db";
import { getDB } from "@/lib/db/db";
import { computeMastery } from "@/lib/mastery/engine";
import { makeScheduler, newCard, retrievability, review, type ReviewGrade } from "@/lib/srs/scheduler";
import { examModeFor } from "@/lib/srs/exam-mode";
import { hypercorrectionCards, isConfidentWrong, isHypercorrectionCard, sourceItemId } from "@/lib/srs/hypercorrection";
import { loadPlan } from "@/lib/plan/store";
import { todayISO } from "@/lib/plan/exam-plan";

type Subject = Attempt["subject"];
const DAY = 86_400_000;

/** Unit code a topic slug belongs to, needed for exam-date scheduling. Callers pass it; we never guess. */
export interface ItemRef {
  id: string;
  subject: Subject;
  unit: string;
  topicSlug: string;
}

export interface AttemptInput {
  item: ItemRef;
  itemKind: Attempt["itemKind"];
  correct: boolean | null;
  marksAwarded?: number | null;
  marksAvailable?: number | null;
  confidence?: 1 | 2 | 3 | null;
  misconceptionTags?: string[];
  timeMs?: number | null;
  answerRaw?: string | null;
  /** The working she typed under the answer, kept beside it so a mark from the ladder can be read back. */
  workingRaw?: string | null;
}

export { cardIdFor, gradeFromMarks } from "./card-id";
import { cardIdFor, gradeFromMarks } from "./card-id";

/**
 * The grade a first answer gives the new card: right is "good", part of the marks "hard",
 * nothing "again". `null` when the answer was never marked, and then no card is made — there
 * is no evidence to schedule from.
 */
function firstGradeFor(input: AttemptInput): ReviewGrade | null {
  if (input.correct === null) return null;
  if (input.correct) return "good";
  const awarded = input.marksAwarded ?? 0;
  const available = input.marksAvailable ?? 0;
  return awarded > 0 && awarded < available ? "hard" : "again";
}

/**
 * Records one answer. Side effects, in order:
 * 1. the attempt row (kept forever, feeds the ledger and mastery);
 * 2. a confident-wrong answer schedules hypercorrection re-probes at +2 and +7 days;
 * 3. every marked item gets a review card on first exposure (so the inbox owns it from then on);
 * 4. the topic's mastery state is recomputed from all its attempts.
 */
export async function recordAttempt(input: AttemptInput, now = new Date()): Promise<TopicMastery> {
  const db = getDB();
  const attempt: Attempt = {
    at: now,
    subject: input.item.subject,
    topicSlug: input.item.topicSlug,
    itemId: input.item.id,
    itemKind: input.itemKind,
    correct: input.correct,
    marksAwarded: input.marksAwarded ?? null,
    marksAvailable: input.marksAvailable ?? null,
    confidence: input.confidence ?? null,
    rating: null,
    misconceptionTags: input.misconceptionTags ?? [],
    timeMs: input.timeMs ?? null,
    answerRaw: input.answerRaw ?? null,
    workingRaw: input.workingRaw ?? null,
  };
  await db.attempts.add(attempt);

  const cardId = cardIdFor(input.item.id);
  if (isConfidentWrong(input.correct, input.confidence ?? null)) {
    const hc = hypercorrectionCards({ id: cardId, subject: input.item.subject, topicSlug: input.item.topicSlug }, now);
    await db.cards.bulkPut(hc);
  }

  const grade = firstGradeFor(input);
  if (grade) {
    await ensureCard({ ...input.item, id: cardId }, grade, now);
  }

  return refreshMastery(input.item.subject, input.item.unit, input.item.topicSlug, now);
}

/** Creates the card on first exposure with one FSRS review applied, or leaves an existing card alone. */
export async function ensureCard(item: ItemRef, firstGrade: ReviewGrade, now = new Date()): Promise<ReviewCard> {
  const db = getDB();
  const existing = await db.cards.get(item.id);
  if (existing) return existing;
  const mode = await modeFor(item.subject, item.unit, now);
  const scheduler = makeScheduler(mode.desiredRetention, mode.maximumIntervalDays);
  const { card } = review(newCard(now), firstGrade, now, scheduler);
  const row: ReviewCard = { id: item.id, subject: item.subject, topicSlug: item.topicSlug, card, due: card.due, createdAt: now };
  await db.cards.put(row);
  return row;
}

/**
 * Moves a card on from the evidence of an answer that has already been recorded where it was
 * given (a question part, a note gate, a find-the-mistake item and a twin each record their own
 * attempt, marks and misconception tags). No second attempt row: the ledger must not count one
 * answer twice. Hypercorrection cards are consumed after one pass, as in the inbox.
 */
export async function advanceCard(cardId: string, grade: ReviewGrade, item: Omit<ItemRef, "id">, now = new Date()): Promise<void> {
  const db = getDB();
  const row = await db.cards.get(cardId);
  if (!row) return;
  if (isHypercorrectionCard(cardId)) {
    await db.cards.delete(cardId);
  } else {
    const mode = await modeFor(item.subject, item.unit, now);
    const scheduler = makeScheduler(mode.desiredRetention, mode.maximumIntervalDays);
    const { card } = review(row.card, grade, now, scheduler);
    await db.cards.put({ ...row, card, due: card.due });
  }
  await refreshMastery(item.subject, item.unit, item.topicSlug, now);
}

/**
 * Grades a review-inbox card and records the attempt, for the kinds the inbox marks itself
 * (a prompt she grades, a diagnostic, a flashcard). `itemKind` is the kind the item really is,
 * so the ledger does not read every review as a prompt. Hypercorrection cards are consumed
 * after one pass.
 */
export async function reviewInboxCard(
  cardId: string,
  grade: ReviewGrade,
  item: Omit<ItemRef, "id">,
  itemKind: Attempt["itemKind"] = "prompt",
  now = new Date(),
): Promise<void> {
  const db = getDB();
  if (!(await db.cards.get(cardId))) return;
  await db.attempts.add({
    at: now,
    subject: item.subject,
    topicSlug: item.topicSlug,
    itemId: sourceItemId(cardId),
    itemKind,
    correct: grade !== "again",
    marksAwarded: null,
    marksAvailable: null,
    confidence: null,
    rating: grade === "again" ? 1 : grade === "hard" ? 2 : grade === "good" ? 3 : 4,
    misconceptionTags: [],
    timeMs: null,
    answerRaw: null,
  });
  await advanceCard(cardId, grade, item, now);
}

/**
 * Grades a flashcard. First sighting creates its FSRS card; later gradings schedule it like any review item,
 * so flashcards she struggles with reappear in the review inbox on the same schedule as everything else.
 */
export async function gradeFlashcard(item: ItemRef, grade: ReviewGrade, now = new Date()): Promise<void> {
  const db = getDB();
  const existing = await db.cards.get(item.id);
  if (existing) {
    await reviewInboxCard(item.id, grade, item, "recall", now);
    return;
  }
  await ensureCard(item, grade, now);
  await db.attempts.add({
    at: now,
    subject: item.subject,
    topicSlug: item.topicSlug,
    itemId: item.id,
    itemKind: "recall",
    correct: grade !== "again",
    marksAwarded: null,
    marksAvailable: null,
    confidence: null,
    rating: grade === "again" ? 1 : grade === "hard" ? 2 : grade === "good" ? 3 : 4,
    misconceptionTags: [],
    timeMs: null,
    answerRaw: null,
  });
  await refreshMastery(item.subject, item.unit, item.topicSlug, now);
}

async function modeFor(subject: Subject, unit: string, now: Date) {
  const plan = await loadPlan();
  return examModeFor(plan, subject, unit, todayISO(now), now);
}

/** Recomputes mastery for a topic from its attempts and the predicted recall of its cards. */
export async function refreshMastery(subject: Subject, unit: string, topicSlug: string, now = new Date()): Promise<TopicMastery> {
  const db = getDB();
  const attempts = await db.attempts.where("topicSlug").equals(topicSlug).and((a) => a.subject === subject).toArray();
  const cards = await db.cards.where("topicSlug").equals(topicSlug).and((c) => c.subject === subject && !isHypercorrectionCard(c.id)).toArray();
  const mode = await modeFor(subject, unit, now);
  const scheduler = makeScheduler(mode.desiredRetention, mode.maximumIntervalDays);
  const in7 = new Date(now.getTime() + 7 * DAY);
  const onPaper = mode.paperDate ? new Date(mode.paperDate + "T09:00:00") : null;
  const avg = (at: Date) => (cards.length ? cards.reduce((s, c) => s + retrievability(c.card, at, scheduler), 0) / cards.length : null);
  const m = computeMastery({
    subject,
    topicSlug,
    attempts,
    predictedRecall7d: avg(in7),
    predictedRecallOnPaper: onPaper ? avg(onPaper) : null,
    now,
  });
  await db.mastery.put(m);
  return m;
}

/** Session bookkeeping for the weekly strip. One row per sitting; idle gaps over 30 minutes start a new one. */
export async function touchSession(subject: Attempt["subject"] | "mixed", now = new Date()): Promise<number> {
  const db = getDB();
  const last = await db.sessions.orderBy("startedAt").last();
  if (last && last.id != null && now.getTime() - (last.endedAt ?? last.startedAt).getTime() < 30 * 60_000) {
    const minutes = Math.max(1, Math.round((now.getTime() - last.startedAt.getTime()) / 60_000));
    await db.sessions.update(last.id, { endedAt: now, minutes, itemsDone: last.itemsDone + 1, subject: last.subject === subject ? subject : "mixed" });
    return last.id;
  }
  const id = await db.sessions.add({ startedAt: now, endedAt: now, subject, minutes: 1, itemsDone: 1 });
  return Number(id);
}
