import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB } from "@/lib/db/db";
import { advanceCard, cardIdFor, ensureCard, gradeFromMarks, recordAttempt, reviewInboxCard, touchSession } from "./record";

const item = { id: "rp.maths.m4.histograms.01", subject: "maths" as const, unit: "M4", topicSlug: "histograms-unequal-widths" };

beforeEach(async () => {
  const db = getDB();
  await Promise.all([db.attempts.clear(), db.cards.clear(), db.mastery.clear(), db.sessions.clear(), db.settings.clear()]);
});

describe("session recording", () => {
  it("records an attempt, creates a card on first exposure and updates mastery", async () => {
    const now = new Date("2026-10-01T19:00:00");
    const m = await recordAttempt({ item, itemKind: "prompt", correct: true, confidence: 2 }, now);
    const db = getDB();
    expect(await db.attempts.count()).toBe(1);
    const card = await db.cards.get(item.id);
    expect(card).toBeTruthy();
    expect(card!.due.getTime()).toBeGreaterThan(now.getTime());
    expect(card!.due.getTime() - now.getTime()).toBeLessThanOrEqual(3 * 86_400_000);
    expect(m.key).toBe("maths:histograms-unequal-widths");
    expect(m.level).toBe("attempted");
  });

  it("schedules hypercorrection re-probes for a confident-wrong answer", async () => {
    const now = new Date("2026-10-01T19:00:00");
    await recordAttempt({ item: { ...item, id: "dx.maths.m4.histograms.03" }, itemKind: "diagnostic", correct: false, confidence: 3 }, now);
    const ids = (await getDB().cards.toArray()).map((c) => c.id).sort();
    expect(ids).toEqual(["dx.maths.m4.histograms.03", "hc:dx.maths.m4.histograms.03:1", "hc:dx.maths.m4.histograms.03:2"]);
  });

  it("caps intervals so a review never lands after the paper", async () => {
    const now = new Date("2027-05-20T19:00:00"); // M4 paper is 14 May 2027 (sat) → M4 items park; M8 items cap to 27 May
    const m8 = { ...item, id: "rp.maths.m8.surds.01", unit: "M8", topicSlug: "surds" };
    const card = await ensureCard(m8, "easy", now);
    expect(card.due.getTime()).toBeLessThan(new Date("2027-05-27T00:00:00").getTime());
  });

  it("grades an inbox card and consumes hypercorrection cards after one pass", async () => {
    const now = new Date("2026-10-01T19:00:00");
    await recordAttempt({ item, itemKind: "prompt", correct: false, confidence: 3 }, now);
    const later = new Date(now.getTime() + 2 * 86_400_000 + 60_000);
    await reviewInboxCard(`hc:${item.id}:1`, "good", item, "prompt", later);
    expect(await getDB().cards.get(`hc:${item.id}:1`)).toBeUndefined();
    await reviewInboxCard(item.id, "good", item, "prompt", later);
    const card = await getDB().cards.get(item.id);
    expect(card!.due.getTime()).toBeGreaterThan(later.getTime());
    expect(await getDB().attempts.count()).toBe(3);
  });

  it("records the kind the reviewed item really is, not prompt for everything", async () => {
    const now = new Date("2026-10-01T19:00:00");
    const ftm = { ...item, id: "ftm.maths.m4.histograms.01" };
    await recordAttempt({ item: ftm, itemKind: "mistake", correct: false }, now);
    await reviewInboxCard(ftm.id, "good", ftm, "mistake", new Date(now.getTime() + 3 * 86_400_000));
    const kinds = (await getDB().attempts.toArray()).map((a) => a.itemKind);
    expect(kinds).toEqual(["mistake", "mistake"]);
  });

  it("makes a card for every kind she answers, so the inbox can bring it back", async () => {
    const now = new Date("2026-10-01T19:00:00");
    const ids = [
      "q.maths.m4.histograms.0001#a", // a practice question part
      "q.maths.m4.histograms.0007#b", // an exam-style part
      "ftm.maths.m4.histograms.01", // a find-the-mistake item
      "maths.m4.histograms-unequal-widths#gate:g3", // a check in the note
    ];
    const kinds = ["practice", "exam", "mistake", "practice"] as const;
    for (const [i, id] of ids.entries()) {
      await recordAttempt({ item: { ...item, id }, itemKind: kinds[i], correct: true, marksAwarded: 2, marksAvailable: 2 }, now);
    }
    expect((await getDB().cards.toArray()).map((c) => c.id).sort()).toEqual([...ids].sort());
  });

  it("grades the new card from the marks: part of them comes back sooner than all of them, none sooner still", async () => {
    const now = new Date("2026-10-01T19:00:00");
    const due = async (id: string, correct: boolean, awarded: number) => {
      await recordAttempt({ item: { ...item, id }, itemKind: "practice", correct, marksAwarded: awarded, marksAvailable: 3 }, now);
      return (await getDB().cards.get(id))!.due.getTime();
    };
    const none = await due("q.maths.m4.histograms.0001#a", false, 0);
    const partial = await due("q.maths.m4.histograms.0001#b", false, 1);
    const full = await due("q.maths.m4.histograms.0001#c", true, 3);
    expect(none).toBeLessThan(partial);
    expect(partial).toBeLessThan(full);
    expect(gradeFromMarks(1, 3)).toBe("hard");
    expect(gradeFromMarks(3, 3)).toBe("good");
    expect(gradeFromMarks(0, 3)).toBe("again");
  });

  it("makes no card when nothing was marked", async () => {
    const now = new Date("2026-10-01T19:00:00");
    await recordAttempt({ item: { ...item, id: "q.maths.m4.histograms.0001#a" }, itemKind: "practice", correct: null }, now);
    expect(await getDB().attempts.count()).toBe(1);
    expect(await getDB().cards.count()).toBe(0);
  });

  it("keeps one card per worked example for its twin and its faded steps", async () => {
    const now = new Date("2026-10-01T19:00:00");
    const we = "we.maths.m4.histograms.01";
    for (const [i, id] of [`${we}#full:1`, `${we}#faded1:2`, `${we}#faded2:2`, `${we}#twin:3`].entries()) {
      await recordAttempt({ item: { ...item, id }, itemKind: "practice", correct: true }, new Date(now.getTime() + i * 60_000));
    }
    expect((await getDB().cards.toArray()).map((c) => c.id)).toEqual([`${we}#twin`]);
    expect(await getDB().attempts.count()).toBe(4); // the ledger still holds every step she worked
    expect(cardIdFor(`${we}#faded1:2`)).toBe(`${we}#twin`);
    expect(cardIdFor("q.maths.m4.histograms.0001#a")).toBe("q.maths.m4.histograms.0001#a");
    expect(cardIdFor("maths.m4.histograms-unequal-widths#gate:g3")).toBe("maths.m4.histograms-unequal-widths#gate:g3");
  });

  it("advances a card from the marks without a second attempt row", async () => {
    const now = new Date("2026-10-01T19:00:00");
    const id = "q.maths.m4.histograms.0001#a";
    await recordAttempt({ item: { ...item, id }, itemKind: "practice", correct: false, marksAwarded: 0, marksAvailable: 2 }, now);
    const first = (await getDB().cards.get(id))!.due.getTime();
    const later = new Date(now.getTime() + 3 * 86_400_000);
    await advanceCard(id, gradeFromMarks(2, 2), { subject: item.subject, unit: item.unit, topicSlug: item.topicSlug }, later);
    const after = (await getDB().cards.get(id))!.due.getTime();
    expect(after).toBeGreaterThan(first);
    expect(after).toBeGreaterThan(later.getTime());
    expect(await getDB().attempts.count()).toBe(1);
  });

  it("merges activity within 30 minutes into one session", async () => {
    const t0 = new Date("2026-10-01T19:00:00");
    const a = await touchSession("maths", t0);
    const b = await touchSession("maths", new Date(t0.getTime() + 10 * 60_000));
    const c = await touchSession("science", new Date(t0.getTime() + 2 * 60 * 60_000));
    expect(a).toBe(b);
    expect(c).not.toBe(a);
    expect(await getDB().sessions.count()).toBe(2);
  });
});
