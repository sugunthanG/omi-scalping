"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  queryKeys,
} from "@/constants/query-keys";

import {
  getClosedTradeHistory,
} from "@/services/api/history-api";


interface UseClosedTradeHistoryOptions {
  days?: number;
  limit?: number;
}


export function useClosedTradeHistory({
  days = 30,
  limit = 200,
}: UseClosedTradeHistoryOptions = {}) {
  return useQuery({
    queryKey:
      queryKeys.closedTradeHistory(
        days,
        limit,
      ),

    queryFn: () =>
      getClosedTradeHistory({
        days,
        limit,
      }),

    staleTime: 30_000,

    refetchInterval: 60_000,

    retry: 2,

    refetchOnWindowFocus: true,
  });
}