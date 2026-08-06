import axios from "axios";

import type { ApiErrorPayload } from "@/types/api";

export class OmiApiError extends Error {
  public readonly statusCode?: number;
  public readonly payload?: ApiErrorPayload;

  constructor(
    message: string,
    statusCode?: number,
    payload?: ApiErrorPayload,
  ) {
    super(message);

    this.name = "OmiApiError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

export function normalizeApiError(error: unknown): OmiApiError {
  if (error instanceof OmiApiError) {
    return error;
  }

  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data;

    const message =
      payload?.detail ??
      payload?.message ??
      error.message ??
      "Unable to communicate with OMI backend.";

    return new OmiApiError(
      message,
      error.response?.status,
      payload,
    );
  }

  if (error instanceof Error) {
    return new OmiApiError(error.message);
  }

  return new OmiApiError(
    "An unknown frontend API error occurred.",
  );
}