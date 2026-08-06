"use client";

import {
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  navigationGroups,
} from "@/constants/navigation";
import {
  useAuth,
} from "@/context/auth-context";
import {
  cn,
} from "@/lib/cn";


interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}


export function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();

  const {
    role,
  } = useAuth();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--border)] bg-[rgba(8,13,21,0.97)] backdrop-blur-xl transition-[width] duration-300 lg:flex lg:flex-col",
        collapsed
          ? "w-20"
          : "w-[272px]",
      )}
    >
      {/* =====================================
          BRAND
      ===================================== */}

      <div className="flex h-[72px] items-center border-b border-[var(--border)] px-4">
        <Link
          href="/"
          className={cn(
            "flex min-w-0 items-center gap-3",
            collapsed && "mx-auto",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:rgba(217,164,65,0.35)] bg-[var(--accent-muted)] text-[var(--accent)]">
            <Bot className="h-5 w-5" />
          </div>

          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-wide">
                OMI Trading AI
              </p>

              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                XAUUSD Intelligence
              </p>
            </div>
          ) : null}
        </Link>
      </div>

      {/* =====================================
          NAVIGATION
      ===================================== */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) =>
                item.roles.includes(role),
            );

            if (visibleItems.length === 0) {
              return null;
            }

            return (
              <section key={group.label}>
                {!collapsed ? (
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
                    {group.label}
                  </p>
                ) : null}

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
                        title={
                          collapsed
                            ? item.label
                            : undefined
                        }
                        className={cn(
                          "group flex h-11 items-center gap-3 rounded-xl border px-3 text-sm font-medium transition",
                          collapsed &&
                            "justify-center px-0",
                          isActive
                            ? "border-[color:rgba(217,164,65,0.25)] bg-[var(--accent-muted)] text-[var(--accent)]"
                            : "border-transparent text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />

                        {!collapsed ? (
                          <span className="truncate">
                            {item.label}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </nav>

      {/* =====================================
          COLLAPSE CONTROL
      ===================================== */}

      <div className="border-t border-[var(--border)] p-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex h-10 w-full items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
            collapsed
              ? "justify-center"
              : "justify-between px-3",
          )}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {!collapsed ? (
            <span>
              Collapse menu
            </span>
          ) : null}

          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}