import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SlidesRun } from "@/components/slides/SlidesRun";
import { displayTitle } from "@/components/topic/lesson-plan";
import { allTopicParams, subjectInfo, topicInfo, unitInfo, type Subject } from "@/lib/content/taxonomy";
import { contentFor } from "@/lib/content/load";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { deckFor } from "@/lib/slides/deck";
import { NO_TOPIC_READY, slidesReadyFor } from "@/lib/slides/ready";

/**
 * Slides: the primary way into a topic (decisions 9 and 17), a static route beside the topic page. Built only for the
 * topics that have Slides (src/lib/slides/ready.ts): the deck is generated at build time from the shipped bundle, so
 * the page works offline from the export and nothing is fetched to start.
 */
export const dynamicParams = false;
export function generateStaticParams() {
  // Readiness (27 Sep 2026): exactly the topics the content says are ready (src/lib/slides/ready.ts, the one function),
  // each at its own unit; the service worker precaches what this exports. With none ready, the one stand-in address
  // that is no topic's (NO_TOPIC_READY), because the static export refuses a dynamic route with nothing to prerender.
  const ready: Array<{ subject: string; unit: string; topic: string }> = allTopicParams().filter((p) => slidesReadyFor(p.subject, p.topic, p.unit));
  return ready.length > 0 ? ready : [{ ...NO_TOPIC_READY }];
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string; unit: string; topic: string }> }): Promise<Metadata> {
  const { subject, unit, topic } = await params;
  const t = topicInfo(subject as Subject, unit, topic);
  return { title: t ? `Slides · ${displayTitle(t.title)}` : "Slides" };
}

function shippedFor(subject: string, topicId: string): { noteBlocks: unknown[]; prompts: RetrievalPrompt[] } | null {
  try {
    const file = path.join(process.cwd(), "public", "content", subject, `${topicId}.json`);
    const b = JSON.parse(fs.readFileSync(file, "utf8")) as { noteBlocks?: unknown[] | null; prompts?: RetrievalPrompt[] };
    return { noteBlocks: b.noteBlocks ?? [], prompts: b.prompts ?? [] };
  } catch {
    return null;
  }
}

export default async function SlidesPage({ params }: { params: Promise<{ subject: string; unit: string; topic: string }> }) {
  const { subject, unit, topic } = await params;
  const sInfo = subjectInfo(subject);
  const u = unitInfo(subject as Subject, unit);
  const t = topicInfo(subject as Subject, unit, topic);
  const shipped = contentFor(subject, topic);
  if (!sInfo || !u || !t || !shipped || !slidesReadyFor(subject, topic)) notFound();
  const file = shippedFor(subject, shipped.id);
  if (!file || file.noteBlocks.length === 0) notFound();

  const deck = deckFor(shipped.id, file.noteBlocks, file.prompts);
  const firstHeading = (file.noteBlocks.find((b) => (b as { type?: string }).type === "h") as { text?: string } | undefined)?.text ?? null;
  const shown = displayTitle(t.title, firstHeading);

  return <SlidesRun subject={subject as Subject} unit={u.code} slug={topic} topicId={shipped.id} title={t.title} displayTitle={shown} locator={`${sInfo.short} · ${u.code}`} deck={deck} />;
}
