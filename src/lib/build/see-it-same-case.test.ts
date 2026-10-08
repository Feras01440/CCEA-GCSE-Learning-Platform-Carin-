import { describe, expect, it } from "vitest";
import { SAME_CASE_ALLOWED } from "../../../scripts/qa/figure-leaks.mjs";
import { distinctiveValues, seeItFindings } from "../../../scripts/qa/see-it.mjs";

/**
 * same-case (the lead, 8 Oct 2026, from the FM2 review: ten gates asked the exact case their See it had just worked, the
 * same crate, force or box, without printing the answer, so answer-shown missed them). A Your turn (its prompt, the labels
 * of a figure between its See it and it, its twin's prompt) that shares a distinctive value with a See it of its section
 * (its steps' working, reasons and earns, its figure's labels): a number with a decimal point, a surd, a fraction or an
 * integer of 10 or more, unless the topic allows the value as a fact (scripts/qa/figure-leaks.mjs SAME_CASE_ALLOWED).
 * Tightened the same day (the lead's ruling on the sweep): it is reported when two or more values are shared, or one
 * that is a decimal, a fraction, a surd or 100 or more; one shared whole number under 100 is a coincidence as often as
 * not (a 30° angle, a class boundary of 20), and is listed only with `loose` (lesson-v2 --same-case-loose).
 */
const BS = String.fromCharCode(92);
const frac = (a: string, b: string) => `${BS}frac{${a}}{${b}}`;
const sqrt = (n: string) => `${BS}sqrt{${n}}`;
const times = ` ${BS}times `;
const inlineSvg = (label: string) => `<svg xmlns="http://www.w3.org/2000/svg"><text x="1" y="1">${label}</text></svg>`;
const dataSvg = (label: string) => `data:image/svg+xml;utf8,${encodeURIComponent(inlineSvg(label))}`;

const h = (text: string) => ({ type: "h", text });
const p = (md: string) => ({ type: "p", md });
type Step = [working: string, decision: string];
const see = (steps: Step[], extra: Record<string, unknown> = {}) => ({
  type: "see",
  stem: "A crate is pushed across a rough floor.",
  steps: steps.map(([working, decision], k) => ({ n: k + 1, working, decision, earns: ["M1"] })),
  ...extra,
});
const gate = (id: string, prompt: string, answer: string, extra: Record<string, unknown> = {}) => ({ type: "gate", id, kind: "number", prompt, answer, explain: "Because.", ...extra });
type Finding = { kind: string; gate?: string; detail: string; values?: Array<{ value: string; turn: string; see: string }> };
const findings = (blocks: object[], sameCaseAllowed?: Record<string, string>, sameCaseLoose = false) => seeItFindings(blocks, { sameCaseAllowed, sameCaseLoose }).findings as Finding[];
const sameCase = (blocks: object[], allowed?: Record<string, string>, loose = false) => findings(blocks, allowed, loose).filter((f) => f.kind === "same-case");

const CRATE = see([
  [`$W = 12.5${times}10 = 125$ N`, "Weight is mass times g."],
  ["$F = 125 - 40 = 85$ N", "The push of 40 N is taken off."],
]);

describe("distinctive values", () => {
  it("reads decimals, fractions, surds and integers of 10 or more, each as one key", () => {
    const text = `$2.50 + ${frac("3", "8")} + 2${sqrt("3")} + 12 + 7 + 3${times}10^{5}$, then 1,200 and 1{,}500, half (½), and 30/60; it ends at 4.75.`;
    expect([...distinctiveValues(text)].sort()).toEqual(["1/2", "1200", "12", "1500", "2.5", "2√3", "3/8", "30/60", "4.75"].sort());
  });

  it("ignores small integers, the 10 of a power of ten, and a specification reference", () => {
    expect([...distinctiveValues(`$3 + 4 = 7$; $6${times}10^{-3}$; 3 × 10⁸ m/s; spec 1.1.6`)]).toEqual([]);
  });
});

describe("same-case: a Your turn on its See it's own values", () => {
  it("reports the gate, each shared value and the See it step that holds it", () => {
    const hits = sameCase([h("Resultant force"), p("Words."), CRATE, gate("g1", "The 12.5 kg crate above feels a resultant of 85 N. Find its acceleration in m/s².", "6.8")]);
    expect(hits).toHaveLength(1);
    expect(hits[0].gate).toBe("g1");
    expect(hits[0].values).toEqual([
      { value: "12.5", turn: "its prompt", see: "step 1 working" },
      { value: "85", turn: "its prompt", see: "step 2 working" },
    ]);
    expect(hits[0].detail).toContain("12.5");
    expect(hits[0].detail).toContain("step 2 working");
    expect(hits[0].detail).toContain("the reviewer's eye, not this lint's");
  });

  it("reports one shared whole number under 100 only when asked for the loose list", () => {
    const blocks = [h("Resultant force"), CRATE, gate("g1", "A 3 kg box feels a resultant of 85 N. Find its acceleration in m/s².", "28.3")];
    expect(sameCase(blocks)).toEqual([]);
    expect(sameCase(blocks, undefined, true).map((f) => f.values?.map((v) => v.value))).toEqual([["85"]]);
  });

  it("reports one shared value of 100 or more", () => {
    const blocks = [h("Resultant force"), CRATE, gate("g1", "A sack weighs 125 N. What is its mass in kg?", "12")];
    expect(sameCase(blocks).map((f) => f.values?.map((v) => v.value))).toEqual([["125"]]);
  });

  it("is quiet for a Your turn on new numbers, and for values under 10", () => {
    expect(sameCase([h("Resultant force"), CRATE, gate("g1", "A 7.5 kg box is pushed with 30 N against 12 N of friction. Find its acceleration.", "2.4")])).toEqual([]);
    expect(sameCase([h("Adding"), see([["$3 + 4 = 7$", "Add."], ["$7 + 2 = 9$", "Add again."]]), gate("g1", "Work out 3 + 4 + 2 + 1.", "10")])).toEqual([]);
  });

  it("allows a value the topic fixes as a fact, and only that value", () => {
    const g = { "10": "g = 10 N/kg, given on the data sheet" };
    const decimal = [h("Weight"), CRATE, gate("g1", "A 12.5 kg crate hangs at rest. Taking g as 10 N/kg, find its mass in grams.", "12500")];
    expect(sameCase(decimal).map((f) => f.values?.map((v) => v.value))).toEqual([["12.5", "10"]]);
    expect(sameCase(decimal, g).map((f) => f.values?.map((v) => v.value))).toEqual([["12.5"]]);
    // two whole numbers under 100 are reported; with g allowed, the one left is not
    const whole = [h("Weight"), CRATE, gate("g1", "A 4 kg bag is pulled up with 40 N. Taking g as 10 N/kg, find the resultant.", "0")];
    expect(sameCase(whole).map((f) => f.values?.map((v) => v.value))).toEqual([["40", "10"]]);
    expect(sameCase(whole, g)).toEqual([]);
  });

  it("reads fractions and surds in either notation", () => {
    const blocks = [h("Surds and fractions"), see([[`$${frac("3", "8")}$ of the counters are red`, "Count the red ones."], [`$2${sqrt("3")}$`, "Simplify the root."]]), gate("g1", "A bag holds 3/8 red counters; is 2√3 bigger than 3?", "yes")];
    expect(sameCase(blocks)[0].values?.map((v) => v.value)).toEqual(["3/8", "2√3"]);
  });

  it("reads the See it's figure and the Your turn's figure", () => {
    const withFigure = see([["$a = F / m$", "Newton's second law."], ["$a = 2$", "Divide."]], { figure: { kind: "svg", src: dataSvg("12.5 N"), alt: "A crate with an arrow." } });
    const hits = sameCase([h("Forces"), withFigure, { type: "figure", alt: "The crate again.", svg: inlineSvg("12.5 N") }, gate("g1", "Find the acceleration of the crate in the figure.", "3")]);
    expect(hits[0].values).toEqual([{ value: "12.5", turn: "its figure", see: "figure" }]);
  });

  it("reads the twin's prompt", () => {
    const hits = sameCase([h("Forces"), CRATE, gate("g1", "A 7.5 kg box is pushed with 30 N. Find its acceleration.", "4", { twin: { prompt: "A 12.5 kg crate is pushed with 30 N. Find its acceleration.", answer: "2.4", explain: "Divide." } })]);
    expect(hits[0].values).toEqual([{ value: "12.5", turn: "its twin", see: "step 1 working" }]);
  });

  it("leaves a gate whose answer its See it prints to answer-shown", () => {
    const all = findings([h("Forces"), CRATE, gate("g1", "The 12.5 kg crate above: what is the resultant force in N?", "85")]);
    expect(all.map((f) => f.kind)).toEqual(["answer-shown"]);
  });

  it("does not read the See it's stem, or a See it of another section", () => {
    const stemOnly = see([["$a = F / m$", "Newton's second law."], ["$a = 2$", "Divide."]], { stem: "A 12.5 kg crate is pushed." });
    expect(sameCase([h("Forces"), stemOnly, gate("g1", "A 12.5 kg crate is pulled instead. Find its weight.", "125")])).toEqual([]);
    expect(
      sameCase([
        h("One"),
        CRATE,
        gate("g1", "A 7.5 kg box is pushed with 30 N. Find its acceleration.", "4"),
        h("Two"),
        see([["$v = 3$", "Read."], ["$v = 4$", "Read."]]),
        gate("g2", "A 12.5 kg crate moves at 4 m/s.", "x"),
      ]),
    ).toEqual([]);
  });
});

describe("the per-topic allow list (scripts/qa/figure-leaks.mjs SAME_CASE_ALLOWED)", () => {
  it("keys a topic as subject/unit/slug and gives every value a reason", () => {
    for (const [topic, values] of SAME_CASE_ALLOWED) {
      expect(topic).toMatch(/^(maths|further-maths|science)[/][a-z0-9]+[/][a-z0-9-]+$/);
      for (const [value, reason] of Object.entries(values as Record<string, string>)) {
        expect(value, topic).toMatch(/\S/);
        expect(String(reason).length, `${topic} ${value}`).toBeGreaterThan(10);
      }
    }
  });
});
