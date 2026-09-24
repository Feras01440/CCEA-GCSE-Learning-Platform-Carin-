import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { DifficultyDots } from "@/components/topic/DifficultyDots";
import { TopicContent } from "@/components/topic/TopicContent";
import { TopicHero } from "@/components/topic/TopicHero";
import type { TopicReferenceData } from "@/components/topic/TopicReference";
import { displayTitle, heroDataFor, isReadV2, lessonSections, noteGateIds } from "@/components/topic/lesson-plan";
import { SeeIt } from "@/components/topic/SeeIt";
import { allTopicParams, difficultyLabel, subjectInfo, topicInfo, unitInfo, type Subject } from "@/lib/content/taxonomy";
import { contentFor } from "@/lib/content/load";
import { deckFor } from "@/lib/content/decks";
import { mediaFor } from "@/lib/content/media";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { slidesCardCount } from "@/lib/slides/deck";
import { slidesReadyFor } from "@/lib/slides/ready";

/** The verified reading links for a topic: the taxonomy's hand-picked links first, then the media map's, deduplicated by URL. */
function readingLinks(subject: string, topic: string, picked: Array<{ label: string; url: string; note?: string }>) {
  const seen = new Set<string>();
  const out: Array<{ label: string; url: string; note?: string }> = [];
  for (const l of [...picked, ...mediaFor(subject, topic).reading]) {
    if (seen.has(l.url)) continue;
    seen.add(l.url);
    out.push(l);
  }
  return out;
}

export const dynamicParams = false;
export function generateStaticParams() {
  return allTopicParams();
}

/**
 * The shipped note's blocks, read from the exported bundle at build time. The hero is the first
 * thing she reads, so it is prerendered with the page instead of waiting for the client fetch
 * that fills in the lesson below it.
 */
function shippedFor(subject: string, topicId: string): { noteBlocks: unknown[]; prompts: RetrievalPrompt[]; findings: number } {
  try {
    const file = path.join(process.cwd(), "public", "content", subject, `${topicId}.json`);
    const b = JSON.parse(fs.readFileSync(file, "utf8")) as { noteBlocks?: unknown[] | null; prompts?: RetrievalPrompt[] | null; insight?: { findings?: unknown[] } | null };
    return { noteBlocks: b.noteBlocks ?? [], prompts: b.prompts ?? [], findings: b.insight?.findings?.length ?? 0 };
  } catch {
    return { noteBlocks: [], prompts: [], findings: 0 };
  }
}

/** "M4 and M8", "B1". */
function andList(items: string[]): string {
  return items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The catalogue's reference for a topic, as plain data for the recesses under "In the exam". */
function referenceFor(subject: Subject, unitCode: string, unitShort: string, t: NonNullable<ReturnType<typeof topicInfo>>, links: Array<{ label: string; url: string; note?: string }>, cards: number): TopicReferenceData {
  const everyTopic = allTopicParams();
  const buildsOn = t.prerequisites.flatMap((pre) => {
    const slug = pre.includes(":") ? pre.split(":").pop()! : pre;
    const at = everyTopic.find((p) => p.topic === slug && p.subject === subject) ?? everyTopic.find((p) => p.topic === slug);
    const info = at ? topicInfo(at.subject, at.unit, at.topic) : undefined;
    return at && info ? [{ label: displayTitle(info.title), href: `/learn/${at.subject}/${at.unit}/${at.topic}/` }] : [];
  });
  const examined = [
    t.examinedIn.length ? `Examined in ${andList(t.examinedIn)}` : null,
    t.calculator === "calc" ? "calculator allowed" : t.calculator === "non-calc" ? "no calculator" : null,
    t.tier === "H" ? "Higher tier only" : null,
  ]
    .filter((s): s is string => Boolean(s))
    .join(" · ");
  return {
    fullTitle: t.title,
    statements: t.statements.map((s) => ({ id: s.id, text: s.text, higherOnly: s.tier === "H" && t.tier === "mixed" })),
    examined,
    buildsOn,
    links,
    flashcards: cards > 0 ? { href: `/flashcards/${subject}/${unitCode}/?topic=${t.slug}`, count: cards } : null,
    back: { href: `/learn/${subject}/${unitCode}/`, label: unitShort },
  };
}

/** A block of reference on a topic still being written: a recess, since she consults it and never acts on it. */
function Recess({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-sm)] bg-surface-2 p-4">
      <h2 className="text-meta font-medium text-ink-2">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default async function TopicPage({ params }: { params: Promise<{ subject: string; unit: string; topic: string }> }) {
  const { subject, unit, topic } = await params;
  const sInfo = subjectInfo(subject);
  const u = unitInfo(subject as Subject, unit);
  const t = topicInfo(subject as Subject, unit, topic);
  if (!sInfo || !u || !t) notFound();
  const shipped = contentFor(subject, topic);
  const topicCardCount = ((deckFor(subject, unit)?.topicCards ?? {}) as Record<string, number>)[topic] ?? 0;
  const links = readingLinks(subject, topic, t.links);

  if (shipped) {
    // A shipped topic opens on its own hero: what it is, how long it takes, one way in. The lesson is the page below it.
    const shippedFile = shippedFor(subject, shipped.id);
    const blocks = shippedFile.noteBlocks;
    const hero = heroDataFor(blocks);
    const sections = lessonSections(blocks, hero.lede);
    const firstHeading = (blocks.find((b) => (b as { type?: string }).type === "h") as { text?: string } | undefined)?.text ?? null;
    const shownTitle = displayTitle(t.title, firstHeading, hero.short);
    const heroElement = (
      <TopicHero
        subject={subject as Subject}
        unit={u.code}
        slug={topic}
        locator={`${sInfo.short} · Unit ${u.code}`}
        title={t.title}
        displayTitle={shownTitle}
        hero={hero}
        sections={sections.length}
        topicId={shipped.id}
        gateSections={sections.flatMap((sec) => sec.gateIds.map((id) => [id, sec.n] as [string, number]))}
        findings={shippedFile.findings}
        checks={noteGateIds(blocks).length}
        workedExamples={shipped.counts.we}
        practicals={t.practicals}
        // "Start the slides · 25 cards": the deck's own count, on a topic that has Slides (the slides agent's buttons).
        slidesCards={slidesReadyFor(subject, topic) ? slidesCardCount(shipped.id, blocks, shippedFile.prompts) : undefined}
      />
    );
    const content = {
      subject: subject as Subject,
      unit,
      slug: topic,
      topicId: shipped.id,
      displayTitle: shownTitle,
      seeIt: <SeeIt subject={subject} slug={topic} />,
      reference: referenceFor(subject as Subject, u.code, u.short, t, links, topicCardCount),
    };
    // Read v2 (the trial topic): the hero is drawn inside the lesson's own column, under the track, so the track can
    // stay at the top of the lesson while it is on screen. Every other topic keeps decision 1's page as it shipped.
    if (isReadV2(subject, u.code, topic)) return <TopicContent {...content} hero={heroElement} sections={sections} />;
    return (
      // The subject scope (data-subject) is set on <html> by SubjectScope, not here: see src/lib/theme/ThemeProvider.tsx.
      <>
        {heroElement}
        <TopicContent {...content} />
      </>
    );
  }

  // A topic still being written: the specification, where marks are lost, and the best of what exists, until its
  // lesson is published. Reference only, so recesses; the links sit beside it on a wide screen.
  return (
    <>
      <PageHeader
        eyebrow={`${sInfo.short} · ${u.short}${t.strand ? ` · ${t.strand}` : ""}`}
        title={t.title}
        actions={
          <div className="flex flex-col items-end gap-1">
            <DifficultyDots value={t.difficulty} />
            <span className="text-meta text-ink-2">{difficultyLabel(t.difficulty)}</span>
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <SeeIt subject={subject} slug={topic} />
          <Recess title="What the specification says">
            <ul className="flex flex-col gap-2">
              {t.statements.map((s) => (
                <li key={s.id} className="flex gap-3 text-ui leading-snug">
                  <span className="tnum h-fit shrink-0 rounded-[var(--radius-xs)] border border-line-2 px-1.5 text-micro text-ink-2">{s.id}</span>
                  <span>
                    {s.text}
                    {s.tier === "H" && t.tier === "mixed" && <span className="ml-2 text-meta text-ink-2">Higher only</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-meta text-ink-2">
              Examined in {t.examinedIn.join(", ")}
              {t.calculator === "calc" ? " · calculator" : t.calculator === "non-calc" ? " · non-calculator" : ""}
              {t.tier === "H" ? " · Higher tier only" : ""}
            </p>
          </Recess>
          <Recess title="Where marks are lost">
            {t.examinerEvidence.length ? (
              <ul className="flex flex-col gap-2.5">
                {t.examinerEvidence.map((e, i) => (
                  <li key={i} className="text-ui leading-snug">
                    <span className="tnum mr-2 text-meta font-medium text-ink-2">
                      {e.series}
                      {e.unit ? ` · ${e.unit}` : ""}
                    </span>
                    <span className="text-ink">{e.note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-meta text-ink-2">No specific examiner finding recorded for this topic.</p>
            )}
            <p className="mt-3 text-meta text-ink-2">From the CCEA Chief Examiner’s reports, in our words.</p>
          </Recess>
          <p className="text-ui text-ink-2">
            Original questions for this topic are being written and verified. Until they are published, the resources here are the best existing
            treatment we could find.
          </p>
        </div>

        <aside className="flex flex-col gap-4">
          {(t.mustMemorise.length > 0 || t.onFormulaSheet.length > 0) && (
            <Recess title="Formula sheet">
              {t.onFormulaSheet.length > 0 && (
                <>
                  <p className="text-meta font-medium text-ink-2">Given in the exam</p>
                  <ul className="mb-3 mt-1 list-disc pl-5 text-ui">{t.onFormulaSheet.map((x) => <li key={x}>{x}</li>)}</ul>
                </>
              )}
              {t.mustMemorise.length > 0 && (
                <>
                  <p className="text-meta font-medium text-ink-2">You must know</p>
                  <ul className="mt-1 list-disc pl-5 text-ui">{t.mustMemorise.map((x) => <li key={x}>{x}</li>)}</ul>
                </>
              )}
            </Recess>
          )}
          <Recess title="Best of what exists">
            {links.length ? (
              <ul className="flex flex-col gap-2">
                {links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-ui text-ink underline decoration-accent underline-offset-[3px] hover:decoration-2">
                      {l.label} <ExternalLink size={16} strokeWidth={1.5} className="mt-[3px] shrink-0 text-ink-2" aria-hidden />
                    </a>
                    {l.note && <p className="text-meta text-ink-2">{l.note}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-meta text-ink-2">Links are added as each topic is published.</p>
            )}
            <p className="mt-3 text-meta text-ink-2">Linked with credit, never copied.</p>
          </Recess>
          {topicCardCount > 0 && (
            <Link
              href={`/flashcards/${subject}/${unit}/?topic=${topic}`}
              className="tap inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-line-2 bg-surface px-4 text-ui font-medium hover:bg-surface-2"
            >
              Flashcards for this topic · {topicCardCount}
            </Link>
          )}
          <Link href={`/learn/${subject}/${unit}/`} className="tap inline-flex items-center text-ui text-ink-2 underline decoration-accent underline-offset-[3px]">
            Back to {u.short}
          </Link>
        </aside>
      </div>
    </>
  );
}
