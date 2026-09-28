import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { ShippedBundle } from "@/lib/content/load";
import type { ShippedDeck } from "@/lib/content/deck-schema";
import type { GateBlock } from "@/components/items/gates";
import type { ReviewCard } from "@/lib/db/db";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { newCard } from "@/lib/srs/scheduler";
import histogramsJson from "@/lib/content/fixtures/histograms.example.json";
import { findInBundle, findInDeck, gateForReview, resolveContent, servableQueue, type ResolvedCard, type ResolvedContent } from "./resolve";

const gate: GateBlock = {
  type: "gate",
  id: "g3",
  kind: "blank",
  prompt: "Frequency density is frequency ÷ __",
  answer: "class width | width",
  explain: "The height of the bar is frequency per unit of the axis, so the divisor is the class width.",
};

// The published bundle carries the lesson's note blocks; the fixture is the same shape without them.
const bundle = { ...(histogramsJson as unknown as ShippedBundle), noteBlocks: [{ type: "h", text: "Reading a histogram" }, gate] };

describe("findInBundle", () => {
  it("resolves a retrieval prompt and a diagnostic item", () => {
    expect(findInBundle(bundle, "rp.maths.m4.histograms.02")).toMatchObject({ kind: "prompt", prompt: { id: "rp.maths.m4.histograms.02" } });
    expect(findInBundle(bundle, "02")).toMatchObject({ kind: "diagnostic", item: { id: "02" } });
  });

  it("resolves one part of a question, which is what the card stands for", () => {
    const found = findInBundle(bundle, "q.maths.m4.histograms.0001#b");
    expect(found?.kind).toBe("question");
    if (found?.kind !== "question") throw new Error("expected a question");
    expect(found.question.id).toBe("q.maths.m4.histograms.0001");
    expect(found.question.style).toBe("exam-style");
    expect(found.part.id).toBe("b");
    expect(found.part.marks).toBe(2);
  });

  it("resolves a diagnostic item by its set and its id, the form a card takes once it is its topic's own", () => {
    // The independent review (27 Sep): diagnostic items are recorded by their bare id ("01"), which 136 topics share, so one
    // card served every topic's "01". A card now names its set: "<set id>#<item id>", the withdrawn records' own form.
    expect(findInBundle(bundle, "dx.maths.m4.histograms#02")).toMatchObject({ kind: "diagnostic", item: { id: "02" } });
    expect(findInBundle(bundle, "dx.maths.m4.histograms#99")).toBeNull();
    expect(findInBundle(bundle, "dx.maths.m4.other#02")).toBeNull();
  });

  it("resolves a find-the-mistake item", () => {
    expect(findInBundle(bundle, "ftm.maths.m4.histograms.01")).toMatchObject({ kind: "mistake", item: { id: "ftm.maths.m4.histograms.01" } });
  });

  it("resolves a note gate from the bundle's own note blocks", () => {
    expect(findInBundle(bundle, "maths.m4.histograms#gate:g3")).toEqual({ kind: "gate", gate, context: [] });
    expect(findInBundle(bundle, "maths.m4.histograms#gate:g99")).toBeNull();
  });

  it("resolves the one card a worked example's twin and faded steps share to a fresh twin", () => {
    const found = findInBundle(bundle, "we.maths.m4.histograms.01#twin");
    expect(found?.kind).toBe("twin");
    if (found?.kind !== "twin") throw new Error("expected a twin");
    expect(found.we.id).toBe("we.maths.m4.histograms.01");
    expect(found.we.twin.stem.length).toBeGreaterThan(0);
  });

  it("is null for an item the bundle no longer ships, so the inbox skips the card", () => {
    expect(findInBundle(bundle, "q.maths.m4.histograms.0001#z")).toBeNull();
    expect(findInBundle(bundle, "q.maths.m4.withdrawn.0009#a")).toBeNull();
    expect(findInBundle(bundle, "we.maths.m4.gone.02#twin")).toBeNull();
    expect(findInBundle(bundle, "rp.maths.m4.gone.09")).toBeNull();
  });
});

/**
 * Flashcards in the review inbox (the independent review of 27 Sep 2026, item 2; seen on build 8): a card graded in
 * Flashcards (fc.*) lives only in its unit's deck, never in a topic bundle, so the inbox showed every one as "This item has
 * been withdrawn from the content while it is checked" with Skip, Skip left it due, and thirty of them filled the nightly
 * 25 on every evening that followed. The decks hold 1,342 such cards.
 */
const deck: ShippedDeck = {
  subject: "maths",
  unit: "M4",
  sections: [
    {
      id: "stats",
      title: "Statistics",
      topics: [
        {
          slug: "histograms",
          title: "Histograms",
          cards: [
            { id: "fc.maths.m4.histograms.01", front: "Frequency density is…", back: "frequency ÷ class width", kind: "formula" },
            { id: "rp.maths.m4.histograms.02", front: "From the bundle", back: "a prompt", kind: "fact" },
          ],
        },
      ],
    },
  ],
  counts: { cards: 2, topics: 1, authored: 1, generated: 0, fromBundles: 1 },
};

/**
 * A gate met again in review asks its twin every other time (the independent review of 27 Sep 2026, item 4): the same gate
 * with the same options, days after she saw its answer lit, tests whether she recognises that screen; the v3 twin (same
 * structure, new numbers) tests whether she can still do it.
 */
describe("a gate in review: the twin every other time", () => {
  const withTwin: GateBlock = {
    type: "gate",
    id: "g11",
    kind: "choice",
    prompt: "Over $(x+2)(x-5)$, what is the numerator of $\\dfrac{4}{x+2} + \\dfrac{1}{x-5}$?",
    options: ["$5x-18$", "$5x+3$", "$5$"],
    answer: "$5x-18$",
    explain: "The 4 is missing $(x-5)$ and the 1 is missing $(x+2)$.",
    twin: {
      prompt: "Over $(x+3)(x-4)$, what is the numerator of $\\dfrac{2}{x+3} + \\dfrac{3}{x-4}$?",
      options: ["$5x+1$", "$5x-6$", "$5$"],
      answer: "$5x+1$",
      explain: "The 2 is missing $(x-4)$ and the 3 is missing $(x+3)$.",
    },
  };

  it("serves the twin on the first return and every other one after, the gate itself in between", () => {
    const first = gateForReview(withTwin, 1);
    expect(first.variant).toBe("twin");
    expect(first.gate).toMatchObject({ type: "gate", id: "g11", kind: "choice", prompt: withTwin.twin!.prompt, options: withTwin.twin!.options, answer: "$5x+1$", explain: withTwin.twin!.explain });
    expect(first.gate.twin).toBeUndefined();
    expect(gateForReview(withTwin, 2)).toEqual({ gate: withTwin, variant: "original" });
    expect(gateForReview(withTwin, 3).variant).toBe("twin");
  });

  it("keeps the gate itself when it has no twin, when its stem leans on a figure, or when a choice twin has no options", () => {
    const { twin: _t, ...plain } = withTwin;
    void _t;
    expect(gateForReview(plain as GateBlock, 1).variant).toBe("original");
    expect(gateForReview({ ...withTwin, prompt: "In the graph above, what is the gradient?" }, 1).variant).toBe("original");
    expect(gateForReview({ ...withTwin, twin: { ...withTwin.twin!, options: undefined } }, 1).variant).toBe("original");
  });

  it("drops the note's figure for the twin, which is new numbers the figure never drew", () => {
    const b = { ...bundle, noteBlocks: [{ type: "figure", alt: "The first example, drawn" }, withTwin] };
    const card = { card: { reps: 1 } } as unknown as ReviewCard;
    const twin = resolveContent("maths.m4.histograms#gate:g11", b as ShippedBundle, null, card);
    expect(twin).toMatchObject({ kind: "gate", context: [], variant: "twin" });
    const again = resolveContent("maths.m4.histograms#gate:g11", b as ShippedBundle, null, { card: { reps: 2 } } as unknown as ReviewCard);
    expect(again).toMatchObject({ kind: "gate", variant: "original" });
    expect((again as { context: unknown[] }).context).toHaveLength(1);
  });
});

describe("a flashcard, from its unit's deck", () => {
  it("is found by its id in the deck", () => {
    expect(findInDeck(deck, "fc.maths.m4.histograms.01")).toMatchObject({ id: "fc.maths.m4.histograms.01", back: "frequency ÷ class width" });
    expect(findInDeck(deck, "fc.maths.m4.histograms.99")).toBeNull();
  });

  it("is what a flashcard-only card resolves to; a bundle item still resolves from the bundle", () => {
    expect(resolveContent("fc.maths.m4.histograms.01", bundle, deck)).toMatchObject({ kind: "flashcard", card: { id: "fc.maths.m4.histograms.01" } });
    expect(resolveContent("rp.maths.m4.histograms.02", bundle, deck)?.kind).toBe("prompt");
    expect(resolveContent("fc.maths.m4.histograms.01", bundle, null)).toBeNull();
    expect(resolveContent("fc.maths.m4.histograms.01", null, deck)?.kind).toBe("flashcard");
  });
});

describe("tonight's queue serves what it can open", () => {
  const card = (id: string, minutesOverdue: number, topicSlug = "histograms"): ReviewCard => {
    const due = new Date(NOW.getTime() - minutesOverdue * 60_000);
    return { id, subject: "maths", topicSlug, card: { ...newCard(due), due }, due, createdAt: due };
  };
  const NOW = new Date("2026-10-01T19:00:00");
  const resolved = (c: ReviewCard, content: ResolvedContent | null): ResolvedCard => ({ card: c, itemId: c.id, subject: "maths", unit: "M4", topicSlug: c.topicSlug, topicTitle: "Histograms", content });
  const flash = { kind: "flashcard", card: deck.sections[0].topics[0].cards[0] } as const;

  it("fills the cap with cards it can open, and never with ones it cannot", () => {
    const openable = Array.from({ length: 30 }, (_, i) => resolved(card(`fc.maths.m4.histograms.${i}`, 100 - i), flash));
    const unopenable = Array.from({ length: 5 }, (_, i) => resolved(card(`gone.${i}`, 1000 + i), null));
    const { queue, unopened } = servableQueue([...unopenable, ...openable], DEFAULT_PLAN, "2026-10-01", NOW, 25);
    expect(queue).toHaveLength(25);
    expect(queue.every((r) => r.content !== null)).toBe(true);
    expect(unopened).toBe(5);
  });

  it("keeps the inbox's own order: a sure-and-not-right re-probe first, then the most overdue", () => {
    const rows = [resolved(card("fc.a", 10), flash), resolved(card("hc:fc.b:1", 1), flash), resolved(card("fc.c", 500), flash)];
    const { queue } = servableQueue(rows, DEFAULT_PLAN, "2026-10-01", NOW, 25);
    expect(queue.map((r) => r.card.id)).toEqual(["hc:fc.b:1", "fc.c", "fc.a"]);
  });
});
