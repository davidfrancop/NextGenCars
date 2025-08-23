// control/src/components/Sidebar.tsx

import { useEffect, useMemo, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { getCurrentUserRole } from "@/utils/token"
import { menuItems, Role } from "@/config/menuItems"
import { LogOut, Menu, X } from "lucide-react"

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
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

  // sincróniza apertura al cambiar breakpoint
  useEffect(() => setIsOpen(isDesktop), [isDesktop])

  // bloquear scroll del body cuando el sidebar móvil está abierto (overlay)
  useEffect(() => {
    if (!isDesktop) {
      document.body.style.overflow = isOpen ? "hidden" : ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDesktop, isOpen])

  const navigate = useNavigate()
  const role = useMemo(() => (getCurrentUserRole() as Role) ?? "frontdesk", [])
  const filteredMenu = menuItems.filter((item) => item.roles.includes(role))

  const handleLogout = () => {
    localStorage.removeItem("nextgencars_token")
    navigate("/login")
  }

  const drawerWidth = "w-64"

  return (
    <>
      {/* Botón hamburguesa fijo ARRIBA-DERECHA en móvil */}
      <button
        type="button"
        className="md:hidden fixed top-4 right-4 z-50 inline-flex items-center justify-center rounded p-2 bg-gray-800 border border-gray-700"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop en móvil */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: overlay en móvil (slide), estático en desktop */}
      <aside
        id="main-sidebar"
        className={[
          "bg-gray-900 text-white h-screen border-r border-gray-800 transition-all duration-200 flex flex-col",
          isDesktop ? "fixed md:static left-0 top-0 z-30" : "fixed left-0 top-0 z-50",
          drawerWidth,
          // animación slide en móvil
          !isDesktop ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0",
        ].join(" ")}
        aria-hidden={!isDesktop && !isOpen ? "true" : "false"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
          <div className="text-lg md:text-xl font-bold">NextGenCars</div>
          {/* Botón cerrar solo en móvil dentro del header */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded p-2 bg-gray-800 border border-gray-700"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menú (sin scroll global; si hay muchos items, que haga scroll solo aquí) */}
        <nav className="mt-3 flex-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 my-1 px-3 py-2 rounded-lg transition ${
                    isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800/70"
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