/**
 * The review close card's headline. A skipped review used to print "0 items · 1 min" at heading size, which is
 * true and reads like a bug; a night with nothing answered says so in words, and the minute is not worth printing.
 */
export function reviewHeadline(count: number, minutes: number): string {
  if (count <= 0) return "Nothing answered tonight";
  return `${count} item${count === 1 ? "" : "s"} · ${Math.max(1, minutes)} min`;
}

/**
 * A card whose item cannot be opened on this device just now (no signal and not yet kept offline, or content the build
 * no longer carries without a record of why). Build 8 said "This item has been withdrawn from the content while it is
 * checked." of every such card, flashcards included, which was not true of them (the independent review, 27 Sep 2026).
 * The inbox now serves only what it can open, so this is its last resort; the card stays due either way.
 */
export const NOT_OPENED = "This one could not be opened on this device just now. It stays in your reviews.";

/** Under the count, when some due cards could not be opened: they wait, and took no place in tonight's list. */
export function unopenedLine(n: number): string | null {
  if (n <= 0) return null;
  return n === 1
    ? "One other card could not be opened on this device just now; it stays in your reviews."
    : `${n} other cards could not be opened on this device just now; they stay in your reviews.`;
}

/** Above a lesson's check asked as its twin (gateForReview): why it is not the screen she remembers. */
export const TWIN_NOTE = "The same check as in the lesson, on new numbers.";

/** The inbox when every card due tonight is one it cannot open: a title and a line that say so, never "Nothing due". */
export function unopenedOnly(n: number): { title: string; line: string } {
  return {
    title: "Nothing to open just now",
    line:
      n === 1
        ? "One card is due, but it could not be opened on this device just now. It stays in your reviews."
        : `${n} cards are due, but they could not be opened on this device just now. They stay in your reviews.`,
  };
}
