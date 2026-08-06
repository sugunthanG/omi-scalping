import {
  LayoutDashboard,
} from "lucide-react";

import {
  MainDashboard,
} from "@/components/dashboard/main-dashboard";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1800px]">
      <PageHeader
        eyebrow="Institutional overview"
        title="OMI Dashboard"
        description="Monitor your MT5 account, current AI signal, active positions, trading performance and backend-enforced risk protection."
        icon={LayoutDashboard}
        actions={
          <>
            <StatusBadge tone="success">
              Live monitoring
            </StatusBadge>

            <StatusBadge tone="accent">
              XAUUSD intelligence
            </StatusBadge>
          </>
        }
      />

      <MainDashboard />
    </div>
  );
}