import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SEE_KINDS, type RetrievalPrompt, type WorkedExample } from "@/lib/content/schema";
import { countWords, heroDataFor, lessonBlocks } from "@/components/topic/lesson-plan";
import { positionalWording } from "@/lib/gate-order";
import {
  CARD_WORDS,
  SEE_STEP_SECONDS,
  buildDeck,
  cardSeconds,
  deckGateIds,
  deckMinutesPhrase,
  deckPromise,
  deckRuleViolations,
  deckStats,
  seeAnswerPrinted,
  nextLabel,
  packParagraph,
  promiseLine,
  slug,
  splitSentences,
  videoSeconds,
  withRetries,
  type Card,
  type GateCard,
  type SeeCard,
} from "./cards";
import { deckFor, slidesCardCount } from "./deck";
import { enrichmentFor } from "./enrichment";
import { packTopics } from "./packs-corpus.test-helper";
import { stepPointer } from "./see";
import { hasSeeBlock, lessonReadiness, noteStructure } from "./readiness";
import { SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS, SEE_FIXTURE_WE_ID, SEE_FIXTURE_WORKED_EXAMPLE } from "./see-fixture";

const ROOT = path.resolve(__dirname, "../../..");
const TRIAL = path.join(ROOT, "packs", "further-maths", "content", "fm1", "algebraic-fractions-simplify");
const TRIAL_ID = "fm.u1.algebraic-fractions-simplify";

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));
const trialBlocks = (): unknown[] => readJson(path.join(TRIAL, "note.blocks.json")) as unknown[];
const trialPrompts = (): RetrievalPrompt[] => (readJson(path.join(TRIAL, "bundle.json")) as { prompts: RetrievalPrompt[] }).prompts;
const trialWorkedExamples = (): WorkedExample[] => (readJson(path.join(TRIAL, "bundle.json")) as { workedExamples: WorkedExample[] }).workedExamples;

const kinds = (cards: readonly Card[]) => cards.map((c) => c.kind);
type IdeaCard = Extract<Card, { kind: "idea" }>;

/** The note's own gate ids, in its order: what Read records and what the deck must deal. */
const noteGateIds = (blocks: readonly unknown[]) => blocks.filter((b) => (b as { type?: string }).type === "gate").map((b) => (b as { id: string }).id);

/** A card that works something in front of her: a line of maths with an equals sign in it, a See it, a video, or the figure she acts on. */
function showsWork(c: Card): boolean {
  const worked = (md: string) => /\$[^$]*=[^$]*\$/.test(md);
  if (c.kind === "idea") return worked(c.md);
  if (c.kind === "callout") return worked(c.block.md);
  return c.kind === "see" || c.kind === "interaction" || (c.kind === "media" && (c.block.type === "video" || c.block.type === "sim"));
}

/** The cards before the card at `at` in its own section, nearest last. */
function sectionBefore(cards: readonly Card[], at: number): Card[] {
  const own = cards[at];
  const n = "section" in own && own.section ? own.section.n : null;
  const out: Card[] = [];
  for (let i = at - 1; i >= 0; i -= 1) {
    const c = cards[i];
    if (!("section" in c) || !c.section || c.section.n !== n) break;
    out.unshift(c);
  }
  return out;
}

/** The fixture deck, with its worked example and prompts. */
const fixtureDeck = () => buildDeck(SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS as RetrievalPrompt[], null, { workedExamples: [SEE_FIXTURE_WORKED_EXAMPLE as unknown as WorkedExample] });

/**
 * The trial topic as it stands (25 Sep 2026): a note written before the See it block, teaching, showing and checking in
 * prose, so it keeps the rendering it had. The STRUCTURE is pinned here (ids, order, counts), because the note's words
 * and numbers may still be polished; a hash never is. Its "The three moves" heading has role `see`, so it continues
 * "A common factor first" (the readiness parser's reading and the build's): six teaching sections.
 */
describe("the trial topic's deck as it stands (fm1/algebraic-fractions-simplify, no See it blocks yet)", () => {
  it("is 35 cards from the note alone, in the order the note teaches", () => {
    const deck = buildDeck(trialBlocks(), trialPrompts());
    expect(deck.stats).toMatchObject({ cards: 35, gates: 8, sees: 0, recall: 2, videos: 1, untimedVideos: 0 });
    expect(kinds(deck.cards)).toEqual([
      "title",
      "idea", // 1 Why cancelling works: the drawing's idea (the registered drawing stands on it)
      "idea", // 1 cancelling is division: a factor, a term
      "idea", // 1 worked: x(x + 8) over 5x, and x + 8 over 5x at x = 2
      "gate", // g2
      "idea", // 2 A square minus a square, with the note's L-shape figure on it
      "idea", // 2 worked: x² − 49
      "gate", // g12
      "idea", // 3 Two squares with a number in front
      "idea", // 3 worked: 16x² − 81, 25x² − 1
      "gate", // g9
      "idea", // 4 A common factor first, with the note's rectangle figure on it
      "idea", // 4 worked: 2x² − 392
      "callout", // Beyond this specification: the cubic's first line
      "gate", // g13
      "idea", // 4, "The three moves" (a See it done heading, continuing section 4)
      "idea", // 4 worked: 2x² − 128 over x² + 17x + 72
      "media", // the video, timed
      "gate", // g4, after the video
      "idea", // 5 Fully means fully
      "idea", // 5 worked: 8 over 4(x − 7)
      "callout", // Summer 2024, FM1 Q8(a)
      "gate", // g10
      "callout", // Why a lone number or x still counts
      "idea", // 5 worked: 5x² over x, 12x over 3x
      "gate", // g11
      "idea", // 6 How the paper asks it: a division
      "idea", // 6 'simplest form'
      "idea", // 6 'hence', worked: 3x² + 24x
      "gate", // g8
      "recap",
      "pointer",
      "recall", // rp.02
      "recall", // rp.08
      "close",
    ]);
  });

  it("is 36 cards with its registered enrichment: the figure she acts on after the three moves' worked lines, then the video, then g4", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    expect(deck.stats).toMatchObject({ cards: 36, gates: 8, sees: 0, recall: 2, videos: 1, untimedVideos: 0 });
    expect(slidesCardCount(TRIAL_ID, trialBlocks(), trialPrompts())).toBe(36);
    // The worked examples change nothing in a note that names none.
    expect(deckFor(TRIAL_ID, trialBlocks(), trialPrompts(), trialWorkedExamples()).cards.map((c) => c.key)).toEqual(deck.cards.map((c) => c.key));
    const at = deck.cards.findIndex((c) => c.kind === "interaction");
    expect(deck.cards[at]).toMatchObject({ kind: "interaction", id: "afs.tap-to-cancel", key: "interaction:afs.tap-to-cancel" });
    // It follows the card that works the three moves in front of her, so the tap is hers to do once she has seen it done.
    const host = deck.cards[at - 1] as IdeaCard;
    expect(host).toMatchObject({ kind: "idea", key: "idea:the-three-moves:2" });
    expect(showsWork(host)).toBe(true);
    expect(host.section).toMatchObject({ n: 4, heading: "The three moves", role: "see" });
    expect(deck.cards[at + 1]).toMatchObject({ kind: "media", block: { type: "video" } });
    expect(deck.cards[at + 2]).toMatchObject({ kind: "gate", key: "gate:g4", afterMedia: "video" });
  });

  it("keeps the note's gate ids in the note's order, so an answer here is the Read record", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    expect(deckGateIds(deck.cards)).toEqual(noteGateIds(trialBlocks()));
    // The trial's eight checks since the withdraw-and-replace of 25 Sep (g1, g3, g5, g6 and g7 withdrawn, never reused).
    expect(deckGateIds(deck.cards)).toEqual(["g2", "g12", "g9", "g13", "g4", "g10", "g11", "g8"]);
    const gates = deck.cards.filter((c): c is GateCard => c.kind === "gate");
    expect(gates.filter((g) => g.afterMedia !== null).map((g) => g.gate.id)).toEqual(["g4"]);
    // No two in a row, no See it to point back at, no twin: the rendering it had.
    expect(gates.map((g) => [g.turn, g.seeKey, g.twin])).toEqual(gates.map(() => [null, null, false]));
  });

  it("asks every check only after its section has explained the idea and worked it in front of her (the owner's rule, 24 Sep)", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    deck.cards.forEach((c, i) => {
      if (c.kind !== "gate") return;
      const before = sectionBefore(deck.cards, i);
      expect(before.some((b) => b.kind === "idea"), `${c.gate.id}: explained first`).toBe(true);
      expect(before.some(showsWork), `${c.gate.id}: shown worked first`).toBe(true);
      expect(before.length, `${c.gate.id}: not a section's opening card`).toBeGreaterThan(0);
    });
    expect(deckRuleViolations(deck.cards)).toEqual([]);
  });

  it("puts each note figure on the idea card that reads it, with its own caption, and leaves no picture-only card (art direction v2 §8.1, the Idea row)", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const withFigure = deck.cards.filter((c): c is IdeaCard => c.kind === "idea" && c.figure !== null);
    expect(withFigure.map((c) => [c.key, c.first])).toEqual([
      ["idea:a-square-minus-a-square:1", true],
      ["idea:a-common-factor-first:1", true],
    ]);
    const figures = trialBlocks().filter((b) => (b as { type?: string }).type === "figure") as Array<{ caption?: string; alt: string }>;
    // The first figure is the hero's (the title card's); the other two stand on the cards that say "In the drawing".
    expect(withFigure.map((c) => c.figure?.caption)).toEqual(figures.slice(1).map((f) => f.caption));
    expect(withFigure.every((c) => /\bdrawing\b/.test(c.md))).toBe(true);
    expect(deck.cards.filter((c) => c.kind === "media" && c.block.type === "figure")).toEqual([]);
  });

  it("titles its six sections, a See it done heading titling its own cards inside the section it continues, and keeps the recap and pointer outside the count", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const firsts = deck.cards.filter((c): c is IdeaCard => c.kind === "idea" && c.first);
    expect(firsts.map((c) => [c.section.n, c.section.total, c.section.heading, c.section.role])).toEqual([
      [1, 6, "Why cancelling works, and when it does not", "idea"],
      [2, 6, "A square minus a square", "variant"],
      [3, 6, "Two squares with a number in front", "variant"],
      [4, 6, "A common factor first", "variant"],
      [4, 6, "The three moves", "see"],
      [5, 6, "Fully means fully", "variant"],
      [6, 6, "How the paper asks it", "twists"],
    ]);
    // A card after a gate or a callout in the same section is not the section's first card, and its key counts idea cards only.
    expect(deck.cards.find((c) => c.key === "idea:fully-means-fully:3")).toMatchObject({ kind: "idea", first: false });
    const recap = deck.cards.find((c) => c.kind === "recap") as Extract<Card, { kind: "recap" }>;
    expect(recap.heading).toBe("You can now");
    // One glyph a line (the enrichment's recapGlyphs): the count is the note's, the glyphs must keep up with it.
    expect(recap.lines).toHaveLength(4);
    expect(recap.lines).toHaveLength(enrichmentFor(TRIAL_ID)?.recapGlyphs?.length ?? -1);
    const pointer = deck.cards.find((c) => c.kind === "pointer") as Extract<Card, { kind: "pointer" }>;
    expect(pointer.heading).toBe("In the exam");
    expect(pointer.md).toMatch(/\*\*simplify fully\*\*/);
  });

  it("carries the hoisted figure on the title card, a lede of two sentences at most, and the honest promise with the video's own length", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const title = deck.cards[0] as Extract<Card, { kind: "title" }>;
    expect(title.figure?.kind).toBe("svg");
    expect(title.can).toHaveLength(3);
    expect(splitSentences(title.lede).length).toBeLessThanOrEqual(2);
    // The video states its length (341 s), so it is counted in the minutes and listed with the counts (audit LD-03).
    const video = deck.cards.find((c): c is Extract<Card, { kind: "media" }> => c.kind === "media" && c.block.type === "video")!;
    expect(videoSeconds(video.block)).toBe(341);
    // The check is named "Your turn" (the owner's answer 6), and the title card counts them so.
    expect(promiseLine(deck.stats)).toBe("36 cards · 8 your turns · 1 video");
    expect(deckPromise(deck.stats)).toBe(`About ${deck.stats.minutes} minutes · 36 cards · 8 your turns · 1 video`);
    const seconds = deck.cards.reduce((n, c) => n + cardSeconds(c), 0);
    expect(deck.stats.minutes).toBe(Math.max(1, Math.round(seconds / 60)));
    expect(seconds).toBeGreaterThan(341);
    expect(deck.stats.minutes).toBeGreaterThanOrEqual(19);
    expect(deck.stats.minutes).toBeLessThanOrEqual(23);
  });

  it("times a video only when its block says how long it runs", () => {
    const withoutEnd = trialBlocks().map((b) => {
      if ((b as { type?: string }).type !== "video") return b;
      const { end: _end, ...rest } = b as { end?: number };
      return rest;
    });
    const timed = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const untimed = deckFor(TRIAL_ID, withoutEnd, trialPrompts());
    expect(untimed.stats).toMatchObject({ videos: 1, untimedVideos: 1 });
    expect(timed.stats.minutes).toBe(Math.max(1, Math.round((untimed.cards.reduce((n, c) => n + cardSeconds(c), 0) + 341) / 60)));
    expect(promiseLine(untimed.stats)).toBe("36 cards · 8 your turns");
    expect(deckMinutesPhrase(untimed.stats)).toBe(`About ${untimed.stats.minutes} minutes plus a video`);
    expect(deckMinutesPhrase(timed.stats)).toBe(`About ${timed.stats.minutes} minutes`);
    expect(deckMinutesPhrase({ ...untimed.stats, untimedVideos: 2, videos: 2 })).toMatch(/plus two videos$/);
  });

  it("keeps at most two recall cards, each one of the note's own placed prompts and light, numbered among themselves", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const recalls = deck.cards.filter((c): c is Extract<Card, { kind: "recall" }> => c.kind === "recall");
    const placed = trialBlocks().filter((b) => (b as { type?: string }).type === "prompt").map((b) => (b as { promptId: string }).promptId);
    expect(recalls.length).toBeLessThanOrEqual(2);
    expect(recalls.map((c) => c.prompt.id).every((id) => placed.includes(id))).toBe(true);
    expect(recalls.map((c) => [c.index, c.total])).toEqual(recalls.map((_, i) => [i + 1, recalls.length]));
    expect(recalls.map((c) => c.prompt.id)).toEqual(["rp.fm.u1.algebraic-fractions-simplify.02", "rp.fm.u1.algebraic-fractions-simplify.08"]);
    expect(deck.cards.slice(-3).map((c) => c.kind)).toEqual(["recall", "recall", "close"]);
    expect(buildDeck(trialBlocks(), []).stats.recall).toBe(0);
  });

  it("brings a missed gate back once, before the recap, without a second record; with no twin it is the gate again", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const [first, , , , , sixth] = deckGateIds(deck.cards);
    const again = withRetries(deck.cards, [first, sixth]);
    expect(again).toHaveLength(deck.cards.length + 2);
    const recapAt = again.findIndex((c) => c.kind === "recap");
    expect(again[recapAt - 2]).toMatchObject({ kind: "gate", key: `retry:${first}`, retry: true, twin: false, gate: { id: first } });
    expect(again[recapAt - 1]).toMatchObject({ kind: "gate", key: `retry:${sixth}`, retry: true, twin: false });
    expect(deckGateIds(again)).toEqual(deckGateIds(deck.cards));
    expect(deckStats(again).gates).toBe(deck.stats.gates);
    expect(withRetries(again, [first])).toHaveLength(deck.cards.length + 1);
    expect(withRetries(again, [])).toHaveLength(deck.cards.length);
  });

  it("never puts a retry behind her: a gate after the recap comes back before the close (audit CQ-08)", () => {
    const blocks = [
      { type: "h", text: "One idea" },
      { type: "p", md: "Words about it." },
      { type: "gate", id: "g1", kind: "choice", prompt: "Which?", options: ["a", "b", "c"], answer: "a", explain: "Because." },
      { type: "h", text: "You can now" },
      { type: "p", md: "Do the thing." },
      { type: "gate", id: "g9", kind: "choice", prompt: "Last check?", options: ["x", "y", "z"], answer: "x", explain: "Because." },
      { type: "h", text: "In the exam" },
      { type: "p", md: "Two marks." },
    ];
    const base = buildDeck(blocks).cards;
    expect(kinds(base)).toEqual(["title", "idea", "gate", "recap", "gate", "pointer", "close"]);
    const g9At = base.findIndex((c) => c.kind === "gate" && c.gate.id === "g9");
    const again = withRetries(base, ["g1", "g9"]);
    expect(again.map((c) => c.key)).toEqual([...base.slice(0, 3).map((c) => c.key), "retry:g1", ...base.slice(3, g9At + 1).map((c) => c.key), "retry:g9", ...base.slice(g9At + 1).map((c) => c.key)]);
    expect(withRetries(base, ["g9"])[g9At]).toMatchObject({ kind: "gate", key: "gate:g9" });
  });

  it("names every card with a stable key, and every key the enrichment names is a card of the deck", () => {
    const deck = deckFor(TRIAL_ID, trialBlocks(), trialPrompts());
    const keys = deck.cards.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const id of noteGateIds(trialBlocks())) expect(keys).toContain(`gate:${id}`);
    expect(keys).toContain("media:video:tlKN8NNNxdI");
    expect(keys).toContain("callout:notonspec:beyond-this-specification");
    expect(keys).toContain("callout:examiner:summer-2024-fm1-q8-a");
    expect(keys).toContain("callout:why:why-a-lone-number-or-x-still-counts");
    expect(keys).toContain("recall:rp.fm.u1.algebraic-fractions-simplify.02");
    expect(keys).toContain("recall:rp.fm.u1.algebraic-fractions-simplify.08");
    const enrichment = enrichmentFor(TRIAL_ID)!;
    for (const key of Object.keys(enrichment.illustrations ?? {})) expect(keys).toContain(key);
    // An interaction names the See it card a converted note will have, then the card it has today: one of them is here.
    for (const { after } of enrichment.interactions ?? []) expect((typeof after === "string" ? [after] : after).some((k) => keys.includes(k)), JSON.stringify(after)).toBe(true);
    for (const gateId of Object.keys(enrichment.reactions ?? {})) expect(keys).toContain(`gate:${gateId}`);
  });
});

/**
 * A note in lesson structure v3 (src/lib/slides/see-fixture.ts): each section explains, shows its See it, then asks its
 * Your turn; a video stands beside a See it; two gates carry a twin; one See it has a step she types; the last section
 * asks two Your turns of one See it that worked two variants.
 */
describe("a teach-first note's deck: explain → See it → Your turn", () => {
  it("passes the build's structure (the readiness parser) and deals its cards in the note's order", () => {
    expect(noteStructure(SEE_FIXTURE_BLOCKS)).toEqual({ ok: true, problems: [] });
    const deck = fixtureDeck();
    expect(kinds(deck.cards)).toEqual([
      "title",
      "idea", // 1 Only a factor divides out
      "see", // 1 See it: 3x(x + 7) over 6(x + 7)(x − 7), three steps
      "gate", // g1 (twin)
      "idea", // 2 Factorise first
      "see", // 2 See it: the bundle's worked example
      "media", // the video, beside the See it
      "gate", // g2
      "idea", // 3 Simplify before you substitute
      "see", // 3 See it with a step she types
      "gate", // g3 (number, twin)
      "idea", // 4 Two squares
      "see", // 4 See it: both variants
      "gate", // g4, Your turn 1 of 2
      "gate", // g5, Your turn 2 of 2
      "recap",
      "pointer",
      "recall",
      "recall",
      "close",
    ]);
    expect(deck.stats).toMatchObject({ cards: 20, gates: 5, sees: 4, recall: 2, videos: 1, untimedVideos: 0 });
    expect(deckGateIds(deck.cards)).toEqual(["g1", "g2", "g3", "g4", "g5"]);
    expect(deckRuleViolations(deck.cards)).toEqual([]);
  });

  it("shows each See it's steps with their reasons and marks; the first is never typed, a later one types its one input step", () => {
    const sees = fixtureDeck().cards.filter((c): c is SeeCard => c.kind === "see");
    expect(sees.map((s) => [s.key, s.firstSee, s.typed, s.see?.steps.length])).toEqual([
      ["see:only-a-factor-divides-out:1", true, null, 3],
      ["see:factorise-first:1", false, null, 3],
      ["see:simplify-before-you-substitute:1", false, 2, 3],
      ["see:two-squares-with-and-without-a-number-in-front:1", false, null, 2],
    ]);
    const [first, drawn, typed] = sees;
    expect(first.see).toMatchObject({ stem: "Simplify $\\dfrac{3x(x+7)}{6(x+7)(x-7)}$.", workedExample: null });
    // The answer line is not printed twice: the last step already ends in it.
    expect(first.see?.finalAnswer).toBeNull();
    expect(first.see?.steps[2]).toMatchObject({ n: 3, earns: ["W1"] });
    // Drawn from the bundle: the worked example's stem and steps, without its why-menu and without its input.
    expect(drawn.see).toMatchObject({ workedExample: SEE_FIXTURE_WE_ID, stem: SEE_FIXTURE_WORKED_EXAMPLE.stem });
    expect(drawn.see?.steps.map((s) => [s.n, "whyMenu" in s, "input" in s])).toEqual([
      [1, false, false],
      [2, false, false],
      [3, false, false],
    ]);
    expect(typed.see?.steps[2]?.input).toMatchObject({ kind: "numeric", value: 10 });
  });

  it("points each Your turn at the See it it follows, numbers two in a row, and calls the See it's last control by where it goes", () => {
    const deck = fixtureDeck();
    const gates = deck.cards.filter((c): c is GateCard => c.kind === "gate");
    expect(gates.map((g) => [g.gate.id, g.seeKey, g.turn])).toEqual([
      ["g1", "see:only-a-factor-divides-out:1", null],
      ["g2", "see:factorise-first:1", null],
      ["g3", "see:simplify-before-you-substitute:1", null],
      ["g4", "see:two-squares-with-and-without-a-number-in-front:1", { n: 1, of: 2 }],
      ["g5", "see:two-squares-with-and-without-a-number-in-front:1", { n: 2, of: 2 }],
    ]);
    const at = (key: string) => deck.cards.findIndex((c) => c.key === key);
    expect(nextLabel(deck.cards, at("see:only-a-factor-divides-out:1"))).toBe("Your turn");
    // The video stands beside this See it: its last step goes on to the video, and the video's card to the Your turn.
    expect(nextLabel(deck.cards, at("see:factorise-first:1"))).toBe("Continue");
    expect(nextLabel(deck.cards, at("media:video:tlKN8NNNxdI"))).toBe("Your turn");
  });

  it("asks a missed gate's twin before the recap, once, and the gate itself again where it has none", () => {
    const deck = fixtureDeck();
    const again = withRetries(deck.cards, ["g1", "g2", "g3"]);
    const recapAt = again.findIndex((c) => c.kind === "recap");
    expect(again.slice(recapAt - 3, recapAt).map((c) => [c.key, (c as GateCard).twin])).toEqual([
      ["retry:g1", true],
      ["retry:g2", false],
      ["retry:g3", true],
    ]);
    expect(deckStats(again).gates).toBe(5);
  });

  it("counts a See it at 15 seconds a step, the named worked example's steps included, and says so on the title card", () => {
    const deck = fixtureDeck();
    const sees = deck.cards.filter((c): c is SeeCard => c.kind === "see");
    expect(sees.map(cardSeconds)).toEqual([3, 3, 3, 2].map((steps) => steps * SEE_STEP_SECONDS));
    expect(promiseLine(deck.stats)).toBe("20 cards · 5 your turns · 4 see its · 1 video");
    // Every card's cost, and only those, makes the minutes.
    expect(deck.stats.minutes).toBe(Math.max(1, Math.round(deck.cards.reduce((n, c) => n + cardSeconds(c), 0) / 60)));
  });

  it("counts the same cards without the bundle's worked examples, and never shows an empty See it as if it were one", () => {
    const without = buildDeck(SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS as RetrievalPrompt[]);
    expect(without.stats.cards).toBe(fixtureDeck().stats.cards);
    const drawn = without.cards.find((c): c is SeeCard => c.kind === "see" && c.key === "see:factorise-first:1")!;
    expect(drawn.see).toBeNull();
  });

  it("reports a Your turn asked before its See it, and a third recall card", () => {
    const blocks = [
      { type: "h", text: "One", role: "idea" },
      { type: "p", md: "Words." },
      { type: "gate", id: "g1", kind: "choice", prompt: "Which?", options: ["a", "b"], answer: "a", explain: "Because." },
      { type: "see", stem: "S", steps: [{ n: 1, working: "$a$", decision: "d" }, { n: 2, working: "$b$", decision: "d" }] },
      { type: "gate", id: "g2", kind: "choice", prompt: "Which now?", options: ["a", "b"], answer: "a", explain: "The first is right." },
    ];
    expect(deckRuleViolations(buildDeck(blocks).cards)).toEqual([
      "the first Your turn (g1) comes before the first See it",
      "Your turn g1 has no See it of its own before it in its section",
      'Your turn g2 names an option by its place: "The first is right."',
    ]);
  });
});

/** Every note the packs publish, read the way the renderer reads them. */
const publishedNotes = (() => {
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

/**
 * The rules of the card grammar: the build's structure passes; the first Your turn is a real one, after the first See
 * it, never an interface warm-up (the owner's answer 8); one Your turn per See it, two where it worked two variants; at
 * most two recall cards (answer 3); no choice gate's explanation names an option by its place. Asserted over the
 * fixture and over every note that is READY (the readiness module's own rule: offered as Slides and drawn as Read v2);
 * a migrated note still in flight is listed with its breaches, never failed (the lead, 27 Sep: drafts publish for days,
 * and a gate whose explanation names a position is shown in its written order meanwhile, the safe behaviour).
 */
function grammarBreaches(file: string, blocks: readonly unknown[], deckCards: readonly Card[]): string[] {
  const WARM_UP = /\bone tap to start\b|\bwarm[- ]?up\b|\bto get started\b|\bjust to start\b/i;
  const out = deckRuleViolations(deckCards).map((v) => `${file}: ${v}`);
  if (!hasSeeBlock(blocks)) return out;
  out.push(...noteStructure(blocks).problems.map((p) => `${file}: ${p}`));
  const gates = deckCards.filter((c): c is GateCard => c.kind === "gate");
  const firstSee = deckCards.findIndex((c) => c.kind === "see");
  const firstGate = deckCards.findIndex((c) => c.kind === "gate");
  if (firstGate >= 0 && firstGate < firstSee) out.push(`${file}: the first Your turn (${gates[0]?.gate.id}) comes before the first See it`);
  if (WARM_UP.test(gates[0]?.gate.prompt ?? "")) out.push(`${file}: the first Your turn (${gates[0]?.gate.id}) is a warm-up: "${gates[0]?.gate.prompt}"`);
  return out;
}

describe("the grammar's rules", () => {
  const withBundles = publishedNotes.map((n) => {
    const bundleFile = path.join(ROOT, "packs", ...n.file.split("/"), "bundle.json");
    const bundle = fs.existsSync(bundleFile) ? (readJson(bundleFile) as { note?: { verification?: string } | null; verification?: unknown[]; prompts?: RetrievalPrompt[]; workedExamples?: WorkedExample[] }) : null;
    const readiness = bundle ? lessonReadiness({ note: bundle.note ?? null, noteBlocks: n.blocks, verification: bundle.verification ?? [] }) : null;
    const deck = buildDeck(n.blocks, bundle?.prompts ?? [], null, { workedExamples: bundle?.workedExamples ?? [] });
    return { ...n, ready: readiness?.ready === true, deck };
  });

  it("hold for the teach-first fixture, in full", () => {
    expect(grammarBreaches("the fixture", SEE_FIXTURE_BLOCKS, fixtureDeck().cards)).toEqual([]);
    const cards = fixtureDeck().cards;
    expect(cards.findIndex((c) => c.kind === "gate")).toBeGreaterThan(cards.findIndex((c) => c.kind === "see"));
    expect((cards.find((c) => c.kind === "gate") as GateCard).gate.prompt).not.toMatch(/one tap|warm[- ]?up/i);
  });

  it("hold for every note that is ready (offered as Slides, drawn as Read v2)", () => {
    const ready = withBundles.filter((n) => n.ready);
    for (const n of ready) expect(grammarBreaches(n.file, n.blocks, n.deck.cards), n.file).toEqual([]);
    console.log(`[slides] ready notes checked against the grammar: ${ready.length} (${ready.map((n) => n.file).join(", ") || "none"})`);
  });

  it("are reported, not failed, for a migrated note still in flight", () => {
    const inFlight = withBundles.filter((n) => !n.ready && hasSeeBlock(n.blocks));
    const breaches = inFlight.flatMap((n) => grammarBreaches(n.file, n.blocks, n.deck.cards));
    console.log(`[slides] migrated notes not yet ready: ${inFlight.length}; breaches of the grammar to fix before they are:${breaches.length ? `\n  ${breaches.join("\n  ")}` : " none"}`);
    expect(Array.isArray(breaches)).toBe(true);
  });

  it("keeps at most two recall cards in every published deck, and reports what the migration still has to change", () => {
    const WARM_UP = /\bone tap to start\b|\bwarm[- ]?up\b|\bto get started\b|\bjust to start\b/i;
    let positional = 0;
    let warmUps = 0;
    for (const n of withBundles) {
      expect(n.deck.stats.recall, n.file).toBeLessThanOrEqual(2);
      const gates = n.deck.cards.filter((c): c is GateCard => c.kind === "gate");
      positional += gates.filter((g) => g.gate.kind === "choice" && positionalWording(g.gate.explain) !== null).length;
      if (WARM_UP.test(gates[0]?.gate.prompt ?? "")) warmUps += 1;
    }
    const migrated = withBundles.filter((n) => hasSeeBlock(n.blocks)).length;
    console.log(`[slides] ${publishedNotes.length} notes, ${migrated} with See it blocks; across all: ${positional} choice explanations name an option by its place, ${warmUps} notes open on a warm-up gate`);
  });
});

/**
 * The migrated notes as their packs hold them (packs/…/note.blocks.json and bundle.json; the lead, 27 Sep: never the
 * rebuilt public copy): the deck the static route builds, with the bundle's own worked examples. What the generator
 * guarantees is asserted; what the content decides (where a video stands, a V3.1 field left out) is reported, never
 * failed, while the migration is in flight.
 */
describe("the migrated notes as their packs hold them", () => {
  const shipped = packTopics()
    .filter((t) => hasSeeBlock(t.blocks))
    .map((t) => ({ id: t.topicId, blocks: t.blocks, deck: buildDeck(t.blocks, t.bundle.prompts, null, { workedExamples: t.bundle.workedExamples }) }));

  it("draws every See it (a named worked example is one the bundle ships), with its kind as written, and counts a timed video's own length", () => {
    for (const n of shipped) {
      for (const c of n.deck.cards) {
        if (c.kind === "see") {
          expect(c.see, `${n.id} ${c.key}`).not.toBeNull();
          expect(c.see!.kind === null || (SEE_KINDS as readonly string[]).includes(c.see!.kind), `${n.id} ${c.key}: ${c.see!.kind}`).toBe(true);
          expect(cardSeconds(c), `${n.id} ${c.key}`).toBe(SEE_STEP_SECONDS * c.see!.steps.length);
        }
        if (c.kind === "media" && c.block.type === "video") expect(cardSeconds(c), `${n.id} ${c.key}`).toBe(videoSeconds(c.block) ?? 0);
      }
    }
    console.log(`[slides] migrated decks (with See its) in the packs: ${shipped.length}`);
  });

  it("keeps two Your turns on one See it after it, numbered, both pointing back at it (b2/natural-selection g3 then g4)", () => {
    const t = shipped.find((n) => n.id === "science.b2.b2-natural-selection-selective-breeding");
    if (!t) return; // the note is in flight in the content session; its checks run when it is on disk
    const g3 = t.deck.cards.findIndex((c) => c.kind === "gate" && c.gate.id === "g3");
    const [first, second] = [t.deck.cards[g3], t.deck.cards[g3 + 1]] as [GateCard, GateCard];
    // The See it, then the simulation and the video beside it, then the two Your turns.
    const seeAt = t.deck.cards.findIndex((c) => c.key === first.seeKey);
    const see = t.deck.cards[seeAt] as SeeCard;
    expect(see.kind).toBe("see");
    expect(t.deck.cards.slice(seeAt + 1, g3).map((c) => (c.kind === "media" ? c.block.type : c.kind))).toEqual(["sim", "video"]);
    expect(nextLabel(t.deck.cards, seeAt)).toBe("Continue");
    expect(nextLabel(t.deck.cards, g3 - 1)).toBe("Your turn");
    expect([first.gate.id, second.gate.id]).toEqual(["g3", "g4"]);
    expect([first.turn, second.turn]).toEqual([
      { n: 1, of: 2 },
      { n: 2, of: 2 },
    ]);
    expect([first.seeKey, second.seeKey]).toEqual([see.key, see.key]);
    // Each re-teach points at a step the See it has: "step 1 of the See it", and "Step 1 of the See it again".
    for (const g of [first, second]) {
      const k = stepPointer(g.gate.explain);
      expect(k, g.gate.id).not.toBeNull();
      expect((see as SeeCard).see?.steps.some((s) => s.n === k), `${g.gate.id} points at step ${k}`).toBe(true);
    }
  });

  it("reports the Your turns whose See it prints their answer as written, for a reviewer to judge (the lead, 27 Sep)", () => {
    const found = shipped.flatMap((n) => seeAnswerPrinted(n.deck.cards).map((f) => `${n.id} ${f.gate}: "${f.answer}"`));
    console.log(`[slides] Your turns whose See it prints their answer (candidates): ${found.length ? `\n  ${found.join("\n  ")}` : "none"}`);
    // The teach-first fixture's See its work other numbers than their Your turns ask.
    expect(seeAnswerPrinted(fixtureDeck().cards)).toEqual([]);
  });

  it("reports where a video stands against its section's See it and Your turn (beside the See it: after it, before the Your turn)", () => {
    const findings: string[] = [];
    for (const n of shipped) {
      n.deck.cards.forEach((c, i) => {
        if (c.kind !== "media" || c.block.type !== "video" || !c.section) return;
        const own = n.deck.cards.map((d, j) => [d, j] as const).filter(([d]) => "section" in d && d.section?.n === c.section!.n && d.section?.heading === c.section!.heading);
        const seeAt = own.find(([d]) => d.kind === "see")?.[1] ?? -1;
        const turnAt = own.find(([d, j]) => d.kind === "gate" && j > i)?.[1] ?? -1;
        if (seeAt < 0 || seeAt > i || turnAt < 0) findings.push(`${n.id} ${c.key}: see ${seeAt}, video ${i}, next your turn ${turnAt}`);
      });
    }
    console.log(`[slides] videos not beside a See it (after it, before its Your turn): ${findings.length ? `\n  ${findings.join("\n  ")}` : "none"}`);
    expect(Array.isArray(findings)).toBe(true);
  });
});

describe("a note figure and the words that read it", () => {
  const svg = "<svg viewBox='0 0 400 190'><text x='10' y='20' font-size='15'>x</text></svg>";
  // A note opens with its hero and the figure the hero hoists onto the title card; the figures below are the lesson's.
  const opening = [
    { type: "hero", lede: "An opening line for the title card.", can: [] },
    { type: "figure", alt: "The hero's own figure.", svg },
    { type: "h", text: "First" },
    { type: "p", md: "Words of the first section." },
  ];
  const figure = { type: "figure", alt: "A square with a corner cut away.", svg, caption: "Move the strip and it is a rectangle." };
  const gate = { type: "gate", id: "g1", kind: "choice", prompt: "Which?", options: ["a", "b", "c"], answer: "a", explain: "Because." };
  const deckOf = (...blocks: unknown[]) => buildDeck([...opening, ...blocks]).cards;
  const second = (cards: Card[]) => cards.filter((c) => "section" in c && c.section?.n === 2);

  it("stands on the first idea card of the paragraph after it, and costs its look on that card (art direction v2 §8.1)", () => {
    const long = Array.from({ length: 9 }, (_, i) => `Sentence number ${i + 1} has exactly ten words in it, honestly.`).join(" ");
    const cards = second(deckOf({ type: "h", text: "A square minus a square" }, figure, { type: "p", md: `In the drawing, the corner goes. ${long}` }, gate));
    expect(kinds(cards)).toEqual(["idea", "idea", "gate"]);
    const [first, next] = cards as IdeaCard[];
    expect(first).toMatchObject({ first: true, figure });
    expect(next.figure).toBeNull();
    expect(cardSeconds(first)).toBe(cardSeconds({ ...first, figure: null }) + 20);
  });

  it("stays a card of its own when no paragraph follows it: before a gate, a callout, a heading, or at the end", () => {
    for (const next of [gate, { type: "callout", kind: "why", title: "Why", md: "Because." }, { type: "h", text: "Next" }]) {
      const cards = second(deckOf({ type: "h", text: "Two" }, { type: "p", md: "Words." }, figure, next));
      expect(cards.filter((c) => c.kind === "media"), JSON.stringify(next)).toHaveLength(1);
      expect(cards.filter((c) => c.kind === "idea" && c.figure !== null)).toEqual([]);
    }
    expect(second(deckOf({ type: "h", text: "Two" }, { type: "p", md: "Words." }, figure)).filter((c) => c.kind === "media")).toHaveLength(1);
  });

  it("never pairs a figure with no drawing, a photo, a video or a simulation", () => {
    const noDrawing = { type: "figure", alt: "Described only." };
    const video = { type: "video", videoId: "abc", title: "A video", channel: "corbettmaths" };
    for (const media of [noDrawing, video]) {
      const cards = second(deckOf({ type: "h", text: "Two" }, media, { type: "p", md: "Words after it." }));
      expect(kinds(cards), JSON.stringify(media)).toEqual(["media", "idea"]);
      expect((cards[1] as IdeaCard).figure).toBeNull();
    }
  });
});

/** Note shapes the trial does not have, which a roll-out will meet (audit SLIDES-47, CQ-19). */
describe("the generator's edge cases", () => {
  const p = (md: string) => ({ type: "p", md });
  const h = (text: string, role?: string) => (role ? { type: "h", text, role } : { type: "h", text });
  const eyebrows = (cards: Card[]) => cards.flatMap((c) => ("section" in c && c.section ? [`${c.kind}:${c.section.n}/${c.section.total}:${c.section.heading}`] : [c.kind]));

  it("numbers a note with no heading as one section, never 'Section 1 of 0'", () => {
    expect(eyebrows(buildDeck([p("Only words."), p("More words.")]).cards)).toEqual(["title", "idea:1/1:", "idea:1/1:", "close"]);
  });

  it("keeps the recap's and the pointer's words on their own cards, and titles a section the close has taken in", () => {
    const cards = buildDeck([h("One", "idea"), p("Words."), h("You can now", "recap"), p("Line one."), p("Line two."), h("In the exam", "pointer"), p("Two marks."), p("Three marks."), h("Going further", "further"), p("More.")]).cards;
    expect(eyebrows(cards)).toEqual(["title", "idea:1/1:One", "recap", "pointer", "idea:0/1:Going further", "close"]);
    expect(cards.find((c) => c.kind === "recap")).toMatchObject({ lines: ["Line one.", "Line two."] });
    expect(cards.find((c) => c.kind === "pointer")).toMatchObject({ md: "Two marks.\n\nThree marks." });
  });

  it("reads a note without roles by its closing headings' words, as it always did", () => {
    const cards = buildDeck([h("One"), p("Words."), h("You can now"), p("Line."), h("In the exam"), p("Marks.")]).cards;
    expect(kinds(cards)).toEqual(["title", "idea", "recap", "pointer", "close"]);
  });

  it("never cuts inside display maths or after 'e.g.'", () => {
    expect(splitSentences("First sentence here. $$a. b = c. d$$ Then more words follow. End.")).toEqual(["First sentence here.", "$$a. b = c. d$$ Then more words follow.", "End."]);
    expect(splitSentences("Take e.g. the first case. Then the second.")).toEqual(["Take e.g. the first case.", "Then the second."]);
  });
});

describe("packing a paragraph into cards", () => {
  it("keeps a paragraph under the budget whole, line breaks and all", () => {
    expect(packParagraph("One line.\nTwo line.")).toEqual(["One line.\nTwo line."]);
  });

  it("puts an authored line over the budget on its own card and splits it at sentences", () => {
    const long = Array.from({ length: 6 }, (_, i) => `Sentence number ${i + 1} has exactly ten words in it, honestly.`).join(" ");
    const second = Array.from({ length: 3 }, () => "Ten more words on the second authored line of prose here.").join(" ");
    const cards = packParagraph(`${long}\n${second}`);
    expect(cards).toHaveLength(2);
    expect(cards[0]).toBe(long);
    expect(cards[1]).toBe(second);
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
  it("builds a deck for each without throwing, with a title first and a close last", () => {
    expect(publishedNotes.length).toBeGreaterThan(100);
    for (const n of publishedNotes) {
      const deck = buildDeck(n.blocks);
      expect(deck.cards[0].kind, n.file).toBe("title");
      expect(deck.cards[deck.cards.length - 1].kind, n.file).toBe("close");
      // Every teaching card is numbered within the lesson: never "1 of 0", never past the total.
      for (const c of deck.cards) if ("section" in c && c.section && c.section.n > 0) expect(c.section.n, `${n.file} ${c.key}`).toBeLessThanOrEqual(c.section.total);
    }
  });

  it("never shows a drawn figure as a picture-only card when the paragraph after it reads it (the distribution is reported)", () => {
    let paired = 0;
    let alone = 0;
    for (const n of publishedNotes) {
      const deck = buildDeck(n.blocks);
      paired += deck.cards.filter((c) => c.kind === "idea" && c.figure !== null).length;
      alone += deck.cards.filter((c) => c.kind === "media" && c.block.type === "figure").length;
      const body = lessonBlocks(n.blocks, heroDataFor(n.blocks).lede).filter((b) => (b as { type?: string }).type !== "pause");
      for (const c of deck.cards) {
        if (c.kind !== "media" || c.block.type !== "figure" || !c.block.svg) continue;
        const at = body.indexOf(c.block);
        expect(at, `${n.file}: ${c.key}`).toBeGreaterThanOrEqual(0);
        expect((body[at + 1] as { type?: string } | undefined)?.type, `${n.file}: ${c.key}`).not.toBe("p");
      }
    }
    console.log(`[slides] figures on the idea card that reads them: ${paired}; figure cards on their own (a gate, a callout or a heading follows): ${alone}`);
    expect(paired).toBeGreaterThan(0);
  });

  it("keeps every idea card at the budget unless a single authored sentence exceeds it (the distribution is reported)", () => {
    const over: string[] = [];
    const sizes: number[] = [];
    const counts: number[] = [];
    for (const n of publishedNotes) {
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
      `[slides] ${publishedNotes.length} notes, ${sizes.length} idea cards: words median ${q(0.5)}, p90 ${q(0.9)}, max ${sizes[sizes.length - 1]}; ` +
        `${longSentences} cards over ${CARD_WORDS} words because one sentence is; decks from ${counts[0]} to ${counts[counts.length - 1]} cards, median ${counts[Math.floor(counts.length / 2)]}`,
    );
    expect(over, over.join("\n")).toEqual([]);
  });
});
