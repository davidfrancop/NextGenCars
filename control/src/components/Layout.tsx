// src/components/Layout.tsx

import { ReactNode } from "react"
import Sidebar from "./Sidebar"

type Props = { children?: ReactNode }

export default function Layout({ children }: Props) {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="flex">
        {/* El Sidebar estático en desktop ocupa su ancho; en móvil es overlay */}
        <Sidebar />
        {/* Contenido: ocupa todo el resto, con padding cómodo */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
