"use client";

/**
 * The lesson is the page (decision 1, 22 Sep 2026). On a desktop: a 200 px contents rail and one lesson column of at most
 * 720 px, with the running prose at a 62ch measure (647 px at 18 px Literata, 75 characters a line: inside the decision's
 * 640-720 px and under WCAG 1.4.8's 80). The rail's column stays reserved when she puts it away, so the lesson never
 * moves or re-wraps. There is no third column: everything reference-shaped is a recess under "In the exam" at the end.
 * On a phone: the spine's 47 px bar is the one sticky element besides the tab bar.
 *
 * Read v2 (the trial topic; lesson-plan.ts isReadV2; art direction v2 §9): no rail beside the text at any width. One
 * centred column of at most 720 px, the prose at the same 62ch; the app's own rail folds to its icons (shell/Nav.tsx);
 * the lesson's region (the slim track, the hero, the note) carries the v2 palette, and the track sticks only while that
 * region is on screen. The note opens one section at a time, each ended by Continue and "Pause here"; the lesson's last
 * Continue goes on to the first stage after it. The stages after the lesson are the same in both.
 *
 * Three surfaces (01-art-direction.md §4.2): prose on the page, reference in recesses, objects only where she acts.
 */
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { loadBundle, type ShippedBundle } from "@/lib/content/load";
import type { RetrievalPrompt, WorkedExample } from "@/lib/content/schema";
import { answeredGateIds, selectCheckItems } from "@/lib/session/flow";
import { recordAttempt, touchSession, type ItemRef } from "@/lib/session/record";
import { FindTheMistake, InlinePrompt, StepRevealNote, Tex, WorkedExampleAsQuestion, formatExaminerSource, nextFade, type FadeLevel, type PromptGrade } from "@/components/items";
import type { NoteBlock } from "@/components/items/StepRevealNote";
import { btnPrimary, btnSecondary, recessCls } from "@/components/items/ui";
import { CheckSection } from "./CheckSection";
import { PracticeFlow } from "./PracticeFlow";
import { LessonSpine, ReadTrack, type SpineStage } from "./LessonSpine";
import { ReferenceLinks, SpecificationRecess, recessLabelCls, type TopicReferenceData } from "./TopicReference";
import {
  countWords,
  headingText,
  heroDataFor,
  initialOpen,
  isReadV2,
  lessonBlocks,
  lessonSections,
  minutesForCheckItems,
  minutesForExamples,
  minutesForMarks,
  minutesForMistakes,
  minutesForReading,
  sameTitle,
  stageEyebrow,
  type LessonSection,
} from "./lesson-plan";
import { CardSkeleton } from "@/components/ux/Skeleton";
import { focusLanding } from "@/components/shell/input-modality";
import type { Subject } from "@/lib/content/taxonomy";
import { REACTIONS } from "@/components/slides/enrich";
import { enrichmentFor } from "@/lib/slides/enrichment";

interface Props {
  subject: Subject;
  unit: string;
  slug: string;
  topicId: string;
  /** The hero's display title: section 1's heading is not printed a second time when it is the same words. */
  displayTitle?: string;
  /** Server-rendered "See it" panel (video + simulation) placed after the lesson. */
  seeIt?: ReactNode;
  /** The catalogue's reference for this topic, shown as recesses under "In the exam". */
  reference?: TopicReferenceData;
  /** Read v2: the topic's hero, drawn inside the lesson's region under the track (page.tsx renders it). */
  hero?: ReactNode;
  /** Read v2: the note's sections as the server read them, so the track is drawn before the lesson has loaded. */
  sections?: LessonSection[];
}

/** The lesson column's measure for running prose (see the file comment). */
const LESSON_MEASURE = "62ch";

/** Where the lesson's last Continue says it goes, by the stage it goes to. */
const ONWARD: Record<string, string> = {
  examples: "the worked examples",
  check: "the check",
  practice: "practice",
  recheck: "the second check",
  exam: "the exam-style questions",
  mistakes: "find the mistake",
  prompts: "the retrieval prompts",
  sheet: "the Sheet",
};

/** The spine's unfilled track wears the subject's wash (01-art-direction.md §4.6, the tints' first job). */
function tintFor(subject: Subject, unit: string): string {
  if (subject === "maths") return "bg-tint-maths";
  if (subject === "further-maths") return "bg-tint-fm";
  const discipline = unit.charAt(0).toUpperCase();
  return discipline === "C" ? "bg-tint-chem" : discipline === "P" ? "bg-tint-phys" : "bg-tint-bio";
}

/**
 * A stage of the page: a hairline across the column, a sentence-case label with its cost, and the stage's title. A link
 * to the page with the stage's id as its hash lands on it (useStageLanding).
 */
function Stage({ id, label, title, first = false, children }: { id: string; label: string; title: string; first?: boolean; children: ReactNode }) {
  return (
    <section
      id={id}
      data-stage
      aria-labelledby={`${id}-title`}
      className="section-rule scroll-mt-16 lg:scroll-mt-6"
      // .section-rule sets the gap before a section; between stages the gap is the larger --gap-stage.
      style={{ marginTop: first ? 0 : "var(--gap-stage)" }}
    >
      <p className="text-meta font-medium text-ink-2">{label}</p>
      <h2 id={`${id}-title`} className="font-serif-lesson mt-1 text-h2 font-medium tracking-[-0.01em]">
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** A recess with its own small label: reference she consults, never acts on. */
function Recess({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={recessCls}>
      <h3 id={id} className={recessLabelCls}>
        {label}
      </h3>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}

/** The bundle, the gates she has answered on this device, and the running set the spine or the track counts from. */
function useLesson(subject: Subject, slug: string, topicId: string) {
  const [bundle, setBundle] = useState<ShippedBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBundle(subject, topicId).then(setBundle).catch((e) => setError(String(e)));
  }, [subject, topicId]);

  // Gates she has already answered here, so a reload does not close the note behind them again.
  // undefined while loading: the note must mount with the ids, because StepRevealNote reads them once.
  const gateIds = useLiveQuery(async () => {
    try {
      return await answeredGateIds(subject, slug, topicId);
    } catch {
      return [] as string[];
    }
  }, [subject, slug, topicId]);

  // The spine's own copy of the answered gates: the note knows them too, but the count has to
  // tick up the moment she answers, before the write comes back through the live query.
  const [answered, setAnswered] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    if (!gateIds?.length) return;
    setAnswered((prev) => (gateIds.every((id) => prev.has(id)) ? prev : new Set([...prev, ...gateIds])));
  }, [gateIds]);
  const markAnswered = useCallback((id: string) => setAnswered((prev) => (prev.has(id) ? prev : new Set([...prev, id]))), []);

  return { bundle, error, gateIds, answered, markAnswered };
}

/** Read v2: she pressed the lesson's last Continue on this device. Storage can be missing: then it lasts the visit. */
const FINISHED_KEY = (topicId: string) => `cairn.read.finished.${topicId}`;

function readFinished(topicId: string): boolean {
  try {
    return window.localStorage.getItem(FINISHED_KEY(topicId)) === "1";
  } catch {
    return false;
  }
}

function rememberFinished(topicId: string): void {
  try {
    window.localStorage.setItem(FINISHED_KEY(topicId), "1");
  } catch {
    // The press holds for this visit.
  }
}

/** How long a landing keeps its stage at the top while the page above it settles, and how still it must be to stop. */
const LANDING_MAX_MS = 4000;
const LANDING_STILL_FRAMES = 20;

/** What tells the page she has taken over: a scroll of the wheel, a touch, a press, a key. */
const HER_OWN = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

/**
 * Keeps a stage at the top of the screen (under its scroll margin) while the lesson above it settles: the note opens to
 * where she stopped, the maths and the fonts arrive, and each of them pushes the stage down. It lets go as soon as she
 * scrolls, taps or presses a key herself (the page never fights her), once the stage has been still for a moment, after
 * four seconds, or when the stage leaves the page. Returns the way to let go early.
 */
function holdAtTop(el: HTMLElement): () => void {
  let stopped = false;
  let frame = 0;
  const stop = () => {
    stopped = true;
    window.cancelAnimationFrame(frame);
    for (const type of HER_OWN) window.removeEventListener(type, stop, true);
  };
  for (const type of HER_OWN) window.addEventListener(type, stop, { capture: true, passive: true });
  const started = performance.now();
  let lastTop = Number.NaN;
  let still = 0;
  const align = () => {
    if (stopped) return;
    if (!el.isConnected) return stop();
    const top = el.getBoundingClientRect().top;
    still = top === lastTop ? still + 1 : 0;
    lastTop = top;
    const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    if (Math.abs(top - margin) > 1) window.scrollTo({ top: window.scrollY + top - margin, behavior: "auto" });
    if (still < LANDING_STILL_FRAMES && performance.now() - started < LANDING_MAX_MS) frame = window.requestAnimationFrame(align);
    else stop();
  };
  align();
  return stop;
}

/**
 * A link that names a stage of this page lands on it: the Slides close's "Practise this topic" is /…/#practice (audit
 * LD-02, CQ-06). The stages are drawn only once the lesson has loaded, after the browser (a fresh load) or the router
 * (an in-app link) has looked for the id and found nothing, so the page takes her there itself when they appear, and
 * puts the keyboard on the stage as a landing place (the ring only for the keyboard). A later change of hash does the
 * same. `ready` is true once the stages are on the page.
 */
function useStageLanding(ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    let letGo: (() => void) | null = null;
    const land = () => {
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const el = id ? document.getElementById(id) : null;
      if (!el || !el.hasAttribute("data-stage")) return;
      letGo?.();
      focusLanding(el);
      letGo = holdAtTop(el);
    };
    land();
    window.addEventListener("hashchange", land);
    return () => {
      window.removeEventListener("hashchange", land);
      letGo?.();
    };
  }, [ready]);
}

/**
 * What the page is made of, from the bundle. Teach first, check after: nothing on this page is locked behind a test
 * (learner feedback, 13 Sep 2026). Every stage carries what it costs, computed from its own content, never an invented
 * number.
 */
function planFor(bundle: ShippedBundle, displayTitle: string | undefined, reference: TopicReferenceData | undefined) {
  // Two short checks: four items after the lesson, the rest after practice (learner review, 13 Sep 2026).
  const { check, recheck } = selectCheckItems(bundle.diagnostics);
  const practice = bundle.questions.filter((q) => q.style === "practice");
  const exam = bundle.questions.filter((q) => q.style === "exam-style");
  const notePromptIds = new Set(((bundle.noteBlocks ?? []) as NoteBlock[]).filter((b) => b.type === "prompt").map((b) => (b as { promptId: string }).promptId));
  const loosePrompts = bundle.prompts.filter((p) => !notePromptIds.has(p.id));
  const promptById = new Map<string, RetrievalPrompt>(bundle.prompts.map((p) => [p.id, p]));

  const blocks = (bundle.noteBlocks ?? []) as NoteBlock[];
  const hero = heroDataFor(blocks);
  // The note's first figure moves into the hero (in Read v2, the drawing Slides registers for it takes its place there).
  const noteBlocks = lessonBlocks(blocks, hero.lede);
  const noteSections = lessonSections(blocks, hero.lede);
  const lessonMinutes = noteSections.reduce((n, s) => n + s.minutes, 0);
  const firstHeading = noteBlocks.find((b) => b.type === "h") as { text: string } | undefined;
  const hideFirstHeading = Boolean(displayTitle && firstHeading && sameTitle(displayTitle, headingText(firstHeading.text)));
  const marksIn = (qs: typeof practice) => qs.reduce((n, q) => n + q.totalMarks, 0);
  const note = bundle.note;
  const sheetWords = note
    ? countWords([...note.sheet.mustBeAbleTo, note.sheet.howExamined, ...note.sheet.traps, ...note.formulaSheet.given, ...note.formulaSheet.mustKnow].join(" "))
    : 0;
  const insightWords = bundle.insight ? countWords([bundle.insight.ruleToRemember, ...bundle.insight.findings.flatMap((f) => [f.asked, f.wentWrong, f.rule])].join(" ")) : 0;
  const minutes = {
    examples: minutesForExamples(bundle.workedExamples.length),
    check: minutesForCheckItems(check.length),
    practice: minutesForMarks(marksIn(practice)),
    recheck: minutesForCheckItems(recheck.length),
    exam: minutesForMarks(marksIn(exam)),
    mistakes: minutesForMistakes(bundle.findTheMistake.length),
    prompts: minutesForCheckItems(loosePrompts.length),
    sheet: minutesForReading(sheetWords + insightWords),
  };
  const hasExamStage = Boolean(note || bundle.insight || reference);
  const stages: SpineStage[] = [
    bundle.workedExamples.length > 0 && { id: "examples", label: "Worked examples", minutes: minutes.examples },
    check.length > 0 && { id: "check", label: "Check yourself", minutes: minutes.check },
    practice.length > 0 && { id: "practice", label: "Practice", minutes: minutes.practice },
    recheck.length > 0 && { id: "recheck", label: "Check again", minutes: minutes.recheck },
    exam.length > 0 && { id: "exam", label: "Exam-style", minutes: minutes.exam },
    bundle.findTheMistake.length > 0 && { id: "mistakes", label: "Find the mistake", minutes: minutes.mistakes },
    loosePrompts.length > 0 && { id: "prompts", label: "Say it from memory", minutes: minutes.prompts },
    hasExamStage && { id: "sheet", label: "In the exam", minutes: minutes.sheet },
  ].filter((s): s is SpineStage => Boolean(s));

  return { check, recheck, practice, exam, loosePrompts, promptById, noteBlocks, noteSections, lessonMinutes, hideFirstHeading, minutes, hasExamStage, stages, note };
}

type Plan = ReturnType<typeof planFor>;

/** A retrieval prompt graded: an attempt, and the session touched. */
function onPromptFor(item: Omit<ItemRef, "id">, subject: Subject) {
  return (p: RetrievalPrompt) => async (grade: PromptGrade) => {
    await recordAttempt({ item: { ...item, id: p.id }, itemKind: "prompt", correct: grade !== "again" });
    await touchSession(subject);
  };
}

/** Everything after the lesson: worked examples, the two checks, practice, exam-style, find the mistake, prompts, the Sheet. */
function LaterStages({
  bundle,
  plan,
  item,
  subject,
  reference,
  noteFirst,
}: {
  bundle: ShippedBundle;
  plan: Plan;
  item: Omit<ItemRef, "id">;
  subject: Subject;
  reference?: TopicReferenceData;
  /** The lesson came before these, so none of them is the page's first stage. */
  noteFirst: boolean;
}) {
  const { check, recheck, practice, exam, loosePrompts, minutes, hasExamStage, note } = plan;
  const onPrompt = onPromptFor(item, subject);
  let firstStage = !noteFirst;
  const isFirst = () => {
    const was = firstStage;
    firstStage = false;
    return was;
  };

  return (
    <>
      {bundle.workedExamples.length > 0 && (
        <Stage id="examples" label={stageEyebrow("Work through", minutes.examples)} title="Worked examples" first={isFirst()}>
          {bundle.workedExamples.map((we) => (
            <WorkedExampleFlow key={we.id} we={we} item={item} />
          ))}
        </Stage>
      )}

      {check.length > 0 && (
        <Stage id="check" label={stageEyebrow("Answer and see why", minutes.check)} title="Check yourself" first={isFirst()}>
          <CheckSection phase="check" items={check} item={item} />
        </Stage>
      )}

      {practice.length > 0 && (
        <Stage id="practice" label={stageEyebrow("Practise", minutes.practice)} title="Practice" first={isFirst()}>
          <PracticeFlow bundle={bundle} kind="practice" item={item} />
        </Stage>
      )}

      {recheck.length > 0 && (
        <Stage id="recheck" label={stageEyebrow("Answer again", minutes.recheck)} title="Check again" first={isFirst()}>
          <CheckSection phase="recheck" items={recheck} item={item} />
        </Stage>
      )}

      {exam.length > 0 && (
        <Stage id="exam" label={stageEyebrow("Sit it as a paper", minutes.exam)} title="Exam-style" first={isFirst()}>
          <PracticeFlow bundle={bundle} kind="exam" item={item} companion />
        </Stage>
      )}

      {bundle.findTheMistake.length > 0 && (
        <Stage id="mistakes" label={stageEyebrow("Mark and fix", minutes.mistakes)} title="Find the mistake" first={isFirst()}>
          {bundle.findTheMistake.map((f) => (
            <FindTheMistake
              key={f.id}
              item={f}
              onResult={async (r) => {
                await recordAttempt({ item: { ...item, id: f.id }, itemKind: "mistake", correct: r.foundLine && r.fixed, misconceptionTags: [f.misconception] });
                await touchSession(subject);
              }}
            />
          ))}
        </Stage>
      )}

      {loosePrompts.length > 0 && (
        <Stage id="prompts" label={stageEyebrow("Say it from memory", minutes.prompts)} title="Retrieval prompts" first={isFirst()}>
          {loosePrompts.map((p) => (
            <InlinePrompt key={p.id} prompt={p} mode="inline" onGrade={onPrompt(p)} />
          ))}
        </Stage>
      )}

      {hasExamStage && (
        <Stage id="sheet" label={stageEyebrow("The reference for this topic", minutes.sheet)} title="In the exam" first={isFirst()}>
          {note && note.sheet.mustBeAbleTo.length > 0 && (
            <Recess id="sheet-able" label="You must be able to">
              <ul className="list-disc pl-5 text-ui leading-relaxed marker:text-ink-3">
                {note.sheet.mustBeAbleTo.map((s) => (
                  <li key={s}>
                    <Tex text={s} />
                  </li>
                ))}
              </ul>
            </Recess>
          )}

          {note && (
            <Recess id="sheet-formulae" label="Formulae">
              <p className="text-ui leading-relaxed">
                <span className="font-medium">On the formula sheet: </span>
                {note.formulaSheet.given.length ? <Tex text={note.formulaSheet.given.join("; ")} /> : "nothing for this topic."}
              </p>
              {note.formulaSheet.mustKnow.length > 0 && (
                <>
                  <p className="mt-2 text-ui font-medium">Not on the sheet, so you must know:</p>
                  <ul className="mt-1 list-disc pl-5 text-ui leading-relaxed marker:text-ink-3">
                    {note.formulaSheet.mustKnow.map((s) => (
                      <li key={s}>
                        <Tex text={s} />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Recess>
          )}

          {note && note.sheet.traps.length > 0 && (
            <Recess id="sheet-traps" label="Traps">
              <ul className="list-disc pl-5 text-ui leading-relaxed marker:text-ink-3">
                {note.sheet.traps.map((t) => (
                  <li key={t}>
                    <Tex text={t} />
                  </li>
                ))}
              </ul>
            </Recess>
          )}

          {bundle.insight && (
            <Recess id="sheet-insight" label="Where marks are lost">
              <p className="text-ui font-medium leading-relaxed">{bundle.insight.ruleToRemember}</p>
              <ul className="mt-2 flex flex-col">
                {bundle.insight.findings.map((f, i) => (
                  <li key={i} className="border-t border-line py-3 text-ui leading-relaxed last:pb-0">
                    <p className="text-meta font-medium text-ink-2">
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line-3 underline-offset-2 hover:decoration-ink">
                        {formatExaminerSource(f.source)}
                        <span className="sr-only"> (the report, opens in a new tab)</span>
                      </a>
                    </p>
                    <p className="mt-1">
                      <span className="text-ink-2">Asked: </span>
                      {f.asked}
                    </p>
                    <p className="mt-1">
                      <span className="text-ink-2">What went wrong: </span>
                      {f.wentWrong}
                    </p>
                    {f.fullMarkAnswersDid && (
                      <p className="mt-1">
                        <span className="text-ink-2">Full-mark answers: </span>
                        {f.fullMarkAnswersDid}
                      </p>
                    )}
                    <p className="mt-1 font-medium">{f.rule}</p>
                  </li>
                ))}
              </ul>
              {bundle.insight.aStarSignal && (
                <p className="border-t border-line pt-3 text-ui leading-relaxed">
                  <span className="font-medium">What an A* answer does: </span>
                  {bundle.insight.aStarSignal}
                </p>
              )}
              <p className="mt-2 text-meta text-ink-2">From the CCEA Chief Examiner’s reports, in our words.</p>
            </Recess>
          )}

          {reference && <SpecificationRecess data={reference} howExamined={note?.sheet.howExamined} />}
          {!reference && note?.sheet.howExamined && (
            <Recess id="sheet-how" label="How it is examined">
              <p className="text-ui leading-relaxed">{note.sheet.howExamined}</p>
            </Recess>
          )}

          {note && note.notOnThisSpec.length > 0 && (
            <Recess id="sheet-notonspec" label="Not on this spec">
              <ul className="list-disc pl-5 text-ui leading-relaxed marker:text-ink-3">
                {note.notOnThisSpec.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Recess>
          )}

          {reference && <ReferenceLinks data={reference} />}
        </Stage>
      )}
    </>
  );
}

const lessonError = (
  <p className="text-ui text-ink-2" role="alert">
    This topic’s lesson could not be loaded. Reload the page to try again; everything you have done is saved on this device.
  </p>
);

export function TopicContent(props: Props) {
  return isReadV2(props.subject, props.unit, props.slug) ? <ReadV2Content {...props} /> : <ClassicContent {...props} />;
}

/** Every topic but the trial: decision 1's page, exactly as it shipped on 23 Sep. */
function ClassicContent({ subject, unit, slug, topicId, displayTitle, seeIt, reference }: Props) {
  const item: Omit<ItemRef, "id"> = useMemo(() => ({ subject, unit, topicSlug: slug }), [subject, unit, slug]);
  const { bundle, error, gateIds, answered, markAnswered } = useLesson(subject, slug, topicId);
  useStageLanding(Boolean(bundle && gateIds));

  if (error) return lessonError;
  if (!bundle || !gateIds)
    return (
      <div className="flex flex-col gap-4 lg:ml-[240px] lg:max-w-[720px]">
        <CardSkeleton lines={2} />
        <CardSkeleton lines={5} />
      </div>
    );

  const plan = planFor(bundle, displayTitle, reference);
  const onPrompt = onPromptFor(item, subject);
  const column = { "--measure": LESSON_MEASURE } as CSSProperties;

  return (
    <div className="lg:grid lg:grid-cols-[200px_minmax(0,720px)] lg:items-start lg:gap-x-10">
      <LessonSpine sections={plan.noteSections} stages={plan.stages} minutes={plan.lessonMinutes} answered={answered} tint={tintFor(subject, unit)} />

      <div className="flex min-w-0 flex-col" style={column} data-lesson-column>
        {bundle.noteBlocks && (
          <Stage id="note" label={stageEyebrow("Read and check", plan.lessonMinutes)} title="The lesson" first>
            <StepRevealNote
              blocks={plan.noteBlocks}
              initiallyAnswered={gateIds}
              sections={plan.noteSections.map((s) => ({ n: s.n, minutes: s.minutes }))}
              hideFirstHeading={plan.hideFirstHeading}
              onGate={async (id, _answer, correct) => {
                markAnswered(id);
                await recordAttempt({ item: { ...item, id: `${topicId}#gate:${id}` }, itemKind: "practice", correct });
              }}
              renderPrompt={(id) => {
                const p = plan.promptById.get(id);
                return p ? <InlinePrompt prompt={p} mode="inline" onGrade={onPrompt(p)} /> : null;
              }}
            />
          </Stage>
        )}

        {seeIt}

        <LaterStages bundle={bundle} plan={plan} item={item} subject={subject} reference={reference} noteFirst={Boolean(bundle.noteBlocks)} />
      </div>
    </div>
  );
}

/**
 * Read v2, the trial topic (see the file comment). The region that holds the track, the hero and the note renders at
 * once, before the lesson loads, so the first paint already has the bar and the hero in place and nothing shifts; the
 * note arrives in the same place, opened as far as she had come.
 */
function ReadV2Content({ subject, unit, slug, topicId, displayTitle, seeIt, reference, hero, sections: serverSections }: Props) {
  const item: Omit<ItemRef, "id"> = useMemo(() => ({ subject, unit, topicSlug: slug }), [subject, unit, slug]);
  const { bundle, error, gateIds, answered, markAnswered } = useLesson(subject, slug, topicId);
  const plan = useMemo(() => (bundle ? planFor(bundle, displayTitle, reference) : null), [bundle, displayTitle, reference]);
  const sections = plan?.noteSections ?? serverSections ?? [];
  useStageLanding(Boolean(bundle && plan));

  // How far she has come: the sections open, and whether she has pressed the lesson's last Continue. The last press is
  // kept on this device, so a reload still shows the last section placed (audit CQ-15); it counts only while every
  // check is still answered, so a check added to the note later reopens the lesson honestly.
  const [open, setOpen] = useState<number | null>(null);
  const [pressedFinish, setPressedFinish] = useState(false);
  useEffect(() => {
    if (readFinished(topicId)) setPressedFinish(true);
  }, [topicId]);
  useEffect(() => {
    if (gateIds && plan && open === null) setOpen(Math.max(1, initialOpen(plan.noteSections, gateIds)));
  }, [gateIds, plan, open]);
  const finished = pressedFinish && sections.length > 0 && sections.every((s) => s.gateIds.every((id) => answered.has(id)));

  const onPrompt = onPromptFor(item, subject);
  // The lesson's last Continue goes on to the first stage after it; the bar has left with the lesson by then.
  const firstStage = plan?.stages[0];
  const finish = firstStage
    ? {
        label: `Continue to ${ONWARD[firstStage.id] ?? firstStage.label.toLowerCase()}`,
        onFinish: () => {
          setPressedFinish(true);
          rememberFinished(topicId);
          const el = document.getElementById(firstStage.id);
          if (!el) return;
          const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: reduce ? "auto" : "smooth" });
          // A landing place: the ring only when the keyboard pressed Continue (shell/input-modality.ts).
          focusLanding(el);
        },
      }
    : undefined;

  const column = { "--measure": LESSON_MEASURE } as CSSProperties;
  const lessonMinutes = sections.reduce((n, s) => n + s.minutes, 0);
  // A gate with a drawn consequence (the same drawing Slides shows in its verdict): x = 1 put into both, on g2.
  const reactions = enrichmentFor(topicId)?.reactions ?? {};
  const reaction = (gateId: string, hers: string, correct: boolean): ReactNode => {
    const Drawn = reactions[gateId] ? REACTIONS[reactions[gateId]] : undefined;
    return Drawn ? <Drawn hers={hers} correct={correct} /> : null;
  };

  return (
    <div data-lesson-column data-read="v2" data-palette="v2" className="mx-auto flex w-full min-w-0 max-w-[720px] flex-col" style={column}>
      {/* The lesson's region: the track sticks while any of it is on screen, and leaves with the note's end. */}
      <div data-lesson-region className="flex min-w-0 flex-col">
        <ReadTrack sections={sections} stages={plan?.stages ?? []} minutes={lessonMinutes} answered={answered} open={open ?? 1} finished={finished} />
        <div className="pt-6 md:pt-8">{hero}</div>

        {error ? (
          lessonError
        ) : !bundle || !plan || !gateIds || open === null ? (
          <div className="flex flex-col gap-4">
            <CardSkeleton lines={2} />
            <CardSkeleton lines={5} />
          </div>
        ) : bundle.noteBlocks ? (
          <section id="note" aria-labelledby="note-title" className="scroll-mt-20">
            <h2 id="note-title" className="sr-only">
              The lesson
            </h2>
            <StepRevealNote
              blocks={plan.noteBlocks}
              initiallyAnswered={gateIds}
              sections={plan.noteSections.map((s) => ({ n: s.n, minutes: s.minutes }))}
              hideFirstHeading={plan.hideFirstHeading}
              onGate={async (id, _answer, correct) => {
                markAnswered(id);
                await recordAttempt({ item: { ...item, id: `${topicId}#gate:${id}` }, itemKind: "practice", correct });
              }}
              renderPrompt={(id) => {
                const p = plan.promptById.get(id);
                return p ? <InlinePrompt prompt={p} mode="inline" onGrade={onPrompt(p)} /> : null;
              }}
              paced={{
                open,
                onContinue: (n) => setOpen((o) => Math.max(o ?? 1, n + 1)),
                finish,
                titles: plan.noteSections.map((s) => s.title),
                reaction,
              }}
            />
          </section>
        ) : null}
      </div>

      {bundle && plan && (
        <>
          {seeIt}
          <LaterStages bundle={bundle} plan={plan} item={item} subject={subject} reference={reference} noteFirst />
        </>
      )}
    </div>
  );
}

function WorkedExampleFlow({ we, item }: { we: WorkedExample; item: Omit<ItemRef, "id"> }) {
  const [fade, setFade] = useState<FadeLevel>("full");
  // What the fade governor suggests once a run is finished (engine item 10.6, decision 13): 80% or more steps on,
  // 50% to under 80% goes round once more, under 50% goes back to the whole example. It is offered as a button rather
  // than taken automatically, because the example remounts per fade and a move would hide the run's own feedback.
  const [governed, setGoverned] = useState<FadeLevel | null>(null);
  // Guidance fading: full example → one step hidden → more hidden → the twin unaided → just the problem.
  const order: FadeLevel[] = ["full", "faded1", "faded2", "twin", "problem"];
  const label: Record<FadeLevel, string> = { full: "Try it with a step hidden", faded1: "Hide more steps", faded2: "Your turn on the twin", twin: "Just the problem", problem: "Done" };
  const stepOn = fade === "problem" ? null : order[order.indexOf(fade) + 1];
  const go = (to: FadeLevel) => {
    setFade(to);
    setGoverned(null);
  };
  // The suggestion's words say where it goes. The problem solved at the last rung needs nothing more.
  const suggestion: { to: FadeLevel; text: string } | null =
    governed === null || (fade === "problem" && governed === "problem")
      ? null
      : governed === fade
        ? { to: governed, text: "Once more, the same way" }
        : governed === "full"
          ? { to: governed, text: "See the whole example again" }
          : { to: governed, text: label[fade] };
  return (
    <div>
      <WorkedExampleAsQuestion
        key={fade}
        we={we}
        fade={fade}
        onStep={async (n, correct) => {
          await recordAttempt({ item: { ...item, id: `${we.id}#${fade}:${n}` }, itemKind: "practice", correct });
        }}
        onComplete={async (accuracy) => {
          setGoverned(nextFade(fade, accuracy));
          await touchSession(item.subject);
        }}
      />
      {(suggestion || stepOn) && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {suggestion && (
            <button type="button" className={btnPrimary} onClick={() => go(suggestion.to)}>
              {suggestion.text}
            </button>
          )}
          {/* Her own way on, always there; left out only when the suggestion already is that step. */}
          {stepOn && suggestion?.to !== stepOn && (
            <button type="button" className={btnSecondary} onClick={() => go(stepOn)}>
              {label[fade]}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
