export type AuthRole =
  | "USER"
  | "DEVELOPER"
  | "ADMIN";


export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: AuthRole;
  designation: string | null;
  active: boolean;
}


export interface LoginRequest {
  username: string;
  password: string;
}


export interface LoginResponse {
  status: string;

  access_token: string;
  refresh_token: string;

  token_type: string;

  access_token_expires_minutes: number;

  user: AuthenticatedUser;
}


export interface RefreshResponse {
  status: string;

  access_token: string;
  refresh_token: string;

  token_type: string;

  access_token_expires_minutes: number;
}


export interface MeResponse {
  status: string;

  user: AuthenticatedUser;
}


export interface LogoutResponse {
  status: string;
  message: string;
}