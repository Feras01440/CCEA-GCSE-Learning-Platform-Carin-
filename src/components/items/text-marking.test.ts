import { describe, expect, test } from "vitest";
import { countListedItems, isFormula, keywordsPresent, listedItems, markMcq, markText, normaliseText, type McqSpec, type TextSpec } from "./text-marking";

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

// The QA fixer (25 Sep 2026: 478 of 1,567 retrieval prompts cannot tick all their key words from their own model
// answer) and trial audit MK-16 (the key-word check calls right prompt answers incomplete). The chips read her typed
// recall, and a model answer or a key word may be written in TeX ("$\log(ab)$", "$\dfrac{ad-bc}{bd}$", "$y \, dx$") or
// with its operators spaced ("ad - bc"). The chips now read TeX as it would be typed and ignore the spacing round an
// operator between letters, as they already did between numbers. They award nothing: they only show which key words
// her recall has, so what is left after this is the authored key words' wording (the residual list, for content).
describe("keywordsPresent reads TeX and operator spacing as typed", () => {
  test.each([
    [String.raw`$\log(ab)$, since the plus outside becomes a times inside`, "log ab"],
    [String.raw`$\dfrac{ad-bc}{bd}$, provided $b$ and $d$ share no factor`, "ad - bc"],
    [String.raw`Area $= \int_{a}^{b} y \, dx$`, "y dx"],
    [String.raw`$\log a + \log b = \log(ab)$, and $n\log a = \log a^{n}$`, "n log a"],
    [String.raw`$(2x+1)(2x-1)$ and $(3x+1)(3x-1)$`, "(3x + 1)(3x - 1)"],
    [String.raw`Rewrite it as $4x^{-2}$ first`, "4x^-2"],
    [String.raw`$\sqrt{20} = 2\sqrt{5}$`, "2√5"],
  ])("%s ticks %s", (answer, key) => {
    expect(keywordsPresent(answer, [key]).all).toBe(true);
  });
  test("a key word that is not there is still missing", () => {
    expect(keywordsPresent(String.raw`$\log(a + b)$`, ["log ab"]).all).toBe(false);
    expect(keywordsPresent("ad plus bc over bd", ["ad - bc"]).all).toBe(false);
    expect(keywordsPresent(String.raw`$\dfrac{ad+bc}{bd}$`, ["ad - bc"]).all).toBe(false);
  });
});

describe("keywordsPresent: a spaced dash in prose, and a minus between letters", () => {
  test("the factor pair ticks beside a dash, and (a + b)(a - b) ticks in its closed-up spelling", () => {
    expect(keywordsPresent("$(2x+1)(2x-1)$ and $(3x+1)(3x-1)$ — a square minus a square", ["(3x + 1)(3x - 1)"]).all).toBe(true);
    expect(keywordsPresent("$(a+b)(a-b)$, the difference of two squares", ["(a + b)(a - b)"]).all).toBe(true);
    expect(keywordsPresent("$(a+b)(a+b)$", ["(a + b)(a - b)"]).all).toBe(false);
  });
});

describe("keywordsPresent: subscripts and degrees in TeX", () => {
  test("x₁ ticks in $x_1$, and 180 in $180^{\circ}$", () => {
    expect(keywordsPresent("$y - y_1 = m(x - x_1)$", ["y₁", "x₁"]).all).toBe(true);
    expect(keywordsPresent(String.raw`A rotation of $180^{\circ}$ about $C$`, ["180"]).all).toBe(true);
  });
});

// The B2 D sweeps, the C2 E review and the B2 D reviewer (25 Sep 2026): text marking, one describe per rule.
const ks = (groups: Array<string[] | { any: string[]; reject?: string[] }>, listingRule = false): TextSpec => ({
  kind: "text",
  accepted: [],
  keyWords: groups.map((g) => (Array.isArray(g) ? { any: g, marks: 1 } : { any: g.any, marks: 1, reject: g.reject })),
  listingRule,
});

describe("a key word inside a negation earns nothing; a negation that is the point does", () => {
  test.each([
    [["human gene"], "they do not have the human gene"],
    [["pure"], "it does not need to be pure"],
    [["continuous"], "it is not continuous"],
    [["extinct"], "it will not become extinct"],
    [["increase"], "it does not increase"],
    [["complementary"], "the antibody is not complementary to the antigen"],
    [["resistant"], "the non-resistant bacteria"],
    [["survive"], "they don't survive"],
  ])("%s is not earned by %s", (keys, answer) => {
    expect(markText(answer, ks([keys])).marksAwarded).toBe(0);
  });
  test("the clause the negation sits in is the scope: another clause keeps its mark", () => {
    const r = markText("discontinuous because it is not in separate groups", ks([["discontinuous"], ["separate groups"]]));
    expect(r.marksAwarded).toBe(1);
    expect(markText("It is not continuous, so it is discontinuous", ks([["discontinuous"]])).marksAwarded).toBe(1);
  });
  test("a key word that is itself a negation is earned as written", () => {
    expect(markText("the ray does not change direction", ks([["does not change direction"]])).marksAwarded).toBe(1);
    expect(markText("the current no longer flows", ks([["no longer flows"]])).marksAwarded).toBe(1);
    expect(markText("the non-resistant bacteria die", ks([["non resistant bacteria die"]])).marksAwarded).toBe(1);
  });
  // The QA fixer (25 Sep 2026): a negation governs its own verb phrase, up to "and", "which", a comma or a full stop,
  // and not a prepositional phrase after its word. Right answers had lost their second idea.
  test.each([
    "so light isn't obstructed and can reach the chloroplasts",
    "without being blocked and reaches the chloroplasts",
  ])("the idea after 'and' is not negated: %s", (answer) => {
    const s = ks([["not obstructed", "without being blocked"], ["chloroplast"]]);
    expect(markText(answer, s).marksAwarded).toBe(2);
  });
  test("a prepositional phrase after the negated word is not negated", () => {
    expect(markText("so that no light is blocked on its way to the palisade cells", ks([["no light is blocked"], ["palisade cells"]])).marksAwarded).toBe(2);
    expect(markText("the substrate is not complementary to the active site", ks([["not complementary"], ["active site"]])).marksAwarded).toBe(2);
    expect(markText("the antibody is not complementary to the antigen", ks([["complementary"]])).marksAwarded).toBe(0);
  });
  test("a reject joined to a right clause by 'and' cancels (p2 conductors q0001(c), the P2 C reversal fixture)", () => {
    const s = ks([
      { any: ["copper has free electrons", "has free electrons"], reject: ["rubber has free electrons"] },
      { any: ["rubber has no free electrons"], reject: ["rubber has no electrons"] },
    ]);
    expect(markText("Copper has no free electrons and the rubber has free electrons", s).marksAwarded).toBe(0);
    expect(markText("Copper has free electrons and rubber has no free electrons", s).marksAwarded).toBe(2);
  });
  test("a reject inside a negation does not fire (NS q0005)", () => {
    const s = ks([{ any: ["resistant bacteria survive"], reject: ["non resistant bacteria survived"] }]);
    expect(markText("None of the non-resistant bacteria survived; the resistant bacteria survived", s).marksAwarded).toBe(1);
  });
});

describe("one idea earns one group", () => {
  test("a key word inside one already paid is the same idea said again (NS q0005)", () => {
    const s = ks([["resistant bacteria survived", "survived"], ["resistant bacteria survived", "survived"]]);
    expect(markText("The resistant bacteria survived. They survived.", s).marksAwarded).toBe(1);
  });
  test("synonyms written as one entry with | are one idea (GE q0010)", () => {
    const s = ks([["cheaper|costs less", "pure", "mass produced"], ["cheaper|costs less", "pure", "mass produced"]]);
    expect(markText("it's cheaper and it costs less", s).marksAwarded).toBe(1);
    expect(markText("it's cheaper and it is pure", s).marksAwarded).toBe(2);
  });
});

describe("the listing rule: letters, slashes, and only wrong extras cost", () => {
  const letters = ks([["B"], ["D"]], true);
  test("space-separated letters are items (NS q0002)", () => {
    expect(markText("B D E A C", letters).marksAwarded).toBe(0);
    expect(markText("B D E", letters).marksAwarded).toBe(1);
    expect(markText("B D", letters).marksAwarded).toBe(2);
    expect(markText("B/D", letters).marksAwarded).toBe(2);
    expect(markText("B+D", letters).marksAwarded).toBe(2);
  });
  test("a right alternative is not an extra answer (IM q0001)", () => {
    expect(markText("trap and filter", ks([["trap", "filter"]], true)).marksAwarded).toBe(1);
  });
  test("a slash between words reads as two words (GE q0018)", () => {
    expect(markText("Bacteria reproduce/multiply", ks([["multiply"]])).marksAwarded).toBe(1);
  });
});

describe("a hedge: long alternatives, and a reason after it", () => {
  test("NS q0005: a long alternative with a named wrong answer cancels", () => {
    const s = ks([["mutation"]]);
    expect(markText("Some bacteria had a mutation or became immune", s, { wrongAnswers: [/immune/i] }).marksAwarded).toBe(0);
  });
  test("VA q0010(c): the hedge before 'because' cancels its own mark, the reason keeps its own", () => {
    const s = ks([["histogram"], ["continuous"]]);
    expect(markText("histogram or bar chart because it is continuous", s, { wrongAnswers: [/bar chart/i] }).marksAwarded).toBe(1);
  });
});

describe("inflections and spellings", () => {
  test("each word of a multi-word key word takes its inflections; a double s is not a plural", () => {
    expect(markText("they passes the gene on", ks([["pass the gene"]])).marksAwarded).toBe(1);
    expect(markText("they passed the gene on", ks([["pass the gene"]])).marksAwarded).toBe(1);
    expect(markText("the resistant bacteria surviving", ks([["resistant bacteria survive"]])).marksAwarded).toBe(1);
  });
  test("contractions and small numbers in words", () => {
    expect(markText("it wouldn't work", ks([["would not"]])).marksAwarded).toBe(1);
    expect(markText("the insulin isn't pure", ks([["is not pure"]])).marksAwarded).toBe(1);
    expect(markText("the straight DNA has two ends", ks([["2 ends"]])).marksAwarded).toBe(1);
    expect(markText("the straight DNA has 2 ends", ks([["two ends"]])).marksAwarded).toBe(1);
  });
});

// The FM2 review (27 Sep 2026): "M = 650 or 651" was paid 3/3 on a show-that part. A value no key word or model
// answer states, offered beside the right one, is a hedge, and cancels the point it sits with.
describe("a second value beside the right one cancels its point", () => {
  const s: TextSpec = {
    kind: "text",
    accepted: ["Taking up as positive, 7020 - 10M = 0.8M, so 7020 = 10.8M and M = 650."],
    keyWords: [
      { any: ["7020 - 10m"], marks: 1 },
      { any: ["10.8m"], marks: 1 },
      { any: ["m = 650", "650 kg"], marks: 1 },
    ],
    listingRule: false,
  };
  test("650 or 651 loses the value's point; 650 alone keeps it", () => {
    expect(markText("7020 - 10M = 0.8M, so 10.8M = 7020 and M = 650 or 651", s).marksAwarded).toBe(2);
    expect(markText("7020 - 10M = 0.8M, so 10.8M = 7020 and M = 650", s).marksAwarded).toBe(3);
  });
});

// Two rules the verifier found with no test that could fail (29 Sep 2026).
describe("the model's negation, and reject words' endings", () => {
  const s: TextSpec = {
    kind: "text",
    accepted: ["their shapes are not complementary to the active site so they cannot fit into it"],
    keyWords: [
      { any: ["shape", "complementary"], marks: 1 },
      { any: ["active site"], marks: 1 },
    ],
    listingRule: false,
  };
  test("her negated key word earns where the model negates it; her un-negated one contradicts the point", () => {
    expect(markText("their shapes are not complementary to the active site so they cannot fit", s).marksAwarded).toBe(2);
    expect(markText("their shape is complementary to the active site so they fit", s).marksAwarded).toBe(1);
  });
  test("a reject word takes its verb endings, not a derived word", () => {
    const iso: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["share an atomic number"], marks: 1, reject: ["an atom"] }], listingRule: false };
    expect(markText("atoms that share an atomic number", iso).marksAwarded).toBe(1);
    const conducts: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["copper conducts"], marks: 1, reject: ["rubber conducts"] }], listingRule: false };
    expect(markText("copper conducts and rubber conducted", conducts).marksAwarded).toBe(0);
  });
});

// The lead's G (29 Sep 2026, from the B2 E author): a model negating a key word about another subject must not make her
// plain use of it a contradiction; prevent, stop, avoid and reduce are negators; a short first word is pinned in any of
// its forms, and a key that cannot be pinned is not read as negated by its own "non".
describe("the model's negation is the point only about the same subject", () => {
  const fair: TextSpec = { kind: "text", accepted: ["different numbers of people ate each food, so a percentage puts every food on the same scale"], keyWords: [{ any: ["different numbers", "fair", "fairly", "same scale"], marks: 1 }], listingRule: false };
  const model = ["Different numbers of people ate each food, so the number who became ill is not a fair comparison; a percentage puts every food on the same scale."];
  test.each(["so the comparison is fair", "a percentage lets you compare fairly"])("b2-health .0023(c): %s", (answer) => {
    expect(markText(answer, fair, { model }).marksAwarded).toBe(1);
  });
  test("prevent and stop deny what follows (we.02 twin)", () => {
    const twin: TextSpec = { kind: "text", accepted: ["to kill microorganisms at the neck so they do not contaminate the culture"], keyWords: [{ any: ["kill", "contaminate", "contamination"], marks: 1 }], listingRule: false };
    for (const answer of ["to prevent contamination of the culture", "to stop contamination", "so they do not contaminate the culture"]) expect(markText(answer, twin).marksAwarded, answer).toBe(1);
    expect(markText("to contaminate the culture", twin).marksAwarded).toBe(0);
  });
  test("a short first word in another form, and the key's own non, do not read as a negation", () => {
    const kill: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["kill the non resistant"], marks: 1 }], listingRule: false };
    const m = ["The antibiotic killed the non-resistant bacteria."];
    expect(markText("the antibiotic kills the non-resistant ones", kill, { model: m }).marksAwarded).toBe(1);
    expect(markText("the antibiotic killed the non-resistant bacteria", kill, { model: m }).marksAwarded).toBe(1);
  });
});

// The lead's G addendum (29 Sep 2026, the B2 E and C2 D authors): a negated negator is a positive; a model that avoids a
// harm names it without making her plain mention a contradiction; a group whose point is a reduction waives her
// negation for every one of its words.
describe("negators, double negation and harms avoided", () => {
  test("E-NEG-DOUBLE: 'does not reduce contamination' is not the key 'reduce contamination'", () => {
    const s: TextSpec = { kind: "text", accepted: ["hot air rises and carries microorganisms away, which reduces contamination"], keyWords: [{ any: ["reduce contamination", "rising hot air"], marks: 1 }], listingRule: false };
    expect(markText("it does not reduce contamination", s).marksAwarded).toBe(0);
    expect(markText("it reduces contamination", s).marksAwarded).toBe(1);
  });
  test("E-NEG-POINT: 'to avoid growing pathogens' names the harm; her plain or negated mention earns", () => {
    const s: TextSpec = { kind: "text", accepted: ["to avoid growing pathogens, the bacteria that cause disease in humans"], keyWords: [{ any: ["pathogen", "harmful bacteria", "disease-causing"], marks: 1 }], listingRule: false };
    const model = ["To avoid growing pathogens: bacteria that cause disease in humans are adapted to body temperature, 37 °C."];
    for (const answer of ["so that pathogens do not grow", "to stop harmful bacteria growing", "pathogens could grow", "because pathogens grow best at body temperature"]) {
      expect(markText(answer, s, { model }).marksAwarded, answer).toBe(1);
    }
  });
  test("a group whose own entry is a reduction waives her negation ('stops … carrying oxygen')", () => {
    const s: TextSpec = { kind: "text", accepted: ["it combines with haemoglobin in the blood, so the blood can carry less oxygen"], keyWords: [{ any: ["haemoglobin"], marks: 1 }, { any: ["carry less oxygen", "carrying oxygen", "cannot carry oxygen"], marks: 1 }], listingRule: false };
    expect(markText("It stops red blood cells carrying oxygen", s).marksAwarded).toBe(1);
  });
});

// A negated entry waives only a key about the same thing (the verifier's probe, 29 Sep 2026: "they are not resistant"
// was paid through the group's "antibiotics do not work").
describe("a negated entry waives her negation only for the same idea", () => {
  test("'not resistant' is not the point 'resistant'; 'not killed by antibiotics' is", () => {
    const s: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["resistant", "antibiotics do not work", "not killed by antibiotics"], marks: 1 }, { any: ["spread"], marks: 1 }], listingRule: false };
    expect(markText("they are not resistant and they spread easily", s).marksAwarded).toBe(1);
    expect(markText("they are resistant and they spread easily", s).marksAwarded).toBe(2);
    expect(markText("they are not killed by antibiotics and they spread easily", s).marksAwarded).toBe(2);
  });
});

// Build-9 gate, class 1 (the verifier and the lead, 29 Sep 2026): the negation model. A negator's scope is its own verb
// phrase; a reduction word (reduce, lower, decrease, less, fewer) governing a quantity is the reduction, not a denial; a
// key whose point is itself a reduction or an avoidance is denied by "not" before it; "cannot get onto", "stop X
// entering" and "prevent X" are the harm-avoided form of "stop/reduce X"; a negated avoidance or reduction ("does not
// reduce contamination") denies the point; the model's own negation counts only about the same subject.
describe("negation: a reduction is not a denial, and a denied avoidance is (build-9 gate, class 1)", () => {
  test("b2-health .0007(c) 'to reduce or stop contamination / microorganisms from the air entering the dish'", () => {
    const s: TextSpec = {
      kind: "text",
      accepted: ["to stop microorganisms from the air landing on the agar and contaminating it"],
      keyWords: [{ any: ["microorganisms from the air", "microorganisms in the air", "microbes in the air", "airborne", "contaminate", "contamination", "landing on the agar", "getting onto the agar"], marks: 1 }],
      listingRule: false,
    };
    const model = ["To stop microorganisms from the air landing on the agar and contaminating the culture."];
    const mark = (t: string) => markText(t, s, { model }).marksAwarded;
    // The harm-avoided forms earn: the key is what the lid keeps out.
    for (const right of ["so that microorganisms from the air cannot get onto the agar", "so microbes in the air can't land on it", "to reduce contamination", "to prevent microorganisms from the air contaminating the agar", "microorganisms in the air could land on the agar and contaminate it", "less chance of microbes in the air getting in"]) {
      expect(mark(right), right).toBe(1);
    }
    // A denied reduction or avoidance says the harm is not avoided.
    for (const wrong of ["it does not reduce contamination", "it does not stop microorganisms from the air getting in", "opening it wide does not reduce contamination"]) {
      expect(mark(wrong), wrong).toBe(0);
    }
  });
  test("b2-health .0022(d) 'to reduce or stop the growth of pathogens / harmful bacteria'", () => {
    const s: TextSpec = { kind: "text", accepted: ["to avoid growing pathogens, the bacteria that cause disease in humans"], keyWords: [{ any: ["pathogen", "harmful bacteria", "harmful microorganisms", "dangerous bacteria", "cause disease", "causes disease", "cause illness"], marks: 1 }], listingRule: false };
    const model = ["To avoid growing pathogens: bacteria that cause disease in humans are adapted to body temperature, 37 °C, so keeping the dish at 25 °C or below makes it unlikely that any will grow."];
    const mark = (t: string) => markText(t, s, { model }).marksAwarded;
    for (const right of ["so that pathogens do not grow", "to stop harmful bacteria growing", "pathogens could grow", "at 37 °C pathogens that cause disease in humans would grow", "no harmful bacteria can grow"]) expect(mark(right), right).toBe(1);
    // Her "not" denies the harm itself: the bacteria do not cause disease is the opposite of the point.
    for (const wrong of ["so the bacteria grow quickly and do not cause disease", "the bacteria are not harmful bacteria"]) expect(mark(wrong), wrong).toBe(0);
  });
  test("b2-health .0018(b) 'colonies of a different type, or colonies growing away from the streak lines'", () => {
    const s: TextSpec = { kind: "text", accepted: ["it has colonies of other kinds, away from the streak lines"], keyWords: [{ any: ["other kinds", "different colonies", "not all the same", "away from the streak", "not on the streak", "off the streak", "on the streak"], marks: 1 }], listingRule: false };
    const model = ["The right-hand plate has colonies of other kinds, larger and differently shaped, and they grow away from the streak lines, so they did not come from the loop."];
    expect(markText("there are colonies off the streak lines", s, { model }).marksAwarded).toBe(1);
    // "no colonies off the streak lines" denies the evidence; "not on the streak" is not "off the streak" with a "no".
    expect(markText("there are no colonies off the streak lines", s, { model }).marksAwarded).toBe(0);
    // An entry that is itself the negation of her key ("not on the streak") waives her "no".
    expect(markText("there are no colonies on the streak lines", s, { model }).marksAwarded).toBe(1);
  });
  test("b2-natural-selection .0011(b) 'the antibiotic killed the non-resistant bacteria (or the resistant ones survived)'", () => {
    // The live group holds "non resistant bacteria cannot survive": with its two operators off it reads as her key, and
    // it must not waive her "non" (an entry waives only when it is her key under one operator).
    const s: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["non resistant bacteria died", "non resistant bacteria did not survive", "non resistant bacteria cannot survive", "resistant bacteria survived", "resistant bacteria survive"], marks: 1 }, { any: ["reproduce", "reproduced", "offspring"], marks: 1 }], listingRule: false };
    const model = ["The antibiotic killed the bacteria that were not resistant, so the resistant bacteria survived, reproduced and passed on the gene for resistance."];
    expect(markText("the resistant bacteria survived and reproduced", s, { model }).marksAwarded).toBe(2);
    // "non-resistant bacteria survived" holds the key "resistant bacteria survived" under its "non": the opposite of the point.
    expect(markText("the non-resistant bacteria survived", s, { model }).marksAwarded).toBe(0);
  });
  test("c2-combustion .0007 'so the blood can carry less oxygen'", () => {
    const s: TextSpec = {
      kind: "text",
      accepted: ["it combines with haemoglobin in the blood, so less oxygen is carried round the body", "it binds to haemoglobin, so the blood can carry less oxygen"],
      keyWords: [
        { any: ["haemoglobin", "hemoglobin"], marks: 1, reject: ["plasma"] },
        { any: ["carry less oxygen", "capacity to carry oxygen", "cannot carry oxygen", "reduces the oxygen", "less oxygen is carried", "reducing its capacity", "reducing the capacity"], marks: 1, reject: ["increases the capacity", "carry more oxygen", "more oxygen"] },
      ],
      listingRule: false,
    };
    const model = ["Carbon monoxide combines with haemoglobin in the blood, so the blood can carry less oxygen."];
    const mark = (t: string) => markText(t, s, { model }).marksAwarded;
    // A reduction verb governing the capacity is the reduction the point names; "carries" is "carry".
    for (const right of ["it combines with haemoglobin, which reduces the blood's capacity to carry oxygen", "it combines with haemoglobin, reducing the blood's capacity to carry oxygen", "it binds to haemoglobin so the blood carries less oxygen", "it binds to haemoglobin so the blood can carry less oxygen", "it binds to haemoglobin so the blood cannot carry oxygen"]) {
      expect(mark(right), right).toBe(2);
    }
    // A reduction key denied by "not", and a denied reduction of the capacity, are denials of the point.
    for (const wrong of ["it binds to haemoglobin but does not carry less oxygen", "it combines with haemoglobin but it does not reduce the capacity to carry oxygen", "it combines with haemoglobin, which does not reduce the capacity to carry oxygen", "it binds to haemoglobin but does not reduce the oxygen carried", "it binds to haemoglobin so the blood can carry more oxygen"]) {
      expect(mark(wrong), wrong).toBe(1);
    }
  });
  test("b2-heart-attacks .0008(c) 'figures: 26% against 21%': a reduction verb governing the figure is the reduction", () => {
    const s: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["300 mg", "the higher dose", "less effective"], marks: 1 }, { any: ["21%", "21 per cent", "26%", "5% more"], marks: 1 }], listingRule: false };
    const model = ["She is in the under 65 kg group, where dose B, 300 mg, lowers the risk by 26% but dose A, 150 mg, by only 21%."];
    expect(markText("150 mg only reduces her risk by 21%, which is less than 300 mg", s, { model }).marksAwarded).toBe(2);
    expect(markText("150 mg only lowers her risk by 21%, which is less than 300 mg", s, { model }).marksAwarded).toBe(2);
    // The reduction denied: the figure is denied with it.
    expect(markText("it does not reduce her risk by 21%", s, { model }).marksAwarded).toBe(0);
    expect(markText("no dose reduces her risk by 21%", s, { model }).marksAwarded).toBe(0);
  });
  test("a reject word in an inflected form does not fire under her own 'not' (b2-heart-attacks .0004(c))", () => {
    const s: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["less sticky", "not as sticky"], marks: 1, reject: ["lowers cholesterol"] }, { any: ["less likely to clot", "fewer clots"], marks: 1, reject: ["lowers cholesterol"] }], listingRule: false };
    expect(markText("it doesn't lower cholesterol, it makes platelets less sticky so fewer clots form", s).marksAwarded).toBe(2);
    expect(markText("it did not lower cholesterol; it makes the platelets less sticky", s).marksAwarded).toBe(1);
    expect(markText("it lowers cholesterol and makes platelets less sticky", s).marksAwarded).toBe(0);
  });
  test("a double negation is positive only when both negate the same verb", () => {
    const s: TextSpec = { kind: "text", accepted: [], keyWords: [{ any: ["contamination"], marks: 1 }], listingRule: false };
    // Two plain negators on one verb cancel; a "not" on an avoidance verb does not (the point is the avoidance).
    expect(markText("there is not no contamination", s).marksAwarded).toBe(1);
    const avoided: TextSpec = { kind: "text", accepted: ["to prevent contamination"], keyWords: [{ any: ["contamination"], marks: 1 }], listingRule: false };
    expect(markText("it does not prevent contamination", avoided).marksAwarded).toBe(0);
    expect(markText("it prevents contamination", avoided).marksAwarded).toBe(1);
  });
  test("the E-NEG-POINT set still earns (the B2 E author, 29 Sep 2026)", () => {
    const lid: TextSpec = { kind: "text", accepted: ["to stop microorganisms from the air landing on the agar and contaminating it"], keyWords: [{ any: ["microorganisms from the air", "from the air", "other microorganisms", "contaminate", "contamination", "contaminated"], marks: 1 }], listingRule: false };
    for (const t of ["to prevent contamination from microorganisms in the air", "to stop other microorganisms getting in", "to prevent the agar being contaminated"]) expect(markText(t, lid).marksAwarded, t).toBe(1);
    const dose: TextSpec = { kind: "text", accepted: ["so patients are given no more antibiotic than they need, with fewer side effects and less overuse"], keyWords: [{ any: ["no more than", "side effect", "overuse", "resistant", "superbug", "not too much"], marks: 1 }], listingRule: false };
    for (const t of ["to reduce side effects", "to stop bacteria becoming resistant like MRSA", "to prevent superbugs"]) expect(markText(t, dose).marksAwarded, t).toBe(1);
  });
  test("phraseIn: a word ending in -y matches its -ies and -ied forms, and back", () => {
    expect(markText("the blood carries less oxygen", ks([["carry less oxygen"]])).marksAwarded).toBe(1);
    expect(markText("the blood carried less oxygen", ks([["carries less oxygen"]])).marksAwarded).toBe(1);
    expect(markText("the blood can carry less oxygen", ks([["carries less oxygen"]])).marksAwarded).toBe(1);
  });
});

// The point is a plain negation the model states of a sibling word of the group: her negation of the sibling says the
// same ("the active site is not the right shape for them" for "their shapes are not complementary"; b1 enzymes .0004(b),
// a regression the gate probe caught on 29 Sep 2026). An avoidance in the model ("to avoid growing pathogens") is not
// such a negation: "do not cause disease" stays a denial.
describe("her negation of a sibling word, where the model plainly negates one of the group", () => {
  test("b1-enzymes .0004(b) 'P1 their shapes are not complementary to the active site'", () => {
    const s: TextSpec = { kind: "text", accepted: ["their shapes are not complementary to the active site so they cannot fit into it"], keyWords: [{ any: ["shape", "complementary"], marks: 1 }, { any: ["active site"], marks: 1 }], listingRule: false };
    const model = ["The shapes of B and C are not complementary to the active site, so neither can fit into it, no enzyme-substrate complex forms and no reaction takes place."];
    expect(markText("the active site is not the right shape for them", s, { model }).marksAwarded).toBe(2);
    // The plain "complementary" still contradicts the point (the group is not paid through "shape").
    expect(markText("their shape is complementary to the active site so they fit", s, { model }).marksAwarded).toBe(1);
  });
});

// The corpus guard (29 Sep 2026): the model's own "Without light the leaf cannot photosynthesise, but it goes on
// respiring" lost its first point, because the "without" three words back was read as governing "cannot
// photosynthesise". "Without" governs its own object only, and a key that starts with its own operator takes a plain
// negator only right before it.
describe("a key that starts with its own operator, and the reach of 'without'", () => {
  test("b1 leaf-structure .0005(b) 'P1 no photosynthesis (no light)': the worked solution earns its point", () => {
    const s: TextSpec = { kind: "text", accepted: ["in the dark the plant cannot photosynthesise but it still respires"], keyWords: [{ any: ["cannot photosynthesise", "no photosynthesis", "could not photosynthesise"], marks: 1 }, { any: ["respir"], marks: 1 }], listingRule: false };
    expect(markText("Without light the leaf cannot photosynthesise, but it goes on respiring, which releases carbon dioxide.", s).marksAwarded).toBe(2);
    expect(markText("The leaf does not stop photosynthesising without light", s).marksAwarded).toBe(0);
    expect(markText("without light", ks([["light"]])).marksAwarded).toBe(0);
    expect(markText("without the sun the light reaches the leaf", ks([["light"]])).marksAwarded).toBe(1);
  });
});

// Build-9 gate, class 1, the Unit 7 author's case (7 Oct 2026): a key whose point is itself a negation ("no photosynthesis",
// "did not photosynthesise", "no starch") is matched by her negated form of the same verb, whatever negation stands earlier
// in her sentence; it is denied only by a negation of that negation. "Because it did not get light it did not
// photosynthesise" was read as the first "not" governing the second key, and the right answer lost a mark.
describe("negation: a key that carries its own negator states its own polarity (build-9 gate, class 1, Unit 7)", () => {
  const s: TextSpec = {
    kind: "text",
    accepted: ["The card kept the light out, so that part could not photosynthesise, so no starch was made there"],
    keyWords: [
      { any: ["no light", "without light", "light could not reach", "kept the light out", "in the dark", "did not get light", "didn't get light", "got no light", "dark"], marks: 1 },
      { any: ["no photosynthesis", "cannot photosynthesise", "could not photosynthesise", "did not photosynthesise", "didn't photosynthesise", "does not photosynthesise", "not photosynthesise", "photosynthesis stopped", "stops photosynthesis", "prevents photosynthesis"], marks: 1 },
      { any: ["no starch", "not make starch", "did not make starch", "could not make starch", "starch not made", "starch was not made", "no starch was made", "no starch made", "without starch"], marks: 1 },
    ],
    listingRule: false,
  };
  const model = ["The card kept the light out, so that part of the leaf could not photosynthesise, so no starch was made there and the iodine stayed yellow-brown."];
  const mark = (t: string) => markText(t, s, { model }).marksAwarded;
  test("u7-carrying-out .0010(a) 'no light; no photosynthesis; no starch': her three negated keys earn three", () => {
    expect(mark("Because it did not get light it did not photosynthesise, so there is no starch")).toBe(3);
    expect(mark("no light so no photosynthesis so no starch")).toBe(3);
    expect(mark("It was in the dark, so it could not photosynthesise and no starch was made")).toBe(3);
  });
  test("one key alone is one mark; the positive statements earn nothing", () => {
    expect(mark("it did not photosynthesise")).toBe(1);
    expect(mark("the plant did photosynthesise, so there is no starch")).toBe(1);
    expect(mark("the covered part photosynthesised and made starch")).toBe(0);
    expect(mark("the leaf was not without light, it photosynthesised and made starch")).toBe(0);
  });
});

// The FM1 author (7 Oct 2026): keywordsPresent("a = 10^c", ["10"]) did not find the key word 10 inside 10^c, so a right
// line that writes the base as a power earned nothing on the key-word route. A key word is present when it appears as
// a token of the expression, including as the base or exponent of a power and inside TeX ("10^{c}").
describe("a key word is a token of the expression, the base or exponent of a power included", () => {
  test.each([
    ["a = 10^c", "10"],
    ["a = 10^{c}", "10"],
    ["2 × 10^c", "10"],
    ["a = 10^c", "c"],
    ["y = 2^x", "2"],
    ["log a = c log 10", "10"],
  ])("%s carries %s", (text, key) => {
    expect(keywordsPresent(text, [key]).all).toBe(true);
  });
  test.each([
    ["x = 100", "10"],
    ["a = 10^c", "10c"],
    ["a = 210", "10"],
  ])("%s does not carry %s", (text, key) => {
    expect(keywordsPresent(text, [key]).all).toBe(false);
  });
});

// The FM1 author (7 Oct 2026): "$X = A^{-1}B$" did not register the key word "A^-1 B". TeX braces, the caret form and
// spacing normalise to one token stream before a key word with operators is looked for.
describe("a key word with operators is found with braces and spacing normalised away", () => {
  test.each([
    ["$X = A^{-1}B$", "A^-1 B"],
    ["X = A^-1B", "A^-1 B"],
    ["$X = A^{-1}B$", "A^{-1}B"],
    ["X = A^-1 B", "A^{-1} B"],
  ])("%s carries %s", (text, key) => {
    expect(keywordsPresent(text, [key]).all).toBe(true);
  });
  test("a different power is not the key word", () => {
    expect(keywordsPresent("X = A^-2 B", ["A^-1 B"]).all).toBe(false);
    expect(keywordsPresent("X = B A^-1", ["A^-1 B"]).all).toBe(false);
  });
});

// The B2 E author (7 Oct 2026): "lung cancer and TB" scored 1/1 under the listing rule, where a right answer listed with a
// wrong one scores 0 (CCEA's general marking instructions). "TB" was read as a chemical formula beside a name: a formula
// is made of element symbols, and T is none.
describe("the listing rule counts an abbreviation as an item, not as a formula beside a name", () => {
  test("TB, DNA and MRSA are items; CO, NaCl and C2H5OH are formulae", () => {
    expect(listedItems("lung cancer and TB")).toHaveLength(2);
    expect(listedItems("MRSA and TB")).toHaveLength(2);
    expect(listedItems("ethanol, C2H5OH")).toHaveLength(1);
    expect(listedItems("carbon monoxide, CO")).toHaveLength(1);
    expect(listedItems("sodium chloride / NaCl")).toHaveLength(1);
    expect(isFormula("TB")).toBe(false);
    expect(isFormula("DNA")).toBe(false);
    expect(isFormula("CO")).toBe(true);
  });
  test("b2-health .0016(c) 'one example of a non-communicable disease': a right one listed with a wrong one is 0", () => {
    const s: TextSpec = { kind: "text", accepted: ["lung cancer"], keyWords: [{ any: ["cancer", "tumour", "diabetes", "heart disease", "stroke"], marks: 1 }], listingRule: true };
    expect(markText("lung cancer", s).marksAwarded).toBe(1);
    expect(markText("lung cancer and TB", s).marksAwarded).toBe(0);
    expect(markText("TB", s).marksAwarded).toBe(0);
  });
});

// The C2 E author (7 Oct 2026): "argon, a noble gas" scored 0 under the listing rule, the apposition read as a second
// answer. An apposition that names the class of the answer is one answer; a list is two candidates of the same kind.
describe("an apposition naming the class of the answer is one answer, not a list", () => {
  test("argon, a noble gas; helium, which is inert", () => {
    expect(listedItems("argon, a noble gas")).toHaveLength(1);
    expect(listedItems("helium, which is inert")).toHaveLength(1);
    expect(listedItems("argon, an unreactive gas")).toHaveLength(1);
    expect(listedItems("argon and neon")).toHaveLength(2);
    expect(listedItems("argon, neon")).toHaveLength(2);
    const s: TextSpec = { kind: "text", accepted: ["argon"], keyWords: [{ any: ["argon"], marks: 1 }], listingRule: true };
    expect(markText("argon, a noble gas", s).marksAwarded).toBe(1);
    expect(markText("argon, neon", s).marksAwarded).toBe(0);
  });
});

// The Unit 7 author (7 Oct 2026): u7-conclusions .0016(a) "the mass did not change after heating it again" 1/2 where "after
// heating it again the mass did not change" is 2/2. The negator's scope is its own verb phrase; a trailing time clause
// ("after heating it again") is outside it and carries its own key.
describe("negation: a trailing time clause is outside the negator's scope", () => {
  const s: TextSpec = { kind: "text", accepted: ["She heated and weighed it again until the mass did not change"], keyWords: [{ any: ["heated again", "heating it again", "heating again", "reheated", "repeated heating"], marks: 1 }, { any: ["mass did not change", "mass stayed the same", "constant mass"], marks: 1 }], listingRule: false };
  const model = ["She heated and weighed it again until the mass did not change."];
  test("the mass did not change after heating it again earns both", () => {
    expect(markText("the mass did not change after heating it again", s, { model }).marksAwarded).toBe(2);
    expect(markText("after heating it again the mass did not change", s, { model }).marksAwarded).toBe(2);
    expect(markText("the mass did not change before heating it again", s, { model }).marksAwarded).toBe(2);
  });
  test("a negated key stays negated: she did not heat it again earns only the mass point", () => {
    expect(markText("she did not heat it again and the mass stayed the same", s, { model }).marksAwarded).toBe(1);
  });
});

// Mutation survivors pinned (7 Oct 2026): three rules of the negation model whose tests had not reached them.
describe("negation model: cannot, every occurrence, the subject's negator", () => {
  test("G1 cannot is a plain negator: a key word under cannot earns nothing", () => {
    expect(markText("the plant cannot photosynthesise", ks([["photosynthesise"]])).marksAwarded).toBe(0);
    expect(markText("the plant can photosynthesise", ks([["photosynthesise"]])).marksAwarded).toBe(1);
  });
  test("G10 a negated point needs every occurrence of her key negated: a contradictory answer earns nothing", () => {
    const s: TextSpec = { kind: "text", accepted: ["their shapes are not complementary to the active site"], keyWords: [{ any: ["complementary"], marks: 1 }], listingRule: false };
    const model = ["Their shapes are not complementary to the active site, so they do not fit."];
    expect(markText("their shapes are not complementary", s, { model }).marksAwarded).toBe(1);
    expect(markText("one shape is complementary and the other shape is not complementary", s, { model }).marksAwarded).toBe(0);
  });
  test("G15 a negator on the subject of the key's own verb negates its statement: no dose reduces the risk", () => {
    const s = ks([["reduces the risk", "lowers the risk"]]);
    expect(markText("a bigger dose reduces the risk", s).marksAwarded).toBe(1);
    expect(markText("no dose reduces the risk", s).marksAwarded).toBe(0);
  });
});

// Build-9 gate (the B2 author, 8 Oct 2026), wrong answers paid: b2-monohybrid .0003(a) paid "B and B" and "b and b" for a
// Bb pony's gametes, where CCEA's 2024 Foundation scheme pays only "B and b". A key word made of allele letters (single
// letters joined by and/or/comma, or an allele pair such as Bb) is matched case-sensitively against the accepted
// answers' letters, in either order; ordinary words stay case-insensitive.
describe("allele letters are matched case-sensitively; ordinary words are not", () => {
  const gametes: TextSpec = { kind: "text", accepted: ["B and b", "B or b"], keyWords: [{ any: ["b and b", "b or b"], marks: 1 }], listingRule: false };
  test("B and b (either order) earns; B and B, b and b earn nothing", () => {
    for (const right of ["B and b", "b and B", "B or b"]) expect(markText(right, gametes).marksAwarded, right).toBe(1);
    for (const wrong of ["B and B", "b and b", "BB and bb"]) expect(markText(wrong, gametes).marksAwarded, wrong).toBe(0);
  });
  test("a genotype key word keeps its case; a word key word does not", () => {
    const genotype: TextSpec = { kind: "text", accepted: ["Bb"], keyWords: [{ any: ["Bb"], marks: 1 }], listingRule: false };
    expect(markText("Bb", genotype).marksAwarded).toBe(1);
    expect(markText("bB", genotype).marksAwarded).toBe(1);
    expect(markText("BB", genotype).marksAwarded).toBe(0);
    expect(markText("bb", genotype).marksAwarded).toBe(0);
    const word: TextSpec = { kind: "text", accepted: ["heterozygous"], keyWords: [{ any: ["heterozygous"], marks: 1 }], listingRule: false };
    expect(markText("Heterozygous", word).marksAwarded).toBe(1);
    expect(markText("HETEROZYGOUS", word).marksAwarded).toBe(1);
  });
});

// Two M8 sine-rule steps (8 Oct 2026). WE03 step 1 regressed under the allele rule: "YZ" is a side, not an allele pair,
// so "cosine rule, YZ is opposite x" lost its key word. An allele key is one letter in two cases or repeated (Bb, bb, BB,
// Tt), or single letters of that kind joined by and/or; two different capitals are a name and stay case-insensitive.
// WE01 step 4 "BC = 9.6sin(52)/sin(57)" had never found "sin(57)" after the slash: an operator before or after a key word
// is a boundary, as a space is.
describe("a two-letter name is not an allele pair, and an operator is a word boundary", () => {
  test("m8 sine-rule WE03 step 1: YZ is found in 'cosine rule, YZ is opposite x'", () => {
    const s: TextSpec = { kind: "text", accepted: ["The cosine rule, with YZ opposite x"], keyWords: [{ any: ["cosine rule", "cosine", "cos rule"], marks: 1, reject: ["sine rule"] }, { any: ["YZ", "13.6"], marks: 1 }], listingRule: false };
    for (const right of ["cosine rule, YZ is opposite x", "YZ is opposite x, cosine rule", "cosine rule with yz opposite x"]) expect(markText(right, s).marksAwarded, right).toBe(2);
  });
  test("m8 sine-rule WE01 step 4: sin(57) after a slash is the key word sin(57)", () => {
    const s: TextSpec = { kind: "text", accepted: ["BC = 9.6 sin 52 / sin 57"], keyWords: [{ any: ["9.6 sin 52", "9.6sin52", "9.6sin(52)", "9.6 sin(52)"], marks: 1 }, { any: ["sin 57", "sin57", "sin(57)"], marks: 1 }], listingRule: false };
    for (const right of ["BC = 9.6sin(52)/sin(57)", "BC = 9.6 sin(52) / sin(57)", "9.6sin52/sin57"]) expect(markText(right, s).marksAwarded, right).toBe(2);
  });
});
