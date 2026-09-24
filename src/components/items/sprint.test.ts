import { describe, expect, test } from "vitest";
import { answerCurrent, createSprint, currentId, isFinished, remaining, selfCheck, sprintStats } from "./sprint";

const deck = [
  { id: "a", prompt: "frequency density = ?", answer: "frequency ÷ class width", keyWords: ["frequency", "class width"] },
  { id: "b", prompt: "v = ?", answer: "f λ" },
  { id: "c", prompt: "F = ?", answer: "m a" },
];

describe("sprint queue", () => {
  test("correct answers retire cards in order; a miss recycles to the back", () => {
    let s = createSprint(deck);
    expect(remaining(s)).toBe(3);
    s = answerCurrent(s, true); // a done
    expect(s.done).toEqual(["a"]);
    expect(currentId(s)).toBe("b");
    s = answerCurrent(s, false); // b to the back
    expect(s.queue).toEqual(["c", "b"]);
    expect(remaining(s)).toBe(2);
    s = answerCurrent(s, true); // c done
    s = answerCurrent(s, true); // b done
    expect(isFinished(s)).toBe(true);
    expect(s.misses.b).toBe(1);
    expect(s.attempts.b).toBe(2);
  });

  test("criterion 2 needs two in a row and a miss resets the streak", () => {
    let s = createSprint(deck.slice(0, 1), 2);
    s = answerCurrent(s, true);
    expect(isFinished(s)).toBe(false);
    s = answerCurrent(s, false);
    expect(s.streak.a).toBe(0);
    s = answerCurrent(s, true);
    s = answerCurrent(s, true);
    expect(isFinished(s)).toBe(true);
  });

  test("stats add up", () => {
    let s = createSprint(deck);
    s = answerCurrent(s, false);
    s = answerCurrent(s, true);
    s = answerCurrent(s, true);
    s = answerCurrent(s, true);
    const st = sprintStats(s, 61_234.6);
    expect(st).toMatchObject({ cards: 3, attempts: 4, misses: 1, totalMs: 61_235 });
    expect(st.perCard.find((c) => c.id === "a")).toEqual({ id: "a", attempts: 2, misses: 1 });
  });

  test("answering an empty queue is a no-op", () => {
    const s = createSprint([]);
    expect(answerCurrent(s, true)).toBe(s);
    expect(currentId(s)).toBeNull();
  });
});

describe("selfCheck", () => {
  test("exact match, key words, missing, unknown", () => {
    expect(selfCheck("Frequency ÷ class width", deck[0]).verdict).toBe("match");
    expect(selfCheck("the frequency over the class width", deck[0])).toMatchObject({ verdict: "keywords", suggested: true });
    expect(selfCheck("frequency over the height", deck[0])).toMatchObject({ verdict: "missing", missing: ["class width"], suggested: false });
    expect(selfCheck("", deck[0])).toMatchObject({ verdict: "unknown", suggested: null });
    expect(selfCheck("something", deck[1])).toMatchObject({ verdict: "unknown", suggested: null });
  });
});
