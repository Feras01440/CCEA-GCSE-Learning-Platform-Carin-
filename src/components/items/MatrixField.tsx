"use client";

/**
 * The inputs for `matrix` answers (Further Maths Unit 1: sums, differences, scalar multiples, products
 * and inverses of 2×2 matrices). The matrix is laid out as it is written — a rows × cols grid of small
 * inputs inside a pair of brackets — so the entries she works out go where they belong, and a transposed
 * answer is visible before she checks it. Each input is named "Row 1, column 2" for a screen reader.
 *
 * Entries that are all plain numbers get a number input, which is the keyboard with a minus key (the
 * decimal pad has none, and matrix entries are often negative); a spec with a fraction or a letter in it
 * gets a text input instead, so "1/2" and "2a" can be typed at all. No maths key strip: an entry is one
 * number or one short expression.
 *
 * Check waits until every entry has something in it. The response is the plain grid ("1 2; 3 4"), which
 * is what `parseMatrix` in src/lib/marking/matrix.ts reads back.
 */
import { useId, useMemo, useState, type ReactNode } from "react";
import type { AnswerSpec } from "@/lib/content/schema";
import { entryLabel, formatMatrixResponse } from "@/lib/marking/matrix";
import { btnCheck, fieldCls, StickyBar } from "./ui";

export type MatrixSpec = Extract<AnswerSpec, { kind: "matrix" }>;

/** Every entry of the spec is a plain number, so the number keyboard is enough. */
const PLAIN_NUMBER = /^-?\d+(?:\.\d+)?$/;

export function MatrixField({
  spec,
  disabled,
  onSubmit,
  submitLabel,
  label,
  calcTag,
  barExtra,
}: {
  spec: MatrixSpec;
  disabled: boolean;
  onSubmit: (raw: string) => void;
  submitLabel: string;
  label?: string;
  calcTag: ReactNode;
  barExtra?: ReactNode;
}) {
  const rows = Math.max(1, spec.rows);
  const cols = Math.max(1, spec.cols);
  const total = rows * cols;
  const [values, setValues] = useState<string[]>(() => Array.from({ length: total }, () => ""));
  // A number in front of the brackets, as CCEA prints an inverse (1/5 outside, integers inside): multiplied in by the marker.
  const [scalar, setScalar] = useState("");
  const hintId = useId();
  const scalarId = useId();

  const filled = values.filter((v) => v.trim() !== "").length;
  const complete = filled === total;

  const setAt = (i: number, v: string) => setValues((vs) => vs.map((x, j) => (j === i ? v : x)));
  const submit = () => {
    if (disabled || !complete) return;
    const grid = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => (values[r * cols + c] ?? "").trim()));
    const text = formatMatrixResponse(grid);
    onSubmit(scalar.trim() ? `${scalar.trim()} [${text}]` : text);
  };

  const hint = complete ? "Every entry filled · Enter to check" : `${filled} of ${total} entries filled`;

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p id={hintId} className="text-meta text-ink-2">
        {label ?? "Write the matrix"}: one entry in each place, reading across the rows.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label htmlFor={scalarId} className="flex items-center gap-2 text-meta text-ink-2">
          <span>In front of the brackets (optional)</span>
          <input
            id={scalarId}
            type="text"
            inputMode="text"
            placeholder="1/5"
            className={`${fieldCls} w-[4.5rem] text-center`}
            value={scalar}
            onChange={(e) => setScalar(e.target.value)}
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </label>
      <div
        role="group"
        aria-describedby={hintId}
        aria-label={label ?? `Matrix with ${rows} rows and ${cols} columns`}
        className="inline-flex items-stretch gap-2 rounded-[6px] border-x-2 border-line-2 px-2 py-2"
      >
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 5.5rem))` }}>
          {Array.from({ length: total }, (_, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const name = entryLabel({ row, col });
            return (
              <input
                key={name}
                type="text"
                inputMode="text"
                aria-label={name}
                className={`${fieldCls} text-center`}
                value={values[i] ?? ""}
                onChange={(e) => setAt(i, e.target.value)}
                disabled={disabled}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            );
          })}
        </div>
      </div>
      </div>
      <StickyBar hint={hint}>
        <button type="submit" className={btnCheck} disabled={disabled || !complete}>
          {submitLabel}
        </button>
        {calcTag}
        {barExtra}
      </StickyBar>
    </form>
  );
}
