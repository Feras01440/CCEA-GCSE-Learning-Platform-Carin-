"use client";

/**
 * The grid for `graph` answers with plot "region": the boundary lines of the inequalities are drawn on squared
 * paper (dashed when the inequality is strict) and she taps one point inside the region she would shade. The tap
 * fixes a side of every boundary at once; the field shades that region so she can see her choice before Check.
 * The tapped point is submitted as JSON for src/lib/marking/region.ts.
 */
import { useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { tap } from "@/lib/ux/haptics";
import type { AnswerSpec } from "@/lib/content/schema";
import { boundaryEquation, boundaryValue, formatRegionResponse, parseInequality, type Inequality, type Pt } from "@/lib/marking/region";
import { btnCheck, btnQuiet, StickyBar } from "./ui";

type GraphSpec = Extract<AnswerSpec, { kind: "graph" }>;
export type RegionFieldExpect = Extract<GraphSpec["expect"], { plot: "region" }>;

const CELL = 24;
const PAD = 26;

interface Range {
  xlo: number;
  xhi: number;
  ylo: number;
  yhi: number;
}

/** A square grid that shows the origin, every axis intercept and every crossing of two boundaries, with a square to spare. */
function rangeFor(qs: Inequality[]): Range {
  const xs = [0];
  const ys = [0];
  for (const q of qs) {
    if (q.a !== 0) xs.push(q.c / q.a);
    if (q.b !== 0) ys.push(q.c / q.b);
  }
  for (let i = 0; i < qs.length; i++) {
    for (let j = i + 1; j < qs.length; j++) {
      const p = qs[i]!;
      const r = qs[j]!;
      const det = p.a * r.b - r.a * p.b;
      if (Math.abs(det) < 1e-9) continue;
      xs.push((p.c * r.b - r.c * p.b) / det);
      ys.push((p.a * r.c - r.a * p.c) / det);
    }
  }
  const clampLo = (v: number) => Math.max(-10, Math.min(0, Math.floor(v) - 1));
  const clampHi = (v: number) => Math.min(12, Math.max(6, Math.ceil(v) + 1));
  return { xlo: clampLo(Math.min(...xs)), xhi: clampHi(Math.max(...xs)), ylo: clampLo(Math.min(...ys)), yhi: clampHi(Math.max(...ys)) };
}

/** Sutherland–Hodgman: the part of `poly` where sign · (a·x + b·y − c) ≥ 0. */
function clipHalfPlane(poly: Pt[], q: Inequality, sign: number): Pt[] {
  const inside = (p: Pt) => sign * boundaryValue(q, p) >= -1e-9;
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i]!;
    const prev = poly[(i + poly.length - 1) % poly.length]!;
    const curIn = inside(cur);
    const prevIn = inside(prev);
    if (curIn !== prevIn) {
      const vp = boundaryValue(q, prev);
      const vc = boundaryValue(q, cur);
      const t = vp / (vp - vc);
      out.push([prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])]);
    }
    if (curIn) out.push(cur);
  }
  return out;
}

const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)).replace("-", "−");

export function RegionField({
  expect,
  disabled,
  onSubmit,
  submitLabel,
  label,
  calcTag,
  barExtra,
}: {
  expect: RegionFieldExpect;
  disabled: boolean;
  onSubmit: (raw: string) => void;
  submitLabel: string;
  label?: string;
  calcTag: ReactNode;
  barExtra?: ReactNode;
  prompt?: string;
}) {
  const qs = useMemo(() => expect.inequalities.map((s) => parseInequality(s)).filter((q): q is Inequality => q !== null), [expect]);
  const range = useMemo(() => rangeFor(qs), [qs]);
  const [point, setPoint] = useState<Pt | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hintId = useId();

  const W = (range.xhi - range.xlo) * CELL + 2 * PAD;
  const H = (range.yhi - range.ylo) * CELL + 2 * PAD;
  const sx = (x: number) => PAD + (x - range.xlo) * CELL;
  const sy = (y: number) => PAD + (range.yhi - y) * CELL;

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ux = ((e.clientX - rect.left) / rect.width) * W;
    const uy = ((e.clientY - rect.top) / rect.height) * H;
    const x = Math.round(((ux - PAD) / CELL + range.xlo) * 100) / 100;
    const y = Math.round((range.yhi - (uy - PAD) / CELL) * 100) / 100;
    if (x < range.xlo || x > range.xhi || y < range.ylo || y > range.yhi) return;
    e.preventDefault();
    tap();
    setPoint([x, y]);
  };

  // Her region: the grid rectangle clipped to the side of every boundary her point is on.
  const region = useMemo(() => {
    if (!point) return null;
    let poly: Pt[] = [
      [range.xlo, range.ylo],
      [range.xhi, range.ylo],
      [range.xhi, range.yhi],
      [range.xlo, range.yhi],
    ];
    for (const q of qs) {
      const v = boundaryValue(q, point);
      if (Math.abs(v) <= 1e-9) return null;
      poly = clipHalfPlane(poly, q, Math.sign(v));
      if (poly.length < 3) return null;
    }
    return poly;
  }, [point, qs, range]);

  const ticks: number[] = [];
  for (let x = range.xlo; x <= range.xhi; x++) ticks.push(x);
  const yTicks: number[] = [];
  for (let y = range.ylo; y <= range.yhi; y++) yTicks.push(y);
  const labelStep = Math.max(range.xhi - range.xlo, range.yhi - range.ylo) > 20 ? 2 : 1;

  /** Where the line a·x + b·y = c crosses the grid, as two viewBox points. */
  const segment = (q: Inequality): { x1: number; y1: number; x2: number; y2: number } => {
    if (q.b === 0) return { x1: sx(q.c / q.a), y1: sy(range.ylo), x2: sx(q.c / q.a), y2: sy(range.yhi) };
    const yAt = (x: number) => (q.c - q.a * x) / q.b;
    return { x1: sx(range.xlo), y1: sy(yAt(range.xlo)), x2: sx(range.xhi), y2: sy(yAt(range.xhi)) };
  };

  const submit = () => {
    if (!disabled && point && region) onSubmit(formatRegionResponse(point));
  };

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p id={hintId} className="text-meta text-ink-2">
        {label ?? "Shade the region"}: the boundary lines are drawn (dashed where the inequality is strict). Tap one point inside the region you would shade; it colours in so you can check it before you press {submitLabel}.
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={`mt-2 w-full max-w-[460px] touch-none select-none rounded-[var(--radius-sm)] border border-line bg-surface ${disabled ? "" : "cursor-crosshair"}`}
        role="img"
        aria-label={`Squared grid from ${fmt(range.xlo)} to ${fmt(range.xhi)} across and ${fmt(range.ylo)} to ${fmt(range.yhi)} up, with the boundary lines ${qs.map(boundaryEquation).join("; ")}${point ? `, and your chosen point at (${fmt(point[0])}, ${fmt(point[1])})` : ""}.`}
        aria-describedby={hintId}
        onPointerDown={onPointerDown}
      >
        {ticks.map((x) => (
          <line key={`gx${x}`} x1={sx(x)} y1={sy(range.yhi)} x2={sx(x)} y2={sy(range.ylo)} stroke={x === 0 ? "var(--color-ink-2)" : "var(--color-line)"} strokeWidth={x === 0 ? 1.5 : 1} />
        ))}
        {yTicks.map((y) => (
          <line key={`gy${y}`} x1={sx(range.xlo)} y1={sy(y)} x2={sx(range.xhi)} y2={sy(y)} stroke={y === 0 ? "var(--color-ink-2)" : "var(--color-line)"} strokeWidth={y === 0 ? 1.5 : 1} />
        ))}
        {ticks
          .filter((x) => x % labelStep === 0)
          .map((x) => (
            <text key={`tx${x}`} x={sx(x)} y={sy(range.ylo) + 15} textAnchor="middle" fontSize={10} fill="var(--color-ink-3)" className="tnum">
              {fmt(x)}
            </text>
          ))}
        {yTicks
          .filter((y) => y % labelStep === 0)
          .map((y) => (
            <text key={`ty${y}`} x={sx(range.xlo) - 6} y={sy(y) + 3.5} textAnchor="end" fontSize={10} fill="var(--color-ink-3)" className="tnum">
              {fmt(y)}
            </text>
          ))}
        <clipPath id="region-area">
          <rect x={sx(range.xlo)} y={sy(range.yhi)} width={(range.xhi - range.xlo) * CELL} height={(range.yhi - range.ylo) * CELL} />
        </clipPath>
        {/* her region */}
        {region && <polygon points={region.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")} fill="var(--color-accent)" fillOpacity={0.16} stroke="none" clipPath="url(#region-area)" />}
        {/* the boundaries */}
        {qs.map((q, i) => {
          const s = segment(q);
          const strict = q.op === "<" || q.op === ">";
          return <line key={`b${i}`} {...s} stroke="var(--color-ink-2)" strokeWidth={1.8} strokeDasharray={strict ? "7 5" : undefined} clipPath="url(#region-area)" />;
        })}
        {/* her point */}
        {point && <circle cx={sx(point[0])} cy={sy(point[1])} r={6} fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth={2} />}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-meta text-ink-2">
        <span>
          {qs.length === 1 ? "Boundary: " : "Boundaries: "}
          {qs.map(boundaryEquation).join("; ")}
        </span>
        <button type="button" className={btnQuiet} onClick={() => setPoint(null)} disabled={disabled || !point} aria-label="Clear the region">
          <RotateCcw size={18} aria-hidden />
        </button>
      </div>

      <StickyBar hint={point ? (region ? "Region chosen" : "That point is on a line; tap clearly inside the region") : "Tap inside the region you would shade"}>
        <button type="submit" className={btnCheck} disabled={disabled || !point || !region}>
          {submitLabel}
        </button>
        {calcTag}
        {barExtra}
      </StickyBar>
    </form>
  );
}
