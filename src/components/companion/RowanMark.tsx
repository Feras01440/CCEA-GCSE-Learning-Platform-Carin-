"use client";

/**
 * Rowan's mark: the hare's head and two ears, 24 px, in the ink of the line it sits on.
 *
 * A port of the canvas generator's `hareMark()` (scratchpad/mockups-v2/rowan.mjs; the character sheet's "24 px mark").
 * It is the figure reduced to what reads at the size of a line: the silhouette is the two ears. Use it only where a
 * line has no room for the figure (the art direction v2 §7: the rail, a contents row, the sealed Letter's one line),
 * and as the fallback of every figure slot. It replaces the three-stone mark Rowan had before it had a face; the
 * cairn keeps its own mark (CairnMark in CairnArt.tsx), which is the product's, not Rowan's.
 *
 * currentColor, so it takes the ink of the line in all four themes; the eyes' whites are fixed white, as drawn.
 * Decorative: the name or the words beside it carry the meaning, so it is aria-hidden.
 */

import { clsx } from "clsx";
// The figure module alone, not the companion's whole surface: the Map draws this mark and needs nothing else of it.
import { MARK_SIZE } from "@/lib/companion/figure";

export interface RowanMarkProps {
  /** Width and height in pixels. 24 is the size it was drawn for. */
  size?: number;
  className?: string;
}

export function RowanMark({ size = MARK_SIZE, className }: RowanMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={clsx("inline-block overflow-visible align-middle", className)}
    >
      <rect x="6.6" y="0.5" width="4.2" height="12.5" rx="2.1" fill="currentColor" transform="rotate(-12 8.7 6.5)" />
      <rect x="12.8" y="0.2" width="4.2" height="12.5" rx="2.1" fill="currentColor" transform="rotate(9 14.9 6.5)" />
      <circle cx="12" cy="15.6" r="7.6" fill="currentColor" />
      <circle cx="9.5" cy="14.8" r="1.8" fill="#FFFFFF" />
      <circle cx="14.7" cy="14.4" r="1.9" fill="#FFFFFF" />
      <circle cx="9.8" cy="15.1" r="0.85" fill="currentColor" />
      <circle cx="15" cy="14.7" r="0.9" fill="currentColor" />
    </svg>
  );
}
