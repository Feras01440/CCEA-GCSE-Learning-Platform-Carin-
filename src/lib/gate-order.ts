/**
 * The order a choice gate's options are shown in, decided for the whole lesson at once.
 *
 * Why (the owner's trial, 24 Sep 2026): "most of the correct answers are option A and some are option B". Authors
 * list the answer first (739 of the 747 choice gates on 24 Sep), and the per-gate seeded shuffle (`gateOptions`,
 * engine item 11) moved it, but a shuffle of each gate alone is a coin toss per gate: on the trial topic it left five
 * of seven answers at A and none at C. A pattern she can learn in one lesson is a pattern she will use instead of the
 * idea. So the positions are balanced across the lesson's gates, the way a careful setter balances a paper:
 *
 *  - the right answer's position is spread as evenly as the gates allow (a two-option gate can only be A or B);
 *  - no position takes three gates in a row where a swap can avoid it;
 *  - the wrong options keep the gate's own seeded order around the answer, so each gate still looks like itself;
 *  - it is a pure function of the lesson's gates (their ids and prompts seed it), so the same gate is shown in the same
 *    order in Slides, in Read and on every device, with no stored state. The gates' own text is the key rather than the
 *    topic id because the renderer that shares it (StepRevealNote) is given the note, not the topic; ids repeat from
 *    topic to topic ("g1") but ids with their prompts do not;
 *  - a lesson with one choice gate shows it exactly as `gateOptions` always has.
 *
 * Marking never sees any of this: a gate is marked by the option picked (`markGate`), and the option's value is the
 * authored text, so moving it changes nothing about what is right or what is recorded.
 *
 * The safety net (audit LD-01): an explanation written as "the second option … the third …" is only true in the order
 * it was written in. A gate whose explanation names an option by its place is shown in its AUTHORED order, never
 * shuffled or balanced, so the words stay true; the balance then works around it. `positionalWording` finds those
 * sentences; the list for the content session to reword is generated from it.
 */
import { gateOptions, type GateBlock } from "@/components/items/gates";

/* ------------------------------------------------------------------------------------------------------------------ */
/* Positional wording                                                                                                 */

const ORDINAL = "first|second|third|fourth|middle|last|final";

/** "The second option …", "the third answer …", "the middle option …", "the first alternative …". */
const NAMED = new RegExp(`\\b(?:${ORDINAL})\\s+(?:options?|answers?|alternatives?)\\b`, "i");

/** "option B", "answer (c)": an option by the letter its badge prints. The letter is a capital, or a letter in brackets. */
const LETTERED = /\b(?:[Oo]ptions?|[Aa]nswers?|[Cc]hoices?)\s+(?:[A-D]|\([A-Da-d]\))(?![A-Za-z0-9])/;

/** "the one above", "the option below": an option by where it stands in the list. */
const ABOVE_BELOW = /\bthe\s+(?:one|option|answer)\s+(?:above|below)\b/i;

/**
 * An ordinal standing in for an option, followed at once by what that option does: "The second gives w² − 100; the
 * third has a middle term", "Only the first is a power", "the last one describes two transformations". An ordinal
 * followed by a noun ("the first mark", "the second bracket", "the third decimal") or by nothing ("gives you the
 * third,", "earns the last one.") is about something else, and is not matched: every sentence of every choice gate's
 * explanation in the 184 notes that holds an ordinal was read before this list was settled (24 Sep 2026).
 */
const DOES = [
  "is", "are", "was", "were", "has", "have", "had", "does", "did", "would", "could", "might", "may", "must", "should", "will", "can", "cannot",
  "gives", "gave", "uses", "used", "stops", "stopped", "leaves", "left", "adds", "added", "halves", "halved", "doubles", "doubled",
  "turns", "turned", "reads", "forgets", "forgot", "multiplies", "multiplied", "divides", "divided", "subtracts", "subtracted",
  "changes", "changed", "describes", "described", "keeps", "kept", "obeys", "obeyed", "moves", "moved", "takes", "took", "puts",
  "writes", "wrote", "misses", "missed", "ignores", "ignored", "confuses", "confused", "treats", "treated", "counts", "counted",
  "applies", "applied", "makes", "made", "says", "said", "names", "named", "mixes", "mixed", "drops", "dropped", "flips", "flipped",
  "inverts", "inverted", "cancels", "cancelled", "expands", "expanded", "strikes", "struck", "swaps", "swapped", "squares", "squared",
  "roots", "rooted", "misreads", "runs", "ran", "answers", "answered", "comes", "came", "goes", "went", "looks", "looked", "assumes",
  "assumed", "rounds", "rounded", "finds", "found", "calculates", "calculated", "works", "worked", "reverses", "reversed", "omits",
  "omitted", "loses", "lost", "sets", "gets", "got", "shows", "showed", "matches", "matched", "repeats", "repeated", "copies",
  "copied", "contains", "contained", "includes", "included", "lacks", "lacked", "mistakes", "mistook", "confuses", "prices",
  "also", "only", "still", "just", "instead", "wrongly", "simply", "never", "again",
].join("|");
const PRONOUN = new RegExp(`\\bthe\\s+(?:${ORDINAL})(?:\\s+one)?\\s+(?:${DOES})\\b`, "i");

const POSITIONAL = [NAMED, LETTERED, ABOVE_BELOW, PRONOUN];

/** The sentences of a line of prose, cut after . ! or ? and a space, never inside `$…$`. */
function sentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  let inMaths = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "\\") {
      i += 1;
      continue;
    }
    if (ch === "$") {
      inMaths = !inMaths;
      continue;
    }
    if (!inMaths && (ch === "." || ch === "!" || ch === "?") && /\s/.test(text[i + 1] ?? "")) {
      out.push(text.slice(start, i + 1).trim());
      start = i + 1;
    }
  }
  const rest = text.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}

/**
 * The sentences of a gate's explanation that name an option by its place ("The second option is that same line before
 * any cancelling; the third strikes out the two x² terms"). Such a sentence is true only in the order the options were
 * written in.
 */
export function positionalSentences(explain: string | null | undefined): string[] {
  if (!explain) return [];
  return sentences(explain).filter((s) => POSITIONAL.some((re) => re.test(s)));
}

/** The first sentence of an explanation that names an option by its place, or null when it names none. */
export function positionalWording(explain: string | null | undefined): string | null {
  return positionalSentences(explain)[0] ?? null;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* The balance                                                                                                        */

/** FNV-1a, 32-bit: a stable number from a string. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded generator, the same sequence for the same seed. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type ChoiceGate = GateBlock & { kind: "choice"; options: string[] };

function isChoiceGate(b: unknown): b is ChoiceGate {
  if (typeof b !== "object" || b === null) return false;
  const g = b as Partial<GateBlock>;
  return g.type === "gate" && g.kind === "choice" && typeof g.id === "string" && Array.isArray(g.options) && g.options.length >= 2;
}

/** Where the authored answer sits among the authored options, compared as `markGate` compares them. -1 if absent. */
function authoredAnswerAt(gate: ChoiceGate): number {
  return gate.options.map((o) => o.trim()).indexOf(gate.answer.trim());
}

/** The options with the answer moved to `at` and the rest in `around`'s order (the answer taken out of it). */
function placeAnswer(gate: ChoiceGate, around: readonly string[], at: number): string[] {
  const answer = gate.answer.trim();
  const rest = [...around];
  const i = rest.findIndex((o) => o.trim() === answer);
  const [picked] = rest.splice(i, 1);
  rest.splice(Math.min(at, rest.length), 0, picked!);
  return rest;
}

/** How many times a position is used three gates running (a run of four counts twice), over the gates that take part. */
function triples(target: readonly number[]): number {
  const live = target.filter((t) => t >= 0);
  let n = 0;
  for (let i = 2; i < live.length; i += 1) if (live[i] === live[i - 1] && live[i] === live[i - 2]) n += 1;
  return n;
}

export interface GatePlacement {
  /** The options in the order they are shown. */
  order: string[];
  /** Where the right answer is shown, 0-based (A is 0). -1 when the gate's answer is not one of its options. */
  answerAt: number;
  /** Shown as authored because the explanation names options by their place. */
  pinned: boolean;
}

/**
 * The shown order of every choice gate in a lesson, by gate id. `blocks` is the note (or any list holding its gates, in
 * order): everything that is not a choice gate with two or more options is ignored, so the note as Read renders it and
 * the gates as Slides deals them give the same answer.
 */
export function deckGatePlacements(blocks: readonly unknown[] | null | undefined): Map<string, GatePlacement> {
  const gates: ChoiceGate[] = [];
  const seen = new Set<string>();
  for (const b of blocks ?? []) {
    if (!isChoiceGate(b) || seen.has(b.id)) continue;
    seen.add(b.id);
    gates.push(b);
  }
  const out = new Map<string, GatePlacement>();
  if (gates.length === 0) return out;

  const authoredAt = gates.map(authoredAnswerAt);
  const pinned = gates.map((g) => positionalWording(g.explain) !== null);
  const own = gates.map((g) => gateOptions(g));

  // One choice gate: exactly the order it always had (its own seeded shuffle), or its authored order if it must keep it.
  if (gates.length === 1) {
    const g = gates[0];
    const order = pinned[0] ? [...g.options] : own[0];
    out.set(g.id, { order, answerAt: order.map((o) => o.trim()).indexOf(g.answer.trim()), pinned: pinned[0] });
    return out;
  }

  const rand = seeded(hash(gates.map((g) => `${g.id}|${g.prompt}`).join("\n")));
  const width = Math.max(...gates.map((g) => g.options.length));
  const counts = Array.from({ length: width }, () => 0);
  // The answer's position per gate: fixed for a pinned gate, chosen for a free one, -1 when the gate cannot take part.
  const target = gates.map((_, i) => (pinned[i] ? authoredAt[i] : -1));
  target.forEach((t) => {
    if (t >= 0) counts[t] += 1;
  });

  // Free gates, the most constrained first (fewest options), in a seeded order within the same width. Each takes the
  // position it can hold that has been used least so far, ties broken by the seed: the counts end as even as they can be.
  const free = gates
    .map((g, i) => ({ i, k: g.options.length, key: rand() }))
    .filter(({ i }) => !pinned[i] && authoredAt[i] >= 0)
    .sort((a, b) => a.k - b.k || a.key - b.key);
  for (const { i, k } of free) {
    const least = Math.min(...counts.slice(0, k));
    const candidates = counts.slice(0, k).flatMap((c, p) => (c === least ? [p] : []));
    const p = candidates[Math.floor(rand() * candidates.length)]!;
    target[i] = p;
    counts[p] += 1;
  }

  // No position three gates running where swapping two free gates' positions can prevent it. The counts do not change,
  // only which gate holds which position; each accepted swap removes at least one run of three, so this ends.
  const canHold = (i: number, p: number) => p < gates[i].options.length;
  const movable = gates.map((_, i) => i).filter((i) => !pinned[i] && target[i] >= 0);
  while (triples(target) > 0) {
    const before = triples(target);
    const pairs = movable
      .flatMap((a) => movable.filter((b) => b > a && target[a] !== target[b] && canHold(a, target[b]) && canHold(b, target[a])).map((b) => ({ a, b, key: rand() })))
      .sort((x, y) => x.key - y.key);
    const better = pairs.find(({ a, b }) => {
      const trial = [...target];
      [trial[a], trial[b]] = [trial[b], trial[a]];
      return triples(trial) < before;
    });
    if (!better) break;
    [target[better.a], target[better.b]] = [target[better.b], target[better.a]];
  }

  gates.forEach((g, i) => {
    if (pinned[i]) {
      out.set(g.id, { order: [...g.options], answerAt: authoredAt[i], pinned: true });
    } else if (target[i] < 0) {
      // The answer is not one of the options (never true in the published notes): shown as it always was.
      out.set(g.id, { order: own[i], answerAt: -1, pinned: false });
    } else {
      out.set(g.id, { order: placeAnswer(g, own[i], target[i]), answerAt: target[i], pinned: false });
    }
  });
  return out;
}

/**
 * How an option's maths is set, in Slides and in Read alike: a stacked fraction at text size (`\dfrac`), because the
 * answers must be as legible as the question (audit LD-16: Read set them at scriptstyle, 13.9 px under a 28 px stem).
 * Display only: the authored string stays the option's value, so marking and the record never see the change.
 */
export function optionTex(option: string): string {
  return option.replace(/\\frac\{/g, "\\dfrac{");
}

/** The shown order of every choice gate in a lesson, by gate id (see `deckGatePlacements`). */
export function deckGateOrders(blocks: readonly unknown[] | null | undefined): Map<string, string[]> {
  return new Map([...deckGatePlacements(blocks)].map(([id, p]) => [id, p.order]));
}

/**
 * One gate's options as shown: its place in the lesson's balance when the lesson is known, else its own order (the
 * authored one when its explanation names options by their place, otherwise its seeded shuffle).
 */
export function shownOptions(gate: GateBlock, orders?: ReadonlyMap<string, readonly string[]> | null): string[] {
  const inDeck = orders?.get(gate.id);
  if (inDeck && gate.options && inDeck.length === gate.options.length) return [...inDeck];
  return deckGateOrders([gate]).get(gate.id) ?? [...(gate.options ?? [])];
}

/**
 * The order for a gate asked a second time (Slides' "Once more" before the recap): the answer moved off the place it was
 * lit in minutes earlier, so holding it is the idea and not the memory of a position, and the other options turned
 * round. A gate whose explanation names options by their place keeps its authored order here too.
 */
export function retryOrder(gate: GateBlock, first: readonly string[]): string[] {
  if (!isChoiceGate(gate) || positionalWording(gate.explain) !== null) return [...first];
  const answer = gate.answer.trim();
  const was = first.findIndex((o) => o.trim() === answer);
  if (was < 0) return [...first];
  const places = first.map((_, p) => p).filter((p) => p !== was);
  const rand = seeded(hash(`${gate.id}|${gate.prompt}|retry`));
  const to = places[Math.floor(rand() * places.length)]!;
  const others = first.filter((o) => o.trim() !== answer).reverse();
  others.splice(to, 0, first[was]!);
  return others;
}
