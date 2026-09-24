"use client";

/**
 * Every item component rendered with the histograms fixture (and a few hand-made specs
 * for the kinds the fixture lacks). Importable from a dev page; not a route itself.
 */
import { useCallback, useMemo, useState } from "react";
import { clsx } from "clsx";
import { TopicBundle, type AnswerSpec, type CommonError, type VerificationLog } from "@/lib/content/schema";
import fixture from "@/lib/content/fixtures/histograms.example.json";
import { AnswerField } from "../AnswerField";
import { CheckedPanel } from "../CheckedPanel";
import { DiagnosticWithConfidence } from "../DiagnosticWithConfidence";
import { EncouragementCard, FeedbackCard } from "../FeedbackCard";
import { FindTheMistake } from "../FindTheMistake";
import { InlinePrompt } from "../InlinePrompt";
import { markAnswer, type MarkResult } from "../mark";
import { MasteryChip, type MasteryLevel } from "../MasteryChip";
import { RecallSprint } from "../RecallSprint";
import { StepRevealNote, type NoteBlock } from "../StepRevealNote";
import { Tex } from "../Tex";
import { WorkedExampleAsQuestion, type FadeLevel } from "../WorkedExampleAsQuestion";
import { btnQuiet, btnSecondary, Eyebrow } from "../ui";

const physicsSpec: AnswerSpec = { kind: "equation", kindOf: "physics", balancedLatex: "v = f\\lambda", stateSymbolsRequired: false, acceptMultiples: false };
const chemSpec: AnswerSpec = { kind: "equation", kindOf: "symbol", balancedLatex: "\\ce{2H2 + O2 -> 2H2O}", stateSymbolsRequired: false, acceptMultiples: true };
const algebraSpec: AnswerSpec = { kind: "algebraic", latex: "(x+3)(x-2)", equivalence: "equivalent", variables: ["x"], mustBeFactorised: true };
const textSpec: AnswerSpec = {
  kind: "text",
  accepted: ["frequency divided by class width"],
  keyWords: [
    { any: ["frequency"], marks: 1 },
    { any: ["class width", "width of the class"], marks: 1, reject: ["height"] },
  ],
  listingRule: false,
};

const noteBlocks: NoteBlock[] = [
  { type: "h", text: "Why the height is not the frequency" },
  {
    type: "p",
    md: "A histogram with **unequal class widths** shows frequency as the *area* of each bar, so the height must be the **frequency density**: $\\text{frequency density} = \\dfrac{\\text{frequency}}{\\text{class width}}$.",
  },
  { type: "callout", kind: "mustknow", md: "frequency density = frequency ÷ class width. It is not on the formula sheet." },
  { type: "gate", id: "g1", kind: "number", prompt: "The class $20 < h \\le 30$ has frequency 16. Frequency density?", answer: "1.6", explain: "$16 \\div 10 = 1.6$: divide by the width of the class, which is 10." },
  { type: "p", md: "Two bars of the same height do not hold the same number of values unless their classes are the same width. Read frequencies as areas: height × width." },
  { type: "gate", id: "g2", kind: "choice", prompt: "Bars A ($0 < h \\le 20$) and B ($50 < h \\le 90$) are the same height. Which class has more values?", options: ["A", "B", "The same"], answer: "B", explain: "B is twice as wide, so its area — its frequency — is twice A's." },
  { type: "callout", kind: "examiner", md: "Most candidates drew the bars to the frequencies and scored nothing for the drawing.", source: "ccea-cer:maths:2025-summer:M4:Q22" },
  { type: "gate", id: "g3", kind: "blank", prompt: "The median from a histogram is found at half of the total ____ of the bars.", answer: "area | areas", explain: "Half of the total area, then interpolate inside that class." },
  { type: "figure", alt: "Two bars of equal height; the wider bar has twice the area.", svg: '<svg viewBox="0 0 200 80" width="200" height="80"><rect x="10" y="20" width="40" height="50" fill="none" stroke="currentColor"/><rect x="70" y="20" width="80" height="50" fill="none" stroke="currentColor"/></svg>', caption: "Same height, twice the area." },
  { type: "prompt", promptId: "rp.maths.m4.histograms.01" },
  { type: "callout", kind: "notonspec", md: "Frequency polygons drawn over a histogram are not examined on CCEA M4." },
  { type: "p", md: "That is the whole idea. Everything else is arithmetic." },
];

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{title}</h2>
        {note && <p className="text-meta text-ink-2">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function AnswerFieldDemo({ spec, marks, title, calculator, commonErrors }: { spec: AnswerSpec; marks?: number; title: string; calculator?: boolean; commonErrors?: CommonError[] }) {
  const [result, setResult] = useState<MarkResult | null>(null);
  const [misses, setMisses] = useState(0);
  const [key, setKey] = useState(0);
  return (
    <div className="rounded-[var(--radius)] border border-line bg-surface p-4">
      <Eyebrow className="mb-2">{title}</Eyebrow>
      {!result ? (
        <AnswerField
          key={key}
          spec={spec}
          calculator={calculator}
          onSubmit={(raw) => {
            const r = markAnswer(raw, spec, { marks, commonErrors });
            setResult(r);
            if (!r.correct) setMisses((m) => m + 1);
          }}
        />
      ) : misses >= 2 && !result.correct ? (
        <EncouragementCard
          onHint={() => {
            setResult(null);
            setKey((k) => k + 1);
          }}
          onWorkedExample={() => {
            setResult(null);
            setMisses(0);
            setKey((k) => k + 1);
          }}
        />
      ) : (
        <FeedbackCard
          result={result}
          examinerLine={result.correct ? undefined : "Candidates who wrote the equation first, in symbols, kept the method mark even when the arithmetic slipped."}
          examinerSource="ccea-cer:science:2026-march:P1:Q7"
          onNext={() => {
            setResult(null);
            setKey((k) => k + 1);
          }}
          onTwin={result.correct ? undefined : () => setResult(null)}
        />
      )}
    </div>
  );
}

export function ItemsGallery() {
  const bundle = useMemo(() => TopicBundle.parse(fixture), []);
  const [events, setEvents] = useState<string[]>([]);
  const log = useCallback((line: string) => setEvents((e) => [line, ...e].slice(0, 30)), []);
  const [fade, setFade] = useState<FadeLevel>("full");
  const [weKey, setWeKey] = useState(0);

  const we = bundle.workedExamples[0];
  const dx = bundle.diagnostics[0];
  const question = bundle.questions[0];
  const ftm = bundle.findTheMistake[0];
  const prompts = bundle.prompts;
  const partC = question.parts[2];
  const partB = question.parts[1];
  const verification = bundle.verification.find((v) => v.itemId === question.id) ?? bundle.verification[0];
  const withFail: VerificationLog = {
    ...verification,
    id: "ver.demo.failing",
    status: "checked",
    checks: [
      ...verification.checks.slice(0, 3),
      { type: "link-health", tool: "pipeline/check/links.mts", result: "fail", detail: "Bitesize URL returned 404 on 2026-09-05.", at: "2026-09-05T09:03:00Z", by: "pipeline" },
      { type: "isomorph", tool: "pipeline/check/copycheck.mts", result: "waived", detail: "Shares its skeleton with a 2019 question; numbers and context differ.", at: "2026-09-05T09:03:10Z", by: "developer" },
    ],
    reports: [{ at: "2026-09-06T18:20:00Z", by: "learner", text: "The unit in part (c) is missing from the answer line." }],
  };
  const levels: MasteryLevel[] = ["not-started", "attempted", "familiar", "proficient", "mastered"];
  const deck = prompts.map((p) => ({ id: p.id, prompt: p.prompt, answer: p.answer, keyWords: p.keyWords }));

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-8">
      <header>
        <Eyebrow>Gallery</Eyebrow>
        <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.01em]">Item components</h1>
        <p className="mt-1 text-ui text-ink-2">
          Rendered from <code className="font-mono text-meta">{bundle.topic.id}</code>. Events land in the log at the bottom.
        </p>
      </header>

      <Panel title="Tex" note="Inline and display maths inside prose.">
        <div className="rounded-[var(--radius)] border border-line bg-surface p-4 text-[16px]">
          <Tex text={`${we.steps[2].working} — and in display form: $$\\text{median} \\approx L + \\frac{n/2 - F}{f} \\times w$$ Done.`} />
        </div>
      </Panel>

      <Panel title="AnswerField + FeedbackCard" note="Numeric with a unit, physics equation-line-first, chemistry, algebraic, text, mcq. Two misses bring the EncouragementCard.">
        <AnswerFieldDemo spec={partC.answer} marks={partC.marks} commonErrors={partC.commonErrors} title={`${question.id} · part (c) · ${partC.stem}`} calculator />
        <AnswerFieldDemo spec={physicsSpec} marks={2} title="Physics · wave speed (equation before numbers)" calculator />
        <AnswerFieldDemo spec={chemSpec} marks={1} title="Chemistry · balanced symbol equation for hydrogen burning" />
        <AnswerFieldDemo spec={algebraSpec} marks={2} title="Algebra · factorise x² + x − 6" calculator={false} />
        <AnswerFieldDemo spec={textSpec} title="Text · what is frequency density?" />
        <AnswerFieldDemo spec={{ kind: "mcq", shuffle: true, options: dx.items[0].options }} title="MCQ · frequency density of the class" />
      </Panel>

      <Panel title="DiagnosticWithConfidence" note="Option and confidence both required; confident misses are flagged for hypercorrection.">
        {dx.items.map((item, i) => (
          <DiagnosticWithConfidence
            key={item.id}
            item={item}
            index={i + 1}
            total={dx.items.length}
            onAnswer={(a) => log(`diagnostic ${item.id}: ${a.optionId} ${a.correct ? "correct" : "miss"} · confidence ${a.confidence} · ${a.ms} ms${a.misconception ? ` · ${a.misconception}` : ""}`)}
            onNext={() => log(`diagnostic ${item.id}: next`)}
          />
        ))}
      </Panel>

      <Panel title="InlinePrompt" note="Review mode with intervals, then inline mode.">
        <InlinePrompt prompt={prompts[0]} mode="review" index={1} total={2} intervals={{ again: "<1 min", good: "3 d", easy: "10 d" }} onGrade={(g) => log(`prompt ${prompts[0].id}: ${g}`)} />
        <InlinePrompt prompt={prompts[1]} mode="inline" onGrade={(g) => log(`prompt ${prompts[1].id}: ${g}`)} />
      </Panel>

      <Panel title="RecallSprint" note="Run to criterion; misses recycle; time to criterion reported.">
        <RecallSprint deck={deck} criterion={1} title="M4 histograms · recall" onFinish={(s) => log(`sprint: ${s.cards} cards, ${s.attempts} attempts, ${s.misses} misses, ${s.totalMs} ms`)} />
      </Panel>

      <Panel title="WorkedExampleAsQuestion" note="Switch the fade level; a miss on an input step reveals only that step's fix.">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Fade level">
          {(["full", "faded1", "faded2", "twin", "problem"] as FadeLevel[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={fade === f}
              className={clsx(btnSecondary, fade === f && "border-ink shadow-[inset_0_0_0_1px_var(--ink)]")}
              onClick={() => {
                setFade(f);
                setWeKey((k) => k + 1);
              }}
            >
              {f}
            </button>
          ))}
          <button type="button" className={btnQuiet} onClick={() => setWeKey((k) => k + 1)}>
            Reset
          </button>
        </div>
        <WorkedExampleAsQuestion key={`${fade}-${weKey}`} we={we} fade={fade} onStep={(n, c) => log(`we step ${n}: ${c ? "correct" : "miss"}`)} onComplete={(a) => log(`we complete · accuracy ${Math.round(a * 100)}%`)} onNext={() => log("we: next")} />
      </Panel>

      <Panel title="FindTheMistake" note="With reason options (first) and with a free-text reason (second).">
        <FindTheMistake
          item={ftm}
          reasonOptions={["She used the wrong class: the 30th value is in 20 < h ≤ 30.", "She should have used n + 1 over 2 for the median position."]}
          onResult={(r) => log(`ftm: found ${r.foundLine}, named ${r.namedReason}, fixed ${r.fixed}`)}
          onNext={() => log("ftm: next")}
        />
        <FindTheMistake item={{ ...ftm, id: "ftm.maths.m4.histograms.01-free" }} onResult={(r) => log(`ftm (free): found ${r.foundLine}, named ${r.namedReason}, fixed ${r.fixed}`)} />
      </Panel>

      <Panel title="StepRevealNote" note="Nothing below an unanswered gate renders.">
        <div className="rounded-[var(--radius)] border border-line bg-surface p-5">
          <StepRevealNote blocks={noteBlocks} onGate={(id, a, c) => log(`gate ${id}: "${a}" ${c ? "correct" : "miss"}`)} renderPrompt={(id) => <InlinePrompt prompt={prompts.find((p) => p.id === id) ?? prompts[0]} mode="inline" onGrade={(g) => log(`prompt (in note) ${id}: ${g}`)} />} />
        </div>
      </Panel>

      <Panel title="MasteryChip" note="Three stones filled to the level; tap explains what the next level needs.">
        <div className="flex flex-wrap items-start gap-3">
          {levels.map((l, i) => (
            <MasteryChip key={l} level={l} lastEvidenceAt={i === 0 ? null : new Date(Date.now() - i * 3 * 86_400_000)} decayHint={l === "proficient" ? "Drops to Familiar if not reviewed by Friday." : undefined} onClick={() => log(`chip ${l} tapped`)} />
          ))}
        </div>
      </Panel>

      <Panel title="CheckedPanel" note="A clean log, then one with a failed and a waived check and an open report.">
        <CheckedPanel log={verification} onReport={(t) => log(`report: ${t}`)} />
        <CheckedPanel log={withFail} onReport={(t) => log(`report (failing): ${t}`)} defaultOpen />
      </Panel>

      <Panel title="Also from the fixture" note="Part (b) has a common error at 38.">
        <AnswerFieldDemo spec={partB.answer} marks={partB.marks} commonErrors={partB.commonErrors} title={`${question.id} · part (b) · ${partB.stem}`} calculator />
      </Panel>

      <section className="rounded-[var(--radius)] border border-line bg-surface-2/60 p-4">
        <Eyebrow>Events</Eyebrow>
        {events.length === 0 ? (
          <p className="mt-1 text-meta text-ink-2">Nothing yet.</p>
        ) : (
          <ol className="mt-1 space-y-0.5 font-mono text-meta text-ink-2">
            {events.map((e, i) => (
              <li key={`${i}-${e}`}>{e}</li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
