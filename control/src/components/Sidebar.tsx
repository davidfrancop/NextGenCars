// src/components/Sidebar.tsx

import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/AuthProvider"
import { menuItems } from "@/config/menuItems"
import { LogOut } from "lucide-react"

export default function Sidebar() {
  const { user, logout } = useAuth()
  const role = (user?.role || "").toLowerCase()
  const navigate = useNavigate()

  const visible = menuItems.filter(i => i.roles.includes(role as any))

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800">
      <nav className="p-3 space-y-1">
        {visible.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md transition
               ${isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"}`
            }
          >
            {item.icon ? <item.icon size={18} className="shrink-0" /> : null}
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* --- Logout al final --- */}
        <div className="mt-4 border-t border-gray-800 pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}
