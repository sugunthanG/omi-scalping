import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "accent";

interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusTone;
  showDot?: boolean;
  className?: string;
}

const toneClasses: Record<StatusTone, string> = {
  success:
    "border-[color:rgba(50,196,141,0.28)] bg-[color:rgba(50,196,141,0.09)] text-[var(--success)]",
  warning:
    "border-[color:rgba(241,185,76,0.28)] bg-[color:rgba(241,185,76,0.09)] text-[var(--warning)]",
  danger:
    "border-[color:rgba(239,98,98,0.28)] bg-[color:rgba(239,98,98,0.09)] text-[var(--danger)]",
  info:
    "border-[color:rgba(94,162,239,0.28)] bg-[color:rgba(94,162,239,0.09)] text-[var(--info)]",
  neutral:
    "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground-muted)]",
  accent:
    "border-[color:rgba(217,164,65,0.28)] bg-[var(--accent-muted)] text-[var(--accent)]",
};

const dotClasses: Record<StatusTone, string> = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
  info: "bg-[var(--info)]",
  neutral: "bg-[var(--foreground-subtle)]",
  accent: "bg-[var(--accent)]",
};

export function StatusBadge({
  children,
  tone = "neutral",
  showDot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {showDot ? (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dotClasses[tone],
          )}
        />
      ) : null}

      {children}
    </span>
  );
}