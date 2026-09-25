import { describe, expect, test } from "vitest";
import type { AnswerSpec } from "@/lib/content/schema";
import { expectedDisplay, isAutoMarkable, toAlgebraSpec, toNumericSpec, toNumericTolerance } from "./spec-map";

describe("toNumericSpec", () => {
  test("tolerances are renamed for the engine", () => {
    expect(toNumericTolerance({ type: "dp", places: 2 })).toEqual({ type: "dp", n: 2 });
    expect(toNumericTolerance({ type: "sf", figures: 3 })).toEqual({ type: "sigfigs", n: 3 });
    expect(toNumericTolerance({ type: "exact" })).toEqual({ type: "absolute", value: 0 });
    expect(toNumericTolerance({ type: "range", min: 36.1, max: 36.2 })).toEqual({ type: "range", min: 36.1, max: 36.2 });
  });

  test("units, forms and required accuracy carry across", () => {
    const spec = toNumericSpec({
      kind: "numeric",
      value: 36.2,
      tolerance: { type: "dp", places: 1 },
      unit: "cm",
      unitRequired: true,
      acceptForms: ["decimal", "standardForm", "ratio"],
    });
    expect(spec).toMatchObject({ value: 36.2, unit: "cm", requireUnit: true, tolerance: { type: "dp", n: 1 } });
    // A d.p. tolerance is a closeness test unless the stem instructs the accuracy.
    expect(spec.dp).toBeUndefined();
    expect(spec.acceptedForms).toEqual(["decimal", "integer", "recurring", "standard-form"]);
    expect(spec.requiredForm).toBeUndefined();
    const instructed = toNumericSpec(
      { kind: "numeric", value: 36.2, tolerance: { type: "dp", places: 1 }, unitRequired: false, acceptForms: ["decimal"] },
      { accuracyInstructed: true },
    );
    expect(instructed.dp).toBe(1);
  });

  test("simplest fraction and a lone standard form become required forms", () => {
    expect(
      toNumericSpec({ kind: "numeric", value: 0.75, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["fraction"], mustBeSimplified: true })
        .requiredForm,
    ).toBe("simplest-fraction");
    expect(
      toNumericSpec({ kind: "numeric", value: 320000, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["standardForm"] }).requiredForm,
    ).toBe("standard-form");
  });

  test("ratio alone leaves forms unconstrained", () => {
    expect(toNumericSpec({ kind: "numeric", value: 2, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["ratio"] }).acceptedForms).toBeUndefined();
  });
});

describe("toAlgebraSpec", () => {
  test("equivalence modes", () => {
    expect(toAlgebraSpec({ kind: "algebraic", latex: "(x+3)(x-2)", equivalence: "equivalent", variables: ["x"] })).toEqual({
      answer: "(x+3)(x-2)",
      mode: "equivalent",
      variables: ["x"],
    });
    expect(toAlgebraSpec({ kind: "algebraic", latex: "2x", equivalence: "simplifiedOnly", variables: [] }).mode).toBe("identical-after-simplify");
    expect(toAlgebraSpec({ kind: "algebraic", latex: "2x", equivalence: "identical", variables: [] }).mode).toBe("identical-after-simplify");
  });
  test("form requirements win", () => {
    expect(toAlgebraSpec({ kind: "algebraic", latex: "(x+3)(x-2)", equivalence: "equivalent", variables: ["x"], mustBeFactorised: true })).toMatchObject({
      mode: "form",
      form: "factorised",
    });
    expect(toAlgebraSpec({ kind: "algebraic", latex: "x^2+x-6", equivalence: "identical", variables: ["x"], mustBeExpanded: true })).toMatchObject({
      mode: "form",
      form: "expanded",
    });
  });
});

describe("expectedDisplay", () => {
  test("numeric with unit and ranges", () => {
    expect(expectedDisplay({ kind: "numeric", value: 25, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] })).toBe("25");
    expect(
      expectedDisplay({ kind: "numeric", value: 36.2, tolerance: { type: "range", min: 36.1, max: 36.2 }, unit: "cm", unitRequired: false, acceptForms: ["decimal"] }),
    ).toBe("36.1 to 36.2 cm");
  });
  test("algebraic and equations are wrapped as maths", () => {
    expect(expectedDisplay({ kind: "algebraic", latex: "2x+1", equivalence: "equivalent", variables: ["x"] })).toBe("$2x+1$");
    expect(expectedDisplay({ kind: "equation", kindOf: "physics", balancedLatex: "v = f\\lambda", stateSymbolsRequired: false, acceptMultiples: false })).toBe(
      "$v = f\\lambda$",
    );
    expect(
      expectedDisplay({ kind: "equation", kindOf: "word", balancedLatex: "hydrogen + oxygen → water", stateSymbolsRequired: false, acceptMultiples: false }),
    ).toBe("hydrogen + oxygen → water");
  });
  test("mcq, text and self-marked kinds", () => {
    const mcq: AnswerSpec = {
      kind: "mcq",
      shuffle: false,
      options: [
        { id: "a", text: "1.6", correct: true, feedback: "yes" },
        { id: "b", text: "16", correct: false, feedback: "no" },
      ],
    };
    expect(expectedDisplay(mcq)).toBe("1.6");
    expect(expectedDisplay({ kind: "text", accepted: [], keyWords: [{ any: ["area", "areas"], marks: 1 }], listingRule: false })).toBe("area");
    expect(expectedDisplay({ kind: "drawing", rubric: ["a"], selfMark: true })).toBe("See the worked solution.");
    expect(isAutoMarkable(mcq)).toBe(true);
    expect(isAutoMarkable({ kind: "drawing", rubric: ["a"], selfMark: true })).toBe(false);
    // Cells, labels and a chain of working have fields and markers of their own.
    expect(isAutoMarkable({ kind: "steps", expectedOrder: ["a", "b"], allowSkips: false })).toBe(true);
    expect(isAutoMarkable({ kind: "table", cells: [{ row: 0, col: 0, value: 1 }] })).toBe(true);
    expect(isAutoMarkable({ kind: "label", targets: [{ id: "i", accepted: ["a"] }], bank: [] })).toBe(true);
    // A banded six-mark answer has a field and a marker of its own; the mark inside the band is still hers.
    const qwc: AnswerSpec = {
      kind: "text-long",
      rubricId: "sci.qwc.b1.respiration",
      selfMark: true,
      bands: [{ band: "A", marks: [5, 6], descriptor: "Five or six points." }],
      indicativeContent: [
        { point: "glucose is used", keyWords: ["glucose"] },
        { point: "oxygen is used", keyWords: ["oxygen"] },
      ],
    };
    expect(isAutoMarkable(qwc)).toBe(true);
    expect(expectedDisplay(qwc)).toBe("glucose is used; oxygen is used");
    expect(expectedDisplay({ ...qwc, indicativeContent: [] })).toBe("See the worked solution.");
  });
});

// Trial audit MK-13 (24 Sep 2026): the expected answer was set as inline maths, so a fraction in it rendered at about
// 11.5 px beside 15 px text, the smallest text on the miss card. A fraction in the expected answer is set at display
// size (\dfrac), as the stems set theirs; everything else is unchanged.
describe("expectedDisplay sets a fraction at display size (MK-13)", () => {
  test("\frac becomes \dfrac; \dfrac and \tfrac-free answers are left alone", () => {
    expect(expectedDisplay({ kind: "algebraic", latex: String.raw`\frac{2(x-2)}{x+3}`, equivalence: "equivalent", variables: ["x"] })).toBe(String.raw`$\dfrac{2(x-2)}{x+3}$`);
    expect(expectedDisplay({ kind: "algebraic", latex: String.raw`\dfrac{5}{x-4}`, equivalence: "equivalent", variables: ["x"] })).toBe(String.raw`$\dfrac{5}{x-4}$`);
    expect(expectedDisplay({ kind: "algebraic", latex: "3(x+3)(x-3)", equivalence: "equivalent", variables: ["x"] })).toBe("$3(x+3)(x-3)$");
  });
});
