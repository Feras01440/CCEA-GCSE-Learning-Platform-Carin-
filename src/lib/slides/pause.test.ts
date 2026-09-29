/**
 * "Pause here" in Slides (the owner, 29 Sep 2026: "keep a stopping point in Slides: Read has Pause here, and Slides
 * drops it"; the rule stays length by need with stopping points, never shorter teaching): where a deck stops, where a
 * run opens again, what Today says of it, and the one function Today reads for either way. The stops are checked over
 * every migrated note in the packs.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { lastLesson } from "@/components/topic/last-lesson";
import { newPlace, paused as readPaused, writePlace } from "@/components/topic/read-place";
import { pausedRow } from "@/components/home/tonight-copy";
import { bannedIn } from "@/lib/companion/lint";
import { deckGateIds, withRetries, type Card, type GateCard } from "./cards";
import { deckFor } from "./deck";
import { packTopics, trialNote, TRIAL_ID } from "./packs-corpus.test-helper";
import { minutesLeft, pausePoints, placeWords, RECAP_WORDS, resumeIndex } from "./pause";
import { lastSlidesLesson, parseSlidesPlace, readSlidesPlace, SLIDES_LAST_KEY, SLIDES_PLACE_KEY, writeSlidesPlace, type SlidesPlace } from "./place";
import { hasSeeBlock } from "./readiness";
import { gatePhase, unlockedFor } from "./run";

const migrated = packTopics()
  .filter((t) => hasSeeBlock(t.blocks))
  .map((t) => ({ file: t.file, deck: deckFor(t.topicId, t.blocks, t.bundle.prompts, t.bundle.workedExamples) }));
const trial = trialNote();
const trialDeck = deckFor(TRIAL_ID, trial.blocks, trial.prompts, trial.workedExamples);
const indexOf = (cards: readonly Card[], key: string) => cards.findIndex((c) => c.key === key);

describe("where a deck stops", () => {
  it("stops after every run of Your turns, never inside one, never before the close, never twice in a row, and never opens on a Your turn", () => {
    expect(migrated.length).toBeGreaterThan(30);
    for (const { file, deck } of migrated) {
      const cards = deck.cards;
      const stops = pausePoints(cards);
      cards.forEach((c, i) => {
        if (c.kind !== "gate") return;
        let end = i;
        while (cards[end + 1]?.kind === "gate") end += 1;
        if (cards[end + 1]?.kind === "close") return;
        expect(stops.some((s) => s.after === cards[end]!.key), `${file}: a stop after ${cards[end]!.key}`).toBe(true);
      });
      for (const s of stops) {
        const after = indexOf(cards, s.after);
        expect(cards[after]!.kind, `${file}: ${s.after}`).toBe("gate");
        expect(s.resumeAt, `${file}: ${s.resume}`).toBe(after + 1);
        expect(cards[s.resumeAt]!.key).toBe(s.resume);
        expect(cards[s.resumeAt]!.kind, `${file}: opens on ${s.resume}`).not.toBe("gate");
        expect(cards[s.resumeAt]!.kind, `${file}: opens on ${s.resume}`).not.toBe("close");
      }
      // Never twice in a row: between two stops stands at least one card that is not a Your turn.
      for (let k = 1; k < stops.length; k += 1) {
        const between = cards.slice(stops[k - 1]!.resumeAt, indexOf(cards, stops[k]!.after));
        expect(
          between.some((c) => c.kind !== "gate"),
          `${file}: stops at ${stops[k - 1]!.after} and ${stops[k]!.after}`,
        ).toBe(true);
      }
    }
  });

  it("offers no stop inside a re-teach: a missed Your turn is locked until she asks for the answer", () => {
    const gate = trialDeck.cards.find((c): c is GateCard => c.kind === "gate")!;
    const wrong = { answer: "x", correct: false, record: "recorded" as const };
    expect(gatePhase(wrong, false, false)).toBe("reteach");
    const base = { gateSelected: null, seeProgress: null, tapDone: false, recallRevealed: false, recallGraded: false, recallSkipped: false };
    expect(unlockedFor(gate, { ...base, gateAnswer: wrong, gateShown: false })).toBe(false);
    expect(unlockedFor(gate, { ...base, gateAnswer: wrong, gateShown: true })).toBe(true);
  });

  it("waits past the retries owed before the recap, so a pause never leaves a check to come back to", () => {
    const ids = deckGateIds(trialDeck.cards);
    const cards = withRetries(trialDeck.cards, [ids[0]!, ids[ids.length - 1]!]);
    const stops = pausePoints(cards);
    const recapAt = cards.findIndex((c) => c.kind === "recap");
    expect(cards[recapAt - 1]).toMatchObject({ kind: "gate", retry: true });
    expect(cards[recapAt - 2]).toMatchObject({ kind: "gate", retry: true });
    const last = stops[stops.length - 1]!;
    expect(last.resumeAt).toBe(recapAt);
    expect(stops.filter((s) => s.resumeAt > recapAt - 3 && s.resumeAt < recapAt)).toEqual([]);
  });

  it("opens a run left on a Your turn she has not answered on its See it, the tap before it; anything else as it is", () => {
    for (const { file, deck } of migrated) {
      const cards = deck.cards;
      cards.forEach((c, i) => {
        if (c.kind !== "gate") {
          expect(resumeIndex(cards, i, () => false), `${file}: ${c.key}`).toBe(i);
          return;
        }
        expect(resumeIndex(cards, i, () => true), `${file}: ${c.key} answered`).toBe(i);
        const back = resumeIndex(cards, i, () => false);
        if (c.seeKey) expect(cards[back]!.key, `${file}: ${c.key}`).toBe(c.seeKey);
        else expect(back, `${file}: ${c.key}`).toBeLessThanOrEqual(i);
      });
    }
    // A retry opens as itself: it was re-taught when she missed it.
    const ids = deckGateIds(trialDeck.cards);
    const withRetry = withRetries(trialDeck.cards, [ids[0]!]);
    const retryAt = withRetry.findIndex((c) => c.kind === "gate" && c.retry);
    expect(resumeIndex(withRetry, retryAt, () => false)).toBe(retryAt);
    // A Your turn with no See it (a note in the v2 shape) opens on its section's explanation.
    const v2 = [
      { type: "h", text: "One idea" },
      { type: "p", md: "Words about it." },
      { type: "gate", id: "g1", kind: "choice", prompt: "Which?", options: ["a", "b", "c"], answer: "a", explain: "Because." },
    ];
    const plain = deckFor("x.none", v2).cards;
    const gateAt = plain.findIndex((c) => c.kind === "gate");
    expect(plain[resumeIndex(plain, gateAt, () => false)]!.kind).toBe("idea");
  });

  it("says the minutes left by the deck's own model: all of them at the start, never more as she goes, none at the close", () => {
    for (const { file, deck } of migrated) {
      expect(minutesLeft(deck.cards, 0), file).toBe(deck.stats.minutes);
      let before = Number.POSITIVE_INFINITY;
      deck.cards.forEach((_, i) => {
        const m = minutesLeft(deck.cards, i);
        expect(m, `${file} at card ${i + 1}`).toBeLessThanOrEqual(before);
        before = m;
      });
      expect(minutesLeft(deck.cards, deck.cards.length - 1), file).toBe(0);
    }
  });

  it("names what opens next in words, never a card number: the section's title, or the recap once the teaching is done", () => {
    for (const { file, deck } of migrated) {
      for (const s of pausePoints(deck.cards)) {
        const words = placeWords(deck.cards, s.resumeAt);
        const c = deck.cards[s.resumeAt]!;
        expect(words.next, file).not.toMatch(/\bcard\b|\d+ of \d+|\$/);
        expect(words.next.trim().length, file).toBeGreaterThan(0);
        if (c.kind === "idea" || c.kind === "see" || c.kind === "callout" || c.kind === "media") expect(words.done, `${file}: ${s.resume}`).toBe((c.section?.n ?? 1) - 1);
        else expect(words, `${file}: ${s.resume}`).toEqual({ next: RECAP_WORDS, done: words.total, total: words.total });
      }
      expect(placeWords(deck.cards, 0).done, file).toBe(0);
    }
  });
});

describe("the deck's place on this device, and the one lesson Today reads", () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = new Map<string, string>();
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
      },
      dispatchEvent: () => true,
    };
  });
  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  const AT = "2026-09-29T19:00:00.000Z";
  const PLACE: SlidesPlace = {
    v: 1,
    topicId: TRIAL_ID,
    subject: "further-maths",
    unit: "FM1",
    slug: "algebraic-fractions-simplify",
    title: "Simplifying algebraic fractions",
    key: "idea:a-square-minus-a-square:1",
    next: "A square minus a square",
    done: 2,
    total: 10,
    minutesLeft: 27,
    finished: false,
    updatedAt: AT,
    pausedAt: AT,
    pausedKey: "idea:a-square-minus-a-square:1",
  };
  const META = { topicId: TRIAL_ID, subject: "further-maths" as const, unit: "FM1", slug: "algebraic-fractions-simplify", title: "Simplifying algebraic fractions" };
  const SECTIONS = [
    { title: "Why cancelling works, and when it does not", gateIds: ["g2"], minutes: 4 },
    { title: "The three moves", gateIds: ["g14"], minutes: 5 },
    { title: "A square minus a square", gateIds: ["g12"], minutes: 3 },
  ];

  it("keeps a paused deck, and holds the pause until she moves on from the card it kept", () => {
    writeSlidesPlace(PLACE);
    expect(readSlidesPlace(TRIAL_ID)).toEqual(PLACE);
    expect(JSON.parse(store.get(SLIDES_LAST_KEY)!)).toEqual({ topicId: TRIAL_ID, at: AT });
    expect(lastSlidesLesson()).toEqual({ place: PLACE, pausedLast: true, href: "/learn/further-maths/FM1/algebraic-fractions-simplify/slides/" });
    writeSlidesPlace({ ...PLACE, key: "see:a-square-minus-a-square:1", updatedAt: "2026-09-29T19:05:00.000Z" });
    expect(lastSlidesLesson()?.pausedLast).toBe(false);
    writeSlidesPlace({ ...PLACE, finished: true });
    expect(lastSlidesLesson()).toBeNull();
  });

  it("gives Today one lesson for both ways: the later pointer decides, and the row says the section and the minutes, never a card", () => {
    // Read paused at 18:00, then the slides paused at 19:00: the slides.
    const six = new Date("2026-09-29T18:00:00Z");
    writePlace(readPaused(newPlace(META, SECTIONS, six), 1, SECTIONS, six));
    writeSlidesPlace(PLACE);
    const slides = lastLesson()!;
    expect(slides).toMatchObject({ way: "slides", title: "Simplifying algebraic fractions", next: "A square minus a square", open: 3, done: 2, total: 10, minutesLeft: 27, pausedLast: true, pausedAt: AT });
    expect(slides.href).toBe("/learn/further-maths/FM1/algebraic-fractions-simplify/slides/");
    const row = pausedRow({ title: slides.title, done: slides.done, open: slides.open, total: slides.total, next: slides.next, minutesLeft: slides.minutesLeft });
    expect(row).toEqual({ label: "Simplifying algebraic fractions · A square minus a square next · about 27 minutes left", action: "Carry on" });
    expect(row.label).not.toMatch(/\bcard\b/);
    expect(bannedIn(row.label)).toEqual([]);

    // Then Read at 20:00: Read, with its section's title and the minutes its sections price.
    const eight = new Date("2026-09-29T20:00:00Z");
    writePlace(readPaused(newPlace(META, SECTIONS, eight), 1, SECTIONS, eight));
    const read = lastLesson()!;
    expect(read).toMatchObject({ way: "read", next: "The three moves", open: 2, done: 1, total: 3, minutesLeft: 8, pausedLast: true });
    expect(read.href).toBe("/learn/further-maths/FM1/algebraic-fractions-simplify/#resume");
  });

  it("shows nothing when nothing is kept, for a broken record, and never throws without storage", () => {
    expect(lastLesson()).toBeNull();
    store.set(SLIDES_LAST_KEY, JSON.stringify({ topicId: TRIAL_ID, at: AT }));
    store.set(SLIDES_PLACE_KEY(TRIAL_ID), "not json");
    expect(readSlidesPlace(TRIAL_ID)).toBeNull();
    expect(lastLesson()).toBeNull();
    expect(parseSlidesPlace(JSON.stringify({ ...PLACE, done: "two" }))).toBeNull();
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(lastSlidesLesson()).toBeNull();
    expect(lastLesson()).toBeNull();
    expect(() => writeSlidesPlace(PLACE)).not.toThrow();
  });
});
