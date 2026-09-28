"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  DiagnosticWithConfidence,
  FindTheMistake,
  InlinePrompt,
  StepRevealNote,
  WorkedExampleAsQuestion,
  btnSecondary,
  type PromptGrade,
} from "@/components/items";
import { QuestionRunner } from "@/components/topic/QuestionRunner";
import { getDB, type Attempt } from "@/lib/db/db";
import { answerDiagnosticCard, type DiagnosticReviewAnswer } from "@/lib/review/diagnostic";
import { useInboxQueue, type ResolvedCard } from "@/lib/review/resolve";
import { inboxReturns, returnLabel } from "@/lib/review/returns";
import { advanceCard, gradeFromMarks, recordAttempt, reviewInboxCard, touchSession } from "@/lib/session/record";
import { isHypercorrectionCard } from "@/lib/srs/hypercorrection";
import { makeScheduler, retrievability, type ReviewGrade } from "@/lib/srs/scheduler";
import { useExamPlan } from "@/lib/plan/store";
import { formatPaperDate, nextPaper, todayISO } from "@/lib/plan/exam-plan";
import { ProgressLine } from "@/components/ux/ProgressLine";
import { CloseCard, exitPrimary, exitSecondary } from "@/components/ux/CloseCard";
import { NOT_OPENED, TWIN_NOTE, reviewHeadline, unopenedLine, unopenedOnly } from "@/components/review/review-copy";
import { FlashcardReview } from "@/components/review/FlashcardReview";
import { CardSkeleton } from "@/components/ux/Skeleton";
import { tap } from "@/lib/ux/haptics";

export function ReviewInbox() {
  const { queue, dueCount, unopened } = useInboxQueue();
  const plan = useExamPlan();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  /** The grade an item that marks itself has earned, once it has been answered: the Next button's. */
  const [answered, setAnswered] = useState<ReviewGrade | null>(null);
  const started = useRef<number | null>(null);
  const initial = useRef<ResolvedCard[] | null>(null);
  /**
   * The moment each card is shown. Its returns are printed from this moment and its grade is recorded at it, so the day
   * a button promises is the day stored (ts-fsrs seeds its fuzz from the review time; src/lib/review/returns.ts).
   */
  const shownAt = useRef<{ id: string; at: Date } | null>(null);

  // Freeze the queue for this session so grading a card does not reshuffle what is next.
  useEffect(() => {
    if (queue && !initial.current) {
      initial.current = queue;
      started.current = Date.now();
    }
  }, [queue]);

  const cards = initial.current ?? queue;
  if (!cards) return <CardSkeleton lines={3} />;
  if (cards.length === 0) return <EmptyInbox unopened={unopened} />;
  if (index >= cards.length) return <ReviewComplete count={done} minutes={started.current ? Math.max(1, Math.round((Date.now() - started.current) / 60_000)) : 1} startedAt={started.current ?? Date.now()} />;

  const current = cards[index];
  const content = current.content;
  const ref = { subject: current.subject, unit: current.unit, topicSlug: current.topicSlug };
  if (shownAt.current?.id !== current.card.id) shownAt.current = { id: current.card.id, at: new Date() };
  const now = shownAt.current.at;

  const onward = () => {
    setAnswered(null);
    setDone((d) => d + 1);
    setIndex((i) => i + 1);
  };

  /**
   * A prompt or a flashcard: the inbox is the only place it is marked, so the inbox records it, at the moment the card was
   * shown, which is the moment its printed returns were computed from.
   */
  const grade = async (g: ReviewGrade, itemKind: Attempt["itemKind"] = "prompt") => {
    tap();
    await reviewInboxCard(current.card.id, g, ref, itemKind, now);
    await touchSession(current.subject);
    onward();
  };

  /**
   * A diagnostic, at Reveal: recorded as the topic page records it (her confidence, her option's misconception, the two
   * re-probes a certain miss earns) and moved by what she was sure of (src/lib/review/diagnostic.ts). Nothing moves on:
   * the reveal stays on screen, with its reasons and what it says comes next, until she presses Next.
   */
  const answerDiagnostic = async (a: DiagnosticReviewAnswer) => {
    tap();
    await answerDiagnosticCard(current.card.id, { ...ref, id: current.itemId }, a, now);
    await touchSession(current.subject);
  };

  /** A question part, a gate, a mistake or a twin: it has recorded its own attempt, so only the card moves. */
  const settle = async (g: ReviewGrade) => {
    tap();
    await advanceCard(current.card.id, g, ref);
    onward();
  };

  /**
   * Recorded exactly as the topic page records the same item, then held on screen so she can read
   * the feedback before Next. `grade` is what the evidence gives the card; `correct` is the ledger's.
   */
  const answer = async (a: { id: string; itemKind: Attempt["itemKind"]; correct: boolean; grade?: ReviewGrade; tags?: string[] }) => {
    setAnswered(a.grade ?? (a.correct ? "good" : "again"));
    await recordAttempt({ item: { ...ref, id: a.id }, itemKind: a.itemKind, correct: a.correct, misconceptionTags: a.tags ?? [] });
    await touchSession(current.subject);
  };

  // The return under each grade, from the card's own state in its unit's exam mode (the near-exam schedule the tap stores
  // with). A sure-and-not-right re-probe is spent by its one pass, so it promises no return of its own.
  const returns = plan && !isHypercorrectionCard(current.card.id) ? inboxReturns(current.card, plan, current.subject, current.unit, now) : null;
  const intervals = returns ? { again: returnLabel(returns.again, now), good: returnLabel(returns.good, now), easy: returnLabel(returns.easy, now) } : undefined;
  const waiting = dueCount !== undefined ? dueCount - cards.length - unopened : 0;
  const notOpened = unopenedLine(unopened);

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressLine value={index} max={cards.length} label="Reviews done" />
      <p className="mb-3 mt-3 text-meta text-ink-2">
        <span className="tnum">
          {index + 1} of {cards.length}
        </span>
        {waiting > 0 ? ` · ${waiting} more waiting for tomorrow` : ""}
        {" · "}
        <span className="text-ink-2">{current.topicTitle}</span>
      </p>
      {notOpened && index === 0 && <p className="-mt-1 mb-3 text-meta text-ink-2">{notOpened}</p>}

      {content?.kind === "prompt" && (
        <InlinePrompt key={current.card.id} prompt={content.prompt} mode="review" intervals={intervals} onGrade={(g: PromptGrade) => grade(g)} />
      )}
      {content?.kind === "flashcard" && <FlashcardReview key={current.card.id} card={content.card} intervals={intervals} onGrade={(g) => grade(g, "recall")} />}
      {content?.kind === "diagnostic" && (
        <DiagnosticWithConfidence
          key={current.card.id}
          item={content.item}
          onAnswer={(a) => void answerDiagnostic(a)}
          onNext={onward}
        />
      )}
      {content?.kind === "question" && (
        // One part, marked by the same engine and recorded with the same item id as on the topic page.
        <QuestionRunner
          key={current.card.id}
          q={{ ...content.question, parts: [content.part], totalMarks: content.part.marks }}
          kind={content.question.style === "exam-style" ? "exam" : "practice"}
          item={ref}
          onDone={(marks, available) => void settle(gradeFromMarks(marks, available))}
        />
      )}
      {content?.kind === "mistake" && (
        <FindTheMistake
          key={current.card.id}
          item={content.item}
          onResult={(r) =>
            void answer({
              id: current.itemId,
              itemKind: "mistake",
              correct: r.foundLine && r.fixed,
              // Locating the line and fixing it are the two marks here; one of them is partial credit.
              grade: gradeFromMarks([r.foundLine, r.fixed].filter(Boolean).length, 2),
              tags: [content.item.misconception],
            })
          }
          onNext={() => void settle(answered ?? "again")}
        />
      )}
      {content?.kind === "twin" && (
        <WorkedExampleAsQuestion
          key={current.card.id}
          we={content.we}
          fade="twin"
          onStep={(n, correct) => void answer({ id: `${content.we.id}#twin:${n}`, itemKind: "practice", correct })}
          onNext={() => void settle(answered ?? "again")}
        />
      )}
      {content?.kind === "gate" && (
        <div className="prose-note rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]">
          {/* Asked as its twin on alternate returns (gateForReview): said once, so a check that looks new is not a puzzle. */}
          {content.variant === "twin" && <p className="mb-2 font-sans text-meta text-ink-2">{TWIN_NOTE}</p>}
          <StepRevealNote
            key={`${current.card.id}:${content.variant ?? "original"}`}
            blocks={[...content.context, content.gate]}
            single
            // The card id is the gate's recorded item id (`<topicId>#gate:<gateId>`), so it records as it does in the lesson,
            // whichever version was asked: one card, one schedule, one record.
            onGate={(_id, _typed, correct) => void answer({ id: current.itemId, itemKind: "practice", correct })}
          />
          {answered !== null && (
            <div className="mt-3 flex justify-end">
              <button type="button" className={btnSecondary} onClick={() => void settle(answered)}>
                Next
              </button>
            </div>
          )}
        </div>
      )}
      {!content && (
        // The last resort: tonight's list holds only cards the inbox can open (servableQueue), so this is a card whose item
        // went missing between the list and the card. It stays due; nothing about it is recorded.
        <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
          <p className="text-meta text-ink-2">{NOT_OPENED}</p>
          <button type="button" className="tap mt-2 rounded-[var(--radius-sm)] border border-line-2 px-4 text-meta" onClick={() => setIndex((i) => i + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyInbox({ unopened }: { unopened: number }) {
  if (unopened > 0) {
    const copy = unopenedOnly(unopened);
    return (
      <div className="mx-auto max-w-xl rounded-[var(--radius)] border border-line bg-surface p-6 shadow-[var(--shadow-1)]">
        <p className="text-[20px] font-semibold tracking-tight">{copy.title}</p>
        <p className="mt-1 text-meta text-ink-2">{copy.line}</p>
        <Link href="/" className="tap mt-4 inline-flex items-center rounded-[var(--radius-sm)] border border-line-2 px-5 font-medium">
          Back to Today
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl rounded-[var(--radius)] border border-line bg-surface p-6 shadow-[var(--shadow-1)]">
      <p className="text-[20px] font-semibold tracking-tight">Nothing due</p>
      <p className="mt-1 text-meta text-ink-2">Come back tomorrow. Anything you learn today will start appearing here in a day or two.</p>
      <Link href="/learn/" className="tap mt-4 inline-flex items-center rounded-[var(--radius-sm)] bg-accent px-5 font-medium text-accent-ink">
        Learn something new
      </Link>
    </div>
  );
}

function ReviewComplete({ count, minutes, startedAt }: { count: number; minutes: number; startedAt: number }) {
  const plan = useExamPlan();
  const next = plan ? nextPaper(plan, todayISO()) : null;
  const forecast = useLiveQuery(async () => {
    if (!next) return null;
    try {
      const cards = await getDB().cards.where("subject").equals(next.subject).toArray();
      if (!cards.length) return null;
      const sched = makeScheduler();
      const at = new Date(next.date + "T09:00:00");
      const avg = cards.reduce((s, c) => s + retrievability(c.card, at, sched), 0) / cards.length;
      return { avg, n: cards.length };
    } catch {
      return null;
    }
  }, [next?.subject, next?.date]);

  const line = useMemo(() => {
    if (!next) return null;
    if (!forecast) return `Next paper: ${next.label}, ${formatPaperDate(next.date)}.`;
    return `Predicted recall of your ${next.label} items on ${formatPaperDate(next.date)}: ${Math.round(forecast.avg * 100)}% across ${forecast.n} items.`;
  }, [next, forecast]);

  return (
    <CloseCard
      eyebrow="Review complete"
      headline={reviewHeadline(count, minutes)}
      line={line}
      startedAt={startedAt}
      exits={
        <>
          <Link href="/" className={exitPrimary}>
            Done for tonight
          </Link>
          <Link href="/learn/" className={exitSecondary}>
            Five more minutes on a topic
          </Link>
        </>
      }
    />
  );
}
