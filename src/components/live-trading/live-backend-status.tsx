"use client";

import {
  Server,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useBackendStatus } from "@/hooks/use-backend-status";
import { StatusBadge } from "@/components/ui/status-badge";

export function LiveBackendStatus() {
  const {
    data,
    isPending,
    isError,
  } = useBackendStatus();

  const online =
    !isPending &&
    !isError &&
    data?.status === "online";

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--foreground-muted)]">
            Backend Connection
          </p>

          <p className="mt-3 text-lg font-semibold">
            {isPending
              ? "Checking"
              : online
                ? data.service
                : "Unavailable"}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5">
          {online ? (
            <Wifi className="h-5 w-5 text-[var(--success)]" />
          ) : isPending ? (
            <Server className="h-5 w-5 text-[var(--warning)]" />
          ) : (
            <WifiOff className="h-5 w-5 text-[var(--danger)]" />
          )}
        </div>
      </div>

      <div className="mt-5">
        <StatusBadge
          tone={
            isPending
              ? "warning"
              : online
                ? "success"
                : "danger"
          }
        >
          {isPending
            ? "Checking API"
            : online
              ? "Connected"
              : "Disconnected"}
        </StatusBadge>
      </div>
    </article>
  );
}