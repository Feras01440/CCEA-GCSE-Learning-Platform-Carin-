/**
 * Resolves a topic's authored practice sets (`bundle.sets`) into the items they name, in authored
 * order. Pure: no React, no Dexie, so PracticeFlow can index into the result and a test can cover it.
 *
 * A `q.` id is a question, `rp.` a retrieval prompt, `ftm.` a find-the-mistake item; a `dx.` id
 * names a whole diagnostic set and expands to its items. An id that does not resolve in the bundle
 * is skipped, and a set left with nothing is dropped, so the flow never shows an eyebrow over nothing.
 */
import type { DiagnosticItem, DiagnosticSet, FindTheMistake, PracticeSet, Question, RetrievalPrompt } from "@/lib/content/schema";

export type SetEntry =
  | { kind: "q"; key: string; q: Question }
  | { kind: "dx"; key: string; setId: string; item: DiagnosticItem }
  | { kind: "rp"; key: string; prompt: RetrievalPrompt }
  | { kind: "ftm"; key: string; item: FindTheMistake };

export interface ResolvedSet {
  set: PracticeSet;
  entries: SetEntry[];
}

/** One item of the flattened set stage with its place in its own set, for the eyebrow ("2 of 6"). */
export interface SetStep {
  set: PracticeSet;
  entry: SetEntry;
  /** 1-based position within the set. */
  index: number;
  total: number;
}

/** The parts of a ShippedBundle the resolution reads (sets may be missing on older bundles). */
export interface SetSource {
  sets?: PracticeSet[] | null;
  questions: Question[];
  diagnostics: DiagnosticSet[];
  prompts: RetrievalPrompt[];
  findTheMistake: FindTheMistake[];
}

export function resolveSets(bundle: SetSource): ResolvedSet[] {
  const questions = new Map<string, Question>(bundle.questions.map((q) => [q.id, q]));
  const diagnostics = new Map<string, DiagnosticSet>(bundle.diagnostics.map((d) => [d.id, d]));
  const prompts = new Map<string, RetrievalPrompt>(bundle.prompts.map((p) => [p.id, p]));
  const mistakes = new Map<string, FindTheMistake>(bundle.findTheMistake.map((f) => [f.id, f]));

  const out: ResolvedSet[] = [];
  for (const set of bundle.sets ?? []) {
    const entries: SetEntry[] = [];
    set.itemIds.forEach((id, i) => {
      // Keys carry the position so a repeated id (an authoring slip) still keys uniquely.
      const key = `${set.id}/${i}/${id}`;
      const q = questions.get(id);
      if (q) return entries.push({ kind: "q", key, q });
      const dx = diagnostics.get(id);
      if (dx) return dx.items.forEach((item) => entries.push({ kind: "dx", key: `${key}/${item.id}`, setId: dx.id, item }));
      const prompt = prompts.get(id);
      if (prompt) return entries.push({ kind: "rp", key, prompt });
      const ftm = mistakes.get(id);
      if (ftm) return entries.push({ kind: "ftm", key, item: ftm });
      // Not in this bundle: skipped.
    });
    if (entries.length > 0) out.push({ set, entries });
  }
  return out;
}

/** Every entry of every set in order, numbered within its set. */
export function flattenSets(sets: readonly ResolvedSet[]): SetStep[] {
  return sets.flatMap(({ set, entries }) => entries.map((entry, i) => ({ set, entry, index: i + 1, total: entries.length })));
}
