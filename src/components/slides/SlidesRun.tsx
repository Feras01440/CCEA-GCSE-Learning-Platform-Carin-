"use client";

/**
 * Slides: one idea, one figure or one interaction per card, a gate every few cards, the missed gates back before the
 * recap, the recap and the pointer as the last cards, the close with Rowan (decisions 9 and 17; art direction v2 §8).
 *
 * The frame is one DOM tree on both sizes, and every control exists once. On a phone (390 x 844) the card fills the
 * screen: a wash header with Exit, the topic, "n of N" and the segmented track, then the card's eyebrow and title; the
 * body on the paper; the one control in a foot with 24 px clearance. From lg (1024 px) the whole screen is the card:
 * the wash header band holds Exit, the centred 720 px track and count, then the label and title on a 1000 px measure;
 * the body is that measure in two columns (prose, then the figure or the verdict at 400 px); previous and next stand
 * at the screen's edges; the foot becomes the full-width bottom bar with the keyboard hints and the same control.
 * No navigation rail anywhere inside.
 *
 * Progress is one record with Read: a gate is recorded as `${topicId}#gate:${id}` (itemKind "practice") on its first
 * answer only, a recall card as its prompt id (itemKind "prompt"), exactly as TopicContent does. Her place on this
 * device is the card she was on (src/lib/slides/position.ts); Exit keeps it and the hero offers "Continue the slides".
 *
 * Keyboard: arrows move, Enter checks or continues, 1 to 9 choose an option or grade a recall card. Swipe: a horizontal
 * pointer drag of 60 px. Motion: the card advance (200 ms, translateX 24 to 0), the verdict's reveal, the placed result;
 * all static under prefers-reduced-motion (the classes turn off, and the figure's strike takes duration 0).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { InlineSvg, MdInlines, gateOptions, markGate, parseInline } from "@/components/items";
import { rememberLessonWay } from "@/components/topic/lesson-way";
import { locatorCls } from "@/components/shell/PageHeader";
import type { Subject } from "@/lib/content/taxonomy";
import { DEFAULT_PLAN, paperPhrase, todayISO } from "@/lib/plan/exam-plan";
import { useExamPlan } from "@/lib/plan/store";
import { answeredGateIds } from "@/lib/session/flow";
import { recordAttempt, touchSession } from "@/lib/session/record";
import { deckStats, promiseLine, splitSentences, withRetries, type Card, type Deck } from "@/lib/slides/cards";
import { enrichmentFor } from "@/lib/slides/enrichment";
import { clearPosition, readPosition, writePosition } from "@/lib/slides/position";
import { gradeReturnDates, returnWord } from "@/lib/slides/returns";
import { tap as haptic } from "@/lib/ux/haptics";
import { calloutParts, gateParts, ideaParts, interactionParts, mediaParts, pointerParts, recallParts, recapParts, type CardParts, type GateAnswer } from "./cards";
import { ILLUSTRATIONS } from "./enrich";
import type { TapResult } from "./enrich/afs";
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
const GRADES: Array<{ grade: Grade; label: string; when: string; hint: string }> = [
  { grade: "again", label: "Again", when: "soon", hint: "Did not get it" },
  { grade: "good", label: "Good", when: "in a few days", hint: "Got it with effort" },
  { grade: "easy", label: "Easy", when: "later", hint: "Instant" },
];

const SWIPE_PX = 60;

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
  const [checkSignal, setCheckSignal] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [graded, setGraded] = useState<Record<string, Grade>>({});
  const [answeredBefore, setAnsweredBefore] = useState<Set<string> | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [restored, setRestored] = useState(false);

  const cards = useMemo(() => withRetries(deck.cards, missed), [deck.cards, missed]);
  const N = cards.length;
  const card = cards[Math.min(index, N - 1)];
  const isLast = index >= N - 1;

  // Her place on this device with what the run has done, and the gates answered on any visit (so nothing is
  // recorded twice). A finished run starts afresh.
  useEffect(() => {
    const pos = readPosition(topicId);
    if (pos && !pos.done) {
      setMissed(pos.missed);
      setAnswers(pos.answers);
      setChecked(pos.checked);
      setGraded(pos.graded);
      const expanded = withRetries(deck.cards, pos.missed);
      setIndex(Math.min(pos.at, expanded.length - 1));
    } else if (pos?.done) {
      clearPosition(topicId);
    }
    setRestored(true);
    answeredGateIds(subject, slug, topicId)
      .then((ids) => setAnsweredBefore(new Set(ids)))
      .catch(() => setAnsweredBefore(new Set()));
  }, [deck.cards, subject, slug, topicId]);

  useEffect(() => {
    if (!restored) return;
    writePosition(topicId, { at: index, done: isLast, missed, answers, checked, graded });
  }, [answers, checked, graded, index, isLast, missed, restored, topicId]);

  // The day each grade would bring the current recall card back, from the scheduler; no date when it cannot be read.
  const [gradeWhen, setGradeWhen] = useState<Record<Grade, string> | null>(null);
  useEffect(() => {
    if (card.kind !== "recall") return;
    let live = true;
    setGradeWhen(null);
    const now = new Date();
    gradeReturnDates(subject, unit, card.prompt.id, now)
      .then((d) => {
        if (live) setGradeWhen({ again: returnWord(d.again, now), good: returnWord(d.good, now), easy: returnWord(d.easy, now) });
      })
      .catch(() => {
        if (live) setGradeWhen(null);
      });
    return () => {
      live = false;
    };
  }, [card, subject, unit]);

  // Focus follows the card: its title, else the card itself; the body starts at its top.
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!restored) return;
    const root = cardRef.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>("h1, h2") ?? root;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    root.scrollTo({ top: 0 });
  }, [index, restored]);

  // The page behind must not scroll: the layer is the page.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ---- what the current card allows ------------------------------------------------------------------- */
  const gateAnswer = card.kind === "gate" ? answers[card.retry ? `retry:${card.gate.id}` : card.gate.id] ?? null : null;
  const gateSelected = card.kind === "gate" ? selected[card.key] ?? null : null;
  const tapChecked = card.kind === "interaction" ? checked[card.key] ?? null : null;
  const isRevealed = card.kind === "recall" ? revealed[card.key] === true : false;
  const isGraded = card.kind === "recall" ? graded[card.key] !== undefined : false;

  const unlocked =
    card.kind === "gate" ? gateAnswer !== null : card.kind === "interaction" ? tapChecked !== null : card.kind === "recall" ? isGraded : true;

  const go = useCallback(
    (to: number, dir: "forward" | "back") => {
      setDirection(dir);
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

  /* ---- the gate --------------------------------------------------------------------------------------- */
  const checkGate = useCallback(() => {
    if (card.kind !== "gate" || gateAnswer !== null) return;
    const raw = (selected[card.key] ?? "").trim();
    if (!raw) return;
    const correct = markGate(card.gate, raw);
    const id = card.gate.id;
    haptic();
    if (card.retry) {
      setAnswers((a) => ({ ...a, [`retry:${id}`]: { answer: raw, correct, record: "retry" } }));
      return;
    }
    const before = answeredBefore?.has(id) ?? false;
    setAnswers((a) => ({ ...a, [id]: { answer: raw, correct, record: before ? "already" : "recorded" } }));
    if (!correct) setMissed((m) => (m.includes(id) ? m : [...m, id]));
    if (!before) {
      setAnsweredBefore((s) => new Set([...(s ?? []), id]));
      void recordAttempt({ item: { subject, unit, topicSlug: slug, id: `${topicId}#gate:${id}` }, itemKind: "practice", correct, answerRaw: raw })
        .then(() => touchSession(subject))
        .catch(() => {
          // Storage unavailable: the answer still shows; nothing else to do on a study screen.
        });
    }
  }, [answeredBefore, card, gateAnswer, selected, slug, subject, topicId, unit]);

  /* ---- the recall card -------------------------------------------------------------------------------- */
  const grade = useCallback(
    (g: Grade) => {
      if (card.kind !== "recall" || !revealed[card.key] || graded[card.key]) return;
      haptic();
      setGraded((s) => ({ ...s, [card.key]: g }));
      void recordAttempt({ item: { subject, unit, topicSlug: slug, id: card.prompt.id }, itemKind: "prompt", correct: g !== "again" })
        .then(() => touchSession(subject))
        .catch(() => {
          // As above.
        });
      go(index + 1, "forward");
    },
    [card, go, graded, index, revealed, slug, subject, unit],
  );

  /* ---- the primary action, shared by the control, Enter and the swipe ------------------------------- */
  const primary = (() => {
    switch (card.kind) {
      case "title":
        return { label: "Start the slides", action: () => go(1, "forward"), disabled: false };
      case "gate":
        return gateAnswer ? { label: "Continue", action: next, disabled: false } : { label: "Check", action: checkGate, disabled: !(gateSelected ?? "").trim() };
      case "interaction":
        return tapChecked ? { label: "Continue", action: next, disabled: false } : { label: "Check", action: () => setCheckSignal((s) => s + 1), disabled: false };
      case "recall":
        return isRevealed ? null : { label: "Show the answer", action: () => setRevealed((r) => ({ ...r, [card.key]: true })), disabled: false };
      case "close":
        return null;
      default:
        return { label: "Continue", action: next, disabled: false };
    }
  })();

  /* ---- keyboard --------------------------------------------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const typing = isTypingTarget(e.target);
      if (e.key === "ArrowRight" && !typing) {
        if (unlocked && !isLast && card.kind !== "close") {
          e.preventDefault();
          next();
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
        if (primary && !primary.disabled) {
          e.preventDefault();
          primary.action();
        }
        return;
      }
      if (/^[1-9]$/.test(e.key) && !typing) {
        const n = Number(e.key);
        if (card.kind === "gate" && card.gate.kind === "choice" && !gateAnswer) {
          // The digit is the shown position (the seeded order), the same one the letter badge prints.
          const opt = gateOptions(card.gate)[n - 1];
          if (opt) {
            e.preventDefault();
            setSelected((s) => ({ ...s, [card.key]: opt }));
          }
        } else if (card.kind === "recall" && isRevealed && !isGraded && n <= 3) {
          e.preventDefault();
          grade(GRADES[n - 1].grade);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, card, gateAnswer, grade, isGraded, isLast, isRevealed, next, primary, unlocked]);

  /* ---- swipe ------------------------------------------------------------------------------------------ */
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 2) return;
    if (dx < 0) next();
    else back();
  };

  /* ---- the card's parts ------------------------------------------------------------------------------- */
  const retriesNote = (() => {
    if (missed.length === 0) return null;
    const held = missed.filter((id) => answers[`retry:${id}`]?.correct).length;
    const asked = missed.filter((id) => answers[`retry:${id}`] !== undefined).length;
    if (asked === 0) return null;
    if (missed.length === 1) return held === 1 ? "The check you missed came back before this card, and held." : "The check you missed came back before this card.";
    return `The checks you missed came back before this card; ${held} of ${asked} held.`;
  })();

  const parts: CardParts | null = (() => {
    switch (card.kind) {
      case "idea":
        return ideaParts(card, enrichment?.illustrations?.[card.key] ?? null);
      case "media":
        return mediaParts(card);
      case "gate":
        return gateParts(card, {
          selected: gateSelected,
          answer: gateAnswer,
          onSelect: (opt) => setSelected((s) => ({ ...s, [card.key]: opt })),
          reactionId: enrichment?.reactions?.[card.gate.id] ?? null,
        });
      case "callout":
        return calloutParts(card);
      case "interaction":
        return interactionParts(card, { checked: tapChecked, checkSignal, onChecked: (r) => setChecked((c) => ({ ...c, [card.key]: r })) });
      case "recap":
        return recapParts(card, enrichment?.recapGlyphs ?? null, retriesNote);
      case "pointer":
        return pointerParts(card);
      case "recall":
        return recallParts(card, isRevealed);
      default:
        return null;
    }
  })();

  const facts = useMemo(() => {
    const gates = deck.cards.filter((c): c is Extract<Card, { kind: "gate" }> => c.kind === "gate");
    const answered = gates.filter((g) => answers[g.gate.id] !== undefined).length;
    const held = missed.filter((id) => answers[`retry:${id}`]?.correct).length;
    const recalled = Object.keys(graded).length;
    return { checks: gates.length, answered, missed: missed.length, held, recalled };
  }, [answers, deck.cards, graded, missed]);

  const stats = deckStats(cards);
  const count = `${index + 1} of ${N}`;
  const showTrack = card.kind !== "title" && card.kind !== "close";
  const motionCls = direction === "forward" ? "motion-card-forward" : "motion-card-back";
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
  const control: ReactNode = (() => {
    if (card.kind === "close") return null;
    if (card.kind === "recall" && isRevealed) {
      return (
        <div role="group" aria-label="How did it go?" className="grid grid-cols-3 gap-2.5" data-grades>
          {GRADES.map((g) => (
            <button
              key={g.grade}
              type="button"
              title={g.hint}
              disabled={isGraded}
              onClick={() => grade(g.grade)}
              className="tap tap-lg flex flex-col items-center justify-center rounded-[12px] border border-line-3 bg-surface px-2 font-sans text-[16px] font-semibold leading-tight text-ink transition-transform duration-150 hover:bg-surface-2 active:scale-[0.98] disabled:pointer-events-none"
            >
              {g.label}
              <span className="text-[13px] font-normal text-ink-2">{gradeWhen?.[g.grade] ?? g.when}</span>
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

  const footNote: ReactNode =
    card.kind === "title" ? (
      <Link href={topicHref} className={quietLink} onClick={() => rememberLessonWay("read")} data-way="read">
        Read it as a page instead
      </Link>
    ) : card.kind === "gate" && !gateAnswer ? (
      <Caption className="text-center lg:text-left">Nothing here is scored; a miss comes back before the recap.</Caption>
    ) : card.kind === "recall" && isRevealed && !isGraded ? (
      <Caption className="text-center lg:text-left">Again is honest, not a penalty: the card comes back sooner.</Caption>
    ) : null;

  const hints: ReactNode = (
    <div className="hidden items-center gap-4 font-sans text-[13px] text-ink-3 lg:flex" data-hints>
      <span>
        <Kbd>←</Kbd> <Kbd>→</Kbd> move
      </span>
      <span>
        <Kbd>Enter</Kbd> {card.kind === "gate" || card.kind === "interaction" ? "check" : card.kind === "recall" && !isRevealed ? "show" : "continue"}
      </span>
      {card.kind === "gate" && card.gate.kind === "choice" && (
        <span>
          <Kbd>1</Kbd> <Kbd>2</Kbd> <Kbd>3</Kbd> choose
        </span>
      )}
      {card.kind === "recall" && isRevealed && (
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
        <div className={clsx("w-full", card.kind === "recall" && isRevealed ? "lg:w-[420px]" : "lg:w-[300px]")}>{control}</div>
        {footNote && <div className="flex justify-center lg:justify-start">{footNote}</div>}
      </div>
    </div>
  );

  // `data-ready` marks the hydrated, restored deck: before it, a key press has no listener yet.
  const rootCls = "fixed inset-0 z-50 flex flex-col overflow-hidden bg-ground text-ink";
  const ready = restored ? "true" : undefined;

  if (card.kind === "close") {
    return (
      <div data-slides data-palette="v2" data-ready={ready} className={rootCls} role="region" aria-label={`Slides: ${displayTitle}`}>
        <div ref={cardRef} key={index} className={clsx("min-h-0 flex-1 overflow-y-auto", motionCls)} data-body data-card="close">
          <SlidesClose subject={subject} unit={unit} slug={slug} title={title} displayTitle={displayTitle} count={count} startedAt={startedAt} facts={facts} />
        </div>
      </div>
    );
  }

  if (card.kind === "title") {
    const figureId = enrichment?.illustrations?.title ?? null;
    const Fig = figureId ? ILLUSTRATIONS[figureId] : null;
    const figure = Fig ? <Fig variant="title" /> : card.figure?.kind === "svg" ? <InlineSvg svg={card.figure.svg} alt={card.figure.alt} className="m-0 w-full" /> : null;
    return (
      <div data-slides data-palette="v2" data-ready={ready} className={rootCls} role="region" aria-label={`Slides: ${displayTitle}`}>
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
              <h1 tabIndex={-1} className="mt-3 max-w-[18ch] font-serif-lesson text-[30px] font-medium leading-[1.15] tracking-[-0.015em] text-ink outline-none lg:mt-4 lg:max-w-[16ch] lg:text-[44px] lg:leading-[1.1]">
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
    <div data-slides data-palette="v2" data-ready={ready} className={rootCls} role="region" aria-label={`Slides: ${displayTitle}`}>
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
        <div ref={cardRef} key={index} className={clsx("flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-4 pt-4 lg:w-[1000px] lg:max-w-full lg:flex-none lg:px-0 lg:pt-0", motionCls)} data-card={card.kind}>
          <section aria-label={`Card ${count}`} className={clsx("flex flex-col gap-3 lg:grid lg:items-start lg:gap-14", parts?.right ? "lg:grid-cols-[minmax(0,1fr)_400px]" : "lg:grid-cols-[minmax(0,640px)]")}>
            <div className="flex min-w-0 flex-col gap-3.5">{parts?.left}</div>
            {parts?.right && <div className="flex min-w-0 flex-col gap-2.5">{parts.right}</div>}
          </section>
        </div>
        <button type="button" aria-label="Next card" onClick={next} disabled={!unlocked || isLast} className="absolute right-10 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-2 bg-surface text-[18px] text-ink-2 hover:bg-surface-2 disabled:opacity-40 lg:flex" data-next>
          <span aria-hidden>›</span>
        </button>
      </div>

      {foot}
    </div>
  );
}

/** The title card's words: the lede (two sentences), the honest promise, the three "you can" lines. */
function TitleText({ card, stats }: { card: Extract<Card, { kind: "title" }>; stats: ReturnType<typeof deckStats> }) {
  return (
    <div className="flex flex-col">
      {card.lede && <Prose md={ledeForTitle(card.lede)} size="lede" className="max-w-[42ch] lg:mt-5 lg:max-w-[44ch]" />}
      <p className="mt-3 font-sans text-[15px] text-ink-2 lg:mt-3.5">
        About <span className="font-semibold text-ink">{stats.minutes} minutes</span> · {promiseLine(stats)}
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
