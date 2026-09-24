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

// C2 D F05 (24 Sep 2026): the balanced combustion of ethanol with ethanol written CH3CH2OH or C2H6O scored 0/3
// against "C2H5OH + 3O2 -> 2CO2 + 3H2O": the species were compared as strings. CCEA credits another correct formula of
// an organic compound (C2 Higher MS Summer 2021 "C3H8O/C3H7OH" for propanol; Summer 2022 "allow C3H7OH"), so an
// organic species (one with carbon and hydrogen) is the same species whenever its atoms are the same.
describe("an organic compound's formula written another correct way", () => {
  const spec = { kind: "equation" as const, kindOf: "symbol" as const, balancedLatex: "C2H5OH + 3O2 -> 2CO2 + 3H2O", stateSymbolsRequired: false, acceptMultiples: true };
  test.each(["CH3CH2OH + 3O2 → 2CO2 + 3H2O", "C2H6O + 3O2 → 2CO2 + 3H2O", "C2H5OH + 3O2 → 2CO2 + 3H2O", "3O2 + CH3CH2OH → 3H2O + 2CO2", "2CH3CH2OH + 6O2 → 4CO2 + 6H2O"])(
    "%s is the balanced equation",
    (typed) => {
      expect(markEquation(typed, spec).correct).toBe(true);
    },
  );
  test("the same atoms unbalanced are still unbalanced, and a different compound is a different species", () => {
    const unbalanced = markEquation("CH3CH2OH + O2 → CO2 + H2O", spec);
    expect(unbalanced.correct).toBe(false);
    expect(unbalanced.feedback).toMatch(/not balanced/);
    expect(markEquation("CH3OH + 3O2 → 2CO2 + 3H2O", spec).correct).toBe(false);
    expect(markEquation("C2H4 + 3O2 → 2CO2 + 2H2O", spec).correct).toBe(false);
  });
  test("an inorganic formula keeps its written order: H2O is not OH2", () => {
    expect(markEquation("C2H5OH + 3O2 → 2CO2 + 3OH2", spec).correct).toBe(false);
    expect(markEquation("C2H5OH + 3O2 → 2OCO + 3H2O", spec).correct).toBe(false);
  });
  test("brackets and a hydrate still read as written", () => {
    const nitrate = { ...spec, balancedLatex: "Mg + 2AgNO3 -> Mg(NO3)2 + 2Ag" };
    expect(markEquation("Mg + 2AgNO3 → Mg(NO3)2 + 2Ag", nitrate).correct).toBe(true);
    expect(markEquation("Mg + 2AgNO3 → MgN2O6 + 2Ag", nitrate).correct).toBe(false);
    const ester = { ...spec, balancedLatex: "CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O" };
    expect(markEquation("CH3COOH + CH3CH2OH ⇌ CH3COOCH2CH3 + H2O", ester).correct).toBe(true);
  });
});

describe("another correct organic formula where multiples are not accepted", () => {
  const spec = { kind: "equation" as const, kindOf: "symbol" as const, balancedLatex: "C2H4 + H2O -> C2H5OH", stateSymbolsRequired: false, acceptMultiples: false };
  test("the same equation with ethanol written CH3CH2OH is right; a multiple of it is not", () => {
    expect(markEquation("C2H4 + H2O → CH3CH2OH", spec).correct).toBe(true);
    // A structural formula with its double bond is ethene too.
    expect(markEquation("H2O + CH2=CH2 → C2H5OH", spec).correct).toBe(true);
    expect(markEquation("CH2CH2 + H2O → C2H5OH", spec).correct).toBe(true);
    expect(markEquation("2C2H4 + 2H2O → 2CH3CH2OH", spec).correct).toBe(false);
  });
  test("a physics equation is not read as species", () => {
    const physics = { kind: "equation" as const, kindOf: "physics" as const, balancedLatex: "v = u + at", stateSymbolsRequired: false, acceptMultiples: false };
    expect(markEquation("v = at + u", physics).correct).toBe(false);
  });
});

// C2 E (24 Sep 2026): a half equation with the electron typed with a keyboard minus, "Zn²⁺ + 2e- → Zn", was refused
// while "e⁻", "e^-" and "e^{-}" passed. A keyboard has no superscripts, so a charge typed after a species ("e-", "Cl-",
// "Zn2+", "O2-") is read as a charge. Where a digit comes before the sign it may be the charge's size ("Zn2+") or the
// formula's last count ("NH4+"): both readings are tried against the key, and the equation is right if one of them is.
describe("charges typed with a keyboard minus or plus", () => {
  const half = (balancedLatex: string) => ({ kind: "equation" as const, kindOf: "half" as const, balancedLatex, stateSymbolsRequired: false, acceptMultiples: false });
  test.each([
    ["Zn^{2+} + 2e^- -> Zn", "Zn²⁺ + 2e- → Zn"],
    ["Zn^{2+} + 2e^- -> Zn", "Zn2+ + 2e- -> Zn"],
    ["2O^{2-} -> O2 + 4e^-", "2O²⁻ → O₂ + 4e-"],
    ["2O^{2-} -> O2 + 4e^-", "2O2- → O2 + 4e-"],
    ["2Cl^- -> Cl2 + 2e^-", "2Cl- → Cl2 + 2e-"],
    ["Li^+ + e^- -> Li", "Li+ + e- → Li"],
    ["Fe -> Fe^{3+} + 3e^-", "Fe → Fe3+ + 3e-"],
    ["NH4^+ + OH^- -> NH3 + H2O", "NH4+ + OH- → NH3 + H2O"],
  ])("key %s: %s is right", (key, typed) => {
    expect(markEquation(typed, half(key)).correct).toBe(true);
  });
  test.each([
    ["Zn^{2+} + 2e^- -> Zn", "Zn+ + 2e- → Zn"],
    ["Zn^{2+} + 2e^- -> Zn", "Zn2+ + e- → Zn"],
    ["Fe -> Fe^{3+} + 3e^-", "Fe → Fe2+ + 3e-"],
    ["2Cl^- -> Cl2 + 2e^-", "2Cl → Cl2 + 2e-"],
    ["2O^{2-} -> O2 + 4e^-", "2O- → O2 + 4e-"],
  ])("key %s: %s is not", (key, typed) => {
    expect(markEquation(typed, half(key)).correct).toBe(false);
  });
  test("an electron is never an element or a charge on the species before it", () => {
    // "2e-" is two electrons; the sign belongs to e, not to a separator.
    expect(markEquation("Mg2+ + 2e- → Mg", half("Mg^{2+} + 2e^- -> Mg")).correct).toBe(true);
    expect(markEquation("Mg → Mg2+ + 2e-", half("Mg -> Mg^{2+} + 2e^-")).correct).toBe(true);
  });
});

// Found 25 Sep 2026 while reading schemes: a key written with \rightarrow ("… 6O_2 \rightarrow \text{energy} + …", 10
// published parts in b1 respiration and photosynthesis) lost its arrow, because "\right" was stripped as a bracket
// size before the arrow was read ("\rightarrow" became "arrow"), so every typed arrow, → or ->, was refused.
describe("a key written with \\rightarrow keeps its arrow", () => {
  const spec = {
    kind: "equation",
    kindOf: "symbol",
    balancedLatex: String.raw`C_6H_{12}O_6 + 6O_2 \rightarrow \text{energy} + 6CO_2 + 6H_2O`,
    stateSymbolsRequired: false,
    acceptMultiples: true,
  } as const;
  test("the typed arrow, either spelling, matches it", () => {
    expect(normaliseEquation(spec.balancedLatex)).toBe("C6H12O6+6O2->energy+6CO2+6H2O");
    expect(markEquation("C6H12O6 + 6O2 → energy + 6CO2 + 6H2O", spec as never).correct).toBe(true);
    expect(markEquation("C6H12O6 + 6O2 -> energy + 6CO2 + 6H2O", spec as never).correct).toBe(true);
  });
  test("\\left and \\right brackets still come off", () => {
    expect(normaliseEquation(String.raw`\left(x\right)`)).toBe("(x)");
  });
});
