"use client";

import { useSyncExternalStore } from "react";

/**
 * Today's date, read from her device's clock when the page runs, never from the build.
 * The static export is rendered once at build time; a date computed there would sit on the
 * home page, wrong, from the next morning on (seen 24 Sep 2026: "Wednesday 23 September" on
 * a Thursday). During hydration the server snapshot is a blank line of the same height, so
 * nothing shifts when the real date arrives.
 */
const NBSP = String.fromCharCode(160);
const subscribe = () => () => {};
const readToday = () =>
  new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
const readServer = () => NBSP;

export function DateLine() {
  const text = useSyncExternalStore(subscribe, readToday, readServer);
  return <>{text}</>;
}
