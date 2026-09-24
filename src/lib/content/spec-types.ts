/** Shared shapes for data/spec/*.json (kept loose on purpose; validated by scripts/). */
export type Tier = "F" | "H" | "mixed";
export type Subject = "maths" | "further-maths" | "science";

export interface ScienceOutcome {
  id: string | null;
  kind?: "outcome" | "practical" | "skill";
  text: string;
  tier: Tier;
  bullets?: { text: string; tier: Tier }[];
  practical?: string | null;
}
export interface ScienceTopicLabel { label: string; outcomes: ScienceOutcome[] }
export interface ScienceSection { id: string; title: string; intro?: string; topics: ScienceTopicLabel[] }
export interface ScienceUnit {
  code: string; discipline: string; title: string; duration: string; weighting: number; sections: ScienceSection[];
}
export interface ScienceSpec {
  subject: string; subjectCode: string; cceaQualificationId: string;
  units: ScienceUnit[];
  prescribedPracticals: { code: string; unit: string; title: string }[];
}
