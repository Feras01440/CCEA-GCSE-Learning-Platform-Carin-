"use client";

/**
 * A retrieval prompt: try it (type or say it), show the answer, grade yourself with
 * Again / Good / Easy at thumb height. In review mode the next interval sits under
 * each button; inline mode is the lighter version that lives inside a note.
 */
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { Figure } from "./Figure";
import { keywordsPresent } from "./text-marking";
import { Tex } from "./Tex";
import { btnCheck, cardCls, Eyebrow, fieldCls, MissMark, Rise, Tick } from "./ui";

export type PromptGrade = "again" | "good" | "easy";

export interface PromptIntervals {
  again: string;
  good: string;
  easy: string;
}

export interface InlinePromptProps {
  prompt: RetrievalPrompt;
  mode: "inline" | "review";
  /** Next-review intervals shown under the grade buttons ("<1 min", "3 d", "10 d"). */
  intervals?: PromptIntervals;
  onGrade: (grade: PromptGrade) => void;
  index?: number;
  total?: number;
}

const KIND_LABEL: Record<RetrievalPrompt["kind"], string> = {
  qa: "Recall",
  cloze: "Fill the gap",
  formula: "Formula",
  definition: "Definition",
  procedure: "Procedure",
  trap: "Trap",
  "label-diagram": "Label",
  "novel-example": "New example",
  quotation: "Quotation",
};

const GRADES: Array<{ grade: PromptGrade; label: string; hint: string }> = [
  { grade: "again", label: "Again", hint: "Did not get it" },
  { grade: "good", label: "Good", hint: "Got it with effort" },
  { grade: "easy", label: "Easy", hint: "Instant" },
];

export function InlinePrompt({ prompt, mode, intervals, onGrade, index, total }: InlinePromptProps) {
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState<PromptGrade | null>(null);
  const gradeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTyped("");
    setRevealed(false);
    setGraded(null);
  }, [prompt.id]);

  useEffect(() => {
    if (revealed && !graded) gradeRef.current?.focus();
  }, [revealed, graded]);

  const keys = prompt.keyWords ?? [];
  const check = revealed && typed.trim() && keys.length > 0 ? keywordsPresent(typed, keys) : null;

  const grade = (g: PromptGrade) => {
    if (graded) return;
    setGraded(g);
    onGrade(g);
  };

  const review = mode === "review";
  const eyebrow = [review ? "Review" : KIND_LABEL[prompt.kind], index !== undefined && total !== undefined ? `${index} of ${total}` : null, prompt.examUnit ?? null]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className={clsx(review ? cardCls : "rounded-[var(--radius)] border border-line bg-surface-2/60 p-4")} aria-label={`${KIND_LABEL[prompt.kind]} prompt`}>
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        {review && <span className="text-meta text-ink-2">{KIND_LABEL[prompt.kind]}</span>}
      </div>
      <p className={clsx("mt-2 leading-snug", review ? "text-[19px] font-medium" : "text-[16px] font-medium")}>
        <Tex text={prompt.prompt} />
      </p>
      {prompt.image && <Figure spec={prompt.image} />}

      {!revealed ? (
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            setRevealed(true);
          }}
        >
          <label htmlFor={`rp-${prompt.id}`} className="sr-only">
            Your answer (optional)
          </label>
          <textarea
            id={`rp-${prompt.id}`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                setRevealed(true);
              }
            }}
            rows={2}
            placeholder="Say it in your head, or type it"
            autoComplete="off"
            spellCheck={false}
            className={clsx(fieldCls, "text-[16px]")}
          />
          <div className="mt-2 flex items-center gap-3">
            <button type="submit" className={btnCheck}>
              Show answer
            </button>
            <span className="text-meta text-ink-2">Enter to reveal</span>
          </div>
        </form>
      ) : (
        <Rise as="div" className="mt-3">
          <div className="rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 py-3">
            <p className="text-meta font-medium text-ink-2">Answer</p>
            <p className="mt-1 text-[16px] leading-relaxed">
              <Tex text={prompt.answer} />
            </p>
            {check && (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Key words in your answer">
                {keys.map((k) => {
                  const present = check.present.includes(k);
                  return (
                    <li key={k} className={clsx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-meta", present ? "border-ink-3 text-ink" : "border-line-2 text-ink-2")}>
                      {present ? <Tick size={12} label="present" /> : <MissMark size={12} label="missing" />}
                      {k}
                    </li>
                  );
                })}
              </ul>
            )}
            {check && <p className="mt-1.5 text-meta text-ink-2">{check.all ? "Every key word is there." : `Missing: ${check.missing.join(", ")}.`}</p>}
          </div>

          <div role="group" aria-label="How did it go?" className="mt-3 grid grid-cols-3 gap-2">
            {GRADES.map((g, i) => {
              const chosen = graded === g.grade;
              return (
                <button
                  key={g.grade}
                  ref={i === 1 ? gradeRef : undefined}
                  type="button"
                  disabled={graded !== null}
                  aria-pressed={chosen}
                  title={g.hint}
                  onClick={() => grade(g.grade)}
                  className={clsx(
                    "tap flex min-h-[52px] flex-col items-center justify-center rounded-[var(--radius-sm)] border px-2 py-1.5 text-ui font-semibold transition-[transform,border-color] duration-150 active:scale-[0.98] disabled:pointer-events-none",
                    chosen ? "border-ink bg-ink text-surface" : "border-line-2 bg-surface hover:bg-surface-2",
                    graded !== null && !chosen && "opacity-50",
                  )}
                >
                  {g.label}
                  {intervals && <span className={clsx("tnum text-meta font-normal", chosen ? "text-surface/80" : "text-ink-2")}>{intervals[g.grade]}</span>}
                </button>
              );
            })}
          </div>
          {graded && (
            <p className="mt-2 text-meta text-ink-2" role="status">
              Marked {GRADES.find((g) => g.grade === graded)?.label}
              {intervals ? ` · back in ${intervals[graded]}` : ""}.
            </p>
          )}
        </Rise>
      )}
    </section>
  );
}
