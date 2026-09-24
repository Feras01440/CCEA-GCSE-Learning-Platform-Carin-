"use client";

/**
 * Where first run ends: inside a real lesson rather than on Today.
 *
 * Duolingo defers sign-up until after the first lesson and Kinnu explains its own mechanic before
 * naming it (docs/plan/review/2026-09-19-quality-bar.md, item 7). This is both: the hero's promise,
 * one real section closed by one real check, one real question marked the way CCEA marks it, and a
 * close that names the stone. Each mechanic is captioned once, the first time she meets it.
 *
 * Nothing here is a demonstration. The gate and the question part record through the same
 * `recordAttempt` calls the topic page makes, under the same ids, so opening the topic afterwards
 * finds the check already answered and counts nothing twice.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StepRevealNote, type NoteBlock } from "@/components/items/StepRevealNote";
import { btnPrimary } from "@/components/items/ui";
import { MdInlines, parseInline, Tex } from "@/components/items";
import { PhotoFigure } from "@/components/media/PhotoFigure";
import { sanitizeInlineSvg } from "@/lib/ux/svg";
import { QuestionRunner } from "@/components/topic/QuestionRunner";
import { heroDataFor, lessonBlocks, lessonSections, spineTitle, type TopicHeroData } from "@/components/topic/lesson-plan";
import { CairnStack } from "@/components/ux/CairnStack";
import { CardSkeleton } from "@/components/ux/Skeleton";
import { loadBundle, type ShippedBundle } from "@/lib/content/load";
import type { Question } from "@/lib/content/schema";
import { getDB } from "@/lib/db/db";
import { recordAttempt, type ItemRef } from "@/lib/session/record";
import { blocksHaveHero, chooseSeedTopic, firstSectionThroughGate, FALLBACK_SEED, seedCandidates, type SeedTopic } from "./seed";
import type { ExamPlan } from "@/lib/plan/exam-plan";

/** The three captions, each shown once, the first time its mechanic is on the screen. */
export const GATE_CAPTION = "A check. The note stops here until you answer; nothing is scored.";
export const SCHEME_CAPTION = "Marked the way CCEA marks: M for method, A for accuracy. The scheme is always open.";

/** How many of her plan's topics are opened looking for one with a hero before the fallback is taken. */
const MAX_TRIES = 4;

interface Resolved {
  seed: SeedTopic;
  bundle: ShippedBundle;
}

/**
 * The seeded topic and its content. `chooseSeedTopic` is pure and cannot know whether a bundle has a
 * hero, so the bundles are opened here, best candidate first, and the first with a hero wins. Bundles
 * are cached by `loadBundle`, so opening the topic afterwards costs nothing.
 */
export async function resolveSeed(plan: ExamPlan, today: string): Promise<Resolved> {
  const tried = new Map<string, ShippedBundle>();
  const candidates = seedCandidates(plan, today).slice(0, MAX_TRIES);
  for (const c of candidates) {
    try {
      const bundle = await loadBundle(c.subject, c.topicId);
      tried.set(c.topicId, bundle);
    } catch {
      continue;
    }
  }
  const hasHero = (t: SeedTopic) => blocksHaveHero(tried.get(t.topicId)?.noteBlocks);
  const seed = chooseSeedTopic(plan, today, hasHero);
  const held = tried.get(seed.topicId);
  return { seed, bundle: held ?? (await loadBundle(seed.subject, seed.topicId)) };
}

type Stage = "lesson" | "question" | "close";

export function SeededLesson({ plan, today, onDone }: { plan: ExamPlan; today: string; onDone: () => void }) {
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [failed, setFailed] = useState(false);
  const [stage, setStage] = useState<Stage>("lesson");
  const [gateAnswered, setGateAnswered] = useState(false);
  const [questionDone, setQuestionDone] = useState(false);
  const [stoneLevel, setStoneLevel] = useState<string | null>(null);
  const live = useRef(true);

  useEffect(() => {
    live.current = true;
    resolveSeed(plan, today)
      .then((r) => {
        if (live.current) setResolved(r);
      })
      .catch(() => {
        if (live.current) setFailed(true);
      });
    return () => {
      live.current = false;
    };
  }, [plan, today]);

  const seed = resolved?.seed ?? FALLBACK_SEED;
  const item: Omit<ItemRef, "id"> = useMemo(
    () => ({ subject: seed.subject, unit: seed.unit, topicSlug: seed.slug }),
    [seed.subject, seed.unit, seed.slug],
  );

  const view = useMemo(() => {
    if (!resolved) return null;
    const blocks = (resolved.bundle.noteBlocks ?? []) as NoteBlock[];
    const hero = heroDataFor(blocks);
    const lesson = lessonBlocks(blocks, hero.lede) as NoteBlock[];
    const cut = firstSectionThroughGate(lesson);
    // The card above already carries the topic's name; a note whose first heading repeats it would
    // say it twice on one screen, which the full topic page avoids by putting them a scroll apart.
    const slice = cut[0]?.type === "h" && spineTitle(cut[0].text) === spineTitle(resolved.seed.title) ? cut.slice(1) : cut;
    const sections = lessonSections(blocks, hero.lede);
    const practice = resolved.bundle.questions.find((q) => q.style === "practice") ?? null;
    const firstPart: Question | null = practice
      ? { ...practice, parts: [practice.parts[0]], totalMarks: practice.parts[0].marks }
      : null;
    return { hero, slice, sections, firstPart, hasGate: slice.some((b) => b.type === "gate") };
  }, [resolved]);

  /** After the question, whether the evidence placed a stone. Read once; nothing here writes. */
  async function readStone() {
    try {
      const row = await getDB().mastery.get(`${seed.subject}:${seed.slug}`);
      setStoneLevel(row?.level ?? null);
    } catch {
      setStoneLevel(null);
    }
  }

  if (failed) {
    return (
      <section className="rise-in rounded-[var(--radius)] border border-line bg-surface p-6 shadow-[var(--shadow-2)]">
        <h1 className="text-[24px] font-semibold tracking-tight">The lesson is not on this device yet</h1>
        <p className="mt-2 text-ui text-ink-2">Today has the rest of it, and the lesson opens from there.</p>
        <button type="button" onClick={onDone} className={`${btnPrimary} mt-5`}>
          Go to Today <ArrowRight size={18} aria-hidden />
        </button>
      </section>
    );
  }

  if (!resolved || !view) {
    return (
      <div className="flex flex-col gap-4">
        <CardSkeleton lines={2} />
        <CardSkeleton lines={5} />
      </div>
    );
  }

  const stonePlaced = stoneLevel === "proficient" || stoneLevel === "mastered";
  const secondSection = view.sections[1] ?? null;

  return (
    <div className="flex flex-col gap-4" data-testid="seeded-lesson">
      <section className="rise-in rounded-[var(--radius)] border border-line bg-surface p-6 shadow-[var(--shadow-2)]">
        <p className="text-meta font-medium text-ink-2">
          {seed.unit} · your first lesson
        </p>
        <h1 className="mt-2 text-[24px] font-semibold leading-tight tracking-tight">{seed.title}</h1>
        {view.hero.lede && (
          <p className="prose-note mt-3 text-[16px] leading-relaxed">
            <Tex text={view.hero.lede} />
          </p>
        )}
        {view.hero.can[0] && (
          <p className="mt-3 text-ui text-ink-2">
            By the end you will be able to <Tex text={lowerFirst(view.hero.can[0])} />
          </p>
        )}
        <HeroFigure hero={view.hero} />
      </section>

      {stage === "lesson" && (
        <section className="rise-in rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]">
          <StepRevealNote
            single
            blocks={view.slice}
            onGate={async (id, _answer, correct) => {
              setGateAnswered(true);
              await recordAttempt({ item: { ...item, id: `${seed.topicId}#gate:${id}` }, itemKind: "practice", correct });
            }}
          />
          {view.hasGate && <p className="mt-4 border-t border-line pt-3 text-meta text-ink-2">{GATE_CAPTION}</p>}
          {(gateAnswered || !view.hasGate) && (
            <button type="button" onClick={() => setStage("question")} className={`${btnPrimary} mt-5`}>
              Continue <ArrowRight size={18} aria-hidden />
            </button>
          )}
        </section>
      )}

      {stage === "question" && view.firstPart && (
        <section className="rise-in flex flex-col gap-3">
          <p className="text-meta text-ink-2">{SCHEME_CAPTION}</p>
          <QuestionRunner
            q={view.firstPart}
            kind="practice"
            item={item}
            onDone={() => {
              setQuestionDone(true);
              void readStone();
            }}
          />
          {/* Open from the moment it is marked, and never before: a scheme on the screen while the
              answer field is up is not an open scheme, it is the answer. */}
          {questionDone && view.firstPart.parts[0].scheme.length > 0 && (
            <div className="rise-in rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]">
              <p className="text-meta font-medium text-ink-2">The mark scheme for this part</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-meta text-ink-2">
                {view.firstPart.parts[0].scheme.map((m) => (
                  <li key={m.id}>
                    <span className="tnum mr-2 rounded bg-surface-2 px-1.5 font-medium text-ink">
                      {m.code}
                      {m.marks}
                    </span>
                    <Tex text={m.for} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {questionDone && (
            <div>
              <button type="button" onClick={() => setStage("close")} className={btnPrimary}>
                Continue <ArrowRight size={18} aria-hidden />
              </button>
            </div>
          )}
        </section>
      )}

      {stage === "question" && !view.firstPart && (
        <section className="rise-in rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]">
          <p className="text-ui text-ink-2">This topic has no practice question yet. The rest of the lesson is on the topic page.</p>
          <button type="button" onClick={() => setStage("close")} className={`${btnPrimary} mt-5`}>
            Continue <ArrowRight size={18} aria-hidden />
          </button>
        </section>
      )}

      {stage === "close" && (
        <section className="rise-in rounded-[var(--radius)] border border-line bg-surface p-6 shadow-[var(--shadow-2)]" data-testid="first-run-close">
          <h2 className="text-[22px] font-semibold tracking-tight">That is how the whole thing works</h2>
          <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
            <div className="min-w-0">
              {stonePlaced ? (
                <>
                  <p className="text-ui font-medium">A stone is placed for this topic.</p>
                  <p className="mt-1 text-meta text-ink-2">It stays on your cairn. Nothing is ever taken away in a session.</p>
                </>
              ) : (
                <>
                  <p className="text-ui font-medium">No stone yet, and that is the honest answer.</p>
                  <p className="mt-1 text-meta text-ink-2">
                    A stone is placed when a topic comes back right in a mixed set at least two days later. Tonight is the evidence it is built on, and it is saved on this device.
                  </p>
                </>
              )}
            </div>
            <CairnStack count={stonePlaced ? 1 : 0} fresh={stonePlaced ? 1 : 0} size="sm" />
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <p className="text-meta text-ink-2">
              {secondSection
                ? `The lesson goes on at section ${secondSection.n}, ${secondSection.title}, with the worked examples, the practice and what examiners wrote about it.`
                : "The rest of the lesson has the worked examples, the practice and what examiners wrote about it."}
            </p>
            <Link href={`${seed.href}#note`} className="tap mt-3 inline-flex items-center gap-2 text-ui font-medium underline underline-offset-4">
              Carry on with {seed.unit} <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          <button type="button" onClick={onDone} className={`${btnPrimary} mt-6`}>
            Go to Today <ArrowRight size={18} aria-hidden />
          </button>
        </section>
      )}
    </div>
  );
}

/**
 * The figure the note opens with, which `lessonBlocks` hoists out of the lesson for the hero to
 * carry. Same treatment as the topic page's own hero, so the two screens show the same picture.
 */
function HeroFigure({ hero }: { hero: TopicHeroData }) {
  const figure = hero.figure;
  if (!figure) return null;
  if (figure.kind === "photo")
    return (
      <div className="mt-4 rounded-[var(--radius)] border border-line bg-surface-2 p-3">
        <PhotoFigure photo={figure.photo} className="my-0" />
      </div>
    );
  return (
    <figure className="mt-4 rounded-[var(--radius)] border border-line bg-surface-2 p-4">
      <div
        role="img"
        aria-label={figure.alt}
        className="mx-auto max-w-full text-ink [&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-h-[320px] [&>svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: sanitizeInlineSvg(figure.svg) }}
      />
      {figure.caption && (
        <figcaption className="mt-3 text-meta text-ink-2">
          <MdInlines inlines={parseInline(figure.caption)} />
        </figcaption>
      )}
    </figure>
  );
}

/** "Read a histogram…" after "you will be able to": the authored line keeps its own words. */
function lowerFirst(s: string): string {
  return s.length > 1 && s[1] === s[1].toLowerCase() ? s[0].toLowerCase() + s.slice(1) : s;
}
