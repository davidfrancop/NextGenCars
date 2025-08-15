// control/src/components/RoleProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom"
import Layout from "@/components/Layout"
import { useAuth } from "@/auth/AuthProvider"

type RoleProtectedRouteProps = {
  allowedRoles: string[]
}

export default function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-center text-white">Cargando...</div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
