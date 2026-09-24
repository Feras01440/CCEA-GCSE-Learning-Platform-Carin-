/**
 * The Tonight tile's own words, as data: the headline that states tonight's fact and the sub-line of advice under
 * it, both in the product's voice. Rowan's arrival line stands under them on the same tile, so the two must never say
 * the same sentence; tonight-copy.test.ts holds every line the Today slot can select to that rule. Pure, so the test
 * reads the strings the tile prints rather than a copy of them.
 *
 * Nothing here counts what was not done: the sub-line after a gap is the one line the emotional-design rules allow
 * ("Ten minutes is enough tonight."), never the gap itself.
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
  /** Her first week, when "Chosen for you" still earns its line. */
  firstWeek: boolean;
}

/** The lines under the headline, in order, at most two. */
export function tonightSublines({ due, gentle, firstWeek }: TonightState): string[] {
  if (due > 0) {
    const lines: string[] = [];
    if (firstWeek) lines.push("Chosen for you: questions to try again, and ones you answered without being sure.");
    if (gentle) lines.push("Ten minutes is enough tonight.");
    return lines;
  }
  return [gentle ? "Ten minutes is enough tonight." : "Ten minutes on a new topic is enough."];
}

/** Every sentence the tile prints for this state, for the rule that Rowan never repeats one. */
export function tonightSentences(state: TonightState): string[] {
  const headline = state.due > 0 ? `${tonightHeadline(state.due)} · ${aboutMinutes(state.due)}` : tonightHeadline(state.due);
  return [headline, ...tonightSublines(state)];
}
