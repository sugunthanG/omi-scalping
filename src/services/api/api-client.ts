import axios from "axios";

import {
  normalizeApiError,
  type OmiApiError,
} from "@/services/api/api-error";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_OMI_API_URL?.trim();

if (!apiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_OMI_API_URL is not configured.",
  );
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  /*
   * JWT authorization will be attached here after the backend
   * authentication endpoints are implemented and verified.
   *
   * Do not place broker credentials or BRIDGE_SECRET in browser code.
   */

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalizedError: OmiApiError =
      normalizeApiError(error);

    return Promise.reject(normalizedError);
  },
);