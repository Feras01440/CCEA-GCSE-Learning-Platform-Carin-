"use client";

/**
 * The grid for `graph` answers with plot "transformation". The object is drawn on squared paper with the mirror
 * line or centre the stem names; she taps the grid points where the image's vertices go (tapping a placed vertex
 * lifts it again), or types the coordinates, and the vertex list is submitted as text for marking. Every target
 * is a whole grid point, so nothing is drawn "by eye".
 */
import { useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { RotateCcw, Undo2 } from "lucide-react";
import { tap } from "@/lib/ux/haptics";
import type { AnswerSpec } from "@/lib/content/schema";
import { formatVertices, parseVertices, type Vertex } from "@/lib/marking/transformation";
import { guidesFromStem } from "./grid-guides";
import { btnCheck, btnQuiet, fieldCls, StickyBar } from "./ui";

type GraphSpec = Extract<AnswerSpec, { kind: "graph" }>;
export type TransformationExpect = Extract<GraphSpec["expect"], { plot: "transformation" }>;

/** Grid square in viewBox units; the SVG scales to its container, so this only sets proportions. */
const CELL = 24;
/** Room for the axis numbers at 13 units: "−10" right-aligned 6 units inside the pad still clears the edge. */
const PAD = 30;

interface Range {
  xlo: number;
  xhi: number;
  ylo: number;
  yhi: number;
}

/** At least −8…8 each way (the printed grids), stretched with a square to spare when a shape goes beyond. */
function rangeFor(vertices: readonly Vertex[]): Range {
  const xs = vertices.map((v) => v[0]);
  const ys = vertices.map((v) => v[1]);
  const lo = (min: number) => (min < -8 ? Math.floor(min) - 1 : -8);
  const hi = (max: number) => (max > 8 ? Math.ceil(max) + 1 : 8);
  return { xlo: lo(Math.min(...xs)), xhi: hi(Math.max(...xs)), ylo: lo(Math.min(...ys)), yhi: hi(Math.max(...ys)) };
}

const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)).replace("-", "−");

export function TransformationField({
  expect,
  disabled,
  onSubmit,
  submitLabel,
  label,
  calcTag,
  barExtra,
  prompt,
}: {
  expect: TransformationExpect;
  disabled: boolean;
  onSubmit: (raw: string) => void;
  submitLabel: string;
  label?: string;
  calcTag: ReactNode;
  barExtra?: ReactNode;
  prompt?: string;
}) {
  const n = expect.object.length;
  const range = useMemo(() => rangeFor([...expect.object, ...expect.image]), [expect]);
  const guides = useMemo(() => guidesFromStem(prompt), [prompt]);
  const [placed, setPlaced] = useState<Vertex[]>([]);
  const [text, setText] = useState("");
  // The latest vertices, readable inside a pointer handler even when two taps land in the same tick.
  const placedRef = useRef<Vertex[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const inputId = useId();
  const hintId = useId();
  const noteId = useId();
  // Two grids on one page must not share a clip id, or the second's guides clip to the first's rectangle.
  const clipId = `clip-${useId().replace(/\W/g, "")}`;

  const W = (range.xhi - range.xlo) * CELL + 2 * PAD;
  const H = (range.yhi - range.ylo) * CELL + 2 * PAD;
  const sx = (x: number) => PAD + (x - range.xlo) * CELL;
  const sy = (y: number) => PAD + (range.yhi - y) * CELL;
  const labelStep = Math.max(range.xhi - range.xlo, range.yhi - range.ylo) > 20 ? 2 : 1;

  const update = (next: Vertex[]) => {
    placedRef.current = next;
    setPlaced(next);
    setText(formatVertices(next));
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ux = ((e.clientX - rect.left) / rect.width) * W;
    const uy = ((e.clientY - rect.top) / rect.height) * H;
    const gx = Math.round((ux - PAD) / CELL + range.xlo);
    const gy = Math.round(range.yhi - (uy - PAD) / CELL);
    if (gx < range.xlo || gx > range.xhi || gy < range.ylo || gy > range.yhi) return;
    e.preventDefault();
    const current = placedRef.current;
    const hit = current.findIndex(([x, y]) => x === gx && y === gy);
    if (hit >= 0) {
      tap();
      update(current.filter((_, i) => i !== hit));
      return;
    }
    if (current.length >= n) return;
    tap();
    update([...current, [gx, gy]]);
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

  const complete = placed.length === n;
  // Check waits while the typed list does not parse: what she sees must be what is submitted.
  const textOk = !text.trim() || parseVertices(text) !== null;
  const canCheck = complete && textOk;
  const submit = () => {
    if (!disabled && canCheck) onSubmit(formatVertices(placed));
  };

  const ticks: number[] = [];
  for (let x = range.xlo; x <= range.xhi; x++) ticks.push(x);
  const yTicks: number[] = [];
  for (let y = range.ylo; y <= range.yhi; y++) yTicks.push(y);

  const objectPoints = expect.object.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ");
  const placedPoints = placed.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ");

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p id={hintId} className="text-meta text-ink-2">
        {label ?? "Draw the image"}: tap the grid point for each of its {n} vertices (tap a vertex again to lift it), or type the coordinates below.
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={`mt-2 w-full max-w-[460px] touch-none select-none rounded-[var(--radius-sm)] border border-line bg-surface ${disabled ? "" : "cursor-crosshair"}`}
        role="img"
        aria-label={`Squared grid from ${fmt(range.xlo)} to ${fmt(range.xhi)} across and ${fmt(range.ylo)} to ${fmt(range.yhi)} up, showing the object at ${formatVertices(expect.object)}${placed.length ? ` and your ${placed.length} placed ${placed.length === 1 ? "vertex" : "vertices"} at ${formatVertices(placed)}` : ""}.`}
        onPointerDown={onPointerDown}
      >
        {/* grid */}
        {ticks.map((x) => (
          <line key={`gx${x}`} x1={sx(x)} y1={sy(range.yhi)} x2={sx(x)} y2={sy(range.ylo)} stroke={x === 0 ? "var(--color-ink-2)" : "var(--color-line)"} strokeWidth={x === 0 ? 1.5 : 1} />
        ))}
        {yTicks.map((y) => (
          <line key={`gy${y}`} x1={sx(range.xlo)} y1={sy(y)} x2={sx(range.xhi)} y2={sy(y)} stroke={y === 0 ? "var(--color-ink-2)" : "var(--color-line)"} strokeWidth={y === 0 ? 1.5 : 1} />
        ))}
        {/* axis numbers: 13 units so they stay legible at the phone's 0.6 scale */}
        {ticks
          .filter((x) => x % labelStep === 0)
          .map((x) => (
            <text key={`tx${x}`} x={sx(x)} y={sy(range.ylo) + 16} textAnchor="middle" fontSize={13} fill="var(--color-ink-2)" className="tnum">
              {fmt(x)}
            </text>
          ))}
        {yTicks
          .filter((y) => y % labelStep === 0)
          .map((y) => (
            <text key={`ty${y}`} x={sx(range.xlo) - 6} y={sy(y) + 4.5} textAnchor="end" fontSize={13} fill="var(--color-ink-2)" className="tnum">
              {fmt(y)}
            </text>
          ))}
        <text x={sx(range.xhi) + 4} y={sy(0) + 3.5} fontSize={11} fill="var(--color-ink-2)" fontStyle="italic">
          x
        </text>
        <text x={sx(0) - 4} y={sy(range.yhi) - 6} fontSize={11} fill="var(--color-ink-2)" fontStyle="italic" textAnchor="end">
          y
        </text>
        {/* guides from the stem, in ink like the printed paper: the mirror line dashed, the centre a small cross */}
        {guides.map((g, i) => {
          if (g.kind === "point") {
            const cx = sx(g.x);
            const cy = sy(g.y);
            return (
              <g key={`g${i}`} aria-hidden>
                <line x1={cx - 6} y1={cy - 6} x2={cx + 6} y2={cy + 6} stroke="var(--color-ink)" strokeWidth={2} />
                <line x1={cx - 6} y1={cy + 6} x2={cx + 6} y2={cy - 6} stroke="var(--color-ink)" strokeWidth={2} />
              </g>
            );
          }
          // ax + by = c across the whole grid.
          let x1: number;
          let y1: number;
          let x2: number;
          let y2: number;
          if (g.b === 0) {
            x1 = x2 = g.c / g.a;
            y1 = range.ylo;
            y2 = range.yhi;
          } else {
            x1 = range.xlo;
            x2 = range.xhi;
            y1 = (g.c - g.a * x1) / g.b;
            y2 = (g.c - g.a * x2) / g.b;
          }
          return (
            <g key={`g${i}`} aria-hidden clipPath={`url(#${clipId})`}>
              <line x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke="var(--color-ink)" strokeWidth={1.5} strokeDasharray="6 5" />
            </g>
          );
        })}
        <clipPath id={clipId}>
          <rect x={sx(range.xlo)} y={sy(range.yhi)} width={(range.xhi - range.xlo) * CELL} height={(range.yhi - range.ylo) * CELL} />
        </clipPath>
        {/* the object */}
        <polygon points={objectPoints} fill="var(--color-ink-3)" fillOpacity={0.18} stroke="var(--color-ink-2)" strokeWidth={1.5} strokeLinejoin="round" />
        {/* her image */}
        {placed.length >= 2 &&
          (complete ? (
            <polygon points={placedPoints} fill="var(--color-accent)" fillOpacity={0.12} stroke="var(--color-accent)" strokeWidth={2} strokeLinejoin="round" />
          ) : (
            <polyline points={placedPoints} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinejoin="round" />
          ))}
        {placed.map(([x, y], i) => (
          <circle key={`p${i}`} cx={sx(x)} cy={sy(y)} r={6} fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth={2} />
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 text-meta text-ink-2" htmlFor={inputId}>
          Vertices of the image
          <input
            id={inputId}
            className={`${fieldCls} mt-1 w-full`}
            value={text}
            onChange={(e) => onType(e.target.value)}
            disabled={disabled}
            placeholder={`e.g. ${formatVertices(expect.object)}`}
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            aria-describedby={textOk ? hintId : `${hintId} ${noteId}`}
            aria-invalid={textOk ? undefined : true}
          />
        </label>
        <button type="button" className={btnQuiet} onClick={() => update(placed.slice(0, -1))} disabled={disabled || placed.length === 0} aria-label="Lift the last vertex">
          <Undo2 size={18} aria-hidden />
        </button>
        <button type="button" className={btnQuiet} onClick={() => update([])} disabled={disabled || (placed.length === 0 && !text)} aria-label="Clear the image">
          <RotateCcw size={18} aria-hidden />
        </button>
        {!textOk && (
          <p id={noteId} className="basis-full text-meta text-ink-2">
            Use (x, y) pairs, e.g. (1, 2), (3, 4)
          </p>
        )}
      </div>

      <StickyBar hint={textOk ? `${placed.length} of ${n} vertices placed` : "Coordinates not understood · use (x, y) pairs"}>
        <button type="submit" className={btnCheck} disabled={disabled || !canCheck}>
          {submitLabel}
        </button>
        {calcTag}
        {barExtra}
      </StickyBar>
    </form>
  );
}
