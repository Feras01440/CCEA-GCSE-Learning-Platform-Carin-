"use client";

/**
 * The scale for `graph` answers with plot "box": a number line scaled from the five values, squared like the
 * printed one (five small squares to a labelled step), and every tap snaps to a small square. She sets the
 * five values in order (minimum, lower quartile, median, upper quartile, maximum) by tapping the scale or
 * typing them; the box and whiskers draw live. The response is submitted as JSON for src/lib/marking/plot.ts.
 */
import { useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { RotateCcw, Undo2 } from "lucide-react";
import { tap } from "@/lib/ux/haptics";
import type { AnswerSpec } from "@/lib/content/schema";
import { BOX_KEYS, BOX_LABELS, formatPlotResponse, type BoxExpect } from "@/lib/marking/plot";
import { btnCheck, btnQuiet, fieldCls, StickyBar } from "./ui";

type GraphSpec = Extract<AnswerSpec, { kind: "graph" }>;
export type BoxFieldExpect = Extract<GraphSpec["expect"], { plot: "box" }>;

const PAD_L = 24;
const PAD_R = 24;
const SCALE_W = 412;
const W = PAD_L + SCALE_W + PAD_R;
const H = 150;
const AXIS_Y = 118;
const MID_Y = 62;
const BOX_H = 52;

const round6 = (v: number): number => Math.round(v * 1e6) / 1e6;
const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000)).replace("-", "−");

function niceStep(span: number, target: number): number {
  if (span <= 0) return 1;
  const rough = span / target;
  const pow = 10 ** Math.floor(Math.log10(rough));
  for (const m of [1, 2, 5, 10]) if (m * pow >= rough - 1e-12) return m * pow;
  return 10 * pow;
}

/** A labelled step that gives the five values room, with a small square below the minimum and above the maximum. */
function scaleFor(expect: BoxExpect): { lo: number; hi: number; major: number; minor: number } {
  const major = niceStep(expect.max - expect.min || 1, 8);
  let lo = Math.floor(expect.min / major + 1e-9) * major;
  let hi = Math.ceil(expect.max / major - 1e-9) * major;
  if (expect.min - lo < major * 0.2) lo -= major;
  if (hi - expect.max < major * 0.2) hi += major;
  if (lo < 0 && expect.min >= 0) lo = 0;
  return { lo, hi, major, minor: major / 5 };
}

export function BoxPlotField({
  expect,
  disabled,
  onSubmit,
  submitLabel,
  label,
  calcTag,
  barExtra,
}: {
  expect: BoxFieldExpect;
  disabled: boolean;
  onSubmit: (raw: string) => void;
  submitLabel: string;
  label?: string;
  calcTag: ReactNode;
  barExtra?: ReactNode;
  prompt?: string;
}) {
  const scale = useMemo(() => scaleFor(expect), [expect]);
  const [values, setValues] = useState<(number | null)[]>([null, null, null, null, null]);
  const valuesRef = useRef<(number | null)[]>(values);
  const svgRef = useRef<SVGSVGElement>(null);
  const hintId = useId();

  const sx = (x: number) => PAD_L + ((x - scale.lo) / (scale.hi - scale.lo)) * SCALE_W;

  const update = (next: (number | null)[]) => {
    valuesRef.current = next;
    setValues(next);
  };
  const setAt = (i: number, v: number | null) => update(valuesRef.current.map((x, j) => (j === i ? v : x)));

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ux = ((e.clientX - rect.left) / rect.width) * W;
    const x = round6(Math.round((scale.lo + ((ux - PAD_L) / SCALE_W) * (scale.hi - scale.lo)) / scale.minor) * scale.minor);
    if (x < scale.lo - 1e-9 || x > scale.hi + 1e-9) return;
    e.preventDefault();
    const current = valuesRef.current;
    const hit = current.findIndex((v) => v !== null && Math.abs(v - x) <= scale.minor / 2 + 1e-9);
    if (hit >= 0) {
      tap();
      setAt(hit, null);
      return;
    }
    const slot = current.findIndex((v) => v === null);
    if (slot < 0) return;
    tap();
    setAt(slot, x);
  };

  const placedCount = values.filter((v) => v !== null).length;
  const complete = placedCount === BOX_KEYS.length;
  const nextKey = BOX_KEYS[values.findIndex((v) => v === null)];
  const [min, q1, median, q3, max] = values;

  const submit = () => {
    if (!disabled && complete) onSubmit(formatPlotResponse({ box: values }));
  };

  const majors: number[] = [];
  for (let v = scale.lo; v <= scale.hi + 1e-9; v = round6(v + scale.major)) majors.push(round6(v));
  const minors: number[] = [];
  for (let v = scale.lo; v <= scale.hi + 1e-9; v = round6(v + scale.minor)) minors.push(round6(v));

  const summary = BOX_KEYS.map((k, i) => (values[i] === null ? null : `${BOX_LABELS[k]} ${fmt(values[i]!)}`)).filter(Boolean).join(", ");

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p id={hintId} className="text-meta text-ink-2">
        {label ?? "Draw the box plot"}: tap the scale for the minimum, then the lower quartile, the median, the upper quartile and the maximum (tap a value again to lift it), or type the five values below.
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={`mt-2 w-full max-w-[520px] touch-none select-none rounded-[var(--radius-sm)] border border-line bg-surface ${disabled ? "" : "cursor-crosshair"}`}
        role="img"
        aria-label={`Scale from ${fmt(scale.lo)} to ${fmt(scale.hi)}${summary ? `, with ${summary} placed` : ""}.`}
        onPointerDown={onPointerDown}
      >
        {minors.map((v) => (
          <line key={`m${v}`} x1={sx(v)} y1={AXIS_Y - 5} x2={sx(v)} y2={AXIS_Y} stroke="var(--color-line)" strokeWidth={1} />
        ))}
        {minors.map((v) => (
          <line key={`g${v}`} x1={sx(v)} y1={MID_Y - BOX_H / 2 - 14} x2={sx(v)} y2={AXIS_Y} stroke="var(--color-line)" strokeWidth={0.6} strokeOpacity={0.5} />
        ))}
        <line x1={sx(scale.lo)} y1={AXIS_Y} x2={sx(scale.hi)} y2={AXIS_Y} stroke="var(--color-ink-2)" strokeWidth={1.5} />
        {majors.map((v) => (
          <g key={`t${v}`}>
            <line x1={sx(v)} y1={AXIS_Y - 9} x2={sx(v)} y2={AXIS_Y} stroke="var(--color-ink-2)" strokeWidth={1.5} />
            <text x={sx(v)} y={AXIS_Y + 16} textAnchor="middle" fontSize={10} fill="var(--color-ink-3)" className="tnum">
              {fmt(v)}
            </text>
          </g>
        ))}
        {/* whiskers */}
        {min !== null && q1 !== null && <line x1={sx(min)} y1={MID_Y} x2={sx(q1)} y2={MID_Y} stroke="var(--color-accent)" strokeWidth={2} />}
        {q3 !== null && max !== null && <line x1={sx(q3)} y1={MID_Y} x2={sx(max)} y2={MID_Y} stroke="var(--color-accent)" strokeWidth={2} />}
        {/* the box */}
        {q1 !== null && q3 !== null && (
          <rect x={sx(Math.min(q1, q3))} y={MID_Y - BOX_H / 2} width={Math.abs(sx(q3) - sx(q1))} height={BOX_H} fill="var(--color-accent)" fillOpacity={0.12} stroke="var(--color-accent)" strokeWidth={2} />
        )}
        {/* whisker ends, median and every placed value */}
        {values.map((v, i) =>
          v === null ? null : (
            <g key={`v${i}`}>
              <line x1={sx(v)} y1={MID_Y - BOX_H / 2} x2={sx(v)} y2={MID_Y + BOX_H / 2} stroke="var(--color-accent)" strokeWidth={i === 2 ? 3 : 2} />
              <circle cx={sx(v)} cy={MID_Y - BOX_H / 2 - 7} r={3.5} fill="var(--color-accent)" />
            </g>
          ),
        )}
      </svg>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        {BOX_KEYS.map((k, i) => (
          <label key={k} className="w-[104px] shrink-0 text-meta capitalize text-ink-2">
            {BOX_LABELS[k]}
            <input
              type="number"
              step="any"
              className={`${fieldCls} mt-1 w-full`}
              value={values[i] ?? ""}
              onChange={(e) => setAt(i, e.target.value === "" ? null : Number(e.target.value))}
              disabled={disabled}
              inputMode="decimal"
              aria-label={`${BOX_LABELS[k].charAt(0).toUpperCase()}${BOX_LABELS[k].slice(1)} value`}
              aria-describedby={hintId}
            />
          </label>
        ))}
        <button
          type="button"
          className={btnQuiet}
          onClick={() => {
            const last = valuesRef.current.map((v, i) => (v === null ? -1 : i)).reduce((a, b) => Math.max(a, b), -1);
            if (last >= 0) setAt(last, null);
          }}
          disabled={disabled || placedCount === 0}
          aria-label="Lift the last value"
        >
          <Undo2 size={18} aria-hidden />
        </button>
        <button type="button" className={btnQuiet} onClick={() => update([null, null, null, null, null])} disabled={disabled || placedCount === 0} aria-label="Clear the box plot">
          <RotateCcw size={18} aria-hidden />
        </button>
      </div>

      <StickyBar hint={complete ? "All five values placed" : `${placedCount} of 5 values placed · next: ${BOX_LABELS[nextKey ?? "min"]}`}>
        <button type="submit" className={btnCheck} disabled={disabled || !complete}>
          {submitLabel}
        </button>
        {calcTag}
        {barExtra}
      </StickyBar>
    </form>
  );
}
