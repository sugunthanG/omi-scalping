"use client";

import {
  Activity,
  AlertTriangle,
  Clock3,
  LoaderCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useMarketData,
} from "@/hooks/use-market-data";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  cn,
} from "@/lib/cn";

import type {
  MarketCandle,
} from "@/types/api";


function formatPrice(
  value: number | null | undefined,
  digits = 3,
): string {
  if (
    value === null
    || value === undefined
    || Number.isNaN(value)
  ) {
    return "—";
  }

  return value.toFixed(digits);
}


function formatCandleTime(
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

  return parsedDate.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}


interface ChartTooltipProps {
  active?: boolean;

  payload?: Array<{
    payload: MarketCandle;
  }>;
}


function MarketChartTooltip({
  active,
  payload,
}: ChartTooltipProps) {
  if (
    !active
    || !payload
    || payload.length === 0
  ) {
    return null;
  }

  const candle = payload[0].payload;

  return (
    <div className="min-w-56 rounded-xl border border-[var(--border-strong)] bg-[rgba(10,16,25,0.96)] p-4 shadow-2xl backdrop-blur-xl">
      <p className="mb-3 text-xs font-semibold text-[var(--foreground-muted)]">
        {new Date(
          candle.time,
        ).toLocaleString()}
      </p>

      <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-xs">
        <span className="text-[var(--foreground-subtle)]">
          Open
        </span>

        <span className="text-right font-semibold">
          {formatPrice(candle.Open)}
        </span>

        <span className="text-[var(--foreground-subtle)]">
          High
        </span>

        <span className="text-right font-semibold text-[var(--success)]">
          {formatPrice(candle.High)}
        </span>

        <span className="text-[var(--foreground-subtle)]">
          Low
        </span>

        <span className="text-right font-semibold text-[var(--danger)]">
          {formatPrice(candle.Low)}
        </span>

        <span className="text-[var(--foreground-subtle)]">
          Close
        </span>

        <span className="text-right font-semibold text-[var(--accent)]">
          {formatPrice(candle.Close)}
        </span>

        <span className="text-[var(--foreground-subtle)]">
          Spread
        </span>

        <span className="text-right font-semibold">
          {formatPrice(
            candle.Spread,
            4,
          )}
        </span>

        <span className="text-[var(--foreground-subtle)]">
          Volume
        </span>

        <span className="text-right font-semibold">
          {candle.Volume}
        </span>
      </div>
    </div>
  );
}


export function XauusdMarketChart() {
  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useMarketData({
    symbol: "XAUUSDm",
    timeframe: "1m",
  });

  if (isPending) {
    return (
      <article className="min-h-[520px] rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex min-h-[520px] items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-medium">
              Loading XAUUSD market data
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Reading candles through FastAPI
            </p>
          </div>
        </div>
      </article>
    );
  }

  if (isError) {
    return (
      <article className="rounded-3xl border border-[color:rgba(239,98,98,0.28)] bg-[color:rgba(239,98,98,0.06)] p-6">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />

          <div>
            <h2 className="font-semibold text-[var(--danger)]">
              Market data unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "Unable to load XAUUSD market data."}
            </p>

            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      </article>
    );
  }

  const candles = data ?? [];

  if (candles.length === 0) {
    return (
      <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <Activity className="mx-auto h-9 w-9 text-[var(--foreground-subtle)]" />

        <h2 className="mt-4 font-semibold">
          No market candles available
        </h2>
      </article>
    );
  }

  const visibleCandles = candles.slice(-120);

  const latestCandle =
    visibleCandles[
      visibleCandles.length - 1
    ];

  const previousCandle =
    visibleCandles.length > 1
      ? visibleCandles[
          visibleCandles.length - 2
        ]
      : latestCandle;

  const priceChange =
    latestCandle.Close
    - previousCandle.Close;

  const priceChangePercent =
    previousCandle.Close !== 0
      ? (
          priceChange
          / previousCandle.Close
        ) * 100
      : 0;

  const bullish =
    priceChange >= 0;

  const chartLow = Math.min(
    ...visibleCandles.map(
      (candle) => candle.Low,
    ),
  );

  const chartHigh = Math.max(
    ...visibleCandles.map(
      (candle) => candle.High,
    ),
  );

  const chartPadding = Math.max(
    (
      chartHigh
      - chartLow
    ) * 0.08,
    0.5,
  );

  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold">
                XAUUSD Live Market
              </h2>

              <StatusBadge tone="accent">
                M1
              </StatusBadge>

              <StatusBadge tone="success">
                Live API
              </StatusBadge>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
              <p className="text-3xl font-semibold tracking-tight">
                {formatPrice(
                  latestCandle.Close,
                )}
              </p>

              <div
                className={cn(
                  "flex items-center gap-1.5 pb-1 text-sm font-semibold",
                  bullish
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]",
                )}
              >
                {bullish ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}

                <span>
                  {bullish ? "+" : ""}
                  {formatPrice(
                    priceChange,
                    3,
                  )}
                </span>

                <span>
                  (
                  {bullish ? "+" : ""}
                  {priceChangePercent.toFixed(3)}
                  %)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                Bid
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--success)]">
                {formatPrice(
                  latestCandle.Bid,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                Ask
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--danger)]">
                {formatPrice(
                  latestCandle.Ask,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                Spread
              </p>

              <p className="mt-1 text-sm font-semibold text-[var(--warning)]">
                {formatPrice(
                  latestCandle.Spread,
                  4,
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              disabled={isFetching}
              className="flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-xs font-semibold text-[var(--foreground-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  isFetching
                    && "animate-spin",
                )}
              />

              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="h-[430px] px-2 py-5 sm:px-5">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={visibleCandles}
            margin={{
              top: 10,
              right: 12,
              bottom: 4,
              left: 4,
            }}
          >
            <CartesianGrid
              stroke="rgba(103, 119, 141, 0.13)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tickFormatter={
                formatCandleTime
              }
              minTickGap={34}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "#667386",
                fontSize: 11,
              }}
            />

            <YAxis
              domain={[
                chartLow
                  - chartPadding,
                chartHigh
                  + chartPadding,
              ]}
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={72}
              tick={{
                fill: "#667386",
                fontSize: 11,
              }}
              tickFormatter={(
                value: number,
              ) =>
                value.toFixed(2)
              }
            />

            <Tooltip
              content={
                <MarketChartTooltip />
              }
            />

            <ReferenceLine
              y={latestCandle.Bid}
              stroke="#32c48d"
              strokeDasharray="5 5"
              strokeOpacity={0.65}
            />

            <ReferenceLine
              y={latestCandle.Ask}
              stroke="#ef6262"
              strokeDasharray="5 5"
              strokeOpacity={0.55}
            />

            <Line
              type="monotone"
              dataKey="Close"
              stroke="#d9a441"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 0,
                fill: "#e6b753",
              }}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="Bid"
              stroke="#32c48d"
              strokeWidth={1}
              strokeOpacity={0.55}
              dot={false}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="Ask"
              stroke="#ef6262"
              strokeWidth={1}
              strokeOpacity={0.45}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-[var(--border)] px-5 py-4 text-xs text-[var(--foreground-subtle)] sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />

          <span>
            Latest candle:{" "}
            {new Date(
              latestCandle.time,
            ).toLocaleString()}
          </span>
        </div>

        <span>
          API refreshed:{" "}
          {dataUpdatedAt > 0
            ? new Date(
                dataUpdatedAt,
              ).toLocaleTimeString()
            : "Not available"}
        </span>
      </div>
    </article>
  );
}