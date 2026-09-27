/**
 * Step-reveal note blocks and gate marking (pure). Nothing after an unanswered gate is
 * visible; answering a gate (right or not) opens the next stretch.
 */
import { checkNumeric, knownUnit } from "@/lib/marking/numeric";
import type { FigureSpec, WorkedExampleStep } from "@/lib/content/schema";
import { isFormula, nameWithFormula, normaliseText } from "./text-marking";

/**
 * A gate's retry before the recap (docs/plan/review/2026-09-27-see-it-block-shape.md §3): the same structure on new
 * numbers, asked when the gate was answered wrongly.
 */
export interface GateTwin {
  prompt: string;
  options?: string[];
  answer: string;
  explain: string;
}

/**
 * The See it block (see-it-block-shape.md §2): our own worked steps, before the section's gate. Written inline, its
 * steps are the schema's WorkedExampleStep; or it names a bundle worked example and the renderer takes the stem,
 * figure, steps (without whyMenu) and final answer from it.
 */
/** What a See it shows: a calculation, an explanation, a process, a practical, data, an extended answer or a proof. */
export type SeeKind = "calculation" | "explanation" | "process" | "practical" | "data" | "extended" | "proof";
export type SeeBlockInline = { type: "see"; stem: string; figure?: FigureSpec; steps: WorkedExampleStep[]; finalAnswer?: string; kind?: SeeKind };

/**
 * Why a wrong option of a choice gate is wrong, shown when she picks it (the independent review of 27 Sep 2026): one
 * note per wrong option at most, never on the answer, the reason in 40 words or fewer, and the misconception it
 * names when there is one.
 */
export interface GateOptionNote {
  option: string;
  why: string;
  misconception?: string;
}
export type SeeBlockReference = { type: "see"; workedExample: string };
export type SeeBlock = SeeBlockInline | SeeBlockReference;

export type NoteBlock =
  /** The first block of a v2 note: what the topic page's hero shows (lede, three "you can" lines, a minute estimate). The lesson itself skips it. */
  | { type: "hero"; lede: string; can: string[]; minutes: number }
  /** A stopping point the app inserts near the lesson's middle: nothing to answer, a place to leave off. */
  | { type: "pause" }
  | { type: "p"; md: string }
  | { type: "h"; text: string }
  | {
      type: "gate";
      id: string;
      kind: "blank" | "choice" | "number";
      prompt: string;
      options?: string[];
      /** Accepted answer; `blank` gates may list alternatives separated by " | ". */
      answer: string;
      explain: string;
      /** The retry before the recap, asked when the gate was answered wrongly (see-it-block-shape.md §3). */
      twin?: GateTwin;
      /** A choice gate's notes on its wrong options, shown when one is picked (GateOptionNote). */
      optionNotes?: GateOptionNote[];
    }
  | SeeBlock
  | { type: "callout"; kind: "spec" | "mustknow" | "notonspec" | "examiner" | "why"; title?: string; md: string; source?: string }
  | { type: "figure"; alt: string; svg?: string; caption?: string }
  | { type: "photo"; src: string; alt: string; credit: string; licence: string; licenceUrl?: string; sourceUrl?: string; caption?: string; prompt?: string }
  | { type: "video"; videoId: string; title: string; channel: string; start?: number; end?: number; why?: string; corbettmathsNumber?: number }
  | { type: "sim"; provider: "phet" | "geogebra"; url: string; title: string; attribution: string; licence: string; task?: string; height?: number }
  | { type: "prompt"; promptId: string };

export type GateBlock = Extract<NoteBlock, { type: "gate" }>;

export interface VisibleNote {
  blocks: NoteBlock[];
  /** The gate the learner must answer before more of the note renders, if any. */
  pendingGate: GateBlock | null;
  /** Gates (answered or not) in the whole note. */
  gatesTotal: number;
  gatesAnswered: number;
}

export function visibleBlocks(blocks: readonly NoteBlock[], answered: ReadonlySet<string>): VisibleNote {
  const out: NoteBlock[] = [];
  let pendingGate: GateBlock | null = null;
  let gatesTotal = 0;
  let gatesAnswered = 0;
  for (const b of blocks) {
    if (b.type === "gate") gatesTotal += 1;
    if (pendingGate) continue;
    out.push(b);
    if (b.type === "gate") {
      if (answered.has(b.id)) gatesAnswered += 1;
      else pendingGate = b;
    }
  }
  return { blocks: out, pendingGate, gatesTotal, gatesAnswered };
}

/** Alternatives for a blank gate: "area | areas" → ["area", "areas"]. */
export function gateAlternatives(answer: string): string[] {
  return answer
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * The unit a number gate's prompt asks for, from its closing "in <unit>" ("… in milliamps?", "… in joules?", "(in A)"),
 * as the numeric marker writes it; null when the prompt names none the marker knows.
 */
export function gateUnit(prompt: string): string | null {
  const m = /\bin ([A-Za-zµΩ£%°²³/ ]{1,24}?)\)?\s*[?.:]?\s*$/.exec(prompt.trim());
  if (!m) return null;
  const words = m[1]!.trim();
  return knownUnit(words) ?? knownUnit(words.replace(/^(?:the )?(?:unit )?/i, ""));
}

export function markGate(gate: GateBlock, raw: string): boolean {
  const typed = raw.trim();
  if (typed.length === 0) return false;
  switch (gate.kind) {
    case "choice": {
      // A choice gate is answered by picking an option, so the option picked is compared, by its exact text or its
      // position, never a normalised spelling: two options can differ only in brackets or in case ("(4x + 1) log 2 = …"
      // against "4x + 1 log 2 = …"; "it is Bb" against "it is BB"), and normalising read the wrong one as right (engine
      // item 15, 23 Sep 2026). Every choice gate's answer is one of its options, as written (741 of 741 on 23 Sep).
      const options = (gate.options ?? []).map((o) => o.trim());
      const picked = options.includes(typed) ? typed : /^\d+$/.test(typed) ? (options[Number(typed)] ?? null) : null;
      return (picked ?? typed) === gate.answer.trim();
    }
    case "number": {
      // The unit the prompt asks for ("What current flows, in milliamps?"): an answer in another unit of the same kind
      // is converted ("0.025 A" for 25 mA, "72 kJ" for 72 000 J, "£1.20" for 120p), and one of another kind is wrong
      // ("0.15 mA" where amps are asked; the P2 C review, F05, 25 Sep 2026). A bare number is read in the asked unit.
      const unit = gateUnit(gate.prompt);
      return gateAlternatives(gate.answer).some((alt) => checkNumeric(typed, unit ? { value: alt, unit, requireUnit: false } : { value: alt }).correct);
    }
    case "blank": {
      const t = normaliseText(typed);
      // A name given with its formula (C2 D F04, 24 Sep 2026): where the gate asks for the name the formula beside it
      // is ignored, and where it asks for a formula the name is, as CCEA's general marking instructions read.
      const pair = nameWithFormula(typed);
      return gateAlternatives(gate.answer).some((alt) => {
        if (normaliseText(alt) === t) return true;
        if (pair && normaliseText(isFormula(alt) ? pair.formula : pair.name) === normaliseText(alt)) return true;
        // A numeric blank ("n ÷ 2 = __") accepts equivalent numeric spellings.
        return /^[-+\d.,/√π^ ]+$/.test(alt) && checkNumeric(typed, { value: alt }).correct;
      });
    }
  }
}

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

/**
 * A choice gate's options in the order they are shown: shuffled, seeded by the gate, so the order is the same every
 * time she meets the gate and on every device. Authors list the answer first (733 of the 741 choice gates on 23 Sep
 * 2026), so "always A" was a pattern she could learn instead of the idea (engine item 11). The seed is the gate's id
 * with its prompt, because ids repeat from topic to topic ("g1", "g2"): the id alone would shuffle every g1 alike.
 * Marking is by the option picked (`markGate`), so the order changes nothing about what is right.
 */
export function gateOptions(gate: GateBlock): string[] {
  const options = [...(gate.options ?? [])];
  const next = seeded(hash(`${gate.id}|${gate.prompt}`));
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [options[i], options[j]] = [options[j]!, options[i]!];
  }
  return options;
}

/** Rough word count of the prose between gates, to keep stretches short (≤150 words). */
export function wordsBetweenGates(blocks: readonly NoteBlock[]): number[] {
  const counts: number[] = [];
  let run = 0;
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
  for (const b of blocks) {
    if (b.type === "p" || b.type === "callout") run += words(b.md);
    else if (b.type === "h") run += words(b.text);
    else if (b.type === "gate") {
      counts.push(run);
      run = 0;
    }
  }
  counts.push(run);
  return counts;
}
