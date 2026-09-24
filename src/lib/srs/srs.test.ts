import { describe, expect, it } from "vitest";
import type { ReviewCard } from "@/lib/db/db";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { examModeFor, paperForItem } from "./exam-mode";
import { hypercorrectionCards, isConfidentWrong, sourceItemId } from "./hypercorrection";
import { interleaveByTopic, pickQueue } from "./queue";
import { newCard, retentionForExam, review } from "./scheduler";

function card(id: string, topicSlug: string, dueDaysAgo: number, now: Date): ReviewCard {
  const due = new Date(now.getTime() - dueDaysAgo * 86_400_000);
  return { id, subject: "maths", topicSlug, card: { ...newCard(now), due }, due, createdAt: now };
}

describe("scheduler", () => {
  it("tightens retention as the paper approaches", () => {
    const paper = new Date("2027-05-14T00:00:00");
    expect(retentionForExam(paper, new Date("2026-12-01"))).toBe(0.9);
    expect(retentionForExam(paper, new Date("2027-04-10"))).toBe(0.93);
    expect(retentionForExam(paper, new Date("2027-05-05"))).toBe(0.95);
  });

  it("schedules a first Good review within a few days and grows on later reviews", () => {
    const now = new Date("2026-09-15T18:00:00");
    const first = review(newCard(now), "good", now);
    const gap1 = (first.card.due.getTime() - now.getTime()) / 86_400_000;
    expect(gap1).toBeLessThanOrEqual(3);
    const later = new Date(first.card.due.getTime() + 60_000);
    const second = review(first.card, "good", later);
    expect(second.card.due.getTime()).toBeGreaterThan(first.card.due.getTime());
  });
});

describe("exam mode", () => {
  it("schedules M4 and M8 items to the right papers and parks sat units", () => {
    const today = "2026-10-01";
    expect(paperForItem(DEFAULT_PLAN, "maths", "M4", today)?.date).toBe("2027-05-14");
    expect(paperForItem(DEFAULT_PLAN, "maths", "M8", today)?.date).toBe("2027-05-27");
    const m = examModeFor(DEFAULT_PLAN, "maths", "M8", "2027-05-20");
    expect(m.desiredRetention).toBe(0.95);
    expect(m.maximumIntervalDays).toBe(6);
    const parked = examModeFor(DEFAULT_PLAN, "maths", "M8", "2027-06-01");
    expect(parked.parked).toBe(true);
  });
});

describe("queue", () => {
  it("caps, prefers re-probes and overdue cards, and interleaves topics", () => {
    const now = new Date("2026-10-01T19:00:00");
    const cards = [
      card("a1", "histograms", 3, now),
      card("a2", "histograms", 2, now),
      card("b1", "bounds", 0.5, now),
      card("c1", "surds", 0.2, now),
      card("hc:x:1", "surds", 0, now),
      card("future", "surds", -2, now),
    ];
    const q = pickQueue(cards, now, { cap: 4 });
    expect(q.map((c) => c.id)).toEqual(["hc:x:1", "a1", "b1", "a2"]);
    expect(q.find((c) => c.id === "future")).toBeUndefined();
  });

  it("interleaves greedily", () => {
    const now = new Date();
    const out = interleaveByTopic([card("1", "t", 0, now), card("2", "t", 0, now), card("3", "u", 0, now)]);
    expect(out.map((c) => c.topicSlug)).toEqual(["t", "u", "t"]);
  });
});

describe("hypercorrection", () => {
  it("creates +2 and +7 day re-probes for confident-wrong answers", () => {
    expect(isConfidentWrong(false, 3)).toBe(true);
    expect(isConfidentWrong(false, 1)).toBe(false);
    expect(isConfidentWrong(true, 3)).toBe(false);
    const now = new Date("2026-10-01T19:00:00");
    const hc = hypercorrectionCards({ id: "maths:histograms:p03", subject: "maths", topicSlug: "histograms" }, now);
    expect(hc.map((c) => Math.round((c.due.getTime() - now.getTime()) / 86_400_000))).toEqual([2, 7]);
    expect(sourceItemId(hc[0].id)).toBe("maths:histograms:p03");
  });
});
