"use client";

/**
 * The close scene: Rowan on the hill by the cairn, under the evening sky (docs/design/2026-09-23-art-direction-v2.md
 * §3.1's craft floor and §8.1's close card: "the sky is warmer, not darker").
 *
 * A port of the canvas generator's `hillScene()` (scratchpad/mockups-v2/art.mjs) with the hare nested on the hill
 * (`onHill`) and the redrawn cairn, element for element and in the same paint order:
 * - "wide", the phone's scene: a 342 by 200 viewBox shown in a box of the canvas's 342:230 proportion at the width
 *   of its column, sliced from the bottom middle, rounded 12; the hare at (16, 20) and 156 units; the cairn at
 *   (214, 50) and 0.85. At the canvas's 342 px the hare renders at 179 px; in a 310 px card, 163.
 * - "tall", the desktop's full-height panel: a 400 by 640 viewBox filling its parent, sliced from the bottom middle;
 *   the cairn at (150, 350) and 1.55, then the hare at (-16, 268) and 250 units (325 px in a 520 by 800 panel).
 *
 * The scene is always the evening one, as both close boards draw it: a fixed picture, never a reading of the clock.
 * When a stone was placed the hare holds the heather stone up and the cairn keeps its four stones, so the scene never
 * shows two heather stones. Decorative: aria-hidden, no text.
 */

import { clsx } from "clsx";
import type { FigureExpression, FigureState } from "@/lib/companion/figure";
import { CairnGroup } from "./CairnArt";
import { RowanFigure } from "./RowanFigure";
import { C } from "./rowan-palette";
import { useSvgId } from "./svg-id";

export type SceneVariant = "wide" | "tall";

export interface RowanSceneProps {
  variant?: SceneVariant;
  /** The hare's state on the hill: the wave ("arrival") or the heather stone held up ("stone-placed"). */
  state?: FigureState;
  expression?: FigureExpression;
  /** The heather stone on the cairn. Off in the close card, where the hare holds it (see above). */
  placed?: boolean;
  /** The evening sky and moon, as drawn; false gives the day sky (and the sun on the wide scene). */
  evening?: boolean;
  /** The hare's one arrival movement. */
  arrive?: boolean;
  className?: string;
}

/** A gorse bush: a dark rounded clump with a lit side and flowers (art.mjs gorseBush). */
function GorseBush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-16 6 C-18 -4 -8 -12 2 -10 C12 -12 20 -4 18 4 C22 8 16 12 4 12 C-8 13 -16 12 -16 6 Z" fill={C.hillDark} />
      <path d="M-12 2 C-10 -6 -2 -9 4 -8 C8 -8 12 -6 13 -2 C6 -4 -4 -3 -12 2 Z" fill={C.hill} opacity="0.7" />
      <circle cx="-6" cy="-1" r="2.6" fill={C.gorse} />
      <circle cx="4" cy="-5" r="2.4" fill={C.gorse} />
      <circle cx="11" cy="2" r="2.2" fill={C.gorseDeep} />
      <circle cx="0" cy="5" r="2" fill={C.gorseDeep} />
    </g>
  );
}

/** A hill: an ellipse with a lit band on its upper left and a darker foot, clipped to itself (art.mjs hillShape). */
function HillShape({ id, cx, cy, rx, ry, base, light, dark }: { id: string; cx: number; cy: number; rx: number; ry: number; base: string; light: string; dark: string }) {
  return (
    <g>
      <clipPath id={id}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={base} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={cx - rx * 0.28} cy={cy - ry * 0.12} rx={rx * 0.78} ry={ry * 0.8} fill={light} opacity="0.75" />
        <ellipse cx={cx + rx * 0.35} cy={cy + ry * 0.35} rx={rx * 0.75} ry={ry * 0.7} fill={dark} opacity="0.45" />
      </g>
    </g>
  );
}

export function RowanScene({ variant = "wide", state = "arrival", expression = "attentive", placed = false, evening = true, arrive = true, className }: RowanSceneProps) {
  const k = useSvgId("rowan-hill-");
  const sky = evening ? C.eveSky : C.sky;
  const haze = evening ? C.eveHaze : C.skyDeep;

  if (variant === "tall") {
    return (
      <div className={clsx("relative h-full w-full overflow-hidden", className)} style={{ backgroundColor: sky }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 640"
          aria-hidden="true"
          focusable="false"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0"
        >
          <rect x="0" y="0" width="400" height="640" fill={sky} />
          <rect x="0" y="430" width="400" height="80" fill={haze} />
          {evening && <path d="M318 96 a18 18 0 1 0 14 27 a13.5 13.5 0 1 1 -14 -27z" fill={C.moon} />}
          <ellipse cx="300" cy="620" rx="300" ry="140" fill={C.hillFar} />
          <HillShape id={`${k}a`} cx={40} cy={700} rx={320} ry={210} base={C.hill} light={C.hillLight} dark={C.hillDark} />
          <HillShape id={`${k}b`} cx={400} cy={740} rx={320} ry={240} base={C.hillDark} light={C.hill} dark={C.hillDark} />
          <HillShape id={`${k}c`} cx={150} cy={760} rx={300} ry={200} base={C.hill} light={C.hillLight} dark={C.hillDark} />
          <GorseBush x={88} y={566} s={1.2} />
          <GorseBush x={338} y={602} s={1} />
          <GorseBush x={250} y={630} s={0.8} />
          <CairnGroup x={150} y={350} scale={1.55} placed={placed} grass />
          <RowanFigure nested={{ x: -16, y: 268, size: 250 }} state={state} expression={expression} arrive={arrive} />
        </svg>
      </div>
    );
  }

  return (
    <div className={clsx("relative aspect-[342/230] w-full overflow-hidden rounded-[var(--radius)]", className)} style={{ backgroundColor: sky }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 342 200"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0"
      >
        <rect x="0" y="0" width="342" height="200" fill={sky} />
        <rect x="0" y="100" width="342" height="40" fill={haze} />
        {evening ? (
          <path d="M290 40 a14 14 0 1 0 11 21 a10.5 10.5 0 1 1 -11 -21z" fill={C.moon} />
        ) : (
          <circle cx="292" cy="44" r="14" fill={C.gorse} />
        )}
        <ellipse cx="250" cy="196" rx="230" ry="80" fill={C.hillFar} />
        <HillShape id={`${k}a`} cx={60} cy={232} rx={240} ry={112} base={C.hill} light={C.hillLight} dark={C.hillDark} />
        <HillShape id={`${k}b`} cx={300} cy={250} rx={230} ry={122} base={C.hillDark} light={C.hill} dark={C.hillDark} />
        <HillShape id={`${k}c`} cx={120} cy={258} rx={210} ry={92} base={C.hill} light={C.hillLight} dark={C.hillDark} />
        <GorseBush x={52} y={158} s={0.9} />
        <GorseBush x={302} y={174} s={0.75} />
        <RowanFigure nested={{ x: 16, y: 20, size: 156 }} state={state} expression={expression} arrive={arrive} />
        <CairnGroup x={214} y={50} scale={0.85} placed={placed} grass />
      </svg>
    </div>
  );
}
