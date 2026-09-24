"use client";

/**
 * The figure slot (decision 8; the owner's ruling of 23 September 2026 on presence at Duolingo's scale): where Rowan,
 * the hare, stands beside a signed line, at the size the canvas gave that place.
 *
 * - `arrival`: Today's Tonight tile, beside the arrival line: 140 px, and 200 px once the tile gives the line room
 *   beside it (a container query on the line's own block, so the words never get squeezed to fit the hare).
 * - `letter`: the Letter, beside the note: 100 px, 110 px from the desktop breakpoint.
 * - `topic`: the topic hero, beside the topic-open line: 72 px, 80 px from the tablet breakpoint.
 * - `close`: the hare alone at the close's sizes (156, 250 px). The close card itself draws the whole scene, the hare
 *   on the hill by the cairn, through CompanionScene.
 * The sizes are FIGURE_SLOTS in src/lib/companion/figure.ts, which the integration contract's table states and
 * contract.test.ts compares; rowan-figure.test.ts checks these classes carry the same numbers.
 *
 * Rules the slot keeps whatever is drawn in it:
 * - never against her choice: it renders nothing when the context says the figure is off (Words only, or Quiet), so
 *   rule 2's "reduced to its voice or silenced at no cost" is one flag read here, not a rule each host remembers;
 * - never during a question: it renders nothing when the context says an answer field or grading buttons are up,
 *   and it is only ever placed beside a signed line or in a Letter, both of which are silent then;
 * - never inside a container that holds an answer field (the containment rule in e2e/companion.spec.ts, which checks
 *   `[data-companion-figure]` as well as `[data-companion]`);
 * - decorative: aria-hidden, no text of its own (the words and the name carry the meaning);
 * - one arrival movement at most, and a still pose under prefers-reduced-motion (arrival.ts);
 * - RowanMark, the hare's 24 px mark, stands in where a line has no room for the figure (`mark`), and stays the
 *   fallback for good.
 */

import { clsx } from "clsx";
import type { CompanionContext } from "@/lib/companion";
import { MARK_SIZE, type FigureExpression, type FigureSlot, type FigureState } from "@/lib/companion/figure";
import { RowanFigure } from "./RowanFigure";
import { RowanMark } from "./RowanMark";

export { FIGURE_SLOTS, FIGURE_STATES, type FigureExpression, type FigureSlot, type FigureState } from "@/lib/companion/figure";

/**
 * The box of each slot at the canvas's sizes, phone first. Literal class strings, so the styles are generated; the
 * numbers are FIGURE_SLOTS'. The `@min-[32rem]` step needs a `@container` ancestor, which the arrival line provides.
 */
export const FIGURE_BOX: Record<FigureSlot, string> = {
  arrival: "size-[140px] @min-[32rem]:size-[200px]",
  letter: "size-[100px] lg:size-[110px]",
  topic: "size-[72px] md:size-[80px]",
  close: "size-[156px] lg:size-[250px]",
};

export interface CompanionFigureProps {
  slot: FigureSlot;
  state: FigureState;
  /** The face: attentive unless the line is one of the dry ones (figureExpressionFor). */
  expression?: FigureExpression;
  /** The same context the words came from; nothing renders while a question is up, or when the figure is off. */
  context: Pick<CompanionContext, "questionVisible" | "figure"> | null | undefined;
  /** Rowan's 24 px mark in place of the figure, where the line has no room for it (the sealed Letter). */
  mark?: boolean;
  className?: string;
}

export function CompanionFigure({ slot, state, expression = "attentive", context, mark = false, className }: CompanionFigureProps) {
  if (!context || context.questionVisible || !context.figure) return null;
  return (
    <span
      aria-hidden
      data-companion-figure={slot}
      data-figure-state={state}
      className={clsx("inline-flex shrink-0 items-end justify-center", mark ? "size-6 text-ink-3" : FIGURE_BOX[slot], className)}
    >
      {mark ? <RowanMark size={MARK_SIZE} /> : <RowanFigure state={state} expression={expression} />}
    </span>
  );
}
