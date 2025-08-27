export function hasRole(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false
  const role = userRole.toLowerCase()
  return allowedRoles.map(r => r.toLowerCase()).includes(role)
}
