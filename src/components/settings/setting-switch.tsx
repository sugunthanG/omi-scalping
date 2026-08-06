"use client";

import {
  cn,
} from "@/lib/cn";


interface SettingSwitchProps {
  checked: boolean;

  onCheckedChange: (
    checked: boolean,
  ) => void;

  disabled?: boolean;

  ariaLabel: string;
}


export function SettingSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  ariaLabel,
}: SettingSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        onCheckedChange(
          !checked,
        );
      }}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full border transition",
        checked
          ? "border-[color:rgba(50,196,141,0.36)] bg-[var(--success)]"
          : "border-[var(--border-strong)] bg-[var(--surface-muted)]",
        disabled
          && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform",
          checked
            ? "translate-x-[25px]"
            : "translate-x-1",
        )}
      />
    </button>
  );
}