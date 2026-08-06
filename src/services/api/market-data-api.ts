import {
  apiClient,
} from "@/services/api/api-client";

import type {
  MarketCandle,
  MarketDataResponse,
} from "@/types/api";


interface GetMarketDataOptions {
  symbol?: string;
  timeframe?: string;
}


export async function getMarketData({
  symbol = "XAUUSDm",
  timeframe = "1m",
}: GetMarketDataOptions = {}): Promise<MarketCandle[]> {
  const response =
    await apiClient.get<MarketDataResponse>(
      "/market-data",
      {
        params: {
          symbol,
          timeframe,
        },
      },
    );

  const data =
    response.data;

  if (
    data.status !== "success"
    || !Array.isArray(data.data)
  ) {
    throw new Error(
      data.message
      ?? `Unable to load ${timeframe} market data.`,
    );
  }

  return data.data;
}