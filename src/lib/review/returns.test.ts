/**
 * The return printed under Again, Good and Easy in the review inbox is the return the tap stores (the independent review
 * of 27 Sep 2026, item 3). The inbox printed its dates with the default scheduler (retention 0.90, intervals up to 120
 * days) while the tap stored them with the unit's exam mode (tighter retention in the last six weeks, and no interval past
 * the day before the paper), and at the moment of the tap rather than the moment the dates were printed: near a paper the
 * buttons promised weeks the card would never wait.
 */
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB, type ReviewCard } from "@/lib/db/db";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { savePlan } from "@/lib/plan/store";
import { makeScheduler, newCard, review } from "@/lib/srs/scheduler";
import { reviewInboxCard } from "@/lib/session/record";
import { inboxReturns, returnLabel } from "./returns";

const DAY = 86_400_000;

/** A card with a long memory: several good reviews behind it, so its next interval would be weeks by default. */
function strongCard(id: string, at: Date): ReviewCard {
  const s = makeScheduler();
  let c = newCard(new Date(at.getTime() - 200 * DAY));
  let t = new Date(at.getTime() - 200 * DAY);
  for (let i = 0; i < 5; i += 1) {
    c = review(c, "good", t, s).card;
    t = new Date(c.due.getTime());
  }
  c = { ...c, due: new Date(at.getTime() - 60_000) };
  return { id, subject: "maths", topicSlug: "histograms-unequal-widths", card: c, due: c.due, createdAt: new Date(at.getTime() - 200 * DAY) };
}

describe("the return the buttons print", () => {
  beforeEach(async () => {
    const db = getDB();
    await Promise.all(db.tables.map((t) => t.clear()));
    await savePlan(DEFAULT_PLAN);
  });

  it("near a paper keeps to the paper: nothing past the day before it, and the same dates the tap stores", async () => {
    // Ten days before M4 (Friday 14 May 2027 in the default plan): the exam mode caps the next interval at nine days.
    const now = new Date("2027-05-04T19:00:00");
    const card = strongCard("rp.maths.m4.histograms.02", now);
    const printed = inboxReturns(card, DEFAULT_PLAN, "maths", "M4", now);
    const paper = new Date("2027-05-14T00:00:00").getTime();
    for (const g of ["again", "good"] as const) expect(printed[g].getTime(), g).toBeLessThan(paper);
    // The default scheduler the inbox used to print with would have promised Good weeks past the paper.
    const byDefault = review(card.card, "good", now, makeScheduler()).card.due.getTime();
    expect(byDefault).toBeGreaterThan(paper + 7 * DAY);
    expect(printed.good.getTime()).toBeLessThan(byDefault);
    // (Easy is kept one day past Good by ts-fsrs whatever the cap, so at nine days' cap it lands on the paper's own day:
    // an engine matter, reported to the lead. What the inbox owes her is that it prints what will be stored.)

    for (const g of ["again", "good", "easy"] as const) {
      await getDB().cards.clear();
      await getDB().cards.put(card);
      await reviewInboxCard(card.id, g, { subject: "maths", unit: "M4", topicSlug: card.topicSlug }, "prompt", now);
      const stored = await getDB().cards.get(card.id);
      expect(stored?.due.getTime(), `${g}: the day stored is the day printed`).toBe(printed[g].getTime());
    }
  });

  it("far from any paper prints the ordinary schedule, still exactly what is stored", async () => {
    const now = new Date("2026-10-01T19:00:00");
    const card = strongCard("rp.maths.m4.histograms.03", now);
    const printed = inboxReturns(card, DEFAULT_PLAN, "maths", "M4", now);
    await getDB().cards.put(card);
    await reviewInboxCard(card.id, "good", { subject: "maths", unit: "M4", topicSlug: card.topicSlug }, "prompt", now);
    expect((await getDB().cards.get(card.id))?.due.getTime()).toBe(printed.good.getTime());
  });
});

describe("the words for a return, after 'back in'", () => {
  const now = new Date("2026-10-01T19:00:00");
  const at = (ms: number) => new Date(now.getTime() + ms);
  it("says how long, briefly, and reads right after 'back in'", () => {
    expect(returnLabel(at(40_000), now)).toBe("1 min");
    expect(returnLabel(at(10 * 60_000), now)).toBe("10 min");
    expect(returnLabel(at(5 * 3_600_000), now)).toBe("5 h");
    expect(returnLabel(at(DAY), now)).toBe("1 day");
    expect(returnLabel(at(4 * DAY + 3_600_000), now)).toBe("4 days");
    expect(returnLabel(at(20 * DAY), now)).toBe("3 wk");
    expect(returnLabel(at(90 * DAY), now)).toBe("3 mo");
    // The old labels read "back in today" after a grade.
    for (const ms of [40_000, 5 * 3_600_000, DAY, 20 * DAY]) expect(`back in ${returnLabel(at(ms), now)}`).not.toMatch(/back in (today|tomorrow)/);
  });
});
