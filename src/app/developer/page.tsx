import {
  Activity,
  BrainCircuit,
  Code2,
  Database,
  ServerCog,
  Settings2,
} from "lucide-react";

import {
  RolePageGuard,
} from "@/components/auth/role-page-guard";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


const modules = [
  {
    title:
      "AI Diagnostics",

    description:
      "Inspect model state, signal decisions, confidence, quality filters and inference diagnostics.",

    icon:
      BrainCircuit,
  },

  {
    title:
      "Backend Configuration",

    description:
      "Manage permitted technical configuration without changing protected financial limits.",

    icon:
      Settings2,
  },

  {
    title:
      "API Diagnostics",

    description:
      "Inspect raw API responses, latency, failures and backend connectivity.",

    icon:
      Database,
  },

  {
    title:
      "Service Controls",

    description:
      "Protected technical controls for OMI services and monitoring processes.",

    icon:
      ServerCog,
  },

  {
    title:
      "Pipeline Monitoring",

    description:
      "Monitor feature engineering, prediction, trailing, Dynamic TP, exit and learning pipelines.",

    icon:
      Activity,
  },
];


export default function ScientistConsolePage() {
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
          description="Access protected OMI AI diagnostics, backend configuration, raw APIs and technical system controls."
          icon={Code2}
          actions={
            <>
              <StatusBadge tone="info">
                Scientist only
              </StatusBadge>

              <StatusBadge tone="warning">
                Protected controls
              </StatusBadge>
            </>
          }
        />

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(
            (module) => {
              const Icon =
                module.icon;

              return (
                <article
                  key={module.title}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[color:rgba(94,162,239,0.25)] bg-[color:rgba(94,162,239,0.07)] text-[var(--info)]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h2 className="mt-5 font-semibold">
                    {module.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    {module.description}
                  </p>
                </article>
              );
            },
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-[color:rgba(241,185,76,0.25)] bg-[color:rgba(241,185,76,0.05)] p-5">
          <p className="text-sm font-semibold text-[var(--warning)]">
            Backend update APIs required
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
            This console now exists and is role-protected. Edit and service
            actions will be connected only after their FastAPI endpoints are
            implemented with Scientist permission checks.
          </p>
        </section>
      </div>
    </RolePageGuard>
  );
}