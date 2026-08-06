import {
  Activity,
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


export default function ServiceHealthPage() {
  return (
    <RolePageGuard
      allowedRoles={[
        "DEVELOPER",
      ]}
    >
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          eyebrow="Backend service monitoring"
          title="Service Health"
          description="Monitor OMI FastAPI, MT5, scheduler, trade monitor, trailing, AI and learning services."
          icon={Activity}
          actions={
            <StatusBadge tone="info">
              Scientist only
            </StatusBadge>
          }
        />

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <h2 className="font-semibold">
            Detailed service API pending
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
            Basic backend health is already available. CPU, RAM, queue,
            scheduler and individual service state require a new protected
            FastAPI monitoring endpoint.
          </p>
        </section>
      </div>
    </RolePageGuard>
  );
}