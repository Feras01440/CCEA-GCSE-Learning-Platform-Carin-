import { describe, expect, test } from "vitest";
import type { AnswerSpec, MarkPoint } from "@/lib/content/schema";
import { markAnswer } from "./mark";
import { equationSchemeMarks, markEquation } from "./equation-marking";

// C2 D F05 (verifier, 24 Sep 2026): a chemical equation part paid all or nothing, so the right products with the wrong
// reactants, or every formula right and the balancing wrong, earned 0 of 3 where CCEA's scheme ("LHS [1], RHS [1],
// balancing [1]", C2 Higher MS Summer 2022; 2021 general guidance §7(a)(i)) pays each. The part's own scheme says what
// each mark is for; where every point is one the engine can read (reactants, products, both sides' formulae,
// balancing, state symbols, the reversible sign, electrons on the right side, or a named species), each is paid on its
// own. A point it cannot read leaves the part all or nothing, as before, and a miss never earns every mark.
const point = (id: string, marks: number, text: string): MarkPoint => ({ id, code: "P", marks, for: text }) as MarkPoint;
const eq = (balancedLatex: string, kindOf: "symbol" | "half" | "word" | "ionic" = "symbol", extra: Partial<Extract<AnswerSpec, { kind: "equation" }>> = {}) =>
  ({ kind: "equation", kindOf, balancedLatex, stateSymbolsRequired: false, acceptMultiples: true, ...extra }) as Extract<AnswerSpec, { kind: "equation" }>;

describe("equationSchemeMarks: each point read from the part's own scheme", () => {
  const ethanol = eq("C2H5OH + 3O2 -> 2CO2 + 3H2O");
  const lhsRhsBal = [
    point("P1", 1, "reactants: C2H5OH + O2"),
    point("P2", 1, "products: CO2 + H2O"),
    point("P3", 1, "balanced: C2H5OH + 3O2 → 2CO2 + 3H2O"),
  ];
  test("c2 alcohols .0008: the right formulae unbalanced earn the two formula marks", () => {
    expect(equationSchemeMarks("C2H5OH + O2 → CO2 + H2O", ethanol, lhsRhsBal)).toBe(2);
    expect(equationSchemeMarks("CH3CH2OH + O2 → CO2 + H2O", ethanol, lhsRhsBal)).toBe(2);
  });
  test("the right products with a wrong reactant earn the products' mark only", () => {
    expect(equationSchemeMarks("C2H6 + O2 → CO2 + H2O", ethanol, lhsRhsBal)).toBe(1);
    expect(equationSchemeMarks("C2H5OH + O2 → CO + H2O", ethanol, lhsRhsBal)).toBe(1);
  });
  test("nothing right is nothing; the whole equation is every point", () => {
    expect(equationSchemeMarks("C2H4 + H2 → C2H6", ethanol, lhsRhsBal)).toBe(0);
    expect(equationSchemeMarks("C2H5OH + 3O2 → 2CO2 + 3H2O", ethanol, lhsRhsBal)).toBe(3);
  });
  test("formulae on both sides, then balancing", () => {
    const pts = [point("P1", 1, "correct formulae on both sides"), point("P2", 1, "balanced: C2H4 + 3O2 -> 2CO2 + 2H2O")];
    const s = eq("C2H4 + 3O2 -> 2CO2 + 2H2O");
    expect(equationSchemeMarks("C2H4 + O2 → CO2 + H2O", s, pts)).toBe(1);
    expect(equationSchemeMarks("C2H4 + O2 → CO2 + H2", s, pts)).toBe(0);
  });
  test("state symbols are their own mark, on the right formulae", () => {
    const s = eq("Mg(s) + H2O(g) -> MgO(s) + H2(g)", "symbol", { stateSymbolsRequired: true });
    const pts = [point("P1", 1, "correct reactants: Mg and H2O"), point("P2", 1, "correct products: MgO and H2"), point("P3", 1, "state symbols: (s) for the metal and its oxide, (g) for the steam and the hydrogen")];
    expect(equationSchemeMarks("Mg + H2O → MgO + H2", s, pts)).toBe(2);
    expect(equationSchemeMarks("Mg(s) + H2O(l) → MgO(s) + H2(g)", s, pts)).toBe(2);
    expect(equationSchemeMarks("Mg(s) + H2O(g) → MgO(s) + H2(g)", s, pts)).toBe(3);
  });
  test("the reversible sign is its own mark", () => {
    const s = eq("N2 + 3H2 <=> 2NH3");
    const pts = [point("P1", 1, "correct formulae and balancing: N2 + 3H2 and 2NH3"), point("P2", 1, "the reversible sign in place of a single arrow")];
    expect(equationSchemeMarks("N2 + 3H2 → 2NH3", s, pts)).toBe(1);
    expect(equationSchemeMarks("N2 + H2 ⇌ NH3", s, pts)).toBe(1);
  });
  test("a half equation: the ion and product, the electrons' side, the balancing", () => {
    const s = eq("Al^{3+} + 3e^- -> Al", "half");
    const pts = [
      point("P1", 1, "correct ion and product with an arrow: Al³⁺ → Al"),
      point("P2", 1, "electrons on the correct side (on the left, because they are gained)"),
      point("P3", 1, "correct balancing: three electrons"),
    ];
    expect(equationSchemeMarks("Al3+ + e- → Al", s, pts)).toBe(2);
    expect(equationSchemeMarks("Al3+ → Al + 3e-", s, pts)).toBe(1);
    expect(equationSchemeMarks("Al → Al3+ + 3e-", s, pts)).toBe(0);
  });
  test("named species, a gap-fill scheme", () => {
    const s = eq(String.raw`C_6H_{12}O_6 + 6O_2 \rightarrow \text{energy} + 6CO_2 + 6H_2O`);
    const pts = [point("P1", 1, "C₆H₁₂O₆"), point("P2", 1, "6CO₂")];
    expect(equationSchemeMarks("C6H12O6 + 6O2 → energy + 6CO2 + 6H2O", s, pts)).toBe(2);
    expect(equationSchemeMarks("C6H12O6 + 6O2 → energy + CO2 + 6H2O", s, pts)).toBe(1);
    const word = eq(String.raw`\text{glucose} + \text{oxygen} \rightarrow \text{energy} + \text{carbon dioxide} + \text{water}`, "word");
    const wp = [point("P1", 1, "oxygen"), point("P2", 1, "energy"), point("P3", 1, "carbon dioxide")];
    expect(equationSchemeMarks("glucose + oxygen → energy + carbon dioxide + water", word, wp)).toBe(3);
    expect(equationSchemeMarks("glucose + oxygen → carbon dioxide + water", word, wp)).toBe(2);
    expect(equationSchemeMarks("glucose → energy + carbon dioxide + oxygen", word, wp)).toBe(2);
  });
  test("a point the engine cannot read leaves the part all or nothing", () => {
    const pts = [point("P1", 1, "reactants: C2H5OH + O2"), point("P2", 2, "a sensible explanation of why the flame is yellow")];
    expect(equationSchemeMarks("C2H5OH + O2 → CO2 + H2O", ethanol, pts)).toBeNull();
  });
});

describe("markAnswer pays an equation part point by point, never every mark on a miss", () => {
  const ethanol = eq("C2H5OH + 3O2 -> 2CO2 + 3H2O");
  const scheme = [point("P1", 1, "reactants: C2H5OH + O2"), point("P2", 1, "products: CO2 + H2O"), point("P3", 1, "balanced: C2H5OH + 3O2 → 2CO2 + 3H2O")];
  test("unbalanced: 2 of 3, with the balancing named", () => {
    const r = markAnswer("C2H5OH + O2 → CO2 + H2O", ethanol, { marks: 3, scheme });
    expect(r).toMatchObject({ correct: false, marksAwarded: 2, marksAvailable: 3 });
    expect(r.explanation).toMatch(/not balanced/);
  });
  test("right: 3 of 3; without a scheme, all or nothing as before", () => {
    expect(markAnswer("C2H5OH + 3O2 → 2CO2 + 3H2O", ethanol, { marks: 3, scheme })).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(markAnswer("C2H5OH + O2 → CO2 + H2O", ethanol, { marks: 3 })).toMatchObject({ correct: false, marksAwarded: 0 });
  });
});

// The independent verifier (25 Sep 2026). (1) A missing reversible sign scored full marks: the like-for-like species
// comparison ignored the arrow. CCEA C2 H 2021: "(proper reversible sign needed) Reversible sign [1] correct equation
// [1]". A match compares arrows; the scheme's reversible point runs. (2) Equation scheme points ignored dependsOn:
// "Zn + 2e- → Zn2+" earned 1/3 on a 3-point half equation whose later points depend on the first ("second mark
// dependent on first", C1 H 2018). A point is paid only with the points it depends on.
describe("the reversible sign and dependent points in an equation", () => {
  const hydrate = { kind: "equation" as const, kindOf: "symbol" as const, balancedLatex: "CuSO4.5H2O <=> CuSO4 + 5H2O", stateSymbolsRequired: false, acceptMultiples: true };
  const hydrateScheme = [point("P1", 1, "correct reactant: CuSO4.5H2O"), point("P2", 1, "correct products: CuSO4 and H2O"), point("P3", 1, "balancing (5H2O) and the reversible sign")];
  test("c2-equilibrium .0004: a single arrow is not the equation, and loses the reversible point", () => {
    expect(markEquation("CuSO4.5H2O → CuSO4 + 5H2O", hydrate).correct).toBe(false);
    expect(markAnswer("CuSO4.5H2O → CuSO4 + 5H2O", hydrate, { marks: 3, scheme: hydrateScheme })).toMatchObject({ correct: false, marksAwarded: 2 });
    expect(markAnswer("CuSO4.5H2O ⇌ CuSO4 + 5H2O", hydrate, { marks: 3, scheme: hydrateScheme })).toMatchObject({ correct: true, marksAwarded: 3 });
  });
  test("c2-equilibrium .0009(a): N2 + 3H2 → 2NH3 is 1 of 2", () => {
    const s = { ...hydrate, balancedLatex: "N2 + 3H2 <=> 2NH3" };
    const pts = [point("P1", 1, "correct formulae and balancing: N2 + 3H2 and 2NH3"), point("P2", 1, "the reversible sign in place of a single arrow")];
    expect(markAnswer("N2 + 3H2 → 2NH3", s, { marks: 2, scheme: pts })).toMatchObject({ correct: false, marksAwarded: 1 });
  });
  test("a reversible sign where a single arrow belongs is not the equation either", () => {
    const s = { ...hydrate, balancedLatex: "2H2 + O2 -> 2H2O" };
    expect(markEquation("2H2 + O2 ⇌ 2H2O", s).correct).toBe(false);
  });
  test("c2-electrolysis .0010: a dependent point is not paid without the point it depends on", () => {
    const zinc = { kind: "equation" as const, kindOf: "half" as const, balancedLatex: "Zn^{2+} + 2e^- -> Zn", stateSymbolsRequired: false, acceptMultiples: false };
    const pts = [
      { ...point("P1", 1, "correct ion and product with an arrow: Zn²⁺ → Zn") },
      { ...point("P2", 1, "electrons on the correct side (on the left, because they are gained)"), dependsOn: ["P1"] },
      { ...point("P3", 1, "correct balancing: two electrons"), dependsOn: ["P1"] },
    ];
    expect(markAnswer("Zn + 2e- → Zn2+", zinc, { marks: 3, scheme: pts }).marksAwarded).toBe(0);
    expect(markAnswer("Zn2+ + e- → Zn", zinc, { marks: 3, scheme: pts }).marksAwarded).toBe(2);
  });
});
