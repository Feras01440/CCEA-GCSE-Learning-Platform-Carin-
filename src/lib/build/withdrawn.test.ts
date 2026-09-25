import { describe, expect, it } from "vitest";
import { WITHDRAWN_KINDS, withdrawnFindings } from "../../../scripts/qa/withdrawn.mjs";

/**
 * One machine-readable record for a withdrawn item (coordinator, 25 Sep 2026, the withdraw-and-replace ruling):
 * every verification log may carry `withdrawn: [{ id, kind, replacedBy, reason, on }]`. The note's log lists its
 * withdrawn gates; a bundle item's own log lists the item itself and has status "withdrawn"; a diagnostic set's log
 * lists the withdrawn items of the set as "<set id>#<item id>". scripts/qa/withdrawn.mjs is the lint; lesson-v2
 * reports it as a warning.
 */

type Json = Record<string, unknown>;
const ON = "2026-09-25T01:30:00Z";
const log = (id: string, itemId: string, status = "verified", withdrawn?: Json[]): Json => ({ id, itemId, version: 1, checks: [], status, reports: [], ...(withdrawn ? { withdrawn } : {}) });
const gate = (id: string): Json => ({ type: "gate", id, kind: "choice", prompt: "Which?", options: ["A", "B"], answer: "A", explain: "Because." });
const blocks = (...gates: string[]) => [{ type: "hero" }, { type: "h", text: "Idea", role: "idea" }, ...gates.map(gate)];
function bundle(noteWithdrawn: Json[] = [], extra: Json = {}): Json {
  return {
    note: { id: "note.x", verification: "ver.note.x" },
    questions: [{ id: "q.x.0001", verification: "ver.q.x.0001" }, { id: "q.x.0012", verification: "ver.q.x.0012" }],
    prompts: [{ id: "rp.x.01" }, { id: "rp.x.12" }],
    workedExamples: [{ id: "we.x.01", verification: "ver.we.x.01" }],
    findTheMistake: [{ id: "ftm.x.01" }],
    diagnostics: [
      { id: "dx.x", items: [{ id: "03" }] },
      { id: "dx.x.b", items: [{ id: "09" }] },
    ],
    verification: [log("ver.note.x", "note.x", "verified", noteWithdrawn), log("ver.q.x.0001", "q.x.0001"), log("ver.q.x.0012", "q.x.0012"), log("ver.rp.x.01", "rp.x.01"), log("ver.rp.x.12", "rp.x.12"), log("ver.dx.x", "dx.x"), log("ver.dx.x.b", "dx.x.b")],
    ...extra,
  };
}
const rec = (id: string, kind: string, replacedBy: string | null, reason = "Over the 25-word cap; the short form replaces it.", on = ON) => ({ id, kind, replacedBy, reason, on });
const problems = (b: Json, bl = blocks("g2", "g3b")) => withdrawnFindings(bl, b).problems.map((p: { id: string; problem: string }) => `${p.id}: ${p.problem}`);

describe("withdrawn records: one shape, checked", () => {
  it("names the kinds", () => {
    expect(WITHDRAWN_KINDS).toEqual(["gate", "diagnostic", "prompt", "question", "workedExample", "findTheMistake"]);
  });

  it("passes a withdrawn gate replaced by a gate the note carries, and one withdrawn with no replacement and a reason", () => {
    const b = bundle([rec("g3", "gate", "g3b"), rec("g5", "gate", null, "It worked a fraction question 0009 asks; nothing replaces it.")]);
    expect(problems(b)).toEqual([]);
    expect(withdrawnFindings(blocks("g2", "g3b"), b).records.map((r) => r.id)).toEqual(["g3", "g5"]);
  });

  it("reports a withdrawn gate still in the note's gate order", () => {
    expect(problems(bundle([rec("g3", "gate", "g3b")]), blocks("g2", "g3", "g3b"))).toEqual(["g3: withdrawn, but the note still has a gate with this id"]);
  });

  it("reports a replacement that does not exist, or exists as another kind", () => {
    expect(problems(bundle([rec("g3", "gate", "g9")]))).toEqual(["g3: replacedBy g9 is not a gate of this topic"]);
    expect(problems(bundle([rec("g3", "gate", "rp.x.12")]))).toEqual(["g3: replacedBy rp.x.12 is not a gate of this topic"]);
  });

  it("reports a record out of shape", () => {
    expect(problems(bundle([{ id: "g3", kind: "check", replacedBy: "g3b", reason: "x", on: ON }]))).toEqual(['g3: kind "check" is not one of gate, diagnostic, prompt, question, workedExample, findTheMistake']);
    expect(problems(bundle([rec("g3", "gate", null, "")]))).toEqual(["g3: no reason given"]);
    expect(problems(bundle([rec("g3", "gate", "g3b", "Why.", "25 Sep")]))).toEqual(['g3: on "25 Sep" is not an ISO date-time']);
    expect(problems(bundle([{ id: "g3", kind: "gate", reason: "Why.", on: ON }]))).toEqual(["g3: replacedBy is missing (write null when nothing replaces it)"]);
  });

  it("requires a record on the log of every bundle item withdrawn, in the same shape", () => {
    const b = bundle();
    (b.verification as Json[])[3] = log("ver.rp.x.01", "rp.x.01", "withdrawn");
    expect(problems(b)).toEqual(["rp.x.01: its log says withdrawn but carries no withdrawn record for it"]);
    (b.verification as Json[])[3] = log("ver.rp.x.01", "rp.x.01", "withdrawn", [rec("rp.x.01", "prompt", "rp.x.12")]);
    expect(problems(b)).toEqual([]);
  });

  it("reads a withdrawn diagnostic item as <set id>#<item id>, replaced by an item of any set", () => {
    const b = bundle();
    (b.verification as Json[])[5] = log("ver.dx.x", "dx.x", "verified", [rec("dx.x#01", "diagnostic", "dx.x.b#09"), rec("dx.x#02", "diagnostic", "dx.x#04")]);
    expect(problems(b)).toEqual(["dx.x#02: replacedBy dx.x#04 is not a diagnostic of this topic"]);
  });
});
