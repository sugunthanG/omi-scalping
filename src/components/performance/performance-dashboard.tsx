"use client";

import {
  Activity,
  BarChart3,
  CircleOff,
  Gauge,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useClosedTradeHistory,
} from "@/hooks/use-closed-trade-history";

import {
  cn,
} from "@/lib/cn";

import type {
  ClosedTrade,
} from "@/types/api";


type PerformancePeriod =
  | 7
  | 30
  | 90
  | 180
  | 365;


interface EquityPoint {
  index: number;
  date: string;
  shortDate: string;
  equity: number;
  result: number;
}


interface DailyPerformancePoint {
  date: string;
  shortDate: string;
  profit: number;
  trades: number;
}


interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;

  netProfit: number;
  grossProfit: number;
  grossLoss: number;

  winRate: number;
  averageTrade: number;
  averageWin: number;
  averageLoss: number;

  profitFactor: number | null;

  maximumDrawdown: number;
  maximumDrawdownPercent: number;

  bestTrade: number;
  worstTrade: number;

  consecutiveWins: number;
  consecutiveLosses: number;
}


const periodOptions: Array<{
  label: string;
  value: PerformancePeriod;
}> = [
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
  {
    label: "6 Months",
    value: 180,
  },
  {
    label: "1 Year",
    value: 365,
  },
];


function formatMoney(
  value: number,
): string {
  const prefix =
    value > 0
      ? "+"
      : "";

  return `${prefix}${value.toFixed(2)}`;
}


function formatCompactDate(
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

  return parsedDate.toLocaleDateString(
    [],
    {
      day: "2-digit",
      month: "short",
    },
  );
}


function buildEquityCurve(
  trades: ClosedTrade[],
): EquityPoint[] {
  const chronologicalTrades =
    [...trades].sort(
      (
        first,
        second,
      ) => {
        const firstTime =
          first.closed_at
            ? new Date(
                first.closed_at,
              ).getTime()
            : 0;

        const secondTime =
          second.closed_at
            ? new Date(
                second.closed_at,
              ).getTime()
            : 0;

        return (
          firstTime
          - secondTime
        );
      },
    );

  let equity = 0;

  return chronologicalTrades.map(
    (
      trade,
      index,
    ) => {
      equity +=
        trade.net_result;

      const date =
        trade.closed_at
        ?? `Trade ${index + 1}`;

      return {
        index:
          index + 1,

        date,

        shortDate:
          trade.closed_at
            ? formatCompactDate(
                trade.closed_at,
              )
            : `${index + 1}`,

        equity:
          Number(
            equity.toFixed(2),
          ),

        result:
          Number(
            trade.net_result.toFixed(2),
          ),
      };
    },
  );
}


function buildDailyPerformance(
  trades: ClosedTrade[],
): DailyPerformancePoint[] {
  const dailyMap =
    new Map<
      string,
      {
        profit: number;
        trades: number;
      }
    >();

  for (
    const trade
    of trades
  ) {
    if (!trade.closed_at) {
      continue;
    }

    const parsedDate =
      new Date(
        trade.closed_at,
      );

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      continue;
    }

    const dateKey =
      parsedDate
        .toISOString()
        .slice(
          0,
          10,
        );

    const current =
      dailyMap.get(
        dateKey,
      )
      ?? {
        profit: 0,
        trades: 0,
      };

    current.profit +=
      trade.net_result;

    current.trades += 1;

    dailyMap.set(
      dateKey,
      current,
    );
  }

  return Array.from(
    dailyMap.entries(),
  )
    .sort(
      (
        first,
        second,
      ) =>
        first[0].localeCompare(
          second[0],
        ),
    )
    .map(
      ([
        date,
        value,
      ]) => ({
        date,

        shortDate:
          formatCompactDate(
            date,
          ),

        profit:
          Number(
            value.profit.toFixed(2),
          ),

        trades:
          value.trades,
      }),
    );
}


function calculateMaximumDrawdown(
  equityCurve: EquityPoint[],
): {
  amount: number;
  percent: number;
} {
  let peak = 0;
  let maximumDrawdown = 0;
  let maximumDrawdownPercent = 0;

  for (
    const point
    of equityCurve
  ) {
    peak = Math.max(
      peak,
      point.equity,
    );

    const drawdown =
      peak - point.equity;

    if (
      drawdown
      > maximumDrawdown
    ) {
      maximumDrawdown =
        drawdown;
    }

    if (peak > 0) {
      const drawdownPercent =
        (
          drawdown
          / peak
        ) * 100;

      if (
        drawdownPercent
        > maximumDrawdownPercent
      ) {
        maximumDrawdownPercent =
          drawdownPercent;
      }
    }
  }

  return {
    amount:
      Number(
        maximumDrawdown.toFixed(2),
      ),

    percent:
      Number(
        maximumDrawdownPercent.toFixed(2),
      ),
  };
}


function calculateLongestSequence(
  trades: ClosedTrade[],
  target: "WIN" | "LOSS",
): number {
  const chronologicalTrades =
    [...trades].sort(
      (
        first,
        second,
      ) => {
        const firstTime =
          first.closed_at
            ? new Date(
                first.closed_at,
              ).getTime()
            : 0;

        const secondTime =
          second.closed_at
            ? new Date(
                second.closed_at,
              ).getTime()
            : 0;

        return (
          firstTime
          - secondTime
        );
      },
    );

  let current = 0;
  let longest = 0;

  for (
    const trade
    of chronologicalTrades
  ) {
    const matchesTarget =
      target === "WIN"
        ? trade.net_result > 0
        : trade.net_result < 0;

    if (matchesTarget) {
      current += 1;

      longest = Math.max(
        longest,
        current,
      );
    } else {
      current = 0;
    }
  }

  return longest;
}


function calculateMetrics(
  trades: ClosedTrade[],
  equityCurve: EquityPoint[],
): PerformanceMetrics {
  const winningTrades =
    trades.filter(
      (trade) =>
        trade.net_result > 0,
    );

  const losingTrades =
    trades.filter(
      (trade) =>
        trade.net_result < 0,
    );

  const breakEvenTrades =
    trades.filter(
      (trade) =>
        trade.net_result === 0,
    );

  const netProfit =
    trades.reduce(
      (
        total,
        trade,
      ) =>
        total
        + trade.net_result,
      0,
    );

  const grossProfit =
    winningTrades.reduce(
      (
        total,
        trade,
      ) =>
        total
        + trade.net_result,
      0,
    );

  const grossLoss =
    Math.abs(
      losingTrades.reduce(
        (
          total,
          trade,
        ) =>
          total
          + trade.net_result,
        0,
      ),
    );

  const averageWin =
    winningTrades.length > 0
      ? (
          grossProfit
          / winningTrades.length
        )
      : 0;

  const averageLoss =
    losingTrades.length > 0
      ? (
          grossLoss
          / losingTrades.length
        )
      : 0;

  const drawdown =
    calculateMaximumDrawdown(
      equityCurve,
    );

  const results =
    trades.map(
      (trade) =>
        trade.net_result,
    );

  return {
    totalTrades:
      trades.length,

    winningTrades:
      winningTrades.length,

    losingTrades:
      losingTrades.length,

    breakEvenTrades:
      breakEvenTrades.length,

    netProfit:
      Number(
        netProfit.toFixed(2),
      ),

    grossProfit:
      Number(
        grossProfit.toFixed(2),
      ),

    grossLoss:
      Number(
        grossLoss.toFixed(2),
      ),

    winRate:
      trades.length > 0
        ? Number(
            (
              (
                winningTrades.length
                / trades.length
              )
              * 100
            ).toFixed(2),
          )
        : 0,

    averageTrade:
      trades.length > 0
        ? Number(
            (
              netProfit
              / trades.length
            ).toFixed(2),
          )
        : 0,

    averageWin:
      Number(
        averageWin.toFixed(2),
      ),

    averageLoss:
      Number(
        averageLoss.toFixed(2),
      ),

    profitFactor:
      grossLoss > 0
        ? Number(
            (
              grossProfit
              / grossLoss
            ).toFixed(2),
          )
        : grossProfit > 0
          ? null
          : 0,

    maximumDrawdown:
      drawdown.amount,

    maximumDrawdownPercent:
      drawdown.percent,

    bestTrade:
      results.length > 0
        ? Math.max(
            ...results,
          )
        : 0,

    worstTrade:
      results.length > 0
        ? Math.min(
            ...results,
          )
        : 0,

    consecutiveWins:
      calculateLongestSequence(
        trades,
        "WIN",
      ),

    consecutiveLosses:
      calculateLongestSequence(
        trades,
        "LOSS",
      ),
  };
}


interface EquityTooltipProps {
  active?: boolean;

  payload?: Array<{
    payload: EquityPoint;
  }>;
}


function EquityTooltip({
  active,
  payload,
}: EquityTooltipProps) {
  if (
    !active
    || !payload
    || payload.length === 0
  ) {
    return null;
  }

  const point =
    payload[0].payload;

  return (
    <div className="rounded-xl border border-[var(--border-strong)] bg-[rgba(8,13,21,0.96)] p-4 shadow-2xl">
      <p className="text-xs text-[var(--foreground-subtle)]">
        {point.date.startsWith(
          "Trade ",
        )
          ? point.date
          : new Date(
              point.date,
            ).toLocaleString()}
      </p>

      <p className="mt-2 text-sm font-semibold">
        Equity:{" "}
        <span
          className={
            point.equity >= 0
              ? "text-[var(--success)]"
              : "text-[var(--danger)]"
          }
        >
          {formatMoney(
            point.equity,
          )}
        </span>
      </p>

      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
        Trade result:{" "}
        {formatMoney(
          point.result,
        )}
      </p>
    </div>
  );
}


interface DailyTooltipProps {
  active?: boolean;

  payload?: Array<{
    payload: DailyPerformancePoint;
  }>;
}


function DailyTooltip({
  active,
  payload,
}: DailyTooltipProps) {
  if (
    !active
    || !payload
    || payload.length === 0
  ) {
    return null;
  }

  const point =
    payload[0].payload;

  return (
    <div className="rounded-xl border border-[var(--border-strong)] bg-[rgba(8,13,21,0.96)] p-4 shadow-2xl">
      <p className="text-xs text-[var(--foreground-subtle)]">
        {new Date(
          point.date,
        ).toLocaleDateString()}
      </p>

      <p
        className={cn(
          "mt-2 text-sm font-semibold",
          point.profit >= 0
            ? "text-[var(--success)]"
            : "text-[var(--danger)]",
        )}
      >
        {formatMoney(
          point.profit,
        )}
      </p>

      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
        {point.trades} closed trades
      </p>
    </div>
  );
}


export function PerformanceDashboard() {
  const [
    days,
    setDays,
  ] = useState<PerformancePeriod>(
    90,
  );

  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useClosedTradeHistory({
    days,
    limit: 1000,
  });

  const trades =
    data?.data ?? [];

  const equityCurve =
    useMemo(
      () =>
        buildEquityCurve(
          trades,
        ),
      [
        trades,
      ],
    );

  const dailyPerformance =
    useMemo(
      () =>
        buildDailyPerformance(
          trades,
        ),
      [
        trades,
      ],
    );

  const metrics =
    useMemo(
      () =>
        calculateMetrics(
          trades,
          equityCurve,
        ),
      [
        trades,
        equityCurve,
      ],
    );

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-80 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-medium">
              Calculating performance
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Reading completed trades from MT5 history
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
              Performance data unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "Unable to load OMI performance data."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================
          PERIOD CONTROL
      ===================================== */}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-[var(--accent)]" />

          <div>
            <p className="text-sm font-semibold">
              Performance period
            </p>

            <p className="text-xs text-[var(--foreground-subtle)]">
              Analytics calculated from completed MT5 trades
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
            className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-xs font-semibold text-[var(--foreground-muted)] disabled:opacity-60"
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
          PRIMARY METRICS
      ===================================== */}

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
                  metrics.netProfit >= 0
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]",
                )}
              >
                {formatMoney(
                  metrics.netProfit,
                )}
              </p>
            </div>

            {metrics.netProfit >= 0 ? (
              <TrendingUp className="h-5 w-5 text-[var(--success)]" />
            ) : (
              <TrendingDown className="h-5 w-5 text-[var(--danger)]" />
            )}
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Gross profit {formatMoney(metrics.grossProfit)}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Win Rate
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {metrics.winRate.toFixed(2)}%
              </p>
            </div>

            <Trophy className="h-5 w-5 text-[var(--accent)]" />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            {metrics.winningTrades} wins from {metrics.totalTrades} trades
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Profit Factor
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {metrics.profitFactor === null
                  ? "∞"
                  : metrics.profitFactor.toFixed(2)}
              </p>
            </div>

            <Gauge className="h-5 w-5 text-[var(--info)]" />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            Gross loss -{metrics.grossLoss.toFixed(2)}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Maximum Drawdown
              </p>

              <p className="mt-3 text-2xl font-semibold text-[var(--danger)]">
                -{metrics.maximumDrawdown.toFixed(2)}
              </p>
            </div>

            <TrendingDown className="h-5 w-5 text-[var(--danger)]" />
          </div>

          <p className="mt-5 text-xs text-[var(--foreground-subtle)]">
            {metrics.maximumDrawdownPercent.toFixed(2)}% from peak
          </p>
        </article>
      </section>

      {trades.length === 0 ? (
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <CircleOff className="mx-auto h-10 w-10 text-[var(--foreground-subtle)]" />

          <h2 className="mt-4 text-lg font-semibold">
            No performance records
          </h2>

          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            No completed trades were found for the selected period.
          </p>
        </section>
      ) : (
        <>
          {/* =====================================
              CHARTS
          ===================================== */}

          <section className="grid gap-6 2xl:grid-cols-[1.35fr_1fr]">
            <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="border-b border-[var(--border)] px-6 py-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[var(--accent)]" />

                  <h2 className="font-semibold">
                    Cumulative Performance
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                  Running net result across completed trades
                </p>
              </div>

              <div className="h-[390px] p-4 sm:p-6">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={equityCurve}
                    margin={{
                      top: 10,
                      right: 12,
                      left: 4,
                      bottom: 4,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="omiEquityGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#d9a441"
                          stopOpacity={0.34}
                        />

                        <stop
                          offset="95%"
                          stopColor="#d9a441"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="rgba(103,119,141,0.13)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="shortDate"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                      tick={{
                        fill: "#667386",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={65}
                      tick={{
                        fill: "#667386",
                        fontSize: 11,
                      }}
                      tickFormatter={(
                        value: number,
                      ) =>
                        value.toFixed(0)
                      }
                    />

                    <Tooltip
                      content={
                        <EquityTooltip />
                      }
                    />

                    <ReferenceLine
                      y={0}
                      stroke="rgba(203,211,222,0.32)"
                      strokeDasharray="4 4"
                    />

                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="#d9a441"
                      strokeWidth={2}
                      fill="url(#omiEquityGradient)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        strokeWidth: 0,
                        fill: "#e6b753",
                      }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="border-b border-[var(--border)] px-6 py-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[var(--accent)]" />

                  <h2 className="font-semibold">
                    Daily Profit and Loss
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                  Net result grouped by closing date
                </p>
              </div>

              <div className="h-[390px] p-4 sm:p-6">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={dailyPerformance}
                    margin={{
                      top: 10,
                      right: 8,
                      left: 0,
                      bottom: 4,
                    }}
                  >
                    <CartesianGrid
                      stroke="rgba(103,119,141,0.13)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="shortDate"
                      tickLine={false}
                      axisLine={false}
                      minTickGap={24}
                      tick={{
                        fill: "#667386",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={58}
                      tick={{
                        fill: "#667386",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      content={
                        <DailyTooltip />
                      }
                    />

                    <ReferenceLine
                      y={0}
                      stroke="rgba(203,211,222,0.32)"
                    />

                    <Bar
                      dataKey="profit"
                      radius={[
                        5,
                        5,
                        0,
                        0,
                      ]}
                      isAnimationActive={false}
                    >
                      {dailyPerformance.map(
                        (point) => (
                          <Cell
                            key={point.date}
                            fill={
                              point.profit >= 0
                                ? "#32c48d"
                                : "#ef6262"
                            }
                          />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          {/* =====================================
              SECONDARY METRICS
          ===================================== */}

          <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-6 py-5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--accent)]" />

                <h2 className="font-semibold">
                  Trading Statistics
                </h2>
              </div>

              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                Useful performance measurements from closed trades
              </p>
            </div>

            <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Average Trade",
                  value:
                    formatMoney(
                      metrics.averageTrade,
                    ),
                  tone:
                    metrics.averageTrade >= 0
                      ? "success"
                      : "danger",
                },
                {
                  label: "Average Win",
                  value:
                    formatMoney(
                      metrics.averageWin,
                    ),
                  tone: "success",
                },
                {
                  label: "Average Loss",
                  value:
                    `-${metrics.averageLoss.toFixed(2)}`,
                  tone: "danger",
                },
                {
                  label: "Best Trade",
                  value:
                    formatMoney(
                      metrics.bestTrade,
                    ),
                  tone: "success",
                },
                {
                  label: "Worst Trade",
                  value:
                    formatMoney(
                      metrics.worstTrade,
                    ),
                  tone: "danger",
                },
                {
                  label: "Longest Win Sequence",
                  value:
                    metrics.consecutiveWins.toString(),
                  tone: "success",
                },
                {
                  label: "Longest Loss Sequence",
                  value:
                    metrics.consecutiveLosses.toString(),
                  tone: "danger",
                },
                {
                  label: "Break-even Trades",
                  value:
                    metrics.breakEvenTrades.toString(),
                  tone: "neutral",
                },
              ].map(
                (item) => (
                  <div
                    key={item.label}
                    className="bg-[var(--surface)] p-5"
                  >
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {item.label}
                    </p>

                    <p
                      className={cn(
                        "mt-3 text-xl font-semibold",
                        item.tone === "success"
                          ? "text-[var(--success)]"
                          : item.tone === "danger"
                            ? "text-[var(--danger)]"
                            : "text-[var(--foreground)]",
                      )}
                    >
                      {item.value}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <article className="rounded-2xl border border-[color:rgba(241,185,76,0.24)] bg-[color:rgba(241,185,76,0.07)] p-5">
            <p className="text-sm font-semibold text-[var(--warning)]">
              Average risk-to-reward is awaiting trade-level entry data
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              The closed-history API currently provides close price and
              result, but not each trade&apos;s original entry, stop loss
              and take profit. OMI will display average RR only after those
              fields are available from a verified backend source.
            </p>
          </article>
        </>
      )}
    </div>
  );
}