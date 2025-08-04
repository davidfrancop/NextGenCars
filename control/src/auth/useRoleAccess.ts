//control/src/auth/useRoleAccess.ts

import { useAuth } from "./AuthProvider"

export function useRoleAccess(allowedRoles: string[]) {
  const { user } = useAuth()
  return allowedRoles.includes(user?.role || "")
}
