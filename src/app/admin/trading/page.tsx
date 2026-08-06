import {
  SlidersHorizontal,
} from "lucide-react";

import {
  RolePageGuard,
} from "@/components/auth/role-page-guard";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function AdminTradingSettingsPage() {
  return (
    <RolePageGuard
      allowedRoles={[
        "ADMIN",
      ]}
    >
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          eyebrow="Protected financial controls"
          title="Trading Settings"
          description="Manage lot size and protected financial risk configuration."
          icon={SlidersHorizontal}
          actions={
            <>
              <StatusBadge tone="accent">
                Admin only
              </StatusBadge>

              <StatusBadge tone="warning">
                Financial controls
              </StatusBadge>
            </>
          }
        />

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <h2 className="font-semibold">
            Admin edit API required
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
            ADMIN is authorized to edit lot size and financial risk limits.
            The existing backend only exposes GET endpoints, so saving changes
            is intentionally disabled until authenticated update endpoints are
            added.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
              <p className="text-sm text-[var(--foreground-muted)]">
                Lot size
              </p>

              <p className="mt-3 font-semibold">
                Admin editable after API connection
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
              <p className="text-sm text-[var(--foreground-muted)]">
                Financial risk limits
              </p>

              <p className="mt-3 font-semibold">
                Admin editable after API connection
              </p>
            </div>
          </div>
        </section>
      </div>
    </RolePageGuard>
  );
}