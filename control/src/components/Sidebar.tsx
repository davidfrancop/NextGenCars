// src/components/Sidebar.tsx

import { useState, useMemo } from "react"
import {
  Home,
  Users,
  Car,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
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

  const links = useMemo(() => {
    const base = [
      { to: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
      { to: "/clients", label: "Clients", icon: <Users size={20} /> },
      { to: "/vehicles", label: "Vehicles", icon: <Car size={20} /> },
      { to: "/orders", label: "Work Orders", icon: <FileText size={20} /> },
    ]

    if (role === "admin") {
      base.push({ to: "/users", label: "Users", icon: <Settings size={20} /> })
    }

    return base
  }, [role])

  return (
    <>
      {/* Botón hamburguesa SOLO en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={28} />
      </button>

      {/* Sidebar MOBILE */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? "block md:hidden" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <aside
          className="w-60 h-full bg-gray-800 p-4 flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">NextGenCars</h1>
              <button className="text-white" onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <nav className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded transition ${
                    location.pathname === link.to ? "bg-gray-700" : ""
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-400 hover:text-white hover:bg-red-600 p-2 rounded transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </aside>
      </div>

      {/* Sidebar DESKTOP */}
      <aside className="hidden md:flex md:flex-col md:justify-between md:w-60 md:h-screen md:bg-gray-800 md:p-4">
        <div>
          <h1 className="text-xl font-bold mb-6">NextGenCars</h1>
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded transition ${
                  location.pathname === link.to ? "bg-gray-700" : ""
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-red-400 hover:text-white hover:bg-red-600 p-2 rounded transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  )
}
