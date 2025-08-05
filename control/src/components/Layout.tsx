// src/components/Layout.tsx

import { Outlet, Navigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import { useAuth } from "@/auth/AuthProvider"

export default function Layout() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-400">
        Checking session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex bg-gray-900 text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 pt-16 md:pt-6">
        <Outlet />
      </main>
    </div>
  )
}

