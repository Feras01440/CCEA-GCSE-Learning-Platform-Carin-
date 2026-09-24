"use client";

/**
 * The spine: where she is in the lesson, how much is left, and where she can stop (02-surfaces.md §3.2).
 *
 * Desktop (lg and up): a 200 px rail beside the lesson column. It can be put away with one tap: the "Contents"
 * button folds it to its 3 px track and a "3 of 10" line, and the choice is remembered on this device. The rail's
 * column stays reserved either way, so putting it away never moves or re-wraps the lesson (decision 1, 22 Sep).
 *
 * Phone and tablet: one sticky element, 47 px: the 3 px track and a 44 px bar ("3 of 10 · title · 2 min") that
 * opens a sheet with every row. It replaces the chip scroller that showed 1.2 chips at 390 px.
 *
 * Rows come from the note's own headings, so row n is heading n. Nothing here moves on scroll: the current row is
 * re-read as she scrolls, but nothing animates because of it (01-art-direction.md §6).
 *
 * Read v2 (the trial topic, lesson-plan.ts isReadV2) replaces the rail and the phone bar with `ReadTrack` below: a
 * slim track at the top of the lesson's one column and a Contents popover, closed by default. The classic spine above
 * stays for every other topic until the owner has used the trial and said yes.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { CairnMark } from "@/components/companion/CairnArt";
import { focusLanding } from "@/components/shell/input-modality";
import { minutesHeading, plusVideos, type LessonSection } from "./lesson-plan";

export interface SpineStage {
  /** The stage's DOM id on the page, e.g. "practice". */
  id: string;
  label: string;
  minutes: number;
}

export interface LessonSpineProps {
  sections: LessonSection[];
  stages: SpineStage[];
  /** Whole-lesson estimate, the hero's own number. */
  minutes: number;
  /** Gate ids already answered, so the spine knows what is open and what is done. */
  answered: ReadonlySet<string>;
  /** The lesson's container id; its headings are the section anchors. */
  noteId?: string;
  /** The subject's wash for the unfilled track (a bg-tint-* class). */
  tint?: string;
}

interface Row {
  key: string;
  /** Index into the note's headings, or -1 for a later stage. */
  headingIndex: number;
  /** DOM id for a later stage. */
  targetId?: string;
  number: string;
  title: string;
  minutes: number;
  done: boolean;
  /** The heading is on the page (every gate before it answered). */
  reachable: boolean;
}

/** Where the page counts as "at" a heading: just under the phone's 47 px bar. */
const ACTIVE_LINE = 120;
/** The track stays segmented up to this many sections; past it a segment is too thin to read. */
const MAX_SEGMENTS = 11;
/** Put away or out, remembered per device. Storage can be missing (private mode): then it lasts the visit. */
const STORE_KEY = "cairn.contents";

function readOpen(): boolean {
  try {
    return window.localStorage.getItem(STORE_KEY) !== "away";
  } catch {
    return true;
  }
}

function writeOpen(open: boolean): void {
  try {
    window.localStorage.setItem(STORE_KEY, open ? "open" : "away");
  } catch {
    // Nothing to do: the choice still holds for this visit.
  }
}

const reducedMotion = (): boolean => typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A finished section is a stone placed, not a task ticked (01-art-direction.md §2). One stone, never the stack. */
function Stone() {
  return (
    <svg width="14" height="9" viewBox="0 0 14 9" aria-hidden focusable="false" className="text-ink-2">
      <rect x="0.5" y="1" width="13" height="7" rx="3.5" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

/**
 * One segment per section: done ones filled with the accent, the current one outlined (a position, not a second thing
 * to press), the rest on the subject's wash. A fill arrives with a 200 ms scaleX, and not at all under reduced motion.
 */
function Track({ rows, active, tint }: { rows: Row[]; active: number; tint: string }) {
  const sections = rows.filter((r) => r.headingIndex >= 0);
  const done = sections.filter((r) => r.done).length;
  if (sections.length === 0) return null;
  if (sections.length > MAX_SEGMENTS) {
    return (
      <div aria-hidden className={clsx("relative h-[3px] w-full overflow-hidden rounded-full", tint)}>
        <div
          className="absolute inset-0 origin-left rounded-full bg-accent transition-transform duration-[var(--dur)] ease-[var(--ease-out)] motion-reduce:transition-none"
          style={{ transform: `scaleX(${done / sections.length})` }}
        />
      </div>
    );
  }
  return (
    <div aria-hidden className="flex h-[3px] w-full gap-1">
      {sections.map((r) => {
        const i = rows.indexOf(r);
        return (
          <div
            key={r.key}
            className={clsx("relative h-full flex-1 overflow-hidden rounded-full", tint, i === active && !r.done && "shadow-[inset_0_0_0_1px_var(--accent)]")}
          >
            <div
              className="absolute inset-0 origin-left rounded-full bg-accent transition-transform duration-[var(--dur)] ease-[var(--ease-out)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${r.done ? 1 : 0})` }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** A row of the rail or the sheet: number or stone, the title, the minutes in their own right-aligned column. */
function RowButton({ row, current, onClick, sheet = false }: { row: Row; current: boolean; onClick: () => void; sheet?: boolean }) {
  const isSection = row.headingIndex >= 0;
  return (
    <button
      type="button"
      data-current={current || undefined}
      aria-current={current ? "location" : undefined}
      onClick={onClick}
      className={clsx(
        "grid w-full grid-cols-[18px_minmax(0,1fr)_auto] items-baseline gap-x-2 border-l-[3px] text-left text-meta leading-snug",
        // 44 px is the floor for anything she taps, rail rows included (01-art-direction.md §12).
        sheet ? "min-h-11 py-2.5 pl-2.5 pr-3" : "min-h-11 py-2 pl-1.5 pr-2",
        current ? "border-accent bg-accent-3 font-medium text-ink" : "border-transparent text-ink-2 hover:bg-surface-2",
      )}
    >
      <span className="tnum text-micro text-ink-2">
        {isSection ? (
          row.done ? (
            <>
              <Stone />
              <span className="sr-only">Done: </span>
            </>
          ) : (
            row.number
          )
        ) : null}
      </span>
      <span>
        {row.title}
        {isSection && !row.reachable && <span className="sr-only"> (opens after the check before it)</span>}
      </span>
      {/* The minutes are one of --ink-3's three legal uses (01-art-direction.md §4.1). */}
      <span className={clsx("tnum whitespace-nowrap text-micro font-normal", current ? "text-ink-2" : "text-ink-3")}>{row.minutes} min</span>
    </button>
  );
}

export function LessonSpine({ sections, stages, minutes, answered, noteId = "note", tint = "bg-line" }: LessonSpineProps) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<boolean>(() => (typeof window === "undefined" ? true : readOpen()));
  const [sheetOpen, setSheetOpen] = useState(false);
  const targetsRef = useRef<HTMLElement[]>([]);
  const barRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const railListId = useId();
  const sheetId = useId();

  const gatesTotal = sections.reduce((n, s) => n + s.gateIds.length, 0);
  const gatesDone = sections.reduce((n, s) => n + s.gateIds.filter((id) => answered.has(id)).length, 0);
  // A video with no stated length is named beside the minutes, as the hero names it (lesson-plan.ts plusVideos).
  const videos = plusVideos(sections.reduce((n, s) => n + s.untimedVideos, 0));
  // The first gate still to answer: every section after it waits for it.
  const pendingGate = sections.flatMap((s) => s.gateIds).find((id) => !answered.has(id)) ?? null;

  const rows: Row[] = [];
  let reachable = true;
  sections.forEach((s, i) => {
    const onPage = reachable;
    if (s.gateIds.some((id) => !answered.has(id))) reachable = false;
    rows.push({ key: `s${i}`, headingIndex: i, number: String(s.n), title: s.title, minutes: s.minutes, done: false, reachable: onPage });
  });
  // A section is done once she is past it: its gates answered, or, for a section with none, the one after it open.
  rows.forEach((r, i) => {
    const s = sections[i];
    const next = rows[i + 1];
    r.done = s.gateIds.length > 0 ? s.gateIds.every((id) => answered.has(id)) : r.reachable && (next ? next.reachable : pendingGate === null);
  });
  for (const st of stages) rows.push({ key: st.id, headingIndex: -1, targetId: st.id, number: "", title: st.label, minutes: st.minutes, done: false, reachable: true });

  // Re-read the anchors whenever the note opens another stretch (answering a gate re-renders this).
  const collect = useCallback(() => {
    const note = document.getElementById(noteId);
    const headings = note ? Array.from(note.querySelectorAll<HTMLElement>("h3[data-section]")) : [];
    const list: HTMLElement[] = [];
    rows.forEach((r, i) => {
      const el = r.headingIndex >= 0 ? headings[r.headingIndex] : document.getElementById(r.targetId ?? "");
      if (el) list[i] = el;
    });
    targetsRef.current = list;
    return list;
    // rows is derived from props on every render; the dependency that matters is what is revealed.
  }, [noteId, sections.length, stages.length, gatesDone]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const targets = collect();
    const pick = () => {
      let current = 0;
      targets.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= ACTIVE_LINE) current = i;
      });
      setActive(current);
    };
    pick();
    const io = new IntersectionObserver(pick, { rootMargin: "-100px 0px -50% 0px", threshold: [0, 1] });
    for (const el of targets) if (el) io.observe(el);
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [collect]);

  // A tall rail scrolls inside itself; keep the current row in its view, instantly, and only when it has left it.
  useEffect(() => {
    const rail = railRef.current;
    const row = rail?.querySelector<HTMLElement>("[data-current]");
    if (!rail || !row || rail.scrollHeight <= rail.clientHeight) return;
    const r = row.getBoundingClientRect();
    const box = rail.getBoundingClientRect();
    if (r.top < box.top || r.bottom > box.bottom) rail.scrollTop += r.top < box.top ? r.top - box.top - 8 : r.bottom - box.bottom + 8;
  }, [active, open]);

  // The sheet closes on Escape, on a tap outside it, and when a row is chosen; focus goes back to the bar.
  useEffect(() => {
    if (!sheetOpen) return;
    const sheet = sheetRef.current;
    (sheet?.querySelector<HTMLElement>("[data-current]") ?? sheet?.querySelector<HTMLElement>("button"))?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSheetOpen(false);
        barRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!sheetRef.current?.contains(t) && !barRef.current?.contains(t)) setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [sheetOpen]);

  /** Takes her to a row: its heading, or for a section not yet open the check that opens it. Focus goes there too. */
  const go = (i: number) => () => {
    setSheetOpen(false);
    const row = rows[i];
    let el: HTMLElement | null = targetsRef.current[i] ?? collect()[i] ?? null;
    if ((!el || !row.reachable) && row.headingIndex >= 0 && pendingGate) el = document.getElementById(`gate-${pendingGate}-prompt`)?.parentElement ?? el;
    if (!el) return;
    // Clear the phone's own sticky bar, so what she asked for is not hidden under it.
    const clearance = window.innerWidth < 1024 ? 72 : 24;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - clearance, behavior: reducedMotion() ? "auto" : "smooth" });
    focusLanding(el);
  };

  const toggle = () => {
    setOpen((was) => {
      writeOpen(!was);
      return !was;
    });
  };

  if (rows.length === 0) return null;

  const lessonRows = rows.filter((r) => r.headingIndex >= 0);
  const stageRows = rows.filter((r) => r.headingIndex < 0);
  const current = rows[Math.min(active, rows.length - 1)];
  // "3 of 10" inside the lesson; after it, the stage's own name says where she is.
  const position = current.headingIndex >= 0 ? `${current.number} of ${lessonRows.length}` : null;

  return (
    <nav aria-label="Lesson contents" className="sticky top-0 z-20 lg:top-6 lg:z-auto lg:self-start">
      {/* Phone and tablet: the 3 px track and a 44 px bar that opens the sheet. One sticky element, 47 px. */}
      {/* The hairline under the bar is a shadow, not a border, so the bar is exactly 3 + 44 = 47 px. */}
      <div className="relative -mx-4 bg-ground px-4 shadow-[0_1px_0_var(--line)] sm:-mx-6 sm:px-6 lg:hidden">
        <Track rows={rows} active={active} tint={tint} />
        <button
          ref={barRef}
          type="button"
          aria-expanded={sheetOpen}
          aria-controls={sheetId}
          onClick={() => setSheetOpen((v) => !v)}
          className="flex h-11 w-full items-center gap-2 text-left text-meta"
        >
          {position && (
            <>
              <span className="tnum shrink-0 font-medium text-ink">{position}</span>
              <span aria-hidden className="shrink-0 text-ink-3">
                ·
              </span>
            </>
          )}
          <span className={clsx("min-w-0 flex-1 truncate text-ink", !position && "font-medium")}>{current.title}</span>
          <span className="tnum shrink-0 text-ink-3">{current.minutes} min</span>
          <ChevronDown size={18} strokeWidth={1.5} aria-hidden className={clsx("shrink-0 text-ink-2", sheetOpen && "rotate-180")} />
          <span className="sr-only">{sheetOpen ? "Close the contents" : "Open the contents"}</span>
        </button>
        {sheetOpen && (
          <div
            ref={sheetRef}
            id={sheetId}
            className="rise-in absolute inset-x-0 top-full z-30 max-h-[calc(100dvh-9rem)] overflow-y-auto rounded-b-[var(--radius)] border-b border-line-2 bg-surface px-2 py-2 shadow-[var(--shadow-2)]"
          >
            <p className="px-2.5 pb-1 pt-1 text-meta font-medium text-ink-2">The lesson · {minutesHeading(minutes).toLowerCase()}{videos && ` ${videos}`}</p>
            <ol>
              {lessonRows.map((r) => (
                <li key={r.key}>
                  <RowButton row={r} current={rows.indexOf(r) === active} onClick={go(rows.indexOf(r))} sheet />
                </li>
              ))}
            </ol>
            {stageRows.length > 0 && (
              <>
                <p className="mt-2 border-t border-line px-2.5 pb-1 pt-3 text-meta font-medium text-ink-2">Then</p>
                <ul>
                  {stageRows.map((r) => (
                    <li key={r.key}>
                      <RowButton row={r} current={rows.indexOf(r) === active} onClick={go(rows.indexOf(r))} sheet />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {/* Desktop: the rail, or put away to its track. */}
      <div ref={railRef} className="hidden lg:block lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={railListId}
          onClick={toggle}
          className="tap flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] px-1.5 text-left text-meta font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          <span>Contents</span>
          <ChevronDown size={16} strokeWidth={1.5} aria-hidden className={clsx("shrink-0 transition-transform duration-[var(--dur)] ease-[var(--ease-out)] motion-reduce:transition-none", open && "rotate-180")} />
        </button>
        <div className="mt-1 px-1.5">
          <Track rows={rows} active={active} tint={tint} />
        </div>
        {open ? (
          <div id={railListId} className="rise-in mt-3">
            <p className="mb-1.5 px-1.5 text-meta text-ink-2">{minutesHeading(minutes)}{videos && ` ${videos}`}</p>
            <ol className="flex flex-col">
              {lessonRows.map((r) => (
                <li key={r.key}>
                  <RowButton row={r} current={rows.indexOf(r) === active} onClick={go(rows.indexOf(r))} />
                </li>
              ))}
            </ol>
            {gatesTotal > 0 && (
              <p className="tnum mt-2.5 px-1.5 text-meta text-ink-2" role="status" aria-live="polite">
                {gatesDone} of {gatesTotal} checks done
              </p>
            )}
            {stageRows.length > 0 && (
              <>
                <p className="mb-1 mt-4 border-t border-line px-1.5 pt-3 text-meta font-medium text-ink-2">Then</p>
                <ul className="flex flex-col">
                  {stageRows.map((r) => (
                    <li key={r.key}>
                      <RowButton row={r} current={rows.indexOf(r) === active} onClick={go(rows.indexOf(r))} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <p id={railListId} className="tnum mt-2 px-1.5 text-meta text-ink-2">
            {position ?? current.title}
            <span className="sr-only">. The contents are put away; the Contents button brings them back.</span>
          </p>
        )}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------------------------------------------------------
 * Read v2: the track and the Contents popover (art direction v2 §9; TRIAL-BRIEF.md, the read row).
 *
 * One slim bar at the top of the lesson's column: "n of N · 2 min · the section's title" and a Contents button, over a
 * 3 px segmented track. It sticks while the lesson is on screen (hero and note) and leaves with the lesson's end, so the
 * worked examples and the questions after it have nothing above them but the page. It is never beside the text.
 * Contents opens a popover, closed by default and never a standing column: every section with its minutes and the
 * cairn's mark once it is done, then the stages after the lesson. A section not yet open takes her to the check or the
 * Continue that opens it.
 *
 * Segments: done ones filled in the subject's accent, the one in view outlined, the rest on the subject's mid tint. A
 * segment fills when she presses Continue past its section (the place motion, 300 ms; nothing under reduced motion).
 * ------------------------------------------------------------------------------------------------------------------ */

export interface ReadTrackProps {
  /** The note's sections as the server read them, so the bar is drawn before the lesson has loaded. */
  sections: LessonSection[];
  /** The stages after the lesson, for the popover's "Then" rows (empty until the lesson has loaded). */
  stages: SpineStage[];
  /** The whole lesson's minutes, the hero's own number. */
  minutes: number;
  answered: ReadonlySet<string>;
  /** How many sections are open (Continue opens the next). */
  open: number;
  /** She has pressed the lesson's last Continue: every segment is placed. */
  finished: boolean;
  noteId?: string;
}

/** A section counts as the one in view once its opening rule has passed this line under the bar. */
const TRACK_ACTIVE_LINE = 120;

/** What sits under the bar when she is taken somewhere: the bar's own height and a little air. */
function barClearance(bar: HTMLElement | null): number {
  return (bar?.getBoundingClientRect().height ?? 48) + 16;
}

export function ReadTrack({ sections, stages, minutes, answered, open, finished, noteId = "note" }: ReadTrackProps) {
  const [active, setActive] = useState(0);
  const [popover, setPopover] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const total = sections.length;
  const gatesTotal = sections.reduce((n, s) => n + s.gateIds.length, 0);
  const gatesDone = sections.reduce((n, s) => n + s.gateIds.filter((id) => answered.has(id)).length, 0);
  // The same minutes as the hero's Read line, with the same video named beside them (lesson-plan.ts heroPromise).
  const videos = plusVideos(sections.reduce((n, s) => n + s.untimedVideos, 0));
  const pendingGate = sections.flatMap((s) => s.gateIds).find((id) => !answered.has(id)) ?? null;
  // Done: she has moved past it with every check in it answered, or finished the lesson.
  const done = (i: number): boolean => finished || (i + 1 < open && sections[i].gateIds.every((id) => answered.has(id)));

  // Which section is in view, re-read as she scrolls and whenever another section opens. Nothing animates because of it.
  useEffect(() => {
    const pick = () => {
      const opened = Array.from(document.querySelectorAll<HTMLElement>(`#${noteId} [data-lesson-section]`));
      let current = 0;
      for (const el of opened) if (el.getBoundingClientRect().top <= TRACK_ACTIVE_LINE) current = Number(el.dataset.lessonSection) - 1;
      setActive(Math.max(0, Math.min(current, total - 1)));
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [noteId, open, total]);

  // The popover closes on Escape (the keyboard goes back to the button), on a tap outside it, and when focus leaves it.
  useEffect(() => {
    if (!popover) return;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>("[aria-current]") ?? panel?.querySelector<HTMLElement>("button"))?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPopover(false);
      buttonRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setPopover(false);
    };
    const onFocus = (e: FocusEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setPopover(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("focusin", onFocus);
    };
  }, [popover]);

  /**
   * Scrolls a place to just under the bar and puts the keyboard there, as a landing place: the focus ring shows only
   * when the keyboard chose the row (shell/input-modality.ts). A Continue it lands on keeps its ring for the keyboard.
   */
  const take = (place: HTMLElement, focus: HTMLElement = place) => {
    window.scrollTo({ top: place.getBoundingClientRect().top + window.scrollY - barClearance(navRef.current), behavior: reducedMotion() ? "auto" : "smooth" });
    focusLanding(focus);
  };

  const goSection = (i: number) => () => {
    setPopover(false);
    const note = document.getElementById(noteId);
    const wrapper = note?.querySelector<HTMLElement>(`[data-lesson-section="${i + 1}"]`);
    if (wrapper) {
      take(wrapper, wrapper.querySelector<HTMLElement>("[data-section]") ?? wrapper);
      return;
    }
    // Not open yet: the check still to answer, or the Continue that opens the next section.
    const frontier = (pendingGate ? note?.querySelector<HTMLElement>(`[data-gate="${pendingGate}"]`) : null) ?? note?.querySelector<HTMLElement>("[data-continue]");
    if (frontier) take(frontier);
  };

  const goStage = (id: string) => () => {
    setPopover(false);
    const el = document.getElementById(id);
    if (el) take(el);
  };

  if (total === 0) return null;
  const here = sections[Math.min(active, total - 1)];

  return (
    <nav
      ref={navRef}
      aria-label="Lesson contents"
      data-read-track
      // The ground under the bar runs 6-8 px past the track, so a line scrolling beneath is cut clear of it.
      className="sticky top-0 z-20 -mx-4 bg-ground px-4 pb-1.5 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:pb-2 md:pt-1"
    >
      <div className="flex h-11 items-center gap-3">
        <p className="tnum min-w-0 flex-1 truncate text-meta text-ink-2">
          <span className="font-medium text-ink">
            {active + 1} of {total}
          </span>
          <span aria-hidden> · </span>
          <span className="sr-only">, </span>
          {here.minutes} min
          <span aria-hidden> · </span>
          <span className="sr-only">, </span>
          {here.title}
        </p>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={popover}
          aria-controls={panelId}
          onClick={() => setPopover((v) => !v)}
          // 36 px drawn, 44 px to press: the ::after takes the tap target to the bar's full height.
          className="relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border border-line-2 bg-surface px-3 text-meta font-medium text-ink hover:bg-surface-2 after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']"
        >
          Contents
          <ChevronDown size={16} strokeWidth={1.5} aria-hidden className={clsx("shrink-0 text-ink-2", popover && "rotate-180")} />
        </button>
      </div>

      <div aria-hidden className="flex h-[3px] gap-[3px]">
        {total <= MAX_SEGMENTS ? (
          sections.map((s, i) => (
            <div
              key={s.n}
              data-segment={done(i) ? "done" : i === active ? "here" : "rest"}
              className={clsx(
                "relative h-full flex-1 overflow-hidden rounded-full",
                done(i) ? "bg-transparent" : i === active ? "shadow-[inset_0_0_0_1px_var(--accent)]" : "bg-[var(--tint-mid)] opacity-55",
              )}
            >
              <div
                className="absolute inset-0 origin-left rounded-full bg-accent transition-transform duration-[var(--motion-place)] ease-[var(--ease-out)] motion-reduce:transition-none"
                style={{ transform: `scaleX(${done(i) ? 1 : 0})` }}
              />
            </div>
          ))
        ) : (
          <div className="relative h-full flex-1 overflow-hidden rounded-full bg-[var(--tint-mid)]">
            <div
              className="absolute inset-0 origin-left rounded-full bg-accent transition-transform duration-[var(--motion-place)] ease-[var(--ease-out)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${sections.filter((_, i) => done(i)).length / total})` }}
            />
          </div>
        )}
      </div>

      {popover && (
        <div
          ref={panelRef}
          id={panelId}
          className="motion-reveal absolute right-4 top-full z-30 mt-2 max-h-[min(70vh,calc(100dvh-8rem))] w-[min(340px,calc(100%-2rem))] overflow-y-auto rounded-[var(--radius)] border border-line-2 bg-surface p-2 shadow-[var(--shadow-2)] sm:right-6 sm:w-[min(340px,calc(100%-3rem))] md:right-0 md:w-[340px]"
        >
          <p className="tnum px-2.5 pb-1.5 pt-1 text-meta font-medium text-ink-2">
            The lesson · {minutesHeading(minutes).toLowerCase()}
            {videos && ` ${videos}`}
            {gatesTotal > 0 && ` · ${gatesDone} of ${gatesTotal} checks`}
          </p>
          <ol className="flex flex-col">
            {sections.map((s, i) => {
              const isHere = i === active;
              const isOpen = i + 1 <= open;
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    aria-current={isHere ? "location" : undefined}
                    onClick={goSection(i)}
                    className={clsx(
                      "grid min-h-11 w-full grid-cols-[20px_minmax(0,1fr)_auto] items-baseline gap-x-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-meta leading-snug",
                      isHere ? "bg-[var(--tint-wash)] font-medium text-ink shadow-[inset_3px_0_0_var(--accent)]" : isOpen ? "text-ink hover:bg-surface-2" : "text-ink-2 hover:bg-surface-2",
                    )}
                  >
                    <span className="tnum text-micro text-ink-2">
                      {done(i) ? (
                        <>
                          {/* A section done is a small cairn built, the canvas's mark at 12 px. */}
                          <CairnMark size={12} className="text-ink-2" />
                          <span className="sr-only">Done: </span>
                        </>
                      ) : (
                        s.n
                      )}
                    </span>
                    <span>
                      {s.title}
                      {!isOpen && <span className="sr-only"> (opens after the check before it)</span>}
                    </span>
                    <span className="tnum whitespace-nowrap text-micro font-normal text-ink-3">{s.minutes} min</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {stages.length > 0 && (
            <>
              <p className="mt-2 border-t border-line px-2.5 pb-1 pt-3 text-meta font-medium text-ink-2">Then</p>
              <ul className="flex flex-col">
                {stages.map((st) => (
                  <li key={st.id}>
                    <button
                      type="button"
                      onClick={goStage(st.id)}
                      className="grid min-h-11 w-full grid-cols-[20px_minmax(0,1fr)_auto] items-baseline gap-x-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-meta leading-snug text-ink hover:bg-surface-2"
                    >
                      <span aria-hidden />
                      <span>{st.label}</span>
                      <span className="tnum whitespace-nowrap text-micro font-normal text-ink-3">{st.minutes} min</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
