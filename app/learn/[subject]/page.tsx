import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shell/PageHeader";
import { SUBJECTS, subjectInfo, unitsFor, type Subject } from "@/lib/content/taxonomy";

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subject: s.id }));
}

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const info = subjectInfo(subject);
  if (!info) notFound();
  const units = unitsFor(subject as Subject);
  return (
    // The subject scope (data-subject) is set on <html> by SubjectScope, not here: see src/lib/theme/ThemeProvider.tsx.
    <>
      <PageHeader eyebrow="Learn" title={info.title} lede={info.blurb} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {units.map((u) => (
          <li key={u.code}>
            <Link
              href={`/learn/${subject}/${u.code}/`}
              className="flex h-full flex-col rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)] transition-shadow duration-200 hover:shadow-[var(--shadow-2)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[20px] font-semibold tracking-tight">{u.short}</span>
                {u.tier && (
                  <span className="rounded-full border border-line px-2 py-0.5 text-meta text-ink-2">{u.tier === "H" ? "Higher" : "Foundation"}</span>
                )}
              </div>
              <p className="mt-1 text-meta text-ink-2">{u.title}</p>
              <p className="tnum mt-3 text-meta text-ink-2">
                {u.weighting !== null ? `${u.weighting}% · ` : ""}
                {u.minutes ? `${u.minutes} min · ` : ""}
                {u.marks ? `${u.marks} marks · ` : ""}
                {u.calculator}
              </p>
              <p className="mt-auto pt-3 text-meta text-ink-2">
                {u.note ? `${u.note} · ` : ""}
                {u.topicCount} topics
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
