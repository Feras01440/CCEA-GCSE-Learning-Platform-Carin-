"use client";

/**
 * One misconception-tagged multiple-choice item with a three-step confidence row.
 * Both an option and a confidence are required before the reveal; the reveal shows the
 * chosen option's own feedback and the correct answer, and reports timing so a
 * confident miss can go to the hypercorrection queue (plan §4.3).
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import type { DiagnosticItem, McqOption } from "@/lib/content/schema";
import { Figure } from "./Figure";
import { optionLetter } from "./format";
import { seededShuffle } from "./shuffle";
import { Tex } from "./Tex";
import { btnOption, btnPrimary, cardCls, Eyebrow, Letter, MissMark, quietFocus, Rise, Tick } from "./ui";

/** 1 guessing · 2 fairly sure · 3 certain — the scale stored on Attempt.confidence. */
export type Confidence = 1 | 2 | 3;

export interface DiagnosticAnswer {
  optionId: string;
  correct: boolean;
  confidence: Confidence;
  /** Milliseconds from first paint of the item to the reveal. */
  ms: number;
  misconception?: string;
}

export interface DiagnosticWithConfidenceProps {
  item: DiagnosticItem;
  onAnswer: (answer: DiagnosticAnswer) => void;
  /** Rendered as a Next button after the reveal. */
  onNext?: () => void;
  /** "2 of 5" in the eyebrow. */
  index?: number;
  total?: number;
  /** Shuffle the options (seeded on the item, so the order is stable). Default true. */
  shuffle?: boolean;
}

export const CONFIDENCE_LEVELS: Array<{ value: Confidence; label: string; hint: string }> = [
  { value: 1, label: "Guessing", hint: "I would not bet on it" },
  { value: 2, label: "Fairly sure", hint: "Probably right" },
  { value: 3, label: "Certain", hint: "I would bet on it" },
];

function ConfidenceDots({ level, active }: { level: Confidence; active: boolean }) {
  return (
    <span aria-hidden className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <span key={i} className={clsx("h-2 w-2 rounded-full", i <= level ? (active ? "bg-ink" : "bg-ink-3") : "bg-line-2")} />
      ))}
    </span>
  );
}

export function DiagnosticWithConfidence({ item, onAnswer, onNext, index, total, shuffle = true }: DiagnosticWithConfidenceProps) {
  const options = useMemo<McqOption[]>(() => (shuffle ? seededShuffle(item.options, `${item.id}|${item.options.map((o) => o.id).join(",")}`) : item.options), [item, shuffle]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [revealed, setRevealed] = useState(false);
  const startedAt = useRef<number | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = performance.now();
    setChosen(null);
    setConfidence(null);
    setRevealed(false);
  }, [item.id]);

  useEffect(() => {
    if (revealed) revealRef.current?.focus();
  }, [revealed]);

  const chosenOption = options.find((o) => o.id === chosen) ?? null;
  const correctOption = options.find((o) => o.correct) ?? null;
  const ready = chosen !== null && confidence !== null;

  const reveal = () => {
    if (!ready || revealed || !chosenOption || confidence === null) return;
    const ms = Math.round(performance.now() - (startedAt.current ?? performance.now()));
    setRevealed(true);
    const answer: DiagnosticAnswer = { optionId: chosenOption.id, correct: chosenOption.correct, confidence, ms };
    if (chosenOption.misconception) answer.misconception = chosenOption.misconception;
    onAnswer(answer);
  };

  const onOptionsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (revealed) return;
    const idx = optionRefs.current.findIndex((b) => b === document.activeElement);
    const n = options.length;
    const move = (to: number) => {
      optionRefs.current[((to % n) + n) % n]?.focus();
      e.preventDefault();
    };
    if (e.key === "ArrowDown" || e.key === "ArrowRight") return move(idx + 1);
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") return move(idx - 1);
    if (/^[a-zA-Z]$/.test(e.key)) {
      const i = e.key.toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < n) {
        setChosen(options[i].id);
        optionRefs.current[i]?.focus();
        e.preventDefault();
      }
    }
  };

  const confidentMiss = revealed && chosenOption && !chosenOption.correct && confidence === 3;
  const luckyGuess = revealed && chosenOption?.correct && confidence === 1;

  return (
    <section className={cardCls} aria-labelledby={`dx-${item.id}-stem`}>
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>{index !== undefined && total !== undefined ? `Check · ${index} of ${total}` : "Check"}</Eyebrow>
      </div>
      <h3 id={`dx-${item.id}-stem`} className="mt-2 text-[17px] font-medium leading-snug">
        <Tex text={item.stem} />
      </h3>
      {item.figure && <Figure spec={item.figure} />}

      <div role="radiogroup" aria-label="Your answer" className="mt-4 grid gap-2 sm:grid-cols-2" onKeyDown={onOptionsKey}>
        {options.map((o, i) => {
          const active = chosen === o.id;
          const showCorrect = revealed && o.correct;
          const showMiss = revealed && active && !o.correct;
          return (
            <button
              key={o.id}
              ref={(el) => {
                optionRefs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={revealed}
              tabIndex={revealed ? -1 : i === 0 || active ? 0 : -1}
              onClick={() => setChosen(o.id)}
              className={clsx(
                btnOption,
                active ? "border-ink shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line-3",
                revealed && !active && !o.correct && "opacity-60",
                showCorrect && "border-ink",
              )}
            >
              <Letter active={active}>{optionLetter(i)}</Letter>
              <span className="flex-1">
                <Tex text={o.text} />
                {revealed && (showCorrect || showMiss) && (
                  <span className="mt-1 flex items-center gap-1.5 text-meta font-medium text-ink-2">
                    {showCorrect ? <Tick size={14} label="" /> : <MissMark size={14} label="" />}
                    {showCorrect ? (active ? "Your answer · correct" : "Correct answer") : "Your answer"}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <fieldset className="mt-4" disabled={revealed}>
        <legend className="text-meta font-medium text-ink-2">How sure are you?</legend>
        <div role="radiogroup" aria-label="Confidence" className="mt-1.5 grid grid-cols-3 gap-2">
          {CONFIDENCE_LEVELS.map((c) => {
            const active = confidence === c.value;
            return (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setConfidence(c.value)}
                className={clsx(
                  "tap tap-lg flex flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border px-2 py-2 text-meta font-medium transition-[transform,border-color] duration-150 hover:bg-surface-2 active:scale-[0.98] disabled:pointer-events-none",
                  active ? "border-ink shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line-3",
                )}
              >
                <ConfidenceDots level={c.value} active={active} />
                {c.label}
                <span className="sr-only"> — {c.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {!revealed && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className={btnPrimary} disabled={!ready} onClick={reveal}>
            Reveal
          </button>
          <span className="text-meta text-ink-2">{ready ? "Both chosen — reveal when ready" : chosen === null ? "Choose an answer, then how sure you are" : "Now say how sure you are"}</span>
        </div>
      )}

      {revealed && chosenOption && (
        <Rise as="div" className="mt-4 border-t border-line pt-4">
          <div ref={revealRef} tabIndex={-1} role="status" aria-live="polite" className={clsx("flex items-start gap-3", quietFocus)}>
            {chosenOption.correct ? <Tick size={24} /> : <MissMark size={24} label="Not this one" />}
            <div className="min-w-0 flex-1 text-ui">
              <p className="font-medium">{chosenOption.correct ? "That's the one." : "Not this one."}</p>
              <p className="mt-1 text-ink">
                <Tex text={chosenOption.feedback} />
              </p>
              {!chosenOption.correct && correctOption && (
                <p className="mt-2 text-ink-2">
                  Correct: <Tex text={correctOption.text} /> — <Tex text={correctOption.feedback} />
                </p>
              )}
              {confidentMiss && <p className="mt-2 text-meta text-ink-2">You were certain, so this comes back in two days and again in a week until it sticks.</p>}
              {luckyGuess && <p className="mt-2 text-meta text-ink-2">A guess that landed. It comes back soon so you know it rather than hope it.</p>}
            </div>
          </div>
          {onNext && (
            <div className="mt-4">
              <button type="button" className={btnPrimary} onClick={onNext}>
                Next <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          )}
        </Rise>
      )}
    </section>
  );
}
