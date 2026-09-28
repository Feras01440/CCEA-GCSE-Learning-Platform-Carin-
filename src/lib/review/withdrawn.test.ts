/**
 * Review cards for items a later pass withdrew (the withdraw-and-replace record, commit 756fc25: `verification[*].withdrawn`
 * = [{ id, kind, replacedBy, reason, on }]). A card that points at a withdrawn item is moved to its replacement, keeping
 * her schedule for the skill, or retired when nothing replaces it; her attempts are never touched. Before this the inbox
 * showed "withdrawn while it is checked" with Skip, and the card stayed due for ever (the trial topic carries 18 records).
 */
import "fake-indexeddb/auto";
import { existsSync, readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB, type Attempt, type ReviewCard } from "@/lib/db/db";
import type { ShippedBundle } from "@/lib/content/load";
import { newCard, review } from "@/lib/srs/scheduler";
import { resolveCardId, settleWithdrawnCards, withdrawnRecords, type WithdrawnRecord } from "./withdrawn";

const T = "fm.u1.x";
const ON = "2026-09-25T04:20:00Z";
const rec = (id: string, kind: WithdrawnRecord["kind"], replacedBy: string | null): WithdrawnRecord => ({ id, kind, replacedBy, reason: "Withdrawn for the test.", on: ON });
const gate = (id: string) => ({ type: "gate", id, kind: "choice", prompt: "Which?", options: ["A", "B"], answer: "A", explain: "Because." });
const part = (id: string) => ({ id, marks: 2 });
const log = (id: string, itemId: string, withdrawn: WithdrawnRecord[] = [], status = "verified") => ({ id, itemId, version: 1, checks: [], status, reports: [], withdrawn });

/** A published bundle as the build ships it: withdrawn gates gone from the note, withdrawn prompts and sets dropped. */
function bundle(extra: Partial<Record<keyof ShippedBundle, unknown>> = {}): ShippedBundle {
  return {
    topic: { id: T },
    note: { id: `note.${T}`, verification: `ver.note.${T}` },
    noteBlocks: [{ type: "h", text: "Idea" }, gate("g2"), gate("g4"), gate("g12"), gate("g9")],
    workedExamples: [{ id: "we.x.01" }, { id: "we.x.03" }],
    diagnostics: [{ id: "dx.x", items: [{ id: "04" }, { id: "07" }, { id: "09" }] }],
    questions: [
      { id: "q.x.0002", parts: [part("main")] },
      { id: "q.x.0012", parts: [part("main")] },
      { id: "q.x.0013", parts: [part("a"), part("b")] },
    ],
    findTheMistake: [{ id: "ftm.x.02" }],
    prompts: [{ id: "rp.x.02" }, { id: "rp.x.08" }, { id: "rp.x.09" }],
    insight: null,
    sets: [],
    verification: [
      log(`ver.note.${T}`, `note.${T}`, [rec("g1", "gate", "g12"), rec("g3", "gate", "g5"), rec("g5", "gate", "g9"), rec("g6", "gate", "g7"), rec("g7", "gate", "g6"), rec("g8", "gate", "g99")]),
      log("ver.dx.x", "dx.x", [rec("dx.x#01", "diagnostic", "dx.x#07")]),
      log("ver.dx.x.withdrawn", "dx.x.withdrawn", [rec("dx.x.withdrawn#02", "diagnostic", "dx.x#09")], "withdrawn"),
      log("ver.rp.x.01", "rp.x.01", [rec("rp.x.01", "prompt", "rp.x.09")], "withdrawn"),
      log("ver.rp.x.03", "rp.x.03", [rec("rp.x.03", "prompt", null)], "withdrawn"),
      log("ver.rp.x.04", "rp.x.04", [rec("rp.x.04", "prompt", "rp.x.08")], "withdrawn"),
      log("ver.rp.x.05", "rp.x.05", [rec("rp.x.05", "prompt", "rp.x.08")], "withdrawn"),
      log("ver.q.x.0001", "q.x.0001", [rec("q.x.0001", "question", "q.x.0012")], "withdrawn"),
      log("ver.q.x.0003", "q.x.0003", [rec("q.x.0003", "question", "q.x.0013")], "withdrawn"),
      log("ver.we.x.02", "we.x.02", [rec("we.x.02", "workedExample", "we.x.03")], "withdrawn"),
      log("ver.ftm.x.01", "ftm.x.01", [rec("ftm.x.01", "findTheMistake", "ftm.x.02")], "withdrawn"),
    ],
    ...extra,
  } as unknown as ShippedBundle;
}

describe("the records, read from any verification log", () => {
  it("finds every record in the one shape", () => {
    const all = withdrawnRecords(bundle());
    expect(all).toHaveLength(16);
    expect(all.map((r) => r.id)).toContain("dx.x.withdrawn#02");
    expect(withdrawnRecords({ verification: [{ id: "v", itemId: "x", version: 1, checks: [], status: "verified", reports: [] }] } as unknown as ShippedBundle)).toEqual([]);
  });
});

describe("where a card now points", () => {
  const b = bundle();
  it("a withdrawn gate: to its replacement in the note, following a chain of withdrawals", () => {
    expect(resolveCardId(`${T}#gate:g1`, b)).toMatchObject({ kind: "replaced", to: `${T}#gate:g12` });
    expect(resolveCardId(`${T}#gate:g3`, b)).toMatchObject({ kind: "replaced", to: `${T}#gate:g9` });
  });

  it("a gate still in the note is current; one neither in the note nor recorded is left alone", () => {
    expect(resolveCardId(`${T}#gate:g4`, b)).toEqual({ kind: "current" });
    expect(resolveCardId(`${T}#gate:g50`, b)).toEqual({ kind: "unknown" });
  });

  it("never judges a gate against a bundle that carries no note blocks", () => {
    expect(resolveCardId(`${T}#gate:g1`, bundle({ noteBlocks: null }))).toEqual({ kind: "unknown" });
  });

  it("a prompt: to its replacement, or retired when nothing replaces it; the record wins over a copy still shipped", () => {
    expect(resolveCardId("rp.x.01", b)).toMatchObject({ kind: "replaced", to: "rp.x.09" });
    expect(resolveCardId("rp.x.03", b)).toMatchObject({ kind: "retired", record: { id: "rp.x.03" } });
    expect(resolveCardId("rp.x.02", b)).toEqual({ kind: "current" });
    const kept = bundle({ prompts: [{ id: "rp.x.01" }, { id: "rp.x.09" }] });
    expect(resolveCardId("rp.x.01", kept)).toMatchObject({ kind: "replaced", to: "rp.x.09" });
  });

  it("a diagnostic, recorded by its bare item id: through its set's record, or the kept copy's, to its set's own form", () => {
    expect(resolveCardId("01", b)).toMatchObject({ kind: "replaced", to: "dx.x#07" });
    expect(resolveCardId("02", b)).toMatchObject({ kind: "replaced", to: "dx.x#09" });
    expect(resolveCardId("dx.x#01", b)).toMatchObject({ kind: "replaced", to: "dx.x#07" });
    expect(resolveCardId("dx.x#04", b)).toEqual({ kind: "current" });
  });

  it("a diagnostic still shipped under its bare id becomes its topic's own card: '<set id>#<item id>'", () => {
    // The independent review (27 Sep): 1,617 diagnostic items use 52 ids ("01" in 136 topics), and the card id was the bare
    // item id, so one card served every topic's "01" and most topics' diagnostics never came back.
    expect(resolveCardId("04", b)).toEqual({ kind: "renamed", to: "dx.x#04" });
    expect(resolveCardId("09", b)).toEqual({ kind: "renamed", to: "dx.x#09" });
    // Two sets sharing an id (a topic's "pre" and "post" checks): the first set, the one she meets first.
    const two = bundle({ diagnostics: [{ id: "dx.x.pre", items: [{ id: "01" }] }, { id: "dx.x.post", items: [{ id: "01" }] }], verification: [] });
    expect(resolveCardId("01", two)).toEqual({ kind: "renamed", to: "dx.x.pre#01" });
    expect(resolveCardId("dx.x.post#01", two)).toEqual({ kind: "current" });
  });

  it("a question part: to the same part of its replacement, or its first part", () => {
    expect(resolveCardId("q.x.0001#main", b)).toMatchObject({ kind: "replaced", to: "q.x.0012#main" });
    expect(resolveCardId("q.x.0003#main", b)).toMatchObject({ kind: "replaced", to: "q.x.0013#a" });
    expect(resolveCardId("q.x.0002#main", b)).toEqual({ kind: "current" });
  });

  it("a worked example's twin and a find-the-mistake item", () => {
    expect(resolveCardId("we.x.02#twin", b)).toMatchObject({ kind: "replaced", to: "we.x.03#twin" });
    expect(resolveCardId("ftm.x.01", b)).toMatchObject({ kind: "replaced", to: "ftm.x.02" });
  });

  it("a replacement that is itself not in the bundle, or a loop, retires the card rather than leave it dangling", () => {
    expect(resolveCardId(`${T}#gate:g8`, b)).toMatchObject({ kind: "retired" });
    expect(resolveCardId(`${T}#gate:g6`, b)).toMatchObject({ kind: "retired" });
  });

  it("never takes a flashcard for a withdrawn item: a deck card is no bundle item, and no record names it", () => {
    // The independent review (27 Sep) feared the settle would retire the 1,342 flashcard-only cards; it leaves them.
    expect(resolveCardId("fc.further-maths.fm1.algebraic-fractions-simplify.01", b)).toEqual({ kind: "unknown" });
    expect(resolveCardId("fc.science.b1-food-tests.auto-01", b)).toEqual({ kind: "unknown" });
  });
});

/** A card with a real FSRS history: reviewed once, so its schedule is worth keeping. */
function card(id: string, dueInDays = -1): ReviewCard {
  const at = new Date("2026-09-24T19:00:00");
  const { card: c } = review(newCard(at), "good", at);
  const due = new Date(Date.now() + dueInDays * 86_400_000);
  return { id, subject: "further-maths", topicSlug: "x", card: { ...c, due }, due, createdAt: at };
}
function attempt(itemId: string): Attempt {
  return { at: new Date("2026-09-24T19:05:00"), subject: "further-maths", topicSlug: "x", itemId, itemKind: "practice", correct: false, marksAwarded: null, marksAvailable: null, confidence: 3, rating: null, misconceptionTags: ["m"], timeMs: 4000, answerRaw: "B" };
}

describe("settling the cards on the device", () => {
  beforeEach(async () => {
    const db = getDB();
    await Promise.all(db.tables.map((t) => t.clear()));
  });

  const load = async () => bundle();

  it("moves each card to its replacement with her schedule, retires what has none, and never touches an attempt", async () => {
    const db = getDB();
    const seeded = [
      card(`${T}#gate:g1`),
      card(`hc:${T}#gate:g1:1`, 1),
      card("rp.x.01"),
      card("rp.x.03"),
      card("01"),
      card("q.x.0001#main", 3),
      card("we.x.02#twin"),
      card(`${T}#gate:g4`),
      card("somewhere-else"),
    ];
    await db.cards.bulkPut(seeded);
    await db.attempts.bulkAdd([attempt(`${T}#gate:g1`), attempt("rp.x.03"), attempt("01")]);
    const attemptsBefore = await db.attempts.toArray();

    const report = await settleWithdrawnCards(await db.cards.toArray(), load);

    const ids = (await db.cards.toArray()).map((c) => c.id).sort();
    expect(ids).toEqual([`${T}#gate:g12`, `hc:${T}#gate:g12:1`, "rp.x.09", "dx.x#07", "q.x.0012#main", "we.x.03#twin", `${T}#gate:g4`, "somewhere-else"].sort());
    const moved = await db.cards.get(`${T}#gate:g12`);
    const was = seeded[0];
    expect(moved?.card).toEqual(was.card);
    expect(moved?.due).toEqual(was.due);
    expect(moved?.createdAt).toEqual(was.createdAt);
    expect(moved?.topicSlug).toBe("x");
    expect(report.retired).toEqual(["rp.x.03"]);
    expect(report.replaced).toContainEqual({ from: `${T}#gate:g1`, to: `${T}#gate:g12` });
    expect(await db.attempts.toArray()).toEqual(attemptsBefore);
  });

  it("keeps the card she already has for the replacement, and lets the old one go", async () => {
    const db = getDB();
    const hers = card("rp.x.08", 5);
    await db.cards.bulkPut([card("rp.x.04"), card("rp.x.05"), hers]);
    const report = await settleWithdrawnCards(await db.cards.toArray(), load);
    expect((await db.cards.toArray()).map((c) => c.id)).toEqual(["rp.x.08"]);
    expect(await db.cards.get("rp.x.08")).toEqual(hers);
    expect(report.merged).toEqual([
      { from: "rp.x.04", into: "rp.x.08" },
      { from: "rp.x.05", into: "rp.x.08" },
    ]);
  });

  it("two old cards for one replacement: the first moves, the second joins it", async () => {
    const db = getDB();
    await db.cards.bulkPut([card("rp.x.04", -2), card("rp.x.05", -1)]);
    const report = await settleWithdrawnCards(await db.cards.toArray(), load);
    expect((await db.cards.toArray()).map((c) => c.id)).toEqual(["rp.x.08"]);
    expect(report.replaced).toEqual([{ from: "rp.x.04", to: "rp.x.08" }]);
    expect(report.merged).toEqual([{ from: "rp.x.05", into: "rp.x.08" }]);
  });

  it("leaves every flashcard card exactly as it is", async () => {
    const db = getDB();
    const fc = [card("fc.further-maths.fm1.x.01"), card("fc.science.b1-food-tests.auto-01")];
    await db.cards.bulkPut(fc);
    expect(await settleWithdrawnCards(fc, load)).toEqual({ replaced: [], renamed: [], merged: [], retired: [] });
    expect((await db.cards.toArray()).map((c) => c.id).sort()).toEqual(fc.map((c) => c.id).sort());
  });

  it("does nothing a second time, nothing without a bundle, and nothing to a card the content no longer knows", async () => {
    const db = getDB();
    await db.cards.bulkPut([card(`${T}#gate:g1`), card(`${T}#gate:g50`)]);
    await settleWithdrawnCards(await db.cards.toArray(), load);
    const after = await db.cards.toArray();
    const again = await settleWithdrawnCards(after, load);
    expect(again).toEqual({ replaced: [], renamed: [], merged: [], retired: [] });
    expect(await db.cards.toArray()).toEqual(after);
    expect((await settleWithdrawnCards([card("rp.x.01")], async () => null)).replaced).toEqual([]);
    expect(await db.cards.get(`${T}#gate:g50`)).toBeTruthy();
  });
});

describe("the trial topic as it will ship (public/content)", () => {
  const file = resolvePath(__dirname, "../../../public/content/further-maths/fm.u1.algebraic-fractions-simplify.json");
  it.skipIf(!existsSync(file))("resolves every one of its withdrawn records, and every gate in its note is current", () => {
    const shipped = JSON.parse(readFileSync(file, "utf8")) as ShippedBundle;
    const records = withdrawnRecords(shipped);
    expect(records.length).toBeGreaterThan(0);
    for (const r of records) {
      const cardId = r.kind === "gate" ? `${shipped.topic.id}#gate:${r.id}` : r.kind === "diagnostic" ? r.id.split("#")[1] : r.kind === "workedExample" ? `${r.id}#twin` : r.kind === "question" ? `${r.id}#main` : r.id;
      const res = resolveCardId(cardId, shipped);
      expect(["replaced", "retired"], `${r.kind} ${r.id} -> ${JSON.stringify(res)}`).toContain(res.kind);
      if (res.kind === "replaced") expect(resolveCardId(res.to, shipped), `${r.id} -> ${res.to}`).toEqual({ kind: "current" });
      if (r.replacedBy === null) expect(res.kind).toBe("retired");
    }
    for (const b of (shipped.noteBlocks ?? []) as Array<{ type: string; id?: string }>) {
      if (b.type === "gate") expect(resolveCardId(`${shipped.topic.id}#gate:${b.id}`, shipped), b.id).toEqual({ kind: "current" });
    }
  });
});
