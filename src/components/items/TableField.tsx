"use client";

/**
 * The inputs for `table` answers ("complete the table"): the figure above shows the table; here every cell the
 * marker expects has its own input, named the way she counts the table ("Row 2, column 3": row 1 is the first row
 * under the headings, column 1 the left-hand column). A numeric cell gets a number input, a text cell a text input.
 * Check waits until every cell has something in it. The response is submitted as JSON for src/lib/marking/table.ts.
 */
import { useId, useMemo, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import type { AnswerSpec } from "@/lib/content/schema";
import { cellLabel, formatTableResponse } from "@/lib/marking/table";
import { btnCheck, fieldCls, StickyBar } from "./ui";

export type TableSpec = Extract<AnswerSpec, { kind: "table" }>;

export function TableField({
  spec,
  disabled,
  onSubmit,
  submitLabel,
  label,
  calcTag,
  barExtra,
}: {
  spec: TableSpec;
  disabled: boolean;
  onSubmit: (raw: string) => void;
  submitLabel: string;
  label?: string;
  calcTag: ReactNode;
  barExtra?: ReactNode;
}) {
  // Reading order, whichever order the author listed the cells in.
  const cells = useMemo(() => [...spec.cells].sort((a, b) => a.row - b.row || a.col - b.col), [spec]);
  const [values, setValues] = useState<string[]>(() => cells.map(() => ""));
  const hintId = useId();

  const total = cells.length;
  const filled = values.filter((v) => v.trim() !== "").length;
  const complete = filled === total;

  const setAt = (i: number, v: string) => setValues((vs) => vs.map((x, j) => (j === i ? v : x)));
  const submit = () => {
    if (disabled || !complete) return;
    onSubmit(formatTableResponse({ cells: cells.map((c, i) => ({ row: c.row, col: c.col, value: (values[i] ?? "").trim() })) }));
  };

  const hint = total === 1 ? (complete ? "Enter to check" : "Fill in the cell") : complete ? "Every cell filled · Enter to check" : `${filled} of ${total} cells filled`;

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p id={hintId} className="text-meta text-ink-2">
        {label ?? "Complete the table"}: fill in each cell named below. Row 1 is the first row under the headings; column 1 is the left-hand column.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {cells.map((cell, i) => {
          const numeric = typeof cell.value === "number";
          // A number input rather than a decimal inputMode: a table of quadratic values needs the minus key, which the
          // phone's decimal pad does not have.
          return (
            <label key={`${cell.row}-${cell.col}`} className={clsx("text-meta text-ink-2", numeric ? "w-[148px] shrink-0" : "min-w-[240px] flex-1")}>
              {cellLabel(cell)}
              {numeric ? (
                <input
                  type="number"
                  step="any"
                  className={`${fieldCls} mt-1`}
                  value={values[i] ?? ""}
                  onChange={(e) => setAt(i, e.target.value)}
                  disabled={disabled}
                  autoComplete="off"
                  aria-describedby={hintId}
                />
              ) : (
                <input
                  type="text"
                  className={`${fieldCls} mt-1`}
                  value={values[i] ?? ""}
                  onChange={(e) => setAt(i, e.target.value)}
                  disabled={disabled}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-describedby={hintId}
                />
              )}
            </label>
          );
        })}
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
