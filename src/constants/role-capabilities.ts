import type {
  NavigationRole,
} from "@/constants/navigation";


export interface RoleCapability {
  label: string;
  description: string;
  allowed: boolean;
}


export const roleDescriptions: Record<
  NavigationRole,
  string
> = {
  USER:
    "Read-only access to useful trading, account, signal and performance information.",

  DEVELOPER:
    "Full technical access to diagnostics, raw APIs, AI configuration, backend services and development controls. Lot size and risk limits remain unavailable.",

  ADMIN:
    "Operational access to account, lot size, broker, risk and user-management controls. Raw APIs and developer-only system controls remain unavailable.",
};


export const roleCapabilities: Record<
  NavigationRole,
  RoleCapability[]
> = {
  USER: [
    {
      label: "Dashboard monitoring",
      description:
        "View account, signals, positions, history, performance and risk summaries.",
      allowed: true,
    },

    {
      label: "Raw API responses",
      description:
        "View unprocessed backend responses and technical payloads.",
      allowed: false,
    },

    {
      label: "Developer configuration",
      description:
        "Modify AI diagnostics and development settings.",
      allowed: false,
    },

    {
      label: "Lot size and risk limits",
      description:
        "Modify financial trading controls.",
      allowed: false,
    },

    {
      label: "User management",
      description:
        "Manage platform users and permissions.",
      allowed: false,
    },
  ],

  DEVELOPER: [
    {
      label: "Dashboard monitoring",
      description:
        "View every useful trading and platform monitoring module.",
      allowed: true,
    },

    {
      label: "Raw API responses",
      description:
        "View backend payloads, indicators and diagnostic values.",
      allowed: true,
    },

    {
      label: "Developer configuration",
      description:
        "Modify permitted AI, backend and development settings.",
      allowed: true,
    },

    {
      label: "Service control",
      description:
        "Access service restart, trading enable/disable and emergency controls when protected backend APIs are added.",
      allowed: true,
    },

    {
      label: "Lot size and risk limits",
      description:
        "Modify financial trading limits.",
      allowed: false,
    },

    {
      label: "User management",
      description:
        "Manage platform users and roles.",
      allowed: false,
    },
  ],

  ADMIN: [
    {
      label: "Dashboard monitoring",
      description:
        "View useful trading, account, signal and performance information.",
      allowed: true,
    },

    {
      label: "Account and broker settings",
      description:
        "Modify protected account and broker configuration.",
      allowed: true,
    },

    {
      label: "Lot size and risk limits",
      description:
        "Modify protected financial trading controls.",
      allowed: true,
    },

    {
      label: "User management",
      description:
        "Manage users and role assignments.",
      allowed: true,
    },

    {
      label: "Raw API responses",
      description:
        "View unprocessed technical backend payloads.",
      allowed: false,
    },

    {
      label: "AI diagnostic configuration",
      description:
        "Modify developer-only AI diagnostic controls.",
      allowed: false,
    },

    {
      label: "Service restart and emergency stop",
      description:
        "Access developer-only system execution controls.",
      allowed: false,
    },
  ],
};