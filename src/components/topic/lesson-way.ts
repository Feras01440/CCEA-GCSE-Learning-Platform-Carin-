"use client";

/**
 * Two ways into every topic (decision 9, 23 Sep 2026; decision 17 makes Slides the primary way on both sizes): "Slides",
 * a card-by-card lesson built from the same note, and "Read", the whole note with its contents. The hero offers both.
 *
 * Which one carries the accent is decided by her choice and nothing else (art direction v2 §8.2: "the hero's accent
 * button is 'Start the slides' on both sizes"; audit CQ-01, 24 Sep): Slides, wherever a topic has them, until she
 * presses a way in herself; then the way she last chose on this device. Evidence on the topic (a practice answer, a
 * Read gate, a mastery row) is where she was, never a choice: the Read button still names it ("Read on from section 3",
 * "Continue at section 3" once Read is hers), but it never takes the accent from Slides.
 *
 * Slides exist for the topics in src/lib/slides/ready.ts (the trial topic first; the list grows as the owner says yes).
 * On a topic without them "read" is the only way and nothing on the screen promises otherwise.
 */
import { useCallback, useEffect, useState } from "react";
import { slidesReadyFor } from "@/lib/slides/ready";

export type LessonWay = "slides" | "read";

const STORE_KEY = "cairn.lessonWay";
const EVENT = "cairn:lesson-way";

/** A stored choice, or none: only the two ways count; anything else in storage is no choice. */
export function storedWay(raw: string | null): LessonWay | null {
  return raw === "slides" || raw === "read" ? raw : null;
}

function readStored(): LessonWay | null {
  try {
    return storedWay(window.localStorage.getItem(STORE_KEY));
  } catch {
    return null;
  }
}

/** Remember a way without a hook: the Slides title card's "Read it as a page instead" writes it before it leaves. */
export function rememberLessonWay(way: LessonWay): void {
  try {
    window.localStorage.setItem(STORE_KEY, way);
  } catch {
    // The choice holds for this visit.
  }
}

/**
 * The way that carries the accent: her stored choice where the topic has Slides, otherwise Slides; on a topic without
 * Slides, Read. It takes no evidence about the topic on purpose (CQ-01): only a choice she made moves the accent.
 */
export function lessonWayFor({ stored, ready }: { stored: LessonWay | null; ready: boolean }): LessonWay {
  if (!ready) return "read";
  return stored ?? "slides";
}

/**
 * The chosen way, shared by every component on the page that asks. The server and the first paint already show what a
 * device with no stored choice shows (Slides where they exist), so on a first visit nothing swaps under her finger
 * (audit CQ-10); a stored choice is read from this device just after mount. Storage can be missing: the choice then
 * lasts the visit. A stored "slides" on a topic that has none resolves to "read".
 *
 * `firstVisit` is still accepted from the hero's call site and deliberately unused: whether she has answered anything
 * on the topic never decides the way in.
 */
export function useLessonWay(_firstVisit: boolean, subject: string, slug: string): [LessonWay, (way: LessonWay) => void] {
  const ready = slidesReadyFor(subject, slug);
  const [way, setWay] = useState<LessonWay>(() => lessonWayFor({ stored: null, ready }));
  useEffect(() => {
    setWay(lessonWayFor({ stored: readStored(), ready }));
  }, [ready]);
  useEffect(() => {
    const on = (e: Event) => {
      const next = storedWay((e as CustomEvent<string>).detail);
      if (next) setWay(lessonWayFor({ stored: next, ready }));
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [ready]);
  const choose = useCallback(
    (next: LessonWay) => {
      setWay(lessonWayFor({ stored: next, ready }));
      try {
        window.localStorage.setItem(STORE_KEY, next);
      } catch {
        // The choice holds for this visit.
      }
      window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
    },
    [ready],
  );
  return [way, choose];
}
