/**
 * Maps the content schema's AnswerSpec variants onto the marking engines' own spec
 * types (src/lib/marking/numeric.ts and algebra.ts), and describes the expected answer
 * for the feedback card. Pure.
 */
import type { AnswerSpec } from "@/lib/content/schema";
import type { NumericForm, NumericSpec, RequiredForm, Tolerance as NumericTolerance } from "@/lib/marking/numeric";
import type { AlgebraSpec } from "@/lib/marking/algebra";
import { formatVertices } from "@/lib/marking/transformation";
import { describePlotExpect } from "@/lib/marking/plot";
import { describeRegionExpect } from "@/lib/marking/region";
import { describeMatrixExpect } from "@/lib/marking/matrix";
import { formatNumber } from "@/lib/marking/numeric";

/** Graph plots the item components mark automatically; only "best-fit" still self-marks. */
const PLOT_AUTO = new Set(["transformation", "points-line", "curve", "histogram", "box", "region"]);
import { formatValue } from "./format";

export type NumericAnswerSpec = Extract<AnswerSpec, { kind: "numeric" }>;
export type AlgebraicAnswerSpec = Extract<AnswerSpec, { kind: "algebraic" }>;

const FORM_MAP: Record<NumericAnswerSpec["acceptForms"][number], NumericForm[]> = {
  decimal: ["decimal", "integer", "recurring"],
  fraction: ["fraction", "integer"],
  mixed: ["mixed"],
  surd: ["surd"],
  pi: ["pi"],
  percent: ["percent"],
  standardForm: ["standard-form"],
  ratio: [], // no counterpart in the numeric engine yet
};

export function toNumericTolerance(t: NumericAnswerSpec["tolerance"]): NumericTolerance {
  switch (t.type) {
    case "absolute":
      return { type: "absolute", value: t.value };
    case "relative":
      return { type: "relative", value: t.value };
    case "dp":
      return { type: "dp", n: t.places };
    case "sf":
      return { type: "sigfigs", n: t.figures };
    case "range":
      return { type: "range", min: t.min, max: t.max };
    case "exact":
      return { type: "absolute", value: 0 };
  }
}

export interface NumericSpecOptions {
  /**
   * The part's stem instructs an accuracy ("Give your answer to 2 decimal places"). Only then is a d.p. / s.f.
   * tolerance also a demand on the written answer (too many places is wrong, dropped zeros get a reminder);
   * otherwise it is a closeness test and 1.8 for 1.80 is simply right.
   */
  accuracyInstructed?: boolean;
}

export function toNumericSpec(spec: NumericAnswerSpec, opts: NumericSpecOptions = {}): NumericSpec {
  const out: NumericSpec = { value: spec.value, tolerance: toNumericTolerance(spec.tolerance) };
  if (spec.unit) {
    out.unit = spec.unit;
    out.requireUnit = spec.unitRequired;
  }
  const forms = [...new Set(spec.acceptForms.flatMap((f) => FORM_MAP[f]))];
  // Only constrain forms when the list is meaningful; "ratio" alone maps to nothing, so accept anything.
  if (forms.length > 0) out.acceptedForms = forms;
  if (opts.accuracyInstructed) {
    if (spec.tolerance.type === "dp") out.dp = spec.tolerance.places;
    if (spec.tolerance.type === "sf") out.sigfigs = spec.tolerance.figures;
  }
  let required: RequiredForm | undefined;
  if (spec.mustBeSimplified) {
    if (spec.acceptForms.includes("fraction") || spec.acceptForms.includes("mixed")) required = "simplest-fraction";
    else if (spec.acceptForms.includes("surd")) required = "surd";
  }
  if (!required && spec.acceptForms.length === 1) {
    if (spec.acceptForms[0] === "standardForm") required = "standard-form";
    else if (spec.acceptForms[0] === "pi") required = "pi";
  }
  if (required) out.requiredForm = required;
  return out;
}

export function toAlgebraSpec(spec: AlgebraicAnswerSpec): AlgebraSpec {
  const out: AlgebraSpec = { answer: spec.latex, mode: "equivalent" };
  if (spec.form) {
    out.mode = "form";
    out.form = spec.form;
  } else if (spec.mustBeFactorised) {
    out.mode = "form";
    out.form = "factorised";
  } else if (spec.mustBeExpanded) {
    out.mode = "form";
    out.form = "expanded";
  } else if (spec.equivalence === "identical" || spec.equivalence === "simplifiedOnly") {
    out.mode = "identical-after-simplify";
  }
  if (spec.variables.length > 0) out.variables = [...spec.variables];
  // The schema's `domain` is prose ("x > 0"); the engine wants numeric ranges, so it is not mapped.
  return out;
}

/**
 * A value to the accuracy the stem instructs, when it instructs one: "49.50", not "49.5", for "Round to 2 decimal
 * places" (engine item 13, 23 Sep 2026: the expected line taught the dropped zero the reminder warns against).
 * Without an instruction the tolerance is only a closeness test, and the value is shown as authored.
 */
function instructedValue(value: number, tolerance: { type: string; places?: number; figures?: number } | undefined, opts: NumericSpecOptions): string {
  if (opts.accuracyInstructed && tolerance?.type === "dp" && tolerance.places !== undefined) return formatNumber(value, { dp: tolerance.places });
  if (opts.accuracyInstructed && tolerance?.type === "sf" && tolerance.figures !== undefined) return formatNumber(value, { sigfigs: tolerance.figures });
  return formatValue(value);
}

/** What the feedback card shows as the expected answer. May contain $…$ for maths. */
export function expectedDisplay(spec: AnswerSpec, opts: NumericSpecOptions = {}): string {
  switch (spec.kind) {
    case "numeric": {
      const v = instructedValue(spec.value, spec.tolerance, opts);
      const unit = spec.unit ? ` ${spec.unit}` : "";
      if (spec.tolerance.type === "range") {
        return `${formatValue(spec.tolerance.min)} to ${formatValue(spec.tolerance.max)}${unit}`;
      }
      return `${v}${unit}`;
    }
    case "algebraic":
      return `$${spec.latex}$`;
    case "mcq":
      return spec.options
        .filter((o) => o.correct)
        .map((o) => o.text)
        .join("; ");
    case "text":
      if (spec.accepted.length > 0) return spec.accepted[0];
      return spec.keyWords.map((g) => g.any[0]).join(", ");
    case "equation":
      return spec.kindOf === "word" ? spec.balancedLatex : `$${spec.balancedLatex}$`;
    case "steps":
      return spec.expectedOrder.join(" → ");
    case "order":
      return spec.correctOrder.map((i) => spec.items[i]).join(" → ");
    case "table":
      return spec.cells.map((c) => (typeof c.value === "number" ? instructedValue(c.value, c.tolerance, opts) : c.value)).join(", ");
    case "matrix":
      // The whole matrix, drawn as one: a list of entries would not show which is which.
      return describeMatrixExpect(spec);
    case "label":
      return spec.targets.map((t) => t.accepted[0]).join(", ");
    case "graph":
      if (spec.expect.plot === "transformation") return formatVertices(spec.expect.image);
      if (spec.expect.plot === "points-line" || spec.expect.plot === "curve" || spec.expect.plot === "histogram" || spec.expect.plot === "box") return describePlotExpect(spec.expect);
      if (spec.expect.plot === "region") return describeRegionExpect(spec.expect);
      return "See the worked solution.";
    case "text-long":
      // The indicative content is what the examiner looks for; the band descriptors decide how many of
      // them, described how well, earn what. The feedback card lists the points so she can see the pile.
      if (spec.indicativeContent.length > 0) return spec.indicativeContent.map((p) => p.point).join("; ");
      return "See the worked solution.";
    case "drawing":
    case "annotation":
      return "See the worked solution.";
  }
}

/**
 * Marks the field kinds the item components can check automatically. `text-long` counts: its field and
 * marker read the answer for evidence of the indicative points and suggest a band, so it never goes to
 * paper — but the mark itself is hers to place on the descriptors (see `MarkResult.decision`).
 */
export function isAutoMarkable(spec: AnswerSpec): boolean {
  return (
    spec.kind === "numeric" ||
    spec.kind === "algebraic" ||
    spec.kind === "mcq" ||
    spec.kind === "text" ||
    spec.kind === "text-long" ||
    spec.kind === "equation" ||
    spec.kind === "order" ||
    spec.kind === "steps" ||
    spec.kind === "table" ||
    spec.kind === "matrix" ||
    spec.kind === "label" ||
    (spec.kind === "graph" && PLOT_AUTO.has(spec.expect.plot))
  );
}
