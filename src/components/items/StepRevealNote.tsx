"use client";

/**
 * The note that will not scroll past you: prose in short stretches, each closed by a
 * gate (a blank, a choice or a number). Nothing after an unanswered gate renders —
 * "Answer to continue". Answering, right or not, shows the explanation and opens the
 * next stretch with a fade + 8 px rise.
 *
 * Three surfaces (01-art-direction.md §4.2): the prose is on the page, never in a card; a callout is a recess (reference
 * she consults); the gate is the one object (she acts on it), solid-edged, never dashed. An answered gate is a marked
 * object: a 2 px edge and a 4 px margin rule in the outcome colour, so a judged gate reads differently from a paragraph
 * at arm's length. Every section boundary after the first is a place to stop ("Pause here").
 *
 * Read v2 (`paced`, the trial topic; art direction v2 §8.4 and §9) shows one section at a time: each ends in "Pause
 * here" and a Continue that opens the next, and the gate is drawn exactly as Slides draws it. The stem, its maths and
 * the answer keep the §8.4 rhythm (the tokens in app/globals.css); a stacked fraction that ends the sentence stands on
 * its own line (lesson-plan.ts gateStem, shared with Slides); she chooses, then presses Check; the right option is lit
 * in fern with a drawn tick and hers, when it is not the right one, is edged in the warm neutral with the circle-dash;
 * the verdict ("Yes." in fern, "Not quite." in ink) comes in its own marked object under the gate. Nothing is red.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Ban, ClipboardList, Key, Lightbulb, Quote } from "lucide-react";
import { clsx } from "clsx";
import { gateStem } from "@/components/topic/lesson-plan";
import { Math as MathTex } from "@/lib/math/Math";
import { sanitizeInlineSvg, svgViewBoxWidth } from "@/lib/ux/svg";
import { InlineSvg } from "./Figure";
import { PhotoFigure } from "@/components/media/PhotoFigure";
import { SimEmbed } from "@/components/media/SimEmbed";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { deckGateOrders, optionTex, shownOptions } from "@/lib/gate-order";
import { formatExaminerSource, optionLetter } from "./format";
import { markGate, visibleBlocks, type GateBlock, type NoteBlock } from "./gates";
import { Md, MdInlines } from "./Markdown";
import { parseInline } from "./md";
import { Tex } from "./Tex";
import { btnCheck, btnOption, btnPrimary, fieldCls, Letter, MissMark, recessCls, Rise, Tick } from "./ui";
import { focusLanding } from "@/components/shell/input-modality";

export type { GateBlock, NoteBlock } from "./gates";

/** What the lesson knows about each of its headings, in order: its number and what it costs. */
export interface NoteSectionMeta {
  n: number;
  minutes: number;
}

export interface StepRevealNoteProps {
  blocks: NoteBlock[];
  onGate: (id: string, answer: string, correct: boolean) => void;
  /**
   * One gate on its own (the review inbox, the first-run lesson): no "n of N checks done" line, no "End of the lesson",
   * no pauses, and the gate draws no frame of its own because the page around it is already the object.
   */
  single?: boolean;
  /** Renders an embedded retrieval prompt by id (the note only knows the id). */
  renderPrompt?: (promptId: string) => ReactNode;
  /** Gate ids already answered (e.g. restored from an earlier session). */
  initiallyAnswered?: readonly string[];
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

interface GateState {
  answer: string;
  correct: boolean;
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
  // Restored from an earlier visit: the answer itself was not kept, only that the gate was passed.
  const restored = answered && state.answer === "";
  return (
    <div
      data-gate={gate.id}
      className={clsx(
        "scroll-mt-16",
        flat
          ? "my-4"
          : clsx(
              "my-6 rounded-[var(--radius)] bg-surface p-5 sm:p-6",
              !answered || restored ? "border border-line-2" : state.correct ? "border-2 border-l-4 border-ok" : "border-2 border-l-4 border-miss",
            ),
      )}
      aria-labelledby={`gate-${gate.id}-prompt`}
    >
      <div className="font-sans text-meta font-medium text-ink-2">{answered ? "Checked" : afterVideo ? "Watching is not practice: answer to continue" : "Answer to continue"}</div>
      <div id={`gate-${gate.id}-prompt`} className="mt-1.5 text-h3 font-semibold leading-snug">
        <Tex text={gate.prompt} />
      </div>

      {gate.kind === "choice" && gate.options ? (
        <div role="radiogroup" aria-label="Choose" className="mt-3 grid gap-2">
          {/* In the lesson's balanced order, not the authored one, where the answer is nearly always first. */}
          {options.map((opt, i) => {
            const chosen = answered && state.answer === opt;
            const right = answered && markGate(gate, opt);
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={chosen}
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
        restored ? null : (
          <div className="mt-2 flex items-center gap-2 font-sans text-ui">
            {state.correct ? <Tick size={18} /> : <MissMark size={18} />}
            <span>
              <span className="text-ink-2">You: </span>
              {state.answer}
              {!state.correct && (
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
          className="mt-3 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (typed.trim()) onAnswer(typed.trim());
          }}
        >
          <label htmlFor={`gate-${gate.id}`} className="sr-only">
            Your answer
          </label>
          <input
            ref={inputRef}
            id={`gate-${gate.id}`}
            type="text"
            inputMode={gate.kind === "number" ? "decimal" : "text"}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder={gate.kind === "number" ? "Number" : "Fill the blank"}
            className={clsx(fieldCls, "tap-lg max-w-[18rem] flex-1")}
          />
          <button type="submit" className={btnCheck} disabled={!typed.trim()}>
            Check
          </button>
        </form>
      )}

      {answered && (
        <Rise as="div" className="mt-3 border-t border-line pt-3 text-ui leading-relaxed" role="status">
          <span className="font-medium">{restored ? "" : state.correct ? "Yes. " : "Not quite. "}</span>
          <Tex text={gate.explain} />
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

function ClassicNote({ blocks, onGate, renderPrompt, initiallyAnswered, single = false, sections, hideFirstHeading = false, pauseHref = "/", className }: StepRevealNoteProps) {
  const [answers, setAnswers] = useState<Record<string, GateState>>(() =>
    Object.fromEntries((initiallyAnswered ?? []).map((id) => [id, { answer: "", correct: true }])),
  );
  const answeredIds = useMemo(() => new Set(Object.keys(answers)), [answers]);
  const view = useMemo(() => visibleBlocks(blocks, answeredIds), [blocks, answeredIds]);
  // Every choice gate's shown order, balanced over the whole note (not only the stretch on screen), so a gate reads the
  // same before and after the gates above it are answered, and the same as in Slides.
  const orders = useMemo(() => deckGateOrders(blocks), [blocks]);
  const interacted = useRef(false);
  const total = sections?.length ?? 0;

  const answer = (gate: GateBlock, raw: string) => {
    if (answers[gate.id]) return;
    interacted.current = true;
    const correct = markGate(gate, raw);
    setAnswers((a) => ({ ...a, [gate.id]: { answer: raw, correct } }));
    onGate(gate.id, raw, correct);
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
                  className={clsx(
                    hidden ? "sr-only" : "mt-1.5 text-h2 font-medium tracking-[-0.01em] text-ink",
                    single && !hidden && "mt-0 text-h3 font-semibold",
                  )}
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
      {!single && view.pendingGate === null && view.gatesTotal > 0 && (
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
      <div className="rounded-[var(--radius)] bg-[var(--tint-wash)] p-3.5 sm:p-5" style={{ "--fig-halo": "var(--tint-wash)" } as CSSProperties}>
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

type OptionState = "ok" | "miss" | "chosen" | "rest";

/** The badge at an option's left: its letter, the ink-filled letter once chosen, the filled tick, or the circle-dash. */
function OptionBadge({ letter, state }: { letter: string; state: OptionState }) {
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

/**
 * The verdict, in its own marked object under the gate (§8.1): the 2 px outcome edge and the 4 px rule, the word at
 * 21 px ("Yes." in fern, "Not quite." in ink, never "Wrong"), the consequence drawn where the gate has one, the
 * explanation, and what happens to the answer. A gate restored from an earlier visit kept only that it was passed, so it
 * shows the explanation as reference and no word.
 */
function Verdict({ gate, state, reaction }: { gate: GateBlock; state: GateState; reaction?: ReactNode }) {
  if (state.answer === "")
    return (
      <div className={clsx(recessCls, "mt-3")}>
        <div className="font-serif-lesson text-[17px] leading-[1.5] text-ink">
          <Tex text={gate.explain} />
        </div>
      </div>
    );
  return (
    <div
      data-verdict-block
      role="status"
      // A landing place: the keyboard is put here after Check. Quiet after a click, ringed when the keyboard brought her
      // (the focus contract, src/components/shell/input-modality.ts; the owner's trial, 24 Sep).
      tabIndex={-1}
      data-focus-quiet=""
      className={clsx("motion-reveal mt-3 scroll-mb-24 rounded-[var(--radius)] border-2 border-l-4 bg-surface px-4 py-3.5", state.correct ? "border-ok" : "border-miss")}
    >
      <div data-verdict className={clsx("font-serif-lesson text-[length:var(--fs-verdict)] font-semibold leading-tight", state.correct ? "text-ok" : "text-ink")}>
        {state.correct ? "Yes." : "Not quite."}
      </div>
      {reaction && (
        <div data-reaction-stage className="mt-2 flex justify-center rounded-[var(--radius)] bg-surface-2 p-1">
          {reaction}
        </div>
      )}
      <div className="mt-2 font-serif-lesson text-[17px] leading-[1.5] text-ink">
        <Tex text={gate.explain} />
      </div>
      <div className="mt-2 font-sans text-meta text-ink-2">Recorded. It comes back in your reviews.</div>
    </div>
  );
}

/**
 * The gate as Slides draws it (§8.1, §8.4). The stem at --fs-stem in Literata 600, its maths on its own line at
 * --fs-stem-maths --gap-stem-maths below it, the answer --gap-maths-field below that; options --h-option tall and
 * --gap-option apart with their text at --fs-option in Literata. She chooses (selection is an ink edge), then presses
 * Check; arrow keys move the choice and Enter on the chosen option checks.
 */
function GateV2({
  gate,
  options,
  state,
  onAnswer,
  focusOnMount,
  afterVideo = false,
  reaction,
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
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stem = useMemo(() => gateStem(gate.prompt), [gate.prompt]);
  useEffect(() => {
    // Only a gate that appeared because the previous one was answered takes focus; the first never pulls the page down.
    if (!state && focusOnMount) inputRef.current?.focus({ preventScroll: true });
  }, [state, focusOnMount]);

  const answered = state !== null;
  const restored = answered && state.answer === "";
  const promptId = `gate-${gate.id}-prompt`;
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

  return (
    <div data-gate={gate.id} data-gate-v2 role="group" className="my-6 scroll-mt-16" aria-labelledby={promptId}>
      <div className="rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6">
        <div className="font-sans text-meta font-medium text-ink-2">{answered ? "Checked" : afterVideo ? "Watching is not practice: answer to continue" : "Answer to continue"}</div>
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
              <div role="radiogroup" aria-labelledby={promptId} className="flex max-w-[36rem] flex-col gap-[var(--gap-option)]">
                {options.map((opt, i) => {
                  const chosen = answered ? state.answer === opt : choice === opt;
                  const right = answered && markGate(gate, opt);
                  const look: OptionState = right ? "ok" : answered && chosen ? "miss" : !answered && chosen ? "chosen" : "rest";
                  return (
                    <button
                      key={opt}
                      ref={(el) => {
                        optionRefs.current[i] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      tabIndex={answered ? -1 : opt === tabStop ? 0 : -1}
                      disabled={answered}
                      data-option={look}
                      // The authored option, so a check can find an option by what it says in the gate's shown order.
                      data-value={opt}
                      onClick={() => setChoice(opt)}
                      onKeyDown={(e) => onOptionKey(e, i)}
                      className={clsx(
                        "flex min-h-[var(--h-option)] w-full items-center gap-3 rounded-[var(--radius)] text-left text-ink transition-[border-color,background-color] duration-150 disabled:cursor-default",
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
                      {look === "ok" && <span className="sr-only">{chosen ? " (your answer, and right)" : " (the right answer)"}</span>}
                      {look === "miss" && <span className="sr-only"> (your answer)</span>}
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
            restored ? null : (
              <div className="flex items-center gap-2.5 font-sans text-ui">
                <OptionBadge letter="" state={state.correct ? "ok" : "miss"} />
                <span>
                  <span className="text-ink-2">You wrote </span>
                  {state.answer}
                  {!state.correct && (
                    <span className="text-ink-2">
                      {" "}
                      · the answer is <Tex text={gate.answer.split("|")[0].trim()} />
                    </span>
                  )}
                </span>
              </div>
            )
          ) : (
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label htmlFor={`gate-${gate.id}`} className="sr-only">
                Your answer
              </label>
              <input
                ref={inputRef}
                id={`gate-${gate.id}`}
                type="text"
                inputMode={gate.kind === "number" ? "decimal" : "text"}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder={gate.kind === "number" ? "Number" : "Fill the blank"}
                className={clsx(fieldCls, "min-h-[var(--h-option)] max-w-[18rem] flex-1")}
              />
              <button type="submit" className={btnCheck} disabled={!typed.trim()}>
                Check
              </button>
            </form>
          )}
        </div>
      </div>
      {answered && <Verdict gate={gate} state={state} reaction={!restored && reaction ? reaction(state.answer, state.correct) : undefined} />}
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
          className="tap inline-flex items-center rounded-[var(--radius-sm)] px-2 text-ui text-ink-2 underline decoration-transparent underline-offset-4 hover:text-ink hover:decoration-accent"
        >
          Pause here
          <span className="sr-only">. Your place is kept; the lesson opens at the next section.</span>
        </Link>
      </div>
    </div>
  );
}

function PacedNoteView({ blocks, onGate, renderPrompt, initiallyAnswered, sections, hideFirstHeading = false, pauseHref = "/", className, paced }: StepRevealNoteProps & { paced: PacedNote }) {
  const [answers, setAnswers] = useState<Record<string, GateState>>(() =>
    Object.fromEntries((initiallyAnswered ?? []).map((id) => [id, { answer: "", correct: true }])),
  );
  const answeredIds = useMemo(() => new Set(Object.keys(answers)), [answers]);
  const view = useMemo(() => visibleBlocks(blocks, answeredIds), [blocks, answeredIds]);
  // Every choice gate's shown order, balanced over the whole note: the same order Slides shows (src/lib/gate-order.ts).
  const orders = useMemo(() => deckGateOrders(blocks), [blocks]);
  const interacted = useRef(false);
  const [lastAnswered, setLastAnswered] = useState<string | null>(null);
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

  const answer = (gate: GateBlock, raw: string) => {
    if (answers[gate.id]) return;
    interacted.current = true;
    const correct = markGate(gate, raw);
    setAnswers((a) => ({ ...a, [gate.id]: { answer: raw, correct } }));
    setLastAnswered(gate.id);
    onGate(gate.id, raw, correct);
  };

  // After an answer the keyboard goes to the verdict, so a screen reader reads it and Tab carries on from there
  // (the Check button that had focus is gone); the verdict is scrolled into view only if it is not already.
  useEffect(() => {
    if (!lastAnswered) return;
    const verdict = articleRef.current?.querySelector<HTMLElement>(`[data-gate="${lastAnswered}"] [data-verdict-block]`);
    if (!verdict) return;
    focusLanding(verdict);
    verdict.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [lastAnswered]);

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

  // What is on the page: every block up to the first unanswered gate, in the sections she has opened.
  const shown = view.blocks.filter((_, i) => sectionOf[i] < paced.open);
  const groups: Array<{ s: number; items: Array<{ b: NoteBlock; i: number }> }> = [];
  shown.forEach((b, i) => {
    const s = sectionOf[i];
    const g = groups[groups.length - 1];
    if (g && g.s === s) g.items.push({ b, i });
    else groups.push({ s, items: [{ b, i }] });
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
            <GateV2
              gate={b}
              options={b.kind === "choice" ? shownOptions(b, orders) : []}
              state={answers[b.id] ?? null}
              onAnswer={(raw) => answer(b, raw)}
              focusOnMount={interacted.current}
              afterVideo={blocks[i - 1]?.type === "video"}
              reaction={paced.reaction ? (hers, correct) => paced.reaction?.(b.id, hers, correct) : undefined}
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
          {view.gatesAnswered} of {view.gatesTotal} checks done
        </div>
      )}
      {groups.map(({ s, items }) => {
        const lastShown = items[items.length - 1].i;
        const waiting = view.pendingGate !== null && items.some(({ b }) => b.type === "gate" && b.id === view.pendingGate?.id);
        const complete = lastShown === lastBlockOf[s] && !waiting;
        return (
          <div key={s} data-lesson-section={s + 1} className={clsx(s > 0 && "section-rule")}>
            {items.map(({ b, i }) => render(b, i))}
            {complete && total > 0 && <SectionEnd n={s + 1} total={total} paced={{ ...paced, onContinue }} pauseHref={pauseHref} />}
          </div>
        );
      })}
    </article>
  );
}
