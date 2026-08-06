"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getBackendRootStatus } from "@/services/api/health-api";

export function useBackendStatus() {
  return useQuery({
    queryKey: queryKeys.backendHealth,
    queryFn: getBackendRootStatus,
    refetchInterval: 10_000,
    staleTime: 5_000,
    retry: 2,
  });
}