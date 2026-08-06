import type {
  LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
}: PageHeaderProps) {
  return (
    <section className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          <Icon className="h-3.5 w-3.5" />
          {eyebrow}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--foreground-muted)] sm:text-base">
          {description}
        </p>
      </div>

      {actions ? (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      ) : null}
    </section>
  );
}