import { PageHeader } from "@/components/shell/PageHeader";
import { ReviewInbox } from "@/components/review/ReviewInbox";

export default function ReviewPage() {
  return (
    <>
      <PageHeader eyebrow="Review" title="Tonight" lede="Questions to try again, and ones you answered without being sure, back before you forget them." />
      <ReviewInbox />
    </>
  );
}
