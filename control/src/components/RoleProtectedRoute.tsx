// control/src/components/RoleProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/auth/AuthProvider"

type Props = { allowedRoles: string[] }

export default function RoleProtectedRoute({ allowedRoles }: Props) {
  const { user } = useAuth()
  const location = useLocation()

  // No autenticado → login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Normaliza role a minúsculas
  const role = (user.role || "").toLowerCase()
  const ok = allowedRoles.map(r => r.toLowerCase()).includes(role)

  // Rol no permitido → unauthorized
  if (!ok) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location, needed: allowedRoles }}
      />
    )
  }

  // OK → renderiza las rutas hijas
  return <Outlet />
}
