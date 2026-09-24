import { describe, expect, test } from "vitest";
import { checkPlot, describePlotExpect, formatPlotResponse, needsPlacedLine, niceStep, parsePlotResponse, plotLattice, toleranceOf, type BoxExpect, type HistogramExpect, type PointsExpect } from "./plot";

const cf: PointsExpect = {
  plot: "points-line",
  points: [
    [0, 0],
    [20, 5],
    [40, 20],
    [60, 50],
    [80, 75],
    [100, 80],
  ],
  lineThrough: [
    [0, 0],
    [20, 5],
    [40, 20],
    [60, 50],
    [80, 75],
    [100, 80],
  ],
  tolerance: { type: "absolute", value: 0.5 },
  lineRequired: true,
};

describe("plotted points", () => {
  test("every point within tolerance, in any order, is correct; joining is left to the paper", () => {
    const raw = formatPlotResponse({ points: [[100, 80], [80, 75.4], [60, 50], [40, 20], [20, 5], [0, 0]] });
    const v = checkPlot(raw, cf);
    expect(v).toMatchObject({ correct: true, earned: 6, total: 6 });
    expect(v.feedback).toMatch(/Every point is plotted correctly\. On paper, join the points/);
    expect(needsPlacedLine(cf)).toBe(false);
  });
  test("a point outside tolerance is named against where it belongs; a missing point is listed; a stray one is counted", () => {
    const raw = formatPlotResponse({ points: [[0, 0], [20, 5], [40, 25], [60, 50], [80, 75], [37, 61]] });
    const v = checkPlot(raw, cf);
    expect(v).toMatchObject({ correct: false, earned: 4, total: 6 });
    expect(v.feedback).toContain("The point at (40, 25) belongs at (40, 20).");
    expect(v.feedback).toContain("Not plotted yet: (100, 80).");
    expect(v.feedback).toContain("One point is not in the table: (37, 61).");
  });
  test("tolerance comes from the spec, or is half a unit", () => {
    expect(toleranceOf(cf)).toBe(0.5);
    expect(toleranceOf({ plot: "curve", samples: [[0, 0]], tolerance: { type: "dp", places: 1 } })).toBeCloseTo(0.05);
    expect(toleranceOf({ plot: "curve", samples: [[0, 0]] })).toBe(0.5);
  });
});

describe("a line placed with two taps", () => {
  const bestFit: PointsExpect = {
    plot: "points-line",
    points: [
      [0.2, 9],
      [0.4, 19],
      [0.6, 27],
      [0.8, 38],
      [1, 46],
    ],
    lineThrough: [
      [0, 0],
      [1, 46],
    ],
    tolerance: { type: "absolute", value: 1.5 },
    lineRequired: true,
  };
  test("the line counts as one element and must pass within tolerance of both given points", () => {
    expect(needsPlacedLine(bestFit)).toBe(true);
    const points: Array<[number, number]> = [[0.2, 9], [0.4, 19], [0.6, 27], [0.8, 38], [1, 46]];
    const good = checkPlot(formatPlotResponse({ points, line: [[0, 0.5], [0.5, 23]] }), bestFit);
    expect(good).toMatchObject({ correct: true, earned: 6, total: 6 });
    expect(good.feedback).toContain("Your line passes through (0, 0) and (1, 46).");
    const none = checkPlot(formatPlotResponse({ points }), bestFit);
    expect(none).toMatchObject({ correct: false, earned: 5, total: 6 });
    expect(none.feedback).toContain("Now draw the line: it should pass through (0, 0) and (1, 46).");
    const off = checkPlot(formatPlotResponse({ points, line: [[0, 6], [1, 46]] }), bestFit);
    expect(off).toMatchObject({ correct: false, earned: 5 });
    expect(off.feedback).toContain("Your line passes 6 above (0, 0). It should go through (0, 0) and (1, 46).");
  });
  test("a miss says which side of the point the line runs, so she knows which way to move it; a vertical line is beside it", () => {
    const points: Array<[number, number]> = [[0.2, 9], [0.4, 19], [0.6, 27], [0.8, 38], [1, 46]];
    const low = checkPlot(formatPlotResponse({ points, line: [[0, 0], [1, 40]] }), bestFit);
    expect(low.feedback).toContain("Your line passes 6 below (1, 46). It should go through (0, 0) and (1, 46).");
    const vertical = checkPlot(formatPlotResponse({ points, line: [[3, 0], [3, 50]] }), bestFit);
    expect(vertical.feedback).toContain("Your line passes 3 beside (0, 0). It should go through (0, 0) and (1, 46).");
    expect(low.feedback + vertical.feedback).not.toMatch(/misses|wrong/i);
  });
  test("two coinciding points are no line: the response carries none and the marker still asks for it", () => {
    const points: Array<[number, number]> = [[0.2, 9], [0.4, 19], [0.6, 27], [0.8, 38], [1, 46]];
    expect(parsePlotResponse(formatPlotResponse({ points, line: [[0.5, 23], [0.5, 23]] }))).toEqual({ points });
    const v = checkPlot(formatPlotResponse({ points, line: [[0.5, 23], [0.5, 23]] }), bestFit);
    expect(v).toMatchObject({ correct: false, earned: 5, total: 6 });
    expect(v.feedback).toContain("Now draw the line: it should pass through (0, 0) and (1, 46).");
  });
  test("the expected line is described with its points", () => {
    expect(describePlotExpect(bestFit)).toBe("(0.2, 9), (0.4, 19), (0.6, 27), (0.8, 38), (1, 46); line through (0, 0) and (1, 46)");
  });
});

describe("a curve's sample points", () => {
  const curve: PointsExpect = { plot: "curve", samples: [[-2, 5], [-1, 0], [0, -3], [1, -4], [2, -3], [3, 0], [4, 5]], tolerance: { type: "absolute", value: 0.25 } };
  test("all samples placed asks for a smooth freehand curve on paper", () => {
    const v = checkPlot(formatPlotResponse({ points: [[-2, 5], [-1, 0], [0, -3], [1, -4], [2, -3], [3, 0], [4, 5]] }), curve);
    expect(v.correct).toBe(true);
    expect(v.feedback).toContain("one smooth freehand curve");
  });
  test("a sample 0.5 out is not within a quarter", () => {
    const v = checkPlot(formatPlotResponse({ points: [[-2, 5], [-1, 0], [0, -3], [1, -3.5], [2, -3], [3, 0], [4, 5]] }), curve);
    expect(v).toMatchObject({ correct: false, earned: 6, total: 7 });
    expect(v.feedback).toContain("The point at (1, −3.5) belongs at (1, −4).");
  });
});

describe("histogram bars", () => {
  const hist: HistogramExpect = {
    plot: "histogram",
    bars: [
      { from: 0, to: 20, frequencyDensity: 0.4 },
      { from: 20, to: 30, frequencyDensity: 1.5 },
      { from: 30, to: 60, frequencyDensity: 0.3 },
    ],
    scaleTolerance: 0.02,
  };
  test("every bar at its frequency density is correct", () => {
    const v = checkPlot(formatPlotResponse({ bars: [0.4, 1.5, 0.3] }), hist);
    expect(v).toMatchObject({ correct: true, earned: 3, total: 3 });
    expect(v.feedback).toContain("Every bar has the right height");
  });
  test("a bar at the frequency instead of the density, and a bar not drawn, are named without the word wrong", () => {
    const v = checkPlot(formatPlotResponse({ bars: [0.4, 15, null] }), hist);
    expect(v).toMatchObject({ correct: false, earned: 1, total: 3 });
    expect(v.feedback).toBe(
      "2 bars are not at their heights yet: the 20–30 bar should reach 1.5, not 15; the 30–60 bar is not drawn (it should reach 0.3). Frequency density is frequency ÷ class width.",
    );
    const one = checkPlot(formatPlotResponse({ bars: [0.4, 1.5, 0.2] }), hist);
    expect(one).toMatchObject({ correct: false, earned: 2, total: 3 });
    expect(one.feedback).toBe("One bar is not at its height yet: the 30–60 bar should reach 0.3, not 0.2. Frequency density is frequency ÷ class width.");
    expect(v.feedback + one.feedback).not.toMatch(/wrong/i);
  });
  test("the expected bars are described by interval and height", () => {
    expect(describePlotExpect(hist)).toBe("0–20: 0.4, 20–30: 1.5, 30–60: 0.3");
  });
});

describe("box plot values", () => {
  const box: BoxExpect = { plot: "box", min: 12, q1: 20, median: 34, q3: 41, max: 58, tolerance: { type: "absolute", value: 0.5 } };
  test("five values within tolerance are correct", () => {
    const v = checkPlot(formatPlotResponse({ box: [12, 20.4, 34, 41, 58] }), box);
    expect(v).toMatchObject({ correct: true, earned: 5, total: 5 });
    expect(v.feedback).toContain("Every value is in the right place");
  });
  test("a wrong median and a missing maximum are named", () => {
    const v = checkPlot(formatPlotResponse({ box: [12, 20, 30, 41, null] }), box);
    expect(v).toMatchObject({ correct: false, earned: 3, total: 5 });
    expect(v.feedback).toBe("2 values are wrong: the median should be at 34, not 30; the maximum is not placed (it belongs at 58).");
  });
  test("the expected box plot is described by its five values", () => {
    expect(describePlotExpect(box)).toBe("minimum 12, lower quartile 20, median 34, upper quartile 41, maximum 58");
  });
});

describe("the grid the field draws", () => {
  test("labelled steps: about eight across and ten up, so a cumulative frequency axis labels 10s", () => {
    expect(niceStep(100, 8)).toBe(20);
    expect(niceStep(80, 10)).toBe(10);
    expect(niceStep(1.5, 10)).toBeCloseTo(0.2);
    const l = plotLattice(cf);
    expect(l.x).toEqual({ lo: 0, hi: 100, major: 20, minor: 4 });
    // (20, 5) is off the 2-unit lattice by 1, beyond the 0.5 tolerance, so the y squares are a tenth of the step.
    expect(l.y).toEqual({ lo: 0, hi: 90, major: 10, minor: 1 });
    expect(l.unreachable).toEqual([]);
  });
  test("the small square is the coarsest fifth, tenth or twentieth of the step that reaches every target within tolerance", () => {
    const curve = (y: number, tol: number): PointsExpect => ({ plot: "curve", samples: [[0, 0], [1, y], [2, 6]], tolerance: { type: "absolute", value: tol } });
    expect(plotLattice(curve(2, 0.02)).y).toEqual({ lo: 0, hi: 7, major: 1, minor: 0.2 });
    expect(plotLattice(curve(2.5, 0.05)).y).toEqual({ lo: 0, hi: 7, major: 1, minor: 0.1 });
    expect(plotLattice(curve(2.25, 0.02)).y).toEqual({ lo: 0, hi: 7, major: 1, minor: 0.05 });
    // Within tolerance of the fifth already: the printed five squares stay.
    expect(plotLattice(curve(2.1, 0.25)).y.minor).toBe(0.2);
    expect(plotLattice(curve(2.25, 0.02)).unreachable).toEqual([]);
  });
  test("a target beyond even the finest lattice is reported, and the axis keeps the finest square", () => {
    const l = plotLattice({ plot: "curve", samples: [[0, 0], [1, 2.26], [2, 6]], tolerance: { type: "absolute", value: 0.005 } });
    expect(l.y.minor).toBe(0.05);
    expect(l.unreachable).toEqual([{ axis: "y", value: 2.26, nearest: 2.25, minor: 0.05, tolerance: 0.005 }]);
  });
  test("points and the line's points count as targets on both axes, with the spec's tolerance", () => {
    const l = plotLattice({ plot: "points-line", points: [[1, 8], [5, 1.6]], lineThrough: [[0.5, 16], [8, 1]], tolerance: { type: "absolute", value: 0.25 }, lineRequired: true });
    expect(l.x).toEqual({ lo: 0, hi: 8, major: 1, minor: 0.2 });
    expect(l.y).toEqual({ lo: 0, hi: 18, major: 2, minor: 0.4 });
    expect(l.unreachable).toEqual([]);
  });
  test("histogram heights sit on the lattice: a 0.15 bar on a 0.02 tolerance can be tapped", () => {
    const l = plotLattice({
      plot: "histogram",
      bars: [
        { from: 0, to: 20, frequencyDensity: 0.1 },
        { from: 20, to: 55, frequencyDensity: 0.4 },
        { from: 55, to: 75, frequencyDensity: 0.15 },
      ],
      scaleTolerance: 0.02,
    });
    expect(l.x).toEqual({ lo: 0, hi: 80, major: 10, minor: 2 });
    expect(l.y.major).toBeCloseTo(0.05);
    expect(l.y.minor).toBeCloseTo(0.01);
    expect(l.y.hi).toBeCloseTo(0.45);
    expect(l.unreachable).toEqual([]);
  });
});

describe("responses", () => {
  test("format and parse round-trip, and anything else is not a response", () => {
    const r = parsePlotResponse(formatPlotResponse({ points: [[1, 2]], line: [[0, 0], [1, 1]], bars: [0.5, null] }));
    expect(r).toEqual({ points: [[1, 2]], line: [[0, 0], [1, 1]], bars: [0.5, null] });
    expect(parsePlotResponse("(1, 2)")).toBeNull();
    expect(checkPlot("", cf)).toMatchObject({ correct: false, earned: 0, total: 6, feedback: "Nothing was drawn yet." });
  });
});
