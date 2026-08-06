"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  defaultUserPreferences,
} from "@/types/preferences";

import type {
  UserPreferences,
} from "@/types/preferences";


interface PreferencesContextValue {
  preferences: UserPreferences;

  isLoaded: boolean;

  updatePreferences: (
    updates: Partial<UserPreferences>,
  ) => void;

  updateNotificationPreferences: (
    updates: Partial<
      UserPreferences["notifications"]
    >,
  ) => void;

  resetPreferences: () => void;
}


const PreferencesContext =
  createContext<
    PreferencesContextValue
    | undefined
  >(undefined);


const STORAGE_KEY =
  "omi-user-preferences";


function safelyReadPreferences(): UserPreferences {
  if (
    typeof window
    === "undefined"
  ) {
    return defaultUserPreferences;
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!storedValue) {
      return defaultUserPreferences;
    }

    const parsedValue =
      JSON.parse(
        storedValue,
      ) as Partial<UserPreferences>;

    return {
      ...defaultUserPreferences,

      ...parsedValue,

      notifications: {
        ...defaultUserPreferences.notifications,

        ...parsedValue.notifications,
      },
    };
  } catch {
    return defaultUserPreferences;
  }
}


export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    preferences,
    setPreferences,
  ] = useState<UserPreferences>(
    defaultUserPreferences,
  );

  const [
    isLoaded,
    setIsLoaded,
  ] = useState(false);

  useEffect(() => {
    setPreferences(
      safelyReadPreferences(),
    );

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          preferences,
        ),
      );
    } catch {
      // Local preference persistence is optional.
    }
  }, [
    isLoaded,
    preferences,
  ]);

  useEffect(() => {
    const rootElement =
      document.documentElement;

    rootElement.dataset.compact =
      preferences.compactMode
        ? "true"
        : "false";

    rootElement.dataset.reducedMotion =
      preferences.reducedMotion
        ? "true"
        : "false";
  }, [
    preferences.compactMode,
    preferences.reducedMotion,
  ]);

  const updatePreferences =
    useCallback(
      (
        updates:
          Partial<UserPreferences>,
      ) => {
        setPreferences(
          (
            currentPreferences,
          ) => ({
            ...currentPreferences,

            ...updates,

            notifications:
              updates.notifications
                ? {
                    ...currentPreferences.notifications,

                    ...updates.notifications,
                  }
                : currentPreferences.notifications,
          }),
        );
      },
      [],
    );

  const updateNotificationPreferences =
    useCallback(
      (
        updates:
          Partial<
            UserPreferences["notifications"]
          >,
      ) => {
        setPreferences(
          (
            currentPreferences,
          ) => ({
            ...currentPreferences,

            notifications: {
              ...currentPreferences.notifications,

              ...updates,
            },
          }),
        );
      },
      [],
    );

  const resetPreferences =
    useCallback(
      () => {
        setPreferences(
          defaultUserPreferences,
        );
      },
      [],
    );

  const value =
    useMemo(
      () => ({
        preferences,

        isLoaded,

        updatePreferences,

        updateNotificationPreferences,

        resetPreferences,
      }),
      [
        preferences,
        isLoaded,
        updatePreferences,
        updateNotificationPreferences,
        resetPreferences,
      ],
    );

  return (
    <PreferencesContext.Provider
      value={value}
    >
      {children}
    </PreferencesContext.Provider>
  );
}


export function usePreferences() {
  const context =
    useContext(
      PreferencesContext,
    );

  if (!context) {
    throw new Error(
      "usePreferences must be used inside PreferencesProvider.",
    );
  }

  return context;
}