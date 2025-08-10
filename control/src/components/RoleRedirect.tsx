// src/components/RoleRedirect.tsx
import { Navigate } from "react-router-dom"
import { useAuth } from "@/auth/AuthProvider"

export default function RoleRedirect() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  switch (user.role) {
    case "admin":
      return <Navigate to="/dashboard/admin" replace />
    case "frontdesk":
      return <Navigate to="/dashboard/frontdesk" replace />
    case "mechanic":
      return <Navigate to="/dashboard/mechanic" replace />
    default:
      return <Navigate to="/unauthorized" replace />
  }
}
