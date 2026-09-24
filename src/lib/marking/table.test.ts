import { describe, expect, test } from "vitest";
import {
  cellLabel,
  checkTable,
  describeTableExpect,
  formatCellValue,
  formatTableResponse,
  numericCellMatches,
  parseTableResponse,
  tableResponseText,
  textCellMatches,
  type TableExpect,
} from "./table";

/** The frequency-density row of a histogram table: spec row 1 (the second row under the headings), columns 1 to 4. */
const density: TableExpect = {
  cells: [
    { row: 1, col: 1, value: 3 },
    { row: 1, col: 2, value: 4 },
    { row: 1, col: 3, value: 3.6 },
    { row: 1, col: 4, value: 1.5 },
  ],
};
const filled = (values: string[]) => formatTableResponse({ cells: density.cells.map((c, i) => ({ row: c.row, col: c.col, value: values[i] ?? "" })) });

describe("cells are named the way she counts them", () => {
  test("from 1, under the headings and from the left-hand column", () => {
    expect(cellLabel({ row: 0, col: 0 })).toBe("Row 1, column 1");
    expect(cellLabel({ row: 1, col: 3 })).toBe("Row 2, column 4");
  });
  test("the expected line lists every cell by name", () => {
    expect(describeTableExpect({ cells: density.cells.slice(0, 2) })).toBe("Row 2, column 2: 3; Row 2, column 3: 4");
  });
});

describe("numeric cells", () => {
  test("without a tolerance the value must be as written, in any spelling of the same number", () => {
    expect(numericCellMatches("3.6", 3.6)).toBe(true);
    expect(numericCellMatches("3.60", 3.6)).toBe(true);
    expect(numericCellMatches("3.5", 3.6)).toBe(false);
    expect(numericCellMatches("-3", -3)).toBe(true);
    expect(numericCellMatches("three", 3)).toBe(false);
    expect(numericCellMatches("0.5", 0.5, { type: "exact" })).toBe(true);
  });
  test("a decimal-places tolerance accepts the rounded value and the fuller one", () => {
    const dp3 = { type: "dp" as const, places: 3 };
    expect(numericCellMatches("2.716", 2.715846995, dp3)).toBe(true);
    expect(numericCellMatches("2.715846995", 2.715846995, dp3)).toBe(true);
    expect(numericCellMatches("2.72", 2.715846995, dp3)).toBe(false);
    expect(numericCellMatches("9.36", 9.365, dp3)).toBe(false);
  });
  test("the expected value is shown to the accuracy its tolerance names, with a proper minus", () => {
    expect(formatCellValue({ row: 0, col: 0, value: 2.715846995, tolerance: { type: "dp", places: 3 } })).toBe("2.716");
    expect(formatCellValue({ row: 0, col: 0, value: 0.5, tolerance: { type: "exact" } })).toBe("0.5");
    expect(formatCellValue({ row: 0, col: 0, value: -3 })).toBe("−3");
    expect(formatCellValue({ row: 0, col: 0, value: "amino acids" })).toBe("amino acids");
  });
});

describe("text cells", () => {
  test("case, punctuation and hyphens do not matter", () => {
    expect(textCellMatches("Glucose", "glucose")).toBe(true);
    expect(textCellMatches("yellow brown", "yellow-brown")).toBe(true);
    expect(textCellMatches("Yellow-Brown.", "yellow-brown")).toBe(true);
  });
  test("the cell is the whole answer: framing words around it are fine, a part of it is not enough", () => {
    expect(textCellMatches("a brick red precipitate forms", "brick red precipitate")).toBe(true);
    expect(textCellMatches("it is glucose", "glucose")).toBe(true);
    expect(textCellMatches("It's XX.", "XX")).toBe(true);
    expect(textCellMatches("brick red", "brick red precipitate")).toBe(false);
    expect(textCellMatches("amino acid", "amino acids")).toBe(true);
  });
  test("an answer that only contains the expected text is not it: a hedge or a negation scores nothing (engine item 6)", () => {
    // A cell used to match whenever the answer contained the expected phrase, so "XX or XY" earned an XX box.
    expect(textCellMatches("XX or XY", "XX")).toBe(false);
    expect(textCellMatches("XY or XX", "XX")).toBe(false);
    expect(textCellMatches("XX/XY", "XX")).toBe(false);
    expect(textCellMatches("XX and XY", "XX")).toBe(false);
    expect(textCellMatches("not XX", "XX")).toBe(false);
    expect(textCellMatches("glucose or storage", "glucose")).toBe(false);
    expect(textCellMatches("simple sugars and protein", "simple sugars")).toBe(false);
  });
  test("an expected value written with alternatives accepts any of them", () => {
    expect(textCellMatches("purple", "lilac/purple")).toBe(true);
    expect(textCellMatches("lilac", "lilac/purple")).toBe(true);
    expect(textCellMatches("blue", "lilac/purple")).toBe(false);
    expect(textCellMatches("", "lilac/purple")).toBe(false);
  });
});

describe("checkTable: b2-sex-determination-genetic-conditions-screening .0002 (a), the Punnett square (engine item 6)", () => {
  const square: TableExpect = {
    cells: [
      { row: 0, col: 1, value: "XX" },
      { row: 0, col: 2, value: "XY" },
      { row: 1, col: 1, value: "XX" },
      { row: 1, col: 2, value: "XY" },
    ],
  };
  const boxes = (values: string[]) => formatTableResponse({ cells: square.cells.map((c, i) => ({ row: c.row, col: c.col, value: values[i] ?? "" })) });
  test("the four boxes right, in either case", () => {
    expect(checkTable(boxes(["XX", "XY", "XX", "XY"]), square)).toMatchObject({ correct: true, earned: 4 });
    expect(checkTable(boxes(["xx", "xy", "xx", "xy"]), square)).toMatchObject({ correct: true, earned: 4 });
  });
  test("hedging every box earns nothing", () => {
    const v = checkTable(boxes(["XX or XY", "XX or XY", "XX or XY", "XX or XY"]), square);
    expect(v).toMatchObject({ correct: false, earned: 0 });
    expect(v.feedback).toMatch(/Row 1, column 2 should be "XX", not "XX or XY"/);
  });
});

describe("checkTable", () => {
  test("every cell right, in any spelling of the numbers", () => {
    const v = checkTable(filled(["3", "4.0", "3.60", "1.5"]), density);
    expect(v).toMatchObject({ correct: true, earned: 4, total: 4, feedback: "Every cell is right." });
    const one: TableExpect = { cells: [{ row: 5, col: 1, value: 300 }] };
    expect(checkTable(formatTableResponse({ cells: [{ row: 5, col: 1, value: "300" }] }), one).feedback).toBe("The cell is right.");
  });
  test("a cell that is off is named with what it should be, and the count leads", () => {
    const v = checkTable(filled(["3", "40", "3.6", "1.5"]), density);
    expect(v).toMatchObject({ correct: false, earned: 3, total: 4 });
    expect(v.feedback).toBe("3 of 4 cells are right. Row 2, column 3 should be 4, not 40.");
  });
  test("a blank cell is asked for, and nothing right drops the count", () => {
    const v = checkTable(filled(["15", "40", "", "30"]), density);
    expect(v).toMatchObject({ correct: false, earned: 0, total: 4 });
    expect(v.feedback).toBe(
      "Row 2, column 2 should be 3, not 15. Row 2, column 3 should be 4, not 40. Row 2, column 4 is not filled in yet; it should be 3.6. Row 2, column 5 should be 1.5, not 30.",
    );
  });
  test("text cells quote the wording", () => {
    const words: TableExpect = {
      cells: [
        { row: 0, col: 1, value: "glucose" },
        { row: 0, col: 2, value: "lilac/purple" },
      ],
    };
    const v = checkTable(
      formatTableResponse({
        cells: [
          { row: 0, col: 1, value: "sugar" },
          { row: 0, col: 2, value: "Purple" },
        ],
      }),
      words,
    );
    expect(v).toMatchObject({ correct: false, earned: 1, total: 2 });
    expect(v.feedback).toBe('1 of 2 cells is right. Row 1, column 2 should be "glucose", not "sugar".');
  });
  test("a response that is not the field's JSON scores nothing, and malformed cells are skipped", () => {
    expect(checkTable("3, 4, 3.6, 1.5", density)).toMatchObject({ correct: false, earned: 0, total: 4, feedback: "Nothing has been filled in yet." });
    expect(parseTableResponse("{}")).toBeNull();
    expect(parseTableResponse('{"cells":[{"row":"1","col":1,"value":"3"},{"row":1,"col":2,"value":4}]}')).toEqual({ cells: [{ row: 1, col: 2, value: "4" }] });
  });
  test("the typed values read as a row for common-error patterns, and no feedback says wrong", () => {
    expect(tableResponseText(filled(["15", "40", "18", "30"]))).toBe("15, 40, 18, 30");
    expect(tableResponseText("15, 40")).toBe("15, 40");
    expect(checkTable(filled(["1", "", "2", "x"]), density).feedback).not.toMatch(/wrong/i);
  });
});
