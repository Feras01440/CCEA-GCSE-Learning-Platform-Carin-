import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DeckFile } from "@/lib/content/deck-schema";
import { buildSubject } from "../../../pipeline/mine/build-insights.mjs";
import maths from "../../../pipeline/mine/insights-source/maths.mjs";

/**
 * Citation fixes of 8 Oct 2026 (the lead's open item 9): each citation below named a report question that does not say
 * what the citing line claimed. Checked against the CER blocks, the question papers and the mark schemes.
 */
const ROOT = path.resolve(__dirname, "../../..");
const json = (rel: string) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
type Evidence = { series: string; unit: string; note: string };
type Topic = { slug: string; examinerEvidence: Evidence[] };

describe("maths taxonomy: Summer 2023 M8 Paper 2 Q13 is inverse proportion, not simultaneous equations", () => {
  const topics: Topic[] = json("data/spec/mathematics.json").topics;
  const bySlug = new Map(topics.map((t) => [t.slug, t]));

  it("no longer cites it for one linear and one non-linear equation, and keeps the real Paper 1 Q12 line", () => {
    const notes = bySlug.get("simultaneous-equations-linear-and-non-linear")!.examinerEvidence.map((e) => `${e.series} ${e.unit} ${e.note}`);
    expect(notes.some((n) => n.includes("Paper 2 Q13"))).toBe(false);
    expect(notes.some((n) => n.startsWith("Summer 2023 M8 Paper 1 Q12"))).toBe(true);
  });

  it("cites it for inverse proportion instead", () => {
    const ev = bySlug.get("inverse-proportion")!.examinerEvidence.find((e) => e.series === "Summer 2023" && e.note.startsWith("Paper 2 Q13"));
    expect(ev?.note).toContain("inversely proportional");
  });
});

describe("science taxonomy: Summer 2025 P1 Higher Q5(i) is the flat section of a velocity-time graph", () => {
  it("says 'constant speed' was given for the flat section, where constant velocity was wanted", () => {
    const topics: Topic[] = json("data/spec/double-award-science-topics.json").topics;
    const note = topics.find((t) => t.slug === "p1-motion-graphs")!.examinerEvidence.find((e) => e.series === "Summer 2025")!.note;
    expect(note).toContain("flat section");
    expect(note).toContain("constant velocity");
    expect(note).not.toContain("sloping");
  });
});

describe("the P1 deck's trap cards cite what the reports say", () => {
  const deck = json("data/decks/science/P1.json");
  const cards = new Map<string, { front: string; back: string; source?: string }>();
  for (const s of deck.sections) for (const t of s.topics) for (const c of t.cards) cards.set(c.id, c);

  it("is still a valid deck", () => {
    expect(DeckFile.safeParse(deck).success).toBe(true);
  });

  it("motion graphs: the sloping-line card keeps its physics and drops the report claim; a new card carries the flat-section trap", () => {
    const sloping = cards.get("fc.science.p1-motion-graphs.06")!;
    expect(sloping.front).toContain("sloping steadily upwards");
    expect(sloping.source).not.toContain("CER");
    expect(sloping.back).not.toContain("Constant speed is a horizontal line");
    const flat = cards.get("fc.science.p1-motion-graphs.10")!;
    expect(flat.front).toContain("horizontal");
    expect(flat.back).toContain("Constant velocity");
    expect(flat.source).toBe("CER Summer 2025 P1 (H)");
  });

  it("kinetic energy: the March 2026 card tells the question's story (energy lost to friction)", () => {
    const card = cards.get("fc.science.p1-kinetic-and-potential-energy.08")!;
    expect(card.front).toContain("friction");
    expect(card.front).not.toContain("already has");
    expect(card.source).toBe("CER March 2026 P1 (H)");
  });

  it("centre of gravity: the 'more area' card cites only the Summer 2025 Unit 7 report", () => {
    expect(cards.get("fc.science.p1-centre-of-gravity-stability.05")!.source).toBe("CER Summer 2025 U7B Physics");
  });
});

describe("maths registry: two entries whose reports name a different error are anticipated", () => {
  const { registry, problems } = buildSubject(maths);
  const byId = new Map<string, unknown>(registry.map((m: { id: string }) => [m.id, m] as const));

  it("builds with no problems", () => {
    expect(problems).toEqual([]);
  });

  for (const id of ["maths.percent.multiplier-is-rate-not-scale-factor", "maths.indices.equation-base-not-matched"]) {
    it(`${id} is anticipated, with no source and a note`, () => {
      const m = byId.get(id) as { anticipated?: boolean; sources: string[]; firstSeen?: string; note?: string };
      expect(m.anticipated).toBe(true);
      expect(m.sources).toEqual([]);
      expect(m.firstSeen).toBeUndefined();
      expect(m.note).toContain("No report names");
    });
  }
});
