import type { ExamPlan } from "@/lib/plan/exam-plan";
import { upcomingPapers } from "@/lib/plan/exam-plan";
import { retentionForExam } from "./scheduler";

export interface ExamModeSettings {
  /** FSRS desired retention for this item right now. */
  desiredRetention: number;
  /** Hard cap on the next interval in days so the review lands before the paper. */
  maximumIntervalDays: number;
  /** ISO date of the paper this item is scheduled towards, if any. */
  paperDate: string | null;
  daysToPaper: number | null;
  /** True once the paper has been sat: the item is parked until results day. */
  parked: boolean;
}

const DEFAULT_MAX_INTERVAL = 120;

/** Which paper an item belongs to. Maths cards are scheduled to the unit that examines them last. */
export function paperForItem(plan: ExamPlan, subject: "maths" | "further-maths" | "science", unit: string, today: string) {
  const papers = upcomingPapers(plan, today).filter((p) => p.subject === subject);
  if (subject === "maths") {
    // M1-M4 content is assumed by the completion unit, so schedule to the later paper.
    const gateway = papers.find((p) => ["M1", "M2", "M3", "M4"].includes(p.unit));
    const completion = papers.find((p) => ["M5", "M6", "M7", "M8"].includes(p.unit));
    if (["M5", "M6", "M7", "M8"].includes(unit)) return completion ?? null;
    return gateway && gateway.daysAway >= 0 ? gateway : (completion ?? null);
  }
  return papers.find((p) => p.unit === unit) ?? null;
}

export function examModeFor(plan: ExamPlan, subject: "maths" | "further-maths" | "science", unit: string, today: string, now = new Date(today + "T00:00:00")): ExamModeSettings {
  const paper = paperForItem(plan, subject, unit, today);
  if (!paper) return { desiredRetention: 0.9, maximumIntervalDays: DEFAULT_MAX_INTERVAL, paperDate: null, daysToPaper: null, parked: false };
  if (paper.daysAway < 0) return { desiredRetention: 0.9, maximumIntervalDays: DEFAULT_MAX_INTERVAL, paperDate: paper.date, daysToPaper: paper.daysAway, parked: true };
  const examDate = new Date(paper.date + "T00:00:00");
  return {
    desiredRetention: retentionForExam(examDate, now),
    maximumIntervalDays: Math.max(1, Math.min(DEFAULT_MAX_INTERVAL, paper.daysAway - 1)),
    paperDate: paper.date,
    daysToPaper: paper.daysAway,
    parked: false,
  };
}
