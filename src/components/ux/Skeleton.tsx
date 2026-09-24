"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Content-shaped loading placeholders (docs/design/art-direction/01-art-direction.md §11, 02-surfaces.md §9).
 * Quiet: no shimmer sweep, a soft opacity pulse (0.55 ↔ 1 over 1.4 s, off under reduced motion), --surface-2,
 * the radius of the thing it stands in for. Never a spinner.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-[var(--radius-sm)] bg-surface-2 ${className}`} />;
}

/**
 * The shape of an object on the page (Today's Tonight object, a paper card): a label, a headline, lines. A busy
 * region of its own, labelled "Loading", for the callers that render it bare; inside <Loading> the wrapper
 * carries the specific label and this one is `quiet`.
 */
export function CardSkeleton({ lines = 3, quiet = false }: { lines?: number; quiet?: boolean }) {
  return (
    <div
      className="rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6"
      {...(quiet ? { "aria-hidden": true } : { "aria-busy": true, "aria-label": "Loading" })}
    >
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="mt-4 h-7 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`mt-2 h-4 ${i % 2 ? "w-4/5" : "w-11/12"}`} />
      ))}
    </div>
  );
}

/** The shape of page rows (the Map's units, a plan list): a line of text and a quieter line under it. */
export function RowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-3">
          <Skeleton className={`h-4 ${i % 2 ? "w-1/2" : "w-2/3"}`} />
          <Skeleton className="mt-2 h-3.5 w-5/6" />
        </div>
      ))}
    </div>
  );
}

/** Before this, a load that finishes shows nothing at all: a skeleton that flashes is worse than none. */
export const SKELETON_DELAY_MS = 120;
/** Once shown, a skeleton stays at least this long, so it never flickers. */
export const SKELETON_MIN_MS = 200;
/** After this, a sentence replaces the skeleton. Everything is on the device, so a wait this long is unusual. */
export const SKELETON_SENTENCE_MS = 3000;

export const STILL_LOADING = "Still loading. Everything is on your device, so this is unusual.";

type Phase = "wait" | "skeleton" | "slow" | "ready";

/**
 * The loading contract as a hook: `wait` (render nothing yet), `skeleton`, `slow` (the sentence instead), `ready`.
 * A load that finishes inside SKELETON_DELAY_MS never shows a skeleton; one that shows it keeps it for
 * SKELETON_MIN_MS; one still loading at SKELETON_SENTENCE_MS says so in words.
 */
export function useLoadingPhase(loading: boolean): Phase {
  const [phase, setPhase] = useState<Phase>(loading ? "wait" : "ready");
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      shownAt.current = null;
      setPhase("wait");
      const show = window.setTimeout(() => {
        shownAt.current = Date.now();
        setPhase("skeleton");
      }, SKELETON_DELAY_MS);
      const slow = window.setTimeout(() => setPhase("slow"), SKELETON_SENTENCE_MS);
      return () => {
        window.clearTimeout(show);
        window.clearTimeout(slow);
      };
    }
    const since = shownAt.current === null ? null : Date.now() - shownAt.current;
    if (since === null || since >= SKELETON_MIN_MS) {
      setPhase("ready");
      return;
    }
    const hold = window.setTimeout(() => setPhase("ready"), SKELETON_MIN_MS - since);
    return () => window.clearTimeout(hold);
  }, [loading]);

  return phase;
}

/**
 * Renders `children` once `loading` is false, and in the meantime nothing, then `skeleton`, then the sentence,
 * inside a busy region labelled with what is loading ("Loading your plan").
 */
export function Loading({ loading, label, skeleton, children }: { loading: boolean; label: string; skeleton: ReactNode; children: ReactNode }) {
  const phase = useLoadingPhase(loading);
  if (phase === "ready") return <>{children}</>;
  return (
    <div aria-busy="true" aria-label={label} data-loading={phase}>
      {phase === "skeleton" && skeleton}
      {phase === "slow" && <p className="py-3 text-ui text-ink-2">{STILL_LOADING}</p>}
    </div>
  );
}
