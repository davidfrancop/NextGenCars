// control/src/config/menuItems.ts

import type { ComponentType } from "react"
import {
  Home,
  UserCog,
  Users,
  CarFront,
  Calendar,
  ClipboardList,
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

  // Users (solo admin)
  { label: "Users", path: "/users", roles: ["admin"], icon: Users },

  // Clients y Vehicles (ya creados)
  { label: "Clients", path: "/clients", roles: ["admin", "frontdesk"], icon: UserCog },
  { label: "Vehicles", path: "/vehicles", roles: ["admin", "frontdesk", "mechanic"], icon: CarFront },

  // ✅ Work Orders (ya creada)
  { label: "Work Orders", path: "/workorders", roles: ["admin", "frontdesk", "mechanic"], icon: ClipboardList },

  // 🔹 Ocultas hasta que existan sus páginas
  { label: "Appointments", path: "/appointments", roles: ["admin", "frontdesk"], icon: Calendar, showInSidebar: false },
  { label: "Inspections", path: "/inspections", roles: ["admin", "mechanic"], icon: ClipboardList, showInSidebar: false },
  { label: "Templates", path: "/inspections/templates", roles: ["admin"], icon: ListChecks, showInSidebar: false },
  { label: "Suppliers", path: "/suppliers", roles: ["admin"], icon: Truck, showInSidebar: false },
  { label: "Reports", path: "/reports", roles: ["admin"], icon: BarChart, showInSidebar: false },
  { label: "Estimates", path: "/estimates", roles: ["admin", "frontdesk"], icon: FileSignature, showInSidebar: false },

  // Settings
  { label: "Settings", path: "/settings", roles: ["admin"], icon: Settings },
]