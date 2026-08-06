"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleOff,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useClosedTradeHistory,
} from "@/hooks/use-closed-trade-history";

import {
  cn,
} from "@/lib/cn";


const periodOptions = [
  {
    label: "Today",
    value: 1,
  },
  {
    label: "7 Days",
    value: 7,
  },
  {
    label: "30 Days",
    value: 30,
  },
  {
    label: "90 Days",
    value: 90,
  },
] as const;


function formatMoney(
  value: number,
): string {
  const prefix =
    value > 0
      ? "+"
      : "";

  return `${prefix}${value.toFixed(2)}`;
}


function formatPrice(
  value: number,
): string {
  return value.toFixed(3);
}


function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "—";
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


export function TradeHistoryDashboard() {
  const [
    days,
    setDays,
  ] = useState(30);

  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useClosedTradeHistory({
    days,
    limit: 500,
  });

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-72 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-medium">
              Loading closed trades
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
              Trade history unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "Unable to load closed-trade history."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const trades =
    data?.data ?? [];

  const summary =
    data?.summary ?? {
      total_profit: 0,
      winning_trades: 0,
      losing_trades: 0,
      break_even_trades: 0,
      win_rate: 0,
    };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-[var(--accent)]" />

          <div>
            <p className="text-sm font-semibold">
              History period
            </p>

            <p className="text-xs text-[var(--foreground-subtle)]">
              Select the MT5 closed-trade range
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {periodOptions.map(
            (option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setDays(
                    option.value,
                  );
                }}
                className={cn(
                  "h-9 rounded-lg border px-3 text-xs font-semibold transition",
                  days === option.value
                    ? "border-[color:rgba(217,164,65,0.32)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                )}
              >
                {option.label}
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Net Profit
              </p>

              <p
                className={cn(
                  "mt-3 text-2xl font-semibold",
                  summary.total_profit >= 0
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]",
                )}
              >
                {formatMoney(
                  summary.total_profit,
                )}
              </p>
            </div>

            {summary.total_profit >= 0 ? (
              <TrendingUp className="h-5 w-5 text-[var(--success)]" />
            ) : (
              <TrendingDown className="h-5 w-5 text-[var(--danger)]" />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Win Rate
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {summary.win_rate.toFixed(2)}%
              </p>
            </div>

            <Trophy className="h-5 w-5 text-[var(--accent)]" />
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Winning Trades
              </p>

              <p className="mt-3 text-2xl font-semibold text-[var(--success)]">
                {summary.winning_trades}
              </p>
            </div>

            <ArrowUpRight className="h-5 w-5 text-[var(--success)]" />
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Losing Trades
              </p>

              <p className="mt-3 text-2xl font-semibold text-[var(--danger)]">
                {summary.losing_trades}
              </p>
            </div>

            <ArrowDownRight className="h-5 w-5 text-[var(--danger)]" />
          </div>
        </article>
      </section>

      {trades.length === 0 ? (
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <CircleOff className="mx-auto h-10 w-10 text-[var(--foreground-subtle)]" />

          <h2 className="mt-4 text-lg font-semibold">
            No closed trades
          </h2>

          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            No completed MT5 trades were found for this period.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[var(--accent)]" />

                <h2 className="font-semibold">
                  Closed Trades
                </h2>
              </div>

              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                Completed MT5 exit deals
              </p>
            </div>

            <StatusBadge tone="info">
              {trades.length} records
            </StatusBadge>
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
                  {[
                    "Closed",
                    "Symbol",
                    "Direction",
                    "Volume",
                    "Close Price",
                    "Profit",
                    "Commission",
                    "Swap",
                    "Net Result",
                    "Comment",
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
                {trades.map(
                  (trade) => (
                    <tr
                      key={trade.deal_ticket}
                      className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-elevated)]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm">
                        {formatDateTime(
                          trade.closed_at,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold">
                        {trade.symbol}
                      </td>

                      <td className="px-5 py-4">
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
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {trade.volume.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {formatPrice(
                          trade.close_price,
                        )}
                      </td>

                      <td
                        className={cn(
                          "px-5 py-4 text-sm",
                          trade.profit >= 0
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]",
                        )}
                      >
                        {formatMoney(
                          trade.profit,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--foreground-muted)]">
                        {trade.commission.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--foreground-muted)]">
                        {trade.swap.toFixed(2)}
                      </td>

                      <td
                        className={cn(
                          "px-5 py-4 text-sm font-semibold",
                          trade.net_result >= 0
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]",
                        )}
                      >
                        {formatMoney(
                          trade.net_result,
                        )}
                      </td>

                      <td className="max-w-52 truncate px-5 py-4 text-sm text-[var(--foreground-muted)]">
                        {trade.comment || "—"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 p-4 lg:hidden">
            {trades.map(
              (trade) => (
                <article
                  key={trade.deal_ticket}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        {trade.symbol}
                      </p>

                      <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                        {formatDateTime(
                          trade.closed_at,
                        )}
                      </p>
                    </div>

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
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Volume
                      </p>

                      <p className="mt-1 font-semibold">
                        {trade.volume.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Close Price
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatPrice(
                          trade.close_price,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Profit
                      </p>

                      <p
                        className={cn(
                          "mt-1 font-semibold",
                          trade.profit >= 0
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]",
                        )}
                      >
                        {formatMoney(
                          trade.profit,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--foreground-subtle)]">
                        Net Result
                      </p>

                      <p
                        className={cn(
                          "mt-1 font-semibold",
                          trade.net_result >= 0
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]",
                        )}
                      >
                        {formatMoney(
                          trade.net_result,
                        )}
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