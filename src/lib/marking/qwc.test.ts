import { describe, expect, test } from "vitest";
import { QWC_DEFAULT_MIN_WORDS, qwcBandFor, qwcBandRange, qwcEvidence, qwcSuggestedMarks, qwcSummary, qwcWordCount, type LongTextSpec } from "./qwc";

/** The shape every authored six-mark part uses: four bands, seven indicative points, each with key words. */
const respiration: LongTextSpec = {
  kind: "text-long",
  rubricId: "sci.qwc.b1.aerobic-respiration",
  selfMark: true,
  bands: [
    { band: "A", marks: [5, 6], descriptor: "Five or six of the indicative points, described in detail, specialist terms used widely and accurately." },
    { band: "B", marks: [3, 4], descriptor: "Three or four of the indicative points; some specialist vocabulary." },
    { band: "C", marks: [1, 2], descriptor: "One or two of the indicative points; little specialist vocabulary." },
    { band: "0", marks: [0, 0], descriptor: "Nothing creditworthy." },
  ],
  indicativeContent: [
    { point: "glucose is used", keyWords: ["glucose"] },
    { point: "oxygen is used", keyWords: ["oxygen"] },
    { point: "carbon dioxide is produced", keyWords: ["carbon dioxide"] },
    { point: "water is produced", keyWords: ["water"] },
    { point: "it takes place in the mitochondria", keyWords: ["mitochondri"] },
    { point: "energy is released continuously", keyWords: ["release", "exothermic"] },
    { point: "a use for the energy: growth or heat", keyWords: ["growth", "heat"] },
  ],
};

const found = (text: string) => qwcEvidence(text, respiration).points.filter((p) => p.present).map((p) => p.point);

describe("qwcEvidence", () => {
  test("reports every indicative point, with the key words the answer actually contains", () => {
    const ev = qwcEvidence("Glucose reacts with oxygen; carbon dioxide and water are the products.", respiration);
    expect(ev.total).toBe(7);
    expect(ev.found).toBe(4);
    expect(ev.points.map((p) => p.present)).toEqual([true, true, true, true, false, false, false]);
    expect(ev.points[0]).toMatchObject({ index: 0, point: "glucose is used", found: ["glucose"] });
    expect(ev.points[4]).toMatchObject({ present: false, found: [] });
  });

  test("a point with several key words is evidenced by any one of them, and every hit is quoted", () => {
    expect(qwcEvidence("The reaction is exothermic.", respiration).points[5]).toMatchObject({ present: true, found: ["exothermic"] });
    expect(qwcEvidence("Energy is released, so it is exothermic.", respiration).points[5]!.found).toEqual(["release", "exothermic"]);
    expect(qwcEvidence("The seedling uses it for growth and gives off heat.", respiration).points[6]!.found).toEqual(["growth", "heat"]);
  });

  test("an inflected word still shows the key word's evidence", () => {
    // "mitochondri" ~ "mitochondria", "release" ~ "releasing" / "released": the text-marking stem rules.
    expect(found("It happens in the mitochondria, releasing energy.")).toEqual(["it takes place in the mitochondria", "energy is released continuously"]);
    expect(found("Glucoses are broken down in the mitochondrion.")).toEqual(["glucose is used", "it takes place in the mitochondria"]);
    // A stem is not a licence to match anything: "watery" is not "water", "heated" is.
    expect(found("The mixture is heated.")).toEqual(["a use for the energy: growth or heat"]);
  });

  test("a phrase key word needs the phrase", () => {
    expect(qwcEvidence("Carbon dioxide is given out.", respiration).points[2]!.present).toBe(true);
    expect(qwcEvidence("Carbon and dioxide are given out.", respiration).points[2]!.present).toBe(false);
  });

  test("nothing typed is evidence of nothing, and that is band 0", () => {
    const ev = qwcEvidence("   ", respiration);
    expect(ev.found).toBe(0);
    expect(ev.wordCount).toBe(0);
    expect(ev.band?.band).toBe("0");
    expect(ev.suggestedMarks).toBe(0);
  });

  test("the word count counts words, not punctuation", () => {
    expect(qwcWordCount("Glucose reacts with oxygen — that is respiration.")).toBe(7);
    expect(qwcWordCount("  ")).toBe(0);
  });
});

describe("band suggestion", () => {
  test("the band is the one whose range covers the count of points", () => {
    expect(qwcEvidence("Glucose.", respiration).band?.band).toBe("C");
    expect(qwcEvidence("Glucose and oxygen and water.", respiration).band?.band).toBe("B");
    expect(qwcEvidence("Glucose, oxygen, water, carbon dioxide and the mitochondria.", respiration).band?.band).toBe("A");
  });

  test("more points than the top band is still the top band, never off the scale", () => {
    const all = "Glucose and oxygen react in the mitochondria, producing carbon dioxide and water and releasing energy for growth.";
    const ev = qwcEvidence(all, respiration);
    expect(ev.found).toBe(7);
    expect(ev.band?.band).toBe("A");
    // Six points found, six marks available: the floor is still 5. Counting key words never awards the top of a band.
    expect(ev.suggestedMarks).toBe(5);
    expect(qwcSuggestedMarks(all, respiration)).toBe(5);
  });

  test("the suggestion is the floor of the band, whatever order the bands were authored in", () => {
    const shuffled = [...respiration.bands].reverse();
    expect(qwcBandFor(4, shuffled)?.band).toBe("B");
    expect(qwcBandFor(9, shuffled)?.band).toBe("A");
    expect(qwcBandFor(0, shuffled)?.band).toBe("0");
    expect(qwcBandFor(2, [])).toBeNull();
  });

  test("a range with a gap in it falls back to the best band the count has cleared", () => {
    const gapped: LongTextSpec["bands"] = [
      { band: "top", marks: [4, 5], descriptor: "top" },
      { band: "low", marks: [1, 2], descriptor: "low" },
    ];
    expect(qwcBandFor(3, gapped)?.band).toBe("low");
    expect(qwcBandFor(0, gapped)?.band).toBe("low");
    expect(qwcBandFor(6, gapped)?.band).toBe("top");
  });

  test("no indicative content authored leaves the band to the descriptors", () => {
    const ev = qwcEvidence("Some prose.", { ...respiration, indicativeContent: [] });
    expect(ev.band).toBeNull();
    expect(ev.suggestedMarks).toBe(0);
    expect(qwcSummary(ev)).toMatch(/place the answer on the band descriptors/);
  });

  test("a band's range reads as marks", () => {
    expect(qwcBandRange(respiration.bands[0]!)).toBe("5–6 marks");
    expect(qwcBandRange(respiration.bands[3]!)).toBe("0 marks");
    expect(qwcBandRange({ band: "one", marks: [1, 1], descriptor: "d" })).toBe("1 mark");
  });
});

describe("minWords", () => {
  const twentyTwo = "one two three four five six seven eight nine ten and one two three four five six seven eight nine ten again";

  test("twenty words is the default gate", () => {
    expect(QWC_DEFAULT_MIN_WORDS).toBe(20);
    const short = qwcEvidence("Glucose reacts with oxygen.", respiration);
    expect(short.minWords).toBe(20);
    expect(short.longEnough).toBe(false);
    expect(qwcEvidence(twentyTwo, respiration).longEnough).toBe(true);
  });

  test("an authored minimum replaces it and is named in the summary", () => {
    const spec: LongTextSpec = { ...respiration, minWords: 60 };
    const ev = qwcEvidence(twentyTwo, spec);
    expect(ev.minWords).toBe(60);
    expect(ev.wordCount).toBe(22);
    expect(ev.longEnough).toBe(false);
    expect(qwcSummary(ev)).toMatch(/At 22 words it is shorter than the 60 this part asks for\./);
    expect(qwcSummary(qwcEvidence(twentyTwo, respiration))).not.toMatch(/shorter than/);
  });
});

describe("qwcSummary", () => {
  test("evidence, what is not there yet, and where the count alone puts it", () => {
    const s = qwcSummary(qwcEvidence("Glucose reacts with oxygen in the mitochondria, releasing energy for growth. " + "The seedling grows taller and feels warm because of it, which is what the cupboard test shows.", respiration));
    expect(s).toMatch(/^Evidence found for 5 of 7 points: glucose, oxygen, mitochondri, release, growth\./);
    expect(s).toMatch(/Not yet: carbon dioxide, water\./);
    expect(s).toMatch(/On the descriptors that is band A, 5–6 marks\./);
  });

  test("an empty answer is told what is not there yet, never that it is wrong", () => {
    const s = qwcSummary(qwcEvidence("", respiration));
    expect(s).toMatch(/^Evidence found for none of the 7 points\./);
    expect(s).toMatch(/On the descriptors that is band 0, 0 marks\./);
    expect(s).not.toMatch(/wrong/i);
  });

  test("everything found drops the \"not yet\" clause", () => {
    const s = qwcSummary(qwcEvidence("Glucose and oxygen react in the mitochondria, producing carbon dioxide and water and releasing energy for growth.", respiration));
    expect(s).not.toMatch(/Not yet/);
    expect(s).toMatch(/Evidence found for 7 of 7 points/);
  });
});
