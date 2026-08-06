import {
  Users,
} from "lucide-react";

import {
  RolePageGuard,
} from "@/components/auth/role-page-guard";

import {
  PageHeader,
} from "@/components/ui/page-header";


export default function AdminUsersPage() {
  return (
    <RolePageGuard
      allowedRoles={[
        "ADMIN",
      ]}
    >
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          eyebrow="Platform access management"
          title="User Management"
          description="Create, review and manage approved OMI user accounts."
          icon={Users}
        />

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-sm text-[var(--foreground-muted)]">
            The user-management API must be implemented before account
            creation and editing can be enabled.
          </p>
        </section>
      </div>
    </RolePageGuard>
  );
}