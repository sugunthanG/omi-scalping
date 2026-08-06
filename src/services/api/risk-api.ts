import {
  apiClient,
} from "@/services/api/api-client";

import type {
  RiskStatusResponse,
} from "@/types/api";


export async function getRiskStatus(): Promise<RiskStatusResponse> {
  const response =
    await apiClient.get<RiskStatusResponse>(
      "/risk",
    );

  const data =
    response.data;

  if (
    data.status !== "success"
    || typeof data.auto_trade !== "boolean"
  ) {
    throw new Error(
      "Invalid risk response from OMI backend.",
    );
  }

  return data;
}