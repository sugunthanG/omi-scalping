"use client";

import axios from "axios";

import {
  Activity,
  LoaderCircle,
  RefreshCcw,
  ServerCog,
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
  fetchScientistServices,
} from "@/services/api/scientist-api";

import type {
  ScientistServices,
} from "@/services/api/scientist-api";


export default function ServiceHealthPage() {
  const [
    services,
    setServices,
  ] = useState<ScientistServices | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  async function loadServices() {
    setIsLoading(true);
    setError(null);

    try {
      const result =
        await fetchScientistServices();

      setServices(result);
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
          ?? "Unable to load service health.",
        );
      } else {
        setError(
          "Unable to load service health.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    void loadServices();
  }, []);


  const serviceEntries =
    services
      ? Object.entries(
          services,
        )
      : [];


  return (
    <RolePageGuard
      allowedRoles={[
        "DEVELOPER",
      ]}
    >
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          eyebrow="Protected backend monitoring"
          title="Service Health"
          description="Monitor FastAPI, MT5 and OMI background service availability."
          icon={Activity}
          actions={
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                void loadServices();
              }}
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw
                className={
                  isLoading
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />

              Refresh
            </button>
          }
        />

        {error ? (
          <section className="mb-5 rounded-2xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.05)] px-5 py-4">
            <p className="text-sm text-[var(--danger)]">
              {error}
            </p>
          </section>
        ) : null}

        {isLoading ? (
          <section className="flex min-h-72 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="text-center">
              <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" />

              <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                Checking OMI services
              </p>
            </div>
          </section>
        ) : serviceEntries.length === 0 ? (
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="text-sm text-[var(--foreground-muted)]">
              No service information is available.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {serviceEntries.map(
              (
                [
                  key,
                  service,
                ],
              ) => {
                const healthy =
                  service.status === "online"
                  || service.status === "running";

                return (
                  <article
                    key={key}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--accent)]">
                        <ServerCog className="h-5 w-5" />
                      </div>

                      <StatusBadge
                        tone={
                          healthy
                            ? "success"
                            : "danger"
                        }
                      >
                        {service.status}
                      </StatusBadge>
                    </div>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--foreground-subtle)]">
                      OMI Service
                    </p>

                    <h2 className="mt-2 text-lg font-semibold capitalize">
                      {key.replaceAll(
                        "_",
                        " ",
                      )}
                    </h2>

                    <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                      {healthy
                        ? "Service is currently available."
                        : "Service is unavailable or not responding."}
                    </p>
                  </article>
                );
              },
            )}
          </section>
        )}
      </div>
    </RolePageGuard>
  );
}