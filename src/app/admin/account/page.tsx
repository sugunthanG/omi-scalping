"use client";

import axios from "axios";

import {
  LoaderCircle,
  Save,
  ShieldCheck,
  SlidersHorizontal,
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
  fetchAdminTradingSettings,
  updateAdminTradingSettings,
} from "@/services/api/admin-trading-settings-api";

import type {
  AdminTradingSettings,
} from "@/services/api/admin-trading-settings-api";


const emptySettings: AdminTradingSettings = {
  lot_size: 0.01,

  max_trades_per_day: 20,

  max_daily_loss: 100,

  max_consecutive_losses: 3,

  cooldown_seconds: 600,

  signal_ttl_seconds: 15,

  updated_at: null,

  updated_by: null,
};


export default function AdminTradingSettingsPage() {
  const [
    settings,
    setSettings,
  ] = useState<AdminTradingSettings>(
    emptySettings,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const result =
          await fetchAdminTradingSettings();

        if (active) {
          setSettings(result);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (
          axios.isAxiosError(
            requestError,
          )
        ) {
          setError(
            requestError.response
              ?.data
              ?.detail
            ?? "Unable to load trading settings.",
          );
        } else {
          setError(
            "Unable to load trading settings.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);


  const updateNumberField = (
    field:
      keyof Pick<
        AdminTradingSettings,
        | "lot_size"
        | "max_trades_per_day"
        | "max_daily_loss"
        | "max_consecutive_losses"
        | "cooldown_seconds"
        | "signal_ttl_seconds"
      >,

    value: string,
  ) => {
    const parsedValue =
      Number(value);

    setSettings(
      (current) => ({
        ...current,
        [field]:
          Number.isFinite(parsedValue)
            ? parsedValue
            : 0,
      }),
    );
  };


  const handleSave =
    async () => {
      setMessage(null);
      setError(null);
      setIsSaving(true);

      try {
        const updated =
          await updateAdminTradingSettings(
            settings,
          );

        setSettings(updated);

        setMessage(
          "Trading settings saved and applied to the OMI backend.",
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
            ?? "Unable to save trading settings.",
          );
        } else {
          setError(
            "Unable to save trading settings.",
          );
        }
      } finally {
        setIsSaving(false);
      }
    };


  return (
    <RolePageGuard
      allowedRoles={[
        "ADMIN",
      ]}
    >
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          eyebrow="Protected financial controls"
          title="Trading Settings"
          description="Manage lot size and protected financial risk configuration."
          icon={SlidersHorizontal}
          actions={
            <>
              <StatusBadge tone="accent">
                Admin only
              </StatusBadge>

              <StatusBadge tone="warning">
                Financial controls
              </StatusBadge>
            </>
          }
        />

        {isLoading ? (
          <section className="flex min-h-80 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <LoaderCircle className="h-8 w-8 animate-spin text-[var(--accent)]" />
          </section>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-6 py-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />

                <h2 className="font-semibold">
                  Admin Financial Configuration
                </h2>
              </div>

              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                Saved values are applied immediately to the running backend.
              </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
              <SettingInput
                label="Lot size"
                value={settings.lot_size}
                step="0.01"
                min="0.01"
                onChange={(value) => {
                  updateNumberField(
                    "lot_size",
                    value,
                  );
                }}
              />

              <SettingInput
                label="Maximum trades per day"
                value={
                  settings.max_trades_per_day
                }
                step="1"
                min="1"
                onChange={(value) => {
                  updateNumberField(
                    "max_trades_per_day",
                    value,
                  );
                }}
              />

              <SettingInput
                label="Maximum daily loss"
                value={
                  settings.max_daily_loss
                }
                step="1"
                min="1"
                onChange={(value) => {
                  updateNumberField(
                    "max_daily_loss",
                    value,
                  );
                }}
              />

              <SettingInput
                label="Maximum consecutive losses"
                value={
                  settings.max_consecutive_losses
                }
                step="1"
                min="1"
                onChange={(value) => {
                  updateNumberField(
                    "max_consecutive_losses",
                    value,
                  );
                }}
              />

              <SettingInput
                label="Cooldown seconds"
                value={
                  settings.cooldown_seconds
                }
                step="1"
                min="0"
                onChange={(value) => {
                  updateNumberField(
                    "cooldown_seconds",
                    value,
                  );
                }}
              />

              <SettingInput
                label="Signal expiry seconds"
                value={
                  settings.signal_ttl_seconds
                }
                step="1"
                min="1"
                onChange={(value) => {
                  updateNumberField(
                    "signal_ttl_seconds",
                    value,
                  );
                }}
              />
            </div>

            {message ? (
              <div className="mx-6 mb-5 rounded-xl border border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.06)] px-4 py-3 text-sm text-[var(--success)]">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mx-6 mb-5 rounded-xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.06)] px-4 py-3 text-sm text-[var(--danger)]">
                {error}
              </div>
            ) : null}

            <div className="flex justify-end border-t border-[var(--border)] p-6">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  void handleSave();
                }}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 text-sm font-bold text-[#090d13] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {isSaving
                  ? "Saving settings"
                  : "Save settings"}
              </button>
            </div>
          </section>
        )}
      </div>
    </RolePageGuard>
  );
}


interface SettingInputProps {
  label: string;

  value: number;

  min: string;

  step: string;

  onChange: (
    value: string,
  ) => void;
}


function SettingInput({
  label,
  value,
  min,
  step,
  onChange,
}: SettingInputProps) {
  return (
    <label className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
      <span className="text-sm text-[var(--foreground-muted)]">
        {label}
      </span>

      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) => {
          onChange(
            event.target.value,
          );
        }}
        className="mt-3 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold outline-none transition focus:border-[var(--accent)]"
      />
    </label>
  );
}