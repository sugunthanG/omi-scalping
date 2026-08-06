import {
  CircleUserRound,
} from "lucide-react";

import {
  ProfileDashboard,
} from "@/components/profile/profile-dashboard";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Identity and permissions"
        title="Profile"
        description="Review your OMI role, current permissions, personal preferences and frontend security state."
        icon={CircleUserRound}
        actions={
          <>
            <StatusBadge tone="warning">
              Development identity
            </StatusBadge>

            <StatusBadge tone="accent">
              Role profile
            </StatusBadge>
          </>
        }
      />

      <ProfileDashboard />
    </div>
  );
}