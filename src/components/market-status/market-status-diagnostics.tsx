"use client";

import {
  Braces,
  Code2,
  RefreshCw,
} from "lucide-react";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useMarketData,
} from "@/hooks/use-market-data";

import {
  useMultiTimeframeStatus,
} from "@/hooks/use-multi-timeframe-status";

import {
  cn,
} from "@/lib/cn";


export function MarketStatusDiagnostics() {
  const m1Query =
    useMarketData({
      symbol: "XAUUSDm",
      timeframe: "1m",
      refetchInterval: 10_000,
    });

  const mtfQuery =
    useMultiTimeframeStatus({
      symbol: "XAUUSDm",
      refetchInterval: 30_000,
    });

  const refreshing =
    m1Query.isFetching
    || mtfQuery.isFetching;

  const rawM1 =
    m1Query.data?.slice(
      -5,
    )
    ?? null;

  const rawMtf =
    mtfQuery.data
    ?? null;

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-[var(--accent)]" />

            <h2 className="font-semibold">
              Raw Market Data
            </h2>
          </div>

          <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
            Developer diagnostics for live M1 data and the complete cached OMI multi-timeframe context
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge tone="info">
            Developer only
          </StatusBadge>

          <button
            type="button"
            onClick={() => {
              void Promise.all([
                m1Query.refetch(),
                mtfQuery.refetch(),
              ]);
            }}
            disabled={
              refreshing
            }
            className="flex h-8 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-xs font-semibold text-[var(--foreground-muted)] disabled:opacity-60"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                refreshing
                  && "animate-spin",
              )}
            />

            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-2">

        {/* =====================================
            LIVE M1
        ===================================== */}

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--foreground-subtle)]">
              <Braces className="h-4 w-4" />

              GET /market-data?timeframe=1m
            </div>

            <StatusBadge
              tone={
                m1Query.isError
                  ? "warning"
                  : "success"
              }
            >
              {m1Query.isError
                ? "Unavailable"
                : "Live M1"}
            </StatusBadge>
          </div>

          <pre className="max-h-[620px] min-h-[280px] overflow-auto rounded-2xl border border-[var(--border)] bg-[#060a10] p-5 text-xs leading-6 text-[var(--foreground-muted)]">
            {m1Query.isError
              ? JSON.stringify(
                  {
                    status: "unavailable",
                    message:
                      "Live M1 market data is currently unavailable. This can be normal when the market is closed.",
                  },
                  null,
                  2,
                )
              : JSON.stringify(
                  rawM1,
                  null,
                  2,
                )}
          </pre>
        </div>

        {/* =====================================
            COMPLETE MTF
        ===================================== */}

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[var(--foreground-subtle)]">
              <Braces className="h-4 w-4" />

              GET /market-status/multi-timeframe
            </div>

            <StatusBadge
              tone={
                mtfQuery.isError
                  ? "warning"
                  : "accent"
              }
            >
              {mtfQuery.isError
                ? "Unavailable"
                : "M1 → H4"}
            </StatusBadge>
          </div>

          <pre className="max-h-[620px] min-h-[280px] overflow-auto rounded-2xl border border-[var(--border)] bg-[#060a10] p-5 text-xs leading-6 text-[var(--foreground-muted)]">
            {mtfQuery.isError
              ? JSON.stringify(
                  {
                    status: "unavailable",
                    message:
                      "OMI multi-timeframe context is currently unavailable.",
                  },
                  null,
                  2,
                )
              : JSON.stringify(
                  rawMtf,
                  null,
                  2,
                )}
          </pre>
        </div>
      </div>

      {/* =====================================
          MTF QUICK DIAGNOSTIC
      ===================================== */}

      {mtfQuery.data && (
        <div className="border-t border-[var(--border)] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
            Cached timeframe availability
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                label: "M1",
                data:
                  mtfQuery.data.timeframes["1m"],
              },
              {
                label: "M5",
                data:
                  mtfQuery.data.timeframes["5m"],
              },
              {
                label: "M15",
                data:
                  mtfQuery.data.timeframes["15m"],
              },
              {
                label: "H1",
                data:
                  mtfQuery.data.timeframes["1h"],
              },
              {
                label: "H4",
                data:
                  mtfQuery.data.timeframes["4h"],
              },
            ].map(
              (
                timeframe,
              ) => (
                <div
                  key={
                    timeframe.label
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">
                      {timeframe.label}
                    </p>

                    <StatusBadge
                      tone={
                        timeframe.data.available
                          ? "success"
                          : "warning"
                      }
                    >
                      {timeframe.data.available
                        ? "Ready"
                        : "Missing"}
                    </StatusBadge>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-[var(--foreground-muted)]">
                    <p>
                      Bias:{" "}
                      <span className="font-semibold text-[var(--foreground)]">
                        {timeframe.data.bias}
                      </span>
                    </p>

                    <p>
                      Structure:{" "}
                      <span className="font-semibold text-[var(--foreground)]">
                        {timeframe.data.structure}
                      </span>
                    </p>

                    <p>
                      Strength:{" "}
                      <span className="font-semibold text-[var(--foreground)]">
                        {(
                          timeframe.data.strength
                          * 100
                        ).toFixed(
                          1,
                        )}
                        %
                      </span>
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}