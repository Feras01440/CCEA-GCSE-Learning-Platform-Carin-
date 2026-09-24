"use client";

import { motion, useReducedMotion } from "motion/react";

const CX = 120;
const CY = 118;
const R = 86;
const START = 150; // degrees, bottom-left
const SWEEP = 240; // through the top to bottom-right

function point(frac: number, radius: number): [number, number] {
  const deg = START + Math.min(1, Math.max(0, frac)) * SWEEP;
  const rad = (deg * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function arcPath(from: number, to: number, radius: number): string {
  const [x0, y0] = point(from, radius);
  const [x1, y1] = point(to, radius);
  const large = (to - from) * SWEEP > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export interface DialBracket {
  label: string;
  from: number;
  to: number;
}

/**
 * One arc: the unit UMS as a fraction of the unit maximum, with the top-grade band drawn
 * as a thin bracket over the end of the scale. Numbers are tabular; the caption below the
 * dial (rendered by the parent) carries the meaning in words, so colour is never the signal.
 */
export function UmsDial({
  ums,
  umsMax,
  grade,
  bracket,
  estimated,
  label,
}: {
  ums: number;
  umsMax: number;
  grade: string;
  bracket: DialBracket | null;
  estimated: boolean;
  label: string;
}) {
  const reduce = useReducedMotion();
  const frac = umsMax > 0 ? Math.min(1, Math.max(0, ums / umsMax)) : 0;
  const bracketFrom = bracket ? Math.min(1, Math.max(0, bracket.from / umsMax)) : null;
  const bracketMid = bracketFrom !== null ? (bracketFrom + 1) / 2 : null;
  const [lx, ly] = bracketMid !== null ? point(bracketMid, R + 30) : [0, 0];
  const tickA = bracketFrom !== null ? [point(bracketFrom, R + 9), point(bracketFrom, R + 19)] : null;
  const tickB = bracketFrom !== null ? [point(1, R + 9), point(1, R + 19)] : null;

  return (
    <svg viewBox="0 0 240 190" role="img" aria-label={label} className="mx-auto block w-full max-w-[320px]">
      <path d={arcPath(0, 1, R)} fill="none" stroke="var(--line-2)" strokeWidth={10} strokeLinecap="round" />
      <motion.path
        d={arcPath(0, 1, R)}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={10}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: frac }}
        transition={{ duration: reduce ? 0 : 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ opacity: frac === 0 ? 0 : 1 }}
      />
      {/* The grade she earned leads (the platform audit: the result used to lead with the band she was short of):
          the grade at the centre in the largest type and first in reading order, what it is worth under it, and
          the band she is working towards after it, small, on the arc. */}
      <text x={CX} y={CY - 34} textAnchor="middle" fill="var(--ink-2)" style={{ fontSize: 13, fontWeight: 500 }}>
        unit grade
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fill="var(--ink)" className="tnum" style={{ fontSize: 48, fontWeight: 600, letterSpacing: "-0.02em" }}>
        {grade}
      </text>
      <text x={CX} y={CY + 34} textAnchor="middle" fill="var(--ink-2)" className="tnum" style={{ fontSize: 13 }}>
        {ums} of {umsMax} UMS{estimated ? " · est." : ""}
      </text>
      {bracketFrom !== null && tickA && tickB && (
        <g stroke="var(--ink-3)" strokeWidth={2} fill="none" strokeLinecap="round">
          <path d={arcPath(bracketFrom, 1, R + 14)} />
          <line x1={tickA[0][0]} y1={tickA[0][1]} x2={tickA[1][0]} y2={tickA[1][1]} />
          <line x1={tickB[0][0]} y1={tickB[0][1]} x2={tickB[1][0]} y2={tickB[1][1]} />
          <text
            // Kept inside the 240-unit box: at the top of the scale the label would otherwise be cut off at the edge.
            x={Math.max(18, Math.min(240 - 18, lx))}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            stroke="none"
            fill="var(--ink-2)"
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            {bracket?.label}
          </text>
        </g>
      )}
      <text x={point(0, R)[0]} y={point(0, R)[1] + 18} textAnchor="middle" fill="var(--ink-3)" className="tnum" style={{ fontSize: 12 }}>
        0
      </text>
      <text x={point(1, R)[0]} y={point(1, R)[1] + 18} textAnchor="middle" fill="var(--ink-3)" className="tnum" style={{ fontSize: 12 }}>
        {umsMax}
      </text>
    </svg>
  );
}
