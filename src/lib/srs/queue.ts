import type { ReviewCard } from "@/lib/db/db";

export interface QueueOptions {
  /** Daily cap so a missed week never returns as a wall (plan §4.1). */
  cap?: number;
  /** Days-to-paper per `${subject}:${unit}` so nearer papers are weighted up. */
  daysToPaper?: Record<string, number | null>;
  /** Item ids already reviewed today, to exclude. */
  doneToday?: Set<string>;
}

/**
 * Chooses tonight's queue from the due cards.
 * Order: hypercorrection re-probes first, then most overdue, weighted by exam proximity;
 * then interleaved so no two consecutive cards share a topic (mixed by construction).
 */
export function pickQueue(cards: ReviewCard[], now: Date, opts: QueueOptions = {}): ReviewCard[] {
  const cap = opts.cap ?? 25;
  const done = opts.doneToday ?? new Set<string>();
  const due = cards.filter((c) => c.due.getTime() <= now.getTime() && !done.has(c.id));

  const score = (c: ReviewCard) => {
    const overdueDays = (now.getTime() - c.due.getTime()) / 86_400_000;
    const key = `${c.subject}:${c.topicSlug.split("/")[0]}`;
    const d = opts.daysToPaper?.[key];
    const proximity = d == null ? 1 : d <= 14 ? 3 : d <= 42 ? 2 : 1;
    const hc = c.id.startsWith("hc:") ? 100 : 0;
    return hc + overdueDays * proximity;
  };

  const ranked = [...due].sort((a, b) => score(b) - score(a)).slice(0, cap);
  return interleaveByTopic(ranked);
}

/** Greedy interleave: never two consecutive cards from the same topic when avoidable. */
export function interleaveByTopic(cards: ReviewCard[]): ReviewCard[] {
  const out: ReviewCard[] = [];
  const pool = [...cards];
  while (pool.length) {
    const last = out[out.length - 1];
    let idx = pool.findIndex((c) => !last || c.topicSlug !== last.topicSlug);
    if (idx === -1) idx = 0;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

/** Rough minutes estimate shown on the Today tile: ~45 s per card. */
export function estimateMinutes(count: number): number {
  return Math.max(1, Math.round(count * 0.75));
}
