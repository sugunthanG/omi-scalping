"use client";

import {
  BadgeDollarSign,
  Building2,
  CircleCheck,
  CircleOff,
  Coins,
  Gauge,
  Landmark,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useAccountStatus,
} from "@/hooks/use-account-status";

import {
  cn,
} from "@/lib/cn";


function formatMoney(
  value: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency:
          currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}


function clampPercentage(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      value,
      100,
    ),
  );
}


export function AccountDashboard() {
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useAccountStatus();

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-80 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-medium">
              Loading MT5 account
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
              Account information unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "Unable to load the MT5 account."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const positiveEquity =
    data.equity_change >= 0;

  const marginUsage =
    clampPercentage(
      data.used_margin_percent,
    );

  return (
    <div className="space-y-6">
      {/* =====================================
          ACCOUNT CONNECTION
      ===================================== */}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.08)] text-[var(--success)]">
            <Landmark className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold">
              MT5 Trading Account
            </p>

            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              {data.company || "Broker account"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">
            Account online
          </StatusBadge>

          <StatusBadge
            tone={
              data.trade_allowed
                ? "success"
                : "danger"
            }
          >
            {data.trade_allowed
              ? "Trading allowed"
              : "Trading unavailable"}
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
          PRIMARY ACCOUNT VALUES
      ===================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Balance
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {formatMoney(
                  data.balance,
                  data.currency,
                )}
              </p>
            </div>

            <WalletCards className="h-5 w-5 text-[var(--accent)]" />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Realized account value
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Equity
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {formatMoney(
                  data.equity,
                  data.currency,
                )}
              </p>
            </div>

            {positiveEquity ? (
              <TrendingUp className="h-5 w-5 text-[var(--success)]" />
            ) : (
              <TrendingDown className="h-5 w-5 text-[var(--danger)]" />
            )}
          </div>

          <p
            className={cn(
              "mt-5 text-xs font-semibold",
              positiveEquity
                ? "text-[var(--success)]"
                : "text-[var(--danger)]",
            )}
          >
            {positiveEquity
              ? "+"
              : ""}
            {data.equity_change_percent.toFixed(2)}%
            {" "}against balance
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Floating P&amp;L
              </p>

              <p
                className={cn(
                  "mt-3 text-2xl font-semibold",
                  data.floating_profit >= 0
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]",
                )}
              >
                {formatMoney(
                  data.floating_profit,
                  data.currency,
                )}
              </p>
            </div>

            <BadgeDollarSign
              className={cn(
                "h-5 w-5",
                data.floating_profit >= 0
                  ? "text-[var(--success)]"
                  : "text-[var(--danger)]",
              )}
            />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Current open-position result
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Free Margin
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {formatMoney(
                  data.free_margin,
                  data.currency,
                )}
              </p>
            </div>

            <Coins className="h-5 w-5 text-[var(--info)]" />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Available for new positions
          </p>
        </article>
      </section>

      {/* =====================================
          MARGIN AND ACCOUNT INFORMATION
      ===================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                Margin Health
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Current account margin utilization
            </p>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-[var(--foreground-muted)]">
                  Used margin
                </p>

                <p className="text-sm font-semibold">
                  {marginUsage.toFixed(2)}%
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className={cn(
                    "h-full rounded-full",
                    marginUsage >= 80
                      ? "bg-[var(--danger)]"
                      : marginUsage >= 50
                        ? "bg-[var(--warning)]"
                        : "bg-[var(--success)]",
                  )}
                  style={{
                    width: `${marginUsage}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Used Margin",
                  value: formatMoney(
                    data.margin,
                    data.currency,
                  ),
                },
                {
                  label: "Free Margin",
                  value: formatMoney(
                    data.free_margin,
                    data.currency,
                  ),
                },
                {
                  label: "Margin Level",
                  value:
                    data.margin_level > 0
                      ? `${data.margin_level.toFixed(2)}%`
                      : "No active margin",
                },
                {
                  label: "Credit",
                  value: formatMoney(
                    data.credit,
                    data.currency,
                  ),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
                >
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    {item.label}
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                Account Profile
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Trading account configuration
            </p>
          </div>

          <div className="space-y-3 p-5">
            {[
              {
                label: "Account Name",
                value:
                  data.name || "Not provided",
              },
              {
                label: "Broker",
                value:
                  data.company || "Not provided",
              },
              {
                label: "Server",
                value:
                  data.server || "Not provided",
              },
              {
                label: "Currency",
                value:
                  data.currency,
              },
              {
                label: "Leverage",
                value:
                  `1:${data.leverage}`,
              },
              {
                label: "Expert Trading",
                value:
                  data.trade_expert
                    ? "Enabled"
                    : "Disabled",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
              >
                <p className="text-sm text-[var(--foreground-muted)]">
                  {item.label}
                </p>

                <p className="max-w-[60%] truncate text-right text-sm font-semibold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-3">
            {data.trade_allowed ? (
              <CircleCheck className="h-5 w-5 text-[var(--success)]" />
            ) : (
              <CircleOff className="h-5 w-5 text-[var(--danger)]" />
            )}

            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Trading Permission
              </p>

              <p className="mt-1 font-semibold">
                {data.trade_allowed
                  ? "Trading allowed by MT5"
                  : "Trading blocked by MT5"}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-[var(--accent)]" />

            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Account Currency
              </p>

              <p className="mt-1 font-semibold">
                {data.currency}
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}