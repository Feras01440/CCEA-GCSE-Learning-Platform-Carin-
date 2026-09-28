/**
 * Slides (decision 9, 23 Sep 2026; lesson structure v3, 27 Sep 2026): the card list of a topic, generated from the same
 * note.blocks.json the Read view renders, so an author writes once. Pure: no React, no database, no clock. The
 * renderer in src/components/slides draws these cards; the unit tests pin the trial topic and the teach-first fixture.
 *
 * The note is read as sections by the readiness module's parser (src/lib/slides/readiness.ts `sectionsOf`), so the
 * deck and the build's readiness agree by construction: each heading opens a section, except a heading with role
 * `see` ("See it done"), which continues the section above and titles the cards under it; the close begins at the
 * first `recap` or `pointer` heading. A teaching section is explain → See it → Your turn (the teach-first case §6.2):
 * - its paragraphs are idea cards: an authored line break is a unit; a unit over the budget (75 words, the standard's
 *   CARD_WORDS) is split at sentence boundaries, never inside a sentence or inside maths; the section's first card
 *   carries the heading;
 * - a drawn figure followed by a paragraph stands on that paragraph's first idea card, on its stage with its caption
 *   (art direction v2 §8.1, the Idea row), and one straight before the pointer's words stands on the pointer card; any
 *   other figure, a photo, a video or a simulation is a media card;
 * - a `see` block is a See it card: the example's stem, then its steps one per Continue, each with its reason and the
 *   mark it earns; at most one step she types (never in the topic's first See it); a See it that names a bundle worked
 *   example shows that example's steps, without its why-menu and its inputs;
 * - a gate is a Your turn card; two gates in a row are "Your turn, 1 of 2" and "2 of 2" (a section that showed two
 *   variants); a callout is a card with its title;
 * - the "You can now" heading and its lines are the recap card, "In the exam" and its words the pointer card; each
 *   retrieval prompt the note places is a recall card when it is short (at most two, src/lib/slides/recall.ts); a
 *   close card ends the deck.
 * A note written before the See it block (no `see` blocks) keeps the rendering it had: its worked lines are idea cards.
 * An enrichment (pure data, keyed to the topic id) may add a figure-to-act-on card after a named card: the list without
 * it is a function of the note alone; with it, a function of the note and that descriptor.
 *
 * Gate ids and prompt ids are the note's own, so an answer here is the same record as an answer in Read.
 */
import type { GateBlock, NoteBlock } from "@/components/items/gates";
import type { RetrievalPrompt, WorkedExample } from "@/lib/content/schema";
import { headingText, heroDataFor, spineTitle, type HeroFigure } from "@/components/topic/lesson-plan";
import { positionalWording } from "@/lib/gate-order";
import { closingRoleOf, lessonBlocks } from "./lesson-blocks";
import { countWords, partsOfCards, slidesMinutes, untimedPhrase, videoSeconds, type PartRef } from "./minutes";
import { chooseRecall, RECALL_MAX } from "./recall";
import { sectionsOf } from "./readiness";
import { resolveSee, seeShowsAnswer, typedStep, type ResolvedSee } from "./see";
import { splitSentences } from "./text";

export { splitSentences } from "./text";
// The minute model is ./minutes.ts, the one both ways price the lesson with; these names are kept here for the deck's callers.
export { cardSeconds, SEE_STEP_SECONDS, videoSeconds } from "./minutes";

/** One idea per card: the depth standard's budget for a paragraph or callout (scripts/qa/lesson-v2.mjs CARD_WORDS). */
export const CARD_WORDS = 75;

export interface SectionRef {
  /** 1-based among the teaching sections (the recap and the pointer are not sections); 0 for a section after the close has begun. */
  n: number;
  total: number;
  /** The heading as authored (markdown and maths kept), without an authored number: a "See it done" heading titles its own cards. */
  heading: string;
  /** The heading's first clause, as the spine lists it. */
  title: string;
  /** The heading's `role` when the author gave one (the depth standard): idea, why, variant, see, twists, further, derivation. */
  role: string | null;
}

export type MediaBlock = Extract<NoteBlock, { type: "figure" | "photo" | "video" | "sim" }>;
export type FigureBlock = Extract<NoteBlock, { type: "figure" }>;
export type CalloutBlock = Extract<NoteBlock, { type: "callout" }>;

/**
 * Every card made from the note carries `part`: the part of the lesson it stands in (one per heading of the note, numbered
 * as Read numbers its sections, the opening in the first), so the deck's minutes are added part by part as Read's are
 * (./minutes.ts). The title, the close and a figure to act on stand in no part.
 */
export type Card =
  | { kind: "title"; key: "title"; lede: string; can: string[]; figure: HeroFigure | null }
  /** `figure`: the note's drawing that stands on this card, the one just before the paragraph that reads it. */
  | { kind: "idea"; key: string; section: SectionRef; first: boolean; md: string; words: number; figure: FigureBlock | null; part?: PartRef }
  | { kind: "media"; key: string; section: SectionRef | null; block: MediaBlock; part?: PartRef }
  /**
   * A See it: `see` is the resolved example (null when a named worked example is missing, which the build refuses);
   * `firstSee` marks the topic's first, which is shown and never typed; `typed` is the step she types (0-based), or null;
   * `first`, as on an idea card, when it is the first card under its heading, which it then carries.
   */
  | { kind: "see"; key: string; section: SectionRef | null; first: boolean; see: ResolvedSee | null; firstSee: boolean; typed: number | null; part?: PartRef }
  /**
   * A Your turn (the gate). `turn` numbers two gates in a row ("1 of 2"); `seeKey` is the See it card it follows in its
   * section, the one its re-teach points back at. A retry card (`retry`) asks the gate's twin when `twin`, else the gate
   * again with its answer moved.
   */
  | {
      kind: "gate";
      key: string;
      section: SectionRef | null;
      gate: GateBlock;
      afterMedia: MediaBlock["type"] | null;
      retry: boolean;
      twin: boolean;
      turn: { n: number; of: number } | null;
      seeKey: string | null;
      part?: PartRef;
    }
  | { kind: "callout"; key: string; section: SectionRef | null; block: CalloutBlock; part?: PartRef }
  | { kind: "interaction"; key: string; section: SectionRef | null; id: string }
  | { kind: "recap"; key: "recap"; heading: string; lines: string[]; part?: PartRef }
  /** `figure`: the note's drawing straight before the pointer's words (a scheme's marks), standing on this card as a figure stands on the idea card that reads it. */
  | { kind: "pointer"; key: "pointer"; heading: string; md: string; figure: FigureBlock | null; part?: PartRef }
  | { kind: "recall"; key: string; prompt: RetrievalPrompt; index: number; total: number; part?: PartRef }
  | { kind: "close"; key: "close" };

export type CardKind = Card["kind"];
export type SeeCard = Extract<Card, { kind: "see" }>;
export type GateCard = Extract<Card, { kind: "gate" }>;

/** Pure data that adds to a topic's deck without touching its note. Keyed by the topic id where it is registered. */
export interface SlidesEnrichment {
  /**
   * A figure she acts on, inserted after the card with the given key, or after the first of several keys the deck
   * holds (so a descriptor can name the See it card a note will have once it is converted, and the idea card it has
   * today). `id` names the interaction the renderer draws.
   */
  interactions?: Array<{ after: string | readonly string[]; id: string }>;
}

export interface DeckStats {
  cards: number;
  /** The Your turns (gates), a retry not counted. */
  gates: number;
  /** The See it cards. */
  sees: number;
  recall: number;
  videos: number;
  /** Videos whose block carries no length: named beside the minutes ("plus a video"), never guessed into them. */
  untimedVideos: number;
  /**
   * The lesson's minutes as the deck shows it (./minutes.ts, the one model Read prices with too): its cards' work added
   * part by part and rounded once, a video only when its block says how long it runs, and a whole minute for each figure
   * she acts on.
   */
  minutes: number;
}

export interface Deck {
  cards: Card[];
  stats: DeckStats;
}

type Block = Record<string, unknown>;
const isBlock = (b: unknown): b is Block => typeof b === "object" && b !== null;
const blockType = (b: unknown): string => (isBlock(b) && typeof b.type === "string" ? b.type : "");
const str = (v: unknown): string => (typeof v === "string" ? v : "");

const MEDIA_TYPES = new Set(["figure", "photo", "video", "sim"]);

/** "The three moves" → "the-three-moves": a stable, readable key part. */
export function slug(text: string): string {
  return text
    .replace(/\$[^$\n]*\$/g, " ")
    .replace(/[*_`]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * The cards a paragraph makes: each authored line is a unit; units are packed in order into cards of at most `budget`
 * words; a unit over the budget is split at sentence boundaries and its sentences packed the same way. A sentence over
 * the budget stays whole: a card may run long, but a sentence is never cut.
 */
export function packParagraph(md: string, budget = CARD_WORDS): string[] {
  const lines = md
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const units: Array<{ text: string; words: number; breakBefore: boolean }> = [];
  for (const line of lines) {
    const w = countWords(line);
    if (w <= budget) {
      units.push({ text: line, words: w, breakBefore: true });
      continue;
    }
    splitSentences(line).forEach((s, i) => units.push({ text: s, words: countWords(s), breakBefore: i === 0 }));
  }
  const cards: string[] = [];
  let current = "";
  let words = 0;
  for (const u of units) {
    if (current && words + u.words > budget) {
      cards.push(current);
      current = "";
      words = 0;
    }
    current = current ? `${current}${u.breakBefore ? "\n" : " "}${u.text}` : u.text;
    words += u.words;
  }
  if (current) cards.push(current);
  return cards;
}

/**
 * A note written before the heading roles gives its closing headings no role: "You can now" and "In the exam" are
 * read as the recap and the pointer by their words, as the deck always read them. A note that gives roles is untouched.
 */
function withClosingRoles(blocks: readonly unknown[]): unknown[] {
  return blocks.map((b) => {
    if (blockType(b) !== "h" || str((b as Block).role)) return b;
    // The one reading of the close's words (./lesson-blocks.ts), which the minute model shares.
    const role = closingRoleOf(b);
    return role ? { ...(b as Block), role } : b;
  });
}

/**
 * The part of the lesson each block of the lesson stands in: a heading opens the next part, numbered from 1 as Read
 * numbers its sections (lesson-plan.ts lessonSections), and the opening before the first heading belongs to the first.
 */
function lessonPartsByBlock(body: readonly unknown[]): PartRef[] {
  const first = body.find((b) => blockType(b) === "h");
  let part: PartRef = { n: 1, heading: first ? str((first as Block).text) : "" };
  let headings = 0;
  return body.map((b) => {
    if (blockType(b) === "h") {
      headings += 1;
      if (headings > 1) part = { n: headings, heading: str((b as Block).text) };
    }
    return part;
  });
}

export interface BuildOptions {
  /** The bundle's worked examples, for a See it that names one. */
  workedExamples?: readonly Pick<WorkedExample, "id" | "stem" | "steps" | "finalAnswer" | "figure">[] | null;
}

/**
 * The deck for a note. `prompts` are the bundle's retrieval prompts (the note holds only their ids; a prompt the bundle
 * does not carry is skipped). `enrichment` is the topic's registered descriptor, if any; `options.workedExamples` the
 * bundle's worked examples, which a See it may name.
 */
export function buildDeck(
  blocks: readonly unknown[] | null | undefined,
  prompts: readonly RetrievalPrompt[] = [],
  enrichment: SlidesEnrichment | null = null,
  options: BuildOptions = {},
): Deck {
  const list = blocks ?? [];
  const hero = heroDataFor(list);
  const body = withClosingRoles(lessonBlocks<unknown>(list, hero.lede).filter((b) => blockType(b) !== "pause"));
  const sections = sectionsOf(body);
  // The part of the lesson each block stands in, as Read numbers its sections: every card made from a block carries it,
  // so the deck's minutes are the same parts' minutes (./minutes.ts).
  const partAt = lessonPartsByBlock(body);
  const promptById = new Map<string, RetrievalPrompt>(prompts.map((p) => [p.id, p]));
  // The recall cards: of the prompts the note places, at most two light ones (src/lib/slides/recall.ts, the owner's
  // answer 3: at most two, with Skip, each answerable in about twelve words).
  const placed = body.flatMap((b) => (blockType(b) === "prompt" && promptById.has(str((b as Block).promptId)) ? [promptById.get(str((b as Block).promptId))!] : []));
  const recallIds = new Set(chooseRecall(placed).map((p) => p.id));

  const teachingTotal = sections.filter((s) => s.part === "teaching").length;
  const cards: Card[] = [{ kind: "title", key: "title", lede: hero.lede, can: hero.can, figure: hero.figure }];
  const seenKeys = new Set<string>(["title"]);
  const unique = (key: string) => {
    let k = key;
    let i = 2;
    while (seenKeys.has(k)) k = `${key}~${i++}`;
    seenKeys.add(k);
    return k;
  };
  let mediaCount = 0;
  let seeCount = 0;
  let teachingN = 0;
  /** The pointer's figure, on the pointer card already: skipped where it stands in the note. */
  let pointerFigure: FigureBlock | null = null;

  for (const section of sections) {
    // The section's reference for its cards: numbered among the teaching sections; the opening belongs to the first.
    let ref: SectionRef | null = null;
    if (section.part === "teaching" && section.heading) {
      teachingN += 1;
      ref = { n: teachingN, total: teachingTotal, heading: headingText(section.heading.text), title: spineTitle(section.heading.text), role: section.heading.role };
    } else if (section.part === "opening") {
      ref = { n: 1, total: Math.max(1, teachingTotal), heading: "", title: "", role: null };
    }

    if (section.part === "closing" && section.heading && (section.heading.role === "recap" || section.heading.role === "pointer")) {
      // The closing pair: the heading and its words are one card each; anything else in it is a card of its own.
      const words = section.blocks.filter((b) => b.block.type === "p").map((b) => str((b.block as unknown as Block).md));
      const text = headingText(section.heading.text);
      const part = partAt[section.heading.at];
      if (section.heading.role === "recap") cards.push({ kind: "recap", key: unique("recap") as "recap", heading: text, lines: words.join("\n").split(/\n+/).map((l) => l.trim()).filter(Boolean), part });
      else {
        // The pointer's drawing (the marks a paper gives, say): a drawn figure straight before its words stands on its
        // card, as a figure stands on the idea card that reads it, never a picture-only card after the words.
        const drawn = section.blocks.find((b) => b.block.type === "figure" && str((b.block as unknown as Block).svg).length > 0 && blockType(body[b.at + 1]) === "p");
        pointerFigure = drawn ? (drawn.block as unknown as FigureBlock) : null;
        cards.push({ kind: "pointer", key: unique("pointer") as "pointer", heading: text, md: words.join("\n\n"), figure: pointerFigure, part });
      }
    }
    const closingPair = section.part === "closing" && (section.heading?.role === "recap" || section.heading?.role === "pointer");
    // A section the close has taken in that is neither the recap nor the pointer ("Going further" after the pointer):
    // its cards are titled by its heading and numbered nowhere (audit CQ-19: it said "Section 1 of 1 · ").
    if (section.part === "closing" && !closingPair && section.heading) {
      ref = { n: 0, total: teachingTotal, heading: headingText(section.heading.text), title: spineTitle(section.heading.text), role: section.heading.role };
    }

    // The section's blocks in note order, with its "See it done" headings where they stand: each titles the cards after it.
    const walk = [...section.blocks.map((b) => ({ at: b.at, heading: null as string | null, block: b.block as unknown })), ...section.continuations.map((h) => ({ at: h.at, heading: h.text, block: null as unknown }))].sort(
      (a, b) => a.at - b.at,
    );
    let current = ref;
    let cardsUnderHeading = 0;
    let ideasUnderHeading = 0;
    let seesUnderHeading = 0;
    let lastMedia: MediaBlock["type"] | null = null;
    let lastSeeKey: string | null = null;
    /** A drawn figure waiting for the paragraph straight after it, whose first card it stands on. */
    let pendingFigure: FigureBlock | null = null;
    let pendingFigureAt = -1;

    for (const item of walk) {
      if (item.heading !== null) {
        current = ref ? { ...ref, heading: headingText(item.heading), title: spineTitle(item.heading), role: "see" } : ref;
        cardsUnderHeading = 0;
        ideasUnderHeading = 0;
        seesUnderHeading = 0;
        continue;
      }
      const b = item.block;
      const t = blockType(b);
      if (t === "p") {
        // The recap's and the pointer's words are their cards already.
        if (closingPair) continue;
        const sec = current ?? { n: 0, total: teachingTotal, heading: "", title: "", role: null };
        const part = partAt[item.at];
        const pieces = packParagraph(str((b as Block).md));
        // An empty paragraph packs into no card: a figure waiting for it stands on a card of its own, never dropped.
        if (pieces.length === 0 && pendingFigure) {
          cards.push({ kind: "media", key: unique(`media:figure:${mediaCount}`), section: current, block: pendingFigure, part: partAt[pendingFigureAt] });
          cardsUnderHeading += 1;
        }
        pieces.forEach((piece, k) => {
          ideasUnderHeading += 1;
          cards.push({
            kind: "idea",
            key: unique(`idea:${slug(sec.heading) || "opening"}:${ideasUnderHeading}`),
            section: sec,
            first: cardsUnderHeading === 0 && sec.heading !== "",
            md: piece,
            words: countWords(piece),
            figure: k === 0 ? pendingFigure : null,
            part,
          });
          cardsUnderHeading += 1;
        });
        pendingFigure = null;
        lastMedia = null;
        continue;
      }
      if (MEDIA_TYPES.has(t)) {
        const block = b as MediaBlock;
        mediaCount += 1;
        if (block === pointerFigure) continue;
        // A drawn figure with a paragraph straight after it goes on that paragraph's first card (the paragraph reads it).
        if (block.type === "figure" && typeof block.svg === "string" && block.svg.length > 0 && blockType(body[item.at + 1]) === "p" && !closingPair) {
          pendingFigure = block;
          pendingFigureAt = item.at;
          continue;
        }
        const id = block.type === "video" ? block.videoId : block.type === "sim" ? slug(block.title) : String(mediaCount);
        cards.push({ kind: "media", key: unique(`media:${block.type}:${id}`), section: current, block, part: partAt[item.at] });
        cardsUnderHeading += 1;
        lastMedia = block.type;
        continue;
      }
      if (t === "see") {
        seeCount += 1;
        seesUnderHeading += 1;
        const see = resolveSee(b as Parameters<typeof resolveSee>[0], options.workedExamples ?? null);
        const firstSee = seeCount === 1;
        const key = unique(`see:${slug(current?.heading ?? "") || "opening"}:${seesUnderHeading}`);
        cards.push({ kind: "see", key, section: current, first: cardsUnderHeading === 0 && (current?.heading ?? "") !== "", see, firstSee, typed: typedStep(see, firstSee), part: partAt[item.at] });
        cardsUnderHeading += 1;
        lastSeeKey = key;
        lastMedia = null;
        continue;
      }
      if (t === "gate") {
        const gate = b as GateBlock;
        cards.push({ kind: "gate", key: unique(`gate:${gate.id}`), section: current, gate, afterMedia: lastMedia, retry: false, twin: false, turn: null, seeKey: lastSeeKey, part: partAt[item.at] });
        cardsUnderHeading += 1;
        lastMedia = null;
        continue;
      }
      if (t === "callout") {
        const block = b as CalloutBlock;
        cards.push({ kind: "callout", key: unique(`callout:${block.kind}:${slug(block.title ?? "")}`), section: current, block, part: partAt[item.at] });
        cardsUnderHeading += 1;
        lastMedia = null;
        continue;
      }
      if (t === "prompt") {
        const p = promptById.get(str((b as Block).promptId));
        if (p && recallIds.has(p.id)) cards.push({ kind: "recall", key: unique(`recall:${p.id}`), prompt: p, index: 0, total: 0, part: partAt[item.at] });
        continue;
      }
      // hero (already the title card), pause (Read's stopping points), or anything unknown: nothing.
    }
    // A figure left waiting (its paragraph was the recap's): a card of its own, never dropped.
    if (pendingFigure) cards.push({ kind: "media", key: unique(`media:figure:${mediaCount}`), section: current, block: pendingFigure, part: partAt[pendingFigureAt] });
  }

  // Recall cards know their place among the recall cards.
  const recalls = cards.filter((c): c is Extract<Card, { kind: "recall" }> => c.kind === "recall");
  recalls.forEach((c, i) => {
    c.index = i + 1;
    c.total = recalls.length;
  });

  // Two Your turns in a row (a section that showed two variants): "1 of 2", "2 of 2".
  for (let i = 0; i < cards.length; ) {
    let j = i;
    while (j < cards.length && cards[j]!.kind === "gate") j += 1;
    if (j - i >= 2) for (let k = i; k < j; k += 1) (cards[k] as GateCard).turn = { n: k - i + 1, of: j - i };
    i = j === i ? i + 1 : j;
  }

  // The registered interaction cards, each after the card it belongs to (the first of its keys the deck holds).
  for (const add of enrichment?.interactions ?? []) {
    const keys = typeof add.after === "string" ? [add.after] : add.after;
    const hostKey = keys.find((k) => cards.some((c) => c.key === k));
    const at = hostKey === undefined ? -1 : cards.findIndex((c) => c.key === hostKey);
    if (at < 0) continue;
    const host = cards[at]!;
    const sec = "section" in host ? host.section : null;
    cards.splice(at + 1, 0, { kind: "interaction", key: unique(`interaction:${add.id}`), section: sec, id: add.id });
  }

  cards.push({ kind: "close", key: "close" });
  return { cards, stats: deckStats(cards) };
}

/**
 * The deck's numbers, the one truth every surface prints (the title card, the topic hero's Slides button, the close):
 * the cards actually in it, its Your turns (a retry is not a new one), its See its, its recall cards, its videos and
 * which of them have no stated length, and the minutes. The minutes are ./minutes.ts's, the model Read prices with: each
 * card's cost added into the part of the lesson it stands in, the whole rounded once, and a minute for each figure to
 * act on; a card costs what it shows (cardSeconds, re-exported above), never a floor.
 */
export function deckStats(cards: readonly Card[]): DeckStats {
  const videos = cards.filter((c): c is Extract<Card, { kind: "media" }> => c.kind === "media" && c.block.type === "video");
  return {
    cards: cards.length,
    gates: cards.filter((c) => c.kind === "gate" && !c.retry).length,
    sees: cards.filter((c) => c.kind === "see").length,
    recall: cards.filter((c) => c.kind === "recall").length,
    videos: videos.length,
    untimedVideos: videos.filter((c) => videoSeconds(c.block) === null).length,
    minutes: slidesMinutes(partsOfCards(cards), cards.filter((c) => c.kind === "interaction").length),
  };
}

/**
 * The missed Your turns come back once, in order, as the last cards before the recap (before the close when a note has
 * no recap): Duolingo's mistakes-at-the-end placed as the owner answered (the twin before the recap only, a spaced
 * second try). A retry asks the gate's twin, on new numbers, where the note carries one (`twin`), and otherwise the
 * gate again with its answer moved. Nothing is recorded for it: the first answer is the record. Pure: the runner calls
 * this with the ids missed so far.
 */
export function withRetries(cards: readonly Card[], missedGateIds: readonly string[]): Card[] {
  const base = cards.filter((c) => !(c.kind === "gate" && c.retry));
  if (missedGateIds.length === 0) return base;
  // Each retry goes before the first recap or pointer that comes AFTER its gate, else before the close: never behind
  // her. A gate the note puts after its recap (four FM1 notes do) gets its retry before the close, so the card she is
  // on never turns into the recap under her when the deck grows (audit CQ-08).
  const closeAt = (() => {
    const close = base.findIndex((c) => c.kind === "close");
    return close >= 0 ? close : base.length;
  })();
  const slotAfter = (at: number) => {
    const next = base.findIndex((c, i) => i > at && (c.kind === "recap" || c.kind === "pointer"));
    return next >= 0 ? next : closeAt;
  };
  const bySlot = new Map<number, Card[]>();
  for (const id of missedGateIds) {
    const at = base.findIndex((c) => c.kind === "gate" && c.gate.id === id);
    if (at < 0) continue;
    const original = base[at] as GateCard;
    const slot = slotAfter(at);
    const retry: GateCard = { ...original, key: `retry:${id}`, retry: true, afterMedia: null, twin: original.gate.twin !== undefined, turn: null };
    bySlot.set(slot, [...(bySlot.get(slot) ?? []), retry]);
  }
  const out: Card[] = [];
  base.forEach((c, i) => {
    out.push(...(bySlot.get(i) ?? []));
    out.push(c);
  });
  out.push(...(bySlot.get(base.length) ?? []));
  return out;
}

/** The gate ids of a deck, in order, without retries: the same ids Read records. */
export function deckGateIds(cards: readonly Card[]): string[] {
  return cards.filter((c): c is GateCard => c.kind === "gate" && !c.retry).map((c) => c.gate.id);
}

/**
 * The card after `at` that she moves on to, and what its control is called: "Your turn" when it is a Your turn, else
 * "Continue" (a See it with a video beside it goes on to the video first).
 */
export function nextLabel(cards: readonly Card[], at: number): "Your turn" | "Continue" {
  const next = cards[at + 1];
  return next?.kind === "gate" && !next.retry ? "Your turn" : "Continue";
}

/**
 * The deck's own rules, as plain problems (none for a deck built from a note that passes the build): nothing is asked
 * before it has been shown (in a deck with See its, the first Your turn follows the first See it, and every Your turn
 * follows a See it of its own section, or the Your turn before it when two share one); at most two recall cards; no
 * explanation names an option by its place (the options are shuffled). Whether a See it prints the answer of its Your
 * turn is a judgement a reviewer confirms (seeAnswerPrinted lists the candidates), so it is reported, never a rule here.
 */
export function deckRuleViolations(cards: readonly Card[]): string[] {
  const out: string[] = [];
  const firstSee = cards.findIndex((c) => c.kind === "see");
  const gates = cards.map((c, i) => [c, i] as const).filter((e): e is readonly [GateCard, number] => e[0].kind === "gate" && !e[0].retry);
  if (firstSee >= 0) {
    const firstGate = gates[0];
    if (firstGate && firstGate[1] < firstSee) out.push(`the first Your turn (${firstGate[0].gate.id}) comes before the first See it`);
    for (const [gate, i] of gates) {
      const sectionHasSee = cards.some((c) => c.kind === "see" && c.section !== null && gate.section !== null && c.section.n === gate.section.n && c.section.n > 0);
      if (!sectionHasSee) continue;
      // Walk back within the section: a See it, or a Your turn that follows one, before any other gate.
      let ok = false;
      for (let j = i - 1; j >= 0; j -= 1) {
        const c = cards[j]!;
        if (!("section" in c) || c.section === null || gate.section === null || c.section.n !== gate.section.n) break;
        if (c.kind === "see") {
          ok = true;
          break;
        }
        if (c.kind === "gate") {
          ok = gate.turn !== null && gate.turn.n > 1;
          break;
        }
      }
      if (!ok) out.push(`Your turn ${gate.gate.id} has no See it of its own before it in its section`);
    }
  }
  const recall = cards.filter((c) => c.kind === "recall").length;
  if (recall > RECALL_MAX) out.push(`${recall} recall cards (at most ${RECALL_MAX})`);
  // Only a choice gate's options are shuffled, so only its words (and its twin's) can point at the wrong one.
  for (const [gate] of gates) {
    if (gate.gate.kind !== "choice") continue;
    const said = positionalWording(gate.gate.explain) ?? positionalWording(gate.gate.twin?.explain);
    if (said) out.push(`Your turn ${gate.gate.id} names an option by its place: "${said}"`);
  }
  return out;
}

/**
 * The Your turns whose See it prints their answer as written (seeShowsAnswer), for a reviewer to judge: a See it shows
 * the method, and its Your turn asks it on new numbers or in new words, so answering is recall and not copying (the
 * lead, 27 Sep 2026). A candidate, not a verdict: a key word the section teaches may rightly stand in both.
 */
export function seeAnswerPrinted(cards: readonly Card[]): Array<{ gate: string; answer: string }> {
  const out: Array<{ gate: string; answer: string }> = [];
  for (const c of cards) {
    if (c.kind !== "gate" || c.retry) continue;
    const see = cards.find((d): d is SeeCard => d.kind === "see" && d.key === c.seeKey);
    const shown = see?.see ? seeShowsAnswer(see.see, c.gate) : null;
    if (shown) out.push({ gate: c.gate.id, answer: shown });
  }
  return out;
}

/**
 * "About 11 minutes plus a video": the minutes the deck is honestly worth, and, when a video has no stated length, the
 * video named beside them rather than guessed into them (a Corbettmaths video runs five or six minutes; the card asks
 * her to watch it).
 */
export function deckMinutesPhrase(stats: DeckStats): string {
  const { minutes, plus } = deckMinutes(stats);
  return plus ? `${minutes} ${plus}` : minutes;
}

/** The two halves of the minutes phrase, for a renderer that sets the minutes in bold: "About 11 minutes", "plus a video". */
export function deckMinutes(stats: DeckStats): { minutes: string; plus: string | null } {
  const minutes = `About ${stats.minutes} ${stats.minutes === 1 ? "minute" : "minutes"}`;
  // The untimed video is named as Read names it (./minutes.ts untimedPhrase): one phrase for both ways.
  return { minutes, plus: untimedPhrase(stats.untimedVideos) };
}

/**
 * "36 cards · 8 your turns · 4 see its · 1 video": the counts beside the minutes (the teach-first case §8.1, the title
 * card counts See its and Your turns). A timed video is listed with them; an untimed one is already named in the
 * minutes phrase ("plus a video"), so it is not said twice.
 */
export function promiseLine(stats: DeckStats): string {
  const timed = stats.videos - stats.untimedVideos;
  const parts = [
    `${stats.cards} cards`,
    stats.gates > 0 ? `${stats.gates} ${stats.gates === 1 ? "your turn" : "your turns"}` : null,
    stats.sees > 0 ? `${stats.sees} ${stats.sees === 1 ? "see it" : "see its"}` : null,
    timed > 0 ? `${timed} ${timed === 1 ? "video" : "videos"}` : null,
  ].filter((p): p is string => p !== null);
  return parts.join(" · ");
}

/**
 * The whole promise, as the title card prints it: "About 21 minutes · 36 cards · 8 your turns · 1 video" (the trial
 * since its video states its length), or "About 11 minutes plus a video · 23 cards · 7 your turns" for one that does not.
 */
export function deckPromise(stats: DeckStats): string {
  return `${deckMinutesPhrase(stats)} · ${promiseLine(stats)}`;
}
