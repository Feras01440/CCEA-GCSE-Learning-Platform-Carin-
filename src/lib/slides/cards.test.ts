import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { CARD_WORDS, buildDeck, cardSeconds, deckGateIds, deckMinutesPhrase, deckPromise, packParagraph, promiseLine, slug, splitSentences, withRetries, type Card } from "./cards";
import { deckFor, slidesCardCount } from "./deck";
import { enrichmentFor } from "./enrichment";

const ROOT = path.resolve(__dirname, "../../..");
const TRIAL = path.join(ROOT, "packs", "further-maths", "content", "fm1", "algebraic-fractions-simplify");
const TRIAL_ID = "fm.u1.algebraic-fractions-simplify";

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));
const trialBlocks = (): unknown[] => readJson(path.join(TRIAL, "note.blocks.json")) as unknown[];
const trialPrompts = (): RetrievalPrompt[] => (readJson(path.join(TRIAL, "bundle.json")) as { prompts: RetrievalPrompt[] }).prompts;

const kinds = (cards: readonly Card[]) => cards.map((c) => c.kind);

describe("the trial topic's deck (fm1/algebraic-fractions-simplify)", () => {
  // The note as the content pass of 25 Sep 2026 left it: seven sections in teach, show, check order (roles on every
  // heading), eight gates, a timed video, two light prompts. The deck follows the note; these tests pin that reading.
  it("is 37 cards from the note alone: title, 31 teaching cards, recap, pointer, 2 light recall cards, close", () => {
    const deck = buildDeck(trialBlocks(), trialPrompts());
    expect(deck.stats).toMatchObject({ cards: 37, gates: 8, recall: 2, videos: 1, untimedVideos: 0 });
    expect(kinds(deck.cards)).toEqual([
      "title",
      "idea", // 1 Why cancelling works: the drawing
      "idea", // 1 continued: cancelling is division
      "idea", // 1 continued: a factor, a term
      "gate", // g2
      "media", // 2 A square minus a square: the figure carries the heading
      "idea",
      "idea",
      "gate", // g12
      "idea", // 3 Two squares with a number in front
      "idea",
      "gate", // g9
      "media", // 4 A common factor first: the figure carries the heading
      "idea",
      "idea",
      "callout", // Beyond this specification
      "gate", // g13
      "idea", // 5 The three moves
      "idea", // 5 continued: the moves worked on one fraction
      "media", // the video
      "gate", // g4, after the video
      "idea", // 6 Fully means fully
      "idea",
      "callout", // Summer 2024, FM1 Q8(a)
      "gate", // g10
      "callout", // Why a lone number or x still counts
      "idea",
      "gate", // g11
      "idea", // 7 How the paper asks it
      "idea",
      "idea",
      "gate", // g8
      "recap",
      "pointer",
      "recall", // 02
      "recall", // 08
      "close",
    ]);
  });

  it("is 38 cards with its registered enrichment: the figure she acts on, straight after the moves are worked", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    expect(deck.stats).toMatchObject({ cards: 38, gates: 8, recall: 2, videos: 1, untimedVideos: 0 });
    const at = deck.cards.findIndex((c) => c.kind === "interaction");
    expect(at).toBeGreaterThan(0);
    expect(deck.cards[at - 1]).toMatchObject({ kind: "idea", key: "idea:the-three-moves:2" });
    expect(deck.cards[at]).toMatchObject({ kind: "interaction", id: "afs.tap-to-cancel" });
    expect(deck.cards[at + 1]).toMatchObject({ kind: "media", key: "media:video:tlKN8NNNxdI" });
    expect(slidesCardCount(TRIAL_ID, trialBlocks(), trialPrompts())).toBe(38);
    // The tap card comes where the note has just struck a shared bracket, after the card that names the three moves.
    const host = deck.cards[at - 1] as Extract<Card, { kind: "idea" }>;
    expect(host.md).toContain("Strike $(x+8)$ from both lines");
    expect((deck.cards[at - 2] as Extract<Card, { kind: "idea" }>).md).toContain("Third, strike every factor both lines share");
  });

  it("keeps the note's gate ids in the note's order, so an answer here is the Read record", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    expect(deckGateIds(deck.cards)).toEqual(["g2", "g12", "g9", "g13", "g4", "g10", "g11", "g8"]);
    const g4 = deck.cards.find((c) => c.kind === "gate" && c.gate.id === "g4") as Extract<Card, { kind: "gate" }>;
    expect(g4.afterMedia).toBe("video");
    const g2 = deck.cards.find((c) => c.kind === "gate" && c.gate.id === "g2") as Extract<Card, { kind: "gate" }>;
    expect(g2.afterMedia).toBeNull();
  });

  it("titles the sections, numbers them 1 to 7, lets a section's figure carry its heading, and keeps the recap and pointer outside the count", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const ideas = deck.cards.filter((c): c is Extract<Card, { kind: "idea" }> => c.kind === "idea");
    expect(ideas.map((c) => [c.section.n, c.first])).toEqual([
      [1, true],
      [1, false],
      [1, false],
      [2, false],
      [2, false],
      [3, true],
      [3, false],
      [4, false],
      [4, false],
      [5, true],
      [5, false],
      [6, true],
      [6, false],
      [6, false],
      [7, true],
      [7, false],
      [7, false],
    ]);
    expect(ideas[0].section).toMatchObject({ total: 7, heading: "Why cancelling works, and when it does not", title: "Why cancelling works, and when it does not", role: "idea" });
    // Sections 2 and 4 open on their figure, and the figure's card carries the heading (cards.tsx mediaParts).
    const figures = deck.cards.filter((c): c is Extract<Card, { kind: "media" }> => c.kind === "media" && c.block.type === "figure");
    expect(figures.map((c) => [c.section?.n, c.section?.heading])).toEqual([
      [2, "A square minus a square"],
      [4, "A common factor first"],
    ]);
    const video = deck.cards.find((c) => c.kind === "media" && c.block.type === "video") as Extract<Card, { kind: "media" }>;
    expect(video.section).toMatchObject({ n: 5, heading: "The three moves", role: "see" });
    // The card after a gate in the same section is not the section's first card, and its key counts idea cards only.
    expect(ideas[13]).toMatchObject({ key: "idea:fully-means-fully:3", first: false });
    const recap = deck.cards.find((c) => c.kind === "recap") as Extract<Card, { kind: "recap" }>;
    expect(recap.heading).toBe("You can now");
    expect(recap.lines).toEqual([
      "Factorise both lines fully: common factor first, then two squares or a quadratic.",
      "Cancel only factors, never terms; test with a number if unsure.",
      "Finish on the numbers and any lone $x$: nothing may divide both lines.",
      "Turn a division into a multiplication first; 'simplest form' and 'hence' end the same way.",
    ]);
    // One recap glyph per line, in the recap's order.
    expect(enrichmentFor(TRIAL_ID)?.recapGlyphs).toHaveLength(recap.lines.length);
    const pointer = deck.cards.find((c) => c.kind === "pointer") as Extract<Card, { kind: "pointer" }>;
    expect(pointer.heading).toBe("In the exam");
    expect(pointer.md).toMatch(/^On FM1 this move rarely stands alone: \*\*simplify fully\*\*/);
  });

  it("carries the hoisted figure on the title card and the hero's promise", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const title = deck.cards[0] as Extract<Card, { kind: "title" }>;
    expect(title.figure?.kind).toBe("svg");
    expect(title.can).toHaveLength(3);
    expect(title.lede).toMatch(/^\$\\frac\{12\}\{18\}\$ cancels/);
    // The video now states its length (5 min 41 s), so it is in the minutes, and named in the count (audit LD-03).
    expect(promiseLine(deck.stats)).toBe("38 cards · 8 checks · 1 video");
    expect(deckPromise(deck.stats)).toMatch(/^About \d+ minutes · 38 cards · 8 checks · 1 video$/);
    // Honest minutes: 20 s a reading card, 40 s a check, 30 s a recall card, a minute on the figure, the video's own length.
    expect(deck.stats.minutes).toBeGreaterThanOrEqual(18);
    expect(deck.stats.minutes).toBeLessThanOrEqual(24);
    // Every card in the deck is counted, and only those.
    expect(deck.stats.minutes).toBe(Math.max(1, Math.round(deck.cards.reduce((n, c) => n + cardSeconds(c), 0) / 60)));
  });

  it("times a video only when its block says how long it runs", () => {
    const withoutEnd = trialBlocks().map((b) => {
      if ((b as { type?: string }).type !== "video") return b;
      const { end: _end, ...rest } = b as Record<string, unknown>;
      void _end;
      return rest;
    });
    const timed = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const untimed = deckFor(TRIAL_ID, withoutEnd, trialPrompts());
    expect(timed.stats).toMatchObject({ videos: 1, untimedVideos: 0 });
    expect(untimed.stats).toMatchObject({ videos: 1, untimedVideos: 1 });
    expect(timed.stats.minutes).toBe(Math.max(1, Math.round((untimed.cards.reduce((n, c) => n + cardSeconds(c), 0) + 341) / 60)));
    expect(promiseLine(timed.stats)).toBe("38 cards · 8 checks · 1 video");
    expect(deckMinutesPhrase(timed.stats)).toBe(`About ${timed.stats.minutes} minutes`);
    expect(deckMinutesPhrase(untimed.stats)).toMatch(/plus a video$/);
    expect(deckMinutesPhrase({ ...untimed.stats, untimedVideos: 2, videos: 2 })).toMatch(/plus two videos$/);
  });

  it("keeps the note's two light prompts as recall cards, numbered among themselves", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const recalls = deck.cards.filter((c): c is Extract<Card, { kind: "recall" }> => c.kind === "recall");
    expect(recalls.map((c) => [c.index, c.total, c.prompt.id])).toEqual([
      [1, 2, "rp.fm.u1.algebraic-fractions-simplify.02"],
      [2, 2, "rp.fm.u1.algebraic-fractions-simplify.08"],
    ]);
    // Without the bundle's prompts the recall cards are absent, never invented.
    expect(buildDeck(trialBlocks(), []).stats.recall).toBe(0);
  });

  it("brings a missed gate back once, before the recap, without a second record", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const again = withRetries(deck.cards, ["g2", "g10"]);
    expect(again).toHaveLength(40);
    const recapAt = again.findIndex((c) => c.kind === "recap");
    expect(again[recapAt - 2]).toMatchObject({ kind: "gate", key: "retry:g2", retry: true });
    expect(again[recapAt - 1]).toMatchObject({ kind: "gate", key: "retry:g10", retry: true });
    // The base gates are untouched and the retries are not counted as checks.
    expect(deckGateIds(again)).toEqual(["g2", "g12", "g9", "g13", "g4", "g10", "g11", "g8"]);
    // Calling again with the same misses replaces the retries rather than stacking them.
    expect(withRetries(again, ["g2"])).toHaveLength(39);
    expect(withRetries(again, [])).toHaveLength(38);
  });

  it("names every card with a stable key", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const keys = deck.cards.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain("gate:g2");
    expect(keys).toContain("media:video:tlKN8NNNxdI");
    expect(keys).toContain("callout:examiner:summer-2024-fm1-q8-a");
    expect(keys).toContain("callout:why:why-a-lone-number-or-x-still-counts");
    expect(keys).toContain("recall:rp.fm.u1.algebraic-fractions-simplify.02");
    expect(keys).not.toContain("recall:rp.fm.u1.algebraic-fractions-simplify.01");
    // The registered illustrations point at cards that exist.
    for (const key of Object.keys(enrichmentFor(TRIAL_ID)?.illustrations ?? {})) expect(keys).toContain(key);
  });
});

describe("packing a paragraph into cards", () => {
  it("keeps a paragraph under the budget whole, line breaks and all", () => {
    expect(packParagraph("One line.\nTwo line.")).toEqual(["One line.\nTwo line."]);
  });

  it("puts an authored line over the budget on its own card and splits it at sentences", () => {
    const long = Array.from({ length: 6 }, (_, i) => `Sentence number ${i + 1} has exactly ten words in it, honestly.`).join(" ");
    // 60 words on one line, then a second line of 30 words: the two lines exceed 75 together.
    const second = Array.from({ length: 3 }, () => "Ten more words on the second authored line of prose here.").join(" ");
    const cards = packParagraph(`${long}\n${second}`);
    expect(cards).toHaveLength(2);
    expect(cards[0]).toBe(long);
    expect(cards[1]).toBe(second);
    // A single line of 90 words is split at a sentence boundary into two cards under the budget.
    const ninety = Array.from({ length: 9 }, (_, i) => `Sentence number ${i + 1} has exactly ten words in it, honestly.`).join(" ");
    const split = packParagraph(ninety);
    expect(split).toHaveLength(2);
    expect(split.map((s) => s.split(/\s+/).length)).toEqual([70, 20]);
  });

  it("never cuts inside maths or mid-sentence", () => {
    expect(splitSentences("At $x = 1.5$ the value is 2. Then it grows.")).toEqual(["At $x = 1.5$ the value is 2.", "Then it grows."]);
    expect(splitSentences("Is it right? Yes.")).toEqual(["Is it right?", "Yes."]);
    expect(splitSentences("No break here")).toEqual(["No break here"]);
  });

  it("slugs a heading for a key", () => {
    expect(slug("Why cancelling works, and when it does not")).toBe("why-cancelling-works-and-when-it-does-not");
    expect(slug("Summer 2024, FM1 Q8(a)")).toBe("summer-2024-fm1-q8-a");
    expect(slug("The $x^2$ term")).toBe("the-term");
  });
});

describe("every published note splits into cards", () => {
  const notes = (() => {
    const out: Array<{ file: string; blocks: unknown[] }> = [];
    const packs = path.join(ROOT, "packs");
    for (const subject of fs.readdirSync(packs)) {
      const content = path.join(packs, subject, "content");
      if (!fs.existsSync(content)) continue;
      for (const unit of fs.readdirSync(content)) {
        const unitDir = path.join(content, unit);
        if (!fs.statSync(unitDir).isDirectory()) continue;
        for (const topic of fs.readdirSync(unitDir)) {
          const file = path.join(unitDir, topic, "note.blocks.json");
          if (fs.existsSync(file)) out.push({ file: `${subject}/${unit}/${topic}`, blocks: readJson(file) as unknown[] });
        }
      }
    }
    return out;
  })();

  it("builds a deck for each without throwing, with a title first and a close last", () => {
    expect(notes.length).toBeGreaterThan(100);
    for (const n of notes) {
      const deck = buildDeck(n.blocks);
      expect(deck.cards[0].kind, n.file).toBe("title");
      expect(deck.cards[deck.cards.length - 1].kind, n.file).toBe("close");
    }
  });

  it("keeps every idea card at the budget unless a single authored sentence exceeds it (the distribution is reported)", () => {
    const over: string[] = [];
    const sizes: number[] = [];
    const counts: number[] = [];
    for (const n of notes) {
      const deck = buildDeck(n.blocks);
      counts.push(deck.stats.cards);
      for (const c of deck.cards) {
        if (c.kind !== "idea") continue;
        sizes.push(c.words);
        if (c.words > CARD_WORDS && splitSentences(c.md).length > 1) over.push(`${n.file} (${c.words} words): ${c.md.slice(0, 60)}`);
      }
    }
    sizes.sort((a, b) => a - b);
    const q = (p: number) => sizes[Math.min(sizes.length - 1, Math.floor(sizes.length * p))];
    const longSentences = sizes.filter((w) => w > CARD_WORDS).length;
    counts.sort((a, b) => a - b);
    console.log(
      `[slides] ${notes.length} notes, ${sizes.length} idea cards: words median ${q(0.5)}, p90 ${q(0.9)}, max ${sizes[sizes.length - 1]}; ` +
        `${longSentences} cards over ${CARD_WORDS} words because one sentence is; decks from ${counts[0]} to ${counts[counts.length - 1]} cards, median ${counts[Math.floor(counts.length / 2)]}`,
    );
    expect(over, over.join("\n")).toEqual([]);
  });
});
