import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";
import { SUBJECTS, unitsFor } from "@/lib/content/taxonomy";
import { deckFor } from "@/lib/content/decks";

/**
 * Decks by unit (02-surfaces.md §6): the subject heading in ink, then the units as 52 px page rows, each whole row the
 * way into its deck, with the honest count on the right, or "coming" where a unit has no deck yet. No tint bar and no
 * band behind the list: the heading is enough.
 */
export default function FlashcardsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Flashcards"
        title="Decks by unit"
        lede="Definitions, formulae, equations, tests, methods and the examiner's traps, one card each. Grading a card puts it on the same schedule as everything else you review."
      />
      <div className="grid gap-8 md:grid-cols-3 md:gap-6">
        {SUBJECTS.map((s) => (
          <section key={s.id} aria-labelledby={`deck-${s.id}`}>
            <h2 id={`deck-${s.id}`} className="border-b border-line pb-2 text-h3 font-semibold tracking-tight">
              {s.title}
            </h2>
            <ul className="divide-y divide-line">
              {unitsFor(s.id).map((u) => {
                const d = deckFor(s.id, u.code);
                return (
                  <li key={u.code}>
                    {d ? (
                      <Link href={`/flashcards/${s.id}/${u.code}/`} className="flex min-h-[52px] items-center justify-between gap-3 hover:bg-surface-2">
                        <span className="text-ui font-medium underline-offset-4">{u.short}</span>
                        <span className="tnum text-meta text-ink-2">{`${d.cards} cards · ${d.topics} topics`}</span>
                      </Link>
                    ) : (
                      <span className="flex min-h-[52px] items-center justify-between gap-3">
                        <span className="text-ui text-ink-2">{u.short}</span>
                        <span className="text-meta text-ink-2">coming</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
