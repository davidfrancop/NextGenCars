// control/src/components/RoleProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom"
import Layout from "@/components/Layout"
import { useAuth } from "@/auth/AuthProvider"
import { rolesForPath, type Role } from "@/config/menuItems"

export default function RoleProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, user, loading } = useAuth()

  const allowedRoles = rolesForPath(location.pathname)

  if (loading) {
    return <div className="p-6 text-center text-white">Loading...</div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // ✅ Normalize role with safe fallback
  const currentRole = (String(user.role || "").toLowerCase() as Role | "")

  // 🔎 PLUS: warn if the path isn't mapped (deny-by-default)
  if (allowedRoles.length === 0) {
    console.warn(
      `[RBAC] Unmapped path in menuItems (denied by default): ${location.pathname}`
    )
  }

  // 🚫 No permission → pass required roles and from (and log details)
  if (!allowedRoles.includes(currentRole as Role)) {
    console.warn(
      `[RBAC] Access denied. Current role: "${currentRole || "N/A"}". ` +
      `Required roles: [${allowedRoles.join(", ")}]. Path: ${location.pathname}`
    )
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ needed: allowedRoles, from: location }}
      />
    )
  }

  // ✅ Authorized
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
