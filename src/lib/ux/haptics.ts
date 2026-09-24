/** A short, quiet vibration on touch devices for grading taps. Never on desktop; never with reduced motion. */
export function tap(ms = 8): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  try {
    if (!("vibrate" in navigator)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    navigator.vibrate(ms);
  } catch {
    /* unsupported */
  }
}
