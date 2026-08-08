"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  queryKeys,
} from "@/constants/query-keys";

import {
  getMarketData,
} from "@/services/api/market-data-api";


interface UseMarketDataOptions {
  symbol?: string;

  timeframe?: string;

  refetchInterval?: number;
}


export function useMarketData({
  symbol = "XAUUSDm",
  timeframe = "1m",
  refetchInterval = 10_000,
}: UseMarketDataOptions = {}) {

  return useQuery({

    queryKey:
      queryKeys.marketData(
        symbol,
        timeframe,
      ),

    queryFn: () =>
      getMarketData({
        symbol,
        timeframe,
      }),

    staleTime: 5_000,

    refetchInterval,

    retry: 2,

    refetchOnWindowFocus: true,

  });
}