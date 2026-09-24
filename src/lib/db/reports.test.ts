import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB } from "./db";
import { reportsFor, saveReport } from "./reports";

beforeEach(async () => {
  await getDB().reports.clear();
});

describe("a 'Something wrong?' report is kept (engine item 10.4)", () => {
  // The panel promised "The item is re-checked and you see the outcome here" while its handler did nothing.
  it("is stored with the item, the topic, the time and her words", async () => {
    const at = new Date("2026-09-23T21:30:00");
    const id = await saveReport({ itemId: "q.fm.u1.algebraic-fractions-simplify.0010", subject: "further-maths", topicSlug: "algebraic-fractions-simplify", text: "  The answer should be 2(x - 2)/(x + 3)  " }, at);
    expect(id).toBeGreaterThan(0);
    const rows = await reportsFor("q.fm.u1.algebraic-fractions-simplify.0010");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ itemId: "q.fm.u1.algebraic-fractions-simplify.0010", subject: "further-maths", topicSlug: "algebraic-fractions-simplify", text: "The answer should be 2(x - 2)/(x + 3)", at });
  });
  it("keeps every report on an item, oldest first, and none of another item's", async () => {
    await saveReport({ itemId: "a", subject: "maths", topicSlug: "t", text: "first" }, new Date("2026-09-23T21:00:00"));
    await saveReport({ itemId: "b", subject: "maths", topicSlug: "t", text: "other" }, new Date("2026-09-23T21:01:00"));
    await saveReport({ itemId: "a", subject: "maths", topicSlug: "t", text: "second" }, new Date("2026-09-23T21:02:00"));
    expect((await reportsFor("a")).map((r) => r.text)).toEqual(["first", "second"]);
  });
  it("an empty report is not stored", async () => {
    expect(await saveReport({ itemId: "a", subject: "maths", topicSlug: "t", text: "   " })).toBeNull();
    expect(await reportsFor("a")).toEqual([]);
  });
});
