import axios from "axios";

import {
  API_BASE_URL,
} from "@/lib/api-config";

import {
  getAccessToken,
} from "@/lib/auth-token-storage";


export interface ScientistOverview {
  mt5_online: boolean;
  auto_trade: boolean;
  execution_cooldown: boolean;
  today_trade_count: number;
  today_profit: number;
  consecutive_losses: number;

  max_trades_per_day: number;
  max_daily_loss: number;
  max_consecutive_losses: number;

  cooldown_seconds: number;
  default_cooldown: number;
  signal_ttl_seconds: number;

  last_trade_time: string | null;
  last_signal: string | null;
  last_signal_candle: string | null;
  last_processed_candle: string | null;
  current_day: string | null;
}


export interface ScientistDiagnostics {
  runtime_settings: Record<string, unknown>;

  risk_runtime: {
    auto_trade: boolean;
    max_trades_per_day: number;
    today_trade_count: number;
    max_daily_loss: number;
    today_profit: number;
    max_consecutive_losses: number;
    consecutive_losses: number;
    default_cooldown: number;
    cooldown_seconds: number;
    signal_ttl_seconds: number;
    execution_cooldown: boolean;
    last_trade_time: string | null;
    last_signal: string | null;
    last_signal_candle: string | null;
  };

  mt5: {
    online: boolean;
  };
}


export interface ScientistServiceState {
  status: string;
}


export interface ScientistServices {
  fastapi: ScientistServiceState;
  mt5: ScientistServiceState;
  scalping_scheduler: ScientistServiceState;
  group_monitor: ScientistServiceState;
  trade_result_monitor: ScientistServiceState;
  trailing_stop_monitor: ScientistServiceState;
  heartbeat: ScientistServiceState;
}


export interface ScientistLog {
  timestamp: string;
  level: string;
  source: string;
  message: string;
}


function getAuthorizationHeaders() {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "Scientist access token is unavailable.",
    );
  }

  return {
    Authorization:
      `Bearer ${token}`,

    Accept:
      "application/json",
  };
}


export async function fetchScientistOverview():
  Promise<ScientistOverview> {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/overview`,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function fetchScientistDiagnostics():
  Promise<ScientistDiagnostics> {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/diagnostics`,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function fetchScientistServices():
  Promise<ScientistServices> {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/services`,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function fetchScientistLogs(
  limit = 100,
): Promise<ScientistLog[]> {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/logs`,
      {
        params: {
          limit,
        },

        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function clearScientistLogs():
  Promise<void> {
  await axios.delete(
    `${API_BASE_URL}/scientist/logs`,
    {
      headers:
        getAuthorizationHeaders(),

      timeout:
        15_000,
    },
  );
}