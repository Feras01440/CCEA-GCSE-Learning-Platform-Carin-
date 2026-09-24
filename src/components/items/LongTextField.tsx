"use client";

/**
 * The textarea for `text-long` answers — the six-mark quality-of-written-communication questions.
 * She writes prose, not a key word, so the field gives her room (and the phone's own keyboard), a live
 * word count, and a Check that waits until there is enough to band: the author's `minWords` when set,
 * otherwise twenty words. Enter makes a new line; Ctrl / Cmd + Enter checks. The raw text is submitted
 * as typed — `mark.ts` reads it for evidence and the decision panel in QuestionRunner does the banding.
 */
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { qwcWordCount, QWC_DEFAULT_MIN_WORDS, type LongTextSpec } from "@/lib/marking/qwc";
import { btnCheck, fieldCls, StickyBar } from "./ui";

export type { LongTextSpec };

export function LongTextField({
  spec,
  disabled,
  onSubmit,
  submitLabel,
  label,
  calcTag,
  barExtra,
  autoFocus,
}: {
  spec: LongTextSpec;
  disabled: boolean;
  onSubmit: (raw: string) => void;
  submitLabel: string;
  label?: string;
  calcTag: ReactNode;
  barExtra?: ReactNode;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const fieldId = useId();
  const hintId = useId();

  const minWords = spec.minWords ?? QWC_DEFAULT_MIN_WORDS;
  const words = qwcWordCount(value);
  const enough = words >= minWords;

  const submit = () => {
    if (disabled || !enough) return;
    onSubmit(value);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  const hint = enough
    ? `${words} words · Ctrl+Enter to check`
    : `${words} of ${minWords} words`;

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor={fieldId} className="text-meta font-medium text-ink-2">
        {label ?? "Your answer"}
      </label>
      <p id={hintId} className="mt-0.5 text-meta text-ink-2">
        Full sentences, with the specialist terms. {spec.minWords ? `Aim for at least ${spec.minWords} words. ` : ""}After Check you place it on the band descriptors yourself.
      </p>
      <textarea
        id={fieldId}
        rows={8}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        aria-describedby={hintId}
        placeholder="Write your answer in full sentences"
        // scroll-margin keeps the field clear of the sticky Check bar when the browser scrolls it into view (WCAG 2.4.11).
        className={`${fieldCls} mt-1.5 scroll-mb-28 font-[inherit] leading-relaxed`}
        autoComplete="off"
        autoCapitalize="sentences"
        spellCheck
      />
      <StickyBar hint={hint}>
        <button type="submit" className={btnCheck} disabled={disabled || !enough}>
          {submitLabel}
        </button>
        {calcTag}
        {barExtra}
      </StickyBar>
    </form>
  );
}
