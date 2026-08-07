"use client";

import axios from "axios";

import {
  Activity,
  LoaderCircle,
  RefreshCcw,
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
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  async function loadServices() {
    setLoading(true);
    setError(null);

    try {
      const result =
        await fetchScientistServices();

      setServices(
        result,
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
          ?? "Unable to load service health.",
        );
      } else {
        setError(
          "Unable to load service health.",
        );
      }
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    void loadServices();
  }, []);


  const entries =
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
          eyebrow="Backend service monitoring"
          title="Service Health"
          description="Monitor protected OMI backend processes and MT5 connectivity."
          icon={Activity}
          actions={
            <button
              type="button"
              onClick={() => {
                void loadServices();
              }}
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold"
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
            {error}
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {entries.map(
              ([name, service]) => {
                const online =
                  service.status === "online"
                  || service.status === "running";

                return (
                  <article
                    key={name}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-[var(--foreground-subtle)]">
                          Service
                        </p>

                        <h2 className="mt-2 font-semibold">
                          {name
                            .replaceAll(
                              "_",
                              " ",
                            )}
                        </h2>
                      </div>

                      <StatusBadge
                        tone={
                          online
                            ? "success"
                            : "danger"
                        }
                      >
                        {service.status}
                      </StatusBadge>
                    </div>
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