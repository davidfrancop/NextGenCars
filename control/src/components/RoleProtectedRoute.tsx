// control/src/components/RoleProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom"
import Layout from "@/components/Layout"
import { useAuth } from "@/auth/AuthProvider"
import { menuItems, type Role } from "@/config/menuItems"

/**
 * Normalizes a pathname to its base route for RBAC matching.
 * e.g. "/users/123/edit" -> "/users"
 */
function basePath(pathname: string): string {
  // keep only the first segment ("/" + first)
  const [ , first ] = pathname.split("/")
  return first ? `/${first}` : "/"
}

/**
 * Finds allowed roles for a given pathname using menuItems.
 * If not found, returns [] (deny-by-default).
 */
function allowedRolesFor(pathname: string): Role[] {
  const base = basePath(pathname)
  const item = menuItems.find(i => i.path === base)
  return (item?.roles as Role[]) ?? []
}

export default function RoleProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-center text-white">Loading...</div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Normalize role with safe fallback
  const currentRole = (String(user.role || "").toLowerCase() as Role | "")
  const allowedRoles = allowedRolesFor(location.pathname)

  // Warn if the path isn't mapped (deny-by-default)
  if (allowedRoles.length === 0) {
    console.warn(`[RBAC] Unmapped path (denied by default): ${location.pathname}`)
  }

  // No permission → redirect to /unauthorized
  if (!allowedRoles.includes(currentRole as Role)) {
    console.warn(
      `[RBAC] Access denied. Current role: "${currentRole || "N/A"}". ` +
      `Required: [${allowedRoles.join(", ")}]. Path: ${location.pathname}`
    )
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ needed: allowedRoles, from: location }}
      />
    )
  }

  // Authorized
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}