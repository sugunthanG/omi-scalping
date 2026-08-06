"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth-token-storage";

import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  refreshUserSession,
} from "@/services/api/auth-api";

import type {
  AuthenticatedUser,
  AuthRole,
  LoginRequest,
} from "@/types/auth";


interface AuthContextValue {
  user: AuthenticatedUser | null;

  role: AuthRole;

  accessToken: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    credentials: LoginRequest,
  ) => Promise<void>;

  logout: (
    reason?: "manual" | "idle",
  ) => Promise<void>;

  refreshSession:
    () => Promise<boolean>;

  reloadUser:
    () => Promise<boolean>;
}


const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );


const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/founder-recovery",
  "/temporary-password",
];


const IDLE_TIMEOUT_MS =
  15 * 60 * 1000;

const ACCESS_REFRESH_INTERVAL_MS =
  12 * 60 * 1000;

const IDLE_CHECK_INTERVAL_MS =
  30 * 1000;


function isPublicPath(
  pathname: string,
): boolean {
  return PUBLIC_PATHS.some(
    (publicPath) =>
      pathname === publicPath
      || pathname.startsWith(
        `${publicPath}/`,
      ),
  );
}


export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    user,
    setUser,
  ] = useState<AuthenticatedUser | null>(
    null,
  );

  const [
    accessToken,
    setAccessTokenState,
  ] = useState<string | null>(
    null,
  );

  /*
   * This loading state is only for the first application
   * authentication check. It must not run on every route change.
   */
  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const lastActivityRef =
    useRef<number>(
      Date.now(),
    );

  const refreshPromiseRef =
    useRef<Promise<boolean> | null>(
      null,
    );

  const mountedRef =
    useRef(true);


  const storeAccessToken =
    useCallback(
      (
        token: string | null,
      ) => {
        setAccessToken(
          token,
        );

        setAccessTokenState(
          token,
        );
      },
      [],
    );


  const clearSession =
    useCallback(
      () => {
        clearAuthTokens();

        setAccessTokenState(
          null,
        );

        setUser(
          null,
        );
      },
      [],
    );


  const reloadUser =
    useCallback(
      async (): Promise<boolean> => {
        const token =
          getAccessToken();

        if (!token) {
          return false;
        }

        try {
          const response =
            await getAuthenticatedUser(
              token,
            );

          if (
            mountedRef.current
          ) {
            setUser(
              response.user,
            );
          }

          return true;
        } catch {
          return false;
        }
      },
      [],
    );


  const refreshSession =
    useCallback(
      async (): Promise<boolean> => {
        /*
         * Prevent duplicate refresh requests.
         */
        if (
          refreshPromiseRef.current
        ) {
          return refreshPromiseRef.current;
        }

        const storedRefreshToken =
          getRefreshToken();

        if (!storedRefreshToken) {
          clearSession();

          return false;
        }

        const refreshPromise =
          (async () => {
            try {
              const refreshed =
                await refreshUserSession(
                  storedRefreshToken,
                );

              storeAccessToken(
                refreshed.access_token,
              );

              setRefreshToken(
                refreshed.refresh_token,
              );

              const meResponse =
                await getAuthenticatedUser(
                  refreshed.access_token,
                );

              if (
                mountedRef.current
              ) {
                setUser(
                  meResponse.user,
                );
              }

              return true;
            } catch {
              clearSession();

              return false;
            } finally {
              refreshPromiseRef.current =
                null;
            }
          })();

        refreshPromiseRef.current =
          refreshPromise;

        return refreshPromise;
      },
      [
        clearSession,
        storeAccessToken,
      ],
    );


  const login =
    useCallback(
      async (
        credentials: LoginRequest,
      ): Promise<void> => {
        const response =
          await loginUser(
            credentials,
          );

        storeAccessToken(
          response.access_token,
        );

        setRefreshToken(
          response.refresh_token,
        );

        setUser(
          response.user,
        );

        lastActivityRef.current =
          Date.now();

        setIsLoading(
          false,
        );
      },
      [
        storeAccessToken,
      ],
    );


  const logout =
    useCallback(
      async (
        reason:
          | "manual"
          | "idle" = "manual",
      ): Promise<void> => {
        const storedRefreshToken =
          getRefreshToken();

        try {
          if (storedRefreshToken) {
            await logoutUser(
              storedRefreshToken,
            );
          }
        } catch {
          /*
           * Always clear the browser session even if the
           * backend is temporarily unavailable.
           */
        } finally {
          clearSession();

          setIsLoading(
            false,
          );

          router.replace(
            reason === "idle"
              ? "/login?reason=idle"
              : "/login",
          );
        }
      },
      [
        clearSession,
        router,
      ],
    );


  /*
   * Restore authentication ONE TIME when AuthProvider mounts.
   *
   * Important:
   * pathname is intentionally not included in this dependency list.
   */
  useEffect(() => {
    mountedRef.current =
      true;

    async function restoreAuthentication() {
      setIsLoading(
        true,
      );

      try {
        const currentAccessToken =
          getAccessToken();

        /*
         * Access tokens are stored in memory, so this mainly
         * handles the current mounted application session.
         */
        if (currentAccessToken) {
          try {
            const meResponse =
              await getAuthenticatedUser(
                currentAccessToken,
              );

            if (
              mountedRef.current
            ) {
              storeAccessToken(
                currentAccessToken,
              );

              setUser(
                meResponse.user,
              );

              lastActivityRef.current =
                Date.now();
            }

            return;
          } catch {
            /*
             * Access token expired or invalid.
             * Continue using the refresh token.
             */
          }
        }

        const restored =
          await refreshSession();

        if (
          restored
          && mountedRef.current
        ) {
          lastActivityRef.current =
            Date.now();
        }
      } finally {
        if (
          mountedRef.current
        ) {
          setIsLoading(
            false,
          );
        }
      }
    }

    void restoreAuthentication();

    return () => {
      mountedRef.current =
        false;
    };
  }, [
    refreshSession,
    storeAccessToken,
  ]);


  /*
   * Route protection runs separately.
   *
   * Changing pathname no longer sets isLoading to true and
   * does not contact the authentication API again.
   */
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const publicPage =
      isPublicPath(
        pathname,
      );

    if (
      !user
      && !publicPage
    ) {
      router.replace(
        "/login",
      );

      return;
    }

    if (
      user
      && publicPage
    ) {
      router.replace(
        "/",
      );
    }
  }, [
    isLoading,
    pathname,
    router,
    user,
  ]);


  /*
   * Track genuine activity for the inactivity timeout.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    let lastRecordedActivity =
      0;

    const markActivity = () => {
      const now =
        Date.now();

      if (
        now
        - lastRecordedActivity
        < 1_000
      ) {
        return;
      }

      lastRecordedActivity =
        now;

      lastActivityRef.current =
        now;
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ] as const;

    for (
      const eventName
      of activityEvents
    ) {
      window.addEventListener(
        eventName,
        markActivity,
        {
          passive: true,
        },
      );
    }

    return () => {
      for (
        const eventName
        of activityEvents
      ) {
        window.removeEventListener(
          eventName,
          markActivity,
        );
      }
    };
  }, [
    user,
  ]);


  /*
   * Log out only after 15 minutes without activity.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId =
      window.setInterval(
        () => {
          const idleDuration =
            Date.now()
            - lastActivityRef.current;

          if (
            idleDuration
            >= IDLE_TIMEOUT_MS
          ) {
            void logout(
              "idle",
            );
          }
        },
        IDLE_CHECK_INTERVAL_MS,
      );

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [
    logout,
    user,
  ]);


  /*
   * Refresh silently while the user remains active.
   *
   * This does not display the global session-loading screen.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId =
      window.setInterval(
        () => {
          const idleDuration =
            Date.now()
            - lastActivityRef.current;

          if (
            idleDuration
            < IDLE_TIMEOUT_MS
          ) {
            void refreshSession();
          }
        },
        ACCESS_REFRESH_INTERVAL_MS,
      );

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [
    refreshSession,
    user,
  ]);


  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,

        role:
          user?.role
          ?? "USER",

        accessToken,

        isAuthenticated:
          user !== null,

        isLoading,

        login,

        logout,

        refreshSession,

        reloadUser,
      }),
      [
        user,
        accessToken,
        isLoading,
        login,
        logout,
        refreshSession,
        reloadUser,
      ],
    );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth():
  AuthContextValue {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}