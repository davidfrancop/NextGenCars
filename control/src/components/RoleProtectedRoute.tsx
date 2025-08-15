// control/src/components/RoleProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom"
import Layout from "@/components/Layout"
import { useAuth } from "@/auth/AuthProvider"
import { rolesForPath, Role } from "@/config/menuItems"

export default function RoleProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, user, loading } = useAuth()

  const allowedRoles = rolesForPath(location.pathname)

  if (loading) {
    return <div className="p-6 text-center text-white">Cargando...</div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!allowedRoles.includes(user.role.toLowerCase() as Role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
