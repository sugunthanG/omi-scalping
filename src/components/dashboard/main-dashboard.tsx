"use client";

import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  CircleOff,
  Clock3,
  Gauge,
  Landmark,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { PermissionGate } from "@/components/common/permission-gate";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAccountStatus } from "@/hooks/use-account-status";
import { useClosedTradeHistory } from "@/hooks/use-closed-trade-history";
import { useLatestScalpingSignal } from "@/hooks/use-latest-scalping-signal";
import { useOpenPositions } from "@/hooks/use-open-positions";
import { useRiskStatus } from "@/hooks/use-risk-status";
import { cn } from "@/lib/cn";

function formatMoney(
  value: number,
  currency = "USD",
): string {
  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

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

  return value.toFixed(digits);
}

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
      (
        Date.now()
        - timestamp
      ) / 1000,
    ),
  );
}

function formatSignalAge(
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

export function MainDashboard() {
  const accountQuery =
    useAccountStatus();

  const riskQuery =
    useRiskStatus();

  const positionsQuery =
    useOpenPositions();

  const signalQuery =
    useLatestScalpingSignal();

  const historyQuery =
    useClosedTradeHistory({
      days: 30,
      limit: 500,
    });

  const isInitialLoading =
    accountQuery.isPending
    && riskQuery.isPending
    && positionsQuery.isPending
    && signalQuery.isPending;

  const isRefreshing =
    accountQuery.isFetching
    || riskQuery.isFetching
    || positionsQuery.isFetching
    || signalQuery.isFetching
    || historyQuery.isFetching;

  const account =
    accountQuery.data;

  const risk =
    riskQuery.data;

  const positions =
    positionsQuery.data?.positions
    ?? [];

  const signal =
    signalQuery.data?.data
    ?? null;

  const history =
    historyQuery.data;

  const floatingProfit =
    positions.reduce(
      (
        total,
        position,
      ) =>
        total
        + position.profit,
      0,
    );

  const totalVolume =
    positions.reduce(
      (
        total,
        position,
      ) =>
        total
        + position.volume,
      0,
    );

  const recentTrades =
    history?.data.slice(0, 5)
    ?? [];

  const signalState =
    useMemo(
      () => {
        if (!signal) {
          return {
            decision: "WAIT",
            freshness: "Unavailable",
            expired: true,
            stale: true,
          };
        }

        const ageSeconds =
          getSignalAgeSeconds(
            signal.created_at,
          );

        const expired =
          ageSeconds > 900;

        const stale =
          ageSeconds > 120;

        return {
          decision:
            expired
              ? "WAIT"
              : signal.signal.toUpperCase(),

          freshness:
            expired
              ? "Expired"
              : stale
                ? "Stale"
                : "Fresh",

          expired,
          stale,
        };
      },
      [signal],
    );

  const handleRefresh = () => {
    void Promise.all([
      accountQuery.refetch(),
      riskQuery.refetch(),
      positionsQuery.refetch(),
      signalQuery.refetch(),
      historyQuery.refetch(),
    ]);
  };

  if (isInitialLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-semibold">
              Loading OMI dashboard
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Reading account, signal, risk and position information
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================
          SYSTEM SUMMARY
      ===================================== */}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.08)] text-[var(--success)]">
            <Activity className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold">
              OMI Control Center
            </p>

            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Live trading, account and risk overview
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge
            tone={
              account
                ? "success"
                : "danger"
            }
          >
            {account
              ? "MT5 online"
              : "MT5 unavailable"}
          </StatusBadge>

          <StatusBadge
            tone={
              risk?.auto_trade
                ? "success"
                : "warning"
            }
          >
            {risk?.auto_trade
              ? "Auto trade enabled"
              : "Auto trade disabled"}
          </StatusBadge>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-7 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 text-xs font-semibold text-[var(--foreground-muted)] disabled:opacity-60"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                isRefreshing
                  && "animate-spin",
              )}
            />

            Refresh
          </button>
        </div>
      </section>

      {/* =====================================
          PRIMARY ACCOUNT METRICS
      ===================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Balance
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {account
                  ? formatMoney(
                      account.balance,
                      account.currency,
                    )
                  : "Unavailable"}
              </p>
            </div>

            <WalletCards className="h-5 w-5 text-[var(--accent)]" />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Realized account value
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Equity
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {account
                  ? formatMoney(
                      account.equity,
                      account.currency,
                    )
                  : "Unavailable"}
              </p>
            </div>

            {account
              && account.equity_change >= 0 ? (
                <TrendingUp className="h-5 w-5 text-[var(--success)]" />
              ) : (
                <TrendingDown className="h-5 w-5 text-[var(--danger)]" />
              )}
          </div>

          <p
            className={cn(
              "mt-5 text-xs font-semibold",
              account
                && account.equity_change >= 0
                ? "text-[var(--success)]"
                : "text-[var(--danger)]",
            )}
          >
            {account
              ? `${account.equity_change >= 0 ? "+" : ""}${account.equity_change_percent.toFixed(2)}% against balance`
              : "No account data"}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Today&apos;s Profit
              </p>

              <p
                className={cn(
                  "mt-3 text-2xl font-semibold",
                  (
                    risk?.today_profit
                    ?? 0
                  ) >= 0
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]",
                )}
              >
                {risk
                  ? formatMoney(
                      risk.today_profit,
                      account?.currency
                      ?? "USD",
                    )
                  : "Unavailable"}
              </p>
            </div>

            <BadgeDollarSign
              className={cn(
                "h-5 w-5",
                (
                  risk?.today_profit
                  ?? 0
                ) >= 0
                  ? "text-[var(--success)]"
                  : "text-[var(--danger)]",
              )}
            />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            {risk
              ? `${risk.today_trade_count} trades recorded today`
              : "Risk status unavailable"}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Open Positions
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {positions.length}
              </p>
            </div>

            <BriefcaseBusiness className="h-5 w-5 text-[var(--info)]" />
          </div>

          <p
            className={cn(
              "mt-5 text-xs font-semibold",
              floatingProfit >= 0
                ? "text-[var(--success)]"
                : "text-[var(--danger)]",
            )}
          >
            Floating P&amp;L{" "}
            {formatMoney(
              floatingProfit,
              account?.currency
              ?? "USD",
            )}
          </p>
        </article>
      </section>

      {/* =====================================
          SIGNAL AND RISK
      ===================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        {/* =====================================
            LATEST SIGNAL
        ===================================== */}

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[var(--accent)]" />

                <h2 className="font-semibold">
                  Latest OMI Signal
                </h2>
              </div>

              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                Current stored AI trading decision
              </p>
            </div>

            <Link
              href="/live-trading"
              className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Open terminal

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {signal ? (
            <div className="p-6">
              <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                <div
                  className={cn(
                    "rounded-2xl border p-5",
                    signalState.decision === "BUY"
                      ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.07)]"
                      : signalState.decision === "SELL"
                        ? "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.07)]"
                        : "border-[var(--border)] bg-[var(--surface-elevated)]",
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                    Effective decision
                  </p>

                  <p
                    className={cn(
                      "mt-3 text-4xl font-bold",
                      signalState.decision === "BUY"
                        ? "text-[var(--success)]"
                        : signalState.decision === "SELL"
                          ? "text-[var(--danger)]"
                          : "text-[var(--foreground)]",
                    )}
                  >
                    {signalState.decision}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusBadge
                      tone={getSignalTone(
                        signalState.decision,
                      )}
                    >
                      {signalState.decision}
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

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-[var(--info)]" />

                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Confidence
                      </p>
                    </div>

                    <p className="mt-2 text-lg font-semibold">
                      {signal.confidence !== null
                        ? `${signal.confidence.toFixed(0)}%`
                        : "Unavailable"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-[var(--foreground-subtle)]" />

                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Signal freshness
                      </p>
                    </div>

                    <div className="mt-2">
                      <StatusBadge
                        tone={
                          signalState.expired
                            ? "danger"
                            : signalState.stale
                              ? "warning"
                              : "success"
                        }
                      >
                        {signalState.freshness}
                      </StatusBadge>
                    </div>

                    <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
                      {formatSignalAge(
                        signal.created_at,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      Market price
                    </p>

                    <p className="mt-2 text-lg font-semibold">
                      {formatPrice(
                        signal.price,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      Backend status
                    </p>

                    <div className="mt-2">
                      <StatusBadge
                        tone={getStatusTone(
                          signal.status,
                        )}
                      >
                        {signal.status}
                      </StatusBadge>
                    </div>
                  </div>
                </div>
              </div>

              {signalState.stale ? (
                <div
                  className={cn(
                    "mt-5 rounded-xl border px-4 py-3",
                    signalState.expired
                      ? "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)]"
                      : "border-[color:rgba(241,185,76,0.25)] bg-[color:rgba(241,185,76,0.06)]",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      signalState.expired
                        ? "text-[var(--danger)]"
                        : "text-[var(--warning)]",
                    )}
                  >
                    {signalState.expired
                      ? "Historical signal expired"
                      : "Latest signal is stale"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                    OMI is waiting for a fresh M1 result. The stored
                    direction is not presented as an active instruction.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-72 items-center justify-center p-6">
              <div className="text-center">
                <CircleOff className="mx-auto h-9 w-9 text-[var(--foreground-subtle)]" />

                <p className="mt-4 font-semibold">
                  No signal available
                </p>

                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  OMI has not stored a signal yet.
                </p>
              </div>
            </div>
          )}
        </article>

        {/* =====================================
            RISK STATUS
        ===================================== */}

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />

                <h2 className="font-semibold">
                  Risk Protection
                </h2>
              </div>

              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                Current backend-enforced safeguards
              </p>
            </div>

            <Link
              href="/risk"
              className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              View risk

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {risk ? (
            <div className="space-y-3 p-5">
              {[
                {
                  label: "Auto Trading",
                  value:
                    risk.auto_trade
                      ? "Enabled"
                      : "Disabled",
                  tone:
                    risk.auto_trade
                      ? "success"
                      : "warning",
                },
                {
                  label: "Execution State",
                  value:
                    risk.execution_cooldown
                      ? "Trade group protected"
                      : "Ready",
                  tone:
                    risk.execution_cooldown
                      ? "warning"
                      : "success",
                },
                {
                  label: "Consecutive Losses",
                  value:
                    risk.consecutive_losses.toString(),
                  tone:
                    risk.consecutive_losses > 0
                      ? "danger"
                      : "success",
                },
                {
                  label: "Cooldown",
                  value:
                    `${risk.cooldown_seconds}s`,
                  tone: "neutral",
                },
                {
                  label: "Active Group",
                  value:
                    risk.active_group
                      ? `${risk.group_direction ?? "Unknown"} · ${risk.group_quality ?? "Unknown"}`
                      : "None",
                  tone:
                    risk.active_group
                      ? "info"
                      : "neutral",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
                >
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {item.label}
                  </p>

                  <StatusBadge
                    tone={
                      item.tone as
                        | "success"
                        | "warning"
                        | "danger"
                        | "info"
                        | "neutral"
                    }
                  >
                    {item.value}
                  </StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-72 items-center justify-center p-6">
              <div className="text-center">
                <ShieldAlert className="mx-auto h-9 w-9 text-[var(--danger)]" />

                <p className="mt-4 font-semibold">
                  Risk status unavailable
                </p>
              </div>
            </div>
          )}
        </article>
      </section>

      {/* =====================================
          POSITIONS AND PERFORMANCE
      ===================================== */}

      <section className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-[var(--accent)]" />

                <h2 className="font-semibold">
                  Current Exposure
                </h2>
              </div>

              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                Active MT5 positions
              </p>
            </div>

            <Link
              href="/positions"
              className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              View positions

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Open trades
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {positions.length}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Total volume
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {totalVolume.toFixed(2)}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Floating result
                </p>

                <p
                  className={cn(
                    "mt-2 text-xl font-semibold",
                    floatingProfit >= 0
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]",
                  )}
                >
                  {formatMoney(
                    floatingProfit,
                    account?.currency
                    ?? "USD",
                  )}
                </p>
              </div>
            </div>

            {positions.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 text-center">
                <CircleOff className="mx-auto h-8 w-8 text-[var(--foreground-subtle)]" />

                <p className="mt-3 font-semibold">
                  No active positions
                </p>

                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  OMI is waiting for an eligible signal.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                {positions
                  .slice(0, 3)
                  .map((position) => (
                    <div
                      key={position.ticket}
                      className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {position.symbol}
                        </p>

                        <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                          Volume {position.volume.toFixed(2)}
                        </p>
                      </div>

                      <p
                        className={cn(
                          "text-sm font-semibold",
                          position.profit >= 0
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]",
                        )}
                      >
                        {formatMoney(
                          position.profit,
                          account?.currency
                          ?? "USD",
                        )}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[var(--accent)]" />

                <h2 className="font-semibold">
                  30-Day Performance
                </h2>
              </div>

              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                Completed MT5 trade results
              </p>
            </div>

            <Link
              href="/performance"
              className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Full analytics

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Net profit
                </p>

                <p
                  className={cn(
                    "mt-2 text-xl font-semibold",
                    (
                      history?.summary.total_profit
                      ?? 0
                    ) >= 0
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]",
                  )}
                >
                  {formatMoney(
                    history?.summary.total_profit
                    ?? 0,
                    account?.currency
                    ?? "USD",
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Win rate
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {(
                    history?.summary.win_rate
                    ?? 0
                  ).toFixed(2)}%
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Closed trades
                </p>

                <p className="mt-2 text-xl font-semibold">
                  {history?.count ?? 0}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                Recent results
              </p>

              {recentTrades.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 text-center">
                  <CircleOff className="mx-auto h-8 w-8 text-[var(--foreground-subtle)]" />

                  <p className="mt-3 text-sm font-semibold">
                    No recent closed trades
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTrades.map((trade) => (
                    <div
                      key={trade.deal_ticket}
                      className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            tone={
                              trade.direction === "BUY"
                                ? "success"
                                : trade.direction === "SELL"
                                  ? "danger"
                                  : "neutral"
                            }
                          >
                            {trade.direction}
                          </StatusBadge>

                          <p className="text-sm font-semibold">
                            {trade.symbol}
                          </p>
                        </div>

                        <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                          {trade.volume.toFixed(2)} lots
                        </p>
                      </div>

                      <p
                        className={cn(
                          "text-sm font-semibold",
                          trade.net_result >= 0
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]",
                        )}
                      >
                        {formatMoney(
                          trade.net_result,
                          account?.currency
                          ?? "USD",
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      </section>

      {/* =====================================
          ACCOUNT SUMMARY
      ===================================== */}

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                Trading Account
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              MT5 balance and margin health
            </p>
          </div>

          <Link
            href="/account"
            className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            Account details

            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {account ? (
          <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2 xl:grid-cols-5">
            {[
              {
                label: "Free Margin",
                value: formatMoney(
                  account.free_margin,
                  account.currency,
                ),
              },
              {
                label: "Used Margin",
                value: formatMoney(
                  account.margin,
                  account.currency,
                ),
              },
              {
                label: "Margin Level",
                value:
                  account.margin_level > 0
                    ? `${account.margin_level.toFixed(2)}%`
                    : "No active margin",
              },
              {
                label: "Leverage",
                value: `1:${account.leverage}`,
              },
              {
                label: "Broker",
                value:
                  account.company
                  || "Unavailable",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[var(--surface)] p-5"
              >
                <p className="text-sm text-[var(--foreground-muted)]">
                  {item.label}
                </p>

                <p className="mt-3 truncate text-lg font-semibold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <p className="text-sm text-[var(--foreground-muted)]">
              Account information is unavailable.
            </p>
          </div>
        )}

        {/* Developer-only technical account information */}

        <PermissionGate permission="raw-api:view">
          <div className="border-t border-[color:rgba(94,162,239,0.20)] bg-[color:rgba(94,162,239,0.04)] px-6 py-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs">
              <div>
                <span className="text-[var(--foreground-subtle)]">
                  MT5 login:
                </span>{" "}

                <span className="font-mono font-semibold">
                  {account?.login ?? "Unavailable"}
                </span>
              </div>

              <div>
                <span className="text-[var(--foreground-subtle)]">
                  Server:
                </span>{" "}

                <span className="font-semibold">
                  {account?.server ?? "Unavailable"}
                </span>
              </div>

              <div>
                <span className="text-[var(--foreground-subtle)]">
                  Expert trading:
                </span>{" "}

                <span className="font-semibold">
                  {account?.trade_expert
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </PermissionGate>
      </section>
    </div>
  );
}