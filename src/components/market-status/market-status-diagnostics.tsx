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
  useMarketData,
} from "@/hooks/use-market-data";


export function MarketStatusDiagnostics() {
  const m1Query =
    useMarketData({
      symbol: "XAUUSDm",
      timeframe: "1m",
      refetchInterval: 10_000,
    });

  const m5Query =
    useMarketData({
      symbol: "XAUUSDm",
      timeframe: "5m",
      refetchInterval: 20_000,
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
                Raw Market Data
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Developer-only latest M1 and M5 candle payloads
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

              GET /market-data?timeframe=1m
            </div>

            <pre className="max-h-[540px] overflow-auto rounded-2xl border border-[var(--border)] bg-[#060a10] p-5 text-xs leading-6 text-[var(--foreground-muted)]">
              {JSON.stringify(
                m1Query.data?.slice(-5)
                ?? null,
                null,
                2,
              )}
            </pre>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-[var(--foreground-subtle)]">
              <Braces className="h-4 w-4" />

              GET /market-data?timeframe=5m
            </div>

            <pre className="max-h-[540px] overflow-auto rounded-2xl border border-[var(--border)] bg-[#060a10] p-5 text-xs leading-6 text-[var(--foreground-muted)]">
              {JSON.stringify(
                m5Query.data?.slice(-5)
                ?? null,
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