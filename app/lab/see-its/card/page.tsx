import type { Metadata } from "next";
import { LabCard } from "./LabCard";

/** One See it in the Slides frame; the hash names it (see ../cases.ts labCardHref). Static, noindex. */
export const metadata: Metadata = {
  title: "Lab · a See it",
  robots: { index: false, follow: false, nocache: true },
};

export default function LabCardPage() {
  return <LabCard />;
}
