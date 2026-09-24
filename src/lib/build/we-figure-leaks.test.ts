import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { planFade } from "@/components/items/fade";
import { hiddenSteps } from "../../../scripts/qa/we-hidden-steps.mjs";
import { sweepBundle } from "../../../scripts/qa/figure-leaks.mjs";

/**
 * A worked example's figure and what it may print (pipeline brief item 2, 24 Sep 2026).
 *
 * src/components/items/WorkedExampleAsQuestion.tsx: TwinMode renders only we.twin.figure beside the twin's
 * answer box, so the worked example's own figure is never beside the twin's answer, and comparing the two
 * flagged 23 B1 figures that leak nothing. The faded modes (faded1, faded2) DO show the worked example's
 * figure while the steps they hide are hers to write, and the problem mode shows it above an empty answer
 * line. So the rule is: the worked example's figure against the answers of the steps each faded mode hides
 * (and the final answer, for the problem mode), minus what the stem and the shown steps already give; the
 * twin's figure against the twin's answer.
 */

type Json = Record<string, unknown>;
const svg = (...texts: string[]) =>
  "data:image/svg+xml;utf8," + encodeURIComponent(`<svg viewBox="0 0 400 300"><path d="M0 0L10 10"/>${texts.map((t, i) => `<text x="10" y="${20 + 20 * i}">${t}</text>`).join("")}</svg>`);
const numeric = (value: number, unit?: string) => ({ kind: "numeric", value, tolerance: { type: "exact" }, ...(unit ? { unit, unitRequired: false } : {}) });

/** An enzyme practical: mean time, then the optimum read off the graph. */
function we(figureTexts: string[], extra: Json = {}): Json {
  return {
    id: "we.science.b1.x.01",
    stem: "Groups A and B timed amylase at 30 °C: 148 s and 152 s. (a) Calculate the mean time. (b) Use the graph to give the optimum temperature.",
    figure: { kind: "svg", src: svg(...figureTexts), alt: "A graph of the time for the starch to disappear against temperature." },
    steps: [
      { n: 1, working: "mean = (148 + 152) ÷ 2", decision: "Add, then divide by the number of groups." },
      { n: 2, working: "= 150 s", decision: "Finish the division.", input: numeric(150, "s") },
      { n: 3, working: "optimum = 40 °C", decision: "Read the lowest point of the curve." },
      { n: 4, working: "because 60 s is the shortest time, so the reaction was fastest there", decision: "Say why." },
    ],
    finalAnswer: "(a) 150 s (b) 40 °C, because it gave the shortest time.",
    twin: { stem: "Two groups recorded 96 s and 104 s. Calculate the mean.", answer: numeric(100, "s") },
    faded: [{ showSteps: 2, studentSupplies: [3, 4] }],
    ...extra,
  };
}
const bundleOf = (...wes: Json[]) => ({ workedExamples: wes });
const run = (b: Json) => sweepBundle(b, { subject: "science", unit: "b1", slug: "x" });
type Row = { item: string; part: string; phrase: string; source: string };
/** Both tiers: LEAK (gating: the twin) and WE-LEAK (the faded and problem modes, gating with --we-fatal). */
const allLeaks = (b: Json): Row[] => {
  const r = run(b);
  return [...r.leaks, ...r.weLeaks];
};
/** One line per leaking part (a part usually leaks through two spellings of one value, "40" and "40 °C"). */
const leakParts = (b: Json) => [...new Set(allLeaks(b).map((r: Row) => `${r.item} ${r.part}`))];
const leakPhrases = (b: Json, part: string) => allLeaks(b).filter((r: Row) => r.part === part).map((r: Row) => r.phrase);

describe("which steps each faded mode hides (scripts/qa/we-hidden-steps.mjs mirrors fade.ts planFade)", () => {
  const steps = (n: number) => Array.from({ length: n }, (_, i) => ({ n: i + 1 }));
  const cases: Array<{ steps: Array<{ n: number }>; faded: Array<{ showSteps: number; studentSupplies: number[] }> }> = [
    { steps: steps(4), faded: [] },
    { steps: steps(4), faded: [{ showSteps: 2, studentSupplies: [3, 4] }] },
    { steps: steps(5), faded: [{ showSteps: 3, studentSupplies: [5] }, { showSteps: 1, studentSupplies: [2, 3, 4, 5] }] },
    { steps: steps(1), faded: [] },
    { steps: steps(3), faded: [{ showSteps: 3, studentSupplies: [3] }] }, // not below the step count: the default plan
  ];
  it("agrees with planFade on the shapes the schema allows", () => {
    for (const c of cases) {
      const mine = hiddenSteps(c);
      for (const [i, mode] of (["faded1", "faded2"] as const).entries()) {
        const p = planFade(c as never, mode);
        expect(mine[i], JSON.stringify(c)).toEqual({ mode, showSteps: p.showSteps, supplied: p.supplied });
      }
    }
  });

  it("agrees with planFade on every published worked example", () => {
    let n = 0;
    const root = path.resolve("packs");
    for (const subject of fs.readdirSync(root)) {
      const content = path.join(root, subject, "content");
      if (!fs.existsSync(content)) continue;
      for (const unit of fs.readdirSync(content))
        for (const slug of fs.readdirSync(path.join(content, unit))) {
          const f = path.join(content, unit, slug, "bundle.json");
          if (!fs.existsSync(f)) continue;
          for (const w of JSON.parse(fs.readFileSync(f, "utf8")).workedExamples ?? []) {
            n += 1;
            const mine = hiddenSteps(w);
            expect(mine[0].supplied, w.id).toEqual(planFade(w, "faded1").supplied);
            expect(mine[1].supplied, w.id).toEqual(planFade(w, "faded2").supplied);
          }
        }
    }
    expect(n).toBeGreaterThan(100);
  });
});

describe("figure-leaks: a worked example's figure against the steps the faded modes hide", () => {
  it("reports a figure that prints a hidden step's value, in a label that says what it is", () => {
    // both faded modes hide steps 3 and 4 (faded1 as authored, faded2 by default); the problem mode hides the final answer
    const b = bundleOf(we(["Temperature / °C", "shortest time = fastest rate = optimum (40 °C)"]));
    expect(leakParts(b)).toEqual(["we.science.b1.x.01 step 3", "we.science.b1.x.01 final"]);
    expect(leakPhrases(b, "step 3")).toContain("40 °C");
    // its own tier: printed and counted, gating only with --we-fatal
    expect(run(b).leaks).toEqual([]);
    expect(run(b).weLeaks.length).toBeGreaterThan(0);
  });

  it("does not report a bare tick on the axis the step is read from", () => {
    expect(leakParts(bundleOf(we(["Temperature / °C", "0", "20", "40", "60"])))).toEqual([]);
  });

  it("does not report the twin's answer printed on the worked example's figure: TwinMode never shows that figure", () => {
    expect(leakParts(bundleOf(we(["Temperature / °C", "the twin's mean is 100 s"])))).toEqual([]);
  });

  it("does not report a value the stem or a shown step already gives", () => {
    // 148 s is in the stem; step 1's sum is shown in both faded modes
    expect(leakParts(bundleOf(we(["Group A took 148 s", "sum (148 + 152)"])))).toEqual([]);
  });

  it("reports a value a faded mode hides even when an easier mode shows it", () => {
    // faded2 authored to hide steps 2 to 4: the mean 150 s printed as a reading is then a leak in faded2
    const w = we(["mean time 150 s"], { faded: [{ showSteps: 2, studentSupplies: [3, 4] }, { showSteps: 1, studentSupplies: [2, 3, 4] }] });
    expect(leakParts(bundleOf(w))).toEqual(["we.science.b1.x.01 step 2", "we.science.b1.x.01 final"]);
    expect(leakPhrases(bundleOf(w), "step 2")).toContain("150 s");
  });

  it("reports a short hidden statement the figure names, and keeps a prose step's term as a review line", () => {
    const w = we(["purple", "denatured"], {
      stem: "A leaf is sealed in hydrogencarbonate indicator in bright light. State the colour at the end and explain it.",
      steps: [
        { n: 1, working: "In bright light the leaf photosynthesises faster than it respires.", decision: "Compare the two." },
        { n: 2, working: "Purple.", decision: "Low carbon dioxide." },
        { n: 3, working: "Above the optimum the enzyme is denatured.", decision: "Name the change." },
      ],
      finalAnswer: "Purple, because photosynthesis is faster than respiration.",
      faded: [{ showSteps: 1, studentSupplies: [2, 3] }],
    });
    const r = run(bundleOf(w));
    expect(r.weLeaks.map((x: { part: string; phrase: string }) => [x.part, x.phrase])).toEqual([["step 2", "Purple."]]);
    expect(r.reviews.map((x: { part: string; phrase: string }) => [x.part, x.phrase])).toContainEqual(["step 3", "denatured"]);
  });

  it("still reports a twin figure that prints the twin's own answer", () => {
    const w = we(["Temperature / °C"], { twin: { stem: "Two groups recorded 96 s and 104 s. Calculate the mean.", answer: numeric(100, "s"), figure: { kind: "svg", src: svg("mean = 100 s"), alt: "a bar chart" } } });
    expect(leakParts(bundleOf(w))).toEqual(["we.science.b1.x.01 twin"]);
    expect([...new Set(run(bundleOf(w)).leaks.map((r: Row) => r.part))]).toEqual(["twin"]); // the twin stays in the gating tier
  });
});
