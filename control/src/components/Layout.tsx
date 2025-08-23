// src/components/Layout.tsx

import { ReactNode } from "react"
import Sidebar from "./Sidebar"

type Props = { children?: ReactNode }

export default function Layout({ children }: Props) {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Sidebar fijo/overlay */}
      <Sidebar />

      {/* Contenido: en desktop deja espacio para el sidebar; en móvil ocupa todo */}
      <main className="min-h-screen md:pl-64 p-6">
        {children}
      </main>
    </div>
  )
}