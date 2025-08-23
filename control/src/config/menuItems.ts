// src/config/menuItems.ts

import type { ComponentType } from "react"
import {
  Home,
  UserCog,
  Users,
  CarFront,
  Calendar,
  ClipboardList,
  CheckSquare,
  ListChecks,
  Truck,
  BarChart,
  FileSignature,
  Settings,
} from "lucide-react"

export type Role = "admin" | "frontdesk" | "mechanic"

export type MenuItem = {
  label: string
  path: string
  roles: Role[]
  icon?: ComponentType<{ size?: number; className?: string }>
  /** si es false, no aparece en el sidebar pero mantiene RBAC */
  showInSidebar?: boolean
}

export const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", roles: ["admin", "frontdesk", "mechanic"], icon: Home },

  // Users: RBAC activo pero oculto del sidebar (vive dentro de Settings)
  { label: "Users", path: "/users", roles: ["admin"], icon: UserCog, showInSidebar: false },

  { label: "Clients", path: "/clients", roles: ["admin", "frontdesk"], icon: Users },
  { label: "Vehicles", path: "/vehicles", roles: ["admin", "frontdesk", "mechanic"], icon: CarFront },
  { label: "Appointments", path: "/appointments", roles: ["admin", "frontdesk"], icon: Calendar },
  { label: "Work Orders", path: "/workorders", roles: ["admin", "frontdesk", "mechanic"], icon: ClipboardList },

  { label: "Inspections", path: "/inspections", roles: ["admin", "frontdesk", "mechanic"], icon: CheckSquare },
  { label: "Checklist Manager", path: "/inspections/templates", roles: ["admin"], icon: ListChecks },

  { label: "Suppliers", path: "/suppliers", roles: ["admin"], icon: Truck },

  { label: "Reports", path: "/reports", roles: ["admin", "frontdesk"], icon: BarChart },
  { label: "Estimates", path: "/estimates", roles: ["admin", "frontdesk"], icon: FileSignature },

  { label: "Settings", path: "/settings", roles: ["admin"], icon: Settings },
]

export const allRoles: Role[] = ["admin", "frontdesk", "mechanic"]

export function rolesForPath(pathname: string): Role[] {
  const match = menuItems
    .filter((i) => pathname.startsWith(i.path))
    .sort((a, b) => b.path.length - a.path.length)[0]
  if (!match) {
    console.warn(`[RBAC] Path sin mapeo en menuItems: ${pathname} — denegando por defecto`)
    return [] as Role[]
  }
  return match.roles
}