"use client";

/**
 * Plausible wrong working seeded from an examiner report. Three moves: tap the first
 * line that goes wrong, name the reason, type the corrected line. The reveal shows the
 * correction, the marks the working earned as written, and cites the series.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import type { FindTheMistake as FindTheMistakeItem } from "@/lib/content/schema";
import { MathsLineInput } from "./AnswerField";
import { formatExaminerSource, optionLetter } from "./format";
import { firstSentence, markFix } from "./mistake-marking";
import { seededShuffle } from "./shuffle";
import { Tex } from "./Tex";
import { btnCheck, btnOption, btnPrimary, btnSecondary, cardCls, Eyebrow, Letter, MarkChip, MissMark, quietFocus, Rise, Tick } from "./ui";

export interface FindTheMistakeResult {
  /** The mistake line was the first line tapped. */
  foundLine: boolean;
  /** The right reason was chosen first (or, without options, self-confirmed). */
  namedReason: boolean;
  /** The corrected line matched within two tries. */
  fixed: boolean;
}

export interface FindTheMistakeProps {
  item: FindTheMistakeItem;
  /**
   * Distractor reasons. The correct reason is the first sentence of `item.whatWentWrong`
   * and is mixed in with these; without options the learner names the reason in words.
   */
  reasonOptions?: string[];
  onResult: (result: FindTheMistakeResult) => void;
  onNext?: () => void;
}

type Stage = "find" | "reason" | "fix" | "reveal";

export function FindTheMistake({ item, reasonOptions, onResult, onNext }: FindTheMistakeProps) {
  const [stage, setStage] = useState<Stage>("find");
  const [tapped, setTapped] = useState<number[]>([]);
  const [lineGivenAway, setLineGivenAway] = useState(false);
  const [reasonPick, setReasonPick] = useState<number | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [reasonShown, setReasonShown] = useState(false);
  const [namedReason, setNamedReason] = useState<boolean | null>(null);
  const [fix, setFix] = useState("");
  const [fixTries, setFixTries] = useState(0);
  const [fixed, setFixed] = useState<boolean | null>(null);
  const reported = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStage("find");
    setTapped([]);
    setLineGivenAway(false);
    setReasonPick(null);
    setReasonText("");
    setReasonShown(false);
    setNamedReason(null);
    setFix("");
    setFixTries(0);
    setFixed(null);
    reported.current = false;
  }, [item.id]);

  useEffect(() => {
    if (stage !== "find") stageRef.current?.focus();
  }, [stage]);

  const correctReason = useMemo(() => firstSentence(item.whatWentWrong), [item.whatWentWrong]);
  const reasons = useMemo(() => {
    if (!reasonOptions || reasonOptions.length === 0) return null;
    return seededShuffle([correctReason, ...reasonOptions], `${item.id}|reasons`);
  }, [reasonOptions, correctReason, item.id]);

  const foundLine = tapped[0] === item.mistakeLine;

  useEffect(() => {
    if (stage === "reveal" && !reported.current) {
      reported.current = true;
      onResult({ foundLine, namedReason: namedReason === true, fixed: fixed === true });
    }
  }, [stage, foundLine, namedReason, fixed, onResult]);

  const tapLine = (n: number) => {
    if (stage !== "find" || tapped.includes(n)) return;
    const next = [...tapped, n];
    setTapped(next);
    if (n === item.mistakeLine) {
      setStage("reason");
    } else if (next.length >= 2) {
      setLineGivenAway(true);
      setStage("reason");
    }
  };

  const chooseReason = (i: number) => {
    if (reasonPick !== null || !reasons) return;
    setReasonPick(i);
    setNamedReason(reasons[i] === correctReason);
  };

  const checkFix = () => {
    if (!fix.trim()) return;
    const tries = fixTries + 1;
    setFixTries(tries);
    // `markFix`, not the bare correction match: the flagged line typed back, or a line she already has, is "not
    // there yet" however much it shares with a correction line (engine brief item 1, 23 Sep 2026).
    if (markFix(fix, item).match) {
      setFixed(true);
      setStage("reveal");
    } else if (tries >= 2) {
      setFixed(false);
      setStage("reveal");
    }
  };

  const sourceLine = formatExaminerSource(item.source);

  return (
    <section className={cardCls} aria-label="Find the mistake">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Eyebrow>Find the mistake</Eyebrow>
        <span className="text-meta text-ink-2">
          {stage === "find" && "1 · Which line?"}
          {stage === "reason" && "2 · Why?"}
          {stage === "fix" && "3 · Fix it"}
          {stage === "reveal" && "Marked"}
        </span>
      </div>
      <p className="mt-2 text-ui leading-relaxed text-ink-2">
        <Tex text={item.stem} />
      </p>

      <p className="mt-4 text-meta font-medium text-ink-2">{stage === "find" ? "Tap the first line that goes wrong." : "Their working"}</p>
      <ol className="mt-1.5 space-y-1.5" aria-label="Student working">
        {item.studentWorking.map((line, i) => {
          const n = i + 1;
          const isMistake = n === item.mistakeLine;
          const wasTapped = tapped.includes(n);
          const revealMistake = stage !== "find" && isMistake;
          const sound = wasTapped && !isMistake;
          return (
            <li key={n}>
              <button
                type="button"
                disabled={stage !== "find" || wasTapped}
                onClick={() => tapLine(n)}
                aria-pressed={wasTapped}
                className={clsx(
                  btnOption,
                  "items-center",
                  revealMistake ? "border-ink shadow-[inset_0_0_0_1px_var(--ink)]" : sound ? "border-line-2 text-ink-2" : "border-line-3",
                  stage !== "find" && !isMistake && "opacity-70",
                )}
              >
                <span className="tnum w-5 shrink-0 text-meta font-medium text-ink-2" aria-hidden>
                  {n}
                </span>
                <span className="flex-1">
                  <Tex text={line} />
                  {sound && <span className="mt-0.5 block text-meta text-ink-2">This line is sound.</span>}
                  {revealMistake && (
                    <span className="mt-0.5 flex items-center gap-1.5 text-meta font-medium text-ink-2">
                      <MissMark size={14} label="" /> {lineGivenAway ? "Here is where it goes wrong" : "Found it"}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {stage === "find" && tapped.length > 0 && (
        <p className="mt-2 text-meta text-ink-2" role="status">
          Not that line — it holds up. Look again.
        </p>
      )}

      {stage !== "find" && (
        <div ref={stageRef} tabIndex={-1} className={clsx("mt-4 border-t border-line pt-4", quietFocus)}>
          {/* ---- reason ---- */}
          <Rise as="div">
            <p className="text-meta font-medium text-ink-2">What went wrong on line {item.mistakeLine}?</p>
            {reasons ? (
              <div role="radiogroup" aria-label="What went wrong?" className="mt-2 grid gap-1.5">
                {reasons.map((r, i) => {
                  const chosen = reasonPick === i;
                  const right = r === correctReason;
                  const done = reasonPick !== null;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      disabled={done}
                      onClick={() => chooseReason(i)}
                      className={clsx(
                        btnOption,
                        chosen ? "border-ink shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line-3",
                        done && right && "border-ink",
                        done && !chosen && !right && "opacity-60",
                      )}
                    >
                      <Letter active={chosen}>{optionLetter(i)}</Letter>
                      <span className="flex-1 text-meta">
                        <Tex text={r} />
                        {done && (chosen || right) && (
                          <span className="mt-1 flex items-center gap-1.5 text-meta font-medium text-ink-2">
                            {right ? <Tick size={14} label="" /> : <MissMark size={14} label="" />}
                            {right ? (chosen ? "Your choice · the reason" : "The reason") : "Your choice"}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2">
                {!reasonShown ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (reasonText.trim()) setReasonShown(true);
                    }}
                  >
                    <MathsLineInput value={reasonText} onChange={setReasonText} onEnter={() => reasonText.trim() && setReasonShown(true)} keys={[]} label="What went wrong, in your words" placeholder="In your words" multiline autoFocus />
                    <button type="submit" className={clsx(btnPrimary, "mt-2")} disabled={!reasonText.trim()}>
                      Compare
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p className="text-meta text-ink-2">
                      <span className="text-ink-2">You wrote: </span>
                      {reasonText}
                    </p>
                    <p className="text-ui">
                      <Tex text={item.whatWentWrong} />
                    </p>
                    {namedReason === null && (
                      <div role="group" aria-label="Did you name it?" className="grid grid-cols-2 gap-2">
                        <button type="button" className={btnPrimary} onClick={() => setNamedReason(true)}>
                          <Tick size={16} label="" /> I named it
                        </button>
                        <button type="button" className={btnSecondary} onClick={() => setNamedReason(false)}>
                          <MissMark size={16} label="" /> Not quite
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {reasons && reasonPick !== null && (
              <p className="mt-2 text-meta text-ink" role="status">
                <Tex text={item.whatWentWrong} />
              </p>
            )}
            {stage === "reason" && namedReason !== null && (
              <button type="button" className={clsx(btnPrimary, "mt-3")} onClick={() => setStage("fix")}>
                Now fix it <ArrowRight size={16} aria-hidden />
              </button>
            )}
          </Rise>

          {/* ---- fix ---- */}
          {(stage === "fix" || stage === "reveal") && (
            <Rise as="div" className="mt-4 border-t border-line pt-4">
              <p className="text-meta font-medium text-ink-2">Write line {item.mistakeLine} correctly.</p>
              {stage === "fix" ? (
                <form
                  className="mt-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    checkFix();
                  }}
                >
                  <MathsLineInput value={fix} onChange={setFix} onEnter={checkFix} label={`Corrected line ${item.mistakeLine}`} placeholder="The corrected line, ending with the value" autoFocus />
                  <div className="mt-2 flex items-center gap-3">
                    <button type="submit" className={btnCheck} disabled={!fix.trim()}>
                      Check
                    </button>
                    {fixTries > 0 && (
                      <span className="text-meta text-ink-2" role="status">
                        Not there yet — one more go, then the correction is shown.
                      </span>
                    )}
                  </div>
                </form>
              ) : (
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-2 text-meta font-medium">
                    {fixed ? <Tick size={18} /> : <MissMark size={18} />}
                    {fixed ? "Fixed." : "Here is the correction."}
                    {fix.trim() && (
                      <span className="font-normal text-ink-2">
                        <span className="text-ink-2">You wrote: </span>
                        {fix}
                      </span>
                    )}
                  </div>
                  <ol className="space-y-1 rounded-[var(--radius-sm)] border border-line bg-surface-2/60 px-3.5 py-3 text-ui" aria-label="Correction">
                    {item.correction.map((line, i) => (
                      <li key={i}>
                        <Tex text={line} />
                      </li>
                    ))}
                  </ol>
                  <div className="flex flex-wrap items-center gap-2 text-meta">
                    <span className="text-ink-2">As written it earned</span>
                    {item.marksEarnedAsWritten.length === 0 ? <span className="font-medium">no marks</span> : item.marksEarnedAsWritten.map((c) => <MarkChip key={c} code={c} />)}
                  </div>
                  <p className="text-meta leading-relaxed text-ink">
                    <Tex text={item.feedback} />
                  </p>
                  <p className="text-meta text-ink-2">{sourceLine}</p>
                  {onNext && (
                    <button type="button" className={btnPrimary} onClick={onNext}>
                      Next <ArrowRight size={16} aria-hidden />
                    </button>
                  )}
                </div>
              )}
            </Rise>
          )}
        </div>
      )}
    </section>
  );
}
