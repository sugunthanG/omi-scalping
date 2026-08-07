"use client";

import axios from "axios";

import {
  LoaderCircle,
  RefreshCcw,
  TerminalSquare,
  Trash2,
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
  clearScientistLogs,
  fetchScientistLogs,
} from "@/services/api/scientist-api";

import type {
  ScientistLog,
} from "@/services/api/scientist-api";


export default function SystemLogsPage() {
  const [
    logs,
    setLogs,
  ] = useState<ScientistLog[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isClearing,
    setIsClearing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  async function loadLogs() {
    setIsLoading(true);
    setError(null);

    try {
      const result =
        await fetchScientistLogs(
          100,
        );

      setLogs(
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
          ?? "Unable to load system logs.",
        );
      } else {
        setError(
          "Unable to load system logs.",
        );
      }
    } finally {
      setIsLoading(
        false,
      );
    }
  }


  async function handleClear() {
    if (isClearing) {
      return;
    }

    setIsClearing(
      true,
    );

    setError(
      null,
    );

    try {
      await clearScientistLogs();

      await loadLogs();
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
          ?? "Unable to clear system logs.",
        );
      } else {
        setError(
          "Unable to clear system logs.",
        );
      }
    } finally {
      setIsClearing(
        false,
      );
    }
  }


  useEffect(() => {
    void loadLogs();
  }, []);


  return (
    <RolePageGuard
      allowedRoles={[
        "DEVELOPER",
      ]}
    >
      <div className="mx-auto max-w-[1600px]">
        <PageHeader
          eyebrow="Protected technical visibility"
          title="System Logs"
          description="Review OMI runtime, signal, execution and Scientist diagnostic events."
          icon={TerminalSquare}
          actions={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void loadLogs();
                }}
                disabled={isLoading}
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

              <button
                type="button"
                onClick={() => {
                  void handleClear();
                }}
                disabled={
                  isClearing
                  || isLoading
                }
                className="flex h-10 items-center gap-2 rounded-xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.05)] px-4 text-sm font-semibold text-[var(--danger)] transition hover:bg-[color:rgba(239,98,98,0.10)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isClearing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                {isClearing
                  ? "Clearing..."
                  : "Clear logs"}
              </button>
            </div>
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
                Loading Scientist logs
              </p>
            </div>
          </section>
        ) : logs.length === 0 ? (
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
            <p className="font-semibold">
              No buffered logs
            </p>

            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              No Scientist diagnostic events are currently stored in the runtime log buffer.
            </p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <p className="text-sm font-semibold">
                Latest events
              </p>

              <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
                Showing {logs.length} entries
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[850px] divide-y divide-[var(--border)]">
                {logs.map(
                  (
                    log,
                    index,
                  ) => (
                    <div
                      key={`${log.timestamp}-${index}`}
                      className="grid grid-cols-[190px_90px_150px_1fr] gap-4 px-5 py-4"
                    >
                      <span className="text-xs text-[var(--foreground-subtle)]">
                        {formatTimestamp(
                          log.timestamp,
                        )}
                      </span>

                      <span className="text-xs font-semibold">
                        {log.level}
                      </span>

                      <span className="text-xs text-[var(--foreground-muted)]">
                        {log.source}
                      </span>

                      <span className="text-sm leading-5">
                        {log.message}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </RolePageGuard>
  );
}


function formatTimestamp(
  value: string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}