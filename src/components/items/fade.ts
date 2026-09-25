/**
 * Which steps of a worked example are shown and which the learner supplies, for each
 * fade level (pure). Backward fading: faded1 hides the last step, faded2 the last two,
 * unless the example carries its own `faded` plan.
 */
import type { WorkedExample } from "@/lib/content/schema";

export type FadeLevel = "full" | "faded1" | "faded2" | "twin" | "problem";

export type StepRole = "shown" | "input";

export interface FadePlan {
  mode: "steps" | "twin" | "problem";
  /** Steps 1..showSteps are visible from the start. */
  showSteps: number;
  /** Every step in order with its role; `input` steps are typed by the learner. */
  sequence: Array<{ n: number; role: StepRole }>;
  /** Step numbers the learner supplies. */
  supplied: number[];
}

type WeShape = Pick<WorkedExample, "steps" | "faded">;

function defaultFaded(total: number, hide: number): { showSteps: number; studentSupplies: number[] } {
  const h = Math.min(Math.max(1, hide), Math.max(1, total));
  const showSteps = Math.max(0, total - h);
  const studentSupplies = Array.from({ length: total - showSteps }, (_, i) => showSteps + i + 1);
  return { showSteps, studentSupplies };
}

export function planFade(we: WeShape, fade: FadeLevel): FadePlan {
  const total = we.steps.length;
  if (fade === "twin") return { mode: "twin", showSteps: 0, sequence: [], supplied: [] };
  if (fade === "problem") return { mode: "problem", showSteps: 0, sequence: [], supplied: [] };
  if (fade === "full") {
    return { mode: "steps", showSteps: total, sequence: we.steps.map((s) => ({ n: s.n, role: "shown" })), supplied: [] };
  }
  const index = fade === "faded1" ? 0 : 1;
  // The lighter rung first, whatever order the plans are written in: fewer steps to supply, then more shown (trial
  // audit MK-09, 24 Sep 2026: a bundle whose faded[0] hands over two steps opened with the harder rung).
  const ordered = [...we.faded].sort((a, b) => a.studentSupplies.length - b.studentSupplies.length || b.showSteps - a.showSteps);
  const authored = ordered[index];
  const plan = authored && authored.showSteps < total ? authored : defaultFaded(total, index + 1);
  const supplied = plan.studentSupplies.filter((n) => n > plan.showSteps && n <= total).sort((a, b) => a - b);
  return {
    mode: "steps",
    showSteps: plan.showSteps,
    sequence: we.steps.map((s) => ({ n: s.n, role: supplied.includes(s.n) ? "input" : "shown" })),
    supplied,
  };
}

/**
 * The heading of a faded rung, from what it really asks: "the last step is yours", "the last 2 steps are yours",
 * "steps 2 and 4 are yours" (MK-09: a fixed "the last step is yours" headed a rung that asked for steps 2 and 3).
 */
export function fadeHeading(plan: FadePlan, total: number): string {
  const s = plan.supplied;
  const toTheEnd = s.length > 0 && s.every((n, i) => n === total - s.length + 1 + i);
  if (toTheEnd && s.length === 1) return "Your turn · the last step is yours";
  if (toTheEnd) return `Your turn · the last ${s.length} steps are yours`;
  const list = s.length <= 1 ? `step ${s[0] ?? ""}` : `steps ${s.slice(0, -1).join(", ")} and ${s[s.length - 1]}`;
  return `Your turn · ${list} ${s.length <= 1 ? "is" : "are"} yours`;
}

/** Fraction correct, or 1 when nothing was asked (an example read to the end counts as done). */
export function accuracyOf(results: readonly boolean[]): number {
  if (results.length === 0) return 1;
  return results.filter(Boolean).length / results.length;
}

/** The support level the governor would pick next (plan §6.4 row 5): ≥ 80% problems, < 50% the example again. */
export function nextFade(current: FadeLevel, accuracy: number): FadeLevel {
  const order: FadeLevel[] = ["full", "faded1", "faded2", "twin", "problem"];
  const i = order.indexOf(current);
  if (accuracy < 0.5) return "full";
  if (accuracy >= 0.8) return order[Math.min(order.length - 1, i + 1)];
  return current;
}
