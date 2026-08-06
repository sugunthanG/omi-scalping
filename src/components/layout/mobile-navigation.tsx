"use client";

import {
  Bot,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  navigationGroups,
  type NavigationRole,
} from "@/constants/navigation";
import { cn } from "@/lib/cn";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

const temporaryRole: NavigationRole = "ADMIN";

export function MobileNavigation({
  open,
  onClose,
}: MobileNavigationProps) {
  const pathname = usePathname();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <aside className="relative flex h-full w-[86%] max-w-[320px] flex-col border-r border-[var(--border)] bg-[var(--background)] shadow-2xl">
        <div className="flex h-[72px] items-center justify-between border-b border-[var(--border)] px-4">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:rgba(217,164,65,0.35)] bg-[var(--accent-muted)] text-[var(--accent)]">
              <Bot className="h-5 w-5" />
            </div>

            <div>
              <p className="font-bold">
                OMI Trading AI
              </p>

              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                Control Center
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground-muted)]"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {navigationGroups.map((group) => {
              const visibleItems =
                group.items.filter((item) =>
                  item.roles.includes(
                    temporaryRole,
                  ),
                );

              if (visibleItems.length === 0) {
                return null;
              }

              return (
                <section key={group.label}>
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                    {group.label}
                  </p>

                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;

                      const isActive =
                        item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(
                              item.href,
                            );

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex h-11 items-center gap-3 rounded-xl border px-3 text-sm font-medium",
                            isActive
                              ? "border-[color:rgba(217,164,65,0.25)] bg-[var(--accent-muted)] text-[var(--accent)]"
                              : "border-transparent text-[var(--foreground-muted)]",
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </nav>
      </aside>
    </div>
  );
}