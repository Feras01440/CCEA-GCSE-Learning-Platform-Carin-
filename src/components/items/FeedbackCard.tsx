"use client";

/**
 * What she sees after every Check. Correct: a tick that draws in, one line, Next.
 * A miss: the expected answer, a one-line process diagnosis, the examiner's sentence
 * with its series, and "Fix it now" when a twin exists. The word "Wrong" never appears.
 * After two misses the EncouragementCard offers a hint or a worked example instead of
 * a third go.
 *
 * The marked object (docs/design/art-direction/02-surfaces.md §4.2, as amended by 04-critique.md R4): a marked
 * answer is a visibly different object from an unmarked one at arm's length. Its whole edge changes, a 2 px border in
 * the outcome colour against the 1 px hairline of every unmarked object, with a 4 px rule down the left; the verdict
 * word is 21 px; the marks are a meter and a count, "0 of 2 marks", and where the caller passes the scheme, the
 * scheme's own codes, earned or struck. The colour is quiet (never red: --miss is the warm neutral of the ink) and the
 * facts are blunt: a not-yet card always shows "0 of N" and, with a scheme, a struck code.
 *
 * Structure only: every sentence here is the one this card has always said, except "It comes back …", which is read
 * from her review card (src/lib/session/record.ts creates one for every marked attempt, whatever its kind) and so says
 * the day it is actually due.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, Lightbulb, Quote, Wrench, BookOpen } from "lucide-react";
import { clsx } from "clsx";
import type { MarkPoint } from "@/lib/content/schema";
import { getDB } from "@/lib/db/db";
import { cardIdFor } from "@/lib/session/card-id";
import { humaniseMisconception, shortExaminerSource } from "./format";
import type { MarkResult } from "./mark";
import { Tex } from "./Tex";
import { btnPrimary, btnSecondary, cardCls, MarksLine, MissMark, quietFocus, Settle, Tick } from "./ui";

export type { MarkResult } from "./mark";

export interface FeedbackCardProps {
  result: MarkResult;
  /** The Chief Examiner's sentence for this error, in our words. */
  examinerLine?: string;
  /** A first unrecognised miss that is about to be re-asked: the expected value stays folded in the worked
   *  solution so the retry is a real one. Off once the answer is given up on, or from the second miss. */
  withholdExpected?: boolean;
  /** ccea-cer:… citation rendered as "Summer 2025, M4 Q22". */
  examinerSource?: string;
  onNext: () => void;
  /** Offered as "Fix it now" when the item has a twin. */
  onTwin?: () => void;
  nextLabel?: string;
  twinLabel?: string;
  /** Extra actions (e.g. "Show working") rendered beside the buttons. */
  actions?: ReactNode;
  /** Which method marks her working was seen to earn, rendered under the marks line. */
  seenMarks?: ReactNode;
  /** Move focus to the card when it appears (default true). */
  focusOnMount?: boolean;
  /** The part's mark scheme: its codes are shown beside the meter, earned or struck. */
  scheme?: ReadonlyArray<Pick<MarkPoint, "id" | "code" | "marks">>;
  /** Mark points her working was seen to earn, by id (the working ladder), so those codes show as earned. */
  earnedPoints?: readonly string[];
  /** The part's answer kind. A kind marked in pieces (labels, a table, key words) cannot say which of several
   *  different codes a part-way award came from, so those codes are shown without being marked either way. */
  answerKind?: string;
  /** The item id the answer was recorded against. With it, a missed card says when it comes back, from her review card. */
  returnsFor?: string;
}

type Outcome = "ok" | "warn" | "miss";

/** The whole edge of a marked object: 2 px all round in the outcome colour, 4 px down the left. */
const EDGE: Record<Outcome, string> = {
  ok: "border-ok",
  warn: "border-warn",
  miss: "border-miss",
};
const FILL: Record<Outcome, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  miss: "bg-miss",
};

/** The kinds the marker scores in pieces, where a part-way award is a count of items, not a named mark point. */
const PIECEWISE = new Set(["label", "table", "order", "steps", "text", "text-long"]);

function correctLine(result: MarkResult): string {
  const e = result.explanation.trim();
  if (/^correct[.!]?$/i.test(e) || /^correct – well done[.!]?$/i.test(e)) return "That's it.";
  return e;
}

/** The half-filled circle of a part-way answer: some of the marks, not all. */
function PartMark({ size = 28, label }: { size?: number; label: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={label} className="shrink-0 text-warn">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth={1.6} />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" />
    </svg>
  );
}

/** One segment per mark, the earned ones filled: the count in a picture, the words beside it carry the count. */
function MarkMeter({ awarded, available, outcome }: { awarded: number; available: number; outcome: Outcome }) {
  if (available <= 0) return null;
  if (available > 12) {
    return (
      <span aria-hidden className="relative inline-block h-1.5 w-24 overflow-hidden rounded-full bg-line-2 align-middle">
        <span className={clsx("absolute inset-y-0 left-0 rounded-full", FILL[outcome])} style={{ width: `${Math.round((awarded / available) * 100)}%` }} />
      </span>
    );
  }
  return (
    <span aria-hidden className="inline-flex gap-0.5 align-middle">
      {Array.from({ length: available }).map((_, i) => (
        <span key={i} className={clsx("h-1.5 w-3 rounded-full", i < awarded ? FILL[outcome] : "bg-line-2")} />
      ))}
    </span>
  );
}

export type ChipState = "earned" | "struck" | "open";

/**
 * Which of the scheme's codes the award covers. Correct: all. Nothing: none. Part way: the points her working was
 * seen to earn first, then the rest of the award in the scheme's own order (method before accuracy, as CCEA's schemes
 * are written and as a recognised error's typical marks are meant). Where that order says nothing (a kind marked in
 * pieces with different codes), the codes stay unmarked rather than name the wrong one.
 */
export function chipStates(scheme: NonNullable<FeedbackCardProps["scheme"]>, result: MarkResult, earnedPoints: readonly string[], answerKind?: string): ChipState[] {
  if (result.correct) return scheme.map(() => "earned");
  if (result.marksAwarded <= 0) return scheme.map(() => "struck");
  const codes = new Set(scheme.map((p) => p.code));
  const known = new Set(earnedPoints);
  const knownMarks = scheme.filter((p) => known.has(p.id)).reduce((n, p) => n + p.marks, 0);
  if (knownMarks < result.marksAwarded && codes.size > 1 && answerKind && PIECEWISE.has(answerKind)) {
    return scheme.map((p) => (known.has(p.id) ? "earned" : "open"));
  }
  let left = Math.max(0, result.marksAwarded - knownMarks);
  return scheme.map((p) => {
    if (known.has(p.id)) return "earned";
    if (left >= p.marks) {
      left -= p.marks;
      return "earned";
    }
    return "struck";
  });
}

/** A mark code as the scheme writes it, 13 px tabular, a 5 px corner: earned, struck, or not attributed. */
function CodeChip({ code, marks, state }: { code: string; marks: number; state: ChipState }) {
  const label = `${code}${marks}`;
  return (
    <span
      className={clsx(
        "tnum inline-flex h-6 items-center rounded-[var(--radius-xs)] border px-1.5 text-micro font-medium tracking-[0.02em]",
        state === "earned" && "border-ink-3 text-ink",
        state === "struck" && "border-line-2 text-ink-2 line-through",
        state === "open" && "border-line-2 text-ink-2",
      )}
      title={state === "earned" ? `${label} earned` : state === "struck" ? `${label} not earned` : label}
    >
      {label}
      <span className="sr-only">{state === "earned" ? " earned" : state === "struck" ? " not earned" : ""}</span>
    </span>
  );
}

/** When a review card is next due, as the day she will see it again. */
export function returnPhrase(due: Date, now = new Date()): string {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((day(due) - day(now)) / 86_400_000);
  if (days <= 0) return "It comes back in tonight's reviews.";
  if (days === 1) return "It comes back tomorrow.";
  if (days < 7) return `It comes back on ${due.toLocaleDateString("en-GB", { weekday: "long" })}.`;
  return `It comes back on ${due.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}.`;
}

/** "It comes back …", from the card her answer made; nothing until the card exists, so it is never a promise ahead of the data. */
function ReturnLine({ itemId }: { itemId: string }) {
  const due = useLiveQuery(async () => {
    try {
      return (await getDB().cards.get(cardIdFor(itemId)))?.due ?? null;
    } catch {
      return null;
    }
  }, [itemId]);
  if (!due) return null;
  return <p className="mt-3 text-meta text-ink-2">{returnPhrase(due)}</p>;
}

export function FeedbackCard({
  result,
  examinerLine,
  examinerSource,
  onNext,
  onTwin,
  nextLabel = "Next",
  twinLabel = "Fix it now",
  actions,
  seenMarks,
  focusOnMount = true,
  withholdExpected = false,
  scheme,
  earnedPoints = [],
  answerKind,
  returnsFor,
}: FeedbackCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusOnMount) ref.current?.focus({ preventScroll: false });
  }, [focusOnMount]);

  const partial = !result.correct && result.marksAwarded > 0;
  const heading = result.correct ? "" : partial ? "Part way there" : "Not yet";
  const outcome: Outcome = result.correct ? "ok" : partial ? "warn" : "miss";
  const line = result.correct ? correctLine(result) : "";
  const states = scheme && scheme.length > 0 ? chipStates(scheme, result, earnedPoints, answerKind) : null;

  const marks = (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <MarkMeter awarded={result.marksAwarded} available={result.marksAvailable} outcome={outcome} />
      <MarksLine awarded={result.marksAwarded} available={result.marksAvailable} />
      {states && scheme && (
        <span className="inline-flex flex-wrap gap-1" aria-label="The mark scheme">
          {scheme.map((p, i) => (
            <CodeChip key={p.id} code={p.code} marks={p.marks} state={states[i]} />
          ))}
        </span>
      )}
    </div>
  );

  return (
    <Settle active={result.correct}>
      <div
        ref={ref}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        data-outcome={outcome}
        className={clsx(cardCls, "border-2 border-l-4", EDGE[outcome], quietFocus)}
      >
        {result.correct ? (
          <div className="flex items-start gap-3">
            <Tick size={28} />
            <div className="min-w-0 flex-1">
              {/* The verdict word is the same on every correct card; what the marker said, when it says more than
                  "Correct", follows it as the line that names what was right. */}
              <p className="text-h2 font-semibold leading-snug">That&rsquo;s it.</p>
              {marks}
              {line !== "That's it." && (
                <p className="mt-2 text-ui leading-relaxed">
                  <Tex text={line} />
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3">
              {partial ? <PartMark size={28} label={heading} /> : <MissMark size={28} label={heading} />}
              <div className="min-w-0 flex-1">
                <p className="text-h2 font-semibold leading-snug">{heading}</p>
                {marks}
                {seenMarks}
              </div>
            </div>
            {/* The diagnosis: stacked on a phone (a 7rem label column leaves ~190 px for the value at 390 px), two
                columns from sm (04-critique.md R3). */}
            <dl className="mt-4 space-y-3 border-t border-line pt-4 text-ui">
              {!withholdExpected && (
                <div className="grid gap-x-3 sm:grid-cols-[7rem_1fr]">
                  <dt className="text-ink-2">Expected</dt>
                  <dd className="font-medium">
                    <Tex text={result.expected} />
                  </dd>
                </div>
              )}
              <div className="grid gap-x-3 sm:grid-cols-[7rem_1fr]">
                <dt className="text-ink-2">What happened</dt>
                <dd>
                  <Tex text={result.explanation} />
                </dd>
              </div>
              {result.nearMiss && (
                <div className="grid gap-x-3 sm:grid-cols-[7rem_1fr]">
                  <dt className="text-ink-2">Near miss</dt>
                  <dd className="text-ink-2">{result.nearMiss}</dd>
                </div>
              )}
            </dl>
            {examinerLine && (
              // The examiner's sentence: a recess, in the lesson serif's italic (the one sanctioned italic), with its
              // series cited beneath. No rule down its side: a rule inside an object is always a verdict.
              <blockquote className="mt-4 rounded-[var(--radius-sm)] bg-surface-2 p-4">
                <div className="flex gap-3">
                  <Quote size={16} strokeWidth={1.5} aria-hidden className="mt-1 shrink-0 text-ink-2" />
                  <div className="min-w-0">
                    <p className="font-serif-lesson text-[16px] italic leading-relaxed text-ink">
                      <Tex text={examinerLine} />
                    </p>
                    {examinerSource && <cite className="mt-1.5 block text-meta not-italic text-ink-2">CCEA examiners&rsquo; report, {shortExaminerSource(examinerSource)}</cite>}
                  </div>
                </div>
              </blockquote>
            )}
            {result.tags && result.tags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tagged">
                {result.tags.map((t) => (
                  <li key={t} className="rounded-full border border-line-2 px-2.5 py-0.5 text-meta text-ink-2">
                    {humaniseMisconception(t)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {!result.correct && onTwin && (
            <button type="button" className={btnPrimary} onClick={onTwin}>
              <Wrench size={16} aria-hidden /> {twinLabel}
            </button>
          )}
          <button type="button" className={!result.correct && onTwin ? btnSecondary : btnPrimary} onClick={onNext}>
            {nextLabel} <ArrowRight size={16} aria-hidden />
          </button>
          {actions}
        </div>
        {!result.correct && returnsFor && <ReturnLine itemId={returnsFor} />}
      </div>
    </Settle>
  );
}

export interface EncouragementCardProps {
  onHint: () => void;
  onWorkedExample: () => void;
  /** Optional third way out ("Skip for now"). */
  onSkip?: () => void;
  misses?: number;
}

/** Shown after two misses on the same item: a hint or a worked example, never a third miss. */
export function EncouragementCard({ onHint, onWorkedExample, onSkip, misses = 2 }: EncouragementCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div ref={ref} tabIndex={-1} role="status" aria-live="polite" className={clsx(cardCls, quietFocus)}>
      <p className="text-[17px] font-medium leading-snug">{misses >= 2 ? "Two goes on this one." : "Stuck on this one?"}</p>
      <p className="mt-1 text-ui text-ink-2">A third guess teaches nothing. Pick some support instead — the item comes back later either way.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} onClick={onHint}>
          <Lightbulb size={16} aria-hidden /> Show me a hint
        </button>
        <button type="button" className={btnSecondary} onClick={onWorkedExample}>
          <BookOpen size={16} aria-hidden /> Walk me through a worked example
        </button>
        {onSkip && (
          <button type="button" className="tap px-3 text-meta text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-ink" onClick={onSkip}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
