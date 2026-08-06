import type {
  LucideIcon,
} from "lucide-react";


export type NotificationSeverity =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "CRITICAL";


export type NotificationCategory =
  | "SIGNAL"
  | "TRADE"
  | "RISK"
  | "ACCOUNT"
  | "SYSTEM";


export interface OmiNotification {
  id: string;

  title: string;
  message: string;

  severity: NotificationSeverity;
  category: NotificationCategory;

  createdAt: string;

  href?: string;

  icon: LucideIcon;
}