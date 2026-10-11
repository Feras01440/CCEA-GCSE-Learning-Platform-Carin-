import { describe, expect, test } from "vitest";
import type { AnswerSpec, CommonError, MarkPoint } from "@/lib/content/schema";
import { checkNumeric } from "@/lib/marking/numeric";
import { followThroughValue, instructsAccuracy, instructsUnit, isFormTask, isShowThat, markAnswer, matchesCommonError, twinScheme, variableLetters } from "./mark";

const median: AnswerSpec = {
  kind: "numeric",
  value: 36.2,
  tolerance: { type: "range", min: 36.1, max: 36.2 },
  unit: "cm",
  unitRequired: false,
  acceptForms: ["decimal"],
};

const commonErrors: CommonError[] = [
  {
    misconception: "median.class-midpoint",
    pattern: { kind: "numeric", value: 40 },
    feedback: "40 is the midpoint of the median class, not the median.",
    marksTypicallyEarned: 1,
    source: "ccea-cer:maths:2025-summer:M4:Q22",
  },
  {
    misconception: "median.midpoint-of-axis",
    pattern: { kind: "numeric", value: 45 },
    feedback: "45 is the middle of the axis, not of the data.",
    marksTypicallyEarned: 0,
  },
];

describe("markAnswer numeric", () => {
  test("a value inside the range earns every mark", () => {
    const r = markAnswer("36.15", median, { marks: 3, commonErrors });
    expect(r.correct).toBe(true);
    expect(r.marksAwarded).toBe(3);
    expect(r.marksAvailable).toBe(3);
    expect(r.expected).toBe("36.1 to 36.2 cm");
  });
  test("a common error supplies the diagnosis, the tag and the typical marks", () => {
    const r = markAnswer("40", median, { marks: 3, commonErrors });
    expect(r.correct).toBe(false);
    expect(r.marksAwarded).toBe(1);
    expect(r.explanation).toMatch(/midpoint of the median class/);
    expect(r.tags).toEqual(["median.class-midpoint"]);
    expect(r.nearMiss).toBeUndefined();
  });
  test("a matched common error carries its examiners' report series onto the result (engine item 10.3)", () => {
    // withCommonError used to drop CommonError.source, so no question miss could cite its series.
    expect(markAnswer("40", median, { marks: 3, commonErrors }).source).toBe("ccea-cer:maths:2025-summer:M4:Q22");
    // An error the report did not name carries none, and neither does a miss no error matched.
    expect(markAnswer("45", median, { marks: 3, commonErrors }).source).toBeUndefined();
    expect(markAnswer("12", median, { marks: 3, commonErrors }).source).toBeUndefined();
  });
  test("an unrelated miss scores nothing and keeps the engine's diagnosis", () => {
    const r = markAnswer("12", median, { marks: 3, commonErrors });
    expect(r.correct).toBe(false);
    expect(r.marksAwarded).toBe(0);
    expect(r.tags).toBeUndefined();
    expect(r.explanation.length).toBeGreaterThan(0);
  });
  test("empty input is asked for, not marked", () => {
    expect(markAnswer("   ", median).explanation).toMatch(/type an answer/i);
  });
});

describe("markAnswer other kinds", () => {
  test("mcq by option id", () => {
    const mcq: AnswerSpec = {
      kind: "mcq",
      shuffle: false,
      options: [
        { id: "a", text: "1.6", correct: true, feedback: "Yes: 16 ÷ 10." },
        { id: "b", text: "16", correct: false, misconception: "hist.freq-as-height", feedback: "That is the frequency." },
      ],
    };
    expect(markAnswer("a", mcq).correct).toBe(true);
    const miss = markAnswer("b", mcq);
    expect(miss.correct).toBe(false);
    expect(miss.tags).toEqual(["hist.freq-as-height"]);
    expect(miss.explanation).toBe("That is the frequency.");
  });
  test("text with key-word groups shares the part's marks across the groups", () => {
    const text: AnswerSpec = {
      kind: "text",
      accepted: [],
      keyWords: [
        { any: ["frequency"], marks: 1 },
        { any: ["class width"], marks: 1 },
      ],
      listingRule: false,
    };
    // Groups that sum to the tariff score as written.
    expect(markAnswer("frequency", text, { marks: 2 })).toMatchObject({ marksAvailable: 2, marksAwarded: 1, correct: false });
    // Otherwise the tariff is shared by the fraction of group marks earned, rounding down.
    const r = markAnswer("frequency", text, { marks: 5 });
    expect(r.marksAvailable).toBe(5);
    expect(r.marksAwarded).toBe(2);
    expect(r.explanation).toBe("2 of 5: still missing class width.");
    expect(markAnswer("frequency and class width", text, { marks: 5 })).toMatchObject({ marksAvailable: 5, marksAwarded: 5, correct: true });
  });
  test("a 1-mark 'state, with a reason' part needs every group for its mark", () => {
    const text: AnswerSpec = {
      kind: "text",
      accepted: ["Rational, because 4 can be written as the fraction 4/1"],
      keyWords: [
        { any: ["rational"], marks: 1, reject: ["irrational"] },
        { any: ["fraction", "whole number", "integer", "4/1"], marks: 1 },
      ],
      listingRule: false,
    };
    const errors = [
      {
        misconception: "maths.surds.reason-not-given",
        pattern: { kind: "text" as const, regex: "^\\s*rational\\.?\\s*$" },
        feedback: "The word alone earns nothing here; the mark is for the reason.",
        marksTypicallyEarned: 0,
      },
    ];
    const bare = markAnswer("Rational", text, { marks: 1, commonErrors: errors });
    expect(bare).toMatchObject({ correct: false, marksAwarded: 0, marksAvailable: 1, tags: ["maths.surds.reason-not-given"] });
    expect(bare.explanation).toBe("The word alone earns nothing here; the mark is for the reason.");
    const halfway = markAnswer("It is rational", text, { marks: 1 });
    expect(halfway).toMatchObject({ correct: false, marksAwarded: 0, marksAvailable: 1 });
    expect(halfway.explanation).toBe("0 of 1: still missing fraction.");
    expect(markAnswer("rational because 4 is a whole number", text, { marks: 1 })).toMatchObject({ correct: true, marksAwarded: 1, marksAvailable: 1 });
    expect(markAnswer("irrational, it is not a whole number", text, { marks: 1 })).toMatchObject({ correct: false, marksAwarded: 0 });
  });
  test("algebraic form 'subject' demands the subject on its own", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: "x=\\frac{w}{4}", equivalence: "equivalent", variables: ["w"], form: "subject" };
    expect(markAnswer("x = w/4", spec, { marks: 2 })).toMatchObject({ correct: true, marksAwarded: 2 });
    const wrongForm = markAnswer("4x = w", spec, { marks: 2 });
    // The right relationship in the wrong form keeps the working mark and loses the last.
    expect(wrongForm).toMatchObject({ correct: false, marksAwarded: 1, marksAvailable: 2 });
    expect(wrongForm.explanation).toMatch(/subject/);
  });
  test("algebraic spec written as coordinate pairs marks the pairs as pairs", () => {
    const one: AnswerSpec = { kind: "algebraic", latex: "(2, 3)", equivalence: "equivalent", variables: ["x", "y"] };
    expect(markAnswer("x = 2, y = 3", one, { marks: 4 })).toMatchObject({ correct: true, marksAwarded: 4 });
    expect(markAnswer("(2,3)", one, { marks: 4 })).toMatchObject({ correct: true });
    expect(markAnswer("x = 3, y = 2", one, { marks: 4 })).toMatchObject({ correct: false, marksAwarded: 0 });
    const two: AnswerSpec = { kind: "algebraic", latex: "(1, 2), (-3, -6)", equivalence: "equivalent", variables: ["x", "y"] };
    expect(markAnswer("x = -3, y = -6 or x = 1, y = 2", two, { marks: 5 })).toMatchObject({ correct: true, marksAwarded: 5 });
    const crossed = markAnswer("(1, -6), (-3, 2)", two, { marks: 5 });
    expect(crossed).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(crossed.explanation).toMatch(/paired wrongly/);
    expect(markAnswer("(1, 2)", two, { marks: 5 }).explanation).toMatch(/1 of the 2 pairs/);
  });
  test("order: the arrangement must match exactly for every mark, and the feedback counts what is in place", () => {
    const spec: AnswerSpec = { kind: "order", items: ["cell", "tissue", "organ", "organ system"], correctOrder: [0, 1, 2, 3] };
    expect(markAnswer("0,1,2,3", spec, { marks: 2 })).toMatchObject({ correct: true, marksAwarded: 2, marksAvailable: 2 });
    // One swap on a 2-mark part keeps one mark (B2E-14, 24 Sep 2026: it scored 0; order-marking.ts orderMarks).
    const partial = markAnswer("0,2,1,3", spec, { marks: 2 });
    expect(partial).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(markAnswer("3,2,1,0", spec, { marks: 2 })).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(partial.explanation).toMatch(/2 of 4/);
    expect(partial.expected).toBe("cell → tissue → organ → organ system");
    expect(markAnswer("0,1", spec).explanation).toMatch(/every item/i);
  });
  test("order: text common errors are matched against the arranged item texts, not the indices", () => {
    const spec: AnswerSpec = { kind: "order", items: ["tissue", "organ", "organ system"], correctOrder: [0, 1, 2] };
    const reversed: CommonError = {
      misconception: "sci.cells.organisation-order-reversed",
      pattern: { kind: "text", regex: "organ\\s*,\\s*tissue" },
      feedback: "Organs are built from tissues, not the other way round.",
      marksTypicallyEarned: 1,
    };
    const r = markAnswer("1,0,2", spec, { marks: 3, commonErrors: [reversed] });
    expect(r).toMatchObject({ correct: false, marksAwarded: 1, tags: ["sci.cells.organisation-order-reversed"] });
    expect(r.explanation).toMatch(/built from tissues/);
    expect(markAnswer("0,1,2", spec, { marks: 3, commonErrors: [reversed] })).toMatchObject({ correct: true, marksAwarded: 3 });
  });
  // CCEA's general guidance, as the FM2 MS 2021 prints it: "Accept 1.5 instead of 1.50 for an answer required to 2 dp"
  // and "Unless specifically stated in the mark scheme, accept one or more dp, or 3 significant figures"; the 2019 MS
  // prints "2.458 2.46" (the lead's reversal of 27 Sep 2026, replacing the ruling of 25 Sep). A dropped final zero and
  // more places than asked earn every mark, with the write-150.00 reminder as words only; fewer places than asked lose
  // the accuracy mark.
  test("numeric to 2 d.p. when the stem instructs it: an exact value with the zeros dropped is right, with a write-150.00 reminder", () => {
    const pct: AnswerSpec = { kind: "numeric", value: 150, tolerance: { type: "dp", places: 2 }, unitRequired: false, acceptForms: ["decimal", "percent"] };
    const prompt = "Calculate the percentage increase. Give your answer to two decimal places.";
    const dropped = markAnswer("150", pct, { marks: 3, prompt });
    expect(dropped).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(dropped.explanation).toMatch(/write 150\.00 on the paper, to show the accuracy asked for/);
    expect(dropped.explanation).not.toMatch(/examiner|mark lost|lose|lost/i);
    expect(markAnswer("150.00", pct, { marks: 3, prompt })).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(markAnswer("150.00", pct, { marks: 3, prompt }).explanation).not.toMatch(/write 150\.00/);
    expect(markAnswer("150.000", pct, { marks: 3, prompt })).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(markAnswer("149.9", pct, { marks: 3, prompt }).correct).toBe(false);
  });
  test("the FM2 reviewer's cases: 38.3 for 38.30, 3.438 for 3.44 and 55 for 55.00 earn every mark; 3.4 for 3.44 loses the accuracy mark", () => {
    const prompt = "Calculate the tension in the rope. Round to 2 decimal places.";
    const t: AnswerSpec = { kind: "numeric", value: 38.3, tolerance: { type: "dp", places: 2 }, unit: "N", unitRequired: false, acceptForms: ["decimal", "fraction"] };
    for (const typed of ["38.3", "38.30", "38.302", "38.3 N"]) expect(markAnswer(typed, t, { marks: 3, prompt }), typed).toMatchObject({ correct: true, marksAwarded: 3 });
    const a: AnswerSpec = { kind: "numeric", value: 3.44, tolerance: { type: "dp", places: 2 }, unitRequired: false, acceptForms: ["decimal", "fraction"] };
    for (const typed of ["3.438", "3.44"]) expect(markAnswer(typed, a, { marks: 3, prompt }), typed).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(markAnswer("3.4", a, { marks: 3, prompt })).toMatchObject({ correct: false, marksAwarded: 2 });
    expect(markAnswer("3.45", a, { marks: 3, prompt }).correct).toBe(false);
    const r: AnswerSpec = { kind: "numeric", value: 55, tolerance: { type: "dp", places: 2 }, unit: "N", unitRequired: false, acceptForms: ["decimal", "fraction"] };
    expect(markAnswer("55", r, { marks: 3, prompt })).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(markAnswer("R = 80 - 25 = 55 N", r, { marks: 3, prompt })).toMatchObject({ correct: true, marksAwarded: 3 });
  });
  test("13 for 13.0 to 1 d.p. is right, instructed or not; 12.5 for 12.54 to 2 d.p. loses the accuracy mark", () => {
    const v: AnswerSpec = { kind: "numeric", value: 13, tolerance: { type: "dp", places: 1 }, unit: "V", unitRequired: false, acceptForms: ["decimal"] };
    const instructed = "Calculate the voltage. Give your answer to 1 decimal place.";
    for (const marks of [1, 2]) for (const typed of ["13", "13 V", "13.0", "13.02"]) expect(markAnswer(typed, v, { marks, prompt: instructed }), typed).toMatchObject({ correct: true, marksAwarded: marks });
    expect(markAnswer("13", v, { marks: 2, prompt: "Calculate the voltage." })).toMatchObject({ correct: true, marksAwarded: 2 });
    const w: AnswerSpec = { kind: "numeric", value: 12.54, tolerance: { type: "dp", places: 2 }, unitRequired: false, acceptForms: ["decimal"] };
    expect(markAnswer("12.5", w, { marks: 2, prompt: "Give your answer to 2 decimal places." })).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(markAnswer("12.5", w, { marks: 1, prompt: "Give your answer to 2 decimal places." })).toMatchObject({ correct: false, marksAwarded: 0 });
  });
  // The numeric-form ruling is symmetric (FM2 D, 25 Sep 2026; connected-particles-and-pulleys .0005): an exact form
  // where decimal places are instructed, or a decimal where an exact form is instructed, is the right value in the
  // wrong form: marks − 1 (the accuracy mark), never full marks.
  test("instructed form is symmetric: 12√2 for 'to 2 decimal places' and 16.97 for 'exact' both earn marks − 1", () => {
    const force: AnswerSpec = { kind: "numeric", value: 16.97, tolerance: { type: "dp", places: 2 }, unit: "N", unitRequired: false, acceptForms: ["decimal", "fraction"] };
    const dp2 = "Calculate the magnitude of the force the string exerts on the pulley.\n\nTake $g = 10$ m/s². Round to 2 decimal places.\n\nAnswer ________ N";
    expect(markAnswer("12√2", force, { marks: 4, prompt: dp2 })).toMatchObject({ correct: false, marksAwarded: 3 });
    expect(markAnswer("16.97", force, { marks: 4, prompt: dp2 })).toMatchObject({ correct: true, marksAwarded: 4 });
    // Where no form is listed, the exact form is still not the instructed decimal.
    const open: AnswerSpec = { kind: "numeric", value: 12 * Math.SQRT2, tolerance: { type: "dp", places: 2 }, unitRequired: false, acceptForms: [] };
    expect(markAnswer("12√2", open, { marks: 4, prompt: dp2 })).toMatchObject({ correct: false, marksAwarded: 3 });
    const exact: AnswerSpec = { kind: "numeric", value: 12 * Math.SQRT2, tolerance: { type: "absolute", value: 0.005 }, unitRequired: false, acceptForms: ["surd"] };
    const surd = "Find the exact magnitude of the force. Give your answer in surd form.";
    expect(markAnswer("16.97", exact, { marks: 4, prompt: surd })).toMatchObject({ correct: false, marksAwarded: 3 });
    expect(markAnswer("12√2", exact, { marks: 4, prompt: surd })).toMatchObject({ correct: true, marksAwarded: 4 });
    // Not instructed either way: a right value in either form earns every mark.
    expect(markAnswer("12√2", force, { marks: 4, prompt: "Calculate the magnitude of the force." })).toMatchObject({ correct: true, marksAwarded: 4 });
  });
  test("a table cell with its final zero dropped is right, with the same reminder, when the stem asks for 2 d.p. (engine item 5)", () => {
    // c2-measuring-rates .0006: "Give each value in grams to two decimal places."; the cells are 2.90, 3.50, 3.60.
    const spec: AnswerSpec = {
      kind: "table",
      cells: [
        { row: 2, col: 2, value: 2.9, tolerance: { type: "dp", places: 2 } },
        { row: 3, col: 2, value: 3.5, tolerance: { type: "dp", places: 2 } },
        { row: 4, col: 2, value: 3.6, tolerance: { type: "dp", places: 2 } },
      ],
    };
    const prompt = "The flask and its contents were weighed as the reaction went on. The first reading was 96.80 g.\nComplete the loss-in-mass column of the table. Give each value in grams to two decimal places.";
    const typed = (values: string[]) => JSON.stringify({ cells: values.map((value, i) => ({ row: i + 2, col: 2, value })) });
    const dropped = markAnswer(typed(["2.9", "3.50", "3.6"]), spec, { marks: 3, prompt });
    expect(dropped).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(dropped.explanation).toMatch(/write 2\.90 and 3\.60/);
    expect(dropped.explanation).not.toMatch(/examiner|lost/i);
    expect(markAnswer(typed(["2.90", "3.50", "3.60"]), spec, { marks: 3, prompt }).explanation).toBe("Every cell is right.");
    // As for a numeric part: more places that round to the value are right (the reversal of 27 Sep 2026); fewer are not.
    expect(markAnswer(typed(["2.900", "3.50", "3.60"]), spec, { marks: 3, prompt }).correct).toBe(true);
    expect(markAnswer(typed(["3", "3.50", "3.60"]), spec, { marks: 3, prompt }).correct).toBe(false);
    // Without the instruction, the tolerance is only a closeness test and nothing is said.
    expect(markAnswer(typed(["2.9", "3.5", "3.6"]), spec, { marks: 3, prompt: "Complete the table." }).explanation).toBe("Every cell is right.");
  });
  test("the expected answer is printed to the accuracy the stem instructs: 49.50 N, not 49.5 N (engine item 13)", () => {
    // connected-particles-and-pulleys .0015 (c), "Round to 2 decimal places.": the card's expected line taught the
    // dropped zero the reminder warns against.
    const spec: AnswerSpec = { kind: "numeric", value: 49.5, tolerance: { type: "dp", places: 2 }, unit: "N", unitRequired: false, acceptForms: ["decimal", "fraction"] };
    const prompt = "Calculate the magnitude of the resultant force the string exerts on the pulley.\n\nRound to 2 decimal places.\n\nAnswer ________ N";
    expect(markAnswer("50", spec, { marks: 3, prompt }).expected).toBe("49.50 N");
    expect(markAnswer("49.50", spec, { marks: 3, prompt }).expected).toBe("49.50 N");
    // log-log-graphs .0004 asks for 1 d.p. of 4: "4.0".
    const one: AnswerSpec = { kind: "numeric", value: 4, tolerance: { type: "dp", places: 1 }, unitRequired: false, acceptForms: ["decimal"] };
    expect(markAnswer("5", one, { prompt: "Give your answer to 1 decimal place." }).expected).toBe("4.0");
    // Without an instruction the tolerance is only a closeness test, and the value is printed as authored.
    expect(markAnswer("50", spec, { marks: 3, prompt: "Calculate the force." }).expected).toBe("49.5 N");
    // A table whose stem instructs 2 d.p. prints its cells to 2 d.p. as well.
    const table: AnswerSpec = { kind: "table", cells: [{ row: 2, col: 2, value: 2.9, tolerance: { type: "dp", places: 2 } }, { row: 3, col: 2, value: 3.5, tolerance: { type: "dp", places: 2 } }] };
    expect(markAnswer("{}", table, { marks: 2, prompt: "Give each value in grams to two decimal places." }).expected).toBe("2.90, 3.50");
  });
  test("a d.p. tolerance without an instruction in the stem is only a closeness test", () => {
    const spec: AnswerSpec = { kind: "numeric", value: 1.8, tolerance: { type: "dp", places: 2 }, unitRequired: false, acceptForms: ["decimal"] };
    const prompt = "The box measures 4.2 m by 1.8 m, each correct to 1 decimal place. Work out x.";
    expect(markAnswer("1.8", spec, { marks: 2, prompt }).explanation).not.toMatch(/decimal place/);
    expect(markAnswer("1.800", spec, { marks: 2, prompt })).toMatchObject({ correct: true, marksAwarded: 2 });
    expect(markAnswer("1.804", spec, { marks: 2 }).correct).toBe(true);
    expect(markAnswer("1.81", spec, { marks: 2 }).correct).toBe(false);
  });
  test("instructsAccuracy reads instruction sentences, not givens", () => {
    expect(instructsAccuracy("Give your answer correct to 3 significant figures.")).toBe(true);
    expect(instructsAccuracy("Work out the height.\nRound your answer to the nearest centimetre.")).toBe(true);
    expect(instructsAccuracy("Find x to 2 d.p.")).toBe(true);
    expect(instructsAccuracy("A bolt is 6.4 cm long, correct to 1 decimal place. Write down the lower bound.")).toBe(false);
    expect(instructsAccuracy("Give your answer in its simplest form.")).toBe(false);
    expect(instructsAccuracy(undefined)).toBe(false);
  });
  test("transformation graph: the placed vertices are marked as a set, and a listed wrong image names its misconception", () => {
    const spec: AnswerSpec = {
      kind: "graph",
      expect: { plot: "transformation", object: [[3, 1], [8, 1], [3, 4]], image: [[1, 3], [1, 8], [4, 3]] },
    };
    const mirror: CommonError = {
      misconception: "maths.transform.reflect-wrong-line",
      pattern: { kind: "graph", test: "image drawn at (-3, 1), (-8, 1), (-3, 4), the reflection in the y-axis" },
      feedback: "A reflection in the y-axis puts the triangle on the left.",
      marksTypicallyEarned: 0,
    };
    expect(markAnswer("(4, 3), (1, 8), (1, 3)", spec, { marks: 2, commonErrors: [mirror] })).toMatchObject({ correct: true, marksAwarded: 2 });
    const wrong = markAnswer("(-3, 1), (-8, 1), (-3, 4)", spec, { marks: 2, commonErrors: [mirror] });
    expect(wrong).toMatchObject({ correct: false, marksAwarded: 0, tags: ["maths.transform.reflect-wrong-line"] });
    // The engine's identification of the drawing leads; the authored diagnosis follows it.
    expect(wrong.explanation).toBe(
      "That is a reflection in the y-axis. The question asked for a reflection in the line y = x. A reflection in the y-axis puts the triangle on the left.",
    );
    const unmoved: CommonError = {
      misconception: "maths.transform.mirror-line-not-drawn",
      pattern: { kind: "graph", test: "image drawn at (3, 1), (8, 1), (3, 4), the object left exactly where it is" },
      feedback: "The triangle has not moved.",
      marksTypicallyEarned: 0,
    };
    expect(markAnswer("(3, 1), (8, 1), (3, 4)", spec, { marks: 2, commonErrors: [mirror, unmoved] }).explanation).toBe(
      "That is the object itself, unmoved. The question asked for a reflection in the line y = x. The triangle has not moved.",
    );
    const other = markAnswer("(3, -1), (8, -1), (3, -4)", spec, { marks: 2, commonErrors: [mirror] });
    expect(other.explanation).toBe("That is a reflection in the x-axis. The question asked for a reflection in the line y = x.");
    expect(other.expected).toBe("(1, 3), (1, 8), (4, 3)");
  });
  test("a histogram is marked bar by bar, with the part's marks shared out", () => {
    const hist: AnswerSpec = {
      kind: "graph",
      expect: {
        plot: "histogram",
        bars: [
          { from: 0, to: 10, frequencyDensity: 2 },
          { from: 10, to: 30, frequencyDensity: 0.5 },
        ],
        axisLabelY: "Frequency density",
        scaleTolerance: 0.02,
      },
    };
    expect(markAnswer('{"bars":[2,0.5]}', hist, { marks: 3 })).toMatchObject({ correct: true, marksAwarded: 3, expected: "0–10: 2, 10–30: 0.5" });
    const half = markAnswer('{"bars":[2,10]}', hist, { marks: 3 });
    expect(half).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(half.explanation).toContain("the 10–30 bar should reach 0.5, not 10");
  });
  test("a box plot is marked value by value", () => {
    const box: AnswerSpec = { kind: "graph", expect: { plot: "box", min: 1, q1: 2, median: 3, q3: 4, max: 5, tolerance: { type: "absolute", value: 0.5 } } };
    expect(markAnswer('{"box":[1,2,3,4,5]}', box, { marks: 3 })).toMatchObject({ correct: true, marksAwarded: 3 });
    const r = markAnswer('{"box":[1,2,3.5,4,6]}', box, { marks: 3 });
    expect(r).toMatchObject({ correct: false, marksAwarded: 2 });
    expect(r.explanation).toContain("the maximum should be at 5, not 6");
  });
  test("a region is marked by the side of each boundary the tapped point is on", () => {
    const region: AnswerSpec = { kind: "graph", expect: { plot: "region", inequalities: ["x ≥ 1", "y ≥ 1", "x + y ≤ 5"], shadeInside: true } };
    expect(markAnswer('{"point":[2,2]}', region, { marks: 3 })).toMatchObject({ correct: true, marksAwarded: 3, expected: "the region where x ≥ 1, y ≥ 1, x + y ≤ 5" });
    const r = markAnswer('{"point":[4,3]}', region, { marks: 3 });
    expect(r).toMatchObject({ correct: false, marksAwarded: 2 });
    expect(r.explanation).toContain("wrong side of x + y = 5");
  });
  test("steps are marked as an order of the authored chain, with text common errors against the arranged steps", () => {
    const steps: AnswerSpec = {
      kind: "steps",
      expectedOrder: ["width x, length x + 3", "area = x(x + 3) = 11", "x^2 + 3x = 11", "x^2 + 3x - 11 = 0"],
      allowSkips: false,
    };
    expect(markAnswer("0,1,2,3", steps, { marks: 2 })).toMatchObject({ correct: true, marksAwarded: 2, marksAvailable: 2 });
    const partial = markAnswer("0,2,1,3", steps, { marks: 2 });
    expect(partial).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(partial.explanation).toMatch(/2 of 4/);
    expect(partial.expected).toBe("width x, length x + 3 → area = x(x + 3) = 11 → x^2 + 3x = 11 → x^2 + 3x - 11 = 0");
    expect(markAnswer("0,1", steps).explanation).toMatch(/every item/i);
    const expandedFirst: CommonError = {
      misconception: "maths.quadratics.show-that-expand-before-equation",
      pattern: { kind: "text", regex: "x\\^2 \\+ 3x = 11, area" },
      feedback: "The area equation comes before its expansion: set x(x + 3) equal to 11 first.",
      marksTypicallyEarned: 1,
    };
    const r = markAnswer("0,2,1,3", steps, { marks: 2, commonErrors: [expandedFirst] });
    expect(r).toMatchObject({ correct: false, marksAwarded: 1, tags: ["maths.quadratics.show-that-expand-before-equation"] });
    expect(r.explanation).toMatch(/set x\(x \+ 3\) equal to 11 first/);
  });
  test("a table is marked cell by cell, with the part's marks shared out and common errors matched against the typed row", () => {
    const table: AnswerSpec = {
      kind: "table",
      cells: [
        { row: 1, col: 1, value: 3 },
        { row: 1, col: 2, value: 4 },
        { row: 1, col: 3, value: 3.6 },
        { row: 1, col: 4, value: 1.5 },
      ],
    };
    const row = (values: string[]) => JSON.stringify({ cells: values.map((value, i) => ({ row: 1, col: i + 1, value })) });
    expect(markAnswer(row(["3", "4", "3.6", "1.5"]), table, { marks: 2 })).toMatchObject({ correct: true, marksAwarded: 2, expected: "3, 4, 3.6, 1.5" });
    const one = markAnswer(row(["3", "40", "3.6", "1.5"]), table, { marks: 2 });
    expect(one).toMatchObject({ correct: false, marksAwarded: 1, marksAvailable: 2 });
    expect(one.explanation).toBe("3 of 4 cells are right. Row 2, column 3 should be 4, not 40.");
    const copied: CommonError = {
      misconception: "maths.histograms.plot-frequency-not-density",
      pattern: { kind: "text", regex: "15.*40.*18.*30" },
      feedback: "The frequencies were copied into the density row. Divide each by its class width: 3, 4, 3.6, 1.5.",
      marksTypicallyEarned: 0,
    };
    const r = markAnswer(row(["15", "40", "18", "30"]), table, { marks: 2, commonErrors: [copied] });
    expect(r).toMatchObject({ correct: false, marksAwarded: 0, tags: ["maths.histograms.plot-frequency-not-density"] });
    expect(r.explanation).toMatch(/copied into the density row/);
    expect(markAnswer("3, 4, 3.6, 1.5", table, { marks: 2 }).explanation).toBe("Nothing has been filled in yet.");
  });
  test("a diagram's labels are marked target by target, with common errors matched against the chosen names", () => {
    const label: AnswerSpec = {
      kind: "label",
      targets: [
        { id: "i", accepted: ["cell wall", "cellulose cell wall"] },
        { id: "ii", accepted: ["nucleus"] },
        { id: "iii", accepted: ["chloroplast", "chloroplasts"] },
        { id: "iv", accepted: ["vacuole", "large permanent vacuole"] },
      ],
      bank: ["cell wall", "cell membrane", "cytoplasm", "nucleus", "chloroplast", "vacuole", "mitochondria"],
    };
    const chosen = (labels: Record<string, string>) => JSON.stringify({ labels });
    expect(markAnswer(chosen({ i: "cell wall", ii: "nucleus", iii: "chloroplast", iv: "vacuole" }), label, { marks: 4 })).toMatchObject({
      correct: true,
      marksAwarded: 4,
      expected: "cell wall, nucleus, chloroplast, vacuole",
    });
    const two = markAnswer(chosen({ i: "cytoplasm", ii: "nucleus", iii: "mitochondria", iv: "vacuole" }), label, { marks: 4 });
    expect(two).toMatchObject({ correct: false, marksAwarded: 2, marksAvailable: 4 });
    expect(two.explanation).toBe("2 of 4 labels are right. (i) is the cell wall, not the cytoplasm. (iii) is the chloroplast, not the mitochondria.");
    const swap: CommonError = {
      misconception: "sci.cells.wall-membrane-confused",
      pattern: { kind: "text", regex: "cell\\s*membrane" },
      feedback: "The membrane is inside the wall and controls what enters and leaves; it does not provide support.",
      marksTypicallyEarned: 3,
    };
    const r = markAnswer(chosen({ i: "cell membrane", ii: "nucleus", iii: "chloroplast", iv: "vacuole" }), label, { marks: 4, commonErrors: [swap] });
    expect(r).toMatchObject({ correct: false, marksAwarded: 3, tags: ["sci.cells.wall-membrane-confused"] });
    expect(r.explanation).toMatch(/inside the wall/);
    // With one mark for the part there is no share to give: all or nothing.
    expect(markAnswer(chosen({ i: "cell membrane", ii: "nucleus", iii: "chloroplast", iv: "vacuole" }), label, { marks: 1 })).toMatchObject({ marksAwarded: 0 });
  });
  test("best-fit plots still self-mark", () => {
    const fit: AnswerSpec = { kind: "graph", expect: { plot: "best-fit", kind: "line", tolerance: { type: "absolute", value: 1 } } };
    expect(markAnswer("anything", fit).explanation).toMatch(/worked solution/);
  });
  test("physics equation part: the equation alone earns 1 of 2, the equation and the value 2 of 2, a wrong equation nothing (engine item 10.1)", () => {
    // The marking evidence sweep (23 Sep) found every mark paid for the equation line alone, the substitution and the
    // value never read. The spec carries no expected value, so the value is read against her own substitution.
    const eq: AnswerSpec = { kind: "equation", kindOf: "physics", balancedLatex: "v = f\\lambda", stateSymbolsRequired: false, acceptMultiples: false };
    const alone = markAnswer("v = f × λ", eq, { marks: 2 });
    expect(alone).toMatchObject({ correct: false, marksAwarded: 1, marksAvailable: 2 });
    expect(alone.explanation).toMatch(/value/);
    expect(markAnswer("v = f × λ\n= 2 × 3 = 6 m/s", eq, { marks: 2 })).toMatchObject({ correct: true, marksAwarded: 2 });
    // A bare value under the equation cannot be checked: the spec has no expected value and there is no substitution
    // to read it against, so "v = 999 m/s" would have earned 2 of 2 (24 Sep 2026). It keeps the equation mark and is
    // asked for the numbers put in; the engine never pays for a value it cannot check.
    const bare = markAnswer("v = f × λ\nv = 6 m/s", eq, { marks: 2 });
    expect(bare).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(bare.explanation).toMatch(/numbers put in/);
    expect(markAnswer("v = f × λ\nv = 999 m/s", eq, { marks: 2 })).toMatchObject({ correct: false, marksAwarded: 1 });
    // A value that does not follow from her own numbers keeps the equation mark only.
    const slip = markAnswer("v = f × λ\n= 2 × 3 = 5 m/s", eq, { marks: 2 });
    expect(slip).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(slip.explanation).toMatch(/2 × 3/);
    // Working with no value in it is not the value.
    expect(markAnswer("v = f × λ\nv = 2 × 3", eq, { marks: 2 })).toMatchObject({ correct: false, marksAwarded: 1 });
    // A one-mark part is the equation mark.
    expect(markAnswer("v = f × λ", eq, { marks: 1 })).toMatchObject({ correct: true, marksAwarded: 1 });
    expect(markAnswer("v = f / λ", eq, { marks: 2 }).marksAwarded).toBe(0);
    expect(markAnswer("v = f / λ\n= 2 × 3 = 6 m/s", eq, { marks: 2 }).marksAwarded).toBe(0);
  });
  test("a six-mark written-communication answer comes back as evidence and a floor, never a decision", () => {
    const qwc: AnswerSpec = {
      kind: "text-long",
      rubricId: "sci.qwc.b1.aerobic-respiration",
      selfMark: true,
      bands: [
        { band: "A", marks: [5, 6], descriptor: "Five or six points, specialist terms used accurately." },
        { band: "B", marks: [3, 4], descriptor: "Three or four points; some specialist vocabulary." },
        { band: "C", marks: [1, 2], descriptor: "One or two points." },
        { band: "0", marks: [0, 0], descriptor: "Nothing creditworthy." },
      ],
      indicativeContent: [
        { point: "glucose is used", keyWords: ["glucose"] },
        { point: "oxygen is used", keyWords: ["oxygen"] },
        { point: "carbon dioxide is produced", keyWords: ["carbon dioxide"] },
        { point: "water is produced", keyWords: ["water"] },
        { point: "it takes place in the mitochondria", keyWords: ["mitochondri"] },
        { point: "a use for the energy: growth", keyWords: ["growth"] },
      ],
    };
    const r = markAnswer("Glucose reacts with oxygen and water is made in the process.", qwc, { marks: 6 });
    // Not auto-decided: the floor of the band the count suggests, and the hint that a decision is owed.
    expect(r).toMatchObject({ correct: false, marksAwarded: 3, marksAvailable: 6, decision: "qwc-band" });
    expect(r.explanation).toBe(
      "Evidence found for 3 of 6 points: glucose, oxygen, water. Not yet: carbon dioxide, mitochondri, growth. On the descriptors that is band B, 3–4 marks. At 11 words it is shorter than the 20 this part asks for.",
    );
    expect(r.expected).toBe("glucose is used; oxygen is used; carbon dioxide is produced; water is produced; it takes place in the mitochondria; a use for the energy: growth");
    expect(r.explanation).not.toMatch(/wrong/i);
    // Every point evidenced is still only the floor of band A, so the engine never calls it complete.
    const full = markAnswer(
      "Glucose and oxygen react inside the mitochondria of every cell, producing carbon dioxide and water and releasing the energy the seedling uses for growth.",
      qwc,
      { marks: 6 },
    );
    expect(full).toMatchObject({ correct: false, marksAwarded: 5, decision: "qwc-band" });
    expect(full.explanation).toMatch(/^Evidence found for 6 of 6 points: /);
    // A named misconception follows the evidence rather than replacing it, and never moves the floor.
    const co2: CommonError = {
      misconception: "sci.respiration.co2-used-not-produced",
      pattern: { kind: "text", regex: "carbon dioxide is used" },
      feedback: "Carbon dioxide is produced by respiration, not used.",
      marksTypicallyEarned: 4,
    };
    const flagged = markAnswer("Glucose is used and carbon dioxide is used in the mitochondria of the cell.", qwc, { marks: 6, commonErrors: [co2] });
    expect(flagged).toMatchObject({ marksAwarded: 3, decision: "qwc-band", tags: ["sci.respiration.co2-used-not-produced"] });
    expect(flagged.explanation).toMatch(/^Evidence found for 3 of 6 points: .* not used\.$/);
    // Empty input is asked for before any of this.
    expect(markAnswer("   ", qwc, { marks: 6 }).explanation).toMatch(/type an answer/i);
  });
  test("self-marked kinds return a placeholder rather than a verdict", () => {
    const r = markAnswer("anything", { kind: "drawing", rubric: ["axes labelled"], selfMark: true }, { marks: 2 });
    expect(r.correct).toBe(false);
    expect(r.explanation).toMatch(/worked solution/);
    expect(r.marksAvailable).toBe(2);
  });
});

describe("matchesCommonError", () => {
  test("numeric, text and graph patterns", () => {
    expect(matchesCommonError("40 cm", commonErrors[0])).toBe(true);
    expect(matchesCommonError("40.4", commonErrors[0])).toBe(false);
    expect(
      matchesCommonError("the bars are the frequencies", {
        misconception: "hist.freq-as-height",
        pattern: { kind: "text", regex: "bars? (are|is) the frequenc" },
        feedback: "x",
        marksTypicallyEarned: 0,
      }),
    ).toBe(true);
    expect(
      matchesCommonError("anything", { misconception: "hist.freq-as-height", pattern: { kind: "graph", test: "t" }, feedback: "x", marksTypicallyEarned: 0 }),
    ).toBe(false);
  });
});

describe("instructsAccuracy reads an instruction that follows another command in the sentence", () => {
  test("show your working and give your answer to one decimal place", () => {
    expect(instructsAccuracy("Calculate the mass of iron produced. Show your working and give your answer to one decimal place.")).toBe(true);
    expect(instructsAccuracy("Work out the value of x, giving your answer to 2 decimal places.")).toBe(true);
    expect(instructsAccuracy("The base is 6.4 cm, correct to 1 decimal place. Work out the area.")).toBe(false);
  });
});

describe("a paired-answer common error fires on every spelling of the pair", () => {
  const spec: AnswerSpec = { kind: "algebraic", latex: "(2, -3)", equivalence: "equivalent", variables: ["p", "q"] };
  const errors: CommonError[] = [{ misconception: "sign", pattern: { kind: "algebraic", latex: "(2, 3)" }, marksTypicallyEarned: 1, feedback: "The q value has lost its sign." } as CommonError];
  test("the tuple and the assignment spellings both match", () => {
    for (const raw of ["(2, 3)", "p = 2, q = 3", "q = 3, p = 2"]) {
      const r = markAnswer(raw, spec, { marks: 2, commonErrors: errors });
      expect(r.correct, raw).toBe(false);
      expect(r.explanation, raw).toMatch(/lost its sign/);
    }
    expect(markAnswer("p = 2, q = -3", spec, { marks: 2, commonErrors: errors }).correct).toBe(true);
  });
});

describe("markAnswer matrix", () => {
  // AB for A = (1 2 / 0 -1), B = (1 4 / 3 3): the product every Further Maths Unit 1 paper asks for.
  const productSpec: AnswerSpec = { kind: "matrix", rows: 2, cols: 2, entries: [["7", "10"], ["-3", "-3"]] };
  const errors: CommonError[] = [
    {
      misconception: "fm.matrix.entrywise-product",
      // Multiplying the entries in matching positions instead of rows into columns.
      pattern: { kind: "matrix", entries: [["1", "8"], ["0", "-3"]] },
      feedback: "Those are the entries multiplied in pairs. A product runs each row of the first matrix into each column of the second.",
      marksTypicallyEarned: 0,
    },
  ];

  test("the matrix earns every mark, in whichever spelling she writes it", () => {
    for (const raw of ["7 10; -3 -3", "\\begin{pmatrix}7 & 10\\\\-3 & -3\\end{pmatrix}", "[[7,10],[-3,-3]]"]) {
      const r = markAnswer(raw, productSpec, { marks: 2, commonErrors: errors });
      expect(r.correct, raw).toBe(true);
      expect(r.marksAwarded, raw).toBe(2);
      expect(r.explanation, raw).toBe("Every entry is right.");
    }
    expect(markAnswer("7 10; -3 -3", productSpec).expected).toBe("$\\begin{pmatrix} 7 & 10 \\\\ -3 & -3 \\end{pmatrix}$");
  });
  test("three entries of four on a 2-mark part share the marks in proportion", () => {
    const r = markAnswer("7 10; 3 -3", productSpec, { marks: 2, commonErrors: errors });
    expect(r.correct).toBe(false);
    expect(r.marksAwarded).toBe(1);
    expect(r.marksAvailable).toBe(2);
    expect(r.explanation).toBe("3 of 4 entries are right. Row 2, column 1 should be −3.");
  });
  test("a matrix common error supplies the diagnosis and its tag", () => {
    const r = markAnswer("1 8; 0 -3", productSpec, { marks: 2, commonErrors: errors });
    expect(r.correct).toBe(false);
    expect(r.explanation).toMatch(/multiplied in pairs/);
    expect(r.tags).toEqual(["fm.matrix.entrywise-product"]);
    // The pattern fires on the LaTeX spelling of the same wrong matrix too.
    expect(matchesCommonError("\\begin{pmatrix}1 & 8\\\\0 & -3\\end{pmatrix}", errors[0])).toBe(true);
    expect(matchesCommonError("1 8; 0 3", errors[0])).toBe(false);
  });
  test("a transposed answer keeps only the entries the swap left in place", () => {
    const r = markAnswer("7 -3; 10 -3", productSpec, { marks: 4, commonErrors: errors });
    expect(r.marksAwarded).toBe(2);
    expect(r.explanation).toMatch(/^That is the transpose/);
  });
  test("an answer of the wrong size earns nothing", () => {
    const r = markAnswer("7 10 -3; -3 1 2", productSpec, { marks: 2 });
    expect(r.marksAwarded).toBe(0);
    expect(r.explanation).toBe("This answer should be a 2 by 2 matrix; that one is 2 by 3.");
  });
});

describe("a vector common error fires on every spelling", () => {
  const spec: AnswerSpec = { kind: "algebraic", latex: "17i + 20j", equivalence: "equivalent", variables: ["i", "j"] };
  const errors: CommonError[] = [{ misconception: "sign", pattern: { kind: "algebraic", latex: "17i - 20j" }, marksTypicallyEarned: 1, feedback: "The j component has lost its sign." } as CommonError];
  test("bold, column and unit spellings of the wrong vector are diagnosed like the plain one", () => {
    for (const raw of ["17i - 20j", "17\\mathbf{i} - 20\\mathbf{j}", "\\begin{pmatrix} 17 \\\\ -20 \\end{pmatrix}", "17i - 20j N", "(17, -20) m/s"]) {
      const r = markAnswer(raw, spec, { marks: 3, commonErrors: errors });
      expect(r.correct, raw).toBe(false);
      expect(r.explanation, raw).toMatch(/lost its sign/);
      expect(r.marksAwarded, raw).toBe(1);
    }
  });
});

describe("the right expression in the wrong form keeps all but the last mark", () => {
  test("a single-log part pays the working mark for the half-combined form", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: "\\log 8x^3", equivalence: "equivalent", variables: ["x"], form: "single-log-expanded" };
    expect(markAnswer("\\log 8x^3", spec, { marks: 3 }).marksAwarded).toBe(3);
    const halfway = markAnswer("\\log 8 + 3\\log x", spec, { marks: 3 });
    expect(halfway.correct).toBe(false);
    expect(halfway.marksAwarded).toBe(2);
    expect(markAnswer("\\log 4x^3", spec, { marks: 3 }).marksAwarded).toBe(0);
    // A one-mark part has no working mark to keep.
    expect(markAnswer("\\log 8 + 3\\log x", spec, { marks: 1 }).marksAwarded).toBe(0);
  });
});

describe("a letter the question uses as a variable is never read as a unit (24 Sep 2026)", () => {
  // m7 index-laws-zero-and-negative-powers .0014 (d), "3m⁰ + m⁰" = 4: "4m" is the misconception the part is there to
  // catch (m⁰ read as m), and the engine read it as 4 metres against a unit-free key and paid it. The coulomb makes
  // "c" a unit letter too (fm3 line-of-best-fit .0004 asks for c in y = mx + c).
  const four: AnswerSpec = { kind: "numeric", value: 4, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal", "fraction"] };
  test("the variables are the single letters of the stem's maths, less any the stem also uses as a unit", () => {
    expect(variableLetters("(d) $3m^{0} + m^{0}$")).toEqual(["m"]);
    expect(variableLetters("Find the value of $c$ in $y = mx + c$.")).toEqual(["c", "y", "m", "x"]);
    expect(variableLetters("$\\dfrac{c^{24}}{(c^{3})^{4}} = c^{\\square}$")).toEqual(["c"]);
    // "144 m" and "m/s" use m and s as units outside the maths: they stay units.
    expect(variableLetters("The distance is 144 m. Use $s = ut + \\tfrac{1}{2}at^2$ with $u = 3$ m/s.")).toEqual(["u", "t", "a"]);
    expect(variableLetters("The tangent at $t = 6$ s has been drawn.")).toEqual(["t"]);
    expect(variableLetters(undefined)).toEqual([]);
  });
  test("m7 index-laws .0014 (d): 4m is not 4", () => {
    const prompt = "(d) $3m^{0} + m^{0}$";
    const r = markAnswer("4m", four, { marks: 1, prompt });
    expect(r.correct).toBe(false);
    expect(r.explanation).toMatch(/m is a letter in this question/);
    expect(markAnswer("4 m", four, { marks: 1, prompt }).correct).toBe(false);
    expect(markAnswer("4", four, { marks: 1, prompt }).correct).toBe(true);
    expect(markAnswer("m = 4", four, { marks: 1, prompt }).correct).toBe(true);
  });
  test("fm3 line-of-best-fit .0004: c = 96 is right, 96c is not", () => {
    const c: AnswerSpec = { kind: "numeric", value: 96, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] };
    const prompt = "The line of best fit has gradient $-8$ and passes through the mean point $(4, 64)$. Find the value of $c$ in $y = mx + c$.";
    expect(markAnswer("c = 96", c, { marks: 1, prompt }).correct).toBe(true);
    expect(markAnswer("96", c, { marks: 1, prompt }).correct).toBe(true);
    expect(markAnswer("96c", c, { marks: 1, prompt }).correct).toBe(false);
  });
  test("a unit letter the stem also uses as a unit is still a unit, and a keyed unit is always one", () => {
    const t: AnswerSpec = { kind: "numeric", value: 4, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] };
    const prompt = "A particle travels 144 m. Using $s = ut$, find the time taken in s.";
    expect(markAnswer("4 s", t, { marks: 1, prompt }).correct).toBe(true);
    const keyed: AnswerSpec = { kind: "numeric", value: 4, tolerance: { type: "exact" }, unit: "m", unitRequired: true, acceptForms: ["decimal"] };
    expect(markAnswer("4 m", keyed, { marks: 1, prompt: "Find the length $m$ of the side." }).correct).toBe(true);
  });
  test("without a stem nothing changes", () => {
    expect(markAnswer("4m", four, { marks: 1 }).correct).toBe(true);
  });
});

describe("a hedge with one of the part's common errors in it earns nothing (C2 D F12, 24 Sep 2026)", () => {
  // c2-addition-polymerisation .0002, as published: "Name the polymer formed from ethene."
  const spec: AnswerSpec = {
    kind: "text",
    accepted: ["poly(ethene)", "polythene"],
    keyWords: [{ any: ["poly(ethene)", "polyethene", "polythene"], marks: 1 }],
    listingRule: false,
  };
  const polyEthane: CommonError = {
    misconception: "sci.organic.polymer-name",
    pattern: { kind: "text", regex: String.raw`\bpolyethane\b|\bpoly ?\(ethane\)|\bpoly ethane\b` },
    feedback: "The chain has only single bonds, but the name comes from the monomer, and the monomer is ethene: poly(ethene).",
    marksTypicallyEarned: 0,
  };
  const opts = { marks: 1, commonErrors: [polyEthane], prompt: "Name the polymer formed from ethene." };
  test("the hedge is refused, and the named error's diagnosis is what she reads", () => {
    const r = markAnswer("poly(ethene) or poly(ethane)", spec, opts);
    expect(r).toMatchObject({ correct: false, marksAwarded: 0, tags: ["sci.organic.polymer-name"] });
    expect(r.explanation).toMatch(/monomer is ethene/);
  });
  test("the right answer alone, or with its other right spelling, keeps the mark", () => {
    expect(markAnswer("poly(ethene)", spec, opts)).toMatchObject({ correct: true, marksAwarded: 1 });
    expect(markAnswer("polythene or poly(ethene)", spec, opts)).toMatchObject({ correct: true, marksAwarded: 1 });
  });
});

// Engine brief item 3 (reversed reasons, fm2-c-1.md: "Up the slope, because friction opposes the motion." earned the
// reason's mark with the direction wrong). Opt-in through the scheme the author already writes: where a text part's
// key-word groups stand one for one beside its mark points (same count, same marks), a point's `dependsOn` holds for
// its group, as CCEA's "dep" marks do. 41 published parts carry dependsOn; a part without it is marked as before.
describe("a key-word group earns only with the groups its mark point depends on", () => {
  const theorem: AnswerSpec = {
    kind: "text",
    accepted: [],
    keyWords: [
      { any: ["64"], marks: 1 },
      { any: ["angle at the centre is twice the angle at the circumference"], marks: 1 },
    ],
    listingRule: false,
  };
  const scheme = [
    { id: "A1", code: "A", marks: 1, for: "x = 64" },
    { id: "MA1", code: "MA", marks: 1, for: "reason: the angle at the centre is twice the angle at the circumference", dependsOn: ["A1"] },
  ] as never;
  test("circle-theorems .0001: the reason with the wrong angle earns nothing", () => {
    const r = markAnswer("x = 58 because the angle at the centre is twice the angle at the circumference", theorem, { marks: 2, scheme });
    expect(r).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(r.explanation).toMatch(/depends on/);
  });
  test("the angle alone keeps its own mark; both earn both", () => {
    expect(markAnswer("x = 64", theorem, { marks: 2, scheme })).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(markAnswer("x = 64 because the angle at the centre is twice the angle at the circumference", theorem, { marks: 2, scheme })).toMatchObject({
      correct: true,
      marksAwarded: 2,
    });
  });
  test("without dependsOn, or when the groups do not stand one for one beside the points, nothing changes", () => {
    const free = [
      { id: "A1", code: "A", marks: 1, for: "x = 64" },
      { id: "MA1", code: "MA", marks: 1, for: "reason" },
    ] as never;
    expect(markAnswer("x = 58 because the angle at the centre is twice the angle at the circumference", theorem, { marks: 2, scheme: free }).marksAwarded).toBe(1);
    const uneven = [
      { id: "A1", code: "A", marks: 2, for: "x = 64 with the reason" },
    ] as never;
    expect(markAnswer("x = 58 because the angle at the centre is twice the angle at the circumference", theorem, { marks: 2, scheme: uneven }).marksAwarded).toBe(1);
    expect(markAnswer("x = 58 because the angle at the centre is twice the angle at the circumference", theorem, { marks: 2 }).marksAwarded).toBe(1);
  });
  test("a chain of dependencies: a point whose point is lost is lost too", () => {
    const three: AnswerSpec = {
      kind: "text",
      accepted: [],
      keyWords: [
        { any: ["x^2 + 3x"], marks: 1 },
        { any: ["a = 4"], marks: 1 },
        { any: ["b = 12"], marks: 1 },
      ],
      listingRule: false,
    };
    const chain = [
      { id: "MA1", code: "MA", marks: 1, for: "expanded" },
      { id: "A1", code: "A", marks: 1, for: "a = 4", dependsOn: ["MA1"] },
      { id: "A2", code: "A", marks: 1, for: "b = 12", dependsOn: ["A1"] },
    ] as never;
    expect(markAnswer("a = 4, b = 12", three, { marks: 3, scheme: chain }).marksAwarded).toBe(0);
    expect(markAnswer("x^2 + 3x, a = 5, b = 12", three, { marks: 3, scheme: chain }).marksAwarded).toBe(1);
    expect(markAnswer("x^2 + 3x, a = 4, b = 12", three, { marks: 3, scheme: chain }).marksAwarded).toBe(3);
  });
});

// Addenda (B), 24 Sep 2026: a numeric part could pay only all or nothing, so where the unit is required a right value
// without it scored 0 of 4 where the scheme gives 3 of 4 (P2 D topic 1 left its unit unrequired for that reason). The
// unit is the answer's last mark: a right value with the unit missing or wrong keeps every mark but that one.
describe("a right value without its required unit keeps every mark but the unit's", () => {
  const charge: AnswerSpec = { kind: "numeric", value: 36, tolerance: { type: "exact" }, unit: "C", unitRequired: true, acceptForms: ["decimal"] };
  test("36 for 36 C on a 4-mark part is 3 of 4; the wrong unit the same", () => {
    const bare = markAnswer("36", charge, { marks: 4 });
    expect(bare).toMatchObject({ correct: false, marksAwarded: 3, marksAvailable: 4 });
    expect(bare.explanation).toMatch(/needs a unit/);
    expect(bare.explanation).toMatch(/3 of 4/);
    expect(markAnswer("36 A", charge, { marks: 4 })).toMatchObject({ correct: false, marksAwarded: 3 });
  });
  test("the right value with its unit is every mark; a wrong value is none; a 1-mark part is the unit's too", () => {
    expect(markAnswer("36 C", charge, { marks: 4 })).toMatchObject({ correct: true, marksAwarded: 4 });
    expect(markAnswer("30 C", charge, { marks: 4 })).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(markAnswer("30", charge, { marks: 4 })).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(markAnswer("30 A", charge, { marks: 4 })).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(markAnswer("36", charge, { marks: 1 })).toMatchObject({ correct: false, marksAwarded: 0 });
  });
});

// Addenda (B): a letter the question uses as a variable is never a unit, in a table's cells as in a numeric part. With
// the coulomb, "4c" in a table of values for y = 2x + c read as 4 coulombs and was paid.
describe("a variable's letter after a number in a table cell is not a unit", () => {
  const table: AnswerSpec = { kind: "table", cells: [{ row: 1, col: 1, value: 4 }, { row: 1, col: 2, value: 6 }] };
  const row = (values: string[]) => JSON.stringify({ cells: values.map((value, i) => ({ row: 1, col: i + 1, value })) });
  const prompt = "Complete the table of values for $y = 2x + c$ when $c = 2$.";
  test("4c is not 4; 4 is", () => {
    expect(markAnswer(row(["4", "6"]), table, { marks: 2, prompt })).toMatchObject({ correct: true, marksAwarded: 2 });
    expect(markAnswer(row(["4c", "6"]), table, { marks: 2, prompt })).toMatchObject({ correct: false, marksAwarded: 1 });
  });
  test("without the stem nothing changes", () => {
    expect(markAnswer(row(["4c", "6"]), table, { marks: 2 })).toMatchObject({ correct: true, marksAwarded: 2 });
  });
});

// Trial audit MK-02 (24 Sep 2026, reproduced 25 Sep): a common error written as the expression the question gives
// was matched by equivalence, and every unsimplified answer is equivalent to it, so "10/(2x − 8)" and the factorised
// but uncancelled line were told "That is the expression you were given" and tagged with that misconception. A common
// error equivalent to the part's own answer is an error of form, so it is matched only as written (the same expression
// in the same form), never by value.
describe("a common error of form is matched as written, not by value", () => {
  const spec: AnswerSpec = { kind: "algebraic", latex: String.raw`\frac{5}{x-4}`, equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" };
  const given: CommonError = {
    misconception: "fm.algfrac.not-factorised-first",
    pattern: { kind: "algebraic", latex: String.raw`\frac{5x+20}{x^{2}-16}` },
    feedback: "That is the expression you were given, so nothing has been credited yet.",
    marksTypicallyEarned: 0,
  };
  const opts = { marks: 2, commonErrors: [given] };
  test("the expression typed back is the named error", () => {
    const r = markAnswer("(5x+20)/(x^2-16)", spec, opts);
    expect(r.tags).toEqual(["fm.algfrac.not-factorised-first"]);
    expect(r.explanation).toMatch(/expression you were given/);
  });
  test("another unsimplified spelling is not that error: it keeps the form check's own diagnosis", () => {
    for (const typed of ["10/(2x-8)", "5(x+4)/((x+4)(x-4))"]) {
      const r = markAnswer(typed, spec, opts);
      expect(r.tags ?? [], typed).not.toContain("fm.algfrac.not-factorised-first");
      expect(r.explanation, typed).not.toMatch(/expression you were given/);
    }
  });
  test("a common error of value (not equivalent to the answer) is still matched by value", () => {
    const sign: CommonError = { misconception: "fm.algfrac.sign", pattern: { kind: "algebraic", latex: String.raw`\frac{5}{x+4}` }, feedback: "Check the sign.", marksTypicallyEarned: 1 };
    expect(markAnswer("5/(4+x)", spec, { marks: 2, commonErrors: [sign] }).tags).toEqual(["fm.algfrac.sign"]);
  });
});

// Trial audit MK-01, the lead's ruling (25 Sep 2026): "right value, wrong form earns marks − 1" is right where the form
// is not the task (a decimal where a fraction was expected), and wrong where it IS the task (simplify, simplify fully,
// factorise, expand, rationalise, write as a single fraction, write in the form …, express … in terms of …, or a part
// flagged `formTask`). There an equivalent answer not in the required form has done none of the work CCEA pays for:
// an authored common error that matches pays its own marksTypicallyEarned and gives its diagnosis; otherwise 0, and
// the feedback says the value is right but the question asked for the form.
describe("a form task pays nothing for the right value in the wrong form (MK-01 ruling)", () => {
  const q9: AnswerSpec = { kind: "algebraic", latex: String.raw`\frac{2(x-2)}{x+3}`, equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" };
  const given: CommonError = {
    misconception: "fm.algfrac.not-factorised-first",
    pattern: { kind: "algebraic", latex: String.raw`\frac{2x^{2}+2x-12}{x^{2}+6x+9}` },
    feedback: "That is the expression you were given, so nothing has been credited yet.",
    marksTypicallyEarned: 0,
  };
  const prompt = String.raw`Simplify fully $\dfrac{2x^{2}+2x-12}{x^{2}+6x+9}$`;
  // The lead's rules of 29 Sep 2026 (the verifier's D, then F): the question typed back earns 0 whatever a common
  // error pays, and the common error still names the misconception (its tag and feedback): diagnosis is not marks.
  test("fm1 algebraic-fractions-simplify .0009: the question typed back earns 0 and names the error", () => {
    const r = markAnswer("(2x^2+2x-12)/(x^2+6x+9)", q9, { marks: 4, commonErrors: [{ ...given, marksTypicallyEarned: 1 }], prompt });
    expect(r).toMatchObject({ correct: false, marksAwarded: 0, tags: ["fm.algfrac.not-factorised-first"] });
    expect(r.explanation).toMatch(/expression you were given/);
  });
  // Ruling 1 as changed (27 Sep) and the lead's ruling of 29 Sep: the ladder decides and there is no fixed floor. With
  // no scheme there is no ladder, so an uncancelled line earns nothing here; with .0009's scheme it earns its two
  // factorising lines (the build-9 gate, class 5).
  test("an uncancelled line with no named error and no scheme earns nothing, and the feedback says the form was the task", () => {
    const r = markAnswer("2(x+3)(x-2)/(x+3)^2", q9, { marks: 4, commonErrors: [given], prompt });
    expect(r.marksAwarded).toBe(0);
    expect(r.explanation).toMatch(/form is what the marks are for/i);
  });
  test("the answer in the required form is still every mark", () => {
    expect(markAnswer("2(x-2)/(x+3)", q9, { marks: 4, commonErrors: [given], prompt })).toMatchObject({ correct: true, marksAwarded: 4 });
  });
  test.each([
    "Factorise fully $3x^2 - 27$.",
    "Expand and simplify $(x+2)(x+3)$.",
    "Rationalise the denominator of $\\frac{6}{\\sqrt{3}}$.",
    "Write $\\frac{2}{x} + \\frac{3}{x+1}$ as a single fraction.",
    "Express $\\log 2 + \\log 5$ as a single logarithm.",
  ])("%s is a form task", (stem) => {
    expect(isFormTask(stem, q9)).toBe(true);
  });
  // The narrowed ruling (25 Sep 2026): a finishing instruction on a multi-step part is not a form task; the method marks
  // stand and only the final answer's mark is withheld.
  test.each([
    "Find the equation of the tangent. Give your answer in the form $y = mx + c$.",
    "Find the equation of the normal. Give your answer in the form $ax + by = c$.",
    "Express $y$ in terms of $x$.",
    "Make $t$ the subject of the formula.",
  ])("%s is not a form task", (stem) => {
    expect(isFormTask(stem, q9)).toBe(false);
  });
  test("fm1 tangents-and-normals .0013: '5y = x + 31' for y = x/5 + 31/5 keeps 6 of 7", () => {
    const tangent: AnswerSpec = { kind: "algebraic", latex: String.raw`y = \frac{1}{5}x + \frac{31}{5}`, equivalence: "equivalent", variables: ["x", "y"], form: "y=mx+c" };
    const prompt = "Find the equation of the normal to the curve at the point where $x = 1$. Give your answer in the form $y = mx + c$.";
    expect(markAnswer("5y = x + 31", tangent, { marks: 7, prompt }).marksAwarded).toBe(6);
  });
  test("an explicit flag decides either way; a stem without a form instruction is not a form task", () => {
    expect(isFormTask("Find the value of the expression.", { ...q9, formTask: true } as AnswerSpec)).toBe(true);
    expect(isFormTask("Simplify fully.", { ...q9, formTask: false } as AnswerSpec)).toBe(false);
    expect(isFormTask("Find the probability that both are red.", q9)).toBe(false);
    expect(isFormTask(undefined, q9)).toBe(false);
  });
  test("a numeric part: 0.5 for ½ earns marks − 1 where the stem instructs the form, and every mark where it does not", () => {
    const half: AnswerSpec = { kind: "numeric", value: 0.5, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["fraction"] };
    const told = markAnswer("0.5", half, { marks: 2, prompt: "Find the probability that the counter is red. Give your answer as a fraction." });
    expect(told).toMatchObject({ correct: false, marksAwarded: 1, marksAvailable: 2 });
    expect(markAnswer("0.5", half, { marks: 2, prompt: "Find the probability that the counter is red." })).toMatchObject({ correct: true, marksAwarded: 2 });
    expect(markAnswer("1/2", half, { marks: 2, prompt: "Find the probability that the counter is red." })).toMatchObject({ correct: true, marksAwarded: 2 });
    const twoPi: AnswerSpec = { kind: "numeric", value: 2 * Math.PI, tolerance: { type: "absolute", value: 0.01 }, unit: "cm", unitRequired: false, acceptForms: ["pi"] };
    expect(markAnswer("6.28 cm", twoPi, { marks: 2, prompt: "Find the length of its arc. Leave your answer in terms of $\\pi$." }).marksAwarded).toBe(1);
    expect(markAnswer("6.28 cm", twoPi, { marks: 2, prompt: "Find the length of its arc." })).toMatchObject({ correct: true, marksAwarded: 2 });
    // "Express 1/√8 as √a/b" is the form as the whole task; "Show that the radius is 3√2 cm" instructs the exact form.
    const surd: AnswerSpec = { kind: "numeric", value: Math.SQRT2 / 4, tolerance: { type: "absolute", value: 0.001 }, unitRequired: false, acceptForms: ["surd"] };
    expect(markAnswer("0.3536", surd, { marks: 3, prompt: "Express $\\dfrac{1}{\\sqrt{8}}$ as $\\dfrac{\\sqrt{a}}{b}$, where $a$ and $b$ are integers." }).marksAwarded).toBe(0);
    const radius: AnswerSpec = { kind: "numeric", value: 3 * Math.SQRT2, tolerance: { type: "absolute", value: 0.01 }, unit: "cm", unitRequired: false, acceptForms: ["surd"] };
    expect(markAnswer("4.24 cm", radius, { marks: 2, prompt: "A circle has area $18\\pi$ cm². Show that the radius of the circle is $3\\sqrt{2}$ cm." }).marksAwarded).toBe(0);
    // A letter of the question after the number is a wrong answer, not a form: still 0.
    expect(markAnswer("4m", { kind: "numeric", value: 4, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] }, { marks: 2, prompt: "(d) $3m^{0} + m^{0}$" }).marksAwarded).toBe(0);
  });
  test("an algebraic part whose stem is not a form task keeps marks − 1", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: "\\log 8x^3", equivalence: "equivalent", variables: ["x"], form: "single-log-expanded" };
    expect(markAnswer("\\log 8 + 3\\log x", spec, { marks: 3, prompt: "Use the laws of logarithms on your answer to part (a)." }).marksAwarded).toBe(2);
    // The form task with the equivalent expression in another form and no scheme line shown: 0 (the lead's ruling of
    // 29 Sep 2026: the ladder decides and there is no fixed floor).
    expect(markAnswer("\\log 8 + 3\\log x", spec, { marks: 3, prompt: "Write $3\\log 2x$ as a single logarithm." }).marksAwarded).toBe(0);
  });
});

// The verifier (25 Sep 2026): "carbon monoxide (CO2)" was paid 1/1 where carbon dioxide is the answer. CCEA C2 2021:
// where a name is asked for, the formula beside it is ignored, so a wrong name "must be marked wrong"; where a formula
// is asked for, the name is ignored. The stem's word decides ("name" / "formula"); without either, the key words do
// (all formulae: a formula is asked for; otherwise a name).
describe("a name with a formula: the part judges the one it asks for", () => {
  const gas: AnswerSpec = { kind: "text", accepted: [], keyWords: [{ any: ["carbon dioxide", "CO2"], marks: 1 }], listingRule: true };
  test("a name is asked for: the name is judged, the formula ignored", () => {
    const prompt = "Name the gas that turns limewater milky.";
    expect(markAnswer("carbon monoxide (CO2)", gas, { marks: 1, prompt }).correct).toBe(false);
    expect(markAnswer("carbon dioxide (CO)", gas, { marks: 1, prompt }).correct).toBe(true);
    expect(markAnswer("carbon dioxide, CO2", gas, { marks: 1, prompt }).correct).toBe(true);
  });
  test("a formula is asked for: the formula is judged, the name ignored", () => {
    const prompt = "Write the formula of the gas that turns limewater milky.";
    expect(markAnswer("carbon monoxide (CO2)", gas, { marks: 1, prompt }).correct).toBe(true);
    expect(markAnswer("carbon dioxide (CO)", gas, { marks: 1, prompt }).correct).toBe(false);
  });
  test("neither word: formula-only key words ask for the formula", () => {
    const monomer: AnswerSpec = { kind: "text", accepted: [], keyWords: [{ any: ["C3H6", "CH2=CHCH3"], marks: 1 }], listingRule: false };
    expect(markAnswer("propene (C3H6)", monomer, { marks: 1, prompt: "Give the monomer." }).correct).toBe(true);
    expect(markAnswer("carbon monoxide (CO2)", gas, { marks: 1, prompt: "Which gas turns limewater milky?" }).correct).toBe(false);
  });
});

// The verifier's second round (25 Sep 2026). (1) Converting to a fraction (or a surd, a mixed number, standard form) is
// the whole task when the stem says to write, convert, change or express the number that way: the decimal typed back
// scores 0 or its common error's marks. (2) A "show that" part prints its answer: a decimal or the target typed back
// shows nothing and scores 0; only an exact-form answer or the ladder pays. (3) "You must show your working": a bare
// right value in another form scores 0.
describe("form tasks, show-that and show-your-working (verifier, round 2)", () => {
  const ninth: AnswerSpec = { kind: "numeric", value: 4 / 9, tolerance: { type: "absolute", value: 0.001 }, unitRequired: false, acceptForms: ["fraction"] };
  test.each([
    String.raw`Convert $0.\dot{4}$ to a fraction.`,
    String.raw`Write $0.\dot{4}$ as a fraction in its simplest form.`,
    String.raw`Change $0.\dot{4}$ into a fraction.`,
    String.raw`Express $0.\dot{4}$ as a fraction.`,
  ])("%s: the decimal typed back scores 0", (prompt) => {
    expect(markAnswer("0.444", ninth, { marks: 2, prompt }).marksAwarded).toBe(0);
    expect(markAnswer("4/9", ninth, { marks: 2, prompt })).toMatchObject({ correct: true, marksAwarded: 2 });
  });
  test("a finishing instruction on a calculation is still only the final mark", () => {
    expect(markAnswer("0.444", ninth, { marks: 2, prompt: "Work out the probability. Give your answer as a fraction." }).marksAwarded).toBe(1);
  });
  test("show that: the target or a decimal typed back scores 0; the exact form is right", () => {
    const radius: AnswerSpec = { kind: "numeric", value: 3 * Math.SQRT2, tolerance: { type: "absolute", value: 0.01 }, unit: "cm", unitRequired: false, acceptForms: ["surd"] };
    const prompt = String.raw`A circle has area $18\pi$ cm². Show that the radius of the circle is $3\sqrt{2}$ cm.`;
    expect(markAnswer("4.242640687", radius, { marks: 2, prompt }).marksAwarded).toBe(0);
    expect(markAnswer("4.24 cm", radius, { marks: 2, prompt }).marksAwarded).toBe(0);
  });
  test("you must show your working: a bare right value in another form scores 0", () => {
    const surd: AnswerSpec = { kind: "numeric", value: 5 * Math.SQRT2, tolerance: { type: "absolute", value: 0.01 }, unitRequired: false, acceptForms: ["surd"] };
    expect(markAnswer("7.07", surd, { marks: 3, prompt: "Simplify $\\sqrt{50}$. You must show your working." }).marksAwarded).toBe(0);
    expect(markAnswer("7.07", surd, { marks: 3, prompt: "Work out the length. Show your working. Give your answer in surd form." }).marksAwarded).toBe(0);
  });
});

// (4) The rounded-value guard's 10 % closeness: "0.3" for 0.26 (15 % off) is a wrong value, not a rounding.
describe("the rounded-value advice needs the value close", () => {
  test("0.3 for 0.26 is not called the rounded value; 0.3 for 0.29 is", () => {
    expect(checkNumeric("0.3", { value: 0.26, tolerance: { type: "absolute", value: 0.001 } }).feedback).not.toMatch(/only the rounded value/);
    expect(checkNumeric("0.3", { value: 0.29, tolerance: { type: "absolute", value: 0.001 } }).feedback).toMatch(/only the rounded value/);
  });
});

describe("instructsAccuracy reads an instruction, not a description of the given", () => {
  test("'does not round … at 1 decimal place' is not an instruction; 'round to', 'rounded to' are", () => {
    expect(instructsAccuracy("A stopwatch does not round: it **cuts the display off** at $1$ decimal place. It shows $9.4$ s.\n\nWrite down the upper bound of the true time.")).toBe(false);
    expect(instructsAccuracy("Work out the length and round it to 2 decimal places.")).toBe(true);
    expect(instructsAccuracy("The answer should be rounded to 1 decimal place.")).toBe(true);
    expect(instructsAccuracy("Round to 2 decimal places.")).toBe(true);
  });
  test("m4 bounds .0005: 9.5 for the upper bound is right, with no accuracy mark taken", () => {
    const spec: AnswerSpec = { kind: "numeric", value: 9.5, tolerance: { type: "dp", places: 2 }, unit: "s", unitRequired: false, acceptForms: ["decimal"] };
    const prompt = "A stopwatch does not round: it **cuts the display off** at $1$ decimal place. It shows $9.4$ s.\n\nWrite down the upper bound of the true time.";
    expect(markAnswer("9.5", spec, { marks: 1, prompt })).toMatchObject({ correct: true, marksAwarded: 1 });
  });
  test("the accuracy mark's explanation says what was short, never 'Correct.'", () => {
    const v: AnswerSpec = { kind: "numeric", value: 13.04, tolerance: { type: "dp", places: 2 }, unit: "V", unitRequired: false, acceptForms: ["decimal"] };
    const r = markAnswer("13.0", v, { marks: 2, prompt: "Calculate the voltage. Give your answer to 2 decimal places." });
    expect(r).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(r.explanation).toMatch(/^13\.0 is rounded to fewer places than the question asks\. Give the answer to 2 decimal places: 13\.04 V\. 1 of 2: only the accuracy mark is lost\./);
  });
});

// The P2 C review (25 Sep 2026): a unit the stem instructs is a conversion asked for. The right value left in another
// unit ("0.36 A" for "in milliamps") loses the unit's mark; not instructed, a converted value is simply right.
describe("an instructed unit is a conversion asked for", () => {
  const mA: AnswerSpec = { kind: "numeric", value: 360, tolerance: { type: "absolute", value: 0.5 }, unit: "mA", unitRequired: false, acceptForms: ["decimal"] };
  test("in milliamps: 0.36 A earns every mark but the unit's", () => {
    const prompt = "Calculate the current through resistor S, in milliamps.";
    expect(markAnswer("0.36 A", mA, { marks: 2, prompt })).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(markAnswer("360mA", mA, { marks: 2, prompt })).toMatchObject({ correct: true, marksAwarded: 2 });
    expect(markAnswer("0.36 A", mA, { marks: 1, prompt: "State the current, in milliamps." })).toMatchObject({ correct: false, marksAwarded: 0 });
  });
  test("give your answer in mA; how many hours", () => {
    expect(markAnswer("0.36 A", mA, { marks: 3, prompt: "Calculate the current. Give your answer in mA." }).marksAwarded).toBe(2);
    const h: AnswerSpec = { kind: "numeric", value: 3, tolerance: { type: "absolute", value: 0.05 }, unit: "h", unitRequired: false, acceptForms: ["decimal"] };
    expect(markAnswer("180 minutes", h, { marks: 2, prompt: "Calculate for how many hours it was switched on." }).marksAwarded).toBe(1);
  });
  test("not instructed, a converted value is right", () => {
    expect(markAnswer("0.36 A", mA, { marks: 2, prompt: "Calculate the current through resistor S." })).toMatchObject({ correct: true, marksAwarded: 2 });
    expect(instructsUnit("Put the lamp in a circuit and find the current.", "A")).toBe(false);
  });
});

// The lead's scope of ruling 12 (27 Sep 2026, the Fable judge's report): science papers mark instructed places as
// written (DAS 2025 chemistry report, C1 Q(b): "many lost a mark for not giving their answer to one decimal place as
// instructed"); Further Maths and Maths accept the dropped zero ("Accept 1.5 instead of 1.50 for an answer required to
// 2 dp", FM GMI) and extra places.
describe("instructed places: science marks them as written; maths and further maths do not", () => {
  const v: AnswerSpec = { kind: "numeric", value: 13, tolerance: { type: "dp", places: 1 }, unit: "%", unitRequired: false, acceptForms: ["decimal"] };
  const prompt = "Calculate the percentage change in mass. Give your answer to one decimal place.";
  test("science: 13 or 13.00 for 13.0 loses the accuracy mark; 13.0 earns every mark", () => {
    expect(markAnswer("13", v, { marks: 2, prompt, subject: "science" })).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(markAnswer("13", v, { marks: 2, prompt, subject: "science" }).explanation).toMatch(/write 13\.0 on the paper/);
    expect(markAnswer("13.00", v, { marks: 2, prompt, subject: "science" })).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(markAnswer("13.0", v, { marks: 2, prompt, subject: "science" })).toMatchObject({ correct: true, marksAwarded: 2 });
    expect(markAnswer("13", v, { marks: 1, prompt, subject: "science" })).toMatchObject({ correct: false, marksAwarded: 0 });
    // Not instructed, the tolerance is a closeness test in science too.
    expect(markAnswer("13", v, { marks: 2, prompt: "Calculate the percentage change in mass.", subject: "science" })).toMatchObject({ correct: true, marksAwarded: 2 });
  });
  test("further maths and maths: the dropped zero and extra places are right, with the reminder", () => {
    for (const subject of ["further-maths", "maths", undefined]) {
      expect(markAnswer("13", v, { marks: 2, prompt, subject }), String(subject)).toMatchObject({ correct: true, marksAwarded: 2 });
      expect(markAnswer("13.02", v, { marks: 2, prompt, subject }), String(subject)).toMatchObject({ correct: true, marksAwarded: 2 });
    }
  });
});

// Ruling 1 as the judge changed it (27 Sep 2026): on a form task the right value in another form is working. The
// ladder pays the scheme points it shows, a later line of one chain implies the earlier, the total is capped at
// marks − 1, and only the question typed back (no step) earns 0.
describe("a form task pays the steps its answer line shows", () => {
  const spec: AnswerSpec = { kind: "algebraic", latex: "n^2 - 2n - 8", variables: ["n"], equivalence: "simplifiedOnly", mustBeExpanded: true } as AnswerSpec;
  const scheme = [
    { id: "p1", code: "MA", marks: 1, for: "n(n - 4) + 2(n - 4)" },
    { id: "p2", code: "MA", marks: 1, for: "n^2 - 4n + 2n - 8" },
    { id: "p3", code: "MA", marks: 1, for: "n^2 - 2n - 8" },
  ];
  const prompt = "Expand and simplify $(n + 2)(n - 4)$.";
  const workedSolution = "n(n - 4) + 2(n - 4) = n^2 - 4n + 2n - 8 = n^2 - 2n - 8";
  test("M4 2025 Q5: n² − 4n + 2n − 8 is MA1 MA1 = 2 of 3; the first step alone 1 of 3; the question typed back 0", () => {
    expect(markAnswer("n² − 4n + 2n − 8", spec, { marks: 3, prompt, scheme, workedSolution })).toMatchObject({ correct: false, marksAwarded: 2 });
    expect(markAnswer("n(n - 4) + 2(n - 4)", spec, { marks: 3, prompt, scheme, workedSolution })).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(markAnswer("(n + 2)(n - 4)", spec, { marks: 3, prompt, scheme, workedSolution })).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(markAnswer("n^2 - 2n - 8", spec, { marks: 3, prompt, scheme, workedSolution })).toMatchObject({ correct: true, marksAwarded: 3 });
  });
  test("FM1 simplify: both lines factorised and not cancelled pays both factorising marks, never the last", () => {
    const frac: AnswerSpec = { kind: "algebraic", latex: String.raw`\frac{2(x-2)}{x+2}`, equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" } as AnswerSpec;
    const s = [
      { id: "a", code: "MW", marks: 1, for: "numerator factorised: 2(x - 2)(x + 2)" },
      { id: "b", code: "MW", marks: 1, for: "denominator factorised: (x + 2)²" },
      { id: "c", code: "MW", marks: 1, for: "(x + 2) cancelled and the answer fully simplified to 2(x - 2) over (x + 2)" },
    ];
    const p = String.raw`Simplify fully $\dfrac{2x^{2}-8}{x^{2}+4x+4}$`;
    expect(markAnswer("2(x-2)(x+2)/(x+2)^2", frac, { marks: 3, prompt: p, scheme: s })).toMatchObject({ correct: false, marksAwarded: 2 });
    expect(markAnswer("(2x^2-8)/(x+2)^2", frac, { marks: 3, prompt: p, scheme: s })).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(markAnswer("2(x-2)/(x+2)", frac, { marks: 3, prompt: p, scheme: s })).toMatchObject({ correct: true, marksAwarded: 3 });
  });
});

// The pipeline agent's G2 check (27 Sep 2026): on a form task the question typed back takes no step, whatever the
// spec's equivalence or formTask flag says; m3 hcf .0011(a) "550" and algebraic fractions .0002(a) were paid in full.
describe("the question typed back on a form task earns 0", () => {
  const prompt = String.raw`Simplify fully $\dfrac{3x^{2}-27}{x^{2}+x-6}$`;
  test.each(["equivalent", "identical", "simplifiedOnly"])("equivalence %s", (equivalence) => {
    for (const formTask of [undefined, true]) {
      const spec = { kind: "algebraic", latex: String.raw`\frac{3(x-3)}{x-2}`, equivalence, variables: ["x"], ...(formTask ? { formTask } : {}) } as AnswerSpec;
      expect(markAnswer("(3x^2-27)/(x^2+x-6)", spec, { marks: 3, prompt }).marksAwarded).toBe(0);
      expect(markAnswer("3(x-3)/(x-2)", spec, { marks: 3, prompt })).toMatchObject({ correct: true, marksAwarded: 3 });
    }
  });
  test("a product of prime factors, and a single fraction", () => {
    const primes = { kind: "algebraic", latex: String.raw`2 \times 5^2 \times 11`, equivalence: "equivalent", variables: [] } as AnswerSpec;
    const p = "Write 550 as a product of its prime factors.";
    expect(markAnswer("550", primes, { marks: 2, prompt: p }).marksAwarded).toBe(0);
    for (const typed of ["2 × 5² × 11", "2 × 5 × 5 × 11", "2 x 5^2 x 11"]) expect(markAnswer(typed, primes, { marks: 2, prompt: p }), typed).toMatchObject({ correct: true, marksAwarded: 2 });
    const single = { kind: "algebraic", latex: String.raw`\frac{9x}{10}`, equivalence: "equivalent", variables: ["x"] } as AnswerSpec;
    const q = String.raw`Write $\dfrac{4x + 1}{5} + \dfrac{x - 2}{10}$ as a single fraction.`;
    expect(markAnswer("(4x + 1)/5 + (x - 2)/10", single, { marks: 2, prompt: q }).marksAwarded).toBe(0);
    expect(markAnswer("9x/10", single, { marks: 2, prompt: q })).toMatchObject({ correct: true, marksAwarded: 2 });
  });
});

// The verifier's C, D and E (29 Sep 2026).
describe("show-that targets, the question typed back, and a decimal for a fraction", () => {
  test("C: a show-that's printed target alone earns 0, numeric or algebraic; a value it does not print is marked", () => {
    const vp: AnswerSpec = { kind: "numeric", value: 25, tolerance: { type: "exact" }, unit: "cm", unitRequired: false, acceptForms: ["decimal"] };
    const p = "$V$ is the vertex and $O$ is the centre of the base.\nShow that the slant height $VP$ is 25 cm.";
    for (const typed of ["25", "VP = 25 cm"]) expect(markAnswer(typed, vp, { marks: 2, prompt: p }), typed).toMatchObject({ correct: false, marksAwarded: 0, workingOnly: true });
    expect(markAnswer("√(20² + 15²) = 25", vp, { marks: 2, prompt: p }).marksAwarded).toBe(2);
    const r: AnswerSpec = { kind: "numeric", value: 3 * Math.SQRT2, tolerance: { type: "absolute", value: 0.005 }, unit: "cm", unitRequired: false, acceptForms: ["surd"] };
    expect(markAnswer("3√2", r, { marks: 2, prompt: String.raw`A circle has area $18\pi$ cm². Show that the radius of the circle is $3\sqrt{2}$ cm.` }).marksAwarded).toBe(0);
    const id = { kind: "algebraic", latex: "28x + 49", equivalence: "equivalent", variables: ["x"] } as AnswerSpec;
    expect(markAnswer("28x + 49", id, { marks: 3, prompt: "Show that $(2x + 7)^2 - 4x^2 = 28x + 49$." }).marksAwarded).toBe(0);
    const area: AnswerSpec = { kind: "numeric", value: 91, tolerance: { type: "exact" }, unit: "m²", unitRequired: false, acceptForms: ["decimal"] };
    expect(markAnswer("91", area, { marks: 3, prompt: "Show that the area can be written as $(x + 3)(x - 3)$ square metres, and work out that area when $x = 10$." }).marksAwarded).toBe(3);
  });
  test("D: the question typed back earns 0 on any part, and a sum still to do earns only its working", () => {
    const n: AnswerSpec = { kind: "numeric", value: 6600, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] };
    const p = "Use the difference of two squares to work out $83^2 - 17^2$.";
    expect(markAnswer("83^2 - 17^2", n, { marks: 2, prompt: p }).marksAwarded).toBe(0);
    expect(markAnswer("83² − 17²", n, { marks: 2, prompt: p }).marksAwarded).toBe(0);
    expect(markAnswer("(83 + 17)(83 - 17)", n, { marks: 2, prompt: p })).toMatchObject({ correct: false, marksAwarded: 1 });
    expect(markAnswer("6600", n, { marks: 2, prompt: p })).toMatchObject({ correct: true, marksAwarded: 2 });
    const integral = { kind: "algebraic", latex: "2k + 12", equivalence: "equivalent", variables: ["k"] } as AnswerSpec;
    expect(markAnswer(String.raw`\int_{0}^{2} (k + 6x)\,dx`, integral, { marks: 2, prompt: String.raw`Find $\int_{0}^{2} (k + 6x)\,dx$ in terms of $k$.` }).marksAwarded).toBe(0);
    const power = { kind: "algebraic", latex: "y^{-5}", equivalence: "identical", variables: ["y"] } as AnswerSpec;
    expect(markAnswer("1/y^5", power, { marks: 1, prompt: String.raw`Write $\dfrac{1}{y^{5}}$ as a single power of $y$.` }).marksAwarded).toBe(0);
  });
  test("E: a calculator decimal where a fraction in lowest terms is asked earns only the ladder", () => {
    const spec: AnswerSpec = { kind: "numeric", value: 1 / 6, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["fraction"], mustBeSimplified: true };
    const scheme = [
      { id: "m1", code: "M", marks: 1, for: "$10x - x$ used for the first decimal, or $1/9$ seen" },
      { id: "a1", code: "A", marks: 1, for: String.raw`$0.\dot{1} = 1/9$ (oe)` },
      { id: "m2", code: "MA", marks: 1, for: String.raw`$0.0\dot{5} = 1/18$ (oe)` },
      { id: "a2", code: "A", marks: 1, for: "1/6" },
    ];
    const prompt = String.raw`Work out the value of $0.\dot{1} + 0.0\dot{5}$.` + "\n\nGive your answer as a fraction in its lowest terms.";
    expect(markAnswer("0.1666666667", spec, { marks: 4, prompt, scheme }).marksAwarded).toBe(0);
    expect(markAnswer("1/6", spec, { marks: 4, prompt, scheme })).toMatchObject({ correct: true, marksAwarded: 4 });
    const third: AnswerSpec = { kind: "numeric", value: 1 / 3, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["fraction"], mustBeSimplified: true };
    const s2 = [
      { id: "m", code: "M", marks: 1, for: "$x = 0.33333333...$ with $10x = 3.3333333...$, or $3/9$ seen" },
      { id: "a", code: "A", marks: 1, for: "1/3" },
    ];
    const p2 = String.raw`Change the recurring decimal $0.\dot{3}$ to a fraction in its simplest form.`;
    expect(markAnswer("3/9", third, { marks: 2, prompt: p2, scheme: s2 }).marksAwarded).toBe(1);
    expect(markAnswer("0.333333333333", third, { marks: 2, prompt: p2, scheme: s2 }).marksAwarded).toBe(0);
  });
});

// The lead's F, H and I (29 Sep 2026).
describe("common errors on copied questions, verifications and text parts", () => {
  test("F: the copied question earns 0 and still names its error", () => {
    const spec = { kind: "algebraic", latex: String.raw`\frac{5}{x-4}`, equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" } as AnswerSpec;
    const given: CommonError = { misconception: "fm.algfrac.not-factorised-first", pattern: { kind: "algebraic", latex: String.raw`\frac{5x+20}{x^{2}-16}` }, feedback: "That is the expression you were given.", marksTypicallyEarned: 1 } as CommonError;
    const r = markAnswer("(5x+20)/(x^2-16)", spec, { marks: 2, commonErrors: [given], prompt: String.raw`Simplify fully $\dfrac{5x+20}{x^{2}-16}$` });
    expect(r).toMatchObject({ correct: false, marksAwarded: 0, tags: ["fm.algfrac.not-factorised-first"] });
  });
  test("H: a show-that verified by substitution earns the common error's 2 of 3; the bare target 0", () => {
    const spec = { kind: "text", accepted: ["Taking up as positive, 7020 - 10M = 0.8M, so 7020 = 10.8M and M = 650."], keyWords: [{ any: ["7020 - 10m"], marks: 1 }, { any: ["10.8m"], marks: 1 }, { any: ["m = 650"], marks: 1 }], listingRule: false } as AnswerSpec;
    const verify: CommonError = { misconception: "fm.show-that.verify-by-substitution", pattern: { kind: "text", regex: String.raw`650\s*[×x*]\s*10\.8` }, feedback: "Verification, not a derivation.", marksTypicallyEarned: 2 } as CommonError;
    const prompt = "The lift accelerates upwards at 0.8 m/s².\n\nShow that $M = 650$.";
    expect(markAnswer("M = 650 because 650 × 10.8 = 7020", spec, { marks: 3, commonErrors: [verify], prompt }).marksAwarded).toBe(2);
    expect(markAnswer("650", spec, { marks: 3, commonErrors: [verify], prompt }).marksAwarded).toBe(0);
  });
  test("H: a common error naming the value decides over the fewer-places reading", () => {
    const spec: AnswerSpec = { kind: "numeric", value: 6.09, tolerance: { type: "dp", places: 2 }, unit: "m/s", unitRequired: false, acceptForms: ["decimal", "fraction"] };
    const mean: CommonError = { misconception: "fm.kin.average-speed-formula", pattern: { kind: "numeric", value: 6, tolerance: { type: "absolute", value: 0.005 } }, feedback: "That is the mean of the two velocities.", marksTypicallyEarned: 0 } as CommonError;
    expect(markAnswer("6", spec, { marks: 2, commonErrors: [mean], prompt: "Calculate the average speed. Give your answer to 2 decimal places." }).marksAwarded).toBe(0);
  });
  test("I: a text part's common error never raises the key words' award", () => {
    const spec = { kind: "text", accepted: ["electrons collide with the ions of the metal"], keyWords: [{ any: ["electrons"], marks: 1 }, { any: ["collide", "collisions"], marks: 1 }, { any: ["ions", "atoms"], marks: 1 }], listingRule: false } as AnswerSpec;
    const partner: CommonError = { misconception: "sci.circuits.wrong-particle", pattern: { kind: "text", regex: String.raw`\b(protons?|neutrons?|nucle(us|i))\b` }, feedback: "Electrons collide with the metal's ions, not its protons.", marksTypicallyEarned: 2 } as CommonError;
    const r = markAnswer("protons and neutrons", spec, { marks: 3, commonErrors: [partner], prompt: "Which two kinds of particle produce this energy, and how?" });
    expect(r.marksAwarded).toBe(0);
    expect(r.tags).toEqual(["sci.circuits.wrong-particle"]);
  });
});

// A common error that names the answer keeps its tag at its own marks, and an equivalent answer on a form task that
// shows no scheme line earns 0 (the lead's ruling of 29 Sep 2026: the ladder decides and there is no fixed floor;
// "x/3 − 2" on a single-fraction task earns 0 when no scheme line shows).
describe("a named common error, and no floor on a form task", () => {
  test("x²/x − 4 for (x² − 16)/(x + 4) earns the error's 0; x/3 − 2 for (x − 6)/3 earns 0 with no scheme line shown", () => {
    const spec = { kind: "algebraic", latex: "x - 4", equivalence: "simplifiedOnly", variables: ["x"] } as AnswerSpec;
    const cancel: CommonError = { misconception: "maths.alg-fractions.cancel-terms-not-factors", pattern: { kind: "algebraic", latex: String.raw`\frac{x^2}{x} - 4` }, feedback: "Only whole factors cancel.", marksTypicallyEarned: 0 } as CommonError;
    const r = markAnswer(String.raw`\frac{x^2}{x} - 4`, spec, { marks: 2, commonErrors: [cancel], prompt: String.raw`Hence simplify $\dfrac{x^2 - 16}{x + 4}$.` });
    expect(r).toMatchObject({ correct: false, marksAwarded: 0, tags: ["maths.alg-fractions.cancel-terms-not-factors"] });
    const third = { kind: "algebraic", latex: String.raw`\frac{x-6}{3}`, equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" } as AnswerSpec;
    expect(markAnswer("x/3 - 2", third, { marks: 2, prompt: String.raw`Simplify fully $\dfrac{x^{2}-36}{3x+18}$` })).toMatchObject({ correct: false, marksAwarded: 0 });
  });
});

// The lead's D addendum (29 Sep 2026, the FM1 group 0 author): the question typed back is 0 before the ladder and before
// any form-task credit, however the division is written and when the stem labels the expression ("f(x) = …").
describe("the question typed back, in any spelling, before any form-task credit", () => {
  test("a division typed back with ÷, / or \\div", () => {
    const spec = { kind: "algebraic", latex: "2(x-9)", equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" } as AnswerSpec;
    const prompt = "Simplify fully\n" + String.raw`$\left(\dfrac{x}{3} - \dfrac{27}{x}\right) \div \dfrac{x+9}{6x}$`;
    for (const typed of ["(x/3 - 27/x) ÷ (x+9)/(6x)", "(x/3 - 27/x) / ((x+9)/(6x))", String.raw`\left(\dfrac{x}{3} - \dfrac{27}{x}\right) \div \dfrac{x+9}{6x}`]) {
      expect(markAnswer(typed, spec, { marks: 4, prompt }).marksAwarded, typed).toBe(0);
    }
    expect(markAnswer("2x - 18", spec, { marks: 4, prompt })).toMatchObject({ correct: true, marksAwarded: 4 });
  });
  test("a labelled expression typed back: f(x) = x² − 5x + 11 for completing the square", () => {
    const spec = { kind: "algebraic", latex: String.raw`(x - \frac{5}{2})^{2} + \frac{19}{4}`, equivalence: "equivalent", variables: ["x"], form: "completed-square" } as AnswerSpec;
    const prompt = String.raw`The function $f$ is given by $f(x) = x^{2} - 5x + 11$.` + "\nBy completing the square, express $f(x)$ as $(x + a)^{2} + b$.";
    expect(markAnswer("x^2-5x+11", spec, { marks: 2, prompt }).marksAwarded).toBe(0);
    expect(markAnswer("(x - 5/2)^2 + 19/4", spec, { marks: 2, prompt })).toMatchObject({ correct: true, marksAwarded: 2 });
  });
  test("a display-maths stem keeps its model answer (S44): '3' is not the question typed back", () => {
    const spec = { kind: "algebraic", latex: "3", equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" } as AnswerSpec;
    const prompt = "Simplify fully\n" + String.raw`$$\left(\dfrac{x}{x+1} - \dfrac{x-4}{x+2}\right) \div \dfrac{5x+4}{3x^{2}+9x+6}$$`;
    expect(markAnswer("3", spec, { marks: 7, prompt })).toMatchObject({ correct: true, marksAwarded: 7 });
  });
});

// Build-9 gate, class 2 (the verifier, 29 Sep 2026): the show-that verification exception paid any text common error on
// any stem holding "show that". It applies only to a verify-by-substitution error on a real show-that part; everywhere
// else a text common error never raises the award (the lead's I).
describe("the show-that verification exception is only for a verification (build-9 gate, class 2)", () => {
  const show = (keys: string[][], accepted: string[]): AnswerSpec => ({ kind: "text", accepted, keyWords: keys.map((any) => ({ any, marks: 1 })), listingRule: false }) as AnswerSpec;
  test("m8 simultaneous .0011 'MA1 x² + 4 = 0 oe dep M1': 'x = 2' with a numeric error worth 2 earns 0", () => {
    const spec = show([["x^2 + 4 = 0", "x^2 = -4"], ["no real", "discriminant", "negative", "impossible"]], ["x^2 + 4 = 0 has no real solutions because the discriminant is -16"]);
    const root: CommonError = { misconception: "maths.quadratics.negative-root-discarded", pattern: { kind: "numeric", value: 2, tolerance: { type: "absolute", value: 0 } }, feedback: "That solves a different equation.", marksTypicallyEarned: 2 } as CommonError;
    const prompt = "Show that the line $y = 2x + 1$ never meets the curve $y = x^2 + 2x + 5$.";
    expect(markAnswer("x = 2", spec, { marks: 3, commonErrors: [root], prompt }).marksAwarded).toBe(0);
    expect(markAnswer("2", spec, { marks: 3, commonErrors: [root], prompt }).marksAwarded).toBe(0);
  });
  test("m8 simultaneous .0017(a) 'MA1 x² − 4x + 4 = 0 oe dep M1': 'x = 2' with the solve-instead error (2) earns 0", () => {
    const spec = show([["x^2 - 4x + 4", "(x - 2)^2"], ["repeated", "one point", "discriminant"]], ["x^2 - 4x + 4 = 0 gives (x - 2)^2 = 0, a repeated root, so one point"]);
    const solve: CommonError = { misconception: "maths.quadratics.show-that-solve-instead", pattern: { kind: "text", regex: String.raw`^\s*x\s*=\s*2\s*$` }, feedback: "Solving is not showing.", marksTypicallyEarned: 2 } as CommonError;
    expect(markAnswer("x = 2", spec, { marks: 3, commonErrors: [solve], prompt: "Show that the line touches the curve at exactly one point." }).marksAwarded).toBe(0);
  });
  test("fm1 form-three .0005 'W1 dividing every term of that equation by 10': 'multiply the whole equation by 10' (wrong scaling, 1) earns 0", () => {
    const spec = show([["2130", "21.3"], ["divide by 10", "dividing by 10"]], ["In pence the total is 20x + 50y + 100z = 2130, and dividing the whole equation by 10 gives the printed form."]);
    const scaling: CommonError = { misconception: "fm.simeq.wrong-scaling-to-reach-given", pattern: { kind: "text", regex: String.raw`multipl(?:y|ied|ying)\s+(?:the\s+)?(?:whole\s+)?equation\s+by` }, feedback: "Dividing, not multiplying.", marksTypicallyEarned: 1 } as CommonError;
    expect(markAnswer("multiply the whole equation by 10", spec, { marks: 3, commonErrors: [scaling], prompt: "The coins in the jar are worth £21.30 altogether.\n\nShow that $2x + 5y + 10z = 213$." }).marksAwarded).toBe(0);
  });
  test("b1 aerobic-respiration .0005(c) 'P1 flask A rose by 4.5 °C compared with 0.3 °C': 'explain why the results show that' is not a show-that", () => {
    const spec = show([["more", "greater", "4.5", "4.2"], ["heat", "energy released", "exothermic"]], ["the living peas warmed far more than the dead ones, so respiration must be releasing heat"]);
    const noComparison: CommonError = { misconception: "sci.comparison.no-comparative-language", pattern: { kind: "text", regex: "^[^0-9]*$" }, feedback: "Compare the two flasks.", marksTypicallyEarned: 1 } as CommonError;
    expect(markAnswer("it got warm", spec, { marks: 2, commonErrors: [noComparison], prompt: "Flask B rose by 0.3 °C.\nExplain why the results show that respiration is exothermic." }).marksAwarded).toBe(0);
  });
  test("a real verification by substitution still earns its 2 of 3 (fm2 inclined-plane .0016(a) 'W1 a = 2.5 dep MW2')", () => {
    const spec = show([["120 sin 30", "weight component along the slope"], ["60 - 30", "60 minus 30"], ["a = 2.5", "= 2.5"]], ["The weight component along the slope is 120 sin 30 = 60 N, so 60 - 30 = 12a and a = 2.5 m/s²."]);
    const verify: CommonError = { misconception: "fm.show-that.verify-by-substitution", pattern: { kind: "text", regex: String.raw`\bsub(?:stitut\w*|bing)\b[^.;\n]{0,40}\b2\.5\b` }, feedback: "Verification, not a derivation.", marksTypicallyEarned: 2 } as CommonError;
    const prompt = "Show that its acceleration is 2.5 m/s².";
    // The live scheme: W1 a = 2.5 dep MW2, so the bare target's group depends on the equation's.
    const scheme = [
      { id: "mw1", code: "MW", marks: 1, for: "$120\\sin 30° = 60$" },
      { id: "mw2", code: "MW", marks: 1, for: "$60 - 30 = 12a$" },
      { id: "w1", code: "W", marks: 1, for: "$a = 2.5$", dependsOn: ["mw2"] },
    ];
    expect(markAnswer("Substituting a = 2.5: 12 × 2.5 = 30, so both sides agree", spec, { marks: 3, commonErrors: [verify], prompt, scheme }).marksAwarded).toBe(2);
    expect(markAnswer("a = 2.5", spec, { marks: 3, commonErrors: [verify], prompt, scheme }).marksAwarded).toBe(0);
  });
});

// Build-9 gate, class 5 (the lead's ruling of 29 Sep 2026): the ladder decides and there is no fixed floor. A no-step
// equivalent (the question reordered, the answer scaled top and bottom, a division written as a negative power) earns
// 0 on a form task; a real step still earns its scheme line.
describe("no floor: the ladder alone decides on a form task (build-9 gate, class 5)", () => {
  const simplify: AnswerSpec = { kind: "algebraic", latex: String.raw`\frac{2x+7}{4(x-2)}`, equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" };
  const scheme = [
    { id: "mw1", code: "MW", marks: 1, for: "numerator factorised: (2x + 7)(x + 2)" },
    { id: "mw2", code: "MW", marks: 1, for: "denominator factorised fully: 4(x + 2)(x - 2)" },
    { id: "mw3", code: "MW", marks: 1, for: "(x + 2) cancelled" },
    { id: "w1", code: "W", marks: 1, for: "answer (2x + 7) over 4(x - 2), with the 4 kept and nothing cancelled out of 2x + 7" },
  ];
  const prompt = "Simplify fully\n" + String.raw`$\dfrac{2x^{2}+11x+14}{4x^{2}-16}$`;
  test("fm1 algebraic-fractions-simplify .0011 'MW1 numerator factorised': the question reordered earns 0 of 4", () => {
    expect(markAnswer("(14 + 11x + 2x²)/(4x² − 16)", simplify, { marks: 4, prompt, scheme })).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(markAnswer("(2x+7)(x+2)/(4(x+2)(x-2))", simplify, { marks: 4, prompt, scheme }).marksAwarded).toBe(2);
    expect(markAnswer("(2x+7)/(4(x-2))", simplify, { marks: 4, prompt, scheme })).toMatchObject({ correct: true, marksAwarded: 4 });
  });
  test("fm1 expand-three-brackets .0002 'MW1 two brackets expanded correctly': the brackets reordered earn 0 of 3", () => {
    const expand: AnswerSpec = { kind: "algebraic", latex: "x^{3}-x^{2}-14x+24", equivalence: "equivalent", variables: ["x"], mustBeExpanded: true };
    const s = [
      { id: "mw1", code: "MW", marks: 1, for: "two brackets expanded correctly, e.g. x² + 2x - 8" },
      { id: "mw2", code: "MW", marks: 1, for: "that quadratic multiplied by the remaining bracket, giving the six products x³ + 2x² - 8x and -3x² - 6x + 24" },
      { id: "mw3", code: "MW", marks: 1, for: "like terms collected: x³ - x² - 14x + 24" },
    ];
    const p = "Expand and simplify the expression\n$(x-2)(x+4)(x-3)$";
    const ws = "$(x-2)(x+4) = x^{2}+2x-8$, so the expression is $(x^{2}+2x-8)(x-3)$.\nMultiplying every term by $x$ gives $x^{3}+2x^{2}-8x$ and multiplying every term by $-3$ gives $-3x^{2}-6x+24$.\nCollecting like terms: $x^{3}-x^{2}-14x+24$.";
    expect(markAnswer("(x−3)(x+4)(x−2)", expand, { marks: 3, prompt: p, scheme: s, workedSolution: ws }).marksAwarded).toBe(0);
    expect(markAnswer("(x^2+2x-8)(x-3)", expand, { marks: 3, prompt: p, scheme: s, workedSolution: ws }).marksAwarded).toBe(1);
  });
  test("fm1 completing-the-square .0001 'M1 the bracket (x + 3)²' and laws-of-logarithms .0001 'MW1 the product law used': a reordered question earns 0", () => {
    const square: AnswerSpec = { kind: "algebraic", latex: "(x + 3)^{2} + 2", equivalence: "equivalent", variables: ["x"], form: "completed-square" };
    const sq = [{ id: "m1", code: "M", marks: 1, for: String.raw`the bracket $\left(x + 3\right)^{2}$, from halving the coefficient of $x$` }, { id: "w1", code: "W", marks: 1, for: "the constant $2$, so the answer reads $(x + 3)^{2} + 2$" }];
    expect(markAnswer("11 + 6x + x²", square, { marks: 2, prompt: "Express $x^{2} + 6x + 11$ as $(x + a)^{2} + b$, for constants $a$ and $b$.", scheme: sq }).marksAwarded).toBe(0);
    const log: AnswerSpec = { kind: "algebraic", latex: String.raw`\log(ab)`, equivalence: "equivalent", variables: ["a", "b"], form: "single-log" };
    const lg = [{ id: "mw1", code: "MW", marks: 1, for: "the product law used" }, { id: "w1", code: "W", marks: 1, for: String.raw`$\log(ab)$` }];
    expect(markAnswer("log b + log a", log, { marks: 2, prompt: String.raw`Express $\log a + \log b$ as a single logarithm.`, scheme: lg }).marksAwarded).toBe(0);
  });
  test("fm3 pascals-triangle .0003 'MW1 the coefficients 1, 7, 21, 35': 'in expanded form' is the task, so the question reordered or split earns 0 of 2", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: "p^{7} + 7p^{6}q + 21p^{5}q^{2} + 35p^{4}q^{3} + 35p^{3}q^{4} + 21p^{2}q^{5} + 7pq^{6} + q^{7}", equivalence: "equivalent", variables: ["p", "q"], form: "expanded" };
    const s = [{ id: "mw1", code: "MW", marks: 1, for: "the coefficients 1, 7, 21, 35, then the same four in reverse" }, { id: "mw2", code: "MW", marks: 1, for: "the powers of p falling from 7 and of q rising to 7, each pair adding to 7" }];
    const p = "Use Pascal's triangle to write down $(p + q)^{7}$ in expanded form.";
    expect(isFormTask(p, spec)).toBe(true);
    for (const typed of ["(q + p)^7", "(p + q)^3 (p + q)^4"]) expect(markAnswer(typed, spec, { marks: 2, prompt: p, scheme: s }).marksAwarded, typed).toBe(0);
    expect(markAnswer("p^7 + 7p^6q + 21p^5q^2 + 35p^4q^3 + 35p^3q^4 + 21p^2q^5 + 7pq^6 + q^7", spec, { marks: 2, prompt: p, scheme: s })).toMatchObject({ correct: true, marksAwarded: 2 });
  });
  test("fm1 algebraic-fractions-simplify .0003 'MW1 both lines factorised': the question with its division as a negative power earns 0", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: String.raw`\frac{x+2}{x-2}`, equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" };
    const s = [{ id: "mw1", code: "MW", marks: 1, for: "both lines factorised: (x + 5)(x + 2) over (x + 5)(x - 2)" }, { id: "mw2", code: "MW", marks: 1, for: "(x + 5) cancelled and the answer left as (x + 2) over (x - 2)" }];
    const p = "Simplify fully\n" + String.raw`$\dfrac{x^{2}+7x+10}{x^{2}+3x-10}$`;
    expect(markAnswer("(x^2+7x+10)(x^2+3x-10)^-1", spec, { marks: 2, prompt: p, scheme: s })).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(markAnswer("(x+5)(x+2)/((x+5)(x-2))", spec, { marks: 2, prompt: p, scheme: s }).marksAwarded).toBe(1);
  });
});

// Build-9 gate, class 5, the twin path: WorkedExampleAsQuestion marked the twin with no scheme, so a factorised but
// uncancelled twin answer lived on the floor. The example's steps give the twin its ladder: a step that factorises the
// example's numerator or denominator asks the twin for the same, checked on the twin's own fraction.
describe("the twin's ladder from the example's steps (build-9 gate, class 5)", () => {
  const we = {
    stem: "Simplify fully\n" + String.raw`$\dfrac{2x^{2}+10x}{4x^{2}-100}$`,
    steps: [
      { n: 1, earns: ["MW1"], working: "$2x^{2}+10x = 2x(x+5)$" },
      { n: 2, earns: ["MW1"], working: "$4x^{2}-100 = 4(x+5)(x-5)$" },
      { n: 3, earns: ["MW1"], working: String.raw`$\frac{2x(x+5)}{4(x+5)(x-5)} = \frac{x}{2(x-5)}$` },
    ],
    twin: { stem: "Simplify fully " + String.raw`$\frac{3x^{2}-3x}{6x^{2}-6}$`, answer: { kind: "algebraic", latex: String.raw`\frac{x}{2(x+1)}`, equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" } as AnswerSpec },
  };
  test("fm1 we.01 twin: 'MW1 numerator factorised, MW1 denominator factorised, MW1 cancelled' from the example's steps", () => {
    const scheme = twinScheme(we);
    expect(scheme.map((p) => `${p.code}${p.marks}`)).toEqual(["MW1", "MW1", "MW1"]);
    const opts = { marks: 3, prompt: we.twin.stem, scheme };
    expect(markAnswer("x/(2(x+1))", we.twin.answer, opts)).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(markAnswer("x/(2x+2)", we.twin.answer, opts)).toMatchObject({ correct: true, marksAwarded: 3 });
    // Both lines factorised, nothing cancelled: the two factorising marks (FM1 2021 Q8(i): one MW1 for each factorised expression).
    expect(markAnswer("3x(x-1)/(6(x+1)(x-1))", we.twin.answer, opts)).toMatchObject({ correct: false, marksAwarded: 2 });
    // The question typed back, or reordered, shows no step.
    expect(markAnswer("(3x^2-3x)/(6x^2-6)", we.twin.answer, opts).marksAwarded).toBe(0);
    expect(markAnswer("(-3x + 3x^2)/(6x^2-6)", we.twin.answer, opts).marksAwarded).toBe(0);
    expect(markAnswer("x/(2(x-1))", we.twin.answer, opts).marksAwarded).toBe(0);
  });
});

// The verifier's floor sweep (29 Sep 2026): a factorising point is met only by a factorised line. "2(x² + x − 6)" over
// the question's denominator has only the 2 taken out, and is equal to "2(x + 3)(x − 2)" without being it.
describe("a factorising point needs a factorised line (build-9 gate, class 5)", () => {
  test("fm1 algebraic-fractions-simplify .0009 'MW1 numerator factorised: 2(x + 3)(x − 2)': only the 2 taken out earns 0 of 4", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: String.raw`\frac{2(x-2)}{x+3}`, equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" };
    const scheme = [
      { id: "mw1", code: "MW", marks: 1, for: "numerator factorised: 2(x + 3)(x - 2)" },
      { id: "mw2", code: "MW", marks: 1, for: "denominator factorised: (x + 3)²" },
      { id: "mw3", code: "MW", marks: 1, for: "(x + 3) cancelled" },
      { id: "w1", code: "W", marks: 1, for: "answer fully simplified to 2(x - 2) over (x + 3), with no common factor left" },
    ];
    const ws = "Factorising the numerator gives $2(x+3)(x-2)$ and the denominator gives $(x+3)^{2}$.\nSo $\frac{2x^{2}+2x-12}{x^{2}+6x+9}$ becomes $\frac{2(x+3)(x-2)}{(x+3)^{2}}$.\nCancelling $(x+3)$ leaves $\frac{2(x-2)}{x+3}$.";
    const prompt = "Simplify fully\n" + String.raw`$\dfrac{2x^{2}+2x-12}{x^{2}+6x+9}$`;
    expect(markAnswer("2(x^2 + x - 6)/(x^2 + 6x + 9)", spec, { marks: 4, prompt, scheme, workedSolution: ws }).marksAwarded).toBe(0);
    expect(markAnswer("(2x^2+2x-12)/(x+3)^2", spec, { marks: 4, prompt, scheme, workedSolution: ws }).marksAwarded).toBe(1);
    expect(markAnswer("2(x+3)(x-2)/(x+3)^2", spec, { marks: 4, prompt, scheme, workedSolution: ws }).marksAwarded).toBe(2);
  });
});

// A "show that" part is the command, not a sentence about what results show (build-9 gate, class 2).
describe("isShowThat reads the command", () => {
  test.each(["Show that $AC = 13$ cm.", "(b) Show that the line touches the curve.", "Use the sine rule to show that angle ABC = 87°.", "Hence show that $x = 4$.", "Find the area.\nShow that it is 91 m²."])("%s is a show-that", (stem) => {
    expect(isShowThat(stem)).toBe(true);
  });
  test.each(["Flask B rose by 0.3 °C.\nExplain why the results show that respiration is exothermic.", "The data show that the rate doubles. Explain why.", "Calculate the mean."])("%s is not", (stem) => {
    expect(isShowThat(stem)).toBe(false);
  });
});

// The corpus guard (29 Sep 2026): once the final accuracy point joined the ladder, "2(4x² − 1)" for "Factorise fully
// 8x² − 2" was paid the answer point too, by equivalence, one copy of the line per point. The answer point is the
// answer as written: the common factor alone keeps the common-factor mark.
describe("the answer point is met as written on a form task (build-9 gate, class 5)", () => {
  test("m3 difference-of-two-squares .0011(a) 'A2 2(2x + 1)(2x − 1) dep A1': '2(4x² − 1)' earns 1 of 3", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: "2(2x+1)(2x-1)", equivalence: "equivalent", variables: ["x"], mustBeFactorised: true };
    const scheme = [
      { id: "ma1", code: "MA", marks: 1, for: "2(4x² − 1)" },
      { id: "a1", code: "A", marks: 1, for: "4x² recognised as (2x)² and 1 as 1²", dependsOn: ["ma1"] },
      { id: "a2", code: "A", marks: 1, for: "2(2x + 1)(2x − 1)", dependsOn: ["a1"] },
    ];
    const ws = String.raw`$8x^2 - 2 = 2(4x^2 - 1) = 2\big((2x)^2 - 1^2\big) = 2(2x + 1)(2x - 1)$.`;
    expect(markAnswer("2(4x^2-1)", spec, { marks: 3, prompt: "Factorise **fully** $8x^2 - 2$.", scheme, workedSolution: ws }).marksAwarded).toBe(1);
    const two = [{ id: "ma1", code: "MA", marks: 1, for: "2(4x² − 1)" }, { id: "a2", code: "A", marks: 1, for: "2(2x + 1)(2x − 1)", dependsOn: ["ma1"] }];
    expect(markAnswer("2(4x^2-1)", spec, { marks: 2, prompt: "Factorise **fully** $8x^2 - 2$.", scheme: two, workedSolution: ws }).marksAwarded).toBe(1);
    expect(markAnswer("2(2x+1)(2x-1)", spec, { marks: 3, prompt: "Factorise **fully** $8x^2 - 2$.", scheme, workedSolution: ws })).toMatchObject({ correct: true, marksAwarded: 3 });
  });
});

// The FM3 author (7 Oct 2026): a value written with a statistics label scored 0 as "could not be read". The FM3 schemes
// print these labels (2022 Q3, 2024 Q1) and students write them: a label before "=" is stripped like any other label
// ("AC = 13", "θ = 31.89"), with Σ, x̄, σ and s read as labels, and a squared sum (Σfx²) as one.
describe("a statistics label before = is a label (FM3 2022 Q3, 2024 Q1)", () => {
  const spec = (value: number): AnswerSpec => ({ kind: "numeric", value, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] });
  test.each([
    ["Σfx² = 10675", 10675],
    ["Σfx^2 = 10675", 10675],
    ["Σfx = 668", 668],
    ["Σfx = 266", 266],
    ["Σf = 20", 20],
    ["x̄ = 31.7", 31.7],
    ["σ = 4.2", 4.2],
    ["s = 4.2", 4.2],
    ["\\sum fx = 668", 668],
    ["\\sum fx^{2} = 10675", 10675],
    ["\\bar{x} = 31.7", 31.7],
  ])("%s is the value %s", (raw, value) => {
    const r = markAnswer(raw, spec(value), { marks: 1 });
    expect(r.correct, r.explanation).toBe(true);
  });
  test("the label does not make a wrong value right", () => {
    expect(markAnswer("Σfx² = 10765", spec(10675), { marks: 1 }).correct).toBe(false);
    expect(markAnswer("x̄ = 31.9", spec(31.7), { marks: 1 }).correct).toBe(false);
  });
});

// The B2 E author (7 Oct 2026): right values refused as unreadable around a label, a unit or a rate.
describe("a value with a rate, a number word after a label, a bracketed unit or a glued unit is read", () => {
  const n = (value: number, unit?: string): AnswerSpec => ({ kind: "numeric", value, tolerance: { type: "absolute", value: 0 }, ...(unit ? { unit } : {}), unitRequired: false, acceptForms: ["decimal"] });
  test("b2-antibiotics .0007(a) 'how many patients per 10 000': '34 per 10 000' is 34", () => {
    for (const raw of ["34 per 10 000", "34 per 10000", "34 per 10 000 patients"]) expect(markAnswer(raw, n(34), { marks: 1 }).correct, raw).toBe(true);
    expect(markAnswer("35 per 10 000", n(34), { marks: 1 }).correct).toBe(false);
  });
  test("antibiotics we02 twin 'the nearest whole week': 'week ten' and '10 (weeks)' are 10", () => {
    const spec: AnswerSpec = { kind: "numeric", value: 10, tolerance: { type: "absolute", value: 0.5 }, unitRequired: false, acceptForms: ["decimal"] };
    for (const raw of ["week ten", "10 (weeks)", "week 10", "ten"]) expect(markAnswer(raw, spec, { marks: 5 }).correct, raw).toBe(true);
    expect(markAnswer("week nine", spec, { marks: 5 }).correct).toBe(false);
  });
  test("b2-non-communicable .0005(a) and we01 twin: a unit glued to the number is the unit", () => {
    expect(markAnswer("10units", n(10, "units"), { marks: 1 }).correct).toBe(true);
    expect(markAnswer("7units", n(7, "units"), { marks: 3 }).correct).toBe(true);
    expect(markAnswer("8units", n(7, "units"), { marks: 3 }).correct).toBe(false);
  });
});

// The B2 E author (7 Oct 2026): "correct to the nearest whole number" was not read as an accuracy demand, so an unrounded
// right value scored 0 where only the accuracy mark is lost (b2-heart-attacks .0007(a) "4856.3" against 4856, 3 marks).
describe("the nearest whole number is an accuracy instruction: an unrounded right value loses the accuracy mark only", () => {
  const spec: AnswerSpec = { kind: "numeric", value: 4856, tolerance: { type: "absolute", value: 0 }, unitRequired: false, acceptForms: ["decimal"] };
  const prompt = "The table shows a trial of two combinations of drugs. Calculate how many people in group 2 reached the target, correct to the nearest whole number.";
  test("on a science paper 4856.3 earns 2 of 3 (places as written); 4856 earns 3; 4857 earns 0", () => {
    const r = markAnswer("4856.3", spec, { marks: 3, prompt, subject: "science" });
    expect(r.correct).toBe(false);
    expect(r.marksAwarded).toBe(2);
    expect(markAnswer("4856", spec, { marks: 3, prompt, subject: "science" }).marksAwarded).toBe(3);
    expect(markAnswer("4857", spec, { marks: 3, prompt, subject: "science" }).marksAwarded).toBe(0);
  });
  test("on a maths paper more places than asked are right when they round to the answer (the lead's ruling, 27 Sep 2026)", () => {
    expect(markAnswer("4856.3", spec, { marks: 3, prompt }).marksAwarded).toBe(3);
    expect(markAnswer("4857", spec, { marks: 3, prompt }).marksAwarded).toBe(0);
    // The boundary value, half a unit off, is the engine's accuracy-only case as for any d.p. demand.
    expect(markAnswer("4856.5", spec, { marks: 3, prompt }).marksAwarded).toBe(2);
  });
  test("without the instruction an unrounded value is simply wrong against an exact tolerance", () => {
    expect(markAnswer("4856.3", spec, { marks: 3, prompt: "Calculate how many people in group 2 reached the target." }).marksAwarded).toBe(0);
  });
});

// The P2 author (7 Oct 2026): a follow-through relation that is the identity "x" paid nothing, because the relation
// "(9)" has no operator and the arithmetic reader returned null. A bare value, with or without brackets, is an expression.
describe("follow-through with the identity relation x (p2-calculating-resistance .0014(b)(ii))", () => {
  const ohms: AnswerSpec = { kind: "numeric", value: 4, tolerance: { type: "absolute", value: 0.05 }, unit: "Ω", unitRequired: false, acceptForms: ["decimal"] };
  const ft = { earlierRaw: "9", earlierSpec: ohms, relation: "x" };
  test("her (a) = 9 carries to (b)(ii): 9 and 9 Ω earn the mark", () => {
    expect(followThroughValue(ft, ohms)).toBe(9);
    expect(markAnswer("9", ohms, { marks: 1, followThrough: ft, subject: "science" }).marksAwarded).toBe(1);
    expect(markAnswer("9 Ω", ohms, { marks: 1, followThrough: ft, subject: "science" }).marksAwarded).toBe(1);
    expect(markAnswer("4", ohms, { marks: 1, followThrough: ft, subject: "science" }).marksAwarded).toBe(1);
    expect(markAnswer("7", ohms, { marks: 1, followThrough: ft, subject: "science" }).marksAwarded).toBe(0);
  });
  test("a relation with an operator still computes", () => {
    expect(followThroughValue({ ...ft, relation: "x / 2" }, ohms)).toBe(4.5);
    expect(followThroughValue({ ...ft, relation: "(x)" }, ohms)).toBe(9);
  });
});

// Build-9 gate (the FM1 group 1 author, 7 Oct 2026): fm1 quadratic-inequalities .0002 paid "x < -3 and x > 5" 3/3. The
// solution set is x < −3 or x > 5; "and" for two disjoint outside regions is the slip the 2025 FM1 report names (no x
// satisfies both). A solution set written as two inequalities is read as a set: "or", a comma or two lines join outside
// regions; "and" (or a chained inequality) is an intersection; an empty intersection written for a two-region answer is
// wrong and earns only the method marks its working shows; the union written for an inside region is wrong too.
describe("a solution set written as two inequalities is read as a set (build-9 gate, the connectives)", () => {
  const outside: AnswerSpec = { kind: "text", accepted: ["x < -3 or x > 5", "x > 5 or x < -3"], keyWords: [{ any: ["x < -3", "-3 > x"], marks: 1 }, { any: ["x > 5", "5 < x"], marks: 1 }], listingRule: false };
  const prompt = "Solve the inequality x^2 - 2x - 15 > 0.";
  test("outside regions: or, a comma and two lines earn; and earns nothing", () => {
    for (const right of ["x < -3 or x > 5", "x > 5 or x < -3", "x < -3, x > 5", "x < -3\nx > 5", "x < -3 ; x > 5"]) expect(markAnswer(right, outside, { marks: 3, prompt }).marksAwarded, right).toBe(3);
    for (const wrong of ["x < -3 and x > 5", "x > 5 and x < -3", "x < -3 & x > 5"]) {
      const r = markAnswer(wrong, outside, { marks: 3, prompt });
      expect(r.correct, wrong).toBe(false);
      expect(r.marksAwarded, wrong).toBe(0);
    }
  });
  const inside: AnswerSpec = { kind: "text", accepted: ["-3 < x < 5", "x > -3 and x < 5"], keyWords: [{ any: ["x > -3", "-3 < x"], marks: 1 }, { any: ["x < 5", "5 > x"], marks: 1 }], listingRule: false };
  test("an inside region: and or a chain earns; or (the whole line) earns nothing", () => {
    for (const right of ["-3 < x < 5", "x > -3 and x < 5", "x < 5 and x > -3"]) expect(markAnswer(right, inside, { marks: 2, prompt: "Solve x^2 - 2x - 15 < 0." }).marksAwarded, right).toBe(2);
    const r = markAnswer("x > -3 or x < 5", inside, { marks: 2, prompt: "Solve x^2 - 2x - 15 < 0." });
    expect(r.correct).toBe(false);
    expect(r.marksAwarded).toBe(0);
  });
});

// Mutation survivors pinned (7 Oct 2026): the verification exception's two edges.
describe("the verification exception pays only on a show-that, and never the last mark", () => {
  const spec: AnswerSpec = { kind: "text", accepted: ["The weight component along the slope is 120 sin 30 = 60 N, so 60 - 30 = 12a and a = 2.5 m/s²."], keyWords: [{ any: ["120 sin 30", "120sin30", "weight component along the slope"], marks: 1 }, { any: ["60 - 30", "60 minus 30"], marks: 1 }, { any: ["a = 2.5", "= 2.5", "2.5 m/s"], marks: 1 }], listingRule: false };
  const verify = (marksTypicallyEarned: number): CommonError => ({ misconception: "fm.show-that.verify-by-substitution", pattern: { kind: "text", regex: "substitut" }, feedback: "Putting the printed 2.5 into the equation is verification, not a derivation.", marksTypicallyEarned });
  const typed = "Substituting a = 2.5: 60 - 30 = 30 and 12 × 2.5 = 30, so both sides agree";
  // A substitution written without the scheme's own lines: the key words pay nothing, so the exception alone pays.
  const bare = "Substituting the printed value into the equation, both sides come to 30, so it checks";
  test("H2 the same error on a part that is not a show-that pays the key-word award only", () => {
    expect(markAnswer(bare, spec, { marks: 3, commonErrors: [verify(2)], prompt: "A sledge of mass 12 kg is released on a rough slope. Show that its acceleration is 2.5 m/s²." }).marksAwarded).toBe(2);
    expect(markAnswer(bare, spec, { marks: 3, commonErrors: [verify(2)], prompt: "A sledge of mass 12 kg is released on a rough slope. Find its acceleration." }).marksAwarded).toBe(0);
    expect(markAnswer(typed, spec, { marks: 3, commonErrors: [verify(2)], prompt: "A sledge of mass 12 kg is released on a rough slope. Find its acceleration." }).marksAwarded).toBe(2);
  });
  test("H4 an error authored at full marks is still capped at marks - 1 on the show-that", () => {
    expect(markAnswer(typed, spec, { marks: 3, commonErrors: [verify(3)], prompt: "Show that its acceleration is 2.5 m/s²." }).marksAwarded).toBe(2);
  });
});

// The M4 author (8 Oct 2026): a coefficient typed a/bx was read as a/(bx), so "y = -1/2x + 1" scored 0 on m4
// perpendicular-lines .0008/.0009/.0011/.0014/.0015/.0022 while "2x/3", "(2/3)x" and "0.5x" passed. Students write 1/2x
// for half x and the schemes print it so ("rearranged to y = −3/2x + 4"); students also write 1/2x for 1/(2x). Both
// readings are tried and the answer is right when either reading is the expected answer: the two readings differ, so a
// wrong answer is never paid by the other reading.
describe("a/bx is read both as (a/b)x and as a/(bx), and is right when either reading is the answer", () => {
  const line = (latex: string): AnswerSpec => ({ kind: "algebraic", latex, equivalence: "equivalent", variables: ["x", "y"] });
  const expr = (latex: string): AnswerSpec => ({ kind: "algebraic", latex, equivalence: "equivalent", variables: ["x"] });
  test("the coefficient reading", () => {
    expect(markAnswer("y = 2/3x - 2", line("y = \\frac{2}{3}x - 2"), { marks: 4 }).correct).toBe(true);
    expect(markAnswer("y = -1/2x + 1", line("y = -\\frac{1}{2}x + 1"), { marks: 4 }).correct).toBe(true);
    expect(markAnswer("y = -3/2x + 4", line("y = -\\frac{3}{2}x + 4"), { marks: 1 }).correct).toBe(true);
    expect(markAnswer("1/2x", expr("\\frac{1}{2}x"), { marks: 1 }).correct).toBe(true);
    expect(markAnswer("3/4x^2", expr("\\frac{3}{4}x^2"), { marks: 1 }).correct).toBe(true);
  });
  test("the reciprocal reading", () => {
    expect(markAnswer("1/2x", expr("\\frac{1}{2x}"), { marks: 1 }).correct).toBe(true);
    expect(markAnswer("1/(2x)", expr("\\frac{1}{2x}"), { marks: 1 }).correct).toBe(true);
    expect(markAnswer("3/2x", expr("\\frac{3}{2x}"), { marks: 1 }).correct).toBe(true);
  });
  test("a wrong answer is still wrong under both readings", () => {
    expect(markAnswer("y = 2/3x - 3", line("y = \\frac{2}{3}x - 2"), { marks: 4 }).marksAwarded).toBe(0);
    expect(markAnswer("1/3x", expr("\\frac{1}{2x}"), { marks: 1 }).correct).toBe(false);
    expect(markAnswer("1/3x", expr("\\frac{1}{2}x"), { marks: 1 }).correct).toBe(false);
  });
});

// The M4 author (8 Oct 2026), a right partial answer refused: m4 perpendicular-lines .0021 "p = 7" scored 0/6 where the
// scheme pays A2 for that root. One right root of a solution set earns the scheme's accuracy point that names it (or one
// mark a root where the scheme names none), never the last mark; a wrong root beside a right one still earns nothing.
describe("one right root of a solution set earns its accuracy mark (build-9 gate)", () => {
  const spec: AnswerSpec = { kind: "algebraic", latex: "p=0, p=7", equivalence: "equivalent", variables: ["p"] };
  const scheme: MarkPoint[] = [
    { id: "MA1", code: "MA", marks: 1, for: "gradient 5/(2 − p)" },
    { id: "MA2", code: "MA", marks: 1, for: "gradient −2/(5 − p)" },
    { id: "MA3", code: "MA", marks: 1, for: "their product set equal to −1" },
    { id: "MA4", code: "MA", marks: 1, for: "(2 − p)(5 − p) = 10, leading to p² − 7p = 0" },
    { id: "A1", code: "A", marks: 1, for: "p = 0" },
    { id: "A2", code: "A", marks: 1, for: "p = 7" },
  ];
  // The M4 author's ruling (8 Oct 2026): one right root earns what the scheme gives for that root, the method before the
  // roots implied; only the missing root's accuracy point is lost: 5 of 6 here (the lead: "where the scheme gives 5").
  test("p = 7 alone earns 5 of 6 (A1 for p = 0 lost); 7 alone the same; both roots earn 6", () => {
    for (const raw of ["p = 7", "7", "p = 0"]) {
      const r = markAnswer(raw, spec, { marks: 6, scheme });
      expect(r.correct, raw).toBe(false);
      expect(r.marksAwarded, raw).toBe(5);
    }
    expect(markAnswer("p = 0, p = 7", spec, { marks: 6, scheme }).marksAwarded).toBe(6);
    expect(markAnswer("p = 0 or p = 7", spec, { marks: 6, scheme }).marksAwarded).toBe(6);
  });
  test("a wrong root beside a right one earns nothing; without a scheme a root earns one mark, never the last", () => {
    expect(markAnswer("p = 7, p = 3", spec, { marks: 6, scheme }).marksAwarded).toBe(0);
    const two: AnswerSpec = { kind: "algebraic", latex: "x = 2, x = -3", equivalence: "equivalent", variables: ["x"] };
    expect(markAnswer("x = 2", two, { marks: 2 }).marksAwarded).toBe(1);
    expect(markAnswer("x = 2", two, { marks: 1 }).marksAwarded).toBe(0);
  });
});

// Build-9 gate, class H, the lead's ruling of 8 Oct 2026 (the M8 author): on a show-that part a matched common error
// whose answer shows a line of working pays what its own scheme line gives (the M1 for a correct substitution with a
// slip after it: the author's marksTypicallyEarned), never 0 and never the show-that value itself. A bare value or a
// sentence with no working ("x = 2", "multiply the whole equation by 10") still names a wrong method and pays nothing;
// off a show-that part a text common error never raises the award (rule I).
describe("a slip in a line of working on a show-that pays its scheme line, a bare value pays nothing (build-9 gate, class H)", () => {
  const simeq: AnswerSpec = {
    kind: "text",
    accepted: ["x^2 + (x + 5)^2 = 53, so 2x^2 + 10x - 28 = 0 and x^2 + 5x - 14 = 0"],
    keyWords: [{ any: ["x^2 + (x + 5)^2 = 53"], marks: 1 }, { any: ["2x^2 + 10x - 28 = 0", "x^2 + x^2 + 10x + 25 = 53"], marks: 1 }],
    listingRule: false,
  };
  const expand: CommonError = { misconception: "maths.algebra.expand-squared-bracket", pattern: { kind: "text", regex: "x\\s*\\^\\s*2\\s*\\+\\s*x\\s*\\^\\s*2\\s*\\+\\s*25\\s*=\\s*53" }, feedback: "(x + 5)^2 has lost its middle term.", marksTypicallyEarned: 1 };
  const showThat = "The line y = x + 5 meets the circle x^2 + y^2 = 53. Show that the x-coordinates of the points where they meet satisfy x^2 + 5x - 14 = 0.";
  test("m8 simultaneous .0020 'x^2 + x^2 + 25 = 53': the substitution with the middle term lost earns the M1 its error values", () => {
    const r = markAnswer("x^2 + x^2 + 25 = 53", simeq, { marks: 2, commonErrors: [expand], prompt: showThat });
    expect(r.correct).toBe(false);
    expect(r.marksAwarded).toBe(1);
    expect(r.tags).toContain("maths.algebra.expand-squared-bracket");
  });
  test("the same slip off a show-that part pays nothing (rule I), and a slip valued at full marks is capped at marks - 1", () => {
    expect(markAnswer("x^2 + x^2 + 25 = 53", simeq, { marks: 2, commonErrors: [expand], prompt: "Find the x-coordinates of the points where the line meets the circle." }).marksAwarded).toBe(0);
    expect(markAnswer("x^2 + x^2 + 25 = 53", simeq, { marks: 2, commonErrors: [{ ...expand, marksTypicallyEarned: 2 }], prompt: showThat }).marksAwarded).toBe(1);
  });
  const pyth: AnswerSpec = {
    kind: "text",
    accepted: ["AM² = 12² + 12² = 288, VM² = 22² − 288 = 484 − 288 = 196, VM = √196 = 14"],
    keyWords: [{ any: ["288", "12² + 12²", "144 + 144"], marks: 1 }, { any: ["484 − 288", "484 - 288", "22² − 288"], marks: 1 }, { any: ["√196", "VM = 14"], marks: 1 }],
    listingRule: false,
  };
  const halfBase: CommonError = { misconception: "maths.trig3d.half-base-vs-half-diagonal", pattern: { kind: "text", regex: "484\\s*[-−]\\s*144|\\b340\\b" }, feedback: "Half an edge was used as the run.", marksTypicallyEarned: 1 };
  const noWorking: CommonError = { misconception: "maths.presentation.answer-without-working", pattern: { kind: "text", regex: "^\\s*(VM\\s*=\\s*)?14(\\s*cm)?\\s*$" }, feedback: "The printed value alone shows nothing.", marksTypicallyEarned: 0 };
  test("m8 pythagoras-3d .0023(a) '484 - 144 = 340' earns the Pythagoras line's M1; '14' alone earns nothing", () => {
    const prompt = "VABCD is a pyramid with a square base of side 24 cm and slant edges of 22 cm. Show that the vertical height VM is 14 cm.";
    expect(markAnswer("484 - 144 = 340", pyth, { marks: 3, commonErrors: [noWorking, halfBase], prompt }).marksAwarded).toBe(1);
    expect(markAnswer("14", pyth, { marks: 3, commonErrors: [noWorking, halfBase], prompt }).marksAwarded).toBe(0);
  });
  const discriminant: AnswerSpec = { kind: "text", accepted: ["x^2 + 4 = 0 has no real solutions because the discriminant is -16"], keyWords: [{ any: ["x^2 + 4 = 0", "x^2 = -4"], marks: 1 }, { any: ["no real", "discriminant", "negative"], marks: 1 }], listingRule: false };
  const solveInstead: CommonError = { misconception: "maths.quadratics.show-that-solve-instead", pattern: { kind: "text", regex: "^\\s*x\\s*=\\s*2\\s*$" }, feedback: "x = 2 is a value, not the proof.", marksTypicallyEarned: 2 };
  test("m8 simultaneous .0017(a) 'x = 2' on a show-that: a bare value shows no working and pays nothing, whatever its error is valued at", () => {
    expect(markAnswer("x = 2", discriminant, { marks: 3, commonErrors: [solveInstead], prompt: "Show that the line y = 2x + 1 never meets the curve y = x^2 + 2x + 5." }).marksAwarded).toBe(0);
  });
});

// The C2 author (8 Oct 2026), right answers refused on equation parts.
describe("word and symbol equations: case never costs a mark in a word equation; fractional coefficients balance", () => {
  const word: AnswerSpec = { kind: "equation", kindOf: "word", balancedLatex: "propane + oxygen -> carbon dioxide + water", stateSymbolsRequired: false, acceptMultiples: false };
  test("EF-17 c2 combustion .0015(a): a capital letter in a word equation is the same equation", () => {
    for (const raw of ["propane + oxygen → carbon dioxide + water", "Propane + oxygen → carbon dioxide + water", "Propane + Oxygen → Carbon dioxide + Water"]) {
      expect(markAnswer(raw, word, { marks: 2 }).marksAwarded, raw).toBe(2);
    }
    expect(markAnswer("propane + oxygen → carbon monoxide + water", word, { marks: 2 }).correct).toBe(false);
  });
  const symbol: AnswerSpec = { kind: "equation", kindOf: "symbol", balancedLatex: "2CH4 + 3O2 -> 2CO + 4H2O", stateSymbolsRequired: false, acceptMultiples: true };
  test("EF-16 c2 combustion .0005: an equation balanced with a fractional coefficient is the same balanced equation (CCEA 2021 general instruction 7(a))", () => {
    for (const raw of ["CH4 + 3/2 O2 → CO + 2H2O", "CH4 + 3/2O2 → CO + 2H2O", "CH4 + 1.5O2 → CO + 2H2O", "2CH4 + 3O2 → 2CO + 4H2O"]) {
      expect(markAnswer(raw, symbol, { marks: 3 }).marksAwarded, raw).toBe(3);
    }
    expect(markAnswer("CH4 + 2O2 → CO + 2H2O", symbol, { marks: 3 }).correct).toBe(false);
  });
});

// Build-9 gate (the M8 author, 8 Oct 2026), wrong answers paid: a "Simplify" index answer left unfinished earned full
// marks, as the engine had no single-term form: m8 index-laws .0005 "27 × c^12" and "3^3 c^12" 2/2 against 27c^12 (the
// November 2024 M8 report: a times sign left in lost the mark); .0010(b) "4 × x^2y^2", "2x^3y^-1 × 2x^-1y^3"; .0008
// "x^(5/2) × x^(1/2)" and the root spelling "√(x^5) × x^(1/2)" against x^3. A simplify-indices task is a form task
// (ruling 4): the answer is one term, its number worked out, each letter once with one index, no operator between
// factors and no root sign; anything else earns the matching common error or the ladder only.
describe("a simplified index answer is one term (build-9 gate, the single-term form)", () => {
  const spec = (latex: string): AnswerSpec => ({ kind: "algebraic", latex, equivalence: "equivalent", variables: ["c", "x", "y"] });
  const simplify = "Simplify fully.";
  test("m8 index-laws .0005 against 27c^12: the finished term earns 2, an unfinished one earns nothing", () => {
    for (const right of ["27c^12", "27c^{12}", "27 c^12"]) expect(markAnswer(right, spec("27c^{12}"), { marks: 2, prompt: simplify }).marksAwarded, right).toBe(2);
    for (const wrong of ["27 × c^12", "3^3 c^12", "27 * c^12", "3^3 × c^12"]) {
      const r = markAnswer(wrong, spec("27c^{12}"), { marks: 2, prompt: simplify });
      expect(r.correct, wrong).toBe(false);
      expect(r.marksAwarded, wrong).toBe(0);
    }
  });
  test("m8 index-laws .0010(b) against 4x^2y^2 and .0008 against x^3", () => {
    expect(markAnswer("4x^2y^2", spec("4x^{2}y^{2}"), { marks: 2, prompt: simplify }).marksAwarded).toBe(2);
    for (const wrong of ["4 × x^2y^2", "2x^3y^-1 × 2x^-1y^3", "2x^3y^-1 × 2x^-1y^3 = 4x^2y^2"]) expect(markAnswer(wrong, spec("4x^{2}y^{2}"), { marks: 2, prompt: simplify }).correct, wrong).toBe(false);
    expect(markAnswer("x^3", spec("x^{3}"), { marks: 2, prompt: simplify }).marksAwarded).toBe(2);
    for (const wrong of ["x^(5/2) × x^(1/2)", "√(x^5) × x^(1/2)", "x^(5/2) x^(1/2)"]) expect(markAnswer(wrong, spec("x^{3}"), { marks: 2, prompt: simplify }).correct, wrong).toBe(false);
  });
  test("a fraction or a negative index is still one term; a sum answer is not judged by the single-term rule", () => {
    expect(markAnswer("x^3/y", spec("x^{3}y^{-1}"), { marks: 2, prompt: simplify }).marksAwarded).toBe(2);
    expect(markAnswer("x^3y^-1", spec("x^{3}y^{-1}"), { marks: 2, prompt: simplify }).marksAwarded).toBe(2);
    expect(markAnswer("x^2 + 2x", spec("x^{2} + 2x"), { marks: 2, prompt: simplify }).marksAwarded).toBe(2);
    expect(markAnswer("27 × c^12", spec("27c^{12}"), { marks: 2, prompt: "Write down the value of the expression." }).marksAwarded).toBe(2);
  });
});

// The FM2 reviewer (8 Oct 2026, E1), a right answer refused: a follow-through from a vector answer was never paid
// (followThroughValue returned null for a non-numeric earlier spec). fm2 ij-vector .0019(b)(c), .0030(c), resultant
// .0007(b)(c), .0009(b): the magnitude, the direction or a component of her own earlier vector follows through.
describe("follow-through from a vector earlier answer: magnitude, direction and components", () => {
  const vector: AnswerSpec = { kind: "algebraic", latex: "5i + 11j", equivalence: "equivalent", variables: ["i", "j"] };
  const magnitude: AnswerSpec = { kind: "numeric", value: 12.08, tolerance: { type: "absolute", value: 0.005 }, unit: "N", unitRequired: false, acceptForms: ["decimal", "fraction"] };
  const angle: AnswerSpec = { kind: "numeric", value: 65.56, tolerance: { type: "absolute", value: 0.005 }, unit: "°", unitRequired: false, acceptForms: ["decimal", "fraction"] };
  test("fm2 ij-vector .0019(b)(c): her (a) = 5i + 12j carries 13 N and 67.38°", () => {
    const ft = { earlierRaw: "5i + 12j", earlierSpec: vector };
    expect(followThroughValue(ft, magnitude)).toBeCloseTo(13, 6);
    expect(followThroughValue(ft, angle)).toBeCloseTo(67.38, 2);
    expect(markAnswer("13", magnitude, { marks: 2, followThrough: ft }).marksAwarded).toBe(2);
    expect(markAnswer("67.38", angle, { marks: 2, followThrough: ft }).marksAwarded).toBe(2);
    expect(markAnswer("12.08", magnitude, { marks: 2, followThrough: ft }).marksAwarded).toBe(2);
    expect(markAnswer("14", magnitude, { marks: 2, followThrough: ft }).marksAwarded).toBe(0);
  });
  test("a component follows through, and a non-vector earlier answer still gives nothing", () => {
    const component: AnswerSpec = { kind: "numeric", value: 11, tolerance: { type: "absolute", value: 0.005 }, unitRequired: false, acceptForms: ["decimal"] };
    expect(followThroughValue({ earlierRaw: "5i + 12j", earlierSpec: vector }, component)).toBe(12);
    expect(followThroughValue({ earlierRaw: "x + 2", earlierSpec: { kind: "algebraic", latex: "x + 1", equivalence: "equivalent", variables: ["x"] } }, component)).toBeNull();
  });
});

// The FM3 author (8 Oct 2026), right answers refused: "71.12°F" could not be read where "21.73°C" reads, and "2.94
// degrees Fahrenheit" lost a unit mark FM schemes do not award. The degree sign with F reads as with C, and a unit
// spelled out is the unit its symbol is.
describe("degrees Fahrenheit read like degrees Celsius, as a symbol or spelled out", () => {
  const f = (value: number): AnswerSpec => ({ kind: "numeric", value, tolerance: { type: "dp", places: 2 }, unit: "°F", unitRequired: false, acceptForms: ["decimal"] });
  test("71.12°F and 2.94 degrees Fahrenheit are the values with their unit", () => {
    for (const [raw, value] of [["71.12°F", 71.12], ["71.12 °F", 71.12], ["2.94°F", 2.94], ["2.94 degrees Fahrenheit", 2.94], ["2.94 degrees F", 2.94], ["71.12", 71.12]] as const) {
      const r = markAnswer(raw, f(value), { marks: 2, prompt: "Convert the temperature. Give your answer to 2 decimal places." });
      expect(r.correct, raw).toBe(true);
      expect(r.marksAwarded, raw).toBe(2);
    }
    expect(markAnswer("71.12°C", f(71.12), { marks: 2 }).marksAwarded).toBeLessThan(2);
    expect(markAnswer("21.73°C", { kind: "numeric", value: 21.73, tolerance: { type: "dp", places: 2 }, unit: "°C", unitRequired: false, acceptForms: ["decimal"] }, { marks: 2 }).marksAwarded).toBe(2);
  });
});

// Build-9 gate (the M4 author, 8 Oct 2026; exact inputs in scratchpad/state/m4/STATE.md), right answers refused and
// wrong answers paid on solution lists.
describe("one right root of two earns what the scheme gives for that root (build-9 gate, M4)", () => {
  test("m4 quadratic-formula .0003 (algebraic spec): 'x = 1/2' earns MA1 + A1 = 2 of 3; the other root's mark waits", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: "x=\\frac{1}{2}, x=-\\frac{4}{3}", equivalence: "equivalent", variables: ["x"] };
    const scheme: MarkPoint[] = [
      { id: "MA1", code: "MA", marks: 1, for: "(3x + 4)(2x − 1) = 0 used, or the formula with a = 6, b = 5, c = −4" },
      { id: "A1", code: "A", marks: 1, for: "x = 1/2 (accept 0.5)" },
      { id: "A2", code: "A", marks: 1, for: "x = −4/3 (accept −1.33 or better)" },
    ];
    for (const raw of ["x = 1/2", "x = 0.5"]) {
      const r = markAnswer(raw, spec, { marks: 3, scheme, prompt: "Hence solve 6x^2 + 5x - 4 = 0" });
      expect(r.correct, raw).toBe(false);
      expect(r.marksAwarded, raw).toBe(2);
    }
    expect(markAnswer("x = 1/2, x = -4/3", spec, { marks: 3, scheme }).marksAwarded).toBe(3);
  });
  test("a rounded decimal its scheme accepts is the root: '0.5, -1.33' and 'x = 1.67 or x = -1.5'", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: "x=\\frac{1}{2}, x=-\\frac{4}{3}", equivalence: "equivalent", variables: ["x"] };
    expect(markAnswer("0.5, -1.33", spec, { marks: 3 }).marksAwarded).toBe(3);
    expect(markAnswer("x = 0.5 or x = -1.333", spec, { marks: 3 }).marksAwarded).toBe(3);
    expect(markAnswer("0.5, -1.3", spec, { marks: 3 }).correct).toBe(false);
    const thirds: AnswerSpec = { kind: "algebraic", latex: "x=\\frac{5}{3}, x=-\\frac{3}{2}", equivalence: "equivalent", variables: ["x"] };
    expect(markAnswer("x = 1.67 or x = -1.5", thirds, { marks: 2 }).marksAwarded).toBe(2);
  });
  const roots = (a: string, b: string, accepted: string[]): AnswerSpec => ({ kind: "text", accepted, keyWords: [{ any: [a], marks: 1 }, { any: [b], marks: 1 }], listingRule: false });
  test("m4 .0008 (text spec, 4 marks): 'x = 1.81' earns 3 of 4, the missing root's A mark lost", () => {
    const spec = roots("1.81", "-1.21", ["x = 1.81 or x = -1.21", "1.81, -1.21"]);
    const scheme: MarkPoint[] = [
      { id: "MA1", code: "MA", marks: 1, for: "rearranged to 5x² − 3x − 11 = 0" },
      { id: "M1", code: "M", marks: 1, for: "formula quoted and substituted with a = 5, b = -3, c = -11" },
      { id: "A1", code: "A", marks: 1, for: "x = 1.81" },
      { id: "A2", code: "A", marks: 1, for: "x = -1.21" },
    ];
    expect(markAnswer("x = 1.81", spec, { marks: 4, scheme, prompt: "Solve 5x^2 = 3x + 11. Give your answers to 2 decimal places." }).marksAwarded).toBe(3);
    expect(markAnswer("x = 1.81 or x = -1.21", spec, { marks: 4, scheme }).marksAwarded).toBe(4);
    expect(markAnswer("x = 1.81 or x = 2", spec, { marks: 4, scheme }).marksAwarded).toBe(0);
  });
  test("m4 .0001 (one A point for both roots): 'x = -4' earns 1 of 2; .0020: '12' earns 3 of 4 and '12 and 13' earns 0", () => {
    const spec1 = roots("4", "-4", ["x = 4 or x = -4", "4, -4"]);
    const scheme1: MarkPoint[] = [{ id: "MA1", code: "MA", marks: 1, for: "x² = 16, or 2(x + 4)(x − 4) = 0" }, { id: "A1", code: "A", marks: 1, for: "x = 4 and x = −4" }];
    expect(markAnswer("x = -4", spec1, { marks: 2, scheme: scheme1, prompt: "Solve 2x^2 - 32 = 0" }).marksAwarded).toBe(1);
    const spec20 = roots("12", "14", ["12 and 14", "12, 14"]);
    const scheme20: MarkPoint[] = [
      { id: "MA1", code: "MA", marks: 1, for: "n(n + 2) = 168, with n the smaller number" },
      { id: "MA2", code: "MA", marks: 1, for: "n² + 2n − 168 = 0" },
      { id: "MA3", code: "MA", marks: 1, for: "(n + 14)(n − 12) = 0, or the formula with a = 1, b = 2, c = −168" },
      { id: "A1", code: "A", marks: 1, for: "12 and 14, with n = −14 rejected because the numbers are positive" },
    ];
    const prompt = "The product of two consecutive even numbers is 168. Both numbers are positive. Set up and solve a quadratic equation to find the two numbers.";
    expect(markAnswer("12", spec20, { marks: 4, scheme: scheme20, prompt }).marksAwarded).toBe(3);
    expect(markAnswer("12 and 14", spec20, { marks: 4, scheme: scheme20, prompt }).marksAwarded).toBe(4);
    for (const wrong of ["12 and 13", "12, 13", "13 and 14"]) expect(markAnswer(wrong, spec20, { marks: 4, scheme: scheme20, prompt }).marksAwarded, wrong).toBe(0);
  });
});

describe("follow-through from an earlier solution list reads each root (M4 .0014(c))", () => {
  const b: AnswerSpec = { kind: "text", accepted: ["x = 3 or x = -5.5", "3, -5.5"], keyWords: [{ any: ["3"], marks: 1 }, { any: ["-5.5", "−5.5", "-11/2"], marks: 1 }], listingRule: false };
  const c: AnswerSpec = { kind: "numeric", value: 5, tolerance: { type: "dp", places: 1 }, unit: "cm", unitRequired: false, acceptForms: ["decimal"] };
  test("'7' after her (b) 'x = 4 or x = -5.5' with the relation 2 * x - 1 earns the mark; '5' still does; '9' does not", () => {
    const ft = { earlierRaw: "x = 4 or x = -5.5", earlierSpec: b, relation: "2 * x - 1" };
    expect(markAnswer("7", c, { marks: 1, followThrough: ft }).marksAwarded).toBe(1);
    expect(markAnswer("5", c, { marks: 1, followThrough: ft }).marksAwarded).toBe(1);
    expect(markAnswer("9", c, { marks: 1, followThrough: ft }).marksAwarded).toBe(0);
  });
});

describe("a show-that's printed result typed alone on a text part earns nothing (build-9 gate, class C)", () => {
  const spec: AnswerSpec = {
    kind: "text",
    accepted: ["(x + 5)(2x - 3) = 15; 2x^2 - 3x + 10x - 15 = 15; 2x^2 + 7x - 15 = 15; 2x^2 + 7x - 30 = 0"],
    keyWords: [{ any: ["(x + 5)(2x - 3)", "(2x - 3)(x + 5)"], marks: 1 }, { any: ["2x^2 + 7x - 15", "2x^2 - 3x + 10x - 15"], marks: 1 }, { any: ["2x^2 + 7x - 30 = 0", "2x² + 7x − 30 = 0"], marks: 1 }],
    listingRule: false,
  };
  const prompt = "The length of a rectangle is $(x + 5)$ cm and its width is $(2x - 3)$ cm. Its area is $15\\ \\text{cm}^2$.\n\nShow that $2x^2 + 7x - 30 = 0$";
  test("m4 .0011: the target alone is 0; the target with the line before it earns both", () => {
    for (const alone of ["2x^2 + 7x - 30 = 0", "2x² + 7x − 30 = 0", "so 2x^2 + 7x - 30 = 0"]) expect(markAnswer(alone, spec, { marks: 3, prompt }).marksAwarded, alone).toBe(0);
    expect(markAnswer("2x^2 + 7x - 15 = 15 so 2x^2 + 7x - 30 = 0", spec, { marks: 3, prompt }).marksAwarded).toBe(2);
    expect(markAnswer("(x + 5)(2x - 3) = 15, 2x^2 + 7x - 15 = 15, 2x^2 + 7x - 30 = 0", spec, { marks: 3, prompt }).marksAwarded).toBe(3);
  });
});

// The C2 reviewer's three rulings (8 Oct 2026).
describe("a part that requires working pays a bare answer nothing; the working ladder decides (C2 ruling 1)", () => {
  const sum: AnswerSpec = { kind: "numeric", value: 668, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] };
  test("'668' alone on a requiresWorking part is 0 and working-only; the line of working that reaches it is right", () => {
    const bare = markAnswer("668", sum, { marks: 2, requiresWorking: true, prompt: "Calculate the value of Σfx. You must show your working." });
    expect(bare.correct).toBe(false);
    expect(bare.marksAwarded).toBe(0);
    expect(bare.workingOnly).toBe(true);
    const shown = markAnswer("2 × 1 + 5 × 3 + 20 × 32.45 = 668", sum, { marks: 2, requiresWorking: true, prompt: "Calculate the value of Σfx. You must show your working." });
    expect(shown.correct).toBe(true);
    expect(shown.marksAwarded).toBe(2);
    expect(markAnswer("668", sum, { marks: 2 }).marksAwarded).toBe(2);
  });
  test("an algebraic answer typed bare is working-only too; a text answer is never", () => {
    const alg: AnswerSpec = { kind: "algebraic", latex: "x = 3", equivalence: "equivalent", variables: ["x"] };
    const bare = markAnswer("x = 3", alg, { marks: 3, requiresWorking: true });
    expect(bare.marksAwarded).toBe(0);
    expect(bare.workingOnly).toBe(true);
    const text: AnswerSpec = { kind: "text", accepted: ["the particles gain energy"], keyWords: [{ any: ["energy"], marks: 1 }], listingRule: false };
    expect(markAnswer("the particles gain energy", text, { marks: 1, requiresWorking: true }).marksAwarded).toBe(1);
  });
});

describe("dropped trailing zeros under an instructed number of places follow the subject (C2 ruling 2, pinned)", () => {
  const spec: AnswerSpec = { kind: "numeric", value: 1.5, tolerance: { type: "dp", places: 2 }, unit: "g", unitRequired: false, acceptForms: ["decimal"] };
  const prompt = "Calculate the mass. Give your answer to 2 decimal places.";
  test("science loses the accuracy mark for 1.5 where 1.50 is asked; maths and further maths keep it", () => {
    expect(markAnswer("1.5", spec, { marks: 2, prompt, subject: "science" }).marksAwarded).toBe(1);
    expect(markAnswer("1.50", spec, { marks: 2, prompt, subject: "science" }).marksAwarded).toBe(2);
    expect(markAnswer("1.5", spec, { marks: 2, prompt, subject: "maths" }).marksAwarded).toBe(2);
    expect(markAnswer("1.5", spec, { marks: 2, prompt, subject: "further-maths" }).marksAwarded).toBe(2);
  });
});

describe("two key-word groups with identical lists are one idea (C2 ruling 3, pinned)", () => {
  const spec: AnswerSpec = {
    kind: "text",
    accepted: ["it is colourless and odourless"],
    keyWords: [
      { any: ["colourless|colorless|no colour|no color", "odourless|odorless|no smell|no odour|no odor"], marks: 1 },
      { any: ["colourless|colorless|no colour|no color", "odourless|odorless|no smell|no odour|no odor"], marks: 1 },
    ],
    listingRule: false,
  };
  test("one property said once, or twice in two spellings, earns one; two properties earn two", () => {
    expect(markAnswer("it is colourless", spec, { marks: 2 }).marksAwarded).toBe(1);
    expect(markAnswer("it is colourless, it has no colour", spec, { marks: 2 }).marksAwarded).toBe(1);
    expect(markAnswer("colourless and colorless", spec, { marks: 2 }).marksAwarded).toBe(1);
    expect(markAnswer("it is colourless and has no smell", spec, { marks: 2 }).marksAwarded).toBe(2);
  });
});
