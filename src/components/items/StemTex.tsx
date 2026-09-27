"use client";

/**
 * A question's words with the maths it asks about on its own line at the display size, as a gate sets its stem (art
 * direction v2 §8.4; lesson-plan.ts gateStem, the rule Read's and Slides' gates share): "Simplify fully", then the
 * fraction at --fs-stem-maths, then any words after it. Inline, the fraction was set at scriptstyle in the sentence: in
 * a find-the-mistake stem at 11.55 px with its powers at 8.25 px, in a retrieval prompt at 12.32 px and 8.8 px (the trial
 * audit's READ-18, measured on build 8 at 390). Nothing is reworded; a question whose maths does not end its sentence
 * (or holds no stacked fraction) is left as one paragraph, as before.
 */
import { gateStem } from "@/components/topic/lesson-plan";
import { Math as MathTex } from "@/lib/math/Math";
import { Tex } from "./Tex";

export function StemTex({ text, className }: { text: string; className?: string }) {
  const stem = gateStem(text);
  if (stem.maths === null)
    return (
      <p className={className}>
        <Tex text={text} />
      </p>
    );
  return (
    <div className={className}>
      {stem.lead && (
        <p>
          <Tex text={stem.lead} />
        </p>
      )}
      <div
        data-stem-maths
        className="py-1 text-[length:var(--fs-stem-maths)] text-ink [&_.katex-display]:![font-size:1em] [&_.katex-display]:!m-0 [&_.katex-display]:!py-0 [&_.katex-display]:!text-left [&_.katex-display>.katex]:!text-left"
        style={{ marginTop: stem.lead ? "var(--gap-stem-maths)" : undefined }}
      >
        <MathTex tex={stem.maths} display />
      </div>
      {stem.tail && (
        <p style={{ marginTop: "var(--gap-stem-maths)" }}>
          <Tex text={stem.tail} />
        </p>
      )}
    </div>
  );
}
