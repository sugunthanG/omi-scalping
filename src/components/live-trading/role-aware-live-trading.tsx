"use client";

import {
  Code2,
  ShieldCheck,
} from "lucide-react";

import {
  LatestSignalPanel,
} from "@/components/live-trading/latest-signal-panel";

import {
  LiveBackendStatus,
} from "@/components/live-trading/live-backend-status";

import {
  SimplifiedSignalPanel,
} from "@/components/live-trading/simplified-signal-panel";

import {
  XauusdMarketChart,
} from "@/components/live-trading/xauusd-market-chart";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  useAuth,
} from "@/context/auth-context";


export function RoleAwareLiveTrading() {
  const {
    role,
  } = useAuth();

  const isDeveloper =
    role === "DEVELOPER";

  return (
    <div className="space-y-6">
      {isDeveloper ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_2fr]">
          <LiveBackendStatus />

          <article className="rounded-2xl border border-[color:rgba(94,162,239,0.24)] bg-[color:rgba(94,162,239,0.07)] p-5">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:rgba(94,162,239,0.28)] text-[var(--info)]">
                <Code2 className="h-5 w-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-[var(--info)]">
                    Developer diagnostics enabled
                  </h2>

                  <StatusBadge tone="info">
                    Developer only
                  </StatusBadge>
                </div>

                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  Backend connectivity, raw indicators,
                  internal impulse values and technical
                  refresh information are visible in this mode.
                </p>
              </div>
            </div>
          </article>
        </section>
      ) : (
        <article className="rounded-2xl border border-[color:rgba(217,164,65,0.24)] bg-[var(--accent-muted)] p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:rgba(217,164,65,0.28)] text-[var(--accent)]">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-[var(--accent)]">
                Secure monitoring interface
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                This page displays useful market and trading
                information. Technical backend diagnostics and
                raw internal data remain restricted.
              </p>
            </div>
          </div>
        </article>
      )}

      <XauusdMarketChart />

      {isDeveloper ? (
        <LatestSignalPanel />
      ) : (
        <SimplifiedSignalPanel />
      )}
    </div>
  );
}