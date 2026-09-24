/**
 * Authoring lint for text answer specs. Every key-word group must be earnable, under the engine's own phrase
 * matching (text-marking.ts), by at least one of the spec's accepted answers; otherwise a learner who writes the
 * model answer in her own words can never get that group's mark, and the "still missing …" feedback names a word
 * the model answer itself does not use. Pure; the content build runs it and prints the findings.
 */
import { normaliseText, phraseIn } from "./text-marking";

export interface KeyWordLint {
  /** Groups no accepted answer earns and the part's own wording (scheme, solution, hints) does not use either. */
  hard: string[];
  /** Groups no accepted answer earns, though the part's wording does contain the key word somewhere. */
  soft: string[];
}

function strings(o: unknown, out: string[] = []): string[] {
  if (typeof o === "string") out.push(o);
  else if (Array.isArray(o)) for (const x of o) strings(x, out);
  else if (o && typeof o === "object") for (const x of Object.values(o as Record<string, unknown>)) strings(x, out);
  return out;
}

const onlyStrings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/** Walks any bundle-shaped JSON (questions, worked-example twins, diagnostics…) and checks each text spec. */
export function lintKeyWords(bundle: unknown, label: string): KeyWordLint {
  const out: KeyWordLint = { hard: [], soft: [] };

  const walk = (o: unknown, qid: string | undefined, pid: string | undefined, parent: unknown): void => {
    if (Array.isArray(o)) {
      for (const x of o) walk(x, qid, pid, parent);
      return;
    }
    if (!o || typeof o !== "object") return;
    const rec = o as Record<string, unknown>;
    if (typeof rec.id === "string") {
      if (rec.id.includes(".")) {
        qid = rec.id;
        pid = undefined;
      } else pid = rec.id;
    }
    if (rec.kind === "text" && Array.isArray(rec.keyWords)) {
      const accepted = onlyStrings(rec.accepted).map(normaliseText);
      const others = parent && typeof parent === "object" ? Object.values(parent as Record<string, unknown>).filter((v) => v !== o) : [];
      const partText = normaliseText(strings(others).join(" "));
      const where = `${label} ${qid ?? "?"}${pid ? `(${pid})` : ""}`;
      (rec.keyWords as unknown[]).forEach((g, gi) => {
        const any = g && typeof g === "object" ? onlyStrings((g as Record<string, unknown>).any) : [];
        if (accepted.some((a) => any.some((k) => phraseIn(a, normaliseText(k))))) return;
        const msg = `${where} key-word group ${gi + 1} ${JSON.stringify(any)} is not earned by any accepted answer`;
        if (any.some((k) => phraseIn(partText, normaliseText(k)))) out.soft.push(`${msg} (the part's own wording uses it)`);
        else out.hard.push(`${msg}: a paraphrase of the model answer cannot get that mark`);
      });
      return;
    }
    for (const v of Object.values(rec)) walk(v, qid, pid, o);
  };

  walk(bundle, undefined, undefined, undefined);
  return out;
}
