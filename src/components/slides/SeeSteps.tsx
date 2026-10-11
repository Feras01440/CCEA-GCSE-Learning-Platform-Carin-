"use client";

/**
 * The See it (the teach-first case §6.2 and §8.1; docs/plan/review/2026-09-27-see-it-block-shape.md), drawn the same way
 * in Slides and in Read as a ledger that becomes the ladder (the slides-steps design note of 11 Oct 2026,
 * scratchpad/reports/slides-steps/DESIGN.md, after the owner's finding that a stepped See it rolled the card down and
 * never showed the whole case at once):
 *
 * - Step 1 shows the example whole: the stem with its maths on its own line, the figure, the first step (its working
 *   line, the mark it earns, its reason), and one rail for the steps to come ("4 more steps", one dashed dot each).
 * - From the first Continue the card folds around the newest step: the stem's words fold to one line (the maths it
 *   lifts never folds; it is what the steps transform), on a phone the figure folds to a thumbnail beside it, and every
 *   finished step keeps its number, its working line and its chips and folds its reason behind a tap (a one-line
 *   preview where there is room). The newest step is the only one shown in full and it arrives in place: nothing above
 *   it moves and nothing scrolls.
 * - The last reveal leaves the ladder (`data-see-ladder`): every working line in order, the answer under it, every
 *   reason one tap away, and "Step through again". On a desktop without a figure the rows are two columns, the line and
 *   its reason beside it; with a figure the figure keeps the card's 400 px column and the rows stack on the left.
 * - A See it of five or six steps uses the dense tokens (--fs-step-dense, --fs-step-reason-dense) and shows no reason
 *   preview on a finished row; a working line of prose (no display maths) on a finished row clamps to two lines on a
 *   phone. All of it is decided by the See it's own numbers, never by measuring, so a card looks the same on every visit.
 *
 * A step she types is an answer field marked through the engine and never recorded, with a quiet "Show me the step"
 * beside it: a See it is shown before it is asked, so she can always see the line.
 *
 * Imports only the item leaves it needs, never the items index: StepRevealNote (in that index) draws this too.
 */
import { useId, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import type { AnswerSpec } from "@/lib/content/schema";
import { AnswerField } from "@/components/items/AnswerField";
import { Figure } from "@/components/items/Figure";
import { MdInlines } from "@/components/items/Markdown";
import { markAnswer } from "@/components/items/mark";
import { parseInline } from "@/components/items/md";
import { StemTex } from "@/components/items/StemTex";
import { Tex } from "@/components/items/Tex";
import { gateStem } from "@/components/topic/lesson-plan";
import type { ResolvedSee } from "@/lib/slides/see";
import type { StepResult } from "@/lib/slides/position";
import { spokenText } from "@/lib/slides/text";

export interface SeeStepsProps {
  see: ResolvedSee;
  /** How many steps are shown (at least the first). */
  revealed: number;
  /** The step she types (0-based), or null. */
  typed: number | null;
  typedResult: StepResult | null;
  onTyped: (r: StepResult) => void;
  /** "card" in Slides (the card sizes), "page" in Read (the page's). */
  size: "card" | "page";
  /** The newest step arrives with the reveal motion (a step restored on a reload arrives still). */
  animateLast?: boolean;
  calculator?: boolean;
  /**
   * "Step through again" at the end, when the caller can set the See it back to its first step; nothing is recorded.
   * It stands at the ladder's foot, where the rail stood until the last reveal: a compact row (its 44 px hit area is
   * drawn outside its layout box), because the end state is where the card has the least room.
   */
  onRestart?: (() => void) | null;
  /**
   * How a new step is announced: "focus" when the caller lands the keyboard on it (Slides, where Continue is the foot's
   * control), "live" when the keyboard stays on the button that showed it (Read's "Next step") and the list speaks.
   */
  announce?: "focus" | "live";
}

/** Inline maths kept whole, as the Slides prose keeps it (a formula moves to the next line as one piece). */
const whole = "[&_.katex]:inline-block [&_.katex]:max-w-full";

/** A See it of this many steps or more uses the dense tokens and folds without a preview (DESIGN.md §4). */
export const DENSE_FROM = 5;
/** So does one whose longest step (its working line and its reason together) runs to this many words: a science explanation whose "line" is a sentence. */
export const DENSE_STEP_WORDS = 45;
/** And one whose whole case (stem, lines, reasons, answer) runs to this many words: four steps of prose with a long question. */
export const DENSE_TOTAL_WORDS = 130;
/** An answer line of more words than this is a sentence, not a result: it is set at the reason size, in ink. */
export const ANSWER_SENTENCE_OVER = 12;
/** A See it whose stem and working lines hold this many stacked fractions or matrices is set dense too: each stands two lines tall. */
export const DENSE_STACKED = 4;
const STACKED = /\\[dt]?frac(?![a-zA-Z])|\\begin\{/g;
/**
 * A stem of more tokens than this on its ordinary lines folds after the first reveal (each paragraph to one line); a
 * shorter one is one phone line already and has nothing to fold. Tokens are everything set on those lines, inline maths
 * included ("Solve $2x + 5y = 11$ and $3x + 4y = 13$ using a matrix method." is three lines on a phone with six words
 * outside its maths); the maths a stem lifts onto its own line (StemTex, gateStem) never folds and is not counted, so
 * "Simplify $\dfrac{…}{…}$" is one token and stays as it is.
 */
export const STEM_FOLDS_OVER = 6;

const words = (s: string | null | undefined) => (s ?? "").split(/\s+/).filter(Boolean).length;

/** The tokens of a stem on its ordinary lines: the words around the lifted maths, or the whole line when none is lifted. */
export function stemTokens(text: string): number {
  const stem = gateStem(text);
  if (stem.maths !== null) return words(stem.lead) + words(stem.tail);
  return words(text.replace(/\$\$[\s\S]*?\$\$/g, " "));
}

/**
 * Whether a See it is set dense: five or six steps, a step of DENSE_STEP_WORDS words or more, DENSE_TOTAL_WORDS words
 * in all, or a figure (on a desktop the figure keeps the card's 400 px column and the ladder stacks in the 544 px beside
 * it; on a phone the figure's thumbnail shares the head). Decided by the content alone, never by measuring, so a card
 * looks the same on every visit. On the 11 Oct 2026 corpus that is about 140 of 1,180 See its (the design note's sweep).
 */
export function isDense(see: Pick<ResolvedSee, "stem" | "steps" | "finalAnswer" | "figure">): boolean {
  if (see.steps.length >= DENSE_FROM || see.figure !== null) return true;
  const perStep = see.steps.map((s) => words(s.working) + words(s.decision));
  if (perStep.some((n) => n >= DENSE_STEP_WORDS)) return true;
  if ([see.stem, ...see.steps.map((s) => s.working)].reduce((n, t) => n + (t.match(STACKED)?.length ?? 0), 0) >= DENSE_STACKED) return true;
  return words(see.stem) + perStep.reduce((a, b) => a + b, 0) + words(see.finalAnswer) >= DENSE_TOTAL_WORDS;
}

/** A working line that is prose (no display maths): the one kind a finished row may clamp. */
const isProse = (working: string) => !/\$\$/.test(working);

/** The mark a line earns, as the paper prints it: Inter 13 px 600 on the recess (the floor, not the case's 12). */
function Chip({ code }: { code: string }) {
  return <span className="tnum inline-flex h-6 items-center rounded-[6px] bg-surface-2 px-1.5 font-sans text-[length:var(--fs-step-chip)] font-semibold text-ink">{code}</span>;
}

const badgeCls = (look: "current" | "done") =>
  clsx("tnum mt-[3px] grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full font-sans text-[13px] font-semibold", look === "current" ? "bg-accent text-accent-ink" : "border border-ink-3 text-ink-2");

function Badge({ n, look }: { n: number; look: "current" | "done" }) {
  return (
    <span aria-hidden className={badgeCls(look)}>
      {n}
    </span>
  );
}

/** A finished step's number is the toggle for its reason: 26 px drawn, a 44 px hit area around it. */
function BadgeToggle({ n, open, controls, onToggle }: { n: number; open: boolean; controls: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`Why, step ${n}`}
      data-step-why
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={clsx(badgeCls("done"), "relative cursor-pointer before:absolute before:-inset-[9px] before:content-['']")}
    >
      {n}
    </button>
  );
}

/**
 * A question's words as a Your turn, a See it and a recall set them (art direction v2 §8.4): Literata semibold at the
 * stem size, inline maths kept whole, and a stacked fraction left in the sentence (gateStem's `stackedInline`) given
 * room between its lines. The lift is StemTex's, the one every stem shares (Read's gates, a find-the-mistake, a
 * retrieval prompt), so a question reads the same wherever she meets it.
 */
export const stemWords = (text: string) =>
  clsx("font-serif-lesson text-[length:var(--fs-stem)] font-semibold text-ink", whole, gateStem(text).stackedInline ? "leading-[1.6]" : "leading-[var(--lh-stem)]");

/** A block that opens and closes by click, Enter or Space; a div, because its content holds paragraphs. */
function Disclosure({ open, onToggle, label, children, className, ...rest }: { open: boolean; onToggle: () => void; label: string; children: ReactNode; className?: string } & Record<`data-${string}`, string | undefined>) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };
  // The 44 px hit area is drawn around the block (the pseudo-element), not as its height: a folded stem is one 31 px line.
  return (
    <div role="button" tabIndex={0} aria-expanded={open} aria-label={label} onClick={onToggle} onKeyDown={onKey} className={clsx("relative cursor-pointer before:absolute before:-inset-y-2 before:inset-x-0 before:content-['']", className)} {...rest}>
      {children}
    </div>
  );
}

/**
 * The example's question as a Your turn's is set: the words, then the maths it is about on its own line. Folded, the
 * words clamp to one line each side of the maths; the maths stays. The text stays in the DOM either way.
 */
function Stem({ text, folded, open, onToggle }: { text: string; folded: boolean; open: boolean; onToggle: () => void }) {
  const cls = stemWords(text);
  if (!folded) {
    return (
      <div data-see-stem>
        <StemTex text={text} className={cls} />
      </div>
    );
  }
  // StemTex is the one paragraph itself when the stem lifts no maths, and a wrapper of paragraphs around the maths line
  // when it does: the clamp goes on the paragraph in the first case and on each paragraph inside in the second.
  const clamp = gateStem(text).maths === null ? "line-clamp-1" : "[&_p]:line-clamp-1";
  return (
    <Disclosure open={open} onToggle={onToggle} label={open ? "The question: fold it" : "The question: show all of it"} className="flex items-start gap-2 rounded-[8px]" data-see-stem-toggle="">
      <div data-see-stem className="min-w-0 flex-1">
        <StemTex text={text} className={clsx(cls, !open && clamp)} />
      </div>
      <ChevronDown aria-hidden size={18} className={clsx("mt-[5px] shrink-0 text-ink-3 transition-transform", open && "rotate-180")} />
    </Disclosure>
  );
}

/**
 * A working line. A display line (a matrix, a tall fraction) sits on the line's own left edge with no margin above or
 * below: KaTeX's default 1 em each way and Tex's `my-2` wrapper around a display formula together cost a six-step matrix
 * See it 290 px (measured 11 Oct 2026), and a worked line is a line of the ladder, not a display in the middle of a page.
 */
const displayFlush = "[&>div>div]:!my-0 [&_.katex-display]:!my-0 [&_.katex-display]:!text-left [&_.katex-display>.katex]:!text-left [&_.katex-display>.katex>.katex-html]:!text-left";

/** Dense: maths at 1.1 em of the step size (the floor the brief allows) instead of KaTeX's 1.21 em; a stacked fraction still reads. */
function Working({ md, cls, clamp, dense }: { md: string; cls: string; clamp: boolean; dense: boolean }) {
  return (
    <div className={clsx("min-w-0 font-serif-lesson leading-[1.4] text-ink", cls, whole, displayFlush, dense && "[&_.katex]:text-[1.1em]", clamp ? "line-clamp-2 lg:line-clamp-none" : "overflow-x-auto")}>
      <Tex text={md} />
    </div>
  );
}

type ReasonMode = "full" | "preview" | "preview-lg" | "hidden";

function Reason({ md, id, cls, mode, beside }: { md: string; id: string; cls: string; mode: ReasonMode; beside: boolean }) {
  if (mode === "hidden") return <div id={id} hidden />;
  const folded = mode !== "full";
  return (
    <div
      id={id}
      className={clsx(
        "font-serif-lesson",
        folded ? "text-[length:var(--fs-step-folded)] leading-[1.45] text-ink-2" : clsx("leading-[1.45] text-ink-2", cls),
        folded && "line-clamp-1",
        // Hidden below lg only: `lg:block` would override the -webkit-box display the clamp needs.
        mode === "preview-lg" && "max-lg:hidden",
        whole,
        beside ? "col-start-2 mt-[var(--gap-step-reason)] lg:col-start-3 lg:row-start-1 lg:mt-0 lg:pt-[3px]" : "col-start-2 mt-[var(--gap-step-reason)]",
        folded && "mt-1.5",
      )}
    >
      <MdInlines inlines={parseInline(md)} />
    </div>
  );
}

/** The step she types: the engine marks it, nothing is recorded, and the line is there for the asking. */
function TypedStep({ n, total, spec, earns, calculator, onTyped }: { n: number; total: number; spec: AnswerSpec; earns: number; calculator?: boolean; onTyped: (r: StepResult) => void }) {
  return (
    <div data-typed-step={n} className="flex flex-col gap-2">
      <p className="font-sans text-[15px] font-medium text-ink">Your line for step {n}</p>
      <AnswerField
        spec={spec}
        calculator={calculator}
        label={`Step ${n} of ${total}: your line`}
        placeholder="Your line for this step"
        autoFocus
        onSubmit={(raw) => onTyped({ raw, correct: markAnswer(raw, spec, { marks: earns }).correct })}
      />
      <button type="button" onClick={() => onTyped({ shown: true })} className="tap inline-flex w-fit items-center px-1 font-sans text-[15px] font-medium text-ink-2 underline decoration-accent underline-offset-[3px] hover:text-ink" data-show-step>
        Show me the step
        <span className="sr-only">: nothing is recorded</span>
      </button>
    </div>
  );
}

/** What she has opened, and at which reveal: a reveal folds everything back (the newest step is the one shown in full). */
interface Opened {
  at: number;
  stem: boolean;
  figure: boolean;
  row: number | null;
}

/** The quiet link as one text line (21 px of layout), its 44 px hit area drawn around it rather than taking the card's room. */
const quietCompact =
  "relative inline-flex w-fit items-center px-1 font-sans text-[15px] font-medium leading-[1.4] text-ink-2 underline decoration-accent underline-offset-[3px] hover:text-ink before:absolute before:-inset-y-3 before:inset-x-0 before:content-['']";

export function SeeSteps({ see, revealed, typed, typedResult, onTyped, size, animateLast = false, calculator, onRestart = null, announce = "live" }: SeeStepsProps) {
  const total = see.steps.length;
  const shown = Math.min(total, Math.max(1, revealed));
  const listId = useId();
  const [opened, setOpened] = useState<Opened>({ at: 0, stem: false, figure: false, row: null });
  const open = opened.at === shown ? opened : { at: shown, stem: false, figure: false, row: null };
  const set = (patch: Partial<Opened>) => setOpened({ ...open, ...patch });

  const card = size === "card";
  const dense = card && isDense(see);
  const folded = shown > 1;
  const stemFolds = folded && stemTokens(see.stem) > STEM_FOLDS_OVER;
  const figureFolds = card && folded && see.figure !== null;
  // On a desktop card without a figure the rows are two columns, the line and its reason beside it (DESIGN.md §4).
  const beside = card && see.figure === null;
  const settled = typed === null || typedResult !== null;
  const complete = shown >= total && settled;
  const fsStep = size === "page" ? "text-[length:var(--fs-stem)]" : dense ? "text-[length:var(--fs-step-dense)]" : "text-[length:var(--fs-step)]";
  const fsReason = size === "page" ? "text-[17px]" : dense ? "text-[length:var(--fs-step-reason-dense)]" : "text-[length:var(--fs-step-reason)]";
  const remaining = see.steps.slice(shown);
  const rowGap = { marginTop: "var(--gap-step-row)" };
  const pair = { marginTop: "var(--gap-step-pair)" };

  const toggleRow = (i: number) => set({ row: open.row === i ? null : i });
  /** A click on a finished row opens its reason, unless she is selecting its text. */
  const onRowClick = (i: number) => (e: MouseEvent<HTMLLIElement>) => {
    if (e.defaultPrevented) return;
    if (typeof window.getSelection === "function" && (window.getSelection()?.toString() ?? "") !== "") return;
    toggleRow(i);
  };

  const figure = see.figure ? (
    <div
      className={clsx("lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:mt-0", figureFolds && !open.figure ? "hidden lg:block" : "mt-4")}
      data-see-figure
      data-see-figure-open={figureFolds && open.figure ? "" : undefined}
    >
      <Figure spec={see.figure} />
    </div>
  ) : null;

  return (
    <div data-see-steps data-see-dense={dense ? "" : undefined} className={clsx("flex flex-col", see.figure && card && "lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-x-14")}>
      <div className="flex items-start gap-3 lg:col-start-1" data-see-head data-see-head-folded={folded ? "" : undefined}>
        <div className="min-w-0 flex-1">
          <Stem text={see.stem} folded={stemFolds} open={open.stem} onToggle={() => set({ stem: !open.stem })} />
        </div>
{figureFolds && (
          // The figure's thumbnail: a second drawing of it at a quarter of its size (the note's SVGs carry fixed widths, so
          // the whole drawing is zoomed, not its corner), hidden from assistive technology (the figure itself has the name).
          <Disclosure
            open={open.figure}
            onToggle={() => set({ figure: !open.figure })}
            label={open.figure ? "The figure: fold it" : "The figure: show it"}
            className="h-14 w-24 shrink-0 overflow-hidden rounded-[8px] border border-line bg-surface lg:hidden"
            data-see-figure-folded={open.figure ? undefined : ""}
          >
            <div aria-hidden className="flex h-full w-full items-center justify-center [zoom:0.24] [&_figure]:m-0 [&_figcaption]:hidden">
              <Figure spec={see.figure!} />
            </div>
          </Disclosure>
        )}
      </div>
      {figure}
      <ol
        id={listId}
        aria-label={`The steps, ${shown} of ${total} shown`}
        aria-live={announce === "live" ? "polite" : undefined}
        className="mt-5 flex flex-col lg:col-start-1"
        data-see-ladder={complete ? "" : undefined}
      >
        {see.steps.slice(0, shown).map((step, i) => {
          const isTyped = typed === i;
          const stepSettled = !isTyped || typedResult !== null;
          const current = i === shown - 1;
          const done = !current;
          const isOpen = done && open.row === i;
          const reasonId = `${listId}-why-${step.n}`;
          const reasonMode: ReasonMode = !done || isOpen ? "full" : dense ? (beside ? "preview-lg" : "hidden") : "preview";
          const foldedReason = done && !isOpen;
          return (
            <li
              key={step.n}
              data-step={step.n}
              data-current={current || undefined}
              data-step-folded={foldedReason ? "" : undefined}
              tabIndex={current && announce === "focus" ? -1 : undefined}
              data-focus-quiet={current && announce === "focus" ? "" : undefined}
              onClick={done ? onRowClick(i) : undefined}
              className={clsx(
                "grid grid-cols-[26px_minmax(0,1fr)] items-start gap-x-3",
                beside && "lg:grid-cols-[26px_minmax(0,1fr)_minmax(0,360px)] lg:gap-x-6",
                done && "cursor-pointer",
                animateLast && current && "motion-reveal",
              )}
              style={i > 0 ? rowGap : undefined}
            >
              {done ? <BadgeToggle n={step.n} open={isOpen} controls={reasonId} onToggle={() => toggleRow(i)} /> : <Badge n={step.n} look="current" />}
              <div className="min-w-0">
                <span className="sr-only">{`Step ${step.n} of ${total}. `}</span>
                {!stepSettled && step.input ? (
                  <TypedStep n={step.n} total={total} spec={step.input} earns={step.earns?.length ?? 1} calculator={calculator} onTyped={onTyped} />
                ) : (
                  <>
                    {/* What her line came to stays with the step's reason: on a finished row it folds with it. */}
                    {isTyped && typedResult && (!done || isOpen) && (
                      <p className="mb-2 font-sans text-[15px] text-ink-2" data-typed-result={"shown" in typedResult ? "shown" : typedResult.correct ? "right" : "miss"}>
                        {"shown" in typedResult ? (
                          "The line, as you asked:"
                        ) : typedResult.correct ? (
                          <>
                            <span className="font-medium text-ok">Yes.</span> You wrote {typedResult.raw}, and that is the line:
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-ink">Not quite.</span> You wrote {typedResult.raw}; the line is:
                          </>
                        )}
                      </p>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <Working md={step.working} cls={fsStep} clamp={card && foldedReason && isProse(step.working)} dense={dense} />
                      {step.earns && step.earns.length > 0 && (
                        <span className="flex shrink-0 gap-1 pt-0.5" aria-label={`Earns ${step.earns.join(", ")}`}>
                          {step.earns.map((code) => (
                            <Chip key={code} code={code} />
                          ))}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              {(stepSettled || !step.input) && <Reason md={step.decision} id={reasonId} cls={fsReason} mode={reasonMode} beside={beside} />}
            </li>
          );
        })}
      </ol>
      {shown < total && (
        // The steps to come, as one rail: a dashed dot each (the specs count them) and how many there are.
        <div aria-hidden className="flex items-center gap-3 lg:col-start-1" style={pair} data-ghosts>
          <span className="flex shrink-0 items-center gap-1.5 pl-[7px]">
            {remaining.map((step) => (
              <span key={step.n} data-ghost={step.n} className="h-3 w-3 rounded-full border border-dashed border-line-3" />
            ))}
          </span>
          <span className="font-sans text-[14px] text-ink-3">{remaining.length === 1 ? "1 more step" : `${remaining.length} more steps`}</span>
        </div>
      )}
      {complete && see.finalAnswer && (
        // A result at the step size; a sentence (more than ANSWER_SENTENCE_OVER words) at the reason size, still in ink.
        <p
          className={clsx("font-serif-lesson text-ink lg:col-start-1", whole, words(see.finalAnswer) > ANSWER_SENTENCE_OVER ? clsx("font-medium leading-[1.45]", fsReason) : clsx("font-semibold", fsStep), dense && "[&_.katex]:text-[1.1em]")}
          style={pair}
          data-see-answer
          aria-label={`The answer: ${spokenText(see.finalAnswer)}`}
        >
          <span className="font-sans text-[15px] font-medium text-ink-2">The answer </span>
          <Tex text={see.finalAnswer} />
        </p>
      )}
      {complete && onRestart && (
        <div className="lg:col-start-1" style={see.finalAnswer ? rowGap : pair}>
          <button type="button" onClick={onRestart} className={quietCompact} data-see-restart>
            Step through again
            <span className="sr-only">: from the first step; nothing is recorded</span>
          </button>
        </div>
      )}
    </div>
  );
}
