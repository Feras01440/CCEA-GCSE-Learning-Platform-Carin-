import { describe, expect, test } from "vitest";
import { equationsMatch, markEquation, normaliseEquation, type EquationSpec } from "./equation-marking";

describe("normaliseEquation", () => {
  test("LaTeX and plain spellings collapse to the same string", () => {
    expect(normaliseEquation("v = f \\lambda")).toBe("v=fλ");
    expect(normaliseEquation("v=fλ")).toBe("v=fλ");
    expect(normaliseEquation("\\text{average speed} = \\frac{\\text{distance moved}}{\\text{time taken}}")).toBe(
      "averagespeed=distancemoved/timetaken",
    );
    expect(normaliseEquation("average speed = distance moved / time taken")).toBe("averagespeed=distancemoved/timetaken");
  });
  test("chemistry: subscripts, arrows and \\ce", () => {
    expect(normaliseEquation("\\ce{2H2 + O2 -> 2H2O}")).toBe("2H2+O2->2H2O");
    expect(normaliseEquation("2H₂ + O₂ → 2H₂O")).toBe("2H2+O2->2H2O");
    expect(normaliseEquation("Mg^{2+} + 2e^- -> Mg")).toBe("Mg^2++2e^-->Mg");
  });
  test("only the first line is the equation", () => {
    expect(normaliseEquation("E = m c^2\n= 3 × 2^2")).toBe("E=mc^2");
  });
  test("state symbols can be stripped", () => {
    expect(normaliseEquation("NaOH(aq) + HCl(aq) -> NaCl(aq) + H2O(l)", { stripStates: true })).toBe("NaOH+HCl->NaCl+H2O");
  });
  test("Latin-1 superscripts ² and ³ are read like the Unicode superscript block", () => {
    expect(normaliseEquation("E = m c²")).toBe("E=mc^2");
    expect(normaliseEquation("V = x³")).toBe(normaliseEquation("V = x^3"));
  });
  test("implicit multiplication drops the star between symbols but not between numbers", () => {
    expect(normaliseEquation("F = m × a", { implicitMultiply: true })).toBe("F=ma");
    expect(normaliseEquation("E = 1/2 × m × v²", { implicitMultiply: true })).toBe("E=1/2mv^2");
    expect(normaliseEquation("= 2 × 3", { implicitMultiply: true })).toBe("=2*3");
  });
});

describe("equationsMatch", () => {
  test("swapped sides for physics", () => {
    expect(equationsMatch("IR = V", "V = I R", { allowSwap: true, lowercase: true })).toBe(true);
    expect(equationsMatch("V = I / R", "V = I R", { allowSwap: true })).toBe(false);
  });
  test("multiples for chemistry", () => {
    expect(equationsMatch("4H2 + 2O2 -> 4H2O", "2H2 + O2 -> 2H2O", { acceptMultiples: true })).toBe(true);
    expect(equationsMatch("4H2 + 2O2 -> 4H2O", "2H2 + O2 -> 2H2O", { acceptMultiples: false })).toBe(false);
    expect(equationsMatch("O2 + 2H2 -> 2H2O", "2H2 + O2 -> 2H2O")).toBe(false);
    expect(equationsMatch("O2 + 2H2 -> 2H2O", "2H2 + O2 -> 2H2O", { acceptMultiples: true })).toBe(true);
  });
});

const physics: EquationSpec = {
  kind: "equation",
  kindOf: "physics",
  balancedLatex: "v = f \\lambda",
  stateSymbolsRequired: false,
  acceptMultiples: false,
};

const symbol: EquationSpec = {
  kind: "equation",
  kindOf: "symbol",
  balancedLatex: "\\ce{2H2 + O2 -> 2H2O}",
  stateSymbolsRequired: false,
  acceptMultiples: true,
};

describe("markEquation", () => {
  test("physics: equation line earned, working carried through", () => {
    const r = markEquation("v = fλ\n= 2 × 3\n= 6 m/s", physics);
    expect(r.correct).toBe(true);
    expect(r.equationLine).toBe("v = fλ");
    expect(r.working).toBe("= 2 × 3\n= 6 m/s");
  });
  test("physics: a wrong equation scores nothing and says so", () => {
    const r = markEquation("v = f / λ", physics);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/wrong equation scores nothing/i);
  });
  test("empty equation line", () => {
    expect(markEquation("\n= 6", physics).correct).toBe(false);
  });
  test("physics: a typed times sign between symbols still matches the vault", () => {
    expect(markEquation("v = f × λ", physics).correct).toBe(true);
    expect(markEquation("v = f*λ", physics).correct).toBe(true);
  });
  test("chemistry: balanced, multiples, unbalanced diagnosis", () => {
    expect(markEquation("2H2 + O2 → 2H2O", symbol).correct).toBe(true);
    expect(markEquation("4H2 + 2O2 → 4H2O", symbol).correct).toBe(true);
    const r = markEquation("H2 + O2 → H2O", symbol);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/not balanced/i);
    expect(markEquation("H2 + Cl2 → 2HCl", symbol).feedback).toMatch(/not the expected equation/i);
  });
  test("state symbols required", () => {
    const withStates: EquationSpec = { ...symbol, stateSymbolsRequired: true, balancedLatex: "2H2(g) + O2(g) -> 2H2O(l)" };
    const r = markEquation("2H2 + O2 -> 2H2O", withStates);
    expect(r.correct).toBe(false);
    expect(r.missingStateSymbols).toBe(true);
    expect(markEquation("2H2(g) + O2(g) -> 2H2O(l)", withStates).correct).toBe(true);
  });
});

describe("ion charges typed with the key strip", () => {
  test("a plain digit before a superscript sign is the charge; a subscript digit stays in the formula", () => {
    const canon = normaliseEquation("Fe^{3+}");
    expect(normaliseEquation("Fe3⁺")).toBe(canon);
    expect(normaliseEquation("Fe³⁺")).toBe(canon);
    expect(normaliseEquation("Fe^3+")).toBe(canon);
    expect(normaliseEquation("NH₄⁺")).toBe(normaliseEquation("NH_4^+"));
    expect(normaliseEquation("SO₄2⁻")).toBe(normaliseEquation("SO_4^{2-}"));
  });
});

describe("chemistry formulae keep their brackets, and a $…$ wrapper is ignored", () => {
  const spec = { kind: "equation", kindOf: "symbol", balancedLatex: "Mg + 2AgNO3 -> Mg(NO3)2 + 2Ag", stateSymbolsRequired: false, acceptMultiples: true } as const;
  test("MgNO32 is not Mg(NO3)2", () => {
    expect(markEquation("Mg + 2AgNO3 -> Mg(NO3)2 + 2Ag", spec as never).correct).toBe(true);
    expect(markEquation("Mg + 2AgNO3 -> MgNO32 + 2Ag", spec as never).correct).toBe(false);
  });
  test("the notes' $\\ce{…}$ form marks as the bare equation does", () => {
    expect(markEquation("$\\ce{Mg + 2AgNO3 -> Mg(NO3)2 + 2Ag}$", spec as never).correct).toBe(true);
    expect(normaliseEquation("$$F = m \\times a$$", { implicitMultiply: true })).toBe("F=ma");
  });
  test("a physics formula still drops brackets that only wrap a symbol", () => {
    expect(normaliseEquation("speed = (distance moved) / (time taken)", { implicitMultiply: true })).toBe("speed=distancemoved/timetaken");
  });
});

describe("a \\ce{…} wrapper around a charge written with braces", () => {
  const spec = { kind: "equation", kindOf: "half", balancedLatex: "Fe -> Fe^{3+} + 3e^-", stateSymbolsRequired: false, acceptMultiples: true } as const;
  test("the note's own $\\ce{Fe -> Fe^{3+} + 3e^-}$ marks as the bare line does", () => {
    expect(markEquation("$\\ce{Fe -> Fe^{3+} + 3e^-}$", spec as never).correct).toBe(true);
    expect(markEquation("\\ce{Fe -> Fe^{3+} + 3e^-}", spec as never).correct).toBe(true);
    expect(markEquation("\\ce{Fe -> Fe^{2+} + 2e^-}", spec as never).correct).toBe(false);
    expect(normaliseEquation("\\ce{2H2 + O2 -> 2H2O}")).toBe("2H2+O2->2H2O");
  });
});
