// src/components/Layout.tsx

import { ReactNode } from "react"
import Sidebar from "./Sidebar"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-gray-900 text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 pt-16 md:pt-6">{children}</main>
    </div>
  )
}
