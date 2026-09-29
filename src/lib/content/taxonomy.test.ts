import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sciSpec from "../../../data/spec/double-award-science.json";
import sciTopics from "../../../data/spec/double-award-science-topics.json";
import {
  SUBJECTS,
  catalogueUnitCode,
  difficultyLabel,
  indexSpecOutcomes,
  scienceTopicFrom,
  topicInfo,
  topicsFor,
  unitInfo,
  unitsFor,
  type CatalogueEntry,
  type SpecShape,
  type TopicInfo,
} from "./taxonomy";

const topicsOf = (subject: TopicInfo["subject"]): TopicInfo[] => unitsFor(subject).flatMap((u) => topicsFor(subject, u.code));

describe("tiers, as each specification states them (audit CT-06)", () => {
  it("GCSE Further Mathematics sets no tier: every topic and every statement is untiered", () => {
    // The FM specification (data/spec/further-mathematics.json) gives no tier to any topic or statement: every
    // candidate sits the same papers. The catalogue used to write "H" for all of them, and the topic page then printed
    // "Higher tier only" on all 73 Further Maths topics.
    const fm = topicsOf("further-maths");
    expect(fm.length).toBeGreaterThan(0);
    for (const t of fm) {
      expect(t.tier, t.slug).toBe("untiered");
      for (const s of t.statements) expect(s.tier, `${t.slug} ${s.id}`).toBe("untiered");
    }
  });

  it("the tiered qualifications keep the tiers their specifications give", () => {
    const tiered = SUBJECTS.filter((s) => s.id !== "further-maths").flatMap((s) => topicsOf(s.id));
    expect(tiered.length).toBeGreaterThan(0);
    for (const t of tiered) {
      expect(["F", "H", "mixed"], `${t.subject} ${t.slug}`).toContain(t.tier);
      for (const s of t.statements) expect(["F", "H", "mixed"], `${t.slug} ${s.id}`).toContain(s.tier);
    }
    // A Higher unit's topics are Higher (M4 and M8 are the Higher route).
    expect(topicsFor("maths", "M4").every((t) => t.tier === "H")).toBe(true);
  });
});

/* ------------------------------------------------------------------------------------------------------------------ */
/* Science topics are read from the specification's own shape (29 Sep 2026). Unit 7's four topics used to be built by */
/* a function of their own that printed every skill as its id ("U7.1.1"), rated all four 4 and dropped the evidence,  */
/* the recall lines and the keywords the catalogue holds for them.                                                     */
/* ------------------------------------------------------------------------------------------------------------------ */

const spec = sciSpec as unknown as SpecShape;
const specUnit = (code: string) => {
  const unit = spec.units.find((u) => u.code === code);
  if (!unit) throw new Error(`no specification unit ${code}`);
  return unit;
};

describe("every topic shows its specification in words", () => {
  it("no statement in any subject shows its id in place of its words", () => {
    const shown = SUBJECTS.flatMap((s) => topicsOf(s.id)).flatMap((t) => t.statements.map((st) => ({ t, st })));
    expect(shown.length).toBeGreaterThan(400);
    const bare = shown.filter(({ st }) => st.text.trim() === "" || st.text.trim() === st.id).map(({ t, st }) => `${t.subject}/${t.unit}/${t.slug} ${st.id}`);
    expect(bare).toEqual([]);
  });

  it("a statement that introduces a list keeps the list, in every science unit", () => {
    const science = topicsOf("science").flatMap((t) => t.statements.map((st) => ({ t, st })));
    const colon = science.filter(({ st }) => st.text.trim().endsWith(":"));
    expect(colon.length).toBeGreaterThan(20);
    const listless = colon.filter(({ st }) => !st.bullets?.length).map(({ st }) => st.id);
    // The one exception is data/spec/README.md's caveat 4: P2 2.3.4's list is a chart of circuit symbols, printed as
    // an image in the specification, so there are no words to carry.
    expect([...new Set(listless)]).toEqual(["P2-2.3.4"]);
    // A statement with no list carries none: the field is there only when the specification prints a list.
    expect(science.filter(({ st }) => st.bullets !== undefined && st.bullets.length === 0)).toEqual([]);
  });
});

describe("Unit 7, read like every other unit", () => {
  it("u7-planning lists its specification section's skills in the specification's words and order", () => {
    const t = topicInfo("science", "U7", "u7-planning");
    expect(t).toBeDefined();
    const section = specUnit("7").sections.find((s) => s.title === t!.strand);
    expect(section, "the strand is the specification section").toBeDefined();
    const skills = section!.topics.flatMap((x) => x.outcomes);
    expect(skills).toHaveLength(8);
    expect(t!.statements.map((s) => s.text)).toEqual(skills.map((o) => o.text));
    expect(t!.statements.map((s) => s.id)).toEqual(skills.map((_, i) => `U7.1.${i + 1}`));
    expect(t!.statements[0].text).toMatch(/^identify the dependent, independent and controlled variables/);
    expect(t!.statements[6].text).toBe("draw a diagram of the apparatus used in an experiment; and");
    // Every Unit 7 skill is printed without a tier mark: both tiers sit it, so the topic is not "some Higher".
    expect(t!.statements.every((s) => s.tier === "F")).toBe(true);
    expect(t!.tier).toBe("F");
  });

  it("each Unit 7 topic carries its own difficulty, evidence, recall lines, keywords, prerequisites, strand and links", () => {
    expect(sciTopics.unit7).toHaveLength(4);
    for (const entry of sciTopics.unit7) {
      const t = topicInfo("science", entry.unit, entry.slug);
      expect(t, entry.slug).toBeDefined();
      expect(t!.difficulty, entry.slug).toBe(entry.difficulty);
      expect(t!.examinerEvidence.length, entry.slug).toBeGreaterThan(0);
      expect(t!.examinerEvidence).toEqual(entry.examinerEvidence.map((e) => ({ series: e.series, unit: e.unit, note: e.note })));
      expect(t!.mustMemorise).toEqual(entry.mustRecall);
      expect(t!.keywords).toEqual(entry.keywords);
      expect(t!.prerequisites).toEqual(entry.prerequisites);
      expect(t!.strand).toBe(entry.sectionTitle);
      expect(t!.practicals).toEqual(entry.practicalsPractised);
      expect(t!.examinedIn).toEqual([entry.unit]);
      expect(t!.statements.map((s) => s.id)).toEqual(entry.skillIds);
      expect(t!.statements.map((s) => s.text)).toEqual(entry.skills.map((s) => s.text));
      expect(t!.links).toContainEqual(expect.objectContaining({ kind: "bitesize", url: entry.bitesize }));
    }
    // The catalogue rates carrying out an experiment 3, "Demanding": never the blanket 4 the old function printed.
    const carry = topicInfo("science", "U7", "u7-carrying-out")!;
    expect(carry.difficulty).toBe(3);
    expect(difficultyLabel(carry.difficulty)).toBe("Demanding");
    expect(topicsFor("science", "U7").map((t) => t.slug)).toEqual(sciTopics.unit7.map((e) => e.slug));
    expect(unitInfo("science", "U7")!.topicCount).toBe(4);
  });

  it("the apparatus skill keeps its list of seventeen kinds of apparatus", () => {
    const [skill] = topicInfo("science", "U7", "u7-carrying-out")!.statements;
    expect(skill.id).toBe("U7.2.1");
    expect(skill.text.endsWith("safely:")).toBe(true);
    expect(skill.bullets).toHaveLength(17);
    expect(skill.bullets![0]).toMatch(/^Bunsen burner and associated apparatus/);
    expect(skill.bullets![16]).toBe("any other appropriate apparatus.");
  });

  it("agrees with every published Unit 7 bundle on what it gives the page: the difficulty and the statements", () => {
    // The page takes a topic's title and strand from the catalogue; a bundle's own are its metadata, so a difference
    // there (u7-analysing, 29 Sep: "Analysing data" for the specification's "Analysing experimental data") is the
    // content side's to reconcile and is reported, not failed here.
    const folder = join(process.cwd(), "packs/science/content/u7");
    const published = readdirSync(folder).filter((slug) => existsSync(join(folder, slug, "bundle.json")));
    expect(published).toEqual(expect.arrayContaining(["u7-planning", "u7-carrying-out"]));
    for (const slug of published) {
      const bundle = JSON.parse(readFileSync(join(folder, slug, "bundle.json"), "utf8")) as {
        topic: { slug: string; difficulty: number; statementIds: string[]; unit: string };
      };
      const t = topicInfo("science", bundle.topic.unit, bundle.topic.slug);
      expect(t, slug).toBeDefined();
      expect(t!.difficulty, slug).toBe(bundle.topic.difficulty);
      expect(t!.statements, slug).toHaveLength(bundle.topic.statementIds.length);
    }
  });
});

describe("the science builder, on a fixture of another practical unit and a lettered unit", () => {
  // A made-up specification in the science file's shape: a lettered unit whose outcomes carry the specification's own
  // numbers, and a numbered practical unit ("8") whose skills carry none, one of them introducing a list, one section
  // split over two topics. Nothing in the builder may know either unit.
  const fixture: SpecShape = {
    units: [
      {
        code: "B9",
        sections: [
          {
            title: "Waves",
            topics: [
              {
                outcomes: [
                  { id: "9.1.1", text: "describe a transverse wave;", tier: "F", bullets: [] },
                  { id: "9.1.2", text: "explain refraction using:", tier: "H", bullets: [{ text: "a ray diagram;" }, { text: "the normal." }] },
                ],
              },
            ],
          },
        ],
      },
      {
        code: "8",
        sections: [
          {
            title: "Planning a field study",
            topics: [
              {
                outcomes: [
                  { id: null, text: "choose a sampling method;", tier: "F", bullets: [] },
                  { id: null, text: "use the following equipment:", tier: "F", bullets: [{ text: "quadrat;" }, { text: "tape measure." }] },
                ],
              },
            ],
          },
          {
            title: "Evaluating a field study",
            topics: [
              { outcomes: [{ id: null, text: "judge the reliability of a sample;", tier: "H", bullets: [] }] },
              { outcomes: [{ id: null, text: "suggest one improvement;", tier: "F", bullets: [] }] },
            ],
          },
        ],
      },
    ],
  };
  const outcomes = indexSpecOutcomes(fixture);
  const planning: CatalogueEntry = {
    slug: "u8-planning",
    unit: "U8",
    title: "Planning a field study: sampling and equipment",
    sectionTitle: "Planning a field study",
    skillIds: ["U8.1.1", "U8.1.2"],
    difficulty: 2,
    prerequisites: [],
    examinerEvidence: [{ series: "Summer 2031", unit: "U8B", note: "Quadrat written as quadrant." }],
    mustRecall: ["A quadrat is a square frame of known area."],
    keywords: ["quadrat", "sampling"],
    practicalsPractised: ["F1", "F2"],
    bitesize: "https://www.bbc.co.uk/bitesize/example",
  };

  it("writes a numbered specification unit the way the catalogue does", () => {
    expect(catalogueUnitCode("8")).toBe("U8");
    expect(catalogueUnitCode("7")).toBe("U7");
    expect(catalogueUnitCode("B9")).toBe("B9");
    expect(catalogueUnitCode("P2")).toBe("P2");
  });

  it("finds unnumbered skills by their place in their section, with their words, tiers and lists", () => {
    const t = scienceTopicFrom(planning, outcomes);
    expect(t.statements).toEqual([
      { id: "U8.1.1", text: "choose a sampling method;", tier: "F" },
      { id: "U8.1.2", text: "use the following equipment:", tier: "F", bullets: ["quadrat;", "tape measure."] },
    ]);
    expect(t.tier).toBe("F");
    expect(t.unit).toBe("U8");
    expect(t.examinedIn).toEqual(["U8"]);
  });

  it("takes the difficulty, evidence, recall lines, keywords, strand, practicals and links from the entry", () => {
    const t = scienceTopicFrom(planning, outcomes);
    expect(t.difficulty).toBe(2);
    expect(scienceTopicFrom({ ...planning, difficulty: 5 }, outcomes).difficulty).toBe(5);
    expect(t.examinerEvidence).toEqual([{ series: "Summer 2031", unit: "U8B", note: "Quadrat written as quadrant." }]);
    expect(t.mustMemorise).toEqual(["A quadrat is a square frame of known area."]);
    expect(t.keywords).toEqual(["quadrat", "sampling"]);
    expect(t.strand).toBe("Planning a field study");
    expect(t.practicals).toEqual(["F1", "F2"]);
    expect(t.links).toEqual([{ kind: "bitesize", label: "BBC Bitesize (CCEA)", url: "https://www.bbc.co.uk/bitesize/example" }]);
    expect(t.prerequisites).toEqual([]);
    expect(t.calculator).toBeNull();
  });

  it("numbers a section's skills across all of its topics, and derives the topic's tier from them", () => {
    const evaluating: CatalogueEntry = { ...planning, slug: "u8-evaluating", sectionTitle: "Evaluating a field study", skillIds: ["U8.2.1", "U8.2.2"], prerequisites: ["u8-planning"] };
    const t = scienceTopicFrom(evaluating, outcomes);
    expect(t.statements.map((s) => s.text)).toEqual(["judge the reliability of a sample;", "suggest one improvement;"]);
    expect(t.statements.map((s) => s.tier)).toEqual(["H", "F"]);
    expect(t.tier).toBe("mixed");
    expect(t.prerequisites).toEqual(["u8-planning"]);
    expect(scienceTopicFrom({ ...evaluating, skillIds: ["U8.2.1"] }, outcomes).tier).toBe("H");
  });

  it("reads a lettered unit's topics by the specification's own numbers, as before", () => {
    const waves: CatalogueEntry = {
      slug: "b9-waves",
      unit: "B9",
      title: "Transverse waves and refraction",
      sectionTitle: "Waves",
      outcomeIds: ["9.1.1", "9.1.2"],
      outcomeTiers: { "9.1.1": "F", "9.1.2": "H" },
      tier: "mixed",
      difficulty: 3,
      prerequisites: [],
      examinerEvidence: [],
      practicals: ["P9"],
      phet: [{ name: "Bending Light", url: "https://phet.example/bending-light" }],
    };
    const t = scienceTopicFrom(waves, outcomes);
    expect(t.statements).toEqual([
      { id: "B9-9.1.1", text: "describe a transverse wave;", tier: "F" },
      { id: "B9-9.1.2", text: "explain refraction using:", tier: "H", bullets: ["a ray diagram;", "the normal."] },
    ]);
    expect(t.tier).toBe("mixed");
    expect(t.practicals).toEqual(["P9"]);
    expect(t.links).toEqual([{ kind: "phet", label: "PhET: Bending Light", url: "https://phet.example/bending-light" }]);
    expect(t.mustMemorise).toEqual([]);
    expect(t.keywords).toEqual([]);
  });

  it("falls back to the entry's own words for a skill the specification does not have, and to the id only as a last resort", () => {
    const stray: CatalogueEntry = { ...planning, skillIds: ["U8.3.1", "U8.3.2"], skills: [{ id: "U8.3.1", text: "write a conclusion;", bullets: [] }] };
    const t = scienceTopicFrom(stray, outcomes);
    expect(t.statements.map((s) => s.text)).toEqual(["write a conclusion;", "U8.3.2"]);
    // The catalogue-wide test above keeps the last resort out of every real topic.
  });
});
