/**
 * What to put in front of her when the marker does not recognise an answer.
 *
 * A miss that matches one of the part's authored common errors already gets the author's diagnosis.
 * A miss that matches none of them used to get one generic sentence and the marks, which teaches
 * nothing (docs/plan/review/2026-09-19-quality-bar.md, item 6). This module chooses what to say
 * instead, and says it in the scheme's own language rather than ours:
 *
 *   1. the mark point she has not reached — the first one the marker's award does not cover, which
 *      for an all-or-nothing part is the first method mark — with the line of the worked solution
 *      that states it, where one can be matched;
 *   2. the same idea in a different form: the part's first hint, or failing that a sentence of the
 *      worked solution that is not the line already shown.
 *
 * Pure: no React, no database, no marking. The runner decides when to show this; the module only
 * decides what it would be.
 */
import type { CommonError, MarkPoint, Part } from "@/lib/content/schema";
import type { MarkResult } from "@/components/items/mark";
import { firstSentence, holdsMaths, mathsKey, stepLineMatches, workingLines } from "@/components/items/mistake-marking";
import { mdToPlain } from "@/components/items/md";

/** The part fields this module reads. A caller may pass the whole `Part`. */
export type ReteachPart = Pick<Part, "scheme" | "hints" | "workedSolution"> & {
  commonErrors?: readonly CommonError[];
  /** The answer spec: a part marked target by target names the missed target's point through it. */
  answer?: Part["answer"];
};

/** The result fields this module reads. A caller may pass the whole `MarkResult`. */
export type ReteachResult = Pick<MarkResult, "correct" | "marksAwarded" | "unmet"> & { tags?: readonly string[] };

export interface ReteachStep {
  /** The scheme's own chip, as the mark scheme block renders it: "MA1", "A1", "P1". */
  label: string;
  /** The mark point in the scheme's words ("substitute into $V = \tfrac{1}{3}\pi r^2 h$"). */
  text: string;
  /** The worked solution's line for that mark point, when one can be matched to it. */
  line: string | null;
}

export interface Reteach {
  /** The mark point she has not reached. Null when the part carries no scheme. */
  step: ReteachStep | null;
  /** The idea in a different form: the first hint, else a sentence of the worked solution. */
  anotherWay: string | null;
}

/**
 * Did the marker recognise this answer? `withCommonError` in `mark.ts` is the only thing that puts
 * one of the part's `misconception` ids on the result, so a tag that names one of them means the
 * authored diagnosis is already on the card and nothing here should compete with it.
 */
export function isRecognised(commonErrors: readonly CommonError[] | undefined, tags: readonly string[] | undefined): boolean {
  if (!commonErrors || commonErrors.length === 0 || !tags || tags.length === 0) return false;
  return commonErrors.some((e) => tags.includes(e.misconception));
}

/**
 * The first mark point the award does not reach. The marker returns one total for the part rather
 * than a mark point each, so the scheme is walked in its authored order and the first point whose
 * running total passes `marksAwarded` is the one she has not got to: the first point of all for a
 * part marked all or nothing, the point after the ones she did earn for a part marked in pieces.
 * Null when the part has no scheme, or when the award already covers all of it.
 */
export function unreachedStep(scheme: readonly MarkPoint[], result: ReteachResult, answer?: Part["answer"]): MarkPoint | null {
  const missed = missedTargetPoint(scheme, result, answer);
  if (missed) return missed;
  let running = 0;
  for (const point of scheme) {
    running += point.marks;
    if (running > result.marksAwarded) return point;
  }
  return null;
}

/**
 * On a part marked target by target (a label part), the mark point for the first target she missed. The award is
 * shared out by count, so the running total above would name the last point of the scheme when she missed the
 * first target and got the rest, a point she earned (engine item 7, 23 Sep 2026). A scheme with a point per target
 * is written in the targets' order (all 25 such parts on 23 Sep, one with a target's name inside another's: "(iv)
 * resistor" and "(i) variable resistor"), so the point is found by position; a scheme that groups targets ("(ii) 0.75
 * and (iii) 0.9") is searched for the target's accepted name, and only a single point holding it is taken. Null
 * when the result names no missed target or no point can be matched to it.
 */
function missedTargetPoint(scheme: readonly MarkPoint[], result: ReteachResult, answer?: Part["answer"]): MarkPoint | null {
  if (!answer || answer.kind !== "label" || !result.unmet || result.unmet.length === 0) return null;
  const targets = answer.targets;
  const k = targets.findIndex((t) => result.unmet!.includes(t.id));
  if (k < 0) return null;
  if (targets.length === scheme.length) return scheme[k] ?? null;
  const words = (s: string) => ` ${s.toLowerCase().replace(/\.(?!\d)/g, " ").replace(/[^a-z0-9.]+/g, " ").trim()} `;
  const holding = scheme.filter((p) => targets[k]!.accepted.some((a) => words(p.for).includes(words(a))));
  return holding.length === 1 ? holding[0]! : null;
}

/**
 * The worked solution as the lines it is written in, still in its own mini-markdown so that a
 * caller renders `$…$` as maths rather than as backslashes. Matching flattens a line separately.
 */
export function solutionLines(workedSolution: string): string[] {
  return workedSolution
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/** The same words, under the normalisation the faded worked-example steps already use. */
function sameWords(a: string, b: string): boolean {
  return workingLines(a).join(" ").toLowerCase() === workingLines(b).join(" ").toLowerCase();
}

/** The longest `$…$` span of a mark point, as a maths key, when it is long enough to identify a line (4+). */
function longestMaths(pointFor: string): string | null {
  const keys = [...pointFor.matchAll(/\$([^$]+)\$/g)].map((m) => mathsKey(m[1]!)).filter((k) => k.replace(/¦/g, "").length >= 4);
  if (keys.length === 0) return null;
  return keys.reduce((a, b) => (b.length > a.length ? b : a));
}

/**
 * The line of the worked solution that states a mark point, or null. The comparison is the one the
 * faded worked examples already use for her own typed working (`stepLineMatches`): the whole line
 * as written, or the value it ends on when the mark point itself ends on a value. A mark point
 * phrased as an instruction ("read from the line inside the box") ends on no value, so it matches
 * nothing by number and the step is shown in the scheme's words alone.
 *
 * Only an unambiguous match is used. A value match is weak — three lines of a rearrangement can all
 * end on the same number — so when more than one line answers to a mark point, none of them is
 * shown. A line put under the wrong mark point would be worse than no line at all. A line that is
 * the mark point word for word is dropped too: the step already says it.
 *
 * Between the whole line and the value sits a third reading (engine brief item 1, 23 Sep 2026): the line that
 * holds the mark point's longest piece of maths, as written, states that point ("Factorise: $(x + 3)(x - 5) > 0$,
 * so the critical values are …" under "factorising: $(x + 3)(x - 5) > 0$, giving …"). Many of these pairings used
 * to be found only by the accident of a shared last number, which also paired "$y = 8$" with "$\frac{dy}{dx} =
 * -4x + 8$"; the value comparison now needs a line that really ends on a value, and this reading keeps the
 * right pairings without the accident.
 */
export function solutionLineFor(step: Pick<MarkPoint, "for">, workedSolution: string): string | null {
  const lines = solutionLines(workedSolution).filter((line) => !sameWords(line, step.for));
  const matched = lines.map((line) => ({ line, how: stepLineMatches(mdToPlain(line), step.for).how })).filter((m) => m.how !== "none");
  const whole = matched.filter((m) => m.how === "line");
  if (whole.length > 0) return whole.length === 1 ? whole[0]!.line : null;
  const maths = longestMaths(step.for);
  if (maths !== null) {
    const holding = lines.filter((line) => holdsMaths(mathsKey(line), maths));
    if (holding.length > 0) return holding.length === 1 ? holding[0]! : null;
  }
  return matched.length === 1 ? matched[0]!.line : null;
}

/**
 * The same idea in a different form. The part's first hint is the authored one; without a hint,
 * the first sentence of the worked solution that is not the line already shown against the mark
 * point, so the block never repeats what is directly above it.
 */
export function anotherWayFor(part: ReteachPart, used: string | null = null): string | null {
  const hint = part.hints.find((h) => h.trim().length > 0);
  if (hint) return hint.trim();
  for (const line of solutionLines(part.workedSolution)) {
    if (used !== null && line === used) continue;
    const sentence = firstSentence(line);
    if (sentence.length > 0) return sentence;
  }
  return null;
}

/**
 * Everything the unrecognised-miss panel needs, or null when there is nothing honest to show:
 * a correct answer, a recognised error (the author's diagnosis owns that card), or a part with
 * neither a scheme nor anything to re-present.
 */
export function reteachFor(part: ReteachPart, result: ReteachResult): Reteach | null {
  if (result.correct) return null;
  if (isRecognised(part.commonErrors, result.tags)) return null;
  const point = unreachedStep(part.scheme, result, part.answer);
  const line = point ? solutionLineFor(point, part.workedSolution) : null;
  const step: ReteachStep | null = point ? { label: `${point.code}${point.marks}`, text: point.for, line } : null;
  const anotherWay = anotherWayFor(part, line);
  if (!step && anotherWay === null) return null;
  return { step, anotherWay };
}

/**
 * The ways on after a second miss on a part (engine item 10.2, 24 Sep 2026; programme 0.1). A third guess at the same
 * question teaches nothing, so the field stays closed and she chooses support: a hint, the worked solution, and then
 * a twin as the next attempt. The card carries one accent-filled control (the art direction), so this names the
 * rung that takes the card's primary button and at most one that sits beside it; "Next part" is the accented way out
 * only when nothing is left to offer.
 *
 * Before she has chosen, the hint leads (the smallest help first) with the worked solution beside it; once she has
 * chosen, the twin leads, because it is the attempt the support was for, and the worked solution stays beside it
 * until it is open.
 */
export type SupportRung = "hint" | "worked" | "twin";

export function supportOffer(state: { hint: boolean; hintShown: boolean; workedOpen: boolean; twin: boolean }): {
  primary: SupportRung | null;
  secondary: SupportRung | null;
} {
  const open = (rung: SupportRung): boolean =>
    rung === "hint" ? state.hint && !state.hintShown && !state.workedOpen : rung === "worked" ? !state.workedOpen : state.twin;
  const chosen = state.hintShown || state.workedOpen;
  const order: SupportRung[] = chosen ? ["twin", "worked"] : ["hint", "worked", "twin"];
  const [primary = null, secondary = null] = order.filter(open);
  return { primary, secondary };
}

/**
 * The hint offered after two misses: one the screen is not already showing. The part's hints first, skipping the one
 * "Another way to see it" re-presents; else a line of the worked solution that is neither that nor the line shown
 * under "Where the next mark is". Null when there is nothing new to say, and then no hint is offered.
 */
export function supportHintFor(part: Pick<ReteachPart, "hints" | "workedSolution">, reteach: Reteach | null): string | null {
  const onScreen = new Set([reteach?.anotherWay, reteach?.step?.line].filter((s): s is string => typeof s === "string"));
  const hint = part.hints.map((h) => h.trim()).find((h) => h.length > 0 && !onScreen.has(h));
  if (hint !== undefined) return hint;
  return solutionLines(part.workedSolution).find((line) => !onScreen.has(line) && !onScreen.has(firstSentence(line))) ?? null;
}
