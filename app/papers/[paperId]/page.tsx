import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaperRunner } from "@/components/papers/PaperRunner";
import { runnablePaperIds, runnerPaper, sessionLabel, unitLabel } from "@/lib/papers";

// Static export: every runnable paper (published mark scheme, or the Summer 2026 set) is
// enumerated at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams(): Array<{ paperId: string }> {
  return runnablePaperIds().map((paperId) => ({ paperId }));
}

export async function generateMetadata({ params }: { params: Promise<{ paperId: string }> }): Promise<Metadata> {
  const { paperId } = await params;
  const paper = runnerPaper(paperId);
  if (!paper) return { title: "Paper" };
  return { title: `${unitLabel(paper)} · ${sessionLabel(paper.sessionKey)}` };
}

export default async function PaperPage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params;
  const paper = runnerPaper(paperId);
  if (!paper) notFound();
  return <PaperRunner paper={paper} />;
}
