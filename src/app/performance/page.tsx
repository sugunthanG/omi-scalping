import {
  BarChart3,
} from "lucide-react";

import {
  PerformanceDashboard,
} from "@/components/performance/performance-dashboard";

import {
  PerformanceDiagnostics,
} from "@/components/performance/performance-diagnostics";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function PerformancePage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Trading analytics"
        title="Performance Dashboard"
        description="Measure OMI profitability, drawdown, win rate, profit factor, account progression and daily trading outcomes."
        icon={BarChart3}
        actions={
          <>
            <StatusBadge tone="success">
              MT5 analytics
            </StatusBadge>

            <StatusBadge tone="accent">
              Read only
            </StatusBadge>
          </>
        }
      />

      <div className="space-y-6">
        <PerformanceDashboard />

        <PerformanceDiagnostics />
      </div>
    </div>
  );
}