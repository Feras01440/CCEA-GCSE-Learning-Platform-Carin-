import { describe, expect, test } from "vitest";
import type { AnswerSpec, CommonError } from "@/lib/content/schema";
import { instructsAccuracy, isFormTask, markAnswer, matchesCommonError, variableLetters } from "./mark";

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
  test("numeric to 2 d.p. when the stem instructs it: an exact value with the zeros dropped is right, with a write-150.00 reminder", () => {
    const pct: AnswerSpec = { kind: "numeric", value: 150, tolerance: { type: "dp", places: 2 }, unitRequired: false, acceptForms: ["decimal", "percent"] };
    const prompt = "Calculate the percentage increase. Give your answer to two decimal places.";
    const dropped = markAnswer("150", pct, { marks: 3, prompt });
    expect(dropped).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(dropped.explanation).toMatch(/write 150\.00/);
    expect(markAnswer("150.00", pct, { marks: 3, prompt }).explanation).not.toMatch(/write 150\.00/);
    expect(markAnswer("150.000", pct, { marks: 3, prompt }).correct).toBe(false);
    expect(markAnswer("149.9", pct, { marks: 3, prompt }).correct).toBe(false);
  });
  test("the write-150.00 reminder never says a mark is lost, because CCEA does not take one (engine item 14)", () => {
    // CCEA GCSE Further Mathematics, Unit 2 mark scheme, Summer 2021, general instructions: "Accept 1.5 instead of
    // 1.50 for an answer required to 2 dp." The reminder is about showing the accuracy, not about a lost mark.
    const pct: AnswerSpec = { kind: "numeric", value: 150, tolerance: { type: "dp", places: 2 }, unitRequired: false, acceptForms: ["decimal", "percent"] };
    const prompt = "Calculate the percentage increase. Give your answer to two decimal places.";
    const dropped = markAnswer("150", pct, { marks: 3, prompt });
    expect(dropped).toMatchObject({ correct: true, marksAwarded: 3 });
    expect(dropped.explanation).toMatch(/write 150\.00/);
    expect(dropped.explanation).not.toMatch(/examiner|mark lost|lose|lost/i);
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
    // The instruction is a demand, as for a numeric part: three places is not two.
    expect(markAnswer(typed(["2.900", "3.50", "3.60"]), spec, { marks: 3, prompt }).correct).toBe(false);
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
  test("fm1 algebraic-fractions-simplify .0009: the question typed back earns 0 and names the error", () => {
    const r = markAnswer("(2x^2+2x-12)/(x^2+6x+9)", q9, { marks: 4, commonErrors: [given], prompt });
    expect(r).toMatchObject({ correct: false, marksAwarded: 0, tags: ["fm.algfrac.not-factorised-first"] });
    expect(r.explanation).toMatch(/expression you were given/);
  });
  test("an uncancelled line with no named error earns 0, and the feedback says the form was the task", () => {
    const r = markAnswer("2(x+3)(x-2)/(x+3)^2", q9, { marks: 4, commonErrors: [given], prompt });
    expect(r.marksAwarded).toBe(0);
    expect(r.explanation).toMatch(/value is right.*asks for/i);
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
    expect(markAnswer("4.24 cm", radius, { marks: 2, prompt: "A circle has area $18\\pi$ cm². Show that the radius of the circle is $3\\sqrt{2}$ cm." }).marksAwarded).toBe(1);
    // A letter of the question after the number is a wrong answer, not a form: still 0.
    expect(markAnswer("4m", { kind: "numeric", value: 4, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] }, { marks: 2, prompt: "(d) $3m^{0} + m^{0}$" }).marksAwarded).toBe(0);
  });
  test("an algebraic part whose stem is not a form task keeps marks − 1", () => {
    const spec: AnswerSpec = { kind: "algebraic", latex: "\\log 8x^3", equivalence: "equivalent", variables: ["x"], form: "single-log-expanded" };
    expect(markAnswer("\\log 8 + 3\\log x", spec, { marks: 3, prompt: "Use the laws of logarithms on your answer to part (a)." }).marksAwarded).toBe(2);
    expect(markAnswer("\\log 8 + 3\\log x", spec, { marks: 3, prompt: "Write $3\\log 2x$ as a single logarithm." }).marksAwarded).toBe(0);
  });
});

describe("a matched common error never pays a wrong answer in full (the marking guard, 26 Sep 2026)", () => {
  test("an error whose typical marks equal the tariff pays one mark less", () => {
    const spec = { kind: "algebraic", latex: "x+2", equivalence: "equivalent", variables: ["x"], form: "simplest-fraction" } as const;
    const commonErrors = [
      { misconception: "fm.algfrac.not-cancelled", pattern: { kind: "algebraic", latex: "\\frac{(x-2)(x+2)(x+1)}{(x+1)(x-2)}" }, feedback: "Nothing cancelled yet.", marksTypicallyEarned: 2 },
    ] as const;
    const r = markAnswer("\\frac{(x-2)(x+2)(x+1)}{(x+1)(x-2)}", spec as never, { marks: 2, commonErrors: commonErrors as never, prompt: "Simplify fully" });
    expect(r.correct).toBe(false);
    expect(r.marksAwarded).toBe(1);
    expect(r.tags).toContain("fm.algfrac.not-cancelled");
  });
  test("a numeric error written with the full tariff pays one mark less, and a right answer still pays in full", () => {
    const spec = { kind: "numeric", value: 132, tolerance: { type: "absolute", value: 0.5 }, unit: "m", unitRequired: false, acceptForms: ["decimal"] } as const;
    const commonErrors = [{ misconception: "p1.speed.ecf", pattern: { kind: "numeric", value: 264 }, feedback: "From 22 m/s.", marksTypicallyEarned: 3 }] as const;
    expect(markAnswer("264", spec as never, { marks: 3, commonErrors: commonErrors as never }).marksAwarded).toBe(2);
    expect(markAnswer("132", spec as never, { marks: 3, commonErrors: commonErrors as never }).marksAwarded).toBe(3);
  });
});

describe("an accepted common error is a right answer with a note (the marking guard, 26 Sep 2026)", () => {
  test("a unit the part does not require, flagged by an accepted error, earns every mark and says why", () => {
    const spec = { kind: "numeric", value: 2.5, tolerance: { type: "exact" }, unit: "m/s²", unitRequired: false, acceptForms: ["decimal"] } as const;
    const commonErrors = [
      { misconception: "sci.physics.unit-not-given", pattern: { kind: "text", regex: "(^|=)\\s*2\\.50*\\s*(m\\s*/\\s*s)\\s*$" }, feedback: "The number is right; m/s is the unit of speed.", marksTypicallyEarned: 3, accepted: true },
    ] as const;
    const r = markAnswer("2.5 m/s", spec as never, { marks: 3, commonErrors: commonErrors as never });
    expect(r).toMatchObject({ correct: true, marksAwarded: 3, explanation: "The number is right; m/s is the unit of speed." });
    expect(r.tags).toContain("sci.physics.unit-not-given");
  });
});
