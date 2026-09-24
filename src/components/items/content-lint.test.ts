import { describe, expect, test } from "vitest";
import { figureLeakWarnings, lintContent, lintNoteBlocks, lostBackslashDefect, mangledRegexDefect, svgDrawDefects } from "./content-lint";

describe("lintContent", () => {
  test("duplicate option texts in a diagnostic item or an mcq part are reported once per pair", () => {
    const bundle = {
      diagnostics: [
        {
          id: "dx.maths.m7.x",
          items: [
            { id: "01", options: [{ text: "$75$", correct: true }, { text: "$7.5$" }, { text: "$75$" }] },
            { id: "02", options: [{ text: "$-3$" }, { text: "$5$", correct: true }, { text: "$-3$" }, { text: "-3" }] },
          ],
        },
      ],
      questions: [{ id: "q.maths.m7.x.0001", parts: [{ id: "main", answer: { kind: "mcq", options: [{ id: "a", text: "Graph A" }, { id: "b", text: "Graph B" }] } }] }],
    };
    const r = lintContent(bundle, "m7/x");
    expect(r).toHaveLength(3);
    expect(r[0]).toMatch(/dx\.maths\.m7\.x\(01\): options 1 and 3 both read/);
    expect(r[1]).toMatch(/\(02\): options 1 and 3/);
    expect(r[2]).toMatch(/\(02\): options 1 and 4/);
  });
  test("a common error equal to the correct answer is reported, a different one is not", () => {
    const bundle = {
      questions: [
        {
          id: "q.maths.m8.x.0001",
          parts: [
            {
              id: "main",
              answer: { kind: "numeric", value: 2, tolerance: { type: "exact" } },
              commonErrors: [
                { misconception: "a", pattern: { kind: "numeric", value: 2, tolerance: { type: "absolute", value: 0 } } },
                { misconception: "b", pattern: { kind: "numeric", value: 4 } },
              ],
            },
            {
              id: "b",
              answer: { kind: "algebraic", latex: "x^{2}+3" },
              commonErrors: [{ misconception: "c", pattern: { kind: "algebraic", latex: "x^{2} + 3" } }],
            },
          ],
        },
      ],
    };
    const r = lintContent(bundle, "m8/x");
    expect(r).toHaveLength(2);
    expect(r[0]).toMatch(/\(main\): commonError 1 \(a\) has value 2, which the spec marks correct/);
    expect(r[1]).toMatch(/\(b\): commonError 1 \(c\) repeats the correct answer/);
  });
  test("a common error with the right value is fine when the spec demands a surd, π or simplified fraction", () => {
    const bundle = {
      questions: [
        {
          id: "q.maths.m7.x.0005",
          parts: [
            {
              id: "main",
              answer: { kind: "numeric", value: 2.8284271247461903, tolerance: { type: "exact" }, acceptForms: ["surd"], mustBeSimplified: true },
              commonErrors: [{ misconception: "maths.surds.decimal-for-exact-answer", pattern: { kind: "numeric", value: 2.8284271247461903, tolerance: { type: "dp", places: 2 } } }],
            },
            {
              id: "b",
              answer: { kind: "numeric", value: 1.6, tolerance: { type: "exact" }, acceptForms: ["fraction", "mixed"], mustBeSimplified: true },
              commonErrors: [{ misconception: "maths.alg-fractions.decimal-conversion-rounding", pattern: { kind: "numeric", value: 1.6, tolerance: { type: "absolute", value: 0 } } }],
            },
          ],
        },
      ],
    };
    expect(lintContent(bundle, "m7/x")).toEqual([]);
  });
  test("an unrounded value is a live common error when the stem instructs the accuracy, and a dead one when it does not", () => {
    const part = (stem: string) => ({
      id: "b",
      stem,
      answer: { kind: "numeric", value: 9.5, tolerance: { type: "dp", places: 1 }, acceptForms: ["decimal"] },
      commonErrors: [{ misconception: "maths.subject.accuracy-not-as-demanded", pattern: { kind: "numeric", value: 9.528170162811104, tolerance: { type: "absolute", value: 0.0005 } } }],
    });
    expect(lintContent({ questions: [{ id: "q.maths.m7.x.0015", parts: [part("Work out its height. Give your answer correct to 1 decimal place.")] }] }, "m7/x")).toEqual([]);
    expect(lintContent({ questions: [{ id: "q.maths.m7.x.0015", parts: [part("Work out its height.")] }] }, "m7/x")).toHaveLength(1);
  });
  test("an unpaired or misplaced dollar sign in learner-facing text is reported; regexes and TeX text are not", () => {
    const bundle = {
      questions: [
        {
          id: "q.maths.m8.x.0010",
          parts: [
            {
              id: "main",
              stem: "Enlarge triangle $V$ by scale factor -2$ with centre (0, 1)$.",
              workedSolution: "(x+1)(x+2) = x^{2}+3x+2$, so the expression is $(x^{2}+3x+2)(x+5)$.",
              hints: ["Count from $(0, 1)$ to each vertex.", "Go 2 times as far$ the other way."],
              answer: { kind: "graph", expect: { plot: "transformation", object: [[1, 3]], image: [[-2, -3]] } },
              commonErrors: [
                {
                  misconception: "maths.transform.negative-sf-image-same-side",
                  pattern: { kind: "text", regex: "^\\s*enlarge\\w*\\s*$" },
                  feedback: "A scale factor of $2$ would leave the image on the same side; $P(\\text{red and blue})$ and $\\theta$ are fine.",
                },
              ],
            },
          ],
        },
      ],
    };
    const r = lintContent(bundle, "m8/x");
    expect(r).toHaveLength(3);
    expect(r[0]).toMatch(/0010\(main\): prose inside a maths segment in stem \("\$ with centre \(0, 1\)\$"\)/);
    expect(r[1]).toMatch(/0010\(main\): unpaired "\$" in workedSolution/);
    expect(r[2]).toMatch(/0010\(main\): unpaired "\$" in hints/);
  });
  test("the literal words undefined or NaN in learner-facing text are reported", () => {
    const bundle = {
      questions: [
        {
          id: "q.fm.u1.x.0003",
          parts: [
            {
              id: "main",
              stem: "Complete the square. State the values of x for which the expression is undefined.",
              hints: ["Halve the coefficient of x.", "A fraction is undefined when its denominator is zero."],
              answer: { kind: "algebraic", latex: "(x+2)^{2}-1" },
              commonErrors: [{ misconception: "fm.csq.sign", pattern: { kind: "algebraic", latex: "(x-2)^{2}-1" }, feedback: "The constant is $\\frac{undefined}{undefined}$ here." }],
            },
          ],
        },
      ],
    };
    const r = lintContent(bundle, "fm1/x");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/0003\(main\): "undefined" printed in feedback/);
  });
  test("a matrix common error that repeats the answer, and entries that do not fill the matrix", () => {
    const part = (answer: unknown, pattern: unknown) => ({
      id: "main",
      stem: "Work out $AB$.",
      answer,
      commonErrors: [{ misconception: "fm.matrix.entrywise-product", pattern, feedback: "Those are the entries multiplied in pairs." }],
    });
    const repeats = lintContent(
      {
        questions: [
          {
            id: "q.fm.u1.matrix-arithmetic.0009",
            parts: [
              part(
                { kind: "matrix", rows: 2, cols: 2, entries: [["7", "10"], ["-3", "4"]] },
                { kind: "matrix", entries: [["7.0", "10"], ["−3", "4"]] },
              ),
            ],
          },
        ],
      },
      "fm1/matrix-arithmetic",
    );
    expect(repeats).toHaveLength(1);
    expect(repeats[0]).toMatch(/0009\(main\): commonError 1 \(fm\.matrix\.entrywise-product\) repeats the correct matrix \(7 10; -3 4\), so it can never fire/);

    const short = lintContent(
      {
        questions: [
          {
            id: "q.fm.u1.matrix-arithmetic.0010",
            parts: [part({ kind: "matrix", rows: 2, cols: 2, entries: [["7", "10"], ["-3"]] }, { kind: "matrix", entries: [["1", "8"], ["0", "3"]] })],
          },
        ],
      },
      "fm1/matrix-arithmetic",
    );
    expect(short).toHaveLength(1);
    expect(short[0]).toMatch(/0010\(main\): matrix answer is 2 by 2 \(4 entries\) but 2 rows of 2\+1 entries are given/);

    // A matrix answer that fills its size, with a different wrong matrix, is clean.
    expect(
      lintContent(
        {
          questions: [
            {
              id: "q.fm.u1.matrix-arithmetic.0011",
              parts: [part({ kind: "matrix", rows: 2, cols: 2, entries: [["7", "10"], ["-3", "4"]] }, { kind: "matrix", entries: [["1", "8"], ["0", "3"]] })],
            },
          ],
        },
        "fm1/matrix-arithmetic",
      ),
    ).toEqual([]);
  });
  test("an authored SVG containing NaN or undefined is reported", () => {
    const bundle = {
      questions: [
        {
          id: "q.maths.m3.x.0001",
          figures: [
            { kind: "svg", src: "data:image/svg+xml;utf8,%3Csvg%3E%3Cpath%20d%3D'M146%2064HNaNMNaN%2064H482'%2F%3E%3C%2Fsvg%3E", alt: "a box plot" },
            { kind: "svg", src: "data:image/svg+xml;utf8,%3Csvg%3E%3Crect%20x%3D'10'%2F%3E%3C%2Fsvg%3E", alt: "fine" },
          ],
          parts: [],
        },
      ],
    };
    const r = lintContent(bundle, "m3/x");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/0001: SVG figure contains "NaN"/);
  });
  test("a graph target the grid's finest small square cannot reach within tolerance is reported; reachable ones are not", () => {
    const bundle = {
      questions: [
        {
          id: "q.maths.m7.x.0020",
          parts: [
            {
              id: "a",
              answer: { kind: "graph", expect: { plot: "curve", samples: [[0, 0], [1, 2.26], [2, 6]], tolerance: { type: "absolute", value: 0.005 }, smooth: true, noStraightSegments: true } },
            },
            { id: "b", answer: { kind: "graph", expect: { plot: "points-line", points: [[1, 8], [5, 1.6]], tolerance: { type: "absolute", value: 0.25 }, lineRequired: false } } },
            {
              id: "c",
              answer: {
                kind: "graph",
                expect: {
                  plot: "histogram",
                  bars: [
                    { from: 0, to: 20, frequencyDensity: 0.1 },
                    { from: 55, to: 75, frequencyDensity: 0.15 },
                  ],
                  axisLabelY: "Frequency density",
                  scaleTolerance: 0.02,
                },
              },
            },
            { id: "d", answer: { kind: "graph", expect: { plot: "transformation", object: [[1, 3]], image: [[-2, -3]] } } },
          ],
        },
      ],
    };
    const r = lintContent(bundle, "m7/x");
    expect(r).toHaveLength(1);
    expect(r[0]).toBe(
      "m7/x q.maths.m7.x.0020(a): graph target y = 2.26 cannot be tapped: the nearest small square on the finest lattice (0.05 apart) is 2.25, 0.01 away against a tolerance of 0.005; change the value, the tolerance or the scale",
    );
  });
  test("floating-point artefacts in spec values are reported with the intended number", () => {
    const bundle = {
      questions: [
        { id: "q.maths.m8.x.0002", parts: [{ id: "main", answer: { kind: "numeric", value: 0.9299999999999999 } }] },
        { id: "q.maths.m8.x.0003", parts: [{ id: "main", answer: { kind: "numeric", value: 0.13513513513513514 } }] },
        { id: "q.maths.m8.x.0004", parts: [{ id: "main", answer: { kind: "numeric", value: 0.93 } }] },
      ],
    };
    const r = lintContent(bundle, "m8/x");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/0002\(main\): numeric value 0.9299999999999999 carries a floating-point artefact; write 0.93/);
  });
});

describe("svgDrawDefects", () => {
  const axes = '<line x1="60" y1="300" x2="700" y2="300"/><line x1="60" y1="20" x2="60" y2="300"/>';
  test("a clean figure has no defects", () => {
    expect(svgDrawDefects(`<svg viewBox="0 0 720 350">${axes}<path d="M100 60 L235 120.7 L370 172.7"/></svg>`)).toEqual([]);
  });
  test("path data written as bare text inside <g> is reported, and so is a <path> without d", () => {
    const bare = `<svg>${axes}<g fill="none" stroke="currentColor" stroke-width="2">M100 60 L235 120.7 L370 172.7 L505 242</g></svg>`;
    expect(svgDrawDefects(bare)).toEqual(["path data sits as bare text inside an element (the d= attribute is missing), so that line is not drawn"]);
    expect(svgDrawDefects(`<svg>${axes}<path stroke="red"/></svg>`)).toEqual(["a <path> has no d attribute, so it draws nothing"]);
  });
  test("path data inside a <text> element and an empty figure are reported", () => {
    expect(svgDrawDefects(`<svg>${axes}<text x="1" y="2">M100 60 L235 120</text></svg>`)).toEqual([
      "a <text> element holds path data, so the line is printed as letters instead of drawn",
    ]);
    expect(svgDrawDefects('<svg viewBox="0 0 10 10"><text x="1" y="2">label</text></svg>')).toEqual([
      "no drawn shape at all (no path, line, polyline, polygon, rect, circle or ellipse)",
    ]);
  });
});

describe("lintNoteBlocks", () => {
  test("a figure block whose curve is bare text is reported with its index and alt", () => {
    const blocks = [
      { type: "h", text: "Osmosis" },
      { type: "figure", alt: "Percentage change against concentration", svg: '<svg><line x1="0" y1="0" x2="1" y2="1"/><g stroke-width="2">M100 60 L235 120.7 L370 172.7</g></svg>' },
      { type: "figure", alt: "fine", svg: '<svg><path d="M1 1 L2 2"/></svg>' },
    ];
    const r = lintNoteBlocks(blocks, "science/b2/b2-osmosis");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/^science\/b2\/b2-osmosis note block 1 "Percentage change against concentration": SVG figure: path data sits as bare text/);
  });
  test("a data-URI figure in a bundle gets the same check", () => {
    const bundle = { questions: [{ id: "q.x.0001", figures: [{ kind: "svg", src: "data:image/svg+xml;utf8," + encodeURIComponent('<svg><g stroke-width="2">M1 1 L2 2</g></svg>'), alt: "a" }] }] };
    const r = lintContent(bundle, "x");
    expect(r.some((d) => /path data sits as bare text/.test(d))).toBe(true);
    expect(r.some((d) => /no drawn shape/.test(d))).toBe(true);
  });
});

describe("mangled regex signatures", () => {
  test("a heredoc-halved pattern is named, a real one is not", () => {
    expect(mangledRegexDefect("^(?![sS]*(air space|airspace))[sS]*$")).toMatch(/halved/);
    expect(mangledRegexDefect("wall[^;n]*(pulls|moves) away")).toMatch(/halved/);
    expect(mangledRegexDefect("b(sugar|sucrose)b")).toMatch(/halved/);
    expect(mangledRegexDefect("^(?![\\s\\S]*(air space|airspace))[\\s\\S]*$")).toBeNull();
    expect(mangledRegexDefect("wall[^;\\n]*(pulls|moves) away")).toBeNull();
    expect(mangledRegexDefect("\\b(sugar|sucrose)\\b")).toBeNull();
    expect(mangledRegexDefect("glows? red|sparks")).toBeNull();
  });
  test("lintContent reports it on a text common error", () => {
    const bundle = { questions: [{ id: "q.x.0001", parts: [{ id: "main", answer: { kind: "text" }, commonErrors: [{ misconception: "m", pattern: { kind: "text", regex: "water[^;n]*out" } }] }] }] };
    expect(lintContent(bundle, "x").some((d) => /looks mangled/.test(d))).toBe(true);
  });
});

describe("a TeX command without its backslash", () => {
  test("mathbf, frac and circ are named; real commands and prose pass", () => {
    expect(lostBackslashDefect("The vector $3mathbf{i} + 4mathbf{j}$")).toMatch(/mathbf/);
    expect(lostBackslashDefect("Simplify $frac{1}{2}x$")).toMatch(/frac/);
    expect(lostBackslashDefect("An angle of $53.13^circ$")).toMatch(/circ/);
    expect(lostBackslashDefect("The vector $3\\mathbf{i} + 4\\mathbf{j}$")).toBeNull();
    expect(lostBackslashDefect("Simplify $\\frac{1}{2}x$ and $x^{\\circ}$")).toBeNull();
    expect(lostBackslashDefect("the frac{tion} in prose outside maths")).toBeNull();
  });
  test("lintContent reports it on a stem", () => {
    const bundle = { questions: [{ id: "q.x.0001", stem: "Write $2mathbf{i}$ as a column vector.", parts: [{ id: "main", answer: { kind: "text" } }] }] };
    expect(lintContent(bundle, "x").some((d) => /without its backslash/.test(d))).toBe(true);
  });
});

describe("figureLeakWarnings", () => {
  const svg = (inner: string) => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg><title>a plant cell</title>${inner}</svg>`);
  test("a figure label that is the part's own answer is reported, an unlabelled copy is not", () => {
    const leaky = { questions: [{ id: "q.x.0001", figures: [{ kind: "svg", src: svg("<text>chloroplasts</text><text>cell wall</text>"), alt: "a labelled plant cell" }], parts: [{ id: "iii", answer: { kind: "text", accepted: ["chloroplasts"], keyWords: [{ any: ["chloroplast"], marks: 1 }] } }] }] };
    expect(figureLeakWarnings(leaky, "x")).toEqual(['x q.x.0001(iii): figure 1 prints "chloroplasts", which this part asks her to give']);
    const clean = { questions: [{ id: "q.x.0001", figures: [{ kind: "svg", src: svg("<text>A</text><text>B</text>"), alt: "a plant cell with the parts lettered" }], parts: [{ id: "iii", answer: { kind: "text", accepted: ["chloroplasts"], keyWords: [{ any: ["chloroplast"], marks: 1 }] } }] }] };
    expect(figureLeakWarnings(clean, "x")).toEqual([]);
  });
  test("two labels in separate text nodes are two labels, not one phrase (QA fixer, B1 food web)", () => {
    // "wheat" and "hawthorn" are two organisms on the web; the build used to join the nodes and read "wheat hawthorn",
    // the part's key word for naming both producers, as printed on the figure
    const part = { id: "a", stem: "Name the two producers.", answer: { kind: "text", accepted: ["wheat and hawthorn"], keyWords: [{ any: ["wheat and hawthorn", "wheat hawthorn"], marks: 1 }] } };
    const apart = { questions: [{ id: "q.x.0004", figures: [{ kind: "svg", src: svg("<text x='10' y='20'>wheat</text><text x='90' y='20'>hawthorn</text>"), alt: "a food web" }], parts: [part] }] };
    expect(figureLeakWarnings(apart, "x")).toEqual([]);
    const together = { questions: [{ id: "q.x.0004", figures: [{ kind: "svg", src: svg("<text x='10' y='20'>wheat hawthorn</text>"), alt: "a food web" }], parts: [part] }] };
    expect(figureLeakWarnings(together, "x")).toEqual(['x q.x.0004(a): figure 1 prints "wheat hawthorn", which this part asks her to give']);
  });
  test("generic words and numbers do not count", () => {
    const b = { questions: [{ id: "q.x.0002", figures: [{ kind: "svg", src: svg("<text>time / s</text><text>12</text>"), alt: "a graph" }], parts: [{ id: "a", answer: { kind: "text", accepted: ["time"], keyWords: [{ any: ["time"], marks: 1 }] } }, { id: "b", answer: { kind: "numeric", value: 12 } }] }] };
    expect(figureLeakWarnings(b, "x")).toEqual([]);
  });
});

describe("a unit-omitted common error on a unitRequired part", () => {
  test("the correct value without its unit is fireable, so it is not reported", () => {
    const part = (unitRequired: boolean) => ({ id: "main", answer: { kind: "numeric", value: 108, tolerance: { type: "absolute", value: 0.5 }, unit: "m²", unitRequired }, commonErrors: [{ misconception: "unit-omitted", pattern: { kind: "numeric", value: 108 }, marksTypicallyEarned: 1, feedback: "The unit is part of the answer." }] });
    expect(lintContent({ questions: [{ id: "q.x.0001", parts: [part(true)] }] }, "x").filter((d) => /never fire/.test(d))).toEqual([]);
    expect(lintContent({ questions: [{ id: "q.x.0001", parts: [part(false)] }] }, "x").filter((d) => /never fire/.test(d))).toHaveLength(1);
  });
});

describe("a doubled backslash inside maths", () => {
  test("two backslash characters before ce read as a line break and are reported", () => {
    expect(lostBackslashDefect("write it with the $\\\\ce{<=>}$ sign")).toMatch(/doubled backslash/);
    expect(lostBackslashDefect("write it with the $\\ce{<=>}$ sign")).toBeNull();
    expect(lostBackslashDefect("a matrix row $1 & 2 \\\\ 3 & 4$")).toBeNull();
  });
});

describe("a numeric answer with its unit in a figure's prose", () => {
  test("54 cm³ in the title of the figure for a part whose answer is 54 cm³ is a leak; 54 on an axis is not", () => {
    const svg = (title: string, inner: string) => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg><title>${title}</title>${inner}</svg>`);
    const leaky = { questions: [{ id: "q.x.0003", figures: [{ kind: "svg", src: svg("the curve goes flat at 54 cm³ after 50 seconds", "<text>54</text>"), alt: "a volume-time graph" }], parts: [{ id: "main", answer: { kind: "numeric", value: 54, unit: "cm³" } }] }] };
    expect(figureLeakWarnings(leaky, "x")).toHaveLength(1);
    const clean = { questions: [{ id: "q.x.0003", figures: [{ kind: "svg", src: svg("a volume-time graph", "<text>volume / cm³</text><text>50</text><text>54</text>"), alt: "a volume-time graph" }], parts: [{ id: "main", answer: { kind: "numeric", value: 54, unit: "cm³" } }] }] };
    expect(figureLeakWarnings(clean, "x")).toEqual([]);
  });
});

describe("worked-example figures and overlapping labels", () => {
  const svg = (inner: string) => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg>${inner}</svg>`);
  test("a worked example whose figure plots its final answer's points is reported", () => {
    const b = { workedExamples: [{ id: "we.x.01", finalAnswer: "The curve crosses at (1, 0) and (5, 0).", figure: { kind: "svg", src: svg("<title>the curve through (1, 0) and (5, 0)</title><path d='M1 1'/>"), alt: "a sketch" } }] };
    expect(figureLeakWarnings(b, "x")).toEqual(['x we.x.01: the worked example\'s figure prints "(1, 0)", which the problem version asks for as the final answer']);
  });

  // WorkedExampleAsQuestion.tsx: the twin mode shows only we.twin.figure; the faded modes show we.figure while the
  // steps they hide are hers to write, and the problem mode shows it above an empty answer line.
  const enzyme = (figure: string, extra: Record<string, unknown> = {}) => ({
    workedExamples: [
      {
        id: "we.x.02",
        stem: "Groups A and B timed amylase at 30 °C: 148 s and 152 s. (a) Calculate the mean time. (b) Give the optimum temperature.",
        figure: { kind: "svg", src: svg(figure), alt: "A graph of the time for the starch to disappear against temperature." },
        steps: [
          { n: 1, working: "mean = (148 + 152) ÷ 2", decision: "Add, then divide." },
          { n: 2, working: "= 150 s", decision: "Finish.", input: { kind: "numeric", value: 150, unit: "s" } },
          { n: 3, working: "optimum = 40 °C", decision: "Read the lowest point." },
        ],
        finalAnswer: "(a) 150 s (b) 40 °C",
        twin: { stem: "Two groups recorded 96 s and 104 s. Calculate the mean.", answer: { kind: "numeric", value: 100, unit: "s" } },
        faded: [{ showSteps: 2, studentSupplies: [3] }],
        ...extra,
      },
    ],
  });
  test("a worked example's figure is not compared with the twin's answer: the twin mode never shows it", () => {
    expect(figureLeakWarnings(enzyme("<text>the twin's mean is 100 s</text><path d='M1 1'/>"), "x")).toEqual([]);
  });
  test("a worked example's figure that prints a step a faded version hides is reported, with the step", () => {
    // step 3 is hidden by faded1 as authored and by faded2 by default; 40 °C is also the final answer's (b)
    expect(figureLeakWarnings(enzyme("<text>optimum 40 °C</text><path d='M1 1'/>"), "x")).toEqual([
      'x we.x.02: the worked example\'s figure prints "40 °C", which step 3 asks her to write in a faded version',
      'x we.x.02: the worked example\'s figure prints "40 °C", which the problem version asks for as the final answer',
    ]);
    // step 2's 150 s is hidden only when a faded version leaves it to her
    const faded2 = enzyme("<text>mean 150 s</text><path d='M1 1'/>", { faded: [{ showSteps: 2, studentSupplies: [3] }, { showSteps: 1, studentSupplies: [2, 3] }] });
    expect(figureLeakWarnings(faded2, "x")[0]).toBe('x we.x.02: the worked example\'s figure prints "150 s", which step 2 asks her to write in a faded version');
  });
  test("two axis ticks side by side are not the final answer's point", () => {
    // m7 combined transformations: ticks "-2" and "2" printed next to each other read as (-2, 2) when the text is joined
    const b = { workedExamples: [{ id: "we.x.03", stem: "Reflect T, then enlarge it.", finalAnswer: 'T" at (-2, 0), (1, 0), (-2, 2)', figure: { kind: "svg", src: svg("<text>-4</text><text>-2</text><text>2</text><text>4</text><path d='M1 1'/>"), alt: "a grid" } }] };
    expect(figureLeakWarnings(b, "x")).toEqual([]);
    const labelled = { workedExamples: [{ ...b.workedExamples[0], figure: { kind: "svg", src: svg("<text>(-2, 2)</text><path d='M1 1'/>"), alt: "a grid" } }] };
    expect(figureLeakWarnings(labelled, "x")).toHaveLength(1);
  });
  test("a value the stem already gives is not a leak", () => {
    expect(figureLeakWarnings(enzyme("<text>Group A: 148 s</text><path d='M1 1'/>"), "x")).toEqual([]);
  });
  test("the twin's own figure is compared with the twin's answer", () => {
    const b = enzyme("<text>time / s</text><path d='M1 1'/>", { twin: { stem: "Two groups recorded 96 s and 104 s. Calculate the mean.", answer: { kind: "numeric", value: 100, unit: "s" }, figure: { kind: "svg", src: svg("<text>mean 100 s</text><path d='M1 1'/>"), alt: "a bar chart" } } });
    expect(figureLeakWarnings(b, "x")).toEqual(['x we.x.02: the twin\'s figure prints "100 s", which the twin asks her to give']);
  });
  test("two labels on the same anchor within twelve pixels are reported", () => {
    const b = { questions: [{ id: "q.x.0015", figures: [{ kind: "svg", src: svg("<text x='260' y='238'>y m, the far side</text><text x='260' y='240'>36 m of fencing</text>"), alt: "two pens" }], parts: [{ id: "a", answer: { kind: "numeric", value: 6 } }] }] };
    expect(figureLeakWarnings(b, "x")).toEqual(['x q.x.0015: figure 1 labels "y m, the far side" and "36 m of fencing" overlap']);
  });
});
