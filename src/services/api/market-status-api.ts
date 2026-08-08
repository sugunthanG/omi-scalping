import {
  apiClient,
} from "@/services/api/api-client";


export type MarketBias =
  | "BULLISH"
  | "BEARISH"
  | "NEUTRAL";


export type MarketStructure =
  | "BULLISH"
  | "BEARISH"
  | "MIXED";


export type MarketAlignment =
  | "BULLISH_ALIGNED"
  | "BEARISH_ALIGNED"
  | "MIXED";


export interface TimeframeContext {
  timeframe: string;

  available: boolean;

  bias: MarketBias;

  strength: number;

  structure: MarketStructure;

  close: number | null;

  ema20: number | null;

  ema50: number | null;

  swing_high: number | null;

  swing_low: number | null;

  previous_swing_high: number | null;

  previous_swing_low: number | null;

  range_value: number | null;

  body: number | null;

  upper_wick: number | null;

  lower_wick: number | null;

  pressure_delta: number | null;

  higher_high: boolean;

  higher_low: boolean;

  lower_high: boolean;

  lower_low: boolean;

  latest_candle_time: string | null;
}


export interface MultiTimeframeStatus {
  symbol: string;

  generated_at: string;

  higher_timeframe_bias: MarketBias;

  alignment: MarketAlignment;

  confidence: number;

  long_preference: number;

  short_preference: number;

  timeframes: {
    "1m": TimeframeContext;
    "5m": TimeframeContext;
    "15m": TimeframeContext;
    "1h": TimeframeContext;
    "4h": TimeframeContext;
  };
}


interface MultiTimeframeApiResponse {
  status: string;

  data?: MultiTimeframeStatus;

  message?: string;
}


interface GetMultiTimeframeStatusOptions {
  symbol?: string;
}


export async function getMultiTimeframeStatus({
  symbol = "XAUUSDm",
}: GetMultiTimeframeStatusOptions = {}): Promise<MultiTimeframeStatus> {

  const response =
    await apiClient.get<MultiTimeframeApiResponse>(
      "/market-status/multi-timeframe",
      {
        params: {
          symbol,
        },
      },
    );

  const data =
    response.data;

  if (
    data.status !== "success"
    || !data.data
  ) {
    throw new Error(
      data.message
      ?? "Unable to load multi-timeframe market status.",
    );
  }

  return data.data;
}