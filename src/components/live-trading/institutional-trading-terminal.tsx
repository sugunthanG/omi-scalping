"use client";

import {
  BriefcaseBusiness,
  CircleOff,
  Clock3,
  LoaderCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  TerminalSignalCard,
} from "@/components/live-trading/terminal-signal-card";

import {
  XauusdMarketChart,
} from "@/components/live-trading/xauusd-market-chart";

import {
  TerminalAiReasoning,
} from "@/components/live-trading/terminal-ai-reasoning";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useOpenPositions,
} from "@/hooks/use-open-positions";

import {
  cn,
} from "@/lib/cn";

import {
  calculatePositionProgress,
  formatPositionPrice,
  formatPositionProfit,
  getPositionDirection,
} from "@/utils/position-format";


function formatPositionDuration(
  timestamp: number | undefined,
): string {
  if (!timestamp) {
    return "Unavailable";
  }

  const openedAt =
    timestamp * 1000;

  const elapsedSeconds =
    Math.max(
      0,
      Math.floor(
        (
          Date.now()
          - openedAt
        ) / 1000,
      ),
    );

  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}s`;
  }

  const minutes =
    Math.floor(
      elapsedSeconds / 60,
    );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainingMinutes =
    minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}


export function InstitutionalTradingTerminal() {
  const {
    data,
    isPending,
    isError,
  } = useOpenPositions();

  const positions =
    data?.positions ?? [];

  const firstPosition =
    positions[0];

  const direction =
    firstPosition
      ? getPositionDirection(
          firstPosition.type,
        )
      : null;

  const positionProgress =
    firstPosition
      ? calculatePositionProgress(
          firstPosition,
        )
      : null;

  const profitable =
    firstPosition
      ? firstPosition.profit >= 0
      : false;

  return (
    <div className="space-y-6">
      {/* =====================================
          INSTITUTIONAL TERMINAL GRID
      ===================================== */}

      <section className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)_270px]">
        {/* =====================================
            LEFT — OMI SIGNAL
        ===================================== */}

        <div className="min-w-0">
          <TerminalSignalCard />
        </div>

        {/* =====================================
            CENTER — MARKET CHART
        ===================================== */}

        <div className="min-w-0">
          <XauusdMarketChart />
        </div>

        {/* =====================================
            RIGHT — CURRENT POSITION
        ===================================== */}

        <aside className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground-subtle)]">
                  MT5 position
                </p>

                <h2 className="mt-1 font-semibold">
                  Current Position
                </h2>
              </div>

              <StatusBadge
                tone={
                  firstPosition
                    ? "success"
                    : "neutral"
                }
              >
                {firstPosition
                  ? "Open"
                  : "None"}
              </StatusBadge>
            </div>
          </div>

          <div className="min-h-[590px] p-5">
            {isPending ? (
              <div className="flex min-h-[520px] items-center justify-center">
                <div className="text-center">
                  <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" />

                  <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                    Loading position
                  </p>
                </div>
              </div>
            ) : isError ? (
              <div className="flex min-h-[520px] items-center justify-center">
                <div className="text-center">
                  <CircleOff className="mx-auto h-9 w-9 text-[var(--danger)]" />

                  <h3 className="mt-4 font-semibold">
                    Position unavailable
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    OMI could not read the current MT5 position.
                  </p>
                </div>
              </div>
            ) : firstPosition ? (
              <div className="space-y-5">
                {/* =====================================
                    POSITION IDENTITY
                ===================================== */}

                <div
                  className={cn(
                    "rounded-2xl border p-4",
                    direction === "BUY"
                      ? "border-[color:rgba(50,196,141,0.27)] bg-[color:rgba(50,196,141,0.07)]"
                      : "border-[color:rgba(239,98,98,0.27)] bg-[color:rgba(239,98,98,0.07)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                        {firstPosition.symbol}
                      </p>

                      <p
                        className={cn(
                          "mt-2 text-3xl font-bold",
                          direction === "BUY"
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]",
                        )}
                      >
                        {direction}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl border",
                        direction === "BUY"
                          ? "border-[color:rgba(50,196,141,0.25)] text-[var(--success)]"
                          : "border-[color:rgba(239,98,98,0.25)] text-[var(--danger)]",
                      )}
                    >
                      {direction === "BUY" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-[var(--foreground-subtle)]">
                      Volume
                    </span>

                    <span className="text-sm font-semibold">
                      {firstPosition.volume.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* =====================================
                    FLOATING PROFIT
                ===================================== */}

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                    Floating P&amp;L
                  </p>

                  <p
                    className={cn(
                      "mt-2 text-3xl font-semibold",
                      profitable
                        ? "text-[var(--success)]"
                        : "text-[var(--danger)]",
                    )}
                  >
                    {formatPositionProfit(
                      firstPosition.profit,
                    )}
                  </p>
                </div>

                {/* =====================================
                    POSITION LEVELS
                ===================================== */}

                <div className="space-y-2">
                  {[
                    {
                      label: "Entry",
                      value:
                        formatPositionPrice(
                          firstPosition.price_open,
                        ),
                    },
                    {
                      label: "Current",
                      value:
                        formatPositionPrice(
                          firstPosition.price_current,
                        ),
                    },
                    {
                      label: "Stop Loss",
                      value:
                        formatPositionPrice(
                          firstPosition.sl,
                        ),
                      className:
                        "text-[var(--danger)]",
                    },
                    {
                      label: "Take Profit",
                      value:
                        formatPositionPrice(
                          firstPosition.tp,
                        ),
                      className:
                        "text-[var(--success)]",
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
                          item.className,
                        )}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* =====================================
                    TP PROGRESS
                ===================================== */}

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--foreground-muted)]">
                      TP progress
                    </p>

                    <p className="text-sm font-semibold">
                      {positionProgress === null
                        ? "—"
                        : `${positionProgress.toFixed(0)}%`}
                    </p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all"
                      style={{
                        width: `${
                          positionProgress
                          ?? 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* =====================================
                    POSITION DURATION
                ===================================== */}

                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                  <Clock3 className="h-4 w-4 text-[var(--foreground-subtle)]" />

                  <div>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      Position duration
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {formatPositionDuration(
                        firstPosition.time,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[520px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-subtle)]">
                    <BriefcaseBusiness className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 font-semibold">
                    No Active Position
                  </h3>

                  <p className="mx-auto mt-2 max-w-52 text-sm leading-6 text-[var(--foreground-muted)]">
                    OMI currently has no live MT5 trade.
                  </p>

                  <StatusBadge
                    tone="neutral"
                    className="mt-4"
                  >
                    Waiting for signal
                  </StatusBadge>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>

      {/* =====================================
          AI REASONING PLACEHOLDER
      ===================================== */}

        <TerminalAiReasoning />
    </div>
  );
}