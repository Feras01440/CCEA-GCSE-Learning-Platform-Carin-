/**
 * Evidence for the six-mark quality-of-written-communication answers (`text-long`).
 *
 * A QWC answer is banded, not ticked: the examiner counts how many of the indicative points are
 * there, then places the answer inside that band on how it is written. Nothing here awards a mark.
 * `qwcEvidence` reports only what can be established mechanically — which indicative points have a
 * key word in the answer, how many words she wrote, and the band that count *alone* would suggest —
 * and `qwcSuggestedMarks` returns the low end of that band, the honest floor. The band decision, and
 * the choice of a mark inside the band, stay with the learner reading the descriptors.
 *
 * Key words are matched by the same rules as short text answers (`phraseIn` after `normaliseText`):
 * whole words and phrases, case- and punctuation-blind, a four-letter stem standing for its
 * inflections ("denatur" ~ "denatured"). Pure; no content or React dependencies.
 */
import type { AnswerSpec } from "@/lib/content/schema";
import { normaliseText, phraseIn } from "@/components/items/text-marking";

export type LongTextSpec = Extract<AnswerSpec, { kind: "text-long" }>;
export type QwcBand = LongTextSpec["bands"][number];

/** How many words open the Check button when the author set no `minWords`. */
export const QWC_DEFAULT_MIN_WORDS = 20;

export interface QwcPointEvidence {
  /** Position in `spec.indicativeContent`. */
  index: number;
  /** The indicative point in the author's words. */
  point: string;
  /** Key words the author listed for it; any one of them is evidence of the point. */
  keyWords: readonly string[];
  /** Those key words the answer contains, as authored (for quoting back). */
  found: string[];
  /** Whether at least one key word is there. */
  present: boolean;
}

export interface QwcEvidence {
  /** One entry per indicative point, in the authored order. */
  points: QwcPointEvidence[];
  /** Indicative points with at least one key word present. */
  found: number;
  /** Indicative points authored. */
  total: number;
  /** Words she wrote (whitespace-separated tokens carrying a letter or a digit). */
  wordCount: number;
  /** The fewest words the Check button waits for: `spec.minWords`, else 20. */
  minWords: number;
  /** Whether the answer has reached `minWords`. */
  longEnough: boolean;
  /** The band the count of points alone would suggest; null when no indicative content is authored. */
  band: QwcBand | null;
  /** The low end of that band's range — the floor, never the award. */
  suggestedMarks: number;
}

/** Words she wrote: tokens with a letter or a digit in them, so a stray dash is not a word. */
export function qwcWordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Bands ordered from the top band down, whatever order the author listed them in. */
function topDown(bands: readonly QwcBand[]): QwcBand[] {
  return [...bands].sort((a, b) => b.marks[1] - a.marks[1] || b.marks[0] - a.marks[0]);
}

/**
 * The band a count of indicative points sits in: the band whose mark range covers the count, capped by
 * the top band — a seven-point answer to a six-mark question is Band A, not off the top of the scale.
 */
export function qwcBandFor(count: number, bands: readonly QwcBand[]): QwcBand | null {
  if (bands.length === 0) return null;
  const sorted = topDown(bands);
  const top = sorted[0]!;
  if (count > top.marks[1]) return top;
  const covering = sorted.find((b) => count >= b.marks[0] && count <= b.marks[1]);
  if (covering) return covering;
  // Ranges with a gap in them: the best band the count has cleared, else the lowest band authored.
  return sorted.find((b) => count >= b.marks[0]) ?? sorted[sorted.length - 1]!;
}

/** Which indicative points the answer shows evidence of, how long it is, and the band the count suggests. */
export function qwcEvidence(text: string, spec: LongTextSpec): QwcEvidence {
  const answer = normaliseText(text);
  const points: QwcPointEvidence[] = spec.indicativeContent.map((p, index) => {
    const found = p.keyWords.filter((k) => answer.length > 0 && phraseIn(answer, normaliseText(k)));
    return { index, point: p.point, keyWords: p.keyWords, found, present: found.length > 0 };
  });
  const found = points.filter((p) => p.present).length;
  const total = points.length;
  const wordCount = qwcWordCount(text);
  const minWords = spec.minWords ?? QWC_DEFAULT_MIN_WORDS;
  const band = total > 0 ? qwcBandFor(found, spec.bands) : null;
  return {
    points,
    found,
    total,
    wordCount,
    minWords,
    longEnough: wordCount >= minWords,
    band,
    suggestedMarks: band ? band.marks[0] : 0,
  };
}

/**
 * The honest floor for an answer: the low end of the band its count of indicative points suggests.
 * It is a starting point for her own decision, not a mark the engine has awarded.
 */
export function qwcSuggestedMarks(text: string, spec: LongTextSpec): number {
  return qwcEvidence(text, spec).suggestedMarks;
}

/** "3–4 marks", "0 marks", "1 mark". */
export function qwcBandRange(band: QwcBand): string {
  const [lo, hi] = band.marks;
  if (lo === hi) return `${lo} mark${lo === 1 ? "" : "s"}`;
  return `${lo}–${hi} marks`;
}

/**
 * The evidence in one sentence, for the feedback card and the decision panel: what was found, what is
 * not there yet, and where the count alone puts the answer on the descriptors. Evidence, not a verdict.
 */
export function qwcSummary(ev: QwcEvidence): string {
  if (ev.total === 0) {
    return "No indicative points are listed for this part, so place the answer on the band descriptors.";
  }
  const foundWords = ev.points.flatMap((p) => p.found);
  const missing = ev.points.filter((p) => !p.present).map((p) => p.keyWords[0] ?? p.point);
  const parts: string[] = [
    ev.found === 0
      ? `Evidence found for none of the ${ev.total} points.`
      : `Evidence found for ${ev.found} of ${ev.total} points: ${foundWords.join(", ")}.`,
  ];
  if (missing.length > 0) parts.push(`Not yet: ${missing.join(", ")}.`);
  if (ev.band) parts.push(`On the descriptors that is band ${ev.band.band}, ${qwcBandRange(ev.band)}.`);
  if (!ev.longEnough) parts.push(`At ${ev.wordCount} word${ev.wordCount === 1 ? "" : "s"} it is shorter than the ${ev.minWords} this part asks for.`);
  return parts.join(" ");
}
