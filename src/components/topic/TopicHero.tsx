"use client";

/**
 * The first screen of a topic (02-surfaces.md §3.1, with 04-critique.md R5): what this is, how long it takes, and where
 * to press, then who is with her, the topic's own figure, and what she will be able to do.
 *
 * Order: locator (with her paper's date, a place and not a countdown) > display title > lede > the promise line >
 * "Start the lesson", the Slides/Read choice and "Done this before?" > the mastery chip, only when there is mastery >
 * Rowan's line > the figure, on the page > the three "you will be able to" lines. The button lands inside 640 px of a
 * 390 x 844 phone and the figure's top inside 720 px; nothing on it is a tariff, a series, a trap or a verdict.
 *
 * A returning visit keeps the same screen and changes the button: "Continue at section 3", where she stopped.
 */
import { useId } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { clsx } from "clsx";
import { MasteryChip, MdInlines, parseInline } from "@/components/items";
import { PhotoFigure } from "@/components/media/PhotoFigure";
import { locatorCls } from "@/components/shell/PageHeader";
import { getDB } from "@/lib/db/db";
import { nextStepHint } from "@/lib/mastery/engine";
import { DEFAULT_PLAN, paperPhrase, todayISO } from "@/lib/plan/exam-plan";
import { useExamPlan } from "@/lib/plan/store";
import { sanitizeInlineSvg, svgViewBoxWidth } from "@/lib/ux/svg";
import type { Subject } from "@/lib/content/taxonomy";
import { StagedFigure } from "@/components/items/StepRevealNote";
import { ILLUSTRATIONS } from "@/components/slides/enrich";
import { enrichmentFor } from "@/lib/slides/enrichment";
import { isReadV2, minutesHeading, type TopicHeroData } from "./lesson-plan";
import { StartButtons } from "@/components/slides/StartButtons";
import { useCompanionContext } from "@/lib/companion";
import { CompanionLine } from "@/components/companion/CompanionLine";
import { answeredGateIds } from "@/lib/session/flow";

export interface TopicHeroProps {
  subject: Subject;
  /** Unit code, e.g. "B1" or "M4". */
  unit: string;
  slug: string;
  /** "Science · Unit B1": the paper's date is added here when she is entered for this unit. */
  locator: string;
  /** The catalogue title, which is what Rowan is told the topic is called. */
  title: string;
  /** The short title the page shows (lesson-plan.ts displayTitle). */
  displayTitle: string;
  hero: TopicHeroData;
  /** Counts for the one honest promise line. */
  sections: number;
  checks: number;
  workedExamples: number;
  /** Examiners' findings shipped with the topic (its insight), 0 when it has none. */
  findings?: number;
  /** Prescribed practical codes this topic covers, e.g. ["B3"]. */
  practicals?: string[];
  /** The shipped bundle's id, which is how the note records its gates. */
  topicId: string;
  /** Each gate with the 1-based lesson section it closes, in note order: where she stopped is read from it. */
  gateSections?: Array<[string, number]>;
  /** The Slides deck's card count, when the page knows it: "Start the slides · 25 cards" (the slides agent's buttons). */
  slidesCards?: number;
}

const reducedMotion = (): boolean => typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Take her to the first of these places that exists, and put the keyboard there too. The lesson loads just after the
 * hero, so a tap in the first moment waits (up to three seconds) for the place to exist rather than doing nothing.
 */
function jumpTo(selectors: string[]): void {
  const started = performance.now();
  const attempt = () => {
    const el = selectors.map((s) => document.querySelector<HTMLElement>(s)).find((e) => e !== null);
    if (!el) {
      if (performance.now() - started < 3000) window.requestAnimationFrame(attempt);
      return;
    }
    el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };
  attempt();
}

/**
 * "for your paper on 14 May": this unit's own paper, and only when she is entered for it. Never a countdown. Until
 * her plan is read, the phrase the default plan gives holds the line's place, invisible, so the locator never wraps
 * late and nothing below it shifts (a full page load paints before any script can know her plan).
 */
function usePaperPhrase(subject: Subject, unit: string): { text: string; held: boolean } | null {
  const plan = useExamPlan();
  const text = paperPhrase(plan ?? DEFAULT_PLAN, subject, unit, todayISO());
  return text ? { text, held: plan === undefined } : null;
}

/**
 * The topic's own figure, on the page: no card, no border, drawn no larger than it was made (the viewBox cap). In Read v2
 * it stands on the subject's wash, its stage, with the caption on the page below (art direction v2 §3.4); and where the
 * topic's Slides register a title drawing for it, that drawing takes the figure's place, so both ways in open on the same
 * picture and the note (which hoists its first figure into the hero) never shows the idea twice. Its caption stays the
 * note's own.
 */
function HeroFigure({ hero, staged = false, topicId }: { hero: TopicHeroData; staged?: boolean; topicId: string }) {
  const titleDrawing = staged ? enrichmentFor(topicId)?.illustrations?.title : undefined;
  const Drawn = titleDrawing ? ILLUSTRATIONS[titleDrawing] : undefined;
  const caption = hero.figure?.kind === "svg" ? hero.figure.caption : undefined;
  if (Drawn)
    return (
      <figure data-staged-figure className="m-0">
        {/* 8 px of stage on a phone leaves the drawing 342 px wide, where its smallest label is 13 px (v2 §11.2). */}
        <div className="flex justify-center rounded-[var(--radius)] bg-[var(--tint-wash)] p-2 sm:p-5">
          <Drawn />
        </div>
        {caption && (
          <figcaption className="mt-3 max-w-[var(--measure)] text-meta text-ink-2">
            <MdInlines inlines={parseInline(caption)} />
          </figcaption>
        )}
      </figure>
    );
  const figure = hero.figure;
  if (!figure) return null;
  if (figure.kind === "photo") return <PhotoFigure photo={figure.photo} className="!my-0" />;
  if (staged) return <StagedFigure svg={figure.svg} alt={figure.alt} caption={figure.caption} />;
  const svg = sanitizeInlineSvg(figure.svg);
  const width = svgViewBoxWidth(svg);
  return (
    <figure className="m-0">
      <div
        role="img"
        aria-label={figure.alt}
        className={clsx("max-w-full text-ink [&>svg]:h-auto [&>svg]:max-h-[420px]", width ? "[&>svg]:block [&>svg]:w-full" : "[&>svg]:max-w-full")}
        style={width ? { maxWidth: `${width}px` } : undefined}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {figure.caption && (
        <figcaption className="mt-3 max-w-[var(--measure)] text-meta text-ink-2">
          <MdInlines inlines={parseInline(figure.caption)} />
        </figcaption>
      )}
    </figure>
  );
}

export function TopicHero({ subject, unit, slug, locator, title, displayTitle, hero, sections, checks, workedExamples, findings = 0, practicals = [], topicId, gateSections = [], slidesCards }: TopicHeroProps) {
  const canId = useId();
  const paper = usePaperPhrase(subject, unit);
  // `null` once read and absent: `undefined` is still loading, and the companion waits for the difference.
  const mastery = useLiveQuery(async () => {
    try {
      return (await getDB().mastery.get(`${subject}:${slug}`)) ?? null;
    } catch {
      return null;
    }
  }, [subject, slug]);
  const answered = useLiveQuery(async () => {
    try {
      return await answeredGateIds(subject, slug, topicId);
    } catch {
      return [] as string[];
    }
  }, [subject, slug, topicId]);

  // The `topic-open` slot (docs/plan/companion/integration-contract.md): signed, in the hero, before any
  // question. Where she stopped is the section after the last one whose gate she answered.
  const ready = mastery !== undefined && answered !== undefined;
  const done = new Set(answered ?? []);
  const lastAnswered = gateSections.reduce((m, [id, n]) => (done.has(id) ? Math.max(m, n) : m), 0);
  const sectionNumber = lastAnswered > 0 && gateSections.some(([, n]) => n > lastAnswered) ? lastAnswered + 1 : null;
  const firstVisit = ready && mastery === null && done.size === 0;
  const companion = useCompanionContext({
    // Rowan names the topic exactly as the h1 does (the companion agent's change, 23 Sep).
    topic: { slug, unit, subject, title, shortTitle: displayTitle, firstVisit, sectionNumber, examinerFlagged: findings > 0 },
    questionVisible: false,
  });
  const start = () => (sectionNumber ? jumpTo([`#note h3[data-section="${sectionNumber - 1}"]`, "#note"]) : jumpTo(["#note"]));
  const facts = [
    `${sections} ${sections === 1 ? "section" : "sections"}`,
    checks > 0 ? `${checks} ${checks === 1 ? "check" : "checks"}` : null,
    workedExamples > 0 ? `${workedExamples} worked ${workedExamples === 1 ? "example" : "examples"}` : null,
    findings > 0 ? `${findings} examiner ${findings === 1 ? "finding" : "findings"}` : null,
    ...practicals.map((p) => `Prescribed Practical ${p}`),
  ].filter((f): f is string => f !== null);
  const hasMastery = mastery != null && mastery.level !== "not-started";

  return (
    <header className="mb-10 flex flex-col md:mb-12">
      <p className={locatorCls}>
        {locator}
        {paper && <span className={paper.held ? "invisible" : undefined} aria-hidden={paper.held || undefined}> · {paper.text}</span>}
      </p>

      <h1 className="font-serif-lesson mt-3 max-w-[20ch] text-display font-medium tracking-[-0.015em] text-ink">
        <MdInlines inlines={parseInline(displayTitle)} />
      </h1>

      {hero.lede && (
        <p className="font-serif-lesson mt-3 max-w-[var(--measure-tight)] text-prose leading-[1.52] text-ink">
          <MdInlines inlines={parseInline(hero.lede)} />
        </p>
      )}

      {/* The promise: the one line that answers "why is this worth my time", in the first five seconds. */}
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-ui text-ink-2">
        <span className="font-semibold text-ink">{minutesHeading(hero.minutes)}</span>
        {facts.map((f) => (
          <span key={f}>{f}</span>
        ))}
      </p>

      {/* The two ways in (the slides agent's block, TRIAL-BRIEF.md): Slides on the accent on a first visit, Read as the
          outlined second way, the last-chosen way remembered on this device; one Read button on a topic without Slides. */}
      <StartButtons
        subject={subject}
        unit={unit}
        slug={slug}
        topicId={topicId}
        firstVisit={firstVisit}
        sectionNumber={sectionNumber}
        cards={slidesCards}
        onRead={start}
        onReadFromTop={() => jumpTo(["#note"])}
        onDoneBefore={() => jumpTo(["#practice", "#exam", "#check", "#sheet"])}
      />

      {hasMastery && (
        <div className="mt-5">
          <MasteryChip level={mastery.level} lastEvidenceAt={mastery.lastEvidenceAt ?? null} decayHint={nextStepHint(mastery.level)} size="sm" />
        </div>
      )}

      {ready && (
        <div className="mt-2.5 empty:hidden md:mt-3.5">
          <CompanionLine moment="topic-open" context={companion} />
        </div>
      )}

      {hero.figure && (
        <div className="mt-7">
          <HeroFigure hero={hero} staged={isReadV2(subject, unit, slug)} topicId={topicId} />
        </div>
      )}

      {hero.can.length > 0 && (
        <div className="mt-7">
          <p id={canId} className="text-meta font-medium text-ink-2">
            By the end you will be able to
          </p>
          <ul aria-labelledby={canId} className="mt-2 flex max-w-[var(--measure)] flex-col gap-1.5 text-ui text-ink-2">
            {hero.can.map((line) => (
              <li key={line} className="grid grid-cols-[14px_minmax(0,1fr)] gap-2">
                <span aria-hidden className="mt-[9px] h-[6px] w-[6px] rounded-full bg-ink-3" />
                <span>
                  <MdInlines inlines={parseInline(line)} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
