"use client";

/**
 * A topic's practice, one question at a time (docs/plan/emotional-design.md: one question per
 * screen, a thin line for momentum, a calm close). For `kind: "practice"` there are three stages:
 *   1. the topic's practice questions in order, "Fix it now" opening the twin of the worked example that fits the question on a miss (twin.ts);
 *   2. the authored mixed sets (`bundle.sets`), each item resolved from the bundle, the set's title as the eyebrow;
 *   3. the close card.
 * `kind: "exam"` runs the exam-style questions, then closes. Where she is stands in the flow table
 * (practiceIndex / examIndex / setIndex), so a reload resumes at the current question. Attempts are
 * recorded exactly as the item components record them elsewhere on the page.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { WorkedExample } from "@/lib/content/schema";
import { verificationFor, type ShippedBundle } from "@/lib/content/load";
import { loadFlow, saveFlow, type FlowPatch } from "@/lib/session/flow";
import { recordAttempt, touchSession, type ItemRef } from "@/lib/session/record";
import { DiagnosticWithConfidence, Eyebrow, FindTheMistake, InlinePrompt, WorkedExampleAsQuestion, btnSecondary } from "@/components/items";
import { CloseCard, exitPrimary, exitSecondary } from "@/components/ux/CloseCard";
import { ProgressLine } from "@/components/ux/ProgressLine";
import { CardSkeleton } from "@/components/ux/Skeleton";
import { QuestionRunner } from "./QuestionRunner";
import { twinFor } from "./twin";
import { flattenSets, resolveSets, type SetStep } from "./practice-sets";

interface Props {
  /** Show Rowan's session-close line on the close card (the last flow of the page only). */
  companion?: boolean;
  bundle: ShippedBundle;
  kind: "practice" | "exam";
  item: Omit<ItemRef, "id">;
}

/** Marks from the questions she finished this sitting (a resumed flow counts from where it resumed). */
interface Score {
  marks: number;
  available: number;
  questions: number;
}

const ZERO: Score = { marks: 0, available: 0, questions: 0 };

/** A stored position, clamped to the content that is here now (a set may have been re-authored since). */
function clamp(value: number | undefined, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(0, Math.floor(value)), max);
}

export function PracticeFlow({ bundle, kind, item, companion = false }: Props) {
  const { subject, unit, topicSlug } = item;
  const questions = useMemo(() => bundle.questions.filter((q) => q.style === (kind === "exam" ? "exam-style" : "practice")), [bundle, kind]);
  const steps = useMemo<SetStep[]>(() => (kind === "practice" ? flattenSets(resolveSets(bundle)) : []), [bundle, kind]);
  // "Fix it now" after a practice miss works a worked example as a twin: the one sharing the most specification
  // points with the question in front of her (twin.ts; engine item 10.5, it was always the first). An exam-style run
  // is offered the same twin, but only once the question is finished: the runner holds the offer back rather than
  // re-teaching between the parts of an exam question.
  const hasTwin = bundle.workedExamples.length > 0;

  // How many questions, then how many set items, she has advanced past. null until the flow row is read.
  const [pos, setPos] = useState<{ q: number; s: number } | null>(null);
  // The current item has reported itself done, so "Next" may show.
  const [ready, setReady] = useState(false);
  // The end was reached in this sitting (the close card) rather than restored from an earlier one.
  const [finishedHere, setFinishedHere] = useState(false);
  const [score, setScore] = useState<Score>(ZERO);
  // Counts each opening of the twin so every "Fix it now" starts it fresh; 0 when closed.
  const [twin, setTwin] = useState(0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    // A deep link ("?practice=3", "?exam=2", 1-based) opens that question and becomes the stored position.
    const wanted = (() => {
      if (typeof window === "undefined") return null;
      const raw = new URLSearchParams(window.location.search).get(kind === "exam" ? "exam" : "practice");
      const n = raw === null ? NaN : Number(raw);
      return Number.isInteger(n) && n >= 1 ? n - 1 : null;
    })();
    loadFlow(subject, topicSlug)
      .then((row) => {
        if (cancelled) return;
        if (wanted !== null) {
          const q = clamp(wanted, questions.length);
          setPos({ q, s: 0 });
          void saveFlow(subject, topicSlug, kind === "exam" ? { examIndex: q } : { practiceIndex: q, setIndex: 0 }).catch(() => undefined);
          return;
        }
        setPos({ q: clamp(kind === "exam" ? row?.examIndex : row?.practiceIndex, questions.length), s: clamp(row?.setIndex, steps.length) });
      })
      .catch(() => {
        if (!cancelled) setPos({ q: wanted !== null ? clamp(wanted, questions.length) : 0, s: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [subject, topicSlug, kind, questions.length, steps.length]);

  const persist = (patch: FlowPatch) => saveFlow(subject, topicSlug, patch).catch(() => undefined);
  const questionPatch = (q: number): FlowPatch => (kind === "exam" ? { examIndex: q } : { practiceIndex: q });

  const leave = () => {
    setReady(false);
    setTwin(0);
  };

  function nextQuestion() {
    if (!pos) return;
    const q = pos.q + 1;
    setPos({ ...pos, q });
    leave();
    void persist(questionPatch(q));
    if (q >= questions.length && pos.s >= steps.length) setFinishedHere(true);
  }

  function nextStep() {
    if (!pos) return;
    const s = pos.s + 1;
    setPos({ ...pos, s });
    leave();
    void persist({ setIndex: s });
    if (s >= steps.length) setFinishedHere(true);
  }

  function again() {
    setPos({ q: 0, s: 0 });
    leave();
    setFinishedHere(false);
    setScore(ZERO);
    startedAt.current = Date.now();
    void persist(kind === "exam" ? { examIndex: 0 } : { practiceIndex: 0, setIndex: 0 });
  }

  const onDone = (marks: number, available: number) => {
    setScore((s) => ({ marks: s.marks + marks, available: s.available + available, questions: s.questions + 1 }));
    setReady(true);
  };
  const onTwin = hasTwin ? () => setTwin((t) => t + 1) : undefined;

  if (!pos) return <CardSkeleton lines={4} />;

  const inQuestions = pos.q < questions.length;
  const inSets = !inQuestions && pos.s < steps.length;

  if (!inQuestions && !inSets) {
    if (!finishedHere) return <DoneLine kind={kind} onAgain={again} />;
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000));
    return (
      <CloseCard
        eyebrow={kind === "exam" ? "Exam-style complete" : "Practice complete"}
        headline={`${score.marks} / ${score.available} marks`}
        line={
          <>
            <span className="block">
              {score.questions} question{score.questions === 1 ? "" : "s"} · {minutes} min. Lost marks are in the ledger with their reasons; anything you missed will come back in your reviews.
            </span>
            {kind === "practice" && steps.length === 0 && <span className="block">No mixed set for this topic yet.</span>}
          </>
        }
        startedAt={startedAt.current}
        companion={companion}
        exits={
          <>
            <Link href={`/learn/${subject}/${unit}/`} className={exitPrimary}>
              Next topic
            </Link>
            {bundle.noteBlocks && (
              <a href="#note" className={exitSecondary}>
                Back to the lesson
              </a>
            )}
          </>
        }
      />
    );
  }

  if (inQuestions) {
    const q = questions[pos.q];
    const last = pos.q + 1 >= questions.length;
    const twinWe: WorkedExample | undefined = twinFor(bundle.workedExamples, q);
    return (
      <div className="flex flex-col gap-3">
        <ProgressLine value={pos.q} max={questions.length} label={kind === "exam" ? "Exam-style questions done" : "Practice questions done"} />
        <QuestionRunner
          key={q.id}
          q={q}
          kind={kind}
          item={item}
          index={pos.q + 1}
          total={questions.length}
          verification={kind === "exam" ? verificationFor(bundle, q.verification) : undefined}
          onDone={onDone}
          onTwin={onTwin}
        />
        {twin > 0 && twinWe && <TwinFix key={twin} we={twinWe} item={item} onClose={() => setTwin(0)} />}
        {ready && (
          <div className="flex justify-end">
            <button type="button" className={btnSecondary} onClick={nextQuestion}>
              {!last ? "Next question" : steps.length > 0 ? "On to the mixed set" : "Finish"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const step = steps[pos.s];
  const lastStep = pos.s + 1 >= steps.length;
  const twinWe: WorkedExample | undefined = twinFor(bundle.workedExamples, step.entry.kind === "q" ? step.entry.q : null);
  return (
    <div className="flex flex-col gap-3">
      <ProgressLine value={pos.s} max={steps.length} label="Mixed set items done" />
      <Eyebrow>
        {step.set.title} ·{" "}
        <span className="tnum">
          {step.index} of {step.total}
        </span>
      </Eyebrow>
      <SetItem key={step.entry.key} step={step} item={item} onDone={onDone} onReady={() => setReady(true)} onNext={nextStep} onTwin={onTwin} />
      {twin > 0 && twinWe && <TwinFix key={twin} we={twinWe} item={item} onClose={() => setTwin(0)} />}
      {ready && (
        <div className="flex justify-end">
          <button type="button" className={btnSecondary} onClick={nextStep}>
            {lastStep ? "Finish" : step.entry.kind === "q" ? "Next question" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

/** One resolved set item, recording its attempt the way the same component does elsewhere on the page. */
function SetItem({
  step,
  item,
  onDone,
  onReady,
  onNext,
  onTwin,
}: {
  step: SetStep;
  item: Omit<ItemRef, "id">;
  onDone: (marks: number, available: number) => void;
  onReady: () => void;
  onNext: () => void;
  onTwin?: () => void;
}) {
  const { subject } = item;
  const entry = step.entry;
  if (entry.kind === "q") return <QuestionRunner q={entry.q} kind="practice" item={item} onDone={onDone} onTwin={onTwin} />;
  if (entry.kind === "dx") {
    return (
      <DiagnosticWithConfidence
        item={entry.item}
        onAnswer={async (a) => {
          await recordAttempt({
            item: { ...item, id: entry.item.id },
            itemKind: "diagnostic",
            correct: a.correct,
            confidence: a.confidence,
            misconceptionTags: a.misconception ? [a.misconception] : [],
            timeMs: a.ms,
          });
          await touchSession(subject);
        }}
        onNext={onNext}
      />
    );
  }
  if (entry.kind === "rp") {
    return (
      <InlinePrompt
        prompt={entry.prompt}
        mode="inline"
        onGrade={async (grade) => {
          await recordAttempt({ item: { ...item, id: entry.prompt.id }, itemKind: "prompt", correct: grade !== "again" });
          await touchSession(subject);
          onReady();
        }}
      />
    );
  }
  return (
    <FindTheMistake
      item={entry.item}
      onResult={async (r) => {
        await recordAttempt({ item: { ...item, id: entry.item.id }, itemKind: "mistake", correct: r.foundLine && r.fixed, misconceptionTags: [entry.item.misconception] });
        await touchSession(subject);
      }}
      onNext={onNext}
    />
  );
}

/** The chosen worked example as a twin, under the feedback; its Next returns to the flow. */
function TwinFix({ we, item, onClose }: { we: WorkedExample; item: Omit<ItemRef, "id">; onClose: () => void }) {
  return (
    <div className="rise-in">
      <WorkedExampleAsQuestion
        we={we}
        fade="twin"
        onStep={async (n, correct) => {
          await recordAttempt({ item: { ...item, id: `${we.id}#twin:${n}` }, itemKind: "practice", correct });
        }}
        onComplete={async () => {
          await touchSession(item.subject);
        }}
        onNext={onClose}
      />
    </div>
  );
}

/** Restored on a later visit once the flow was finished: one line, one way to go again. */
function DoneLine({ kind, onAgain }: { kind: "practice" | "exam"; onAgain: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-meta text-ink-2">{kind === "exam" ? "Exam-style questions done." : "Practice done."} Anything you missed will come back on its schedule.</p>
      <button type="button" className={btnSecondary} onClick={onAgain}>
        Go again
      </button>
    </div>
  );
}
