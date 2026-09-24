"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { clsx } from "clsx";
import type { QuestionRow } from "@/lib/papers/meta";

/** Wall-clock record of a run: pauses are allowed but every one is kept. */
export interface RunClock {
  startedAt: number;
  pauses: Array<{ at: number; until: number | null }>;
  finishedAt: number | null;
}

export function isPaused(clock: RunClock): boolean {
  const last = clock.pauses[clock.pauses.length - 1];
  return !!last && last.until === null;
}

export function pausedMs(clock: RunClock, now: number = Date.now()): number {
  const end = clock.finishedAt ?? now;
  return clock.pauses.reduce((s, p) => s + Math.max(0, (p.until ?? end) - p.at), 0);
}

/** Working time so far (pauses excluded), frozen once finished. */
export function elapsedMs(clock: RunClock, now: number = Date.now()): number {
  const end = clock.finishedAt ?? now;
  return Math.max(0, end - clock.startedAt - pausedMs(clock, end));
}

export function formatClock(ms: number): string {
  const total = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

/** Re-renders on a half-second tick while `active`; wall-clock based so background tabs stay honest. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 500);
    const onVisible = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active]);
  return now;
}

/** Which question a candidate working at CCEA pace (marks per minute) would have reached. */
export function paceQuestion(rows: readonly QuestionRow[], elapsed: number, durationMs: number): string | null {
  const marked = rows.filter((r) => typeof r.available === "number");
  if (marked.length < 2 || durationMs <= 0) return null;
  const total = marked.reduce((s, r) => s + (r.available ?? 0), 0);
  const target = (elapsed / durationMs) * total;
  let cumulative = 0;
  for (const r of marked) {
    cumulative += r.available ?? 0;
    if (cumulative >= target) return r.q;
  }
  return marked[marked.length - 1].q;
}

export function Timer({
  clock,
  durationMinutes,
  rows,
  onPause,
  onResume,
  onFinish,
}: {
  clock: RunClock;
  durationMinutes: number;
  rows: readonly QuestionRow[];
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}) {
  const paused = isPaused(clock);
  const now = useNow(!paused && clock.finishedAt === null);
  const durationMs = durationMinutes * 60_000;
  const elapsed = elapsedMs(clock, now);
  const remaining = durationMs - elapsed;
  const over = remaining < 0;

  // Announce at minute granularity only: a live region that changes every second is noise.
  const minutesLeft = Math.ceil(remaining / 60_000);
  const announcement = useMemo(() => {
    if (paused) return "Timer paused";
    if (over) {
      const m = Math.floor(-remaining / 60_000);
      return m === 0 ? "Time is up" : `${m} minute${m === 1 ? "" : "s"} over time`;
    }
    if (minutesLeft <= 1) return "Under a minute left";
    return `${minutesLeft} minutes left`;
  }, [paused, over, minutesLeft, remaining]);

  const pace = paceQuestion(rows, elapsed, durationMs);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div>
        <p className="text-meta font-medium text-ink-2">
          {paused ? "Paused" : over ? "Over time" : "Time left"}
        </p>
        <p
          className={clsx("tnum mt-1 text-[48px] font-semibold leading-none tracking-tight sm:text-[64px]", over && "underline decoration-2 underline-offset-8")}
          aria-hidden
        >
          {over ? "+" : ""}
          {formatClock(remaining)}
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
        <p className="tnum mt-2 text-meta text-ink-2">
          {formatClock(elapsed)} of {formatClock(durationMs)} used
          {clock.pauses.length > 0 && (
            <>
              {" · "}paused {clock.pauses.length === 1 ? "once" : `${clock.pauses.length} times`} ({Math.round(pausedMs(clock, now) / 60_000)} min)
            </>
          )}
        </p>
        {pace && !over && (
          <p className="mt-1 text-meta text-ink-2">At CCEA pace you would be around question {pace} by now.</p>
        )}
        {over && <p className="mt-1 text-meta text-ink-2">The real paper would have been collected. Finish and mark it.</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {paused ? (
          <button type="button" onClick={onResume} className="tap tap-lg inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-line-3 bg-surface px-5 text-ui font-medium hover:bg-surface-2">
            <Play size={16} strokeWidth={1.5} aria-hidden /> Resume
          </button>
        ) : (
          <button type="button" onClick={onPause} className="tap tap-lg inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-line-3 bg-surface px-5 text-ui font-medium hover:bg-surface-2">
            <Pause size={16} strokeWidth={1.5} aria-hidden /> Pause
          </button>
        )}
        <button type="button" onClick={onFinish} className="tap tap-lg inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 text-ui font-semibold text-accent-ink hover:opacity-95">
          <Square size={16} strokeWidth={1.5} aria-hidden /> Finish paper
        </button>
      </div>
    </div>
  );
}
