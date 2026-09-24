"use client";

/**
 * The close figure slot: Rowan on the hill by the cairn, at the top of a close card (the art direction v2 §8.1, "Close:
 * the evening scene", and the canvas's close boards: the scene, then the title, then Rowan's line).
 *
 * It speaks for the `session-close` line: it draws exactly when that line would be said, from the same context, and
 * is silent when the line is (silenced, first run, the Letter's first day, every line inside its cooldown), so the
 * hare never appears on a close where Rowan says nothing. The state follows the sitting: the wave, or the heather
 * stone held up when a stone was placed since the sitting began; the face is dry for a dry line.
 *
 * It is the `close` slot of the containment rule: aria-hidden, `data-companion-figure="close"`, `data-figure-state`,
 * nothing while a question is up, and nothing when the context says the figure is off (Words only or Quiet in
 * Settings; the line still speaks in Words only). Hosts: src/components/ux/CloseCard.tsx (the review inbox and the
 * practice flows) and the Slides close card ("wide" on the phone, "tall" as the desktop's full-height panel).
 */

import { useRef } from "react";
import { clsx } from "clsx";
import { figureExpressionFor, figureStateFor, selectAt, type CompanionContext, type Moment, type Selection } from "@/lib/companion";
import { RowanScene, type SceneVariant } from "./RowanScene";

export interface CompanionSceneProps {
  /** The context the close card's line is chosen from; hold it once per close, as CloseCard does. */
  context: CompanionContext | null | undefined;
  /** "wide" in a column or a card; "tall" to fill a full-height panel. */
  variant?: SceneVariant;
  /** The line it stands for. Only `session-close` is wired. */
  moment?: Moment;
  className?: string;
}

export function CompanionScene({ context, variant = "wide", moment = "session-close", className }: CompanionSceneProps) {
  // Chosen once per mount from the first loaded context, as CompanionLine chooses its line: the line's own record of
  // being said must not make the picture change or vanish under her.
  const chosen = useRef<{ moment: Moment; selection: Selection | null } | null>(null);
  if (context && (chosen.current === null || chosen.current.moment !== moment)) {
    chosen.current = { moment, selection: selectAt(moment, context) };
  }
  const selection = context ? (chosen.current?.selection ?? null) : null;
  if (!context || context.questionVisible || !context.figure || !selection || selection.unsigned) return null;

  const state = figureStateFor(selection.moment, context);
  const expression = figureExpressionFor(selection.line.id, state);
  return (
    <div aria-hidden data-companion-figure="close" data-figure-state={state} className={clsx(variant === "tall" && "h-full", className)}>
      <RowanScene variant={variant} state={state} expression={expression} />
    </div>
  );
}
