"use client";

/**
 * The two ways in, on the topic hero (art direction v2 §8.2, §9; decision 17): "Start the slides" carries the accent
 * on a first visit on both sizes, "Read it as a page" is the outlined second way, and the way she last chose on this
 * device carries the accent next time. Exactly one accent-filled control (01-art-direction.md §4.3).
 *
 * On a topic without Slides (src/lib/slides/ready.ts) this is the one Read button it always was, so nothing promises
 * a screen that does not exist.
 *
 * The slides agent owns this block of the hero (TRIAL-BRIEF.md); the rest of TopicHero.tsx belongs to the read agent.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { btnPrimary } from "@/components/items/ui";
import { readPosition, type SlidesPosition } from "@/lib/slides/position";
import { slidesHref, slidesReadyFor } from "@/lib/slides/ready";
import { useLessonWay } from "@/components/topic/lesson-way";

export interface StartButtonsProps {
  subject: string;
  unit: string;
  slug: string;
  /** The shipped bundle's id: where the slides keep her place on this device. */
  topicId: string;
  /** No attempt on this topic yet, once known; false while loading. */
  firstVisit: boolean;
  /** The Read section she stopped at, when there is one. */
  sectionNumber: number | null;
  /** The deck's card count, when the page knows it ("Start the slides · 36 cards"). */
  cards?: number;
  /** Open the Read view where she left off (or from the top). */
  onRead: () => void;
  /** "Read from the top" on a returning visit. */
  onReadFromTop: () => void;
  /** "Done this before?" on a first visit. */
  onDoneBefore: () => void;
}

const quietCls = "tap text-ui text-ink-2 underline decoration-accent underline-offset-[3px] hover:text-ink";
/**
 * The second way in: on a phone a quiet text link, as the approved board draws it (Read-P-Hero: "Read it as a page
 * instead" under a full-width primary); from sm the outlined 52 px button beside the primary.
 */
const secondWayCls =
  "tap inline-flex items-center justify-center text-ui text-ink-2 underline decoration-accent underline-offset-[3px] hover:text-ink sm:min-h-[52px] sm:gap-2 sm:rounded-[var(--radius-sm)] sm:border sm:border-line-2 sm:bg-surface sm:px-6 sm:font-medium sm:text-ink sm:no-underline sm:hover:bg-surface-2 sm:active:scale-[0.98]";

export function StartButtons({ subject, unit, slug, topicId, firstVisit, sectionNumber, cards, onRead, onReadFromTop, onDoneBefore }: StartButtonsProps) {
  const ready = slidesReadyFor(subject, slug);
  const [way, chooseWay] = useLessonWay(firstVisit, subject, slug);
  // Her place in the slides, read after mount so the server and the first paint agree.
  const [position, setPosition] = useState<SlidesPosition | null>(null);
  useEffect(() => {
    if (ready) setPosition(readPosition(topicId));
  }, [ready, topicId]);

  const readLabel = sectionNumber ? `Continue at section ${sectionNumber}` : "Start the lesson";
  const quiet = sectionNumber ? (
    <button type="button" className={quietCls} onClick={onReadFromTop}>
      Read from the top
    </button>
  ) : (
    <button type="button" className={quietCls} onClick={onDoneBefore}>
      Done this before?
    </button>
  );

  if (!ready) {
    return (
      <div className="mt-5 flex flex-col items-start gap-3" data-way="read">
        <button type="button" className={clsx(btnPrimary, "tap-lg px-6")} onClick={onRead}>
          {readLabel}
          <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
        </button>
        {quiet}
      </div>
    );
  }

  const resuming = position !== null && !position.done && position.at > 0;
  // Her place counts the gates she missed, as the deck she left does: each comes back once before the recap, so the run
  // she left was that many cards longer ("11 of 26", never "11 of 25"; audit CQ-11).
  const runLength = cards && position ? cards + position.missed.length : cards;
  const slidesLabel = resuming
    ? `Continue the slides${runLength ? ` · card ${Math.min(position.at + 1, runLength)} of ${runLength}` : ""}`
    : `Start the slides${cards ? ` · ${cards} cards` : ""}`;
  const href = slidesHref(subject, unit, slug);
  const slidesFirst = way === "slides";

  const slidesLink = (primary: boolean) => (
    <Link
      href={href}
      data-way="slides"
      className={primary ? clsx(btnPrimary, "tap-lg px-6") : secondWayCls}
      onClick={() => chooseWay("slides")}
    >
      {slidesLabel}
      {primary && <ArrowRight size={18} strokeWidth={1.5} aria-hidden />}
    </Link>
  );
  const readButton = (primary: boolean) => (
    <button
      type="button"
      data-way="read"
      className={primary ? clsx(btnPrimary, "tap-lg px-6") : secondWayCls}
      onClick={() => {
        chooseWay("read");
        onRead();
      }}
    >
      {primary ? readLabel : sectionNumber ? `Read on from section ${sectionNumber}` : "Read it as a page"}
      {primary && <ArrowRight size={18} strokeWidth={1.5} aria-hidden />}
    </button>
  );

  // The approved phone board (Read-P-Hero): the way that carries the accent runs the full width, and the other way and
  // the quiet link share one 44 px row 6 px under it; from sm both ways are buttons side by side and the quiet link has
  // its own row. Two stacked 52 px ways and a third row put the hero's figure at 775 px on a 390 x 844 phone, over the
  // 720 px rule (the audit's HERO-4, measured on the source's text); this layout puts it at 705.
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 sm:justify-start sm:gap-x-3 sm:gap-y-3">
      <div className="w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">{slidesFirst ? slidesLink(true) : readButton(true)}</div>
      {slidesFirst ? readButton(false) : slidesLink(false)}
      <span aria-hidden className="hidden sm:block sm:h-0 sm:basis-full" />
      {quiet}
    </div>
  );
}
