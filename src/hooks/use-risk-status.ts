"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  queryKeys,
} from "@/constants/query-keys";

import {
  getRiskStatus,
} from "@/services/api/risk-api";


export function useRiskStatus() {
  return useQuery({
    queryKey:
      queryKeys.riskStatus,

    queryFn:
      getRiskStatus,

    refetchInterval: 5_000,

    staleTime: 3_000,

    retry: 2,

    refetchOnWindowFocus: true,
  });
}