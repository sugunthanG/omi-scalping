"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  queryKeys,
} from "@/constants/query-keys";

import {
  getOpenPositions,
} from "@/services/api/positions-api";


export function useOpenPositions() {
  return useQuery({
    queryKey:
      queryKeys.positions,

    queryFn:
      getOpenPositions,

    refetchInterval: 3_000,

    staleTime: 2_000,

    retry: 2,

    refetchOnWindowFocus: true,
  });
}