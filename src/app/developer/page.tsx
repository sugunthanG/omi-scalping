"use client";

import axios from "axios";

import {
  Activity,
  BrainCircuit,
  Database,
  LoaderCircle,
  RefreshCcw,
  ServerCog,
  Settings2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  RolePageGuard,
} from "@/components/auth/role-page-guard";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  fetchScientistDiagnostics,
  fetchScientistOverview,
} from "@/services/api/scientist-api";

import type {
  ScientistDiagnostics,
  ScientistOverview,
} from "@/services/api/scientist-api";


export default function ScientistConsolePage() {
  const [
    overview,
    setOverview,
  ] = useState<ScientistOverview | null>(
    null,
  );

  const [
    diagnostics,
    setDiagnostics,
  ] = useState<ScientistDiagnostics | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [
        overviewResult,
        diagnosticsResult,
      ] = await Promise.all([
        fetchScientistOverview(),
        fetchScientistDiagnostics(),
      ]);

      setOverview(
        overviewResult,
      );

      setDiagnostics(
        diagnosticsResult,
      );
    } catch (requestError) {
      if (
        axios.isAxiosError(
          requestError,
        )
      ) {
        setError(
          requestError.response
            ?.data
            ?.detail
          ?? "Unable to load Scientist data.",
        );
      } else {
        setError(
          "Unable to load Scientist data.",
        );
      }
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    void loadData();
  }, []);


  return (
    <RolePageGuard
      allowedRoles={[
        "DEVELOPER",
      ]}
    >
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          eyebrow="Scientific and technical control"
          title="Scientist Console"
          description="Monitor protected OMI diagnostics, runtime configuration and backend state."
          icon={BrainCircuit}
          actions={
            <button
              type="button"
              onClick={() => {
                void loadData();
              }}
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          }
        />

        {loading ? (
          <section className="flex min-h-72 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <LoaderCircle className="h-8 w-8 animate-spin text-[var(--accent)]" />
          </section>
        ) : error ? (
          <section className="rounded-3xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.05)] p-6">
            <p className="text-sm text-[var(--danger)]">
              {error}
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="MT5"
                value={
                  overview?.mt5_online
                    ? "Online"
                    : "Offline"
                }
                icon={ServerCog}
              />

              <MetricCard
                title="Auto Trade"
                value={
                  overview?.auto_trade
                    ? "Enabled"
                    : "Disabled"
                }
                icon={Settings2}
              />

              <MetricCard
                title="Today's Trades"
                value={
                  String(
                    overview
                      ?.today_trade_count
                    ?? 0,
                  )
                }
                icon={Activity}
              />

              <MetricCard
                title="Today's P&L"
                value={
                  String(
                    overview
                      ?.today_profit
                    ?? 0,
                  )
                }
                icon={Database}
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="font-semibold">
                  Runtime Risk State
                </h2>

                <div className="mt-5 space-y-3">
                  <InfoRow
                    label="Max trades/day"
                    value={
                      overview
                        ?.max_trades_per_day
                      ?? "-"
                    }
                  />

                  <InfoRow
                    label="Max daily loss"
                    value={
                      overview
                        ?.max_daily_loss
                      ?? "-"
                    }
                  />

                  <InfoRow
                    label="Consecutive losses"
                    value={
                      overview
                        ?.consecutive_losses
                      ?? "-"
                    }
                  />

                  <InfoRow
                    label="Cooldown"
                    value={
                      `${overview?.cooldown_seconds ?? "-"} s`
                    }
                  />

                  <InfoRow
                    label="Signal TTL"
                    value={
                      `${overview?.signal_ttl_seconds ?? "-"} s`
                    }
                  />
                </div>
              </article>

              <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="font-semibold">
                  Diagnostics
                </h2>

                <div className="mt-5 space-y-3">
                  <InfoRow
                    label="Execution cooldown"
                    value={
                      diagnostics
                        ?.risk_runtime
                        .execution_cooldown
                        ? "Active"
                        : "Inactive"
                    }
                  />

                  <InfoRow
                    label="Last signal"
                    value={
                      diagnostics
                        ?.risk_runtime
                        .last_signal
                      ?? "None"
                    }
                  />

                  <InfoRow
                    label="MT5 connectivity"
                    value={
                      diagnostics
                        ?.mt5
                        .online
                        ? "Online"
                        : "Offline"
                    }
                  />
                </div>
              </article>
            </section>
          </div>
        )}
      </div>
    </RolePageGuard>
  );
}


function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <Icon className="h-5 w-5 text-[var(--accent)]" />

      <p className="mt-4 text-sm text-[var(--foreground-muted)]">
        {title}
      </p>

      <p className="mt-2 text-xl font-semibold">
        {value}
      </p>
    </article>
  );
}


function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
      <span className="text-sm text-[var(--foreground-muted)]">
        {label}
      </span>

      <span className="text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}