/**
 * Diagnostic questions shared one review card across topics (the independent review of 27 Sep 2026, item 1). A diagnostic
 * item is recorded by its bare id ("01"), and the card takes the recorded id, so the first topic whose diagnostic "01" she
 * answered owned card "01": every later topic's "01" found that card and made none of its own, and never came back. The
 * shipped content has 1,617 diagnostic items on 52 ids ("01" in 136 topics).
 *
 * The recorder is the fork's (src/lib/session/record.ts, and the topic's CheckSection and PracticeFlow pass the bare id):
 * the patch that names the set at the source goes to the lead. What the review side does, proved here with the real
 * recorder: a bare diagnostic card becomes its own topic's card, "<set id>#<item id>", which frees the bare id, so the next
 * topic's answer makes its own card, and that card becomes its topic's in turn.
 */
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB } from "@/lib/db/db";
import type { ShippedBundle } from "@/lib/content/load";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { savePlan } from "@/lib/plan/store";
import { recordAttempt } from "@/lib/session/record";
import { bareDiagnosticCards, settleWithdrawnCards } from "./withdrawn";

const topicBundle = (topicId: string, setId: string): ShippedBundle =>
  ({
    topic: { id: topicId },
    note: null,
    noteBlocks: null,
    workedExamples: [],
    diagnostics: [{ id: setId, items: [{ id: "01" }, { id: "02" }] }],
    questions: [],
    findTheMistake: [],
    prompts: [],
    insight: null,
    sets: [],
    verification: [],
  }) as unknown as ShippedBundle;

const BUNDLES: Record<string, ShippedBundle> = {
  "maths:bounds-and-accuracy": topicBundle("maths.m4.bounds-and-accuracy", "dx.maths.m4.bounds-and-accuracy"),
  "maths:circle-theorems": topicBundle("maths.m4.circle-theorems", "dx.maths.m4.circle-theorems"),
};
const load = async (c: { subject: string; topicSlug: string }) => BUNDLES[`${c.subject}:${c.topicSlug}`] ?? null;
const answer = (topicSlug: string, id: string, at: Date) =>
  recordAttempt({ item: { id, subject: "maths", unit: "M4", topicSlug }, itemKind: "diagnostic", correct: false, confidence: 1 }, at);

describe("a diagnostic card is its own topic's", () => {
  beforeEach(async () => {
    const db = getDB();
    await Promise.all(db.tables.map((t) => t.clear()));
    await savePlan(DEFAULT_PLAN);
  });

  it("the recorder alone gives two topics' '01' one card (the fault, as build 8 has it)", async () => {
    await answer("bounds-and-accuracy", "01", new Date("2026-10-01T19:00:00"));
    await answer("circle-theorems", "01", new Date("2026-10-01T19:10:00"));
    const cards = await getDB().cards.toArray();
    expect(cards.map((c) => `${c.id}@${c.topicSlug}`)).toEqual(["01@bounds-and-accuracy"]);
  });

  it("with the settle between sittings, each topic's '01' has its own card, and her schedule for the first is kept", async () => {
    await answer("bounds-and-accuracy", "01", new Date("2026-10-01T19:00:00"));
    const first = (await getDB().cards.get("01"))!;
    await settleWithdrawnCards(await bareDiagnosticCards(), load);
    await answer("circle-theorems", "01", new Date("2026-10-02T19:00:00"));
    await settleWithdrawnCards(await bareDiagnosticCards(), load);
    const cards = (await getDB().cards.toArray()).sort((a, b) => a.id.localeCompare(b.id));
    expect(cards.map((c) => `${c.id}@${c.topicSlug}`)).toEqual([
      "dx.maths.m4.bounds-and-accuracy#01@bounds-and-accuracy",
      "dx.maths.m4.circle-theorems#01@circle-theorems",
    ]);
    expect(cards[0].card).toEqual(first.card);
    // Her answers stay as she gave them.
    expect((await getDB().attempts.toArray()).map((a) => `${a.itemId}@${a.topicSlug}`)).toEqual(["01@bounds-and-accuracy", "01@circle-theorems"]);
  });

  it("finds only the cards still under a bare diagnostic id, re-probes included", async () => {
    const db = getDB();
    const at = new Date("2026-10-01T19:00:00");
    const row = (id: string) => ({ id, subject: "maths" as const, topicSlug: "bounds-and-accuracy", card: { due: at } as never, due: at, createdAt: at });
    await db.cards.bulkPut([row("01"), row("p3"), row("hc:02:1"), row("dx.maths.m4.bounds-and-accuracy#01"), row("rp.maths.m4.x.01"), row("fc.maths.m4.x.01"), row("q.maths.m4.x.0001#a"), row("maths.m4.x#gate:g1")]);
    expect((await bareDiagnosticCards()).map((c) => c.id).sort()).toEqual(["01", "hc:02:1", "p3"]);
  });
});
