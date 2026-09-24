import { describe, expect, it } from "vitest";
import { chooseSeedTopic, FALLBACK_SEED, firstSectionThroughGate, seedCandidates, blocksHaveHero, type ShippedLookup } from "./seed";
import { DEFAULT_PLAN, nextPaper, todayISO, upcomingPapers } from "@/lib/plan/exam-plan";
import type { ManifestTopic } from "@/lib/content/load";

/** Every catalogue topic is shipped. Enough of a manifest row for the seed: it only reads `id`. */
const shipsEverything: ShippedLookup = (subject, slug) => ({ id: `${subject}.${slug}` }) as ManifestTopic;

/** Nothing is shipped at all: the state of a subject still being written. */
const shipsNothing: ShippedLookup = () => undefined;

const TODAY = "2026-09-20";

describe("the seeded topic for first run", () => {
  it("takes the unit of the paper that comes soonest in her plan first", () => {
    const soonest = nextPaper(DEFAULT_PLAN, TODAY);
    expect(soonest).not.toBeNull();
    const candidates = seedCandidates(DEFAULT_PLAN, TODAY, shipsEverything);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].subject).toBe(soonest!.subject);
    expect(candidates[0].unit).toBe(soonest!.unit);
    // Catalogue order inside that unit, not manifest order: the unit's first topic leads.
    const firstOfUnit = candidates.filter((c) => c.unit === soonest!.unit);
    expect(firstOfUnit[0]).toEqual(candidates[0]);
    expect(candidates[0].href).toBe(`/learn/${candidates[0].subject}/${candidates[0].unit}/${candidates[0].slug}/`);
  });

  it("walks past the papers she has already sat", () => {
    const papers = upcomingPapers(DEFAULT_PLAN, TODAY);
    const afterTheFirst = papers[0].date;
    // The day after the first paper, that paper is behind her and cannot seed the lesson.
    const later = new Date(afterTheFirst + "T00:00:00");
    later.setDate(later.getDate() + 1);
    const iso = todayISO(later); // local, not UTC: an hour of offset must not move the date
    const candidates = seedCandidates(DEFAULT_PLAN, iso, shipsEverything);
    const stillOffered = candidates.some((c) => c.subject === papers[0].subject && c.unit === papers[0].unit);
    expect(stillOffered).toBe(false);
  });

  it("keeps only a topic whose bundle has a hero", () => {
    const candidates = seedCandidates(DEFAULT_PLAN, TODAY, shipsEverything);
    const wanted = candidates[2];
    const chosen = chooseSeedTopic(DEFAULT_PLAN, TODAY, (t) => t.topicId === wanted.topicId, shipsEverything);
    expect(chosen).toEqual(wanted);
  });

  it("falls back to histograms when nothing in her plan is shipped", () => {
    expect(chooseSeedTopic(DEFAULT_PLAN, TODAY, () => true, shipsNothing)).toEqual(FALLBACK_SEED);
  });

  it("falls back when her plan is shipped but no bundle has a hero", () => {
    expect(chooseSeedTopic(DEFAULT_PLAN, TODAY, () => false, shipsEverything)).toEqual(FALLBACK_SEED);
  });

  it("slices the lesson at the first check, and never past the second heading", () => {
    const blocks = [
      { type: "h", text: "Cells" },
      { type: "p", md: "A cell is the smallest unit." },
      { type: "figure", alt: "a cell" },
      { type: "gate", id: "g1" },
      { type: "p", md: "after the gate" },
      { type: "h", text: "Under the microscope" },
      { type: "gate", id: "g2" },
    ];
    expect(firstSectionThroughGate(blocks).map((b) => b.type)).toEqual(["h", "p", "figure", "gate"]);
  });

  it("keeps the prose before the first heading, which is where the reading starts", () => {
    const blocks = [
      { type: "p", md: "an opening the hero did not take" },
      { type: "h", text: "Cells" },
      { type: "gate", id: "g1" },
    ];
    expect(firstSectionThroughGate(blocks).map((b) => b.type)).toEqual(["p", "h", "gate"]);
  });

  it("stops at the second heading when the first section has no check", () => {
    const blocks = [
      { type: "h", text: "One" },
      { type: "p", md: "prose" },
      { type: "h", text: "Two" },
      { type: "gate", id: "g1" },
    ];
    const slice = firstSectionThroughGate(blocks);
    expect(slice.map((b) => b.type)).toEqual(["h", "p"]);
    expect(slice.some((b) => b.type === "gate")).toBe(false);
  });

  it("reads the hero out of a note's blocks", () => {
    expect(blocksHaveHero([{ type: "hero", lede: "x", can: [], minutes: 4 }, { type: "p", md: "y" }])).toBe(true);
    expect(blocksHaveHero([{ type: "p", md: "y" }])).toBe(false);
    expect(blocksHaveHero(null)).toBe(false);
  });
});
