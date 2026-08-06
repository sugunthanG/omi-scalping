"use client";

import {
  CheckCircle2,
  LoaderCircle,
  ServerCrash,
} from "lucide-react";

import { useBackendStatus } from "@/hooks/use-backend-status";
import { cn } from "@/lib/cn";

export function BackendStatusCard() {
  const {
    data,
    isPending,
    isError,
    error,
    dataUpdatedAt,
  } = useBackendStatus();

  const isOnline =
    !isPending &&
    !isError &&
    data?.status === "online";

  const statusLabel = isPending
    ? "Checking"
    : isOnline
      ? "Online"
      : "Offline";

  const description = isPending
    ? "Connecting to the local FastAPI bridge."
    : isOnline
      ? data.service
      : error instanceof Error
        ? error.message
        : "Unable to reach the FastAPI backend.";

  const StatusIcon = isPending
    ? LoaderCircle
    : isOnline
      ? CheckCircle2
      : ServerCrash;

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--foreground-muted)]">
            FastAPI Backend
          </p>

          <p
            className={cn(
              "mt-3 text-lg font-semibold",
              isOnline
                ? "text-[var(--success)]"
                : isPending
                  ? "text-[var(--warning)]"
                  : "text-[var(--danger)]",
            )}
          >
            {statusLabel}
          </p>
        </div>

        <div
          className={cn(
            "rounded-xl border p-2.5",
            isOnline
              ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.08)] text-[var(--success)]"
              : isPending
                ? "border-[color:rgba(241,185,76,0.25)] bg-[color:rgba(241,185,76,0.08)] text-[var(--warning)]"
                : "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.08)] text-[var(--danger)]",
          )}
        >
          <StatusIcon
            className={cn(
              "h-5 w-5",
              isPending && "animate-spin",
            )}
          />
        </div>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-[var(--foreground-muted)]">
        {description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs text-[var(--foreground-subtle)]">
        <span>Polling every 10 seconds</span>

        <span>
          {dataUpdatedAt > 0
            ? new Date(
                dataUpdatedAt,
              ).toLocaleTimeString()
            : "Not checked"}
        </span>
      </div>
    </article>
  );
}