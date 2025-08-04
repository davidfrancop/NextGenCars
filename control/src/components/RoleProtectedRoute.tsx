//control/src/components/RoleProtectedRoute.tsx

import { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/auth/AuthProvider"

type Props = {
  children: ReactNode
  allowedRoles: string[]
}

export default function RoleProtectedRoute({ children, allowedRoles }: Props) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <div className="p-10 text-red-500 text-xl">🚫 Access denied</div>
  }

  return <>{children}</>
}
