import { describe, expect, test } from "vitest";
import { checkTransformation, describeMapping, formatVertices, graphTestMatches, parseVertices, sameVertexSet, verticesInText, type Vertex } from "./transformation";

const A: Vertex[] = [
  [3, 1],
  [8, 1],
  [3, 4],
];

describe("parseVertices / formatVertices", () => {
  test("tuples in any spacing, and x = …, y = … pairs", () => {
    expect(parseVertices("(1, 3), (1,8),(4 , 3)")).toEqual([
      [1, 3],
      [1, 8],
      [4, 3],
    ]);
    expect(parseVertices("(-3, -1), (-3, -5), (-6, -5)")).toEqual([
      [-3, -1],
      [-3, -5],
      [-6, -5],
    ]);
    expect(parseVertices("nothing here")).toBeNull();
    expect(formatVertices([[1, -3], [0.5, 0]])).toBe("(1, −3), (0.5, 0)");
  });
  test("vertices listed inside prose", () => {
    expect(verticesInText("image drawn at (-3, 1), (-8, 1), (-3, 4), the reflection in the y-axis")).toEqual([
      [-3, 1],
      [-8, 1],
      [-3, 4],
    ]);
    expect(verticesInText("image drawn roughly, vertices not on lattice points")).toEqual([]);
  });
  test("vertex sets ignore order but not multiplicity", () => {
    expect(sameVertexSet([[1, 2], [3, 4]], [[3, 4], [1, 2]])).toBe(true);
    expect(sameVertexSet([[1, 2], [1, 2]], [[1, 2], [3, 4]])).toBe(false);
    expect(sameVertexSet([[1, 2]], [[1, 2], [3, 4]])).toBe(false);
  });
});

describe("describeMapping", () => {
  test("reflections in the axes and the diagonals", () => {
    expect(describeMapping(A, [[3, -1], [8, -1], [3, -4]])).toBe("a reflection in the x-axis");
    expect(describeMapping(A, [[-3, 1], [-8, 1], [-3, 4]])).toBe("a reflection in the y-axis");
    expect(describeMapping(A, [[1, 3], [1, 8], [4, 3]])).toBe("a reflection in the line y = x");
    expect(describeMapping(A, [[-1, -3], [-1, -8], [-4, -3]])).toBe("a reflection in the line y = −x");
  });
  test("reflections in other lines", () => {
    expect(describeMapping(A, [[1, 1], [-4, 1], [1, 4]])).toBe("a reflection in the line x = 2");
    expect(describeMapping(A, [[3, 4], [8, 4], [3, 1]])).toBe("a reflection in the line y = 2.5");
  });
  test("rotations about the origin and about another centre", () => {
    expect(describeMapping(A, [[1, -3], [1, -8], [4, -3]])).toBe("a rotation of 90° clockwise about the origin");
    expect(describeMapping(A, [[-1, 3], [-1, 8], [-4, 3]])).toBe("a rotation of 90° anticlockwise about the origin");
    expect(describeMapping(A, [[-3, -1], [-8, -1], [-3, -4]])).toBe("a rotation of 180° about the origin");
    // 180° about (2, 2): (x, y) → (4 − x, 4 − y)
    expect(describeMapping(A, [[1, 3], [-4, 3], [1, 0]])).toBe("a rotation of 180° about (2, 2)");
  });
  test("translations and enlargements", () => {
    expect(describeMapping(A, [[-3, -3], [2, -3], [-3, 0]])).toBe("a translation of 6 left and 4 down, the vector (−6, −4)");
    expect(describeMapping(A, [[6, 2], [16, 2], [6, 8]])).toBe("an enlargement, scale factor 2, centre the origin");
    // centre (1, 1), factor 2: (x, y) → (1 + 2(x − 1), 1 + 2(y − 1))
    expect(describeMapping(A, [[5, 1], [15, 1], [5, 7]])).toBe("an enlargement, scale factor 2, centre (1, 1)");
  });
  test("the unmoved object, and shapes no single transformation gives", () => {
    expect(describeMapping(A, [[8, 1], [3, 4], [3, 1]])).toBe("the object itself, unmoved");
    expect(describeMapping(A, [[0, 0], [1, 1], [2, 5]])).toBeNull();
    expect(describeMapping(A, [[1, 3], [1, 8]])).toBeNull();
  });
});

describe("checkTransformation", () => {
  const spec = { object: A, image: [[1, 3], [1, 8], [4, 3]] as Vertex[] };
  test("the right vertices in any order are correct", () => {
    expect(checkTransformation("(4, 3), (1, 8), (1, 3)", spec)).toMatchObject({ correct: true, inPlace: 3, total: 3 });
  });
  test("a recognisable wrong transformation is named against the one asked for", () => {
    const r = checkTransformation("(-3, 1), (-8, 1), (-3, 4)", spec);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("That is a reflection in the y-axis. The question asked for a reflection in the line y = x.");
    expect(r.did).toBe("a reflection in the y-axis");
  });
  test("wrong vertex count and unparseable answers are explained", () => {
    expect(checkTransformation("(1, 3), (1, 8)", spec).feedback).toMatch(/3 vertices.*2 are placed/);
    expect(checkTransformation("I drew it", spec).feedback).toMatch(/for example \(3, 1\), \(8, 1\), \(3, 4\)/);
  });
  test("an unrecognisable wrong shape reports how many vertices are right", () => {
    expect(checkTransformation("(1, 3), (2, 2), (5, 5)", spec).feedback).toMatch(/^1 of 3 vertices is in the right place/);
    expect(checkTransformation("(0, 0), (2, 2), (5, 5)", spec).feedback).toMatch(/^None of the vertices.*The image is a reflection in the line y = x/);
  });
  test("a combined transformation has no single name, so the feedback describes what was drawn", () => {
    const combined = { object: [[1, 2], [1, 6], [4, 2]] as Vertex[], image: [[-4, -3], [0, -3], [-4, 0]] as Vertex[] };
    const r = checkTransformation("(2, 1), (6, 1), (2, 4)", combined);
    expect(r.asked).toBeNull();
    expect(r.feedback).toBe("That is a reflection in the line y = x of the object, which is not the image asked for here.");
  });
});

describe("graphTestMatches", () => {
  test("a common error listing the wrong image's vertices matches that set, order-free", () => {
    const test1 = "image drawn at (-3, 1), (-8, 1), (-3, 4), the reflection in the y-axis";
    expect(graphTestMatches("(-8, 1), (-3, 4), (-3, 1)", test1)).toBe(true);
    expect(graphTestMatches("(1, 3), (1, 8), (4, 3)", test1)).toBe(false);
    expect(graphTestMatches("(1, 3), (1, 8), (4, 3)", "image drawn roughly, vertices not on lattice points")).toBe(false);
  });
});

describe("a graph common error against a plotted-point response", () => {
  test("fires when every point the test names is among the placed points, and not otherwise", () => {
    const raw = JSON.stringify({ points: [[6.4, 12], [2, 3], [10, 20]], line: [[0, 0], [10, 20]] });
    expect(graphTestMatches(raw, "point plotted at (6.4, 12), one small square to the right")).toBe(true);
    expect(graphTestMatches(raw, "line through (0, 0) and (10, 20)")).toBe(true);
    expect(graphTestMatches(raw, "point plotted at (6, 12)")).toBe(false);
    expect(graphTestMatches(raw, "the wrong gradient, no points named")).toBe(false);
  });
});
