import { PageHeader } from "@/components/shell/PageHeader";
import { ReviewInbox } from "@/components/review/ReviewInbox";

export default function ReviewPage() {
  return (
    <>
      <PageHeader eyebrow="Review" title="Tonight" lede="What you got wrong, or right without confidence, back before you forget it." />
      <ReviewInbox />
    </>
  );
}
