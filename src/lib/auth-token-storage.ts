const REFRESH_TOKEN_KEY =
  "omi-refresh-token";


let accessToken:
  | string
  | null = null;


export function getAccessToken():
  | string
  | null {
  return accessToken;
}


export function setAccessToken(
  token:
    | string
    | null,
): void {
  accessToken = token;
}


export function getRefreshToken():
  | string
  | null {
  if (
    typeof window
    === "undefined"
  ) {
    return null;
  }

  return window.sessionStorage.getItem(
    REFRESH_TOKEN_KEY,
  );
}


export function setRefreshToken(
  token: string,
): void {
  if (
    typeof window
    === "undefined"
  ) {
    return;
  }

  window.sessionStorage.setItem(
    REFRESH_TOKEN_KEY,
    token,
  );
}


export function clearAuthTokens():
  void {
  accessToken = null;

  if (
    typeof window
    === "undefined"
  ) {
    return;
  }

  window.sessionStorage.removeItem(
    REFRESH_TOKEN_KEY,
  );
}