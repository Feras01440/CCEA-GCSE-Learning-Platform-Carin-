import { PageHeader } from "@/components/shell/PageHeader";
import { DateLine } from "@/components/shell/DateLine";
import { TodayTiles } from "@/components/home/TodayTiles";

export default function TodayPage() {
  return (
    <>
      <PageHeader eyebrow={<DateLine />} title="Today" />
      <TodayTiles />
    </>
  );
}
