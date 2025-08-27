//control/src/auth/useRoleAccess.ts

import { useAuth } from "./AuthProvider"
import { hasRole } from "./hasRole"

export function useRoleAccess(allowedRoles: string[]) {
  const { user } = useAuth()
  return hasRole(user?.role, allowedRoles)
}
