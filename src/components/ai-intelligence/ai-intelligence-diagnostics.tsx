"use client";

import {
  Braces,
  Code2,
} from "lucide-react";

import { PermissionGate } from "@/components/common/permission-gate";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLatestScalpingSignal } from "@/hooks/use-latest-scalping-signal";
import { useRecentScalpingSignals } from "@/hooks/use-recent-scalping-signals";

export function AiIntelligenceDiagnostics() {
  const latestQuery =
    useLatestScalpingSignal();

  const recentQuery =
    useRecentScalpingSignals({
      limit: 20,
    });

  return (
    <PermissionGate permission="raw-api:view">
      <section className="overflow-hidden rounded-3xl border border-[color:rgba(94,162,239,0.25)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[var(--info)]" />

              <h2 className="font-semibold">
                Raw AI Responses
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Developer-only stored signal payloads
            </p>
          </div>

          <StatusBadge tone="info">
            Developer only
          </StatusBadge>
        </div>

        <div className="grid gap-5 p-5 xl:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-[var(--foreground-subtle)]">
              <Braces className="h-4 w-4" />

              GET /scalping-status/latest
            </div>

            <pre className="max-h-[520px] overflow-auto rounded-2xl border border-[var(--border)] bg-[#060a10] p-5 text-xs leading-6 text-[var(--foreground-muted)]">
              {JSON.stringify(
                latestQuery.data ?? null,
                null,
                2,
              )}
            </pre>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-[var(--foreground-subtle)]">
              <Braces className="h-4 w-4" />

              GET /scalping-status/recent
            </div>

            <pre className="max-h-[520px] overflow-auto rounded-2xl border border-[var(--border)] bg-[#060a10] p-5 text-xs leading-6 text-[var(--foreground-muted)]">
              {JSON.stringify(
                recentQuery.data ?? null,
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </section>
    </PermissionGate>
  );
}