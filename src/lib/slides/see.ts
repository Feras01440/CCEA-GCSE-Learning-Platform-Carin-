/**
 * The See it block and the gate's twin, as the renderers need them (docs/plan/review/2026-09-27-see-it-block-shape.md;
 * the teach-first case §6 and §8, with the owner's answers of 27 Sep 2026). Pure: Slides (src/lib/slides/cards.ts and
 * src/components/slides) and Read (src/components/items/StepRevealNote.tsx) share every rule here, so one gate and one
 * See it read the same on both ways in.
 *
 * - A See it is resolved to its stem, figure, steps and answer line: written inline, or drawn from a bundle worked
 *   example, whose steps are shown without their why-menu and without their input (a worked example's step inputs
 *   belong to its faded runs; a See it drawn from one is shown, never typed: the lead's clarification of §2).
 * - At most one step she types, never in the topic's first See it (the build's lint says the same).
 * - A gate's twin becomes a gate of its own for the retry before the recap: the same kind, new numbers, its answer moved
 *   off the place where the first asking lit the answer, its own option notes.
 * - A miss re-teaches: the note on the option she chose (V3.1: why it tempts, what is wrong with it), then the
 *   explanation again (the gate's `explain`, which points at the step it rests on, "as step 2 of See it did"), the step
 *   itself where the explanation names one, and then the answer with a line about her choice. Her option's misconception,
 *   when the note names one, is the attempt's tag.
 */
import type { FigureSpec, WorkedExample, WorkedExampleStep } from "@/lib/content/schema";
import { gateOptions, type GateBlock, type GateOptionNote, type GateTwin, type SeeBlock, type SeeKind } from "@/components/items/gates";
import { splitSentences } from "./text";

export interface ResolvedSee {
  /** The example, as the paper would set it. */
  stem: string;
  figure: FigureSpec | null;
  /** Two to six steps, each a working line, its reason and the mark it earns; never a why-menu. */
  steps: WorkedExampleStep[];
  /** The answer line when the last step does not already state it; null otherwise. */
  finalAnswer: string | null;
  /** The worked example it is drawn from, or null for a See it written in the note. */
  workedExample: string | null;
  /**
   * What it shows (V3.1): calculation, explanation, process, practical, data, extended or proof; null when not said (a
   * See it drawn from a worked example, or a note written before V3.1). Every kind renders the same steps today.
   */
  kind: SeeKind | null;
}

type WorkedExampleLike = Pick<WorkedExample, "id" | "stem" | "steps" | "finalAnswer"> & { figure?: FigureSpec };

const squash = (s: string) => s.replace(/\\[dt]frac/g, "\\frac").replace(/[\s$]/g, "");

/** The answer line to print under the steps: none when the last step's working already ends in it. */
function answerLine(finalAnswer: string | undefined, steps: readonly WorkedExampleStep[]): string | null {
  const final = finalAnswer?.trim();
  if (!final) return null;
  const last = steps[steps.length - 1];
  if (last && squash(last.working).endsWith(squash(final))) return null;
  return final;
}

/**
 * The See it to show: the inline block as written, or the named worked example's stem, figure, steps and answer line.
 * Null when the named worked example is not in the bundle given (the build's lint refuses such a note, so a shipped
 * note never has one; a renderer given no worked examples shows nothing rather than an empty card).
 */
export function resolveSee(block: SeeBlock, workedExamples?: readonly WorkedExampleLike[] | null): ResolvedSee | null {
  if ("workedExample" in block && typeof block.workedExample === "string") {
    const we = (workedExamples ?? []).find((w) => w.id === block.workedExample);
    if (!we) return null;
    const steps = we.steps.map(({ whyMenu: _why, input: _input, ...step }) => step);
    return { stem: we.stem, figure: we.figure ?? null, steps, finalAnswer: answerLine(we.finalAnswer, steps), workedExample: we.id, kind: null };
  }
  const inline = block as Extract<SeeBlock, { stem: string }>;
  const steps = (inline.steps ?? []).map(({ whyMenu: _why, ...step }) => step);
  return { stem: inline.stem, figure: inline.figure ?? null, steps, finalAnswer: answerLine(inline.finalAnswer, steps), workedExample: null, kind: inline.kind ?? null };
}

/** The index of the step she types, or null: at most one, and none in the topic's first See it. */
export function typedStep(see: ResolvedSee | null, firstSee: boolean): number | null {
  if (!see || firstSee || see.workedExample !== null) return null;
  const at = see.steps.findIndex((s) => s.input !== undefined);
  return at >= 0 ? at : null;
}

const POINTER = /\bsteps?\s+(\d+(?:\s*(?:,|and|to|-|–)\s*\d+)*)\s+of\s+(?:the\s+)?see\s+it\b/i;

/**
 * The steps a gate's explanation points at, 1-based, in order: "step 2 of See it", "steps 1 and 2 of the See it",
 * "steps 2 to 4 of See it", "steps 1, 3 and 4 of See it". Empty when it names none.
 */
export function stepPointers(explain: string | null | undefined): number[] {
  const m = POINTER.exec(explain ?? "");
  if (!m) return [];
  const out: number[] = [];
  const parts = m[1]!.split(/\s*(,|and)\s*/i).filter((p) => p && !/^(,|and)$/i.test(p));
  for (const part of parts) {
    const range = /^(\d+)\s*(?:to|-|–)\s*(\d+)$/i.exec(part.trim());
    if (range) {
      const [a, b] = [Number(range[1]), Number(range[2])];
      for (let n = Math.min(a, b); n <= Math.max(a, b) && n - Math.min(a, b) < 10; n += 1) out.push(n);
    } else if (/^\d+$/.test(part.trim())) out.push(Number(part.trim()));
  }
  return [...new Set(out)];
}

/** The first step a gate's explanation points at ("Step 2 of See it"), or null. */
export function stepPointer(explain: string | null | undefined): number | null {
  return stepPointers(explain)[0] ?? null;
}

/** A twin may carry notes on its own wrong options (V3.1); read whether or not the type in gates.ts names them yet. */
type TwinWithNotes = GateTwin & { optionNotes?: GateOptionNote[] };

/**
 * The twin as a gate of its own, for the retry before the recap: the gate's kind, its own id, its own options, and
 * its own option notes when it carries them (never the gate's: they are about other numbers).
 */
export function twinGate(gate: GateBlock): GateBlock | null {
  const twin = gate.twin as TwinWithNotes | undefined;
  if (!twin) return null;
  return {
    type: "gate",
    id: `${gate.id}~twin`,
    kind: gate.kind,
    prompt: twin.prompt,
    ...(twin.options && twin.options.length > 0 ? { options: [...twin.options] } : {}),
    answer: twin.answer,
    explain: twin.explain,
    ...(twin.optionNotes && twin.optionNotes.length > 0 ? { optionNotes: twin.optionNotes.map((n) => ({ ...n })) } : {}),
  };
}

/**
 * The note on the option she chose (V3.1: why it tempts and what is wrong with it, one per wrong option), or null: on a
 * choice gate only, matched by the option as written.
 */
export function optionNoteFor(gate: GateBlock, hers: string): GateOptionNote | null {
  if (gate.kind !== "choice" || !gate.optionNotes) return null;
  const mine = hers.trim();
  if (!mine || mine === gate.answer.trim()) return null;
  return gate.optionNotes.find((n) => n.option.trim() === mine) ?? null;
}

/**
 * The one line about her choice in the answer state (the case §6.3; audit LD-22): the note on her option where the gate
 * carries one, else the explanation's own sentence that names it (diagnosisFor), else nothing.
 */
export function lineAbout(gate: GateBlock, hers: string): string | null {
  return optionNoteFor(gate, hers)?.why ?? diagnosisFor(gate.explain, hers);
}

/** A See it's text, flattened for a search: TeX without its delimiters, braces kept, spacing and case gone. */
function flatten(s: string): string {
  return s
    .replace(/\\left|\\right/g, "")
    .replace(/\\[dt]frac/g, "\\frac")
    .replace(/\\,|\\;|\\!|\\ /g, "")
    .replace(/[−–]/g, "-")
    .replace(/\*\*|[$*_]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/**
 * The answer of the Your turn after a See it, if the See it already prints it (the lead's rule of 27 Sep: a See it
 * shows the method, and its Your turn asks it on new numbers or in new words, so the check is recall and not copying).
 * Each accepted answer is looked for in the stem, the steps' working and reasons and the answer line, flattened; a
 * number only as a number of its own (not the "-3" of "x - 3"), and words only three characters long or more. Returns
 * the answer found, or null.
 */
export function seeShowsAnswer(see: ResolvedSee, gate: GateBlock): string | null {
  const parts = [see.stem, ...see.steps.flatMap((s) => [s.working, s.decision]), see.finalAnswer ?? ""];
  const text = flatten(parts.join(" | "));
  // Numbers are looked for with their spacing kept, so a number glued to the next word is still a number of its own.
  const spaced = parts
    .join(" | ")
    .replace(/[$]/g, " ")
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, " ");
  const answers = gate.kind === "choice" ? [gate.answer] : gate.answer.split("|").map((a) => a.trim()).filter(Boolean);
  for (const answer of answers) {
    const a = flatten(answer);
    if (/^-?\d+(?:\.\d+)?$/.test(a)) {
      const escaped = a.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
      // Not part of a longer number or a name ("x-3", "x^{-3}", "210"), and not the tail of a subtraction ("x - 3").
      if (new RegExp(`(?<![\\w.^{}])(?<![-+]\\s)${escaped}(?![\\w.])`).test(spaced)) return answer;
      continue;
    }
    if (a.length >= 3 && text.includes(a)) return answer;
  }
  return null;
}

/** The misconception her option names, for the attempt's tags (the registry's id), or none. */
export function misconceptionTags(gate: GateBlock, hers: string): string[] {
  const id = optionNoteFor(gate, hers)?.misconception;
  return id ? [id] : [];
}

/**
 * A twin's options as shown: its own seeded order, with the answer moved off the place where the first asking lit the
 * gate's answer, so holding it is the idea and not the memory of a position.
 */
export function twinOptions(twin: GateBlock, firstAnswerAt: number | null): string[] {
  const own = gateOptions(twin);
  if (firstAnswerAt === null || own.length < 2) return own;
  const at = own.findIndex((o) => o.trim() === twin.answer.trim());
  if (at < 0 || at !== firstAnswerAt) return own;
  const out = [...own];
  const to = (at + 1) % out.length;
  [out[at], out[to]] = [out[to]!, out[at]!];
  return out;
}

/** TeX and markdown flattened for comparing a formula with the words around it. */
function flat(s: string): string {
  return s
    .replace(/\\left|\\right/g, "")
    .replace(/\\[dt]frac/g, "\\frac")
    .replace(/[−–]/g, "-")
    .replace(/[\s$*_]/g, "")
    .toLowerCase();
}

/**
 * A line about her choice for the answer state (audit LD-22: the miss's words never named her option): the sentence
 * of the explanation that names it, found by its formula (the longest one, if it has three characters or more) or by
 * its words; null when no sentence does.
 */
export function diagnosisFor(explain: string, hers: string): string | null {
  const formulas = [...hers.matchAll(/\$([^$]+)\$/g)].map((m) => flat(m[1]!)).sort((a, b) => b.length - a.length);
  const words = flat(hers.replace(/\$[^$]*\$/g, " "));
  const key = formulas[0] && formulas[0].length >= 3 ? formulas[0] : formulas.length === 0 && words.length >= 4 ? words : null;
  if (!key) return null;
  return splitSentences(explain).find((s) => flat(s).includes(key)) ?? null;
}
