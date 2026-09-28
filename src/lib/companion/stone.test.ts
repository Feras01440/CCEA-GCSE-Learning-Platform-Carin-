/**
 * A stone placed, said with what was proved (the trial audit's COMPANION-6, 25 Sep 2026). The review inbox's close card
 * has no topic of its own, so "{topic}: proved, and one stone on {unit}" could never be filled there, which is where
 * stones are placed, and the moment fell to "I was never the one doing the maths. That was you." The close now names the
 * topics proved in the sitting from the mastery rows themselves, with their units from the taxonomy (live.ts), whatever
 * page it closes; and a stone is information about what just happened, so its line is said at every stone.
 */
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB, type TopicMastery } from "@/lib/db/db";
import { buildCompanionContext, type CompanionInput } from "./context";
import { FIXTURES } from "./fixtures";
import { lintRendered } from "./lint";
import { readCompanionRows } from "./live";
import { select, selectAt } from "./select";

const base = FIXTURES["close-with-stone"];
const startedAt = base.sessionStartedAt!;
const proved = (subject: TopicMastery["subject"], topicSlug: string, minutesIn: number): TopicMastery => ({
  key: `${subject}:${topicSlug}`,
  subject,
  topicSlug,
  level: "proficient",
  score: 0.9,
  lastEvidenceAt: new Date(startedAt + minutesIn * 60_000),
  updatedAt: new Date(startedAt + minutesIn * 60_000),
});

/** The review inbox's close: no topic on the page, the stones from the mastery rows, the units from the taxonomy. */
function reviewClose(patch: Partial<CompanionInput> = {}) {
  const { topic: _page, ...rest } = base;
  void _page;
  return buildCompanionContext({ ...rest, topicUnits: { "maths:frustums-of-cones": "M4" }, ...patch });
}

describe("the close says what was proved, on any page (COMPANION-6)", () => {
  it("names the topic and its unit on a close with no topic of its own", () => {
    const c = reviewClose();
    expect(c.topic).toBeNull();
    expect(c.flags.stonePlaced).toBe(true);
    const s = selectAt("session-close", c);
    expect(s?.line.id).toBe("close.stone");
    expect(s!.text).toBe("Frustums: proved, and one stone on the M4 cairn.");
    expect(select("session-close", { ...c, plainMode: true })!.text).toBe("Frustums: proved, and one stone on M4.");
    expect(lintRendered(s!.line.id, s!.text, s!.values)).toEqual([]);
  });

  it("names every topic proved in the sitting, and says each unit when they are on two", () => {
    const one = reviewClose({
      mastery: [proved("maths", "frustums-of-cones", 1), proved("maths", "bounds-and-accuracy", 3)],
      topicUnits: { "maths:frustums-of-cones": "M4", "maths:bounds-and-accuracy": "M4" },
    });
    expect(selectAt("session-close", one)!.text).toBe("Frustums and bounds: proved, and two stones on the M4 cairn.");
    const two = reviewClose({
      mastery: [proved("maths", "frustums-of-cones", 1), proved("science", "cell-structure", 3)],
      topicUnits: { "maths:frustums-of-cones": "M4", "science:cell-structure": "B1" },
    });
    const s = selectAt("session-close", two);
    expect(s?.line.id).toBe("close.stones");
    expect(s!.text).toBe("Frustums and cell structure: proved, and two stones placed, on M4 and B1.");
  });

  it("counts only the stones placed since the sitting began", () => {
    const c = reviewClose({ mastery: [proved("maths", "frustums-of-cones", 1), proved("maths", "bounds-and-accuracy", -90)], topicUnits: { "maths:frustums-of-cones": "M4", "maths:bounds-and-accuracy": "M4" } });
    expect(selectAt("session-close", c)!.text).toBe("Frustums: proved, and one stone on the M4 cairn.");
  });

  it("says it at every stone: a stone placed yesterday does not silence tonight's", () => {
    const c = reviewClose();
    const yesterday = new Date(c.now.getTime() - 20 * 3_600_000).toISOString();
    const earlier = new Date(c.now.getTime() - 60_000).toISOString();
    expect(selectAt("session-close", { ...c, recentLines: [{ id: "close.stone", at: yesterday }] })?.line.id).toBe("close.stone");
    expect(selectAt("session-close", { ...c, recentLines: [{ id: "close.stone", at: earlier }] })?.line.id).toBe("close.stone");
  });

  it("stays silent about a stone it cannot name, rather than guess a unit", () => {
    const c = reviewClose({ topicUnits: {} });
    expect(c.slots.placedTopics).toBe("frustums");
    expect(c.slots.placedUnit).toBeUndefined();
    expect(["close.stone", "close.stones"]).not.toContain(selectAt("session-close", c)?.line.id);
  });
});

describe("live.ts names the stones' topics and units from the catalogue", () => {
  beforeEach(async () => {
    const db = getDB();
    await Promise.all(db.tables.map((t) => t.clear()));
  });

  it("gives every proved topic its catalogue title and its unit", async () => {
    const now = new Date("2026-10-01T19:00:00");
    await getDB().mastery.bulkPut([
      { key: "further-maths:algebraic-fractions-simplify", subject: "further-maths", topicSlug: "algebraic-fractions-simplify", level: "proficient", score: 0.9, lastEvidenceAt: now, updatedAt: now },
      { key: "maths:not-a-topic-anywhere", subject: "maths", topicSlug: "not-a-topic-anywhere", level: "mastered", score: 1, lastEvidenceAt: now, updatedAt: now },
    ]);
    const rows = await readCompanionRows(now);
    expect(rows.topicUnits["further-maths:algebraic-fractions-simplify"]).toBe("FM1");
    expect(rows.topicTitles["algebraic-fractions-simplify"]).toBe("Simplifying algebraic fractions");
    expect(rows.topicUnits["maths:not-a-topic-anywhere"]).toBeUndefined();
  });
});
