import { describe, expect, test } from "vitest";
import {
  checkMatrix,
  describeMatrixExpect,
  entryLabel,
  entryMatches,
  formatMatrixResponse,
  matrixLatex,
  matrixResponseText,
  parseMatrix,
  sameMatrixEntries,
  type MatrixExpect,
} from "./matrix";

/** A 2×2 product, the shape Further Maths Unit 1 asks for over and over. */
const product: MatrixExpect = { rows: 2, cols: 2, entries: [["7", "10"], ["-3", "4"]] };

describe("parseMatrix reads every spelling", () => {
  const expected = [
    ["1", "2"],
    ["3", "4"],
  ];
  test("a LaTeX environment, bare or wrapped in maths delimiters", () => {
    expect(parseMatrix("\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}")).toEqual(expected);
    expect(parseMatrix("$\\begin{bmatrix}1 & 2\\\\3 & 4\\end{bmatrix}$")).toEqual(expected);
    expect(parseMatrix("\\[\\begin{vmatrix}1&2\\\\3&4\\end{vmatrix}\\]")).toEqual(expected);
    expect(parseMatrix("\\begin{matrix}1&2\\\\3&4\\end{matrix}")).toEqual(expected);
    expect(parseMatrix("\\left(\\begin{pmatrix}1 & 2 \\\\[2pt] 3 & 4\\end{pmatrix}\\right)")).toEqual(expected);
    // A trailing row separator and TeX spacing are not entries.
    expect(parseMatrix("\\begin{pmatrix} 1 & \\, 2 \\\\ 3 & 4 \\\\ \\end{pmatrix}")).toEqual(expected);
  });
  test("a nested list in square or round brackets", () => {
    expect(parseMatrix("[[1,2],[3,4]]")).toEqual(expected);
    expect(parseMatrix("((1,2),(3,4))")).toEqual(expected);
    expect(parseMatrix("(1, 2), (3, 4)")).toEqual(expected);
    expect(parseMatrix("[[1 2],[3 4]]")).toEqual(expected);
  });
  test("a plain grid typed row by row", () => {
    expect(parseMatrix("1 2; 3 4")).toEqual(expected);
    expect(parseMatrix("1, 2; 3, 4")).toEqual(expected);
    expect(parseMatrix("1 2\n3 4")).toEqual(expected);
    expect(parseMatrix("  1   2 ;  3   4  ")).toEqual(expected);
    expect(parseMatrix("[1 2; 3 4]")).toEqual(expected);
  });
  test("a named matrix is read from the equals sign", () => {
    expect(parseMatrix("AB = 1 2; 3 4")).toEqual(expected);
    expect(parseMatrix("A^{-1} = \\begin{pmatrix}1 & 2\\\\3 & 4\\end{pmatrix}")).toEqual(expected);
  });
  test("minus signs of every spelling become one", () => {
    expect(parseMatrix("−3 2; 1 −4")).toEqual([
      ["-3", "2"],
      ["1", "-4"],
    ]);
  });
  test("algebraic entries survive", () => {
    expect(parseMatrix("2a 1/2; \\frac{1}{2} -b")).toEqual([
      ["2a", "1/2"],
      ["\\frac{1}{2}", "-b"],
    ]);
  });
  test("nothing readable comes back null", () => {
    expect(parseMatrix("")).toBeNull();
    expect(parseMatrix("   ")).toBeNull();
    expect(parseMatrix(";;")).toBeNull();
  });
  test("what the field submits round-trips", () => {
    const raw = formatMatrixResponse([
      ["7", "10"],
      ["-3", "4"],
    ]);
    expect(raw).toBe("7 10; -3 4");
    expect(parseMatrix(raw)).toEqual([
      ["7", "10"],
      ["-3", "4"],
    ]);
    expect(matrixResponseText("\\begin{pmatrix}7 & 10\\\\-3 & 4\\end{pmatrix}")).toBe("7 10; -3 4");
    expect(matrixResponseText("not a matrix at all")).toBe("not a matrix at all");
  });
});

describe("checkMatrix marks entry by entry", () => {
  test("the matrix in any spelling earns everything", () => {
    for (const raw of ["7 10; -3 4", "[[7,10],[-3,4]]", "\\begin{pmatrix}7 & 10\\\\-3 & 4\\end{pmatrix}", "7 10\n−3 4"]) {
      const v = checkMatrix(raw, product);
      expect(v.correct, raw).toBe(true);
      expect(v.inPlace, raw).toBe(4);
      expect(v.total, raw).toBe(4);
      expect(v.shape, raw).toBe("ok");
      expect(v.feedback, raw).toBe("Every entry is right.");
    }
  });
  test("one entry out names its row and column and counts the rest", () => {
    const v = checkMatrix("7 10; 3 4", product);
    expect(v.correct).toBe(false);
    expect(v.inPlace).toBe(3);
    expect(v.wrongCells).toEqual([{ row: 1, col: 0, got: "3", expected: "-3" }]);
    expect(v.feedback).toBe("3 of 4 entries are right. Row 2, column 1 should be −3.");
    expect(v.shape).toBe("ok");
    expect(v.transposed).toBe(false);
  });
  test("several entries out name the first two and count the others", () => {
    const v = checkMatrix("1 2; 3 5", product);
    expect(v.inPlace).toBe(0);
    expect(v.wrongCells).toHaveLength(4);
    expect(v.feedback).toBe("Row 1, column 1 should be 7. Row 1, column 2 should be 10. 2 other entries need another look.");
  });
  test("a transpose is named as a transpose, not read out entry by entry", () => {
    const v = checkMatrix("7 -3; 10 4", product);
    expect(v.correct).toBe(false);
    expect(v.transposed).toBe(true);
    expect(v.feedback).toBe("That is the transpose: the rows and the columns are the other way round.");
    // The entries the swap left where they were still count.
    expect(v.inPlace).toBe(2);
  });
  test("a transpose of a matrix that is not square is named too", () => {
    const wide: MatrixExpect = { rows: 2, cols: 3, entries: [["1", "2", "3"], ["4", "5", "6"]] };
    const v = checkMatrix("1 4; 2 5; 3 6", wide);
    expect(v.transposed).toBe(true);
    expect(v.shape).toBe("wrong-size");
    expect(v.inPlace).toBe(0);
    expect(v.feedback).toMatch(/^That is the transpose/);
  });
  test("the wrong size earns nothing and asks for the right one", () => {
    const v = checkMatrix("7 10 1; -3 4 2", product);
    expect(v.shape).toBe("wrong-size");
    expect(v.inPlace).toBe(0);
    expect(v.wrongCells).toEqual([]);
    expect(v.feedback).toBe("This answer should be a 2 by 2 matrix; that one is 2 by 3.");
  });
  test("rows of different lengths are asked for again", () => {
    const v = checkMatrix("7 10; -3", product);
    expect(v.shape).toBe("wrong-size");
    expect(v.feedback).toBe("This answer should be a 2 by 2 matrix, with the same number of entries in every row.");
  });
  test("an unreadable answer scores nothing and says how to type one", () => {
    const v = checkMatrix("   ", product);
    expect(v.shape).toBe("unparseable");
    expect(v.inPlace).toBe(0);
    expect(v.feedback).toMatch(/1 2; 3 4/);
  });
  test("a 1 by 1 answer (a determinant written as a matrix) reads in the singular", () => {
    const one: MatrixExpect = { rows: 1, cols: 1, entries: [["-2"]] };
    expect(checkMatrix("-2", one).feedback).toBe("The entry is right.");
    expect(checkMatrix("2", one).feedback).toBe("Row 1, column 1 should be −2.");
  });
  test("the feedback never says wrong and never shouts", () => {
    for (const raw of ["7 10; 3 4", "1 2; 3 4", "7 -3; 10 4", "7 10 1; -3 4 2", "  "]) {
      const { feedback } = checkMatrix(raw, product);
      expect(feedback, raw).not.toMatch(/wrong|incorrect|!/i);
    }
  });
});

describe("entries are compared the way the spec asks", () => {
  test("without a tolerance the value must be the one written, in any spelling of that number", () => {
    expect(entryMatches("7", "7")).toBe(true);
    expect(entryMatches("7.0", "7")).toBe(true);
    expect(entryMatches("0.5", "1/2")).toBe(true);
    expect(entryMatches("7.1", "7")).toBe(false);
    expect(entryMatches("", "7")).toBe(false);
  });
  test("an absolute tolerance lets a rounded entry earn an exact one", () => {
    const rounded: MatrixExpect = { rows: 1, cols: 2, entries: [["0.333", "-0.667"]], tolerance: { type: "absolute", value: 0.001 } };
    expect(checkMatrix("0.333 -0.667", rounded).correct).toBe(true);
    expect(checkMatrix("0.3333 -0.6667", rounded).correct).toBe(true);
    expect(checkMatrix("0.33 -0.67", rounded).correct).toBe(false);
  });
  test("algebraic entries are marked by equivalence, not by spelling", () => {
    const algebraic: MatrixExpect = { rows: 2, cols: 2, entries: [["2a", "1/2"], ["\\frac{3}{4}", "-b"]] };
    expect(checkMatrix("2a 0.5; 0.75 -b", algebraic).correct).toBe(true);
    expect(checkMatrix("a2 1/2; 3/4 -b", algebraic).correct).toBe(true);
    const v = checkMatrix("2a 1/2; 3/4 b", algebraic);
    expect(v.correct).toBe(false);
    expect(v.wrongCells).toEqual([{ row: 1, col: 1, got: "b", expected: "-b" }]);
  });
  test("an inverse written with the fraction taken outside is not the same entry", () => {
    const inverse: MatrixExpect = { rows: 2, cols: 2, entries: [["2", "-1"], ["-1.5", "0.5"]] };
    expect(checkMatrix("4 -2; -3 1", inverse).correct).toBe(false);
  });
});

describe("matrices as text", () => {
  test("entries are named the way she counts them", () => {
    expect(entryLabel({ row: 0, col: 0 })).toBe("Row 1, column 1");
    expect(entryLabel({ row: 1, col: 0 })).toBe("Row 2, column 1");
  });
  test("the expected line draws the whole matrix", () => {
    expect(matrixLatex(product.entries)).toBe("\\begin{pmatrix} 7 & 10 \\\\ -3 & 4 \\end{pmatrix}");
    expect(describeMatrixExpect(product)).toBe("$\\begin{pmatrix} 7 & 10 \\\\ -3 & 4 \\end{pmatrix}$");
  });
  test("two matrices are the same when every entry is", () => {
    expect(sameMatrixEntries([["7", "10"], ["-3", "4"]], product.entries)).toBe(true);
    expect(sameMatrixEntries([["7.0", "10"], ["−3", "4"]], product.entries)).toBe(true);
    expect(sameMatrixEntries([["7", "10"], ["3", "4"]], product.entries)).toBe(false);
    expect(sameMatrixEntries([["7", "10"]], product.entries)).toBe(false);
  });
});

describe("a scalar in front of the matrix", () => {
  test("the fraction CCEA prints before an inverse is multiplied into every entry", () => {
    expect(parseMatrix("\\frac{1}{5}\\begin{pmatrix}2 & -1 \\\\ -3 & 4\\end{pmatrix}")).toEqual([["2/5", "-1/5"], ["-3/5", "4/5"]]);
    expect(parseMatrix("1/5 [[2,-1],[-3,4]]")).toEqual([["2/5", "-1/5"], ["-3/5", "4/5"]]);
    expect(parseMatrix("0.5(1 2; 3 4)")).toEqual([["0.5", "1"], ["1.5", "2"]]);
    expect(parseMatrix("-2\\begin{pmatrix}1 & 0 \\\\ 0 & 1\\end{pmatrix}")).toEqual([["-2", "0"], ["0", "-2"]]);
    expect(parseMatrix("\\tfrac{1}{2} \\times \\begin{pmatrix}4 & 6 \\\\ 1 & 3\\end{pmatrix}")).toEqual([["2", "3"], ["1/2", "3/2"]]);
  });
  test("it marks against decimal or fraction entries", () => {
    const spec = { rows: 2, cols: 2, entries: [["0.4", "-0.2"], ["-0.6", "0.8"]] } as never;
    expect(checkMatrix("\\frac{1}{5}\\begin{pmatrix}2 & -1 \\\\ -3 & 4\\end{pmatrix}", spec).correct).toBe(true);
    expect(checkMatrix("\\frac{1}{5}\\begin{pmatrix}2 & 1 \\\\ -3 & 4\\end{pmatrix}", spec).correct).toBe(false);
  });
});

describe("the field's scalar box", () => {
  test("a scalar typed in front of a bracketed grid is multiplied in", () => {
    expect(parseMatrix("1/5 [2 -1; -3 4]")).toEqual([["2/5", "-1/5"], ["-3/5", "4/5"]]);
    expect(parseMatrix("-1 [1 2; 3 4]")).toEqual([["-1", "-2"], ["-3", "-4"]]);
  });
});
