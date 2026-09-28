"use client";

/**
 * First run meets Rowan before it asks her name for it (the trial audit's COMPANION-8, 25 Sep 2026: "What should it call
 * you?" was asked before any "it" had been met, and Rowan had been taken out of first run by decision 3).
 *
 * One sentence in the product's voice, and the hare waving hello beside it at the Letter's size (the `welcome` figure
 * slot), so the question under it is about someone she has just met and will meet again in the Letter that evening.
 * Not the Letter, not a second name field and not a line of Rowan's: decision 3's reasons for taking the Letter out of
 * first run stand (it lengthened the part the learner review asked to keep short, and competed with her own name card).
 *
 * The host places it above the name card, never inside it, so the containment rule holds (a figure is never inside a
 * container that holds a field). The drawing follows her choice of what she sees of Rowan: nothing is drawn in Words
 * only or Quiet, or before the choice has been read; the sentence stays, because the question under it needs it.
 */

import { clsx } from "clsx";
import { introduction, type CompanionPresence } from "@/lib/companion";
import { CompanionFigure } from "./CompanionFigure";

export interface RowanIntroductionProps {
  /** What she sees of Rowan (useCompanionPresence); undefined while it loads, which draws nothing. */
  presence: CompanionPresence | undefined;
  className?: string;
}

export function RowanIntroduction({ presence, className }: RowanIntroductionProps) {
  const drawn = presence === "full";
  // The product's voice, in the interface face: Rowan's own serif is kept for what Rowan says.
  return (
    <div data-rowan-introduction="" className={clsx("flex items-center gap-4", className)}>
      {drawn && <CompanionFigure slot="welcome" state="arrival" context={{ questionVisible: false, figure: true }} />}
      <p className="min-w-0 max-w-[36ch] text-[16px] leading-relaxed text-ink-2">{introduction()}</p>
    </div>
  );
}
