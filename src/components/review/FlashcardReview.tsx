"use client";

/**
 * A flashcard met again in the review inbox (the independent review of 27 Sep 2026, item 2). A card graded in Flashcards
 * (fc.*) lives only in its unit's deck, and until now the inbox could not show one: it said the item had been withdrawn,
 * offered Skip, and the card stayed due. Here it is the same card she studied: the front (with its drawing and hint), the
 * answer on a tap, the key words the scheme rewards, and three grades at thumb height, none accented, each with the
 * return it will store (src/lib/review/returns.ts). The inbox records the grade exactly as it records a recall prompt.
 */
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Md } from "@/components/items";
import { btnCheck, cardCls, Eyebrow } from "@/components/items/ui";
import type { Flashcard } from "@/lib/content/deck-schema";
import type { ReviewGrade } from "@/lib/srs/scheduler";
import { sanitizeInlineSvg } from "@/lib/ux/svg";

type Grade = Extract<ReviewGrade, "again" | "good" | "easy">;

const KIND_LABEL: Record<Flashcard["kind"], string> = {
  definition: "Definition",
  formula: "Formula",
  fact: "Fact",
  method: "Method",
  equation: "Equation",
  test: "Test",
  colour: "Colour",
  trap: "Trap",
  cloze: "Fill the gap",
  unit: "Unit",
  keyword: "Key word",
  example: "Quick example",
};

const GRADES: Array<{ grade: Grade; label: string; hint: string }> = [
  { grade: "again", label: "Again", hint: "Did not get it" },
  { grade: "good", label: "Good", hint: "Got it with effort" },
  { grade: "easy", label: "Easy", hint: "Instant" },
];

export interface FlashcardReviewProps {
  card: Flashcard;
  /** The return each grade stores, in words ("1 day", "3 wk"); left out, no return is printed. */
  intervals?: Record<Grade, string>;
  onGrade: (grade: Grade) => void;
}

export function FlashcardReview({ card, intervals, onGrade }: FlashcardReviewProps) {
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState<Grade | null>(null);
  const firstGrade = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setRevealed(false);
    setGraded(null);
  }, [card.id]);

  // Once the answer is showing, the first grade takes focus, as the prompt's review does.
  useEffect(() => {
    if (revealed && !graded) firstGrade.current?.focus();
  }, [revealed, graded]);

  const grade = (g: Grade) => {
    if (graded) return;
    setGraded(g);
    onGrade(g);
  };

  return (
    <section className={cardCls} aria-label={`${KIND_LABEL[card.kind]} card`} data-review-kind="flashcard">
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>Flashcard</Eyebrow>
        <span className="text-meta text-ink-2">
          {KIND_LABEL[card.kind]}
          {card.tier === "H" ? " · Higher" : ""}
        </span>
      </div>
      {card.image && (
        <div
          className="mt-3 text-ink [&>svg]:h-auto [&>svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: sanitizeInlineSvg(card.image.svg) }}
          aria-label={card.image.alt}
          role="img"
        />
      )}
      <div className="mt-2 text-[19px] font-medium leading-snug">
        <Md md={card.front} />
      </div>
      {card.hint && !revealed && <p className="mt-2 text-meta text-ink-2">Hint: {card.hint}</p>}

      {!revealed ? (
        <div className="mt-4">
          <button type="button" className={btnCheck} aria-expanded={false} onClick={() => setRevealed(true)}>
            Show the answer
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <div className="rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 py-3">
            <p className="text-meta font-medium text-ink-2">Answer</p>
            <div className="mt-1 text-[16px] leading-relaxed">
              <Md md={card.back} />
            </div>
            {card.keyWords && card.keyWords.length > 0 && <p className="mt-2 text-meta text-ink-2">Key words the scheme rewards: {card.keyWords.join(", ")}.</p>}
          </div>
          <div role="group" aria-label="How did it go?" className="mt-3 grid grid-cols-3 gap-2">
            {GRADES.map((g, i) => {
              const chosen = graded === g.grade;
              return (
                <button
                  key={g.grade}
                  ref={i === 0 ? firstGrade : undefined}
                  type="button"
                  disabled={graded !== null}
                  aria-pressed={chosen}
                  title={g.hint}
                  onClick={() => grade(g.grade)}
                  className={clsx(
                    "tap flex min-h-[52px] flex-col items-center justify-center rounded-[var(--radius-sm)] border px-2 py-1.5 text-ui font-semibold transition-transform duration-150 active:scale-[0.98] disabled:pointer-events-none",
                    chosen ? "border-ink bg-ink text-surface" : "border-line-3 bg-surface hover:bg-surface-2",
                    graded !== null && !chosen && "opacity-50",
                  )}
                >
                  {g.label}
                  {intervals && <span className={clsx("tnum text-meta font-normal", chosen ? "text-surface/80" : "text-ink-2")}>{intervals[g.grade]}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
