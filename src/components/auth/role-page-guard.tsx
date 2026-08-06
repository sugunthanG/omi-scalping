"use client";

import {
  ShieldX,
} from "lucide-react";

import Link from "next/link";

import {
  useAuth,
} from "@/context/auth-context";

import type {
  AuthRole,
} from "@/types/auth";


interface RolePageGuardProps {
  allowedRoles: AuthRole[];

  children: React.ReactNode;
}


export function RolePageGuard({
  allowedRoles,
  children,
}: RolePageGuardProps) {
  const {
    user,
    role,
  } = useAuth();


  if (!user) {
    return null;
  }


  if (
    !allowedRoles.includes(
      role,
    )
  ) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-3xl border border-[color:rgba(239,98,98,0.25)] bg-[color:rgba(239,98,98,0.05)] p-8 text-center">
          <ShieldX className="mx-auto h-10 w-10 text-[var(--danger)]" />

          <h1 className="mt-5 text-2xl font-semibold">
            Access denied
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
            Your authenticated OMI role does not have permission to access
            this page.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold"
          >
            Return to dashboard
          </Link>
        </div>
      </section>
    );
  }


  return (
    <>
      {children}
    </>
  );
}