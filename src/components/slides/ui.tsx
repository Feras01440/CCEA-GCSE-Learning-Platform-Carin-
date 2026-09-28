"use client";

/**
 * The pieces every Slides card shares (docs/design/2026-09-23-art-direction-v2.md §8.1, §8.4): the segmented track,
 * the figure's stage, prose at the card size, the card's eyebrow and title, the gate's option, the verdict object,
 * and the keyboard hint. Colour carries meaning here and nowhere else: the wash says the subject, fern says which
 * option is right, ink says not yet, the accent is the one thing to press.
 */
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { MdInlines, MissMark, Tex, Tick, parseMd } from "@/components/items";
import { Letter } from "@/components/items/ui";
import { optionName } from "@/lib/slides/text";

/** The segmented 3 px track: done segments in the accent, the current one outlined, the rest the subject's mid tint. */
export function Track({ n, N, className }: { n: number; N: number; className?: string }) {
  return (
    <div className={clsx("flex gap-[3px]", className)} aria-hidden data-track>
      {Array.from({ length: N }, (_, i) => {
        const k = i + 1;
        return (
          <span
            key={k}
            data-seg={k < n ? "done" : k === n ? "current" : "todo"}
            className={clsx(
              "h-[3px] flex-1 rounded-[2px]",
              k < n ? "bg-accent" : k === n ? "bg-transparent shadow-[inset_0_0_0_1px_var(--accent)]" : "bg-[var(--tint-mid)] opacity-55",
            )}
          />
        );
      })}
    </div>
  );
}

/**
 * A drawing sits on a rounded stage, never floating on the paper. The phone's header already carries the wash, so its
 * stage is white with a hairline; from lg the stage is the wash. `wash` forces the wash at every size; one element
 * either way, so a figure is drawn once. `bleed`: on the phone the stage runs 16 px into the card's 24 px gutter on each
 * side with 8 px inside it, so a figure in a card's figure column is drawn 356 px wide at 390, the width its labels are
 * sized for (art direction v2 §3.1 rule 6, §11.2), instead of 316; from lg it is the figure column's stage as before.
 */
export function Stage({ children, wash = false, bleed = false, className }: { children: ReactNode; wash?: boolean; bleed?: boolean; className?: string }) {
  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-[12px]",
        bleed ? "-mx-4 p-2 lg:mx-0 lg:p-3" : "p-3",
        wash ? "bg-[var(--tint-wash)]" : "border border-line bg-surface lg:border-0 lg:bg-[var(--tint-wash)]",
        className,
      )}
      data-stage
    >
      {children}
    </div>
  );
}

/**
 * Inline maths kept whole: a formula moves to the next line as one piece, so a worked line never breaks inside a bracket
 * ("(x +" / "a)"), and only a formula wider than the line breaks, at KaTeX's own points (max-width 100%). Measured on the
 * trial deck (25 Sep): 6 of its 59 inline formulas broke across lines at 390 and 8 at 1280, 3 of them inside a bracket;
 * kept whole, none breaks and none overflows. Display maths is untouched (KaTeX's unlayered rule keeps it a block).
 */
export const wholeMaths = "[&_.katex]:inline-block [&_.katex]:max-w-full";

/** Learning prose at the card size: Literata, the token size, 1.5 leading; an authored line break is a line break. */
export function Prose({ md, size = "card", className }: { md: string; size?: "card" | "lede" | "explain"; className?: string }) {
  const blocks = parseMd(md);
  const sizeCls = size === "card" ? "text-[length:var(--fs-card-prose)] leading-[1.5]" : size === "lede" ? "text-[18px] leading-[1.5] md:text-[19px] md:leading-[1.52]" : "text-[17px] leading-[1.45]";
  return (
    <div className={clsx("font-serif-lesson text-ink", wholeMaths, sizeCls, className)}>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i} className={clsx(i > 0 && "mt-3")}>
            <MdInlines inlines={b.inlines} />
          </p>
        ) : (
          <div key={i} className={clsx("overflow-x-auto", i > 0 && "mt-3")}>
            <table className="tnum min-w-full border-collapse font-sans text-ui">
              {b.header && (
                <thead>
                  <tr>
                    {b.header.map((cell, c) => (
                      <th key={c} scope="col" className="whitespace-nowrap border border-line-2 bg-surface-2 px-3 py-1.5 text-left font-semibold">
                        <MdInlines inlines={cell} />
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {b.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className="whitespace-nowrap border border-line-2 px-3 py-1.5">
                        <MdInlines inlines={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      )}
    </div>
  );
}

/** "2 · Check", "Section 3 of 5": 13 px Inter 500 in ink-2, sentence case. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("font-sans text-[13px] font-medium leading-[1.4] text-ink-2", className)}>{children}</p>;
}

/**
 * The card's title: 24 px Literata 500 on the phone, 28 from md (§4). It is where the keyboard lands when the card
 * changes (SlidesRun): out of the tab order and marked quiet, so it wears the focus ring only when the keyboard brought
 * her here (the focus contract: html[data-input], app/globals.css; the owner's trial, 24 Sep: "a purple rectangular
 * line around the texts that appears but disappears when I click").
 */
export function CardTitle({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <h2 id={id} tabIndex={-1} data-card-title data-focus-quiet="" className={clsx("font-serif-lesson text-[length:var(--fs-card-title)] font-medium leading-[1.2] text-ink", className)}>
      {children}
    </h2>
  );
}

/** A caption says what to notice: 14 px, ink-2. */
export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("font-sans text-[14px] leading-[1.4] text-ink-2", className)}>{children}</p>;
}

/** A recess: reference she consults (the pointer, "What returns"). */
export function Recess({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-[8px] bg-surface-2 px-4 py-3.5", className)}>
      {title && <p className="font-sans text-[13px] font-medium text-ink-2">{title}</p>}
      <div className={clsx(title && "mt-1.5")}>{children}</div>
    </div>
  );
}

export type OptionState = "" | "chosen" | "ok" | "miss";

/**
 * One option of a gate: 52 px, 18 px Literata; at rest a --line-3 edge, chosen an ink edge; after Check the right
 * option is lit in fern with a filled tick and her miss takes the ink edge with the circle-dash. The edge is drawn
 * as an inset ring over a 1 px border so nothing moves when it changes. It is checked when it is hers: chosen before
 * Check, and after Check her answer, right or not (audit SLIDES-25: a right answer left no option checked).
 */
export function Option({
  letter,
  text,
  value,
  state,
  hers = false,
  disabled,
  onSelect,
  index,
}: {
  letter: string;
  text: string;
  /** The authored option, the value marked and recorded. */
  value: string;
  state: OptionState;
  /** After Check: this is the option she chose. */
  hers?: boolean;
  disabled: boolean;
  onSelect: () => void;
  index: number;
}) {
  const badge =
    state === "ok" ? (
      <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-ok text-surface" aria-hidden>
        <Tick size={16} label="" className="text-surface" />
      </span>
    ) : state === "miss" ? (
      <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-miss" aria-hidden>
        <MissMark size={16} label="" className="text-miss" />
      </span>
    ) : (
      <Letter active={state === "chosen"}>{letter}</Letter>
    );
  return (
    <button
      type="button"
      role="radio"
      aria-checked={state === "chosen" || hers}
      aria-label={optionName(value, state, hers)}
      data-outcome={state === "ok" || state === "miss" ? state : undefined}
      data-option={index}
      data-value={value}
      disabled={disabled}
      onClick={onSelect}
      className={clsx(
        "tap tap-lg flex w-full items-center gap-3 rounded-[12px] border px-3.5 py-2.5 text-left transition-[transform] duration-150 active:scale-[0.99] disabled:pointer-events-none",
        state === "" && "border-line-3 bg-surface hover:bg-surface-2",
        state === "chosen" && "border-ink bg-surface shadow-[inset_0_0_0_1px_var(--ink)]",
        state === "ok" && "border-ok bg-[var(--ok-wash)] shadow-[inset_0_0_0_1px_var(--ok)]",
        state === "miss" && "border-miss bg-[var(--miss-wash)] shadow-[inset_0_0_0_1px_var(--miss)]",
      )}
    >
      {badge}
      <span className="font-serif-lesson text-[length:var(--fs-option)] leading-[1.35] text-ink [&_.katex]:text-[1.06em]">
        <Tex text={text} />
      </span>
    </button>
  );
}

/**
 * The verdict after Check: a 2 px outcome edge with a 4 px rule, the word at 21 px ("Yes." in fern, "Not quite." in
 * ink), the consequence drawn before the words, the explanation, and one line of what happens next. After a miss has
 * been re-taught the word gives way to the answer line ("The answer: …", `answer`) and her choice's line (`diagnosis`).
 * A landing place: the keyboard is put here when it appears, so a screen reader reads it (audit SLIDES-37).
 */
export function Verdict({
  kind,
  explain,
  meta,
  reaction,
  answer,
  diagnosis,
  className,
}: {
  kind: "ok" | "miss";
  explain?: string | null;
  meta?: ReactNode;
  reaction?: ReactNode;
  /** The right answer, printed as the 21 px line in place of the word. */
  answer?: string | null;
  /** A line about her choice, under the answer. */
  diagnosis?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      tabIndex={-1}
      data-focus-quiet=""
      data-verdict={kind}
      className={clsx("motion-reveal flex flex-col gap-1.5 rounded-[12px] border-2 border-l-4 bg-surface px-4 py-3", kind === "ok" ? "border-ok" : "border-miss", className)}
    >
      {answer ? (
        <p className={clsx("font-serif-lesson text-[length:var(--fs-verdict)] font-semibold leading-[1.3] text-ink", wholeMaths)} data-answer-line>
          <span className="font-sans text-[15px] font-medium text-ink-2">The answer </span>
          <Tex text={answer} />
        </p>
      ) : (
        <p className={clsx("font-serif-lesson text-[length:var(--fs-verdict)] font-semibold leading-[1.2]", kind === "ok" ? "text-ok" : "text-ink")}>{kind === "ok" ? "Yes." : "Not quite."}</p>
      )}
      {diagnosis}
      {reaction}
      {explain && (
        <div className={clsx("font-serif-lesson text-[17px] leading-[1.45] text-ink", wholeMaths)}>
          <Tex text={explain} />
        </div>
      )}
      {meta && <p className="font-sans text-[13px] leading-[1.4] text-ink-2">{meta}</p>}
    </div>
  );
}

/** A key on the desktop's bottom bar. */
export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-block min-w-[22px] rounded-[5px] border border-line-2 bg-surface px-1.5 py-0.5 text-center font-sans text-[12px] not-italic text-ink-3">{children}</kbd>;
}

/** The one accent control at the foot (52 px), and the outlined second exit. */
export const controlPrimary =
  "tap tap-lg inline-flex w-full items-center justify-center gap-2 rounded-[12px] border-0 bg-accent px-5 font-sans text-[17px] font-semibold text-accent-ink transition-transform duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";
export const controlSecondary =
  "tap tap-lg inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-line-3 bg-surface px-5 font-sans text-[17px] font-medium text-ink transition-transform duration-150 hover:bg-surface-2 active:scale-[0.98]";
export const quietLink = "tap inline-flex items-center justify-center px-2 font-sans text-[15px] font-medium text-ink-2 underline decoration-accent underline-offset-[3px] hover:text-ink";
