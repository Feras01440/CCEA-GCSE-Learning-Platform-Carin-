/**
 * The lesson plan behind the topic hero and the spine: what the note promises, the figure it
 * promotes to the top of the page, and each section with an honest minute cost.
 *
 * Pure, and shared on purpose. The server page renders the hero from these numbers and the
 * client lesson renders the spine and the section eyebrows from the same ones, so the two can
 * never disagree about how long a topic takes or which figure was hoisted.
 *
 * The minute model, from the learner review (13 Sep 2026): prose at 180 words a minute, 40
 * seconds for a check, 2 minutes for a worked example, 1 minute for a check item, 1.2 minutes
 * a mark for a question, 2 minutes for a find-the-mistake. No number here is flattering.
 */
import type { PhotoRef } from "@/components/media/PhotoFigure";
import { splitTex, type TexSegment } from "@/components/items/tex-split";

/**
 * Read v2 (TRIAL-BRIEF.md and art direction v2 §9, 23 Sep 2026): the lesson as one centred column with the app's
 * rail folded to icons, a slim sticky track with a Contents popover, Continue at the end of every section, and the
 * gate drawn exactly as Slides draws it (§8.4's rhythm, the right option lit). It is on trial on one topic until the
 * owner has used it and said yes; rolling it out is this list becoming every topic.
 */
export const READ_V2_TOPICS: ReadonlySet<string> = new Set(["further-maths/FM1/algebraic-fractions-simplify"]);

export function isReadV2(subject: string, unit: string, slug: string): boolean {
  return READ_V2_TOPICS.has(`${subject}/${unit}/${slug}`);
}

/** The same test for a pathname: the topic page itself (/learn/<subject>/<unit>/<topic>/), never a route under it. */
export function isReadV2Path(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 4 && parts[0] === "learn" && isReadV2(parts[1], parts[2], parts[3]);
}

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

export const WORDS_PER_MINUTE = 180;
export const SECONDS_PER_GATE = 40;

type Block = Record<string, unknown>;

const isBlock = (b: unknown): b is Block => typeof b === "object" && b !== null;
const blockType = (b: unknown): string => (isBlock(b) && typeof b.type === "string" ? b.type : "");
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

/** Reading plus checks, rounded to whole minutes and never less than one. */
export function estimateMinutes(words: number, gates = 0): number {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE + (gates * SECONDS_PER_GATE) / 60));
}

export const minutesForReading = (words: number): number => estimateMinutes(words, 0);
/** A worked example is read, tried and checked: two minutes each. */
export const minutesForExamples = (count: number): number => Math.max(1, count * 2);
/** A check item is one question with its feedback: a minute each. */
export const minutesForCheckItems = (count: number): number => Math.max(1, count);
/** Exam marks are worth about 1.2 minutes each, the CCEA pace with the reading. */
export const minutesForMarks = (marks: number): number => Math.max(1, Math.round(marks * 1.2));
/** Find the line, then write the fix: two minutes each. */
export const minutesForMistakes = (count: number): number => Math.max(1, count * 2);

/** "about 5 min" — the phrase every section eyebrow ends with. */
export const minutesPhrase = (minutes: number): string => `about ${Math.max(1, Math.round(minutes))} min`;
/** "About 25 minutes" — the spine's own heading. */
export const minutesHeading = (minutes: number): string => `About ${Math.max(1, Math.round(minutes))} minutes`;

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
  words: number;
  gateIds: string[];
  minutes: number;
}

/** The first figure or photo in the note, which the hero promotes and the lesson therefore skips. */
export function hoistedFigureIndex(blocks: readonly unknown[] | null | undefined): number {
  const list = blocks ?? [];
  for (let i = 0; i < list.length; i += 1) {
    const t = blockType(list[i]);
    if (t === "photo") return i;
    if (t === "figure" && str((list[i] as Block).svg)) return i;
  }
  return -1;
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
 */
export function heroDataFor(blocks: readonly unknown[] | null | undefined): TopicHeroData {
  const list = blocks ?? [];
  const figure = figureAt(list[hoistedFigureIndex(list)]);
  const hero = list.find((b) => blockType(b) === "hero");
  if (isBlock(hero)) {
    const can = Array.isArray(hero.can) ? hero.can.filter((c): c is string => typeof c === "string") : [];
    const lede = str(hero.lede);
    // The hero promises exactly what the spine and the lesson's own label add up to: the sum of its sections, each
    // rounded up to a whole minute. That is the larger of the two honest measures, so it never over-promises, and one
    // screen never shows two numbers. The authored number stands in only for a note with nothing to measure.
    const measurable = list.some((b) => ["p", "callout", "h", "gate"].includes(blockType(b)));
    const authored = typeof hero.minutes === "number" && hero.minutes > 0 ? Math.round(hero.minutes) : 0;
    const minutes = measurable || authored === 0 ? lessonMinutes(list, lede) : authored;
    const short = str(hero.short).trim() || null;
    return { short, lede, can, minutes, generated: hero.generated === true, fallback: false, figure };
  }
  const firstParagraph = list.find((b) => blockType(b) === "p");
  const lede = isBlock(firstParagraph) ? str(firstParagraph.md) : "";
  return {
    short: null,
    lede,
    can: [],
    minutes: lessonMinutes(list, lede),
    generated: false,
    fallback: true,
    figure,
  };
}

/** The lesson's minutes as the spine counts them: every section, each rounded to a whole minute, added up. */
export function lessonMinutes(blocks: readonly unknown[] | null | undefined, lede?: string): number {
  return Math.max(1, lessonSections(blocks, lede).reduce((n, s) => n + s.minutes, 0));
}

/** Words and checks over the whole note, as minutes. */
export function noteMinutes(blocks: readonly unknown[] | null | undefined): number {
  const list = blocks ?? [];
  let words = 0;
  let gates = 0;
  for (const b of list) {
    const t = blockType(b);
    if (t === "p" || t === "callout") words += countWords(str((b as Block).md));
    else if (t === "h") words += countWords(str((b as Block).text));
    else if (t === "gate") gates += 1;
  }
  return estimateMinutes(words, gates);
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
 * match the note after its opening has been hoisted.
 */
export function lessonSections(blocks: readonly unknown[] | null | undefined, lede?: string): LessonSection[] {
  const list = lessonBlocks(blocks ?? [], lede);
  const sections: Array<Omit<LessonSection, "n" | "minutes">> = [];
  const open = (heading: string) => {
    sections.push({ title: heading ? spineTitle(heading) : "The lesson", heading, words: countWords(heading), gateIds: [] });
    return sections[sections.length - 1];
  };
  let current: Omit<LessonSection, "n" | "minutes"> | null = null;
  for (const b of list) {
    const t = blockType(b);
    if (t === "hero") continue;
    if (t === "h") {
      current = open(str((b as Block).text));
      continue;
    }
    if (!current) current = open("");
    if (t === "p" || t === "callout") current.words += countWords(str((b as Block).md));
    else if (t === "gate") current.gateIds.push(str((b as Block).id));
  }
  // An unheaded opening belongs to the section it introduces, not to a row of its own.
  if (sections.length > 1 && sections[0].heading === "") {
    sections[1].words += sections[0].words;
    sections[1].gateIds = [...sections[0].gateIds, ...sections[1].gateIds];
    sections.shift();
  }
  return sections.map((s, i) => ({ ...s, n: i + 1, minutes: estimateMinutes(s.words, s.gateIds.length) }));
}

/**
 * Read v2 shows the lesson one section at a time, each opened by Continue. On arrival, how many sections are open: up to
 * and including the one holding the first check she has not answered, so a returning visit opens where she stopped;
 * every section once every check is answered; the first alone for a note with no checks.
 */
export function initialOpen(sections: readonly LessonSection[], answered: Iterable<string>): number {
  if (sections.length === 0) return 0;
  const done = new Set(answered);
  const pending = sections.findIndex((s) => s.gateIds.some((id) => !done.has(id)));
  if (pending >= 0) return pending + 1;
  return sections.some((s) => s.gateIds.length > 0) ? sections.length : 1;
}

/**
 * Markdown normalised for comparison: emphasis and maths markers dropped, whitespace collapsed.
 * Kept with an index back into the raw string so a prefix match can be cut from the raw markdown.
 */
function normalisedWithMap(md: string): { text: string; map: number[] } {
  let text = "";
  const map: number[] = [];
  let pendingSpace = false;
  for (let i = 0; i < md.length; i += 1) {
    const ch = md[i];
    if (ch === "*" || ch === "_" || ch === "`" || ch === "$" || ch === "\\") continue;
    if (/\s/.test(ch)) {
      pendingSpace = text.length > 0;
      continue;
    }
    if (pendingSpace) {
      text += " ";
      map.push(i);
      pendingSpace = false;
    }
    text += ch.toLowerCase();
    map.push(i);
  }
  return { text, map };
}

/** The end offset of each sentence in a string, for cutting an opening the hero has taken. */
function sentenceEnds(s: string): number[] {
  const ends: number[] = [];
  for (const m of s.matchAll(/[.!?](?=["')\]]*(\s|$))/g)) ends.push(m.index + m[0].length);
  if (ends[ends.length - 1] !== s.length) ends.push(s.length);
  return ends;
}

/**
 * What is left of a paragraph once the hero has said its opening: the raw markdown after the
 * sentences the lede already carries, "" when the paragraph says nothing else, or null when this
 * paragraph is not the hero's. Sentence by sentence, because the pipeline lifts a lede and then
 * edits its punctuation. A cut that would leave unbalanced emphasis or maths markers is refused.
 */
export function paragraphAfterLede(md: string, lede: string): string | null {
  const wanted = normalisedWithMap(lede).text;
  if (wanted.length < 24) return null;
  let cut = 0;
  for (const end of sentenceEnds(md)) {
    const sentence = normalisedWithMap(md.slice(cut, end)).text;
    if (sentence.length < 24 || !wanted.includes(sentence)) break;
    cut = end;
  }
  if (cut === 0) return null;
  const removed = md.slice(0, cut);
  if ((removed.match(/\*\*/g) ?? []).length % 2 !== 0 || (removed.match(/\$/g) ?? []).length % 2 !== 0) return null;
  return md.slice(cut).replace(/^[\s.;:,—–-]+/, "");
}

/**
 * The note as the lesson renders it: the hero block gone, the hoisted figure gone, and the
 * opening the hero already says trimmed off the first paragraph. The pipeline writes most ledes
 * by lifting the note's first sentences, and nobody should read the same sentence twice.
 */
export function lessonBlocks<T>(blocks: readonly T[] | null | undefined, lede?: string): T[] {
  const list = blocks ?? [];
  const hoisted = hoistedFigureIndex(list);
  const out: T[] = [];
  let firstParagraph = true;
  for (let i = 0; i < list.length; i += 1) {
    const b = list[i];
    const type = blockType(b);
    if (type === "hero" || i === hoisted) continue;
    if (type === "p" && firstParagraph) {
      firstParagraph = false;
      const rest = lede ? paragraphAfterLede(str((b as Block).md), lede) : null;
      if (rest !== null) {
        if (rest.trim().length === 0) continue;
        out.push({ ...(b as Block), md: rest } as T);
        continue;
      }
    }
    out.push(b);
  }
  // A heading with nothing left under it is not a section: the hero has taken its paragraph.
  const kept = out.filter((b, i) => !(blockType(b) === "h" && blockType(out[i + 1]) === "h"));
  return withPauses(kept);
}

/**
 * A "Pause here" block at every section boundary: before each heading after the first (02-surfaces.md §3.3). A
 * twenty-minute school night does not end where the lesson does, so every boundary is a place to stop, not one in
 * the middle. The note shows a pause only once the stretch before it is open (nothing after an unanswered gate
 * renders), so it appears as she finishes a section. A pause block is not a section: the spine never counts it.
 */
export function withPauses<T>(blocks: readonly T[]): T[] {
  const out: T[] = [];
  let headings = 0;
  for (const b of blocks) {
    if (blockType(b) === "h") {
      headings += 1;
      if (headings > 1) out.push({ type: "pause" } as T);
    }
    out.push(b);
  }
  return out;
}
