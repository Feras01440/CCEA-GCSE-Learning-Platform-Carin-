import { describe, expect, it } from "vitest";
import type { RetrievalPrompt, WorkedExample } from "@/lib/content/schema";
import { buildDeck, withRetries, type Card, type GateCard, type SeeCard } from "./cards";
import { STEPS_AT_ONCE_UNDER_REDUCED_MOTION, answerNote, canSkipSee, gateNote, gatePhase, primaryFor, seeProgress, unlockedFor, type CardState } from "./run";
import { SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS, SEE_FIXTURE_WORKED_EXAMPLE } from "./see-fixture";

const deck = buildDeck(SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS as RetrievalPrompt[], null, { workedExamples: [SEE_FIXTURE_WORKED_EXAMPLE as unknown as WorkedExample] }).cards;
const at = (key: string) => deck.findIndex((c) => c.key === key);
const card = <T extends Card>(key: string) => deck[at(key)] as T;
const idle: CardState = { gateAnswer: null, gateSelected: null, gateShown: false, seeProgress: null, tapDone: false, recallRevealed: false, recallGraded: false, recallSkipped: false };

describe("a See it card: one step per Continue, then Your turn", () => {
  const first = card<SeeCard>("see:only-a-factor-divides-out:1");
  const beside = card<SeeCard>("see:factorise-first:1");
  const typed = card<SeeCard>("see:simplify-before-you-substitute:1");

  it("opens on its first step and shows one more per Continue, until the last, whose control names the Your turn", () => {
    const labels: string[] = [];
    for (let shown = 1; shown <= 3; shown += 1) {
      const p = seeProgress(first, shown, false);
      expect(p.revealed).toBe(shown);
      const control = primaryFor(deck, at(first.key), { ...idle, seeProgress: p })!;
      labels.push(`${control.label}:${control.action}`);
      expect(unlockedFor(first, { ...idle, seeProgress: p }), `unlocked at ${shown}`).toBe(shown === 3);
    }
    expect(labels).toEqual(["Continue:reveal-step", "Continue:reveal-step", "Your turn:next"]);
    // Never fewer than the first step, never more than there are.
    expect(seeProgress(first, undefined, false).revealed).toBe(1);
    expect(seeProgress(first, 9, false).revealed).toBe(3);
  });

  it("goes on to the video beside it with Continue, and the video's card to the Your turn", () => {
    const p = seeProgress(beside, 3, false);
    expect(primaryFor(deck, at(beside.key), { ...idle, seeProgress: p })).toEqual({ label: "Continue", action: "next", disabled: false });
    expect(primaryFor(deck, at("media:video:tlKN8NNNxdI"), idle)).toEqual({ label: "Your turn", action: "next", disabled: false });
  });

  it("waits on the step she types: no control of the frame's until she answers it or asks to see it, and the way on stays shut", () => {
    expect(typed.typed).toBe(2);
    const reached = seeProgress(typed, 3, false);
    expect(reached).toMatchObject({ waiting: true, complete: false });
    expect(primaryFor(deck, at(typed.key), { ...idle, seeProgress: reached })).toBeNull();
    expect(unlockedFor(typed, { ...idle, seeProgress: reached })).toBe(false);
    // Before it is reached it does not wait.
    expect(seeProgress(typed, 2, false).waiting).toBe(false);
    const settled = seeProgress(typed, 3, true);
    expect(settled).toMatchObject({ waiting: false, complete: true });
    expect(primaryFor(deck, at(typed.key), { ...idle, seeProgress: settled })?.label).toBe("Your turn");
  });

  it("offers Skip to your turn only on a return visit, and only while steps remain (the owner's answer 5)", () => {
    expect(canSkipSee(first, [], seeProgress(first, 1, false))).toBe(false);
    expect(canSkipSee(first, [first.key], seeProgress(first, 1, false))).toBe(true);
    expect(canSkipSee(first, [first.key], seeProgress(first, 3, false))).toBe(false);
    expect(canSkipSee(first, ["see:elsewhere:1"], seeProgress(first, 1, false))).toBe(false);
  });

  it("keeps the step per Continue under reduced motion (the pacing is the lesson's, not an animation)", () => {
    expect(STEPS_AT_ONCE_UNDER_REDUCED_MOTION).toBe(false);
  });
});

describe("a Your turn: Check, then a hit's Yes or a miss re-taught before its answer", () => {
  const g1 = card<GateCard>("gate:g1");
  const g2 = card<GateCard>("gate:g2");

  it("is open until Check, and Check waits for a choice", () => {
    expect(gatePhase(null, false, false)).toBe("open");
    expect(primaryFor(deck, at(g1.key), idle)).toEqual({ label: "Check", action: "check", disabled: true });
    expect(primaryFor(deck, at(g1.key), { ...idle, gateSelected: "$\\dfrac{x}{2}$" })?.disabled).toBe(false);
    expect(unlockedFor(g1, idle)).toBe(false);
  });

  it("goes straight to its answer on a hit", () => {
    const s = { ...idle, gateAnswer: { correct: true } };
    expect(gatePhase(s.gateAnswer, false, false)).toBe("answer");
    expect(primaryFor(deck, at(g1.key), s)).toEqual({ label: "Continue", action: "next", disabled: false });
    expect(unlockedFor(g1, s)).toBe(true);
  });

  it("re-teaches a miss first: the way on is shut until Show me the answer, then Continue", () => {
    const missed = { ...idle, gateAnswer: { correct: false } };
    expect(gatePhase(missed.gateAnswer, false, false)).toBe("reteach");
    expect(primaryFor(deck, at(g1.key), missed)).toEqual({ label: "Show me the answer", action: "show-answer", disabled: false });
    expect(unlockedFor(g1, missed)).toBe(false);
    const shown = { ...missed, gateShown: true };
    expect(gatePhase(shown.gateAnswer, false, true)).toBe("answer");
    expect(primaryFor(deck, at(g1.key), shown)?.label).toBe("Continue");
    expect(unlockedFor(g1, shown)).toBe(true);
  });

  it("answers a retry straight away, right or not", () => {
    const retry = withRetries(deck, ["g1"]).find((c) => c.key === "retry:g1") as GateCard;
    expect(gatePhase({ correct: false }, true, false)).toBe("answer");
    expect(unlockedFor(retry, { ...idle, gateAnswer: { correct: false } })).toBe(true);
  });

  it("says what happens to her answer, truly: before the recap on new numbers where there is a twin, never so on a retry", () => {
    expect(gateNote(g1)).toBe("Answer from what you just saw. If you miss, it is taught again first.");
    expect(answerNote(g1, false, "recorded")).toBe("Recorded. It comes back before the recap on new numbers, and in your reviews.");
    expect(answerNote(g2, false, "recorded")).toBe("Recorded. It comes back before the recap, and in your reviews.");
    expect(answerNote(g1, true, "recorded")).toBe("Recorded. It comes back in your reviews.");
    expect(answerNote(g1, true, "already")).toBe("Already in your reviews from an earlier visit.");
    const retry = withRetries(deck, ["g1"]).find((c) => c.key === "retry:g1") as GateCard;
    for (const correct of [true, false]) expect(answerNote(retry, correct, "retry")).not.toMatch(/before the recap/);
    expect(gateNote(retry)).not.toMatch(/before the recap/);
  });
});

describe("the other cards' controls", () => {
  it("starts on the title, continues on reading cards, and leaves the close to its own two ways out", () => {
    expect(primaryFor(deck, 0, idle)).toEqual({ label: "Start the slides", action: "start", disabled: false });
    expect(primaryFor(deck, at("idea:only-a-factor-divides-out:1"), idle)?.label).toBe("Continue");
    expect(primaryFor(deck, deck.length - 1, idle)).toBeNull();
    const recall = deck.find((c) => c.kind === "recall")!;
    expect(primaryFor(deck, at(recall.key), idle)?.action).toBe("reveal-recall");
    expect(primaryFor(deck, at(recall.key), { ...idle, recallRevealed: true })).toBeNull();
    expect(primaryFor(deck, at(recall.key), { ...idle, recallSkipped: true })?.label).toBe("Continue");
    expect(unlockedFor(recall, idle)).toBe(false);
    expect(unlockedFor(recall, { ...idle, recallSkipped: true })).toBe(true);
  });
});
