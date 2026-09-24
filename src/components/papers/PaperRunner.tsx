"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Ban, Calculator, CircleCheck, ExternalLink, FileText, Info, Lock, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import type { Series } from "@/lib/grades/ums";
import type { Mock } from "@/lib/db/db";
import {
  CCEA_LINK_NOTICE,
  SERIES_LABEL,
  defaultSeriesFor,
  engineUnit,
  formatMinutes,
  isMathsCompletion,
  runnerHref,
  sessionLabel,
  subjectLabel,
  unitLabel,
  type RunnerPaper,
} from "@/lib/papers/meta";
import { composeSavedUnits, computePaperResult } from "@/lib/papers/result";
import { umsLine } from "@/lib/papers/plan-view";
import { saveMock, useAllMocks } from "@/lib/papers/runs";
import { useCompanionContext, type CompanionContext } from "@/lib/companion";
import { CompanionLine } from "@/components/companion/CompanionLine";
import { PageHeader, locatorCls } from "@/components/shell/PageHeader";
import { Timer, elapsedMs, isPaused, pausedMs, type RunClock } from "./Timer";
import { SelfMarkGrid, gridTotals, rowsFromTemplate, type GridRow } from "./SelfMarkGrid";
import { UmsResult } from "./UmsResult";

type Phase = "preflight" | "running" | "marking" | "result";

interface RunState {
  phase: Phase;
  clock: RunClock | null;
  rows: GridRow[];
  series: Series;
  savedId: number | null;
}

const STORAGE_PREFIX = "cairn:paper-run:";

function storageKey(paperId: string): string {
  return `${STORAGE_PREFIX}${paperId}`;
}

function loadState(paperId: string): RunState | null {
  try {
    const raw = localStorage.getItem(storageKey(paperId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RunState;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.rows)) return null;
    return { ...parsed, savedId: parsed.savedId ?? null };
  } catch {
    return null;
  }
}

function persist(paperId: string, state: RunState | null) {
  try {
    if (!state || (state.phase === "preflight" && !state.clock)) localStorage.removeItem(storageKey(paperId));
    else localStorage.setItem(storageKey(paperId), JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode); the run still works for this page load.
  }
}

const card = "rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)] sm:p-6";
const primaryBtn = "tap inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 text-ui font-semibold text-accent-ink hover:opacity-95";
const secondaryBtn = "tap inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-line-2 bg-surface px-4 text-ui font-medium hover:bg-surface-2";
const quietBtn = "tap inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 text-meta text-ink-2 hover:bg-surface-2 hover:text-ink";

function OfficialLink({ href, children, strong = false }: { href: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(strong ? secondaryBtn : "tap inline-flex items-center gap-1.5 text-ui text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-ink")}
    >
      <ExternalLink size={15} aria-hidden /> {children}
    </a>
  );
}

function formatWhen(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function PreviousRuns({ runs }: { runs: Mock[] }) {
  if (runs.length === 0) return null;
  return (
    <div>
      <p className="text-meta font-medium text-ink-2">Previous runs of this paper</p>
      <ul className="mt-2 divide-y divide-line rounded-[var(--radius-sm)] border border-line">
        {runs.map((r) => (
          <li key={r.id ?? `${r.at}`} className="tnum flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 py-2 text-meta">
            <span className="text-ink-2">{formatWhen(r.at)}</span>
            <span className="font-medium">
              {r.raw}/{r.rawMax} raw
            </span>
            <span className="text-ink-2">
              {r.ums} UMS · unit grade {r.grade}
              {r.estimated ? " (est.)" : ""}
            </span>
            <span className="text-ink-2">
              {r.minutesUsed} min{r.paused > 0 ? `, paused ${r.paused === 1 ? "once" : `${r.paused} times`}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** What to have on the desk, in the order the invigilator would check it. */
function readyList(paper: RunnerPaper): Array<{ icon: React.ReactNode; text: string }> {
  const items: Array<{ icon: React.ReactNode; text: string }> = [];
  const calc = paper.subject === "science" ? true : paper.calculator ?? true;
  items.push(
    calc
      ? { icon: <Calculator size={16} aria-hidden />, text: "Scientific calculator, in degrees mode" }
      : { icon: <Ban size={16} aria-hidden />, text: "No calculator on this paper. Put it out of reach." },
  );
  if (paper.subject !== "science") items.push({ icon: <FileText size={16} aria-hidden />, text: "Black pen, pencil, ruler, protractor and compasses" });
  else items.push({ icon: <FileText size={16} aria-hidden />, text: "Black pen, pencil and ruler" });
  const fs = paper.template.formulaSheetPage;
  if (fs) items.push({ icon: <Info size={16} aria-hidden />, text: `The formula sheet is printed on page ${fs} of the paper; nothing else is provided.` });
  const discipline = paper.subject === "science" ? (paper.unit === "U7" ? paper.discipline : paper.unit.startsWith("C") ? "Chemistry" : paper.unit.startsWith("P") ? "Physics" : "Biology") : null;
  if (discipline === "Chemistry") {
    items.push({ icon: <Info size={16} aria-hidden />, text: "The Data Leaflet with the Periodic Table is supplied with every Chemistry paper; it is inside the PDF." });
  }
  if (discipline === "Physics") {
    items.push({ icon: <Info size={16} aria-hidden />, text: "No formula sheet in Physics: the equations come from memory, and the equation line is marked." });
  }
  if (paper.unit === "U7" && paper.booklet === "B") {
    items.push({ icon: <Info size={16} aria-hidden />, text: "In the real sitting this 30-minute booklet follows straight after the Unit 2 paper." });
  }
  items.push({ icon: <Lock size={16} aria-hidden />, text: "Feedback is withheld until you finish: the mark scheme link appears only after the timer stops." });
  return items;
}

/**
 * The running screen is a room of its own (02-surfaces.md §5: "no progress, no question list, no companion, no
 * navigation — the bottom tabs are hidden"): a full-screen layer over the app, so neither the tab bar nor the side
 * rail is there to tap away to mid-paper, at any width. It is a modal dialog in the accessible sense too: the page
 * underneath does not scroll, focus starts on the first control and Tab stays inside, and leaving (Finish or
 * Discard) hands focus back. Nothing in the shell changes; the room simply covers it while the clock runs.
 */
function RunningRoom({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const room = ref.current;
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      room ? Array.from(room.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')) : [];
    focusable()[0]?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const all = focusable();
      if (all.length === 0) return;
      const first = all[0];
      const last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!room?.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      before?.focus?.({ preventScroll: true });
    };
  }, []);
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="running-heading"
      data-testid="running-room"
      className="fixed inset-0 z-50 overflow-y-auto bg-ground"
    >
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-10">
        <h2 id="running-heading" className={locatorCls}>
          {label}
        </h2>
        <div className="flex flex-1 flex-col justify-center py-8">{children}</div>
      </div>
    </div>
  );
}

export function PaperRunner({ paper }: { paper: RunnerPaper }) {
  const [state, setState] = useState<RunState>(() => ({
    phase: "preflight",
    clock: null,
    rows: [],
    series: defaultSeriesFor(paper),
    savedId: null,
  }));
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Restore a run in progress (she may have gone to Paper 2 and come back) before the first
  // paint, so the server-rendered pre-flight card never flashes over a live timer.
  useLayoutEffect(() => {
    const restored = loadState(paper.id);
    if (restored) setState(restored);
    setHydrated(true);
  }, [paper.id]);

  useEffect(() => {
    if (!hydrated) return;
    persist(paper.id, state.savedId !== null ? null : state);
  }, [state, hydrated, paper.id]);

  const mocks = useAllMocks();
  const saved = useMemo(() => composeSavedUnits(mocks ?? []), [mocks]);
  const previousRuns = useMemo(() => (mocks ?? []).filter((m) => m.paperId === paper.id), [mocks, paper.id]);

  const patch = useCallback((p: Partial<RunState>) => setState((s) => ({ ...s, ...p })), []);

  /**
   * The `mock-entered` slot: the run as it was filed, read back from the row `saveMock` wrote, so
   * the unit, the subject and the time are the database's and not this component's. The mark, the
   * UMS and the grade are never passed: the selector has no slot for them.
   */
  const savedMock = useMemo(
    () => (state.savedId === null ? null : ((mocks ?? []).find((m) => m.id === state.savedId) ?? null)),
    [mocks, state.savedId],
  );
  const live = useCompanionContext({
    mock: savedMock ? { unit: savedMock.unit, subject: savedMock.subject, at: savedMock.at } : null,
    questionVisible: false,
  });

  // One line per run filed. Recording the line writes to `companionState`, a row the live context
  // reads, so the next read would find it inside the cooldown and swap the line; the first context
  // that carries the filed run is the one to keep. A fresh run clears it.
  const held = useRef<CompanionContext | undefined>(undefined);
  if (!savedMock) held.current = undefined;
  else if (live?.flags.mockEntered && !held.current) held.current = live;
  const companion = savedMock ? held.current : undefined;

  const start = () => {
    patch({ phase: "running", clock: { startedAt: Date.now(), pauses: [], finishedAt: null }, rows: rowsFromTemplate(paper.template), savedId: null });
  };
  const pause = () =>
    setState((s) => (s.clock && !isPaused(s.clock) ? { ...s, clock: { ...s.clock, pauses: [...s.clock.pauses, { at: Date.now(), until: null }] } } : s));
  const resume = () =>
    setState((s) => {
      if (!s.clock || !isPaused(s.clock)) return s;
      const pauses = s.clock.pauses.slice();
      pauses[pauses.length - 1] = { ...pauses[pauses.length - 1], until: Date.now() };
      return { ...s, clock: { ...s.clock, pauses } };
    });
  const finish = () =>
    setState((s) => {
      if (!s.clock) return s;
      const now = Date.now();
      const pauses = s.clock.pauses.map((p) => (p.until === null ? { ...p, until: now } : p));
      return { ...s, phase: "marking", clock: { ...s.clock, pauses, finishedAt: now } };
    });
  const discard = () => {
    if (!window.confirm("Discard this run? The timer and any marks you entered will be lost.")) return;
    setState({ phase: "preflight", clock: null, rows: [], series: defaultSeriesFor(paper), savedId: null });
    setSaveError(null);
  };

  const totals = gridTotals(state.rows);

  /** The close line: this paper's raw, the unit's UMS and the unit grade, from the same conversion the dial uses. */
  const result = useMemo(
    () => computePaperResult(paper, totals.awarded, state.series, saved),
    [paper, totals.awarded, state.series, saved],
  );

  const save = async () => {
    if (!state.clock) return;
    setSaving(true);
    setSaveError(null);
    try {
      const model = result;
      const id = await saveMock({
        at: new Date(),
        paperId: paper.id,
        subject: paper.subject,
        unit: paper.unit,
        engineUnit: engineUnit(paper),
        sessionKey: paper.sessionKey,
        tier: paper.tier,
        paperNumber: paper.paperNumber,
        discipline: paper.discipline,
        booklet: paper.booklet,
        minutesUsed: Math.round(elapsedMs(state.clock) / 60_000),
        paused: state.clock.pauses.length,
        pausedMinutes: Math.round(pausedMs(state.clock) / 60_000),
        marks: state.rows.map((r) => ({ q: r.q, awarded: r.awarded ?? 0, available: r.available ?? undefined, tags: r.tags })),
        raw: Math.min(paper.marks, totals.awarded),
        rawMax: paper.marks,
        ums: model.unit.ums,
        grade: model.unit.grade,
        series: state.series,
        estimated: model.estimated || model.assumed,
      });
      patch({ savedId: id });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save this run.");
    } finally {
      setSaving(false);
    }
  };

  const title = unitLabel(paper);
  const session = sessionLabel(paper.sessionKey);
  const msMissing = !paper.markSchemeUrl;
  const sibling = paper.sibling;
  /** The Paper 2 that follows this Paper 1 in a completion test (M5–M8). */
  const nextPaper = sibling && paper.paperNumber === 1 && isMathsCompletion(paper.unit) ? sibling : null;

  return (
    <>
      <PageHeader
        eyebrow={`${subjectLabel(paper.subject)} · ${session}`}
        title={title}
        lede={`${paper.marks} marks · ${formatMinutes(paper.durationMinutes)}${paper.template.pageCount ? ` · ${paper.template.pageCount} pages` : ""}`}
        actions={
          <Link href="/papers/" className={quietBtn}>
            <ArrowLeft size={16} aria-hidden /> Your papers
          </Link>
        }
      />

      {state.phase === "preflight" ? (
        <section className={clsx(card, "rise-in")} aria-labelledby="preflight-heading">
          <h2 id="preflight-heading" className="text-[18px] font-semibold">Before you start</h2>
          <ul className="mt-3 space-y-2 text-ui">
            {readyList(paper).map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-ink-3">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <OfficialLink href={paper.url} strong>
              Open paper (ccea.org.uk)
            </OfficialLink>
            {msMissing ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 text-meta text-ink-2">
                <Info size={14} aria-hidden /> Mark scheme not yet published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-meta text-ink-2">
                <Lock size={14} aria-hidden /> Mark scheme unlocks when you finish
              </span>
            )}
          </div>
          <p className="mt-2 text-meta text-ink-2">{CCEA_LINK_NOTICE} © CCEA.</p>

          {sibling && (
            <p className="mt-4 flex items-start gap-2 text-meta text-ink-2">
              <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
              <span>
                {paper.unit} is sat as two papers. This is Paper {paper.paperNumber};{" "}
                {sibling.runnable ? (
                  <Link href={runnerHref(sibling.id)} className="underline decoration-line-2 underline-offset-4 hover:text-ink">
                    {sibling.label}
                  </Link>
                ) : (
                  sibling.label
                )}{" "}
                is the other half. The unit UMS uses both.
              </span>
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={start} className={primaryBtn}>
              Start timer · {formatMinutes(paper.durationMinutes)}
            </button>
            <span className="text-meta text-ink-2">Real minutes. You can pause, and every pause is recorded.</span>
          </div>

          {previousRuns.length > 0 && (
            <div className="mt-6">
              <PreviousRuns runs={previousRuns} />
            </div>
          )}
        </section>
      ) : state.phase === "running" && state.clock ? (
        <RunningRoom label={`${title} · ${session}`}>
          <Timer clock={state.clock} durationMinutes={paper.durationMinutes} rows={paper.template.rows} onPause={pause} onResume={resume} onFinish={finish} />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-line pt-4 text-meta">
            <OfficialLink href={paper.url}>Open paper (ccea.org.uk)</OfficialLink>
            <span className="inline-flex items-center gap-1.5 text-ink-2">
              <Lock size={16} strokeWidth={1.5} aria-hidden /> Feedback withheld until you finish
            </span>
            <button type="button" onClick={discard} className={quietBtn}>
              <RotateCcw size={16} strokeWidth={1.5} aria-hidden /> Discard run
            </button>
          </div>
        </RunningRoom>
      ) : state.clock ? (
        <div className="space-y-4">
          {nextPaper && (
            <section className={clsx(card, "rise-in")} aria-labelledby="p2-heading">
              <h2 id="p2-heading" className="text-[16px] font-semibold">Paper 2 next</h2>
              <p className="mt-1 text-meta text-ink-2">
                In the real sitting {nextPaper.label} follows after a short break. Your marks here are kept on this device, so you can sit Paper 2 now and mark both afterwards.
              </p>
              {nextPaper.runnable && (
                <Link href={runnerHref(nextPaper.id)} className={clsx(secondaryBtn, "mt-3")}>
                  Go to {nextPaper.label} <ArrowRight size={16} aria-hidden />
                </Link>
              )}
            </section>
          )}

          <section className={clsx(card, "rise-in")} aria-labelledby="mark-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="mark-heading" className="text-[18px] font-semibold">Mark it yourself</h2>
                <p className="tnum mt-1 text-meta text-ink-2">
                  Finished in {formatMinutes(Math.round(elapsedMs(state.clock) / 60_000))} of {formatMinutes(paper.durationMinutes)}
                  {state.clock.pauses.length > 0 && ` · paused ${state.clock.pauses.length === 1 ? "once" : `${state.clock.pauses.length} times`} (${Math.round(pausedMs(state.clock) / 60_000)} min)`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <OfficialLink href={paper.url}>Paper</OfficialLink>
                {paper.markSchemeUrl ? (
                  <OfficialLink href={paper.markSchemeUrl} strong>
                    Open mark scheme
                  </OfficialLink>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 text-meta text-ink-2">
                    <Info size={14} aria-hidden /> Mark scheme not yet published
                  </span>
                )}
              </div>
            </div>
            <p className="mt-3 text-meta text-ink-2">
              Open the official mark scheme in its tab and work through it question by question. Enter the marks awarded; where marks were lost, tag each one so the ledger can show where they go.
              {msMissing && " CCEA usually publishes the scheme a few months after the sitting; until then, mark against your own working and come back to adjust."}
            </p>
            <div className="mt-4">
              <SelfMarkGrid rows={state.rows} onChange={(rows) => patch({ rows })} paperMarks={paper.marks} paperUrl={paper.url} template={paper.template} />
            </div>
            {state.phase === "marking" && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => patch({ phase: "result" })} className={primaryBtn} disabled={totals.entered === 0} aria-disabled={totals.entered === 0}>
                  See UMS result <ArrowRight size={16} aria-hidden />
                </button>
                {totals.entered === 0 && <span className="text-meta text-ink-2">Enter at least one mark first.</span>}
                <button type="button" onClick={discard} className={quietBtn}>
                  <RotateCcw size={14} aria-hidden /> Discard run
                </button>
              </div>
            )}
          </section>

          {state.phase === "result" && (
            <section className={clsx(card, "rise-in")} aria-labelledby="result-heading">
              <h2 id="result-heading" className="text-[18px] font-semibold">UMS result</h2>
              <div className="mt-4">
                <UmsResult paper={paper} raw={totals.awarded} series={state.series} onSeriesChange={(series) => patch({ series })} saved={saved} />
              </div>
              <p className="tnum mt-5 text-[16px] font-medium" data-testid="ums-line">
                {umsLine({
                  raw: result.paperRaw,
                  rawMax: result.paperRawMax,
                  ums: result.unit.ums,
                  grade: result.unit.grade,
                  estimated: result.estimated || result.assumed,
                })}
              </p>
              <p className="mt-1 text-meta text-ink-2">
                {unitLabel(paper)}, {SERIES_LABEL[state.series]} boundaries. The UMS is the unit&rsquo;s, out of {result.umsMax}.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                {state.savedId === null ? (
                  <>
                    <button type="button" onClick={save} className={primaryBtn} disabled={saving} aria-disabled={saving}>
                      {saving ? "Saving…" : "Save this run"}
                    </button>
                    <button type="button" onClick={() => patch({ phase: "marking" })} className={secondaryBtn}>
                      <ArrowLeft size={16} aria-hidden /> Back to marks
                    </button>
                    <button type="button" onClick={discard} className={quietBtn}>
                      <RotateCcw size={14} aria-hidden /> Discard run
                    </button>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-2 text-ui font-medium" role="status">
                      <CircleCheck size={18} aria-hidden /> Saved on this device
                    </span>
                    {nextPaper?.runnable && (
                      <Link href={runnerHref(nextPaper.id)} className={secondaryBtn}>
                        {nextPaper.label} <ArrowRight size={16} aria-hidden />
                      </Link>
                    )}
                    <Link href="/papers/" className={secondaryBtn}>
                      <ArrowLeft size={16} aria-hidden /> Back to your papers
                    </Link>
                    <button type="button" onClick={() => setState({ phase: "preflight", clock: null, rows: [], series: defaultSeriesFor(paper), savedId: null })} className={quietBtn}>
                      <RotateCcw size={14} aria-hidden /> Run again
                    </button>
                  </>
                )}
                {saveError && (
                  <p className="flex items-center gap-1.5 text-meta" role="alert">
                    <Info size={14} aria-hidden /> {saveError}
                  </p>
                )}
              </div>
              <CompanionLine moment="mock-entered" context={companion} className="mt-4" />
              {previousRuns.length > 0 && (
                <div className="mt-6">
                  <PreviousRuns runs={previousRuns} />
                </div>
              )}
            </section>
          )}
        </div>
      ) : null}
    </>
  );
}
