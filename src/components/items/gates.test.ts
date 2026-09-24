import { describe, expect, test } from "vitest";
import { gateAlternatives, gateOptions, markGate, visibleBlocks, wordsBetweenGates, type GateBlock, type NoteBlock } from "./gates";

const blocks: NoteBlock[] = [
  { type: "h", text: "Frequency density" },
  { type: "p", md: "With **unequal** class widths the bar height is $\\frac{f}{w}$." },
  { type: "gate", id: "g1", kind: "number", prompt: "Frequency 16, width 10: density?", answer: "1.6", explain: "16 ÷ 10." },
  { type: "p", md: "Frequency is the area." },
  { type: "gate", id: "g2", kind: "choice", prompt: "Which bar holds more?", options: ["The wider", "The taller"], answer: "The wider", explain: "Area." },
  { type: "callout", kind: "examiner", md: "Most scored zero.", source: "ccea-cer:maths:2025-summer:M4:Q22" },
];

describe("visibleBlocks", () => {
  test("stops after the first unanswered gate", () => {
    const v = visibleBlocks(blocks, new Set());
    expect(v.blocks).toHaveLength(3);
    expect(v.pendingGate?.id).toBe("g1");
    expect(v.gatesTotal).toBe(2);
    expect(v.gatesAnswered).toBe(0);
  });
  test("an answered gate opens the next stretch", () => {
    const v = visibleBlocks(blocks, new Set(["g1"]));
    expect(v.blocks).toHaveLength(5);
    expect(v.pendingGate?.id).toBe("g2");
    expect(v.gatesAnswered).toBe(1);
  });
  test("every gate answered renders everything", () => {
    const v = visibleBlocks(blocks, new Set(["g1", "g2"]));
    expect(v.blocks).toHaveLength(6);
    expect(v.pendingGate).toBeNull();
  });
});

describe("markGate", () => {
  const g = (kind: "blank" | "choice" | "number", answer: string) => ({ type: "gate" as const, id: "x", kind, prompt: "p", answer, explain: "e" });
  test("number gates use the numeric engine", () => {
    expect(markGate(g("number", "1.6"), "1.6")).toBe(true);
    expect(markGate(g("number", "1.6"), "8/5")).toBe(true);
    expect(markGate(g("number", "1.6"), "16")).toBe(false);
  });
  test("blank gates accept alternatives, ignore case and punctuation", () => {
    expect(markGate(g("blank", "class width | width of the class"), "Class width.")).toBe(true);
    expect(markGate(g("blank", "class width"), "height")).toBe(false);
    expect(markGate(g("blank", "20"), "20.0")).toBe(true);
    expect(markGate(g("blank", "20"), "")).toBe(false);
  });
  test("choice gates compare the option picked, not a normalised spelling of it", () => {
    // The gate is answered by picking an option, so the option itself is what is compared (engine item 15, 23 Sep 2026).
    const wider = { ...g("choice", "The wider"), options: ["The wider", "The taller"] };
    expect(markGate(wider, "The wider")).toBe(true);
    expect(markGate(wider, "The taller")).toBe(false);
    // By position too: the second option is index 1.
    expect(markGate(wider, "0")).toBe(true);
    expect(markGate(wider, "1")).toBe(false);
  });
  test("fm1 indicial-equations g3: the option without the brackets is wrong, though it differs only in brackets", () => {
    const g3 = {
      ...g("choice", "$(4x + 1) \\log 2 = (x + 3) \\log 7$"),
      options: ["$(4x + 1) \\log 2 = (x + 3) \\log 7$", "$4x + 1 \\log 2 = x + 3 \\log 7$", "$\\log 4x = \\log 1x$"],
    };
    expect(markGate(g3, "$(4x + 1) \\log 2 = (x + 3) \\log 7$")).toBe(true);
    expect(markGate(g3, "$4x + 1 \\log 2 = x + 3 \\log 7$")).toBe(false);
    expect(markGate(g3, "$\\log 4x = \\log 1x$")).toBe(false);
  });
  test("b2-monohybrid-genetics g6: 'it is BB' is wrong, though it differs from 'it is Bb' only in case", () => {
    const g6 = { ...g("choice", "it is Bb"), options: ["it is Bb", "it is BB", "nothing can be decided from one foal"] };
    expect(markGate(g6, "it is Bb")).toBe(true);
    expect(markGate(g6, "it is BB")).toBe(false);
    expect(markGate(g6, "nothing can be decided from one foal")).toBe(false);
  });
  test("gateAlternatives trims", () => {
    expect(gateAlternatives(" a | b|c ")).toEqual(["a", "b", "c"]);
  });
});

describe("wordsBetweenGates", () => {
  test("counts prose per stretch", () => {
    expect(wordsBetweenGates(blocks)).toEqual([11, 4, 3]);
  });
});

describe("gateOptions: the options in a seeded order (engine item 11)", () => {
  // 733 of the 741 choice gates on 23 Sep list the answer first, so "always A" was a pattern she could learn.
  const gate = (id: string, prompt: string, options: string[]): GateBlock => ({ type: "gate", id, kind: "choice", prompt, options, answer: options[0]!, explain: "e" });
  test("the same options, each once", () => {
    const g = gate("g3", "Which line takes logs correctly?", ["right", "wrong one", "wrong two"]);
    expect([...gateOptions(g)].sort()).toEqual(["right", "wrong one", "wrong two"]);
  });
  test("stable: the same gate is shown in the same order every time", () => {
    const g = gate("g6", "What is the stallion's genotype?", ["it is Bb", "it is BB", "nothing can be decided from one foal"]);
    expect(gateOptions(g)).toEqual(gateOptions({ ...g }));
  });
  test("the answer is not always first: over many gates it sits in every position", () => {
    const at = [0, 0, 0];
    for (let i = 0; i < 300; i += 1) {
      const g = gate(`g${i % 9}`, `Prompt number ${i}`, ["answer", "other", "third"]);
      at[gateOptions(g).indexOf("answer")]! += 1;
    }
    for (const n of at) expect(n).toBeGreaterThan(60);
  });
  test("gates with the same id in different topics are not shuffled alike", () => {
    const orders = new Set(["Which law?", "Which bar?", "Which graph?", "Which cell?", "Which force?", "Which ratio?"].map((p) => gateOptions(gate("g1", p, ["a", "b", "c"])).join()));
    expect(orders.size).toBeGreaterThan(1);
  });
  test("marking is by the option picked, so the order changes nothing about what is right", () => {
    const g = gate("g2", "Which bar holds more?", ["The wider", "The taller"]);
    for (const opt of gateOptions(g)) expect(markGate(g, opt)).toBe(opt === "The wider");
  });
  test("a gate without options has none to show", () => {
    expect(gateOptions({ type: "gate", id: "g", kind: "number", prompt: "p", answer: "1", explain: "e" })).toEqual([]);
  });
});

// C2 D F04 and F06 on the notes' own gates (24 Sep 2026): "Propene (C3H6)" was refused where the gate asks for the
// name, and "four" / "3O2" where it asks for a number. CCEA's rule for a name given with its formula (C2 Higher MS
// Summer 2021): the formula beside the name is ignored where the name is asked for, and the other way round.
describe("markGate: a name with its formula, and a number as the stem invites it", () => {
  const propene: GateBlock = { type: "gate", id: "g7", kind: "blank", prompt: "The monomer of poly(propene) is ____.", answer: "propene", explain: "" };
  const formula: GateBlock = { type: "gate", id: "g9", kind: "blank", prompt: "The formula of ethene is ____.", answer: "C2H4", explain: "" };
  const count: GateBlock = { type: "gate", id: "g3", kind: "number", prompt: "C₂H₅OH + ___ O₂ → 2CO₂ + 3H₂O", answer: "3", explain: "" };
  test.each(["Propene (C3H6)", "propene, C3H6", "C3H6 (propene)", "propene / C3H6"])("%s answers a name gate", (typed) => {
    expect(markGate(propene, typed)).toBe(true);
  });
  test.each(["C2H4 (ethene)", "ethene, C2H4"])("%s answers a formula gate", (typed) => {
    expect(markGate(formula, typed)).toBe(true);
  });
  test("another name beside the formula is not the answer", () => {
    expect(markGate(propene, "propane (C3H8)")).toBe(false);
    expect(markGate(propene, "propene, propane")).toBe(false);
    expect(markGate(formula, "C2H6 (ethene)")).toBe(false);
  });
  test.each(["3", "three", "3O2", "3 O2"])("%s answers the number gate", (typed) => {
    expect(markGate(count, typed)).toBe(true);
  });
  test("a different number is not the answer", () => {
    expect(markGate(count, "2O2")).toBe(false);
    expect(markGate(count, "two")).toBe(false);
  });
});
