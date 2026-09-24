import { describe, expect, it } from "vitest";
import type { Attempt } from "@/lib/db/db";
import { computeMastery } from "./engine";

const DAY = 86_400_000;
const t0 = new Date("2026-10-01T18:00:00");

function attempt(daysAfter: number, itemKind: Attempt["itemKind"], correct: boolean, i = 0): Attempt {
  return {
    at: new Date(t0.getTime() + daysAfter * DAY + i * 60_000),
    subject: "maths",
    topicSlug: "histograms",
    itemId: `q${i}`,
    itemKind,
    correct,
    marksAwarded: correct ? 1 : 0,
    marksAvailable: 1,
    confidence: null,
    rating: null,
    misconceptionTags: [],
    timeMs: null,
    answerRaw: null,
  };
}

describe("mastery engine", () => {
  it("is not-started with no attempts and attempted after a poor first set", () => {
    expect(computeMastery({ subject: "maths", topicSlug: "histograms", attempts: [], now: t0 }).level).toBe("not-started");
    const poor = [0, 1, 2, 3, 4].map((i) => attempt(0, "practice", i < 2, i));
    expect(computeMastery({ subject: "maths", topicSlug: "histograms", attempts: poor, now: t0 }).level).toBe("attempted");
  });

  it("does not award Proficient from an immediate post-test alone", () => {
    const good = [0, 1, 2, 3, 4].map((i) => attempt(0, "practice", i < 4, i));
    const sameDayExam = [attempt(0, "exam", true, 9)];
    const m = computeMastery({ subject: "maths", topicSlug: "histograms", attempts: [...good, ...sameDayExam], now: t0 });
    expect(m.level).toBe("familiar");
  });

  it("promotes to Proficient after a later mixed success and to Mastered after three spaced sessions", () => {
    const good = [0, 1, 2, 3, 4].map((i) => attempt(0, "practice", i < 4, i));
    const later = [attempt(3, "exam", true, 10)];
    const prof = computeMastery({ subject: "maths", topicSlug: "histograms", attempts: [...good, ...later], predictedRecall7d: 0.9, now: new Date(t0.getTime() + 4 * DAY) });
    expect(prof.level).toBe("proficient");
    const more = [attempt(9, "prompt", true, 11), attempt(16, "prompt", true, 12)];
    const mastered = computeMastery({
      subject: "maths",
      topicSlug: "histograms",
      attempts: [...good, ...later, ...more],
      predictedRecall7d: 0.92,
      predictedRecallOnPaper: 0.93,
      now: new Date(t0.getTime() + 17 * DAY),
    });
    expect(mastered.level).toBe("mastered");
  });

  it("demotes one level on a recent miss in review", () => {
    const good = [0, 1, 2, 3, 4].map((i) => attempt(0, "practice", i < 4, i));
    const later = [attempt(3, "exam", true, 10), attempt(8, "prompt", false, 11)];
    const m = computeMastery({ subject: "maths", topicSlug: "histograms", attempts: [...good, ...later], predictedRecall7d: 0.9, now: new Date(t0.getTime() + 9 * DAY) });
    expect(m.level).toBe("familiar");
  });
});
