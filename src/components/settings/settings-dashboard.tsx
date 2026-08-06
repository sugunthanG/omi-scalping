"use client";

import {
  Bell,
  BellRing,
  Check,
  LayoutDashboard,
  MonitorCog,
  RefreshCcw,
  Settings2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  SettingSwitch,
} from "@/components/settings/setting-switch";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  usePreferences,
} from "@/context/preferences-context";

import {
  cn,
} from "@/lib/cn";

import type {
  DefaultLandingPage,
} from "@/types/preferences";


const landingPageOptions: Array<{
  label: string;
  description: string;
  value: DefaultLandingPage;
}> = [
  {
    label: "Dashboard",
    description:
      "Open the institutional overview after login.",

    value: "/",
  },

  {
    label: "Live Trading",
    description:
      "Open the OMI trading terminal first.",

    value: "/live-trading",
  },

  {
    label: "Open Positions",
    description:
      "Open active MT5 position monitoring.",

    value: "/positions",
  },

  {
    label: "Performance",
    description:
      "Open trading analytics and account results.",

    value: "/performance",
  },

  {
    label: "Risk Dashboard",
    description:
      "Open backend-enforced risk monitoring.",

    value: "/risk",
  },
];


export function SettingsDashboard() {
  const {
    preferences,
    isLoaded,
    updatePreferences,
    updateNotificationPreferences,
    resetPreferences,
  } = usePreferences();

  const [
    savedMessage,
    setSavedMessage,
  ] = useState<string | null>(
    null,
  );

  const showSavedMessage = (
    message: string,
  ) => {
    setSavedMessage(
      message,
    );

    window.setTimeout(
      () => {
        setSavedMessage(
          null,
        );
      },
      2_500,
    );
  };

  const requestBrowserNotifications =
    async () => {
      if (
        typeof window
          === "undefined"
        || !(
          "Notification"
          in window
        )
      ) {
        showSavedMessage(
          "Browser notifications are not supported.",
        );

        return;
      }

      if (
        Notification.permission
        === "granted"
      ) {
        updateNotificationPreferences({
          browserNotifications:
            true,
        });

        showSavedMessage(
          "Browser notifications enabled.",
        );

        return;
      }

      if (
        Notification.permission
        === "denied"
      ) {
        updateNotificationPreferences({
          browserNotifications:
            false,
        });

        showSavedMessage(
          "Browser notification permission was denied.",
        );

        return;
      }

      const permission =
        await Notification.requestPermission();

      const allowed =
        permission === "granted";

      updateNotificationPreferences({
        browserNotifications:
          allowed,
      });

      showSavedMessage(
        allowed
          ? "Browser notifications enabled."
          : "Browser notifications were not enabled.",
      );
    };

  if (!isLoaded) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <p className="text-sm text-[var(--foreground-muted)]">
          Loading preferences…
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {savedMessage ? (
        <section className="flex items-center gap-3 rounded-2xl border border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.06)] px-5 py-4">
          <Check className="h-5 w-5 text-[var(--success)]" />

          <p className="text-sm font-semibold text-[var(--success)]">
            {savedMessage}
          </p>
        </section>
      ) : null}

      {/* =====================================
          INTERFACE
      ===================================== */}

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <div className="flex items-center gap-2">
            <MonitorCog className="h-4 w-4 text-[var(--accent)]" />

            <h2 className="font-semibold">
              Interface Preferences
            </h2>
          </div>

          <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
            Configure how the OMI dashboard appears on this device.
          </p>
        </div>

        <div className="divide-y divide-[var(--border)]">
          <div className="flex items-center justify-between gap-5 p-5">
            <div>
              <p className="text-sm font-semibold">
                Dark appearance
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                OMI currently uses its institutional dark theme.
              </p>
            </div>

            <StatusBadge tone="accent">
              Enabled
            </StatusBadge>
          </div>

          <div className="flex items-center justify-between gap-5 p-5">
            <div>
              <p className="text-sm font-semibold">
                Compact dashboard mode
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                Reduce selected spacing to fit more information on screen.
              </p>
            </div>

            <SettingSwitch
              checked={
                preferences.compactMode
              }
              onCheckedChange={(
                checked,
              ) => {
                updatePreferences({
                  compactMode:
                    checked,
                });

                showSavedMessage(
                  "Compact mode updated.",
                );
              }}
              ariaLabel="Toggle compact dashboard mode"
            />
          </div>

          <div className="flex items-center justify-between gap-5 p-5">
            <div>
              <p className="text-sm font-semibold">
                Reduce animations
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                Reduce non-essential interface motion and transitions.
              </p>
            </div>

            <SettingSwitch
              checked={
                preferences.reducedMotion
              }
              onCheckedChange={(
                checked,
              ) => {
                updatePreferences({
                  reducedMotion:
                    checked,
                });

                showSavedMessage(
                  "Animation preference updated.",
                );
              }}
              ariaLabel="Toggle reduced animations"
            />
          </div>
        </div>
      </section>

      {/* =====================================
          LANDING PAGE
      ===================================== */}

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-[var(--accent)]" />

            <h2 className="font-semibold">
              Default Landing Page
            </h2>
          </div>

          <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
            This preference will be applied after authentication is connected.
          </p>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {landingPageOptions.map(
            (option) => {
              const selected =
                preferences.defaultLandingPage
                === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    updatePreferences({
                      defaultLandingPage:
                        option.value,
                    });

                    showSavedMessage(
                      "Default page updated.",
                    );
                  }}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    selected
                      ? "border-[color:rgba(217,164,65,0.36)] bg-[var(--accent-muted)]"
                      : "border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--border-strong)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          selected
                            && "text-[var(--accent)]",
                        )}
                      >
                        {option.label}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
                        {option.description}
                      </p>
                    </div>

                    {selected ? (
                      <Check className="h-4 w-4 text-[var(--accent)]" />
                    ) : null}
                  </div>
                </button>
              );
            },
          )}
        </div>
      </section>

      {/* =====================================
          NOTIFICATION PREFERENCES
      ===================================== */}

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[var(--accent)]" />

            <h2 className="font-semibold">
              Notification Preferences
            </h2>
          </div>

          <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
            Choose which OMI events should appear in your notification center.
          </p>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {[
            {
              key:
                "signalEvents" as const,

              title:
                "AI signal events",

              description:
                "Fresh, stale, expired, blocked and failed signal events.",

              checked:
                preferences.notifications.signalEvents,
            },

            {
              key:
                "tradeEvents" as const,

              title:
                "Trade events",

              description:
                "Open-position profit, drawdown and trade-state events.",

              checked:
                preferences.notifications.tradeEvents,
            },

            {
              key:
                "riskWarnings" as const,

              title:
                "Risk warnings",

              description:
                "Cooldowns, loss sequences and risk-engine restrictions.",

              checked:
                preferences.notifications.riskWarnings,
            },

            {
              key:
                "systemEvents" as const,

              title:
                "System events",

              description:
                "Backend, MT5 and API availability events.",

              checked:
                preferences.notifications.systemEvents,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-5 p-5"
            >
              <div>
                <p className="text-sm font-semibold">
                  {item.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                  {item.description}
                </p>
              </div>

              <SettingSwitch
                checked={item.checked}
                onCheckedChange={(
                  checked,
                ) => {
                  updateNotificationPreferences({
                    [item.key]:
                      checked,
                  });

                  showSavedMessage(
                    "Notification preference updated.",
                  );
                }}
                ariaLabel={`Toggle ${item.title}`}
              />
            </div>
          ))}

          <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-[var(--info)]" />

                <p className="text-sm font-semibold">
                  Browser notifications
                </p>
              </div>

              <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                Permission is stored by your browser and applies only to this device.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void requestBrowserNotifications();
              }}
              className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-sm font-semibold text-[var(--foreground-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            >
              {preferences.notifications.browserNotifications
                ? "Permission enabled"
                : "Request permission"}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================
          RESET
      ===================================== */}

      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-[color:rgba(241,185,76,0.22)] bg-[color:rgba(241,185,76,0.05)] p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 text-[var(--warning)]" />

          <div>
            <h2 className="font-semibold text-[var(--warning)]">
              Reset local preferences
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              This only resets frontend preferences on this browser. It does not
              change OMI trading, MT5, account or backend settings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            resetPreferences();

            showSavedMessage(
              "Preferences reset.",
            );
          }}
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[color:rgba(241,185,76,0.28)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--warning)]"
        >
          <RefreshCcw className="h-4 w-4" />

          Reset preferences
        </button>
      </section>

      <section className="rounded-2xl border border-[color:rgba(94,162,239,0.20)] bg-[color:rgba(94,162,239,0.04)] p-5">
        <div className="flex items-start gap-3">
          <Settings2 className="mt-0.5 h-5 w-5 text-[var(--info)]" />

          <div>
            <p className="text-sm font-semibold text-[var(--info)]">
              Frontend preferences only
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              Trading settings, lot size, risk limits, AI parameters and broker
              configuration are not managed by this personal settings page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}