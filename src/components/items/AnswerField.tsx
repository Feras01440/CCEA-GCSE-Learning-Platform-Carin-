"use client";

/**
 * The answer field she touches hundreds of times. One component, many surfaces:
 * numeric / algebraic (text input + maths key strip), physics equation ("equation line
 * first": the substitution line opens only once the equation matches the vault), chemistry
 * equations (one line + a chemistry strip), mcq (A/B/C/D buttons, Enter submits), short
 * text, a list to put in order (also a chain of working, `steps`), and, in their own files,
 * the drawn kinds (transformation grid, plots, box plot, region), a table's cells, a
 * matrix's entries, a diagram's labels and the six-mark written-communication textarea. Everything is ≥ 44 px,
 * keyboard-operable, and the Check button stays above the mobile keyboard.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Ban, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { Reorder } from "motion/react";
import { tap } from "@/lib/ux/haptics";
import { clsx } from "clsx";
import type { AnswerSpec, McqOption } from "@/lib/content/schema";
import { markEquation } from "./equation-marking";
import { optionLetter } from "./format";
import { seededShuffle } from "./shuffle";
import { Tex } from "./Tex";
import { TransformationField } from "./TransformationField";
import { PlotField } from "./PlotField";
import { BoxPlotField } from "./BoxPlotField";
import { RegionField } from "./RegionField";
import { TableField } from "./TableField";
import { MatrixField } from "./MatrixField";
import { LabelField } from "./LabelField";
import { LongTextField } from "./LongTextField";
import { stepsAsOrder } from "./order-marking";
import { btnCheck, btnOption, btnQuiet, fieldCls, Letter, Rise, StickyBar, Tick } from "./ui";

export interface AnswerFieldProps {
  spec: AnswerSpec;
  /** Whether a calculator is allowed on this item; shown as a small tag when given. */
  calculator?: boolean;
  disabled?: boolean;
  /** Raw response: the typed text, the option id(s) joined by spaces, or "equation\nworking". */
  onSubmit: (raw: string) => void;
  /** Accessible label for the field. */
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  defaultValue?: string;
  /** Extra content rendered inside the sticky bar, left of the hint. */
  barExtra?: ReactNode;
  /** Content rendered under the field and above the Check bar (the working ladder's box). */
  underField?: ReactNode;
  /** The part's stem; the transformation grid reads its mirror line or centre from it. */
  prompt?: string;
}

export interface StripKey {
  label: string;
  insert: string;
  /** Accessible name. */
  name: string;
  /** Caret moves back this many characters after inserting (for "( )"). */
  back?: number;
}

export const MATHS_KEYS: StripKey[] = [
  { label: "/", insert: "/", name: "fraction bar" },
  { label: "√", insert: "√", name: "square root" },
  { label: "^", insert: "^", name: "to the power" },
  { label: "π", insert: "π", name: "pi" },
  { label: "×", insert: "×", name: "times" },
  { label: "−", insert: "−", name: "minus" },
  { label: "≤", insert: "≤", name: "less than or equal to" },
  { label: "≥", insert: "≥", name: "greater than or equal to" },
  { label: "( )", insert: "()", name: "brackets", back: 1 },
];

export const PHYSICS_KEYS: StripKey[] = [
  { label: "=", insert: " = ", name: "equals" },
  { label: "×", insert: " × ", name: "times" },
  { label: "/", insert: "/", name: "divided by" },
  { label: "²", insert: "²", name: "squared" },
  { label: "√", insert: "√", name: "square root" },
  { label: "Δ", insert: "Δ", name: "delta" },
  { label: "λ", insert: "λ", name: "lambda" },
  { label: "ρ", insert: "ρ", name: "rho" },
  { label: "( )", insert: "()", name: "brackets", back: 1 },
];

export const CHEM_KEYS: StripKey[] = [
  { label: "→", insert: " → ", name: "arrow" },
  { label: "⇌", insert: " ⇌ ", name: "reversible arrow" },
  { label: "₂", insert: "₂", name: "subscript 2" },
  { label: "₃", insert: "₃", name: "subscript 3" },
  { label: "₄", insert: "₄", name: "subscript 4" },
  { label: "²", insert: "²", name: "superscript 2, for a charge of 2" },
  { label: "³", insert: "³", name: "superscript 3, for a charge of 3" },
  { label: "⁺", insert: "⁺", name: "positive charge" },
  { label: "⁻", insert: "⁻", name: "negative charge" },
  { label: "(s)", insert: "(s)", name: "solid" },
  { label: "(l)", insert: "(l)", name: "liquid" },
  { label: "(g)", insert: "(g)", name: "gas" },
  { label: "(aq)", insert: "(aq)", name: "aqueous" },
];

type TextControl = HTMLInputElement | HTMLTextAreaElement;

/** Inserts text at the caret of a controlled input and restores focus without closing the mobile keyboard. */
export function insertAtCaret(el: TextControl | null, value: string, key: StripKey, setValue: (v: string) => void) {
  const start = el?.selectionStart ?? value.length;
  const end = el?.selectionEnd ?? start;
  const next = value.slice(0, start) + key.insert + value.slice(end);
  setValue(next);
  const caret = start + key.insert.length - (key.back ?? 0);
  requestAnimationFrame(() => {
    if (!el) return;
    el.focus();
    try {
      el.setSelectionRange(caret, caret);
    } catch {
      // Some input types refuse selection ranges; focus alone is fine.
    }
  });
}

/** The maths key strip: buttons that insert symbols the phone keyboard hides. */
export function KeyStrip({ keys, onKey, disabled, label = "Maths symbols" }: { keys: readonly StripKey[]; onKey: (k: StripKey) => void; disabled?: boolean; label?: string }) {
  return (
    <div role="toolbar" aria-label={label} className="-mx-1 flex gap-1 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
      {keys.map((k) => (
        <button
          key={k.label}
          type="button"
          aria-label={k.name}
          title={k.name}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onKey(k)}
          className="tap shrink-0 rounded-[var(--radius-sm)] border border-line-2 bg-surface px-3 text-[17px] text-ink hover:bg-surface-2 active:scale-[0.97] disabled:opacity-40"
        >
          {k.label}
        </button>
      ))}
    </div>
  );
}

/**
 * A single maths line with its key strip. Used by AnswerField and reused by items that
 * need a free line (a corrected line, a step of working).
 */
export function MathsLineInput({
  value,
  onChange,
  onEnter,
  keys = MATHS_KEYS,
  disabled,
  placeholder,
  label,
  id,
  autoFocus,
  multiline = false,
  suffix,
  describedBy,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  keys?: readonly StripKey[];
  disabled?: boolean;
  placeholder?: string;
  label: string;
  id?: string;
  autoFocus?: boolean;
  multiline?: boolean;
  /** A unit or hint shown inside the field, right-aligned. */
  suffix?: string;
  describedBy?: string;
}) {
  const ref = useRef<TextControl>(null);
  const autoId = useId();
  const fieldId = id ?? autoId;
  const onKeyDown = (e: KeyboardEvent<TextControl>) => {
    if (e.key === "Enter" && !(multiline && e.shiftKey)) {
      e.preventDefault();
      onEnter?.();
    }
  };
  const shared = {
    id: fieldId,
    value,
    disabled,
    placeholder,
    autoFocus,
    "aria-describedby": describedBy,
    autoComplete: "off" as const,
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false,
    onKeyDown,
    // scroll-margin keeps a focused field clear of the sticky Check bar when the browser scrolls it into view (WCAG 2.4.11).
    className: clsx(fieldCls, "scroll-mb-28 font-[inherit]", suffix && "pr-16"),
  };
  return (
    <div>
      <label htmlFor={fieldId} className="sr-only">
        {label}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea ref={ref as React.RefObject<HTMLTextAreaElement>} rows={2} {...shared} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input ref={ref as React.RefObject<HTMLInputElement>} type="text" inputMode="text" enterKeyHint="done" {...shared} onChange={(e) => onChange(e.target.value)} />
        )}
        {suffix && (
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-meta text-ink-2">
            {suffix}
          </span>
        )}
      </div>
      <KeyStrip keys={keys} disabled={disabled} onKey={(k) => insertAtCaret(ref.current, value, k, onChange)} />
    </div>
  );
}

/**
 * Order items: a list she can drag, or nudge with arrows (keyboard-operable, ≥ 44 px rows). Authored lists
 * usually arrive in the correct order, so the first arrangement is a seeded shuffle that is stable across
 * server and client renders and is never the authored order. The raw response is the item indices, top first.
 */
function OrderField({
  spec,
  disabled,
  onSubmit,
  submitLabel,
  label,
  calcTag,
  barExtra,
}: {
  spec: Extract<AnswerSpec, { kind: "order" }>;
  disabled: boolean;
  onSubmit: (raw: string) => void;
  submitLabel: string;
  label?: string;
  calcTag: ReactNode;
  barExtra?: ReactNode;
}) {
  const initial = useMemo(() => seededShuffle(spec.items.map((_, i) => i), spec.items.join("\u0001")), [spec]);
  const [order, setOrder] = useState<number[]>(initial);
  const hintId = useId();

  const move = (pos: number, dir: -1 | 1) => {
    const to = pos + dir;
    if (disabled || to < 0 || to >= order.length) return;
    tap();
    setOrder((o) => {
      const next = [...o];
      [next[pos], next[to]] = [next[to]!, next[pos]!];
      return next;
    });
  };
  const submit = () => {
    if (!disabled) onSubmit(order.join(","));
  };

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p id={hintId} className="text-meta text-ink-2">
        {label ?? "Put these in order"}: drag an item, or use its arrows. The top item comes first.
      </p>
      <Reorder.Group as="ol" axis="y" values={order} onReorder={(v) => !disabled && setOrder(v)} className="mt-2 space-y-2" aria-describedby={hintId}>
        {order.map((itemIdx, pos) => (
          <Reorder.Item
            key={itemIdx}
            value={itemIdx}
            as="li"
            dragListener={!disabled}
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2"
          >
            <span className="tnum w-5 shrink-0 text-meta text-ink-2" aria-hidden>
              {pos + 1}
            </span>
            <span className="min-w-0 flex-1 text-ui">
              <Tex text={spec.items[itemIdx]!} />
            </span>
            <button type="button" className={btnQuiet} aria-label={`Move item ${pos + 1} up`} disabled={disabled || pos === 0} onClick={() => move(pos, -1)}>
              <ChevronUp size={18} aria-hidden />
            </button>
            <button
              type="button"
              className={btnQuiet}
              aria-label={`Move item ${pos + 1} down`}
              disabled={disabled || pos === order.length - 1}
              onClick={() => move(pos, 1)}
            >
              <ChevronDown size={18} aria-hidden />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <StickyBar hint="Top is first">
        <button type="submit" className={btnCheck} disabled={disabled}>
          {submitLabel}
        </button>
        {calcTag}
        {barExtra}
      </StickyBar>
    </form>
  );
}

function CalculatorTag({ allowed }: { allowed: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-meta text-ink-2">
      {allowed ? <Calculator size={14} aria-hidden /> : <Ban size={14} aria-hidden />}
      {allowed ? "Calculator allowed" : "No calculator"}
    </span>
  );
}

function expectsLongText(spec: Extract<AnswerSpec, { kind: "text" }>): boolean {
  const longest = Math.max(0, ...spec.accepted.map((a) => a.length));
  return longest > 48 || spec.keyWords.length >= 2;
}

function unitSuffix(spec: AnswerSpec): string | undefined {
  if (spec.kind !== "numeric" || !spec.unit) return undefined;
  return spec.unitRequired ? `in ${spec.unit}` : spec.unit;
}

export function AnswerField(props: AnswerFieldProps) {
  const { spec, calculator, disabled = false, onSubmit, submitLabel = "Check", autoFocus, defaultValue = "", barExtra, underField } = props;
  const [value, setValue] = useState(defaultValue);
  const [working, setWorking] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const hintId = useId();
  // A chain of working to put in order is the order field over the authored steps (the field shuffles them).
  const stepsOrder = useMemo(() => (spec.kind === "steps" ? stepsAsOrder(spec) : null), [spec]);

  const physics = spec.kind === "equation" && spec.kindOf === "physics";
  const equationVerdict = useMemo(() => (spec.kind === "equation" && value.trim() ? markEquation(value, spec) : null), [spec, value]);
  const equationOk = equationVerdict?.correct === true;

  const submit = useCallback(() => {
    if (disabled) return;
    if (spec.kind === "mcq") {
      if (selected.length > 0) onSubmit(selected.join(" "));
      return;
    }
    if (spec.kind === "equation" && physics) {
      if (value.trim()) onSubmit(working.trim() ? `${value.trim()}\n${working.trim()}` : value.trim());
      return;
    }
    if (value.trim()) onSubmit(value);
  }, [disabled, spec.kind, physics, selected, value, working, onSubmit]);

  const canSubmit = spec.kind === "mcq" ? selected.length > 0 : value.trim().length > 0;
  const calcTag = calculator === undefined ? null : <CalculatorTag allowed={calculator} />;

  // ---- mcq -----------------------------------------------------------------------------
  if (spec.kind === "mcq") {
    return (
      <McqField
        spec={spec}
        disabled={disabled}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitLabel={submitLabel}
        label={props.label}
        canSubmit={canSubmit}
        calcTag={calcTag}
        barExtra={barExtra}
        underField={underField}
      />
    );
  }

  // ---- order (arrange the items) ----------------------------------------------------------
  if (spec.kind === "order") {
    return (
      <OrderField spec={spec} disabled={disabled} onSubmit={onSubmit} submitLabel={submitLabel} label={props.label} calcTag={calcTag} barExtra={barExtra} />
    );
  }

  // ---- steps (put the chain of working in order) ------------------------------------------
  if (spec.kind === "steps" && stepsOrder) {
    return (
      <OrderField
        spec={stepsOrder}
        disabled={disabled}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        label={props.label ?? "Put the steps in order"}
        calcTag={calcTag}
        barExtra={barExtra}
      />
    );
  }

  // ---- table cells ------------------------------------------------------------------------
  if (spec.kind === "table") {
    return (
      <TableField spec={spec} disabled={disabled} onSubmit={onSubmit} submitLabel={submitLabel} label={props.label} calcTag={calcTag} barExtra={barExtra} />
    );
  }

  // ---- a whole matrix ---------------------------------------------------------------------
  if (spec.kind === "matrix") {
    return (
      <MatrixField spec={spec} disabled={disabled} onSubmit={onSubmit} submitLabel={submitLabel} label={props.label} calcTag={calcTag} barExtra={barExtra} />
    );
  }

  // ---- six-mark written communication (banded) --------------------------------------------
  if (spec.kind === "text-long") {
    return (
      <LongTextField spec={spec} disabled={disabled} onSubmit={onSubmit} submitLabel={submitLabel} label={props.label} calcTag={calcTag} barExtra={barExtra} autoFocus={autoFocus} />
    );
  }

  // ---- diagram labels ---------------------------------------------------------------------
  if (spec.kind === "label") {
    return (
      <LabelField spec={spec} disabled={disabled} onSubmit={onSubmit} submitLabel={submitLabel} label={props.label} calcTag={calcTag} barExtra={barExtra} />
    );
  }

  // ---- transformation grid (draw the image) -----------------------------------------------
  if (spec.kind === "graph" && spec.expect.plot === "transformation") {
    return (
      <TransformationField
        expect={spec.expect}
        disabled={disabled}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        label={props.label}
        calcTag={calcTag}
        barExtra={barExtra}
        prompt={props.prompt}
      />
    );
  }

  // ---- plotted points, a line, a curve or a histogram ------------------------------------
  if (spec.kind === "graph" && (spec.expect.plot === "points-line" || spec.expect.plot === "curve" || spec.expect.plot === "histogram")) {
    return (
      <PlotField
        expect={spec.expect}
        disabled={disabled}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        label={props.label}
        calcTag={calcTag}
        barExtra={barExtra}
        prompt={props.prompt}
      />
    );
  }

  // ---- box plot on a scale ----------------------------------------------------------------
  if (spec.kind === "graph" && spec.expect.plot === "box") {
    return (
      <BoxPlotField
        expect={spec.expect}
        disabled={disabled}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        label={props.label}
        calcTag={calcTag}
        barExtra={barExtra}
        prompt={props.prompt}
      />
    );
  }

  // ---- region of a set of inequalities ----------------------------------------------------
  if (spec.kind === "graph" && spec.expect.plot === "region") {
    return (
      <RegionField
        expect={spec.expect}
        disabled={disabled}
        onSubmit={onSubmit}
        submitLabel={submitLabel}
        label={props.label}
        calcTag={calcTag}
        barExtra={barExtra}
        prompt={props.prompt}
      />
    );
  }

  // ---- everything typed -------------------------------------------------------------------
  const label = props.label ?? (spec.kind === "equation" ? "Equation" : "Your answer");
  let body: ReactNode;
  let hint: ReactNode = "Enter to check";

  if (spec.kind === "equation") {
    const keys = physics ? PHYSICS_KEYS : CHEM_KEYS;
    body = (
      <div className="space-y-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-meta font-medium text-ink-2">{physics ? "1 · Equation first, in symbols" : `Balanced ${spec.kindOf === "word" ? "word" : spec.kindOf} equation`}</span>
            {physics && equationOk && (
              <Rise as="div" className="inline-flex items-center gap-1.5 text-meta text-ink-2">
                <Tick size={16} label="Equation line earned" /> Equation line earned
              </Rise>
            )}
          </div>
          <MathsLineInput
            value={value}
            onChange={setValue}
            onEnter={submit}
            keys={keys}
            disabled={disabled}
            label={label}
            placeholder={props.placeholder ?? (physics ? "e.g. quantity = symbol × symbol" : "reactants → products")}
            autoFocus={autoFocus}
            describedBy={hintId}
          />
          {physics && (
            <p id={hintId} className="mt-1 text-meta text-ink-2">
              Physics equations are not given in the exam; a right equation line earns its mark even if the number slips.
            </p>
          )}
        </div>
        {physics && equationOk && (
          <Rise as="div">
            <span className="mb-1.5 block text-meta font-medium text-ink-2">2 · Substitute, then the answer with its unit</span>
            <MathsLineInput value={working} onChange={setWorking} onEnter={submit} keys={MATHS_KEYS} disabled={disabled} label="Substitution and answer" multiline placeholder="= … = … unit" autoFocus />
          </Rise>
        )}
      </div>
    );
  } else if (spec.kind === "numeric" || spec.kind === "algebraic") {
    body = (
      <MathsLineInput
        value={value}
        onChange={setValue}
        onEnter={submit}
        keys={MATHS_KEYS}
        disabled={disabled}
        label={label}
        placeholder={props.placeholder ?? (spec.kind === "algebraic" ? "e.g. (x + 3)(x − 2)" : "Answer")}
        autoFocus={autoFocus}
        suffix={unitSuffix(spec)}
        describedBy={hintId}
      />
    );
    if (spec.kind === "numeric" && spec.unitRequired && spec.unit) {
      hint = (
        <span id={hintId}>
          Give the unit ({spec.unit}) · Enter to check
        </span>
      );
    }
  } else if (spec.kind === "text") {
    const long = expectsLongText(spec);
    body = (
      <MathsLineInput
        value={value}
        onChange={setValue}
        onEnter={submit}
        keys={[]}
        disabled={disabled}
        label={label}
        placeholder={props.placeholder ?? (long ? "Say it in a sentence" : "Answer")}
        autoFocus={autoFocus}
        multiline={long}
      />
    );
    if (long) hint = "Enter to check · Shift+Enter for a new line";
  } else {
    // Self-marked kinds (best-fit graph, drawing, annotation)
    body = (
      <div>
        <MathsLineInput
          value={value}
          onChange={setValue}
          onEnter={submit}
          keys={[]}
          disabled={disabled}
          label={label}
          placeholder={props.placeholder ?? "Write your answer or working here"}
          autoFocus={autoFocus}
          multiline
        />
        <p className="mt-1 text-meta text-ink-2">This part is compared with the worked solution rather than marked automatically.</p>
      </div>
    );
    hint = "Shift+Enter for a new line";
  }

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {body}
      {underField}
      <StickyBar hint={hint}>
        <button type="submit" className={btnCheck} disabled={disabled || !canSubmit}>
          {submitLabel}
        </button>
        {calcTag}
        {barExtra}
      </StickyBar>
    </form>
  );
}

// -------------------------------------------------------------------------------------------
// MCQ
// -------------------------------------------------------------------------------------------

function McqField({
  spec,
  disabled,
  selected,
  onSelect,
  onSubmit,
  submitLabel,
  label,
  canSubmit,
  calcTag,
  barExtra,
  underField,
}: {
  spec: Extract<AnswerSpec, { kind: "mcq" }>;
  disabled: boolean;
  selected: string[];
  onSelect: (ids: string[]) => void;
  onSubmit: () => void;
  submitLabel: string;
  label?: string;
  canSubmit: boolean;
  calcTag: ReactNode;
  barExtra?: ReactNode;
  underField?: ReactNode;
}) {
  const options = useMemo<McqOption[]>(
    () => (spec.shuffle ? seededShuffle(spec.options, spec.options.map((o) => o.id).join("|")) : spec.options),
    [spec],
  );
  const multi = spec.multi === true;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const groupLabel = label ?? (multi ? "Choose every answer that applies" : "Choose one answer");

  const toggle = (id: string) => {
    if (disabled) return;
    if (multi) onSelect(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    else onSelect([id]);
  };

  const onGroupKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const idx = refs.current.findIndex((b) => b === document.activeElement);
    const move = (to: number) => {
      const n = options.length;
      const target = refs.current[((to % n) + n) % n];
      target?.focus();
      e.preventDefault();
    };
    if (e.key === "ArrowDown" || e.key === "ArrowRight") return move(idx + 1);
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") return move(idx - 1);
    if (e.key === "Home") return move(0);
    if (e.key === "End") return move(options.length - 1);
    if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const i = e.key.toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < options.length) {
        toggle(options[i].id);
        refs.current[i]?.focus();
        e.preventDefault();
      }
    }
  };

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div role={multi ? "group" : "radiogroup"} aria-label={groupLabel} className="grid gap-2 sm:grid-cols-2" onKeyDown={onGroupKey}>
        {options.map((o, i) => {
          const active = selected.includes(o.id);
          return (
            <button
              key={o.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={active}
              disabled={disabled}
              tabIndex={disabled ? -1 : i === 0 || active ? 0 : -1}
              onClick={() => toggle(o.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (active) onSubmit();
                  else toggle(o.id);
                }
              }}
              className={clsx(btnOption, active ? "border-ink shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line-3")}
            >
              <Letter active={active}>{optionLetter(i)}</Letter>
              <span className="flex-1">
                <Tex text={o.text} />
              </span>
            </button>
          );
        })}
      </div>
      {underField}
      <StickyBar hint={multi ? "Space toggles · Enter checks" : "A–D to choose · Enter to check"}>
        <button type="submit" className={btnCheck} disabled={disabled || !canSubmit}>
          {submitLabel}
        </button>
        {calcTag}
        {barExtra}
      </StickyBar>
    </form>
  );
}
