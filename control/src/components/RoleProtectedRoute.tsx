// control/src/components/RoleProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom"
import Layout from "@/components/Layout"
import { getCurrentUserRole } from "@/utils/token"

type RoleProtectedRouteProps = {
  allowedRoles: string[]
}

/**
 * Guard de rutas por rol usando Outlet.
 * Uso en router:
 *   <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
 *     <Route path="users" element={<Users />} />
 *   </Route>
 */
export default function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const location = useLocation()
  const role = getCurrentUserRole()

  // Sin sesión → login
  if (!role) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Rol no permitido → unauthorized
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Autorizado → render layout + children (Outlet)
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
