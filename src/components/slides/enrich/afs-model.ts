/**
 * The mathematics behind the trial topic's drawings (fm1/algebraic-fractions-simplify), kept pure so it can be tested
 * without a browser. The example is the note's own hero example (rewritten to teach, show, then check on 25 Sep 2026):
 * 3x(x + 7) over 6(x + 7)(x − 7), as the paper leaves it once both lines are factorised. This file says what each pill
 * is, what a pair of taps does, what Check finds, and what the g2 consequence shows for the option she chose; every
 * sentence the figure speaks is built from the pills below, so the words can never describe a different fraction.
 *
 * The rule the drawing must never break (audit MK-05, LD-08, CT-10; the trial review of 25 Sep): a strike means "divides
 * out of both lines". The bracket (x + 7) is on both lines, so it is struck whole. 3x and 6 are not the same factor;
 * what they share is a 3, so pairing them strikes the 3 out of each and leaves x on top and 2 underneath, which is the
 * note's figure exactly (3 × x over 3 × 2). (x − 7) is on one line only and is never struck. What is left unstruck is
 * the answer, x over 2(x − 7).
 */

export type PillId = "t-n" | "t-b" | "b-n" | "b-b" | "b-m";

export interface PillSpec {
  id: PillId;
  line: "top" | "bottom";
  /** The pill as printed before anything is struck. */
  text: string;
  /** What it shares with a pill on the other line: a bracket by its text, a number by the factor it has in common. */
  match: string;
  /** A pill that shares only part of itself: the factor that divides out, and what is left of it. */
  split?: { factor: string; left: string };
}

export const TOP: readonly PillSpec[] = [
  { id: "t-n", line: "top", text: "3x", match: "3", split: { factor: "3", left: "x" } },
  { id: "t-b", line: "top", text: "(x + 7)", match: "(x + 7)" },
];
export const BOTTOM: readonly PillSpec[] = [
  { id: "b-n", line: "bottom", text: "6", match: "3", split: { factor: "3", left: "2" } },
  { id: "b-b", line: "bottom", text: "(x + 7)", match: "(x + 7)" },
  { id: "b-m", line: "bottom", text: "(x − 7)", match: "(x − 7)" },
];
export const PILLS: readonly PillSpec[] = [...TOP, ...BOTTOM];

const onBoth = (match: string) => TOP.some((p) => p.match === match) && BOTTOM.some((p) => p.match === match);

/** Everything the two lines share, top first: the bracket, and a factor of 3 (from 3x and from 6). Never (x − 7). */
export const SHARED: readonly PillId[] = PILLS.filter((p) => onBoth(p.match)).map((p) => p.id);

export const pillOf = (id: PillId): PillSpec => PILLS.find((p) => p.id === id)!;

/** What is left of a line once every shared factor is struck: a pill's remainder, or the pill itself if it is not shared. */
function leftOf(line: readonly PillSpec[]): string {
  const parts = line.flatMap((p) => (p.split && onBoth(p.match) ? [p.split.left] : onBoth(p.match) ? [] : [p.text]));
  return parts.length === 0 ? "1" : parts.join("");
}

/** The simplified fraction: what is left unstruck on each line once every shared factor is gone. */
export const RESULT = { top: leftOf(TOP), bottom: leftOf(BOTTOM) } as const;

/** A line as a product, a split pill written as its factor times what is left: "3 × x × (x + 7)", as the note's figure writes it. */
export function productForm(line: readonly PillSpec[]): string {
  return line.map((p) => (p.split ? `${p.split.factor} × ${p.split.left}` : p.text)).join(" × ");
}

/** The screen reader's name for the figure she acts on. */
export function tapGroupLabel(): string {
  return `The fraction ${TOP.map((p) => p.text).join("")} over ${BOTTOM.map((p) => p.text).join("")}, each factor a button`;
}

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

/** The pair of pills that share a factor without being the same factor (3x and 6), top first. */
const numberPair = (): [PillSpec, PillSpec] | null => {
  const top = TOP.find((p) => p.split && onBoth(p.match));
  const bottom = top ? BOTTOM.find((p) => p.split && p.match === top.match) : undefined;
  return top && bottom ? [top, bottom] : null;
};
const sharedBrackets = (): PillSpec[] => TOP.filter((p) => !p.split && onBoth(p.match));

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
  const [top, bottom] = first.line === "top" ? [first, second] : [second, first];
  const said =
    top.split && bottom.split
      ? `${top.text} is ${top.split.factor} × ${top.split.left} and ${bottom.text} is ${bottom.split.factor} × ${bottom.split.left}: the ${top.split.factor} divides out of both, leaving ${top.split.left} and ${bottom.split.left}.`
      : `${top.text} is on both lines, so it divides out.`;
  const left = SHARED.filter((k) => !struck.includes(k));
  const numbers = numberPair();
  const then =
    left.length === 0
      ? "Nothing is shared any more. Press Check."
      : numbers && left.includes(numbers[0].id)
        ? `One more: what divides both ${numbers[0].text} and ${numbers[1].text}?`
        : "Now the bracket both lines share.";
  return { state: next, pending: null, note: `${said} ${then}` };
}

/** What Check finds: right when every shared factor is struck and nothing else is; otherwise what still divides both. */
export function checkTap(state: TapState): { correct: boolean; lit: PillId[]; diagnosis: string | null } {
  const missing = SHARED.filter((k) => !state.struck.includes(k));
  const extra = state.struck.filter((k) => !SHARED.includes(k));
  const correct = missing.length === 0 && extra.length === 0;
  const numbers = numberPair();
  const brackets = sharedBrackets().filter((p) => missing.includes(p.id) || missing.some((m) => pillOf(m).match === p.match));
  const number = numbers !== null && (missing.includes(numbers[0].id) || missing.includes(numbers[1].id));
  const bracketText = brackets.map((p) => p.text).join(" and ");
  const diagnosis = correct
    ? null
    : brackets.length > 0 && number
      ? `${bracketText} and a factor of ${numbers![0].split!.factor} still divide both lines.`
      : brackets.length > 0
        ? `${bracketText} still divides both lines.`
        : number
          ? `A factor of ${numbers![0].split!.factor} still divides both ${numbers![0].text} and ${numbers![1].text}.`
          : "Something struck was not on both lines.";
  return { correct, lit: missing, diagnosis };
}

/** The line under a right Check: what the two lines shared, and why what is left is the answer. */
export function rightLine(): string {
  const numbers = numberPair();
  const shared = [...sharedBrackets().map((p) => p.text), ...(numbers ? [`a factor of ${numbers[0].split!.factor}`] : [])].join(" and ");
  return `Both lines shared ${shared}. With both gone, ${RESULT.top} and ${RESULT.bottom} share nothing: that is the answer.`;
}

/**
 * g2's test, as its explanation words it: put x = 1 into (x + 4)/x, which gives 5. The drawing prints these numbers and
 * nothing else, and afs-model.test.ts reads g2 from the note on disk: if its question or its explanation ever tests
 * another fraction or another value, that test fails before the picture can contradict the words beside it.
 */
export const SUBSTITUTE = { x: 1, top: "x + 4", bottom: "x", value: 5 } as const;

/** The fraction with the value put in, as the drawing writes it: 1 + 4 over 1. */
export const SUBSTITUTED = {
  top: SUBSTITUTE.top.replace(/x/g, String(SUBSTITUTE.x)),
  bottom: SUBSTITUTE.bottom.replace(/x/g, String(SUBSTITUTE.x)),
} as const;

/**
 * The consequence drawn for gate g2 ("What cancels in this fraction? (x + 4)/x"): put x = 1 into the fraction (5) and
 * into the cancelled version she chose, as the gate's explanation does. "The x, leaving 4" gives 4; "The x and the 4"
 * leaves nothing but 1. On the right answer the drawing shows the tempting route (the x struck, leaving 4) as the reason
 * nothing cancels.
 */
export function substituteFor(hers: string, correct: boolean): { value: string; label: string } {
  const said = hers.replace(/\$/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  if (correct) return { value: "4", label: "the cancelled version" };
  if (/\bx and the 4\b/.test(said)) return { value: "1", label: "your cancelled version" };
  if (/\bleaving 4\b/.test(said)) return { value: "4", label: "your cancelled version" };
  // An option the drawing does not know (the note was reworded): the common wrong route, said as that, not as hers.
  return { value: "4", label: "the cancelled version" };
}
