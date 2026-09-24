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
import { btnPrimary, btnSecondary } from "@/components/items/ui";
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
  /** The deck's card count, when the page knows it ("Start the slides · 25 cards"). */
  cards?: number;
  /** Open the Read view where she left off (or from the top). */
  onRead: () => void;
  /** "Read from the top" on a returning visit. */
  onReadFromTop: () => void;
  /** "Done this before?" on a first visit. */
  onDoneBefore: () => void;
}

const quietCls = "tap text-ui text-ink-2 underline decoration-accent underline-offset-[3px] hover:text-ink";

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
  const slidesLabel = resuming
    ? `Continue the slides${cards ? ` · card ${Math.min(position.at + 1, cards)} of ${cards}` : ""}`
    : `Start the slides${cards ? ` · ${cards} cards` : ""}`;
  const href = slidesHref(subject, unit, slug);
  const slidesFirst = way === "slides";

  const slidesLink = (primary: boolean) => (
    <Link
      href={href}
      data-way="slides"
      className={clsx(primary ? btnPrimary : btnSecondary, "tap-lg px-6")}
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
      className={clsx(primary ? btnPrimary : btnSecondary, "tap-lg px-6")}
      onClick={() => {
        chooseWay("read");
        onRead();
      }}
    >
      {primary ? readLabel : sectionNumber ? `Read on from section ${sectionNumber}` : "Read it as a page"}
      {primary && <ArrowRight size={18} strokeWidth={1.5} aria-hidden />}
    </button>
  );

  return (
    <div className="mt-5 flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {slidesFirst ? slidesLink(true) : readButton(true)}
        {slidesFirst ? readButton(false) : slidesLink(false)}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">{quiet}</div>
    </div>
  );
}
