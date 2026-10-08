import { describe, expect, test } from "vitest";
import { figureLeakWarnings, figureSourceWarnings, lintContent, lintNoteBlocks, lostBackslashDefect, mangledRegexDefect, markingWarnings, noteBlockWarnings, sizeWarnings, svgDrawDefects, weFigureFor } from "./content-lint";
import { figureForMode } from "./WorkedExampleAsQuestion";
import { ALLOWED } from "../../../scripts/qa/figure-leaks.mjs";

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

/**
 * The See it block and the gate's twin (docs/plan/review/2026-09-27-see-it-block-shape.md; the types SeeBlockInline,
 * SeeBlockReference and GateTwin in ./gates). The build refuses a note whose See it the renderer could not draw:
 * two to six steps numbered 1..k, each with its line and its reason; at most one typed step, never in the topic's
 * first See it; a reference that names a worked example the bundle ships; a twin with its prompt, answer and
 * explanation; and, in a section that holds a See it, no gate before it.
 */
describe("lintNoteBlocks: the See it block and the gate twin", () => {
  const step = (n: number, extra: Record<string, unknown> = {}) => ({ n, working: `$x = ${n}$`, decision: `Reason ${n}.`, ...extra });
  const see = (k: number, extra: Record<string, unknown> = {}) => ({ type: "see", stem: "Simplify it.", steps: Array.from({ length: k }, (_, i) => step(i + 1)), ...extra });
  const gate = (id: string, extra: Record<string, unknown> = {}) => ({ type: "gate", id, kind: "choice", prompt: "Which?", options: ["A one", "B two"], answer: "A one", explain: "Because.", ...extra });
  const h = (text: string, role?: string) => ({ type: "h", text, ...(role ? { role } : {}) });
  const p = { type: "p", md: "The idea in words." };
  const WE = "we.fm.u1.algebraic-fractions-simplify.02";
  const bundle = (steps = 3, status = "verified") => ({
    workedExamples: [{ id: WE, verification: "ver.we.02", stem: "s", steps: Array.from({ length: steps }, (_, i) => step(i + 1)) }],
    verification: [{ id: "ver.we.02", status }],
  });
  const label = "further-maths/fm1/algebraic-fractions-simplify";

  test("a valid inline See it, then its gate with a twin, has no defect", () => {
    const twin = { prompt: "Which, now?", options: ["C three", "D four"], answer: "C three", explain: "The same step on new numbers." };
    const blocks = [h("1. The idea", "idea"), p, see(3, { finalAnswer: "$x = 3$" }), gate("g1", { twin })];
    expect(lintNoteBlocks(blocks, label, bundle())).toEqual([]);
  });

  test("a valid reference to a worked example the bundle ships has no defect", () => {
    const blocks = [h("1. The idea", "idea"), p, see(2), gate("g1"), h("2. Factorise first", "variant"), p, { type: "see", workedExample: WE }, gate("g2")];
    expect(lintNoteBlocks(blocks, label, bundle())).toEqual([]);
  });

  test("a See it with seven steps is refused (two to six)", () => {
    const r = lintNoteBlocks([h("1. The idea", "idea"), p, see(7), gate("g1")], label, bundle());
    expect(r).toEqual([`${label} note block 2 (See it): 7 steps (a See it has two to six)`]);
    expect(lintNoteBlocks([h("1. The idea", "idea"), p, see(1), gate("g1")], label, bundle())).toEqual([`${label} note block 2 (See it): 1 step (a See it has two to six)`]);
  });

  test("steps numbered out of order, or missing a line or a reason, are refused", () => {
    const bad = { type: "see", stem: "s", steps: [step(1), step(3), { n: 3, working: "", decision: "r" }, { n: 4, working: "$y$" }] };
    expect(lintNoteBlocks([bad, gate("g1")], label, bundle())).toEqual([
      `${label} note block 0 (See it): step 2 is numbered 3 (steps run 1, 2, 3 … in order)`,
      `${label} note block 0 (See it): step 3 has no working line`,
      `${label} note block 0 (See it): step 4 has no reason (decision)`,
    ]);
    expect(lintNoteBlocks([{ type: "see", steps: [step(1), step(2)] }, gate("g1")], label, bundle())).toEqual([`${label} note block 0 (See it): no stem`]);
  });

  test("a reference to a worked example the bundle does not hold, or does not ship, is refused", () => {
    const missing = [h("1. The idea", "idea"), p, see(2), gate("g1"), h("2. Next", "variant"), { type: "see", workedExample: "we.fm.u1.nowhere.01" }, gate("g2")];
    expect(lintNoteBlocks(missing, label, bundle())).toEqual([`${label} note block 5 (See it): names worked example we.fm.u1.nowhere.01, which the bundle does not hold`]);
    const draft = [h("1. The idea", "idea"), p, see(2), gate("g1"), h("2. Next", "variant"), { type: "see", workedExample: WE }, gate("g2")];
    expect(lintNoteBlocks(draft, label, bundle(3, "draft"))).toEqual([`${label} note block 5 (See it): names worked example ${WE}, which the bundle does not ship (its log is draft)`]);
    expect(lintNoteBlocks(draft, label, bundle(7))).toEqual([`${label} note block 5 (See it): names worked example ${WE}, which has 7 steps (a See it has two to six)`]);
    expect(lintNoteBlocks([{ type: "see", workedExample: WE, steps: [step(1), step(2)] }, gate("g1")], label, bundle())).toEqual([
      `${label} note block 0 (See it): carries both a workedExample and its own steps (use one form)`,
    ]);
  });

  test("the topic's first See it asks for no input; a later one may ask for one, never two", () => {
    // a well-formed typed answer (the schema's AnswerSpec), so only the rule under test speaks
    const input = { input: { kind: "numeric", value: 3, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] } };
    const first = { type: "see", stem: "s", steps: [step(1), step(2, input)] };
    expect(lintNoteBlocks([h("1. The idea", "idea"), p, first, gate("g1")], label, bundle())).toEqual([
      `${label} note block 2 (See it): the topic's first See it asks her to type step 2 (the first See it is shown, never typed)`,
    ]);
    const later = [h("1. The idea", "idea"), p, see(2), gate("g1"), h("2. Next", "variant"), p, { type: "see", stem: "s", steps: [step(1), step(2, input)] }, gate("g2")];
    expect(lintNoteBlocks(later, label, bundle())).toEqual([]);
    const two = [h("1. The idea", "idea"), p, see(2), gate("g1"), h("2. Next", "variant"), p, { type: "see", stem: "s", steps: [step(1, input), step(2, input)] }, gate("g2")];
    expect(lintNoteBlocks(two, label, bundle())).toEqual([`${label} note block 6 (See it): 2 typed steps (at most one)`]);
  });

  test("a gate's twin needs its prompt, answer and explanation, and a choice twin's answer is one of its options", () => {
    const blocks = [see(2), gate("g1", { twin: { prompt: "Again?", answer: "A one" } }), see(2), gate("g2", { twin: { prompt: "Again?", options: ["C", "D"], answer: "E", explain: "Why." } })];
    expect(lintNoteBlocks(blocks, label, bundle())).toEqual([
      `${label} note block 1 (gate g1): its twin has no explain`,
      `${label} note block 1 (gate g1): the twin of a choice gate needs its options`,
      `${label} note block 3 (gate g2): the twin's answer "E" is not one of its options`,
    ]);
  });

  /**
   * A See it step IS a worked example's step, so its mark codes, its typed answer and its why-menu have the schema's
   * shape; a figure or a final answer that is there must be one. The schema (src/lib/content/schema.ts) refuses these;
   * the lint refuses them too, in the schema's own words (it asks the schema), so an author reads one message.
   */
  test("the five shapes the schema refuses are refused in the schema's own words", () => {
    const later = (s: Record<string, unknown>) => [h("1. The idea", "idea"), p, see(2), gate("g1"), h("2. Next", "variant"), p, see(2, { steps: [step(1), step(2, s)] }), gate("g2")];
    expect(lintNoteBlocks(later({ earns: ["M1 A1"] }), label, bundle())).toEqual([`${label} note block 6 (See it): step 2 earns.0: a mark code such as "M1", "A1" or "MA1"`]);
    expect(lintNoteBlocks(later({ input: { kind: "numeric", value: "two" } }), label, bundle())).toEqual([
      `${label} note block 6 (See it): step 2 input.value: Invalid input: expected number, received string`,
      `${label} note block 6 (See it): step 2 input.tolerance: Invalid input: expected object, received undefined`,
      `${label} note block 6 (See it): step 2 input.unitRequired: Invalid input: expected boolean, received undefined`,
      `${label} note block 6 (See it): step 2 input.acceptForms: Invalid input: expected array, received undefined`,
    ]);
    expect(lintNoteBlocks(later({ whyMenu: { options: ["only one"], correct: 0, explain: "E" } }), label, bundle())).toEqual([
      `${label} note block 6 (See it): step 2 whyMenu.options: Too small: expected array to have >=2 items`,
    ]);
    expect(lintNoteBlocks([see(2, { figure: { kind: "svg", src: "", alt: "" } }), gate("g1")], label, bundle())).toEqual([
      `${label} note block 0 (See it): figure.src: Too small: expected string to have >=1 characters`,
      `${label} note block 0 (See it): figure.alt: Too small: expected string to have >=1 characters`,
    ]);
    expect(lintNoteBlocks([see(2, { finalAnswer: "" }), gate("g1")], label, bundle())).toEqual([
      `${label} note block 0 (See it): finalAnswer: Too small: expected string to have >=1 characters`,
    ]);
    // a well-formed step, figure and final answer pass
    expect(lintNoteBlocks(later({ earns: ["MW1", "W2"], whyMenu: { options: ["a", "b"], correct: 1, explain: "E" } }), label, bundle())).toEqual([]);
    expect(lintNoteBlocks([see(2, { figure: { kind: "svg", src: "<svg><path d='M1 1'/></svg>", alt: "A curve" }, finalAnswer: "$x = 2$" }), gate("g1")], label, bundle())).toEqual([]);
  });

  test("a See it's kind is one of the schema's seven, in the schema's words", () => {
    expect(lintNoteBlocks([see(2, { kind: "calculation" }), gate("g1")], label, bundle())).toEqual([]);
    const r = lintNoteBlocks([see(2, { kind: "anecdote" }), gate("g1")], label, bundle());
    expect(r).toHaveLength(1);
    expect(r[0]).toMatch(/^further-maths\/fm1\/algebraic-fractions-simplify note block 0 \(See it\): kind: Invalid option: expected one of "calculation"\|"explanation"\|"process"\|"practical"\|"data"\|"extended"\|"proof"$/);
  });

  test("a reference that is not a worked example id is refused in the schema's words, before the bundle is looked in", () => {
    const blocks = [h("1. The idea", "idea"), p, see(2), gate("g1"), h("2. Next", "variant"), { type: "see", workedExample: "the second example" }, gate("g2")];
    expect(lintNoteBlocks(blocks, label, bundle())).toEqual([`${label} note block 5 (See it): workedExample: a worked example id ("we.…")`]);
    expect(lintNoteBlocks(blocks, label)).toEqual([`${label} note block 5 (See it): workedExample: a worked example id ("we.…")`]);
  });

  test("in a section that holds a See it, no gate comes before it; a note with no See it is not judged here", () => {
    const early = [h("1. The idea", "idea"), p, gate("g1"), see(2), gate("g2")];
    expect(lintNoteBlocks(early, label, bundle())).toEqual([`${label} note block 2 (gate g1): comes before its section's See it (a section's gate follows its See it)`]);
    // a "See it done" heading continues the section above, so its See it does not excuse the gate above it
    const continued = [h("2. Factorise first", "variant"), p, gate("g3"), h("See it done at writing speed", "see"), see(3), gate("g4")];
    expect(lintNoteBlocks(continued, label, bundle())).toEqual([`${label} note block 2 (gate g3): comes before its section's See it (a section's gate follows its See it)`]);
    // a section of its own with no See it is today's note, migrating: the lesson lint warns on it, the build does not refuse it
    const legacy = [h("1. The idea", "idea"), p, gate("g1"), h("2. Next", "variant"), p, see(2), gate("g2")];
    expect(lintNoteBlocks(legacy, label, bundle())).toEqual([]);
  });

  test("a See it's own figure gets the drawing checks", () => {
    const figure = { kind: "svg", src: '<svg><g stroke-width="2">M1 1 L2 2</g></svg>', alt: "The curve" };
    const r = lintNoteBlocks([see(2, { figure }), gate("g1")], label, bundle());
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]).toMatch(/^further-maths\/fm1\/algebraic-fractions-simplify note block 0 "The curve": SVG figure: path data sits as bare text/);
  });

  test("without the bundle, a reference is not resolved (the shape rules still apply)", () => {
    expect(lintNoteBlocks([h("1", "idea"), p, see(2), gate("g1"), h("2", "variant"), { type: "see", workedExample: "we.x.01" }, gate("g2")], label)).toEqual([]);
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

  // The build and scripts/qa/figure-leaks.mjs never disagree (the lead, 7 Oct 2026): the build reads no withdrawn item
  // (shingles-allow.mjs withoutWithdrawn, the same rule) and drops every part figure-leaks.mjs ALLOWED exempts.
  const leakyQ = (id: string, verification?: string) => ({
    id,
    ...(verification ? { verification } : {}),
    figures: [{ kind: "svg", src: svg("<text>chloroplasts</text>"), alt: "a labelled plant cell" }],
    parts: [{ id: "a", answer: { kind: "text", accepted: ["chloroplasts"], keyWords: [] } }],
  });
  test("a withdrawn question is not read, by a record or by its own log; a draft is", () => {
    const rec = { id: "q.x.0001", kind: "question", replacedBy: null, reason: "Reissued.", on: "2026-10-07T21:00:00Z" };
    expect(figureLeakWarnings({ questions: [leakyQ("q.x.0001"), leakyQ("q.x.0002")], verification: [{ id: "v.note", status: "verified", withdrawn: [rec] }] }, "x")).toEqual([
      'x q.x.0002(a): figure 1 prints "chloroplasts", which this part asks her to give',
    ]);
    expect(figureLeakWarnings({ questions: [leakyQ("q.x.0001", "v.q1")], verification: [{ id: "v.q1", itemId: "q.x.0001", status: "withdrawn" }] }, "x")).toEqual([]);
    expect(figureLeakWarnings({ questions: [leakyQ("q.x.0001", "v.q1")], verification: [{ id: "v.q1", itemId: "q.x.0001", status: "draft" }] }, "x")).toHaveLength(1);
  });
  test("a part figure-leaks.mjs ALLOWED exempts is not reported, and the B2 natural-selection dish is allowed with its reason", () => {
    // q.science.b1.b1-fieldwork-sampling.0006#a: a dichotomous key has to name the plants it keys out
    const key = { id: "q.science.b1.b1-fieldwork-sampling.0006", figures: [{ kind: "svg", src: svg("<text>clover</text>"), alt: "a key" }], parts: [{ id: "a", answer: { kind: "text", accepted: ["clover"], keyWords: [] } }] };
    expect(figureLeakWarnings({ questions: [key] }, "x")).toEqual([]);
    expect(ALLOWED.get("q.science.b2.b2-natural-selection-selective-breeding.0018#a")).toMatch(/key names the two kinds of bacteria/);
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

describe("figurePlain: the build warning reads the figure each mode shows", () => {
  const svg = (inner: string) => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg>${inner}<path d='M1 1'/></svg>`);
  const annotated = { kind: "svg", src: svg("<text>optimum 40 °C</text>"), alt: "an annotated graph" };
  const plain = { kind: "svg", src: svg("<text>temperature / °C</text>"), alt: "the same graph, unannotated" };
  const we = (extra: Record<string, unknown>) => ({
    id: "we.x.04",
    stem: "Give the optimum temperature.",
    steps: [
      { n: 1, working: "Find the lowest point of the curve.", decision: "Look." },
      { n: 2, working: "optimum = 40 °C", decision: "Read it." },
    ],
    finalAnswer: "40 °C",
    twin: { stem: "Give the optimum.", answer: { kind: "numeric", value: 35, unit: "°C" } },
    faded: [],
    ...extra,
  });
  test("chooses the renderer's figure in every mode, with and without figurePlain", () => {
    for (const w of [we({ figure: annotated }), we({ figure: annotated, figurePlain: plain })])
      for (const mode of ["full", "faded1", "faded2", "problem"] as const) expect(weFigureFor(w, mode)).toBe(figureForMode(w as never, mode));
  });
  test("compares figurePlain for the faded and problem modes; the full example's annotated figure hides nothing", () => {
    expect(figureLeakWarnings({ workedExamples: [we({ figure: annotated, figurePlain: plain })] }, "x")).toEqual([]);
    expect(figureLeakWarnings({ workedExamples: [we({ figure: annotated })] }, "x")).toHaveLength(2);
    expect(figureLeakWarnings({ workedExamples: [we({ figure: plain, figurePlain: annotated })] }, "x")).toHaveLength(2);
  });
});

/**
 * Gate explanations that name an option by its place (the lead, 27 Sep 2026). src/lib/gate-order.ts pins such a gate to
 * its authored order so the words stay true, and the authored order puts the right answer first (A), which the owner
 * noticed in the trial. The build warns with the topic, the gate and the sentence, using gate-order's own reader.
 */
describe("noteBlockWarnings: positional wording", () => {
  const choice = (id: string, explain: string, extra: Record<string, unknown> = {}) => ({ type: "gate", id, kind: "choice", prompt: "Which?", options: ["A one", "B two", "C three"], answer: "A one", explain, ...extra });
  const label = "further-maths/content/fm1/algebraic-fractions-add-subtract";

  test("names the gate and the sentence, for the explanation and for the twin's", () => {
    const blocks = [
      choice("g3", "The whole product is taken away. The second option changed the sign of the first term only."),
      choice("g4", "Multiply up first.", { twin: { prompt: "Again?", options: ["D", "E"], answer: "D", explain: "Only the first answer has both." } }),
      choice("g5", "Factorise, then cancel the bracket."),
    ];
    expect(noteBlockWarnings(blocks, label)).toEqual([
      `${label} gate g3: its explanation names an option by its place ("The second option changed the sign of the first term only."): the gate is then shown in its written order, so its answer stays where it was written; name the option by what it says`,
      `${label} gate g4: its twin's explanation names an option by its place ("Only the first answer has both."): that is true only in the order the twin was written; name the option by what it says`,
    ]);
  });

  test("skips a gate the note's log withdrew (item 15)", () => {
    const bundle = { note: { verification: "ver.note" }, verification: [{ id: "ver.note", status: "verified", withdrawn: [{ id: "g3", kind: "gate", replacedBy: "g9", reason: "r", on: "2026-09-27T20:00:00Z" }] }] };
    const blocks = [choice("g3", "The second option changed the sign."), choice("g4", "The second option forgot to multiply up.")];
    expect(noteBlockWarnings(blocks, label, bundle).map((w: string) => w.split(":")[0])).toEqual([`${label} gate g4`]);
  });

  test("reads choice gates only: a typed gate's 'second answer' is a second root, not an option", () => {
    const typed = { type: "gate", id: "g1", kind: "number", prompt: "The positive root?", answer: "4", explain: "The second answer, x = −3, is rejected." };
    expect(noteBlockWarnings([typed], label)).toEqual([]);
    expect(noteBlockWarnings(null, label)).toEqual([]);
  });
});

/**
 * The lead's item 13 (27 Sep 2026, 21:50): in a v3 note (one that holds a See it), every wrong option of a choice gate
 * carries its note (why it tempts, what is wrong with it), and every inline See it names its kind. Warnings only; a note
 * written before the See it block is not judged, since its migration adds both.
 */
describe("noteBlockWarnings: option notes and the See it kind in a v3 note", () => {
  const label = "further-maths/content/fm1/algebraic-fractions-simplify";
  const step = (n: number) => ({ n, working: `$x = ${n}$`, decision: `Reason ${n}.` });
  const see = (extra: Record<string, unknown> = {}) => ({ type: "see", stem: "S", steps: [step(1), step(2)], ...extra });
  const choice = (id: string, extra: Record<string, unknown> = {}) => ({ type: "gate", id, kind: "choice", prompt: "Which?", options: ["a", "b", "c"], answer: "a", explain: "Because.", ...extra });
  const note = (option: string) => ({ option, why: "It tempts because …; it is wrong because …" });

  test("names each wrong option without a note, and each inline See it without a kind", () => {
    const blocks = [see(), choice("g1", { optionNotes: [note("b")] }), see({ kind: "calculation" }), choice("g2", { optionNotes: [note("b"), note("c")] }), { type: "see", workedExample: "we.x.01" }, { type: "gate", id: "g3", kind: "number", prompt: "n?", answer: "2", explain: "E." }];
    expect(noteBlockWarnings(blocks, label)).toEqual([
      `${label} note block 0 (See it): no kind (one of calculation, explanation, process, practical, data, extended, proof)`,
      `${label} gate g1: no option note on "c" (one sentence on why that option tempts and what is wrong with it)`,
    ]);
  });

  test("a note written before the See it block is not judged", () => {
    expect(noteBlockWarnings([choice("g1")], label)).toEqual([]);
  });
});

/**
 * Sizes (the lead's item 16, 27 Sep 2026): b2-natural-selection-selective-breeding reached 3.37 MB with four questions of
 * 350–650 KB of inline figure markup. The build warns on a question, a worked example or a See it over 40 KB serialised,
 * a note over 150 KB and a bundle over 600 KB, naming the item and its size.
 */
describe("sizeWarnings", () => {
  const label = "science/content/b2/b2-natural-selection-selective-breeding";
  const pad = (kb: number) => "x".repeat(Math.round(kb * 1024));
  test("names each item over its limit with its size, and passes items under it", () => {
    const bundle = {
      topic: { id: "science.b2.x" },
      questions: [{ id: "q.big", figures: [{ kind: "svg", src: pad(41), alt: "a" }] }, { id: "q.small", figures: [] }],
      workedExamples: [{ id: "we.big", stem: pad(45) }, { id: "we.small", stem: "s" }],
    };
    const blocks = [{ type: "see", stem: pad(42), steps: [] }, { type: "p", md: "short" }];
    expect(sizeWarnings(bundle, blocks, label)).toEqual([
      `${label} q.big: 41 KB serialised (a question is at most 40 KB; inline figure markup is the usual cause)`,
      `${label} we.big: 45 KB serialised (a worked example is at most 40 KB; inline figure markup is the usual cause)`,
      `${label} note block 0 (See it): 42 KB serialised (a See it is at most 40 KB; inline figure markup is the usual cause)`,
    ]);
  });

  test("a note over 150 KB and a bundle over 600 KB", () => {
    const bundle = { topic: { id: "science.b2.x" }, questions: Array.from({ length: 16 }, (_, i) => ({ id: `q.${i}`, stem: pad(39) })) };
    const blocks = Array.from({ length: 4 }, () => ({ type: "p", md: pad(39) }));
    const r = sizeWarnings(bundle, blocks, label);
    expect(r).toEqual([
      `${label} bundle as shipped: 625 KB serialised (a bundle is at most 600 KB, counted on what the build ships)`,
      `${label} note.blocks.json: 156 KB serialised (a note is at most 150 KB)`,
    ]);
    expect(sizeWarnings(null, null, label)).toEqual([]);
  });

  /**
   * The lead, 29 Sep 2026: a withdrawn item stays in the pack by rule but is never shipped, so it is never counted: not
   * against the item limit, and not in the bundle, which is measured as the build writes it (compact JSON of the shipped
   * items). The same rule as markingWarnings (item 15): an id in a withdrawn record, or a log that is not verified or
   * published, is left out.
   */
  test("a pack with a 500 KB withdrawn copy and 100 KB of shipped items reports nothing", () => {
    const shipped = (id: string, kb: number) => ({ id, verification: `ver.${id}`, stem: pad(kb) });
    const bundle = {
      topic: { id: "science.b2.x" },
      questions: [shipped("q.1", 33), shipped("q.2", 33), shipped("q.3", 33), { id: "q.old", verification: "ver.q.old", stem: pad(500) }],
      workedExamples: [{ id: "we.old", verification: "ver.we.old", stem: pad(90) }],
      verification: [
        { id: "ver.q.1", itemId: "q.1", status: "verified" },
        { id: "ver.q.2", itemId: "q.2", status: "verified" },
        { id: "ver.q.3", itemId: "q.3", status: "published", withdrawn: [{ id: "q.old", kind: "question", replacedBy: "q.3", reason: "r", on: "2026-09-29T00:00:00Z" }] },
        { id: "ver.q.old", itemId: "q.old", status: "verified" },
        { id: "ver.we.old", itemId: "we.old", status: "withdrawn" },
      ],
    };
    expect(sizeWarnings(bundle, [{ type: "p", md: "short" }], label)).toEqual([]);
    // the same copy shipped (no withdrawn record, a shipped log) is named, and so is the bundle it swells past 600 KB
    const shippedCopy = {
      ...bundle,
      questions: [...bundle.questions.slice(0, 3), { id: "q.old", verification: "ver.q.old", stem: pad(520) }],
      verification: bundle.verification.map((l) => ({ ...l, withdrawn: undefined })),
    };
    const r = sizeWarnings(shippedCopy, null, label);
    expect(r[0]).toBe(`${label} q.old: 520 KB serialised (a question is at most 40 KB; inline figure markup is the usual cause)`);
    expect(r[1]).toMatch(/^science\/content\/b2\/b2-natural-selection-selective-breeding bundle as shipped: 6[12]\d KB serialised \(a bundle is at most 600 KB, counted on what the build ships\)$/);
    expect(r).toHaveLength(2);
  });
});

/**
 * Marking lints from the Fable judge's rulings of 27 Sep 2026 (fork scratchpad reports/fable-marking-rulings-judgement.md):
 * warnings, never refusals, each naming the topic, the item and the part.
 */
describe("markingWarnings", () => {
  const NUM = (value: number, extra: Record<string, unknown> = {}) => ({ kind: "numeric", value, tolerance: { type: "absolute", value: 0.01 }, unitRequired: false, acceptForms: ["decimal"], ...extra });
  const part = (id: string, stem: string, answer: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({
    id, stem, marks: 2, answer, scheme: [], hints: [], workedSolution: "Worked.", commonErrors: [], requiresWorking: false, ...extra,
  });
  const bundle = (subject: string, ...parts: Record<string, unknown>[]) => ({ topic: { id: `${subject}.x.y`, subject }, questions: [{ id: "q.x.y.0001", parts }] });
  const label = "maths/content/m8/surds";

  test("ruling 3: a 'show that' part with a value spec (numeric or algebraic) is flagged; a text or a plain part is not", () => {
    const b = bundle(
      "maths",
      part("a", String.raw`Show that the radius is $3\sqrt{2}$ cm.`, { kind: "algebraic", latex: String.raw`3\sqrt{2}`, variables: [], equivalence: "value" }),
      part("b", "Show that $x = 2.5$ is a root.", NUM(2.5)),
      part("c", "Show that the triangle is right-angled.", { kind: "text", accepted: ["a"], keyWords: [] }),
      part("d", "Work out $x$.", NUM(4)),
    );
    expect(markingWarnings(b, label)).toEqual([
      `${label} q.x.y.0001(a): a "show that" part with an algebraic answer spec: typing the printed result back is paid, and the exam pays only the working (ruling 3); give it a working or steps spec`,
      `${label} q.x.y.0001(b): a "show that" part with a numeric answer spec: typing the printed result back is paid, and the exam pays only the working (ruling 3); give it a working or steps spec`,
    ]);
  });

  test("ruling 5: unitRequired on a maths or further-maths part; science keeps it", () => {
    const withUnit = NUM(12, { unit: "cm", unitRequired: true });
    expect(markingWarnings(bundle("maths", part("a", "Find the length.", withUnit)), label)).toEqual([
      `${label} q.x.y.0001(a): unitRequired on a maths part: maths schemes carry no unit mark (ruling 5), so a right value without its unit loses a mark the exam gives`,
    ]);
    expect(markingWarnings(bundle("further-maths", part("a", "Find the speed.", withUnit)), label)).toHaveLength(1);
    expect(markingWarnings(bundle("science", part("a", "Calculate the current.", withUnit)), label)).toEqual([]);
  });

  test("ruling 14: a numeric part that uses an earlier numeric answer needs followThrough.relation", () => {
    const ft = { fromPart: "a", rule: "use-candidate-value" };
    const b = bundle(
      "further-maths",
      part("a", "Find $x$.", NUM(7.2)),
      part("b", "Hence find $y$.", NUM(2.2), { workedSolution: "$y = 7.2 - 5 = 2.2$" }),
      part("c", "Using your answer to (a), find $z$.", NUM(28.8), { followThrough: ft, workedSolution: String.raw`$z = 7.2 \times 4 = 28.8$` }),
      part("d", "Find $w$.", NUM(36.2), { workedSolution: String.raw`$w = 7.2 \times 5 + 0.2 = 36.2$` }),
      part("e", "Hence find $v$.", NUM(3), { followThrough: { ...ft, relation: "x - 4.2" } }),
    );
    expect(markingWarnings(b, label)).toEqual([
      `${label} q.x.y.0001(b): uses part (a) ("Hence") but has no followThrough: a right answer from her own earlier value is refused (ruling 14); add followThrough with its relation, or noFollowThrough quoting the scheme line`,
      `${label} q.x.y.0001(c): uses part (a) ("Using your answer") but its followThrough has no relation (the worked solution's chain carries it today) (ruling 14); add the relation, or noFollowThrough quoting the scheme line`,
      `${label} q.x.y.0001(d): uses part (a) (its worked solution computes the answer from 7.2) but has no followThrough: a right answer from her own earlier value is refused (ruling 14); add followThrough with its relation, or noFollowThrough quoting the scheme line`,
    ]);
  });

  test("ruling 14: noFollowThrough with the scheme line quoted is the one exemption; a small whole number reused is no evidence", () => {
    const b = bundle(
      "further-maths",
      part("a", "Find $x$.", NUM(7.2)),
      part("b", "Hence find $y$.", NUM(2.2), { noFollowThrough: "Allow no FT from an incorrect quadratic expression" }),
      part("c", "Find $n$.", NUM(3)),
      part("d", "Find $m$.", NUM(9), { workedSolution: String.raw`$m = 3 \times 3 = 9$` }),
      part("e", "Hence find $p$.", NUM(1), { noFollowThrough: "  " }),
      part("f", "Using your answer to (a), find $q$.", NUM(14.4)),
    );
    expect(markingWarnings(b, label)).toEqual([
      `${label} q.x.y.0001(e): uses part (d) ("Hence") but has no followThrough: a right answer from her own earlier value is refused (ruling 14); add followThrough with its relation, or noFollowThrough quoting the scheme line`,
      // the part its stem names, not the nearest one
      `${label} q.x.y.0001(f): uses part (a) ("Using your answer") but has no followThrough: a right answer from her own earlier value is refused (ruling 14); add followThrough with its relation, or noFollowThrough quoting the scheme line`,
    ]);
  });

  /**
   * The lead's item 14 (27 Sep 2026, the M4 author's finding, probed through markAnswer the same evening): a stem that
   * asks for the form ("simplify fully", "simplest form", "a single fraction", "write … as") with a spec that holds no
   * form, and any spec with equivalence "simplifiedOnly": the engine marks both after simplifying her answer, so an
   * equal answer in another form earns full marks (re-probed after the engine's build-9 change, which gives the question
   * typed back 0: 3(x+3)(x−3)/((x+3)(x−2)) for "Simplify fully" still 3/3, 2 × 275 for the prime factors of 550 2/2).
   */
  test("item 14: a form the stem asks for that the spec does not hold, and every simplifiedOnly spec", () => {
    const alg = (extra: Record<string, unknown>) => ({ kind: "algebraic", latex: String.raw`\frac{3(x-3)}{x-2}`, variables: ["x"], equivalence: "equivalent", ...extra });
    const b = bundle(
      "maths",
      part("a", String.raw`Simplify fully $\dfrac{3x^2-27}{x^2+x-6}$.`, alg({})),
      part("b", String.raw`Simplify fully $\dfrac{3x^2-27}{x^2+x-6}$.`, alg({ equivalence: "simplifiedOnly" })),
      part("c", "Write $0.375$ as a fraction in its simplest form.", NUM(0.375)),
      part("d", String.raw`Simplify fully $\dfrac{3x^2-27}{x^2+x-6}$.`, alg({ form: "simplest-fraction" })),
      part("e", "Write $0.375$ as a fraction in its simplest form.", NUM(0.375, { acceptForms: ["fraction"], mustBeSimplified: true })),
      part("f", String.raw`Write $\dfrac{1}{x} + \dfrac{1}{2x}$ as a single fraction.`, alg({ form: "single-fraction" })),
      part("g", "Find $x$ when $2x = 7$.", alg({ equivalence: "simplifiedOnly", latex: "3.5" })),
    );
    expect(markingWarnings(b, label)).toEqual([
      `${label} q.x.y.0001(a): the stem asks for the form ("Simplify fully") but the answer spec holds none (no form, mustBeFactorised or mustBeExpanded): the engine pays an equal answer in any other form in full (an uncollected or uncancelled fraction; 2 × 275 for the prime factors of 550); give it the form (simplest-fraction, single-fraction …)`,
      `${label} q.x.y.0001(b): equivalence "simplifiedOnly" marks her answer after simplifying it, so an uncancelled or uncollected answer earns full marks; use a form (simplest-fraction …) instead`,
      `${label} q.x.y.0001(c): the stem asks for the form ("its simplest form") but the answer spec holds none (neither mustBeSimplified nor a form-only acceptForms): the engine pays an equal answer in any other form in full (an uncollected or uncancelled fraction; 2 × 275 for the prime factors of 550); give it the form (acceptForms ["fraction"], mustBeSimplified)`,
      `${label} q.x.y.0001(g): equivalence "simplifiedOnly" marks her answer after simplifying it, so an uncancelled or uncollected answer earns full marks; use a form (simplest-fraction …) instead`,
    ]);
  });

  /** The lead's item 15: a withdrawn item is not shipped, so it is not warned on (m8 inverse-proportion, p2 echoes). */
  test("item 15: an item that is withdrawn or not shipped is skipped", () => {
    const withUnit = NUM(12, { unit: "cm", unitRequired: true });
    const q = (id: string, verification: string) => ({ id, verification, parts: [part("a", "Find the length.", withUnit)] });
    const b = {
      topic: { id: "maths.x.y", subject: "maths" },
      questions: [q("q.x.y.0001", "ver.1"), q("q.x.y.0002", "ver.2"), q("q.x.y.0003", "ver.3"), q("q.x.y.0004", "ver.4")],
      verification: [
        { id: "ver.1", status: "verified" },
        { id: "ver.2", status: "withdrawn" },
        { id: "ver.3", status: "verified", withdrawn: [{ id: "q.x.y.0003", kind: "question", replacedBy: "q.x.y.0004", reason: "r", on: "2026-09-27T20:00:00Z" }] },
        { id: "ver.4", status: "draft" },
      ],
    };
    expect(markingWarnings(b, label).map((w: string) => w.split(":")[0])).toEqual([`${label} q.x.y.0001(a)`]);
    // a bundle without logs (a test fixture, a generator's draft) is read in full
    expect(markingWarnings(bundle("maths", part("a", "Find the length.", withUnit)), label)).toHaveLength(1);
  });

  test("ruling 15: a common error on a form task earns at most marks − 1", () => {
    const ce = (m: number) => ({ misconception: "alg.uncancelled", pattern: { kind: "algebraic", latex: "x" }, feedback: "F", marksTypicallyEarned: m });
    // the form held (simplest-fraction), so only the rule under test speaks
    const alg = { kind: "algebraic", latex: String.raw`\frac{x}{2}`, variables: ["x"], equivalence: "equivalent", form: "simplest-fraction" };
    const b = bundle(
      "further-maths",
      part("a", String.raw`Simplify fully $\frac{2x}{4}$.`, alg, { marks: 3, commonErrors: [ce(2), ce(3)] }),
      part("b", "Find the value of $x$.", NUM(2), { marks: 2, commonErrors: [ce(2)] }),
    );
    expect(markingWarnings(b, label)).toEqual([
      `${label} q.x.y.0001(a): common error alg.uncancelled earns 3 of 3 on a form task (at most 2: the form is a mark; ruling 15)`,
    ]);
  });
});

describe("figure sources the renderer cannot inline (FIGURE)", () => {
  // The Unit 7 reviewer, 8 Oct 2026: u7-conclusions q0007's figure is a data URI with a raw "%", so decodeSvgDataUri
  // (src/lib/ux/svg.ts) fails, Figure.tsx falls back to an <img>, and the graph draws black on the dark and evening themes.
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0L10 10" stroke="currentColor"/><text x="1" y="9">50 %</text></svg>';
  const utf8 = (body: string) => `data:image/svg+xml;utf8,${body}`;
  const encoded = utf8(encodeURIComponent(svg));
  const base64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const bundle = (src: string, extra: Record<string, unknown> = {}) => ({
    questions: [{ id: "q.science.u7.u7-conclusions.0007", parts: [{ id: "a" }], figures: [{ kind: "svg", src, alt: "A graph." }], verification: "ver.q.7" }],
    verification: [{ id: "ver.q.7", itemId: "q.science.u7.u7-conclusions.0007", status: "verified" }],
    ...extra,
  });

  test("is quiet for a data URI that decodes to a well-formed SVG, URL-encoded or base64, and for an inline SVG", () => {
    expect(figureSourceWarnings(bundle(encoded), "science/u7/u7-conclusions")).toEqual([]);
    expect(figureSourceWarnings(bundle(base64), "science/u7/u7-conclusions")).toEqual([]);
    expect(figureSourceWarnings(bundle(svg), "science/u7/u7-conclusions")).toEqual([]);
  });

  test("names the item and the position of a raw % that does not decode", () => {
    const raw = utf8(encodeURIComponent(svg).replace("50%20%25", "50%20%"));
    const [w, ...rest] = figureSourceWarnings(bundle(raw), "science/u7/u7-conclusions");
    expect(rest).toEqual([]);
    expect(w).toContain("science/u7/u7-conclusions q.science.u7.u7-conclusions.0007");
    expect(w).toContain('a raw "%" at character ' + (raw.indexOf("50%20%") + 5 + 1));
    expect(w).toContain("<img>");
  });

  test("reports a base64 body that does not decode, and a body that does not begin with its <svg> element", () => {
    expect(figureSourceWarnings(bundle("data:image/svg+xml;base64,PHN2Zz4*"), "t")[0]).toContain('a character base64 does not use ("*") at character');
    const declared = utf8(encodeURIComponent('<?xml version="1.0"?>' + svg));
    expect(figureSourceWarnings(bundle(declared), "t")[0]).toContain("does not begin with its <svg> element");
  });

  test("reports SVG that is not well-formed after decoding, with the position in the decoded SVG", () => {
    const unclosed = figureSourceWarnings(bundle(utf8(encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0"/></svg>'))), "t")[0];
    expect(unclosed).toContain("not well-formed");
    expect(unclosed).toContain("</svg> closes <g>");
    const amp = figureSourceWarnings(bundle(utf8(encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"><text>salt & water</text></svg>'))), "t")[0];
    expect(amp).toContain('a bare "&"');
  });

  test("reads every figure source in a bundle and in note blocks, and skips withdrawn items", () => {
    const raw = utf8(encodeURIComponent(svg).replace("%25", "%"));
    const we = { id: "we.x.01", steps: [], figure: { kind: "svg", src: raw, alt: "x" }, twin: { figure: { kind: "svg", src: raw, alt: "x" } } };
    const warnings = figureSourceWarnings(bundle(encoded, { workedExamples: [we] }), "t");
    expect(warnings.map((w) => w.split(":")[0])).toEqual(["t we.x.01", "t we.x.01"]);
    const blocks = [{ type: "h", text: "One" }, { type: "see", stem: "S", steps: [], figure: { kind: "svg", src: raw, alt: "x" } }, { type: "figure", alt: "x", svg: raw }];
    expect(figureSourceWarnings(blocks, "t").map((w) => w.split(":")[0])).toEqual(["t note block 2 (see)", "t note block 3 (figure)"]);
    const withdrawn = bundle(raw, { verification: [{ id: "ver.q.7", itemId: "q.science.u7.u7-conclusions.0007", status: "withdrawn" }] });
    expect(figureSourceWarnings(withdrawn, "t")).toEqual([]);
  });
});
