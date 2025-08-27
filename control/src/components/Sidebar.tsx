// control/src/components/Sidebar.tsx

import { useEffect, useMemo, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { getCurrentUserRole } from "@/utils/token"
import { menuItems, type Role } from "@/config/menuItems"
import { LogOut, Menu, X } from "lucide-react"

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  )
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isDesktop
}

export default function Sidebar() {
  const isDesktop = useIsDesktop()
  const [isOpen, setIsOpen] = useState(isDesktop)
  useEffect(() => setIsOpen(isDesktop), [isDesktop])

  const navigate = useNavigate()
  const role = useMemo(() => (getCurrentUserRole() as Role) ?? "frontdesk", [])

  // Oculta los que tengan showInSidebar === false y filtra por rol
  const filteredMenu = menuItems.filter(
    (item) => item.roles.includes(role) && item.showInSidebar !== false
  )

  const handleLogout = () => {
    localStorage.removeItem("nextgencars_token")
    navigate("/login")
  }

  return (
    <>
      {/* Botón hamburguesa (móvil) */}
      <button
        type="button"
        className="md:hidden fixed top-4 right-4 z-50 inline-flex items-center justify-center rounded p-2 bg-gray-800 border border-gray-700"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay móvil */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Sidebar */}
      <aside
        id="main-sidebar"
        className={[
          "bg-gray-900 text-white border-r border-gray-800 flex flex-col",
          "md:static md:h-screen md:w-64",
          "fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-200 md:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
          <div className="text-lg md:text-xl font-bold">NextGenCars</div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded p-2 bg-gray-800 border border-gray-700"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menú */}
        <nav className="mt-3 flex-1 overflow-x-hidden overflow-y-auto md:overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 my-1 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800/70"
                  }`
                }
                onClick={() => !isDesktop && setIsOpen(false)}
              >
                {Icon && <Icon size={20} />}
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg bg-gray-800/60 hover:bg-red-600/70 transition border border-gray-700 hover:border-red-500"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}