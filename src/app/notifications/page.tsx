import {
  Bell,
} from "lucide-react";

import {
  NotificationsDashboard,
} from "@/components/notifications/notifications-dashboard";

import {
  PageHeader,
} from "@/components/ui/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";


export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        eyebrow="OMI event center"
        title="Notifications"
        description="Review current AI signal, execution, trade, account and risk events that may require attention."
        icon={Bell}
        actions={
          <>
            <StatusBadge tone="success">
              Live events
            </StatusBadge>

            <StatusBadge tone="accent">
              Monitoring only
            </StatusBadge>
          </>
        }
      />

      <NotificationsDashboard />
    </div>
  );
}