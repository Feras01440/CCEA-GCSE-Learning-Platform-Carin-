"use client";

/**
 * The reference half of "In the exam": the specification, what the topic builds on, the best of what exists, and the
 * way out. Reference she consults, so recesses and plain links on the page, never cards (02-surfaces.md §3.7). The page
 * reads these from the catalogue at build time and passes them in as plain data.
 */
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import { btnSecondary, recessCls } from "@/components/items/ui";

export interface TopicReferenceData {
  /** The catalogue's full title: the hero shows the short one, so the whole statement of the topic lives here. */
  fullTitle: string;
  statements: Array<{ id: string; text: string; higherOnly: boolean }>;
  /** "Examined in M4 and M8 · calculator allowed · Higher tier only" */
  examined: string;
  buildsOn: Array<{ label: string; href: string }>;
  links: Array<{ label: string; url: string; note?: string }>;
  flashcards: { href: string; count: number } | null;
  back: { href: string; label: string };
}

export const recessLabelCls = "text-meta font-medium text-ink-2";
const linkCls = "underline decoration-accent decoration-1 underline-offset-[3px] hover:decoration-2";

/** The specification recess, with the paper's own description of how the topic is examined when the note has one. */
export function SpecificationRecess({ data, howExamined }: { data: TopicReferenceData; howExamined?: string | null }) {
  return (
    <section aria-labelledby="ref-spec" className={recessCls}>
      <h3 id="ref-spec" className={recessLabelCls}>
        On the paper
      </h3>
      <p className="mt-1.5 text-ui font-medium text-ink">{data.fullTitle}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {data.statements.map((s) => (
          <li key={s.id} className="flex gap-2.5 text-ui leading-snug">
            <span className="tnum mt-0.5 h-fit shrink-0 rounded-[var(--radius-xs)] border border-line-2 px-1.5 text-micro text-ink-2">{s.id}</span>
            <span>
              {s.text}
              {s.higherOnly && <span className="ml-1.5 text-meta text-ink-2">Higher only</span>}
            </span>
          </li>
        ))}
      </ul>
      {data.examined && <p className="mt-2 text-meta text-ink-2">{data.examined}</p>}
      {howExamined && <p className="mt-3 border-t border-line pt-3 text-ui leading-relaxed text-ink">{howExamined}</p>}
    </section>
  );
}

/** Builds on, the best of what exists, and the way back: the last things on the page. */
export function ReferenceLinks({ data }: { data: TopicReferenceData }) {
  return (
    <>
      {data.buildsOn.length > 0 && (
        <p className="text-ui leading-relaxed text-ink-2">
          <span className="font-medium text-ink">Builds on </span>
          {data.buildsOn.map((b, i) => (
            <span key={b.href}>
              {i > 0 && (i === data.buildsOn.length - 1 ? " and " : ", ")}
              <Link href={b.href} className={clsx(linkCls, "text-ink")}>
                {b.label}
              </Link>
            </span>
          ))}
          .
        </p>
      )}

      <section aria-labelledby="ref-links" className={recessCls}>
        <h3 id="ref-links" className={recessLabelCls}>
          The best of what exists
        </h3>
        {data.links.length ? (
          <ul className="mt-2 flex flex-col gap-2.5">
            {data.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className={clsx(linkCls, "inline-flex items-start gap-1.5 text-ui text-ink")}>
                  {l.label}
                  <ExternalLink size={16} strokeWidth={1.5} className="mt-[3px] shrink-0 text-ink-2" aria-hidden />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                {l.note && <p className="text-meta text-ink-2">{l.note}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1.5 text-meta text-ink-2">Links are added as each topic is published.</p>
        )}
        <p className="mt-3 text-meta text-ink-2">Linked with credit, never copied.</p>
      </section>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {data.flashcards && (
          <Link href={data.flashcards.href} className={btnSecondary}>
            Flashcards for this topic · {data.flashcards.count}
          </Link>
        )}
        <Link href={data.back.href} className={clsx(linkCls, "tap inline-flex items-center text-ui text-ink-2")}>
          Back to {data.back.label}
        </Link>
      </div>
    </>
  );
}
