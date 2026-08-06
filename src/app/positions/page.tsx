import {
  BriefcaseBusiness,
  ShieldCheck,
} from "lucide-react";

import {
  PositionDiagnostics,
} from "@/components/positions/position-diagnostics";

import {
  PositionsTable,
} from "@/components/positions/positions-table";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function PositionsPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="Portfolio monitoring"
        title="Open Positions"
        description="Monitor every active OMI MT5 position, its protected trade levels, current movement and live profit."
        icon={BriefcaseBusiness}
        actions={
          <>
            <StatusBadge tone="success">
              Live monitoring
            </StatusBadge>

            <StatusBadge tone="accent">
              Read only
            </StatusBadge>
          </>
        }
      />

      <article className="mb-6 rounded-2xl border border-[color:rgba(217,164,65,0.24)] bg-[var(--accent-muted)] p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:rgba(217,164,65,0.28)] text-[var(--accent)]">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-[var(--accent)]">
              Backend-controlled position management
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              This page cannot close, modify or create MT5 positions.
              Smart trailing, Dynamic TP and AI Exit continue exclusively
              inside the OMI backend.
            </p>
          </div>
        </div>
      </article>

      <div className="space-y-6">
        <PositionsTable />

        <PositionDiagnostics />
      </div>
    </div>
  );
}