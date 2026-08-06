"use client";

import {
  Bell,
  Menu,
  Wifi,
  WifiOff,
} from "lucide-react";

import Link from "next/link";

import {
  UserAccountMenu,
} from "@/components/layout/user-account-menu";

import {
  useBackendStatus,
} from "@/hooks/use-backend-status";

import {
  cn,
} from "@/lib/cn";


interface TopbarProps {
  onOpenMobileMenu: () => void;
}


export function Topbar({
  onOpenMobileMenu,
}: TopbarProps) {
  const {
    data,
    isPending,
    isError,
  } = useBackendStatus();

  const backendOnline =
    !isPending
    && !isError
    && data?.status === "online";


  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[var(--border)] bg-[rgba(7,11,18,0.9)] px-4 backdrop-blur-xl sm:px-6">
      {/* =====================================
          LEFT SIDE
      ===================================== */}

      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
            OMI Control Center
          </p>

          <p className="hidden truncate text-xs text-[var(--foreground-subtle)] sm:block">
            Institutional Gold Intelligence Platform
          </p>
        </div>
      </div>

      {/* =====================================
          RIGHT SIDE
      ===================================== */}

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Backend status */}

        <div
          className={cn(
            "hidden h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold md:flex",
            backendOnline
              ? "border-[color:rgba(50,196,141,0.25)] bg-[color:rgba(50,196,141,0.08)] text-[var(--success)]"
              : "border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.08)] text-[var(--danger)]",
          )}
        >
          {backendOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}

          {isPending
            ? "Checking backend"
            : backendOnline
              ? "Backend online"
              : "Backend offline"}
        </div>

        {/* Notifications */}

        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
          aria-label="Open notifications"
        >
          <Bell className="h-[18px] w-[18px]" />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface)]" />
        </Link>

        {/* Authenticated identity and logout */}

        <UserAccountMenu />
      </div>
    </header>
  );
}