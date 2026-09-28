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

/** A See it step she types: what she typed and whether the engine marked it right, or that she asked to see it. */
export type StepResult = { raw: string; correct: boolean } | { shown: true };

export interface SlidesPosition {
  /** 0-based card index. */
  at: number;
  /**
   * The key of the card she was on: restored by key, so a note edited between visits (a paragraph added, a card
   * dropped) opens on the same card, not on whatever now stands at the old index (audit CQ-17). Older runs have none.
   */
  key?: string;
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
  /** How many steps of each See it she has been shown, by card key (the first shows on arrival). */
  steps: Record<string, number>;
  /** The step she typed on a See it, by card key: never recorded, kept so a reload shows what she did. */
  typedSteps: Record<string, StepResult>;
  /** The Your turns she missed whose answer she has asked to see after the re-teach, by gate id. */
  shown: Record<string, true>;
  /** The See its she has been shown to their last step in this run. */
  seen: string[];
  /** The See its she saw to their end on an earlier run: on these a return visit may skip to the Your turn. */
  seenBefore: string[];
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);

function stepResults(v: unknown): Record<string, StepResult> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return {};
  const out: Record<string, StepResult> = {};
  for (const [k, r] of Object.entries(v as Record<string, unknown>)) {
    if (typeof r !== "object" || r === null) continue;
    const x = r as Record<string, unknown>;
    if (x.shown === true) out[k] = { shown: true };
    else if (typeof x.raw === "string" && typeof x.correct === "boolean") out[k] = { raw: x.raw, correct: x.correct };
  }
  return out;
}

/**
 * The run after a finished one: everything afresh, except which See its she has already seen to their end, so the
 * next visit can offer "Skip to your turn" on them (the owner's answer 5: on a return visit only).
 */
export function nextRun(finished: Pick<SlidesPosition, "seen" | "seenBefore">): SlidesPosition {
  return {
    at: 0,
    done: false,
    missed: [],
    answers: {},
    checked: {},
    graded: {},
    typed: {},
    skipped: {},
    figures: {},
    steps: {},
    typedSteps: {},
    shown: {},
    seen: [],
    seenBefore: [...new Set([...finished.seenBefore, ...finished.seen])],
  };
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
      ...(typeof v.key === "string" ? { key: v.key } : {}),
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
      steps: isRecord(v.steps) ? Object.fromEntries(Object.entries(v.steps).filter((e): e is [string, number] => typeof e[1] === "number" && e[1] >= 1).map(([k, n]) => [k, Math.floor(n)])) : {},
      typedSteps: stepResults(v.typedSteps),
      shown: isRecord(v.shown) ? Object.fromEntries(Object.keys(v.shown).map((k) => [k, true as const])) : {},
      seen: strings(v.seen),
      seenBefore: strings(v.seenBefore),
    };
  } catch {
    return null;
  }
}

/**
 * A run kept from an earlier build can hold a figure drawn differently now (the note's example changed, and with it the
 * pieces the figure is made of). Such a figure starts afresh, and its Check with it, so a "done" never stands over
 * pieces left unstruck. `piecesFor` names the pieces the deck's figure on a card draws, by card key, or null when the
 * card is not a figure she acts on (its record is left as it is). Pure.
 */
export function withKnownFigures(
  run: Pick<SlidesPosition, "figures" | "checked">,
  piecesFor: (cardKey: string) => readonly string[] | null,
): Pick<SlidesPosition, "figures" | "checked"> {
  const figures = { ...run.figures };
  const checked = { ...run.checked };
  for (const [key, f] of Object.entries(run.figures)) {
    const known = piecesFor(key);
    if (known === null) continue;
    if ([...f.struck, ...f.lit].some((id) => !known.includes(id))) {
      delete figures[key];
      delete checked[key];
    }
  }
  return { figures, checked };
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
