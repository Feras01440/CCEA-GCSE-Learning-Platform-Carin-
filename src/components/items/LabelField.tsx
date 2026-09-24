"use client";

/**
 * The selects for `label` answers ("label the diagram"): the figure above carries the diagram; here every target is
 * listed by name — "(i)", "(ii)" … as the stem refers to them, or "Label 1", "Label 2" … down the figure — with a
 * select drawn from the word bank plus "—" for not chosen yet. Check waits until every target has a name. The
 * response is submitted as JSON for src/lib/marking/label.ts.
 */
import { useId, useMemo, useState, type ReactNode } from "react";
import type { AnswerSpec } from "@/lib/content/schema";
import { formatLabelResponse, labelBank, namedTargets } from "@/lib/marking/label";
import { btnCheck, fieldCls, StickyBar } from "./ui";

export type LabelSpec = Extract<AnswerSpec, { kind: "label" }>;

export function LabelField({
  spec,
  disabled,
  onSubmit,
  submitLabel,
  label,
  calcTag,
  barExtra,
}: {
  spec: LabelSpec;
  disabled: boolean;
  onSubmit: (raw: string) => void;
  submitLabel: string;
  label?: string;
  calcTag: ReactNode;
  barExtra?: ReactNode;
}) {
  const targets = useMemo(() => namedTargets(spec), [spec]);
  const bank = useMemo(() => labelBank(spec), [spec]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const hintId = useId();

  const total = targets.length;
  const chosen = targets.filter(({ target }) => (labels[target.id] ?? "") !== "").length;
  const complete = chosen === total;
  // Targets numbered down the figure need a word on how they are counted.
  const numbered = targets.some(({ name }) => name.startsWith("Label "));

  const submit = () => {
    if (disabled || !complete) return;
    const out: Record<string, string> = {};
    for (const { target } of targets) {
      const v = labels[target.id];
      if (v) out[target.id] = v;
    }
    onSubmit(formatLabelResponse({ labels: out }));
  };

  const hint = total === 1 ? (complete ? "Name chosen" : "Choose the name") : complete ? "Every label chosen" : `${chosen} of ${total} labelled`;

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p id={hintId} className="text-meta text-ink-2">
        {label ?? "Label the diagram"}: choose a name from the word bank for each label{numbered ? ", counted from the top of the diagram down" : ""}.
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {targets.map(({ target, name }) => (
          <label key={target.id} className="text-meta text-ink-2">
            {name}
            <select
              className={`${fieldCls} mt-1`}
              value={labels[target.id] ?? ""}
              onChange={(e) => setLabels((l) => ({ ...l, [target.id]: e.target.value }))}
              disabled={disabled}
              aria-describedby={hintId}
            >
              <option value="">—</option>
              {bank.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ))}
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
