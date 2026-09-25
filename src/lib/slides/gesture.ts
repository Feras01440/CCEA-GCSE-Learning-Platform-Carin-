/**
 * When a pointer movement on a card is a swipe that turns it (pure, for SlidesRun). The swipe is the phone's gesture
 * (art direction v2 §8.2: "swipe, tap and arrow keys advance; a swipe back re-reads"): a finger or a pen moved
 * deliberately sideways. A mouse drag is how a desk selects a line to re-read or copy, so it never turns a card, and
 * nothing turns while text is selected, whatever moved it (audit CQ-05: dragging across a sentence jumped her back to
 * the title card and lost the selection).
 */

/** How far a finger must travel sideways, in CSS pixels. */
export const SWIPE_PX = 60;

export interface PointerMove {
  pointerType: string;
  dx: number;
  dy: number;
  /** The document's selected text when the pointer lifted ("" when nothing is selected). */
  selection: string;
}

/** "next" for a swipe to the left, "back" for one to the right, null for anything that is not a swipe. */
export function swipeDirection({ pointerType, dx, dy, selection }: PointerMove): "next" | "back" | null {
  if (pointerType !== "touch" && pointerType !== "pen") return null;
  if (selection.trim().length > 0) return null;
  if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 2) return null;
  return dx < 0 ? "next" : "back";
}
