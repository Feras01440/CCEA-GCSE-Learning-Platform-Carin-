"use client";

import { useSyncExternalStore } from "react";

/**
 * Today's date, read from her device's clock when the page runs, never from the build.
 * The static export is rendered once at build time; a date computed there would sit on the
 * home page, wrong, from the next morning on (seen 24 Sep 2026: "Wednesday 23 September" on
 * a Thursday). During hydration the server snapshot is a blank line of the same height, so
 * nothing shifts when the real date arrives, and React never sees a mismatch: it renders the
 * server snapshot first and re-renders with the client one.
 *
 * The store is the calendar itself. An installed app is resumed far more often than it is
 * reloaded, so the subscription listens for the page coming back (visibilitychange, focus,
 * pageshow) and sets a timer for the next local midnight; the snapshot is the formatted day, a
 * string, so React re-renders only when the day has actually changed (reviewed 24 Sep 2026).
 */
export const NBSP = String.fromCharCode(160);

/** "Thursday 24 September": the British form with the long weekday, as the locator prints it. */
export function formatToday(now: Date): string {
  return now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

/** Milliseconds until one second past the next local midnight, so the re-read lands on the new day, never on 23:59:59.999. */
export function msUntilNextDay(now: Date): number {
  const next = new Date(now);
  next.setHours(24, 0, 1, 0);
  return Math.max(1000, next.getTime() - now.getTime());
}

function subscribe(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      onChange();
      arm();
    }, msUntilNextDay(new Date()));
  };
  const wake = () => {
    onChange();
    arm();
  };
  arm();
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("focus", wake);
  window.addEventListener("pageshow", wake);
  return () => {
    if (timer !== undefined) clearTimeout(timer);
    document.removeEventListener("visibilitychange", wake);
    window.removeEventListener("focus", wake);
    window.removeEventListener("pageshow", wake);
  };
}

const readToday = () => formatToday(new Date());
const readServer = () => NBSP;

export function DateLine() {
  const text = useSyncExternalStore(subscribe, readToday, readServer);
  return <>{text}</>;
}
