/**
 * The minute model: how long a lesson honestly takes, the one number she reads in each way in (29 Sep 2026, the minutes
 * agent; the teach-first case §6.6 and §8.2-§8.4). Read (src/components/topic/lesson-plan.ts: the hero's Read line, the
 * track, the Contents and each section's label) and Slides (src/lib/slides/cards.ts: the hero's Slides line, the Start
 * button and the title card) both price the lesson here and nowhere else, and the content session's lint
 * (scripts/qa/lesson-v2.mjs) can import `lessonMinutesFor` to print the same numbers. Pure: no React, no DOM, no clock,
 * no file system; its imports are three pure siblings (./lesson-blocks, ./recall, ./enrichment) and types.
 *
 * WHAT SHE IS DOING, PRICED BY CONTENT, THE SAME IN BOTH WAYS
 *  - Reading: WORDS_PER_MINUTE = 180, a careful reading pace for study text (the learner review of 13 Sep 2026). Words
 *    are counted by `countWords`: a span of maths ($…$ or $$…$$) is one word, markdown markers are not words. Read at
 *    this pace: every paragraph, every callout's body (its title is a label), every heading as she sees it (the authored
 *    "3." is dropped, as both ways drop it), the recap's lines ("You can now") and the pointer's words ("In the exam").
 *  - A See it: SEE_STEP_SECONDS = 15 a step (the teach-first case §8.3): its own steps, or the steps of the bundle's
 *    worked example it names; a named example the bundle does not hold has no steps to count, so it costs nothing.
 *  - A Your turn (a gate): YOUR_TURN_SECONDS = 40: read the question, answer, read the verdict.
 *  - A recall card, and a retrieval prompt placed in the note: RECALL_SECONDS = 30: recall a line, see the answer,
 *    grade it. Each way prices the prompts it shows: Read every placed prompt the bundle holds (InlinePrompt), Slides
 *    the at most two light ones it keeps as recall cards (./recall.ts chooseRecall).
 *  - A figure, a photo or a simulation in the lesson: FIGURE_LOOK_SECONDS = 20, the look she gives it (its caption and
 *    labels are not counted as words). The note's first figure is the hero's (the Slides title card's): it is not in
 *    the lesson and costs nothing. A simulation is priced as a look: the play is hers, and its length is not stated.
 *  - A figure to act on (Slides only: a registered interaction card, ./enrichment.ts): FIGURE_TO_ACT_ON_MINUTES = 1, a
 *    whole minute of her own moves, added to the deck's minutes outside the parts.
 *  - A video: its own length when its block states one (`end`, less `start`); one that states none is never guessed
 *    into the minutes: it is named beside them ("plus a video", `untimedPhrase`).
 *  - Nothing is floored card by card: a short card costs what it shows. (Until 29 Sep the deck charged every card at
 *    least 20 s and every figure 20 s while the page charged a figure nothing, and the recap a flat 20 s: the same lesson
 *    was priced two ways. Now a card and the block it is made from cost the same.)
 *
 * PARTS AND ROUNDING
 *  A lesson is priced part by part: a part is what follows one of the note's headings, up to the next (the opening
 *  before the first heading belongs to the first part), exactly the sections Read numbers ("1 of 9"). A part is its
 *  words and its seconds, kept apart as whole numbers so that two ways that meet the same things add the same integers.
 *  The lesson's minutes are all of its work added and rounded ONCE to the nearest minute (a half rounds up), never
 *  fewer than its parts and never under one (`lessonTotal`). Read's section rows are that total shared out
 *  (`partShares`): each part its own work rounded, never under a minute, then moved by a minute where needed, the part
 *  nearest to rounding the other way first, so the rows the Contents lists add up to the total the hero and the track
 *  print. (Until 29 Sep each section was rounded on its own, at least a minute, and the lesson was their sum: on the FM3
 *  Venn diagrams note that is 20 for 18.1 minutes of work, two minutes of rounding and none of work; the lead's cases.)
 *
 * THE TWO WAYS, AND THE ONE DIFFERENCE ALLOWED BETWEEN THEM
 *  Read's minutes and Slides' minutes for the same note differ only by what one way shows and the other does not:
 *   - Slides adds a minute for each figure to act on (the only card Slides adds that costs anything: the title and the
 *     close are the hero's promise and its end, and cost nothing, as the hero does in Read);
 *   - Read shows every prompt the note places, Slides only the recall cards it keeps (at most two, each light), so a
 *     prompt Slides leaves out is 30 s Read has and Slides has not, which moves the rounded total by a minute or none;
 *   - a part Slides shows nothing of (a heading over prompts it leaves out) is not one of its parts.
 *  Every other part is priced identically, word for word and second for second (minutes.test.ts proves it over every
 *  note in packs/).
 *
 * AFTER THE LESSON (the topic page's later stages, lesson-plan.ts re-exports these): a worked example 2 minutes, a
 *  check item 1, an exam mark 1.2 (the CCEA pace with its reading), a find-the-mistake item 2, reading at 180 wpm; each
 *  stage at least a minute.
 */
import type { RetrievalPrompt } from "@/lib/content/schema";
import type { Card } from "./cards";
import { enrichmentFor } from "./enrichment";
import { closingRoleOf, ledeOf, lessonBlocks } from "./lesson-blocks";
import { chooseRecall, shownPrompts } from "./recall";

// ---------------------------------------------------------------------------------------------------------------------
// The constants (each explained in the header above)
// ---------------------------------------------------------------------------------------------------------------------

/** Reading pace for every explanation block, heading, recap line and pointer word. */
export const WORDS_PER_MINUTE = 180;
/** A See it, a step: its own steps or its named worked example's. */
export const SEE_STEP_SECONDS = 15;
/** A Your turn (a gate): read it, answer it, read the verdict. */
export const YOUR_TURN_SECONDS = 40;
/** A recall card in Slides, a retrieval prompt placed in the note in Read. */
export const RECALL_SECONDS = 30;
/** A figure, photo or simulation in the lesson (never the hero's own figure). */
export const FIGURE_LOOK_SECONDS = 20;
/** A figure she acts on (Slides' interaction card): a whole minute, added outside the parts. */
export const FIGURE_TO_ACT_ON_MINUTES = 1;
/** After the lesson: a worked example is read, tried and checked. */
export const WORKED_EXAMPLE_MINUTES = 2;
/** After the lesson: a check item is one question with its feedback. */
export const CHECK_ITEM_MINUTES = 1;
/** After the lesson: an exam mark, the CCEA pace with the reading. */
export const MINUTES_PER_MARK = 1.2;
/** After the lesson: find the line, then write the fix. */
export const FIND_THE_MISTAKE_MINUTES = 2;

// ---------------------------------------------------------------------------------------------------------------------
// Measures
// ---------------------------------------------------------------------------------------------------------------------

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null;
const typeOf = (b: unknown): string => (isObject(b) && typeof b.type === "string" ? b.type : "");
const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** Words in a content string; a TeX span counts as one word, markers do not count at all. */
export function countWords(text: string): number {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, " x ")
    .replace(/\$[^$\n]*\$/g, " x ")
    .replace(/[*_`#>|]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** A heading's words as she reads it: the authored number ("3.") dropped, as both ways print it. */
export function headingWords(heading: string): number {
  return countWords(heading.trim().replace(/^\d+\s*[.):]\s*/, ""));
}

/** How long a video block runs, when the note says so (its `end`, less its `start`), or null: a length is never guessed. */
export function videoSeconds(block: unknown): number | null {
  if (!isObject(block) || block.type !== "video" || typeof block.end !== "number") return null;
  return Math.max(0, block.end - (typeof block.start === "number" ? block.start : 0));
}

/** A worked example's step count by its id, for a See it that names one (`{ type: "see", workedExample }`). */
export type SeeSteps = Readonly<Record<string, number>>;

/** The step counts a bundle's worked examples give the See its that name them. */
export function seeStepsOf(workedExamples: ReadonlyArray<{ id: string; steps: readonly unknown[] }> | null | undefined): SeeSteps {
  return Object.fromEntries((workedExamples ?? []).map((w) => [w.id, w.steps.length]));
}

/** The steps a See it block shows: those of the worked example it names (none when `steps` does not hold it), else its own. */
export function seeStepCount(block: unknown, steps: SeeSteps = {}): number {
  if (!isObject(block)) return 0;
  if ("workedExample" in block && typeof block.workedExample === "string") return steps[block.workedExample] ?? 0;
  return Array.isArray(block.steps) ? block.steps.length : 0;
}

// ---------------------------------------------------------------------------------------------------------------------
// Costs: words and seconds, kept apart and whole
// ---------------------------------------------------------------------------------------------------------------------

/** What something she meets costs: the words she reads, at WORDS_PER_MINUTE, and the seconds of everything else. */
export interface Cost {
  words: number;
  seconds: number;
}

const NONE: Cost = { words: 0, seconds: 0 };
const reading = (words: number): Cost => ({ words, seconds: 0 });
const timed = (seconds: number): Cost => ({ words: 0, seconds });
const plus = (a: Cost, b: Cost): Cost => ({ words: a.words + b.words, seconds: a.seconds + b.seconds });

/**
 * The model's whole unit: a third of a second at 180 words a minute, so a word is 60 units and a second is 180. Costs
 * are added in units and divided once, so a sum that lands on a half rounds the same whichever order it was added in.
 */
const UNITS_PER_MINUTE = 60 * WORDS_PER_MINUTE;
const unitsOf = (words: number, seconds: number): number => words * 60 + seconds * WORDS_PER_MINUTE;

/** A cost in seconds, for a reader who wants one number (a card's own, in a test); the model itself adds costs whole. */
export function costSeconds(cost: Cost): number {
  return (cost.words * 60) / WORDS_PER_MINUTE + cost.seconds;
}

/** Minutes for some reading, some Your turns and some other timed work, rounded to whole minutes and never less than one. */
export function estimateMinutes(words: number, gates = 0, seconds = 0): number {
  return Math.max(1, Math.round(unitsOf(words, gates * YOUR_TURN_SECONDS + seconds) / UNITS_PER_MINUTE));
}

/** Whole minutes as a phrase prints them: rounded, never under one. */
export function wholeMinutes(minutes: number): number {
  return Math.max(1, Math.round(minutes));
}

/** How a way into the lesson decides which placed prompts it shows (and so prices). */
export interface PriceContext {
  /** Step counts of the bundle's worked examples, for a See it that names one. */
  steps?: SeeSteps;
  /** Whether this way shows the placed prompt with this id; left out, every placed prompt is shown. */
  prompt?: (promptId: string) => boolean;
}

/**
 * Read's pricing: a See it by `steps`; a placed prompt when the lesson asks it. Given the lesson with the bundle's
 * `prompts`, that is the ones Slides keeps (recall.ts shownPrompts: the lead's ruling of 29 Sep 2026, Read shows only
 * the prompts Slides keeps); given the prompts alone, any the bundle holds (InlinePrompt draws nothing for one it does
 * not); given neither, every placed prompt.
 */
export function readPricing(steps?: SeeSteps, prompts?: readonly RetrievalPrompt[] | null, lesson?: readonly unknown[] | null): PriceContext {
  if (prompts && lesson) {
    const shown = new Set<string>(shownPrompts(lesson, prompts).map((p) => p.id));
    return { steps, prompt: (id) => shown.has(id) };
  }
  const held = prompts ? new Set<string>(prompts.map((p) => p.id)) : null;
  return { steps, prompt: held ? (id) => held.has(id) : undefined };
}

/**
 * What one note block costs in the lesson (a heading is priced with its part, by `lessonTotal` and `partShares`; the
 * hero and a pause are not in the lesson). Read prices its lesson with this; Slides prices each card with `cardCost`,
 * and the two agree block for card (minutes.test.ts).
 */
export function blockCost(block: unknown, ctx: PriceContext = {}): Cost {
  const b = isObject(block) ? block : {};
  switch (typeOf(block)) {
    case "p":
    case "callout":
      return reading(countWords(str(b.md)));
    case "figure":
    case "photo":
    case "sim":
      return timed(FIGURE_LOOK_SECONDS);
    case "video":
      return timed(videoSeconds(block) ?? 0);
    case "see":
      return timed(seeStepCount(block, ctx.steps) * SEE_STEP_SECONDS);
    case "gate":
      return timed(YOUR_TURN_SECONDS);
    case "prompt":
      return !ctx.prompt || ctx.prompt(str(b.promptId)) ? timed(RECALL_SECONDS) : NONE;
    default:
      return NONE;
  }
}

/**
 * What a Slides card costs: the block it is made from, priced as `blockCost` prices it. An idea card is its piece of the
 * paragraph (and the figure standing on it); the recap and pointer cards are their words (and the pointer's drawing;
 * their heading is their part's). The figure to act on is a minute of its own, which `slidesMinutes` adds outside the
 * parts; here it reads as its sixty seconds. The title and the close cost nothing.
 */
export function cardCost(card: Card): Cost {
  switch (card.kind) {
    case "title":
    case "close":
      return NONE;
    case "idea":
      return plus(reading(card.words), card.figure ? timed(FIGURE_LOOK_SECONDS) : NONE);
    case "callout":
      return reading(countWords(card.block.md));
    case "media":
      return card.block.type === "video" ? timed(videoSeconds(card.block) ?? 0) : timed(FIGURE_LOOK_SECONDS);
    case "see":
      return timed((card.see?.steps.length ?? 0) * SEE_STEP_SECONDS);
    case "gate":
      return timed(YOUR_TURN_SECONDS);
    case "interaction":
      return timed(FIGURE_TO_ACT_ON_MINUTES * 60);
    case "recap":
      return reading(countWords(card.lines.join("\n")));
    case "pointer":
      // A drawing straight before the pointer's words stands on its card (cards.ts), as a figure on an idea card.
      return plus(reading(countWords(card.md)), card.figure ? timed(FIGURE_LOOK_SECONDS) : NONE);
    case "recall":
      return timed(RECALL_SECONDS);
  }
}

/** A card's cost in seconds (the deck's minutes are added from `cardCost`, part by part, never from this). */
export function cardSeconds(card: Card): number {
  return costSeconds(cardCost(card));
}

// ---------------------------------------------------------------------------------------------------------------------
// Parts and rounding
// ---------------------------------------------------------------------------------------------------------------------

/** Which part a Slides card stands in: the part's number as Read numbers its sections (1-based), and its heading. */
export interface PartRef {
  n: number;
  /** The heading that opens the part, as authored; "" for a note with no heading. */
  heading: string;
}

/** A part's cost: its heading (read with its words, `partWords`), the words read in it and the seconds of everything else. */
export interface PartCost {
  heading: string;
  words: number;
  seconds: number;
}

/**
 * A part of the lesson: what follows one heading of the note, up to the next; the opening before the first heading
 * belongs to the first part. `cards` says whether Slides shows anything of it (a card, or a figure standing on one): a
 * part that shows nothing is not in the deck's minutes.
 */
export interface LessonPart extends PartCost {
  gateIds: string[];
  /** Videos in it with no stated length: named beside the minutes, never timed. */
  untimedVideos: number;
  cards: boolean;
}

/** A part's work in units: its heading (as she reads it) and its words, and its seconds. */
const partUnits = (part: PartCost): number => unitsOf(partWords(part), part.seconds);

/** A part's own work in minutes (unrounded): what its row in the Contents is shared out from. */
export function partWork(part: PartCost): number {
  return partUnits(part) / UNITS_PER_MINUTE;
}

/** The words read in a part: its heading as she reads it, and the words under it. */
export function partWords(part: PartCost): number {
  return headingWords(part.heading) + part.words;
}

/**
 * A lesson in minutes: all its parts' work added and rounded once to the nearest minute; never fewer minutes than it
 * has parts (a part is never under a minute), never under one; then any whole minutes on top (Slides' figures to act on).
 */
export function lessonTotal(parts: readonly PartCost[], extraMinutes = 0): number {
  const units = parts.reduce((n, p) => n + partUnits(p), 0);
  return Math.max(1, parts.length, Math.round(units / UNITS_PER_MINUTE)) + extraMinutes;
}

/**
 * Each part's share of `lessonTotal(parts)`, in order: its own work rounded to the nearest minute and never under one,
 * then, while the shares add up to less than the total, a minute more for the part whose work is furthest above its
 * share, and while they add up to more, a minute less for the part (above one) whose share is furthest above its work;
 * the earlier part first on a tie. So the rows add up to the lesson's minutes and each stays as near its own work as
 * that allows.
 */
export function partShares(parts: readonly PartCost[]): number[] {
  const work = parts.map(partWork);
  const shares = work.map((w) => Math.max(1, Math.round(w)));
  const total = parts.length === 0 ? 0 : lessonTotal(parts);
  let sum = shares.reduce((n, s) => n + s, 0);
  const pick = (score: (i: number) => number, allowed: (i: number) => boolean): number => {
    let best = -1;
    for (let i = 0; i < shares.length; i += 1) if (allowed(i) && (best < 0 || score(i) > score(best))) best = i;
    return best;
  };
  while (sum < total) {
    const i = pick((k) => work[k]! - shares[k]!, () => true);
    if (i < 0) break;
    shares[i]! += 1;
    sum += 1;
  }
  // The total is never fewer minutes than parts, so while the shares add up to more there is a share above one.
  while (sum > total) {
    const i = pick((k) => shares[k]! - work[k]!, (k) => shares[k]! > 1);
    if (i < 0) break;
    shares[i]! -= 1;
    sum -= 1;
  }
  return shares;
}

/** The deck's minutes: its parts, and a whole minute for each figure she acts on. */
export function slidesMinutes(parts: readonly PartCost[], figuresToActOn: number): number {
  return lessonTotal(parts, figuresToActOn * FIGURE_TO_ACT_ON_MINUTES);
}

/** Does this block show her something in Slides (a card, or a figure standing on one)? A heading answers for its part. */
function makesCard(block: unknown, ctx: PriceContext): boolean {
  switch (typeOf(block)) {
    case "p":
      // An empty paragraph packs into no card.
      return str((block as Json).md).trim().length > 0;
    case "callout":
    case "figure":
    case "photo":
    case "video":
    case "sim":
    case "see":
    case "gate":
      return true;
    case "prompt":
      return !ctx.prompt || ctx.prompt(str((block as Json).promptId));
    default:
      return false;
  }
}

/**
 * The lesson's parts, priced (`lesson`: the note as the lesson shows it, ./lesson-blocks.ts lessonBlocks). Read's
 * sections are these parts; Slides' minutes are these parts priced with the prompts it keeps.
 */
export function lessonParts(lesson: readonly unknown[], ctx: PriceContext = {}): LessonPart[] {
  const parts: LessonPart[] = [];
  let current: LessonPart | null = null;
  const open = (heading: string, cards: boolean): LessonPart => {
    current = { heading, words: 0, seconds: 0, gateIds: [], untimedVideos: 0, cards };
    parts.push(current);
    return current;
  };
  for (const b of lesson) {
    const t = typeOf(b);
    if (t === "hero" || t === "pause") continue;
    // The recap and the pointer are cards of their own in Slides, whatever is under them.
    if (t === "h") {
      open(str((b as Json).text), closingRoleOf(b) !== null);
      continue;
    }
    const part: LessonPart = current ?? open("", false);
    const cost = blockCost(b, ctx);
    part.words += cost.words;
    part.seconds += cost.seconds;
    if (t === "gate") part.gateIds.push(str((b as Json).id));
    if (t === "video" && videoSeconds(b) === null) part.untimedVideos += 1;
    if (makesCard(b, ctx)) part.cards = true;
  }
  // An unheaded opening belongs to the part it introduces, not to a part of its own.
  if (parts.length > 1 && parts[0]!.heading === "") {
    const [opening, first] = [parts[0]!, parts[1]!];
    first.words += opening.words;
    first.seconds += opening.seconds;
    first.gateIds = [...opening.gateIds, ...first.gateIds];
    first.untimedVideos += opening.untimedVideos;
    first.cards = first.cards || opening.cards;
    parts.shift();
  }
  return parts;
}

/**
 * Slides' parts from its cards: each card's cost added into the part it stands in (its `part`); a card that names no
 * part and costs something (one built by hand) counts in a part of its own; the figure to act on is left to
 * `slidesMinutes`. In the order the parts first appear.
 */
export function partsOfCards(cards: readonly Card[]): Array<PartCost & { n: number }> {
  const parts = new Map<number, PartCost & { n: number }>();
  for (const card of cards) {
    if (card.kind === "interaction") continue;
    const cost = cardCost(card);
    const ref: PartRef | null = "part" in card && card.part ? card.part : null;
    if (!ref && cost.words === 0 && cost.seconds === 0) continue;
    const n = ref?.n ?? 0;
    const part = parts.get(n) ?? { n, heading: ref?.heading ?? "", words: 0, seconds: 0 };
    part.words += cost.words;
    part.seconds += cost.seconds;
    parts.set(n, part);
  }
  return [...parts.values()];
}

// ---------------------------------------------------------------------------------------------------------------------
// A whole note (for the content session's lint, and the tests that hold both ways to it)
// ---------------------------------------------------------------------------------------------------------------------

/** A note as its bundle ships it. Pass the shipped worked examples and prompts (status verified or published), as the site has them. */
export interface NoteInput {
  /** note.blocks.json, the hero block included. */
  blocks: readonly unknown[] | null | undefined;
  /** The bundle's worked examples: a See it that names one costs its steps. */
  workedExamples?: ReadonlyArray<{ id: string; steps: readonly unknown[] }> | null;
  /** Or their step counts directly (seeStepsOf), as the Read page holds them. */
  steps?: SeeSteps;
  /**
   * The bundle's retrieval prompts. Read prices each placed prompt the bundle holds; Slides the recall cards it keeps of
   * them. Left out: Read prices every placed prompt (as the page does, which is not given them), Slides keeps none (as a
   * deck built without prompts).
   */
  prompts?: readonly RetrievalPrompt[] | null;
  /**
   * The topic id ("fm.u1.algebraic-fractions-simplify"): the figures to act on its Slides registers (./enrichment.ts),
   * each counted (the deck places each after the card it names; cards.test.ts checks that card is in the deck).
   */
  topicId?: string | null;
  /** Or the number of figures to act on, directly (a test, or a caller that has built the deck). */
  figuresToActOn?: number;
}

export interface NoteMinutes {
  /** Read: the hero's Read line, the track and the Contents; `parts` are its numbered sections. */
  read: { minutes: number; parts: LessonPart[] };
  /** Slides: the hero's Slides line, the Start button and the title card; `parts` priced with the recall cards it keeps. */
  slides: { minutes: number; parts: LessonPart[]; figuresToActOn: number };
  /** Videos with no stated length, named beside both ways' minutes ("plus a video"). */
  untimedVideos: number;
}

/** Blocks that give a note something to measure; with none, an authored `hero.minutes` stands in (heroDataFor). */
const MEASURABLE = new Set(["p", "callout", "h", "gate"]);

/**
 * Both ways' minutes for a whole note, as the topic hero prints them (Read: lesson-plan.ts heroDataFor; Slides:
 * deck.ts deckFor(...).stats.minutes). The lesson is the note as it shows it: the hero, the hero's figure and the
 * sentences of the lede the first paragraph repeats are not in it (./lesson-blocks.ts).
 */
export function lessonMinutesFor(note: NoteInput): NoteMinutes {
  const blocks = note.blocks ?? [];
  const lesson = lessonBlocks<unknown>(blocks, ledeOf(blocks));
  const steps = note.steps ?? seeStepsOf(note.workedExamples);
  const held = note.prompts ? new Map<string, RetrievalPrompt>(note.prompts.map((p) => [p.id, p])) : null;

  const readParts = lessonParts(lesson, readPricing(steps, note.prompts, lesson));
  // The recall cards Slides keeps: of the placed prompts the bundle holds, in the note's order, recall.ts's choice (the
  // deck's own reading, cards.ts buildDeck).
  const placed = lesson.flatMap((b) => {
    const p = typeOf(b) === "prompt" ? held?.get(str((b as Json).promptId)) : undefined;
    return p ? [p] : [];
  });
  const chosen = new Set<string>(chooseRecall(placed).map((p) => p.id));
  const slidesParts = lessonParts(lesson, { steps, prompt: (id) => chosen.has(id) });
  const figuresToActOn = note.figuresToActOn ?? (note.topicId ? (enrichmentFor(note.topicId)?.interactions ?? []).length : 0);

  // A note with nothing to measure keeps the minutes its hero states (heroDataFor's rule).
  const hero = blocks.find((b) => typeOf(b) === "hero");
  const authored = isObject(hero) && typeof hero.minutes === "number" && hero.minutes > 0 ? Math.round(hero.minutes) : 0;
  const measurable = blocks.some((b) => MEASURABLE.has(typeOf(b)));
  return {
    read: { minutes: authored > 0 && !measurable ? authored : lessonTotal(readParts), parts: readParts },
    slides: { minutes: slidesMinutes(slidesParts.filter((p) => p.cards), figuresToActOn), parts: slidesParts, figuresToActOn },
    untimedVideos: readParts.reduce((n, p) => n + p.untimedVideos, 0),
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// After the lesson: the topic page's later stages
// ---------------------------------------------------------------------------------------------------------------------

export const minutesForReading = (words: number): number => estimateMinutes(words, 0);
/** A worked example is read, tried and checked: two minutes each. */
export const minutesForExamples = (count: number): number => Math.max(1, count * WORKED_EXAMPLE_MINUTES);
/** A check item is one question with its feedback: a minute each. */
export const minutesForCheckItems = (count: number): number => Math.max(1, count * CHECK_ITEM_MINUTES);
/** Exam marks are worth about 1.2 minutes each, the CCEA pace with the reading. */
export const minutesForMarks = (marks: number): number => Math.max(1, Math.round(marks * MINUTES_PER_MARK));
/** Find the line, then write the fix: two minutes each. */
export const minutesForMistakes = (count: number): number => Math.max(1, count * FIND_THE_MISTAKE_MINUTES);

// ---------------------------------------------------------------------------------------------------------------------
// An untimed video, named
// ---------------------------------------------------------------------------------------------------------------------

const COUNT_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/** "plus a video", "plus two videos": videos with no stated length, named beside the minutes; null when there are none. */
export function untimedPhrase(untimed: number): string | null {
  if (untimed <= 0) return null;
  return `plus ${untimed === 1 ? "a video" : `${COUNT_WORDS[untimed] ?? untimed} videos`}`;
}
