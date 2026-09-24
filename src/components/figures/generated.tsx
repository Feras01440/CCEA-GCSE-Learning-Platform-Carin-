"use client";

/**
 * Deterministic SVG generators for `FigureSpec` of kind "svg-gen".
 * Conventions follow the authored bundles (see packs/maths/content/m4/histograms-unequal-widths):
 *   histogram: { xLabel, yLabel, bars:[{from,to,frequencyDensity}], xMax, yMax, xMin? } options { xStep, yStep, hideYScale, largeSquare:{x,y}, caption }
 *   axes:      { caption, xLabel, yLabel, xMax, xStep, yMax, yStep, xMin? }
 *   table:     { caption, columns:[...], rows:[[...]] }
 * Strokes use currentColor so every theme works; nothing relies on colour alone.
 *
 * Labels are sized for the width the figure is actually drawn at. The figure scales with its box (viewBox 640 wide,
 * drawn at most 640 px), so a label of fixed size in viewBox units shrinks with it: the old 13-unit labels drew at
 * 7.3 px on a 358 px phone column. Here the label size is chosen so every label draws at 13 px, the type floor, at any
 * width: 13 units at 640 px, 23 units on a phone (above the depth standard's 3.5% of the viewBox, 22.4 units), and the
 * frame around the plot grows to hold them. Strokes do not scale (non-scaling-stroke), so a 1.75 px bar edge stays
 * 1.75 px on a phone. Fills and the fine grid read the figure tokens, so dark mode raises them without a re-draw.
 */
import { useLayoutEffect, useRef, useState } from "react";
import { Tex } from "@/components/items/Tex";

type HistogramData = { xLabel: string; yLabel: string; bars: Array<{ from: number; to: number; frequencyDensity: number }>; xMax: number; yMax: number; xMin?: number };
type HistogramOptions = { xStep?: number; yStep?: number; hideYScale?: boolean; largeSquare?: { x: number; y: number }; caption?: string };
type AxesData = { caption?: string; xLabel: string; yLabel: string; xMax: number; xStep: number; yMax: number; yStep: number; xMin?: number };
type TableData = { caption?: string; columns: string[]; rows: Array<Array<string | number>> };

const W = 640;
const H = 400;
/** Every label draws at this many CSS pixels, whatever the figure's width (01-art-direction.md §3: nothing under 13). */
export const LABEL_PX = 13;
/** Before the figure is measured it is assumed to be on a phone: a 358 px column. */
const PHONE_COLUMN = 358;
/** Inter's average figure width, as a share of the font size, for spacing tick labels. */
const DIGIT_EM = 0.62;

/** Label size in viewBox units for a figure drawn `rendered` CSS pixels wide, rounded up to half a unit. */
export function labelUnits(rendered: number | null): number {
  const width = rendered && rendered > 0 ? Math.min(rendered, W) : PHONE_COLUMN;
  return Math.ceil(Math.max(LABEL_PX, (LABEL_PX * W) / width) * 2) / 2;
}

/** The plot frame: room for the tick labels and the axis titles at label size L. */
export function frameFor(L: number, yTickChars: number, hideYScale = false) {
  const l = Math.round(6 + 1.1 * L + 8 + (hideYScale ? 0 : yTickChars * DIGIT_EM * L) + 12);
  const b = Math.round(18 + 2.2 * L + 6);
  const r = Math.round(Math.max(20, 0.9 * L));
  const t = Math.round(Math.max(16, 0.7 * L));
  return { l, r, t, b, iw: W - l - r, ih: H - t - b };
}

/** Show every k-th tick label so that neighbours never touch; every tick mark is still drawn. */
export function labelEvery(count: number, spacing: number, labelSize: number): number {
  if (count <= 1 || spacing <= 0) return 1;
  return Math.max(1, Math.ceil(labelSize / spacing));
}

/** The width the element is drawn at, measured before paint and on every resize. */
function useDrawnWidth<T extends Element>(): [React.RefObject<T | null>, number | null] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setWidth(w > 0 ? Math.round(w) : null);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(+n.toFixed(2));
}

function steps(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}

type Frame = ReturnType<typeof frameFor>;

function Grid({ frame, xMin, xMax, xStep, yMax, yStep, large }: { frame: Frame; xMin: number; xMax: number; xStep: number; yMax: number; yStep: number; large?: { x: number; y: number } }) {
  const { l, t, iw, ih } = frame;
  const sx = (x: number) => l + ((x - xMin) / (xMax - xMin)) * iw;
  const sy = (y: number) => t + ih - (y / yMax) * ih;
  const smallX = xStep / 5;
  const smallY = yStep / 5;
  const lines: React.ReactNode[] = [];
  const line = (key: string, x1: number, x2: number, y1: number, y2: number, big: boolean) => (
    <line
      key={key}
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
      stroke="currentColor"
      style={big ? { strokeOpacity: 0.35 } : { strokeOpacity: "var(--fig-grid)" }}
      strokeWidth={big ? 1 : 0.5}
      vectorEffect="non-scaling-stroke"
    />
  );
  for (let x = xMin; x <= xMax + 1e-9; x += smallX) {
    const major = Math.abs((x - xMin) / xStep - Math.round((x - xMin) / xStep)) < 1e-6;
    const big = large ? Math.abs((x - xMin) / large.x - Math.round((x - xMin) / large.x)) < 1e-6 : major;
    lines.push(line(`x${x}`, sx(x), sx(x), t, t + ih, big));
  }
  for (let y = 0; y <= yMax + 1e-9; y += smallY) {
    const major = Math.abs(y / yStep - Math.round(y / yStep)) < 1e-6;
    const big = large ? Math.abs(y / large.y - Math.round(y / large.y)) < 1e-6 : major;
    lines.push(line(`y${y}`, l, l + iw, sy(y), sy(y), big));
  }
  return <g>{lines}</g>;
}

function Axes({ frame, L, xMin, xMax, xStep, yMax, yStep, xLabel, yLabel, hideYScale }: AxesData & { frame: Frame; L: number; hideYScale?: boolean }) {
  const { l, t, iw, ih } = frame;
  const x0 = xMin ?? 0;
  const sx = (x: number) => l + ((x - x0) / (xMax - x0)) * iw;
  const sy = (y: number) => t + ih - (y / yMax) * ih;
  const xs = steps(x0, xMax, xStep);
  const ys = steps(0, yMax, yStep);
  const xChars = Math.max(...xs.map((x) => fmt(x).length));
  const everyX = labelEvery(xs.length, iw / Math.max(1, xs.length - 1), xChars * DIGIT_EM * L + 0.6 * L);
  const everyY = labelEvery(ys.length, ih / Math.max(1, ys.length - 1), 1.15 * L);
  const axis = t + ih;
  return (
    <g fontFamily="var(--font-sans), system-ui, sans-serif" fontSize={L} fill="currentColor" style={{ fontVariantNumeric: "tabular-nums" }}>
      <line x1={l} x2={l + iw} y1={axis} y2={axis} stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <line x1={l} x2={l} y1={t} y2={axis} stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      {xs.map((x, i) => (
        <g key={x}>
          <line x1={sx(x)} x2={sx(x)} y1={axis} y2={axis + 5} stroke="currentColor" vectorEffect="non-scaling-stroke" />
          {i % everyX === 0 && (
            <text x={sx(x)} y={axis + 8 + 0.8 * L} textAnchor="middle">
              {fmt(x)}
            </text>
          )}
        </g>
      ))}
      {!hideYScale &&
        ys.map((y, i) => (
          <g key={y}>
            <line x1={l - 5} x2={l} y1={sy(y)} y2={sy(y)} stroke="currentColor" vectorEffect="non-scaling-stroke" />
            {i % everyY === 0 && (
              <text x={l - 10} y={sy(y) + 0.35 * L} textAnchor="end">
                {fmt(y)}
              </text>
            )}
          </g>
        ))}
      <text x={l + iw / 2} y={axis + 18 + 1.95 * L} textAnchor="middle" fontWeight={500}>
        {xLabel}
      </text>
      <text transform={`translate(${6 + 0.8 * L} ${t + ih / 2}) rotate(-90)`} textAnchor="middle" fontWeight={500}>
        {yLabel}
      </text>
    </g>
  );
}

/** The widest y tick label, in characters, which sets how much room the left of the frame needs. */
function yChars(yMax: number, yStep: number): number {
  return Math.max(...steps(0, yMax, yStep).map((y) => fmt(y).length));
}

export function HistogramSvg({ data, options = {} }: { data: HistogramData; options?: HistogramOptions }) {
  const [ref, drawn] = useDrawnWidth<SVGSVGElement>();
  const L = labelUnits(drawn);
  const xMin = data.xMin ?? 0;
  const xStep = options.xStep ?? niceStep(data.xMax - xMin);
  const yStep = options.yStep ?? niceStep(data.yMax);
  const frame = frameFor(L, yChars(data.yMax, yStep), options.hideYScale);
  const sx = (x: number) => frame.l + ((x - xMin) / (data.xMax - xMin)) * frame.iw;
  const sy = (y: number) => frame.t + frame.ih - (y / data.yMax) * frame.ih;
  const desc = options.caption ?? `Histogram of ${data.xLabel}: ${data.bars.map((b) => `${b.from} to ${b.to}, frequency density ${b.frequencyDensity}`).join("; ")}.`;
  return (
    <figure className="my-2">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={desc} className="block h-auto w-full max-w-[640px] text-ink">
        <Grid frame={frame} xMin={xMin} xMax={data.xMax} xStep={xStep} yMax={data.yMax} yStep={yStep} large={options.largeSquare} />
        {data.bars.map((b, i) => (
          <rect
            key={i}
            x={sx(b.from)}
            y={sy(b.frequencyDensity)}
            width={sx(b.to) - sx(b.from)}
            height={sy(0) - sy(b.frequencyDensity)}
            fill="currentColor"
            style={{ fillOpacity: "var(--fig-fill)", strokeWidth: "var(--fig-stroke)" }}
            stroke="currentColor"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <Axes
          frame={frame}
          L={L}
          xMin={xMin}
          xMax={data.xMax}
          xStep={xStep}
          yMax={data.yMax}
          yStep={yStep}
          xLabel={data.xLabel}
          yLabel={data.yLabel}
          hideYScale={options.hideYScale}
        />
      </svg>
      {options.caption && (
        <figcaption className="mt-3 text-meta text-ink-2">
          <Tex text={options.caption} />
        </figcaption>
      )}
    </figure>
  );
}

export function AxesSvg({ data }: { data: AxesData }) {
  const [ref, drawn] = useDrawnWidth<SVGSVGElement>();
  const L = labelUnits(drawn);
  const frame = frameFor(L, yChars(data.yMax, data.yStep));
  return (
    <figure className="my-2">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={data.caption ?? `Blank grid: ${data.xLabel} against ${data.yLabel}`} className="block h-auto w-full max-w-[640px] text-ink">
        <Grid frame={frame} xMin={data.xMin ?? 0} xMax={data.xMax} xStep={data.xStep} yMax={data.yMax} yStep={data.yStep} />
        <Axes frame={frame} L={L} {...data} />
      </svg>
      {data.caption && (
        <figcaption className="mt-3 text-meta text-ink-2">
          <Tex text={data.caption} />
        </figcaption>
      )}
    </figure>
  );
}

export function DataTable({ data }: { data: TableData }) {
  return (
    <figure className="my-2 overflow-x-auto">
      <table className="data-table min-w-full border-collapse text-meta">
        <thead>
          <tr>
            {data.columns.map((c, i) => (
              <th key={i} className="border border-line-2 bg-surface-2 px-3 py-1.5 text-left font-medium">
                <Tex text={String(c)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={`tnum border border-line-2 px-3 py-1.5 ${j === 0 ? "font-medium" : ""}`}>
                  {cell === "" ? <span className="inline-block h-4 w-10 border-b border-line-2" aria-label="blank" /> : <Tex text={String(cell)} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.caption && (
        <figcaption className="mt-1 text-meta text-ink-2">
          <Tex text={data.caption} />
        </figcaption>
      )}
    </figure>
  );
}

function niceStep(range: number): number {
  const raw = range / 10;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/** Dispatch for FigureSpec kind "svg-gen"; returns null for generators not yet implemented. */
export function GeneratedFigure({ generator, data, options }: { generator: string; data: unknown; options?: unknown }) {
  switch (generator) {
    case "histogram":
      return <HistogramSvg data={data as HistogramData} options={(options as HistogramOptions) ?? undefined} />;
    case "axes":
      return <AxesSvg data={data as AxesData} />;
    case "table":
      return <DataTable data={data as TableData} />;
    default:
      return null;
  }
}
