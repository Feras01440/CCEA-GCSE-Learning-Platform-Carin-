import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allowEntries, allowedBy, verdict, words } from "../../../scripts/qa/shingles-allow.mjs";

/**
 * scripts/qa/shingles.mjs's verdict on a run it shares with the corpus (QA fixer, 25 Sep 2026): the M4
 * circle-theorems reasons were reported as mark-scheme copies because the schemes print the theorems, which are
 * also the key words her marker checks for. An allow-listed standard statement now passes with or without a
 * leading "because" or "that", even where a scheme prints it; nothing else changes.
 */
const allow = allowEntries(JSON.parse(fs.readFileSync(path.resolve("scripts/qa/shingles.allow.json"), "utf8")));
const run = (s: string) => words(s).join(" ");
const scheme = { papers: 0, schemes: 2, reports: 0 };

describe("an allow-listed theorem statement", () => {
  it("passes inside the statement, even when a mark scheme prints it", () => {
    const a = allowedBy(run("the angle at the centre is twice the"), allow);
    expect(a?.statement).toBe("The angle at the centre is twice the angle at the circumference");
    expect(verdict(scheme, a, () => false)).toBe("allowed");
  });

  it("passes with the reason's opening word, because or that", () => {
    expect(allowedBy(run("because the angle at the centre is twice"), allow)).not.toBeNull();
    expect(allowedBy(run("that the angle at the centre is twice"), allow)).not.toBeNull();
    expect(allowedBy(run("because angles in the same segment are equal"), allow)?.statement).toBe("Angles in the same segment are equal");
  });

  it("covers the cyclic quadrilateral in its standard 'in' wording", () => {
    for (const s of ["opposite angles in a cyclic quadrilateral add up", "angles in a cyclic quadrilateral add up to", "in a cyclic quadrilateral add up to 180"])
      expect(allowedBy(run(s), allow), s).not.toBeNull();
  });

  it("does not stretch to other words: any other opener, or a run leaving the statement, keeps its verdict", () => {
    expect(allowedBy(run("so the angle at the centre is twice"), allow)).toBeNull();
    expect(allowedBy(run("because the angle at the centre is three"), allow)).toBeNull();
    expect(allowedBy(run("is twice the angle at the circumference so x"), allow)).toBeNull();
    expect(verdict(scheme, null, () => true)).toBe("scheme-or-report");
    expect(verdict({ papers: 4, schemes: 0, reports: 0 }, null, () => false)).toBe("stimulus-copy");
    expect(verdict({ papers: 4, schemes: 0, reports: 0 }, null, () => true)).toBe("stock");
    expect(verdict({ papers: 1, schemes: 0, reports: 0 }, null, () => true)).toBe("paper-copy");
  });

  it("matches whole words only", () => {
    // "ngles in the same segment are equal" is not a run of the statement's words
    expect(allowedBy("ngles in the same segment are equal", allow)).toBeNull();
  });
});
