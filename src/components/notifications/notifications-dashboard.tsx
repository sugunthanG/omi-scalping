"use client";

import {
  Bell,
  CheckCheck,
  CircleAlert,
  CircleOff,
  Filter,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  buildNotifications,
} from "@/components/notifications/build-notifications";

import type {
  NotificationCategory,
  NotificationSeverity,
} from "@/components/notifications/notification-types";

import {
  useAccountStatus,
} from "@/hooks/use-account-status";

import {
  useLatestScalpingSignal,
} from "@/hooks/use-latest-scalping-signal";

import {
  useOpenPositions,
} from "@/hooks/use-open-positions";

import {
  useRiskStatus,
} from "@/hooks/use-risk-status";

import {
  cn,
} from "@/lib/cn";


type NotificationFilter =
  | "ALL"
  | NotificationCategory;


const filters: NotificationFilter[] = [
  "ALL",
  "SIGNAL",
  "TRADE",
  "RISK",
  "ACCOUNT",
  "SYSTEM",
];


function getSeverityTone(
  severity: NotificationSeverity,
) {
  if (severity === "CRITICAL") {
    return "danger" as const;
  }

  if (severity === "WARNING") {
    return "warning" as const;
  }

  if (severity === "SUCCESS") {
    return "success" as const;
  }

  return "info" as const;
}


function getSeverityClasses(
  severity: NotificationSeverity,
): string {
  if (severity === "CRITICAL") {
    return "border-[color:rgba(239,98,98,0.24)] bg-[color:rgba(239,98,98,0.05)]";
  }

  if (severity === "WARNING") {
    return "border-[color:rgba(241,185,76,0.24)] bg-[color:rgba(241,185,76,0.05)]";
  }

  if (severity === "SUCCESS") {
    return "border-[color:rgba(50,196,141,0.24)] bg-[color:rgba(50,196,141,0.05)]";
  }

  return "border-[color:rgba(94,162,239,0.22)] bg-[color:rgba(94,162,239,0.04)]";
}


function formatNotificationTime(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}


export function NotificationsDashboard() {
  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<NotificationFilter>(
    "ALL",
  );

  const accountQuery =
    useAccountStatus();

  const riskQuery =
    useRiskStatus();

  const signalQuery =
    useLatestScalpingSignal();

  const positionsQuery =
    useOpenPositions();

  const isPending =
    accountQuery.isPending
    || riskQuery.isPending
    || signalQuery.isPending
    || positionsQuery.isPending;

  const isRefreshing =
    accountQuery.isFetching
    || riskQuery.isFetching
    || signalQuery.isFetching
    || positionsQuery.isFetching;

  const notifications =
    useMemo(
      () =>
        buildNotifications({
          account:
            accountQuery.data,

          risk:
            riskQuery.data,

          signal:
            signalQuery.data?.data
            ?? null,

          positions:
            positionsQuery
              .data
              ?.positions
            ?? [],

          accountError:
            accountQuery.isError,

          riskError:
            riskQuery.isError,

          signalError:
            signalQuery.isError,

          positionsError:
            positionsQuery.isError,
        }),
      [
        accountQuery.data,
        accountQuery.isError,
        riskQuery.data,
        riskQuery.isError,
        signalQuery.data,
        signalQuery.isError,
        positionsQuery.data,
        positionsQuery.isError,
      ],
    );

  const filteredNotifications =
    useMemo(
      () => {
        if (
          selectedFilter === "ALL"
        ) {
          return notifications;
        }

        return notifications.filter(
          (notification) =>
            notification.category
            === selectedFilter,
        );
      },
      [
        notifications,
        selectedFilter,
      ],
    );

  const criticalCount =
    notifications.filter(
      (notification) =>
        notification.severity
        === "CRITICAL",
    ).length;

  const warningCount =
    notifications.filter(
      (notification) =>
        notification.severity
        === "WARNING",
    ).length;

  const successCount =
    notifications.filter(
      (notification) =>
        notification.severity
        === "SUCCESS",
    ).length;

  const refreshAll = () => {
    void Promise.all([
      accountQuery.refetch(),
      riskQuery.refetch(),
      signalQuery.refetch(),
      positionsQuery.refetch(),
    ]);
  };

  if (isPending) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-80 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

            <p className="mt-4 font-semibold">
              Loading OMI notifications
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Reviewing account, signal, trade and risk states
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================
          SUMMARY
      ===================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <Bell className="h-5 w-5 text-[var(--accent)]" />

          <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            Total Notifications
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {notifications.length}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <CircleAlert className="h-5 w-5 text-[var(--danger)]" />

          <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            Critical
          </p>

          <p className="mt-2 text-2xl font-semibold text-[var(--danger)]">
            {criticalCount}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <ShieldAlert className="h-5 w-5 text-[var(--warning)]" />

          <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            Warnings
          </p>

          <p className="mt-2 text-2xl font-semibold text-[var(--warning)]">
            {warningCount}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <CheckCheck className="h-5 w-5 text-[var(--success)]" />

          <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            Healthy States
          </p>

          <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
            {successCount}
          </p>
        </article>
      </section>

      {/* =====================================
          FILTERS
      ===================================== */}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-[var(--accent)]" />

          <div>
            <p className="text-sm font-semibold">
              Notification filter
            </p>

            <p className="text-xs text-[var(--foreground-subtle)]">
              Live notifications are generated from verified OMI states
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map(
            (filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setSelectedFilter(
                    filter,
                  );
                }}
                className={cn(
                  "h-9 rounded-lg border px-3 text-xs font-semibold transition",
                  selectedFilter === filter
                    ? "border-[color:rgba(217,164,65,0.32)] bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
                )}
              >
                {filter}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={refreshAll}
            disabled={isRefreshing}
            className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-xs font-semibold text-[var(--foreground-muted)] disabled:opacity-60"
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
          NOTIFICATION LIST
      ===================================== */}

      {filteredNotifications.length === 0 ? (
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <CircleOff className="mx-auto h-10 w-10 text-[var(--foreground-subtle)]" />

          <h2 className="mt-4 text-lg font-semibold">
            No matching notifications
          </h2>

          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            No current OMI events match this category.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {filteredNotifications.map(
            (notification) => {
              const Icon =
                notification.icon;

              const content = (
                <article
                  className={cn(
                    "group rounded-2xl border p-5 transition",
                    getSeverityClasses(
                      notification.severity,
                    ),
                    notification.href
                      && "hover:border-[var(--border-strong)]",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <h2 className="font-semibold">
                            {notification.title}
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                            {notification.message}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge
                            tone={getSeverityTone(
                              notification.severity,
                            )}
                          >
                            {notification.severity}
                          </StatusBadge>

                          <StatusBadge tone="neutral">
                            {notification.category}
                          </StatusBadge>
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-[var(--foreground-subtle)]">
                        {formatNotificationTime(
                          notification.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              );

              if (
                notification.href
              ) {
                return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={notification.id}>
                  {content}
                </div>
              );
            },
          )}
        </section>
      )}

      <section className="rounded-2xl border border-[color:rgba(94,162,239,0.20)] bg-[color:rgba(94,162,239,0.04)] p-5">
        <p className="text-sm font-semibold text-[var(--info)]">
          Current notification behavior
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
          These notifications are generated live from existing OMI API
          responses. Persistent read/unread history, browser push
          notifications and email alerts will require an authenticated
          backend notifications service.
        </p>
      </section>
    </div>
  );
}