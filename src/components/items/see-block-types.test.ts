/**
 * Compile-only checks for the See it block and the gate's twin (docs/plan/review/2026-09-27-see-it-block-shape.md):
 * each form must type-check as a NoteBlock, and a malformed one must not. No behaviour is tested here.
 */
import { describe, expect, test } from "vitest";
import type { GateBlock, NoteBlock, SeeBlock, SeeBlockInline, SeeBlockReference } from "./gates";

describe("the See it block and the gate twin type-check as NoteBlocks", () => {
  test("the inline form, with a figure, steps and a final answer", () => {
    const inline: SeeBlockInline = {
      type: "see",
      stem: String.raw`Simplify $\dfrac{x^2 - 9}{x^2 + 5x + 6}$.`,
      figure: { kind: "svg", src: "<svg/>", alt: "A drawing" },
      steps: [
        { n: 1, working: "$x^2 - 9 = (x + 3)(x - 3)$", decision: "Factorise the top first.", earns: ["MW1"] },
        { n: 2, working: String.raw`$\dfrac{x - 3}{x + 2}$`, decision: "Divide out the common bracket.", earns: ["W1"] },
      ],
      finalAnswer: String.raw`$\dfrac{x - 3}{x + 2}$`,
    };
    const block: NoteBlock = inline;
    expect(block.type).toBe("see");
  });
  test("the reference form names a bundle worked example", () => {
    const ref: SeeBlockReference = { type: "see", workedExample: "we.fm.u1.algebraic-fractions-simplify.02" };
    const see: SeeBlock = ref;
    const block: NoteBlock = see;
    expect(block.type).toBe("see");
  });
  test("a gate may carry a twin, and need not", () => {
    const withTwin: GateBlock = {
      type: "gate",
      id: "g1",
      kind: "choice",
      prompt: "Which factorises x² − 16?",
      options: ["(x + 4)(x − 4)", "(x − 4)²"],
      answer: "(x + 4)(x − 4)",
      explain: "A difference of two squares.",
      twin: { prompt: "Which factorises x² − 25?", options: ["(x + 5)(x − 5)", "(x − 5)²"], answer: "(x + 5)(x − 5)", explain: "The same shape." },
    };
    const without: GateBlock = { type: "gate", id: "g2", kind: "number", prompt: "7 × 8?", answer: "56", explain: "Seven eights." };
    const blocks: NoteBlock[] = [withTwin, without];
    expect(blocks).toHaveLength(2);
  });
  test("a See it block with neither steps nor a worked example is not a NoteBlock", () => {
    // @ts-expect-error: a see block needs its stem and steps, or a workedExample.
    const bad: NoteBlock = { type: "see", stem: "only a stem" };
    expect(bad.type).toBe("see");
  });
});

describe("option notes and the See it's kind type-check", () => {
  test("a choice gate with notes on its wrong options, and a See it of kind explanation", () => {
    const gate: GateBlock = {
      type: "gate",
      id: "g3",
      kind: "choice",
      prompt: "Which is the next step?",
      options: ["Factorise the top", "Cancel the x"],
      answer: "Factorise the top",
      explain: "Factorise before cancelling.",
      optionNotes: [{ option: "Cancel the x", why: "Only a factor of the whole top and bottom cancels.", misconception: "fm.algfrac.cancel-terms" }],
    };
    const inline: SeeBlockInline = {
      type: "see",
      kind: "explanation",
      stem: "Why does the reaction slow down?",
      steps: [
        { n: 1, working: "Fewer particles", decision: "Concentration falls." },
        { n: 2, working: "Fewer collisions per second", decision: "So the rate falls." },
      ],
    };
    const blocks: NoteBlock[] = [gate, inline];
    expect(blocks).toHaveLength(2);
  });
});
