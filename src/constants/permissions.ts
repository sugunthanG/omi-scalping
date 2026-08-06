import type {
  AuthRole,
} from "@/types/auth";


export type Permission =
  // =====================================
  // SHARED READ PERMISSIONS
  // =====================================

  | "dashboard:view"
  | "live-trading:view"
  | "positions:view"
  | "history:view"
  | "performance:view"
  | "risk-summary:view"
  | "signals:view"
  | "ai-summary:view"
  | "market-summary:view"
  | "news:view"
  | "notifications:view"
  | "profile:view"

  // =====================================
  // TECHNICAL / DEVELOPER VISIBILITY
  // =====================================

  | "raw-api:view"
  | "raw-market-data:view"
  | "backend-health:view"
  | "backend-connections:view"
  | "service-health:view"
  | "system-logs:view"
  | "prediction-logs:view"
  | "trailing-logs:view"
  | "dynamic-tp-logs:view"
  | "exit-logs:view"
  | "learning-logs:view"
  | "debug-tools:use"

  // =====================================
  // DEVELOPER TECHNICAL CONTROL
  // =====================================

  | "developer-settings:edit"
  | "ai-diagnostics:edit"
  | "system-config:edit"
  | "model-config:edit"
  | "feature-config:edit"
  | "signal-config:edit"
  | "session-config:edit"
  | "spread-config:edit"
  | "trailing-config:edit"
  | "dynamic-tp-config:edit"
  | "exit-config:edit"
  | "learning-config:edit"
  | "auto-trading:toggle"
  | "emergency-stop:execute"
  | "services:restart"
  | "deployment:control"

  // =====================================
  // ADMIN FINANCIAL / ACCOUNT CONTROL
  // =====================================

  | "trading-settings:view"
  | "trading-settings:edit"
  | "lot-size:edit"
  | "risk-settings:view"
  | "risk-settings:edit"
  | "account-settings:view"
  | "account-settings:edit"
  | "broker-settings:view"
  | "broker-settings:edit"
  | "users:view"
  | "users:manage"
  | "permissions:manage";


const userPermissions: readonly Permission[] = [
  "dashboard:view",
  "live-trading:view",
  "positions:view",
  "history:view",
  "performance:view",
  "risk-summary:view",
  "signals:view",
  "ai-summary:view",
  "market-summary:view",
  "news:view",
  "notifications:view",
  "profile:view",
];


const developerPermissions: readonly Permission[] = [
  ...userPermissions,

  // Developer-only raw and technical visibility
  "raw-api:view",
  "raw-market-data:view",
  "backend-health:view",
  "backend-connections:view",
  "service-health:view",
  "system-logs:view",
  "prediction-logs:view",
  "trailing-logs:view",
  "dynamic-tp-logs:view",
  "exit-logs:view",
  "learning-logs:view",
  "debug-tools:use",

  // Full technical configuration control
  "developer-settings:edit",
  "ai-diagnostics:edit",
  "system-config:edit",
  "model-config:edit",
  "feature-config:edit",
  "signal-config:edit",
  "session-config:edit",
  "spread-config:edit",
  "trailing-config:edit",
  "dynamic-tp-config:edit",
  "exit-config:edit",
  "learning-config:edit",

  // Developer-only operational control
  "auto-trading:toggle",
  "emergency-stop:execute",
  "services:restart",
  "deployment:control",

  // Developer may inspect but not edit protected financial controls
  "trading-settings:view",
  "risk-settings:view",
  "account-settings:view",
  "broker-settings:view",
  "users:view",
];


const adminPermissions: readonly Permission[] = [
  ...userPermissions,

  // Admin may view useful operational summaries,
  // but not developer-only raw API payloads.
  "backend-health:view",
  "service-health:view",

  // Admin financial and account control
  "trading-settings:view",
  "trading-settings:edit",
  "lot-size:edit",
  "risk-settings:view",
  "risk-settings:edit",
  "account-settings:view",
  "account-settings:edit",
  "broker-settings:view",
  "broker-settings:edit",
  "users:view",
  "users:manage",
  "permissions:manage",

  // Intentionally excluded:
  // "raw-api:view"
  // "raw-market-data:view"
  // "backend-connections:view"
  // "system-logs:view"
  // "prediction-logs:view"
  // "trailing-logs:view"
  // "dynamic-tp-logs:view"
  // "exit-logs:view"
  // "learning-logs:view"
  // "developer-settings:edit"
  // "ai-diagnostics:edit"
  // "auto-trading:toggle"
  // "emergency-stop:execute"
  // "services:restart"
  // "deployment:control"
];


export const rolePermissions: Record<
  AuthRole,
  readonly Permission[]
> = {
  USER:
    userPermissions,

  DEVELOPER:
    developerPermissions,

  ADMIN:
    adminPermissions,
};


export function hasPermission(
  role: AuthRole,
  permission: Permission,
): boolean {
  return rolePermissions[
    role
  ].includes(
    permission,
  );
}