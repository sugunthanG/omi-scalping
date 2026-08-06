import type {
  AuthRole,
} from "@/types/auth";


const roleDisplayNames: Record<
  AuthRole,
  string
> = {
  USER: "USER",

  DEVELOPER: "SCIENTIST",

  ADMIN: "ADMIN",
};


export function getRoleDisplayName(
  role: AuthRole,
): string {
  return roleDisplayNames[
    role
  ];
}