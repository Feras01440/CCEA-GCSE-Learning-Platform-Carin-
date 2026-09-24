import { PageHeader } from "@/components/shell/PageHeader";
import { ExamMap } from "@/components/map/ExamMap";

export default function MapPage() {
  return (
    <>
      <PageHeader eyebrow="Map" title="Exam map" lede="Your units on CCEA's dates, and what you have proved in each." />
      <ExamMap />
    </>
  );
}
