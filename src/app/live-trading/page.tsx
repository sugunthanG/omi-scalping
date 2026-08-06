import {
  ChartCandlestick,
} from "lucide-react";

import {
  InstitutionalTradingTerminal,
} from "@/components/live-trading/institutional-trading-terminal";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function LiveTradingPage() {
  return (
    <div className="mx-auto max-w-[1900px]">
      <PageHeader
        eyebrow="Institutional trading terminal"
        title="Live Trading"
        description="Monitor OMI market intelligence, live signals, protected trade levels and active MT5 positions."
        icon={ChartCandlestick}
        actions={
          <>
            <StatusBadge tone="success">
              Monitoring active
            </StatusBadge>

            <StatusBadge tone="accent">
              XAUUSD M1
            </StatusBadge>
          </>
        }
      />

      <InstitutionalTradingTerminal />
    </div>
  );
}