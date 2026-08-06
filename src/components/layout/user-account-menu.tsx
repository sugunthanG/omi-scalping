"use client";

import {
  ChevronDown,
  CircleUserRound,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useAuth,
} from "@/context/auth-context";

import {
  cn,
} from "@/lib/cn";

import {
  getRoleDisplayName,
} from "@/lib/role-display";

function formatUsername(
  username: string,
): string {
  return username
    .replace(
      /^founder_/i,
      "",
    )
    .split("_")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase()
        + word.slice(1).toLowerCase(),
    )
    .join(" ");
}


export function UserAccountMenu() {
  const {
    user,
    logout,
  } = useAuth();

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );


  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current
        && !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(
          false,
        );
      }
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape"
      ) {
        setIsOpen(
          false,
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);


  if (!user) {
    return null;
  }


  const displayName =
    formatUsername(
      user.username,
    );


  const handleLogout =
    async () => {
      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(
        true,
      );

      setIsOpen(
        false,
      );

      try {
        await logout(
          "manual",
        );
      } finally {
        setIsLoggingOut(
          false,
        );
      }
    };


  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(
            (current) =>
              !current,
          );
        }}
        className="flex h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 transition hover:border-[var(--border-strong)]"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[color:rgba(217,164,65,0.24)] bg-[var(--accent-muted)] text-[var(--accent)]">
          <ShieldCheck className="h-4 w-4" />
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-40 truncate text-xs font-semibold">
            {displayName}
          </p>

          <p className="mt-0.5 max-w-44 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
            {user.designation
              ?? user.role}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "hidden h-3.5 w-3.5 text-[var(--foreground-subtle)] transition-transform sm:block",
            isOpen
              && "rotate-180",
          )}
        />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-[rgba(8,13,21,0.98)] shadow-2xl backdrop-blur-xl"
        >
          <div className="border-b border-[var(--border)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:rgba(217,164,65,0.25)] bg-[var(--accent-muted)] text-[var(--accent)]">
                <CircleUserRound className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {displayName}
                </p>

                <p className="mt-1 truncate text-xs text-[var(--foreground-muted)]">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg border border-[color:rgba(94,162,239,0.28)] bg-[color:rgba(94,162,239,0.08)] px-2.5 py-1 text-[10px] font-semibold text-[var(--info)]">
                {getRoleDisplayName(
                    user.role,
                )}
                </span>

              {user.designation ? (
                <span className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-[10px] font-semibold text-[var(--foreground-muted)]">
                  {user.designation}
                </span>
              ) : null}
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => {
                setIsOpen(
                  false,
                );
              }}
              className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-[var(--foreground-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <UserRound className="h-4 w-4" />

              View profile
            </Link>

            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={() => {
                void handleLogout();
              }}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[var(--danger)] transition hover:bg-[color:rgba(239,98,98,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />

              {isLoggingOut
                ? "Signing out..."
                : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}