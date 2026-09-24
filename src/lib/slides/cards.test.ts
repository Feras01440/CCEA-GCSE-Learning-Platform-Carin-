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
  it("is 22 cards from the note alone: title, 15 teaching cards, recap, pointer, 2 light recall cards, close", () => {
    const deck = buildDeck(trialBlocks(), trialPrompts());
    expect(deck.stats).toMatchObject({ cards: 22, gates: 7, recall: 2, videos: 1, untimedVideos: 1 });
    expect(kinds(deck.cards)).toEqual([
      "title",
      "idea", // 1 Simplifying algebraic fractions: factorise first
      "gate", // g1
      "idea", // 2 Why cancelling works: cancelling is division
      "idea", // 2 continued: a factor, a term
      "gate", // g2
      "idea", // 3 The three moves: move 1
      "gate", // g7
      "idea", // 3 continued: moves 2 and 3
      "gate", // g3
      "media", // See it done: the video
      "gate", // g4, after the video
      "idea", // 4 Fully means fully
      "callout", // Summer 2024, FM1 Q8(a)
      "gate", // g5
      "callout", // Why the last look at the numbers matters
      "gate", // g6
      "recap",
      "pointer",
      "recall", // 04: the last thing to check (01, the three moves, is a list; 03, factor and term, an explanation)
      "recall", // 06: what to do first with a cubic
      "close",
    ]);
  });

  it("is 23 cards with its registered enrichment: the figure she acts on after the three moves", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    expect(deck.stats).toMatchObject({ cards: 23, gates: 7, recall: 2, videos: 1, untimedVideos: 1 });
    const at = deck.cards.findIndex((c) => c.kind === "interaction");
    expect(at).toBeGreaterThan(0);
    expect(deck.cards[at - 1]).toMatchObject({ kind: "idea", key: "idea:the-three-moves:2" });
    expect(deck.cards[at]).toMatchObject({ kind: "interaction", id: "afs.tap-to-cancel" });
    expect(deck.cards[at + 1]).toMatchObject({ kind: "gate", key: "gate:g3" });
    expect(slidesCardCount(TRIAL_ID, trialBlocks(), trialPrompts())).toBe(23);
    // The card the interaction follows states moves 2 and 3, so the tap card comes exactly where the note says "cancel".
    const host = deck.cards[at - 1] as Extract<Card, { kind: "idea" }>;
    expect(host.md.startsWith("**2 Factorise the denominator fully**")).toBe(true);
    expect(host.md).toContain("Cancel every factor that appears on both lines");
  });

  it("keeps the note's gate ids in the note's order, so an answer here is the Read record", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    expect(deckGateIds(deck.cards)).toEqual(["g1", "g2", "g7", "g3", "g4", "g5", "g6"]);
    const g4 = deck.cards.find((c) => c.kind === "gate" && c.gate.id === "g4") as Extract<Card, { kind: "gate" }>;
    expect(g4.afterMedia).toBe("video");
    const g1 = deck.cards.find((c) => c.kind === "gate" && c.gate.id === "g1") as Extract<Card, { kind: "gate" }>;
    expect(g1.afterMedia).toBeNull();
  });

  it("titles the sections, numbers them 1 to 5 (See it done is the video's section), and keeps the recap and pointer outside the count", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const ideas = deck.cards.filter((c): c is Extract<Card, { kind: "idea" }> => c.kind === "idea");
    expect(ideas.map((c) => [c.section.n, c.first])).toEqual([
      [1, true],
      [2, true],
      [2, false],
      [3, true],
      [3, false],
      [5, true],
    ]);
    expect(ideas[0].section).toMatchObject({ total: 5, heading: "Simplifying algebraic fractions", title: "Simplifying algebraic fractions", role: null });
    expect(ideas[1].section.heading).toBe("Why cancelling works, and when it does not");
    const video = deck.cards.find((c) => c.kind === "media") as Extract<Card, { kind: "media" }>;
    expect(video.section).toMatchObject({ n: 4, heading: "See it done" });
    // The card after a gate in the same section is not the section's first card, and its key counts idea cards only.
    expect(ideas[4]).toMatchObject({ key: "idea:the-three-moves:2", first: false });
    const recap = deck.cards.find((c) => c.kind === "recap") as Extract<Card, { kind: "recap" }>;
    expect(recap.heading).toBe("You can now");
    expect(recap.lines).toEqual([
      "Factorise both lines fully, common factor first.",
      "Cancel matching brackets, never matching terms.",
      "Check the numbers before you call it finished.",
    ]);
    const pointer = deck.cards.find((c) => c.kind === "pointer") as Extract<Card, { kind: "pointer" }>;
    expect(pointer.heading).toBe("In the exam");
    expect(pointer.md).toMatch(/^The wording is \*\*Simplify fully\*\*/);
  });

  it("carries the hoisted figure on the title card and the hero's promise", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const title = deck.cards[0] as Extract<Card, { kind: "title" }>;
    expect(title.figure?.kind).toBe("svg");
    expect(title.can).toHaveLength(3);
    expect(title.lede).toMatch(/^\$\\dfrac\{12\}\{18\}\$ cancels/);
    // The video has no stated length, so it is named beside the minutes, never guessed into them (audit LD-03).
    expect(promiseLine(deck.stats)).toBe("23 cards · 7 checks");
    expect(deckPromise(deck.stats)).toMatch(/^About \d+ minutes plus a video · 23 cards · 7 checks$/);
    // Honest minutes: 20 s a reading card, 40 s a check, 30 s a recall card, a minute on the figure, nothing for the video.
    expect(deck.stats.minutes).toBeGreaterThanOrEqual(9);
    expect(deck.stats.minutes).toBeLessThanOrEqual(12);
    // Every card in the deck is counted, and only those.
    expect(deck.stats.minutes).toBe(Math.max(1, Math.round(deck.cards.reduce((n, c) => n + cardSeconds(c), 0) / 60)));
  });

  it("times a video only when its block says how long it runs", () => {
    const withEnd = trialBlocks().map((b) => ((b as { type?: string }).type === "video" ? { ...(b as object), end: 341 } : b));
    const timed = deckFor(TRIAL_ID, withEnd, trialPrompts());
    const untimed = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    expect(timed.stats).toMatchObject({ videos: 1, untimedVideos: 0 });
    expect(timed.stats.minutes).toBe(Math.max(1, Math.round((untimed.cards.reduce((n, c) => n + cardSeconds(c), 0) + 341) / 60)));
    expect(promiseLine(timed.stats)).toBe("23 cards · 7 checks · 1 video");
    expect(deckMinutesPhrase(timed.stats)).toBe(`About ${timed.stats.minutes} minutes`);
    expect(deckMinutesPhrase({ ...untimed.stats, untimedVideos: 2, videos: 2 })).toMatch(/plus two videos$/);
  });

  it("keeps two of the note's four prompts as recall cards, the light ones, numbered among themselves", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const recalls = deck.cards.filter((c): c is Extract<Card, { kind: "recall" }> => c.kind === "recall");
    expect(recalls.map((c) => [c.index, c.total, c.prompt.id])).toEqual([
      [1, 2, "rp.fm.u1.algebraic-fractions-simplify.04"],
      [2, 2, "rp.fm.u1.algebraic-fractions-simplify.06"],
    ]);
    // Without the bundle's prompts the recall cards are absent, never invented.
    expect(buildDeck(trialBlocks(), []).stats.recall).toBe(0);
  });

  it("brings a missed gate back once, before the recap, without a second record", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const again = withRetries(deck.cards, ["g2", "g5"]);
    expect(again).toHaveLength(25);
    const recapAt = again.findIndex((c) => c.kind === "recap");
    expect(again[recapAt - 2]).toMatchObject({ kind: "gate", key: "retry:g2", retry: true });
    expect(again[recapAt - 1]).toMatchObject({ kind: "gate", key: "retry:g5", retry: true });
    // The base gates are untouched and the retries are not counted as checks.
    expect(deckGateIds(again)).toEqual(["g1", "g2", "g7", "g3", "g4", "g5", "g6"]);
    // Calling again with the same misses replaces the retries rather than stacking them.
    expect(withRetries(again, ["g2"])).toHaveLength(24);
    expect(withRetries(again, [])).toHaveLength(23);
  });

  it("names every card with a stable key", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const keys = deck.cards.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain("gate:g2");
    expect(keys).toContain("media:video:tlKN8NNNxdI");
    expect(keys).toContain("callout:examiner:summer-2024-fm1-q8-a");
    expect(keys).toContain("callout:why:why-the-last-look-at-the-numbers-matters");
    expect(keys).toContain("recall:rp.fm.u1.algebraic-fractions-simplify.04");
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
