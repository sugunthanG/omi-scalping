"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CircleOff,
  Clock3,
  Gauge,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Timer,
  TrendingDown,
  TrendingUp,
  Waves,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useMarketData,
} from "@/hooks/use-market-data";

import {
  useRiskStatus,
} from "@/hooks/use-risk-status";

import {
  cn,
} from "@/lib/cn";

import type {
  MarketCandle,
} from "@/types/api";


type SessionName =
  | "ASIAN"
  | "ASIAN_LONDON_OVERLAP"
  | "LONDON"
  | "LONDON_NEWYORK_OVERLAP"
  | "NEWYORK";


interface SessionInformation {
  name: SessionName;
  label: string;
  rule: string;
}


function getUtcHour(): number {
  return new Date().getUTCHours();
}


function getSessionInformation(): SessionInformation {
  const hour =
    getUtcHour();

  if (
    hour >= 7
    && hour < 9
  ) {
    return {
      name: "ASIAN_LONDON_OVERLAP",
      label: "Asian–London Transition",
      rule: "ELITE signals only",
    };
  }

  if (
    hour >= 9
    && hour < 12
  ) {
    return {
      name: "LONDON",
      label: "Pure London",
      rule: "GOOD becomes STRONG; STRONG and ELITE allowed",
    };
  }

  if (
    hour >= 12
    && hour < 16
  ) {
    return {
      name: "LONDON_NEWYORK_OVERLAP",
      label: "London–New York Overlap",
      rule: "ELITE signals only",
    };
  }

  if (
    hour >= 16
    && hour < 21
  ) {
    return {
      name: "NEWYORK",
      label: "Pure New York",
      rule: "STRONG and ELITE signals only",
    };
  }

  return {
    name: "ASIAN",
    label: "Asian Session",
    rule: "ELITE signals only",
  };
}


function formatPrice(
  value:
    | number
    | null
    | undefined,
  digits = 3,
): string {
  if (
    value === null
    || value === undefined
    || Number.isNaN(value)
  ) {
    return "—";
  }

  return value.toFixed(
    digits,
  );
}


function formatPercent(
  value:
    | number
    | null
    | undefined,
): string {
  if (
    value === null
    || value === undefined
    || Number.isNaN(value)
  ) {
    return "—";
  }

  return `${(
    value * 100
  ).toFixed(1)}%`;
}


function getLatestCandle(
  candles:
    | MarketCandle[]
    | undefined,
): MarketCandle | null {
  if (
    !candles
    || candles.length === 0
  ) {
    return null;
  }

  return candles[
    candles.length - 1
  ];
}


function getCandleAgeSeconds(
  candle:
    | MarketCandle
    | null,
): number {
  if (!candle) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp =
    new Date(
      candle.time,
    ).getTime();

  if (
    Number.isNaN(timestamp)
  ) {
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


function formatAge(
  ageSeconds: number,
): string {
  if (
    !Number.isFinite(
      ageSeconds,
    )
  ) {
    return "Unavailable";
  }

  if (ageSeconds < 60) {
    return `${ageSeconds}s`;
  }

  const minutes =
    Math.floor(
      ageSeconds / 60,
    );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  return `${hours}h ${minutes % 60}m`;
}


function getDirection(
  candle:
    | MarketCandle
    | null,
): "BULLISH" | "BEARISH" | "NEUTRAL" {
  if (!candle) {
    return "NEUTRAL";
  }

  if (
    candle.Close
    > candle.Open
  ) {
    return "BULLISH";
  }

  if (
    candle.Close
    < candle.Open
  ) {
    return "BEARISH";
  }

  return "NEUTRAL";
}


function getPressureDirection(
  candle:
    | MarketCandle
    | null,
): "BUYING" | "SELLING" | "BALANCED" {
  if (!candle) {
    return "BALANCED";
  }

  if (
    candle.PressureDelta
    > 0.08
  ) {
    return "BUYING";
  }

  if (
    candle.PressureDelta
    < -0.08
  ) {
    return "SELLING";
  }

  return "BALANCED";
}


function getVolatilityState(
  candle:
    | MarketCandle
    | null,
): "LOW" | "NORMAL" | "EXPANDING" | "HIGH" {
  if (!candle) {
    return "NORMAL";
  }

  const expansion =
    candle.VolatilityExpansion;

  if (expansion < 0.7) {
    return "LOW";
  }

  if (expansion < 1.3) {
    return "NORMAL";
  }

  if (expansion < 2) {
    return "EXPANDING";
  }

  return "HIGH";
}


function getTradingWindowStatus(): {
  allowed: boolean;
  label: string;
} {
  const now =
    new Date();

  const weekday =
    now.getDay();

  const localHour =
    now.getHours();

  if (
    weekday === 0
    || weekday === 6
  ) {
    return {
      allowed: false,
      label: "Weekend closed",
    };
  }

  if (
    weekday === 5
  ) {
    if (
      localHour >= 9
      && localHour < 19
    ) {
      return {
        allowed: true,
        label: "Friday window open",
      };
    }

    return {
      allowed: false,
      label: "Friday window closed",
    };
  }

  if (
    localHour >= 9
    && localHour < 21
  ) {
    return {
      allowed: true,
      label: "Trading window open",
    };
  }

  return {
    allowed: false,
    label: "Trading window closed",
  };
}


export function MarketStatusDashboard() {
  const m1Query =
    useMarketData({
      symbol: "XAUUSDm",
      timeframe: "1m",
      refetchInterval: 10_000,
    });

  const m5Query =
    useMarketData({
      symbol: "XAUUSDm",
      timeframe: "5m",
      refetchInterval: 20_000,
    });

  const riskQuery =
    useRiskStatus();

  const latestM1 =
    getLatestCandle(
      m1Query.data,
    );

  const latestM5 =
    getLatestCandle(
      m5Query.data,
    );

  const session =
    useMemo(
      () =>
        getSessionInformation(),
      [],
    );

  const tradingWindow =
    getTradingWindowStatus();

  const m1Age =
    getCandleAgeSeconds(
      latestM1,
    );

  const m5Age =
    getCandleAgeSeconds(
      latestM5,
    );

  const marketDataFresh =
    m1Age <= 120
    && m5Age <= 600;

  const m1Direction =
    getDirection(
      latestM1,
    );

  const m5Direction =
    getDirection(
      latestM5,
    );

  const pressure =
    getPressureDirection(
      latestM1,
    );

  const volatility =
    getVolatilityState(
      latestM1,
    );

  const isLoading =
    m1Query.isPending
    || m5Query.isPending;

  const isRefreshing =
    m1Query.isFetching
    || m5Query.isFetching
    || riskQuery.isFetching;

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-96 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-semibold">
              Loading XAUUSD market status
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Reading M1 and M5 tick-resampled candles
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    m1Query.isError
    || m5Query.isError
    || !latestM1
    || !latestM5
  ) {
    return (
      <section className="rounded-3xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)] p-6">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />

          <div>
            <h2 className="font-semibold text-[var(--danger)]">
              Market information unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              The OMI backend could not provide both M1 and M5 market data.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const spreadPoints =
    latestM1.Spread;

  const m1Change =
    latestM1.Close
    - latestM1.Open;

  const m5Change =
    latestM5.Close
    - latestM5.Open;

  return (
    <div className="space-y-6">
      {/* =====================================
          LIVE MARKET STATE
      ===================================== */}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border",
              marketDataFresh
                ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.08)] text-[var(--success)]"
                : "border-[color:rgba(241,185,76,0.25)] bg-[color:rgba(241,185,76,0.08)] text-[var(--warning)]",
            )}
          >
            <Activity className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold">
              XAUUSD Market Feed
            </p>

            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Tick-resampled OMI market monitoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge
            tone={
              marketDataFresh
                ? "success"
                : "warning"
            }
          >
            {marketDataFresh
              ? "Market data fresh"
              : "Market data stale"}
          </StatusBadge>

          <StatusBadge
            tone={
              tradingWindow.allowed
                ? "success"
                : "warning"
            }
          >
            {tradingWindow.label}
          </StatusBadge>

          <button
            type="button"
            onClick={() => {
              void Promise.all([
                m1Query.refetch(),
                m5Query.refetch(),
                riskQuery.refetch(),
              ]);
            }}
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
          LIVE PRICES
      ===================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--foreground-muted)]">
            Bid
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {formatPrice(
              latestM1.Bid,
            )}
          </p>

          <p className="mt-4 text-xs text-[var(--foreground-subtle)]">
            SELL execution price
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--foreground-muted)]">
            Ask
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {formatPrice(
              latestM1.Ask,
            )}
          </p>

          <p className="mt-4 text-xs text-[var(--foreground-subtle)]">
            BUY execution price
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Spread
              </p>

              <p className="mt-3 text-3xl font-semibold text-[var(--accent)]">
                {formatPrice(
                  spreadPoints,
                )}
              </p>
            </div>

            <Waves className="h-5 w-5 text-[var(--accent)]" />
          </div>

          <p className="mt-4 text-xs text-[var(--foreground-subtle)]">
            Range {formatPrice(latestM1.SpreadMin)} – {formatPrice(latestM1.SpreadMax)}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--foreground-muted)]">
                Volatility
              </p>

              <p
                className={cn(
                  "mt-3 text-2xl font-semibold",
                  volatility === "HIGH"
                    ? "text-[var(--danger)]"
                    : volatility === "EXPANDING"
                      ? "text-[var(--warning)]"
                      : "text-[var(--foreground)]",
                )}
              >
                {volatility}
              </p>
            </div>

            <BarChart3 className="h-5 w-5 text-[var(--info)]" />
          </div>

          <p className="mt-4 text-xs text-[var(--foreground-subtle)]">
            Expansion {latestM1.VolatilityExpansion.toFixed(2)}×
          </p>
        </article>
      </section>

      {/* =====================================
          TIMEFRAME DIRECTION
      ===================================== */}

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                M1 Market State
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Current one-minute candle
            </p>
          </div>

          <div className="p-5">
            <div
              className={cn(
                "rounded-2xl border p-5",
                m1Direction === "BULLISH"
                  ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.06)]"
                  : m1Direction === "BEARISH"
                    ? "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)]",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    Direction
                  </p>

                  <p
                    className={cn(
                      "mt-2 text-3xl font-semibold",
                      m1Direction === "BULLISH"
                        ? "text-[var(--success)]"
                        : m1Direction === "BEARISH"
                          ? "text-[var(--danger)]"
                          : "text-[var(--foreground)]",
                    )}
                  >
                    {m1Direction}
                  </p>
                </div>

                {m1Direction === "BULLISH" ? (
                  <TrendingUp className="h-8 w-8 text-[var(--success)]" />
                ) : m1Direction === "BEARISH" ? (
                  <TrendingDown className="h-8 w-8 text-[var(--danger)]" />
                ) : (
                  <CircleOff className="h-8 w-8 text-[var(--foreground-subtle)]" />
                )}
              </div>

              <p
                className={cn(
                  "mt-4 text-sm font-semibold",
                  m1Change >= 0
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]",
                )}
              >
                {m1Change >= 0
                  ? "+"
                  : ""}
                {m1Change.toFixed(3)}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Open",
                  value: formatPrice(
                    latestM1.Open,
                  ),
                },
                {
                  label: "High",
                  value: formatPrice(
                    latestM1.High,
                  ),
                },
                {
                  label: "Low",
                  value: formatPrice(
                    latestM1.Low,
                  ),
                },
                {
                  label: "Close",
                  value: formatPrice(
                    latestM1.Close,
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

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                M5 Trend Context
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Five-minute directional confirmation
            </p>
          </div>

          <div className="p-5">
            <div
              className={cn(
                "rounded-2xl border p-5",
                m5Direction === "BULLISH"
                  ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.06)]"
                  : m5Direction === "BEARISH"
                    ? "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)]",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    Direction
                  </p>

                  <p
                    className={cn(
                      "mt-2 text-3xl font-semibold",
                      m5Direction === "BULLISH"
                        ? "text-[var(--success)]"
                        : m5Direction === "BEARISH"
                          ? "text-[var(--danger)]"
                          : "text-[var(--foreground)]",
                    )}
                  >
                    {m5Direction}
                  </p>
                </div>

                {m5Direction === "BULLISH" ? (
                  <ArrowUpRight className="h-8 w-8 text-[var(--success)]" />
                ) : m5Direction === "BEARISH" ? (
                  <ArrowDownRight className="h-8 w-8 text-[var(--danger)]" />
                ) : (
                  <CircleOff className="h-8 w-8 text-[var(--foreground-subtle)]" />
                )}
              </div>

              <p
                className={cn(
                  "mt-4 text-sm font-semibold",
                  m5Change >= 0
                    ? "text-[var(--success)]"
                    : "text-[var(--danger)]",
                )}
              >
                {m5Change >= 0
                  ? "+"
                  : ""}
                {m5Change.toFixed(3)}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {[
                {
                  label: "M1 Direction",
                  value: m1Direction,
                },
                {
                  label: "M5 Direction",
                  value: m5Direction,
                },
                {
                  label: "Alignment",
                  value:
                    m1Direction === m5Direction
                    && m1Direction !== "NEUTRAL"
                      ? "Aligned"
                      : "Mixed",
                },
                {
                  label: "M5 Candle Age",
                  value: formatAge(
                    m5Age,
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
      </section>

      {/* =====================================
          PRESSURE AND SESSION
      ===================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h2 className="font-semibold">
              Tick Pressure
            </h2>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Current M1 buying and selling activity
            </p>
          </div>

          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Buy Pressure
                </p>

                <p className="mt-2 text-xl font-semibold text-[var(--success)]">
                  {formatPercent(
                    latestM1.BuyPressure,
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Sell Pressure
                </p>

                <p className="mt-2 text-xl font-semibold text-[var(--danger)]">
                  {formatPercent(
                    latestM1.SellPressure,
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Pressure State
                </p>

                <p
                  className={cn(
                    "mt-2 text-xl font-semibold",
                    pressure === "BUYING"
                      ? "text-[var(--success)]"
                      : pressure === "SELLING"
                        ? "text-[var(--danger)]"
                        : "text-[var(--foreground)]",
                  )}
                >
                  {pressure}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full bg-[var(--success)]"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        latestM1.BuyPressure
                        * 100,
                        100,
                      ),
                    )}%`,
                  }}
                />

                <div
                  className="h-full bg-[var(--danger)]"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        latestM1.SellPressure
                        * 100,
                        100,
                      ),
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-[var(--foreground-subtle)]">
                Tick delta: {latestM1.TickDelta}
              </p>
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                Trading Session
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              OMI session-quality policy
            </p>
          </div>

          <div className="p-5">
            <div className="rounded-2xl border border-[color:rgba(217,164,65,0.24)] bg-[var(--accent-muted)] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                Current session
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--accent)]">
                {session.label}
              </p>

              <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                {session.rule}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {[
                {
                  label: "UTC Hour",
                  value:
                    `${getUtcHour()
                      .toString()
                      .padStart(2, "0")}:00`,
                },
                {
                  label: "Auto Trade",
                  value:
                    riskQuery.data?.auto_trade
                      ? "Enabled"
                      : "Disabled",
                },
                {
                  label: "Trading Window",
                  value:
                    tradingWindow.label,
                },
                {
                  label: "M1 Data Age",
                  value:
                    formatAge(
                      m1Age,
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
      </section>
    </div>
  );
}