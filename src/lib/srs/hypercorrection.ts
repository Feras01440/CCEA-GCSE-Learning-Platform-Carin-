import type { ReviewCard } from "@/lib/db/db";
import { newCard } from "./scheduler";

/**
 * Hypercorrection queue (plan §4.3): a confident-wrong answer is re-probed at +2 days and +7 days
 * regardless of FSRS state. Re-probes are ordinary cards with ids `hc:<itemId>:1|2` so no schema change is needed.
 */
export const HC_CONFIDENCE_THRESHOLD = 3; // on the 1-3 scale used in Attempt.confidence: 3 = "sure"

export function isConfidentWrong(correct: boolean | null, confidence: number | null): boolean {
  return correct === false && confidence !== null && confidence >= HC_CONFIDENCE_THRESHOLD;
}

export function hypercorrectionCards(base: Pick<ReviewCard, "id" | "subject" | "topicSlug">, now: Date): ReviewCard[] {
  const mk = (n: 1 | 2, days: number): ReviewCard => {
    const due = new Date(now.getTime() + days * 86_400_000);
    return {
      id: `hc:${base.id}:${n}`,
      subject: base.subject,
      topicSlug: base.topicSlug,
      card: { ...newCard(now), due },
      due,
      createdAt: now,
    };
  };
  return [mk(1, 2), mk(2, 7)];
}

export function isHypercorrectionCard(id: string): boolean {
  return id.startsWith("hc:");
}

export function sourceItemId(id: string): string {
  return isHypercorrectionCard(id) ? id.split(":").slice(1, -1).join(":") : id;
}
