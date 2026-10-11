/**
 * Where a card of the run stands in the deck as it was dealt: the "n of N" in the header and the track's segments.
 *
 * A Your turn she misses comes back once, before the recap (./cards.ts `withRetries`), so the run she walks grows by a
 * card per miss. The count used to be her place in that grown run: the trial's "55 cards" (the title card, the topic's
 * hero, the Start button) read "56" after one miss and "62" after seven, and the track's segments shrank under her as
 * she went (the slides-steps agent and the assessor, 11 Oct 2026). The deck she was promised is the deck as dealt: N is
 * its cards, a dealt card keeps its number, and a card asked once more is not a new card. A retry shows where the track
 * stands, the last dealt card before it, with "once more" beside it, and the track does not move until she is past.
 */
import type { Card } from "./cards";

export interface DealtPosition {
  /** The dealt card's number (1-based); on a retry, the number of the last dealt card before it. */
  n: number;
  /** The cards of the deck as dealt: never the retries her misses add. */
  N: number;
  /** A Your turn asked once more before the recap. */
  retry: boolean;
}

const isRetry = (c: Card | undefined): boolean => c !== undefined && c.kind === "gate" && c.retry;

/** Card `index` of the run (`withRetries` of the deck: the deck with her retries in place), as the deck dealt it. */
export function dealtPosition(run: readonly Card[], index: number): DealtPosition {
  const N = run.reduce((k, c) => (isRetry(c) ? k : k + 1), 0);
  if (run.length === 0) return { n: 0, N: 0, retry: false };
  const at = Math.max(0, Math.min(index, run.length - 1));
  let n = 0;
  for (let i = 0; i <= at; i += 1) if (!isRetry(run[i])) n += 1;
  // A retry is never first (the title is), but a run of retries alone still names a card.
  return { n: Math.max(n, 1), N, retry: isRetry(run[at]) };
}

/** The header's words for it: "12 of 55", or "49 of 55 · once more" on a retry. */
export function dealtCount(p: DealtPosition): string {
  return p.retry ? `${p.n} of ${p.N} · once more` : `${p.n} of ${p.N}`;
}
