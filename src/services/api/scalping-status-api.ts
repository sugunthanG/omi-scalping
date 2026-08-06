import {
  apiClient,
} from "@/services/api/api-client";

import type {
  LatestScalpingSignalResponse,
  RecentScalpingSignalsResponse,
} from "@/types/api";


export async function getLatestScalpingSignal(): Promise<LatestScalpingSignalResponse> {
  const response =
    await apiClient.get<LatestScalpingSignalResponse>(
      "/scalping-status/latest",
    );

  return response.data;
}


export async function getRecentScalpingSignals(
  limit = 100,
): Promise<RecentScalpingSignalsResponse> {
  const response =
    await apiClient.get<RecentScalpingSignalsResponse>(
      "/scalping-status/recent",
      {
        params: {
          limit,
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
      ?? "Recent OMI signals are unavailable.",
    );
  }

  return data;
}