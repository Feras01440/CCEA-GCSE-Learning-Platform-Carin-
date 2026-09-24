"use client";

/**
 * The cairn, redrawn to the craft floor (docs/design/2026-09-23-art-direction-v2.md §3.1): four hand-drawn stones,
 * asymmetric and weighted, each with a lit face and a shadow face from the top-left light, a contact shadow where each
 * sits, a cast shadow on the ground to the lower right, one lichen patch, grass at the base. It is the one cairn used
 * everywhere: the close scene, the hare's placed stone (the heather stone is this cairn's fifth), the 24 px mark.
 *
 * A port of the canvas generator's cairn.mjs (cairnGroup, cairnFigure, cairnMark), element for element and in the
 * same paint order. The perch slab is the paper stonechat's (direction C) and is not ported.
 */

import { Fragment } from "react";
import { clsx } from "clsx";
import { C, WHITE } from "./rowan-palette";
import { useSvgId } from "./svg-id";

type Tone = "mid" | "light" | "top";

interface StoneShape {
  /** Its outline, in the 160-unit space, base first. */
  d: string;
  tone: Tone;
  /** The ellipses that make the lit face and the shadow face, clipped to the outline: cx, cy, rx, ry. */
  lit: readonly [number, number, number, number];
  shade: readonly [number, number, number, number];
  /** The contact shadow this stone casts on the one below it. */
  contact: readonly [number, number, number, number];
}

export const STONES: readonly StoneShape[] = [
  { d: "M20 124 C24 108 56 100 92 102 C126 104 144 112 142 126 C140 140 112 146 78 145 C46 144 22 138 20 124 Z", tone: "mid", lit: [62, 104, 40, 14], shade: [122, 138, 48, 18], contact: [80, 141, 56, 5] },
  { d: "M38 106 C40 92 64 84 94 86 C114 88 126 96 122 108 C118 118 96 120 72 120 C52 120 36 116 38 106 Z", tone: "light", lit: [70, 88, 30, 11], shade: [110, 118, 34, 14], contact: [82, 118, 40, 4] },
  { d: "M56 88 C56 76 78 68 100 72 C116 75 122 84 116 92 C110 98 88 100 74 98 C62 96 55 94 56 88 Z", tone: "light", lit: [80, 72, 24, 9], shade: [106, 96, 26, 11], contact: [88, 97, 28, 3.5] },
  { d: "M68 72 C70 60 86 56 100 60 C110 63 110 74 104 78 C98 82 82 82 74 80 C68 78 67 76 68 72 Z", tone: "top", lit: [84, 61, 16, 7], shade: [102, 79, 16, 8], contact: [88, 80, 18, 3] },
];

/** The heather stone: placed once, never removed. The hare holds this same shape up in its stone-placed state. */
export const PLACED_STONE = "M76 56 C78 48 90 46 98 50 C104 53 104 60 98 62 C92 65 82 65 78 63 C75 61 75 59 76 56 Z";

const TONES: Record<Tone, string> = { mid: C.stoneMid, light: C.stoneLight, top: C.stoneTop };

function Stone({ st, id, mono }: { st: StoneShape; id: string; mono: boolean }) {
  const fill = mono ? "currentColor" : TONES[st.tone];
  const [lx, ly, lrx, lry] = st.lit;
  const [sx, sy, srx, sry] = st.shade;
  return (
    <g>
      <clipPath id={id}>
        <path d={st.d} />
      </clipPath>
      <path d={st.d} fill={fill} />
      {!mono && (
        <g clipPath={`url(#${id})`}>
          <ellipse cx={lx} cy={ly} rx={lrx} ry={lry} fill={WHITE} opacity="0.42" />
          <ellipse cx={sx} cy={sy} rx={srx} ry={sry} fill={C.stoneDark} opacity="0.5" />
        </g>
      )}
    </g>
  );
}

export interface CairnGroupProps {
  /** Where the 160-unit cairn is placed in the surrounding svg, and at what scale. */
  x?: number;
  y?: number;
  scale?: number;
  /** The heather stone on the top: a stone placed. */
  placed?: boolean;
  grass?: boolean;
  /** The cast shadow on the ground. */
  shadow?: boolean;
  mono?: boolean;
  /** How many of the four stones to draw, base first. */
  stones?: number;
}

/** The whole cairn as an svg group, to place inside any svg at that svg's own coordinates (cairn.mjs cairnGroup). */
export function CairnGroup({ x = 0, y = 0, scale = 1, placed = false, grass = true, shadow = true, mono = false, stones = 4 }: CairnGroupProps) {
  const k = useSvgId("cairn-stone-");
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {shadow && !mono && <ellipse cx="98" cy="146" rx="60" ry="7" fill={C.ink} opacity="0.13" />}
      {grass && !mono && <path d="M24 142 l5 -10 l5 10z M138 140 l4 -8 l4 8z M32 143 l3 -6 l3 6z" fill={C.hillDark} />}
      {STONES.slice(0, stones).map((st, i) => {
        const next = STONES[i + 1];
        return (
          <Fragment key={i}>
            <Stone st={st} id={`${k}${i}`} mono={mono} />
            {!mono && i < stones - 1 && next && (
              <ellipse cx={next.contact[0]} cy={next.contact[1]} rx={next.contact[2]} ry={next.contact[3]} fill={C.stoneDark} opacity="0.32" />
            )}
          </Fragment>
        );
      })}
      {!mono && (
        <>
          <path d="M112 112 C118 108 128 110 130 116 C131 120 124 123 118 122 C112 121 108 116 112 112 Z" fill={C.lichen} />
          <circle cx="121" cy="117" r="1.6" fill={C.lichenShade} />
        </>
      )}
      {placed && (
        <>
          <path d={PLACED_STONE} fill={mono ? "currentColor" : C.heather} />
          {!mono && <path d="M80 52 C84 49 92 49 96 51" fill="none" stroke={C.heatherLight} strokeWidth="2" strokeLinecap="round" opacity="0.8" />}
        </>
      )}
    </g>
  );
}

export interface CairnFigureProps {
  size?: number;
  placed?: boolean;
  mono?: boolean;
  grass?: boolean;
  className?: string;
}

/** The cairn on its own, 160 units square (cairn.mjs cairnFigure). Decorative. */
export function CairnFigure({ size = 160, placed = false, mono = false, grass = true, className }: CairnFigureProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" aria-hidden="true" focusable="false" className={clsx("block overflow-visible", className)}>
      <CairnGroup placed={placed} mono={mono} grass={grass} />
    </svg>
  );
}

export interface CairnMarkProps {
  size?: number;
  className?: string;
}

/**
 * The cairn's 24 px mark: three asymmetric stones in currentColor with a lit edge (cairn.mjs cairnMark). The product's
 * mark (the rail's wordmark, a finished row in a list), not Rowan's: Rowan's is the hare's head (RowanMark).
 */
export function CairnMark({ size = 24, className }: CairnMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={clsx("inline-block overflow-visible align-middle", className)}>
      <path d="M1.5 19 C2.5 15 9 13.8 13.5 14.2 C18.5 14.6 22.5 16.5 22.5 19.4 C22.5 22 18 23.2 12 23.2 C6 23.2 1.5 22.2 1.5 19 Z" fill="currentColor" />
      <path d="M4.6 14 C5.4 10.6 10 9.4 14 9.8 C17.8 10.2 20 12 19.4 14.4 C18.8 16.4 15 17.2 10.8 17.1 C7 17 4.2 16.2 4.6 14 Z" fill="currentColor" opacity="0.84" />
      <path d="M8 9.6 C8.6 6.6 12.2 5.4 15.2 6 C17.8 6.5 18.8 8.6 17.8 10.6 C16.8 12.2 13.2 12.6 10.6 12.1 C8.6 11.7 7.6 10.9 8 9.6 Z" fill="currentColor" opacity="0.68" />
      <path d="M3.4 17.2 C5.5 15.4 9 14.9 12.5 15 M6.2 12.6 C8 11.2 11 10.8 13.6 11 M9.2 8.4 C10.6 7.4 12.6 7.1 14.4 7.3" fill="none" stroke={WHITE} strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
