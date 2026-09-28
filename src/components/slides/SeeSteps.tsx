"use client";

/**
 * The See it (the teach-first case §6.2 and §8.1; docs/plan/review/2026-09-27-see-it-block-shape.md), drawn the same way
 * in Slides and in Read: the example's stem with its maths on its own line, its figure, then its steps, each a working
 * line with the reason under it and the mark it earns on the right. Steps appear one per Continue (the caller counts
 * them): a step already shown stays; the ones to come stand as numbered ghosts; the step being shown has its number
 * filled in the accent. A step she types is an answer field marked through the engine and never recorded, with a
 * quiet "Show me the step" beside it: a See it is shown before it is asked, so she can always see the line.
 *
 * Imports only the item leaves it needs, never the items index: StepRevealNote (in that index) draws this too.
 */
import { useId } from "react";
import { clsx } from "clsx";
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
}

/** Inline maths kept whole, as the Slides prose keeps it (a formula moves to the next line as one piece). */
const whole = "[&_.katex]:inline-block [&_.katex]:max-w-full";

/** The mark a line earns, as the paper prints it: Inter 13 px 600 on the recess (the floor, not the case's 12). */
function Chip({ code }: { code: string }) {
  return <span className="tnum inline-flex h-6 items-center rounded-[6px] bg-surface-2 px-1.5 font-sans text-[length:var(--fs-step-chip)] font-semibold text-ink">{code}</span>;
}

function Badge({ n, look }: { n: number; look: "current" | "done" | "ghost" }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "tnum mt-[3px] grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full font-sans text-[13px] font-semibold",
        look === "current" && "bg-accent text-accent-ink",
        look === "done" && "border border-ink-3 text-ink-2",
        look === "ghost" && "border border-dashed border-line-3 text-ink-3",
      )}
    >
      {n}
    </span>
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

/** The example's question as a Your turn's is set: the words, then the maths it is about on its own line. */
function Stem({ text }: { text: string }) {
  return (
    <div data-see-stem>
      <StemTex text={text} className={stemWords(text)} />
    </div>
  );
}

function Working({ md, size }: { md: string; size: SeeStepsProps["size"] }) {
  return (
    <div className={clsx("min-w-0 overflow-x-auto font-serif-lesson leading-[1.4] text-ink", size === "card" ? "text-[length:var(--fs-step)]" : "text-[length:var(--fs-stem)]", whole)}>
      <Tex text={md} />
    </div>
  );
}

function Reason({ md, size }: { md: string; size: SeeStepsProps["size"] }) {
  return (
    <div className={clsx("font-serif-lesson leading-[1.45] text-ink-2", size === "card" ? "text-[length:var(--fs-step-reason)]" : "text-[17px]", whole)} style={{ marginTop: "var(--gap-step-reason)" }}>
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

export function SeeSteps({ see, revealed, typed, typedResult, onTyped, size, animateLast = false, calculator }: SeeStepsProps) {
  const total = see.steps.length;
  const shown = Math.min(total, Math.max(1, revealed));
  const listId = useId();
  const pair = { marginTop: "var(--gap-step-pair)" };
  return (
    <div data-see-steps className="flex flex-col">
      <Stem text={see.stem} />
      {see.figure && (
        <div className="mt-4" data-see-figure>
          <Figure spec={see.figure} />
        </div>
      )}
      <ol id={listId} aria-label={`The steps, ${shown} of ${total} shown`} aria-live="polite" className="mt-5 flex flex-col">
        {see.steps.slice(0, shown).map((step, i) => {
          const isTyped = typed === i;
          const settled = !isTyped || typedResult !== null;
          const current = i === shown - 1;
          return (
            <li key={step.n} data-step={step.n} data-current={current || undefined} className={clsx("flex gap-3", animateLast && current && "motion-reveal")} style={i > 0 ? pair : undefined}>
              <Badge n={step.n} look={current ? "current" : "done"} />
              <div className="min-w-0 flex-1">
                <span className="sr-only">{`Step ${step.n} of ${total}. `}</span>
                {!settled && step.input ? (
                  <TypedStep n={step.n} total={total} spec={step.input} earns={step.earns?.length ?? 1} calculator={calculator} onTyped={onTyped} />
                ) : (
                  <>
                    {isTyped && typedResult && (
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
                      <Working md={step.working} size={size} />
                      {step.earns && step.earns.length > 0 && (
                        <span className="flex shrink-0 gap-1 pt-0.5" aria-label={`Earns ${step.earns.join(", ")}`}>
                          {step.earns.map((code) => (
                            <Chip key={code} code={code} />
                          ))}
                        </span>
                      )}
                    </div>
                    <Reason md={step.decision} size={size} />
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {shown < total && (
        <ol aria-hidden className="flex flex-col" style={pair} data-ghosts>
          {see.steps.slice(shown).map((step, i) => (
            <li key={step.n} data-ghost={step.n} className="flex items-center gap-3" style={i > 0 ? pair : undefined}>
              <Badge n={step.n} look="ghost" />
              <span className="h-[26px] flex-1 rounded-[8px] border border-dashed border-line-2" />
            </li>
          ))}
        </ol>
      )}
      {shown >= total && see.finalAnswer && (typed === null || typedResult !== null) && (
        <p className={clsx("font-serif-lesson font-semibold text-ink", whole)} style={pair} data-see-answer aria-label={`The answer: ${spokenText(see.finalAnswer)}`}>
          <span className="font-sans text-[15px] font-medium text-ink-2">The answer </span>
          <Tex text={see.finalAnswer} />
        </p>
      )}
    </div>
  );
}
