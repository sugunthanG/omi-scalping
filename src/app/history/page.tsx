import {
  History,
} from "lucide-react";

import {
  HistoryDiagnostics,
} from "@/components/history/history-diagnostics";

import {
  TradeHistoryDashboard,
} from "@/components/history/trade-history-dashboard";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function TradeHistoryPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Closed trade analytics"
        title="Trade History"
        description="Review completed OMI trades, profitability, win rate and trading outcomes across selected periods."
        icon={History}
        actions={
          <>
            <StatusBadge tone="success">
              MT5 history
            </StatusBadge>

            <StatusBadge tone="accent">
              Read only
            </StatusBadge>
          </>
        }
      />

      <div className="space-y-6">
        <TradeHistoryDashboard />

        <HistoryDiagnostics />
      </div>
    </div>
  );
}