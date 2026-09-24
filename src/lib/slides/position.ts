/**
 * Where she is in a topic's slides, and what this run has done, kept on this device (localStorage, wrapped: private
 * mode and a full store leave the place for the visit only). The answers themselves live in IndexedDB as attempts,
 * exactly as Read records them; this is the run: the card she was on, the gates answered in it, the ones missed and
 * owed before the recap, the figures checked and the recall cards graded, so Exit keeps her place, the hero can say
 * "Continue the slides", and the close counts what she did.
 */
export interface RunAnswer {
  answer: string;
  correct: boolean;
  record: "recorded" | "already" | "retry";
}

export interface SlidesPosition {
  /** 0-based card index. */
  at: number;
  /** The close card was reached. */
  done: boolean;
  /** Gate ids missed in this run, in order: the retries owed before the recap. */
  missed: string[];
  /** Gate answers by gate id, and retry answers by "retry:<id>". */
  answers: Record<string, RunAnswer>;
  /** Interaction cards checked, by card key. */
  checked: Record<string, { correct: boolean }>;
  /** Recall cards graded, by card key. */
  graded: Record<string, "again" | "good" | "easy">;
  /** What she typed on a recall card, by card key, so the answer shows beside it after a reload. */
  typed: Record<string, string>;
  /** Recall cards she skipped, by card key: nothing was recorded for them. */
  skipped: Record<string, true>;
  /** What she did to a figure she acts on, by card key: the pills struck, and after a Check the ones still lit. */
  figures: Record<string, { struck: string[]; lit: string[] }>;
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);

const KEY = (topicId: string) => `cairn.slides.${topicId}`;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function readPosition(topicId: string): SlidesPosition | null {
  try {
    const raw = window.localStorage.getItem(KEY(topicId));
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<SlidesPosition>;
    if (typeof v.at !== "number" || v.at < 0) return null;
    return {
      at: Math.floor(v.at),
      done: v.done === true,
      missed: Array.isArray(v.missed) ? v.missed.filter((m): m is string => typeof m === "string") : [],
      answers: isRecord(v.answers) ? (v.answers as Record<string, RunAnswer>) : {},
      checked: isRecord(v.checked) ? (v.checked as Record<string, { correct: boolean }>) : {},
      graded: isRecord(v.graded) ? (v.graded as Record<string, "again" | "good" | "easy">) : {},
      typed: isRecord(v.typed) ? Object.fromEntries(Object.entries(v.typed).filter((e): e is [string, string] => typeof e[1] === "string")) : {},
      skipped: isRecord(v.skipped) ? Object.fromEntries(Object.keys(v.skipped).map((k) => [k, true as const])) : {},
      figures: isRecord(v.figures)
        ? Object.fromEntries(Object.entries(v.figures).filter((e) => isRecord(e[1])).map(([k, f]) => [k, { struck: strings((f as Record<string, unknown>).struck), lit: strings((f as Record<string, unknown>).lit) }]))
        : {},
    };
  } catch {
    return null;
  }
}

export function writePosition(topicId: string, position: SlidesPosition): void {
  try {
    window.localStorage.setItem(KEY(topicId), JSON.stringify(position));
  } catch {
    // The place holds for this visit.
  }
}

export function clearPosition(topicId: string): void {
  try {
    window.localStorage.removeItem(KEY(topicId));
  } catch {
    // Nothing to clear.
  }
}
