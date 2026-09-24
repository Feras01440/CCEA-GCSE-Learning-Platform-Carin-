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
}

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
