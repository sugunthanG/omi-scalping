import {
  Gauge,
} from "lucide-react";

import {
  MarketStatusDashboard,
} from "@/components/market-status/market-status-dashboard";

import {
  MarketStatusDiagnostics,
} from "@/components/market-status/market-status-diagnostics";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function MarketStatusPage() {

  return (
    <>
      <PageHeader
        eyebrow="XAUUSD market intelligence"
        title="Market Status"
        description="Monitor live XAUUSD execution data together with OMI analysis across M1, M5, M15, H1 and H4."
        icon={Gauge}
        actions={
          <>
            Tick Data

            <StatusBadge tone="info">
              M1 → H4
            </StatusBadge>
          </>
        }
      />

      <div className="space-y-6">

        <MarketStatusDashboard />

        <MarketStatusDiagnostics />

      </div>
    </>
  );
}