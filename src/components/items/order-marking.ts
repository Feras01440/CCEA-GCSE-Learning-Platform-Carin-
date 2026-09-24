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
  /**
   * The most items already in the right order relative to each other (the longest increasing run of their correct
   * positions): total − inOrder is the fewest items she must move to put the order right.
   */
  inOrder: number;
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
    return { correct: false, arrangement: null, inPlace: 0, inOrder: 0, total, feedback: "Arrange every item first, then check." };
  }
  // Compare by item text, not index: a gap-fill such as ["less", "the same", "less"] has interchangeable
  // duplicates, and either "less" in either slot is the same answer.
  const text = (i: number | undefined) => (i === undefined ? "" : (spec.items[i] ?? "").trim().toLowerCase());
  const inPlace = arrangement.filter((item, pos) => text(item) === text(spec.correctOrder[pos])).length;
  const inOrder = longestInOrder(arrangement.map(text), spec.correctOrder.map(text));
  const correct = inPlace === total;
  const feedback = correct
    ? "Every item is in the right place."
    : inPlace === 0
      ? "None of the items is in the right place yet. Decide what has to come first, then build from there."
      : `${inPlace} of ${total} in the right place. Look again at the neighbours of the ones you were least sure about.`;
  return { correct, arrangement, inPlace, inOrder, total, feedback };
}

/**
 * The longest run of the arranged items that already stand in the right order relative to each other. Each arranged
 * item is replaced by its position in the correct order; an item text that appears more than once (a gap-fill's
 * "less" twice) takes that text's positions in turn, the first copy the earliest, which keeps the most in order.
 */
function longestInOrder(arranged: readonly string[], correct: readonly string[]): number {
  const slots = new Map<string, number[]>();
  correct.forEach((t, pos) => slots.set(t, [...(slots.get(t) ?? []), pos]));
  const used = new Map<string, number>();
  const positions = arranged.map((t) => {
    const k = used.get(t) ?? 0;
    used.set(t, k + 1);
    return slots.get(t)?.[k] ?? -1;
  });
  // Patience sorting: tails[k] is the smallest last position of a run of length k + 1.
  const tails: number[] = [];
  for (const p of positions) {
    if (p < 0) continue;
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid]! < p) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = p;
  }
  return tails.length;
}

/**
 * The marks an arrangement earns on a part worth `marks` (B2E-14, 24 Sep 2026: every order and steps part was all or
 * nothing, so one swap on a 2-mark part scored 0). CCEA writes these schemes two ways, and the engine cannot tell
 * which from the scheme's words: a point per slot ("P1 tissue, P2 organ, P3 organ system") pays for the items in
 * their place, and a point per link of the chain ("heating comes first … the fraction drawn off last", "five or six
 * in the right place [1]") loses a mark for each item out of order. The award is the smaller of the two readings,
 *   in place:  the marks shared by the fraction of items in their place, rounding down;
 *   in order:  the marks less one for each item she would have to move;
 * so it never pays more than either kind of scheme would, and a miss never earns every mark.
 */
export function orderMarks(v: OrderMarkResult, marks: number): number {
  if (v.correct) return marks;
  if (v.arrangement === null || v.total === 0) return 0;
  const byPlace = Math.floor((marks * v.inPlace) / v.total);
  const byOrder = marks - (v.total - v.inOrder);
  return Math.max(0, Math.min(marks - 1, byPlace, byOrder));
}
