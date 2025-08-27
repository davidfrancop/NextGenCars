// control/src/config/menuItems.ts

import type { ComponentType } from "react"
import {
  Home,
  Users,
  UserCog,
  Car,        // más compatible que CarFront
  Calendar,
  ClipboardList,
  List,       // más compatible que ListChecks
  Truck,
  BarChart,
  FileText,   // más compatible que FileSignature
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
  /** matcher opcional para rutas dinámicas (/:id, /:id/edit, etc.) */
  match?: RegExp | ((path: string) => boolean)
}

/** Menú + RBAC (visible y oculto) */
export const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", roles: ["admin", "frontdesk", "mechanic"], icon: Home },

  // Users (solo admin) — lo ocultamos del sidebar
  { label: "Users", path: "/users", roles: ["admin"], icon: Users, showInSidebar: false },

  // Clients / Vehicles
  { label: "Clients", path: "/clients", roles: ["admin", "frontdesk"], icon: UserCog },
  { label: "Vehicles", path: "/vehicles", roles: ["admin", "frontdesk", "mechanic"], icon: Car },

  // Work Orders (visible)
  { label: "Work Orders", path: "/workorders", roles: ["admin", "frontdesk", "mechanic"], icon: ClipboardList },
  // Subrutas de Work Orders (ocultas pero con RBAC)
  { label: "Work Orders · Create", path: "/workorders/create", roles: ["admin", "frontdesk"], showInSidebar: false },
  {
    label: "Work Orders · Edit",
    path: "/workorders",
    roles: ["admin", "frontdesk"],
    showInSidebar: false,
    match: /^\/workorders\/[^/]+\/edit$/,
  },
  {
    label: "Work Orders · Details",
    path: "/workorders",
    roles: ["admin", "frontdesk", "mechanic"],
    showInSidebar: false,
    match: /^\/workorders\/[^/]+$/,
  },

  // Pendientes: definidos para RBAC pero ocultos del menú hasta crear las páginas
  { label: "Appointments", path: "/appointments", roles: ["admin", "frontdesk"], icon: Calendar, showInSidebar: false },
  { label: "Inspections", path: "/inspections", roles: ["admin", "mechanic"], icon: List, showInSidebar: false },
  { label: "Checklist Manager", path: "/inspections/templates", roles: ["admin"], icon: List, showInSidebar: false },
  { label: "Suppliers", path: "/suppliers", roles: ["admin"], icon: Truck, showInSidebar: false },
  { label: "Reports", path: "/reports", roles: ["admin", "frontdesk"], icon: BarChart, showInSidebar: false },
  { label: "Estimates", path: "/estimates", roles: ["admin", "frontdesk"], icon: FileText, showInSidebar: false },

  { label: "Settings", path: "/settings", roles: ["admin"], icon: Settings },
]

export const allRoles: Role[] = ["admin", "frontdesk", "mechanic"]

/** Resuelve roles permitidos para un pathname (incluye dinámicas). */
export function rolesForPath(pathname: string): Role[] {
  // 1) Match explícito para rutas dinámicas
  const matched = menuItems.find(i =>
    typeof i.match === "function" ? i.match(pathname)
    : i.match instanceof RegExp ? i.match.test(pathname)
    : false
  )
  if (matched) return matched.roles

  // 2) Coincidencia exacta
  const exact = menuItems.find(i => i.path === pathname)
  if (exact) return exact.roles

  // 3) Prefijo más largo ("/users/123/edit" → "/users")
  const byPrefix = menuItems
    .filter(i => pathname.startsWith(i.path))
    .sort((a, b) => b.path.length - a.path.length)[0]

  if (!byPrefix) {
    console.warn(`[RBAC] Path sin mapeo en menuItems: ${pathname} — denegando por defecto`)
    return []
  }
  return byPrefix.roles
}