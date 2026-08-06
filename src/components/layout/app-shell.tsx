"use client";

import {
  useState,
} from "react";

import {
  PageTransition,
} from "@/components/layout/page-transition";

import {
  Sidebar,
} from "@/components/layout/sidebar";

import {
  Topbar,
} from "@/components/layout/topbar";

import {
  cn,
} from "@/lib/cn";


export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);


  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => {
          setSidebarCollapsed(
            (current) =>
              !current,
          );
        }}
      />

      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-300",
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-[272px]",
        )}
      >
        <Topbar
          onOpenMobileMenu={() => {
            /*
             * Mobile navigation will be added later.
             */
          }}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}