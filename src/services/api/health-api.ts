import { apiClient } from "@/services/api/api-client";
import type { BackendRootResponse } from "@/types/api";

export async function getBackendRootStatus(): Promise<BackendRootResponse> {
  const response =
    await apiClient.get<BackendRootResponse>("/");

  return response.data;
}