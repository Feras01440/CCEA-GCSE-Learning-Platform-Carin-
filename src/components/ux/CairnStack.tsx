"use client";

import type { CSSProperties } from "react";
import { clsx } from "clsx";
import { CairnGroup, PLACED_STONE, STONES } from "@/components/companion/CairnArt";
import { C } from "@/components/companion/rowan-palette";
import { useSvgId } from "@/components/companion/svg-id";

/**
 * The motif: one stone per topic proved, drawn as the one cairn of art direction v2's craft floor (CairnArt: four
 * hand-drawn stones, a lit face and a shadow face each, contact shadows, a cast shadow, lichen, grass). The pill stack
 * this replaced was ruled out by the owner on 23 Sep, so the stones are no longer a pile to count: the cairn grows base
 * first with her first four stones and then holds, and how many she has placed is data (`data-stones`, the name a
 * screen reader hears, the caption when there is one).
 *
 * Stones are placed, never removed. A stone placed tonight (`fresh`) settles in with the place motion, 300 ms, and not
 * at all under reduced motion: within the first four it is the top stone drawn; past four it is the heather stone laid
 * on the cairn's top, the same stone the hare holds up when one is placed.
 *
 * The sizes are the old ones by width (72, 120 and 180 px); the height follows the drawing.
 */
const VIEW = { x: 14, y: 40, w: 148, h: 116 } as const;

const PX: Record<"sm" | "md" | "lg", number> = { sm: 72, md: 120, lg: 180 };

export function CairnStack({
  count,
  fresh = 0,
  size = "md",
  label,
  className,
}: {
  count: number;
  fresh?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const n = Math.max(0, Math.floor(count));
  const newest = Math.max(0, Math.min(Math.floor(fresh), n));
  const shown = Math.min(n, 4);
  // Within the first four the fresh stones are the top ones drawn; past four the fresh stone is the heather one on top.
  const settlingStones = n <= 4 ? Math.min(newest, shown) : 0;
  const settled = shown - settlingStones;
  const placedTonight = newest > 0 && n > 4;
  const clip = useSvgId("cairn-fresh-");
  const width = PX[size];
  const height = Math.round((width * VIEW.h) / VIEW.w);
  // The place motion settles a stone onto the one below it, so it pivots on its own base.
  const settle = { transformOrigin: "98px 146px", transformBox: "view-box" } as CSSProperties;

  return (
    <figure data-cairn="stones" data-stones={n} className={clsx("inline-flex flex-col items-center gap-1", className)}>
      <svg
        width={width}
        height={height}
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
        role="img"
        aria-label={label ?? (n === 0 ? "No stones yet" : `${n} ${n === 1 ? "stone" : "stones"}`)}
        className="overflow-visible"
      >
        {n === 0 ? (
          // No stone yet: the ground where the first will go, quiet.
          <line x1="44" x2="152" y1="146" y2="146" stroke="currentColor" strokeOpacity="0.3" strokeWidth="4" strokeLinecap="round" className="text-ink" />
        ) : (
          <>
            {settled > 0 && <CairnGroup stones={settled} />}
            {settlingStones > 0 &&
              (settled === 0 ? (
                <g className="motion-place" style={settle}>
                  <CairnGroup stones={shown} />
                </g>
              ) : (
                <g className="motion-place" style={settle}>
                  {/* Only the fresh stones (and the shadow each casts on the one below) from a drawing of the whole
                      cairn so far: the lit faces, the shade and the lichen stay exactly where the full cairn has them. */}
                  <clipPath id={clip}>
                    {STONES.slice(settled, shown).map((st, i) => (
                      <path key={`s${i}`} d={st.d} />
                    ))}
                    {STONES.slice(settled, shown).map((st, i) => (
                      <ellipse key={`c${i}`} cx={st.contact[0]} cy={st.contact[1]} rx={st.contact[2]} ry={st.contact[3]} />
                    ))}
                  </clipPath>
                  <g clipPath={`url(#${clip})`}>
                    <CairnGroup stones={shown} grass={false} shadow={false} />
                  </g>
                </g>
              ))}
            {placedTonight && (
              // The heather stone exactly as CairnGroup lays it on the top (`placed`), drawn alone so it can settle.
              <g className="motion-place" style={settle}>
                <path d={PLACED_STONE} fill={C.heather} />
                <path d="M80 52 C84 49 92 49 96 51" fill="none" stroke={C.heatherLight} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              </g>
            )}
          </>
        )}
      </svg>
      {label && <figcaption className="tnum text-meta text-ink-2">{label}</figcaption>}
    </figure>
  );
}
