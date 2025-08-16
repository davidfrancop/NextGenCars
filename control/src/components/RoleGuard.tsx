// src/components/RoleGuard.tsx

import type { ReactNode } from "react"
import { hasRole, isAuthenticated } from "@/utils/token"
import type { Role } from "@/config/menuItems"

type RoleGuardProps = {
  /** Roles permitidos para ver el contenido. Si se omite, sólo exige estar autenticado. */
  allowed?: Role[]
  /** Qué renderizar si NO tiene permiso (por defecto: null) */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * UI Guard: muestra `children` si el usuario cumple los roles (o está autenticado si no se especifican).
 * No navega ni redirige; sólo controla visibilidad en la interfaz.
 */
export default function RoleGuard({ allowed = [], fallback = null, children }: RoleGuardProps) {
  const can = allowed.length === 0 ? isAuthenticated() : hasRole(allowed)
  return can ? <>{children}</> : <>{fallback}</>
}
