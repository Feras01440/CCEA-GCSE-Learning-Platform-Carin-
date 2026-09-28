/**
 * What each gate's FIRST answer was, on this device: the record, whichever way she answered it (Slides or Read). Read
 * needs it to draw a check she missed as missed after a reload, not as passed (audit READ-7: the page knew g2:miss and
 * drew the right option lit and her own unmarked, "ticks everywhere and no miss"). The first answer is the record
 * (benchmarks page 3, H8); a later one (a retry, another visit) never changes what the gate says about her.
 */
import { getDB, type Attempt } from "@/lib/db/db";

export interface GateOutcome {
  correct: boolean;
  /** What she answered, when the answer was kept (Slides has kept it since 24 Sep; Read from its next build). */
  answer: string | null;
}

/** The first attempt of each gate, by gate id (pure; `rows` are attempts on `${topicId}#gate:<id>`). */
export function firstOutcomes(rows: readonly Pick<Attempt, "at" | "itemId" | "correct" | "answerRaw">[], topicId: string): Record<string, GateOutcome> {
  const prefix = `${topicId}#gate:`;
  const out: Record<string, GateOutcome> = {};
  for (const a of [...rows].sort((x, y) => x.at.getTime() - y.at.getTime())) {
    if (!a.itemId.startsWith(prefix)) continue;
    const id = a.itemId.slice(prefix.length);
    if (out[id]) continue;
    out[id] = { correct: a.correct === true, answer: typeof a.answerRaw === "string" && a.answerRaw.trim() ? a.answerRaw : null };
  }
  return out;
}

/** Each gate's first answer on this device, for a topic. */
export async function gateOutcomes(subject: string, topicSlug: string, topicId: string): Promise<Record<string, GateOutcome>> {
  const rows = await getDB()
    .attempts.where("itemId")
    .startsWith(`${topicId}#gate:`)
    .and((a) => a.subject === subject && a.topicSlug === topicSlug)
    .toArray();
  return firstOutcomes(rows, topicId);
}
