/**
 * The querier behind useCompanionContext must never write: Dexie throws ReadOnlyError for a write inside
 * a liveQuery, and the hook's catch would turn that into permanent silence (found by the first Playwright
 * run of the companion spec, 19 Sep 2026). This runs the same read inside a real liveQuery.
 */
import "fake-indexeddb/auto";
import { liveQuery } from "dexie";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB, type ReviewCard } from "@/lib/db/db";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { newCard } from "@/lib/srs/scheduler";
import { COMPANION_STATE_ID, getCompanionState } from "./memory";
import { inInboxOrder, readCompanionRows, readCompanionState, titlesForCards, withUnitTopics, type CompanionRows } from "./live";

const DAY_MS = 86_400_000;

function due(id: string, subject: ReviewCard["subject"], topicSlug: string, at: Date): ReviewCard {
  return { id, subject, topicSlug, card: newCard(at), due: at, createdAt: at };
}

const NOW = new Date("2026-09-19T21:00:00");

async function reset() {
  const db = getDB();
  await Promise.all(db.tables.map((t) => t.clear()));
}

function firstValue<T>(observable: { subscribe: (o: { next: (v: T) => void; error: (e: unknown) => void }) => { unsubscribe: () => void } }): Promise<T> {
  return new Promise((resolve, reject) => {
    const sub = observable.subscribe({
      next: (v) => {
        resolve(v);
        queueMicrotask(() => sub.unsubscribe());
      },
      error: reject,
    });
  });
}

describe("companion live read", () => {
  beforeEach(reset);

  it("reads the defaults without seeding a state row", async () => {
    const before = await getDB().companionState.get(COMPANION_STATE_ID);
    expect(before).toBeUndefined();
    const read = await readCompanionState(NOW);
    expect(read.stored).toBe(false);
    expect(read.state.silenced).toBe(false);
    expect(read.state.letterSeen).toBe(false);
    const after = await getDB().companionState.get(COMPANION_STATE_ID);
    expect(after).toBeUndefined();
  });

  it("runs inside a liveQuery without a ReadOnlyError and reports whether the row is stored", async () => {
    const rows = await firstValue<CompanionRows>(liveQuery(() => readCompanionRows(NOW)));
    expect(rows.stateStored).toBe(false);
    expect(rows.state.id).toBe(COMPANION_STATE_ID);
    expect(rows.firstRunDone).toBe(false);
    await getCompanionState(NOW);
    const again = await firstValue<CompanionRows>(liveQuery(() => readCompanionRows(NOW)));
    expect(again.stateStored).toBe(true);
  });

  it("merges a stored row over the defaults", async () => {
    await getDB().companionState.put({ ...(await readCompanionState(NOW)).state, name: "Rowan", silenced: true });
    const read = await readCompanionState(NOW);
    expect(read.stored).toBe(true);
    expect(read.state.silenced).toBe(true);
    expect(read.state.name).toBe("Rowan");
  });

  it("reads a row written before the Letter's first day was kept, as not yet offered", async () => {
    const { letterOfferedOn: _dropped, ...older } = (await readCompanionState(NOW)).state;
    void _dropped;
    await getDB().companionState.put(older as never);
    expect((await readCompanionState(NOW)).state.letterOfferedOn).toBeNull();
  });

  it("says first run is done only once the setting is written", async () => {
    expect((await readCompanionRows(NOW)).firstRunDone).toBe(false);
    await getDB().settings.put({ key: "firstRunDone", value: true });
    expect((await readCompanionRows(NOW)).firstRunDone).toBe(true);
  });
});

describe("the facts live.ts prepares so the lines are true", () => {
  it("puts first the card the review inbox shows first: a sure-and-not-right item before anything overdue", () => {
    const now = new Date("2026-10-01T19:00:00");
    const cards = [
      due("q.maths.m4.perp.0001#a", "maths", "perpendicular-lines", new Date(now.getTime() - 5 * DAY_MS)),
      due("q.science.b1.cells.0001#main", "science", "b1-cells-and-microscopy", new Date(now.getTime() - DAY_MS)),
      due("hc:dx.maths.m4.perp.02:1", "maths", "perpendicular-lines", new Date(now.getTime() - DAY_MS / 2)),
    ];
    const ordered = inInboxOrder(cards, DEFAULT_PLAN, now);
    expect(ordered[0].id).toBe("hc:dx.maths.m4.perp.02:1");
    expect(ordered).toHaveLength(3);
    expect(new Set(ordered.map((c) => c.id))).toEqual(new Set(cards.map((c) => c.id)));
  });

  it("weights by how near each unit's paper is, as the inbox does", () => {
    // 28 April 2027: B1 (11 May) is 13 days off and M4 (14 May) 16, so a science day overdue counts for more.
    const now = new Date("2027-04-28T19:00:00");
    const cards = [
      due("q.maths.m4.perp.0001#a", "maths", "perpendicular-lines", new Date(now.getTime() - 2 * DAY_MS)),
      due("q.science.b1.cells.0001#main", "science", "b1-cells-and-microscopy", new Date(now.getTime() - 1.5 * DAY_MS)),
    ];
    expect(inInboxOrder(cards, DEFAULT_PLAN, now)[0].subject).toBe("science");
  });

  it("names every card's topic by its catalogue title", () => {
    const now = new Date("2026-10-01T19:00:00");
    const titles = titlesForCards([
      due("q.science.b1.cells.0001#main", "science", "b1-cells-and-microscopy", now),
      due("x", "maths", "not-a-topic-anywhere", now),
    ]);
    expect(titles).toEqual({ "b1-cells-and-microscopy": "Cells, microscopy and specialisation" });
  });

  it("gives a filed paper its unit's topics, and keeps any it was given", () => {
    const at = new Date("2026-11-20T18:30:00");
    const m4 = withUnitTopics({ unit: "M4", subject: "maths", at });
    expect(m4.topicSlugs).toContain("perpendicular-lines");
    expect(m4.topicSlugs).not.toContain("b1-cells-and-microscopy");
    expect(withUnitTopics({ unit: "M4", subject: "maths", at, topicSlugs: ["only-this"] }).topicSlugs).toEqual(["only-this"]);
  });
});
