// src/config/menuItems.ts
import {
  Home, Users, Car, Calendar, ClipboardList,
  FileText, CheckSquare, ListChecks, Truck,
  BarChart, FileSignature, Settings
} from "lucide-react"

export type Role = "admin" | "frontdesk" | "mechanic"

export type MenuItem = {
  label: string
  path: string
  roles: Role[]
  icon?: React.ComponentType<{ size?: number; className?: string }>
}

export const menuItems: MenuItem[] = [
  { label: "Dashboard",   path: "/dashboard",                roles: ["admin","frontdesk","mechanic"], icon: Home },
  { label: "Clients",     path: "/clients",                  roles: ["admin","frontdesk"],             icon: Users },
  { label: "Vehicles",    path: "/vehicles",                 roles: ["admin","frontdesk","mechanic"],  icon: Car },
  { label: "Appointments",path: "/appointments",             roles: ["admin","frontdesk"],             icon: Calendar },
  { label: "Work Orders", path: "/workorders",               roles: ["admin","frontdesk","mechanic"],  icon: ClipboardList },
  { label: "Invoices",    path: "/invoices",                 roles: ["admin"],                          icon: FileText },
  { label: "Inspections", path: "/inspections",              roles: ["admin","mechanic"],              icon: CheckSquare },
  // Subapartado admin para gestionar plantillas de checklist
  { label: "Checklist Manager", path: "/inspections/templates", roles: ["admin"],                       icon: ListChecks },
  { label: "Suppliers",   path: "/suppliers",                roles: ["admin","frontdesk"],             icon: Truck },
  { label: "Reports",     path: "/reports",                  roles: ["admin","frontdesk"],             icon: BarChart },
  { label: "Estimates",   path: "/estimates",                roles: ["admin","frontdesk"],             icon: FileSignature },
  { label: "Settings",    path: "/settings",                 roles: ["admin"],                          icon: Settings },
]

// Helpers
export const allRoles: Role[] = ["admin","frontdesk","mechanic"]

export function rolesForPath(pathname: string): Role[] {
  // Busca por prefijo (sirve para subrutas /clients/create, etc.)
  const item = menuItems.find(i => pathname.startsWith(i.path))
  return item ? item.roles : allRoles
}
