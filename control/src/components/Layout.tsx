// src/components/Layout.tsx

import type { ReactNode } from "react"
import Sidebar from "./Sidebar"

type Props = { children?: ReactNode }

export default function Layout({ children }: Props) {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Desktop: sidebar estático empuja contenido con flex
          Mobile: sidebar es overlay; el contenido ocupa todo */}
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile: también necesitamos el Sidebar montado para overlay */}
        <div className="md:hidden">
          <Sidebar />
        </div>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}