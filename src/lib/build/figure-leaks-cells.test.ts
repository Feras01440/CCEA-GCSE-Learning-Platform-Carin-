import { describe, expect, it } from "vitest";
import { ALLOWED, staleAllowances, sweepBundle } from "../../../scripts/qa/figure-leaks.mjs";

/**
 * A figure that prints a table answer's cells as bare numbers (QA fixer, 25 Sep 2026: m4 stratified-sampling
 * q0015 printed 12, 16, 10, 22 beside a table asking for exactly those). figure-leaks passes a bare short number
 * because axis ticks would drown the report, so this class got through. The rule: two or more of a table's (or a
 * multi-value answer's) cells printed as whole bare-number text nodes is a LEAK; one stays exempt; a number that
 * is one step of an evenly spaced run (an axis) or that the stem prints is never counted.
 */

type Json = Record<string, unknown>;
const svg = (...texts: string[]) =>
  "data:image/svg+xml;utf8," + encodeURIComponent(`<svg viewBox="0 0 400 300"><path d="M0 0L10 10"/>${texts.map((t, i) => `<text x="10" y="${20 + 20 * i}">${t}</text>`).join("")}</svg>`);
const tableQ = (texts: string[], cells: Array<number | string>, stem = "Complete the table to show the sample from each group."): Json => ({
  questions: [
    {
      id: "q.maths.m4.x.0015",
      figures: [{ kind: "svg", src: svg(...texts), alt: "A bar split into four age groups." }],
      parts: [{ id: "a", stem, answer: { kind: "table", cells: cells.map((value, i) => ({ row: 1, col: i + 1, value })) } }],
    },
  ],
});
const leaks = (b: Json) => sweepBundle(b, { subject: "maths", unit: "m4", slug: "x" }).leaks as Array<{ part: string; source: string; phrase: string }>;

describe("figure-leaks: a table answer's cells printed as bare numbers", () => {
  it("reports two or more cells printed as bare numbers", () => {
    const found = leaks(tableQ(["0", "20", "40", "60", "12", "16", "10", "22"], [12, 16, 10, 22]));
    expect(found.map((r) => [r.part, r.source])).toEqual([["a", "tableCells"]]);
    expect(found[0].phrase).toBe("12, 16, 10, 22");
  });

  it("leaves one bare number alone", () => {
    expect(leaks(tableQ(["0", "20", "40", "60", "12"], [12, 16, 10, 22]))).toEqual([]);
  });

  it("never counts a number that is one step of an evenly spaced run (an axis)", () => {
    expect(leaks(tableQ(["0", "10", "20", "30", "40"], [10, 20, 35, 45]))).toEqual([]);
  });

  it("never counts a number the stem already prints", () => {
    expect(leaks(tableQ(["12", "16"], [12, 16, 10, 22], "The sample holds 12 people aged 16 to 25 and 16 aged 26 to 40. Complete the table."))).toEqual([]);
  });

  it("counts each printed node once: one 6 on the figure is not two cells of 6", () => {
    expect(leaks(tableQ(["1", "6"], [1, 6, 15, 20, 15, 6, 1]))).toEqual([]);
    expect(leaks(tableQ(["1", "6", "6", "1"], [1, 6, 15, 20, 15, 6, 1])).map((r) => r.part)).toEqual(["a"]);
  });

  it("reads a text cell too (the table spec is cells[], not rows[])", () => {
    const found = leaks(tableQ(["Aa", "brown eyes"], ["brown eyes", "blue eyes"], "Complete the table of phenotypes."));
    expect(found.some((r) => r.source === "tableCell" && r.phrase === "brown eyes")).toBe(true);
  });
});

describe("figure-leaks: exemptions whose target has gone", () => {
  it("records every part it checked against a figure, and only those", () => {
    const b = {
      questions: [
        { id: "q.x.0001", figures: [{ kind: "svg", src: svg("A"), alt: "a cell" }], parts: [{ id: "a", answer: { kind: "text", accepted: ["nucleus"] } }] },
        { id: "q.x.0002", figures: [], parts: [{ id: "main", answer: { kind: "text", accepted: ["thin"] } }] },
      ],
    };
    const { targets } = sweepBundle(b, { subject: "science", unit: "b1", slug: "x" });
    expect([...targets]).toEqual(["q.x.0001#a"]);
  });

  it("lists an exemption no checked part answers to, and none when every one is live", () => {
    expect(staleAllowances(new Set())).toEqual([...ALLOWED.keys()]);
    expect(staleAllowances(new Set(ALLOWED.keys()))).toEqual([]);
  });

  it("no longer carries the respiratory-surfaces entry (the question has no figure now)", () => {
    expect(ALLOWED.has("q.science.b1.b1-respiratory-surfaces-breathing.0003#main")).toBe(false);
  });
});

/**
 * Withdrawn items are not read (the lead, 29 Sep 2026): a withdrawn item stays in the pack byte-identical by rule and never
 * ships, so a LEAK, WE-LEAK or review line against it asks an author to edit a copy that must not change (B2's restores
 * brought back old figures that were then reported). The rule is shingles-allow.mjs withoutWithdrawn's, used as it is: an
 * id in a withdrawn record, a diagnostic item as "<set id>#<item id>", or an item whose own log says "withdrawn".
 */
describe("figure-leaks: withdrawn items are not read", () => {
  const where = { subject: "science", unit: "b2", slug: "x" };
  const leakyQ = (id: string, verification?: string): Json => ({
    id,
    ...(verification ? { verification } : {}),
    figures: [{ kind: "svg", src: svg("nucleus"), alt: "A cell." }],
    parts: [{ id: "a", stem: "Name the structure that holds the DNA.", answer: { kind: "text", accepted: ["nucleus"], keyWords: [], listingRule: false } }],
  });
  const record = (id: string, kind: string) => ({ id, kind, replacedBy: null, reason: "Reissued.", on: "2026-09-29T10:00:00Z" });
  const sweep = (b: Json) => sweepBundle(b, where) as { leaks: Array<{ item: string }>; weLeaks: unknown[]; reviews: unknown[]; targets: Set<string>; withdrawn: number };

  it("reads a live question and names its leak", () => {
    expect(sweep({ questions: [leakyQ("q.x.0001")] }).leaks.map((r) => r.item)).toEqual(["q.x.0001"]);
  });

  it("skips a question a withdrawn record names, and counts it as not read", () => {
    const r = sweep({ questions: [leakyQ("q.x.0001"), leakyQ("q.x.0002")], verification: [{ id: "v.note", status: "verified", withdrawn: [record("q.x.0001", "question")] }] });
    expect(r.leaks.map((x) => x.item)).toEqual(["q.x.0002"]);
    expect([...r.targets]).toEqual(["q.x.0002#a"]);
    expect(r.withdrawn).toBe(1);
  });

  it("skips a question whose own log says withdrawn, with no record", () => {
    const r = sweep({ questions: [leakyQ("q.x.0001", "v.q1")], verification: [{ id: "v.q1", itemId: "q.x.0001", status: "withdrawn" }] });
    expect(r.leaks).toEqual([]);
    expect(r.withdrawn).toBe(1);
  });

  it("skips a diagnostic item withdrawn as set#item and still reads its neighbour", () => {
    const item = (id: string) => ({ id, stem: "Which structure holds the DNA?", figure: { kind: "svg", src: svg("nucleus"), alt: "A cell." }, options: [{ text: "nucleus", correct: true }, { text: "ribosome", correct: false }] });
    const r = sweep({ diagnostics: [{ id: "dx.x.pre", items: [item("d1"), item("d2")] }], verification: [{ id: "v.dx", itemId: "dx.x.pre", status: "verified", withdrawn: [record("dx.x.pre#d1", "diagnostic")] }] });
    expect(r.leaks.map((x) => x.item)).toEqual(["d2"]);
    expect(r.withdrawn).toBe(1);
  });

  it("skips a withdrawn worked example's figures", () => {
    const we = { id: "we.x.01", stem: "Name it.", steps: [], finalAnswer: "nucleus", twin: { stem: "Name the structure.", figure: { kind: "svg", src: svg("nucleus"), alt: "A cell." }, answer: { kind: "text", accepted: ["nucleus"], keyWords: [], listingRule: false } } };
    expect(sweep({ workedExamples: [we] }).leaks.length).toBe(1);
    const r = sweep({ workedExamples: [we], verification: [{ id: "v.note", status: "verified", withdrawn: [record("we.x.01", "workedExample")] }] });
    expect([r.leaks, r.weLeaks, r.reviews]).toEqual([[], [], []]);
    expect(r.withdrawn).toBe(1);
  });

  it("reads a draft (drafts are what an author checks before filing)", () => {
    const r = sweep({ questions: [leakyQ("q.x.0001", "v.q1")], verification: [{ id: "v.q1", itemId: "q.x.0001", status: "draft" }] });
    expect(r.leaks.map((x) => x.item)).toEqual(["q.x.0001"]);
    expect(r.withdrawn).toBe(0);
  });
});

/**
 * A key-word entry written with bars ("narrowed|narrow|blocked") is one idea in several spellings, as the engine reads it
 * (text-marking.ts markText splits every entry at "|"); read whole, it was one phrase no figure ever prints, so a figure
 * naming "narrowed" beside it was never checked (29 Sep 2026: 202 such entries in B2 and C2).
 */
describe("figure-leaks: a key-word entry written with bars is read spelling by spelling", () => {
  it("finds a figure that prints one spelling of the entry", () => {
    const b = {
      questions: [
        {
          id: "q.science.b2.x.0004",
          figures: [{ kind: "svg", src: svg("narrowed"), alt: "An artery in cross-section." }],
          parts: [{ id: "a", stem: "Name the change to the artery shown.", answer: { kind: "text", accepted: [], keyWords: [{ any: ["narrowed|narrow|blocked"], marks: 1 }], listingRule: false } }],
        },
      ],
    };
    const r = sweepBundle(b, { subject: "science", unit: "b2", slug: "x" }) as { leaks: Array<{ phrase: string; source: string }> };
    expect(r.leaks.map((x) => [x.phrase, x.source])).toEqual([["narrowed", "keyWord:0"]]);
  });
});
