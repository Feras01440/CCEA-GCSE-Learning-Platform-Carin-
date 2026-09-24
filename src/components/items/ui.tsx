"use client";

/**
 * Shared primitives for the item components: button classes, card, eyebrow, mark chips,
 * the drawing tick and the hairline miss mark. Semantic colour is never the only signal:
 * every state also carries an icon or a word.
 */
import { motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

export const btnPrimary =
  "tap inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 text-ui font-semibold text-accent-ink transition-transform duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";
/**
 * The primary on an answer: Check, Next part. 52 px, because she presses it hundreds of times
 * (docs/design/art-direction/01-art-direction.md §12; emotional-design.md rule 5).
 */
export const btnCheck = btnPrimary.replace(/^tap /, "tap tap-lg ");
export const btnSecondary =
  "tap inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-line-2 bg-surface px-4 text-ui font-medium text-ink transition-transform duration-150 hover:bg-surface-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";
export const btnQuiet =
  "tap inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 text-meta font-medium text-ink-2 hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-40";
/**
 * A choosable option (mcq, confidence, why-menu): outline at rest, ink outline when selected. 52 px tall
 * because it is tapped hundreds of times. The resting border is the caller's `border-line-3` (3.1:1, WCAG
 * 1.4.11: the edge is the only thing that says "this is a control"); `border-ink` when chosen.
 */
export const btnOption =
  "tap tap-lg flex w-full items-start gap-3 rounded-[var(--radius-sm)] border bg-surface px-3.5 py-2.5 text-left text-ui leading-snug text-ink transition-[transform,border-color] duration-150 hover:bg-surface-2 active:scale-[0.99] disabled:pointer-events-none";
export const fieldCls =
  "tap w-full rounded-[var(--radius-sm)] border border-line-3 bg-surface px-3.5 py-2.5 text-[17px] leading-snug text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none disabled:bg-surface-2 disabled:text-ink-2";
/** An object she acts on: pure white on the warm page with a --line-2 hairline and no shadow. */
export const cardCls = "rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6";
/**
 * A recess: reference she consults and never acts on (the Sheet, a spec row, "Not on this spec", a formula line,
 * links, licence text). No border, the --surface-2 wash, the small radius (01-art-direction.md §4.2). The third
 * surface beside the page and the object: an object may hold a recess; a recess never holds an object.
 */
export const recessCls = "rounded-[var(--radius-sm)] bg-surface-2 p-4";
/**
 * A container that receives programmatic focus (feedback, reveals) without the accent ring:
 * screen readers get it, the eye is not pulled. `!` because the global `:focus-visible` rule
 * is unlayered and would otherwise beat any utility.
 */
export const quietFocus = "outline-none! focus:outline-none! focus-visible:outline-none!";

export function Card({ children, className, as: Tag = "section", ...rest }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" | "form" } & Record<string, unknown>) {
  return (
    <Tag className={clsx(cardCls, className)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * A label above an object: 14 px, Inter 500, --ink-2, sentence case. The uppercase letterspaced eyebrow is
 * gone (01-art-direction.md §3.3): capitals at 12 px were slower to read and shouted while saying little.
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("text-meta font-medium text-ink-2", className)}>{children}</p>;
}

/** Option letter badge (A, B, C…) shown beside choices. */
export function Letter({ children, active }: { children: string; active?: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "tnum mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border text-micro font-semibold",
        active ? "border-ink bg-ink text-surface" : "border-line-2 text-ink-2",
      )}
    >
      {children}
    </span>
  );
}

/** M1 / A1 chip in the subject's mark language. */
export function MarkChip({ code, earned = true }: { code: string; earned?: boolean }) {
  return (
    <span
      className={clsx(
        "tnum inline-flex h-6 items-center rounded-[6px] border px-1.5 font-mono text-micro font-medium",
        earned ? "border-ink-3 text-ink" : "border-line-2 text-ink-2 line-through",
      )}
      title={earned ? `${code} earned` : `${code} not earned`}
    >
      {code}
    </span>
  );
}

/** The tick that draws in ~250 ms (transform/opacity only; static under reduced motion). */
export function Tick({ size = 22, className, label = "Correct" }: { size?: number; className?: string; label?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={label} className={clsx("shrink-0 text-ok", className)}>
      <motion.path
        d="M5 12.5l4.2 4.2L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0.6 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </svg>
  );
}

/** A miss is a hairline outline with a short dash, never a red flash. */
export function MissMark({ size = 22, className, label = "Not yet" }: { size?: number; className?: string; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={label} className={clsx("shrink-0 text-ink-2", className)}>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth={1.4} />
      <path d="M8.5 12h7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

/** Wraps a card in the 1.02 "settle" pulse used for a correct answer. */
export function Settle({ children, active, className }: { children: ReactNode; active: boolean; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      animate={active && !reduce ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Fade + 8 px rise for anything that appears after an action (step reveals, feedback). */
export function Rise({
  children,
  className,
  as = "div",
  delay = 0,
  role,
  "aria-live": ariaLive,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
  delay?: number;
  role?: string;
  "aria-live"?: "polite" | "assertive" | "off";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      role={role}
      aria-live={ariaLive}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.22, ease: [0.2, 0.8, 0.2, 1], delay: reduce ? 0 : delay }}
    >
      {children}
    </Tag>
  );
}

/** Visually hidden text for screen readers. */
export function SrOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/** "2 of 3 marks" in tabular numerals. */
export function MarksLine({ awarded, available }: { awarded: number; available: number }) {
  return (
    <span className="tnum text-meta text-ink-2">
      {awarded} of {available} mark{available === 1 ? "" : "s"}
    </span>
  );
}

/**
 * The bar that holds the Check button: sticks above the mobile keyboard, with an optional hint on the right.
 * The hint is a polite live region, so a screen reader hears a count, mode or parse change ("2 of 3 points
 * placed", "Coordinates not understood") that the grid's own label cannot re-announce.
 *
 * Below md it sticks above the fixed tab bar (56 px, its 1 px rule and the safe area), not at the screen's edge: at
 * bottom-0 the tab bar covered the lower 21 px of the Check button and the whole hint whenever a question ran past the
 * fold (measured 23 Sep on M4 histograms at 390 x 844; WCAG 2.4.11). From md there is no tab bar.
 */
export function StickyBar({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="sticky bottom-[calc(57px+env(safe-area-inset-bottom))] z-10 -mx-1 mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 bg-surface/95 px-1 pb-2 pt-2 backdrop-blur supports-[backdrop-filter]:bg-surface/85 md:bottom-0 md:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {children}
      {hint && (
        <span className="text-meta text-ink-2" aria-live="polite" aria-atomic="true">
          {hint}
        </span>
      )}
    </div>
  );
}
