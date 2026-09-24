"use client";

/**
 * The grid for `graph` answers with plot "points-line", "curve" or "histogram": axes scaled from the table's
 * values and squared like the printed grid, with the small square derived from the data (`plotLattice`), so
 * every target snaps to a small square she can actually tap and nothing is drawn "by eye". She taps to plot
 * each point (tapping a point lifts it again) and, when the part asks for a line of best fit or a straight-line
 * graph, taps twice more to lay the line or types two points on it; for a histogram she taps inside each class
 * interval at the height it should reach. The response is submitted as JSON for src/lib/marking/plot.ts.
 */
import { useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { RotateCcw, Undo2 } from "lucide-react";
import { tap } from "@/lib/ux/haptics";
import type { AnswerSpec } from "@/lib/content/schema";
import {
  formatPlotResponse,
  formatPt,
  needsPlacedLine,
  plotLattice,
  pointsOf,
  samePoint,
  snapTo,
  type HistogramExpect,
  type PlotAxis,
  type PointsExpect,
  type Pt,
} from "@/lib/marking/plot";
import { parseVertices } from "@/lib/marking/transformation";
import { btnCheck, btnQuiet, fieldCls, StickyBar } from "./ui";

type GraphSpec = Extract<AnswerSpec, { kind: "graph" }>;
export type PlotFieldExpect = Extract<GraphSpec["expect"], { plot: "points-line" | "curve" | "histogram" }>;

const PLOT_W = 400;
const PLOT_H = 280;
/** Room for the axis numbers at 14 units: "1000" right-aligned 6 units inside PAD_L, and "100" centred on the axis end, both clear the edges. */
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 14;
const PAD_B = 30;
const W = PAD_L + PLOT_W + PAD_R;
const H = PAD_T + PLOT_H + PAD_B;

const round6 = (v: number): number => Math.round(v * 1e6) / 1e6;
const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000)).replace("-", "−");

/** Catmull-Rom through the points, as cubic Béziers. */
function smoothPath(p: Array<[number, number]>): string {
  if (p.length < 2) return "";
  let d = `M ${p[0]![0]} ${p[0]![1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i]!;
    const p1 = p[i]!;
    const p2 = p[i + 1]!;
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function ticks(a: PlotAxis): number[] {
  const out: number[] = [];
  for (let v = a.lo; v <= a.hi + 1e-9; v = round6(v + a.major)) out.push(round6(v));
  return out;
}
function minorTicks(a: PlotAxis): number[] {
  const out: number[] = [];
  for (let v = a.lo; v <= a.hi + 1e-9; v = round6(v + a.minor)) out.push(round6(v));
  return out;
}

/** Blank, or a list of coordinates: a partly typed list must not leave the last good parse submittable. */
const parsesOrBlank = (text: string): boolean => !text.trim() || parseVertices(text) !== null;

/**
 * What typed line text stands for: no line (blank), one point so far, or two distinct points. Null when it is
 * not one of those (unreadable, more than two points, or the same point twice, which describes no line).
 */
function parseLineText(text: string): Pt[] | null {
  if (!text.trim()) return [];
  const pts = parseVertices(text);
  if (!pts || pts.length > 2) return null;
  if (pts.length === 2 && samePoint(pts[0]!, pts[1]!)) return null;
  return pts;
}

export function PlotField({
  expect,
  disabled,
  onSubmit,
  submitLabel,
  label,
  calcTag,
  barExtra,
}: {
  expect: PlotFieldExpect;
  disabled: boolean;
  onSubmit: (raw: string) => void;
  submitLabel: string;
  label?: string;
  calcTag: ReactNode;
  barExtra?: ReactNode;
  prompt?: string;
}) {
  const histogram = expect.plot === "histogram" ? (expect as HistogramExpect) : null;
  const pointsExpect = expect.plot === "histogram" ? null : (expect as PointsExpect);
  const lineWanted = pointsExpect ? needsPlacedLine(pointsExpect) : false;
  const table = pointsExpect ? pointsOf(pointsExpect) : [];
  const n = pointsExpect ? table.length : histogram!.bars.length;

  const { xa, ya } = useMemo(() => {
    const lattice = plotLattice(histogram ?? pointsExpect!);
    return { xa: lattice.x, ya: lattice.y };
  }, [histogram, pointsExpect]);

  const [placed, setPlaced] = useState<Pt[]>([]);
  const [line, setLine] = useState<Pt[]>([]);
  const [bars, setBars] = useState<(number | null)[]>(() => (histogram ? histogram.bars.map(() => null) : []));
  const [lineMode, setLineMode] = useState(false);
  const [text, setText] = useState("");
  const [lineText, setLineText] = useState("");
  const placedRef = useRef<Pt[]>([]);
  const lineRef = useRef<Pt[]>([]);
  const barsRef = useRef<(number | null)[]>(bars);
  const svgRef = useRef<SVGSVGElement>(null);
  const inputId = useId();
  const lineInputId = useId();
  const hintId = useId();
  const noteId = useId();
  const lineNoteId = useId();

  const sx = (x: number) => PAD_L + ((x - xa.lo) / (xa.hi - xa.lo)) * PLOT_W;
  const sy = (y: number) => PAD_T + ((ya.hi - y) / (ya.hi - ya.lo)) * PLOT_H;

  const setPoints = (next: Pt[]) => {
    placedRef.current = next;
    setPlaced(next);
    setText(next.map(formatPt).join(", "));
  };
  const setLinePts = (next: Pt[]) => {
    lineRef.current = next;
    setLine(next);
    setLineText(next.map(formatPt).join(", "));
  };
  const setBar = (i: number, v: number | null) => {
    const next = barsRef.current.map((b, j) => (j === i ? v : b));
    barsRef.current = next;
    setBars(next);
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ux = ((e.clientX - rect.left) / rect.width) * W;
    const uy = ((e.clientY - rect.top) / rect.height) * H;
    const touchedX = xa.lo + ((ux - PAD_L) / PLOT_W) * (xa.hi - xa.lo);
    const x = snapTo(touchedX, xa.minor);
    const y = snapTo(ya.hi - ((uy - PAD_T) / PLOT_H) * (ya.hi - ya.lo), ya.minor);
    if (x < xa.lo - 1e-9 || x > xa.hi + 1e-9 || y < ya.lo - 1e-9 || y > ya.hi + 1e-9) return;
    e.preventDefault();

    if (histogram) {
      // The bar is the interval the finger touched, not the one the snapped x falls in: a class boundary such as
      // 25 need not sit on the x lattice, so a touch just inside a bar could otherwise snap into its neighbour.
      const inside = Math.min(xa.hi, Math.max(xa.lo, touchedX));
      const i = histogram.bars.findIndex((b) => inside >= b.from - 1e-9 && inside <= b.to + 1e-9);
      if (i < 0) return;
      tap();
      setBar(i, y <= ya.lo + 1e-9 ? null : y);
      return;
    }

    if (lineMode) {
      const current = lineRef.current;
      // A second tap on the first point would describe no line: it is ignored rather than drawn.
      if (current.length === 1 && samePoint(current[0]!, [x, y])) return;
      tap();
      setLinePts(current.length >= 2 ? [[x, y]] : [...current, [x, y]]);
      return;
    }

    const current = placedRef.current;
    const hit = current.findIndex(([px, py]) => Math.abs(px - x) <= xa.minor / 2 + 1e-9 && Math.abs(py - y) <= ya.minor / 2 + 1e-9);
    if (hit >= 0) {
      tap();
      setPoints(current.filter((_, i) => i !== hit));
      return;
    }
    if (current.length >= n) return;
    tap();
    setPoints([...current, [x, y]]);
  };

  const onType = (value: string) => {
    setText(value);
    const parsed = parseVertices(value);
    const next = parsed ?? (value.trim() ? null : []);
    if (next) {
      placedRef.current = next;
      setPlaced(next);
    }
  };

  const onTypeLine = (value: string) => {
    setLineText(value);
    const next = parseLineText(value);
    if (next) {
      lineRef.current = next;
      setLine(next);
    }
  };

  const textOk = parsesOrBlank(text);
  const lineTextOk = parseLineText(lineText) !== null;
  const pointsDone = placed.length === n;
  const lineDone = !lineWanted || line.length === 2;
  const barsDone = !!histogram && bars.every((b) => b !== null);
  // Check waits while a typed list does not parse: what she sees must be what is submitted.
  const complete = histogram ? barsDone : pointsDone && lineDone && textOk && lineTextOk;

  const submit = () => {
    if (disabled || !complete) return;
    if (histogram) onSubmit(formatPlotResponse({ bars }));
    else onSubmit(formatPlotResponse({ points: placed, line: lineWanted ? [line[0]!, line[1]!] : null }));
  };

  const sorted = [...placed].sort((a, b) => a[0] - b[0]);
  const joinWanted = !!pointsExpect && pointsDone && !lineWanted && (pointsExpect.plot === "curve" || pointsExpect.lineRequired === true);
  const joinPath = joinWanted ? (pointsExpect!.plot === "curve" ? smoothPath(sorted.map(([x, y]) => [sx(x), sy(y)])) : `M ${sorted.map(([x, y]) => `${sx(x)} ${sy(y)}`).join(" L ")}`) : "";

  // The placed line, extended across the plot area.
  let lineSeg: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (line.length === 2) {
    const [a, b] = line as [Pt, Pt];
    if (Math.abs(b[0] - a[0]) < 1e-9) lineSeg = { x1: sx(a[0]), y1: sy(ya.lo), x2: sx(a[0]), y2: sy(ya.hi) };
    else {
      const m = (b[1] - a[1]) / (b[0] - a[0]);
      lineSeg = { x1: sx(xa.lo), y1: sy(a[1] + m * (xa.lo - a[0])), x2: sx(xa.hi), y2: sy(a[1] + m * (xa.hi - a[0])) };
    }
  }

  const hint = histogram
    ? `${bars.filter((b) => b !== null).length} of ${n} bars drawn`
    : !textOk
      ? "Coordinates not understood · use (x, y) pairs"
      : !lineTextOk
        ? "Line points not understood · use two different (x, y) pairs"
        : lineWanted
          ? `${placed.length} of ${n} points placed · ${line.length === 2 ? "line drawn" : lineMode ? `tap ${2 - line.length} more for the line` : "then draw the line"}`
          : `${placed.length} of ${n} points placed`;

  const instructions = histogram
    ? `${label ?? "Draw the histogram"}: tap inside each class interval at the height its bar should reach (tap the base line to clear it), or type the heights below.`
    : `${label ?? (pointsExpect!.plot === "curve" ? "Draw the curve" : "Plot the points")}: tap the grid where each of the ${n} points goes (tap a point again to lift it), or type the coordinates below.${lineWanted ? " Then choose Draw the line and tap two places it passes through, or type two points on it below." : pointsExpect!.plot === "curve" ? " The curve is drawn through your points once all of them are placed." : ""}`;

  const pointsExample = table.slice(0, 2).map(formatPt).join(", ");

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p id={hintId} className="text-meta text-ink-2">
        {instructions}
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={`mt-2 w-full max-w-[520px] touch-none select-none rounded-[var(--radius-sm)] border border-line bg-surface ${disabled ? "" : "cursor-crosshair"}`}
        role="img"
        aria-label={
          histogram
            ? `Histogram grid, ${fmt(xa.lo)} to ${fmt(xa.hi)} across and frequency density 0 to ${fmt(ya.hi)} up${bars.some((b) => b !== null) ? `; bars drawn at ${bars.map((b, i) => (b === null ? "" : `${fmt(histogram.bars[i]!.from)}–${fmt(histogram.bars[i]!.to)}: ${fmt(b)}`)).filter(Boolean).join(", ")}` : ""}.`
            : `Grid from ${fmt(xa.lo)} to ${fmt(xa.hi)} across and ${fmt(ya.lo)} to ${fmt(ya.hi)} up${placed.length ? `, with your ${placed.length} plotted ${placed.length === 1 ? "point" : "points"} at ${placed.map(formatPt).join(", ")}` : ""}${line.length === 2 ? ` and your line through ${formatPt(line[0]!)} and ${formatPt(line[1]!)}` : ""}.`
        }
        onPointerDown={onPointerDown}
      >
        {/* small squares */}
        {minorTicks(xa).map((x) => (
          <line key={`mx${x}`} x1={sx(x)} y1={sy(ya.hi)} x2={sx(x)} y2={sy(ya.lo)} stroke="var(--color-line)" strokeWidth={0.6} strokeOpacity={0.6} />
        ))}
        {minorTicks(ya).map((y) => (
          <line key={`my${y}`} x1={sx(xa.lo)} y1={sy(y)} x2={sx(xa.hi)} y2={sy(y)} stroke="var(--color-line)" strokeWidth={0.6} strokeOpacity={0.6} />
        ))}
        {/* labelled squares */}
        {ticks(xa).map((x) => (
          <line key={`gx${x}`} x1={sx(x)} y1={sy(ya.hi)} x2={sx(x)} y2={sy(ya.lo)} stroke={x === 0 || x === xa.lo ? "var(--color-ink-2)" : "var(--color-line)"} strokeWidth={x === 0 || x === xa.lo ? 1.5 : 1} />
        ))}
        {ticks(ya).map((y) => (
          <line key={`gy${y}`} x1={sx(xa.lo)} y1={sy(y)} x2={sx(xa.hi)} y2={sy(y)} stroke={y === 0 || y === ya.lo ? "var(--color-ink-2)" : "var(--color-line)"} strokeWidth={y === 0 || y === ya.lo ? 1.5 : 1} />
        ))}
        {/* axis numbers: 14 units so they stay legible at the phone's 0.6 scale */}
        {ticks(xa).map((x) => (
          <text key={`tx${x}`} x={sx(x)} y={sy(ya.lo) + 16} textAnchor="middle" fontSize={14} fill="var(--color-ink-2)" className="tnum">
            {fmt(x)}
          </text>
        ))}
        {ticks(ya).map((y) => (
          <text key={`ty${y}`} x={sx(xa.lo) - 6} y={sy(y) + 5} textAnchor="end" fontSize={14} fill="var(--color-ink-2)" className="tnum">
            {fmt(y)}
          </text>
        ))}
        {/* histogram bars: unset intervals dashed, drawn bars filled */}
        {histogram &&
          histogram.bars.map((b, i) => {
            const h = bars[i];
            return h === null || h === undefined ? (
              <rect key={`b${i}`} x={sx(b.from)} y={sy(ya.hi)} width={sx(b.to) - sx(b.from)} height={sy(ya.lo) - sy(ya.hi)} fill="var(--color-accent)" fillOpacity={0.04} stroke="var(--color-ink-3)" strokeDasharray="4 4" strokeWidth={1} />
            ) : (
              <rect key={`b${i}`} x={sx(b.from)} y={sy(h)} width={sx(b.to) - sx(b.from)} height={sy(ya.lo) - sy(h)} fill="var(--color-accent)" fillOpacity={0.18} stroke="var(--color-accent)" strokeWidth={2} />
            );
          })}
        {/* the join, once every point is placed */}
        {joinPath && <path d={joinPath} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
        {/* her line: accent, dashed so it reads apart from the solid join */}
        {lineSeg && <line {...lineSeg} stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="8 4" />}
        {line.map(([x, y], i) => (
          <circle key={`l${i}`} cx={sx(x)} cy={sy(y)} r={4} fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth={1.5} />
        ))}
        {/* her points */}
        {placed.map(([x, y], i) => (
          <g key={`p${i}`}>
            <line x1={sx(x) - 5} y1={sy(y) - 5} x2={sx(x) + 5} y2={sy(y) + 5} stroke="var(--color-accent)" strokeWidth={2} />
            <line x1={sx(x) - 5} y1={sy(y) + 5} x2={sx(x) + 5} y2={sy(y) - 5} stroke="var(--color-accent)" strokeWidth={2} />
          </g>
        ))}
      </svg>

      {histogram ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          {histogram.bars.map((b, i) => (
            <label key={`h${i}`} className="w-[104px] shrink-0 text-meta text-ink-2">
              {fmt(b.from)}–{fmt(b.to)}
              <input
                type="number"
                step="any"
                className={`${fieldCls} mt-1 w-full`}
                value={bars[i] ?? ""}
                onChange={(e) => setBar(i, e.target.value === "" ? null : Number(e.target.value))}
                disabled={disabled}
                inputMode="decimal"
                aria-label={`Height of the ${fmt(b.from)} to ${fmt(b.to)} bar`}
                aria-describedby={hintId}
              />
            </label>
          ))}
          <button type="button" className={btnQuiet} onClick={() => { barsRef.current = histogram.bars.map(() => null); setBars(barsRef.current); }} disabled={disabled || bars.every((b) => b === null)} aria-label="Clear the bars">
            <RotateCcw size={18} aria-hidden />
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="min-w-0 flex-1 text-meta text-ink-2" htmlFor={inputId}>
              Plotted points
              <input
                id={inputId}
                className={`${fieldCls} mt-1 w-full`}
                value={text}
                onChange={(e) => onType(e.target.value)}
                disabled={disabled}
                placeholder={`e.g. ${formatPt(table[0]!)}, …`}
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                aria-describedby={textOk ? hintId : `${hintId} ${noteId}`}
                aria-invalid={textOk ? undefined : true}
              />
            </label>
            {lineWanted && (
              <button
                type="button"
                className={btnQuiet}
                onClick={() => setLineMode((m) => !m)}
                aria-pressed={lineMode}
                disabled={disabled || !pointsDone}
              >
                {lineMode ? "Back to points" : "Draw the line"}
              </button>
            )}
            <button
              type="button"
              className={btnQuiet}
              onClick={() => (lineMode ? setLinePts(line.slice(0, -1)) : setPoints(placed.slice(0, -1)))}
              disabled={disabled || (lineMode ? line.length === 0 : placed.length === 0)}
              aria-label={lineMode ? "Lift the last line point" : "Lift the last point"}
            >
              <Undo2 size={18} aria-hidden />
            </button>
            <button
              type="button"
              className={btnQuiet}
              onClick={() => {
                setPoints([]);
                setLinePts([]);
                setLineMode(false);
              }}
              disabled={disabled || (placed.length === 0 && line.length === 0 && !text && !lineText)}
              aria-label="Clear the graph"
            >
              <RotateCcw size={18} aria-hidden />
            </button>
            {!textOk && (
              <p id={noteId} className="basis-full text-meta text-ink-2">
                Use (x, y) pairs, e.g. {pointsExample}
              </p>
            )}
          </div>
          {lineWanted && (
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <label className="min-w-0 flex-1 text-meta text-ink-2" htmlFor={lineInputId}>
                Two points on your line
                <input
                  id={lineInputId}
                  className={`${fieldCls} mt-1 w-full`}
                  value={lineText}
                  onChange={(e) => onTypeLine(e.target.value)}
                  disabled={disabled}
                  placeholder="e.g. (1, 2), (5, 9)"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby={lineTextOk ? hintId : `${hintId} ${lineNoteId}`}
                  aria-invalid={lineTextOk ? undefined : true}
                />
              </label>
              {!lineTextOk && (
                <p id={lineNoteId} className="basis-full text-meta text-ink-2">
                  Use two different (x, y) pairs, e.g. (1, 2), (5, 9)
                </p>
              )}
            </div>
          )}
        </>
      )}

      <StickyBar hint={hint}>
        <button type="submit" className={btnCheck} disabled={disabled || !complete}>
          {submitLabel}
        </button>
        {calcTag}
        {barExtra}
      </StickyBar>
    </form>
  );
}
