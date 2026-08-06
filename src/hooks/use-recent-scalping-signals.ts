"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  queryKeys,
} from "@/constants/query-keys";

import {
  getRecentScalpingSignals,
} from "@/services/api/scalping-status-api";


interface UseRecentScalpingSignalsOptions {
  limit?: number;
}


export function useRecentScalpingSignals({
  limit = 100,
}: UseRecentScalpingSignalsOptions = {}) {
  return useQuery({
    queryKey:
      queryKeys.recentScalpingSignals(
        limit,
      ),

    queryFn: () =>
      getRecentScalpingSignals(
        limit,
      ),

    staleTime: 10_000,

    refetchInterval: 15_000,

    retry: 2,

    refetchOnWindowFocus: true,
  });
}