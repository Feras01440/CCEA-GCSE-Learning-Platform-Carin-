/**
 * The mathematics behind the trial topic's drawings (fm1/algebraic-fractions-simplify), kept pure so it can be tested
 * without a browser: what each pill of 2x(x + 5) over 4(x + 5)(x − 5) is, what a pair of taps does, what Check finds,
 * and what the g2 consequence shows for the option she chose.
 *
 * The rule the drawing must never break (audit MK-05, LD-08, CT-10): a strike means "divides out of both lines". A
 * bracket that is on both lines is struck whole. 2x and 4 are not the same factor; what they share is a factor of 2, so
 * pairing them strikes the 2 out of each and leaves x on top and 2 underneath, and the answer x over 2(x − 5) is exactly
 * what is left unstruck.
 */

export type PillId = "t-2x" | "t-b" | "b-4" | "b-b" | "b-m";

export interface PillSpec {
  id: PillId;
  line: "top" | "bottom";
  /** The pill as printed before anything is struck. */
  text: string;
  /** What it shares with a pill on the other line: a bracket by its text, a number by the factor it has in common. */
  match: string;
  /** A number pill that shares only part of itself: the factor that divides out, and what is left of it. */
  split?: { factor: string; left: string };
}

export const TOP: readonly PillSpec[] = [
  { id: "t-2x", line: "top", text: "2x", match: "2", split: { factor: "2", left: "x" } },
  { id: "t-b", line: "top", text: "(x + 5)", match: "(x + 5)" },
];
export const BOTTOM: readonly PillSpec[] = [
  { id: "b-4", line: "bottom", text: "4", match: "2", split: { factor: "2", left: "2" } },
  { id: "b-b", line: "bottom", text: "(x + 5)", match: "(x + 5)" },
  { id: "b-m", line: "bottom", text: "(x − 5)", match: "(x − 5)" },
];
export const PILLS: readonly PillSpec[] = [...TOP, ...BOTTOM];
/** Everything the two lines share: the bracket, and a factor of 2 (from 2x and from 4). */
export const SHARED: readonly PillId[] = ["t-2x", "t-b", "b-4", "b-b"];

export const pillOf = (id: PillId): PillSpec => PILLS.find((p) => p.id === id)!;

/** The simplified fraction: what is left unstruck on each line once every shared factor is gone. */
export const RESULT = { top: "x", bottom: "2(x − 5)" } as const;

export interface TapState {
  /** Pills acted on: a bracket struck whole, or a number whose shared factor is struck out of it. */
  struck: PillId[];
  /** After a Check that left something shared: the pills still sharing a factor, lit so she can finish. */
  lit: PillId[];
}

export const EMPTY_TAP: TapState = { struck: [], lit: [] };

/** How a pill reads now: whole, struck whole, or a number with its shared factor struck out and the rest left. */
export function pillReading(id: PillId, state: TapState): { kind: "whole" | "struck" | "split"; factor?: string; left?: string } {
  const p = pillOf(id);
  if (!state.struck.includes(id)) return { kind: "whole" };
  return p.split ? { kind: "split", factor: p.split.factor, left: p.split.left } : { kind: "struck" };
}

/**
 * A second tap after `pending`: a pill on the same line becomes the pending one; a pill on the other line that shares
 * with it strikes the pair (a bracket whole, a number's common factor out of each); anything else is named as not the
 * same factor and nothing changes.
 */
export function tapPair(state: TapState, pending: PillId, id: PillId): { state: TapState; pending: PillId | null; note: string } {
  const first = pillOf(pending);
  const second = pillOf(id);
  if (first.line === second.line) return { state, pending: id, note: "Now its match on the other line." };
  if (first.match !== second.match) return { state, pending: null, note: `${first.text} and ${second.text} are not the same factor, so nothing divides out.` };
  const struck = [...state.struck, first.id, second.id];
  const next: TapState = { struck, lit: state.lit.filter((l) => l !== first.id && l !== second.id) };
  const left = SHARED.filter((k) => !struck.includes(k));
  const numbersNow = first.split !== undefined;
  const said = numbersNow ? "2x is 2 × x and 4 is 2 × 2: the 2 divides out of both, leaving x and 2." : "(x + 5) is on both lines, so it divides out.";
  const then = left.length === 0 ? "Nothing is shared any more. Press Check." : numbersNow ? "Now the bracket both lines share." : "One more: what divides both 2x and 4?";
  return { state: next, pending: null, note: `${said} ${then}` };
}

/** What Check finds: right when every shared factor is struck and nothing else is; otherwise what still divides both. */
export function checkTap(state: TapState): { correct: boolean; lit: PillId[]; diagnosis: string | null } {
  const missing = SHARED.filter((k) => !state.struck.includes(k));
  const extra = state.struck.filter((k) => !SHARED.includes(k));
  const correct = missing.length === 0 && extra.length === 0;
  const bracket = missing.includes("t-b") || missing.includes("b-b");
  const number = missing.includes("t-2x") || missing.includes("b-4");
  const diagnosis = correct
    ? null
    : bracket && number
      ? "(x + 5) and a factor of 2 still divide both lines."
      : bracket
        ? "(x + 5) still divides both lines."
        : number
          ? "A factor of 2 still divides both 2x and 4."
          : "Something struck was not on both lines.";
  return { correct, lit: missing, diagnosis };
}

/**
 * The consequence drawn for gate g2 ("In (x + 4)/x, what cancels?"): put x = 1 into the fraction (5) and into the
 * cancelled version she chose. "The x, leaving 4" gives 4; "The x and the 4" leaves nothing but 1. On the right answer
 * the drawing shows the tempting route (the x struck, leaving 4) as the reason nothing cancels.
 */
export function substituteFor(hers: string, correct: boolean): { value: string; label: string } {
  const said = hers.replace(/\$/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  if (correct) return { value: "4", label: "the cancelled version" };
  if (/\bx and the 4\b/.test(said)) return { value: "1", label: "your cancelled version" };
  if (/\bleaving 4\b/.test(said)) return { value: "4", label: "your cancelled version" };
  // An option the drawing does not know (the note was reworded): the common wrong route, said as that, not as hers.
  return { value: "4", label: "the cancelled version" };
}
