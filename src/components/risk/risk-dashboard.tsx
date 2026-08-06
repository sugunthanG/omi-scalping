"use client";

import {
  Activity,
  BriefcaseBusiness,
  CircleCheck,
  CircleOff,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useRiskStatus,
} from "@/hooks/use-risk-status";

import {
  cn,
} from "@/lib/cn";


function formatMoney(
  value: number,
): string {
  const prefix =
    value > 0
      ? "+"
      : "";

  return `${prefix}${value.toFixed(2)}`;
}


function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "No trade recorded";
  }

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


function formatDuration(
  seconds: number,
): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes =
    Math.floor(
      seconds / 60,
    );

  const remainingSeconds =
    seconds % 60;

  if (
    remainingSeconds === 0
  ) {
    return `${minutes}m`;
  }

  return (
    `${minutes}m `
    + `${remainingSeconds}s`
  );
}


function calculateUsage(
  current: number,
  limit: number,
): number {
  if (
    limit <= 0
    || !Number.isFinite(limit)
    || limit > 1_000_000
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      (
        current
        / limit
      ) * 100,
      100,
    ),
  );
}


export function RiskDashboard() {
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useRiskStatus();

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-72 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-medium">
              Loading risk status
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    isError
    || !data
  ) {
    return (
      <section className="rounded-3xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)] p-6">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />

          <div>
            <h2 className="font-semibold text-[var(--danger)]">
              Risk information unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "Unable to load OMI risk information."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const tradeUsage =
    calculateUsage(
      data.today_trade_count,
      data.max_trades_per_day,
    );

  const lossUsage =
    data.max_daily_loss > 0
      && data.max_daily_loss < 1_000_000
      ? calculateUsage(
          Math.max(
            -data.today_profit,
            0,
          ),
          data.max_daily_loss,
        )
      : 0;

  const consecutiveLossUsage =
    calculateUsage(
      data.consecutive_losses,
      data.max_consecutive_losses,
    );

  const profitPositive =
    data.today_profit >= 0;

  return (
    <div className="space-y-6">
      {/* =====================================
          RISK STATE
      ===================================== */}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border",
              data.auto_trade
                ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.08)] text-[var(--success)]"
                : "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.08)] text-[var(--danger)]",
            )}
          >
            {data.auto_trade ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
          </div>

          <div>
            <p className="font-semibold">
              OMI Risk Protection
            </p>

            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Backend-enforced trading safeguards
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge
            tone={
              data.auto_trade
                ? "success"
                : "danger"
            }
          >
            {data.auto_trade
              ? "Auto trade enabled"
              : "Auto trade disabled"}
          </StatusBadge>

          <StatusBadge
            tone={
              data.execution_cooldown
                ? "warning"
                : "success"
            }
          >
            {data.execution_cooldown
              ? "Trade group running"
              : "Ready"}
          </StatusBadge>

          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            disabled={isFetching}
            className="flex h-7 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 text-xs font-semibold text-[var(--foreground-muted)]"
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

      {/* =====================================
          PRIMARY CARDS
      ===================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Today&apos;s Profit
              </p>

              <p
                className={cn(
                  "mt-3 text-2xl font-semibold",
                  profitPositive
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]",
                )}
              >
                {formatMoney(
                  data.today_profit,
                )}
              </p>
            </div>

            {profitPositive ? (
              <TrendingUp className="h-5 w-5 text-[var(--success)]" />
            ) : (
              <TrendingDown className="h-5 w-5 text-[var(--danger)]" />
            )}
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Synced from MT5 history
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Trades Today
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {data.today_trade_count}
              </p>
            </div>

            <Activity className="h-5 w-5 text-[var(--accent)]" />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Backend execution count
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Consecutive Losses
              </p>

              <p
                className={cn(
                  "mt-3 text-2xl font-semibold",
                  data.consecutive_losses > 0
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]",
                )}
              >
                {data.consecutive_losses}
              </p>
            </div>

            <ShieldAlert
              className={cn(
                "h-5 w-5",
                data.consecutive_losses > 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--success)]",
              )}
            />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Current loss sequence
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Cooldown
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {formatDuration(
                  data.cooldown_seconds,
                )}
              </p>
            </div>

            <Clock3 className="h-5 w-5 text-[var(--info)]" />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Adaptive execution delay
          </p>
        </article>
      </section>

      {/* =====================================
          LIMIT USAGE
      ===================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h2 className="font-semibold">
              Risk Limit Usage
            </h2>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Current exposure against configured safeguards
            </p>
          </div>

          <div className="space-y-6 p-6">
            {[
              {
                label: "Daily trade usage",
                current:
                  data.today_trade_count,

                limit:
                  data.max_trades_per_day,

                percentage:
                  tradeUsage,

                unlimited:
                  data.max_trades_per_day
                  > 1_000_000,
              },
              {
                label: "Daily loss usage",
                current:
                  Math.max(
                    -data.today_profit,
                    0,
                  ),

                limit:
                  data.max_daily_loss,

                percentage:
                  lossUsage,

                unlimited:
                  data.max_daily_loss
                  > 1_000_000,
              },
              {
                label: "Consecutive loss usage",
                current:
                  data.consecutive_losses,

                limit:
                  data.max_consecutive_losses,

                percentage:
                  consecutiveLossUsage,

                unlimited:
                  false,
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {item.label}
                  </p>

                  <p className="text-xs font-semibold">
                    {item.unlimited
                      ? "Development limit"
                      : `${item.current} / ${item.limit}`}
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.percentage >= 80
                        ? "bg-[var(--danger)]"
                        : item.percentage >= 50
                          ? "bg-[var(--warning)]"
                          : "bg-[var(--success)]",
                    )}
                    style={{
                      width: `${
                        item.unlimited
                          ? 0
                          : item.percentage
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* =====================================
            ACTIVE TRADE GROUP
        ===================================== */}

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                Active Trade Group
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Current OMI grouped execution
            </p>
          </div>

          {data.active_group ? (
            <div className="space-y-3 p-5">
              {[
                {
                  label: "Status",
                  value:
                    data.group_status
                    ?? "Unknown",
                },
                {
                  label: "Direction",
                  value:
                    data.group_direction
                    ?? "Unknown",
                },
                {
                  label: "Quality",
                  value:
                    data.group_quality
                    ?? "Unknown",
                },
                {
                  label: "Opened Entries",
                  value:
                    `${data.group_opened_entries}/${data.group_entries}`,
                },
                {
                  label: "Remaining Entries",
                  value:
                    data.group_remaining_entries,
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
          ) : (
            <div className="flex min-h-72 items-center justify-center p-6">
              <div className="text-center">
                <CircleOff className="mx-auto h-9 w-9 text-[var(--foreground-subtle)]" />

                <p className="mt-4 font-semibold">
                  No active trade group
                </p>

                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  OMI is waiting for an eligible signal.
                </p>
              </div>
            </div>
          )}
        </article>
      </section>

      {/* =====================================
          LAST ACTIVITY
      ===================================== */}

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-3">
            <CircleCheck className="h-5 w-5 text-[var(--success)]" />

            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Last Trade
              </p>

              <p className="mt-1 font-semibold">
                {formatDateTime(
                  data.last_trade_time,
                )}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-3">
            {data.execution_cooldown ? (
              <ShieldAlert className="h-5 w-5 text-[var(--warning)]" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-[var(--success)]" />
            )}

            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Execution State
              </p>

              <p className="mt-1 font-semibold">
                {data.execution_cooldown
                  ? "Trade group protected"
                  : "Fresh execution allowed"}
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}