/**
 * Marking for `label` answers ("label the diagram"): every target on the figure takes one name from the word bank.
 * A target is called "(i)", "(ii)" … after its id when the id is the kind a stem refers to (a roman numeral, a letter
 * or a number); an id that spells the answer ("active-site") is never shown, so those targets are "Label 1",
 * "Label 2" … in their order down the figure. The field submits JSON (`formatLabelResponse`); a target is right when
 * the chosen name matches one of its accepted spellings after `normaliseText`. Feedback names every target that is
 * off, with what it is. Pure; no content dependencies.
 */
import { normaliseText } from "@/components/items/text-marking";

export interface LabelTarget {
  id: string;
  /** Accepted spellings; the first is the one feedback and the expected line use. */
  accepted: readonly string[];
  /** Where the label sits on the figure (SVG units, y down), when the author placed it; it orders the "Label n" names. */
  position?: readonly [number, number];
}

export interface LabelExpect {
  targets: readonly LabelTarget[];
  bank: readonly string[];
}

export interface LabelResponse {
  /** Target id → the chosen name; a target left unlabelled is absent. */
  labels: Record<string, string>;
}

export interface LabelVerdict {
  correct: boolean;
  /** Targets labelled correctly, out of `total`. */
  earned: number;
  total: number;
  feedback: string;
  /**
   * The ids of the targets she has not labelled right, in the spec's order. The part's marks are shared out by count,
   * so the award alone cannot say which target was missed; the re-teach panel reads these to name the missed target's
   * mark point rather than one she earned (engine item 7, 23 Sep 2026).
   */
  unmet: string[];
}

/** A target with the name the field and the feedback call it by. */
export interface NamedTarget {
  target: LabelTarget;
  name: string;
}

/** "(ii)" — a target named after an id the stem refers to. */
export const targetLabel = (id: string): string => `(${id})`;

/** Ids a stem refers to: roman numerals, single letters and numbers. */
const STEM_ID = /^(?:[ivxlcdm]+|[a-z]|\d+)$/i;

/**
 * The targets in the order the field lists them, each with its name. Ids a stem refers to ("i", "b", "3") give
 * "(i)", "(b)", "(3)" in the spec's order; otherwise the targets are numbered "Label 1", "Label 2" … down the figure
 * (top to bottom, then left to right; the spec's order when positions are missing) so an id that spells the answer
 * never shows.
 */
export function namedTargets(expect: LabelExpect): NamedTarget[] {
  if (expect.targets.every((t) => STEM_ID.test(t.id))) return expect.targets.map((target) => ({ target, name: targetLabel(target.id) }));
  const ordered = [...expect.targets];
  if (ordered.every((t) => t.position !== undefined)) ordered.sort((a, b) => a.position![1] - b.position![1] || a.position![0] - b.position![0]);
  return ordered.map((target, i) => ({ target, name: `Label ${i + 1}` }));
}

export function formatLabelResponse(r: LabelResponse): string {
  return JSON.stringify(r);
}

/** A response string from the field, or null when it is not one. */
export function parseLabelResponse(raw: string): LabelResponse | null {
  const t = raw.trim();
  if (!t.startsWith("{")) return null;
  try {
    const o = JSON.parse(t) as { labels?: unknown };
    if (!o.labels || typeof o.labels !== "object" || Array.isArray(o.labels)) return null;
    const labels: Record<string, string> = {};
    for (const [id, v] of Object.entries(o.labels as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim() !== "") labels[id] = v.trim();
    }
    return { labels };
  } catch {
    return null;
  }
}

/** Is the chosen name one of the target's accepted spellings (case- and punctuation-blind)? */
export function labelMatches(chosen: string, target: LabelTarget): boolean {
  const c = normaliseText(chosen);
  return c !== "" && target.accepted.some((a) => normaliseText(a) === c);
}

/** The names the field offers, in the bank's order; when a spec has no bank, each target's first accepted name stands in. */
export function labelBank(expect: LabelExpect): string[] {
  const names = expect.bank.length > 0 ? expect.bank : expect.targets.map((t) => t.accepted[0] ?? "");
  return [...new Set(names.filter((n) => n !== ""))];
}

/** Marks a field response target by target. An unreadable response scores nothing. */
export function checkLabel(raw: string, expect: LabelExpect): LabelVerdict {
  const total = expect.targets.length;
  const response = parseLabelResponse(raw);
  if (!response) return { correct: false, earned: 0, total, feedback: "Nothing has been labelled yet.", unmet: expect.targets.map((t) => t.id) };
  let earned = 0;
  const notes: string[] = [];
  const met = new Set<string>();
  for (const { target, name } of namedTargets(expect)) {
    const chosen = response.labels[target.id] ?? "";
    const is = target.accepted[0] ?? "";
    if (chosen === "") notes.push(`${name} is not labelled yet; it is the ${is}`);
    else if (labelMatches(chosen, target)) {
      earned += 1;
      met.add(target.id);
    }
    else notes.push(`${name} is the ${is}, not the ${chosen}`);
  }
  const correct = earned === total;
  const feedback = correct
    ? total === 1
      ? "The label is right."
      : "Every label is right."
    : `${earned === 0 ? "" : `${earned} of ${total} labels ${earned === 1 ? "is" : "are"} right. `}${notes.join(". ")}.`;
  return { correct, earned, total, feedback, unmet: expect.targets.map((t) => t.id).filter((id) => !met.has(id)) };
}

/**
 * The chosen names in target order, comma-separated ("cell membrane, nucleus, chloroplast, vacuole"), which is how
 * authors write text common-error patterns; a response that is not the field's JSON is returned as it is.
 */
export function labelResponseText(raw: string, expect: LabelExpect): string {
  const r = parseLabelResponse(raw);
  if (!r) return raw;
  return namedTargets(expect)
    .map(({ target }) => r.labels[target.id] ?? "")
    .filter((v) => v !== "")
    .join(", ");
}

/** What the marker expects, for the "expected" line of a result: "(i) cell wall, (ii) nucleus". */
export function describeLabelExpect(expect: LabelExpect): string {
  return namedTargets(expect)
    .map(({ target, name }) => `${name} ${target.accepted[0] ?? ""}`)
    .join(", ");
}
