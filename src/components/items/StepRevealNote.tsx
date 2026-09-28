"use client";

/**
 * The note that will not scroll past you: prose in short stretches, each closed by a gate (a blank, a choice or a
 * number). Nothing after an unanswered gate renders; nothing after a See it she has not been shown to its end renders
 * either (lesson structure v3: explain, then see it, then your turn). Answering, right or not, opens the next stretch.
 *
 * Three surfaces (01-art-direction.md §4.2): the prose is on the page, never in a card; a callout is a recess (reference
 * she consults); the gate is the one object (she acts on it), solid-edged, never dashed. An answered gate is a marked
 * object: a 2 px edge and a 4 px margin rule in the outcome colour, so a judged gate reads differently from a paragraph
 * at arm's length. Every section boundary after the first is a place to stop ("Pause here").
 *
 * A See it (docs/plan/review/2026-09-27-see-it-block-shape.md) is drawn as Slides draws it (src/components/slides/
 * SeeSteps.tsx): the example's stem, then its steps, one per "Next step", each with its reason and its mark; a step she
 * types is marked through the engine and never recorded. A See it that names a bundle worked example needs the bundle's
 * worked examples (`workedExamples`).
 *
 * Read v2 (`paced`, the trial topic; art direction v2 §8.4 and §9; the teach-first case §8.2) shows one section at a
 * time: each ends in "Pause here" and a Continue that opens the next, and the gate is drawn exactly as Slides draws it
 * and named as Slides names it, "Your turn". A miss is re-taught in place before its answer is shown ("Not quite", her
 * choice, the explanation again, the step it points at, the figure's consequence, then "Show me the answer"); the
 * Your turns she missed on this visit are asked once more before the recap, the gate's twin on new numbers where it has
 * one, unrecorded (audit READ-8). Her first answer is the record. A gate answered on an earlier visit is drawn as it was
 * answered: a miss as a miss (audit READ-7), when the page passes what the first answers were (`initialOutcomes`).
 */
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Ban, ClipboardList, Key, Lightbulb, Quote } from "lucide-react";
import { clsx } from "clsx";
import { gateStem } from "@/components/topic/lesson-plan";
import { SeeSteps } from "@/components/slides/SeeSteps";
import type { WorkedExample } from "@/lib/content/schema";
import { Math as MathTex } from "@/lib/math/Math";
import { deckGateOrders, optionTex, retryOrder, shownOptions } from "@/lib/gate-order";
import type { StepResult } from "@/lib/slides/position";
import { lineAbout, misconceptionTags, optionNoteFor, resolveSee, stepPointers, twinGate, twinOptions, typedStep, type ResolvedSee } from "@/lib/slides/see";
import { optionName, spokenText } from "@/lib/slides/text";
import { sanitizeInlineSvg, svgViewBoxWidth } from "@/lib/ux/svg";
import { KeyStrip, insertAtCaret, type StripKey } from "./AnswerField";
import { InlineSvg } from "./Figure";
import { PhotoFigure } from "@/components/media/PhotoFigure";
import { SimEmbed } from "@/components/media/SimEmbed";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { formatExaminerSource, optionLetter } from "./format";
import { markGate, visibleBlocks, type GateBlock, type NoteBlock, type SeeBlock } from "./gates";
import { Md, MdInlines } from "./Markdown";
import { parseInline } from "./md";
import { StemTex } from "./StemTex";
import { Tex } from "./Tex";
import { btnCheck, btnOption, btnPrimary, fieldCls, Letter, MissMark, recessCls, Rise, Tick } from "./ui";
import { focusLanding } from "@/components/shell/input-modality";

export type { GateBlock, NoteBlock } from "./gates";

/** What the lesson knows about each of its headings, in order: its number and what it costs. */
export interface NoteSectionMeta {
  n: number;
  minutes: number;
}

/** A gate's first answer on this device (src/lib/slides/outcomes.ts): the record, drawn as it was. */
export interface InitialOutcome {
  correct: boolean;
  /** What she answered, when it was kept. */
  answer: string | null;
}

export interface StepRevealNoteProps {
  blocks: NoteBlock[];
  /**
   * A gate's first answer, to record. `misconceptionTags`: the misconception her wrong option names, when its note
   * names one (V3.1), for the attempt's tags as Slides records them; empty otherwise.
   */
  onGate: (id: string, answer: string, correct: boolean, misconceptionTags: string[]) => void;
  /**
   * One gate on its own (the review inbox, the first-run lesson): no "n of N checks done" line, no "End of the lesson",
   * no pauses, and the gate draws no frame of its own because the page around it is already the object.
   */
  single?: boolean;
  /** Renders an embedded retrieval prompt by id (the note only knows the id). */
  renderPrompt?: (promptId: string) => ReactNode;
  /** Gate ids already answered (e.g. restored from an earlier session). */
  initiallyAnswered?: readonly string[];
  /**
   * What those gates' first answers were, by gate id (src/lib/slides/outcomes.ts gateOutcomes): a gate missed on an
   * earlier visit is then drawn missed, not passed (audit READ-7). Without it a restored gate is drawn as reference.
   */
  initialOutcomes?: Readonly<Record<string, InitialOutcome>>;
  /** The bundle's worked examples, for a See it that names one. */
  workedExamples?: readonly WorkedExample[];
  /** One entry per heading, in order: the section label reads "3 of 10 · 2 min". */
  sections?: readonly NoteSectionMeta[];
  /** The first heading is the page's display title: keep it for the contents and screen readers, do not print it twice. */
  hideFirstHeading?: boolean;
  /** Where "Pause here" goes: Today, which keeps her place (the hero offers "Continue at section n" next time). */
  pauseHref?: string;
  className?: string;
  /** Read v2: one section at a time, opened by Continue, with the gate drawn as Slides draws it (the file comment). */
  paced?: PacedNote;
}

/** What Read v2's note needs from the page, which owns how far she has come so the track can show it too. */
export interface PacedNote {
  /** How many sections are open, counted from the first. */
  open: number;
  /** She pressed Continue at the end of section `n` (1-based): open the next. */
  onContinue: (n: number) => void;
  /** After the last section: where Continue goes and what it says ("Continue to the worked examples"). */
  finish?: { label: string; onFinish: () => void };
  /** Each section's title, for the Continue's full name ("Continue to section 3: The three moves"). */
  titles?: readonly string[];
  /**
   * The consequence drawn in the verdict, for a gate that has one (Slides' registered reaction, the same drawing): on
   * g2 of the trial topic, x = 1 put into both the fraction and her cancelled version. Null for every other gate.
   */
  reaction?: (gateId: string, hers: string, correct: boolean) => ReactNode;
  /**
   * She pressed "Pause here" at the end of section `n` (1-based), just before its link takes her to Today: the page keeps
   * her place ("the lesson opens at the next section"; read-place.ts, the audit's READ-12).
   */
  onPause?: (n: number) => void;
}

const CALLOUT: Record<Extract<NoteBlock, { type: "callout" }>["kind"], { label: string; icon: ReactNode }> = {
  spec: { label: "The spec says", icon: <ClipboardList size={16} strokeWidth={1.5} aria-hidden /> },
  mustknow: { label: "Must know · not on the formula sheet", icon: <Key size={16} strokeWidth={1.5} aria-hidden /> },
  notonspec: { label: "Not on this spec", icon: <Ban size={16} strokeWidth={1.5} aria-hidden /> },
  examiner: { label: "Examiners say", icon: <Quote size={16} strokeWidth={1.5} aria-hidden /> },
  why: { label: "Why it works", icon: <Lightbulb size={16} strokeWidth={1.5} aria-hidden /> },
};

/**
 * Lines of interface inside the note (labels, counts, the gate's prompt) are divs, not paragraphs: `.prose-note p` sets
 * the prose rhythm (--gap-para above and below every paragraph) and, being unlayered, beats any spacing utility.
 * The same rule is reset inside a recess, where a paragraph's 20 px margins would double the recess's own padding.
 */
const recessProse = "[&_p]:!my-0 [&_p+p]:!mt-2";

/** A callout is reference she consults: a recess, no border and no margin rule (01-art-direction.md §2 and §4.2). */
function Callout({ block }: { block: Extract<NoteBlock, { type: "callout" }> }) {
  const meta = CALLOUT[block.kind];
  return (
    <aside className={clsx(recessCls, "my-5")}>
      <div className="flex items-center gap-1.5 font-sans text-meta font-medium text-ink-2">
        {meta.icon}
        {block.title ?? meta.label}
      </div>
      <Md md={block.md} className={clsx("mt-1.5 text-ui", recessProse)} compact />
      {block.source && <div className="mt-2 font-sans text-meta text-ink-2">{block.source.startsWith("ccea-cer:") ? formatExaminerSource(block.source) : block.source}</div>}
    </aside>
  );
}

/**
 * A gate's answer as the note holds it. `restored`: answered on an earlier visit; `correct` null when only that it was
 * answered is known (a page that passes no outcomes), and `answer` "" when what she answered was not kept.
 */
interface GateState {
  answer: string;
  correct: boolean | null;
  restored: boolean;
}

function initialStates(initiallyAnswered: readonly string[] | undefined, outcomes: Readonly<Record<string, InitialOutcome>> | undefined): Record<string, GateState> {
  const out: Record<string, GateState> = {};
  for (const id of initiallyAnswered ?? []) out[id] = { answer: "", correct: null, restored: true };
  for (const [id, o] of Object.entries(outcomes ?? {})) out[id] = { answer: o.answer ?? "", correct: o.correct, restored: true };
  return out;
}

/**
 * Outcomes that arrive after the first paint (the page's live query) fill in what was only known as answered; a gate
 * answered on this visit keeps its own state.
 */
function useLateOutcomes(initialOutcomes: Readonly<Record<string, InitialOutcome>> | undefined, setAnswers: (f: (a: Record<string, GateState>) => Record<string, GateState>) => void): void {
  useEffect(() => {
    if (!initialOutcomes) return;
    setAnswers((a) => {
      let changed = false;
      const next = { ...a };
      for (const [id, o] of Object.entries(initialOutcomes)) {
        const was = a[id];
        if (was && !was.restored) continue;
        if (was && was.correct === o.correct && was.answer === (o.answer ?? "")) continue;
        next[id] = { answer: o.answer ?? "", correct: o.correct, restored: true };
        changed = true;
      }
      return changed ? next : a;
    });
  }, [initialOutcomes, setAnswers]);
}

/** The keys a phone's number pad lacks: the minus sign (iOS's decimal pad has none) and the fraction bar. */
const NUMBER_KEYS: StripKey[] = [
  { label: "−", insert: "−", name: "minus" },
  { label: "/", insert: "/", name: "fraction bar" },
];

/** A number or blank field; a number field carries the minus key and the fraction bar under it. */
function GateField({ gate, value, onChange, inputRef, className }: { gate: GateBlock; value: string; onChange: (v: string) => void; inputRef: React.RefObject<HTMLInputElement | null>; className?: string }) {
  return (
    <div className={clsx("flex min-w-0 flex-1 flex-col gap-1", className)}>
      <label htmlFor={`gate-${gate.id}`} className="sr-only">
        Your answer
      </label>
      <input
        ref={inputRef}
        id={`gate-${gate.id}`}
        type="text"
        inputMode={gate.kind === "number" ? "decimal" : "text"}
        enterKeyHint="done"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        placeholder={gate.kind === "number" ? "Number" : "Fill the blank"}
        className={clsx(fieldCls, "min-h-[var(--h-option)]")}
        data-gate-field
      />
      {gate.kind === "number" && <KeyStrip keys={NUMBER_KEYS} label="Signs the number pad lacks" onKey={(k) => insertAtCaret(inputRef.current, value, k, onChange)} />}
    </div>
  );
}

function Gate({
  gate,
  options,
  state,
  onAnswer,
  focusOnMount,
  flat,
  afterVideo = false,
}: {
  gate: GateBlock;
  /** A choice gate's options in the order shown (src/lib/gate-order.ts: balanced over the lesson, as Slides shows them). */
  options: readonly string[];
  state: GateState | null;
  onAnswer: (answer: string) => void;
  focusOnMount: boolean;
  flat: boolean;
  /** The block before this gate is a video: the gate says why it is there (01-art-direction.md §8). */
  afterVideo?: boolean;
}) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Only a gate that appeared because the previous one was answered takes focus;
    // the first gate never yanks the page down on load.
    if (!state && focusOnMount) inputRef.current?.focus({ preventScroll: true });
  }, [state, focusOnMount]);

  const answered = state !== null;
  // Restored from an earlier visit with only its being answered known: drawn as reference, never as passed.
  const unknown = answered && state.correct === null;
  const correct = answered && state.correct === true;
  const promptId = `gate-${gate.id}-prompt`;
  return (
    <div
      data-gate={gate.id}
      className={clsx(
        "scroll-mt-16",
        flat
          ? "my-4"
          : clsx(
              "my-6 rounded-[var(--radius)] bg-surface p-5 sm:p-6",
              !answered || unknown ? "border border-line-2" : correct ? "border-2 border-l-4 border-ok" : "border-2 border-l-4 border-miss",
            ),
      )}
      role="group"
      aria-label={spokenText(gate.prompt)}
    >
      <div className="font-sans text-meta font-medium text-ink-2">{answered ? "Checked" : afterVideo ? "Watching is not practice: answer to continue" : "Answer to continue"}</div>
      <div id={promptId} className="mt-1.5">
        <StemTex text={gate.prompt} className="text-h3 font-semibold leading-snug" />
      </div>

      {gate.kind === "choice" && gate.options ? (
        <div role="radiogroup" aria-label={spokenText(gate.prompt)} className="mt-3 grid gap-2">
          {/* In the lesson's balanced order, not the authored one, where the answer is nearly always first. */}
          {options.map((opt, i) => {
            const chosen = answered && state.answer === opt;
            const right = answered && !unknown && markGate(gate, opt);
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={chosen}
                aria-label={optionName(opt, right ? "ok" : chosen && !correct ? "miss" : "", chosen)}
                disabled={answered}
                // The authored option, so a check can find an option by what it says whatever order it is shown in.
                data-value={opt}
                onClick={() => onAnswer(opt)}
                className={clsx(btnOption, chosen ? "border-ink shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line-3", answered && right && "border-ink", answered && !chosen && !right && "opacity-60")}
              >
                <Letter active={chosen}>{optionLetter(i)}</Letter>
                <span className="flex-1 text-ui">
                  <Tex text={opt} />
                  {answered && (chosen || right) && (
                    <span className="mt-1 flex items-center gap-1.5 text-meta font-medium text-ink-2">
                      {right ? <Tick size={14} label="" /> : <MissMark size={14} label="" />}
                      {right ? (chosen ? "Your answer · correct" : "Correct answer") : "Your answer"}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : answered ? (
        state.answer === "" ? null : (
          <div className="mt-2 flex items-center gap-2 font-sans text-ui">
            {correct ? <Tick size={18} /> : <MissMark size={18} />}
            <span>
              <span className="text-ink-2">You: </span>
              {state.answer}
              {!correct && (
                <span className="text-ink-2">
                  {" "}
                  · expected <Tex text={gate.answer.split("|")[0].trim()} />
                </span>
              )}
            </span>
          </div>
        )
      ) : (
        <form
          className="mt-3 flex flex-wrap items-start gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed.trim()) onAnswer(typed.trim());
          }}
        >
          <GateField gate={gate} value={typed} onChange={setTyped} inputRef={inputRef} className="max-w-[18rem]" />
          <button type="submit" className={btnCheck} disabled={!typed.trim()}>
            Check
          </button>
        </form>
      )}

      {answered && (
        <Rise as="div" className="mt-3 border-t border-line pt-3 text-ui leading-relaxed" role="status">
          <span className="font-medium">{unknown ? "" : correct ? "Yes. " : "Not quite. "}</span>
          <Tex text={gate.explain} />
          {state.restored && <span className="mt-1 block font-sans text-meta text-ink-2">Answered on an earlier visit.</span>}
        </Rise>
      )}
    </div>
  );
}

/** A place to stop at a section boundary: her place is kept, and the hero offers the next section next time. */
function PauseHere({ href }: { href: string }) {
  return (
    <div data-testid="pause-here" className="my-2 flex justify-end">
      <Link href={href} className="tap inline-flex items-center rounded-[var(--radius-sm)] px-2 font-sans text-ui text-ink-2 underline decoration-transparent underline-offset-4 hover:text-ink hover:decoration-accent">
        Pause here
        <span className="sr-only">. Your place is kept; the lesson opens at the next section.</span>
      </Link>
    </div>
  );
}

export function StepRevealNote(props: StepRevealNoteProps) {
  return props.paced && !props.single ? <PacedNoteView {...props} paced={props.paced} /> : <ClassicNote {...props} />;
}

/* ------------------------------------------------------------------------------------------------------------------
 * See it, in the note: the same steps Slides shows, one per "Next step".
 * ------------------------------------------------------------------------------------------------------------------ */

interface SeeIts {
  /** The See it to draw at block index i (null when a named worked example is not given). */
  resolved: (i: number) => ResolvedSee | null;
  typedAt: (i: number) => number | null;
  revealed: (i: number) => number;
  result: (i: number) => StepResult | null;
  complete: (i: number) => boolean;
  /** Whether the newest step was shown just now (it arrives with the reveal motion). */
  fresh: (i: number) => boolean;
  reveal: (i: number) => void;
  settle: (i: number, r: StepResult) => void;
}

/**
 * The See its of a note and how far each has been shown. A See it whose gate is already answered (a return visit)
 * opens complete; the rest open on their first step.
 */
function useSeeIts(blocks: readonly NoteBlock[], workedExamples: readonly WorkedExample[] | undefined, answered: Readonly<Record<string, GateState>>): SeeIts {
  const resolved = useMemo(() => blocks.map((b) => (b.type === "see" ? resolveSee(b as SeeBlock, workedExamples ?? null) : null)), [blocks, workedExamples]);
  const firstSee = useMemo(() => blocks.findIndex((b) => b.type === "see"), [blocks]);
  const typedAt = useMemo(() => resolved.map((r, i) => typedStep(r, i === firstSee)), [firstSee, resolved]);
  /** The gate each See it is shown for: the next gate after it. */
  const gateAfter = useMemo(() => blocks.map((b, i) => (b.type === "see" ? (blocks.slice(i + 1).find((x) => x.type === "gate") as GateBlock | undefined)?.id ?? null : null)), [blocks]);
  const [revealed, setRevealed] = useState<Record<number, number>>({});
  const [results, setResults] = useState<Record<number, StepResult>>({});
  const [fresh, setFresh] = useState<number | null>(null);
  const done = (i: number) => {
    const g = gateAfter[i];
    return g !== null && g !== undefined && answered[g] !== undefined;
  };
  const total = (i: number) => Math.max(1, resolved[i]?.steps.length ?? 1);
  const revealedAt = (i: number) => (done(i) ? total(i) : Math.min(total(i), Math.max(1, revealed[i] ?? 1)));
  const resultAt = (i: number): StepResult | null => results[i] ?? (done(i) && typedAt[i] !== null ? { shown: true } : null);
  return {
    resolved: (i) => resolved[i] ?? null,
    typedAt: (i) => typedAt[i] ?? null,
    revealed: revealedAt,
    result: resultAt,
    complete: (i) => {
      const r = resolved[i];
      if (!r) return true;
      const shown = revealedAt(i);
      const typed = typedAt[i];
      return shown >= r.steps.length && (typed === null || typed === undefined || resultAt(i) !== null);
    },
    fresh: (i) => fresh === i,
    reveal: (i) => {
      setRevealed((s) => ({ ...s, [i]: Math.min(total(i), (s[i] ?? 1) + 1) }));
      setFresh(i);
    },
    settle: (i, r) => setResults((s) => ({ ...s, [i]: r })),
  };
}

/** A See it in the note: "See it", the example and its steps, and "Next step" until every step has been shown. */
function SeeItBlock({ i, sees, paced }: { i: number; sees: SeeIts; paced: boolean }) {
  const see = sees.resolved(i);
  const nextRef = useRef<HTMLButtonElement>(null);
  if (!see) return null;
  const typed = sees.typedAt(i);
  const result = sees.result(i);
  const shown = sees.revealed(i);
  const waiting = typed !== null && typed < shown && result === null;
  return (
    <section data-see-it={i} aria-label="See it" className={clsx("my-6 rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6", paced && "scroll-mt-24")}>
      <div className="mb-3 font-sans text-meta font-medium text-ink-2">See it</div>
      <SeeSteps see={see} revealed={shown} typed={typed} typedResult={result} onTyped={(r) => sees.settle(i, r)} size="page" animateLast={sees.fresh(i)} />
      {shown < see.steps.length && !waiting && (
        <button ref={nextRef} type="button" data-next-step className={clsx(btnPrimary, "tap-lg mt-5 px-6")} onClick={() => sees.reveal(i)}>
          Next step
          <span className="sr-only">{`: step ${shown + 1} of ${see.steps.length}`}</span>
        </button>
      )}
    </section>
  );
}

/** Where the note stops: after the first unanswered gate (visibleBlocks), or after the first See it not yet shown to its end. */
function visibleUpTo(blocks: readonly NoteBlock[], answeredIds: ReadonlySet<string>, sees: SeeIts) {
  const view = visibleBlocks(blocks, answeredIds);
  const cut = view.blocks.findIndex((b, i) => b.type === "see" && !sees.complete(i));
  return { ...view, blocks: cut >= 0 ? view.blocks.slice(0, cut + 1) : view.blocks, stoppedOnSee: cut >= 0 };
}

function ClassicNote({ blocks, onGate, renderPrompt, initiallyAnswered, initialOutcomes, workedExamples, single = false, sections, hideFirstHeading = false, pauseHref = "/", className }: StepRevealNoteProps) {
  const [answers, setAnswers] = useState<Record<string, GateState>>(() => initialStates(initiallyAnswered, initialOutcomes));
  useLateOutcomes(initialOutcomes, setAnswers);
  const answeredIds = useMemo(() => new Set(Object.keys(answers)), [answers]);
  const sees = useSeeIts(blocks, workedExamples, answers);
  const view = visibleUpTo(blocks, answeredIds, sees);
  // Every choice gate's shown order, balanced over the whole note (not only the stretch on screen), so a gate reads the
  // same before and after the gates above it are answered, and the same as in Slides.
  const orders = useMemo(() => deckGateOrders(blocks), [blocks]);
  const interacted = useRef(false);
  const total = sections?.length ?? 0;

  const answer = (gate: GateBlock, raw: string) => {
    if (answers[gate.id]) return;
    interacted.current = true;
    const correct = markGate(gate, raw);
    setAnswers((a) => ({ ...a, [gate.id]: { answer: raw, correct, restored: false } }));
    onGate(gate.id, raw, correct, correct ? [] : misconceptionTags(gate, raw));
  };

  let headingIndex = -1;
  return (
    <article className={clsx("prose-note", className)} aria-label="Note">
      {!single && view.gatesTotal > 0 && (
        <div className="tnum mb-4 font-sans text-meta text-ink-2" role="status" aria-live="polite">
          {view.gatesAnswered} of {view.gatesTotal} checks done
        </div>
      )}
      {view.blocks.map((b, i) => {
        const key = b.type === "gate" ? `gate-${b.id}` : `${b.type}-${i}`;
        switch (b.type) {
          case "pause":
            return single ? null : <PauseHere key={key} href={pauseHref} />;
          case "hero":
            // Rendered by the topic page's hero, not inside the lesson.
            return null;
          case "h": {
            headingIndex += 1;
            const meta = sections?.[headingIndex];
            const hidden = hideFirstHeading && headingIndex === 0;
            return (
              <Rise key={key} as="div" className={clsx(!single && headingIndex > 0 && "section-rule")}>
                {!single && meta && total > 1 && (
                  <div className="tnum font-sans text-meta font-medium text-ink-2">
                    {meta.n} of {total} · {meta.minutes} min
                  </div>
                )}
                <h3
                  data-section={headingIndex}
                  className={clsx(hidden ? "sr-only" : "mt-1.5 text-h2 font-medium tracking-[-0.01em] text-ink", single && !hidden && "mt-0 text-h3 font-semibold")}
                >
                  {/* The label above carries the number; an authored "1." would disagree with it whenever the note's
                      first heading is unnumbered (b1-enzyme-factors: "2 of 10" over "1. One graph, two explanations"). */}
                  <MdInlines inlines={parseInline(single ? b.text : b.text.trim().replace(/^\d+\s*[.):]\s*/, ""))} />
                </h3>
              </Rise>
            );
          }
          case "p":
            return (
              <Rise key={key} as="div">
                <Md md={b.md} className="mt-3" />
              </Rise>
            );
          case "callout":
            return (
              <Rise key={key} as="div">
                <Callout block={b} />
              </Rise>
            );
          case "see":
            return (
              <Rise key={key} as="div">
                <SeeItBlock i={i} sees={sees} paced={false} />
              </Rise>
            );
          case "figure":
            return (
              <Rise key={key} as="div">
                {b.svg ? <InlineSvg svg={b.svg} alt={b.alt} caption={b.caption} /> : <div className="my-3 font-sans text-meta text-ink-2">{b.alt}</div>}
              </Rise>
            );
          case "photo":
            return (
              <Rise key={key} as="div">
                <PhotoFigure photo={b} />
              </Rise>
            );
          case "video":
            return (
              <Rise key={key} as="div">
                <VideoEmbed video={{ provider: "youtube", ...b }} />
              </Rise>
            );
          case "sim":
            return (
              <Rise key={key} as="div">
                <SimEmbed sim={b} />
              </Rise>
            );
          case "prompt":
            return (
              <Rise key={key} as="div" className="my-5">
                {renderPrompt ? renderPrompt(b.promptId) : <div className={clsx(recessCls, "font-sans text-meta text-ink-2")}>Prompt {b.promptId}</div>}
              </Rise>
            );
          case "gate":
            return (
              <Rise key={key} as="div">
                <Gate
                  gate={b}
                  options={b.kind === "choice" ? shownOptions(b, orders) : []}
                  state={answers[b.id] ?? null}
                  onAnswer={(raw) => answer(b, raw)}
                  focusOnMount={interacted.current}
                  flat={single}
                  afterVideo={view.blocks[i - 1]?.type === "video"}
                />
              </Rise>
            );
        }
      })}
      {!single && view.pendingGate === null && !view.stoppedOnSee && view.gatesTotal > 0 && (
        <div className="section-rule flex flex-wrap items-center justify-between gap-x-4">
          <div className="font-sans text-ui text-ink-2" role="status">
            End of the lesson.
          </div>
          <PauseHere href={pauseHref} />
        </div>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Read v2: the paced note, the gate drawn as Slides draws it, and a figure on its stage.
 * ------------------------------------------------------------------------------------------------------------------ */

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** What sits under Read's sticky bar when she is taken somewhere: the bar's own height and a little air. */
function underTheBar(): number {
  const bar = document.querySelector<HTMLElement>("[data-read-track]");
  return (bar?.getBoundingClientRect().height ?? 48) + 16;
}

/**
 * A figure on its stage (art direction v2 §3.4): the subject's wash under the drawing, which is what makes it read as
 * made for this idea rather than pasted on, and the caption on the page below it. The drawing is never drawn larger than
 * it was made (the viewBox cap), and a label's halo takes the stage's colour.
 */
export function StagedFigure({ svg, alt, caption, className }: { svg: string; alt: string; caption?: string; className?: string }) {
  const clean = sanitizeInlineSvg(svg);
  const width = svgViewBoxWidth(clean);
  return (
    <figure data-staged-figure className={clsx("m-0", className)}>
      {/* On a phone the stage runs 8 px into each gutter and keeps a 10 px inset, so a 400-unit drawing renders at about
          354 px and a 15-unit label at 13.3 px (the 12.5 px floor was missed at 330 px; measured 25 Sep). */}
      <div className="-mx-2 rounded-[var(--radius)] bg-[var(--tint-wash)] p-2.5 sm:mx-0 sm:p-5" style={{ "--fig-halo": "var(--tint-wash)" } as CSSProperties}>
        <div
          role="img"
          aria-label={alt}
          className={clsx("mx-auto max-w-full text-ink [&>svg]:h-auto [&>svg]:max-h-[420px]", width ? "[&>svg]:block [&>svg]:w-full" : "[&>svg]:max-w-full")}
          style={width ? { maxWidth: `${width}px` } : undefined}
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 max-w-[var(--measure)] font-sans text-meta text-ink-2">
          <MdInlines inlines={parseInline(caption)} />
        </figcaption>
      )}
    </figure>
  );
}

/** The tick on the right option: drawn along its length in 250 ms (the react motion), still under reduced motion. */
function DrawnTick() {
  const reduce = useReducedMotion();
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false">
      <motion.path
        d="M2.5 7.5 L5.8 10.5 L11.5 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduce ? 0 : 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </svg>
  );
}

type OptionLook = "ok" | "miss" | "chosen" | "rest";

/** The badge at an option's left: its letter, the ink-filled letter once chosen, the filled tick, or the circle-dash. */
function OptionBadge({ letter, state }: { letter: string; state: OptionLook }) {
  if (state === "ok")
    return (
      <span aria-hidden className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-ok text-surface">
        <DrawnTick />
      </span>
    );
  if (state === "miss")
    return (
      <span aria-hidden className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border-[1.5px] border-miss">
        <span className="h-[1.5px] w-2.5 rounded-full bg-miss" />
      </span>
    );
  return (
    <span
      aria-hidden
      className={clsx(
        "tnum grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[var(--radius-sm)] border font-sans text-micro font-semibold",
        state === "chosen" ? "border-ink bg-ink text-surface" : "border-line-3 text-ink-2",
      )}
    >
      {letter}
    </span>
  );
}

/** What the note says under an answer, true in the behaviour (the Slides wording; src/lib/slides/run.ts answerNote). */
function recordLine(state: GateState, retry: boolean, hasTwin: boolean): string {
  if (retry) return state.correct ? "Asked once more, and held. Your first answer is the one on record." : "Asked once more, not recorded: your first answer is the one on record, and it comes back in your reviews.";
  if (state.restored) return state.correct ? "Answered on an earlier visit. It comes back in your reviews." : "Missed on an earlier visit. It comes back in your reviews.";
  if (state.correct) return "Recorded. It comes back in your reviews.";
  return `Recorded. It comes back before the recap${hasTwin ? " on new numbers" : ""}, and in your reviews.`;
}

/**
 * The verdict of a right answer, in its own marked object under the gate (§8.1): the 2 px outcome edge and the 4 px
 * rule, "Yes." at 21 px in fern, the consequence drawn where the gate has one, the explanation, what happens to it.
 */
function YesVerdict({ gate, state, reaction, retry }: { gate: GateBlock; state: GateState; reaction?: ReactNode; retry: boolean }) {
  return (
    <div data-verdict-block role="status" tabIndex={-1} data-focus-quiet="" className="motion-reveal mt-3 scroll-mb-24 rounded-[var(--radius)] border-2 border-l-4 border-ok bg-surface px-4 py-3.5">
      <div data-verdict className="font-serif-lesson text-[length:var(--fs-verdict)] font-semibold leading-tight text-ok">
        Yes.
      </div>
      {reaction && (
        <div data-reaction-stage className="mt-2 flex justify-center rounded-[var(--radius)] bg-surface-2 p-1">
          {reaction}
        </div>
      )}
      <div className="mt-2 font-serif-lesson text-[17px] leading-[1.5] text-ink">
        <Tex text={gate.explain} />
      </div>
      <div className="mt-2 font-sans text-meta text-ink-2">{recordLine(state, retry, gate.twin !== undefined)}</div>
    </div>
  );
}

/**
 * A miss, re-taught before its answer (the teach-first case §6.3, §8.2): "Not quite." in ink, her choice without
 * shame, the note on her option where the gate carries one (V3.1: why it tempts and what is wrong, before anything
 * general), the consequence drawn, the explanation again (the gate's `explain`, which points at the step), the step
 * itself, and "Show me the answer" while the answer is still hers to ask for. It stays on the page once the answer is
 * shown: nothing she read is taken away.
 */
function Reteach({ gate, hers, reaction, see, asking, onShow }: { gate: GateBlock; hers: string; reaction?: ReactNode; see: ResolvedSee | null; asking: boolean; onShow: () => void }) {
  const note = optionNoteFor(gate, hers);
  // The steps the explanation points at ("step 2 of See it", "steps 1 and 2 of See it"), as the See it showed them.
  const steps = stepPointers(gate.explain).flatMap((k) => see?.steps.filter((s) => s.n === k) ?? []);
  return (
    <div data-reteach role="status" tabIndex={-1} data-focus-quiet="" className="motion-reveal mt-3 scroll-mb-24 rounded-[var(--radius)] border-2 border-l-4 border-miss bg-surface px-4 py-3.5">
      <div data-verdict className="font-serif-lesson text-[length:var(--fs-verdict)] font-semibold leading-tight text-ink">
        Not quite.
      </div>
      {hers && (
        <div className="mt-1.5 font-sans text-ui text-ink-2" data-her-choice>
          You chose{" "}
          <span className="font-serif-lesson text-ink">
            <Tex text={gate.kind === "choice" ? optionTex(hers) : hers} />
          </span>
          .
        </div>
      )}
      {note && (
        <div className="mt-2 font-serif-lesson text-[17px] leading-[1.5] text-ink" data-option-note>
          <Tex text={note.why} />
        </div>
      )}
      {reaction && (
        <div data-reaction-stage className="mt-2 flex justify-center rounded-[var(--radius)] bg-surface-2 p-1">
          {reaction}
        </div>
      )}
      <div className="mt-2 font-serif-lesson text-[17px] leading-[1.5] text-ink">
        <Tex text={gate.explain} />
      </div>
      {steps.map((step) => (
        <div key={step.n} className={clsx(recessCls, "mt-3")} data-reteach-step={step.n}>
          <div className="font-sans text-meta font-medium text-ink-2">Step {step.n} of See it</div>
          <div className="mt-1 font-serif-lesson text-[18px] leading-[1.4] text-ink">
            <Tex text={step.working} />
          </div>
          <div className="mt-1.5 font-serif-lesson text-[16px] leading-[1.45] text-ink-2">
            <MdInlines inlines={parseInline(step.decision)} />
          </div>
        </div>
      ))}
      {asking && (
        <button type="button" data-show-answer className={clsx(btnPrimary, "tap-lg mt-4 px-6")} onClick={onShow}>
          Show me the answer
        </button>
      )}
    </div>
  );
}

/**
 * The answer after a miss: the answer line at 21 px, her choice with a line about it (the note on her option, else the
 * explanation's sentence that names it), the record line. After a re-teach on this visit that line is already on the
 * page just above (the re-teach stays), so it is not said twice.
 */
function MissAnswer({ gate, state, retry }: { gate: GateBlock; state: GateState; retry: boolean }) {
  const right = gate.kind === "choice" ? optionTex(gate.answer) : gate.answer.split("|")[0]!.trim();
  const retaught = !retry && !state.restored;
  const line = state.answer && !(retaught && optionNoteFor(gate, state.answer)) ? lineAbout(gate, state.answer) : null;
  return (
    <div data-verdict-block role="status" tabIndex={-1} data-focus-quiet="" className="motion-reveal mt-3 scroll-mb-24 rounded-[var(--radius)] border-2 border-l-4 border-miss bg-surface px-4 py-3.5">
      {(retry || state.restored) && (
        <div data-verdict className="font-serif-lesson text-[length:var(--fs-verdict)] font-semibold leading-tight text-ink">
          Not quite.
        </div>
      )}
      <div data-answer-line className="font-serif-lesson text-[length:var(--fs-verdict)] font-semibold leading-snug text-ink">
        <span className="font-sans text-ui font-medium text-ink-2">The answer </span>
        <Tex text={right} />
      </div>
      {state.answer && (
        <div className="mt-2 font-serif-lesson text-[17px] leading-[1.5] text-ink" data-diagnosis data-hers={state.answer}>
          <span className="text-ink-2">You chose </span>
          <Tex text={gate.kind === "choice" ? optionTex(state.answer) : state.answer} />
          <span className="text-ink-2">.</span>
          {line && (
            <span className="mt-1 block">
              <Tex text={line} />
            </span>
          )}
        </div>
      )}
      {/* A retry and a restored miss were not re-taught here, so their answer carries the explanation. */}
      {(retry || state.restored) && (
        <div className="mt-2 font-serif-lesson text-[17px] leading-[1.5] text-ink">
          <Tex text={gate.explain} />
        </div>
      )}
      <div className="mt-2 font-sans text-meta text-ink-2">{recordLine(state, retry, gate.twin !== undefined)}</div>
    </div>
  );
}

/**
 * The gate as Slides draws it (§8.1, §8.4), named as Slides names it: "Your turn". The stem at --fs-stem in Literata
 * 600, its maths on its own line at --fs-stem-maths --gap-stem-maths below it, the answer --gap-maths-field below that;
 * options --h-option tall and --gap-option apart with their text at --fs-option in Literata. She chooses (selection is an
 * ink edge), then presses Check; arrow keys move the choice and Enter on the chosen option checks. A retry before the
 * recap (`retry`) asks the twin or the gate again, answers straight away and records nothing.
 */
function GateV2({
  gate,
  options,
  state,
  onAnswer,
  focusOnMount,
  afterVideo = false,
  reaction,
  see = null,
  turn = null,
  retry = null,
}: {
  gate: GateBlock;
  /** A choice gate's options in the order shown: the lesson's balanced order, the one Slides shows (src/lib/gate-order.ts). */
  options: readonly string[];
  state: GateState | null;
  onAnswer: (answer: string) => void;
  focusOnMount: boolean;
  afterVideo?: boolean;
  /** The consequence drawn in the verdict, when this gate has one. */
  reaction?: (hers: string, correct: boolean) => ReactNode;
  /** The See it this Your turn follows, for the step its re-teach points at. */
  see?: ResolvedSee | null;
  /** Two Your turns in a row: "1 of 2". */
  turn?: { n: number; of: number } | null;
  /** A retry before the recap: the gate it stands for, and whether it asks that gate's twin. */
  retry?: { of: string; twin: boolean } | null;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  // The answer she asked to see after the re-teach.
  const [shown, setShown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const stem = useMemo(() => gateStem(gate.prompt), [gate.prompt]);
  useEffect(() => {
    // Only a gate that appeared because the previous one was answered takes focus; the first never pulls the page down.
    if (!state && focusOnMount) inputRef.current?.focus({ preventScroll: true });
  }, [state, focusOnMount]);
  // "Show me the answer": the keyboard goes to the answer, so a screen reader reads it.
  useEffect(() => {
    if (!shown) return;
    const el = boxRef.current?.querySelector<HTMLElement>("[data-verdict-block]");
    if (!el) return;
    focusLanding(el);
    el.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [shown]);

  const answered = state !== null;
  const unknown = answered && state.correct === null;
  const hit = answered && state.correct === true;
  // A miss this visit re-teaches until she asks for the answer; a retry and a miss restored from an earlier visit show it.
  const reteaching = answered && state.correct === false && !state.restored && retry === null && !shown;
  const answerShown = answered && !unknown && !reteaching;
  const promptId = `gate-${retry ? `${retry.of}-retry` : gate.id}-prompt`;
  const submit = () => {
    if (answered) return;
    if (gate.kind === "choice") {
      if (choice !== null) onAnswer(choice);
    } else if (typed.trim()) onAnswer(typed.trim());
  };
  const move = (from: number, by: number) => {
    const at = (from + by + options.length) % options.length;
    setChoice(options[at]);
    optionRefs.current[at]?.focus();
  };
  const onOptionKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      move(i, 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      move(i, -1);
    } else if (e.key === "Enter" && choice === options[i]) {
      e.preventDefault();
      submit();
    }
  };
  const tabStop = choice ?? options[0];
  const stemLine = clsx("font-serif-lesson text-[length:var(--fs-stem)] font-semibold text-ink", stem.stackedInline ? "leading-[1.6]" : "leading-[var(--lh-stem)]");
  const label = retry ? (retry.twin ? "Once more · on new numbers" : "Once more") : turn ? `Your turn · ${turn.n} of ${turn.of}` : "Your turn";
  const hers = answered ? state.answer : "";
  const drawn = answered && !unknown && reaction && hers ? reaction(hers, state.correct === true) : undefined;

  return (
    <div
      ref={boxRef}
      {...(retry ? { "data-gate-retry": retry.of, "data-retry": retry.twin ? "twin" : "same" } : { "data-gate": gate.id })}
      data-gate-v2
      data-phase={!answered ? "open" : reteaching ? "reteach" : "answer"}
      role="group"
      className="my-6 scroll-mt-16"
      aria-label={spokenText(gate.prompt)}
    >
      <div className="rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6">
        <div className="font-sans text-meta font-medium text-ink-2">{label}</div>
        <div id={promptId} data-stem className="mt-3">
          {stem.lead && (
            <div data-stem-lead className={stemLine}>
              <Tex text={stem.lead} />
            </div>
          )}
          {stem.maths !== null && (
            <div
              data-stem-maths
              className="py-1 text-[length:var(--fs-stem-maths)] text-ink [&_.katex-display]:![font-size:1em] [&_.katex-display]:!m-0 [&_.katex-display]:!py-0 [&_.katex-display]:!text-left [&_.katex-display>.katex]:!text-left"
              style={{ marginTop: stem.lead ? "var(--gap-stem-maths)" : undefined }}
            >
              <MathTex tex={stem.maths} display />
            </div>
          )}
          {stem.tail && (
            <div data-stem-tail className={stemLine} style={{ marginTop: "var(--gap-stem-maths)" }}>
              <Tex text={stem.tail} />
            </div>
          )}
        </div>

        <div data-answer style={{ marginTop: "var(--gap-maths-field)" }}>
          {gate.kind === "choice" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div role="radiogroup" aria-label={spokenText(gate.prompt)} className="flex max-w-[36rem] flex-col gap-[var(--gap-option)]">
                {options.map((opt, i) => {
                  const chosen = answered ? state.answer === opt : choice === opt;
                  const right = answerShown && markGate(gate, opt);
                  const look: OptionLook = right ? "ok" : answered && chosen && !unknown ? "miss" : !answered && chosen ? "chosen" : "rest";
                  return (
                    <button
                      key={opt}
                      ref={(el) => {
                        optionRefs.current[i] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      aria-label={optionName(opt, look === "rest" || look === "chosen" ? "" : look, chosen)}
                      tabIndex={answered ? -1 : opt === tabStop ? 0 : -1}
                      disabled={answered}
                      data-option={look}
                      // The authored option, so a check can find an option by what it says in the gate's shown order.
                      data-value={opt}
                      onClick={() => setChoice(opt)}
                      onKeyDown={(e) => onOptionKey(e, i)}
                      className={clsx(
                        // No transition: a colour changes at once (01 §6; the motion law in app/globals.css, READ-24).
                        "flex min-h-[var(--h-option)] w-full items-center gap-3 rounded-[var(--radius)] text-left text-ink disabled:cursor-default",
                        // A 2 px edge takes a pixel of padding back, so nothing inside moves when the edge changes.
                        look === "rest" ? "border border-line-3 bg-surface px-3.5 py-2.5" : "border-2 px-[13px] py-[9px]",
                        look === "ok" && "border-ok bg-[var(--ok-wash)]",
                        look === "miss" && "border-miss bg-[var(--miss-wash)]",
                        look === "chosen" && "border-ink bg-surface",
                        !answered && "hover:bg-surface-2",
                      )}
                    >
                      <OptionBadge letter={optionLetter(i)} state={look} />
                      <span className="font-serif-lesson flex-1 text-[length:var(--fs-option)] leading-[1.35]">
                        {/* A stacked fraction at text size, as Slides sets it (optionTex; audit LD-16); the value stays authored. */}
                        <Tex text={optionTex(opt)} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {!answered && (
                <button type="submit" className={clsx(btnCheck, "mt-3 px-8")} disabled={choice === null}>
                  Check
                </button>
              )}
            </form>
          ) : answered ? (
            unknown || !state.answer ? null : (
              <div className="flex items-center gap-2.5 font-sans text-ui">
                <OptionBadge letter="" state={hit ? "ok" : "miss"} />
                <span>
                  <span className="text-ink-2">You wrote </span>
                  {state.answer}
                </span>
              </div>
            )
          ) : (
            <form
              className="flex flex-wrap items-start gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <GateField gate={gate} value={typed} onChange={setTyped} inputRef={inputRef} className="max-w-[18rem]" />
              <button type="submit" className={btnCheck} disabled={!typed.trim()}>
                Check
              </button>
            </form>
          )}
        </div>
        {!answered && <div className="mt-3 font-sans text-meta text-ink-2">{retry ? "Asked once more, not recorded. Your first answer is the one on record." : afterVideo ? "Watching is not practice. Answer from what you just saw; if you miss, it is taught again first." : "Answer from what you just saw. If you miss, it is taught again first."}</div>}
      </div>
      {answered && unknown && (
        // Only that it was answered is known: the explanation as reference, and no word that would say it was passed.
        <div className={clsx(recessCls, "mt-3")}>
          <div className="font-serif-lesson text-[17px] leading-[1.5] text-ink">
            <Tex text={gate.explain} />
          </div>
          <div className="mt-2 font-sans text-meta text-ink-2">Answered on an earlier visit.</div>
        </div>
      )}
      {answered && hit && <YesVerdict gate={gate} state={state} reaction={drawn} retry={retry !== null} />}
      {answered && state.correct === false && !state.restored && retry === null && <Reteach gate={gate} hers={hers} reaction={drawn} see={see} asking={!shown} onShow={() => setShown(true)} />}
      {answered && state.correct === false && answerShown && <MissAnswer gate={gate} state={state} retry={retry !== null} />}
    </div>
  );
}

/**
 * The end of a section in Read v2: Continue, when this is the furthest section open (the only way on, as in Slides),
 * and "Pause here", which keeps her place. The lesson's own end says so and continues to the stage after it.
 */
function SectionEnd({ n, total, paced, pauseHref }: { n: number; total: number; paced: PacedNote; pauseHref: string }) {
  const last = n >= total;
  const next = paced.titles?.[n];
  const continueHere = !last && n === paced.open;
  return (
    <div data-section-end={n} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 font-sans">
      {last && (
        <div className="w-full text-ui text-ink-2" role="status">
          End of the lesson.
        </div>
      )}
      {continueHere && (
        <button type="button" data-continue className={clsx(btnPrimary, "tap-lg motion-reveal px-6")} onClick={() => paced.onContinue(n)}>
          Continue
          <span className="sr-only">{` to section ${n + 1}${next ? `: ${next}` : ""}`}</span>
          <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
        </button>
      )}
      {last && paced.finish && (
        <button type="button" data-continue data-finish className={clsx(btnPrimary, "tap-lg motion-reveal px-6")} onClick={paced.finish.onFinish}>
          {paced.finish.label}
          <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
        </button>
      )}
      <div data-testid="pause-here">
        <Link
          href={pauseHref}
          onClick={() => paced.onPause?.(n)}
          className="tap inline-flex items-center rounded-[var(--radius-sm)] px-2 text-ui text-ink-2 underline decoration-transparent underline-offset-4 hover:text-ink hover:decoration-accent"
        >
          Pause here
          <span className="sr-only">. Your place is kept; the lesson opens at the next section.</span>
        </Link>
      </div>
    </div>
  );
}

const RECAP = /^\s*you can now\b/i;
const POINTER = /^\s*in the exam\b/i;

/**
 * Where the Your turns missed on this visit are asked once more: before the first recap or pointer heading after the
 * gate (as Slides places them), else at the note's end. Returns the index of the block they follow, by gate id.
 */
function retrySlots(blocks: readonly NoteBlock[], missed: readonly string[]): Map<number, string[]> {
  const closing = blocks.map((b) => b.type === "h" && ((b as { role?: string }).role === "recap" || (b as { role?: string }).role === "pointer" || RECAP.test(b.text) || POINTER.test(b.text)));
  const out = new Map<number, string[]>();
  for (const id of missed) {
    const at = blocks.findIndex((b) => b.type === "gate" && b.id === id);
    if (at < 0) continue;
    const close = closing.findIndex((c, i) => c && i > at);
    // The last block before the closing heading (a pause, most often), or the note's last block.
    const slot = close >= 0 ? close - 1 : blocks.length - 1;
    out.set(slot, [...(out.get(slot) ?? []), id]);
  }
  return out;
}

function PacedNoteView({ blocks, onGate, renderPrompt, initiallyAnswered, initialOutcomes, workedExamples, sections, hideFirstHeading = false, pauseHref = "/", className, paced }: StepRevealNoteProps & { paced: PacedNote }) {
  const [answers, setAnswers] = useState<Record<string, GateState>>(() => initialStates(initiallyAnswered, initialOutcomes));
  useLateOutcomes(initialOutcomes, setAnswers);
  const answeredIds = useMemo(() => new Set(Object.keys(answers)), [answers]);
  const sees = useSeeIts(blocks, workedExamples, answers);
  const view = visibleUpTo(blocks, answeredIds, sees);
  // Every choice gate's shown order, balanced over the whole note: the same order Slides shows (src/lib/gate-order.ts).
  const orders = useMemo(() => deckGateOrders(blocks), [blocks]);
  const interacted = useRef(false);
  const [lastAnswered, setLastAnswered] = useState<string | null>(null);
  // The Your turns missed on this visit, in order, and her answers to their one retry (never recorded).
  const [missed, setMissed] = useState<string[]>([]);
  const [retries, setRetries] = useState<Record<string, GateState>>({});
  const articleRef = useRef<HTMLElement>(null);
  const total = sections?.length ?? 0;

  // Each block's section, numbered as lessonSections numbers them: an unheaded opening belongs to the first section.
  const sectionOf = useMemo(() => {
    let headings = 0;
    return blocks.map((b) => {
      if (b.type === "h") headings += 1;
      return Math.max(0, headings - 1);
    });
  }, [blocks]);
  const lastBlockOf = useMemo(() => {
    const last: number[] = [];
    sectionOf.forEach((s, i) => {
      last[s] = i;
    });
    return last;
  }, [sectionOf]);
  // Blocks that follow a See it of their own section: a video there has the section's own steps above it to fall back on.
  const stepsShownBefore = useMemo(() => blocks.map((_, i) => blocks.some((b, j) => j < i && sectionOf[j] === sectionOf[i] && b.type === "see")), [blocks, sectionOf]);
  // The See it each gate follows, for the step its re-teach points at; two gates in a row are "1 of 2", "2 of 2".
  const seeFor = useMemo(() => blocks.map((b, i) => (b.type === "gate" ? (() => {
    for (let j = i - 1; j >= 0 && sectionOf[j] === sectionOf[i]; j -= 1) if (blocks[j]!.type === "see") return j;
    return -1;
  })() : -1)), [blocks, sectionOf]);
  const turns = useMemo(() => {
    const out: Array<{ n: number; of: number } | null> = blocks.map(() => null);
    for (let i = 0; i < blocks.length; ) {
      let j = i;
      while (j < blocks.length && blocks[j]!.type === "gate") j += 1;
      if (j - i >= 2) for (let k = i; k < j; k += 1) out[k] = { n: k - i + 1, of: j - i };
      i = j === i ? i + 1 : j;
    }
    return out;
  }, [blocks]);
  const slots = useMemo(() => retrySlots(blocks, missed), [blocks, missed]);

  const answer = (gate: GateBlock, raw: string) => {
    if (answers[gate.id]) return;
    interacted.current = true;
    const correct = markGate(gate, raw);
    setAnswers((a) => ({ ...a, [gate.id]: { answer: raw, correct, restored: false } }));
    if (!correct) setMissed((m) => (m.includes(gate.id) ? m : [...m, gate.id]));
    setLastAnswered(gate.id);
    onGate(gate.id, raw, correct, correct ? [] : misconceptionTags(gate, raw));
  };
  const answerRetry = (gate: GateBlock, asked: GateBlock, raw: string) => {
    if (retries[gate.id]) return;
    interacted.current = true;
    setRetries((r) => ({ ...r, [gate.id]: { answer: raw, correct: markGate(asked, raw), restored: false } }));
    setLastAnswered(`retry:${gate.id}`);
  };

  // After an answer the keyboard goes to what appeared (the verdict, or the re-teach after a miss), so a screen reader
  // reads it and Tab carries on from there (the Check button that had focus is gone); it is scrolled into view only if
  // it is not already.
  useEffect(() => {
    if (!lastAnswered) return;
    const box = lastAnswered.startsWith("retry:")
      ? articleRef.current?.querySelector<HTMLElement>(`[data-gate-retry="${lastAnswered.slice(6)}"]`)
      : articleRef.current?.querySelector<HTMLElement>(`[data-gate="${lastAnswered}"]`);
    const target = box?.querySelector<HTMLElement>("[data-reteach], [data-verdict-block]");
    if (!target) return;
    focusLanding(target);
    target.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [lastAnswered, answers, retries]);

  // After Continue the next section comes up under the bar, and the keyboard goes to its heading.
  const openBefore = useRef(paced.open);
  useEffect(() => {
    const was = openBefore.current;
    openBefore.current = paced.open;
    if (!interacted.current || paced.open <= was) return;
    const wrapper = articleRef.current?.querySelector<HTMLElement>(`[data-lesson-section="${paced.open}"]`);
    if (!wrapper) return;
    window.scrollTo({ top: wrapper.getBoundingClientRect().top + window.scrollY - underTheBar(), behavior: prefersReducedMotion() ? "auto" : "smooth" });
    // The heading is a landing place: quiet after a click or a tap, ringed after Enter on Continue (the focus contract).
    const heading = wrapper.querySelector<HTMLElement>("[data-section]");
    if (heading) focusLanding(heading);
  }, [paced.open]);

  const onContinue = (n: number) => {
    interacted.current = true;
    paced.onContinue(n);
  };

  // What is on the page: every block up to the first unanswered gate or unfinished See it, in the sections she has opened.
  const shown = view.blocks.filter((_, i) => sectionOf[i] < paced.open);
  const groups: Array<{ s: number; items: Array<{ b: NoteBlock; i: number }> }> = [];
  shown.forEach((b, i) => {
    const s = sectionOf[i];
    const g = groups[groups.length - 1];
    if (g && g.s === s) g.items.push({ b, i });
    else groups.push({ s, items: [{ b, i }] });
  });

  const retryCards = (i: number) =>
    (slots.get(i) ?? []).map((id) => {
      const original = blocks.find((b): b is GateBlock => b.type === "gate" && b.id === id);
      if (!original) return null;
      const first = original.kind === "choice" ? shownOptions(original, orders) : [];
      const twin = twinGate(original);
      const asked = twin ?? original;
      const options = asked.kind !== "choice" ? [] : twin ? twinOptions(twin, first.findIndex((o) => o.trim() === original.answer.trim())) : retryOrder(original, first);
      return (
        <Rise key={`retry-${id}`} as="div">
          <GateV2 gate={asked} options={options} state={retries[id] ?? null} onAnswer={(raw) => answerRetry(original, asked, raw)} focusOnMount retry={{ of: id, twin: twin !== null }} />
        </Rise>
      );
    });

  let headingIndex = -1;
  const render = (b: NoteBlock, i: number) => {
    const key = b.type === "gate" ? `gate-${b.id}` : `${b.type}-${i}`;
    switch (b.type) {
      case "pause":
      case "hero":
        // A section's end carries its own place to stop; the hero is the page's.
        return null;
      case "h": {
        headingIndex += 1;
        const meta = sections?.[headingIndex];
        const hidden = hideFirstHeading && headingIndex === 0;
        return (
          <Rise key={key} as="div">
            {meta && total > 1 && (
              <div className="tnum font-sans text-meta font-medium text-ink-2">
                {meta.n} of {total} · {meta.minutes} min
              </div>
            )}
            <h3 data-section={headingIndex} className={clsx("scroll-mt-24", hidden ? "sr-only" : "mt-1.5 text-h2 font-medium tracking-[-0.01em] text-ink")}>
              <MdInlines inlines={parseInline(b.text.trim().replace(/^\d+\s*[.):]\s*/, ""))} />
            </h3>
          </Rise>
        );
      }
      case "p":
        return (
          <Rise key={key} as="div">
            <Md md={b.md} className="mt-3" />
          </Rise>
        );
      case "callout":
        return (
          <Rise key={key} as="div">
            <Callout block={b} />
          </Rise>
        );
      case "see":
        return (
          <Rise key={key} as="div">
            <SeeItBlock i={i} sees={sees} paced />
          </Rise>
        );
      case "figure":
        return (
          <Rise key={key} as="div">
            {b.svg ? <StagedFigure svg={b.svg} alt={b.alt} caption={b.caption} className="my-5" /> : <div className="my-3 font-sans text-meta text-ink-2">{b.alt}</div>}
          </Rise>
        );
      case "photo":
        return (
          <Rise key={key} as="div">
            <PhotoFigure photo={b} />
          </Rise>
        );
      case "video":
        return (
          <Rise key={key} as="div">
            {/* Offline, the video says so; where the section has shown its own steps first (a See it before the video,
                v3's order), the line points her at them (VideoEmbed `offline`; the audit's READ-14). */}
            <VideoEmbed video={{ provider: "youtube", ...b }} offline={stepsShownBefore[i] ? "The worked steps above show the same method." : undefined} />
          </Rise>
        );
      case "sim":
        return (
          <Rise key={key} as="div">
            <SimEmbed sim={b} />
          </Rise>
        );
      case "prompt":
        return (
          <Rise key={key} as="div" className="my-5">
            {renderPrompt ? renderPrompt(b.promptId) : <div className={clsx(recessCls, "font-sans text-meta text-ink-2")}>Prompt {b.promptId}</div>}
          </Rise>
        );
      case "gate":
        return (
          <Rise key={key} as="div">
            <GateV2
              gate={b}
              options={b.kind === "choice" ? shownOptions(b, orders) : []}
              state={answers[b.id] ?? null}
              onAnswer={(raw) => answer(b, raw)}
              focusOnMount={interacted.current}
              afterVideo={blocks[i - 1]?.type === "video"}
              reaction={paced.reaction ? (hers, correct) => paced.reaction?.(b.id, hers, correct) : undefined}
              see={seeFor[i]! >= 0 ? sees.resolved(seeFor[i]!) : null}
              turn={turns[i] ?? null}
            />
          </Rise>
        );
    }
  };

  return (
    <article ref={articleRef} className={clsx("prose-note", className)} aria-label="Note">
      {/* The track above the lesson shows where she is; the count of checks is said, not shown twice. */}
      {view.gatesTotal > 0 && (
        <div className="sr-only" role="status" aria-live="polite">
          {view.gatesAnswered} of {view.gatesTotal} answered
        </div>
      )}
      {groups.map(({ s, items }) => {
        const lastShown = items[items.length - 1].i;
        const waiting = (view.pendingGate !== null && items.some(({ b }) => b.type === "gate" && b.id === view.pendingGate?.id)) || items.some(({ b, i }) => b.type === "see" && !sees.complete(i));
        // A retry before the recap blocks the way on until it is answered, as a Your turn does.
        const retryPending = items.some(({ i }) => (slots.get(i) ?? []).some((id) => !retries[id]));
        const complete = lastShown === lastBlockOf[s] && !waiting && !retryPending;
        return (
          <div key={s} data-lesson-section={s + 1} className={clsx(s > 0 && "section-rule")}>
            {items.map(({ b, i }) => (
              <Fragment key={`${b.type}-${i}`}>
                {render(b, i)}
                {retryCards(i)}
              </Fragment>
            ))}
            {complete && total > 0 && <SectionEnd n={s + 1} total={total} paced={{ ...paced, onContinue }} pauseHref={pauseHref} />}
          </div>
        );
      })}
    </article>
  );
}
