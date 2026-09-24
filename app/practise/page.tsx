import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { MixedPractice } from "@/components/practise/MixedPractice";
import { DECKS_MANIFEST } from "@/lib/content/decks";

export default function PractisePage() {
  const cards = DECKS_MANIFEST.units.reduce((n, u) => n + u.cards, 0);
  return (
    <>
      <PageHeader eyebrow="Practise" title="Mixed practice" lede="Original questions with no topic labels, marked the way CCEA marks. Choose the mix and start." />
      <Link
        href="/flashcards/"
        className="mb-4 flex items-center justify-between rounded-[var(--radius)] border border-line bg-surface p-4 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]"
      >
        <span className="flex items-center gap-3">
          <Layers size={20} strokeWidth={1.75} aria-hidden className="text-ink-2" />
          <span>
            <span className="block text-ui font-medium">Flashcards</span>
            <span className="tnum block text-meta text-ink-2">{cards} cards by unit, section and topic, on the same review schedule</span>
          </span>
        </span>
        <ArrowRight size={18} aria-hidden className="text-ink-3" />
      </Link>
      <MixedPractice />
    </>
  );
}
