/**
 * What the Slides frame lets her do on each card, as pure functions of the run (the teach-first case §6 and §8.1; the
 * owner's answers of 27 Sep 2026), so the rules are tested here and SlidesRun only wires them to the screen:
 *
 * - A See it opens on its first step; Continue shows the next, the steps already shown stay, and the control on the last
 *   step is "Your turn" when the Your turn is next (or "Continue" when a video stands between). The way on is locked
 *   until every step has been shown, and a step she types has been answered or shown. On a return visit (a See it she
 *   saw to its last step on an earlier run) a quiet "Skip to your turn" shows every step and moves on.
 * - A Your turn is open until Check. A right answer shows "Yes." and the explanation. A miss does not show the answer:
 *   it re-teaches first ("Not quite", her choice, the explanation again, the step it rests on, the figure's
 *   consequence), and only "Show me the answer" shows it. A retry before the recap is answered straight to its answer.
 *   Her first answer is the record; nothing about the re-teach is.
 *
 * Reduced motion changes how things arrive (no movement), never how many steps a Continue shows: the steps are the
 * lesson's pacing, not an animation (a deliberate reading of the case's §6.2; see STEPS_AT_ONCE_UNDER_REDUCED_MOTION).
 */
import { nextLabel, type Card, type GateCard, type SeeCard } from "./cards";

/**
 * The case's §6.2 says "under reduced motion every step renders at once". Kept false on purpose: reduced motion asks
 * for no movement, and a step shown by her own Continue does not move; showing every step at once would take the
 * lesson's one-step-at-a-time pacing from anyone whose phone has Reduce Motion on. One switch, if the owner rules
 * otherwise.
 */
export const STEPS_AT_ONCE_UNDER_REDUCED_MOTION = false;

export type GatePhase = "open" | "reteach" | "answer";

/** Where a Your turn stands: open until Check; a first-asking miss re-teaches until "Show me the answer"; then the answer. */
export function gatePhase(answer: { correct: boolean } | null, retry: boolean, shown: boolean): GatePhase {
  if (!answer) return "open";
  if (answer.correct || retry || shown) return "answer";
  return "reteach";
}

/** How far a See it has been shown: steps revealed (at least the first), whether a typed step waits, whether it is done. */
export interface SeeProgress {
  total: number;
  revealed: number;
  /** The typed step is on screen and not yet answered or shown. */
  waiting: boolean;
  /** Every step shown, and the typed step (if any) settled: the way on is open. */
  complete: boolean;
}

export function seeProgress(card: SeeCard, revealed: number | undefined, typedSettled: boolean): SeeProgress {
  const total = Math.max(1, card.see?.steps.length ?? 1);
  const shown = Math.min(total, Math.max(1, revealed ?? 1));
  const waiting = card.typed !== null && card.typed < shown && !typedSettled;
  return { total, revealed: shown, waiting, complete: shown >= total && !waiting };
}

/** "Skip to your turn": only on a return visit, a See it she saw to its end on an earlier run, and only while steps remain. */
export function canSkipSee(card: SeeCard, seenBefore: readonly string[], progress: SeeProgress): boolean {
  return seenBefore.includes(card.key) && !progress.complete;
}

export type Action = "start" | "next" | "reveal-step" | "check" | "show-answer" | "check-tap" | "reveal-recall";

export interface Primary {
  label: string;
  action: Action;
  disabled: boolean;
}

export interface CardState {
  /** The Your turn's answer on this card, if checked. */
  gateAnswer: { correct: boolean } | null;
  gateSelected: string | null;
  /** The answer was shown after the re-teach. */
  gateShown: boolean;
  seeProgress: SeeProgress | null;
  /** The figure she acts on was checked, or the registry cannot draw it. */
  tapDone: boolean;
  recallRevealed: boolean;
  recallGraded: boolean;
  recallSkipped: boolean;
}

/** The one control on a card, and what it does; null where the card offers its own (the grades, a typed step's Check). */
export function primaryFor(cards: readonly Card[], at: number, s: CardState): Primary | null {
  const card = cards[at];
  if (!card) return null;
  switch (card.kind) {
    case "title":
      return { label: "Start the slides", action: "start", disabled: false };
    case "see": {
      const p = s.seeProgress;
      if (!p) return { label: "Continue", action: "reveal-step", disabled: false };
      if (p.waiting) return null;
      if (p.revealed < p.total) return { label: "Continue", action: "reveal-step", disabled: false };
      return { label: nextLabel(cards, at), action: "next", disabled: false };
    }
    case "gate": {
      const phase = gatePhase(s.gateAnswer, (card as GateCard).retry, s.gateShown);
      if (phase === "open") return { label: "Check", action: "check", disabled: !(s.gateSelected ?? "").trim() };
      if (phase === "reteach") return { label: "Show me the answer", action: "show-answer", disabled: false };
      return { label: "Continue", action: "next", disabled: false };
    }
    case "interaction":
      return s.tapDone ? { label: "Continue", action: "next", disabled: false } : { label: "Check", action: "check-tap", disabled: false };
    case "recall":
      // Graded or skipped on an earlier pass: the way on is Continue. Otherwise, the answer first, then the grades.
      if (s.recallGraded || (s.recallSkipped && !s.recallRevealed)) return { label: "Continue", action: "next", disabled: false };
      return s.recallRevealed ? null : { label: "Show the answer", action: "reveal-recall", disabled: false };
    case "close":
      return null;
    default: {
      // A video beside a See it: the card before the Your turn says where it goes.
      const label = card.kind === "media" ? nextLabel(cards, at) : "Continue";
      return { label, action: "next", disabled: false };
    }
  }
}

/** Whether the way on (→, the Next button, a swipe) is open on this card. */
export function unlockedFor(card: Card, s: CardState): boolean {
  switch (card.kind) {
    case "gate":
      return gatePhase(s.gateAnswer, card.retry, s.gateShown) === "answer";
    case "see":
      return s.seeProgress?.complete ?? true;
    case "interaction":
      return s.tapDone;
    case "recall":
      return s.recallGraded || s.recallSkipped;
    default:
      return true;
  }
}

/**
 * What she is told under a Your turn's answer (true in the behaviour, audit LD-18, LD-19): a first answer is recorded
 * and returns in her reviews, a miss also before the recap (on new numbers when the gate has a twin); a retry records
 * nothing and never promises to come back before the recap.
 */
export function answerNote(card: GateCard, correct: boolean, record: "recorded" | "already" | "retry"): string {
  if (card.retry) return correct ? "Asked once more, and held. Your first answer is the one on record." : "Asked once more, not recorded: your first answer is the one on record, and it comes back in your reviews.";
  if (correct) return record === "recorded" ? "Recorded. It comes back in your reviews." : "Already in your reviews from an earlier visit.";
  const again = card.gate.twin ? "It comes back before the recap on new numbers" : "It comes back before the recap";
  return record === "recorded" ? `Recorded. ${again}, and in your reviews.` : `${again}. Your first answer, from an earlier visit, is the one in your reviews.`;
}

/** The line under an open Your turn: what a miss does, said before she answers (the case §6.2 foot). */
export function gateNote(card: GateCard): string {
  return card.retry ? "Asked once more, not recorded. Your first answer is the one on record." : "Answer from what you just saw. If you miss, it is taught again first.";
}
