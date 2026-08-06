"use client";

import {
  Bell,
  CheckCircle2,
  CircleUserRound,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Shield,
  ShieldAlert,
  UserRoundCog,
  XCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  PermissionGate,
} from "@/components/common/permission-gate";

import {
  PasswordSecurityPanel,
} from "@/components/profile/password-security-panel";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  roleCapabilities,
  roleDescriptions,
} from "@/constants/role-capabilities";

import {
  useAuth,
} from "@/context/auth-context";

import {
  usePreferences,
} from "@/context/preferences-context";

import {
  cn,
} from "@/lib/cn";

import {
  getRoleDisplayName,
} from "@/lib/role-display";


function formatUsername(
  username: string,
): string {
  return username
    .replace(
      /^founder_/i,
      "",
    )
    .split("_")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase()
        + word.slice(1).toLowerCase(),
    )
    .join(" ");
}


function getRoleTone(
  role: string,
) {
  if (role === "DEVELOPER") {
    return "info" as const;
  }

  if (role === "ADMIN") {
    return "accent" as const;
  }

  return "neutral" as const;
}


function getLandingPageLabel(
  value: string,
): string {
  const labels: Record<
    string,
    string
  > = {
    "/":
      "Dashboard",

    "/live-trading":
      "Live Trading",

    "/positions":
      "Open Positions",

    "/performance":
      "Performance",

    "/risk":
      "Risk Dashboard",
  };

  return labels[value]
    ?? value;
}


export function ProfileDashboard() {
  const {
    user,
    role,
    logout,
  } = useAuth();

  const {
    preferences,
  } = usePreferences();

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);


  if (!user) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <p className="text-sm text-[var(--foreground-muted)]">
          Authenticated profile information is unavailable.
        </p>
      </section>
    );
  }


  const capabilities =
    roleCapabilities[
      role
    ];

  const roleDescription =
    roleDescriptions[
      role
    ];

  const displayRole =
    getRoleDisplayName(
      role,
    );

  const displayName =
    formatUsername(
      user.username,
    );

  const enabledNotificationCount =
    Object.values(
      preferences.notifications,
    ).filter(
      Boolean,
    ).length;


  const handleLogout =
    async () => {
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(
        true,
      );

      try {
        await logout(
          "manual",
        );
      } finally {
        setIsLoggingOut(
          false,
        );
      }
    };


  return (
    <div className="space-y-6">
      {/* =====================================
          AUTHENTICATED IDENTITY
      ===================================== */}

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] bg-[linear-gradient(135deg,rgba(217,164,65,0.10),rgba(94,162,239,0.04))] px-6 py-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-[color:rgba(217,164,65,0.30)] bg-[var(--accent-muted)] text-[var(--accent)]">
                <CircleUserRound className="h-10 w-10" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                  OMI platform identity
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {displayName}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    tone={getRoleTone(
                      role,
                    )}
                  >
                    {displayRole}
                  </StatusBadge>

                  <StatusBadge tone="success">
                    Authenticated
                  </StatusBadge>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => {
                void handleLogout();
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[color:rgba(239,98,98,0.28)] bg-[color:rgba(239,98,98,0.07)] px-5 text-sm font-semibold text-[var(--danger)] transition hover:bg-[color:rgba(239,98,98,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />

              {isLoggingOut
                ? "Signing out..."
                : "Sign out"}
            </button>
          </div>
        </div>

        <div className="grid gap-px bg-[var(--border)] md:grid-cols-3">
          {/* Email */}

          <div className="bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--accent)]" />

              <p className="text-sm text-[var(--foreground-muted)]">
                Email
              </p>
            </div>

            <p className="mt-3 break-all font-semibold">
              {user.email}
            </p>

            <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
              Synchronized from OMI authentication
            </p>
          </div>

          {/* Role */}

          <div className="bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--accent)]" />

              <p className="text-sm text-[var(--foreground-muted)]">
                Role and designation
              </p>
            </div>

            <p className="mt-3 font-semibold">
              {displayRole}
            </p>

            <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
              {user.designation
                ?? "No designation"}
            </p>
          </div>

          {/* Session */}

          <div className="bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-[var(--accent)]" />

              <p className="text-sm text-[var(--foreground-muted)]">
                Session security
              </p>
            </div>

            <p className="mt-3 font-semibold text-[var(--success)]">
              JWT protected
            </p>

            <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
              Logout after 15 minutes of inactivity
            </p>
          </div>
        </div>
      </section>

      {/* =====================================
          PASSWORD AND SECURITY
      ===================================== */}

      <PasswordSecurityPanel />

      {/* =====================================
          ROLE DESCRIPTION
      ===================================== */}

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--accent)]">
            <UserRoundCog className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">
              {displayRole} Access Profile
            </h2>

            <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--foreground-muted)]">
              {roleDescription}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================
          ROLE CAPABILITIES
      ===================================== */}

      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-6 py-5">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--accent)]" />

            <h2 className="font-semibold">
              Role Capabilities
            </h2>
          </div>

          <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
            Permissions assigned to the authenticated account
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          {capabilities.map(
            (
              capability,
            ) => (
              <article
                key={capability.label}
                className={cn(
                  "rounded-2xl border p-4",
                  capability.allowed
                    ? "border-[color:rgba(50,196,141,0.22)] bg-[color:rgba(50,196,141,0.05)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)]",
                )}
              >
                <div className="flex items-start gap-3">
                  {capability.allowed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--foreground-subtle)]" />
                  )}

                  <div>
                    <h3 className="text-sm font-semibold">
                      {capability.label}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[var(--foreground-muted)]">
                      {capability.description}
                    </p>

                    <StatusBadge
                      tone={
                        capability.allowed
                          ? "success"
                          : "neutral"
                      }
                      className="mt-3"
                    >
                      {capability.allowed
                        ? "Allowed"
                        : "Restricted"}
                    </StatusBadge>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      {/* =====================================
          PERSONAL PREFERENCES
      ===================================== */}

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                Interface Profile
              </h2>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {[
              {
                label:
                  "Username",

                value:
                  user.username,
              },

              {
                label:
                  "Default Page",

                value:
                  getLandingPageLabel(
                    preferences.defaultLandingPage,
                  ),
              },

              {
                label:
                  "Compact Mode",

                value:
                  preferences.compactMode
                    ? "Enabled"
                    : "Disabled",
              },

              {
                label:
                  "Reduced Motion",

                value:
                  preferences.reducedMotion
                    ? "Enabled"
                    : "Disabled",
              },
            ].map(
              (
                item,
              ) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
                >
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {item.label}
                  </p>

                  <p className="text-sm font-semibold">
                    {item.value}
                  </p>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--accent)]" />

              <h2 className="font-semibold">
                Notification Profile
              </h2>
            </div>
          </div>

          <div className="p-5">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
              <p className="text-sm text-[var(--foreground-muted)]">
                Enabled preferences
              </p>

              <p className="mt-3 text-3xl font-semibold">
                {enabledNotificationCount}
              </p>

              <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
                Out of five notification options
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* =====================================
          SCIENTIST-ONLY NOTICE
      ===================================== */}

      <PermissionGate permission="raw-api:view">
        <section className="rounded-3xl border border-[color:rgba(94,162,239,0.25)] bg-[color:rgba(94,162,239,0.05)] p-6">
          <p className="text-sm font-semibold text-[var(--info)]">
            Authenticated scientist account
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
            The username, email, role and designation were loaded from the
            protected FastAPI authentication service. This account has
            scientist-level technical access.
          </p>
        </section>
      </PermissionGate>

      {/* =====================================
          FOUNDER NOTICE
      ===================================== */}

      <section className="rounded-3xl border border-[color:rgba(241,185,76,0.25)] bg-[color:rgba(241,185,76,0.05)] p-6">
        <div className="flex items-start gap-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />

          <div>
            <h2 className="font-semibold text-[var(--warning)]">
              Founder password protection
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              Founder password changes and account recovery require
              authorization from the other founder. A founder cannot approve
              their own security request.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}