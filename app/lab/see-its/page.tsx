import type { Metadata } from "next";
import { LabIndex } from "./LabIndex";
import { labCardHref, labCases } from "./cases";

/**
 * The See-it lab (slides-steps, 11 Oct 2026): the twelve longest See its in the corpus, each drawn in the real Slides
 * frame at the card size, at 390 × 844 or 1280 × 800, with the step control, "Show every step" and "Step through again",
 * so the owner and the lead can look at the worst cases on one page. Static, noindex, linked from nowhere.
 */
export const metadata: Metadata = {
  title: "Lab · the twelve longest See its",
  robots: { index: false, follow: false, nocache: true },
};

export default function LabSeeItsPage() {
  const cases = labCases(12).map((c) => ({ ...c, href: labCardHref(c) }));
  return <LabIndex cases={cases} />;
}
