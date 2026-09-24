import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB } from "@/lib/db/db";
import { ensureCard } from "@/lib/session/record";
import { gradeReturnDates, recordRecallGrade, returnWord, type RecallGrade } from "./returns";

const item = { id: "rp.fm.u1.algebraic-fractions-simplify.04", subject: "further-maths" as const, unit: "FM1", topicSlug: "algebraic-fractions-simplify" };
const GRADES: RecallGrade[] = ["again", "good", "easy"];

beforeEach(async () => {
  const db = getDB();
  await Promise.all([db.attempts.clear(), db.cards.clear(), db.mastery.clear(), db.sessions.clear(), db.settings.clear()]);
});

describe("the day under each grade is the day the tap stores (audit CQ-02)", () => {
  it.each(GRADES)("on a first grade, %s stores exactly the date it printed", async (grade) => {
    const now = new Date("2026-10-01T19:00:00");
    const printed = await gradeReturnDates(item.subject, item.unit, item.id, now);
    await recordRecallGrade(item, grade, now);
    const stored = await getDB().cards.get(item.id);
    expect(stored?.due.getTime()).toBe(printed[grade].getTime());
    const attempts = await getDB().attempts.toArray();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({ itemId: item.id, itemKind: "prompt", correct: grade !== "again", rating: grade === "again" ? 1 : grade === "good" ? 3 : 4 });
  });

  it("stores Easy as Easy on a first grade: not the ten minutes a Good gets", async () => {
    const now = new Date("2026-10-01T19:00:00");
    const printed = await gradeReturnDates(item.subject, item.unit, item.id, now);
    await recordRecallGrade(item, "easy", now);
    const stored = (await getDB().cards.get(item.id))!;
    expect(stored.due.getTime() - now.getTime()).toBeGreaterThan(86_400_000);
    expect(stored.due.getTime()).not.toBe(printed.good.getTime());
  });

  it.each(GRADES)("on a later pass, %s moves the card she already has to the date it printed", async (grade) => {
    const first = new Date("2026-10-01T19:00:00");
    await ensureCard(item, "good", first);
    const later = new Date("2026-10-03T20:15:00");
    const printed = await gradeReturnDates(item.subject, item.unit, item.id, later);
    await recordRecallGrade(item, grade, later);
    const stored = (await getDB().cards.get(item.id))!;
    expect(stored.due.getTime()).toBe(printed[grade].getTime());
    expect(stored.card.reps).toBe(2);
    expect(await getDB().attempts.count()).toBe(1);
  });

  it("prints three different returns for a new card, so the choice means something", async () => {
    const now = new Date("2026-10-01T19:00:00");
    const printed = await gradeReturnDates(item.subject, item.unit, item.id, now);
    const words = GRADES.map((g) => returnWord(printed[g], now));
    expect(new Set(words).size).toBe(3);
    expect(words[0]).toBe("in a minute");
    expect(words[1]).toBe("in 10 minutes");
  });
});

describe("returnWord: when a card comes back, said briefly", () => {
  const now = new Date("2026-09-24T21:00:00"); // a Thursday evening
  const at = (ms: number) => new Date(now.getTime() + ms);
  const H = 3_600_000;
  const D = 86_400_000;
  it.each([
    [at(60_000), "in a minute"],
    [at(10 * 60_000), "in 10 minutes"],
    [at(59 * 60_000), "in 59 minutes"],
    [at(2 * H), "later today"],
    [at(D), "tomorrow"],
    [at(3 * D), "Sunday"],
    [at(6 * D), "Wednesday"],
    [at(7 * D), "in a week"],
    [at(10 * D), "in a week"],
    [at(17 * D), "in 2 weeks"],
    [at(59 * D), "in 8 weeks"],
    [at(80 * D), "on 13 December"],
  ])("%s → %s", (due, word) => {
    expect(returnWord(due as Date, now)).toBe(word);
  });

  it("says minutes across midnight rather than 'tomorrow' for a card ten minutes away", () => {
    const late = new Date("2026-09-24T23:55:00");
    expect(returnWord(new Date(late.getTime() + 10 * 60_000), late)).toBe("in 10 minutes");
  });
});
