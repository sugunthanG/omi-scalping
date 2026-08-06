import {
  Settings,
} from "lucide-react";

import {
  SettingsDashboard,
} from "@/components/settings/settings-dashboard";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Personal preferences"
        title="Settings"
        description="Configure your local OMI interface, landing page, motion and notification preferences."
        icon={Settings}
        actions={
          <>
            <StatusBadge tone="success">
              Local persistence
            </StatusBadge>

            <StatusBadge tone="accent">
              Personal settings
            </StatusBadge>
          </>
        }
      />

      <SettingsDashboard />
    </div>
  );
}