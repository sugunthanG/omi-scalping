export type AppearanceMode =
  | "DARK"
  | "SYSTEM";

export type DefaultLandingPage =
  | "/"
  | "/live-trading"
  | "/positions"
  | "/performance"
  | "/risk";

export interface NotificationPreferences {
  signalEvents: boolean;
  tradeEvents: boolean;
  riskWarnings: boolean;
  systemEvents: boolean;
  browserNotifications: boolean;
}

export interface UserPreferences {
  appearance: AppearanceMode;

  compactMode: boolean;

  reducedMotion: boolean;

  defaultLandingPage: DefaultLandingPage;

  notifications: NotificationPreferences;
}

export const defaultUserPreferences: UserPreferences = {
  appearance: "DARK",

  compactMode: false,

  reducedMotion: false,

  defaultLandingPage: "/",

  notifications: {
    signalEvents: true,
    tradeEvents: true,
    riskWarnings: true,
    systemEvents: true,
    browserNotifications: false,
  },
};