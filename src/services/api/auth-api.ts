import axios from "axios";

import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RefreshResponse,
} from "@/types/auth";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;


if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not configured.",
  );
}


const authClient =
  axios.create({
    baseURL: API_BASE_URL,

    timeout: 15_000,

    headers: {
      "Content-Type": "application/json",
    },
  });


export async function loginUser(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response =
    await authClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );

  return response.data;
}


export async function refreshUserSession(
  refreshToken: string,
): Promise<RefreshResponse> {
  const response =
    await authClient.post<RefreshResponse>(
      "/auth/refresh",
      {
        refresh_token:
          refreshToken,
      },
    );

  return response.data;
}


export async function getAuthenticatedUser(
  accessToken: string,
): Promise<MeResponse> {
  const response =
    await authClient.get<MeResponse>(
      "/auth/me",
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  return response.data;
}


export async function logoutUser(
  refreshToken: string,
): Promise<LogoutResponse> {
  const response =
    await authClient.post<LogoutResponse>(
      "/auth/logout",
      {
        refresh_token:
          refreshToken,
      },
    );

  return response.data;
}