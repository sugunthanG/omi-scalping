"use client";

import {
  Activity,
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
  PermissionGate,
} from "@/components/common/permission-gate";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useLatestScalpingSignal,
} from "@/hooks/use-latest-scalping-signal";

import {
  cn,
} from "@/lib/cn";


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


function calculateSignalAge(
  value: string,
): string {
  const createdAt =
    new Date(value).getTime();

  if (
    Number.isNaN(createdAt)
  ) {
    return "Unknown";
  }

  const ageSeconds =
    Math.max(
      0,
      Math.floor(
        (
          Date.now()
          - createdAt
        ) / 1000,
      ),
    );

  if (ageSeconds < 60) {
    return `${ageSeconds}s ago`;
  }

  const ageMinutes =
    Math.floor(
      ageSeconds / 60,
    );

  if (ageMinutes < 60) {
    return `${ageMinutes}m ago`;
  }

  const ageHours =
    Math.floor(
      ageMinutes / 60,
    );

  if (ageHours < 24) {
    return `${ageHours}h ago`;
  }

  const ageDays =
    Math.floor(
      ageHours / 24,
    );

  return `${ageDays}d ago`;
}


function calculateRiskReward(
  direction: string,
  entry: number | null,
  sl: number | null,
  tp: number | null,
): string {
  if (
    entry === null
    || sl === null
    || tp === null
  ) {
    return "—";
  }

  const normalizedDirection =
    direction.toUpperCase();

  let risk: number;
  let reward: number;

  if (
    normalizedDirection === "BUY"
  ) {
    risk =
      entry - sl;

    reward =
      tp - entry;
  } else if (
    normalizedDirection === "SELL"
  ) {
    risk =
      sl - entry;

    reward =
      entry - tp;
  } else {
    return "—";
  }

  if (
    risk <= 0
    || reward <= 0
  ) {
    return "—";
  }

  return `1:${(
    reward / risk
  ).toFixed(2)}`;
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

  if (
    normalized === "ACTIVE"
    || normalized === "SUCCESS"
  ) {
    return "success" as const;
  }

  if (
    normalized === "BLOCKED"
    || normalized === "IGNORED"
  ) {
    return "warning" as const;
  }

  if (
    normalized === "FAILED"
    || normalized === "ERROR"
  ) {
    return "danger" as const;
  }

  return "neutral" as const;
}


export function TerminalSignalCard() {
  const {
    data,
    isPending,
    isError,
    error,
  } = useLatestScalpingSignal();

  if (isPending) {
    return (
      <aside className="flex min-h-[590px] items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" />

          <p className="mt-4 font-semibold">
            Loading OMI signal
          </p>

          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Reading latest AI decision
          </p>
        </div>
      </aside>
    );
  }

  if (
    isError
    || !data?.data
  ) {
    return (
      <aside className="min-h-[590px] rounded-3xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)] p-6">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />

          <div>
            <h2 className="font-semibold text-[var(--danger)]">
              Signal unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "No latest OMI signal is available."}
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const signal =
    data.data;

  const signalTimestamp =
    new Date(
      signal.created_at,
    ).getTime();

  const signalAgeSeconds =
    Number.isNaN(
      signalTimestamp,
    )
      ? Number.POSITIVE_INFINITY
      : Math.max(
          0,
          Math.floor(
            (
              Date.now()
              - signalTimestamp
            ) / 1000,
          ),
        );

  const isSignalStale =
    signalAgeSeconds > 120;

  const isSignalExpired =
    signalAgeSeconds > 900;

  const storedSignal =
    signal.signal.toUpperCase();

  const normalizedSignal =
    isSignalExpired
      ? "WAIT"
      : storedSignal;

  const SignalIcon =
    normalizedSignal === "BUY"
      ? TrendingUp
      : normalizedSignal === "SELL"
        ? TrendingDown
        : CircleOff;

  const riskReward =
    calculateRiskReward(
      storedSignal,
      signal.entry,
      signal.sl,
      signal.tp,
    );

  return (
    <aside className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground-subtle)]">
              OMI AI signal
            </p>

            <h2 className="mt-1 font-semibold">
              Trading Decision
            </h2>
          </div>

          <StatusBadge
            tone={
              isSignalExpired
                ? "danger"
                : isSignalStale
                  ? "warning"
                  : getStatusTone(
                      signal.status,
                    )
            }
          >
            {isSignalExpired
              ? "EXPIRED"
              : isSignalStale
                ? "STALE"
                : signal.status}
          </StatusBadge>
        </div>
      </div>

      <div className="p-5">
        <div
          className={cn(
            "rounded-2xl border p-5",
            normalizedSignal === "BUY"
              ? "border-[color:rgba(50,196,141,0.28)] bg-[color:rgba(50,196,141,0.07)]"
              : normalizedSignal === "SELL"
                ? "border-[color:rgba(239,98,98,0.28)] bg-[color:rgba(239,98,98,0.07)]"
                : "border-[var(--border)] bg-[var(--surface-elevated)]",
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                Current decision
              </p>

              <p
                className={cn(
                  "mt-3 text-5xl font-bold tracking-tight",
                  normalizedSignal === "BUY"
                    ? "text-[var(--success)]"
                    : normalizedSignal === "SELL"
                      ? "text-[var(--danger)]"
                      : "text-[var(--foreground)]",
                )}
              >
                {isSignalExpired
                  ? "WAIT"
                  : signal.signal}
              </p>
            </div>

            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl border",
                normalizedSignal === "BUY"
                  ? "border-[color:rgba(50,196,141,0.28)] text-[var(--success)]"
                  : normalizedSignal === "SELL"
                    ? "border-[color:rgba(239,98,98,0.28)] text-[var(--danger)]"
                    : "border-[var(--border)] text-[var(--foreground-muted)]",
              )}
            >
              <SignalIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge
              tone={
                isSignalExpired
                  ? "neutral"
                  : getSignalTone(
                      signal.signal,
                    )
              }
            >
              {isSignalExpired
                ? "WAIT"
                : signal.signal}
            </StatusBadge>

            <StatusBadge
              tone={getQualityTone(
                signal.trade_quality,
              )}
            >
              {signal.trade_quality}
            </StatusBadge>
          </div>
        </div>

        {isSignalStale ? (
          <div
            className={cn(
              "mt-4 rounded-xl border px-4 py-3",
              isSignalExpired
                ? "border-[color:rgba(239,98,98,0.28)] bg-[color:rgba(239,98,98,0.07)]"
                : "border-[color:rgba(241,185,76,0.28)] bg-[color:rgba(241,185,76,0.07)]",
            )}
          >
            <p
              className={cn(
                "text-sm font-semibold",
                isSignalExpired
                  ? "text-[var(--danger)]"
                  : "text-[var(--warning)]",
              )}
            >
              {isSignalExpired
                ? "Stored signal expired"
                : "Stored signal is stale"}
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
              OMI has not stored a fresh M1 signal yet. This historical
              signal is shown only for reference and must not be treated
              as an active trading instruction.
            </p>
          </div>
        ) : null}

        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[var(--info)]" />

              <p className="text-sm text-[var(--foreground-muted)]">
                Confidence
              </p>
            </div>

            <p className="font-semibold">
              {signal.confidence !== null
                ? `${signal.confidence}%`
                : "—"}
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--info)] transition-all duration-500"
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
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--accent)]" />

            <p className="text-sm font-semibold">
              Trade Plan
            </p>
          </div>

          <div className="space-y-2">
            {[
              {
                label: "Market Price",
                value: formatPrice(
                  signal.price,
                ),
              },
              {
                label: "Entry",
                value:
                  isSignalExpired
                    ? "Expired"
                    : formatPrice(
                        signal.entry,
                      ),
              },
              {
                label: "Stop Loss",
                value:
                  isSignalExpired
                    ? "Expired"
                    : formatPrice(
                        signal.sl,
                      ),
                valueClass:
                  isSignalExpired
                    ? "text-[var(--foreground-subtle)]"
                    : "text-[var(--danger)]",
              },
              {
                label: "Take Profit",
                value:
                  isSignalExpired
                    ? "Expired"
                    : formatPrice(
                        signal.tp,
                      ),
                valueClass:
                  isSignalExpired
                    ? "text-[var(--foreground-subtle)]"
                    : "text-[var(--success)]",
              },
              {
                label: "Risk / Reward",
                value:
                  isSignalExpired
                    ? "Expired"
                    : riskReward,
                valueClass:
                  isSignalExpired
                    ? "text-[var(--foreground-subtle)]"
                    : "text-[var(--accent)]",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
              >
                <p className="text-sm text-[var(--foreground-muted)]">
                  {item.label}
                </p>

                <p
                  className={cn(
                    "text-sm font-semibold",
                    item.valueClass,
                  )}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[var(--foreground-subtle)]" />

            <div>
              <p className="text-xs text-[var(--foreground-subtle)]">
                Signal age
              </p>

              <p
                className={cn(
                  "mt-1 text-sm font-semibold",
                  isSignalExpired
                    ? "text-[var(--danger)]"
                    : isSignalStale
                      ? "text-[var(--warning)]"
                      : "text-[var(--foreground)]",
                )}
              >
                {calculateSignalAge(
                  signal.created_at,
                )}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-[var(--foreground-subtle)]">
            {formatDateTime(
              signal.created_at,
            )}
          </p>
        </div>

        <PermissionGate
          permission="raw-market-data:view"
        >
          <div className="mt-5 rounded-2xl border border-[color:rgba(94,162,239,0.24)] bg-[color:rgba(94,162,239,0.05)] p-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-[var(--info)]" />

              <p className="text-sm font-semibold text-[var(--info)]">
                Developer Indicators
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                {
                  label: "EMA20",
                  value: formatPrice(
                    signal.ema20,
                  ),
                },
                {
                  label: "EMA50",
                  value: formatPrice(
                    signal.ema50,
                  ),
                },
                {
                  label: "RSI",
                  value:
                    signal.rsi !== null
                      ? signal.rsi.toFixed(2)
                      : "—",
                },
                {
                  label: "Momentum",
                  value:
                    signal.momentum !== null
                      ? signal.momentum.toFixed(3)
                      : "—",
                },
                {
                  label: "BUY side",
                  value:
                    signal.buy_score
                    ?? "—",
                },
                {
                  label: "SELL side",
                  value:
                    signal.sell_score
                    ?? "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                    {item.label}
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--foreground-subtle)]">
              <Activity className="h-3.5 w-3.5" />

              Internal indicator values
            </div>
          </div>
        </PermissionGate>
      </div>
    </aside>
  );
}