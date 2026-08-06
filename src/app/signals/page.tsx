import {
  ListChecks,
} from "lucide-react";

import {
  SignalHistoryDashboard,
} from "@/components/signals/signal-history-dashboard";

import {
  SignalHistoryDiagnostics,
} from "@/components/signals/signal-history-diagnostics";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function SignalHistoryPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="AI signal analytics"
        title="Signal History"
        description="Review recent OMI BUY, SELL and WAIT signals, their quality, confidence, status and protected trade levels."
        icon={ListChecks}
        actions={
          <>
            <StatusBadge tone="success">
              Live history
            </StatusBadge>

            <StatusBadge tone="accent">
              Read only
            </StatusBadge>
          </>
        }
      />

      <div className="space-y-6">
        <SignalHistoryDashboard />

        <SignalHistoryDiagnostics />
      </div>
    </div>
  );
}