"use client";

import {
  KeyRound,
  LockKeyhole,
  RotateCcwKey,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  useAuth,
} from "@/context/auth-context";


export function PasswordSecurityPanel() {
  const {
    user,
  } = useAuth();


  if (!user) {
    return null;
  }


  const isFounder =
    user.username ===
      "founder_sugunthan"
    || user.username ===
      "founder_boopathi";


  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="border-b border-[var(--border)] px-6 py-5">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--accent)]" />

          <h2 className="font-semibold">
            Password and Security
          </h2>
        </div>

        <p className="mt-1 text-xs text-[var(--foreground-subtle)]">
          Manage password changes and protected account recovery.
        </p>
      </div>

      {/* =====================================
          PASSWORD ACTIONS
      ===================================== */}

      <div className="grid gap-4 p-5 md:grid-cols-2">
        {/* Change password */}

        <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <LockKeyhole className="h-5 w-5" />
          </div>

          <h3 className="mt-4 font-semibold">
            Change password
          </h3>

          <p className="mt-2 flex-1 text-sm leading-6 text-[var(--foreground-muted)]">
            Submit a protected password-change request.

            {isFounder
              ? " The other founder must approve the request before the new password becomes active."
              : " Your current password must be verified before it can be changed."}
          </p>

          <div className="mt-5">
            <Link
              href="/profile/change-password"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[color:rgba(217,164,65,0.30)] bg-[var(--accent-muted)] px-4 text-sm font-semibold text-[var(--accent)] transition hover:brightness-110"
            >
              Change password
            </Link>
          </div>
        </article>

        {/* Recovery requests */}

        <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--info)]">
            <RotateCcwKey className="h-5 w-5" />
          </div>

          <h3 className="mt-4 font-semibold">
            Recovery requests
          </h3>

          <p className="mt-2 flex-1 text-sm leading-6 text-[var(--foreground-muted)]">
            Review password-reset requests, founder approvals, temporary
            credentials and recovery status.
          </p>

          <div className="mt-5">
            <Link
              href="/profile/security-requests"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
            >
              View requests
            </Link>
          </div>
        </article>
      </div>

      {/* =====================================
          FOUNDER SECURITY NOTICE
      ===================================== */}

      {isFounder ? (
        <div className="border-t border-[color:rgba(94,162,239,0.20)] bg-[color:rgba(94,162,239,0.04)] px-6 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--info)]" />

            <div>
              <p className="text-sm font-semibold text-[var(--info)]">
                Dual-founder authorization
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                A founder cannot approve their own password-change or
                recovery request. Authorization must come from the other
                founder account.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}