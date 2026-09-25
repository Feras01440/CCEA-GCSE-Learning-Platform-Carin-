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
