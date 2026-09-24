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
  const authored = we.faded[index];
  const plan = authored && authored.showSteps < total ? authored : defaultFaded(total, index + 1);
  const supplied = plan.studentSupplies.filter((n) => n > plan.showSteps && n <= total).sort((a, b) => a - b);
  return {
    mode: "steps",
    showSteps: plan.showSteps,
    sequence: we.steps.map((s) => ({ n: s.n, role: supplied.includes(s.n) ? "input" : "shown" })),
    supplied,
  };
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
