import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { PlanCoverage } from "@/components/learn/PlanCoverage";
import { SUBJECTS, topicsFor, unitsFor } from "@/lib/content/taxonomy";
import { contentIndex } from "@/lib/content/load";

/**
 * The three subjects, each with the honest counts (quality bar item 10): the catalogue's topics against the ones with
 * a published lesson, and, from her plan, the same count for her own units. Objects she acts on, so white on the page
 * with a hairline and no shadow; nothing lifts on hover (01-art-direction.md §6).
 */
export default function LearnPage() {
  const shipped = contentIndex();
  return (
    <>
      <PageHeader eyebrow="Learn" title="Subjects" lede="Every topic is tied to its CCEA specification statement, tier and paper." />
      <div className="grid gap-4 md:grid-cols-3">
        {SUBJECTS.map((s) => {
          const units = unitsFor(s.id);
          const counts: Record<string, { built: number; total: number; short: string }> = {};
          for (const u of units) {
            const topics = topicsFor(s.id, u.code);
            counts[u.code] = { total: topics.length, built: topics.filter((t) => shipped.has(`${s.id}:${t.slug}`)).length, short: u.code === "U7" ? "Unit 7" : u.code };
          }
          const total = units.reduce((n, u) => n + u.topicCount, 0);
          const built = Object.values(counts).reduce((n, c) => n + c.built, 0);
          return (
            <Link key={s.id} href={`/learn/${s.id}/`} className="group flex flex-col rounded-[var(--radius)] border border-line-2 bg-surface p-5 hover:bg-surface-2">
              <h2 className="text-h3 font-semibold tracking-tight">{s.title}</h2>
              <p className="mt-1 text-meta text-ink-2">{s.blurb}</p>
              <p className="tnum mt-4 text-meta text-ink-2">
                {units.length} units · {built} of {total} topics built
              </p>
              <PlanCoverage subject={s.id} units={counts} />
              <span className="mt-3 inline-flex items-center gap-1 text-meta font-medium text-ink group-hover:underline">
                Open <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
