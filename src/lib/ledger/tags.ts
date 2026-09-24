import type { Attempt, Mock } from "@/lib/db/db";

/** Why a mark was lost, in the examiner's categories (plan §2.3 pillar 8). */
export const LOSS_TAGS = [
  { id: "method", label: "Method", hint: "Did not know or did not start the right method." },
  { id: "accuracy", label: "Accuracy", hint: "Right method, slip in the arithmetic or algebra." },
  { id: "misread", label: "Misread", hint: "Answered a different question from the one asked." },
  { id: "presentation", label: "Presentation", hint: "Working not shown, units or accuracy missing, two answers left." },
  { id: "not-attempted", label: "Not attempted", hint: "Left blank or ran out of time." },
  { id: "concept", label: "Concept", hint: "A misconception, not a slip." },
  // Marked practice says how many marks went, not why; a lost mark with no reason recorded is shown as exactly that,
  // never filed under the examiner's "Method" (engine item 8, audit must-fix 5).
  { id: "untagged", label: "No reason recorded", hint: "Counted, but nothing said why these went. A paper run's marking grid can say." },
] as const;

export type LossTag = (typeof LOSS_TAGS)[number]["id"];

export interface LossRow {
  subject: Attempt["subject"];
  /** topic slug for practice; `paper:<unit> <session>` for official papers */
  where: string;
  marks: number;
  tag: LossTag;
  source: "practice" | "paper";
  /** Marks dropped on the first go at the part and won back later in the same sitting (practice only). */
  recovered?: number;
}

export interface LedgerSummary {
  totalLost: number;
  /** Marks dropped on a first go and won back in the same sitting: not lost, but worth knowing about. */
  recovered: number;
  byTag: Array<{ tag: LossTag; marks: number; share: number }>;
  byPlace: Array<{ subject: Attempt["subject"]; where: string; marks: number; source: "practice" | "paper" }>;
  cheapest: LossTag | null;
}

const isTag = (t: string): t is LossTag => LOSS_TAGS.some((x) => x.id === t);

/** Idle gaps over 30 minutes start a new sitting, as they start a new study session (`touchSession`). */
const SITTING_GAP_MS = 30 * 60_000;

/** A part's tariff on this attempt, or null when the attempt carries none (a gate, a prompt, a worked-example line). */
function tariff(a: Attempt): { available: number; awarded: number } | null {
  if (a.marksAvailable == null || a.marksAwarded == null || a.marksAvailable <= 0) return null;
  // A line marked correct never counts as a loss, whatever its number says.
  const awarded = a.correct === true ? a.marksAvailable : Math.min(a.marksAvailable, Math.max(0, a.marksAwarded));
  return { available: a.marksAvailable, awarded };
}

/**
 * Practice attempts → loss rows, counted in marks. Only an attempt with a tariff counts: a gate, a why-menu, a
 * worked-example line, a find-the-mistake, a prompt or a diagnostic records right or wrong but no marks, and the old
 * ledger charged each miss as a mark. A part tried more than once in a sitting counts once, by its best attempt,
 * because nothing she wins back inside a sitting is taken away (docs/plan/emotional-design.md, rule 1); the marks her
 * first go dropped and a later go won back are kept as `recovered`. A loss is tagged only by a reason recorded for it;
 * otherwise it is "untagged", not the examiner's "Method" (engine item 8, 23 Sep 2026: the audit's night read "13
 * marks lost · Method 13" where 4 were lost and 2 more won back).
 */
export function lossesFromAttempts(attempts: Attempt[]): LossRow[] {
  const sorted = [...attempts].sort((a, b) => a.at.getTime() - b.at.getTime());
  const parts = new Map<string, { subject: Attempt["subject"]; where: string; first: number; best: number; available: number; tag: LossTag }>();
  const order: string[] = [];
  let sitting = 0;
  let last: number | null = null;
  for (const a of sorted) {
    const t = a.at.getTime();
    if (last !== null && t - last > SITTING_GAP_MS) sitting += 1;
    last = t;
    const mark = tariff(a);
    if (!mark) continue;
    const key = `${sitting}|${a.itemId}`;
    const tag = (a.misconceptionTags ?? []).find(isTag) ?? "untagged";
    const seen = parts.get(key);
    if (!seen) {
      parts.set(key, { subject: a.subject, where: a.topicSlug, first: mark.awarded, best: mark.awarded, available: mark.available, tag });
      order.push(key);
    } else if (mark.awarded > seen.best) {
      seen.best = mark.awarded;
      seen.tag = tag;
    }
  }
  const rows: LossRow[] = [];
  for (const key of order) {
    const p = parts.get(key)!;
    const lost = p.available - p.best;
    const recovered = Math.max(0, p.best - p.first);
    if (lost > 0 || recovered > 0) rows.push({ subject: p.subject, where: p.where, marks: lost, tag: p.tag, source: "practice", recovered });
  }
  return rows;
}

/** Official-paper runs → loss rows, one per lost mark where tagged, else "method" for the remainder. */
export function lossesFromMocks(mocks: Mock[]): LossRow[] {
  const rows: LossRow[] = [];
  for (const m of mocks) {
    const where = `paper:${m.unit}${m.paperNumber ? ` P${m.paperNumber}` : ""} ${m.sessionKey.replace("-", " ")}`;
    for (const q of m.marks) {
      const available = q.available ?? 0;
      const lost = Math.max(0, available - q.awarded);
      if (!lost) continue;
      // One tag per lost mark, never more tags than marks lost; the rest are untagged, not "Method".
      const tagged = q.tags.filter(isTag).slice(0, lost);
      for (const t of tagged) rows.push({ subject: m.subject, where, marks: 1, tag: t, source: "paper" });
      const untagged = lost - tagged.length;
      if (untagged > 0) rows.push({ subject: m.subject, where, marks: untagged, tag: "untagged", source: "paper" });
    }
  }
  return rows;
}

export function summariseLosses(rows: LossRow[]): LedgerSummary {
  const byTag = new Map<LossTag, number>();
  const byPlace = new Map<string, { subject: Attempt["subject"]; where: string; marks: number; source: "practice" | "paper" }>();
  let total = 0;
  let recovered = 0;
  for (const r of rows) {
    recovered += r.recovered ?? 0;
    if (r.marks <= 0) continue;
    total += r.marks;
    byTag.set(r.tag, (byTag.get(r.tag) ?? 0) + r.marks);
    const key = `${r.subject}:${r.where}`;
    const row = byPlace.get(key) ?? { subject: r.subject, where: r.where, marks: 0, source: r.source };
    row.marks += r.marks;
    byPlace.set(key, row);
  }
  const tagRows = LOSS_TAGS.map((t) => ({ tag: t.id, marks: byTag.get(t.id) ?? 0, share: total ? (byTag.get(t.id) ?? 0) / total : 0 }))
    .filter((r) => r.marks > 0)
    .sort((a, b) => b.marks - a.marks);
  const cheap = tagRows.find((r) => r.tag === "misread" || r.tag === "presentation");
  return { totalLost: total, recovered, byTag: tagRows, byPlace: [...byPlace.values()].sort((a, b) => b.marks - a.marks), cheapest: cheap?.tag ?? null };
}

/** Convenience: practice + papers together. */
export function summariseLedger(attempts: Attempt[], mocks: Mock[] = []): LedgerSummary {
  return summariseLosses([...lossesFromAttempts(attempts), ...lossesFromMocks(mocks)]);
}
