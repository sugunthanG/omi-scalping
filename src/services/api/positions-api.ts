import {
  apiClient,
} from "@/services/api/api-client";

import type {
  PositionMonitorResponse,
} from "@/types/api";


export async function getOpenPositions(): Promise<PositionMonitorResponse> {
  const response =
    await apiClient.get<PositionMonitorResponse>(
      "/monitor",
    );

  const data =
    response.data;

  if (
    typeof data.open_trades !== "number"
    || !Array.isArray(
      data.positions,
    )
  ) {
    throw new Error(
      "Invalid open-position response from OMI backend.",
    );
  }

  return data;
}