"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CircleOff,
  Filter,
  Gauge,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Target,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useRecentScalpingSignals,
} from "@/hooks/use-recent-scalping-signals";

import {
  cn,
} from "@/lib/cn";

import type {
  ScalpingSignal,
} from "@/types/api";


type SignalFilter =
  | "ALL"
  | "BUY"
  | "SELL"
  | "WAIT";


const signalFilters: SignalFilter[] = [
  "ALL",
  "BUY",
  "SELL",
  "WAIT",
];


function formatPrice(
  value: number | null,
  digits = 3,
): string {
  if (
    value === null
    || Number.isNaN(value)
  ) {
    return "—";
  }

  return value.toFixed(
    digits,
  );
}


function formatDateTime(
  value: string,
): string {
  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value;
  }

  return parsedDate.toLocaleString();
}


function getSignalTone(
  signal: string,
) {
  const normalized =
    signal.toUpperCase();

  if (normalized === "BUY") {
    return "success" as const;
  }

  if (normalized === "SELL") {
    return "danger" as const;
  }

  return "neutral" as const;
}


function getQualityTone(
  quality: string,
) {
  const normalized =
    quality.toUpperCase();

  if (normalized === "ELITE") {
    return "accent" as const;
  }

  if (normalized === "STRONG") {
    return "success" as const;
  }

  if (normalized === "GOOD") {
    return "warning" as const;
  }

  return "neutral" as const;
}


function getStatusTone(
  status: string,
) {
  const normalized =
    status.toUpperCase();

  if (normalized === "ACTIVE") {
    return "success" as const;
  }

  if (normalized === "BLOCKED") {
    return "warning" as const;
  }

  if (normalized === "FAILED") {
    return "danger" as const;
  }

  return "neutral" as const;
}


function countSignals(
  signals: ScalpingSignal[],
  direction: string,
): number {
  return signals.filter(
    (signal) =>
      signal.signal.toUpperCase()
      === direction,
  ).length;
}


export function SignalHistoryDashboard() {
  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<SignalFilter>(
    "ALL",
  );

  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useRecentScalpingSignals({
    limit: 200,
  });

  const signals =
    data?.data ?? [];

  const filteredSignals =
    useMemo(
      () => {
        if (
          selectedFilter
          === "ALL"
        ) {
          return signals;
        }

        return signals.filter(
          (signal) =>
            signal.signal.toUpperCase()
            === selectedFilter,
        );
      },
      [
        selectedFilter,
        signals,
      ],
    );

  const buyCount =
    countSignals(
      signals,
      "BUY",
    );

  const sellCount =
    countSignals(
      signals,
      "SELL",
    );

  const waitCount =
    countSignals(
      signals,
      "WAIT",
    );

  const executedCount =
    signals.filter(
      (signal) =>
        signal.status.toUpperCase()
        === "ACTIVE"
        || signal.mt5_ticket !== null,
    ).length;

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-72 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-medium">
              Loading OMI signal history
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)] p-6">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />

          <div>
            <h2 className="font-semibold text-[var(--danger)]">
              Signal history unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "Unable to load recent OMI signals."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--foreground-muted)]">
            Total Signals
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {signals.length}
          </p>

          <BrainCircuit className="mt-5 h-5 w-5 text-[var(--accent)]" />
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--foreground-muted)]">
            BUY Signals
          </p>

          <p className="mt-3 text-2xl font-semibold text-[var(--success)]">
            {buyCount}
          </p>

          <ArrowUpRight className="mt-5 h-5 w-5 text-[var(--success)]" />
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--foreground-muted)]">
            SELL Signals
          </p>

          <p className="mt-3 text-2xl font-semibold text-[var(--danger)]">
            {sellCount}
          </p>

          <ArrowDownRight className="mt-5 h-5 w-5 text-[var(--danger)]" />
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--foreground-muted)]">
            Executed Signals
          </p>

          <p className="mt-3 text-2xl font-semibold text-[var(--info)]">
            {executedCount}
          </p>

          <Target className="mt-5 h-5 w-5 text-[var(--info)]" />
        </article>
      </section>

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-[var(--accent)]" />

          <div>
            <p className="text-sm font-semibold">
              Signal filter
            </p>

            <p className="text-xs text-[var(--foreground-subtle)]">
              WAIT signals available: {waitCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {signalFilters.map(
            (filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setSelectedFilter(
                    filter,
                  );
                }}
                className={cn(
                  "h-9 rounded-lg border px-3 text-xs font-semibold transition",
                  selectedFilter === filter
                    ? "border-[color:rgba(217,164,65,0.32)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                )}
              >
                {filter}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            disabled={isFetching}
            className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-xs font-semibold text-[var(--foreground-muted)]"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                isFetching
                  && "animate-spin",
              )}
            />

            Refresh
          </button>
        </div>
      </section>

      {filteredSignals.length === 0 ? (
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <CircleOff className="mx-auto h-10 w-10 text-[var(--foreground-subtle)]" />

          <h2 className="mt-4 text-lg font-semibold">
            No matching signals
          </h2>

          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            No OMI signals match the selected filter.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <h2 className="font-semibold">
                Recent OMI Signals
              </h2>

              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                Newest signal first
              </p>
            </div>

            <StatusBadge tone="info">
              {filteredSignals.length} records
            </StatusBadge>
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
                  {[
                    "Created",
                    "Symbol",
                    "Signal",
                    "Quality",
                    "Status",
                    "Confidence",
                    "Price",
                    "Entry",
                    "Stop Loss",
                    "Take Profit",
                  ].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredSignals.map(
                  (signal) => (
                    <tr
                      key={signal.id}
                      className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-elevated)]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm">
                        {formatDateTime(
                          signal.created_at,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold">
                        {signal.symbol
                          ?? "XAUUSD"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          tone={getSignalTone(
                            signal.signal,
                          )}
                        >
                          {signal.signal}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          tone={getQualityTone(
                            signal.trade_quality,
                          )}
                        >
                          {signal.trade_quality}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          tone={getStatusTone(
                            signal.status,
                          )}
                        >
                          {signal.status}
                        </StatusBadge>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {signal.confidence !== null
                          ? `${signal.confidence}%`
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold">
                        {formatPrice(
                          signal.price,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {formatPrice(
                          signal.entry,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--danger)]">
                        {formatPrice(
                          signal.sl,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--success)]">
                        {formatPrice(
                          signal.tp,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 p-4 lg:hidden">
            {filteredSignals.map(
              (signal) => (
                <article
                  key={signal.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {signal.symbol
                          ?? "XAUUSD"}
                      </p>

                      <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                        {formatDateTime(
                          signal.created_at,
                        )}
                      </p>
                    </div>

                    <StatusBadge
                      tone={getSignalTone(
                        signal.signal,
                      )}
                    >
                      {signal.signal}
                    </StatusBadge>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Quality
                      </p>

                      <p className="mt-1 font-semibold">
                        {signal.trade_quality}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Confidence
                      </p>

                      <p className="mt-1 font-semibold">
                        {signal.confidence !== null
                          ? `${signal.confidence}%`
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Entry
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatPrice(
                          signal.entry,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Status
                      </p>

                      <p className="mt-1 font-semibold">
                        {signal.status}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}