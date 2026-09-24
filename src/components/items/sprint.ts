/**
 * Run-to-criterion deck logic for RecallSprint (pure). Every card must be answered
 * correctly `criterion` times in a row; a miss resets its streak and sends it to the
 * back of the queue. The self-check suggestion compares a typed attempt with the answer
 * (exact after normalisation, or every key word present).
 */
import { keywordsPresent, normaliseText } from "./text-marking";

export interface SprintCard {
  id: string;
  prompt: string;
  answer: string;
  keyWords?: readonly string[];
}

export interface SprintState {
  /** Card ids still in play, front first. */
  queue: string[];
  /** Ids that have reached the criterion, in the order they got there. */
  done: string[];
  streak: Record<string, number>;
  attempts: Record<string, number>;
  misses: Record<string, number>;
  criterion: number;
}

export function createSprint(deck: readonly SprintCard[], criterion = 1): SprintState {
  const ids = deck.map((c) => c.id);
  const zero = Object.fromEntries(ids.map((id) => [id, 0]));
  return { queue: ids, done: [], streak: { ...zero }, attempts: { ...zero }, misses: { ...zero }, criterion: Math.max(1, Math.round(criterion)) };
}

export function currentId(state: SprintState): string | null {
  return state.queue[0] ?? null;
}

/** Cards not yet at criterion. */
export function remaining(state: SprintState): number {
  return state.queue.length;
}

export function isFinished(state: SprintState): boolean {
  return state.queue.length === 0;
}

/** Records the answer for the front card and rotates the queue. Returns a new state. */
export function answerCurrent(state: SprintState, correct: boolean): SprintState {
  const id = currentId(state);
  if (id === null) return state;
  const attempts = { ...state.attempts, [id]: (state.attempts[id] ?? 0) + 1 };
  const misses = { ...state.misses, [id]: (state.misses[id] ?? 0) + (correct ? 0 : 1) };
  const streak = { ...state.streak, [id]: correct ? (state.streak[id] ?? 0) + 1 : 0 };
  const rest = state.queue.slice(1);
  if (correct && streak[id] >= state.criterion) {
    return { ...state, queue: rest, done: [...state.done, id], attempts, misses, streak };
  }
  return { ...state, queue: [...rest, id], attempts, misses, streak };
}

export interface SprintStats {
  cards: number;
  attempts: number;
  misses: number;
  /** Wall-clock time from the first prompt to the last card reaching criterion. */
  totalMs: number;
  perCard: Array<{ id: string; attempts: number; misses: number }>;
}

export function sprintStats(state: SprintState, totalMs: number): SprintStats {
  const ids = Object.keys(state.attempts);
  const perCard = ids.map((id) => ({ id, attempts: state.attempts[id] ?? 0, misses: state.misses[id] ?? 0 }));
  return {
    cards: ids.length,
    attempts: perCard.reduce((a, c) => a + c.attempts, 0),
    misses: perCard.reduce((a, c) => a + c.misses, 0),
    totalMs: Math.max(0, Math.round(totalMs)),
    perCard,
  };
}

export type SelfCheckVerdict = "match" | "keywords" | "missing" | "unknown";

export interface SelfCheck {
  verdict: SelfCheckVerdict;
  /** Key words the typed attempt did not contain (when the card lists key words). */
  missing: string[];
  present: string[];
  /** Suggested grade for the confirm button; the learner can always override. */
  suggested: boolean | null;
}

/** Compares a typed attempt with the card's answer to pre-select the self-check button. */
export function selfCheck(typed: string, card: Pick<SprintCard, "answer" | "keyWords">): SelfCheck {
  const t = normaliseText(typed);
  if (t.length === 0) return { verdict: "unknown", missing: [...(card.keyWords ?? [])], present: [], suggested: null };
  if (t === normaliseText(card.answer)) return { verdict: "match", missing: [], present: [...(card.keyWords ?? [])], suggested: true };
  const keys = card.keyWords ?? [];
  if (keys.length === 0) return { verdict: "unknown", missing: [], present: [], suggested: null };
  const k = keywordsPresent(typed, keys);
  return k.all
    ? { verdict: "keywords", missing: [], present: k.present, suggested: true }
    : { verdict: "missing", missing: k.missing, present: k.present, suggested: false };
}
