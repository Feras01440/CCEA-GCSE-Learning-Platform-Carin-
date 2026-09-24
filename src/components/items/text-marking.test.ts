import { describe, expect, test } from "vitest";
import { countListedItems, keywordsPresent, markMcq, markText, normaliseText, type McqSpec, type TextSpec } from "./text-marking";

describe("normaliseText", () => {
  test("case, punctuation, quotes and dashes are unified", () => {
    expect(normaliseText("  Frequency ÷ Class‑Width!  ")).toBe("frequency / class‑width");
    // Apostrophes are dropped altogether, so "Benedict's" and "Benedicts" normalise to the same word.
    expect(normaliseText("It’s “fine”.")).toBe("its fine");
    expect(normaliseText("Benedict's")).toBe(normaliseText("Benedicts"));
    // Relation signs are words of their own, and ± carries both signs.
    expect(normaliseText("x=6 or x=-6")).toBe("x = 6 or x = -6");
    expect(normaliseText("x = ±6")).toBe("x = 6 -6");
    expect(keywordsPresent("x=2.5, x=−2.5", ["2.5", "-2.5"]).all).toBe(true);
    expect(keywordsPresent("x = ±2.5", ["2.5", "-2.5"]).all).toBe(true);
    expect(keywordsPresent("a=4 and b=12", ["a = 4", "b = 12"]).all).toBe(true);
    // Currency and percent signs never glue themselves to a number.
    expect(keywordsPresent("yes, it reaches £8106.96", ["8106.96"]).all).toBe(true);
    expect(keywordsPresent("an increase of 25%", ["25"]).all).toBe(true);
  });
});

describe("keywordsPresent", () => {
  test("all key phrases present, case-insensitive", () => {
    const r = keywordsPresent("Frequency divided by the CLASS WIDTH", ["frequency", "class width"]);
    expect(r).toEqual({ present: ["frequency", "class width"], missing: [], all: true });
  });
  test("missing phrase reported; plurals tolerated", () => {
    expect(keywordsPresent("the bars are areas", ["bar", "area"]).all).toBe(true);
    const r = keywordsPresent("only the height", ["frequency", "class width"]);
    expect(r.missing).toEqual(["frequency", "class width"]);
    expect(r.all).toBe(false);
  });
  test("no key words means never 'all'", () => {
    expect(keywordsPresent("anything", []).all).toBe(false);
  });
  test("a long key word stands for its inflections; a short one stays exact", () => {
    expect(keywordsPresent("the enzymes are denatured", ["denatur"]).all).toBe(true);
    expect(keywordsPresent("denaturation of the active site", ["denatur", "active site"]).all).toBe(true);
    expect(keywordsPresent("the rate is increasing", ["increase"]).all).toBe(true);
    expect(keywordsPresent("it respires all the time", ["respir"]).all).toBe(true);
    expect(keywordsPresent("we entertain the idea", ["enter"]).all).toBe(false);
    expect(keywordsPresent("carbonated", ["carbon dioxide"]).all).toBe(false);
    expect(keywordsPresent("the tube is heated in a water bath", ["heat"]).all).toBe(true);
    expect(keywordsPresent("water entering and leaving the cell", ["enter", "leave"]).all).toBe(true);
    expect(keywordsPresent("a cellulose cell wall", ["cell"]).all).toBe(true);
    expect(keywordsPresent("made of cellulose", ["cell"]).all).toBe(false);
    expect(keywordsPresent("the number is rational", ["ratio"]).all).toBe(false);
    expect(keywordsPresent("a massive drop", ["mass"]).all).toBe(false);
    expect(keywordsPresent("use the formula", ["form"]).all).toBe(false);
    expect(keywordsPresent("in the mitochondria", ["mitochondri"]).all).toBe(true);
    expect(keywordsPresent("photosynthesising leaves", ["photosynthes"]).all).toBe(true);
  });
  test("apostrophes are ignored so Benedict's matches benedict", () => {
    expect(keywordsPresent("add Benedict's solution and heat", ["benedict"]).all).toBe(true);
    expect(keywordsPresent("add Benedict’s solution", ["benedict's"]).all).toBe(true);
    expect(keywordsPresent("fatty acids and glycerol", ["fatty acid", "glycerol"]).all).toBe(true);
  });
});

const spec: TextSpec = {
  kind: "text",
  accepted: ["Frequency divided by class width"],
  keyWords: [
    { any: ["frequency"], marks: 1 },
    { any: ["class width", "width of the class"], marks: 1, reject: ["height"] },
  ],
  listingRule: false,
};

describe("markText", () => {
  test("an accepted answer earns every mark", () => {
    const r = markText("frequency divided by class width.", spec);
    expect(r.correct).toBe(true);
    expect(r.marksAwarded).toBe(2);
    expect(r.marksAvailable).toBe(2);
  });
  test("key-word groups earn their marks independently", () => {
    const r = markText("the frequency over the width of the class", spec);
    expect(r.correct).toBe(true);
    expect(r.matchedGroups).toEqual([0, 1]);
  });
  test("a reject word cancels its group", () => {
    const r = markText("frequency over the class width height", spec);
    expect(r.correct).toBe(false);
    expect(r.marksAwarded).toBe(1);
    expect(r.rejected).toEqual(["height"]);
    expect(r.feedback).toContain("height");
  });
  test("partial credit names what is missing", () => {
    const r = markText("frequency", spec);
    expect(r.marksAwarded).toBe(1);
    expect(r.feedback).toContain("class width");
  });
  test("empty answers are not marked", () => {
    expect(markText("   ", spec)).toMatchObject({ correct: false, marksAwarded: 0, feedback: "Type an answer first." });
  });
  test("the listing rule removes marks for extra answers", () => {
    const listing: TextSpec = {
      kind: "text",
      accepted: [],
      keyWords: [
        { any: ["oxygen"], marks: 1 },
        { any: ["nitrogen"], marks: 1 },
      ],
      listingRule: true,
    };
    expect(countListedItems("oxygen, nitrogen and argon")).toBe(3);
    const r = markText("oxygen, nitrogen and argon", listing);
    expect(r.marksAwarded).toBe(1);
    expect(r.correct).toBe(false);
    expect(r.feedback).toContain("Listing rule");
    expect(markText("oxygen and nitrogen", listing).correct).toBe(true);
  });
  test("no key words and no accepted match is a plain miss worth one mark", () => {
    const plain: TextSpec = { kind: "text", accepted: ["mode"], keyWords: [], listingRule: false };
    expect(markText("median", plain)).toMatchObject({ correct: false, marksAvailable: 1, marksAwarded: 0 });
    expect(markText("MODE", plain).correct).toBe(true);
  });
});

const mcq: McqSpec = {
  kind: "mcq",
  shuffle: false,
  options: [
    { id: "a", text: "1.6", correct: true, feedback: "16 ÷ 10." },
    { id: "b", text: "16", correct: false, misconception: "hist.freq-as-height", feedback: "That is the frequency." },
    { id: "c", text: "160", correct: false, feedback: "Multiplied instead." },
  ],
};

describe("markMcq", () => {
  test("the correct option", () => {
    const r = markMcq("a", mcq);
    expect(r.correct).toBe(true);
    expect(r.feedback).toBe("16 ÷ 10.");
    expect(r.misconception).toBeUndefined();
  });
  test("a distractor returns its own feedback and misconception", () => {
    const r = markMcq("b", mcq);
    expect(r.correct).toBe(false);
    expect(r.feedback).toBe("That is the frequency.");
    expect(r.misconception).toBe("hist.freq-as-height");
    expect(r.correctOptions.map((o) => o.id)).toEqual(["a"]);
  });
  test("multi-select needs the exact set", () => {
    const multi: McqSpec = { ...mcq, multi: true, options: mcq.options.map((o) => ({ ...o, correct: o.id !== "c" })) };
    expect(markMcq(["a", "b"], multi).correct).toBe(true);
    expect(markMcq(["a"], multi).correct).toBe(false);
    expect(markMcq(["a", "b", "c"], multi).correct).toBe(false);
  });
  test("nothing chosen", () => {
    expect(markMcq([], mcq)).toMatchObject({ correct: false, feedback: "Choose an option first." });
  });
});

describe("markText: one key word earns one group", () => {
  const symptoms = ["thirst", "high blood glucose", "glucose in the urine", "lethargy"];
  const spec: TextSpec = {
    kind: "text",
    accepted: ["thirst and lethargy"],
    keyWords: [
      { any: symptoms, marks: 1 },
      { any: symptoms, marks: 1 },
    ],
    listingRule: false,
  };
  test("two groups with the same list need two different key words", () => {
    expect(markText("thirst", spec)).toMatchObject({ marksAwarded: 1, matchedGroups: [0] });
    expect(markText("thirst and lethargy", spec)).toMatchObject({ marksAwarded: 2, correct: true });
    expect(markText("lethargy, glucose in the urine", spec)).toMatchObject({ marksAwarded: 2, correct: true });
    expect(markText("thirst, and being very thirsty", spec).marksAwarded).toBe(1);
  });
});

describe("the listing rule counts list-shaped answers only", () => {
  test("short comma-or-and separated items are counted; a sentence is one answer", () => {
    expect(countListedItems("nucleus, cytoplasm, vacuole and cell wall")).toBe(4);
    expect(countListedItems("wheat and hawthorn")).toBe(2);
    expect(countListedItems("it is waterlogged and cold, so there is no oxygen and the decomposers work slowly")).toBe(1);
    expect(countListedItems("the bog is waterlogged so there is almost no oxygen for the decomposers, and it is cold")).toBe(1);
  });
});

describe("algebraic key words ignore the spacing around operators", () => {
  test("a working line earns its key word however she spaces it", () => {
    const keys = ["(2x - 1)(x + 3) = 30", "2x^2 + 5x - 33 = 0", "x^2 + (x + 17)^2 = 25^2"];
    expect(keywordsPresent("(2x-1)(x+3) = 30 so 2x^2+5x-33=0", keys).present).toEqual(["(2x - 1)(x + 3) = 30", "2x^2 + 5x - 33 = 0"]);
    expect(keywordsPresent("x^2+(x+17)^2=25^2", keys).present).toEqual(["x^2 + (x + 17)^2 = 25^2"]);
    expect(keywordsPresent("(2x - 1)(x + 3) = 30", keys).present).toEqual(["(2x - 1)(x + 3) = 30"]);
  });
  test("a different line does not earn it, and prose key words keep their word boundaries", () => {
    expect(keywordsPresent("(2x-1)(x+3) = 15", ["(2x - 1)(x + 3) = 30"]).present).toEqual([]);
    expect(keywordsPresent("2x^2 + 5x - 3 = 30", ["2x^2 + 5x - 33 = 0"]).present).toEqual([]);
    expect(keywordsPresent("it took 2 - 3 minutes", ["3 minutes"]).present).toEqual(["3 minutes"]);
    expect(keywordsPresent("2a-b", ["2a - b"]).present).toEqual(["2a - b"]);
  });
});

describe("typed superscripts are the caret", () => {
  test("a key word written with ^ is earned by ² and ³, and the other way round", () => {
    expect(keywordsPresent("2x² + 5x − 33 = 0", ["2x^2 + 5x - 33 = 0"]).all).toBe(true);
    expect(keywordsPresent("5x^2 + 12x - 81 = 0", ["5x² + 12x − 81 = 0"]).all).toBe(true);
    expect(keywordsPresent("the area is 24 cm^2", ["24 cm²"]).all).toBe(true);
    expect(normaliseText("x³ − 8")).toBe("x^3 - 8");
  });
});

describe("a hyphen joining words is a space", () => {
  test("either spelling earns the key word", () => {
    expect(keywordsPresent("nitrogen fixing bacteria in the root nodules", ["nitrogen-fixing"]).all).toBe(true);
    expect(keywordsPresent("nitrogen-fixing bacteria", ["nitrogen fixing"]).all).toBe(true);
    expect(keywordsPresent("the y intercept is 3", ["y-intercept"]).all).toBe(true);
    expect(keywordsPresent("read the x-axis", ["x axis"]).all).toBe(true);
  });
  test("a minus in algebra is not a hyphen", () => {
    expect(normaliseText("2a-b and x^2-1")).toBe("2a-b and x^2-1");
    expect(keywordsPresent("x^2-1", ["x^2 - 1"]).all).toBe(true);
  });
});

describe("the listing rule reads a comma clause as prose", () => {
  test("a clause that continues the sentence is not a second item", () => {
    expect(countListedItems("the sun, captured by the leaves")).toBe(1);
    expect(countListedItems("the sun, which the leaves capture")).toBe(1);
    expect(countListedItems("the sun, the leaves")).toBe(2);
    expect(countListedItems("nucleus, cytoplasm, vacuole and cell wall")).toBe(4);
  });
});

describe("every word of a phrase tolerates a trailing s", () => {
  test("rabbit number earns rabbits number and cell wall earns cell walls", () => {
    expect(keywordsPresent("the rabbit number increases", ["rabbits number increases"]).all).toBe(true);
    expect(keywordsPresent("the cell walls are rigid", ["cell wall"]).all).toBe(true);
    expect(keywordsPresent("the cells walls", ["cell wall"]).all).toBe(true);
    expect(keywordsPresent("a red blood cell", ["red blood cells"]).all).toBe(true);
    expect(keywordsPresent("the cellulose wall", ["cell wall"]).all).toBe(false);
  });
});

describe("ion charges written with superscripts", () => {
  test("the superscript spelling is the plain one, so one key word covers both", () => {
    expect(normaliseText("Cu²⁺ + 2e⁻ → Cu")).toBe("cu2+ + 2e- → cu");
    expect(normaliseText("the SO₄²⁻ ion")).toBe("the so42- ion");
    expect(normaliseText("Na⁺ and Cl⁻")).toBe("na+ and cl-");
    expect(keywordsPresent("the copper ion Cu²⁺ gains electrons", ["cu2+"]).all).toBe(true);
    expect(keywordsPresent("Cu2+ gains two electrons", ["cu²⁺"]).all).toBe(true);
    // Powers keep the caret rule.
    expect(normaliseText("2x² + 5x")).toBe("2x^2 + 5x");
  });
});

describe("the listing rule keeps a coordinate pair together", () => {
  test("commas inside brackets do not make extra items", () => {
    expect(countListedItems("(4, 0) and (1, 0)")).toBe(2);
    expect(countListedItems("(1, 0), (4, 0)")).toBe(2);
    expect(countListedItems("(1, 0)")).toBe(1);
    expect(countListedItems("nucleus, cytoplasm (with ribosomes), vacuole")).toBe(3);
  });
});

// C2 D F04 (24 Sep 2026): a name given with its formula, "ethanol, C2H5OH", tripped the listing rule as two answers.
// CCEA's general marking instructions (C2 Higher MS Summer 2021, "Both name and formula provided by candidate"): when
// a name is asked for, a formula beside it is ignored, and when a formula is asked for, a name beside it is ignored.
describe("a name and a formula side by side are one answer", () => {
  test("a name with its formula, either way round, counts once", () => {
    expect(countListedItems("ethanol, C2H5OH")).toBe(1);
    expect(countListedItems("C2H5OH, ethanol")).toBe(1);
    expect(countListedItems("Propene, C3H6")).toBe(1);
    expect(countListedItems("C2H3Cl, the same as chloroethene")).toBe(1);
    expect(countListedItems("propene / C3H6")).toBe(1);
  });
  test("two names, two formulae, or a longer list still count every item", () => {
    expect(countListedItems("water, carbon dioxide")).toBe(2);
    expect(countListedItems("CO2, H2O")).toBe(2);
    expect(countListedItems("nitrogen, oxygen, CO2")).toBe(3);
    expect(countListedItems("ethanol, methanol")).toBe(2);
  });
  test("the listing rule leaves the mark with the name", () => {
    const name: TextSpec = { kind: "text", accepted: ["ethanol"], keyWords: [{ any: ["ethanol"], marks: 1 }], listingRule: true };
    expect(markText("ethanol, C2H5OH", name).correct).toBe(true);
    expect(markText("ethanol, methanol", name).correct).toBe(false);
  });
});

// C2 D F11 (24 Sep 2026): "CH3CH=CH2" was refused where the key word is "CH2=CHCH3": the same condensed formula of
// propene written from the other end. A hydrocarbon's condensed formula is right whichever end it starts from.
describe("a condensed hydrocarbon formula read from either end", () => {
  const monomer: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["C3H6", "CH2CHCH3", "CH2=CHCH3"], marks: 1 }], listingRule: false };
  test.each(["CH3CH=CH2", "CH3CHCH2", "CH2=CHCH3", "C3H6", "H2C=CHCH3", "CH3-CH=CH2", "CH₃CH=CH₂"])("%s earns the key word", (typed) => {
    expect(markText(typed, monomer).correct).toBe(true);
  });
  test.each(["CH3CH2CH3", "CH3CH=CH3", "CH2=CH2", "C3H8"])("%s is another substance", (typed) => {
    expect(markText(typed, monomer).correct).toBe(false);
  });
  test("a formula with other atoms is left as written", () => {
    const ethanol: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["CH3CH2OH"], marks: 1 }], listingRule: false };
    expect(markText("CH3CH2OH", ethanol).correct).toBe(true);
    expect(markText("OHCH2CH3", ethanol).correct).toBe(false);
  });
});

// C2 D F12 (24 Sep 2026): "poly(ethene) or poly(ethane)" was paid 1/1. CCEA's general marking instructions (C2 Higher
// MS Summer 2021): "Additional incorrect responses cancel out a correct response." A hedge that offers a named wrong
// answer (one of the part's common errors) beside the right one loses the mark the right one would earn.
describe("a hedge with a named wrong answer", () => {
  const polymer: TextSpec = { kind: "text", accepted: ["poly(ethene)", "polythene"], keyWords: [{ any: ["poly(ethene)", "polyethene", "polythene"], marks: 1 }], listingRule: false };
  const wrong = [/\bpolyethane\b|\bpoly ?\(ethane\)|\bpoly ethane\b/i];
  test.each(["poly(ethene) or poly(ethane)", "poly(ethane) or poly(ethene)", "polythene / polyethane", "poly(ethene) or polyethane"])("%s earns nothing", (typed) => {
    const r = markText(typed, polymer, { wrongAnswers: wrong });
    expect(r).toMatchObject({ correct: false, marksAwarded: 0 });
    expect(r.feedback).toMatch(/cancels/);
  });
  test("two right spellings, or the right answer that names the wrong one as wrong, keep the mark", () => {
    expect(markText("poly(ethene) or polythene", polymer, { wrongAnswers: wrong }).correct).toBe(true);
    expect(markText("poly(ethene), not poly(ethane)", polymer, { wrongAnswers: wrong }).correct).toBe(true);
    expect(markText("poly(ethene)", polymer, { wrongAnswers: wrong }).correct).toBe(true);
  });
  test("a sentence with or in it is not a hedge", () => {
    const denature: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["denatured"], marks: 1 }], listingRule: false };
    const r = markText("The enzyme is denatured because the active site changes shape or is destroyed by the heat", denature, { wrongAnswers: [/destroyed/i] });
    expect(r.correct).toBe(true);
  });
  test("in a two-group part only the mark the hedge touches is lost", () => {
    const two: TextSpec = {
      kind: "text",
      accepted: [],
      keyWords: [
        { any: ["ethene"], marks: 1 },
        { any: ["addition"], marks: 1 },
      ],
      listingRule: false,
    };
    const r = markText("monomer: ethene or ethane; type: addition", two, { wrongAnswers: [/\bethane\b/i] });
    expect(r).toMatchObject({ marksAwarded: 1, matchedGroups: [1] });
  });
});
