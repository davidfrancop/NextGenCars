// control/src/pages/Settings.tsx

import { Link } from "react-router-dom"
import {
  Users,
  Settings as SettingsIcon,
  FileText,
  ClipboardList,
  Briefcase,
  Building2,
  Wrench,
} from "lucide-react"

export default function Settings() {
  const settingsLinks = [
    {
      label: "User Management",
      description: "Crear, editar o eliminar usuarios del sistema.",
      icon: <Users size={20} />,
      to: "/users",
    },
    {
      label: "Roles & Permissions",
      description: "Configurar permisos por rol.",
      icon: <Briefcase size={20} />,
      to: "/roles", // 🔹 futura implementación
    },
    {
      label: "Company Info",
      description: "Editar datos de la empresa, logo y contactos.",
      icon: <Building2 size={20} />,
      to: "/company-settings", // 🔹 futura implementación
    },
    {
      label: "Invoices & Billing",
      description: "Configurar facturación, impuestos y plantillas.",
      icon: <FileText size={20} />,
      to: "/invoice-settings", // 🔹 futura implementación
    },
    {
      label: "Work Order Templates",
      description: "Personalizar plantillas y checklist de órdenes de trabajo.",
      icon: <ClipboardList size={20} />,
      to: "/workorder-settings", // 🔹 futura implementación
    },
    {
      label: "Inspection Checklists",
      description: "Gestionar puntos de control para inspecciones.",
      icon: <Wrench size={20} />,
      to: "/inspection-checklist", // 🔹 futura implementación
    },
  ]

  return (
    <div className="p-6 text-white">
      {/* Encabezado */}
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon size={28} />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* Tarjetas de configuración */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsLinks.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="bg-gray-800 rounded-lg p-4 shadow hover:bg-gray-700 transition flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 text-lg font-semibold">
              {item.icon}
              {item.label}
            </div>
            <p className="text-sm text-gray-400">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
