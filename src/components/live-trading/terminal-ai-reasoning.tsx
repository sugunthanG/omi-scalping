"use client";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CircleOff,
  Clock3,
  Gauge,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

import {
  PermissionGate,
} from "@/components/common/permission-gate";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useLatestScalpingSignal,
} from "@/hooks/use-latest-scalping-signal";

import {
  cn,
} from "@/lib/cn";


type ReasonTone =
  | "positive"
  | "negative"
  | "warning"
  | "neutral";


interface ReasonItem {
  title: string;
  description: string;
  tone: ReasonTone;
}


function getSignalAgeSeconds(
  createdAt: string,
): number {
  const timestamp =
    new Date(
      createdAt,
    ).getTime();

  if (
    Number.isNaN(
      timestamp,
    )
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


function getReasonIcon(
  tone: ReasonTone,
) {
  if (tone === "positive") {
    return CheckCircle2;
  }

  if (tone === "negative") {
    return XCircle;
  }

  if (tone === "warning") {
    return AlertTriangle;
  }

  return CircleOff;
}


function getReasonClasses(
  tone: ReasonTone,
): string {
  if (tone === "positive") {
    return "border-[color:rgba(50,196,141,0.22)] bg-[color:rgba(50,196,141,0.06)] text-[var(--success)]";
  }

  if (tone === "negative") {
    return "border-[color:rgba(239,98,98,0.22)] bg-[color:rgba(239,98,98,0.06)] text-[var(--danger)]";
  }

  if (tone === "warning") {
    return "border-[color:rgba(241,185,76,0.22)] bg-[color:rgba(241,185,76,0.06)] text-[var(--warning)]";
  }

  return "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)]";
}


function buildReasonItems(
  signal: {
    signal: string;
    trade_quality: string;
    status: string;
    confidence: number | null;
    ema20: number | null;
    ema50: number | null;
    rsi: number | null;
    momentum: number | null;
    buy_score: number | null;
    sell_score: number | null;
    created_at: string;
  },
): ReasonItem[] {
  const reasons: ReasonItem[] = [];

  const direction =
    signal.signal.toUpperCase();

  const quality =
    signal.trade_quality.toUpperCase();

  const status =
    signal.status.toUpperCase();

  const ageSeconds =
    getSignalAgeSeconds(
      signal.created_at,
    );

  // =====================================
  // FRESHNESS
  // =====================================

  if (ageSeconds > 900) {
    reasons.push({
      title: "Signal has expired",
      description:
        "This stored M1 signal is older than 15 minutes and is shown only as historical information.",
      tone: "negative",
    });
  } else if (ageSeconds > 120) {
    reasons.push({
      title: "Signal is stale",
      description:
        "The signal is older than two minutes. OMI should produce a fresh result before it is treated as current.",
      tone: "warning",
    });
  } else {
    reasons.push({
      title: "Signal is fresh",
      description:
        "The latest stored result is within the active M1 monitoring window.",
      tone: "positive",
    });
  }

  // =====================================
  // DIRECTION
  // =====================================

  if (direction === "BUY") {
    reasons.push({
      title: "Bullish direction detected",
      description:
        "The latest stored OMI decision favours upward XAUUSD movement.",
      tone: "positive",
    });
  } else if (direction === "SELL") {
    reasons.push({
      title: "Bearish direction detected",
      description:
        "The latest stored OMI decision favours downward XAUUSD movement.",
      tone: "negative",
    });
  } else {
    reasons.push({
      title: "No active direction",
      description:
        "OMI is not currently presenting a valid BUY or SELL instruction.",
      tone: "neutral",
    });
  }

  // =====================================
  // QUALITY
  // =====================================

  if (
    quality === "ELITE"
    || quality === "STRONG"
  ) {
    reasons.push({
      title: `${quality} trade quality`,
      description:
        "The signal passed OMI's higher-quality classification level.",
      tone: "positive",
    });
  } else if (quality === "GOOD") {
    reasons.push({
      title: "Moderate trade quality",
      description:
        "The stored signal is classified as GOOD and may still be restricted by session rules.",
      tone: "warning",
    });
  } else {
    reasons.push({
      title: "Low trade quality",
      description:
        "The current classification is below OMI's preferred execution quality.",
      tone: "neutral",
    });
  }

  // =====================================
  // CONFIDENCE
  // =====================================

  if (signal.confidence !== null) {
    if (signal.confidence >= 90) {
      reasons.push({
        title: "High confidence",
        description:
          `The stored confidence is ${signal.confidence.toFixed(0)}%.`,
        tone: "positive",
      });
    } else if (signal.confidence >= 70) {
      reasons.push({
        title: "Moderate confidence",
        description:
          `The stored confidence is ${signal.confidence.toFixed(0)}%.`,
        tone: "warning",
      });
    } else {
      reasons.push({
        title: "Low confidence",
        description:
          `The stored confidence is ${signal.confidence.toFixed(0)}%.`,
        tone: "negative",
      });
    }
  }

  // =====================================
  // EMA ALIGNMENT
  // =====================================

  if (
    signal.ema20 !== null
    && signal.ema50 !== null
  ) {
    if (
      direction === "BUY"
      && signal.ema20 > signal.ema50
    ) {
      reasons.push({
        title: "EMA trend supports BUY",
        description:
          "EMA20 is above EMA50, which agrees with the stored bullish direction.",
        tone: "positive",
      });
    } else if (
      direction === "SELL"
      && signal.ema20 < signal.ema50
    ) {
      reasons.push({
        title: "EMA trend supports SELL",
        description:
          "EMA20 is below EMA50, which agrees with the stored bearish direction.",
        tone: "positive",
      });
    } else if (
      direction === "BUY"
      || direction === "SELL"
    ) {
      reasons.push({
        title: "EMA trend is not aligned",
        description:
          "The stored direction and EMA20/EMA50 relationship do not currently agree.",
        tone: "warning",
      });
    }
  }

  // =====================================
  // MOMENTUM
  // =====================================

  if (signal.momentum !== null) {
    if (
      direction === "BUY"
      && signal.momentum > 0
    ) {
      reasons.push({
        title: "Positive momentum",
        description:
          "Momentum is positive and supports the bullish direction.",
        tone: "positive",
      });
    } else if (
      direction === "SELL"
      && signal.momentum < 0
    ) {
      reasons.push({
        title: "Negative momentum",
        description:
          "Momentum is negative and supports the bearish direction.",
        tone: "positive",
      });
    } else if (
      direction === "BUY"
      || direction === "SELL"
    ) {
      reasons.push({
        title: "Momentum conflict",
        description:
          "The stored momentum value does not currently support the selected direction.",
        tone: "warning",
      });
    }
  }

  // =====================================
  // RSI
  // =====================================

  if (signal.rsi !== null) {
    if (signal.rsi >= 70) {
      reasons.push({
        title: "RSI is elevated",
        description:
          `RSI is ${signal.rsi.toFixed(1)}, indicating an overbought market condition.`,
        tone:
          direction === "SELL"
            ? "positive"
            : "warning",
      });
    } else if (signal.rsi <= 30) {
      reasons.push({
        title: "RSI is depressed",
        description:
          `RSI is ${signal.rsi.toFixed(1)}, indicating an oversold market condition.`,
        tone:
          direction === "BUY"
            ? "positive"
            : "warning",
      });
    } else {
      reasons.push({
        title: "RSI is neutral",
        description:
          `RSI is ${signal.rsi.toFixed(1)}, outside the main overbought and oversold zones.`,
        tone: "neutral",
      });
    }
  }

  // =====================================
  // EXECUTION RESULT
  // =====================================

  if (
    status === "ACTIVE"
    || status === "SUCCESS"
  ) {
    reasons.push({
      title: "Signal reached execution",
      description:
        "The stored signal is marked as successfully executed or active.",
      tone: "positive",
    });
  } else if (status === "BLOCKED") {
    reasons.push({
      title: "Execution was blocked",
      description:
        "The backend prevented execution because one or more validation or risk conditions were not satisfied.",
      tone: "warning",
    });
  } else if (status === "FAILED") {
    reasons.push({
      title: "Execution failed",
      description:
        "The stored signal did not complete successfully.",
      tone: "negative",
    });
  } else {
    reasons.push({
      title: `Execution status: ${status}`,
      description:
        "The backend stored this execution state for the signal.",
      tone: "neutral",
    });
  }

  return reasons;
}


export function TerminalAiReasoning() {
  const {
    data,
    isPending,
    isError,
  } = useLatestScalpingSignal();

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm text-[var(--foreground-muted)]">
          Loading OMI explanation…
        </p>
      </section>
    );
  }

  if (
    isError
    || !data?.data
  ) {
    return (
      <section className="rounded-3xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)] p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-[var(--danger)]" />

          <div>
            <h2 className="font-semibold text-[var(--danger)]">
              OMI explanation unavailable
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              No verified signal data is available to explain.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const signal =
    data.data;

  const ageSeconds =
    getSignalAgeSeconds(
      signal.created_at,
    );

  const expired =
    ageSeconds > 900;

  const effectiveDecision =
    expired
      ? "WAIT"
      : signal.signal.toUpperCase();

  const DecisionIcon =
    effectiveDecision === "BUY"
      ? TrendingUp
      : effectiveDecision === "SELL"
        ? TrendingDown
        : CircleOff;

  const reasons =
    buildReasonItems(
      signal,
    );

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground-subtle)]">
              OMI intelligence
            </p>
          </div>

          <h2 className="mt-2 text-lg font-semibold">
            Signal Explanation
          </h2>

          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Plain-language interpretation of the latest stored OMI values.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border",
              effectiveDecision === "BUY"
                ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.08)] text-[var(--success)]"
                : effectiveDecision === "SELL"
                  ? "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.08)] text-[var(--danger)]"
                  : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)]",
            )}
          >
            <DecisionIcon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs text-[var(--foreground-subtle)]">
              Effective decision
            </p>

            <p
              className={cn(
                "mt-1 font-semibold",
                effectiveDecision === "BUY"
                  ? "text-[var(--success)]"
                  : effectiveDecision === "SELL"
                    ? "text-[var(--danger)]"
                    : "text-[var(--foreground)]",
              )}
            >
              {effectiveDecision}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================
          EXPLANATION ITEMS
      ===================================== */}

      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {reasons.map(
          (
            reason,
            index,
          ) => {
            const Icon =
              getReasonIcon(
                reason.tone,
              );

            return (
              <article
                key={`${reason.title}-${index}`}
                className={cn(
                  "rounded-2xl border p-4",
                  getReasonClasses(
                    reason.tone,
                  ),
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />

                  <div>
                    <h3 className="text-sm font-semibold">
                      {reason.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          },
        )}
      </div>

      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="border-t border-[var(--border)] px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Gauge className="h-4 w-4 text-[var(--info)]" />

            <div>
              <p className="text-xs text-[var(--foreground-subtle)]">
                Confidence
              </p>

              <p className="mt-1 text-sm font-semibold">
                {signal.confidence !== null
                  ? `${signal.confidence.toFixed(0)}%`
                  : "Unavailable"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BrainCircuit className="h-4 w-4 text-[var(--accent)]" />

            <div>
              <p className="text-xs text-[var(--foreground-subtle)]">
                Trade quality
              </p>

              <p className="mt-1 text-sm font-semibold">
                {signal.trade_quality}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock3 className="h-4 w-4 text-[var(--foreground-subtle)]" />

            <div>
              <p className="text-xs text-[var(--foreground-subtle)]">
                Freshness
              </p>

              <StatusBadge
                tone={
                  ageSeconds > 900
                    ? "danger"
                    : ageSeconds > 120
                      ? "warning"
                      : "success"
                }
                className="mt-1"
              >
                {ageSeconds > 900
                  ? "Expired"
                  : ageSeconds > 120
                    ? "Stale"
                    : "Fresh"}
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          DEVELOPER DISCLOSURE
      ===================================== */}

      <PermissionGate permission="raw-market-data:view">
        <div className="border-t border-[color:rgba(94,162,239,0.20)] bg-[color:rgba(94,162,239,0.04)] px-6 py-4">
          <div className="flex items-start gap-3">
            <BrainCircuit className="mt-0.5 h-4 w-4 text-[var(--info)]" />

            <p className="text-xs leading-5 text-[var(--foreground-muted)]">
              This explanation is generated in the frontend from the
              verified stored signal fields. It is not a separate model
              prediction and does not alter OMI execution logic.
            </p>
          </div>
        </div>
      </PermissionGate>
    </section>
  );
}