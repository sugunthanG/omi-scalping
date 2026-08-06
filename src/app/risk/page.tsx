import {
  ShieldCheck,
} from "lucide-react";

import {
  RiskDashboard,
} from "@/components/risk/risk-dashboard";

import {
  RiskDiagnostics,
} from "@/components/risk/risk-diagnostics";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function RiskPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Capital protection"
        title="Risk Dashboard"
        description="Monitor OMI daily exposure, loss protection, execution cooldowns, grouped entries and current risk status."
        icon={ShieldCheck}
        actions={
          <>
            <StatusBadge tone="success">
              Backend enforced
            </StatusBadge>

            <StatusBadge tone="accent">
              Live monitoring
            </StatusBadge>
          </>
        }
      />

      <div className="space-y-6">
        <RiskDashboard />

        <RiskDiagnostics />
      </div>
    </div>
  );
}