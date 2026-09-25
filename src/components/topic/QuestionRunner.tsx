"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import { useLiveQuery } from "dexie-react-hooks";
import type { MarkPoint, Part, Question, VerificationLog } from "@/lib/content/schema";
import {
  AnswerField,
  CheckedPanel,
  FeedbackCard,
  Figure,
  Md,
  MissMark,
  Tex,
  Tick,
  isAutoMarkable,
  markAnswer,
  qwcBandRange,
  qwcEvidence,
  type LongTextSpec,
  type MarkResult,
} from "@/components/items";
import { btnOption, btnPrimary, btnSecondary, cardCls, quietFocus } from "@/components/items/ui";
import { CompanionLine } from "@/components/companion/CompanionLine";
import { useCompanionContext } from "@/lib/companion";
import { recordAttempt, touchSession, type ItemRef } from "@/lib/session/record";
import { reportsFor, saveReport } from "@/lib/db/reports";
import { ladderTotal, markWorking, methodSteps, workingToLines, type EarnedMark } from "@/lib/marking/working";
import { reteachFor, supportHintFor, supportOffer, type Reteach, type SupportRung } from "./reteach";
import { WorkingField } from "./WorkingField";

interface Props {
  q: Question;
  kind: "practice" | "exam";
  item: Omit<ItemRef, "id">;
  verification?: VerificationLog;
  index?: number;
  total?: number;
  onDone?: (marks: number, available: number) => void;
  /** Offered as "Fix it now" on a missed part (the feedback card's twin action); the caller opens the twin. */
  onTwin?: () => void;
}

/**
 * The re-teach for a missed part, or null. A banded written-communication answer is left out: she has
 * just read the descriptors and awarded the mark herself, so it is not an answer the marker failed to
 * recognise. Everything else goes to `reteachFor`, which stands aside for an authored diagnosis.
 */
function reteachOf(part: Part, result: MarkResult, awarded: readonly EarnedMark[] = [], holdAccuracy = false): Reteach | null {
  if (result.correct || part.answer.kind === "text-long") return null;
  // A mark point her working has already been seen to earn is not the next mark: the panel takes those
  // points out of the scheme, and their marks out of the award, before asking what she has not reached.
  const ids = new Set(awarded.map((e) => e.id));
  const taken = awarded.reduce((s, e) => s + e.marks, 0);
  const reteach =
    awarded.length === 0
      ? reteachFor(part, result)
      : reteachFor(
          { ...part, scheme: part.scheme.filter((p) => !ids.has(p.id)) },
          { ...result, marksAwarded: Math.max(0, result.marksAwarded - taken) },
        );
  // Once the working has paid for the method, the only mark point left is the accuracy one — and an
  // accuracy mark point is the answer written out ("565 cm³, accept 180π"). On a first miss the card is
  // holding the expected answer back so that another go is a real one, so the panel holds it back too:
  // stripping the value out of the wording would leave nothing to read. It returns on the second miss,
  // beside the expected answer, where it belongs.
  if (!holdAccuracy || !reteach?.step || METHOD_LABEL.test(reteach.step.label)) return reteach;
  return reteach.anotherWay === null ? null : { step: null, anotherWay: reteach.anotherWay };
}

/**
 * The answer kinds the working ladder is offered on: the ones the marker scores all or nothing, where
 * a learner who reaches the method line and slips on the arithmetic scores nothing of two
 * (docs/plan/review/2026-09-19-quality-bar.md, item 2). A written, drawn, tabulated or banded answer is
 * already marked in pieces, and a second box under it would only confuse the one she is writing in.
 */
const LADDER_KINDS = new Set(["numeric", "algebraic", "equation", "mcq"]);

/** A mark scheme chip: "MA1", "M2", "P1" are method and process; "A1" and "B1" are accuracy. */
const METHOD_LABEL = /^[MWP]/;

/**
 * Runs one question part by part: answer → mark → feedback → next. A six-mark written-communication part
 * takes one extra beat: the marker returns evidence rather than a verdict, and she places the answer on
 * the band descriptors before anything is recorded. Self-marks the few parts the engine cannot mark.
 *
 * An answer no authored common error recognises used to get one generic sentence and the marks. It now
 * gets the mark point she has not reached, in the scheme's own words, and the idea in a different form,
 * with a twin and another go offered before the solution (docs/plan/review/2026-09-19-quality-bar.md,
 * item 6). In an exam-style run that is held back until the last part is answered: nothing re-teaches
 * mid-paper.
 */
export function QuestionRunner({ q, kind, item, verification, index, total, onDone, onTwin }: Props) {
  const [partIndex, setPartIndex] = useState(0);
  const [result, setResult] = useState<MarkResult | null>(null);
  /** A checked answer whose mark is not the engine's to decide (a banded QWC answer), awaiting her band. */
  const [decision, setDecision] = useState<MarkResult | null>(null);
  const [selfMark, setSelfMark] = useState<number | null>(null);
  const [earned, setEarned] = useState<number[]>([]);
  /** Misses on the part in front of her, which is what brings the companion's support line at two. */
  const [partMisses, setPartMisses] = useState(0);
  /** After two misses on a part she chooses support rather than a third guess (engine item 10.2): the hint she
   *  asked for, shown under the card, and whether she opened the worked solution. Cleared at the next part. */
  const [hintShown, setHintShown] = useState<string | null>(null);
  const [workedOpen, setWorkedOpen] = useState(false);
  /** Unrecognised misses in an exam-style run, kept back until the run is over. */
  const [held, setHeld] = useState<Array<{ partId: string; reteach: Reteach }>>([]);
  const [lastRaw, setLastRaw] = useState<string | null>(null);
  /** Her typed working for the part in front of her, and the method marks the ladder read in it. */
  const [working, setWorking] = useState("");
  const [seen, setSeen] = useState<EarnedMark[]>([]);
  // The marks so far, readable after a self-award has replaced the engine's mark for the current part.
  const earnedRef = useRef<number[]>([]);
  // Her answer to each part so far, for a later part that follows through from it (mark.ts followThroughValue).
  const answersRef = useRef<Record<string, string>>({});
  // The part the last number in `earned` belongs to, so a second go at it replaces that number.
  const committedFor = useRef<string | null>(null);

  const part = q.parts[partIndex];
  const finished = partIndex >= q.parts.length;
  // Every part the engines can mark is marked here, written reasoning included (the key-word marker reads it and she
  // can award herself the marks against the solution when it misjudges her). Only drawing-type answers go to paper.
  const auto = part ? isAutoMarkable(part.answer) : false;
  // Only offer the working box where there is a method mark in the scheme to win by showing it.
  const ladder = useMemo(
    () => (part && LADDER_KINDS.has(part.answer.kind) ? methodSteps(part.scheme, part.workedSolution) : []),
    [part],
  );
  // Exam-style counts the working, and so does any part whose scheme demands it; elsewhere it is hers to open.
  const workingAlwaysOpen = kind === "exam" || part?.requiresWorking === true;

  // Called on every render, as the hook must be: it returns undefined while it loads and the line
  // renders nothing for that. Nothing signed may speak while a question is up, hence `questionVisible`.
  const companion = useCompanionContext({
    item: {
      id: part ? `${q.id}#${part.id}` : q.id,
      unitsInAnswer: part?.answer.kind === "numeric" && part.answer.unit !== undefined,
      // Whether the scheme carries a method mark, so the companion's line about showing working has a reason (lead 14:10).
      methodMark: part ? part.scheme.some((m) => m.code.startsWith("M")) : false,
    },
    questionVisible: true,
  });

  async function commit(marks: number, correct: boolean, raw: string | null, tags: string[] = []) {
    await recordAttempt({
      item: { ...item, id: `${q.id}#${part.id}` },
      itemKind: kind === "exam" ? "exam" : "practice",
      correct,
      marksAwarded: marks,
      marksAvailable: part.marks,
      confidence: null,
      misconceptionTags: tags,
      answerRaw: raw,
      workingRaw: working.trim() ? working : null,
    });
    await touchSession(item.subject);
    // Every attempt is recorded, but the card keeps one number per part: a second go at the same part
    // replaces its number rather than adding another, and the better of her attempts stands, because
    // nothing is taken away inside a session (docs/plan/emotional-design.md, rule 1).
    const next = [...earnedRef.current];
    if (committedFor.current === part.id && next.length > 0) next[next.length - 1] = Math.max(next[next.length - 1] ?? 0, marks);
    else next.push(marks);
    committedFor.current = part.id;
    earnedRef.current = next;
    setEarned(next);
  }

  function submit(raw: string) {
    const from = part.followThrough?.rule === "use-candidate-value" ? q.parts.find((p) => p.id === part.followThrough!.fromPart) : undefined;
    const earlierRaw = from ? answersRef.current[from.id] : undefined;
    const followThrough =
      from && earlierRaw !== undefined
        ? { earlierRaw, earlierSpec: from.answer, relation: part.followThrough?.relation, workedSolution: part.workedSolution }
        : undefined;
    const marked = markAnswer(raw, part.answer, { marks: part.marks, commonErrors: part.commonErrors, prompt: part.stem, scheme: part.scheme, followThrough });
    answersRef.current = { ...answersRef.current, [part.id]: raw };
    setLastRaw(raw);
    // A banded answer is not marked yet: nothing is recorded until she has placed it on the descriptors.
    if (marked.decision === "qwc-band" && part.answer.kind === "text-long") {
      setDecision(marked);
      return;
    }
    // The working ladder, on top of the marker's verdict and never instead of it. A right answer needs
    // no working and has the marks already; a wrong one can still have reached the method line, and the
    // scheme pays for that. The two awards are not added together — an answer part-marked through a
    // common error has usually been paid for that very method — so the higher of them stands, capped
    // at the part's tariff.
    const evidence = !marked.correct && working.trim() ? markWorking(workingToLines(working), part.scheme, part.workedSolution) : null;
    // A wrong answer never collects every mark from its working (ladderTotal; trial audit MK-04).
    const total = ladderTotal(marked, evidence ? evidence.marks : null, part.marks);
    const r = total > marked.marksAwarded ? { ...marked, marksAwarded: total } : marked;
    setSeen(evidence?.earned ?? []);
    setResult(r);
    if (!r.correct) {
      setPartMisses((n) => n + 1);
      // In an exam-style run the step waits for the end of the question; in practice it is on the card.
      const rt = kind === "exam" ? reteachOf(part, r, evidence?.earned ?? []) : null;
      if (rt) setHeld((h) => [...h.filter((x) => x.partId !== part.id), { partId: part.id, reteach: rt }]);
    }
    void commit(r.marksAwarded, r.correct, raw, r.tags ?? []);
  }

  /** Another go at the same part: the field comes back, and her next mark replaces this one. Her working
   *  stays as she wrote it, to carry on from rather than to type again. */
  function retry() {
    setResult(null);
    setSelfMark(null);
    setSeen([]);
  }

  /** She has read the band descriptors, chosen a band and a mark inside it, and awards that mark. */
  async function awardBand(n: number, band: string) {
    const base = decision;
    if (!base) return;
    const correct = n === part.marks;
    setDecision(null);
    // The decision has been made, so the result stops carrying the hint that one was owed.
    const { decision: _made, ...decided } = base;
    void _made;
    setResult({
      ...decided,
      correct,
      marksAwarded: n,
      explanation: `Band ${band}: ${n} of ${part.marks}, awarded by you on the descriptors. ${base.explanation}`,
    });
    await commit(n, correct, lastRaw, ["qwc-self-banded"]);
  }

  /** She has compared her written answer with the solution and the scheme and awards herself the full marks. */
  async function selfAward() {
    if (!result) return;
    await recordAttempt({
      item: { ...item, id: `${q.id}#${part.id}` },
      itemKind: kind === "exam" ? "exam" : "practice",
      correct: true,
      marksAwarded: part.marks,
      marksAvailable: part.marks,
      confidence: null,
      misconceptionTags: ["self-awarded"],
      answerRaw: lastRaw,
    });
    const next = [...earnedRef.current];
    next[next.length - 1] = part.marks;
    earnedRef.current = next;
    setEarned(next);
    setResult({ ...result, correct: true, marksAwarded: part.marks, explanation: "Awarded by you against the worked solution and the scheme." });
  }

  function advance() {
    if (partIndex + 1 >= q.parts.length) onDone?.(earnedRef.current.reduce((a, b) => a + b, 0), q.totalMarks);
    setResult(null);
    setDecision(null);
    setSelfMark(null);
    setPartMisses(0);
    setHintShown(null);
    setWorkedOpen(false);
    setWorking("");
    setSeen([]);
    setPartIndex((i) => i + 1);
  }

  return (
    <article className="rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-meta font-medium text-ink-2">
          {kind === "exam" ? "Exam-style" : "Practice"}
          {index != null && total != null ? ` · ${index} of ${total}` : ""}
          {q.paper.calculator === false ? " · non-calculator" : ""}
        </p>
        <p className="tnum text-meta text-ink-2">
          {q.totalMarks} {q.totalMarks === 1 ? "mark" : "marks"}
        </p>
      </header>

      {q.figures.map((f, i) => (
        <div key={i} className="mb-3">
          <Figure spec={f} />
        </div>
      ))}

      <ol className="flex flex-col gap-3">
        {q.parts.map((p, i) => {
          const state = i < partIndex ? "done" : i === partIndex ? "live" : "later";
          if (state === "later") return null;
          // The unrecognised-miss panel. Practice only: an exam-style run holds its steps to the end.
          // The accuracy step waits while the expected answer is being withheld: the same first miss, the
          // same value, so it is hidden in both places or in neither.
          const reteach = state === "live" && result && kind !== "exam" ? reteachOf(p, result, seen, partMisses < 2) : null;
          // Being asked again is the accented thing on a miss. Where the topic has a twin, the twin
          // takes the card's primary button and another go sits under the teaching; where it has none,
          // another go takes that button instead, so "Next part" is never the accented way out.
          // Two misses on a part: a third guess teaches nothing, so the field stays closed and the card offers support
          // instead: a hint, the worked solution, and a twin as the next attempt (engine item 10.2; programme 0.1). The
          // offer is the card's own buttons, so the screen keeps one accent-filled control: the EncouragementCard that
          // first carried it sat its accented hint beside the card's accented Next (it is retired from the runner).
          const offerSupport = state === "live" && !!result && !result.correct && kind !== "exam" && partMisses >= 2;
          const retryInCard = reteach !== null && !onTwin && !offerSupport;
          // A hint the screen is not already showing: never the same sentence twice.
          const supportHint = offerSupport ? supportHintFor(p, reteach) : null;
          const offer = offerSupport ? supportOffer({ hint: supportHint !== null, hintShown: hintShown !== null, workedOpen, twin: !!onTwin }) : null;
          const take = (rung: SupportRung): (() => void) | undefined =>
            rung === "hint" ? () => setHintShown(supportHint) : rung === "worked" ? () => setWorkedOpen(true) : onTwin;
          const cardTwin = offer ? (offer.primary ? take(offer.primary) : undefined) : kind === "exam" ? undefined : retryInCard ? retry : onTwin;
          const cardTwinLabel = offer ? (offer.primary ? SUPPORT_LABEL[offer.primary] : undefined) : reteach ? (retryInCard ? "Try again" : "Try a twin") : undefined;
          const secondary = offer?.secondary ?? null;
          // The examiner's slot holds only what an examiners' report said: a matched common error the report named,
          // cited by its series (engine item 10.3). A hint is not the examiner's sentence and no longer sits there.
          const examinerLine = state === "live" && result?.source ? "Examiners reported this same error on a real paper." : undefined;
          return (
            <li key={p.id} className={state === "done" ? "opacity-70" : ""}>
              <div className="flex gap-3">
                {q.parts.length > 1 && <span className="tnum mt-0.5 shrink-0 text-meta text-ink-2">({p.id})</span>}
                <div className="min-w-0 flex-1">
                  <div className="text-ui leading-relaxed">
                    <Md md={p.stem} />
                  </div>
                  <p className="tnum mt-1 text-right text-meta text-ink-2">[{p.marks}]</p>
                  {state === "done" && (
                    <p className="tnum text-meta text-ink-2">
                      {earned[i]} / {p.marks}
                    </p>
                  )}
                  {state === "live" && !result && !decision && auto && (
                    <div className="mt-2">
                      <AnswerField
                        spec={p.answer}
                        calculator={q.paper.calculator !== false}
                        onSubmit={submit}
                        prompt={p.stem}
                        underField={
                          ladder.length > 0 ? (
                            <WorkingField
                              value={working}
                              onChange={setWorking}
                              alwaysOpen={workingAlwaysOpen}
                              note={kind === "exam" ? "Working counts here: the scheme gives marks for method." : undefined}
                            />
                          ) : undefined
                        }
                      />
                    </div>
                  )}
                  {state === "live" && decision && p.answer.kind === "text-long" && (
                    <div className="mt-3">
                      <QwcDecision spec={p.answer} text={lastRaw ?? ""} marks={p.marks} onAward={(n, band) => void awardBand(n, band)} />
                      <SolutionDetails workedSolution={p.workedSolution} scheme={p.scheme} />
                    </div>
                  )}
                  {state === "live" && !result && !decision && !auto && (
                    <SelfMarkPart
                      marks={p.marks}
                      workedSolution={p.workedSolution}
                      scheme={p.scheme}
                      value={selfMark}
                      onChange={setSelfMark}
                      onConfirm={() => {
                        const m = selfMark ?? 0;
                        void commit(m, m === p.marks, null).then(advance);
                      }}
                    />
                  )}
                  {state === "live" && result && (
                    <div className="mt-3">
                      <FeedbackCard
                        result={result}
                        examinerLine={examinerLine}
                        examinerSource={examinerLine ? result.source : undefined}
                        onNext={advance}
                        // What the scheme was seen to give her for, in its own code, under the marks line.
                        seenMarks={seen.length > 0 ? <SeenMarks earned={seen} /> : undefined}
                        // The first unrecognised miss is re-asked, so the expected value waits in the worked solution
                        // until the second miss; a recognised error keeps its diagnosis and the value as before.
                        withholdExpected={!!reteach && partMisses < 2}
                        // Nothing re-teaches between the parts of an exam question: the twin waits for the end.
                        onTwin={cardTwin}
                        twinLabel={cardTwinLabel}
                        nextLabel={partIndex + 1 < q.parts.length ? "Next part" : "Done"}
                        // The scheme's codes beside the meter, the points her working was seen to earn, the kind (a
                        // piecewise kind shows its codes unmarked) and the item her review card is under (surfaces 2e).
                        scheme={p.scheme}
                        earnedPoints={seen.map((e) => e.id)}
                        answerKind={p.answer.kind}
                        returnsFor={`${q.id}#${p.id}`}
                        actions={
                          (p.answer.kind === "text" && !result.correct) || secondary ? (
                            <>
                              {secondary && (
                                <button type="button" className={btnSecondary} onClick={take(secondary)}>
                                  {SUPPORT_LABEL[secondary]}
                                </button>
                              )}
                              {p.answer.kind === "text" && !result.correct && (
                                <button type="button" className={btnSecondary} onClick={() => void selfAward()}>
                                  My answer matches the solution: award {p.marks}/{p.marks}
                                </button>
                              )}
                            </>
                          ) : undefined
                        }
                      />
                      {reteach && (
                        <ReteachPanel reteach={reteach} onRetry={retryInCard || offerSupport ? undefined : retry}>
                          {/* The second miss, and only then: unsigned prose, no mark, no attribute. */}
                          {partMisses >= 2 && <CompanionLine moment="support" context={companion} className="mt-3" />}
                        </ReteachPanel>
                      )}
                      {/* A recognised error has no panel; its second miss gets the support line all the same (companion, lead 14:10). */}
                      {!reteach && partMisses >= 2 && !result.correct && p.hints[0] && <CompanionLine moment="support" context={companion} className="mt-3" />}
                      {offerSupport && hintShown && <SupportHint hint={hintShown} />}
                      <SolutionDetails workedSolution={p.workedSolution} scheme={p.scheme} open={workedOpen} />
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {finished && (
        <p className="tnum mt-4 text-ui font-medium">
          {earned.reduce((a, b) => a + b, 0)} / {q.totalMarks} marks
        </p>
      )}

      {/* The exam-style run re-teaches nothing mid-paper: the steps it held back arrive here, once. */}
      {finished && held.length > 0 && (
        <section className="rise-in mt-3 flex flex-col gap-3">
          <p className="text-meta font-medium text-ink-2">What to pick up</p>
          {held.map((h) => (
            <div key={h.partId} className="rounded-[var(--radius-sm)] bg-surface-2 p-3.5">
              {q.parts.length > 1 && <p className="tnum text-meta text-ink-2">Part ({h.partId})</p>}
              <ReteachBody reteach={h.reteach} className={q.parts.length > 1 ? "mt-2" : undefined} />
            </div>
          ))}
          {onTwin && (
            <div>
              <button type="button" className={btnSecondary} onClick={onTwin}>
                Try a twin
              </button>
            </div>
          )}
        </section>
      )}

      {kind === "exam" && verification && (
        <div className="mt-4">
          <CheckedWithReports log={verification} itemId={q.id} subject={item.subject} topicSlug={item.topicSlug} />
        </div>
      )}
    </article>
  );
}

/**
 * The Checked panel with her own reports: what she sends is kept with the item (src/lib/db/reports.ts) and read back
 * into the panel, so a report visibly survives a reload (engine item 10.4: the handler used to throw it away). The
 * query only reads, as a liveQuery must; the write is the panel's submit handler.
 */
function CheckedWithReports({ log, itemId, subject, topicSlug }: { log: VerificationLog; itemId: string; subject: ItemRef["subject"]; topicSlug: string }) {
  const sent = useLiveQuery(async () => {
    try {
      return await reportsFor(itemId);
    } catch {
      return [];
    }
  }, [itemId]);
  return <CheckedPanel log={log} sent={sent ?? []} onReport={(text) => void saveReport({ itemId, subject, topicSlug, text })} />;
}

/** The words on the card's buttons for each way on after two misses (engine item 10.2). */
const SUPPORT_LABEL: Record<SupportRung, string> = {
  hint: "Show me a hint",
  worked: "Show the worked solution",
  twin: "Try a twin",
};

/**
 * The hint she chose after two misses (engine item 10.2): the same quiet block as the re-teach panel, under the card.
 * The card's buttons carry what comes next (the twin, or the worked solution), so the block has none of its own.
 */
function SupportHint({ hint }: { hint: string }) {
  return (
    <div className="rise-in mt-3 rounded-[var(--radius-sm)] bg-surface-2 p-3.5">
      <p className="text-meta font-medium text-ink-2">A hint</p>
      <p className="mt-1.5 text-ui leading-relaxed">
        <Tex text={hint} />
      </p>
    </div>
  );
}

/**
 * The method marks her working was seen to earn, under the marks line, in the scheme's own code:
 * "MA1 seen: (1/3)π(6)²(15)". A statement of what the examiner would award, not praise for it.
 */
function SeenMarks({ earned }: { earned: readonly EarnedMark[] }) {
  return (
    <ul className="mt-1.5 flex flex-col gap-1 text-meta leading-relaxed text-ink-2">
      {earned.map((e) => (
        <li key={e.id}>
          <span className="tnum mr-1.5 rounded bg-surface-2 px-1.5 font-medium text-ink">{e.code}</span>
          seen: <Tex text={e.for} />
        </li>
      ))}
    </ul>
  );
}

/**
 * What an unrecognised answer gets instead of one generic sentence: the mark point she has not reached,
 * the same idea in a different form, and another go at it. Quiet by design — a block of surface-2 under
 * the feedback card rather than a second bordered card — so the card keeps the verdict and this keeps
 * the teaching. The worked solution stays folded away underneath: nothing here reveals the answer that
 * the card has not already named.
 */
function ReteachPanel({
  reteach,
  onRetry,
  children,
}: {
  reteach: Reteach;
  /** Another go, under the teaching. Undefined when the card is already carrying it as its primary. */
  onRetry?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="rise-in mt-3 rounded-[var(--radius-sm)] bg-surface-2 p-3.5">
      <ReteachBody reteach={reteach} />
      {children}
      {onRetry && (
        <div className="mt-4">
          <button type="button" className={btnSecondary} onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

/** The two blocks themselves, shared by the practice panel and the exam-style summary after the run. */
function ReteachBody({ reteach, className }: { reteach: Reteach; className?: string }) {
  return (
    <div className={className}>
      {reteach.step && (
        <div>
          <p className="text-meta font-medium text-ink-2">Where the next mark is</p>
          <p className="mt-1.5 text-ui leading-relaxed">
            <span className="tnum mr-2 rounded bg-surface px-1.5 font-medium text-ink">{reteach.step.label}</span>
            <Tex text={reteach.step.text} />
          </p>
          {reteach.step.line && (
            <p className="mt-1.5 text-meta leading-relaxed text-ink-2">
              <Tex text={reteach.step.line} />
            </p>
          )}
        </div>
      )}
      {reteach.anotherWay && (
        <div className={reteach.step ? "mt-3.5 border-t border-line pt-3.5" : ""}>
          <p className="text-meta font-medium text-ink-2">Another way to see it</p>
          <p className="mt-1.5 text-ui leading-relaxed">
            <Tex text={reteach.anotherWay} />
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * The worked solution and the mark scheme, folded away: one details block, shown under the feedback card
 * and under the QWC decision panel (where the solution is what she compares her own writing against).
 * A mark point's examiner note rides with it — on a banded question it is the within-band guidance.
 */
function SolutionDetails({ workedSolution, scheme, open = false }: { workedSolution: string; scheme: readonly MarkPoint[]; open?: boolean }) {
  // Opened for her when she asks to be walked through it; the key re-mounts it open, and she can still fold it.
  return (
    <details key={open ? "open" : "folded"} open={open || undefined} className="mt-2 text-meta">
      <summary className="cursor-pointer text-ink-2">Worked solution and mark scheme</summary>
      <div className="mt-2 rounded-[var(--radius-sm)] bg-surface-2 p-3">
        <Md md={workedSolution} />
        <ul className="mt-2 flex flex-col gap-1 text-meta text-ink-2">
          {scheme.map((m) => (
            <li key={m.id}>
              <span className="tnum mr-2 rounded bg-surface px-1.5 font-medium text-ink">
                {m.code}
                {m.marks}
              </span>
              <Tex text={m.for} />
              {m.examinerNote && <span className="mt-0.5 block text-ink-2">{m.examinerNote}</span>}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

/**
 * The decision surface for a six-mark written-communication answer. Three things, in the order the
 * examiner does them: the evidence (which indicative points have a key word in what she wrote, quoted
 * back), the band descriptors as the choice, and a mark inside the chosen band, starting at that band's
 * floor. Counting key words is evidence, never the award — the last word is hers, and one button records
 * it. No verdict language: a point that is not there is "not yet".
 */
function QwcDecision({
  spec,
  text,
  marks,
  onAward,
}: {
  spec: LongTextSpec;
  text: string;
  marks: number;
  onAward: (n: number, band: string) => void;
}) {
  const ev = useMemo(() => qwcEvidence(text, spec), [text, spec]);
  const bands = spec.bands;
  const suggestedIndex = Math.max(
    0,
    bands.findIndex((b) => b.band === ev.band?.band),
  );
  const [bandIndex, setBandIndex] = useState(suggestedIndex);
  const [mark, setMark] = useState(Math.min(marks, ev.suggestedMarks));
  const group = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: false });
  }, []);

  const band = bands[bandIndex] ?? bands[0];
  if (!band) return null;
  const onSuggestedBand = band.band === ev.band?.band;
  const lo = Math.min(band.marks[0], marks);
  const hi = Math.min(band.marks[1], marks);
  const choices = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

  const chooseBand = (i: number) => {
    const next = bands[i];
    if (!next) return;
    setBandIndex(i);
    // A new band starts at its floor: the honest place to argue upwards from.
    setMark(Math.min(marks, next.marks[0]));
  };

  return (
    <div ref={ref} tabIndex={-1} className={clsx(cardCls, quietFocus)}>
      <p className="text-[17px] font-medium leading-snug">Now band it yourself</p>
      <p className="mt-1 text-ui text-ink-2">
        {ev.total > 0
          ? `${ev.found} of the ${ev.total} indicative points have one of their key words in your answer. That count is where the examiner starts; the descriptors are the decision.`
          : "This part is placed on the band descriptors."}
      </p>

      {ev.points.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-ui">
          {ev.points.map((p) => (
            <li key={p.index} className="flex items-start gap-2.5">
              {p.present ? <Tick size={18} className="mt-0.5" label="Found in your answer" /> : <MissMark size={18} className="mt-0.5" label="Not yet" />}
              <span className="min-w-0 flex-1">
                <Tex text={p.point} />
                {p.found.length > 0 && <span className="text-ink-2"> — you wrote {p.found.map((k) => `“${k}”`).join(", ")}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      <fieldset className="mt-5 border-t border-line pt-4">
        <legend className="text-meta font-medium text-ink-2">Which band do the descriptors put it in?</legend>
        <div className="mt-2 flex flex-col gap-2">
          {bands.map((b, i) => (
            <label key={b.band} className={clsx(btnOption, "cursor-pointer", i === bandIndex ? "border-ink shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line-3")}>
              <input
                type="radio"
                name={group}
                value={b.band}
                checked={i === bandIndex}
                onChange={() => chooseBand(i)}
                className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
              />
              <span className="min-w-0 flex-1">
                <span className="tnum font-medium">
                  Band {b.band} · {qwcBandRange(b)}
                </span>
                <span className="mt-0.5 block text-meta leading-relaxed text-ink-2">{b.descriptor}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-meta text-ink-2">Marks in band {band.band}:</span>
        {choices.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={mark === n}
            aria-label={`${n} of ${marks} marks`}
            onClick={() => setMark(n)}
            className={clsx("tap tnum rounded-[var(--radius-sm)] border px-3 text-meta", mark === n ? "border-ink bg-ink text-ground" : "border-line-2 bg-surface")}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-2 text-meta text-ink-2">
        {onSuggestedBand
          ? "The count puts you at the floor of this band. The top of a band is for detail, specialist terms used accurately and writing that stays clear throughout — read the descriptor and decide."
          : `The count of points alone suggested band ${ev.band?.band ?? "—"}. The descriptors decide, and that reading is yours.`}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" className={btnPrimary} onClick={() => onAward(mark, band.band)}>
          Award {mark} mark{mark === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );
}

function SelfMarkPart({
  marks,
  workedSolution,
  scheme,
  value,
  onChange,
  onConfirm,
}: {
  marks: number;
  workedSolution: string;
  scheme?: Array<{ id: string; code: string; marks: number; for: string }>;
  value: number | null;
  onChange: (n: number) => void;
  onConfirm: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="mt-2 rounded-[var(--radius-sm)] border border-line bg-surface-2 p-3">
      <p className="text-meta text-ink-2">Write this part on paper as you would in the exam, then mark it against the solution and the scheme.</p>
      {revealed && scheme && scheme.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-meta text-ink-2">
          {scheme.map((m) => (
            <li key={m.id}>
              <span className="tnum mr-2 rounded bg-surface px-1.5 font-medium text-ink">
                {m.code}
                {m.marks}
              </span>
              <Tex text={m.for} />
            </li>
          ))}
        </ul>
      )}
      {!revealed ? (
        <button type="button" className="tap mt-2 rounded-[var(--radius-sm)] bg-accent px-4 font-medium text-accent-ink" onClick={() => setRevealed(true)}>
          Show solution
        </button>
      ) : (
        <>
          <div className="mt-2 text-meta">
            <Md md={workedSolution} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-meta text-ink-2">Marks earned:</span>
            {Array.from({ length: marks + 1 }).map((_, n) => (
              <button
                key={n}
                type="button"
                aria-pressed={value === n}
                onClick={() => onChange(n)}
                className={`tap tnum rounded-[var(--radius-sm)] border px-3 text-meta ${value === n ? "border-ink bg-ink text-ground" : "border-line-2 bg-surface"}`}
              >
                {n}
              </button>
            ))}
            <button type="button" disabled={value === null} className="tap rounded-[var(--radius-sm)] bg-accent px-4 font-medium text-accent-ink disabled:opacity-40" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        </>
      )}
    </div>
  );
}
