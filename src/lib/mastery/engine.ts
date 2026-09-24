import type { Attempt, TopicMastery } from "@/lib/db/db";

export type MasteryLevel = TopicMastery["level"];

export interface MasteryInput {
  subject: Attempt["subject"];
  topicSlug: string;
  attempts: Attempt[];
  /** FSRS-predicted recall (0..1) of the topic's cards at 7 days, if known. */
  predictedRecall7d?: number | null;
  /** Predicted recall on the unit's paper date, if known. */
  predictedRecallOnPaper?: number | null;
  now: Date;
}

const DAY = 86_400_000;

function accuracy(list: Attempt[]): number | null {
  const scored = list.filter((a) => a.correct !== null);
  if (!scored.length) return null;
  return scored.filter((a) => a.correct).length / scored.length;
}

/**
 * Mastery states per plan §4.4: no level is awarded from an immediate post-test alone;
 * Proficient needs a later mixed-set success and predicted recall; Mastered needs three spaced sessions.
 * Misses in mixed practice or reviews demote one level.
 */
export function computeMastery(input: MasteryInput): TopicMastery {
  const { attempts, now } = input;
  const key = `${input.subject}:${input.topicSlug}`;
  const base: TopicMastery = {
    key,
    subject: input.subject,
    topicSlug: input.topicSlug,
    level: "not-started",
    score: 0,
    lastEvidenceAt: null,
    updatedAt: now,
  };
  if (!attempts.length) return base;

  const sorted = [...attempts].sort((a, b) => a.at.getTime() - b.at.getTime());
  const first = sorted[0].at;
  const lastEvidenceAt = sorted[sorted.length - 1].at;

  const initial = sorted.filter((a) => ["practice", "diagnostic"].includes(a.itemKind) && a.at.getTime() - first.getTime() < DAY);
  const laterMixed = sorted.filter((a) => ["exam", "prompt", "mistake"].includes(a.itemKind) && a.at.getTime() - first.getTime() >= 2 * DAY);
  const laterCorrect = laterMixed.filter((a) => a.correct);
  const recentMiss = sorted.slice(-6).some((a) => a.correct === false && ["exam", "prompt", "mistake"].includes(a.itemKind));

  const sessions = new Set(sorted.filter((a) => a.correct).map((a) => Math.floor(a.at.getTime() / DAY)));
  const score = accuracy(sorted.slice(-12)) ?? 0;

  let level: MasteryLevel = "attempted";
  const initialAcc = accuracy(initial);
  if (initialAcc !== null && initialAcc >= 0.7) level = "familiar";
  if (level === "familiar" && laterCorrect.length >= 1 && (input.predictedRecall7d ?? 0.85) >= 0.85) level = "proficient";
  if (level === "proficient" && sessions.size >= 3 && (input.predictedRecallOnPaper ?? 0) >= 0.9) level = "mastered";

  if (recentMiss) {
    if (level === "mastered") level = "proficient";
    else if (level === "proficient") level = "familiar";
  }

  return { ...base, level, score, lastEvidenceAt };
}

export const LEVEL_ORDER: MasteryLevel[] = ["not-started", "attempted", "familiar", "proficient", "mastered"];

export function levelLabel(level: MasteryLevel): string {
  return { "not-started": "Not started", attempted: "Attempted", familiar: "Familiar", proficient: "Proficient", mastered: "Mastered" }[level];
}

/** What Proficient needs from here, in one sentence (shown when the chip is tapped). */
export function nextStepHint(level: MasteryLevel): string {
  switch (level) {
    case "not-started":
      return "Do the pre-check to find your starting point.";
    case "attempted":
      return "Score 70% or more on the first practice set.";
    case "familiar":
      return "Get one right in a mixed set at least two days from now.";
    case "proficient":
      return "Three spaced sessions and predicted recall of 90% on the paper date.";
    case "mastered":
      return "Keep it: a miss in review drops it back to Proficient.";
  }
}
