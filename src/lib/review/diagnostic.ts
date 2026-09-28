/**
 * A diagnostic answered in the review inbox, recorded as the topic page records it and moved by what she was sure of.
 *
 * Found walking the real inbox on build 9's source (27 Sep 2026): Reveal graded the card and moved on at once, so the
 * reveal was never on screen, and what it promises was not kept. The attempt was written with no confidence and no
 * misconception; a certain miss set neither of the two re-probes the reveal promises ("comes back in two days and again
 * in a week"); a lucky guess was graded as a sure answer although the reveal says it "comes back soon".
 */
import type { ReviewGrade } from "@/lib/srs/scheduler";
import { advanceCard, recordAttempt, type ItemRef } from "@/lib/session/record";

/** What DiagnosticWithConfidence reports at Reveal (its DiagnosticAnswer), as the recorder needs it. */
export interface DiagnosticReviewAnswer {
  optionId: string;
  correct: boolean;
  confidence: 1 | 2 | 3;
  ms: number;
  misconception?: string;
}

/**
 * Wrong is "again", whatever she felt. Right is graded by her confidence: a guess that landed is "hard", so it comes back
 * sooner than a sure answer would (the reveal's "comes back soon"); fairly sure is "good"; certain is "easy".
 */
export function diagnosticGrade(correct: boolean, confidence: 1 | 2 | 3): ReviewGrade {
  if (!correct) return "again";
  return confidence === 1 ? "hard" : confidence === 3 ? "easy" : "good";
}

/**
 * Moves the card, then records the answer with the topic page's recorder: one attempt row with her confidence, her option
 * and its misconception, the two re-probes a certain miss earns, and the topic's mastery. In that order because a
 * re-probe (an `hc:` card) is spent by this pass, and the fresh re-probes a certain miss earns must outlive it. `item.id`
 * is the diagnostic's own id (`<set id>#<item id>`), whichever card asked it.
 */
export async function answerDiagnosticCard(cardId: string, item: ItemRef, answer: DiagnosticReviewAnswer, now = new Date()): Promise<ReviewGrade> {
  const grade = diagnosticGrade(answer.correct, answer.confidence);
  const { id: _id, ...ref } = item;
  void _id;
  await advanceCard(cardId, grade, ref, now);
  await recordAttempt(
    {
      item,
      itemKind: "diagnostic",
      correct: answer.correct,
      confidence: answer.confidence,
      misconceptionTags: answer.misconception ? [answer.misconception] : [],
      timeMs: answer.ms,
      answerRaw: answer.optionId,
    },
    now,
  );
  return grade;
}
