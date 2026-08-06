"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CircleOff,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";

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
  calculatePositionMovement,
  calculatePositionProgress,
  formatPositionPrice,
  formatPositionProfit,
  getPositionDirection,
} from "@/utils/position-format";


export function PositionsTable() {
  const {
    data,
    isPending,
    isError,
    error,
  } = useOpenPositions();

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-64 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-medium">
              Loading open positions
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
              Positions unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {error instanceof Error
                ? error.message
                : "Unable to load open positions."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const positions =
    data?.positions ?? [];

  if (positions.length === 0) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
        <CircleOff className="mx-auto h-10 w-10 text-[var(--foreground-subtle)]" />

        <h2 className="mt-4 text-lg font-semibold">
          No open positions
        </h2>

        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          OMI currently has no active MT5 positions.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-[var(--accent)]" />

            <h2 className="font-semibold">
              Active MT5 Positions
            </h2>
          </div>

          <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
            Read-only position monitoring
          </p>
        </div>

        <StatusBadge tone="info">
          {positions.length} open
        </StatusBadge>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)] text-left">
              {[
                "Symbol",
                "Direction",
                "Volume",
                "Entry",
                "Current",
                "Stop Loss",
                "Take Profit",
                "Movement",
                "Progress",
                "Profit",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {positions.map((position) => {
              const direction =
                getPositionDirection(
                  position.type,
                );

              const movement =
                calculatePositionMovement(
                  position,
                );

              const progress =
                calculatePositionProgress(
                  position,
                );

              const profitable =
                position.profit >= 0;

              return (
                <tr
                  key={position.ticket}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-elevated)]"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold">
                      {position.symbol}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      tone={
                        direction === "BUY"
                          ? "success"
                          : "danger"
                      }
                    >
                      {direction}
                    </StatusBadge>
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {position.volume.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {formatPositionPrice(
                      position.price_open,
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold">
                    {formatPositionPrice(
                      position.price_current,
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-[var(--danger)]">
                    {formatPositionPrice(
                      position.sl,
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-[var(--success)]">
                    {formatPositionPrice(
                      position.tp,
                    )}
                  </td>

                  <td
                    className={cn(
                      "px-5 py-4 text-sm font-semibold",
                      movement >= 0
                        ? "text-[var(--success)]"
                        : "text-[var(--danger)]",
                    )}
                  >
                    {movement >= 0
                      ? "+"
                      : ""}
                    {movement.toFixed(3)}
                  </td>

                  <td className="px-5 py-4">
                    {progress === null ? (
                      <span className="text-sm text-[var(--foreground-subtle)]">
                        —
                      </span>
                    ) : (
                      <div className="w-28">
                        <div className="mb-1 flex justify-between text-[10px] text-[var(--foreground-subtle)]">
                          <span>
                            TP progress
                          </span>

                          <span>
                            {progress.toFixed(0)}%
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                          <div
                            className="h-full rounded-full bg-[var(--accent)]"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </td>

                  <td
                    className={cn(
                      "px-5 py-4 text-sm font-semibold",
                      profitable
                        ? "text-[var(--success)]"
                        : "text-[var(--danger)]",
                    )}
                  >
                    {formatPositionProfit(
                      position.profit,
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 p-4 lg:hidden">
        {positions.map((position) => {
          const direction =
            getPositionDirection(
              position.type,
            );

          const DirectionIcon =
            direction === "BUY"
              ? ArrowUpRight
              : ArrowDownRight;

          const progress =
            calculatePositionProgress(
              position,
            );

          return (
            <article
              key={position.ticket}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">
                    {position.symbol}
                  </p>

                  <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                    Volume {position.volume.toFixed(2)}
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-xl p-2",
                    direction === "BUY"
                      ? "bg-[color:rgba(50,196,141,0.1)] text-[var(--success)]"
                      : "bg-[color:rgba(239,98,98,0.1)] text-[var(--danger)]",
                  )}
                >
                  <DirectionIcon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    Entry
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatPositionPrice(
                      position.price_open,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    Current
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatPositionPrice(
                      position.price_current,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    SL
                  </p>

                  <p className="mt-1 font-semibold text-[var(--danger)]">
                    {formatPositionPrice(
                      position.sl,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    TP
                  </p>

                  <p className="mt-1 font-semibold text-[var(--success)]">
                    {formatPositionPrice(
                      position.tp,
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="text-xs text-[var(--foreground-subtle)]">
                  {progress === null
                    ? "Progress unavailable"
                    : `${progress.toFixed(0)}% to TP`}
                </span>

                <span
                  className={cn(
                    "font-semibold",
                    position.profit >= 0
                      ? "text-[var(--success)]"
                      : "text-[var(--danger)]",
                  )}
                >
                  {formatPositionProfit(
                    position.profit,
                  )}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}