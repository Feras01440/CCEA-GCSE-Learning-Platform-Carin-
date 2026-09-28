/**
 * The lesson plan behind the topic hero and the spine: what the note promises, the figure it
 * promotes to the top of the page, and each section with an honest minute cost.
 *
 * Pure, and shared on purpose. The server page renders the hero from these numbers and the
 * client lesson renders the spine and the section eyebrows from the same ones, so the two can
 * never disagree about how long a topic takes or which figure was hoisted.
 *
 * The minute model is src/lib/slides/minutes.ts (29 Sep 2026): one price list, by content, that
 * Read and Slides both use, and the content session's lint can import (its header gives every
 * constant and the reason for it). This file only walks the note into Read's sections and names
 * them; the note as the lesson shows it is src/lib/slides/lesson-blocks.ts. Both are re-exported
 * here under their old names, so every caller keeps its import.
 */
import type { PhotoRef } from "@/components/media/PhotoFigure";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { splitTex, type TexSegment } from "@/components/items/tex-split";
import { hoistedFigureIndex, lessonBlocks, ledeOf } from "@/lib/slides/lesson-blocks";
import { blockCost, lessonMinutesFor, lessonParts, lessonTotal, partShares, partWords, readPricing, untimedPhrase, wholeMinutes, type SeeSteps } from "@/lib/slides/minutes";
import { slidesReadyFor } from "@/lib/slides/ready";

// ---- Readiness (readiness agent, 27 Sep 2026): which topics draw Read v2. Only this block reads it. ----------------

/**
 * Read v2 (art direction v2 §9, 23 Sep 2026): the lesson as one centred column with the app's rail folded to icons, a
 * slim sticky track with a Contents popover, Continue at the end of every section, and the gate drawn exactly as Slides
 * draws it (§8.4's rhythm, the right option lit). It is drawn wherever Slides is offered, decided by the same one
 * function (src/lib/slides/ready.ts slidesReadyFor): the content decides, topic by topic, as each note is migrated to
 * lesson structure v3 and reviewed (src/lib/slides/readiness.ts). There is no list of topics here.
 */
export function isReadV2(subject: string, unit: string, slug: string): boolean {
  return slidesReadyFor(subject, slug, unit);
}

/** The topic whose page a pathname is (/learn/<subject>/<unit>/<topic>/), or null for any other route, one under it included. */
export function topicOfPath(pathname: string): { subject: string; unit: string; slug: string } | null {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 4 && parts[0] === "learn" ? { subject: parts[1], unit: parts[2], slug: parts[3] } : null;
}

/** The same test for a pathname: the topic page itself, never a route under it (Slides draws its own chrome). */
export function isReadV2Path(pathname: string): boolean {
  const topic = topicOfPath(pathname);
  return topic !== null && isReadV2(topic.subject, topic.unit, topic.slug);
}

// ---- end of readiness ----------------------------------------------------------------------------------------------

/**
 * A gate's question, read the way art direction v2 §8.4 lays it out: the sentence that asks, then the maths it asks
 * about on its own line at the display size, then any words after it. Shared by Read and Slides, so one gate reads
 * the same in both.
 *
 * Nothing is reworded: the authored words are only split. Maths is lifted onto its own line when
 *  - it is display maths already (`$$…$$`), or
 *  - it is the stem's one stacked fraction (`\frac`, `\dfrac`; `\tfrac` is the inline size the content lint allows)
 *    and it ends its sentence: "Simplify $\frac{…}{…}$." or "Erin has reached $\frac{3x^2}{x}$. Is that her answer?".
 *    The full stop goes with it, as it does under a displayed expression on a paper.
 * A stacked fraction in the middle of a sentence ("In $\dfrac{x+4}{x}$, what cancels?") stays in the sentence: lifting
 * it would leave "In" alone on a line. The sentence then needs line-height 1.6 so the fraction never touches a
 * neighbouring line (`stackedInline`).
 */
export interface GateStem {
  /** The words before the lifted maths, or the whole stem when nothing is lifted. "" when the maths opens the stem. */
  lead: string;
  /** The TeX lifted onto its own line, without delimiters; null when nothing is lifted. */
  maths: string | null;
  /** The words after the lifted maths, often the question itself. */
  tail: string;
  /** A stacked fraction is still inside the words, which then need the taller line. */
  stackedInline: boolean;
}

const STACKED = /\\d?frac(?![a-zA-Z])/;

const isStacked = (s: TexSegment): boolean => s.type === "math" && STACKED.test(s.tex);

/** Segments back to a Tex string: a text dollar is escaped again so it stays a dollar. */
function joinTex(segments: readonly TexSegment[]): string {
  return segments.map((s) => (s.type === "text" ? s.text.replace(/\$/g, "\\$") : s.display ? `$$${s.tex}$$` : `$${s.tex}$`)).join("");
}

export function gateStem(prompt: string): GateStem {
  const segments = splitTex(prompt);
  let at = segments.findIndex((s) => s.type === "math" && s.display);
  if (at === -1) {
    const stacked = segments.flatMap((s, i) => (isStacked(s) ? [i] : []));
    if (stacked.length === 1) {
      const next = segments[stacked[0] + 1];
      // Ends its sentence: nothing after it, or a full stop and then a space or the end.
      if (!next || (next.type === "text" && /^\s*(?:\.(?=\s|$)|$)/.test(next.text))) at = stacked[0];
    }
  }
  if (at === -1) return { lead: prompt.trim(), maths: null, tail: "", stackedInline: segments.some(isStacked) };
  const before = segments.slice(0, at);
  const after = segments.slice(at + 1);
  const lifted = segments[at] as Extract<TexSegment, { type: "math" }>;
  return {
    lead: joinTex(before).trim(),
    maths: lifted.tex,
    tail: joinTex(after)
      .replace(/^\s*[.,](?=\s|$)/, "")
      .trim(),
    stackedInline: [...before, ...after].some(isStacked),
  };
}

/**
 * A hero lede as the page sets it. The lede is running prose, where a stacked fraction takes the inline size (art
 * direction v2 §8.4 and 01 §3.4: "\tfrac is the most an inline fraction may be"; audit CD-06, CT-13): an authored
 * `\dfrac` inside `$…$` is read as `\frac` here, and only here, so "12/18 cancels to 2/3" sits in its line instead of
 * standing two full-size fractions in it. Display maths (`$$…$$`) and every other command are left as written. The
 * content brief is to author ledes with `\frac` (or a solidus); this is the renderer's guard until they all do.
 */
export function inlineLede(md: string): string {
  return joinTex(splitTex(md).map((s) => (s.type === "math" && !s.display ? { ...s, tex: s.tex.replace(/\\dfrac(?![a-zA-Z])/g, "\\frac") } : s)));
}

// ---- The minute model (src/lib/slides/minutes.ts), under the names this module always gave it ----------------------

export {
  countWords,
  estimateMinutes,
  videoSeconds,
  seeStepsOf,
  minutesForReading,
  minutesForExamples,
  minutesForCheckItems,
  minutesForMarks,
  minutesForMistakes,
  untimedPhrase as plusVideos,
  WORDS_PER_MINUTE,
  YOUR_TURN_SECONDS as SECONDS_PER_GATE,
  RECALL_SECONDS as SECONDS_PER_PROMPT,
  SEE_STEP_SECONDS as SECONDS_PER_SEE_STEP,
  type SeeSteps,
} from "@/lib/slides/minutes";
// The note as the lesson shows it (src/lib/slides/lesson-blocks.ts), under the names this module always gave it.
export { hoistedFigureIndex, lessonBlocks, paragraphAfterLede, withPauses } from "@/lib/slides/lesson-blocks";

/**
 * What each See it block of a note costs, in seconds, keyed by the block itself (a view for tests: the lesson's minutes
 * are priced in src/lib/slides/minutes.ts, a See it at 15 seconds a step, its own steps or the named worked example's; a
 * name `steps` does not hold counts nothing, as the deck counts it).
 */
export function seeSeconds(blocks: readonly unknown[] | null | undefined, steps: SeeSteps = {}): Map<unknown, number> {
  return new Map((blocks ?? []).filter((b) => blockType(b) === "see").map((b) => [b, blockCost(b, { steps }).seconds]));
}

type Block = Record<string, unknown>;

const isBlock = (b: unknown): b is Block => typeof b === "object" && b !== null;
const blockType = (b: unknown): string => (isBlock(b) && typeof b.type === "string" ? b.type : "");
const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** "about 5 min" — the phrase every section eyebrow ends with. */
export const minutesPhrase = (minutes: number): string => `about ${wholeMinutes(minutes)} min`;
/** "About 25 minutes" — the spine's own heading ("About 1 minute" for one). */
export const minutesHeading = (minutes: number): string => {
  const n = wholeMinutes(minutes);
  return `About ${n} ${n === 1 ? "minute" : "minutes"}`;
};

/** One way into a topic as the hero states it: its name, its own minutes, and what it is made of. */
export interface WayPromise {
  way: "slides" | "read";
  /** "Slides" or "Read"; null on a topic with one way in, whose line needs no name. */
  label: string | null;
  /** "about 11 minutes" after a name; "About 9 minutes" leading the one way's line. */
  minutes: string;
  /** "plus a video": videos with no stated length, which neither way can time. */
  plus: string | null;
  /** "25 cards", "7 sections". */
  size: string;
}

/**
 * The hero's promise line, one truth per way in (audit LD-04, CT-12, CD-12, 24 Sep 2026). Each way states its own
 * length and its own size, named, from its own single source: Read from the note (its sections and the minute model the
 * track and the spine print), Slides from the deck (the deck stats the title card and the Start button print). What
 * both share (the checks, the worked examples, the examiners' findings, a practical) is said once, and a video with no
 * stated length is named beside each way's minutes rather than guessed into them. Slides comes first: it is the primary
 * way in (decision 17). A topic without Slides keeps the one line it always had.
 */
export function heroPromise({
  read,
  slides,
  untimedVideos,
  checks,
  workedExamples,
  findings,
  practicals,
}: {
  read: { minutes: number; sections: number };
  slides: { minutes: number; cards: number } | null;
  untimedVideos: number;
  checks: number;
  workedExamples: number;
  findings: number;
  practicals: readonly string[];
}): { ways: WayPromise[]; facts: string[] } {
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const plus = untimedPhrase(untimedVideos);
  const sections = plural(read.sections, "section", "sections");
  const ways: WayPromise[] = slides
    ? [
        { way: "slides", label: "Slides", minutes: minutesHeading(slides.minutes).replace(/^A/, "a"), plus, size: plural(slides.cards, "card", "cards") },
        { way: "read", label: "Read", minutes: minutesHeading(read.minutes).replace(/^A/, "a"), plus, size: sections },
      ]
    : [{ way: "read", label: null, minutes: minutesHeading(read.minutes), plus, size: sections }];
  const facts = [
    checks > 0 ? plural(checks, "check", "checks") : null,
    workedExamples > 0 ? `${workedExamples} worked ${workedExamples === 1 ? "example" : "examples"}` : null,
    findings > 0 ? `${findings} examiner ${findings === 1 ? "finding" : "findings"}` : null,
    ...practicals.map((p) => `Prescribed Practical ${p}`),
  ].filter((f): f is string => f !== null);
  return { ways, facts };
}

/** A learner verb and the cost of doing it: "Read and check · about 25 min". */
export const stageEyebrow = (verb: string, minutes: number): string => `${verb} · ${minutesPhrase(minutes)}`;

export type HeroFigure =
  | { kind: "svg"; svg: string; alt: string; caption?: string }
  | { kind: "photo"; photo: PhotoRef };

export interface TopicHeroData {
  /** An authored short display title (`hero.short`), when a bundle carries one. None do yet. */
  short: string | null;
  /** Two or three plain-English sentences: what this is, in the note's own words. */
  lede: string;
  /** "By the end you will be able to…", three lines, empty when the bundle has no hero block. */
  can: string[];
  minutes: number;
  /** Videos in the lesson with no stated length: not in the minutes, named beside them ("plus a video"). */
  untimedVideos: number;
  /** The hero block was written by the pipeline rather than by hand. */
  generated: boolean;
  /** No hero block in the bundle: the lede is the note's first paragraph and the minutes are computed. */
  fallback: boolean;
  figure: HeroFigure | null;
}

export interface LessonSection {
  /** 1-based, and 1:1 with the note's own headings, which is what the spine highlights. */
  n: number;
  /** The heading as the spine lists it: the authored number dropped, the first clause kept. */
  title: string;
  /** The heading as the note renders it. */
  heading: string;
  /** Words she reads in it: its heading (without the authored number) and its paragraphs and callouts. */
  words: number;
  gateIds: string[];
  /**
   * Its share of the lesson's minutes (src/lib/slides/minutes.ts partShares): its own work rounded, never under a
   * minute, moved by a minute where needed so that the sections add up to the lesson's minutes the hero prints.
   */
  minutes: number;
  /** Videos in the section with no stated length: not in its minutes, named beside them. */
  untimedVideos: number;
}

function figureAt(block: unknown): HeroFigure | null {
  if (!isBlock(block)) return null;
  if (block.type === "figure" && str(block.svg)) return { kind: "svg", svg: str(block.svg), alt: str(block.alt), caption: str(block.caption) || undefined };
  if (block.type === "photo")
    return {
      kind: "photo",
      photo: {
        src: str(block.src),
        alt: str(block.alt),
        credit: str(block.credit),
        licence: str(block.licence),
        licenceUrl: str(block.licenceUrl) || undefined,
        sourceUrl: str(block.sourceUrl) || undefined,
        caption: str(block.caption) || undefined,
        prompt: str(block.prompt) || undefined,
      },
    };
  return null;
}

/**
 * What the hero shows. With a `hero` block it is the authored promise; without one the lede is
 * the note's first paragraph, there are no "you can" lines, and the estimate is computed from
 * the note itself rather than invented.
 *
 * The minutes are the lesson's own (src/lib/slides/minutes.ts lessonMinutesFor, Read): its work rounded once, which the
 * track's Contents and the sections' labels add up to (lessonSections shares it out), so one screen never shows two
 * numbers. The authored `hero.minutes` stands in only for a note with nothing to measure. `steps` prices a See it that
 * names a worked example (seeStepsOf); `prompts`, the bundle's, leaves out a placed prompt the bundle does not hold (every
 * placed prompt is priced when they are not given).
 */
export function heroDataFor(blocks: readonly unknown[] | null | undefined, steps?: SeeSteps, prompts?: readonly RetrievalPrompt[] | null): TopicHeroData {
  const list = blocks ?? [];
  const figure = figureAt(list[hoistedFigureIndex(list)]);
  const hero = list.find((b) => blockType(b) === "hero");
  const lede = ledeOf(list);
  const { read, untimedVideos } = lessonMinutesFor({ blocks: list, steps, prompts });
  if (isBlock(hero)) {
    const can = Array.isArray(hero.can) ? hero.can.filter((c): c is string => typeof c === "string") : [];
    const short = str(hero.short).trim() || null;
    return { short, lede, can, minutes: read.minutes, untimedVideos, generated: hero.generated === true, fallback: false, figure };
  }
  return { short: null, lede, can: [], minutes: read.minutes, untimedVideos, generated: false, fallback: true, figure };
}

/** The lesson's minutes as the track and the Contents print them: what its sections' labels add up to. */
export function lessonMinutes(blocks: readonly unknown[] | null | undefined, lede?: string, steps?: SeeSteps, prompts?: readonly RetrievalPrompt[] | null): number {
  return lessonTotal(lessonParts(lessonBlocks(blocks ?? [], lede), readPricing(steps, prompts)));
}

/** Every gate in the note, in order. */
export function noteGateIds(blocks: readonly unknown[] | null | undefined): string[] {
  return (blocks ?? []).filter((b) => blockType(b) === "gate").map((b) => str((b as Block).id));
}

/** "3. Above the optimum: denatured" → "Above the optimum". Markdown and TeX markers go too. */
export function spineTitle(heading: string): string {
  const plain = heading
    .replace(/\$([^$\n]*)\$/g, "$1")
    .replace(/[*_`]/g, "")
    .trim()
    .replace(/^\d+\s*[.):]\s*/, "");
  const clause = plain.split(/\s[—–]\s|:\s/)[0].trim();
  return clause.length >= 3 ? clause : plain;
}

/** A heading as the page shows it: the authored "3." dropped, everything else (emphasis, TeX) kept. */
export function headingText(heading: string): string {
  return heading.trim().replace(/^\d+\s*[.):]\s*/, "");
}

/** Plain words for comparing titles: TeX, emphasis and possessives gone, lower case. */
function plainWords(s: string): string[] {
  return s
    .replace(/\$[^$\n]*\$/g, " ")
    .replace(/[*_`]/g, "")
    .toLowerCase()
    .replace(/['’]s\b/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

const TITLE_STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "into", "that", "this", "its", "your", "you", "are", "how", "what",
  "when", "why", "one", "two", "use", "using", "all", "can", "not", "but", "vs", "via", "than", "then",
]);

/** Content words cut to a crude stem ("rates" and "rate", "completing" and "completed" meet). */
function contentStems(s: string): string[] {
  return plainWords(s)
    .filter((w) => w.length >= 3 && !TITLE_STOP_WORDS.has(w))
    .map((w) => (w.length > 4 ? w.replace(/(es|s)$/, "") : w).slice(0, 5));
}

/**
 * A catalogue title without its asides: "(surd answers)", "(frequency density)", "(A ± X = B, AX = B)". A bracket
 * that is maths stays: "(p + q)ⁿ" runs straight on into its power, "(x̄, ȳ):" holds no word, "(x − μ)/σ" is a quotient.
 */
export function withoutAsides(title: string): string {
  const out = title.replace(/\s\(([^()]*)\)(?=$|[\s,:;.])/g, (whole, inner: string, offset: number) => {
    const atEnd = offset + whole.length >= title.length;
    return atEnd || /[A-Za-z]{3,}/.test(inner) ? "" : whole;
  });
  return out.replace(/\s+([,:;.])/g, "$1").replace(/\s{2,}/g, " ").trim();
}

/**
 * The topic's display title: short, plain, and always naming the topic (02-surfaces.md §3.1; 04-critique.md §7.9: never a
 * fragment). In order:
 *  1. an authored `hero.short`, when a bundle carries one;
 *  2. the catalogue title without its asides, when that is already short (40 characters or fewer);
 *  3. the note's first heading, when it names the topic: every content word of the heading is in the title and it
 *     starts from the title's own head word. "Histograms with unequal class widths" qualifies; a hook such as "Where
 *     exactly?" or "Running the film backwards" does not, because on the first screen she must know what this is;
 *  4. the catalogue title without its asides, cut at its first semicolon or colon only when it is over 60 characters
 *     (three lines of the display face on a phone) and the part kept is at least two words. Never at a comma or "and":
 *     that is how "Index laws with zero" and "Sketching the graphs of sin x" happen.
 */
export function displayTitle(title: string, firstHeading?: string | null, short?: string | null): string {
  if (short && short.trim()) return short.trim();
  const base = withoutAsides(title);
  if (base.length <= 40) return base;
  const heading = firstHeading ? headingText(firstHeading) : "";
  if (heading && namesTheTopic(heading, base)) return heading;
  if (base.length <= 60) return base;
  for (const sep of [";", ":"]) {
    const at = base.indexOf(sep);
    if (at > 0 && plainWords(base.slice(0, at)).length >= 2) return base.slice(0, at).trim();
  }
  return base;
}

/** True when a heading is a name for the topic rather than a hook: see displayTitle, rule 3. */
export function namesTheTopic(heading: string, title: string): boolean {
  const said = contentStems(heading);
  const titled = contentStems(title);
  if (said.length === 0 || titled.length === 0) return false;
  return said.every((w) => titled.includes(w)) && said.includes(titled[0]);
}

/** The same title, whatever its markup: for "is section 1's heading the display title?". */
export function sameTitle(a: string, b: string): boolean {
  return plainWords(a).join(" ") === plainWords(b).join(" ");
}

/**
 * The note's sections, one per heading the lesson actually renders and in the same order, which
 * is what lets the spine follow the scroll position. Prose before the first heading belongs to
 * the first section; a note with no headings is one section. Pass the hero's lede so the rows
 * match the note after its opening has been hoisted, the bundle's worked examples (seeStepsOf) so a See it that names
 * one is priced by its steps, and the bundle's prompts (optional) so a placed prompt it does not hold is not priced.
 *
 * Each section is a part of the lesson as src/lib/slides/minutes.ts prices it (lessonParts), and its minutes are its
 * share of the lesson's minutes (partShares): its own work rounded, never under a minute, moved by a minute where the
 * rows must add up to the lesson's work rounded once, so the Contents' rows add up to the total it and the hero print.
 */
export function lessonSections(
  blocks: readonly unknown[] | null | undefined,
  lede?: string,
  steps?: SeeSteps,
  prompts?: readonly RetrievalPrompt[] | null,
): LessonSection[] {
  const parts = lessonParts(lessonBlocks(blocks ?? [], lede), readPricing(steps, prompts));
  const shares = partShares(parts);
  return parts.map((p, i) => ({
    n: i + 1,
    title: p.heading ? spineTitle(p.heading) : "The lesson",
    heading: p.heading,
    words: partWords(p),
    gateIds: p.gateIds,
    minutes: shares[i]!,
    untimedVideos: p.untimedVideos,
  }));
}
