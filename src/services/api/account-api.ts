import {
  apiClient,
} from "@/services/api/api-client";

import type {
  AccountStatusResponse,
} from "@/types/api";


export async function getAccountStatus(): Promise<AccountStatusResponse> {
  const response =
    await apiClient.get<AccountStatusResponse>(
      "/account",
    );

  const data =
    response.data;

  if (
    data.status !== "online"
  ) {
    throw new Error(
      data.message
      ?? "MT5 account information is unavailable.",
    );
  }

  return data;
}