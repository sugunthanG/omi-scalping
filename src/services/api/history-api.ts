import {
  apiClient,
} from "@/services/api/api-client";

import type {
  ClosedTradeHistoryResponse,
} from "@/types/api";


interface GetClosedTradeHistoryParams {
  days?: number;
  limit?: number;
}


export async function getClosedTradeHistory({
  days = 30,
  limit = 200,
}: GetClosedTradeHistoryParams = {}): Promise<ClosedTradeHistoryResponse> {
  const response =
    await apiClient.get<ClosedTradeHistoryResponse>(
      "/history/closed",
      {
        params: {
          days,
          limit,
        },
      },
    );

  const data =
    response.data;

  if (
    data.status !== "success"
    || !Array.isArray(data.data)
    || !data.summary
  ) {
    throw new Error(
      data.message
      ?? "Closed-trade history is unavailable.",
    );
  }

  return data;
}