import { PageHeader } from "@/components/shell/PageHeader";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Settings" lede="Appearance and your exam plan. Everything is stored on this device." />
      <SettingsPanel />
    </>
  );
}
