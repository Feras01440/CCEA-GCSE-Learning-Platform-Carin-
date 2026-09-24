/**
 * Marking for the `order` answer kind (arrange the items). Pure; no content dependencies.
 * The raw response is the item indices in the learner's arrangement, top first, comma-separated ("2,0,1").
 */
import type { AnswerSpec } from "@/lib/content/schema";

export type OrderSpec = Extract<AnswerSpec, { kind: "order" }>;
export type StepsSpec = Extract<AnswerSpec, { kind: "steps" }>;

/**
 * A `steps` answer (a chain of working to put in order) as the order kind: the steps are the items, authored in
 * the right order, so the correct arrangement is 0, 1, 2 … The field shuffles them; the response is marked as an
 * order.
 */
export function stepsAsOrder(spec: StepsSpec): OrderSpec {
  return { kind: "order", items: [...spec.expectedOrder], correctOrder: spec.expectedOrder.map((_, i) => i) };
}

export interface OrderMarkResult {
  correct: boolean;
  /** The parsed arrangement, or null when the response is not a full permutation of the items. */
  arrangement: number[] | null;
  /** Positions whose item matches the correct order. */
  inPlace: number;
  total: number;
  feedback: string;
}

/** "2,0,1" → [2, 0, 1] when it is a permutation of 0..count-1, else null. */
export function parseArrangement(raw: string, count: number): number[] | null {
  const parts = raw.split(/[,\s]+/).filter(Boolean);
  if (parts.length !== count) return null;
  const idx = parts.map((p) => Number(p));
  if (idx.some((i) => !Number.isInteger(i) || i < 0 || i >= count)) return null;
  if (new Set(idx).size !== count) return null;
  return idx;
}

export function markOrder(raw: string, spec: OrderSpec): OrderMarkResult {
  const total = spec.items.length;
  const arrangement = parseArrangement(raw, total);
  if (!arrangement) {
    return { correct: false, arrangement: null, inPlace: 0, total, feedback: "Arrange every item first, then check." };
  }
  // Compare by item text, not index: a gap-fill such as ["less", "the same", "less"] has interchangeable
  // duplicates, and either "less" in either slot is the same answer.
  const text = (i: number | undefined) => (i === undefined ? "" : (spec.items[i] ?? "").trim().toLowerCase());
  const inPlace = arrangement.filter((item, pos) => text(item) === text(spec.correctOrder[pos])).length;
  const correct = inPlace === total;
  const feedback = correct
    ? "Every item is in the right place."
    : inPlace === 0
      ? "None of the items is in the right place yet. Decide what has to come first, then build from there."
      : `${inPlace} of ${total} in the right place. Look again at the neighbours of the ones you were least sure about.`;
  return { correct, arrangement, inPlace, total, feedback };
}
