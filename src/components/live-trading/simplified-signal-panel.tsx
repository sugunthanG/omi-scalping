"use client";

import {
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
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useLatestScalpingSignal,
} from "@/hooks/use-latest-scalping-signal";

import {
  cn,
} from "@/lib/cn";


function formatNumber(
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


function formatTimestamp(
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


export function SimplifiedSignalPanel() {
  const {
    data,
    isPending,
    isError,
    error,
  } = useLatestScalpingSignal();

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-52 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-medium">
              Loading OMI trading signal
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
              Trading information unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "Unable to load OMI trading information."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const signal =
    data?.data;

  if (!signal) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <CircleOff className="mx-auto h-8 w-8 text-[var(--foreground-subtle)]" />

        <h2 className="mt-4 font-semibold">
          No current signal
        </h2>

        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          OMI has not stored a new trading signal.
        </p>
      </section>
    );
  }

  const normalizedSignal =
    signal.signal.toUpperCase();

  const SignalIcon =
    normalizedSignal === "BUY"
      ? TrendingUp
      : normalizedSignal === "SELL"
        ? TrendingDown
        : CircleOff;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Current Signal
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
              className="h-full rounded-full bg-[var(--info)]"
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
                XAUUSD Price
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {formatNumber(
                  signal.price,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 text-[var(--accent)]">
              {normalizedSignal === "BUY" ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : normalizedSignal === "SELL" ? (
                <ArrowDownRight className="h-5 w-5" />
              ) : (
                <Target className="h-5 w-5" />
              )}
            </div>
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            {signal.symbol ?? "XAUUSD"}
          </p>
        </article>
      </div>

      <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--accent)]" />

            <h2 className="font-semibold">
              Trade Plan
            </h2>
          </div>

          <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
            Latest useful trade information produced by OMI
          </p>
        </div>

        <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Entry",
              value: formatNumber(
                signal.entry,
              ),
            },
            {
              label: "Stop Loss",
              value: formatNumber(
                signal.sl,
              ),
            },
            {
              label: "Take Profit",
              value: formatNumber(
                signal.tp,
              ),
            },
            {
              label: "Execution",
              value:
                signal.status,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[var(--surface)] p-5"
            >
              <p className="text-sm text-[var(--foreground-muted)]">
                {item.label}
              </p>

              <p className="mt-3 text-xl font-semibold">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </article>

      <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-xs text-[var(--foreground-subtle)]">
        <Clock3 className="h-4 w-4" />

        <span>
          Last OMI update:{" "}
          {formatTimestamp(
            signal.created_at,
          )}
        </span>
      </div>
    </section>
  );
}