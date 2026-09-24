import manifest from "../../generated/manifest.json";
import type { DiagnosticSet, ExaminerInsight, FindTheMistake, NoteFrontmatter, PracticeSet, Question, RetrievalPrompt, Topic, VerificationLog, WorkedExample } from "./schema";

export interface ShippedBundle {
  topic: Topic;
  note: NoteFrontmatter | null;
  noteBlocks: unknown[] | null;
  workedExamples: WorkedExample[];
  diagnostics: DiagnosticSet[];
  questions: Question[];
  findTheMistake: FindTheMistake[];
  prompts: RetrievalPrompt[];
  insight: ExaminerInsight | null;
  sets: PracticeSet[];
  verification: VerificationLog[];
}

export type ManifestTopic = (typeof manifest)["topics"][number];

export const CONTENT_MANIFEST = manifest;

/** Topic ids that have shipped content, keyed by `${subject}:${slug}` for the taxonomy pages. */
export function contentIndex(): Map<string, ManifestTopic> {
  return new Map(manifest.topics.map((t) => [`${t.subject}:${t.slug}`, t]));
}

export function contentFor(subject: string, slug: string): ManifestTopic | undefined {
  return manifest.topics.find((t) => t.subject === subject && t.slug === slug);
}

const cache = new Map<string, Promise<ShippedBundle>>();

/** Client-side fetch of a shipped bundle from /content/<subject>/<topicId>.json (cached per session). */
export function loadBundle(subject: string, topicId: string): Promise<ShippedBundle> {
  const key = `${subject}/${topicId}`;
  let p = cache.get(key);
  if (!p) {
    p = fetch(`/content/${subject}/${topicId}.json`).then((r) => {
      if (!r.ok) throw new Error(`No content for ${key}`);
      return r.json() as Promise<ShippedBundle>;
    });
    cache.set(key, p);
  }
  return p;
}

export function verificationFor(bundle: ShippedBundle, ref: string | undefined): VerificationLog | undefined {
  return ref ? bundle.verification.find((v) => v.id === ref) : undefined;
}
