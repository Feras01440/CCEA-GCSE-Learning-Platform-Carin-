/**
 * The renderer for an `apparatus` figure (schema.ts FigureSpec, kind "apparatus", style "ccea-2d"): the parts list drawn
 * as the assembled, working set-up in CCEA's two-dimensional cross-section style, every piece labelled in the author's
 * words with a leader line, phone first.
 *
 * What it reads and draws (apparatus/parts.ts, apparatus/layouts.ts): each part names one piece of apparatus as CCEA
 * names it ("gas syringe", "beehive shelf"), optionally with what it holds ("conical flask: dilute acid and zinc" is
 * labelled twice, "trough of water" once). A parts list that no set-up assembles, or that names a piece the vocabulary
 * does not know, is said in words exactly as before, never drawn wrongly: a wrongly assembled diagram would model the
 * very fault the examiners mark down.
 *
 * The drawing (illustration system, 01-art-direction.md §7 and v2 §3): a 400-unit viewBox drawn no wider than 400 px;
 * labels in Inter 500 at 16 units, so 13.7 px on a 342 px Slides stage and 14.3 px on a 358 px phone column, each on a
 * paper halo; glass in ink at --fig-stroke, liquids in the subject's --tint-mid, rubber grey, bodies at --fig-fill; no
 * colour of its own, so dark mode and every subject re-tint it. An image with a name: role="img", an aria-label and a
 * <title> that say the arrangement in a sentence. The caption, when there is one, sits on the page under it.
 *
 * Standalone: <ApparatusFigure spec={{ kind: "apparatus", parts, style: "ccea-2d" }} caption="…" />. Figure.tsx needs one
 * case to use it.
 */
import type { CSSProperties, SVGProps } from "react";
import type { FigureSpec } from "@/lib/content/schema";
import { MdInlines } from "@/components/items/Markdown";
import { parseInline } from "@/components/items/md";
import { HALO_UNITS, LABEL_UNITS, LINE_UNITS, type Role, type Shape } from "./apparatus/geometry";
import { APPARATUS_WIDTH, planApparatus, type ApparatusPlan } from "./apparatus/layouts";

export { APPARATUS_WIDTH, LABEL_UNITS, planApparatus };
export type { ApparatusPlan };
export { parseApparatusParts } from "./apparatus/parts";

export type ApparatusSpec = Extract<FigureSpec, { kind: "apparatus" }>;

const FINE = 1.25;
const LINE: SVGProps<SVGElement> = { strokeLinecap: "round", strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" };

/** A role's paint: every colour is ink (currentColor) or a token, so the figure follows the theme and the subject. */
function paintFor(role: Role, width: number | undefined, kind: Shape["kind"]): SVGProps<SVGElement> {
  const stroked = (style: CSSProperties = {}): SVGProps<SVGElement> => ({ ...LINE, stroke: "currentColor", style: { strokeWidth: "var(--fig-stroke)", ...style } });
  switch (role) {
    case "glass":
      return { ...stroked(), fill: "none" };
    case "fine":
      return { ...LINE, fill: "none", stroke: "currentColor", strokeWidth: FINE };
    case "liquid":
      return { stroke: "none", style: { fill: "var(--tint-mid)" } };
    case "wet":
      return { fill: "none", strokeLinejoin: "miter", strokeWidth: width, style: { stroke: "var(--tint-mid)" } };
    case "gap":
      return kind === "path"
        ? { fill: "none", strokeLinejoin: "miter", strokeWidth: width, style: { stroke: "var(--fig-halo)" } }
        : { ...LINE, stroke: "currentColor", strokeWidth: FINE, style: { fill: "var(--fig-halo)" } };
    case "solid":
      return { ...LINE, fill: "currentColor", fillOpacity: 0.55, stroke: "currentColor", strokeWidth: FINE };
    case "rubber":
      return { ...stroked(), fill: "currentColor", fillOpacity: 0.32 };
    case "body":
      return { ...stroked({ fillOpacity: "var(--fig-fill)" }), fill: "currentColor" };
    case "leaf":
    case "flame":
      return { ...LINE, stroke: "currentColor", strokeWidth: FINE, style: { fill: "var(--tint-mid)" } };
    case "core":
      return { ...LINE, fill: "currentColor", fillOpacity: 0.3, stroke: "currentColor", strokeWidth: FINE };
    case "mask":
      return { stroke: "none", style: { fill: "var(--fig-halo)" } };
    case "inner":
      return { stroke: "none", fill: "currentColor", fillOpacity: 0.2 };
    case "tissue":
      return { ...LINE, fill: "currentColor", fillOpacity: 0.4, stroke: "currentColor", strokeWidth: FINE };
  }
}

function ShapeView({ shape }: { shape: Shape }) {
  const paint = paintFor(shape.role, shape.kind === "path" ? shape.width : undefined, shape.kind);
  switch (shape.kind) {
    case "path":
      return <path d={shape.d} {...(paint as SVGProps<SVGPathElement>)} />;
    case "rect":
      return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.r} {...(paint as SVGProps<SVGRectElement>)} />;
    case "circle":
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...(paint as SVGProps<SVGCircleElement>)} />;
    case "ellipse":
      return <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...(paint as SVGProps<SVGEllipseElement>)} />;
    case "line":
      return <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} {...(paint as SVGProps<SVGLineElement>)} />;
  }
}

const LABEL_STYLE: CSSProperties = {
  fontFamily: "var(--font-sans), system-ui, sans-serif",
  fontWeight: 500,
  stroke: "var(--fig-halo)",
  strokeWidth: HALO_UNITS,
  strokeLinejoin: "round",
  paintOrder: "stroke",
};

/** The drawing alone, from a plan: shapes, then leaders, then labels on top of everything. */
export function ApparatusSvg({ plan }: { plan: ApparatusPlan }) {
  return (
    <svg viewBox={`0 0 ${plan.width} ${plan.height}`} role="img" aria-label={plan.description} className="block h-auto w-full text-ink" style={{ maxWidth: plan.width }}>
      <title>{plan.description}</title>
      <g transform={plan.offset ? `translate(0 ${-plan.offset})` : undefined}>
        {plan.shapes.map((shape, i) => (
          <ShapeView key={i} shape={shape} />
        ))}
      </g>
      {plan.labels.flatMap((label, i) =>
        label.leaders.map((l, j) => <line key={`${i}.${j}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="currentColor" strokeWidth={FINE} strokeLinecap="round" vectorEffect="non-scaling-stroke" />),
      )}
      {plan.labels.map((label, i) => (
        <text key={i} x={label.x} y={label.y} fontSize={LABEL_UNITS} textAnchor={label.anchor} fill="currentColor" style={LABEL_STYLE}>
          {label.lines.length === 1
            ? label.lines[0]
            : label.lines.map((line, j) => (
                <tspan key={j} x={label.x} dy={j === 0 ? 0 : LINE_UNITS}>
                  {line}
                </tspan>
              ))}
        </text>
      ))}
    </svg>
  );
}

export function ApparatusFigure({ spec, caption, className }: { spec: ApparatusSpec; caption?: string; className?: string }) {
  const plan = planApparatus(spec.parts);
  if (!plan) return <p className="my-3 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 text-meta text-ink-2">{`Apparatus: ${spec.parts.join(", ")}.`}</p>;
  return (
    <figure className={className ?? "mb-3 mt-4"} data-figure="apparatus">
      <ApparatusSvg plan={plan} />
      {caption && (
        <figcaption className="mt-3 max-w-[var(--measure)] text-meta text-ink-2">
          <MdInlines inlines={parseInline(caption)} />
        </figcaption>
      )}
    </figure>
  );
}
