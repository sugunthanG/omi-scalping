"use client";

import {
  LoaderCircle,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  AppShell,
} from "./app-shell";

import {
  useAuth,
} from "@/context/auth-context";


const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/founder-recovery",
  "/temporary-password",
];


function isPublicPath(
  pathname: string,
): boolean {
  return PUBLIC_PATHS.some(
    (publicPath) =>
      pathname === publicPath
      || pathname.startsWith(
        `${publicPath}/`,
      ),
  );
}


export function RootShellRouter({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const publicPage =
    isPublicPath(
      pathname,
    );


  useEffect(() => {
    if (
      !isLoading
      && !isAuthenticated
      && !publicPage
    ) {
      router.replace(
        "/login",
      );
    }
  }, [
    isAuthenticated,
    isLoading,
    publicPage,
    router,
  ]);


  /*
   * Login, forgot password and recovery pages must never
   * receive the dashboard sidebar or topbar.
   */
  if (publicPage) {
    return (
      <>
        {children}
      </>
    );
  }


  /*
   * Do not reveal any protected UI while the session
   * is being checked.
   */
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[var(--accent)]" />

          <p className="mt-4 font-semibold">
            Verifying OMI session
          </p>

          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Secure authentication in progress
          </p>
        </div>
      </main>
    );
  }


  /*
   * While redirecting to login, render no protected UI.
   */
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[var(--background)]" />
    );
  }


  return (
    <AppShell>
      {children}
    </AppShell>
  );
}