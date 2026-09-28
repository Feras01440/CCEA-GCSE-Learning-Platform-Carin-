"use client";

/**
 * One line, in the product's own ink.
 *
 * No bubble, no corner, no sticky position: it is text on the page, set in the serif voice so it reads as
 * written rather than as interface. It renders nothing at all when the selector says silence.
 *
 * Rules enforced here rather than in copy:
 * - the support slot (and every other moment that sits inside the work) renders unsigned prose with no
 *   figure, no name and no `data-companion` attribute, so the "nothing while an answer field is visible"
 *   assertion holds even at the second miss;
 * - a signed line carries the hare where the design canvas puts it (decision 8; art direction v2 §7 and §9):
 *   on Today the posed hare stands on the Tonight tile's floor with the arrival line beside it; in a topic's
 *   hero it listens beside the topic-open line. The close card's hare is its scene, drawn at the top of the card
 *   by CompanionScene, so the close line itself stands alone. The state comes from the moment that spoke and the
 *   face from the line's register (src/lib/companion/figure.ts), never from the clock or her answers. When the
 *   context says the figure is off (Words only in Settings), the same line takes the words-alone layout, so nothing
 *   stands beside an empty box and the words get the room the hare had;
 * - its name is there for a screen reader, since the figure is decorative;
 * - "today-open" tries the late-evening lines first (selectAt), so the arrival slot is the one that says it
 *   is late, and the attribute names the moment that actually spoke;
 * - the evening state is copy and the drawing only. There is no dimming of the words and no new token: the
 *   difference between nine o'clock and midnight is which sentence is true, not how dark it is.
 *
 * No `aria-live`: an arrival line is part of the page, not an announcement over it.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";
import {
  figureExpressionFor,
  figureStateFor,
  rememberLineShown,
  selectAt,
  tonightFigureState,
  type CompanionContext,
  type Moment,
  type Selection,
} from "@/lib/companion";
import { CompanionFigure } from "./CompanionFigure";

type Chosen = { moment: Moment; selection: Selection | null };

/** The serif voice, with a token the design system can take over later without touching this file. */
export const COMPANION_FONT = "var(--font-companion, ui-serif, Georgia, 'Times New Roman', serif)";

/**
 * The figure a signed line carries beside its words, by the moment that spoke. Moments not listed carry none: the
 * close's figure is the scene above the close card's title (CompanionScene), and the paper line stands alone.
 */
export const LINE_FIGURE: Partial<Record<Moment, "arrival" | "topic">> = {
  "today-open": "arrival",
  evening: "arrival",
  "topic-open": "topic",
};

export interface CompanionLineProps {
  moment: Moment;
  /** From `useCompanionContext()`. `undefined` while it loads, which renders nothing. */
  context: CompanionContext | null | undefined;
  /** Defaults to recording the line so it is not repeated inside the cooldown. */
  onShown?: (lineId: string) => void;
  className?: string;
  /**
   * The Tonight tile's composition (the owner's presence ruling of 23 September; the trial audit's TODAY-1, 27 September):
   * the hare stands on the tile on every open, in the state the day calls for (tonightFigureState), whether or not Rowan
   * has a line to say this visit. Without it the arrival slot draws the hare only beside a line, as every other slot does.
   */
  standing?: boolean;
  /**
   * The tile's own sentence, in the product's voice. It stands beside the hare while Rowan is silent and gives way to
   * Rowan's line when there is one: one screen, one sentence, once (src/components/home/tonight-copy.ts).
   */
  fallback?: ReactNode;
}

/**
 * Whether Today's hare may stand on the tile at all this open: her choice (Full), first run behind her, no question up
 * and her brother's note not on the screen (Rowan yields to it entirely, figure and all).
 */
function standsOnTile(context: CompanionContext): boolean {
  return context.figure && context.firstRunDone && !context.questionVisible && !context.giftNoteOnScreen;
}

export function CompanionLine({ moment, context, onShown, className, standing = false, fallback }: CompanionLineProps) {
  // A line is chosen once per mount, from the first loaded context. Recording it writes companionState,
  // which re-runs the live query behind `context`; if the line were re-selected from that fresh context
  // the cooldown would exclude the line just shown, the slot would swap to a second line, record that
  // too, and fall silent, spending two lines on one visit. Holding the first choice keeps one visit to
  // one line. A change of `moment` starts over.
  const chosen = useRef<Chosen | null>(null);
  if (context && (chosen.current === null || chosen.current.moment !== moment)) {
    chosen.current = { moment, selection: selectAt(moment, context) };
  }
  const selection = context ? chosen.current?.selection ?? null : null;
  const lineId = selection?.line.id ?? null;

  useEffect(() => {
    if (!lineId) return;
    if (onShown) onShown(lineId);
    else void rememberLineShown(lineId);
  }, [lineId, onShown]);

  if (!context) return null;

  // Today's arrival slot: the Tonight tile's row, which carries the hare on every open when the host asks it to stand.
  if (LINE_FIGURE[moment] === "arrival" && (standing || (selection && !selection.unsigned))) {
    return <TonightRow context={context} selection={selection} standing={standing} fallback={fallback} className={className} />;
  }

  if (!selection) return null;

  // Inside the work: the note's own register, unsigned and unattributed.
  if (selection.unsigned) {
    return (
      <p className={clsx("text-ui leading-relaxed text-ink-2", className)} style={{ fontFamily: COMPANION_FONT }}>
        {selection.text}
      </p>
    );
  }

  // 17 px in the lesson serif, as docs/design/art-direction/02-surfaces.md §8 sets the signed line. The figure only
  // where the moment carries one and she has not chosen Words only.
  const figure = context.figure ? LINE_FIGURE[selection.moment] : undefined;
  const state = figureStateFor(selection.moment, context);
  const expression = figureExpressionFor(selection.line.id, state);
  const words = (
    <>
      <span className="sr-only">{context.rowanName}: </span>
      {selection.text}
    </>
  );

  // A topic's hero (the canvas's Read boards): the hare listening, 72 or 80 px, then the line, centred on each other.
  if (figure === "topic") {
    return (
      <div data-companion={selection.moment} className={clsx("flex items-center gap-3.5", className)}>
        <CompanionFigure slot="topic" state={state} expression={expression} context={context} />
        <p className="min-w-0 max-w-[42ch] text-[17px] leading-[1.55] text-ink-2" style={{ fontFamily: COMPANION_FONT }}>
          {words}
        </p>
      </div>
    );
  }

  // The close card's line and the paper line, and every signed line in Words only: the words alone, at 42ch.
  return (
    <div data-companion={selection.moment} className={className}>
      <p className="min-w-0 max-w-[42ch] text-[17px] leading-[1.55] text-ink-2" style={{ fontFamily: COMPANION_FONT }}>
        {words}
      </p>
    </div>
  );
}

interface TonightRowProps {
  context: CompanionContext;
  selection: Selection | null;
  standing: boolean;
  fallback?: ReactNode;
  className?: string;
}

/**
 * The Tonight tile's row (the canvas's Today boards): one sentence on the left, and the posed hare on the right standing on
 * the tile's floor, 140 px, or 200 px once the row is wide enough to keep the sentence beside it readable; the hare's box
 * hangs 12 px below the row, onto the space above the tile's one button, which the row's own -mb-2 keeps at the canvas's
 * 12 px. The sentence is Rowan's line, signed, when it speaks this open, and otherwise the tile's own sentence in the
 * product's voice; they are never both on the tile. With `standing` the hare is there either way, in the state the day
 * calls for, and the layout is the same whether or not a line is said, so the button never moves under her. The hare is
 * the tile's, not the line's: it is the line's sibling, and the line alone carries `data-companion`.
 */
function TonightRow({ context, selection, standing, fallback, className }: TonightRowProps) {
  const signed = selection && !selection.unsigned ? selection : null;
  const drawn = standing ? standsOnTile(context) : context.figure && signed !== null;
  const state = tonightFigureState(context);
  const expression = signed ? figureExpressionFor(signed.line.id, state) : "attentive";
  const words = signed ? (
    <p data-companion={signed.moment} className={clsx("text-[17px] leading-[1.55] text-ink-2", !drawn && "min-w-0 max-w-[42ch]")} style={{ fontFamily: COMPANION_FONT }}>
      <span className="sr-only">{context.rowanName}: </span>
      {signed.text}
    </p>
  ) : (
    (fallback ?? null)
  );

  // Words only, Quiet, or a screen Rowan yields: the sentence alone, with the room the hare had.
  if (!drawn) {
    return words ? (
      <div data-tonight-row="" className={className}>
        {words}
      </div>
    ) : null;
  }
  return (
    <div data-tonight-row="" className={clsx("@container -mb-2", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_140px] items-end gap-3 @min-[32rem]:grid-cols-[minmax(0,1fr)_200px] @min-[32rem]:gap-7">
        <div className="mb-1.5 min-w-0 max-w-[34ch]">{words}</div>
        <div className="-mb-3">
          <CompanionFigure slot="arrival" state={state} expression={expression} context={context} />
        </div>
      </div>
    </div>
  );
}
