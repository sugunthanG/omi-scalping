import axios from "axios";

import {
  getAccessToken,
} from "@/lib/auth-token-storage";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL
  ?? "http://127.0.0.1:9000";


export interface AdminTradingSettings {
  lot_size: number;

  max_trades_per_day: number;

  max_daily_loss: number;

  max_consecutive_losses: number;

  cooldown_seconds: number;

  signal_ttl_seconds: number;

  updated_at: string | null;

  updated_by: string | null;
}


interface TradingSettingsResponse {
  status: string;

  message?: string;

  data: AdminTradingSettings;
}


function getAuthorizationHeaders() {
  const accessToken =
    getAccessToken();

  if (!accessToken) {
    throw new Error(
      "Authenticated access token is unavailable.",
    );
  }

  return {
    Authorization:
      `Bearer ${accessToken}`,
  };
}


export async function fetchAdminTradingSettings():
  Promise<AdminTradingSettings> {
  const response =
    await axios.get<TradingSettingsResponse>(
      `${API_BASE_URL}/admin/trading-settings`,
      {
        headers:
          getAuthorizationHeaders(),
      },
    );

  return response.data.data;
}


export async function updateAdminTradingSettings(
  settings: AdminTradingSettings,
): Promise<AdminTradingSettings> {
  const response =
    await axios.patch<TradingSettingsResponse>(
      `${API_BASE_URL}/admin/trading-settings`,
      {
        lot_size:
          settings.lot_size,

        max_trades_per_day:
          settings.max_trades_per_day,

        max_daily_loss:
          settings.max_daily_loss,

        max_consecutive_losses:
          settings.max_consecutive_losses,

        cooldown_seconds:
          settings.cooldown_seconds,

        signal_ttl_seconds:
          settings.signal_ttl_seconds,
      },
      {
        headers:
          getAuthorizationHeaders(),
      },
    );

  return response.data.data;
}