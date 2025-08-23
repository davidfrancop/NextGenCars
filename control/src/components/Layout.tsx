// src/components/Layout.tsx

import { ReactNode } from "react"
import Sidebar from "./Sidebar"

type Props = { children?: ReactNode }

export default function Layout({ children }: Props) {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="flex">
        {/* Sidebar: en desktop ocupa ancho; en móvil es overlay (no empuja) */}
        <Sidebar />
        {/* Contenido */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}