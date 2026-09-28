"use client";

/**
 * Landing places on the topic page: where the page takes her, and how it keeps her there while the lesson above
 * settles (the note opens to her section, the maths and the fonts arrive, each pushing things down). Used by the stage
 * landing (a link to #practice), the resume landing (#resume, Today's way back), the hero's Read button, and the
 * restore after a reload or a Back (READ-11), which keeps an anchor of where she was reading for this tab.
 *
 * Nothing here decides where she goes (read-place.ts `arrivalFor` does); these are the DOM moves.
 */
import { focusLanding } from "@/components/shell/input-modality";

/** How long a landing keeps its place while the page settles, and how still it must be to stop. */
const HOLD_MAX_MS = 4000;
const HOLD_STILL_FRAMES = 20;
/** What tells the page she has taken over: a scroll of the wheel, a touch, a press, a key. */
const HER_OWN = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

const reducedMotion = (): boolean => typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The Read track's bottom edge while it is stuck at the top of the screen, else 0. */
export function trackBottom(): number {
  const bar = document.querySelector<HTMLElement>("[data-read-track]");
  if (!bar) return 0;
  const r = bar.getBoundingClientRect();
  return r.top <= 1 && r.bottom > 0 ? r.bottom : 0;
}

/** Where a place is put when she is taken to it: under the Read track (its height and a little air), or near the top. */
export function underTheTrack(): number {
  const bar = document.querySelector<HTMLElement>("[data-read-track]");
  return bar ? bar.getBoundingClientRect().height + 16 : 24;
}

/**
 * An element's top edge where its box is laid out, less any translate of its own (a block rising in on mount is drawn
 * up to 8 px low for 200 ms; its place on the page is where it lands).
 */
function layoutTop(el: Element): number {
  const top = el.getBoundingClientRect().top;
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") return top;
  try {
    return top - new DOMMatrixReadOnly(transform).m42;
  } catch {
    return top;
  }
}

/**
 * Keeps `el`'s top edge at `top()` px from the top of the screen while the page settles. Lets go as soon as she scrolls,
 * taps or presses a key herself (the page never fights her), when anything else scrolls the page (a scrollbar, a
 * screen reader, a script), once the place has been still for a moment, after four seconds, or when the place leaves
 * the page. While it holds, the browser's own scroll anchoring is off, so every change of the scroll position that it
 * did not make is someone else's. Returns the way to let go early.
 */
export function holdAt(el: HTMLElement, top: () => number, onDone?: () => void): () => void {
  let stopped = false;
  let frame = 0;
  const root = document.documentElement;
  const anchoring = root.style.overflowAnchor;
  root.style.overflowAnchor = "none";
  let placedAt = window.scrollY;
  const onScroll = () => {
    if (Math.abs(window.scrollY - placedAt) > 2) stop();
  };
  const stop = () => {
    if (stopped) return;
    stopped = true;
    window.cancelAnimationFrame(frame);
    for (const type of HER_OWN) window.removeEventListener(type, stop, true);
    window.removeEventListener("scroll", onScroll);
    root.style.overflowAnchor = anchoring;
    onDone?.();
  };
  for (const type of HER_OWN) window.addEventListener(type, stop, { capture: true, passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  const started = performance.now();
  let lastTop = Number.NaN;
  let still = 0;
  const align = () => {
    if (stopped) return;
    if (!el.isConnected) return stop();
    const now = layoutTop(el);
    still = now === lastTop ? still + 1 : 0;
    lastTop = now;
    const want = top();
    if (Math.abs(now - want) > 1) window.scrollTo({ top: window.scrollY + now - want, behavior: "auto" });
    placedAt = window.scrollY;
    if (still < HOLD_STILL_FRAMES && performance.now() - started < HOLD_MAX_MS) frame = window.requestAnimationFrame(align);
    else stop();
  };
  align();
  return stop;
}

/** A stage at the top of the screen under its own scroll margin: the stage landing's hold (a link to #practice). */
export function holdAtTop(el: HTMLElement, onDone?: () => void): () => void {
  return holdAt(el, () => parseFloat(getComputedStyle(el).scrollMarginTop) || 0, onDone);
}

/**
 * A link that names a stage of this page lands on it (the Slides close's "Practise this topic" is /…/#practice; audit
 * LD-02, CQ-06): the keyboard goes there as a landing place, and the stage is held at the top while the lesson above it
 * settles. False when `id` is not a stage of this page.
 */
export function landOnStage(id: string, onDone?: () => void): (() => void) | false {
  const el = id ? document.getElementById(id) : null;
  if (!el || !el.hasAttribute("data-stage")) return false;
  focusLanding(el);
  return holdAtTop(el, onDone);
}

/** A Read v2 section's wrapper (1-based, as the track counts), or null while it is not open. */
export function sectionWrapper(n: number): HTMLElement | null {
  return document.querySelector<HTMLElement>(`#note [data-lesson-section="${n}"]`);
}

/**
 * Takes her to section `n` of a Read v2 lesson: its top just under the track, and the keyboard on its heading as a
 * landing place (a ring only when the keyboard brought her). With `hold`, the section is held there while the page
 * settles (an arrival); otherwise the move is one scroll, smooth unless she asked for reduced motion (a button she
 * pressed). False when the section is not on the page.
 */
export function landOnSection(n: number, { hold = false, onDone }: { hold?: boolean; onDone?: () => void } = {}): (() => void) | false {
  const wrapper = sectionWrapper(n);
  if (!wrapper) return false;
  const heading = wrapper.querySelector<HTMLElement>("[data-section]");
  // Section 1's heading can be the hero's title, kept for screen readers only: then the section itself takes the keyboard.
  const target = heading && !heading.classList.contains("sr-only") ? heading : wrapper;
  const top = layoutTop(wrapper) + window.scrollY - underTheTrack();
  window.scrollTo({ top, behavior: hold || reducedMotion() ? "auto" : "smooth" });
  focusLanding(target);
  if (hold) return holdAt(wrapper, underTheTrack, onDone);
  onDone?.();
  return () => {};
}

// ---------------------------------------------------------------------------------------------------------------------
// Where she was reading, kept for this tab (READ-11)
// ---------------------------------------------------------------------------------------------------------------------

/** Where she was reading: a block of the page, named so it can be found again, and how far from the top it stood. */
export interface ReadingAnchor {
  /** "note:3:4" (the fifth block of section 3; section 0 is a note without sections), "stage:practice:2", "stage:practice:-1" (its heading), "top". */
  key: string;
  /** The block's top edge, px from the top of the screen, when it was kept. */
  dy: number;
}

const ANCHOR_KEY = (topicId: string): string => `cairn.read.anchor.${topicId}`;

/** Every block of the page she reads through, in page order, each with the name an anchor keeps for it. */
function namedBlocks(): Array<{ key: string; el: Element }> {
  const out: Array<{ key: string; el: Element }> = [];
  const note = document.getElementById("note");
  const sections = note ? Array.from(note.querySelectorAll<HTMLElement>("[data-lesson-section]")) : [];
  if (sections.length > 0) for (const s of sections) Array.from(s.children).forEach((el, i) => out.push({ key: `note:${s.dataset.lessonSection}:${i}`, el }));
  else Array.from(note?.querySelector("article")?.children ?? []).forEach((el, i) => out.push({ key: `note:0:${i}`, el }));
  for (const stage of Array.from(document.querySelectorAll<HTMLElement>("[data-stage], #see-it"))) {
    if (!stage.id) continue;
    // The stage's own title row (its label and heading), then each block of its body.
    out.push({ key: `stage:${stage.id}:-1`, el: stageTitle(stage) });
    Array.from(stage.lastElementChild?.children ?? []).forEach((el, i) => out.push({ key: `stage:${stage.id}:${i}`, el }));
  }
  return out;
}

/** A stage's heading (its title row ends there), or the stage itself. */
function stageTitle(stage: HTMLElement): Element {
  return stage.querySelector(":scope > h2") ?? stage;
}

/**
 * The block at the reading line (24 px under the track, or under the top of the screen), named: the first block of the
 * lesson or of a stage that has not yet scrolled past it. Above the lesson (the hero) it is "top".
 */
export function anchorNow(): ReadingAnchor | null {
  const y = trackBottom() + 24;
  const blocks = namedBlocks().filter(({ el }) => el.getBoundingClientRect().height > 0);
  if (blocks.length === 0) return null;
  if (layoutTop(blocks[0].el) > y) return { key: "top", dy: 0 };
  const hit = blocks.find(({ el }) => el.getBoundingClientRect().bottom > y);
  if (!hit) return null;
  return { key: hit.key, dy: Math.round(layoutTop(hit.el)) };
}

/** The block an anchor names, or null when it is not on the page (a section not open, a stage gone). */
export function anchorElement(key: string): HTMLElement | null {
  const [kind, where, at] = key.split(":");
  const index = Number(at);
  if (kind === "note") {
    const container = where === "0" ? document.querySelector("#note article") : document.querySelector(`#note [data-lesson-section="${where}"]`);
    return (container?.children[index] as HTMLElement | undefined) ?? null;
  }
  if (kind === "stage" && where) {
    const stage = document.getElementById(where);
    if (!stage) return null;
    if (index < 0) return stageTitle(stage) as HTMLElement;
    return (stage.lastElementChild?.children[index] as HTMLElement | undefined) ?? null;
  }
  return null;
}

export function keepAnchor(topicId: string, anchor: ReadingAnchor | null): void {
  if (!anchor) return;
  try {
    window.sessionStorage.setItem(ANCHOR_KEY(topicId), JSON.stringify(anchor));
  } catch {
    // Kept for nothing: a reload then opens at the top, and the hero names her section.
  }
}

export function keptAnchor(topicId: string): ReadingAnchor | null {
  try {
    const raw = window.sessionStorage.getItem(ANCHOR_KEY(topicId));
    const v = raw ? (JSON.parse(raw) as Partial<ReadingAnchor>) : null;
    return v && typeof v.key === "string" && typeof v.dy === "number" ? { key: v.key, dy: v.dy } : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// How she arrived: what the document was loaded for, and whether a Back inside the app has just happened
// ---------------------------------------------------------------------------------------------------------------------

let lastPopstate = Number.NEGATIVE_INFINITY;
let arrivedOnce = false;
if (typeof window !== "undefined") window.addEventListener("popstate", () => (lastPopstate = performance.now()));

/** The facts `arrivalFor` (read-place.ts) decides from. Counts as this page's arrival: call once per mount. */
export function arrivalFacts(): {
  docType: "navigate" | "reload" | "back_forward" | "prerender" | null;
  docPath: string | null;
  path: string;
  firstMount: boolean;
  popped: boolean;
  discarded: boolean;
  hash: string;
} {
  const entry = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
  let docPath: string | null = null;
  try {
    docPath = entry ? new URL(entry.name).pathname : null;
  } catch {
    docPath = null;
  }
  let hash = "";
  try {
    hash = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    hash = "";
  }
  const facts = {
    docType: (entry?.type as "navigate" | "reload" | "back_forward" | "prerender" | undefined) ?? null,
    docPath,
    path: window.location.pathname,
    firstMount: !arrivedOnce,
    popped: performance.now() - lastPopstate < 2500,
    discarded: (document as Document & { wasDiscarded?: boolean }).wasDiscarded === true,
    hash,
  };
  arrivedOnce = true;
  return facts;
}
