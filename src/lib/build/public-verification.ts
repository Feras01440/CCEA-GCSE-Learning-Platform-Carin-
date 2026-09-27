/**
 * The verification logs a public bundle carries (public/content/<subject>/<id>.json), trimmed by the content build
 * (pipeline/build-content.mts; the lead's item 18, 27 Sep 2026). The packs keep every log whole; the public copy keeps
 * whole only what the app reads at runtime, as the main session listed it on 27 Sep:
 *
 *  - the note's own log (its id is the note's `verification` ref): src/lib/slides/readiness.ts reads its checks and
 *    their detail (the reviewer's record, the waiver's reason);
 *  - the log of every exam-style question: the checked panel shows it (src/components/topic/PracticeFlow.tsx passes
 *    verificationFor(bundle, q.verification) to QuestionRunner on the exam path).
 *
 * Every other log keeps its id, item, version, status, reports and withdrawn records (src/lib/review/withdrawn.ts reads the
 * records for her ledger and the review inbox), with its checks emptied: `checks: []` keeps each entry a valid
 * VerificationLog, so no reader of the declared type ever meets a missing field. Pure; the input is never changed.
 */
import type { VerificationLog } from "@/lib/content/schema";

export interface PublicVerificationInput {
  note?: { verification?: string } | null;
  /** The questions the bundle ships (the build's `keep`), whose exam-style ones keep their logs whole. */
  questions?: ReadonlyArray<{ style?: string; verification?: string }> | null;
  verification?: ReadonlyArray<VerificationLog> | null;
}

export function publicVerification(bundle: PublicVerificationInput): VerificationLog[] {
  const whole = new Set<string>();
  if (bundle.note?.verification) whole.add(bundle.note.verification);
  for (const q of bundle.questions ?? []) if (q.style === "exam-style" && q.verification) whole.add(q.verification);
  return (bundle.verification ?? []).map((log) => {
    if (whole.has(log.id)) return log;
    const trimmed: VerificationLog = { id: log.id, itemId: log.itemId, version: log.version, checks: [], status: log.status, reports: log.reports ?? [] };
    if (log.withdrawn !== undefined) trimmed.withdrawn = log.withdrawn;
    return trimmed;
  });
}
