import { describe, expect, test } from "vitest";
import {
  checkLabel,
  describeLabelExpect,
  formatLabelResponse,
  labelBank,
  labelMatches,
  labelResponseText,
  namedTargets,
  parseLabelResponse,
  type LabelExpect,
} from "./label";

/** "Name the structure that (i) … (ii) …" over a labelled plant cell. */
const cell: LabelExpect = {
  targets: [
    { id: "i", accepted: ["cell wall", "cellulose cell wall"], position: [430, 70] },
    { id: "ii", accepted: ["nucleus"], position: [470, 130] },
    { id: "iii", accepted: ["chloroplast", "chloroplasts"], position: [690, 120] },
    { id: "iv", accepted: ["vacuole", "large permanent vacuole"], position: [580, 180] },
  ],
  bank: ["cell wall", "cell membrane", "cytoplasm", "nucleus", "chloroplast", "vacuole", "mitochondria"],
};
/** Ids that spell the answer, placed on the figure out of top-to-bottom order. */
const enzyme: LabelExpect = {
  targets: [
    { id: "enzyme", accepted: ["enzyme"], position: [140, 190] },
    { id: "active-site", accepted: ["active site"], position: [140, 151] },
    { id: "substrate", accepted: ["substrate"], position: [140, 93] },
  ],
  bank: ["enzyme", "substrate", "active site", "product"],
};
const labelled = (labels: Record<string, string>) => formatLabelResponse({ labels });

describe("targets are named without giving the answer away", () => {
  test("ids a stem refers to are shown as the stem writes them, in the spec's order", () => {
    expect(namedTargets(cell).map((t) => t.name)).toEqual(["(i)", "(ii)", "(iii)", "(iv)"]);
    expect(namedTargets({ targets: [{ id: "b", accepted: ["x"] }, { id: "3", accepted: ["y"] }], bank: [] }).map((t) => t.name)).toEqual(["(b)", "(3)"]);
  });
  test("ids that spell the answer become Label 1, 2, 3 down the figure", () => {
    expect(namedTargets(enzyme).map((t) => `${t.name} ${t.target.id}`)).toEqual(["Label 1 substrate", "Label 2 active-site", "Label 3 enzyme"]);
    const unplaced: LabelExpect = { targets: [{ id: "left-atrium", accepted: ["left atrium"] }, { id: "aorta", accepted: ["aorta"] }], bank: [] };
    expect(namedTargets(unplaced).map((t) => t.name)).toEqual(["Label 1", "Label 2"]);
  });
  test("the expected line uses the same names", () => {
    expect(describeLabelExpect(cell)).toBe("(i) cell wall, (ii) nucleus, (iii) chloroplast, (iv) vacuole");
    expect(describeLabelExpect(enzyme)).toBe("Label 1 substrate, Label 2 active site, Label 3 enzyme");
  });
});

describe("the word bank", () => {
  test("is offered in the author's order, without repeats, and the accepted names stand in for a missing one", () => {
    expect(labelBank(cell)).toEqual(cell.bank);
    expect(labelBank({ targets: cell.targets, bank: ["nucleus", "nucleus", "vacuole"] })).toEqual(["nucleus", "vacuole"]);
    expect(labelBank({ targets: cell.targets, bank: [] })).toEqual(["cell wall", "nucleus", "chloroplast", "vacuole"]);
  });
  test("a chosen name matches any accepted spelling, case- and punctuation-blind", () => {
    expect(labelMatches("Cell wall", cell.targets[0]!)).toBe(true);
    expect(labelMatches("cellulose cell wall", cell.targets[0]!)).toBe(true);
    expect(labelMatches("cell membrane", cell.targets[0]!)).toBe(false);
    expect(labelMatches("", cell.targets[0]!)).toBe(false);
  });
});

describe("checkLabel: the targets she has not got", () => {
  test("are named by id, in the spec's order, so the re-teach can name their mark point (engine item 7)", () => {
    expect(checkLabel(labelled({ i: "cell membrane", ii: "nucleus", iv: "vacuole" }), cell).unmet).toEqual(["i", "iii"]);
    expect(checkLabel(labelled({ i: "cell wall", ii: "nucleus", iii: "chloroplast", iv: "vacuole" }), cell).unmet).toEqual([]);
    expect(checkLabel("not json", cell).unmet).toEqual(["i", "ii", "iii", "iv"]);
  });
});

describe("checkLabel", () => {
  test("every target right", () => {
    const v = checkLabel(labelled({ i: "cell wall", ii: "nucleus", iii: "chloroplast", iv: "vacuole" }), cell);
    expect(v).toMatchObject({ correct: true, earned: 4, total: 4, feedback: "Every label is right." });
    const one: LabelExpect = { targets: [cell.targets[1]!], bank: cell.bank };
    expect(checkLabel(labelled({ ii: "nucleus" }), one).feedback).toBe("The label is right.");
  });
  test("a swapped or missing label is named with what it is, and the count leads", () => {
    const v = checkLabel(labelled({ i: "cell membrane", ii: "nucleus", iii: "chloroplast", iv: "vacuole" }), cell);
    expect(v).toMatchObject({ correct: false, earned: 3, total: 4 });
    expect(v.feedback).toBe("3 of 4 labels are right. (i) is the cell wall, not the cell membrane.");
    const two = checkLabel(labelled({ i: "cytoplasm", ii: "nucleus", iv: "vacuole" }), cell);
    expect(two).toMatchObject({ correct: false, earned: 2 });
    expect(two.feedback).toBe("2 of 4 labels are right. (i) is the cell wall, not the cytoplasm. (iii) is not labelled yet; it is the chloroplast.");
    expect(checkLabel(labelled({ enzyme: "product", "active-site": "active site", substrate: "substrate" }), enzyme).feedback).toBe(
      "2 of 3 labels are right. Label 3 is the enzyme, not the product.",
    );
    expect(checkLabel(labelled({ i: "cell wall" }), cell).feedback).toMatch(/^1 of 4 labels is right\. /);
  });
  test("a response that is not the field's JSON scores nothing, and no feedback says wrong", () => {
    expect(checkLabel("cell wall, nucleus", cell)).toMatchObject({ correct: false, earned: 0, total: 4, feedback: "Nothing has been labelled yet." });
    expect(parseLabelResponse('{"labels":[]}')).toBeNull();
    expect(parseLabelResponse('{"labels":{"i":" cell wall ","ii":"","iii":3}}')).toEqual({ labels: { i: "cell wall" } });
    expect(checkLabel(labelled({ i: "cytoplasm" }), cell).feedback).not.toMatch(/wrong/i);
  });
  test("the chosen names read in target order for common-error patterns", () => {
    expect(labelResponseText(labelled({ i: "cell membrane", ii: "nucleus", iii: "chloroplast", iv: "vacuole" }), cell)).toBe("cell membrane, nucleus, chloroplast, vacuole");
    expect(labelResponseText(labelled({ iv: "vacuole", i: "cell wall" }), cell)).toBe("cell wall, vacuole");
    expect(labelResponseText("nucleus", cell)).toBe("nucleus");
  });
});
