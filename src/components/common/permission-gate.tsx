"use client";

import type {
  ReactNode,
} from "react";

import type {
  Permission,
} from "@/constants/permissions";

import {
  usePermission,
} from "@/hooks/use-permission";


interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}


export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const allowed =
    usePermission(
      permission,
    );

  if (!allowed) {
    return fallback;
  }

  return children;
}