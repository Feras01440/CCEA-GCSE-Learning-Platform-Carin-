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
import { useInboxQueue, type ResolvedCard } from "@/lib/review/resolve";
import { advanceCard, gradeFromMarks, recordAttempt, reviewInboxCard, touchSession } from "@/lib/session/record";
import { makeScheduler, retrievability, review, type ReviewGrade } from "@/lib/srs/scheduler";
import { useExamPlan } from "@/lib/plan/store";
import { formatPaperDate, nextPaper, todayISO } from "@/lib/plan/exam-plan";
import { ProgressLine } from "@/components/ux/ProgressLine";
import { CloseCard, exitPrimary, exitSecondary } from "@/components/ux/CloseCard";
import { CardSkeleton } from "@/components/ux/Skeleton";
import { tap } from "@/lib/ux/haptics";

function intervalLabel(from: Date, to: Date): string {
  const days = (to.getTime() - from.getTime()) / 86_400_000;
  if (days < 1) return "today";
  if (days < 30) return `${Math.round(days)} d`;
  return `${Math.round(days / 30)} mo`;
}

export function ReviewInbox() {
  const { queue, dueCount } = useInboxQueue();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  /** The grade an item that marks itself has earned, once it has been answered: the Next button's. */
  const [answered, setAnswered] = useState<ReviewGrade | null>(null);
  const started = useRef<number | null>(null);
  const initial = useRef<ResolvedCard[] | null>(null);

  // Freeze the queue for this session so grading a card does not reshuffle what is next.
  useEffect(() => {
    if (queue && !initial.current) {
      initial.current = queue;
      started.current = Date.now();
    }
  }, [queue]);

  const cards = initial.current ?? queue;
  if (!cards) return <CardSkeleton lines={3} />;
  if (cards.length === 0) return <EmptyInbox />;
  if (index >= cards.length) return <ReviewComplete count={done} minutes={started.current ? Math.max(1, Math.round((Date.now() - started.current) / 60_000)) : 1} startedAt={started.current ?? Date.now()} />;

  const current = cards[index];
  const content = current.content;
  const ref = { subject: current.subject, unit: current.unit, topicSlug: current.topicSlug };

  const onward = () => {
    setAnswered(null);
    setDone((d) => d + 1);
    setIndex((i) => i + 1);
  };

  /** A prompt or a diagnostic: the inbox is the only place it is marked, so the inbox records it. */
  const grade = async (g: ReviewGrade, itemKind: Attempt["itemKind"] = "prompt") => {
    tap();
    await reviewInboxCard(current.card.id, g, ref, itemKind);
    await touchSession(current.subject);
    onward();
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

  const scheduler = makeScheduler();
  const now = new Date();
  const intervals = {
    again: intervalLabel(now, review(current.card.card, "again", now, scheduler).card.due),
    good: intervalLabel(now, review(current.card.card, "good", now, scheduler).card.due),
    easy: intervalLabel(now, review(current.card.card, "easy", now, scheduler).card.due),
  };

  return (
    <div className="mx-auto max-w-2xl">
      <ProgressLine value={index} max={cards.length} label="Reviews done" />
      <p className="mb-3 mt-3 text-meta text-ink-2">
        <span className="tnum">
          {index + 1} of {cards.length}
        </span>
        {dueCount && dueCount > cards.length ? ` · ${dueCount - cards.length} more waiting for tomorrow` : ""}
        {" · "}
        <span className="text-ink-2">{current.topicTitle}</span>
      </p>

      {content?.kind === "prompt" && (
        <InlinePrompt key={current.card.id} prompt={content.prompt} mode="review" intervals={intervals} onGrade={(g: PromptGrade) => grade(g)} />
      )}
      {content?.kind === "diagnostic" && (
        <DiagnosticWithConfidence
          key={current.card.id}
          item={content.item}
          onAnswer={(a) => grade(a.correct ? (a.confidence === 3 ? "easy" : "good") : "again", "diagnostic")}
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
          <StepRevealNote
            key={current.card.id}
            blocks={[...content.context, content.gate]}
            single
            // The card id is the gate's recorded item id (`<topicId>#gate:<gateId>`), so it records as it does in the lesson.
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
        <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
          <p className="text-meta text-ink-2">This item has been withdrawn from the content while it is checked.</p>
          <button type="button" className="tap mt-2 rounded-[var(--radius-sm)] border border-line-2 px-4 text-meta" onClick={() => setIndex((i) => i + 1)}>
            Skip
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyInbox() {
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
      headline={`${count} item${count === 1 ? "" : "s"} · ${minutes} min`}
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
