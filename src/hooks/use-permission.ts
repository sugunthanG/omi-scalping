"use client";

import {
  hasPermission,
  type Permission,
} from "@/constants/permissions";

import {
  useAuth,
} from "@/context/auth-context";


export function usePermission(
  permission: Permission,
): boolean {
  const {
    role,
  } = useAuth();

  return hasPermission(
    role,
    permission,
  );
}