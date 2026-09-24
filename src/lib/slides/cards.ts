/**
 * Slides (decision 9, 23 Sep 2026): the card list of a topic, generated from the same note.blocks.json the Read view
 * renders, so an author writes once. Pure: no React, no database, no clock. The renderer in src/components/slides
 * draws these cards; the unit test pins the trial topic's exact count.
 *
 * The split rules (docs/plan/review/2026-09-23-benchmarks.md page 4; the depth standard §3 "Slides-readiness"):
 * - the hero block is the title card, carrying the note's first figure (the one the topic hero hoists);
 * - each heading opens a section; its first paragraph and the heading are one idea card, the section's later
 *   paragraphs are idea cards of their own. A paragraph's authored line breaks are units; a unit over the budget
 *   (75 words, the standard's CARD_WORDS) is split at sentence boundaries, never inside a sentence or inside maths;
 * - a figure, photo, video or simulation is a media card on its own, with its caption as what to notice; the gate
 *   after a video says so ("Watching is not practice");
 * - a gate is a gate card; a callout is a card with its title; the "You can now" heading and its paragraph are the
 *   recap card; the "In the exam" heading and its paragraph are the pointer card; each retrieval prompt is a recall
 *   card; a close card ends the deck.
 * - an enrichment (pure data, keyed to the topic id) may add a figure-to-act-on card after a named card. The list
 *   without it is a function of the note alone; the list with it is a function of the note and that descriptor.
 *
 * Gate ids and prompt ids are the note's own, so an answer here is the same record as an answer in Read.
 */
import type { GateBlock, NoteBlock } from "@/components/items/gates";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { countWords, headingText, heroDataFor, lessonBlocks, spineTitle, type HeroFigure } from "@/components/topic/lesson-plan";
import { chooseRecall } from "./recall";

/** One idea per card: the depth standard's budget for a paragraph or callout (scripts/qa/lesson-v2.mjs CARD_WORDS). */
export const CARD_WORDS = 75;

export interface SectionRef {
  /** 1-based among the teaching sections (the recap and the pointer are not sections). */
  n: number;
  total: number;
  /** The heading as authored (markdown and maths kept), without an authored number. */
  heading: string;
  /** The heading's first clause, as the spine lists it. */
  title: string;
  /** The heading's `role` when the author gave one (the depth standard): idea, why, variant, see, twists, further, derivation. */
  role: string | null;
}

export type MediaBlock = Extract<NoteBlock, { type: "figure" | "photo" | "video" | "sim" }>;
export type CalloutBlock = Extract<NoteBlock, { type: "callout" }>;

export type Card =
  | { kind: "title"; key: "title"; lede: string; can: string[]; figure: HeroFigure | null }
  | { kind: "idea"; key: string; section: SectionRef; first: boolean; md: string; words: number }
  | { kind: "media"; key: string; section: SectionRef | null; block: MediaBlock }
  | { kind: "gate"; key: string; section: SectionRef | null; gate: GateBlock; afterMedia: MediaBlock["type"] | null; retry: boolean }
  | { kind: "callout"; key: string; section: SectionRef | null; block: CalloutBlock }
  | { kind: "interaction"; key: string; section: SectionRef | null; id: string }
  | { kind: "recap"; key: "recap"; heading: string; lines: string[] }
  | { kind: "pointer"; key: "pointer"; heading: string; md: string }
  | { kind: "recall"; key: string; prompt: RetrievalPrompt; index: number; total: number }
  | { kind: "close"; key: "close" };

export type CardKind = Card["kind"];

/** Pure data that adds to a topic's deck without touching its note. Keyed by the topic id where it is registered. */
export interface SlidesEnrichment {
  /** A figure she acts on, inserted after the card with the given key. `id` names the interaction the renderer draws. */
  interactions?: Array<{ after: string; id: string }>;
}

export interface DeckStats {
  cards: number;
  gates: number;
  recall: number;
  videos: number;
  /** Videos whose block carries no length: named beside the minutes ("plus a video"), never guessed into them. */
  untimedVideos: number;
  /** An honest estimate of the cards and checks, and of a video only when its block says how long it runs. */
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

const RECAP = /^\s*you can now\b/i;
const POINTER = /^\s*in the exam\b/i;
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
 * Sentences of a markdown line, cut after . ! or ? followed by a space, never inside `$…$` and never mid-abbreviation
 * ("e.g. " is rare in the notes and is kept whole by the closing-character rule). The last piece takes whatever is left.
 */
export function splitSentences(md: string): string[] {
  const out: string[] = [];
  let start = 0;
  let inMaths = false;
  for (let i = 0; i < md.length; i += 1) {
    const ch = md[i];
    if (ch === "\\") {
      i += 1;
      continue;
    }
    if (ch === "$") {
      inMaths = !inMaths;
      continue;
    }
    if (inMaths) continue;
    if ((ch === "." || ch === "!" || ch === "?") && /^["')\]*]*\s/.test(md.slice(i + 1, i + 4))) {
      // Take closing quotes, brackets and emphasis markers with the sentence.
      let end = i + 1;
      while (end < md.length && /["')\]*]/.test(md[end])) end += 1;
      out.push(md.slice(start, end).trim());
      start = end;
    }
  }
  const rest = md.slice(start).trim();
  if (rest) out.push(rest);
  return out.filter((s) => s.length > 0);
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

function sectionRef(heading: string, n: number, role: string | null): Omit<SectionRef, "total"> {
  const text = headingText(heading);
  return { n, heading: text, title: spineTitle(heading), role };
}

/**
 * The deck for a note. `prompts` are the bundle's retrieval prompts (the note holds only their ids; a prompt the bundle
 * does not carry is skipped). `enrichment` is the topic's registered descriptor, if any.
 */
export function buildDeck(blocks: readonly unknown[] | null | undefined, prompts: readonly RetrievalPrompt[] = [], enrichment: SlidesEnrichment | null = null): Deck {
  const list = blocks ?? [];
  const hero = heroDataFor(list);
  const body = lessonBlocks<unknown>(list, hero.lede).filter((b) => blockType(b) !== "pause");
  const promptById = new Map<string, RetrievalPrompt>(prompts.map((p) => [p.id, p]));
  // The recall cards: of the prompts the note places, at most two light ones (src/lib/slides/recall.ts, the owner's
  // trial: "it doesn't have to be always four … like writing an essay, not remembering").
  const placed = body.flatMap((b) => (blockType(b) === "prompt" && promptById.has(str((b as Block).promptId)) ? [promptById.get(str((b as Block).promptId))!] : []));
  const recallIds = new Set(chooseRecall(placed).map((p) => p.id));

  // First pass: where the recap and the pointer begin, so the teaching sections can be numbered.
  const isRecapHeading = (b: unknown) => blockType(b) === "h" && (str((b as Block).role) === "recap" || RECAP.test(str((b as Block).text)));
  const isPointerHeading = (b: unknown) => blockType(b) === "h" && (str((b as Block).role) === "pointer" || POINTER.test(str((b as Block).text)));
  const recapAt = body.findIndex(isRecapHeading);
  const pointerAt = body.findIndex(isPointerHeading);
  const closingAt = [recapAt, pointerAt].filter((i) => i >= 0).reduce((m, i) => Math.min(m, i), Number.POSITIVE_INFINITY);
  const teaching = body.filter((b, i) => i < closingAt && blockType(b) === "h").length;

  const cards: Card[] = [{ kind: "title", key: "title", lede: hero.lede, can: hero.can, figure: hero.figure }];
  let section: SectionRef | null = null;
  /** Cards of any kind in the open section (the first one carries the heading). */
  let sectionCards = 0;
  /** Idea cards in the open section: the ordinal in an idea card's key, so a gate between them never shifts it. */
  let sectionIdeas = 0;
  let ideaCount = 0;
  let mediaCount = 0;
  let lastMedia: MediaBlock["type"] | null = null;
  const seenKeys = new Set<string>(["title"]);
  const unique = (key: string) => {
    let k = key;
    let i = 2;
    while (seenKeys.has(k)) k = `${key}~${i++}`;
    seenKeys.add(k);
    return k;
  };

  for (let i = 0; i < body.length; i += 1) {
    const b = body[i];
    const t = blockType(b);
    if (t === "h") {
      const text = str((b as Block).text);
      const role = str((b as Block).role) || null;
      if (i === recapAt || i === pointerAt) {
        // The closing pair: the heading and its paragraph are one card each.
        const next = body[i + 1];
        const md = blockType(next) === "p" ? str((next as Block).md) : "";
        if (i === recapAt) cards.push({ kind: "recap", key: "recap", heading: headingText(text), lines: md.split(/\n+/).map((l) => l.trim()).filter(Boolean) });
        else cards.push({ kind: "pointer", key: "pointer", heading: headingText(text), md });
        if (md) i += 1;
        section = null;
        continue;
      }
      section = { ...sectionRef(text, teaching ? Math.min(teaching, ideaCount + 1) : 1, role), total: teaching };
      ideaCount += 1;
      section = { ...section, n: ideaCount };
      sectionCards = 0;
      sectionIdeas = 0;
      continue;
    }
    if (t === "p") {
      const md = str((b as Block).md);
      const sec: SectionRef = section ?? { n: Math.max(1, ideaCount), total: teaching, heading: "", title: "", role: null };
      for (const piece of packParagraph(md)) {
        sectionIdeas += 1;
        cards.push({ kind: "idea", key: unique(`idea:${slug(sec.heading) || "opening"}:${sectionIdeas}`), section: sec, first: sectionCards === 0, md: piece, words: countWords(piece) });
        sectionCards += 1;
      }
      lastMedia = null;
      continue;
    }
    if (MEDIA_TYPES.has(t)) {
      const block = b as MediaBlock;
      mediaCount += 1;
      const id = block.type === "video" ? block.videoId : block.type === "sim" ? slug(block.title) : String(mediaCount);
      cards.push({ kind: "media", key: unique(`media:${block.type}:${id}`), section, block });
      sectionCards += 1;
      lastMedia = block.type;
      continue;
    }
    if (t === "gate") {
      const gate = b as GateBlock;
      cards.push({ kind: "gate", key: unique(`gate:${gate.id}`), section, gate, afterMedia: lastMedia, retry: false });
      sectionCards += 1;
      lastMedia = null;
      continue;
    }
    if (t === "callout") {
      const block = b as CalloutBlock;
      cards.push({ kind: "callout", key: unique(`callout:${block.kind}:${slug(block.title ?? "")}`), section, block });
      sectionCards += 1;
      lastMedia = null;
      continue;
    }
    if (t === "prompt") {
      const p = promptById.get(str((b as Block).promptId));
      if (p && recallIds.has(p.id)) cards.push({ kind: "recall", key: unique(`recall:${p.id}`), prompt: p, index: 0, total: 0 });
      continue;
    }
    // hero (already the title card), pause (Read's stopping points), or anything unknown: nothing.
  }

  // Recall cards know their place among the recall cards.
  const recalls = cards.filter((c): c is Extract<Card, { kind: "recall" }> => c.kind === "recall");
  recalls.forEach((c, i) => {
    c.index = i + 1;
    c.total = recalls.length;
  });

  // The registered interaction cards, each after the card it belongs to.
  for (const add of enrichment?.interactions ?? []) {
    const at = cards.findIndex((c) => c.key === add.after);
    if (at < 0) continue;
    const host = cards[at];
    const sec = "section" in host ? host.section : null;
    cards.splice(at + 1, 0, { kind: "interaction", key: unique(`interaction:${add.id}`), section: sec, id: add.id });
  }

  cards.push({ kind: "close", key: "close" });
  return { cards, stats: deckStats(cards) };
}

/** A video's own length in seconds when its block says it (an `end`, from `start` or the beginning), else null. */
export function videoSeconds(block: MediaBlock): number | null {
  if (block.type !== "video" || typeof block.end !== "number") return null;
  return Math.max(0, block.end - (typeof block.start === "number" ? block.start : 0));
}

/** Seconds a card costs: the minute model of lesson-plan.ts (180 words a minute, 40 s a check), never flattering. */
export function cardSeconds(card: Card): number {
  switch (card.kind) {
    case "title":
    case "close":
      return 0;
    case "idea":
      return Math.max(20, Math.round((card.words / 180) * 60));
    case "callout":
      return Math.max(20, Math.round((countWords(card.block.md) / 180) * 60));
    case "media":
      // A video counts its own length only when its block carries one; otherwise it is named, not timed ("plus a video").
      return card.block.type === "video" ? (videoSeconds(card.block) ?? 0) : 20;
    case "gate":
      return 40;
    case "interaction":
      return 60;
    case "recap":
      return 20;
    case "pointer":
      return Math.max(20, Math.round((countWords(card.md) / 180) * 60));
    case "recall":
      return 30;
  }
}

/**
 * The deck's numbers, the one truth every surface prints (the title card, the topic hero's Slides button, the close):
 * the cards actually in it, its checks (a retry is not a new check), its recall cards, its videos and which of them have
 * no stated length, and the minutes.
 */
export function deckStats(cards: readonly Card[]): DeckStats {
  const seconds = cards.reduce((n, c) => n + cardSeconds(c), 0);
  const videos = cards.filter((c): c is Extract<Card, { kind: "media" }> => c.kind === "media" && c.block.type === "video");
  return {
    cards: cards.length,
    gates: cards.filter((c) => c.kind === "gate" && !c.retry).length,
    recall: cards.filter((c) => c.kind === "recall").length,
    videos: videos.length,
    untimedVideos: videos.filter((c) => videoSeconds(c.block) === null).length,
    minutes: Math.max(1, Math.round(seconds / 60)),
  };
}

/**
 * Duolingo's mistakes-at-the-end (benchmarks page 4): the gates she missed come back once, in order, as the last cards
 * before the recap (before the close when a note has no recap). A retry card carries the same gate; nothing is recorded
 * for it, because the first answer is the record. Pure: the runner calls this with the ids missed so far.
 */
export function withRetries(cards: readonly Card[], missedGateIds: readonly string[]): Card[] {
  const base = cards.filter((c) => !(c.kind === "gate" && c.retry));
  if (missedGateIds.length === 0) return base;
  const insertAt = (() => {
    const recap = base.findIndex((c) => c.kind === "recap" || c.kind === "pointer");
    if (recap >= 0) return recap;
    const close = base.findIndex((c) => c.kind === "close");
    return close >= 0 ? close : base.length;
  })();
  const retries: Card[] = [];
  for (const id of missedGateIds) {
    const original = base.find((c): c is Extract<Card, { kind: "gate" }> => c.kind === "gate" && c.gate.id === id);
    if (original) retries.push({ ...original, key: `retry:${id}`, retry: true, afterMedia: null });
  }
  return [...base.slice(0, insertAt), ...retries, ...base.slice(insertAt)];
}

/** The gate ids of a deck, in order, without retries: the same ids Read records. */
export function deckGateIds(cards: readonly Card[]): string[] {
  return cards.filter((c): c is Extract<Card, { kind: "gate" }> => c.kind === "gate" && !c.retry).map((c) => c.gate.id);
}

const NUMBER_WORDS = ["no", "a", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

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
  const n = stats.untimedVideos;
  return { minutes, plus: n === 0 ? null : `plus ${n === 1 ? "a video" : `${NUMBER_WORDS[n] ?? n} videos`}` };
}

/**
 * "23 cards · 7 checks": the counts beside the minutes. A timed video is listed with them; an untimed one is already
 * named in the minutes phrase, so it is not said twice.
 */
export function promiseLine(stats: DeckStats): string {
  const timed = stats.videos - stats.untimedVideos;
  const parts = [
    `${stats.cards} cards`,
    stats.gates > 0 ? `${stats.gates} ${stats.gates === 1 ? "check" : "checks"}` : null,
    timed > 0 ? `${timed} ${timed === 1 ? "video" : "videos"}` : null,
  ].filter((p): p is string => p !== null);
  return parts.join(" · ");
}

/** The whole promise, as the title card prints it: "About 11 minutes plus a video · 23 cards · 7 checks". */
export function deckPromise(stats: DeckStats): string {
  return `${deckMinutesPhrase(stats)} · ${promiseLine(stats)}`;
}
