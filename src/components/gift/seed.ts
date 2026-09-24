/**
 * Which topic first run ends inside.
 *
 * The rule, from docs/plan/review/2026-09-19-quality-bar.md item 7: end inside a real lesson, and
 * make it a lesson that matters to her next. So the candidates are every shipped topic of the unit
 * whose paper comes soonest in her plan, in catalogue order, then the next paper's unit, and so on.
 * The seeded topic is the first candidate whose bundle opens with a hero block, because the seeded
 * lesson shows the hero's lede and one "you can" line and a note without one has neither.
 *
 * Pure on purpose. Whether a bundle has a hero is only knowable by reading the bundle, which is a
 * fetch, so that question comes in as a predicate and the ordering stays testable.
 */
import { upcomingPapers, type ExamPlan } from "@/lib/plan/exam-plan";
import { contentFor, type ManifestTopic } from "@/lib/content/load";
import { topicsFor, type Subject } from "@/lib/content/taxonomy";

export interface SeedTopic {
  subject: Subject;
  /** The unit code the catalogue uses, e.g. "M4". */
  unit: string;
  slug: string;
  /** The bundle id, e.g. "maths.m4.histograms-unequal-widths". */
  topicId: string;
  title: string;
  /** The full topic page, where the lesson continues after the seeded slice. */
  href: string;
}

/**
 * Where first run ends when her plan yields nothing shipped: a Higher maths topic on her own
 * gateway paper, with a hero, a figure, gates and practice questions.
 */
export const FALLBACK_SEED: SeedTopic = {
  subject: "maths",
  unit: "M4",
  slug: "histograms-unequal-widths",
  topicId: "maths.m4.histograms-unequal-widths",
  title: "Histograms with unequal class widths (frequency density) and estimating the median",
  href: "/learn/maths/M4/histograms-unequal-widths/",
};

/** Looks a topic up in the shipped manifest; injectable so the tests need no bundles on disk. */
export type ShippedLookup = (subject: string, slug: string) => ManifestTopic | undefined;

function seedFor(subject: Subject, unit: string, slug: string, title: string, topicId: string): SeedTopic {
  return { subject, unit, slug, topicId, title, href: `/learn/${subject}/${unit}/${slug}/` };
}

/**
 * Every shipped topic that could seed the first lesson, best first: the soonest paper's unit, in
 * the catalogue's own teaching order, then the unit of the paper after it. A paper already sat is
 * skipped, and a unit with nothing shipped simply contributes nothing.
 */
export function seedCandidates(plan: ExamPlan, today: string, shipped: ShippedLookup = contentFor): SeedTopic[] {
  const out: SeedTopic[] = [];
  const seen = new Set<string>();
  for (const paper of upcomingPapers(plan, today).filter((p) => p.daysAway >= 0)) {
    for (const t of topicsFor(paper.subject, paper.unit)) {
      const row = shipped(paper.subject, t.slug);
      if (!row || seen.has(row.id)) continue;
      seen.add(row.id);
      out.push(seedFor(paper.subject, paper.unit, t.slug, t.title, row.id));
    }
  }
  return out;
}

/**
 * The seeded topic: the first candidate whose bundle has a hero block, or the fallback when her
 * plan is empty, unshipped, or shipped without a hero anywhere in it.
 */
export function chooseSeedTopic(
  plan: ExamPlan,
  today: string,
  hasHero: (topic: SeedTopic) => boolean,
  shipped: ShippedLookup = contentFor,
): SeedTopic {
  return seedCandidates(plan, today, shipped).find(hasHero) ?? FALLBACK_SEED;
}

/** Does this bundle's note open with a hero block? The predicate `chooseSeedTopic` is usually given. */
export function blocksHaveHero(blocks: readonly unknown[] | null | undefined): boolean {
  return (blocks ?? []).some((b) => typeof b === "object" && b !== null && (b as { type?: unknown }).type === "hero");
}

/**
 * The slice of the lesson first run shows: everything up to and including the first check, and never
 * past the second heading. Pass blocks that have already been through `lessonBlocks`, so the hero's
 * opening is gone and this starts where the reading starts.
 *
 * A note whose first section has no check ends at that section's last block: there is nothing to
 * stop at, and first run says nothing about a mechanic it has not shown.
 */
export function firstSectionThroughGate<T extends { type: string }>(blocks: readonly T[]): T[] {
  const out: T[] = [];
  let headings = 0;
  for (const b of blocks) {
    if (b.type === "h") {
      headings += 1;
      if (headings > 1) break;
    }
    out.push(b);
    if (b.type === "gate") break;
  }
  return out;
}
