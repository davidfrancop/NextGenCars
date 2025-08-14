// control/src/components/Sidebar.tsx

import { useEffect, useMemo, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { getCurrentUserRole } from "@/utils/token"
import { menuItems, Role } from "@/config/menuItems"
import { LogOut, Menu, X } from "lucide-react"

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : true
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
  const filteredMenu = menuItems.filter((item) => item.roles.includes(role))

  const handleLogout = () => {
    localStorage.removeItem("nextgencars_token")
    navigate("/login")
  }

  const widthClass = isOpen || isDesktop ? "w-64" : "w-20"

  return (
    <>
      {/* Botón móvil (overlay) */}
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center rounded p-2 bg-gray-800 border border-gray-700"
        onClick={() => setIsOpen((v) => !v)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar: fijo sólo en móvil (overlay), estático en desktop (empuja por flex) */}
      <aside
        id="main-sidebar"
        className={[
          "bg-gray-900 text-white h-screen border-r border-gray-800 transition-all duration-200 flex flex-col",
          "fixed md:static top-0 left-0 z-40", // fixed en móvil, static en desktop
          widthClass,
          // sombra leve cuando es overlay
          !isDesktop ? "shadow-2xl" : "",
        ].join(" ")}
      >
        {/* Header */}
        <div className="hidden md:flex items-center gap-2 px-4 h-16 border-b border-gray-800">
          <div className="text-xl font-bold">NextGenCars</div>
        </div>
        <div className="md:hidden flex items-center justify-between px-4 h-16 border-b border-gray-800">
          <div className="text-lg font-semibold">NextGenCars</div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded p-2 bg-gray-800 border border-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Menú */}
        <nav className="mt-3 flex-1">
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
                {(isOpen || isDesktop) && <span className="truncate">{item.label}</span>}
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
            {(isOpen || isDesktop) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
