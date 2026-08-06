"use client";

import {
  LoaderCircle,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  useAuth,
} from "@/context/auth-context";


const publicRoutes = new Set([
  "/login",
  "/forgot-password",
  "/founder-recovery",
]);


export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname =
    usePathname();

  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const isPublicRoute =
    publicRoutes.has(
      pathname,
    );

  if (isPublicRoute) {
    return children;
  }

  if (
    isLoading
    || !isAuthenticated
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

          <p className="mt-4 font-semibold">
            Verifying OMI session
          </p>
        </div>
      </main>
    );
  }

  return children;
}