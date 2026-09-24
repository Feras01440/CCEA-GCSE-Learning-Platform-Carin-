"use client";

/**
 * A worked example she works through rather than reads. `full`: tap-to-reveal steps with
 * the narrated decision, a why-menu and the mark each step earns. `faded1` / `faded2`:
 * the later steps become inputs — marked against an authored spec when the step has one,
 * otherwise her typed line is compared with the authored working; a miss reveals only that
 * step's fix. `twin`: the twin stem with one answer field. `problem`: the stem alone, then
 * self-check.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Eye } from "lucide-react";
import { clsx } from "clsx";
import type { AnswerSpec, WorkedExample, WorkedExampleStep } from "@/lib/content/schema";
import { AnswerField, MathsLineInput } from "./AnswerField";
import { accuracyOf, planFade, type FadeLevel } from "./fade";
import { FeedbackCard } from "./FeedbackCard";
import { Figure } from "./Figure";
import { markAnswer, type MarkResult } from "./mark";
import { Md } from "./Markdown";
import { stepLineMatches } from "./mistake-marking";
import { Tex } from "./Tex";
import { btnCheck, btnOption, btnPrimary, btnSecondary, cardCls, Eyebrow, Letter, MarkChip, MissMark, Rise, Tick } from "./ui";
import { optionLetter } from "./format";

export type { FadeLevel } from "./fade";

export interface WorkedExampleAsQuestionProps {
  we: WorkedExample;
  fade: FadeLevel;
  /** Called for every step the learner answered (an input step or a why-menu). */
  onStep?: (n: number, correct: boolean) => void;
  /** Called once at the end with the fraction of answered steps that were right (1 when none were asked). */
  onComplete?: (accuracy: number) => void;
  /** Rendered as a Next button once the example is complete. */
  onNext?: () => void;
  calculator?: boolean;
}

// ---------------------------------------------------------------------------------------------
// One step (shown)
// ---------------------------------------------------------------------------------------------

/**
 * Why does that step work? She picks an option; the option she picked is reported by its index, with whether it is
 * the reason, so the menu draws her own pick as her choice (engine item 10.7: the runner kept only right or wrong and
 * drew any wrong pick as the first wrong option).
 */
export function WhyMenu({ step, onAnswer, answered }: { step: WorkedExampleStep; onAnswer: (index: number, correct: boolean) => void; answered: number | null }) {
  const menu = step.whyMenu;
  if (!menu) return null;
  const done = answered !== null;
  return (
    <div className="mt-3 rounded-[var(--radius-sm)] border border-line bg-surface-2/60 p-3">
      <p className="text-meta font-medium text-ink-2">Why does that work?</p>
      <div role="radiogroup" aria-label="Why does that work?" className="mt-2 grid gap-1.5">
        {menu.options.map((opt, i) => {
          const chosen = answered === i;
          const right = i === menu.correct;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={chosen}
              disabled={done}
              onClick={() => onAnswer(i, i === menu.correct)}
              className={clsx(
                btnOption,
                "bg-surface",
                chosen ? "border-ink shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line-3",
                done && right && "border-ink",
                done && !chosen && !right && "opacity-60",
              )}
            >
              <Letter active={chosen}>{optionLetter(i)}</Letter>
              <span className="flex-1 text-meta">
                <Tex text={opt} />
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
      {done && (
        <Rise as="div" className="mt-2 text-meta text-ink" role="status">
          <Tex text={menu.explain} />
        </Rise>
      )}
    </div>
  );
}

function StepBody({ step, children, tone = "shown" }: { step: WorkedExampleStep; children?: ReactNode; tone?: "shown" | "fix" | "earned" }) {
  return (
    <div className={clsx("rounded-[var(--radius-sm)] border p-3.5", tone === "fix" ? "border-ink-3" : "border-line")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {tone === "fix" && <p className="mb-1 text-meta font-medium text-ink-2">The fix for this step</p>}
          <Md md={step.working} className="text-[16px]" compact />
        </div>
        {step.earns && step.earns.length > 0 && (
          <span className="flex shrink-0 gap-1" aria-label={`Earns ${step.earns.join(", ")}`}>
            {step.earns.map((code) => (
              <MarkChip key={code} code={code} />
            ))}
          </span>
        )}
      </div>
      <div className="mt-2 flex gap-2 text-meta leading-relaxed text-ink-2">
        <span className="shrink-0 font-medium text-ink-2">Because</span>
        <Md md={step.decision} className="text-meta text-ink-2" compact />
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// One step (input)
// ---------------------------------------------------------------------------------------------

/** How a supplied step was settled; the finished step's line reads from it. */
type StepVerdict = "matched" | "claimed" | "missed" | "marked";

/** The line a finished step carries: a compared line that matched says so; otherwise hers, or the fix. */
function settledLine(correct: boolean, verdict: StepVerdict | undefined): string {
  if (verdict === "matched") return "That matches the line I had.";
  return correct ? "Your step" : "Fixed";
}

/**
 * A supplied step with no authored input spec: she types her line and it is compared with
 * the authored working (`stepLineMatches`). A match is recorded at once; anything else shows
 * the authored line and asks whether that is what she had, so a paraphrase is never a miss.
 */
function LineStep({ step, before, onResult }: { step: WorkedExampleStep; before: readonly string[]; onResult: (correct: boolean, verdict: StepVerdict) => void }) {
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState<string | null>(null);

  const check = () => {
    const line = typed.trim();
    if (!line || checked !== null) return;
    // `pieces`: any statement of the step is hers to write ("R = 12i + 5j" for "So the resultant is $12\mathbf{i} +
    // 5\mathbf{j}$ N, since …"), which the ladder and the re-teach pairing must not allow; `before`: a piece this
    // step only restates from an earlier step is not its line (engine brief item 1).
    if (stepLineMatches(line, step.working, { pieces: true, before }).match) onResult(true, "matched");
    else setChecked(line);
  };

  if (checked === null) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
      >
        <MathsLineInput value={typed} onChange={setTyped} onEnter={check} label="Your line" placeholder="Your line for this step" autoFocus />
        <div className="mt-2 flex items-center gap-3">
          <button type="submit" className={btnCheck} disabled={!typed.trim()}>
            Check
          </button>
          <span className="text-meta text-ink-2">Enter to check</span>
        </div>
      </form>
    );
  }

  return (
    <Rise as="div" className="space-y-3">
      <p className="text-meta text-ink-2">
        <span className="text-ink-2">You wrote: </span>
        {checked}
      </p>
      <p className="text-meta font-medium" role="status">
        Not the same line yet. <span className="font-normal text-ink-2">Mine was:</span>
      </p>
      <StepBody step={step} />
      <div role="group" aria-label="Was that your line?" className="grid grid-cols-2 gap-2">
        <button type="button" className={btnPrimary} onClick={() => onResult(true, "claimed")}>
          <Tick size={16} label="" /> That is what I had
        </button>
        <button type="button" className={btnSecondary} onClick={() => onResult(false, "missed")}>
          <MissMark size={16} label="" /> Not yet
        </button>
      </div>
    </Rise>
  );
}

function InputStep({
  step,
  before = [],
  calculator,
  onResult,
}: {
  step: WorkedExampleStep;
  /** The earlier steps' working, for the line comparison. */
  before?: readonly string[];
  calculator?: boolean;
  onResult: (correct: boolean, verdict: StepVerdict) => void;
}) {
  const [result, setResult] = useState<MarkResult | null>(null);
  const spec: AnswerSpec | undefined = step.input;

  if (!spec) return <LineStep step={step} before={before} onResult={onResult} />;

  if (result) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-meta font-medium">
          {result.correct ? <Tick size={18} /> : <MissMark size={18} />}
          {result.correct ? "That's the step." : "Not that — here is the step."}
          {!result.correct && result.explanation && <span className="font-normal text-ink-2">· {result.explanation}</span>}
        </div>
        <StepBody step={step} tone={result.correct ? "earned" : "fix"} />
      </div>
    );
  }

  return (
    <AnswerField
      spec={spec}
      calculator={calculator}
      label={`Step ${step.n}`}
      placeholder="Your working for this step"
      autoFocus
      onSubmit={(raw) => {
        const r = markAnswer(raw, spec, { marks: step.earns?.length ?? 1 });
        setResult(r);
        onResult(r.correct, "marked");
      }}
    />
  );
}

// ---------------------------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------------------------

export function WorkedExampleAsQuestion({ we, fade, onStep, onComplete, onNext, calculator }: WorkedExampleAsQuestionProps) {
  const plan = useMemo(() => planFade(we, fade), [we, fade]);
  const calc = calculator ?? we.paper.calculator;

  if (plan.mode === "twin") return <TwinMode we={we} calculator={calc} onStep={onStep} onComplete={onComplete} onNext={onNext} />;
  if (plan.mode === "problem") return <ProblemMode we={we} calculator={calc} onComplete={onComplete} onNext={onNext} />;
  return <StepsMode we={we} fade={fade} showSteps={plan.showSteps} sequence={plan.sequence} calculator={calc} onStep={onStep} onComplete={onComplete} onNext={onNext} />;
}

function Header({ we, fade }: { we: WorkedExample; fade: FadeLevel }) {
  const label: Record<FadeLevel, string> = {
    full: "Worked example · read each step, then say why",
    faded1: "Your turn · the last step is yours",
    faded2: "Your turn · finish the working",
    twin: "Twin · same structure, new numbers",
    problem: "Problem · on your own",
  };
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <Eyebrow>{label[fade]}</Eyebrow>
      <span className="text-meta text-ink-2">
        {we.paper.unit} · {we.paper.calculator ? "calculator" : "non-calculator"}
      </span>
    </div>
  );
}

function StepsMode({
  we,
  fade,
  showSteps,
  sequence,
  calculator,
  onStep,
  onComplete,
  onNext,
}: {
  we: WorkedExample;
  fade: FadeLevel;
  showSteps: number;
  sequence: Array<{ n: number; role: "shown" | "input" }>;
  calculator: boolean;
  onStep?: (n: number, correct: boolean) => void;
  onComplete?: (accuracy: number) => void;
  onNext?: () => void;
}) {
  // Number of steps open so far. The full example is tap-to-reveal from the first step;
  // a faded example opens its given steps at once and stops at the first the learner supplies.
  const initialOpen = fade === "full" ? 1 : showSteps;
  const [opened, setOpened] = useState(initialOpen);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [verdicts, setVerdicts] = useState<Record<number, StepVerdict>>({});
  const [why, setWhy] = useState<Record<number, number>>({});
  const completed = useRef(false);
  const nextBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpened(initialOpen);
    setResults({});
    setVerdicts({});
    setWhy({});
    completed.current = false;
  }, [we.id, fade, initialOpen]);

  const stepsByN = useMemo(() => new Map(we.steps.map((s) => [s.n, s])), [we]);
  const total = sequence.length;

  // The step currently being worked on (the first not yet finished).
  const current = sequence[opened] ?? null;
  const currentStep = current ? stepsByN.get(current.n) ?? null : null;

  // In the full example a why-menu must be answered before the next step is revealed; in a
  // faded example the given steps are scaffolding, so their why-menus stay optional.
  const pendingWhy = fade === "full" && sequence.slice(0, opened).some(({ n }) => stepsByN.get(n)?.whyMenu && why[n] === undefined);
  const allOpen = opened >= total;

  useEffect(() => {
    if (allOpen && !pendingWhy && !completed.current) {
      completed.current = true;
      onComplete?.(accuracyOf(Object.values(results)));
    }
  }, [allOpen, pendingWhy, results, onComplete]);

  const record = (n: number, correct: boolean, verdict: StepVerdict = "marked") => {
    setResults((r) => ({ ...r, [n]: correct }));
    setVerdicts((v) => ({ ...v, [n]: verdict }));
    onStep?.(n, correct);
  };

  return (
    <section className={cardCls} aria-label="Worked example">
      <Header we={we} fade={fade} />
      <div className="mt-3">
        <Md md={we.stem} />
      </div>
      {we.figure && <Figure spec={we.figure} />}

      <ol className="mt-4 space-y-3" aria-label="Steps">
        {sequence.slice(0, opened).map(({ n, role }, i) => {
          const step = stepsByN.get(n);
          if (!step) return null;
          const wasInput = role === "input" && results[n] !== undefined;
          return (
            <Rise key={n} as="li" className="flex gap-3" delay={i >= showSteps ? 0 : 0}>
              <span className="tnum mt-3 w-5 shrink-0 text-meta font-medium text-ink-2" aria-hidden>
                {n}
              </span>
              <div className="min-w-0 flex-1">
                {wasInput ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-meta font-medium text-ink-2">
                      {results[n] ? <Tick size={16} label="" /> : <MissMark size={16} label="" />}
                      {settledLine(results[n], verdicts[n])}
                    </div>
                    <StepBody step={step} tone={results[n] ? "earned" : "fix"} />
                  </div>
                ) : (
                  <StepBody step={step}>
                    {step.whyMenu && (
                      <WhyMenu
                        step={step}
                        answered={why[n] ?? null}
                        onAnswer={(index, correct) => {
                          setWhy((w) => ({ ...w, [n]: index }));
                          record(n, correct);
                        }}
                      />
                    )}
                  </StepBody>
                )}
              </div>
            </Rise>
          );
        })}

        {current && currentStep && !pendingWhy && (
          <li className="flex gap-3">
            <span className="tnum mt-3 w-5 shrink-0 text-meta font-medium text-ink-2" aria-hidden>
              {current.n}
            </span>
            <div className="min-w-0 flex-1">
              {current.role === "input" ? (
                <div className="rounded-[var(--radius-sm)] border border-ink-3 p-3.5">
                  <p className="mb-2 text-meta font-medium">
                    Step {current.n} is yours.{" "}
                    <span className="font-normal text-ink-2">{current.n === total ? "Finish with the answer." : "What comes next?"}</span>
                  </p>
                  <InputStep
                    key={`${we.id}-${current.n}`}
                    step={currentStep}
                    before={we.steps.filter((s) => s.n < current.n).map((s) => s.working)}
                    calculator={calculator}
                    onResult={(correct, verdict) => {
                      record(current.n, correct, verdict);
                      setOpened((o) => o + 1);
                    }}
                  />
                </div>
              ) : (
                <button ref={nextBtn} type="button" className={clsx(btnSecondary, "w-full justify-between")} onClick={() => setOpened((o) => o + 1)}>
                  <span className="inline-flex items-center gap-2">
                    <Eye size={16} aria-hidden /> Reveal step {current.n}
                  </span>
                  <ChevronDown size={16} aria-hidden />
                </button>
              )}
            </div>
          </li>
        )}
        {current && pendingWhy && (
          <li className="pl-8 text-meta text-ink-2" role="status">
            Choose the reason above to continue.
          </li>
        )}
      </ol>

      {allOpen && !pendingWhy && (
        <Rise as="div" className="mt-4 border-t border-line pt-4">
          <p className="text-ui">
            <span className="font-medium">Final answer: </span>
            <Tex text={we.finalAnswer} />
          </p>
          {Object.keys(results).length > 0 && (
            <p className="tnum mt-1 text-meta text-ink-2">
              {Object.values(results).filter(Boolean).length} of {Object.keys(results).length} steps right
            </p>
          )}
          {onNext && (
            <button type="button" className={clsx(btnPrimary, "mt-3")} onClick={onNext}>
              Next <ArrowRight size={16} aria-hidden />
            </button>
          )}
        </Rise>
      )}
    </section>
  );
}

function TwinMode({
  we,
  calculator,
  onStep,
  onComplete,
  onNext,
}: {
  we: WorkedExample;
  calculator: boolean;
  onStep?: (n: number, correct: boolean) => void;
  onComplete?: (accuracy: number) => void;
  onNext?: () => void;
}) {
  const [result, setResult] = useState<MarkResult | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  useEffect(() => {
    setResult(null);
    setShowSteps(false);
  }, [we.id]);

  return (
    <section className={cardCls} aria-label="Twin question">
      <Header we={we} fade="twin" />
      <div className="mt-3">
        <Md md={we.twin.stem} />
      </div>
      {we.twin.figure && <Figure spec={we.twin.figure} />}
      <div className="mt-4">
        {!result ? (
          <AnswerField
            spec={we.twin.answer}
            calculator={calculator}
            autoFocus
            onSubmit={(raw) => {
              const r = markAnswer(raw, we.twin.answer, { marks: we.steps.reduce((a, s) => a + (s.earns?.length ?? 0), 0) || 1, prompt: we.twin.stem });
              setResult(r);
              onStep?.(we.steps.length, r.correct);
              onComplete?.(r.correct ? 1 : 0);
            }}
          />
        ) : (
          <FeedbackCard
            result={result}
            onNext={onNext ?? (() => setShowSteps(true))}
            nextLabel={onNext ? "Next" : "Show the example again"}
            actions={
              !showSteps && (
                <button type="button" className={btnSecondary} onClick={() => setShowSteps(true)}>
                  <Eye size={16} aria-hidden /> Show the steps
                </button>
              )
            }
          />
        )}
      </div>
      {showSteps && (
        <Rise as="div" className="mt-4 border-t border-line pt-4">
          <p className="text-meta font-medium text-ink-2">The original example, step by step</p>
          <ol className="mt-2 space-y-2">
            {we.steps.map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="tnum mt-3 w-5 shrink-0 text-meta font-medium text-ink-2" aria-hidden>
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <StepBody step={s} />
                </div>
              </li>
            ))}
          </ol>
        </Rise>
      )}
    </section>
  );
}

function ProblemMode({ we, calculator, onComplete, onNext }: { we: WorkedExample; calculator: boolean; onComplete?: (accuracy: number) => void; onNext?: () => void }) {
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selfMark, setSelfMark] = useState<boolean | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  useEffect(() => {
    setTyped("");
    setSubmitted(false);
    setSelfMark(null);
    setShowSteps(false);
  }, [we.id]);

  return (
    <section className={cardCls} aria-label="Problem">
      <Header we={we} fade="problem" />
      <div className="mt-3">
        <Md md={we.stem} />
      </div>
      {we.figure && <Figure spec={we.figure} />}
      <div className="mt-4">
        {!submitted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typed.trim()) setSubmitted(true);
            }}
          >
            <MathsLineInput value={typed} onChange={setTyped} onEnter={() => typed.trim() && setSubmitted(true)} label="Your final answer" placeholder="Final answer, with its unit" autoFocus />
            <div className="mt-3 flex items-center gap-3">
              <button type="submit" className={btnCheck} disabled={!typed.trim()}>
                Check
              </button>
              <span className="text-meta text-ink-2">{calculator ? "Calculator allowed" : "No calculator"}</span>
            </div>
          </form>
        ) : (
          <Rise as="div" className="space-y-3">
            <p className="text-meta text-ink-2">
              <span className="text-ink-2">You wrote: </span>
              {typed}
            </p>
            <p className="text-[16px]">
              <span className="font-medium">Answer: </span>
              <Tex text={we.finalAnswer} />
            </p>
            {selfMark === null ? (
              <div role="group" aria-label="Did you get it?" className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() => {
                    setSelfMark(true);
                    onComplete?.(1);
                  }}
                >
                  <Tick size={16} label="" /> I had it
                </button>
                <button
                  type="button"
                  className={btnSecondary}
                  onClick={() => {
                    setSelfMark(false);
                    setShowSteps(true);
                    onComplete?.(0);
                  }}
                >
                  <MissMark size={16} label="" /> Not yet
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {onNext && (
                  <button type="button" className={btnPrimary} onClick={onNext}>
                    Next <ArrowRight size={16} aria-hidden />
                  </button>
                )}
                {!showSteps && (
                  <button type="button" className={btnSecondary} onClick={() => setShowSteps(true)}>
                    <Eye size={16} aria-hidden /> Show the steps
                  </button>
                )}
              </div>
            )}
            {showSteps && (
              <ol className="space-y-2 border-t border-line pt-3">
                {we.steps.map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <span className="tnum mt-3 w-5 shrink-0 text-meta font-medium text-ink-2" aria-hidden>
                      {s.n}
                    </span>
                    <div className="min-w-0 flex-1">
                      <StepBody step={s} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Rise>
        )}
      </div>
    </section>
  );
}
