"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  Gauge,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Target,
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
  useMultiTimeframeStatus,
} from "@/hooks/use-multi-timeframe-status";

import {
  useRiskStatus,
} from "@/hooks/use-risk-status";

import {
  cn,
} from "@/lib/cn";

import type {
  MarketCandle,
} from "@/types/api";

import type {
  MarketBias,
  MarketStructure,
  TimeframeContext,
} from "@/services/api/market-status-api";


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


interface TimeframeCardDefinition {
  key:
    | "1m"
    | "5m"
    | "15m"
    | "1h"
    | "4h";

  label: string;

  role: string;
}


const TIMEFRAME_CARDS: TimeframeCardDefinition[] = [
  {
    key: "1m",
    label: "M1",
    role: "Execution",
  },
  {
    key: "5m",
    label: "M5",
    role: "Local Structure",
  },
  {
    key: "15m",
    label: "M15",
    role: "Intraday Structure",
  },
  {
    key: "1h",
    label: "H1",
    role: "Directional Bias",
  },
  {
    key: "4h",
    label: "H4",
    role: "Broader Regime",
  },
];


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


function formatSigned(
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

  const prefix =
    value > 0
      ? "+"
      : "";

  return `${prefix}${value.toFixed(digits)}`;
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
  time:
    | string
    | null
    | undefined,
): number {
  if (!time) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp =
    new Date(
      time,
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

  if (hours < 24) {
    return `${hours}h ${minutes % 60}m`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  return `${days}d ${hours % 24}h`;
}


function getPressureDirection(
  pressureDelta:
    | number
    | null
    | undefined,
): "BUYING" | "SELLING" | "BALANCED" {
  if (
    pressureDelta === null
    || pressureDelta === undefined
  ) {
    return "BALANCED";
  }

  if (
    pressureDelta > 0.08
  ) {
    return "BUYING";
  }

  if (
    pressureDelta < -0.08
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

  if (
    expansion < 0.7
  ) {
    return "LOW";
  }

  if (
    expansion < 1.3
  ) {
    return "NORMAL";
  }

  if (
    expansion < 2
  ) {
    return "EXPANDING";
  }

  return "HIGH";
}


function getBiasClasses(
  bias: MarketBias,
): string {
  if (
    bias === "BULLISH"
  ) {
    return "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.06)] text-[var(--success)]";
  }

  if (
    bias === "BEARISH"
  ) {
    return "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)] text-[var(--danger)]";
  }

  return "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)]";
}


function getStructureTextClass(
  structure: MarketStructure,
): string {
  if (
    structure === "BULLISH"
  ) {
    return "text-[var(--success)]";
  }

  if (
    structure === "BEARISH"
  ) {
    return "text-[var(--danger)]";
  }

  return "text-[var(--warning)]";
}


function getBiasInterpretation(
  context: TimeframeContext,
): string {
  if (
    context.bias === "BULLISH"
    && context.structure === "BULLISH"
  ) {
    return "Bullish trend and structure are aligned.";
  }

  if (
    context.bias === "BEARISH"
    && context.structure === "BEARISH"
  ) {
    return "Bearish trend and structure are aligned.";
  }

  if (
    context.bias === "BULLISH"
    && context.structure === "BEARISH"
  ) {
    return "Bullish directional bias with a bearish pullback structure.";
  }

  if (
    context.bias === "BEARISH"
    && context.structure === "BULLISH"
  ) {
    return "Bearish directional bias with a bullish retracement structure.";
  }

  if (
    context.bias === "BULLISH"
    && context.structure === "MIXED"
  ) {
    return "Bullish bias remains, but structure is currently mixed.";
  }

  if (
    context.bias === "BEARISH"
    && context.structure === "MIXED"
  ) {
    return "Bearish bias remains, but structure is currently mixed.";
  }

  return "No clear directional agreement on this timeframe.";
}


function TimeframeAnalysisCard({
  label,
  role,
  context,
}: {
  label: string;
  role: string;
  context: TimeframeContext;
}) {
  if (
    !context.available
  ) {
    return (
      <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">
              {label}
            </p>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              {role}
            </p>
          </div>

          <StatusBadge tone="warning">
            Unavailable
          </StatusBadge>
        </div>
      </article>
    );
  }

  const age =
    getCandleAgeSeconds(
      context.latest_candle_time,
    );

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">
              {label}
            </p>

            <StatusBadge tone="info">
              {role}
            </StatusBadge>
          </div>

          <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
            Closed candle: {context.latest_candle_time
              ? new Date(
                  context.latest_candle_time,
                ).toLocaleString()
              : "Unavailable"}
          </p>
        </div>

        {context.bias === "BULLISH" ? (
          <TrendingUp className="h-5 w-5 text-[var(--success)]" />
        ) : context.bias === "BEARISH" ? (
          <TrendingDown className="h-5 w-5 text-[var(--danger)]" />
        ) : (
          <Gauge className="h-5 w-5 text-[var(--foreground-subtle)]" />
        )}
      </div>

      <div className="p-5">
        <div
          className={cn(
            "rounded-xl border p-4",
            getBiasClasses(
              context.bias,
            ),
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--foreground-subtle)]">
                Directional Bias
              </p>

              <p className="mt-1 text-xl font-semibold">
                {context.bias}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-[var(--foreground-subtle)]">
                Strength
              </p>

              <p className="mt-1 text-lg font-semibold">
                {formatPercent(
                  context.strength,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
            <p className="text-xs text-[var(--foreground-subtle)]">
              Structure
            </p>

            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                getStructureTextClass(
                  context.structure,
                ),
              )}
            >
              {context.structure}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
            <p className="text-xs text-[var(--foreground-subtle)]">
              Close
            </p>

            <p className="mt-1 text-sm font-semibold">
              {formatPrice(
                context.close,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
            <p className="text-xs text-[var(--foreground-subtle)]">
              EMA20
            </p>

            <p className="mt-1 text-sm font-semibold">
              {formatPrice(
                context.ema20,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
            <p className="text-xs text-[var(--foreground-subtle)]">
              EMA50
            </p>

            <p className="mt-1 text-sm font-semibold">
              {formatPrice(
                context.ema50,
              )}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2.5">
            <span className="text-xs text-[var(--foreground-muted)]">
              Swing High
            </span>

            <span className="text-xs font-semibold">
              {formatPrice(
                context.swing_high,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2.5">
            <span className="text-xs text-[var(--foreground-muted)]">
              Swing Low
            </span>

            <span className="text-xs font-semibold">
              {formatPrice(
                context.swing_low,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2.5">
            <span className="text-xs text-[var(--foreground-muted)]">
              Pressure Delta
            </span>

            <span
              className={cn(
                "text-xs font-semibold",
                (
                  context.pressure_delta
                  ?? 0
                ) > 0
                  ? "text-[var(--success)]"
                  : (
                      context.pressure_delta
                      ?? 0
                    ) < 0
                    ? "text-[var(--danger)]"
                    : "",
              )}
            >
              {formatSigned(
                context.pressure_delta,
                4,
              )}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2.5">
            <span className="text-xs text-[var(--foreground-muted)]">
              Candle Age
            </span>

            <span className="text-xs font-semibold">
              {formatAge(
                age,
              )}
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--foreground-muted)]">
          {getBiasInterpretation(
            context,
          )}
        </p>
      </div>
    </article>
  );
}


export function MarketStatusDashboard() {
  const liveM1Query =
    useMarketData({
      symbol: "XAUUSDm",
      timeframe: "1m",
      refetchInterval: 10_000,
    });

  const mtfQuery =
    useMultiTimeframeStatus({
      symbol: "XAUUSDm",
      refetchInterval: 30_000,
    });

  const riskQuery =
    useRiskStatus();

  const latestM1 =
    getLatestCandle(
      liveM1Query.data,
    );

  const session =
    useMemo(
      () =>
        getSessionInformation(),
      [],
    );

  const tradingWindow =
    getTradingWindowStatus();

  const isRefreshing =
    liveM1Query.isFetching
    || mtfQuery.isFetching
    || riskQuery.isFetching;

  if (
    mtfQuery.isPending
  ) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-96 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-semibold">
              Loading OMI market intelligence
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Reading M1, M5, M15, H1 and H4 context
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    mtfQuery.isError
    || !mtfQuery.data
  ) {
    return (
      <section className="rounded-3xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)] p-6">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />

          <div>
            <h2 className="font-semibold text-[var(--danger)]">
              Multi-timeframe market status unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              The backend has not provided the cached OMI multi-timeframe context.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const mtf =
    mtfQuery.data;

  const liveDataAvailable =
    Boolean(
      latestM1,
    );

  const liveAge =
    latestM1
      ? getCandleAgeSeconds(
          latestM1.time,
        )
      : Number.POSITIVE_INFINITY;

  const liveDataFresh =
    liveDataAvailable
    && liveAge <= 120;

  const volatility =
    getVolatilityState(
      latestM1,
    );

  const pressure =
    getPressureDirection(
      latestM1?.PressureDelta
      ?? mtf.timeframes["1m"].pressure_delta,
    );

  return (
    <div className="space-y-6">

      {/* =====================================
          TOP MARKET FEED
      ===================================== */}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border",
              liveDataFresh
                ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.08)] text-[var(--success)]"
                : "border-[color:rgba(241,185,76,0.25)] bg-[color:rgba(241,185,76,0.08)] text-[var(--warning)]",
            )}
          >
            <Activity className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold">
              XAUUSD Market Intelligence
            </p>

            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Live M1 execution feed with cached OMI M1 → H4 analysis
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge
            tone={
              liveDataFresh
                ? "success"
                : "warning"
            }
          >
            {liveDataFresh
              ? "Live feed fresh"
              : tradingWindow.allowed
                ? "Live feed unavailable"
                : "Market closed / stale"}
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
                liveM1Query.refetch(),
                mtfQuery.refetch(),
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
          OVERALL MTF INTELLIGENCE
      ===================================== */}

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] px-6 py-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-[var(--accent)]" />

              <h2 className="font-semibold">
                OMI Multi-Timeframe Intelligence
              </h2>
            </div>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Weighted market context across M1, M5, M15, H1 and H4
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge
              tone={
                mtf.higher_timeframe_bias === "BULLISH"
                  ? "success"
                  : mtf.higher_timeframe_bias === "BEARISH"
                    ? "warning"
                    : "info"
              }
            >
              {mtf.higher_timeframe_bias}
            </StatusBadge>

            <StatusBadge tone="accent">
              {mtf.alignment.replaceAll(
                "_",
                " ",
              )}
            </StatusBadge>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <p className="text-xs text-[var(--foreground-subtle)]">
              Overall Bias
            </p>

            <p
              className={cn(
                "mt-2 text-xl font-semibold",
                mtf.higher_timeframe_bias === "BULLISH"
                  ? "text-[var(--success)]"
                  : mtf.higher_timeframe_bias === "BEARISH"
                    ? "text-[var(--danger)]"
                    : "",
              )}
            >
              {mtf.higher_timeframe_bias}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <p className="text-xs text-[var(--foreground-subtle)]">
              Alignment
            </p>

            <p className="mt-2 text-sm font-semibold">
              {mtf.alignment.replaceAll(
                "_",
                " ",
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <p className="text-xs text-[var(--foreground-subtle)]">
              Confidence
            </p>

            <p className="mt-2 text-xl font-semibold text-[var(--accent)]">
              {formatPercent(
                mtf.confidence,
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-[color:rgba(50,196,141,0.20)] bg-[color:rgba(50,196,141,0.05)] p-4">
            <p className="text-xs text-[var(--foreground-subtle)]">
              Long Preference
            </p>

            <div className="mt-2 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-[var(--success)]" />

              <p className="text-xl font-semibold text-[var(--success)]">
                {formatPercent(
                  mtf.long_preference,
                )}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:rgba(239,98,98,0.20)] bg-[color:rgba(239,98,98,0.05)] p-4">
            <p className="text-xs text-[var(--foreground-subtle)]">
              Short Preference
            </p>

            <div className="mt-2 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-[var(--danger)]" />

              <p className="text-xl font-semibold text-[var(--danger)]">
                {formatPercent(
                  mtf.short_preference,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          LIVE EXECUTION DATA
      ===================================== */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Live Execution Market
            </h2>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Current M1 Bid, Ask, spread and volatility
            </p>
          </div>

          {!liveDataAvailable && (
            <StatusBadge tone="warning">
              No live ticks
            </StatusBadge>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm text-[var(--foreground-muted)]">
              Bid
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {formatPrice(
                latestM1?.Bid,
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
                latestM1?.Ask,
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
                    latestM1?.Spread,
                  )}
                </p>
              </div>

              <Waves className="h-5 w-5 text-[var(--accent)]" />
            </div>

            <p className="mt-4 text-xs text-[var(--foreground-subtle)]">
              {latestM1
                ? `Range ${formatPrice(
                    latestM1.SpreadMin,
                  )} – ${formatPrice(
                    latestM1.SpreadMax,
                  )}`
                : "Live spread unavailable"}
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
                        : "",
                  )}
                >
                  {latestM1
                    ? volatility
                    : "UNAVAILABLE"}
                </p>
              </div>

              <BarChart3 className="h-5 w-5 text-[var(--info)]" />
            </div>

            <p className="mt-4 text-xs text-[var(--foreground-subtle)]">
              {latestM1
                ? `Expansion ${latestM1.VolatilityExpansion.toFixed(2)}×`
                : "Waiting for live M1 feed"}
            </p>
          </article>
        </div>
      </section>

      {/* =====================================
          FIVE TIMEFRAME CARDS
      ===================================== */}

      <section>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[var(--accent)]" />

            <h2 className="font-semibold">
              Timeframe Analysis
            </h2>
          </div>

          <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
            OMI directional bias, structure and important levels for every timeframe
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {TIMEFRAME_CARDS.map(
            (
              timeframe,
            ) => (
              <TimeframeAnalysisCard
                key={
                  timeframe.key
                }
                label={
                  timeframe.label
                }
                role={
                  timeframe.role
                }
                context={
                  mtf.timeframes[
                    timeframe.key
                  ]
                }
              />
            ),
          )}
        </div>
      </section>

      {/* =====================================
          PRESSURE + SESSION
      ===================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h2 className="font-semibold">
              M1 Tick Pressure
            </h2>

            <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
              Live pressure when available, otherwise latest cached M1 context
            </p>
          </div>

          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Buy Pressure
                </p>

                <p className="mt-2 text-xl font-semibold text-[var(--success)]">
                  {latestM1
                    ? formatPercent(
                        latestM1.BuyPressure,
                      )
                    : "—"}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <p className="text-xs text-[var(--foreground-subtle)]">
                  Sell Pressure
                </p>

                <p className="mt-2 text-xl font-semibold text-[var(--danger)]">
                  {latestM1
                    ? formatPercent(
                        latestM1.SellPressure,
                      )
                    : "—"}
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
                        : "",
                  )}
                >
                  {pressure}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--foreground-muted)]">
                  Pressure Delta
                </p>

                <p className="text-sm font-semibold">
                  {formatSigned(
                    latestM1?.PressureDelta
                    ?? mtf.timeframes["1m"].pressure_delta,
                    4,
                  )}
                </p>
              </div>
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
              Current OMI session-quality policy
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
              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
                <p className="text-sm text-[var(--foreground-muted)]">
                  UTC Hour
                </p>

                <p className="text-sm font-semibold">
                  {`${getUtcHour()
                    .toString()
                    .padStart(
                      2,
                      "0",
                    )}:00`}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
                <p className="text-sm text-[var(--foreground-muted)]">
                  Auto Trade
                </p>

                <p className="text-sm font-semibold">
                  {riskQuery.data?.auto_trade
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
                <p className="text-sm text-[var(--foreground-muted)]">
                  Trading Window
                </p>

                <p className="text-sm font-semibold">
                  {tradingWindow.label}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
                <p className="text-sm text-[var(--foreground-muted)]">
                  MTF Generated
                </p>

                <p className="text-sm font-semibold">
                  {new Date(
                    mtf.generated_at,
                  ).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* =====================================
          MARKET STRUCTURE SUMMARY
      ===================================== */}

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-[var(--accent)]" />

          <h2 className="font-semibold">
            OMI Structure Summary
          </h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TIMEFRAME_CARDS.map(
            (
              timeframe,
            ) => {
              const context =
                mtf.timeframes[
                  timeframe.key
                ];

              return (
                <div
                  key={
                    timeframe.key
                  }
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
                >
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    {timeframe.label}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        context.bias === "BULLISH"
                          ? "text-[var(--success)]"
                          : context.bias === "BEARISH"
                            ? "text-[var(--danger)]"
                            : "",
                      )}
                    >
                      {context.bias}
                    </span>

                    <span
                      className={cn(
                        "text-xs font-semibold",
                        getStructureTextClass(
                          context.structure,
                        ),
                      )}
                    >
                      {context.structure}
                    </span>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>
    </div>
  );
}