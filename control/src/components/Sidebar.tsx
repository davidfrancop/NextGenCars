// src/components/Sidebar.tsx

import { useState, useMemo } from "react"
import {
  Home,
  Users,
  Car,
  Calendar,
  ClipboardList,
  FileText,
  Wrench,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { getCurrentUserRole } from "@/utils/token"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const role = useMemo(() => getCurrentUserRole(), [])

  const handleLogout = () => {
    localStorage.removeItem("nextgencars_token")
    navigate("/login")
  }

  const menuItems = [
    { to: "/dashboard/admin", label: "Dashboard", icon: <Home size={20} />, roles: ["admin"] },
    { to: "/dashboard/frontdesk", label: "Dashboard", icon: <Home size={20} />, roles: ["frontdesk"] },
    { to: "/dashboard/mechanic", label: "Dashboard", icon: <Home size={20} />, roles: ["mechanic"] },
    { to: "/clients", label: "Clients", icon: <Users size={20} />, roles: ["admin", "frontdesk"] },
    { to: "/vehicles", label: "Vehicles", icon: <Car size={20} />, roles: ["admin", "frontdesk"] },
    { to: "/appointments", label: "Appointments", icon: <Calendar size={20} />, roles: ["admin", "frontdesk", "mechanic"] },
    { to: "/workorders", label: "Work Orders", icon: <ClipboardList size={20} />, roles: ["admin", "frontdesk", "mechanic"] },
    { to: "/invoices", label: "Invoices", icon: <FileText size={20} />, roles: ["admin", "frontdesk"] },
    { to: "/inspections", label: "Inspections", icon: <Wrench size={20} />, roles: ["admin", "mechanic"] },
    { to: "/settings", label: "Settings", icon: <Settings size={20} />, roles: ["admin"] },
  ]

  return (
    <aside
      className={`bg-gray-900 text-white h-screen transition-all ${isOpen ? "w-64" : "w-20"} fixed md:relative`}
    >
      {/* Botón de menú móvil */}
      <div className="flex items-center justify-between p-4 md:hidden">
        <span className="text-lg font-bold">NGC</span>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menú */}
      <nav className="mt-4">
        {menuItems
          .filter((item) => item.roles.includes(role || ""))
          .map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition ${
                location.pathname.startsWith(item.to) ? "bg-gray-700" : ""
              }`}
            >
              {item.icon}
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 w-full">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-red-700 transition"
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
