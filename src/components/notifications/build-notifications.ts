import {
  Activity,
  BrainCircuit,
  BriefcaseBusiness,
  CircleAlert,
  Clock3,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type {
  AccountStatusResponse,
  RiskStatusResponse,
  ScalpingSignal,
} from "@/types/api";

import type {
  OmiNotification,
} from "@/components/notifications/notification-types";


interface PositionLike {
  ticket: number;
  symbol: string;
  profit: number;
}


interface BuildNotificationsOptions {
  account:
    | AccountStatusResponse
    | undefined;

  risk:
    | RiskStatusResponse
    | undefined;

  signal:
    | ScalpingSignal
    | null;

  positions: PositionLike[];

  accountError: boolean;
  riskError: boolean;
  signalError: boolean;
  positionsError: boolean;
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


function safeIsoDate(
  value:
    | string
    | null
    | undefined,
): string {
  if (!value) {
    return new Date().toISOString();
  }

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
}


export function buildNotifications({
  account,
  risk,
  signal,
  positions,
  accountError,
  riskError,
  signalError,
  positionsError,
}: BuildNotificationsOptions): OmiNotification[] {
  const notifications: OmiNotification[] = [];

  const now =
    new Date().toISOString();

  // =====================================
  // BACKEND/API AVAILABILITY
  // =====================================

  if (accountError) {
    notifications.push({
      id: "account-unavailable",

      title: "MT5 account unavailable",

      message:
        "OMI could not read the current MT5 account information.",

      severity: "CRITICAL",

      category: "ACCOUNT",

      createdAt: now,

      href: "/account",

      icon: Landmark,
    });
  }

  if (riskError) {
    notifications.push({
      id: "risk-unavailable",

      title: "Risk status unavailable",

      message:
        "The frontend could not retrieve the current risk-engine state.",

      severity: "CRITICAL",

      category: "RISK",

      createdAt: now,

      href: "/risk",

      icon: ShieldAlert,
    });
  }

  if (signalError) {
    notifications.push({
      id: "signal-unavailable",

      title: "AI signal unavailable",

      message:
        "The latest stored OMI signal could not be retrieved.",

      severity: "WARNING",

      category: "SIGNAL",

      createdAt: now,

      href: "/live-trading",

      icon: BrainCircuit,
    });
  }

  if (positionsError) {
    notifications.push({
      id: "positions-unavailable",

      title: "Position monitoring unavailable",

      message:
        "OMI could not retrieve the current MT5 positions.",

      severity: "CRITICAL",

      category: "TRADE",

      createdAt: now,

      href: "/positions",

      icon: BriefcaseBusiness,
    });
  }

  // =====================================
  // SIGNAL NOTIFICATIONS
  // =====================================

  if (signal) {
    const direction =
      signal.signal.toUpperCase();

    const status =
      signal.status.toUpperCase();

    const ageSeconds =
      getSignalAgeSeconds(
        signal.created_at,
      );

    if (ageSeconds > 900) {
      notifications.push({
        id:
          `signal-expired-${signal.id}`,

        title: "Stored signal expired",

        message:
          `The latest ${direction} signal is older than 15 minutes and is now treated as WAIT.`,

        severity: "WARNING",

        category: "SIGNAL",

        createdAt:
          safeIsoDate(
            signal.created_at,
          ),

        href: "/live-trading",

        icon: Clock3,
      });
    } else if (ageSeconds > 120) {
      notifications.push({
        id:
          `signal-stale-${signal.id}`,

        title: "AI signal is stale",

        message:
          `The latest ${direction} signal is older than the active M1 monitoring window.`,

        severity: "WARNING",

        category: "SIGNAL",

        createdAt:
          safeIsoDate(
            signal.created_at,
          ),

        href: "/live-trading",

        icon: Clock3,
      });
    } else if (
      direction === "BUY"
      || direction === "SELL"
    ) {
      notifications.push({
        id:
          `signal-fresh-${signal.id}`,

        title:
          `Fresh ${direction} signal`,

        message:
          `${signal.trade_quality} quality with ${
            signal.confidence !== null
              ? `${signal.confidence.toFixed(0)}% confidence`
              : "no confidence value"
          }.`,

        severity:
          direction === "BUY"
            ? "SUCCESS"
            : "INFO",

        category: "SIGNAL",

        createdAt:
          safeIsoDate(
            signal.created_at,
          ),

        href: "/live-trading",

        icon:
          direction === "BUY"
            ? TrendingUp
            : TrendingDown,
      });
    }

    if (status === "BLOCKED") {
      notifications.push({
        id:
          `signal-blocked-${signal.id}`,

        title: "Signal execution blocked",

        message:
          "OMI generated a direction, but backend validation or risk controls prevented execution.",

        severity: "WARNING",

        category: "SIGNAL",

        createdAt:
          safeIsoDate(
            signal.created_at,
          ),

        href: "/signals",

        icon: ShieldAlert,
      });
    }

    if (status === "FAILED") {
      notifications.push({
        id:
          `signal-failed-${signal.id}`,

        title: "Signal execution failed",

        message:
          "The latest OMI signal did not complete successfully.",

        severity: "CRITICAL",

        category: "SIGNAL",

        createdAt:
          safeIsoDate(
            signal.created_at,
          ),

        href: "/signals",

        icon: CircleAlert,
      });
    }
  }

  // =====================================
  // RISK NOTIFICATIONS
  // =====================================

  if (risk) {
    if (!risk.auto_trade) {
      notifications.push({
        id: "auto-trade-disabled",

        title: "Auto trading disabled",

        message:
          "OMI can continue monitoring, but automatic execution is currently disabled.",

        severity: "WARNING",

        category: "RISK",

        createdAt: now,

        href: "/risk",

        icon: ShieldAlert,
      });
    }

    if (risk.execution_cooldown) {
      notifications.push({
        id: "execution-cooldown",

        title: "Execution cooldown active",

        message:
          "A trade group is currently protected from additional execution.",

        severity: "INFO",

        category: "RISK",

        createdAt: now,

        href: "/risk",

        icon: Clock3,
      });
    }

    if (risk.consecutive_losses >= 3) {
      notifications.push({
        id: "consecutive-loss-critical",

        title: "Consecutive-loss warning",

        message:
          `${risk.consecutive_losses} consecutive losses have been recorded.`,

        severity: "CRITICAL",

        category: "RISK",

        createdAt: now,

        href: "/risk",

        icon: TrendingDown,
      });
    } else if (
      risk.consecutive_losses > 0
    ) {
      notifications.push({
        id: "consecutive-loss-warning",

        title: "Loss sequence detected",

        message:
          `${risk.consecutive_losses} consecutive ${
            risk.consecutive_losses === 1
              ? "loss is"
              : "losses are"
          } currently recorded.`,

        severity: "WARNING",

        category: "RISK",

        createdAt: now,

        href: "/risk",

        icon: TrendingDown,
      });
    }

    if (
      risk.auto_trade
      && !risk.execution_cooldown
      && risk.consecutive_losses === 0
    ) {
      notifications.push({
        id: "risk-ready",

        title: "Risk engine ready",

        message:
          "Auto trading is enabled and no active execution restriction is present.",

        severity: "SUCCESS",

        category: "RISK",

        createdAt: now,

        href: "/risk",

        icon: ShieldCheck,
      });
    }
  }

  // =====================================
  // POSITION NOTIFICATIONS
  // =====================================

  for (
    const position
    of positions
  ) {
    if (position.profit > 0) {
      notifications.push({
        id:
          `position-profit-${position.ticket}`,

        title:
          `${position.symbol} position in profit`,

        message:
          `Ticket ${position.ticket} currently has a floating profit of ${position.profit.toFixed(2)}.`,

        severity: "SUCCESS",

        category: "TRADE",

        createdAt: now,

        href: "/positions",

        icon: TrendingUp,
      });
    } else if (
      position.profit < 0
    ) {
      notifications.push({
        id:
          `position-loss-${position.ticket}`,

        title:
          `${position.symbol} position in drawdown`,

        message:
          `Ticket ${position.ticket} currently has a floating result of ${position.profit.toFixed(2)}.`,

        severity: "WARNING",

        category: "TRADE",

        createdAt: now,

        href: "/positions",

        icon: TrendingDown,
      });
    } else {
      notifications.push({
        id:
          `position-neutral-${position.ticket}`,

        title:
          `${position.symbol} position active`,

        message:
          `Ticket ${position.ticket} is currently near break-even.`,

        severity: "INFO",

        category: "TRADE",

        createdAt: now,

        href: "/positions",

        icon: BriefcaseBusiness,
      });
    }
  }

  // =====================================
  // ACCOUNT NOTIFICATIONS
  // =====================================

  if (account) {
    if (!account.trade_allowed) {
      notifications.push({
        id: "mt5-trading-not-allowed",

        title: "MT5 trading permission unavailable",

        message:
          "The connected MT5 account is not currently permitting trading.",

        severity: "CRITICAL",

        category: "ACCOUNT",

        createdAt: now,

        href: "/account",

        icon: ShieldAlert,
      });
    }

    if (
      account.margin_level > 0
      && account.margin_level < 150
    ) {
      notifications.push({
        id: "margin-level-critical",

        title: "Low margin level",

        message:
          `The current margin level is ${account.margin_level.toFixed(2)}%.`,

        severity: "CRITICAL",

        category: "ACCOUNT",

        createdAt: now,

        href: "/account",

        icon: CircleAlert,
      });
    } else if (
      account.margin_level >= 150
      && account.margin_level < 300
    ) {
      notifications.push({
        id: "margin-level-warning",

        title: "Margin level requires attention",

        message:
          `The current margin level is ${account.margin_level.toFixed(2)}%.`,

        severity: "WARNING",

        category: "ACCOUNT",

        createdAt: now,

        href: "/account",

        icon: ShieldAlert,
      });
    }

    if (
      account.trade_allowed
      && (
        account.margin_level === 0
        || account.margin_level >= 300
      )
    ) {
      notifications.push({
        id: "account-ready",

        title: "MT5 account ready",

        message:
          "The trading account is connected and operational.",

        severity: "SUCCESS",

        category: "ACCOUNT",

        createdAt: now,

        href: "/account",

        icon: Landmark,
      });
    }
  }

  // =====================================
  // FALLBACK
  // =====================================

  if (notifications.length === 0) {
    notifications.push({
      id: "omi-monitoring-active",

      title: "OMI monitoring active",

      message:
        "No active warnings or trading events require attention.",

      severity: "INFO",

      category: "SYSTEM",

      createdAt: now,

      href: "/",

      icon: Activity,
    });
  }

  const severityOrder = {
    CRITICAL: 0,
    WARNING: 1,
    SUCCESS: 2,
    INFO: 3,
  } as const;

  return notifications.sort(
    (
      first,
      second,
    ) => {
      const severityDifference =
        severityOrder[
          first.severity
        ]
        - severityOrder[
          second.severity
        ];

      if (
        severityDifference !== 0
      ) {
        return severityDifference;
      }

      return (
        new Date(
          second.createdAt,
        ).getTime()
        - new Date(
            first.createdAt,
          ).getTime()
      );
    },
  );
}