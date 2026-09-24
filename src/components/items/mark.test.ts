import { describe, expect, test } from "vitest";
import type { AnswerSpec, CommonError } from "@/lib/content/schema";
import { instructsAccuracy, markAnswer, matchesCommonError } from "./mark";

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
  test("order: the arrangement must match exactly, and the feedback counts what is in place", () => {
    const spec: AnswerSpec = { kind: "order", items: ["cell", "tissue", "organ", "organ system"], correctOrder: [0, 1, 2, 3] };
    expect(markAnswer("0,1,2,3", spec, { marks: 2 })).toMatchObject({ correct: true, marksAwarded: 2, marksAvailable: 2 });
    const partial = markAnswer("0,2,1,3", spec, { marks: 2 });
    expect(partial).toMatchObject({ correct: false, marksAwarded: 0 });
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
    expect(partial).toMatchObject({ correct: false, marksAwarded: 0 });
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
    expect(markAnswer("v = f × λ\nv = 6 m/s", eq, { marks: 2 })).toMatchObject({ correct: true, marksAwarded: 2 });
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
