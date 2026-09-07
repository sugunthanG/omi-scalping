import axios from "axios";

import {
  API_BASE_URL,
} from "@/lib/api-config";

import {
  getAccessToken,
} from "@/lib/auth-token-storage";


export type OmiSessionQuality =
  | "GOOD"
  | "STRONG"
  | "ELITE";


export interface ScientistSessionPolicyUpdatePayload {
  password: string;
  reason?: string | null;
  policy: Record<string, unknown>;
}


export interface ScientistSessionPolicyResetPayload {
  password: string;
  verification_number: string;
  reason?: string | null;
}


function getAuthorizationHeaders() {
  const token =
    getAccessToken();

  if (!token) {
    throw new Error(
      "Scientist access token is unavailable.",
    );
  }

  return {
    Authorization:
      `Bearer ${token}`,

    Accept:
      "application/json",

    "Content-Type":
      "application/json",
  };
}


export async function fetchScientistSessionPolicy() {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/session-policy`,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function fetchScientistSessionPolicyStatus() {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/session-policy/status`,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function fetchScientistNeuralSessionAdvisor() {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/session-policy/neural-advisor`,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function fetchScientistSessionPolicyAudit(
  limit = 100,
) {
  const response =
    await axios.get(
      `${API_BASE_URL}/scientist/session-policy/audit`,
      {
        params: {
          limit,
        },

        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function updateScientistSessionPolicy(
  payload: ScientistSessionPolicyUpdatePayload,
) {
  const response =
    await axios.post(
      `${API_BASE_URL}/scientist/session-policy/update`,
      payload,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}


export async function resetScientistSessionPolicy(
  payload: ScientistSessionPolicyResetPayload,
) {
  const response =
    await axios.post(
      `${API_BASE_URL}/scientist/session-policy/reset`,
      payload,
      {
        headers:
          getAuthorizationHeaders(),

        timeout:
          15_000,
      },
    );

  return response.data.data;
}
