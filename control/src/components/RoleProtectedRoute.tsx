// control/src/components/RoleProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom"
import Layout from "@/components/Layout"
import { useAuth } from "@/auth/AuthProvider"
import { menuItems, type Role } from "@/config/menuItems"

/** normaliza quitando query/hash y colapsando // */
function normalizePath(pathname: string): string {
  try {
    const p = pathname.split("?")[0].split("#")[0]
    return p.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/"
  } catch {
    return "/"
  }
}

/** RBAC: busca roles permitidos para un pathname usando menuItems */
function allowedRolesFor(pathname: string): Role[] {
  const path = normalizePath(pathname)

  // 1) match explícito (soporta dinámicas)
  const byMatch = menuItems.find(i =>
    typeof i.match === "function" ? i.match(path)
    : i.match instanceof RegExp ? i.match.test(path)
    : false
  )
  if (byMatch) return byMatch.roles as Role[]

  // 2) coincidencia exacta
  const exact = menuItems.find(i => i.path === path)
  if (exact) return exact.roles as Role[]

  // 3) prefijo más largo ("/users/123/edit" → "/users")
  const byPrefix = menuItems
    .filter(i => path.startsWith(i.path))
    .sort((a, b) => b.path.length - a.path.length)[0]
  return (byPrefix?.roles as Role[]) ?? []
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

  const allowedRoles = allowedRolesFor(location.pathname)
  if (allowedRoles.length === 0) {
    console.warn(`[RBAC] Unmapped path (denied by default): ${location.pathname}`)
  }

  const currentRole = (String(user.role || "").toLowerCase() as Role | "")
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

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}