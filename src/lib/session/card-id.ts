/**
 * Pure helpers shared by the recorder and the one-off card backfill (src/lib/db/backfill.ts), which the
 * database opens with and so must not import the recorder itself.
 */
import type { ReviewGrade } from "@/lib/srs/scheduler";

/**
 * Generated variants of a worked example (`<weId>#twin:3`, `<weId>#full:1`, `<weId>#faded1:2`, …) all
 * share one card, `<weId>#twin`, which the inbox resolves back to the example's twin.
 */
const GENERATED_VARIANT = /^(.+)#(?:full|faded1|faded2|twin|problem):\d+$/;

export function cardIdFor(itemId: string): string {
  const m = GENERATED_VARIANT.exec(itemId);
  return m ? `${m[1]}#twin` : itemId;
}

/** The grade a marked answer implies: all of the marks "good", some of them "hard", none "again". */
export function gradeFromMarks(marksAwarded: number, marksAvailable: number): ReviewGrade {
  if (marksAvailable > 0 && marksAwarded >= marksAvailable) return "good";
  return marksAwarded > 0 ? "hard" : "again";
}
