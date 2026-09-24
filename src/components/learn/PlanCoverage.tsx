"use client";

import { useExamPlan } from "@/lib/plan/store";
import { sortUnits } from "@/lib/plan/exam-plan";

/**
 * The honest denominator that matters to her (quality bar item 10): of the topics her own papers in this subject
 * examine, how many have a lesson here. Read from her plan, so it follows whatever units she is entered for; the
 * counts per unit come from the server page (the taxonomy and the published manifest), so nothing large ships here.
 */
export function PlanCoverage({ subject, units }: { subject: string; units: Record<string, { built: number; total: number; short: string }> }) {
  const plan = useExamPlan();
  if (!plan) return <p className="tnum mt-1 min-h-[1.45em] text-meta text-ink-2" aria-hidden />;
  const mine = sortUnits(
    subject,
    plan.entries.filter((e) => e.subject === subject && units[e.unit]).map((e) => e.unit),
  );
  if (mine.length === 0) return null;
  const built = mine.reduce((n, u) => n + units[u].built, 0);
  const total = mine.reduce((n, u) => n + units[u].total, 0);
  return (
    <p className="tnum mt-1 text-meta text-ink-2" data-testid="plan-coverage">
      Your units ({mine.map((u) => units[u].short).join(", ")}): {built === total ? `all ${total} topics built` : `${built} of ${total} topics built`}
    </p>
  );
}
