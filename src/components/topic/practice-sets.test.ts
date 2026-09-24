import { describe, expect, it } from "vitest";
import type { DiagnosticItem, DiagnosticSet, FindTheMistake, PracticeSet, Question, RetrievalPrompt } from "@/lib/content/schema";
import { flattenSets, resolveSets, type SetSource } from "./practice-sets";

// The resolver reads ids only, so the other fields of a question, prompt or mistake item are not built here.
const q = (id: Question["id"]): Question => ({ id, style: "practice" }) as Question;
const rp = (id: RetrievalPrompt["id"]): RetrievalPrompt => ({ id, kind: "qa" }) as RetrievalPrompt;
const ftm = (id: FindTheMistake["id"]): FindTheMistake => ({ id, mistakeLine: 1 }) as FindTheMistake;

function dxItem(id: string): DiagnosticItem {
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

function dx(id: DiagnosticSet["id"], n: number): DiagnosticSet {
  return { id, topic: "maths.m4.histograms", specRefs: ["M4-STA-01"], when: "both", items: Array.from({ length: n }, (_, i) => dxItem(String(i + 1).padStart(2, "0"))) };
}

function set(id: PracticeSet["id"], itemIds: PracticeSet["itemIds"], title = "Both ways round"): PracticeSet {
  return { id, topic: "maths.m4.histograms", kind: "interleaved", title, subject: "maths", units: ["M4"], itemIds, showTopicLabels: false, version: 1 };
}

const bundle: SetSource = {
  questions: [q("q.maths.m4.histograms.0001"), q("q.maths.m4.histograms.0002")],
  diagnostics: [dx("dx.maths.m4.histograms", 2)],
  prompts: [rp("rp.maths.m4.histograms.01")],
  findTheMistake: [ftm("ftm.maths.m4.histograms.01")],
  sets: [],
};

const describeEntries = (r: ReturnType<typeof resolveSets>) =>
  r.map((s) => s.entries.map((e) => (e.kind === "q" ? `q:${e.q.id}` : e.kind === "dx" ? `dx:${e.setId}/${e.item.id}` : e.kind === "rp" ? `rp:${e.prompt.id}` : `ftm:${e.item.id}`)));

describe("resolveSets", () => {
  it("resolves questions, prompts and mistake items in authored order and expands a diagnostic set into its items", () => {
    const sets = [set("set.maths.m4.histograms.a", ["rp.maths.m4.histograms.01", "q.maths.m4.histograms.0002", "dx.maths.m4.histograms", "ftm.maths.m4.histograms.01", "q.maths.m4.histograms.0001"])];
    const resolved = resolveSets({ ...bundle, sets });
    expect(resolved.map((s) => s.set.id)).toEqual(["set.maths.m4.histograms.a"]);
    expect(describeEntries(resolved)).toEqual([
      ["rp:rp.maths.m4.histograms.01", "q:q.maths.m4.histograms.0002", "dx:dx.maths.m4.histograms/01", "dx:dx.maths.m4.histograms/02", "ftm:ftm.maths.m4.histograms.01", "q:q.maths.m4.histograms.0001"],
    ]);
  });

  it("skips ids the bundle does not hold and drops a set left with nothing", () => {
    const sets = [
      set("set.maths.m4.histograms.a", ["q.maths.m4.histograms.0009", "q.maths.m4.histograms.0001", "dx.maths.m4.other", "rp.maths.m4.histograms.99"]),
      set("set.maths.m4.histograms.b", ["q.maths.m4.histograms.0009", "ftm.maths.m4.histograms.02"]),
      set("set.maths.m4.histograms.c", ["ftm.maths.m4.histograms.01"]),
    ];
    const resolved = resolveSets({ ...bundle, sets });
    expect(resolved.map((s) => s.set.id)).toEqual(["set.maths.m4.histograms.a", "set.maths.m4.histograms.c"]);
    expect(describeEntries(resolved)).toEqual([["q:q.maths.m4.histograms.0001"], ["ftm:ftm.maths.m4.histograms.01"]]);
  });

  it("gives every entry a unique key, even when an id is repeated or a question sits in two sets", () => {
    const sets = [
      set("set.maths.m4.histograms.a", ["q.maths.m4.histograms.0001", "q.maths.m4.histograms.0001", "dx.maths.m4.histograms"]),
      set("set.maths.m4.histograms.b", ["q.maths.m4.histograms.0001", "dx.maths.m4.histograms"]),
    ];
    const keys = flattenSets(resolveSets({ ...bundle, sets })).map((s) => s.entry.key);
    expect(keys).toHaveLength(7);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("returns nothing for a bundle with no sets, whether the field is empty or missing", () => {
    expect(resolveSets({ ...bundle, sets: [] })).toEqual([]);
    expect(resolveSets({ ...bundle, sets: undefined })).toEqual([]);
    expect(resolveSets({ ...bundle, sets: null })).toEqual([]);
    expect(flattenSets([])).toEqual([]);
  });
});

describe("flattenSets", () => {
  it("numbers each entry within its own set, in set order", () => {
    const sets = [set("set.maths.m4.histograms.a", ["q.maths.m4.histograms.0001", "dx.maths.m4.histograms"], "First"), set("set.maths.m4.histograms.b", ["rp.maths.m4.histograms.01"], "Second")];
    const steps = flattenSets(resolveSets({ ...bundle, sets }));
    expect(steps.map((s) => `${s.set.title} ${s.index}/${s.total} ${s.entry.kind}`)).toEqual(["First 1/3 q", "First 2/3 dx", "First 3/3 dx", "Second 1/1 rp"]);
  });
});
