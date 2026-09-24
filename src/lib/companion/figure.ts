/**
 * Where Rowan's drawn figure stands, at what size, and in which state.
 *
 * Decision 8 gave Rowan a face; the owner chose the hare (direction A) and then ruled that it appears at Duolingo's
 * scale rather than as an icon in a corner (docs/design/2026-09-23-art-direction-v2.md §7, 23 September 2026). This
 * file is the data the components draw from and the integration contract's "The figure slots" table states:
 * contract.test.ts parses that table and fails if the two ever differ.
 *
 * Pure: the state a surface shows follows from the moment that spoke and its flags, never from the clock, the days
 * since, a count of answers or anything about her absence. The same line at 7 am and at 11 pm, on day one and on
 * day thirty, draws the same hare (the identity test in rowan-figure.test.ts).
 */

import type { CompanionContext } from "./context";
import type { Moment } from "./lines";

/** The resting portrait and the five states, all exam events (decision 8): never sad, angry or waiting. */
export type FigureState = "resting" | "arrival" | "listening" | "stone-placed" | "evening" | "letter";
export const FIGURE_STATES: FigureState[] = ["resting", "arrival", "listening", "stone-placed", "evening", "letter"];

/**
 * The two expressions on the character sheet, and the default. "attentive" is the lids a touch lowered; "dry" lowers
 * them further, shifts the pupils and adds the brow; "pleased" closes the eyes to two curves, and comes with a stone
 * placed.
 */
export type FigureExpression = "attentive" | "dry" | "pleased";

/**
 * The figure slots, at the canvas's sizes in CSS pixels, phone then desktop:
 * - `arrival`: Today's Tonight tile, the posed hare standing on the tile's floor with the arrival line beside it
 *   (140 on the phone, 200 when the tile gives the line room beside it);
 * - `letter`: the Letter, beside the note (100 on the phone, 110 on the desktop);
 * - `topic`: the topic hero, beside the topic-open line (72 on the phone, 80 on the desktop);
 * - `close`: the close card, standing on the hill by the cairn. On the hill scene these are the scene's own units
 *   (156 on the phone's 342-wide scene, 250 on the desktop's 400 by 640 panel), so the hare scales with the hills.
 *
 * The 24 px mark (RowanMark) is not a slot of its own: it stands in wherever a line has no room for the figure,
 * such as the sealed Letter's one line (MARK_SIZE).
 */
export const FIGURE_SLOTS = {
  arrival: { phone: 140, desktop: 200, states: ["arrival", "evening"] },
  letter: { phone: 100, desktop: 110, states: ["letter"] },
  topic: { phone: 72, desktop: 80, states: ["listening"] },
  close: { phone: 156, desktop: 250, states: ["arrival", "stone-placed"] },
} as const satisfies Record<string, { phone: number; desktop: number; states: readonly FigureState[] }>;
export type FigureSlot = keyof typeof FIGURE_SLOTS;
export const FIGURE_SLOT_NAMES = Object.keys(FIGURE_SLOTS) as FigureSlot[];

/** Rowan's mark, the hare's head and ears in the ink of the line it sits on: only where a line has no room. */
export const MARK_SIZE = 24;

/** The figure slot each signed moment carries. Unsigned moments, inside the work, never carry one. */
export const MOMENT_FIGURE: Partial<Record<Moment, FigureSlot>> = {
  "today-open": "arrival",
  evening: "arrival",
  "topic-open": "topic",
  "session-close": "close",
  "first-letter": "letter",
  "weekly-letter": "letter",
};

/**
 * The state the moment calls for. Today says it is late with the evening pose (ears back, lids half down, the moon);
 * a new topic is met listening; a Letter is held in both paws; the close waves, as the canvas's close cards draw it,
 * or holds the heather stone up when a stone was placed in this sitting.
 */
export function figureStateFor(moment: Moment, context: Pick<CompanionContext, "flags">): FigureState {
  switch (moment) {
    case "evening":
      return "evening";
    case "topic-open":
      return "listening";
    case "first-letter":
    case "weekly-letter":
      return "letter";
    case "session-close":
      return context.flags.stonePlaced ? "stone-placed" : "arrival";
    case "today-open":
      return "arrival";
    default:
      return "resting";
  }
}

/**
 * The face follows the register of the line, never her work: the five dry lines (lines.ts, "the five dry lines")
 * take the dry expression; everything else is attentive. A stone placed is pleased whatever the line (the drawing
 * itself closes the eyes in that state).
 */
export function figureExpressionFor(lineId: string, state: FigureState): FigureExpression {
  if (state === "stone-placed") return "pleased";
  return lineId.startsWith("dry.") ? "dry" : "attentive";
}
