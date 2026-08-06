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
    <div className="mx-auto max-w-[1800px]">
      <PageHeader
        eyebrow="XAUUSD market intelligence"
        title="Market Status"
        description="Monitor live bid and ask prices, spread, volatility, tick pressure, M1 and M5 direction, market-data freshness and OMI session rules."
        icon={Gauge}
        actions={
          <>
            <StatusBadge tone="success">
              Tick data
            </StatusBadge>

            <StatusBadge tone="accent">
              M1 / M5
            </StatusBadge>
          </>
        }
      />

      <div className="space-y-6">
        <MarketStatusDashboard />

        <MarketStatusDiagnostics />
      </div>
    </div>
  );
}