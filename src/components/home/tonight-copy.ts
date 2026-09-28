/**
 * The Tonight tile's own words, as data: the headline that states tonight's fact, and the one sentence the tile says in
 * the product's voice when Rowan has nothing to say this open.
 *
 * One screen, one sentence, once (02-surfaces.md §1 and 04-critique R5, amendment 2: "the sub-line under the count is
 * Rowan's today-open line"). Under the headline stands exactly one sentence, beside the hare: Rowan's line when it speaks,
 * otherwise this one. The two are never on the tile together, so they cannot repeat or contradict each other, and no line
 * Rowan can say repeats the headline (tonight-copy.test.ts holds every line the Today slot can select to that). Until 27
 * September the tile printed its sub-lines above Rowan's line: "Ten minutes on a new topic is enough." over "… is open
 * if you want something new." (the same advice twice), and after midnight the same advice over "Anything new will keep
 * for tomorrow" (the trial audit's TODAY-2 and TODAY-3).
 *
 * Pure, so the test reads the strings the tile prints rather than a copy of them. Nothing here counts what was not done:
 * after a gap the sentence is the one line the emotional-design rules allow ("Ten minutes is enough tonight."), never
 * the gap itself, and late at night it never advises new work (the companion specification's "no new work when late").
 */

/** The headline when nothing is due back. Rowan's `today.nothing-back` line says what is open instead. */
export const NOTHING_BACK = "Nothing back tonight.";

/** "9 back", or the fact that nothing is back. The minutes are added beside it by the tile. */
export function tonightHeadline(due: number): string {
  return due > 0 ? `${due} back` : NOTHING_BACK;
}

/** "about 7 minutes": the estimate at 0.75 min a card, never under a minute. */
export function aboutMinutes(due: number): string {
  const minutes = Math.max(1, Math.round(due * 0.75));
  return `about ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export interface TonightState {
  due: number;
  /** Three days or more since her last sitting: one line, and nothing about the gap. */
  gentle: boolean;
  /** Late enough to be told so (the companion's `isLate`: 21:30 to 04:00, and only because she is here). */
  late: boolean;
  /** A lesson she paused and has not finished (read-place.ts lastReadLesson): the tile offers the way back to it. */
  paused?: boolean;
}

/**
 * The tile's own sentence for tonight, said beside the hare while Rowan is silent (its lines spent for the evening, Quiet,
 * or the Letter's first day). One sentence, true of the state:
 * - with something back: late or after a gap, that ten minutes is enough; otherwise why these came back now;
 * - with nothing back: late, that anything new can wait; with a lesson paused, that her place in it is kept (the way
 *   back is the tile's one button); after a gap, that ten minutes is enough; otherwise the offer.
 */
export function tonightSentence({ due, gentle, late, paused = false }: TonightState): string {
  if (due > 0) return late || gentle ? "Ten minutes is enough tonight." : "Each one is back just before you would forget it.";
  if (late) return "Anything new can wait for tomorrow.";
  if (paused) return "Your place in the lesson is kept.";
  return gentle ? "Ten minutes is enough tonight." : "Ten minutes on a new topic is enough.";
}

/** A paused lesson as the tile shows it: the lesson and the section it opens at, and the word on the way back. */
export interface PausedLesson {
  title: string;
  /** Sections done. */
  done: number;
  /** The section it opens at. */
  open: number;
  total: number;
}

/**
 * The tile's row for a lesson she paused (the trial audit's READ-12: "Pause here" used to land on a Today that said
 * nothing of the lesson). Facts and the way back only, in the product's voice: Rowan says, in its own, that the section
 * is done (lines.ts today.paused-done), so the two never say the same thing.
 */
export function pausedRow(p: PausedLesson): { label: string; action: string } {
  return { label: `${p.title} · section ${p.open} of ${p.total} next`, action: "Carry on" };
}
