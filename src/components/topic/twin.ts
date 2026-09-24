/**
 * Which worked example's twin to open after a miss. Every miss used to open the topic's first worked example's twin,
 * whatever the question practised (engine item 10.5, 23 Sep 2026: in the topics with two or more worked examples, 250
 * of 2,010 questions share more of the specification with another worked example than with the first). Pure.
 */
import type { Question, WorkedExample } from "@/lib/content/schema";

/**
 * The worked example sharing the most specification points with the question; the topic's authored order breaks a
 * tie (its first worked example is its core method), and it is the answer when nothing is shared or there is no
 * question. The stems are not compared: two stems that open with the same command word ("Simplify fully") can
 * practise different things, and the specification points say what a question practises.
 */
export function twinFor(workedExamples: readonly WorkedExample[], question: Pick<Question, "specRefs"> | null | undefined): WorkedExample | undefined {
  let best = workedExamples[0];
  if (!best || !question) return best;
  const shared = (we: WorkedExample) => we.specRefs.filter((r) => question.specRefs.includes(r)).length;
  let most = shared(best);
  for (const we of workedExamples.slice(1)) {
    const n = shared(we);
    if (n > most) {
      best = we;
      most = n;
    }
  }
  return best;
}
