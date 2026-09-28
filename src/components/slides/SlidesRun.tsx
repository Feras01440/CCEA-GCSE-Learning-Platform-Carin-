"use client";

/**
 * Slides: lesson structure v3 (the teach-first case, approved by the owner on 27 Sep 2026 with his eight answers). Each
 * section explains (idea cards), shows (a See it card, its steps one per Continue, with the video or the sim beside it),
 * then asks (the Your turn). A miss re-teaches before it shows the answer; the missed Your turns come back once before
 * the recap, on new numbers where the gate has a twin; the recap and the pointer; at most two optional recall cards; the
 * close, whose first way out is "Now the questions" (decisions 9 and 17; art direction v2 §8). The rules of what each
 * card allows are pure and tested (src/lib/slides/run.ts); this file wires them to the screen.
 *
 * The frame is one DOM tree on both sizes, and every control exists once. On a phone (390 x 844) the card fills the
 * screen: a wash header with Exit, the topic, "n of N" and the segmented track, then the card's eyebrow and title; the
 * body on the paper; the one control in a foot with 24 px clearance. From lg (1024 px) the whole screen is the card:
 * the wash header band holds Exit, the centred 720 px track and count, then the label and title on a 1000 px measure;
 * the body is that measure in two columns (prose, then the figure or the verdict at 400 px); previous and next stand
 * at the screen's edges; the foot becomes the full-width bottom bar with the keyboard hints and the same control.
 * No navigation rail anywhere inside.
 *
 * Progress is one record with Read: a Your turn is recorded as `${topicId}#gate:${id}` (itemKind "practice") on its
 * first answer only, a recall card as its prompt id (itemKind "prompt"), exactly as TopicContent does. The re-teach, a
 * step she types in a See it and a retry record nothing. Her place on this device is the card she was on
 * (src/lib/slides/position.ts); Exit keeps it and the hero offers "Continue the slides".
 *
 * Keyboard: arrows move (on a See it, → shows the next step), Enter presses the one control, 1 to 9 choose an option or
 * grade a recall card; on an option the arrows move the choice and Enter checks it. Swipe: a finger or a pen moved
 * 60 px sideways (a mouse drag selects text and never turns a card; src/lib/slides/gesture.ts). Motion: the card
 * advance (200 ms), a step's reveal, the verdict's; all static under prefers-reduced-motion, where the steps still come
 * one per Continue (the pacing is the lesson's, not an animation: run.ts STEPS_AT_ONCE_UNDER_REDUCED_MOTION).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { InlineSvg, MdInlines, markGate, parseInline } from "@/components/items";
import { deckGateOrders, retryOrder, shownOptions } from "@/lib/gate-order";
import { rememberLessonWay } from "@/components/topic/lesson-way";
import { focusLanding } from "@/components/shell/input-modality";
import { locatorCls } from "@/components/shell/PageHeader";
import type { Subject } from "@/lib/content/taxonomy";
import { DEFAULT_PLAN, paperPhrase, todayISO } from "@/lib/plan/exam-plan";
import { useExamPlan } from "@/lib/plan/store";
import { answeredGateIds } from "@/lib/session/flow";
import { recordAttempt, touchSession } from "@/lib/session/record";
import { deckMinutes, deckStats, promiseLine, splitSentences, withRetries, type Card, type Deck, type GateCard, type SeeCard } from "@/lib/slides/cards";
import { enrichmentFor } from "@/lib/slides/enrichment";
import { nextRun, readPosition, withKnownFigures, writePosition, type StepResult } from "@/lib/slides/position";
import { answerNote, canSkipSee, gateNote, gatePhase, primaryFor, seeProgress, unlockedFor, type Action, type CardState } from "@/lib/slides/run";
import { misconceptionTags, twinGate, twinOptions } from "@/lib/slides/see";
import { swipeDirection } from "@/lib/slides/gesture";
import { gradeReturnDates, recordRecallGrade, returnWord } from "@/lib/slides/returns";
import { tap as haptic } from "@/lib/ux/haptics";
import { calloutParts, gateParts, ideaParts, interactionParts, mediaParts, pointerParts, recallParts, recapParts, reteachParts, seeParts, type CardParts, type GateAnswer } from "./cards";
import { ILLUSTRATIONS, INTERACTIONS } from "./enrich";
import type { TapResult } from "./enrich/afs";
import type { TapState } from "./enrich/afs-model";
import { SlidesClose } from "./SlidesClose";
import { Caption, CardTitle, Eyebrow, Kbd, Prose, Stage, Track, controlPrimary, quietLink } from "./ui";

export interface SlidesRunProps {
  subject: Subject;
  unit: string;
  slug: string;
  topicId: string;
  /** The catalogue title (what Rowan is told the topic is called). */
  title: string;
  /** The short display title on every header. */
  displayTitle: string;
  /** "Further Maths · FM1" */
  locator: string;
  deck: Deck;
}

type Grade = "again" | "good" | "easy";
const GRADES: Array<{ grade: Grade; label: string; hint: string }> = [
  { grade: "again", label: "Again", hint: "Did not get it" },
  { grade: "good", label: "Good", hint: "Got it with effort" },
  { grade: "easy", label: "Easy", hint: "Instant" },
];

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
}

/**
 * The title card's lede: two sentences at most (art direction v2 §8.1); the whole lede stays on the topic page. A stacked
 * fraction inside running prose is set at text size (\tfrac is the most an inline fraction may be, §8.4), so a line of
 * the lede is a line, not a display.
 */
function ledeForTitle(lede: string): string {
  return splitSentences(lede)
    .slice(0, 2)
    .join(" ")
    .replace(/\\dfrac\{/g, "\\tfrac{");
}

/** What Enter does, in the bottom bar's words: the control's own verb (audit CQ-14). */
function enterWord(label: string): string {
  if (label === "Start the slides") return "start";
  if (label === "Show the answer") return "show";
  if (label === "Show me the answer") return "show the answer";
  return label.toLowerCase();
}

export function SlidesRun({ subject, unit, slug, topicId, title, displayTitle, locator, deck }: SlidesRunProps) {
  const enrichment = useMemo(() => enrichmentFor(topicId), [topicId]);
  const topicHref = `/learn/${subject}/${unit}/${slug}/`;
  // "for your paper on 18 May": her own plan (decision 16), read on the device; the default plan holds the line's place,
  // invisible, until it is read, so nothing below it shifts.
  const plan = useExamPlan();
  const paper = (() => {
    const text = paperPhrase(plan ?? DEFAULT_PLAN, subject, unit, todayISO());
    return text ? { text, held: plan === undefined } : null;
  })();

  // The run's state. Answers are keyed by gate id; retries by "retry:<id>".
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [missed, setMissed] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, GateAnswer>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, TapResult>>({});
  // What she struck on a figure, by card key: kept by the run so a placed strike stays placed across a card change and a
  // reload (art direction v2 §6, "no loss"; audit CQ-04).
  const [figures, setFigures] = useState<Record<string, TapState>>({});
  const [checkSignal, setCheckSignal] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [graded, setGraded] = useState<Record<string, Grade>>({});
  // A recall card's typed answer (kept so "Show the answer" puts it beside the model answer) and the ones she skipped.
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [skipped, setSkipped] = useState<Record<string, true>>({});
  // The See its: steps shown per card, the step she typed, which she saw to their end (this run and earlier ones).
  const [steps, setSteps] = useState<Record<string, number>>({});
  const [typedSteps, setTypedSteps] = useState<Record<string, StepResult>>({});
  const [seen, setSeen] = useState<string[]>([]);
  const [seenBefore, setSeenBefore] = useState<string[]>([]);
  // The See it whose newest step her Continue showed just now: that step arrives with the reveal motion.
  const [animateKey, setAnimateKey] = useState<string | null>(null);
  // The Your turns she missed and then asked to see answered, after the re-teach.
  const [shown, setShown] = useState<Record<string, true>>({});
  const [answeredBefore, setAnsweredBefore] = useState<Set<string> | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [restored, setRestored] = useState(false);
  // Writes to the device still in flight (a Your turn's attempt, a recall grade): the close waits for them before it
  // reads what returns, so it counts the card graded a moment before it appeared.
  const [writing, setWriting] = useState(0);
  const write = useCallback(
    (job: () => Promise<unknown>) => {
      setWriting((n) => n + 1);
      void job()
        .then(() => touchSession(subject))
        .catch(() => {
          // Storage unavailable: the answer still shows; nothing else to do on a study screen.
        })
        .finally(() => setWriting((n) => n - 1));
    },
    [subject],
  );

  const cards = useMemo(() => withRetries(deck.cards, missed), [deck.cards, missed]);
  const N = cards.length;
  const card = cards[Math.min(index, N - 1)];
  const isLast = index >= N - 1;

  // The order each Your turn's options are shown in: balanced over the lesson's gates, the same order Read shows (the
  // gates are the note's, in the note's order). A retry asks the twin with its answer off the place the first asking lit
  // it, or the same gate with its answer moved.
  const orders = useMemo(() => deckGateOrders(deck.cards.filter((c): c is GateCard => c.kind === "gate" && !c.retry).map((c) => c.gate)), [deck.cards]);
  const shownFor = useCallback(
    (c: GateCard): string[] => {
      const first = shownOptions(c.gate, orders);
      if (!c.retry) return first;
      const twin = c.twin ? twinGate(c.gate) : null;
      if (twin) return twinOptions(twin, first.findIndex((o) => o.trim() === c.gate.answer.trim()));
      return retryOrder(c.gate, first);
    },
    [orders],
  );

  // Her place on this device with what the run has done, and the gates answered on any visit (so nothing is recorded
  // twice). A finished run starts afresh, keeping only which See its she has already seen to their end.
  useEffect(() => {
    const pos = readPosition(topicId);
    if (pos && !pos.done) {
      // A figure kept from a run on an earlier drawing starts afresh, with its Check (never a "done" over unstruck pills).
      const pieces = (key: string) => {
        const c = deck.cards.find((d) => d.key === key);
        return c?.kind === "interaction" ? (INTERACTIONS[c.id]?.pills ?? null) : null;
      };
      const kept = withKnownFigures(pos, pieces);
      setMissed(pos.missed);
      setAnswers(pos.answers);
      setChecked(kept.checked);
      setGraded(pos.graded);
      setTyped(pos.typed);
      setSkipped(pos.skipped);
      setFigures(kept.figures as Record<string, TapState>);
      setSteps(pos.steps);
      setTypedSteps(pos.typedSteps);
      setShown(pos.shown);
      setSeen(pos.seen);
      setSeenBefore(pos.seenBefore);
      const expanded = withRetries(deck.cards, pos.missed);
      const byKey = pos.key ? expanded.findIndex((c) => c.key === pos.key) : -1;
      setIndex(byKey >= 0 ? byKey : Math.min(pos.at, expanded.length - 1));
    } else if (pos?.done) {
      const fresh = nextRun(pos);
      writePosition(topicId, fresh);
      setSeenBefore(fresh.seenBefore);
    }
    setRestored(true);
    answeredGateIds(subject, slug, topicId)
      .then((ids) => setAnsweredBefore(new Set(ids)))
      .catch(() => setAnsweredBefore(new Set()));
  }, [deck.cards, subject, slug, topicId]);

  useEffect(() => {
    if (!restored) return;
    writePosition(topicId, { at: index, key: card.key, done: isLast, missed, answers, checked, graded, typed, skipped, figures, steps, typedSteps, shown, seen, seenBefore });
  }, [answers, card.key, checked, figures, graded, index, isLast, missed, restored, seen, seenBefore, shown, skipped, steps, topicId, typed, typedSteps]);

  // When the current recall card would come back under each grade, computed once at the moment she shows the answer,
  // and the moment itself: the tap records the grade at that same moment, so the day stored is the day printed
  // (src/lib/slides/returns.ts). No date is shown until it is known, and none when the scheduler cannot be read.
  const [when, setWhen] = useState<{ key: string; now: Date; words: Record<Grade, string> | null } | null>(null);
  const revealRecall = useCallback(() => {
    if (card.kind !== "recall") return;
    const key = card.key;
    const now = new Date();
    setRevealed((r) => ({ ...r, [key]: true }));
    setWhen({ key, now, words: null });
    gradeReturnDates(subject, unit, card.prompt.id, now)
      .then((d) => setWhen((w) => (w && w.key === key && w.now === now ? { ...w, words: { again: returnWord(d.again, now), good: returnWord(d.good, now), easy: returnWord(d.easy, now) } } : w)))
      .catch(() => {
        // The scheduler could not be read: the buttons stay, with no date under them.
      });
  }, [card, subject, unit]);
  // A card revealed earlier in the run (she went back, or reloaded) gets its dates again when it is shown.
  useEffect(() => {
    if (card.kind !== "recall" || !revealed[card.key] || graded[card.key] || when?.key === card.key) return;
    revealRecall();
  }, [card, graded, revealRecall, revealed, when]);

  // Focus follows the card, so a screen reader reads the new one and Tab carries on from it: the card's title (the h1 of
  // the title and close cards, the header's h2 on a card that has one), else the card's own section. Each is a landing
  // place, out of the tab order and marked quiet (focusLanding, the focus contract in src/components/shell/
  // input-modality.ts): no ring after a click, a tap or the arrow keys that turn the cards; the ring when the keyboard
  // brought her there (Tab, or Enter on a control). The body starts at its top. (Owner's finding c; audit CD-03, CQ-13.)
  const frameRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!restored) return;
    const frame = frameRef.current;
    const body = cardRef.current;
    if (!frame || !body) return;
    const target = frame.querySelector<HTMLElement>("[data-card-title]") ?? body.querySelector<HTMLElement>("h1") ?? body.querySelector<HTMLElement>("[data-card-section]") ?? body;
    focusLanding(target);
    body.scrollTo({ top: 0 });
  }, [index, restored]);

  // What has just appeared on a Your turn (the verdict after Check, the re-teach after a miss, the answer after "Show me
  // the answer") takes the keyboard, so a screen reader reads it and Tab carries on from it (audit SLIDES-37, SLIDES-27:
  // the option she pressed Enter on is disabled and focus fell to the page), and is brought into view inside the card,
  // so its last line is never left under the foot on a phone (audit LD-14). Set by the action, read once it has rendered.
  const landOn = useRef<{ key: string; selector: string } | null>(null);
  useEffect(() => {
    const want = landOn.current;
    if (!want || want.key !== card.key) return;
    const el = cardRef.current?.querySelector<HTMLElement>(want.selector);
    if (!el) return;
    landOn.current = null;
    focusLanding(el);
    const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  });

  // The page behind must not scroll: the layer is the page.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ---- what the current card allows (src/lib/slides/run.ts) -------------------------------------------- */
  const gateCard = card.kind === "gate" ? card : null;
  const answerKey = gateCard ? (gateCard.retry ? `retry:${gateCard.gate.id}` : gateCard.gate.id) : null;
  const gateAnswer = answerKey ? (answers[answerKey] ?? null) : null;
  const gateSelected = gateCard ? (selected[gateCard.key] ?? null) : null;
  const gateShown = gateCard && !gateCard.retry ? shown[gateCard.gate.id] === true : false;
  const phase = gateCard ? gatePhase(gateAnswer, gateCard.retry, gateShown) : null;
  const asked = gateCard ? ((gateCard.retry && gateCard.twin ? twinGate(gateCard.gate) : null) ?? gateCard.gate) : null;
  const seeCard = card.kind === "see" ? card : null;
  const typedResult = seeCard ? (typedSteps[seeCard.key] ?? null) : null;
  const progress = seeCard ? seeProgress(seeCard, steps[seeCard.key], typedResult !== null) : null;
  const tapChecked = card.kind === "interaction" ? (checked[card.key] ?? null) : null;
  const isRevealed = card.kind === "recall" ? revealed[card.key] === true : false;
  const isGraded = card.kind === "recall" ? graded[card.key] !== undefined : false;
  const isSkipped = card.kind === "recall" ? skipped[card.key] === true : false;
  const cardState: CardState = {
    gateAnswer,
    gateSelected,
    gateShown,
    seeProgress: progress,
    // An interaction the registry cannot draw never locks the way on (audit CQ-20).
    tapDone: card.kind === "interaction" ? tapChecked !== null || !INTERACTIONS[card.id] : false,
    recallRevealed: isRevealed,
    recallGraded: isGraded,
    recallSkipped: isSkipped,
  };
  const unlocked = unlockedFor(card, cardState);

  // A See it seen to its end is remembered for this run, and for the next visit's "Skip to your turn".
  useEffect(() => {
    if (!restored || !seeCard || !progress?.complete || seen.includes(seeCard.key)) return;
    setSeen((s) => (s.includes(seeCard.key) ? s : [...s, seeCard.key]));
  }, [progress?.complete, restored, seeCard, seen]);

  const go = useCallback(
    (to: number, dir: "forward" | "back") => {
      setDirection(dir);
      setAnimateKey(null);
      setIndex(Math.max(0, Math.min(to, N - 1)));
    },
    [N],
  );
  const next = useCallback(() => {
    if (!unlocked || isLast) return;
    go(index + 1, "forward");
  }, [go, index, isLast, unlocked]);
  const back = useCallback(() => {
    if (index === 0) return;
    go(index - 1, "back");
  }, [go, index]);

  /* ---- See it ----------------------------------------------------------------------------------------- */
  const revealStep = useCallback(() => {
    if (!seeCard || !progress || progress.waiting) return;
    if (progress.revealed >= progress.total) return;
    setSteps((s) => ({ ...s, [seeCard.key]: progress.revealed + 1 }));
    setAnimateKey(seeCard.key);
  }, [progress, seeCard]);
  const onTyped = useCallback(
    (r: StepResult) => {
      if (!seeCard) return;
      haptic();
      // Marked through the engine and never recorded: a See it is shown before it is asked. The field she typed in is
      // gone, so the keyboard goes to what it says about her line.
      landOn.current = { key: seeCard.key, selector: "[data-typed-result]" };
      setTypedSteps((t) => ({ ...t, [seeCard.key]: r }));
    },
    [seeCard],
  );
  const skipSee = useCallback(() => {
    if (!seeCard || !progress) return;
    setSteps((s) => ({ ...s, [seeCard.key]: progress.total }));
    if (seeCard.typed !== null && !typedResult) setTypedSteps((t) => ({ ...t, [seeCard.key]: { shown: true } }));
    setDirection("forward");
    setAnimateKey(null);
    setIndex((i) => Math.min(i + 1, N - 1));
  }, [N, progress, seeCard, typedResult]);
  /** The way on from the keys and the swipe: on a See it the next step first, then the next card. */
  const forward = useCallback(() => {
    if (seeCard && progress && !progress.complete) revealStep();
    else next();
  }, [next, progress, revealStep, seeCard]);

  /* ---- Your turn -------------------------------------------------------------------------------------- */
  const checkGate = useCallback(() => {
    if (!gateCard || !asked || gateAnswer !== null) return;
    const raw = (selected[gateCard.key] ?? "").trim();
    if (!raw) return;
    const correct = markGate(asked, raw);
    const id = gateCard.gate.id;
    haptic();
    landOn.current = { key: gateCard.key, selector: correct || gateCard.retry ? "[data-verdict]" : "[data-reteach]" };
    if (gateCard.retry) {
      setAnswers((a) => ({ ...a, [`retry:${id}`]: { answer: raw, correct, record: "retry" } }));
      return;
    }
    const before = answeredBefore?.has(id) ?? false;
    setAnswers((a) => ({ ...a, [id]: { answer: raw, correct, record: before ? "already" : "recorded" } }));
    if (!correct) setMissed((m) => (m.includes(id) ? m : [...m, id]));
    if (!before) {
      setAnsweredBefore((s) => new Set([...(s ?? []), id]));
      // The misconception her option names, when its note names one (V3.1), is the attempt's tag: the ledger reads it.
      const tags = correct ? [] : misconceptionTags(gateCard.gate, raw);
      write(() => recordAttempt({ item: { subject, unit, topicSlug: slug, id: `${topicId}#gate:${id}` }, itemKind: "practice", correct, answerRaw: raw, misconceptionTags: tags }));
    }
  }, [answeredBefore, asked, gateAnswer, gateCard, selected, slug, subject, topicId, unit, write]);
  const showAnswer = useCallback(() => {
    if (!gateCard || gateCard.retry) return;
    landOn.current = { key: gateCard.key, selector: "[data-verdict]" };
    setShown((s) => ({ ...s, [gateCard.gate.id]: true }));
  }, [gateCard]);

  /* ---- the recall card -------------------------------------------------------------------------------- */
  const grade = useCallback(
    (g: Grade) => {
      if (card.kind !== "recall" || !revealed[card.key] || graded[card.key]) return;
      // Recorded at the moment the dates were printed, so the day stored is the day she read under the button.
      const at = when?.key === card.key ? when.now : new Date();
      haptic();
      setGraded((s) => ({ ...s, [card.key]: g }));
      setSkipped((s) => {
        if (!s[card.key]) return s;
        const rest = { ...s };
        delete rest[card.key];
        return rest;
      });
      write(() => recordRecallGrade({ subject, unit, topicSlug: slug, id: card.prompt.id }, g, at));
      go(index + 1, "forward");
    },
    [card, go, graded, index, revealed, slug, subject, unit, when, write],
  );
  const skip = useCallback(() => {
    if (card.kind !== "recall" || graded[card.key]) return;
    setSkipped((s) => ({ ...s, [card.key]: true }));
    go(index + 1, "forward");
  }, [card, go, graded, index]);

  /* ---- the one control, shared by the button, Enter and the swipe ------------------------------------ */
  const rule = primaryFor(cards, index, cardState);
  const run: Record<Action, () => void> = {
    start: () => go(1, "forward"),
    next,
    "reveal-step": revealStep,
    check: checkGate,
    "show-answer": showAnswer,
    "check-tap": () => setCheckSignal((s) => s + 1),
    "reveal-recall": revealRecall,
  };
  const primary = rule ? { label: rule.label, action: run[rule.action], disabled: rule.disabled } : null;

  /* ---- keyboard --------------------------------------------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const typing = isTypingTarget(e.target);
      // On an option of an open gate the keys are the radio group's (WAI-ARIA, and Read's gate): the arrows move the
      // choice, Enter checks it, as the card's own caption says (audit CQ-12: Enter re-chose, ArrowLeft left the gate).
      const option = e.target instanceof HTMLElement && e.target.getAttribute("role") === "radio" ? e.target.closest<HTMLElement>("[data-gate]") && e.target : null;
      if (option && gateCard && !gateAnswer) {
        if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          const radios = Array.from(option.closest("[data-gate]")!.querySelectorAll<HTMLElement>("[role='radio']"));
          const by = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
          const to = radios[(radios.indexOf(option) + by + radios.length) % radios.length];
          const value = to?.getAttribute("data-value");
          if (to && value !== null && value !== undefined) {
            setSelected((s) => ({ ...s, [gateCard.key]: value }));
            to.focus();
          }
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          if (primary && !primary.disabled) primary.action();
          return;
        }
      }
      if (e.key === "ArrowRight" && !typing) {
        if (!isLast && card.kind !== "close" && (unlocked || (seeCard && progress && !progress.complete && !progress.waiting))) {
          e.preventDefault();
          forward();
        }
        return;
      }
      if (e.key === "ArrowLeft" && !typing) {
        e.preventDefault();
        back();
        return;
      }
      if (e.key === "Enter") {
        if (typing && (e.target as HTMLElement).tagName === "TEXTAREA" && e.shiftKey) return;
        if (e.target instanceof HTMLElement && (e.target.tagName === "BUTTON" || e.target.tagName === "A")) return; // the element's own Enter
        // A field in a See it's typed step answers through its own form.
        if (typing && e.target instanceof HTMLElement && e.target.closest("[data-typed-step]")) return;
        if (primary && !primary.disabled) {
          e.preventDefault();
          primary.action();
        }
        return;
      }
      if (/^[1-9]$/.test(e.key) && !typing) {
        const n = Number(e.key);
        if (gateCard && asked?.kind === "choice" && !gateAnswer) {
          // The digit is the shown position, the same one the letter badge prints.
          const opt = shownFor(gateCard)[n - 1];
          if (opt) {
            e.preventDefault();
            setSelected((s) => ({ ...s, [gateCard.key]: opt }));
          }
        } else if (card.kind === "recall" && isRevealed && !isGraded && n <= 3) {
          e.preventDefault();
          grade(GRADES[n - 1].grade);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [asked, back, card, forward, gateAnswer, gateCard, grade, isGraded, isLast, isRevealed, primary, progress, seeCard, shownFor, unlocked]);

  /* ---- swipe ------------------------------------------------------------------------------------------ */
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Only a finger or a pen can swipe; a mouse drag selects text (src/lib/slides/gesture.ts).
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const selection = typeof window.getSelection === "function" ? (window.getSelection()?.toString() ?? "") : "";
    const turn = swipeDirection({ pointerType: e.pointerType, dx: e.clientX - s.x, dy: e.clientY - s.y, selection });
    if (turn === "next") forward();
    else if (turn === "back") back();
  };

  /* ---- the card's parts ------------------------------------------------------------------------------- */
  const retriesNote = (() => {
    if (missed.length === 0) return null;
    const held = missed.filter((id) => answers[`retry:${id}`]?.correct).length;
    const came = missed.filter((id) => answers[`retry:${id}`] !== undefined).length;
    if (came === 0) return null;
    if (missed.length === 1) return held === 1 ? "The one you missed came back before this card, and held." : "The one you missed came back before this card.";
    return `The ones you missed came back before this card; ${held} of ${came} held.`;
  })();

  // The note's hoisted figure's caption: a registered drawing that stands in for that figure on an idea card says it.
  const heroCaption = (() => {
    const first = deck.cards[0];
    return first?.kind === "title" && first.figure?.kind === "svg" ? (first.figure.caption ?? null) : null;
  })();

  const parts: CardParts | null = (() => {
    switch (card.kind) {
      case "idea": {
        const drawn = enrichment?.illustrations?.[card.key] ?? null;
        return ideaParts(card, drawn, drawn !== null && drawn === enrichment?.illustrations?.title ? heroCaption : null);
      }
      case "media":
        return mediaParts(card, cards[index + 1]?.kind === "gate");
      case "see":
        return seeParts(card, {
          revealed: progress?.revealed ?? 1,
          typedResult,
          onTyped,
          animateLast: animateKey === card.key,
          onSkip: progress && canSkipSee(card, seenBefore, progress) ? skipSee : null,
        });
      case "gate": {
        const reactionId = enrichment?.reactions?.[card.gate.id] ?? null;
        if (phase === "reteach" && gateAnswer && asked) {
          const see = card.seeKey ? ((deck.cards.find((c) => c.key === card.seeKey) as SeeCard | undefined) ?? null) : null;
          return reteachParts(card, asked, { hers: gateAnswer.answer, reactionId, see });
        }
        return gateParts(card, {
          asked: asked ?? card.gate,
          selected: gateSelected,
          answer: gateAnswer,
          phase: phase ?? "open",
          onSelect: (opt) => setSelected((s) => ({ ...s, [card.key]: opt })),
          reactionId,
          options: shownFor(card),
          note: gateNote(card),
          meta: gateAnswer ? answerNote(card, gateAnswer.correct, gateAnswer.record) : "",
        });
      }
      case "callout":
        return calloutParts(card);
      case "interaction":
        return interactionParts(card, {
          checked: tapChecked,
          checkSignal,
          onChecked: (r) => setChecked((c) => ({ ...c, [card.key]: r })),
          figure: figures[card.key],
          onFigure: (s) => setFigures((f) => ({ ...f, [card.key]: s })),
        });
      case "recap":
        return recapParts(card, enrichment?.recapGlyphs ?? null, retriesNote);
      case "pointer":
        return pointerParts(card);
      case "recall":
        return recallParts(card, {
          revealed: isRevealed,
          typed: typed[card.key] ?? "",
          onType: (text) => setTyped((t) => ({ ...t, [card.key]: text })),
          graded: graded[card.key] ?? null,
          skipped: isSkipped,
        });
      default:
        return null;
    }
  })();

  const facts = useMemo(() => {
    const gates = deck.cards.filter((c): c is GateCard => c.kind === "gate");
    const answered = gates.filter((g) => answers[g.gate.id] !== undefined).length;
    const held = missed.filter((id) => answers[`retry:${id}`]?.correct).length;
    const recalled = Object.keys(graded).length;
    return { checks: gates.length, answered, missed: missed.length, held, recalled };
  }, [answers, deck.cards, graded, missed]);

  const stats = deckStats(cards);
  const count = `${index + 1} of ${N}`;
  const showTrack = card.kind !== "title" && card.kind !== "close";
  const motionCls = direction === "forward" ? "motion-card-forward" : "motion-card-back";
  // The re-teach is its Your turn's card, not a card of its own: the track and the count do not move (the case §8.1).
  const cardKind = card.kind === "gate" && phase === "reteach" ? "reteach" : card.kind;
  const exit = (
    <Link href={topicHref} className="tap inline-flex items-center gap-1.5 font-sans text-[14px] text-ink-2 hover:text-ink lg:w-[120px]" data-exit>
      <span aria-hidden className="text-[18px] leading-none">
        ←
      </span>
      Exit
      <span className="sr-only">. Your place is kept.</span>
    </Link>
  );

  /* ---- the one control, and the foot it sits in ------------------------------------------------------- */
  const grading = card.kind === "recall" && isRevealed && !isGraded;
  const words = card.kind === "recall" && when?.key === card.key ? when.words : null;
  const control: ReactNode = (() => {
    if (card.kind === "close") return null;
    if (grading) {
      return (
        <div role="group" aria-label="How did it go? Each says when the card comes back." className="grid grid-cols-3 gap-2.5" data-grades>
          {GRADES.map((g) => (
            <button
              key={g.grade}
              type="button"
              title={g.hint}
              onClick={() => grade(g.grade)}
              data-grade={g.grade}
              className="tap tap-lg flex flex-col items-center justify-center rounded-[12px] border border-line-3 bg-surface px-2 font-sans text-[16px] font-semibold leading-tight text-ink transition-transform duration-150 hover:bg-surface-2 active:scale-[0.98] disabled:pointer-events-none"
            >
              {g.label}
              {/* The day this grade stores, once the scheduler has said it; the line keeps its height meanwhile. */}
              <span className="text-[13px] font-normal text-ink-2" data-when>
                {words?.[g.grade] ?? " "}
              </span>
            </button>
          ))}
        </div>
      );
    }
    if (!primary) return null;
    return (
      <button type="button" className={controlPrimary} disabled={primary.disabled} onClick={primary.action} data-control>
        {primary.label}
      </button>
    );
  })();

  /** Skip, on every recall card until it is graded: nothing is recorded, nothing is scheduled, nothing counts against her. */
  const skipButton =
    card.kind === "recall" && !isGraded && !isSkipped ? (
      <button type="button" className={quietLink} onClick={skip} data-skip>
        Skip
        <span className="sr-only">: nothing is recorded</span>
      </button>
    ) : null;

  const footNote: ReactNode =
    card.kind === "title" ? (
      <Link href={topicHref} className={quietLink} onClick={() => rememberLessonWay("read")} data-way="read">
        Read it as a page instead
      </Link>
    ) : gateCard && phase === "open" ? (
      // Said once: on the desktop the same line stands beside the gate (audit CD-10).
      <Caption className="text-center lg:hidden">{gateNote(gateCard)}</Caption>
    ) : gateCard && phase === "reteach" ? (
      <Caption className="text-center lg:hidden">Nothing about this is recorded but your first answer.</Caption>
    ) : grading ? (
      <div className="flex flex-col items-center gap-1 lg:flex-row lg:gap-4">
        <Caption className="text-center lg:text-left">Again is honest, not a penalty: the card comes back sooner.</Caption>
        {skipButton}
      </div>
    ) : (
      skipButton
    );

  const hints: ReactNode = (
    <div className="hidden items-center gap-4 font-sans text-[13px] text-ink-3 lg:flex" data-hints>
      <span>
        <Kbd>←</Kbd> <Kbd>→</Kbd> move
      </span>
      {primary && (
        <span>
          {/* What Enter does now: the control's own word (audit CQ-14: it said "check" under a Continue). */}
          <Kbd>Enter</Kbd> {enterWord(primary.label)}
        </span>
      )}
      {gateCard && asked?.kind === "choice" && !gateAnswer && (
        <span>
          <Kbd>1</Kbd> <Kbd>2</Kbd> <Kbd>3</Kbd> choose
        </span>
      )}
      {grading && (
        <span>
          <Kbd>1</Kbd> <Kbd>2</Kbd> <Kbd>3</Kbd> grade
        </span>
      )}
    </div>
  );

  /** The foot: on the phone the control with its note under it; from lg the full-width bottom bar. */
  const foot: ReactNode = (
    <div className="flex flex-col gap-2 px-6 pb-6 pt-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:border-t lg:border-line lg:bg-surface lg:px-10 lg:py-4" data-foot>
      {hints}
      <div className="flex flex-col gap-2 lg:flex-row-reverse lg:items-center lg:gap-4">
        <div className={clsx("w-full", grading ? "lg:w-[420px]" : "lg:w-[300px]")}>{control}</div>
        {footNote && <div className="flex justify-center lg:justify-start">{footNote}</div>}
      </div>
    </div>
  );

  // `data-ready` marks the hydrated, restored deck: before it, a key press has no listener yet.
  const rootCls = "fixed inset-0 z-50 flex flex-col overflow-hidden bg-ground text-ink";
  const ready = restored ? "true" : undefined;

  if (card.kind === "close") {
    return (
      <div ref={frameRef} data-slides data-palette="v2" data-ready={ready} className={rootCls} role="region" aria-label={`Slides: ${displayTitle}`}>
        <div ref={cardRef} key={index} className={clsx("min-h-0 flex-1 overflow-y-auto", motionCls)} data-body data-card="close">
          <SlidesClose subject={subject} unit={unit} slug={slug} title={title} displayTitle={displayTitle} count={count} startedAt={startedAt} facts={facts} settled={writing === 0} />
        </div>
      </div>
    );
  }

  if (card.kind === "title") {
    const figureId = enrichment?.illustrations?.title ?? null;
    const Fig = figureId ? ILLUSTRATIONS[figureId] : null;
    const figure = Fig ? <Fig variant="title" /> : card.figure?.kind === "svg" ? <InlineSvg svg={card.figure.svg} alt={card.figure.alt} className="m-0 w-full" /> : null;
    return (
      <div ref={frameRef} data-slides data-palette="v2" data-ready={ready} className={rootCls} role="region" aria-label={`Slides: ${displayTitle}`}>
        <div ref={cardRef} key={index} className={clsx("flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_520px] lg:overflow-hidden", motionCls)} data-body data-card="title">
          {/* The text column: on the phone its head (Exit, the locator, the title, the figure) carries the wash. */}
          <div className="flex min-h-0 flex-col lg:min-h-0 lg:overflow-y-auto">
            <div className="bg-[var(--tint-wash)] px-6 pb-3 pt-3 lg:bg-transparent lg:px-14 lg:pb-0 lg:pt-7">
              <div className="flex items-center justify-between">
                {exit}
                <p className={clsx(locatorCls, "lg:hidden")}>{locator}</p>
              </div>
              <p className={clsx(locatorCls, "mt-9 hidden lg:block")}>
                {locator}
                {paper && (
                  <span className={paper.held ? "invisible" : undefined} aria-hidden={paper.held || undefined}>
                    {" "}
                    · {paper.text}
                  </span>
                )}
              </p>
              <h1 tabIndex={-1} data-focus-quiet="" className="mt-3 max-w-[18ch] font-serif-lesson text-[30px] font-medium leading-[1.15] tracking-[-0.015em] text-ink lg:mt-4 lg:max-w-[16ch] lg:text-[44px] lg:leading-[1.1]">
                <MdInlines inlines={parseInline(displayTitle)} />
              </h1>
              {figure && (
                <Stage className="mt-3 lg:hidden">
                  <div className="w-full max-w-[248px]">{figure}</div>
                </Stage>
              )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col px-6 pt-3 lg:px-14">
              <TitleText card={card} stats={stats} />
              <div className="mt-auto flex flex-col gap-1 pb-5 pt-3 lg:flex-row lg:items-center lg:gap-4 lg:pb-8 lg:pt-6">
                <div className="w-full lg:w-[240px]">{control}</div>
                <div className="flex justify-center">{footNote}</div>
              </div>
              <Caption className="pb-3 text-center lg:hidden">Swipe or tap to move on. Swipe back any time to re-read a card.</Caption>
              <Caption className="hidden pb-8 lg:block">Arrow keys or a click move on. You can always go back to re-read a card.</Caption>
            </div>
          </div>
          {figure && (
            <div className="hidden lg:flex lg:items-center lg:justify-center lg:bg-[var(--tint-wash)] lg:p-12" data-title-figure>
              <Stage className="w-full max-w-[452px] !p-6">
                <div className="w-full max-w-[400px]">{figure}</div>
              </Stage>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={frameRef} data-slides data-palette="v2" data-ready={ready} className={rootCls} role="region" aria-label={`Slides: ${displayTitle}`}>
      {/* The header: the wash band with Exit, the topic, the count, the track, then the card's eyebrow and title. */}
      <header className="bg-[var(--tint-wash)] px-6 pb-4 pt-3 lg:px-10 lg:pb-6 lg:pt-5" data-header>
        <div className="flex items-center gap-4 lg:gap-6">
          {exit}
          <div className="flex min-w-0 flex-1 flex-col gap-2 lg:mx-auto lg:max-w-[720px]">
            <div className="flex items-baseline justify-between gap-3 font-sans text-[13px] text-ink-2">
              <span className="min-w-0 truncate">{displayTitle}</span>
              <span className="tnum shrink-0" aria-live="polite" data-count>
                {count}
              </span>
            </div>
            {showTrack && <Track n={index + 1} N={N} />}
          </div>
          <span className="hidden lg:block lg:w-[120px]" aria-hidden />
        </div>
        {parts && (
          <div className="mt-4 flex w-full flex-col gap-1.5 lg:mx-auto lg:mt-5 lg:max-w-[1000px]">
            <Eyebrow>{parts.eyebrow}</Eyebrow>
            {parts.title && <CardTitle>{parts.title}</CardTitle>}
          </div>
        )}
      </header>

      {/* The body: the card on the paper. Prose column, then the figure or the verdict. */}
      <div className="relative flex min-h-0 flex-1 lg:justify-center lg:px-10 lg:pt-9" data-body onPointerDown={onPointerDown} onPointerUp={onPointerUp} style={{ touchAction: "pan-y" }}>
        <button type="button" aria-label="Previous card" onClick={back} disabled={index === 0} className="absolute left-10 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-2 bg-surface text-[18px] text-ink-2 hover:bg-surface-2 disabled:opacity-40 lg:flex" data-prev>
          <span aria-hidden>‹</span>
        </button>
        <div ref={cardRef} key={index} className={clsx("flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-4 pt-4 lg:w-[1000px] lg:max-w-full lg:flex-none lg:px-0 lg:pt-0", motionCls)} data-card={cardKind} style={{ touchAction: "pan-y" }}>
          <section aria-label={`Card ${count}`} tabIndex={-1} data-card-section data-focus-quiet="" className={clsx("flex flex-col gap-3 lg:grid lg:items-start lg:gap-14", parts?.right ? "lg:grid-cols-[minmax(0,1fr)_400px]" : "lg:grid-cols-[minmax(0,640px)]")}>
            <div className="flex min-w-0 flex-col gap-3.5">{parts?.left}</div>
            {parts?.right && <div className="flex min-w-0 flex-col gap-2.5">{parts.right}</div>}
          </section>
        </div>
        <button
          type="button"
          aria-label={seeCard && progress && !progress.complete ? "Next step" : "Next card"}
          onClick={forward}
          disabled={isLast || !(unlocked || (seeCard && progress && !progress.complete && !progress.waiting))}
          className="absolute right-10 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-2 bg-surface text-[18px] text-ink-2 hover:bg-surface-2 disabled:opacity-40 lg:flex"
          data-next
        >
          <span aria-hidden>›</span>
        </button>
      </div>

      {foot}
    </div>
  );
}

/** The title card's words: the lede (two sentences), the honest promise, the three "you can" lines. */
function TitleText({ card, stats }: { card: Extract<Card, { kind: "title" }>; stats: ReturnType<typeof deckStats> }) {
  const { minutes, plus } = deckMinutes(stats);
  return (
    <div className="flex flex-col">
      {card.lede && <Prose md={ledeForTitle(card.lede)} size="lede" className="max-w-[42ch] lg:mt-5 lg:max-w-[44ch]" />}
      <p className="mt-3 font-sans text-[15px] text-ink-2 lg:mt-3.5" data-promise>
        <span className="font-semibold text-ink">{minutes}</span>
        {plus && ` ${plus}`} · {promiseLine(stats)}
      </p>
      {card.can.length > 0 && (
        <ul className="mt-3 flex max-w-[48ch] flex-col gap-1 font-sans text-[14px] leading-[1.4] text-ink-2 lg:mt-4 lg:text-[15px]">
          {card.can.map((line) => (
            <li key={line} className="flex items-baseline gap-2.5">
              <span aria-hidden className="relative top-[-2px] h-[6px] w-[6px] shrink-0 rounded-full bg-ink-3" />
              <span>
                <MdInlines inlines={parseInline(line)} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
