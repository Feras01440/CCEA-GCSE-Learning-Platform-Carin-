import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import type { DiagnosticItem, DiagnosticSet } from "@/lib/content/schema";
import { getDB } from "@/lib/db/db";
import { answeredGateIds, loadFlow, saveFlow, selectCheckItems, type CheckItem } from "./flow";
import { recordAttempt } from "./record";

function dx(id: string): DiagnosticItem {
  return {
    id,
    stem: `Stem ${id}`,
    skill: "Skill",
    options: [
      { id: "a", text: "Right", correct: true, feedback: "Yes." },
      { id: "b", text: "Wrong", correct: false, misconception: "maths.test.wrong", feedback: "No." },
    ],
    secondsExpected: 20,
    confidence: true,
    hypercorrectionQueue: true,
  };
}

/** A set of `n` items with the set-local ids the packs ship ("01", "02", …). */
function set(id: DiagnosticSet["id"], when: DiagnosticSet["when"], n: number): DiagnosticSet {
  return {
    id,
    topic: "maths.m4.histograms",
    specRefs: ["M4-STA-01"],
    when,
    items: Array.from({ length: n }, (_, i) => dx(String(i + 1).padStart(2, "0"))),
  };
}

const ids = (items: CheckItem[]) => items.map((x) => `${x.setId}/${x.item.id}`);

describe("selectCheckItems", () => {
  it("asks pre items first, then both, four at most; the recheck takes post then the both items left over", () => {
    const { check, recheck } = selectCheckItems([set("dx.pre", "pre", 2), set("dx.both", "both", 5), set("dx.post", "post", 1)]);
    expect(ids(check)).toEqual(["dx.pre/01", "dx.pre/02", "dx.both/01", "dx.both/02"]);
    expect(ids(recheck)).toEqual(["dx.post/01", "dx.both/03", "dx.both/04", "dx.both/05"]);
  });

  it("with four or more pre items, every both item waits for the recheck and leftover pre items are dropped", () => {
    const { check, recheck } = selectCheckItems([set("dx.pre", "pre", 6), set("dx.both", "both", 3)]);
    expect(ids(check)).toEqual(["dx.pre/01", "dx.pre/02", "dx.pre/03", "dx.pre/04"]);
    expect(ids(recheck)).toEqual(["dx.both/01", "dx.both/02", "dx.both/03"]);
  });

  it("caps the recheck at four, post items first", () => {
    const { check, recheck } = selectCheckItems([set("dx.post", "post", 5), set("dx.both", "both", 6)]);
    expect(ids(check)).toEqual(["dx.both/01", "dx.both/02", "dx.both/03", "dx.both/04"]);
    expect(ids(recheck)).toEqual(["dx.post/01", "dx.post/02", "dx.post/03", "dx.post/04"]);
  });

  it("keeps authored order across several sets with the same tag, whatever order the tags appear in", () => {
    const { check, recheck } = selectCheckItems([
      set("dx.both-a", "both", 1),
      set("dx.pre-a", "pre", 1),
      set("dx.post-a", "post", 1),
      set("dx.pre-b", "pre", 2),
      set("dx.both-b", "both", 2),
    ]);
    expect(ids(check)).toEqual(["dx.pre-a/01", "dx.pre-b/01", "dx.pre-b/02", "dx.both-a/01"]);
    expect(ids(recheck)).toEqual(["dx.post-a/01", "dx.both-b/01", "dx.both-b/02"]);
  });

  it("a pre-only topic has no recheck, and no sets means no checks", () => {
    expect(selectCheckItems([set("dx.pre", "pre", 8)]).recheck).toEqual([]);
    expect(selectCheckItems([])).toEqual({ check: [], recheck: [] });
  });

  it("honours a different size", () => {
    const { check, recheck } = selectCheckItems([set("dx.pre", "pre", 1), set("dx.both", "both", 4)], 3);
    expect(ids(check)).toEqual(["dx.pre/01", "dx.both/01", "dx.both/02"]);
    expect(ids(recheck)).toEqual(["dx.both/03", "dx.both/04"]);
  });
});

describe("flow rows", () => {
  beforeEach(async () => {
    const db = getDB();
    await Promise.all([db.flow.clear(), db.attempts.clear(), db.cards.clear(), db.mastery.clear(), db.sessions.clear(), db.settings.clear()]);
  });

  it("has no row until something is saved, then creates it with every flag false plus the patch", async () => {
    expect(await loadFlow("maths", "histograms")).toBeUndefined();
    const now = new Date("2026-10-01T19:00:00");
    const row = await saveFlow("maths", "histograms", { checkSkipped: true }, now);
    expect(row).toEqual({ key: "maths:histograms", checkDone: false, checkSkipped: true, postDone: false, updatedAt: now });
    expect(await loadFlow("maths", "histograms")).toEqual(row);
    expect(await loadFlow("science", "histograms")).toBeUndefined();
  });

  it("merges later patches and restamps updatedAt", async () => {
    const t0 = new Date("2026-10-01T19:00:00");
    const t1 = new Date("2026-10-02T19:00:00");
    await saveFlow("maths", "histograms", { checkDone: true }, t0);
    const row = await saveFlow("maths", "histograms", { postDone: true }, t1);
    expect(row).toEqual({ key: "maths:histograms", checkDone: true, checkSkipped: false, postDone: true, updatedAt: t1 });
    expect(await getDB().flow.count()).toBe(1);
  });

  it("keeps the practice-flow positions beside the check flags, each patch leaving the others alone", async () => {
    const t = new Date("2026-10-01T19:00:00");
    await saveFlow("maths", "histograms", { checkDone: true }, t);
    await saveFlow("maths", "histograms", { practiceIndex: 3 }, t);
    await saveFlow("maths", "histograms", { setIndex: 2, examIndex: 1 }, t);
    const row = await loadFlow("maths", "histograms");
    expect(row).toEqual({ key: "maths:histograms", checkDone: true, checkSkipped: false, postDone: false, practiceIndex: 3, setIndex: 2, examIndex: 1, updatedAt: t });
    expect((await saveFlow("maths", "histograms", { practiceIndex: 0, setIndex: 0 }, t)).checkDone).toBe(true);
  });
});

describe("answeredGateIds", () => {
  beforeEach(async () => {
    const db = getDB();
    await Promise.all([db.flow.clear(), db.attempts.clear(), db.cards.clear(), db.mastery.clear(), db.sessions.clear(), db.settings.clear()]);
  });

  it("returns this topic's gate ids once each, in first-answered order, ignoring other items and topics", async () => {
    const topic = { subject: "maths" as const, unit: "M4", topicSlug: "histograms-unequal-widths" };
    const topicId = "maths.m4.histograms-unequal-widths";
    const t = (m: number) => new Date(2026, 9, 1, 19, m);
    await recordAttempt({ item: { ...topic, id: `${topicId}#gate:g2` }, itemKind: "practice", correct: false }, t(0));
    await recordAttempt({ item: { ...topic, id: `${topicId}#gate:g1` }, itemKind: "practice", correct: true }, t(1));
    await recordAttempt({ item: { ...topic, id: `${topicId}#gate:g2` }, itemKind: "practice", correct: true }, t(2));
    await recordAttempt({ item: { ...topic, id: "01" }, itemKind: "diagnostic", correct: true, confidence: 2 }, t(3));
    await recordAttempt({ item: { ...topic, id: `${topicId}#full:1` }, itemKind: "practice", correct: true }, t(4));
    await recordAttempt({ item: { subject: "maths", unit: "M4", topicSlug: "surds", id: "maths.m4.surds#gate:g1" }, itemKind: "practice", correct: true }, t(5));

    expect(await answeredGateIds("maths", "histograms-unequal-widths", topicId)).toEqual(["g2", "g1"]);
    expect(await answeredGateIds("maths", "surds", "maths.m4.surds")).toEqual(["g1"]);
    expect(await answeredGateIds("science", "histograms-unequal-widths", topicId)).toEqual([]);
  });
});
