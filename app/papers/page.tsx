import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/PageHeader";
import { PaperPlan } from "@/components/papers/PaperPlan";
import { pickerPapers } from "@/lib/papers";

export const metadata: Metadata = { title: "Papers" };

export default function PapersPage() {
  // Read at build time from data/papers/index.json (metadata and official links only).
  // The plan itself is read on the device: PaperPlan is a client component.
  const papers = {
    maths: pickerPapers("maths"),
    "further-maths": pickerPapers("further-maths"),
    science: pickerPapers("science"),
  };
  return (
    <>
      <PageHeader eyebrow="Papers" title="Your papers" lede="Your entries, soonest first. Sit a past paper against the real clock and see what it is worth." />
      <PaperPlan papers={papers} />
    </>
  );
}
