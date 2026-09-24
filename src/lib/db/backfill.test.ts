import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB, type Attempt } from "./db";
import { BACKFILL_FLAG, backfillCards, gradeOfAttempt } from "./backfill";

const DAY = 86_400_000;
const now = new Date("2026-09-19T20:00:00");

function attempt(itemId: string, at: Date, over: Partial<Attempt> = {}): Attempt {
  return {
    at,
    subject: "maths",
    topicSlug: "histograms-unequal-widths",
    itemId,
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

beforeEach(async () => {
  const db = getDB();
  await Promise.all([db.attempts.clear(), db.cards.clear(), db.settings.clear()]);
});

describe("gradeOfAttempt", () => {
  it("reads the marks first, then the verdict, and gives nothing for an unmarked answer", () => {
    expect(gradeOfAttempt({ correct: false, marksAwarded: 2, marksAvailable: 2 })).toBe("good");
    expect(gradeOfAttempt({ correct: false, marksAwarded: 1, marksAvailable: 2 })).toBe("hard");
    expect(gradeOfAttempt({ correct: true, marksAwarded: null, marksAvailable: null })).toBe("good");
    expect(gradeOfAttempt({ correct: false, marksAwarded: 0, marksAvailable: 3 })).toBe("again");
    expect(gradeOfAttempt({ correct: null, marksAwarded: null, marksAvailable: null })).toBeNull();
  });
});

describe("backfillCards", () => {
  it("creates one card per missing card id from her latest answer, dated then, and leaves existing cards alone", async () => {
    const db = getDB();
    const q = "q.maths.m4.histograms.0003#a";
    await db.attempts.bulkAdd([
      attempt(q, new Date(now.getTime() - 5 * DAY), { marksAwarded: 0, marksAvailable: 2 }),
      attempt(q, new Date(now.getTime() - 3 * DAY), { marksAwarded: 1, marksAvailable: 2 }),
      attempt("we.maths.m4.histograms.01#twin:2", new Date(now.getTime() - 2 * DAY), { correct: true }),
      attempt("we.maths.m4.histograms.01#faded1:1", new Date(now.getTime() - 1 * DAY), { correct: false }),
      attempt("maths.m4.histograms#gate:g1", new Date(now.getTime() - 1 * DAY), { correct: null }),
      attempt("rp.maths.m4.histograms.01", new Date(now.getTime() - 4 * DAY), { itemKind: "prompt", correct: true }),
    ]);
    const kept = { id: "rp.maths.m4.histograms.01", subject: "maths" as const, topicSlug: "histograms-unequal-widths", card: { due: new Date(now.getTime() + 30 * DAY) } as never, due: new Date(now.getTime() + 30 * DAY), createdAt: now };
    await db.cards.put(kept);

    const made = await backfillCards(db);
    expect(made).toBe(2);
    const ids = (await db.cards.toArray()).map((c) => c.id).sort();
    expect(ids).toEqual(["we.maths.m4.histograms.01#twin", "rp.maths.m4.histograms.01", q].sort());

    const question = await db.cards.get(q);
    expect(question?.createdAt.getTime()).toBe(now.getTime() - 3 * DAY);
    expect(question!.due.getTime()).toBeLessThanOrEqual(now.getTime());
    // The twin card takes her latest answer to any variant of the example: the faded step, marked again.
    const twin = await db.cards.get("we.maths.m4.histograms.01#twin");
    expect(twin?.createdAt.getTime()).toBe(now.getTime() - 1 * DAY);
    expect((await db.cards.get(kept.id))?.due.getTime()).toBe(kept.due.getTime());
    expect((await db.settings.get(BACKFILL_FLAG))?.value).toBe(true);
  });

  it("runs once: a second call is a no-op even with new attempts", async () => {
    const db = getDB();
    await db.attempts.add(attempt("q.maths.m4.histograms.0001#main", now, { correct: false }));
    expect(await backfillCards(db)).toBe(1);
    await db.attempts.add(attempt("q.maths.m4.histograms.0002#main", now, { correct: false }));
    expect(await backfillCards(db)).toBe(0);
    expect(await db.cards.count()).toBe(1);
  });
});
