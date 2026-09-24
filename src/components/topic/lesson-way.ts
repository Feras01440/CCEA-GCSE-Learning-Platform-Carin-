"use client";

/**
 * Two ways into every topic (decision 9, 23 Sep 2026; decision 17 makes Slides the primary way on both sizes): "Slides",
 * a card-by-card lesson built from the same note, and "Read", the whole note with its contents. The hero offers both;
 * the way she last chose is remembered on this device and decides which button carries the accent next time.
 *
 * Slides exist for the topics in src/lib/slides/ready.ts (the trial topic first; the list grows as the owner says yes).
 * On a topic without them "read" is the only way and nothing on the screen promises otherwise.
 */
import { useCallback, useEffect, useState } from "react";
import { slidesReadyFor } from "@/lib/slides/ready";

export type LessonWay = "slides" | "read";

const STORE_KEY = "cairn.lessonWay";
const EVENT = "cairn:lesson-way";

function readStored(): LessonWay | null {
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    return v === "slides" || v === "read" ? v : null;
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

/** The way a topic opens when she has not chosen one: Slides on a first visit, on a phone or a desktop, wherever Slides exist. */
export function defaultLessonWay({ firstVisit, ready }: { firstVisit: boolean; ready: boolean }): LessonWay {
  return ready && firstVisit ? "slides" : "read";
}

/**
 * The chosen way, shared by every component on the page that asks. Server-rendered and first painted as "read", then
 * settled from this device's choice (or the default) after mount. Storage can be missing: the choice then lasts the visit.
 * A stored "slides" on a topic that has none resolves to "read".
 */
export function useLessonWay(firstVisit: boolean, subject: string, slug: string): [LessonWay, (way: LessonWay) => void] {
  const ready = slidesReadyFor(subject, slug);
  const [way, setWay] = useState<LessonWay>("read");
  useEffect(() => {
    const stored = readStored();
    const chosen = stored ?? defaultLessonWay({ firstVisit, ready });
    setWay(ready ? chosen : "read");
  }, [firstVisit, ready]);
  useEffect(() => {
    const on = (e: Event) => {
      const next = (e as CustomEvent<LessonWay>).detail;
      if (next === "slides" || next === "read") setWay(ready ? next : "read");
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [ready]);
  const choose = useCallback((next: LessonWay) => {
    setWay(next);
    try {
      window.localStorage.setItem(STORE_KEY, next);
    } catch {
      // The choice holds for this visit.
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  }, []);
  return [way, choose];
}
