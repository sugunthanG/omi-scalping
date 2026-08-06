import {
  TerminalSquare,
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


export default function SystemLogsPage() {
  return (
    <RolePageGuard
      allowedRoles={[
        "DEVELOPER",
      ]}
    >
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          eyebrow="Protected technical visibility"
          title="System Logs"
          description="Review OMI signal, execution, trailing, Dynamic TP, exit and learning logs."
          icon={TerminalSquare}
          actions={
            <StatusBadge tone="info">
              Scientist only
            </StatusBadge>
          }
        />

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <h2 className="font-semibold">
            Log API pending
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
            The route is now available and protected. The backend does not
            currently expose a safe logs endpoint, so no fabricated logs are
            displayed.
          </p>
        </section>
      </div>
    </RolePageGuard>
  );
}