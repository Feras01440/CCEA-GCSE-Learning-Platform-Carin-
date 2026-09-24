import type { TopicMastery } from "@/lib/db/db";
import { topicsFor, type Subject, type TopicInfo } from "@/lib/content/taxonomy";
import { isTypedSubject, planUnits, type ExamPlan } from "./exam-plan";
import { LEVEL_ORDER } from "@/lib/mastery/engine";

export interface NextStep {
  subject: Subject;
  unit: string;
  topic: TopicInfo;
  reason: string;
  href: string;
}

/**
 * weakest × marks-at-stake × proximity-to-paper (plan §4.2), over the units of her plan and nothing else: a unit
 * with a paper still to come, and Unit 7 while its Booklet Bs are (the lead's ruling of 23 September 2026: M3 and
 * M7 are content she can reach from Learn, not her papers, so they are never Today's next step).
 *
 * `isBuilt` keeps the step to a topic with a lesson here. A step that opens on a page with nothing to learn from is
 * not a step; only when nothing built is left in her plan does an unbuilt topic stand in.
 *
 * Difficulty is the examiner-reported hardness (5 = repeatedly worst answered), which is the best proxy for
 * marks at stake until the mined tariff statistics are wired in.
 */
export function chooseNextStep(
  plan: ExamPlan,
  mastery: TopicMastery[],
  today: string,
  isBuilt?: (subject: Subject, slug: string) => boolean,
): NextStep | null {
  const byKey = new Map(mastery.map((m) => [m.key, m]));
  // Units with a sitting still to come, in a subject whose topics the taxonomy knows.
  const units = planUnits(plan, today).filter((u) => u.paper !== null && u.daysAway >= 0 && isTypedSubject(u.subject));
  if (!units.length) return null;

  let best: { score: number; step: NextStep } | null = null;
  let bestUnbuilt: { score: number; step: NextStep } | null = null;
  for (const u of units) {
    const proximity = u.daysAway <= 14 ? 3 : u.daysAway <= 42 ? 2 : u.daysAway <= 120 ? 1.3 : 1;
    const subject = u.subject as Subject;
    for (const t of topicsFor(subject, u.unit)) {
      const m = byKey.get(`${subject}:${t.slug}`);
      const level = LEVEL_ORDER.indexOf(m?.level ?? "not-started");
      if (level >= LEVEL_ORDER.indexOf("proficient")) continue;
      const weakness = 1 + (LEVEL_ORDER.indexOf("proficient") - level) * 0.35;
      const stake = t.difficulty >= 5 ? 3 : t.difficulty === 4 ? 2 : t.difficulty === 3 ? 1.2 : 0.8;
      const score = weakness * stake * proximity;
      const built = isBuilt ? isBuilt(subject, t.slug) : true;
      const current = built ? best : bestUnbuilt;
      if (!current || score > current.score) {
        const evidence = t.examinerEvidence[0];
        const reason = evidence
          ? `${evidence.series}${evidence.unit ? ` ${evidence.unit}` : ""}: ${evidence.note}`
          : t.difficulty >= 4
            ? "Examiners flag this topic as one where marks are lost."
            : "Next in teaching order for your papers.";
        const entry = { score, step: { subject, unit: u.unit, topic: t, reason, href: `/learn/${subject}/${u.unit}/${t.slug}/` } };
        if (built) best = entry;
        else bestUnbuilt = entry;
      }
    }
  }
  return best?.step ?? bestUnbuilt?.step ?? null;
}

/** Trim an examiner note for a tile: first sentence, max ~140 chars. */
export function shortReason(reason: string, max = 150): string {
  // The split keeps the delimiter on the first clause; a clause cut at a semicolon ends as a sentence on Today.
  const first = (reason.split(/(?<=[.;])\s/)[0] ?? reason).replace(/;$/, ".");
  return first.length > max ? first.slice(0, max - 1).trimEnd() + "…" : first;
}
