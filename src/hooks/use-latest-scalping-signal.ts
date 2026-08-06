"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";

import {
  getLatestScalpingSignal,
} from "@/services/api/scalping-status-api";

export function useLatestScalpingSignal() {
  return useQuery({
    queryKey:
      queryKeys.latestScalpingSignal,

    queryFn:
      getLatestScalpingSignal,

    refetchInterval: 5_000,

    staleTime: 3_000,

    retry: 2,

    refetchOnWindowFocus: true,
  });
}