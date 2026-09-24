import { PageHeader } from "@/components/shell/PageHeader";
import { LedgerView } from "@/components/ledger/LedgerView";

export default function LedgerPage() {
  return (
    <>
      <PageHeader eyebrow="Ledger" title="Mark ledger" lede="Every lost mark, tagged the way an examiner would tag it." />
      <LedgerView />
    </>
  );
}
