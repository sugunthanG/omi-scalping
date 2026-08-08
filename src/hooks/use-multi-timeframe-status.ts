"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getMultiTimeframeStatus,
} from "../services/api/market-status-api";


interface UseMultiTimeframeStatusOptions {
  symbol?: string;
  refetchInterval?: number;
}


export function useMultiTimeframeStatus({
  symbol = "XAUUSDm",
  refetchInterval = 30_000,
}: UseMultiTimeframeStatusOptions = {}) {

  return useQuery({
    queryKey: [
      "market-status",
      "multi-timeframe",
      symbol,
    ],

    queryFn: () =>
      getMultiTimeframeStatus({
        symbol,
      }),

    staleTime: 15_000,

    refetchInterval,

    retry: 2,

    refetchOnWindowFocus: true,
  });
}