"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  CircleOff,
  Clock3,
  Gauge,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";

import { PermissionGate } from "@/components/common/permission-gate";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLatestScalpingSignal } from "@/hooks/use-latest-scalping-signal";
import { useRecentScalpingSignals } from "@/hooks/use-recent-scalping-signals";
import { cn } from "@/lib/cn";

function getSignalAgeSeconds(
  createdAt: string,
): number {
  const timestamp =
    new Date(createdAt).getTime();

  if (Number.isNaN(timestamp)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(
    0,
    Math.floor(
      (Date.now() - timestamp) / 1000,
    ),
  );
}

function formatAge(
  createdAt: string,
): string {
  const seconds =
    getSignalAgeSeconds(createdAt);

  if (!Number.isFinite(seconds)) {
    return "Unknown";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes =
    Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

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

function getSignalTone(
  signal: string,
) {
  if (signal === "BUY") {
    return "success" as const;
  }

  if (signal === "SELL") {
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

interface ExplanationItem {
  title: string;
  description: string;
  state:
    | "positive"
    | "negative"
    | "warning"
    | "neutral";
}

function buildExplanation(
  signal: {
    signal: string;
    trade_quality: string;
    status: string;
    confidence: number | null;
    ema20: number | null;
    ema50: number | null;
    rsi: number | null;
    momentum: number | null;
    created_at: string;
  },
): ExplanationItem[] {
  const items: ExplanationItem[] = [];

  const storedDirection =
    signal.signal.toUpperCase();

  const ageSeconds =
    getSignalAgeSeconds(
      signal.created_at,
    );

  const expired =
    ageSeconds > 900;

  const effectiveDirection =
    expired
      ? "WAIT"
      : storedDirection;

  if (expired) {
    items.push({
      title: "Signal expired",
      description:
        "The stored M1 result is older than 15 minutes and is not treated as an active instruction.",
      state: "negative",
    });
  } else if (ageSeconds > 120) {
    items.push({
      title: "Signal is stale",
      description:
        "OMI has not stored a fresh signal within the current M1 monitoring window.",
      state: "warning",
    });
  } else {
    items.push({
      title: "Fresh signal",
      description:
        "The latest signal was created within the active monitoring window.",
      state: "positive",
    });
  }

  if (effectiveDirection === "BUY") {
    items.push({
      title: "Bullish impulse",
      description:
        "OMI currently favours upward XAUUSD movement.",
      state: "positive",
    });
  } else if (effectiveDirection === "SELL") {
    items.push({
      title: "Bearish impulse",
      description:
        "OMI currently favours downward XAUUSD movement.",
      state: "negative",
    });
  } else {
    items.push({
      title: "No active direction",
      description:
        "OMI is waiting for a fresh, eligible impulse.",
      state: "neutral",
    });
  }

  if (
    signal.ema20 !== null
    && signal.ema50 !== null
  ) {
    const bullishAlignment =
      signal.ema20 > signal.ema50;

    if (
      effectiveDirection === "BUY"
      && bullishAlignment
    ) {
      items.push({
        title: "Trend alignment confirmed",
        description:
          "EMA20 is above EMA50 and supports the BUY direction.",
        state: "positive",
      });
    } else if (
      effectiveDirection === "SELL"
      && !bullishAlignment
    ) {
      items.push({
        title: "Trend alignment confirmed",
        description:
          "EMA20 is below EMA50 and supports the SELL direction.",
        state: "positive",
      });
    } else if (
      effectiveDirection !== "WAIT"
    ) {
      items.push({
        title: "Trend conflict",
        description:
          "The EMA relationship does not agree with the current direction.",
        state: "warning",
      });
    }
  }

  if (signal.momentum !== null) {
    const momentumAligned =
      (
        effectiveDirection === "BUY"
        && signal.momentum > 0
      )
      || (
        effectiveDirection === "SELL"
        && signal.momentum < 0
      );

    items.push({
      title:
        momentumAligned
          ? "Momentum supports direction"
          : "Momentum requires caution",

      description:
        momentumAligned
          ? "The stored momentum value agrees with OMI’s current direction."
          : "Momentum does not currently provide full directional support.",

      state:
        momentumAligned
          ? "positive"
          : "warning",
    });
  }

  if (signal.rsi !== null) {
    if (signal.rsi >= 70) {
      items.push({
        title: "Market is overbought",
        description:
          `RSI is ${signal.rsi.toFixed(1)}. Upward continuation may face exhaustion risk.`,
        state: "warning",
      });
    } else if (signal.rsi <= 30) {
      items.push({
        title: "Market is oversold",
        description:
          `RSI is ${signal.rsi.toFixed(1)}. Downward continuation may face exhaustion risk.`,
        state: "warning",
      });
    } else {
      items.push({
        title: "RSI is balanced",
        description:
          `RSI is ${signal.rsi.toFixed(1)}, outside the main extreme zones.`,
        state: "neutral",
      });
    }
  }

  const status =
    signal.status.toUpperCase();

  if (status === "ACTIVE") {
    items.push({
      title: "Signal reached execution",
      description:
        "The backend recorded this signal as active.",
      state: "positive",
    });
  } else if (status === "BLOCKED") {
    items.push({
      title: "Execution protection activated",
      description:
        "Risk, validation, schedule or execution rules prevented the trade.",
      state: "warning",
    });
  } else if (status === "FAILED") {
    items.push({
      title: "Execution failed",
      description:
        "The backend did not complete this signal successfully.",
      state: "negative",
    });
  }

  return items;
}

function getExplanationClasses(
  state: ExplanationItem["state"],
): string {
  if (state === "positive") {
    return "border-[color:rgba(50,196,141,0.22)] bg-[color:rgba(50,196,141,0.06)]";
  }

  if (state === "negative") {
    return "border-[color:rgba(239,98,98,0.22)] bg-[color:rgba(239,98,98,0.06)]";
  }

  if (state === "warning") {
    return "border-[color:rgba(241,185,76,0.22)] bg-[color:rgba(241,185,76,0.06)]";
  }

  return "border-[var(--border)] bg-[var(--surface-elevated)]";
}

function getExplanationIcon(
  state: ExplanationItem["state"],
) {
  if (state === "positive") {
    return CheckCircle2;
  }

  if (state === "negative") {
    return ShieldAlert;
  }

  if (state === "warning") {
    return AlertTriangle;
  }

  return CircleOff;
}

export function AiIntelligenceDashboard() {
  const latestQuery =
    useLatestScalpingSignal();

  const recentQuery =
    useRecentScalpingSignals({
      limit: 100,
    });

  const latest =
    latestQuery.data?.data
    ?? null;

  const recentSignals =
    recentQuery.data?.data
    ?? [];

  const analytics =
    useMemo(
      () => {
        const buySignals =
          recentSignals.filter(
            (item) =>
              item.signal.toUpperCase()
              === "BUY",
          ).length;

        const sellSignals =
          recentSignals.filter(
            (item) =>
              item.signal.toUpperCase()
              === "SELL",
          ).length;

        const strongSignals =
          recentSignals.filter(
            (item) => {
              const quality =
                item.trade_quality.toUpperCase();

              return (
                quality === "STRONG"
                || quality === "ELITE"
              );
            },
          ).length;

        const executedSignals =
          recentSignals.filter(
            (item) =>
              item.status.toUpperCase()
              === "ACTIVE"
              || item.mt5_ticket !== null,
          ).length;

        return {
          buySignals,
          sellSignals,
          strongSignals,
          executedSignals,
        };
      },
      [recentSignals],
    );

  if (latestQuery.isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-96 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-semibold">
              Loading AI intelligence
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    latestQuery.isError
    || !latest
  ) {
    return (
      <section className="rounded-3xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)] p-6">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-[var(--danger)]" />

          <div>
            <h2 className="font-semibold text-[var(--danger)]">
              AI intelligence unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              The latest stored OMI signal could not be loaded.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const ageSeconds =
    getSignalAgeSeconds(
      latest.created_at,
    );

  const expired =
    ageSeconds > 900;

  const stale =
    ageSeconds > 120;

  const effectiveSignal =
    expired
      ? "WAIT"
      : latest.signal.toUpperCase();

  const SignalIcon =
    effectiveSignal === "BUY"
      ? TrendingUp
      : effectiveSignal === "SELL"
        ? TrendingDown
        : CircleOff;

  const explanations =
    buildExplanation(latest);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:rgba(217,164,65,0.28)] bg-[var(--accent-muted)] text-[var(--accent)]">
            <BrainCircuit className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold">
              OMI Intelligence Engine
            </p>

            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Impulse-based XAUUSD M1 decision monitoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge
            tone={
              expired
                ? "danger"
                : stale
                  ? "warning"
                  : "success"
            }
          >
            {expired
              ? "Signal expired"
              : stale
                ? "Signal stale"
                : "Signal fresh"}
          </StatusBadge>

          <button
            type="button"
            onClick={() => {
              void Promise.all([
                latestQuery.refetch(),
                recentQuery.refetch(),
              ]);
            }}
            disabled={
              latestQuery.isFetching
              || recentQuery.isFetching
            }
            className="flex h-7 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 text-xs font-semibold text-[var(--foreground-muted)]"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                (
                  latestQuery.isFetching
                  || recentQuery.isFetching
                )
                && "animate-spin",
              )}
            />

            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
              Current intelligence
            </p>

            <h2 className="mt-1 font-semibold">
              Effective Decision
            </h2>
          </div>

          <div className="p-5">
            <div
              className={cn(
                "rounded-2xl border p-5",
                effectiveSignal === "BUY"
                  ? "border-[color:rgba(50,196,141,0.28)] bg-[color:rgba(50,196,141,0.07)]"
                  : effectiveSignal === "SELL"
                    ? "border-[color:rgba(239,98,98,0.28)] bg-[color:rgba(239,98,98,0.07)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)]",
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={cn(
                      "text-5xl font-bold",
                      effectiveSignal === "BUY"
                        ? "text-[var(--success)]"
                        : effectiveSignal === "SELL"
                          ? "text-[var(--danger)]"
                          : "text-[var(--foreground)]",
                    )}
                  >
                    {effectiveSignal}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusBadge
                      tone={getSignalTone(
                        effectiveSignal,
                      )}
                    >
                      {effectiveSignal}
                    </StatusBadge>

                    <StatusBadge
                      tone={getQualityTone(
                        latest.trade_quality,
                      )}
                    >
                      {latest.trade_quality}
                    </StatusBadge>
                  </div>
                </div>

                <SignalIcon
                  className={cn(
                    "h-9 w-9",
                    effectiveSignal === "BUY"
                      ? "text-[var(--success)]"
                      : effectiveSignal === "SELL"
                        ? "text-[var(--danger)]"
                        : "text-[var(--foreground-subtle)]",
                  )}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {[
                {
                  label: "Confidence",
                  value:
                    latest.confidence !== null
                      ? `${latest.confidence.toFixed(0)}%`
                      : "Unavailable",
                },
                {
                  label: "Stored Status",
                  value: latest.status,
                },
                {
                  label: "Signal Age",
                  value: formatAge(
                    latest.created_at,
                  ),
                },
                {
                  label: "Current Price",
                  value: formatNumber(
                    latest.price,
                    3,
                  ),
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
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                Intelligence Explanation
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Understandable interpretation of verified OMI fields
            </p>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            {explanations.map(
              (
                explanation,
                index,
              ) => {
                const Icon =
                  getExplanationIcon(
                    explanation.state,
                  );

                return (
                  <div
                    key={`${explanation.title}-${index}`}
                    className={cn(
                      "rounded-2xl border p-4",
                      getExplanationClasses(
                        explanation.state,
                      ),
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />

                      <div>
                        <h3 className="text-sm font-semibold">
                          {explanation.title}
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
                          {explanation.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <ArrowUpRight className="h-5 w-5 text-[var(--success)]" />

          <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            Recent BUY Signals
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {analytics.buySignals}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <ArrowDownRight className="h-5 w-5 text-[var(--danger)]" />

          <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            Recent SELL Signals
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {analytics.sellSignals}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <Gauge className="h-5 w-5 text-[var(--accent)]" />

          <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            STRONG / ELITE
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {analytics.strongSignals}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <Target className="h-5 w-5 text-[var(--info)]" />

          <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            Executed Signals
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {analytics.executedSignals}
          </p>
        </article>
      </section>

      <PermissionGate permission="raw-market-data:view">
        <section className="overflow-hidden rounded-3xl border border-[color:rgba(94,162,239,0.25)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--info)]" />

              <h2 className="font-semibold">
                Developer AI Indicators
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Developer-only internal signal values
            </p>
          </div>

          <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "EMA20",
                value: formatNumber(
                  latest.ema20,
                  3,
                ),
              },
              {
                label: "EMA50",
                value: formatNumber(
                  latest.ema50,
                  3,
                ),
              },
              {
                label: "RSI",
                value: formatNumber(
                  latest.rsi,
                  2,
                ),
              },
              {
                label: "Momentum",
                value: formatNumber(
                  latest.momentum,
                  3,
                ),
              },
              {
                label: "BUY Side",
                value:
                  latest.buy_score
                  ?? "—",
              },
              {
                label: "SELL Side",
                value:
                  latest.sell_score
                  ?? "—",
              },
              {
                label: "Confirmation",
                value:
                  latest.confirmation_score
                  ?? "—",
              },
              {
                label: "MT5 Ticket",
                value:
                  latest.mt5_ticket
                  ?? "None",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[var(--surface)] p-5"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                  {item.label}
                </p>

                <p className="mt-3 text-lg font-semibold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </PermissionGate>
    </div>
  );
}