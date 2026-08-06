"use client";

import {
  Braces,
  Code2,
} from "lucide-react";

import {
  PermissionGate,
} from "@/components/common/permission-gate";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useRecentScalpingSignals,
} from "@/hooks/use-recent-scalping-signals";


export function SignalHistoryDiagnostics() {
  const {
    data,
  } = useRecentScalpingSignals({
    limit: 100,
  });

  return (
    <PermissionGate
      permission="raw-api:view"
    >
      <section className="overflow-hidden rounded-3xl border border-[color:rgba(94,162,239,0.25)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[var(--info)]" />

              <h2 className="font-semibold">
                Raw Signal History
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Developer-only API response
            </p>
          </div>

          <StatusBadge tone="info">
            Developer only
          </StatusBadge>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center gap-2 text-xs text-[var(--foreground-subtle)]">
            <Braces className="h-4 w-4" />

            <span>
              GET /scalping-status/recent
            </span>
          </div>

          <pre className="max-h-[520px] overflow-auto rounded-2xl border border-[var(--border)] bg-[#060a10] p-5 text-xs leading-6 text-[var(--foreground-muted)]">
            {JSON.stringify(
              data ?? null,
              null,
              2,
            )}
          </pre>
        </div>
      </section>
    </PermissionGate>
  );
}