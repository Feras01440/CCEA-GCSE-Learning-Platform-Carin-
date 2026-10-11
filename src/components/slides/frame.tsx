"use client";

/**
 * The Slides frame's three bands, as one DOM on both sizes (art direction v2 §8.2; SlidesRun's header comment): the wash
 * header with Exit, the topic, "n of N" and the segmented track, then the card's eyebrow and title; the body, where the
 * card sits on the paper (the prose column, then the figure or the verdict); the foot with the one control (the
 * full-width bottom bar from lg). SlidesRun composes them with the run's state; the lab at app/lab/see-its composes the
 * same three around a See it so what is measured there is the frame she uses, not a copy of it.
 */
import type { PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react";
import { clsx } from "clsx";
import type { CardParts } from "./cards";
import { CardTitle, Eyebrow, Track } from "./ui";

/** The layer that is the page: nothing behind it scrolls. */
export const slidesRootCls = "fixed inset-0 z-50 flex flex-col overflow-hidden bg-ground text-ink";

export function SlidesHeader({ exit, displayTitle, count, track, parts }: { exit: ReactNode; displayTitle: string; count: string; track: { n: number; N: number } | null; parts: CardParts | null }) {
  return (
    <header className="bg-[var(--tint-wash)] px-6 pb-4 pt-3 lg:px-10 lg:pb-6 lg:pt-5" data-header>
      <div className="flex items-center gap-4 lg:gap-6">
        {exit}
        <div className="flex min-w-0 flex-1 flex-col gap-2 lg:mx-auto lg:max-w-[720px]">
          <div className="flex items-baseline justify-between gap-3 font-sans text-[13px] text-ink-2">
            <span className="min-w-0 truncate">{displayTitle}</span>
            <span className="tnum shrink-0" aria-live="polite" data-count>
              {count}
            </span>
          </div>
          {track && <Track n={track.n} N={track.N} />}
        </div>
        <span className="hidden lg:block lg:w-[120px]" aria-hidden />
      </div>
      {parts && (
        <div className="mt-4 flex w-full flex-col gap-1.5 lg:mx-auto lg:mt-5 lg:max-w-[1000px]">
          <Eyebrow>{parts.eyebrow}</Eyebrow>
          {parts.title && <CardTitle>{parts.title}</CardTitle>}
        </div>
      )}
    </header>
  );
}

export interface EdgeControl {
  label: string;
  onClick: () => void;
  disabled: boolean;
}

const edgeCls = "absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-2 bg-surface text-[18px] text-ink-2 hover:bg-surface-2 disabled:opacity-40 lg:flex";

/**
 * The body: the card on the paper, its own scrolling box (a See it never needs it to scroll: the ledger fits; a figure
 * taller than the card still can). `cardKey` remounts the card so its arrival motion plays once per card. The section is
 * a prose column with an optional 400 px figure column from lg; a card that asks for the whole 1000 px measure
 * (`parts.wide`, the See it's two-column ladder) gets it.
 */
export function CardBody({
  cardRef,
  cardKey,
  cardKind,
  motionCls,
  count,
  parts,
  prev = null,
  next = null,
  onPointerDown,
  onPointerUp,
}: {
  cardRef: Ref<HTMLDivElement>;
  cardKey: string | number;
  cardKind: string;
  motionCls?: string;
  count: string;
  parts: CardParts | null;
  prev?: EdgeControl | null;
  next?: EdgeControl | null;
  onPointerDown?: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: ReactPointerEvent<HTMLDivElement>) => void;
}) {
  const grid = parts?.right ? "lg:grid-cols-[minmax(0,1fr)_400px]" : parts?.wide ? "lg:grid-cols-[minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,640px)]";
  return (
    <div className="relative flex min-h-0 flex-1 lg:justify-center lg:px-10 lg:pt-9" data-body onPointerDown={onPointerDown} onPointerUp={onPointerUp} style={{ touchAction: "pan-y" }}>
      {prev && (
        <button type="button" aria-label={prev.label} onClick={prev.onClick} disabled={prev.disabled} className={clsx(edgeCls, "left-10")} data-prev>
          <span aria-hidden>‹</span>
        </button>
      )}
      <div ref={cardRef} key={cardKey} className={clsx("flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-4 pt-4 lg:w-[1000px] lg:max-w-full lg:flex-none lg:px-0 lg:pt-0", motionCls)} data-card={cardKind} style={{ touchAction: "pan-y" }}>
        <section aria-label={`Card ${count}`} tabIndex={-1} data-card-section data-focus-quiet="" className={clsx("flex flex-col gap-3 lg:grid lg:items-start lg:gap-14", grid)}>
          <div className="flex min-w-0 flex-col gap-3.5">{parts?.left}</div>
          {parts?.right && <div className="flex min-w-0 flex-col gap-2.5">{parts.right}</div>}
        </section>
      </div>
      {next && (
        <button type="button" aria-label={next.label} onClick={next.onClick} disabled={next.disabled} className={clsx(edgeCls, "right-10")} data-next>
          <span aria-hidden>›</span>
        </button>
      )}
    </div>
  );
}

/** The foot: on the phone the control with its note under it; from lg the full-width bottom bar with the keyboard hints. */
export function SlidesFoot({ hints, control, footNote, wide = false }: { hints: ReactNode; control: ReactNode; footNote: ReactNode; wide?: boolean }) {
  return (
    <div className="flex flex-col gap-2 px-6 pb-6 pt-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:border-t lg:border-line lg:bg-surface lg:px-10 lg:py-4" data-foot>
      {hints}
      <div className="flex flex-col gap-2 lg:flex-row-reverse lg:items-center lg:gap-4">
        <div className={clsx("w-full", wide ? "lg:w-[420px]" : "lg:w-[300px]")}>{control}</div>
        {footNote && <div className="flex justify-center lg:justify-start">{footNote}</div>}
      </div>
    </div>
  );
}
