"use client";

/**
 * Untimed run to criterion over a small deck (equations, definitions, key words).
 * A card retires once answered correctly `criterion` times in a row; a miss sends it to
 * the back. Self-check is keyword-assisted with an override, the counter says "3 left",
 * and the time to criterion is reported at the end.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import { formatMs } from "./format";
import { answerCurrent, createSprint, currentId, isFinished, remaining, selfCheck, sprintStats, type SprintCard, type SprintStats } from "./sprint";
import { Tex } from "./Tex";
import { btnCheck, btnPrimary, btnSecondary, cardCls, Eyebrow, fieldCls, MissMark, Rise, Tick } from "./ui";

export type { SprintCard, SprintStats } from "./sprint";

export interface RecallSprintProps {
  deck: SprintCard[];
  /** Consecutive correct answers each card needs (default 1). */
  criterion?: number;
  onFinish: (stats: SprintStats) => void;
  title?: string;
}

export function RecallSprint({ deck, criterion = 1, onFinish, title = "Recall sprint" }: RecallSprintProps) {
  const [state, setState] = useState(() => createSprint(deck, criterion));
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const startedAt = useRef<number | null>(null);
  const finishedMs = useRef<number | null>(null);
  const reported = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const byId = useMemo(() => new Map(deck.map((c) => [c.id, c])), [deck]);
  const id = currentId(state);
  const card = id ? byId.get(id) ?? null : null;
  const finished = isFinished(state);
  const left = remaining(state);
  const check = card && revealed ? selfCheck(typed, card) : null;

  useEffect(() => {
    startedAt.current = performance.now();
    finishedMs.current = null;
    reported.current = false;
  }, [runKey]);

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      finishedMs.current = performance.now() - (startedAt.current ?? performance.now());
      onFinish(sprintStats(state, finishedMs.current));
    }
  }, [finished, state, onFinish]);

  const interacted = useRef(false);
  useEffect(() => {
    // Focus follows the flow once she has started; the first card never scrolls the page on mount.
    if (revealed) confirmRef.current?.focus({ preventScroll: true });
    else if (interacted.current) inputRef.current?.focus({ preventScroll: true });
  }, [revealed, id]);

  const record = (correct: boolean) => {
    interacted.current = true;
    setState((s) => answerCurrent(s, correct));
    setTyped("");
    setRevealed(false);
  };

  const restart = () => {
    setState(createSprint(deck, criterion));
    setTyped("");
    setRevealed(false);
    setRunKey((k) => k + 1);
  };

  if (deck.length === 0) {
    return (
      <section className={cardCls}>
        <Eyebrow>{title}</Eyebrow>
        <p className="mt-2 text-ui text-ink-2">Nothing to recall yet.</p>
      </section>
    );
  }

  if (finished) {
    const stats = sprintStats(state, finishedMs.current ?? 0);
    return (
      <section className={cardCls} aria-live="polite">
        <Eyebrow>{title} · done</Eyebrow>
        <p className="tnum mt-2 text-[26px] font-semibold tracking-tight">
          {formatMs(stats.totalMs)} <span className="text-ui font-normal text-ink-2">to criterion</span>
        </p>
        <p className="mt-1 text-ui text-ink-2">
          {stats.cards} card{stats.cards === 1 ? "" : "s"} · {stats.attempts} attempt{stats.attempts === 1 ? "" : "s"} ·{" "}
          {stats.misses === 0 ? "no recycles" : `${stats.misses} recycled`}
        </p>
        {stats.misses > 0 && (
          <ul className="mt-3 space-y-1 text-meta text-ink-2">
            {stats.perCard
              .filter((c) => c.misses > 0)
              .map((c) => (
                <li key={c.id} className="flex items-baseline gap-2">
                  <span className="tnum shrink-0 text-ink-2">×{c.misses}</span>
                  <span>
                    <Tex text={byId.get(c.id)?.prompt ?? c.id} />
                  </span>
                </li>
              ))}
          </ul>
        )}
        <div className="mt-4">
          <button type="button" className={btnSecondary} onClick={restart}>
            <RotateCcw size={16} aria-hidden /> Run again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={cardCls} aria-label={title}>
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>{title}</Eyebrow>
        <span className="tnum text-meta font-medium text-ink-2" role="status" aria-live="polite">
          {left} left
        </span>
      </div>
      {card && (
        <div key={`${runKey}-${id}-${state.attempts[card.id] ?? 0}`}>
          <p className="mt-2 text-[19px] font-medium leading-snug">
            <Tex text={card.prompt} />
          </p>
          {!revealed ? (
            <form
              className="mt-3"
              onSubmit={(e) => {
                e.preventDefault();
                setRevealed(true);
              }}
            >
              <label htmlFor={`sprint-${card.id}`} className="sr-only">
                Your answer
              </label>
              <textarea
                ref={inputRef}
                id={`sprint-${card.id}`}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    setRevealed(true);
                  }
                }}
                rows={2}
                placeholder="Type it from memory"
                autoComplete="off"
                spellCheck={false}
                className={clsx(fieldCls, "text-[16px]")}
              />
              <div className="mt-2 flex items-center gap-3">
                <button type="submit" className={btnCheck}>
                  Show answer
                </button>
                <span className="text-meta text-ink-2">Enter to reveal</span>
              </div>
            </form>
          ) : (
            <Rise as="div" className="mt-3">
              <div className="rounded-[var(--radius-sm)] border border-line bg-surface-2/60 px-3.5 py-3">
                <p className="text-meta font-medium text-ink-2">Answer</p>
                <p className="mt-1 text-[16px] leading-relaxed">
                  <Tex text={card.answer} />
                </p>
                {typed.trim() && (
                  <p className="mt-2 text-meta text-ink-2">
                    <span className="text-ink-2">You wrote: </span>
                    {typed}
                  </p>
                )}
                {check && card.keyWords && card.keyWords.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Key words">
                    {card.keyWords.map((k) => {
                      const present = check.present.includes(k);
                      return (
                        <li key={k} className={clsx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-meta", present ? "border-ink-3 text-ink" : "border-line-2 text-ink-2")}>
                          {present ? <Tick size={12} label="present" /> : <MissMark size={12} label="missing" />}
                          {k}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {check && (
                  <p className="mt-1.5 text-meta text-ink-2">
                    {check.verdict === "match" && "Matches the answer."}
                    {check.verdict === "keywords" && "Every key word is there — looks right."}
                    {check.verdict === "missing" && `Missing: ${check.missing.join(", ")}. Say it again with those words.`}
                    {check.verdict === "unknown" && "Compare with the answer and be honest — it comes back either way."}
                  </p>
                )}
              </div>
              <div role="group" aria-label="Did you get it?" className="mt-3 grid grid-cols-2 gap-2">
                <button ref={check?.suggested === false ? undefined : confirmRef} type="button" className={clsx(check?.suggested === false ? btnSecondary : btnPrimary, "min-h-[52px]")} onClick={() => record(true)}>
                  <Tick size={18} label="" /> Got it
                </button>
                <button ref={check?.suggested === false ? confirmRef : undefined} type="button" className={clsx(check?.suggested === false ? btnPrimary : btnSecondary, "min-h-[52px]")} onClick={() => record(false)}>
                  <MissMark size={18} label="" /> Not yet
                </button>
              </div>
            </Rise>
          )}
        </div>
      )}
    </section>
  );
}
