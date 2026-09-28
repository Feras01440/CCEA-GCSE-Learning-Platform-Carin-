/**
 * A diagnostic answered in the review inbox (found walking the real inbox on build 9's source, 27 Sep 2026). Reveal
 * graded the card and moved on at once, so the reveal was never on screen, and what it promised was not kept: the attempt
 * was written with no confidence and no misconception, a certain miss set neither of the two re-probes the reveal promises
 * ("comes back in two days and again in a week"), and a lucky guess was graded as a sure answer although the reveal says
 * it "comes back soon". The inbox now records a diagnostic as the topic page does (src/lib/session/record.ts
 * recordAttempt) and moves its card by what her confidence says; the reveal stays on screen until Next (ReviewInbox).
 */
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB } from "@/lib/db/db";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { savePlan } from "@/lib/plan/store";
import { answerDiagnosticCard, diagnosticGrade } from "./diagnostic";

const ID = "dx.maths.m4.bounds-and-accuracy#03";
const ITEM = { id: ID, subject: "maths" as const, unit: "M4", topicSlug: "bounds-and-accuracy" };
const SHOWN = new Date("2026-10-06T19:00:00");
const DAY = 86_400_000;

/** A card she has answered twice before, due now, four days after its last review. */
async function seedCard(id = ID, due = SHOWN): Promise<void> {
  const last = new Date(SHOWN.getTime() - 4 * DAY);
  await getDB().cards.put({
    id,
    subject: "maths",
    topicSlug: "bounds-and-accuracy",
    card: { due, stability: 4, difficulty: 5, elapsed_days: 4, scheduled_days: 4, learning_steps: 0, reps: 2, lapses: 0, state: 2, last_review: last },
    due,
    createdAt: last,
  });
}

const certainMiss = { optionId: "b", correct: false, confidence: 3 as const, ms: 4200, misconception: "bounds.truncates-instead-of-half-unit" };

describe("a diagnostic answered in the review inbox", () => {
  beforeEach(async () => {
    const db = getDB();
    await Promise.all(db.tables.map((t) => t.clear()));
    await savePlan(DEFAULT_PLAN);
  });

  it("is graded by what she was sure of: a lucky guess is not a sure answer", () => {
    expect(diagnosticGrade(false, 1)).toBe("again");
    expect(diagnosticGrade(false, 3)).toBe("again");
    expect(diagnosticGrade(true, 1)).toBe("hard");
    expect(diagnosticGrade(true, 2)).toBe("good");
    expect(diagnosticGrade(true, 3)).toBe("easy");
  });

  it("is recorded once, with her confidence, her option and the misconception it carries", async () => {
    await seedCard();
    await answerDiagnosticCard(ID, ITEM, certainMiss, SHOWN);
    const attempts = await getDB().attempts.toArray();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      itemId: ID,
      itemKind: "diagnostic",
      correct: false,
      confidence: 3,
      misconceptionTags: ["bounds.truncates-instead-of-half-unit"],
      timeMs: 4200,
      answerRaw: "b",
    });
    expect(attempts[0].at.getTime()).toBe(SHOWN.getTime());
  });

  it("a certain miss comes back in two days and again in a week, as the reveal says, and the card itself lapses", async () => {
    await seedCard();
    await answerDiagnosticCard(ID, ITEM, certainMiss, SHOWN);
    const cards = await getDB().cards.toArray();
    const due = Object.fromEntries(cards.map((c) => [c.id, c.due.getTime()]));
    expect(due[`hc:${ID}:1`]).toBe(SHOWN.getTime() + 2 * DAY);
    expect(due[`hc:${ID}:2`]).toBe(SHOWN.getTime() + 7 * DAY);
    const card = cards.find((c) => c.id === ID)!;
    expect(card.card.lapses).toBe(1);
    expect(card.card.reps).toBe(3);
  });

  it("a lucky guess comes back sooner than the same answer given fairly sure", async () => {
    await seedCard();
    await answerDiagnosticCard(ID, ITEM, { optionId: "a", correct: true, confidence: 1, ms: 3000 }, SHOWN);
    const guessed = (await getDB().cards.get(ID))!.due.getTime();
    const guessAttempt = (await getDB().attempts.toArray())[0];
    expect(guessAttempt.confidence).toBe(1);

    await Promise.all(getDB().tables.map((t) => t.clear()));
    await savePlan(DEFAULT_PLAN);
    await seedCard();
    await answerDiagnosticCard(ID, ITEM, { optionId: "a", correct: true, confidence: 2, ms: 3000 }, SHOWN);
    const sure = (await getDB().cards.get(ID))!.due.getTime();

    expect(guessed).toBeGreaterThan(SHOWN.getTime());
    expect(guessed).toBeLessThan(sure);
  });

  it("a re-probe answered certain and wrong is spent, and the two fresh re-probes it earns survive it", async () => {
    const later = new Date(SHOWN.getTime() + 20 * DAY);
    await seedCard(ID, later);
    await seedCard(`hc:${ID}:1`);
    await answerDiagnosticCard(`hc:${ID}:1`, ITEM, certainMiss, SHOWN);
    const cards = await getDB().cards.toArray();
    const due = Object.fromEntries(cards.map((c) => [c.id, c.due.getTime()]));
    expect(due[`hc:${ID}:1`]).toBe(SHOWN.getTime() + 2 * DAY);
    expect(due[`hc:${ID}:2`]).toBe(SHOWN.getTime() + 7 * DAY);
    // The card's own schedule is not moved by a re-probe's pass.
    expect(due[ID]).toBe(later.getTime());
    expect(await getDB().attempts.count()).toBe(1);
  });
});
