"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CircleOff,
  Clock3,
  Gauge,
  LoaderCircle,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  useLatestScalpingSignal,
} from "@/hooks/use-latest-scalping-signal";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  cn,
} from "@/lib/cn";

import type {
  ScalpingSignal,
} from "@/types/api";


function formatNumber(
  value: number | null,
  digits = 2,
): string {
  if (
    value === null
    || Number.isNaN(value)
  ) {
    return "—";
  }

  return value.toFixed(digits);
}


function formatTimestamp(
  value: string,
): string {
  const parsedDate = new Date(value);

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
  const normalizedSignal =
    signal.toUpperCase();

  if (normalizedSignal === "BUY") {
    return "success" as const;
  }

  if (normalizedSignal === "SELL") {
    return "danger" as const;
  }

  return "neutral" as const;
}


function getQualityTone(
  quality: string,
) {
  const normalizedQuality =
    quality.toUpperCase();

  if (normalizedQuality === "ELITE") {
    return "accent" as const;
  }

  if (normalizedQuality === "STRONG") {
    return "success" as const;
  }

  if (normalizedQuality === "GOOD") {
    return "warning" as const;
  }

  return "neutral" as const;
}


function getStatusTone(
  status: string,
) {
  const normalizedStatus =
    status.toUpperCase();

  if (normalizedStatus === "ACTIVE") {
    return "success" as const;
  }

  if (normalizedStatus === "BLOCKED") {
    return "warning" as const;
  }

  if (normalizedStatus === "FAILED") {
    return "danger" as const;
  }

  return "neutral" as const;
}


function SignalDirection({
  signal,
}: {
  signal: ScalpingSignal;
}) {
  const normalizedSignal =
    signal.signal.toUpperCase();

  const SignalIcon =
    normalizedSignal === "BUY"
      ? TrendingUp
      : normalizedSignal === "SELL"
        ? TrendingDown
        : CircleOff;

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--foreground-muted)]">
            Latest Signal
          </p>

          <p
            className={cn(
              "mt-3 text-3xl font-semibold",
              normalizedSignal === "BUY"
                ? "text-[var(--success)]"
                : normalizedSignal === "SELL"
                  ? "text-[var(--danger)]"
                  : "text-[var(--foreground)]",
            )}
          >
            {signal.signal}
          </p>
        </div>

        <div
          className={cn(
            "rounded-xl border p-2.5",
            normalizedSignal === "BUY"
              ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.08)] text-[var(--success)]"
              : normalizedSignal === "SELL"
                ? "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.08)] text-[var(--danger)]"
                : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)]",
          )}
        >
          <SignalIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge
          tone={getSignalTone(
            signal.signal,
          )}
        >
          {signal.signal}
        </StatusBadge>

        <StatusBadge
          tone={getStatusTone(
            signal.status,
          )}
        >
          {signal.status}
        </StatusBadge>
      </div>
    </article>
  );
}


export function LatestSignalPanel() {
  const {
    data,
    isPending,
    isError,
    error,
    dataUpdatedAt,
  } = useLatestScalpingSignal();

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-52 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-medium">
              Loading latest OMI signal
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
              Signal API unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "Unable to load the latest signal."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const signal = data?.data;

  if (!signal) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <CircleOff className="mx-auto h-8 w-8 text-[var(--foreground-subtle)]" />

        <h2 className="mt-4 font-semibold">
          No signal available
        </h2>

        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          OMI has not stored a scalping signal yet.
        </p>
      </section>
    );
  }

  const bullishEma =
    signal.ema20 !== null
    && signal.ema50 !== null
    && signal.ema20 > signal.ema50;

  const bearishEma =
    signal.ema20 !== null
    && signal.ema50 !== null
    && signal.ema20 < signal.ema50;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SignalDirection
          signal={signal}
        />

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Trade Quality
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {signal.trade_quality}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 text-[var(--accent)]">
              <BrainCircuit className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5">
            <StatusBadge
              tone={getQualityTone(
                signal.trade_quality,
              )}
            >
              {signal.trade_quality}
            </StatusBadge>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Confidence
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {signal.confidence !== null
                  ? `${signal.confidence}%`
                  : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 text-[var(--info)]">
              <Gauge className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--info)] transition-all"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    signal.confidence ?? 0,
                    100,
                  ),
                )}%`,
              }}
            />
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Market Price
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {formatNumber(
                  signal.price,
                  3,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 text-[var(--accent)]">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            {signal.symbol ?? "XAUUSD"}
          </p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <h2 className="font-semibold">
                Signal Intelligence
              </h2>

              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                Latest stored OMI decision data
              </p>
            </div>

            <StatusBadge
              tone={getStatusTone(
                signal.status,
              )}
            >
              {signal.status}
            </StatusBadge>
          </div>

          <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2">
            {[
              {
                label: "Buy impulse side",
                value:
                  signal.buy_score ?? 0,
                icon: ArrowUpRight,
                valueClass:
                  "text-[var(--success)]",
              },
              {
                label: "Sell impulse side",
                value:
                  signal.sell_score ?? 0,
                icon: ArrowDownRight,
                valueClass:
                  "text-[var(--danger)]",
              },
              {
                label: "Momentum",
                value: formatNumber(
                  signal.momentum,
                  3,
                ),
                icon: Activity,
                valueClass:
                  "text-[var(--foreground)]",
              },
              {
                label: "RSI",
                value: formatNumber(
                  signal.rsi,
                  2,
                ),
                icon: Gauge,
                valueClass:
                  "text-[var(--foreground)]",
              },
              {
                label: "EMA20",
                value: formatNumber(
                  signal.ema20,
                  3,
                ),
                icon: bullishEma
                  ? TrendingUp
                  : Activity,
                valueClass:
                  bullishEma
                    ? "text-[var(--success)]"
                    : "text-[var(--foreground)]",
              },
              {
                label: "EMA50",
                value: formatNumber(
                  signal.ema50,
                  3,
                ),
                icon: bearishEma
                  ? TrendingDown
                  : Activity,
                valueClass:
                  bearishEma
                    ? "text-[var(--danger)]"
                    : "text-[var(--foreground)]",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="bg-[var(--surface)] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {item.label}
                    </p>

                    <Icon className="h-4 w-4 text-[var(--foreground-subtle)]" />
                  </div>

                  <p
                    className={cn(
                      "mt-3 text-xl font-semibold",
                      item.valueClass,
                    )}
                  >
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                Trade Levels
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Stored backend entry plan
            </p>
          </div>

          <div className="space-y-3 p-5">
            {[
              {
                label: "Entry",
                value: formatNumber(
                  signal.entry,
                  3,
                ),
              },
              {
                label: "Stop Loss",
                value: formatNumber(
                  signal.sl,
                  3,
                ),
              },
              {
                label: "Take Profit",
                value: formatNumber(
                  signal.tp,
                  3,
                ),
              },
              {
                label: "Lot Size",
                value: formatNumber(
                  signal.lot,
                  2,
                ),
              },
              {
                label: "MT5 Ticket",
                value:
                  signal.mt5_ticket
                  ?? "Not executed",
              },
              {
                label: "Bridge Status",
                value:
                  signal.bridge_status
                  ?? "Unknown",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
              >
                <p className="text-sm text-[var(--foreground-muted)]">
                  {item.label}
                </p>

                <p className="text-sm font-semibold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-xs text-[var(--foreground-subtle)] sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />

          <span>
            Signal created:{" "}
            {formatTimestamp(
              signal.created_at,
            )}
          </span>
        </div>

        <span>
          Frontend refreshed:{" "}
          {dataUpdatedAt > 0
            ? new Date(
                dataUpdatedAt,
              ).toLocaleTimeString()
            : "Not available"}
        </span>
      </div>
    </section>
  );
}