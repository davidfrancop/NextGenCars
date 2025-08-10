// control/src/components/RoleProtectedRoute.tsx

import { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/auth/AuthProvider"

type Props = {
  children: ReactNode
  allowedRoles: string[]
}

export default function RoleProtectedRoute({ children, allowedRoles }: Props) {
  const { user } = useAuth()
  const location = useLocation()

  // 🔹 No autenticado → redirige al login y recuerda a dónde iba
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 🔹 Rol no permitido → redirige a /unauthorized con info de roles requeridos
  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location, needed: allowedRoles }}
      />
    )
  }

  // 🔹 Autenticado y con rol válido → muestra la ruta
  return <>{children}</>
}

