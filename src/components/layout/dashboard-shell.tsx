"use client";

import {
  type ReactNode,
  useState,
} from "react";

import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/cn";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({
  children,
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileNavigationOpen, setMobileNavigationOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed(
            (current) => !current,
          )
        }
      />

      <MobileNavigation
        open={mobileNavigationOpen}
        onClose={() =>
          setMobileNavigationOpen(false)
        }
      />

      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300",
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-[272px]",
        )}
      >
        <Topbar
          onOpenMobileMenu={() =>
            setMobileNavigationOpen(true)
          }
        />

        <main className="p-4 sm:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}