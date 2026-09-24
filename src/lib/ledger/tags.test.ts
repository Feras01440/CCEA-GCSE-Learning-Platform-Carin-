import { describe, expect, test } from "vitest";
import type { Attempt, Mock } from "@/lib/db/db";
import { lossesFromAttempts, lossesFromMocks, summariseLedger } from "./tags";

/** One attempt row as `recordAttempt` writes it; minutes after 22:51 on the audit's night (22 Sep 2026). */
const at = (minute: number) => new Date(2026, 8, 22, 22, 51 + minute);
function attempt(minute: number, over: Partial<Attempt>): Attempt {
  return {
    at: at(minute),
    subject: "further-maths",
    topicSlug: "algebraic-fractions-simplify",
    itemId: "x",
    itemKind: "practice",
    correct: false,
    marksAwarded: null,
    marksAvailable: null,
    confidence: null,
    rating: null,
    misconceptionTags: [],
    timeMs: null,
    answerRaw: null,
    ...over,
  };
}

/**
 * The platform audit's night (docs/plan/review/2026-09-22-platform-audit.md, must-fix 5 and §6.9): the FM1 lesson's
 * gates, a worked example's lines and why-menu, a practice part wrong (0 of 2) and right on retry (2 of 2), an
 * exam-style part wrong (0 of 4), a find-the-mistake, a prompt, the Check-yourself diagnostic, and a B1 labelling
 * question in review. The old ledger said "13 marks lost · Method 13".
 */
const night: Attempt[] = [
  attempt(0, { itemId: "fm.u1.algebraic-fractions-simplify#gate:g1", correct: false }),
  attempt(1, { itemId: "fm.u1.algebraic-fractions-simplify#gate:g2", correct: true }),
  attempt(2, { itemId: "fm.u1.algebraic-fractions-simplify#gate:g3", correct: false }),
  attempt(6, { itemId: "we.fm.u1.algebraic-fractions-simplify.01#line:2", correct: false }),
  attempt(7, { itemId: "we.fm.u1.algebraic-fractions-simplify.01#line:3", correct: false }),
  attempt(8, { itemId: "we.fm.u1.algebraic-fractions-simplify.01#why:2", correct: false }),
  attempt(12, { itemId: "q.fm.u1.algebraic-fractions-simplify.0001#main", marksAwarded: 0, marksAvailable: 2, answerRaw: "5/(x+4)" }),
  attempt(14, { itemId: "q.fm.u1.algebraic-fractions-simplify.0001#main", correct: true, marksAwarded: 2, marksAvailable: 2 }),
  attempt(20, { itemId: "q.fm.u1.algebraic-fractions-simplify.0010#main", itemKind: "exam", marksAwarded: 0, marksAvailable: 4 }),
  attempt(26, { itemId: "ftm.fm.u1.algebraic-fractions-simplify.01", itemKind: "mistake", correct: false, misconceptionTags: ["fm.algebra.cancel-terms"] }),
  attempt(30, { itemId: "rp.fm.u1.algebraic-fractions-simplify.01", itemKind: "prompt", correct: true }),
  attempt(33, { itemId: "dx.fm.u1.algebraic-fractions-simplify.01", itemKind: "diagnostic", correct: false }),
  attempt(49, { subject: "science", topicSlug: "b1-cells-and-microscopy", itemId: "q.science.b1.b1-cells-and-microscopy.0004#main", correct: false }),
];

describe("the ledger counts marks, not misses (engine item 8, audit must-fix 5)", () => {
  test("the audit's night: 4 marks lost on the exam-style part, and 2 dropped and won back on the practice retry, 6 in all", () => {
    const s = summariseLedger(night);
    // The best attempt per part per sitting stands, so the practice part she got right on retry has lost nothing;
    // the 2 marks it dropped on the first go are counted as won back, not lost. 4 + 2 is the night's 6.
    expect(s.totalLost).toBe(4);
    expect(s.recovered).toBe(2);
    expect(s.totalLost + s.recovered).toBe(6);
    expect(s.byPlace).toEqual([{ subject: "further-maths", where: "algebraic-fractions-simplify", marks: 4, source: "practice" }]);
    // Nothing tagged a reason, so nothing is filed as the examiner's "Method".
    expect(s.byTag).toEqual([{ tag: "untagged", marks: 4, share: 1 }]);
  });

  test("gates, worked-example lines, why-menus, find-the-mistake, prompts and diagnostics carry no tariff and count nothing", () => {
    const untariffed = night.filter((a) => a.marksAvailable === null);
    expect(lossesFromAttempts(untariffed)).toEqual([]);
  });

  test("a retried part counts once, by its best attempt in the sitting", () => {
    const tries = [0, 1, 2].map((m, i) => attempt(i * 3, { itemId: "q.a#main", marksAwarded: m, marksAvailable: 3 }));
    const rows = lossesFromAttempts(tries);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ marks: 1, recovered: 2 });
    // Worse on the second go: the better first attempt still stands.
    const worse = [attempt(0, { itemId: "q.a#main", marksAwarded: 2, marksAvailable: 3 }), attempt(4, { itemId: "q.a#main", marksAwarded: 0, marksAvailable: 3 })];
    expect(lossesFromAttempts(worse)).toMatchObject([{ marks: 1, recovered: 0 }]);
  });

  test("the same part on another night is another sitting, and counts again", () => {
    const twoNights = [
      attempt(0, { itemId: "q.a#main", marksAwarded: 0, marksAvailable: 2 }),
      { ...attempt(0, { itemId: "q.a#main", marksAwarded: 1, marksAvailable: 2 }), at: new Date(2026, 8, 23, 21, 0) },
    ];
    expect(lossesFromAttempts(twoNights).map((r) => r.marks)).toEqual([2, 1]);
  });

  test("an attempt marked correct never counts as a loss", () => {
    expect(lossesFromAttempts([attempt(0, { itemId: "q.b#main", correct: true, marksAwarded: 1, marksAvailable: 2 })])).toEqual([]);
  });

  test("a loss keeps a reason only when one was recorded; otherwise it is untagged, never the examiner's Method", () => {
    const tagged = attempt(0, { itemId: "q.c#main", marksAwarded: 1, marksAvailable: 2, misconceptionTags: ["accuracy"] });
    const misconception = attempt(1, { itemId: "q.d#main", marksAwarded: 0, marksAvailable: 1, misconceptionTags: ["maths.quadratics.sign-slip"] });
    expect(lossesFromAttempts([tagged, misconception]).map((r) => r.tag)).toEqual(["accuracy", "untagged"]);
  });
});

describe("official papers", () => {
  const mock = (marks: Mock["marks"]): Mock =>
    ({ at: at(0), paperId: "p", subject: "maths", unit: "M4", engineUnit: "M4", sessionKey: "2025-Summer", tier: "H", paperNumber: null, discipline: null, booklet: null, minutesUsed: 60, paused: 0, pausedMinutes: 0, marks, raw: 0, rawMax: 0, ums: 0, grade: "a", series: "summer-2025", estimated: false }) as Mock;
  test("a question's untagged lost marks are untagged, and tags never count more marks than were lost", () => {
    const rows = lossesFromMocks([mock([{ q: "1", available: 3, awarded: 0, tags: ["accuracy"] } as never, { q: "2", available: 2, awarded: 1, tags: ["misread", "presentation"] } as never])]);
    expect(rows.map((r) => [r.tag, r.marks])).toEqual([
      ["accuracy", 1],
      ["untagged", 2],
      ["misread", 1],
    ]);
  });
});
