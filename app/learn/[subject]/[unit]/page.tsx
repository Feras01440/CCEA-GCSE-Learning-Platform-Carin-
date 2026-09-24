import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shell/PageHeader";
import { UnitTopics, type UnitTopicRow } from "@/components/learn/UnitTopics";
import { allUnitParams, subjectInfo, topicsFor, unitInfo, type Subject, type TopicInfo } from "@/lib/content/taxonomy";
import { contentIndex } from "@/lib/content/load";
import { deckFor } from "@/lib/content/decks";

export const dynamicParams = false;
export function generateStaticParams() {
  return allUnitParams();
}

const TIER_NOTE: Record<TopicInfo["tier"], string> = { H: "Higher only", mixed: "some Higher", F: "", untiered: "" };

/** "nine", "twenty-nine": a count said as a word where a sentence reads better for it. */
function inWords(n: number): string {
  const small = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  return n < small.length ? small[n] : String(n);
}

export default async function UnitPage({ params }: { params: Promise<{ subject: string; unit: string }> }) {
  const { subject, unit } = await params;
  const sInfo = subjectInfo(subject);
  const u = unitInfo(subject as Subject, unit);
  if (!sInfo || !u) notFound();
  const topics = topicsFor(subject as Subject, unit);
  const shipped = contentIndex();
  const shippedOf = (t: TopicInfo) => shipped.get(`${subject}:${t.slug}`);
  const withLesson = topics.filter((t) => shippedOf(t)?.hasNote).length;
  const questionsOnly = topics.filter((t) => shippedOf(t) && !shippedOf(t)?.hasNote).length;
  const deck = deckFor(subject, unit);

  // A note belongs on a row only when it is not true of every row: a label true of every row says nothing
  // (the platform audit: "Number and algebra · 1 statement · Higher only" on all nine M4 rows).
  const varies = (f: (t: TopicInfo) => string) => new Set(topics.map(f)).size > 1;
  const strandVaries = varies((t) => t.strand ?? "");
  const tierVaries = varies((t) => t.tier);
  const calcVaries = varies((t) => t.calculator ?? "");
  const rows: UnitTopicRow[] = topics.map((t) => {
    const s = shippedOf(t);
    const notes = [
      strandVaries && t.strand ? t.strand : "",
      tierVaries ? TIER_NOTE[t.tier] : "",
      calcVaries && t.calculator === "non-calc" ? "non-calculator" : "",
      !s ? "No lesson here yet" : !s.hasNote ? "Questions, no lesson yet" : "",
    ].filter(Boolean);
    return {
      slug: t.slug,
      title: t.title,
      href: `/learn/${subject}/${unit}/${t.slug}/`,
      meta: notes.join(" · "),
      built: !s ? "none" : s.hasNote ? "lesson" : "questions",
    };
  });

  // The honest count, said once, in the lede (quality bar item 10): what has a lesson here and what does not.
  const n = topics.length;
  const built =
    withLesson === n
      ? `Every one has a lesson and original questions.`
      : withLesson === 0 && questionsOnly === 0
        ? `None has a lesson here yet; each lists its specification and the best of what exists.`
        : `${withLesson} of ${n} have a lesson here${questionsOnly ? `, ${questionsOnly} more have questions only` : ""}; the rest list the specification and the best of what exists.`;
  const lede = `${n === 1 ? "One topic" : `${inWords(n).replace(/^./, (c) => c.toUpperCase())} topics`} in teaching order. ${built}${
    u.prerequisiteUnits.length ? ` This paper also assumes ${u.prerequisiteUnits.join(", ")}.` : ""
  }`;

  return (
    // The subject scope (data-subject) is set on <html> by SubjectScope, not here: see src/lib/theme/ThemeProvider.tsx.
    <>
      <PageHeader
        eyebrow={`${sInfo.title} · ${u.short}`}
        title={u.title}
        lede={lede}
        actions={
          deck ? (
            <Link href={`/flashcards/${subject}/${unit}/`} className="tap inline-flex items-center rounded-[var(--radius-sm)] border border-line-3 bg-surface px-4 text-meta font-medium hover:bg-surface-2">
              Flashcards · {deck.cards}
            </Link>
          ) : undefined
        }
      />
      <UnitTopics subject={subject} rows={rows} />
    </>
  );
}
