"use client";

/**
 * Rowan, the hare: direction A of the design canvas, the owner's choice (docs/design/2026-09-23-art-direction-v2.md §7).
 *
 * A port of the canvas generator's `hare()` (scratchpad/mockups-v2/rowan.mjs), element for element and in the same
 * paint order, with the same arithmetic so every coordinate matches the approved drawing. It is not a redrawing: a
 * change to the hare is a change to the canvas first. The grammar it keeps (§3.1): the rounded rectangle, the circle
 * and the rounded triangle; no outlines; one light from the top-left with one shadow tone per colour; eyes with
 * whites, a pupil and a catchlight; the gorse scarf as the only warm accent.
 *
 * States (decision 8, all exam events): resting; arrival waves with the near arm and looks up; listening tilts the
 * head, ears forward, paws together; a stone placed holds the heather stone up in both paws, eyes closed pleased;
 * evening sits low with the ears back, the lids half down, under the moon; the Letter is held in both paws.
 * Expressions: attentive (the default, lids a touch lowered), dry (lids lower, pupils aside, the brow), pleased.
 *
 * Decorative wherever it is used: the words beside it carry the meaning, so it is aria-hidden with no text of its own.
 * It moves once on arrival and never again (arrival.ts); under reduced motion it is the still pose.
 */

import { useRef, type ReactNode } from "react";
import { clsx } from "clsx";
import type { FigureExpression, FigureState } from "@/lib/companion/figure";
import { useArrival } from "./arrival";
import { C, LETTER_PAPER, WHITE } from "./rowan-palette";
import { useSvgId } from "./svg-id";

export interface RowanFigureProps {
  state?: FigureState;
  expression?: FigureExpression;
  /** Width and height in CSS pixels. Left out, the drawing fills the box it is placed in. */
  size?: number;
  /**
   * Drawn inside another svg, at that svg's own coordinates (the close card's hill scene), as the canvas nests it:
   * a nested svg whose 160-unit viewBox is scaled to `size` scene units at (`x`, `y`).
   */
  nested?: { x: number; y: number; size: number };
  /** The silhouette test: every form in currentColor (the Letter keeps its paper, as on the canvas). */
  mono?: boolean;
  /** The one arrival movement. On by default; never played under reduced motion. */
  arrive?: boolean;
  className?: string;
}

export function RowanFigure({ state = "resting", expression = "attentive", size, nested, mono = false, arrive = true, className }: RowanFigureProps) {
  const k = useSvgId("rowan-hare-");
  // The group the arrival moves: bare, so its CSS transform never replaces a drawn one.
  const moving = useRef<SVGGElement>(null);
  useArrival(moving, arrive);
  const drawing = (
    <g ref={moving}>
      <HareDrawing k={k} state={state} expression={expression} mono={mono} />
    </g>
  );
  if (nested) {
    return (
      <svg x={nested.x} y={nested.y} width={nested.size} height={nested.size} viewBox="0 0 160 160" className={className}>
        {drawing}
      </svg>
    );
  }
  return (
    <svg
      width={size ?? "100%"}
      height={size ?? "100%"}
      viewBox="0 0 160 160"
      aria-hidden="true"
      focusable="false"
      className={clsx("block overflow-visible", className)}
    >
      {drawing}
    </svg>
  );
}

interface EyeProps {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  ink: string;
  white: string;
  lidFill: string;
  lidOpen: number;
  pupilDx: number;
  pleased: boolean;
}

/** One eye: the white, the pupil, the catchlight, and a lid in the colour around it (rowan.mjs eyeOf). */
function Eye({ cx, cy, rx, ry, ink, white, lidFill, lidOpen, pupilDx, pleased }: EyeProps) {
  if (pleased) {
    return <path d={`M${cx - rx} ${cy + 1} q ${rx} -${ry * 1.15} ${rx * 2} 0`} fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />;
  }
  const lidH = ry * 2 * (1 - lidOpen);
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={white} />
      <circle cx={cx + 1 + pupilDx} cy={cy + 1.4} r={ry * 0.46} fill={ink} />
      <circle cx={cx - 0.4 + pupilDx} cy={cy - 1.2} r={ry * 0.17} fill={white} />
      {lidH > 0.2 && (
        <path d={`M${cx - rx - 0.6} ${cy - ry - 0.6} h ${rx * 2 + 1.2} v ${lidH + 0.6} a ${rx + 0.6} ${ry * 0.9} 0 0 1 ${-(rx * 2 + 1.2)} 0 z`} fill={lidFill} />
      )}
    </g>
  );
}

/** The Letter in its paws: paper, a fold, a heather seal (rowan.mjs letterProp; fixed colours, as on the canvas). */
function LetterProp({ x, y, rot = 0, w = 38, h = 25 }: { x: number; y: number; rot?: number; w?: number; h?: number }) {
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={LETTER_PAPER} />
      <rect x={x} y={y} width={w} height={h} rx="3" fill={C.ink} opacity="0.05" />
      <path d={`M${x + 2} ${y + 2} L${x + w / 2} ${y + h * 0.58} L${x + w - 2} ${y + 2}`} fill="none" stroke={C.paperDeep} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={x + w / 2} cy={y + h * 0.58} r="3" fill={C.heather} />
    </g>
  );
}

/** An ear: the long pill and its rose inner, the far one in the shadow tone (rowan.mjs ear). */
function Ear({ x, rot, far, fur, shade, rose }: { x: number; rot: number; far: boolean; fur: string; shade: string; rose: string }) {
  return (
    <g transform={`rotate(${rot} ${x + 6.5} 46)`}>
      <rect x={x} y="-2" width="13" height="50" rx="6.5" fill={far ? shade : fur} />
      <rect x={x + 4} y="6" width="5" height="32" rx="2.5" fill={rose} opacity={far ? 0.75 : 1} />
    </g>
  );
}

/** The drawing itself, in the canvas's paint order: shadow, moon, body, paws, scarf, then the head over them. */
function HareDrawing({ k, state, expression, mono }: { k: string; state: FigureState; expression: FigureExpression; mono: boolean }) {
  const m = (c: string) => (mono ? "currentColor" : c);
  const fur = m(C.fur);
  const shade = m(C.furShade);
  const cream = m(C.cream);
  const rose = m(C.earRose);
  const nose = m(C.nose);
  const gorse = m(C.gorse);
  const gorseDeep = m(C.gorseDeep);
  const ink = m(C.ink);
  const white = m(WHITE);
  const evening = state === "evening";
  const placed = state === "stone-placed";
  const listening = state === "listening";
  const arrival = state === "arrival";
  const letter = state === "letter";
  const pleased = expression === "pleased" || placed;
  const dry = expression === "dry";
  let earL = -10;
  let earR = 9;
  if (arrival) {
    earL = -16;
    earR = 34;
  }
  if (listening) {
    earL = -24;
    earR = -6;
  }
  if (evening) {
    earL = -60;
    earR = -50;
  }
  const headTilt = listening ? -8 : arrival ? 4 : placed ? -3 : 0;
  const pupilDx = listening ? 2 : dry ? 1.5 : arrival ? -1.2 : 0;
  const lidOpen = evening ? 0.5 : dry ? 0.72 : arrival ? 1 : 0.9;
  const eye = { ink, white, lidFill: fur, lidOpen, pupilDx, pleased };

  // The paws and arms per state: the near arm waves on arrival; the paws come together when listening; the heather
  // stone is held up when a stone is placed; they tuck in the evening; the Letter is held in both.
  let paws: ReactNode;
  if (letter) {
    paws = (
      <>
        <LetterProp x={56} y={104} rot={-3} w={38} h={25} />
        <ellipse cx="58" cy="122" rx="6.5" ry="4.5" fill={fur} />
        <ellipse cx="94" cy="124" rx="6.5" ry="4.5" fill={shade} />
      </>
    );
  } else if (placed) {
    paws = (
      <>
        <rect x="58" y="98" width="11" height="26" rx="5.5" fill={fur} transform="rotate(28 63 111)" />
        <rect x="92" y="100" width="11" height="26" rx="5.5" fill={shade} transform="rotate(-28 97 113)" />
        <path d="M70 92 C72 84 84 82 92 86 C98 89 98 96 92 98 C86 101 76 101 72 99 C69 97 69 95 70 92 Z" fill={mono ? "currentColor" : C.heather} />
        <path d="M75 88 C80 85 88 85 92 87" fill="none" stroke={mono ? "currentColor" : C.heatherLight} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="70" cy="100" rx="6.5" ry="4.8" fill={fur} />
        <ellipse cx="92" cy="101" rx="6.5" ry="4.8" fill={shade} />
      </>
    );
  } else if (arrival) {
    paws = (
      <>
        <ellipse cx="60" cy="121" rx="6.5" ry="4.5" fill={fur} />
        <g transform="rotate(-38 104 104)">
          <rect x="98" y="76" width="12" height="34" rx="6" fill={shade} />
          <ellipse cx="104" cy="74" rx="7.5" ry="6" fill={fur} />
        </g>
      </>
    );
  } else if (listening) {
    paws = (
      <>
        <ellipse cx="72" cy="124" rx="7" ry="5" fill={fur} />
        <ellipse cx="85" cy="125" rx="7" ry="5" fill={shade} />
      </>
    );
  } else if (evening) {
    paws = (
      <>
        <ellipse cx="66" cy="124" rx="7" ry="4.5" fill={fur} />
        <ellipse cx="80" cy="126" rx="7" ry="4.5" fill={shade} />
      </>
    );
  } else {
    paws = (
      <>
        <ellipse cx="60" cy="121" rx="6.5" ry="4.5" fill={fur} />
        <ellipse cx="72" cy="126" rx="6.5" ry="4.5" fill={shade} />
      </>
    );
  }

  return (
    <>
      <defs>
        <clipPath id={`${k}b`}>
          <ellipse cx="80" cy="112" rx="26" ry="34" />
        </clipPath>
        <clipPath id={`${k}h`}>
          <circle cx="70" cy="60" r="24" />
        </clipPath>
      </defs>
      {!mono && <ellipse cx="82" cy="152" rx="44" ry="4.5" fill={C.ink} opacity="0.08" />}
      {evening && !mono && <path d="M130 15 a11 11 0 1 0 9 17 a8.5 8.5 0 1 1 -9 -17z" fill={C.moon} />}
      <g>
        <rect x="72" y="142" width="42" height="11" rx="5.5" fill={shade} />
        <circle cx="103" cy="130" r="7" fill={cream} />
        <circle cx="98" cy="126" r="15" fill={shade} />
        <ellipse cx="80" cy="112" rx="26" ry="34" fill={fur} />
        <g clipPath={`url(#${k}b)`}>
          <ellipse cx="100" cy="126" rx="26" ry="30" fill={shade} />
          <ellipse cx="75" cy="121" rx="13" ry="20" fill={cream} />
        </g>
        <rect x="42" y="140" width="42" height="12" rx="6" fill={fur} />
        <rect x="42" y="146" width="42" height="6" rx="3" fill={shade} opacity="0.45" />
        {paws}
        <g transform="rotate(-4 76 84)">
          <rect x="55" y="78" width="42" height="12" rx="6" fill={gorse} />
          <rect x="55" y="84" width="42" height="6" rx="3" fill={gorseDeep} opacity="0.6" />
          <rect x="88" y="84" width="10" height="24" rx="5" fill={gorseDeep} transform="rotate(-8 93 84)" />
        </g>
      </g>
      <g transform={`rotate(${headTilt} 70 70)`}>
        <Ear x={76} rot={earR} far fur={fur} shade={shade} rose={rose} />
        <Ear x={53} rot={earL} far={false} fur={fur} shade={shade} rose={rose} />
        <circle cx="70" cy="60" r="24" fill={fur} />
        <g clipPath={`url(#${k}h)`}>
          <ellipse cx="98" cy="82" rx="26" ry="24" fill={shade} />
        </g>
        <ellipse cx="62" cy="68" rx="12" ry="9" fill={cream} />
        <path d="M50 64 h8 l-4 5.5z" fill={nose} stroke={nose} strokeWidth="2" strokeLinejoin="round" />
        <path d="M54 71 q3 3 6 0" fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
        <Eye cx={60} cy={54} rx={6} ry={7.5} {...eye} />
        <Eye cx={80} cy={52} rx={6.5} ry={8} {...eye} />
        {dry && <path d="M73 40 q7 -3.5 14 0" fill="none" stroke={shade} strokeWidth="2.8" strokeLinecap="round" />}
      </g>
    </>
  );
}
