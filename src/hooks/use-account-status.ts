"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  queryKeys,
} from "@/constants/query-keys";

import {
  getAccountStatus,
} from "@/services/api/account-api";


export function useAccountStatus() {
  return useQuery({
    queryKey:
      queryKeys.account,

    queryFn:
      getAccountStatus,

    refetchInterval: 5_000,

    staleTime: 3_000,

    retry: 2,

    refetchOnWindowFocus: true,
  });
}