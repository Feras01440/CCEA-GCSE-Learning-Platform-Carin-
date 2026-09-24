import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shell/PageHeader";
import { DeckStudy } from "@/components/flashcards/DeckStudy";
import { subjectInfo, unitInfo, type Subject } from "@/lib/content/taxonomy";
import { DECKS_MANIFEST, deckFor } from "@/lib/content/decks";

export const dynamicParams = false;
export function generateStaticParams() {
  return DECKS_MANIFEST.units.map((u) => ({ subject: u.subject, unit: u.unit }));
}

export default async function DeckPage({ params }: { params: Promise<{ subject: string; unit: string }> }) {
  const { subject, unit } = await params;
  const s = subjectInfo(subject);
  const u = unitInfo(subject as Subject, unit);
  const d = deckFor(subject, unit);
  if (!s || !u || !d) notFound();
  return (
    <>
      <PageHeader eyebrow={`Flashcards · ${s.short}`} title={`${u.short} deck`} lede={`${d.cards} cards across ${d.topics} topics. Choose topics or study the whole unit.`} />
      <DeckStudy subject={subject as Subject} unit={unit} />
    </>
  );
}
