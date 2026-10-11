import { describe, expect, it } from "vitest";
import { buildDeck, deckGateIds, withRetries } from "./cards";
import { dealtCount, dealtPosition } from "./dealt";
import { deckFor } from "./deck";
import { TRIAL_ID, trialNote } from "./packs-corpus.test-helper";

/**
 * The counter counts the deck as dealt (./dealt.ts): her misses add cards to the run she walks, never to the "n of N"
 * the title card, the topic's hero and the Start button promised.
 */
describe("dealtPosition: the deck as dealt, whatever she misses", () => {
  const note = trialNote();
  const deck = deckFor(TRIAL_ID, note.blocks, note.prompts, note.workedExamples);
  const N = deck.cards.length;
  const ids = deckGateIds(deck.cards);

  it("on the deck alone, card i is card i + 1 of the deck's own count (the count the hero and the title card print)", () => {
    expect(N).toBe(deck.stats.cards);
    deck.cards.forEach((_, i) => expect(dealtPosition(deck.cards, i)).toEqual({ n: i + 1, N, retry: false }));
    expect(dealtCount(dealtPosition(deck.cards, 0))).toBe(`1 of ${N}`);
  });

  it("every miss leaves N and every dealt card's number as they were; a retry stands at the last dealt card before it", () => {
    for (const missed of [[ids[0]!], ids.slice(0, 3), ids]) {
      const run = withRetries(deck.cards, missed);
      expect(run.length).toBe(N + missed.length);
      let lastDealt = 0;
      run.forEach((c, i) => {
        const p = dealtPosition(run, i);
        expect(p.N).toBe(N);
        if (c.kind === "gate" && c.retry) {
          expect(p).toEqual({ n: lastDealt, N, retry: true });
          expect(dealtCount(p)).toBe(`${lastDealt} of ${N} · once more`);
        } else {
          // The dealt card keeps the number it has in the deck.
          expect(p).toEqual({ n: deck.cards.findIndex((d) => d.key === c.key) + 1, N, retry: false });
          lastDealt = p.n;
        }
      });
      // The run still ends on the deck's last card, as N of N.
      expect(dealtPosition(run, run.length - 1)).toEqual({ n: N, N, retry: false });
    }
  });

  it("the track never moves backwards along the run, and moves only on a dealt card", () => {
    const run = withRetries(deck.cards, ids);
    let before = 0;
    run.forEach((c, i) => {
      const { n } = dealtPosition(run, i);
      expect(n).toBeGreaterThanOrEqual(before);
      if (c.kind === "gate" && c.retry) expect(n).toBe(before);
      else expect(n).toBe(before + 1);
      before = n;
    });
  });

  it("a gate the note puts after its recap gets its retry before the next pointer, still counted where the track stands (audit CQ-08)", () => {
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
    const run = withRetries(base, ["g1", "g9"]);
    expect(run.map((c) => dealtCount(dealtPosition(run, run.indexOf(c))))).toEqual([
      "1 of 7", // title
      "2 of 7", // idea
      "3 of 7", // gate g1
      "3 of 7 · once more", // retry g1, before the recap
      "4 of 7", // recap
      "5 of 7", // gate g9
      "5 of 7 · once more", // retry g9, before the pointer that follows it
      "6 of 7", // pointer
      "7 of 7", // close
    ]);
  });

  it("clamps an index outside the run, and an empty run is 0 of 0", () => {
    expect(dealtPosition(deck.cards, -4)).toEqual({ n: 1, N, retry: false });
    expect(dealtPosition(deck.cards, N + 10)).toEqual({ n: N, N, retry: false });
    expect(dealtPosition([], 0)).toEqual({ n: 0, N: 0, retry: false });
  });
});
