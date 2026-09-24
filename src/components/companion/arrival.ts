"use client";

/**
 * Rowan's one movement: the arrival (docs/design/2026-09-23-art-direction-v2.md §5 and §7). 240 ms, ease-out,
 * opacity 0 to 1 and a 4 px rise, once, then stillness: no idle motion, no blink, no breathing.
 *
 * Played with the Web Animations API from a layout effect, so:
 * - the server and a render without scripts draw the final pose, never an invisible one;
 * - nothing is created at all under prefers-reduced-motion, so `document.getAnimations().length === 0` holds on every
 *   screen the figure is on (the acceptance of benchmarks page 14 and art direction §11.5);
 * - it has no fill, so once it has played it is no longer listed by getAnimations either.
 *
 * The element it moves must carry no transform attribute of its own (a CSS transform replaces an SVG one while it
 * runs), which is why the drawings wrap their content in a bare group for it.
 */

import { useLayoutEffect, type RefObject } from "react";

export const ROWAN_ARRIVAL = { duration: 240, easing: "ease-out", rise: 4 } as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useArrival(ref: RefObject<Element | null>, enabled = true): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof el.animate !== "function" || prefersReducedMotion()) return;
    const arrival = el.animate(
      [
        { opacity: 0, transform: `translateY(${ROWAN_ARRIVAL.rise}px)` },
        { opacity: 1, transform: "translateY(0px)" },
      ],
      { duration: ROWAN_ARRIVAL.duration, easing: ROWAN_ARRIVAL.easing },
    );
    return () => arrival.cancel();
  }, [ref, enabled]);
}
