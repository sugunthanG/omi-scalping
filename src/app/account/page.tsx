import {
  Landmark,
} from "lucide-react";

import {
  AccountDashboard,
} from "@/components/account/account-dashboard";

import {
  AccountDiagnostics,
} from "@/components/account/account-diagnostics";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function AccountPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="MT5 account monitoring"
        title="Trading Account"
        description="Monitor balance, equity, floating profit, margin health, leverage and broker account status."
        icon={Landmark}
        actions={
          <>
            <StatusBadge tone="success">
              MT5 connected
            </StatusBadge>

            <StatusBadge tone="accent">
              Live account
            </StatusBadge>
          </>
        }
      />

      <div className="space-y-6">
        <AccountDashboard />

        <AccountDiagnostics />
      </div>
    </div>
  );
}