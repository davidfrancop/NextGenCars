// src/main.tsx

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ApolloProvider } from "@apollo/client"
import client from "./apollo/client"
import { AuthProvider } from "./auth/AuthProvider"
import "./index.css"

import RoleProtectedRoute from "./components/RoleProtectedRoute"
import { getCurrentUserRole } from "./utils/token"

// Páginas públicas
import Login from "./pages/Login"
import Unauthorized from "./pages/Unauthorized"

// Dashboards por rol
import AdminDashboard from "./pages/dashboards/AdminDashboard"
import FrontdeskDashboard from "./pages/dashboards/FrontdeskDashboard"
import MechanicDashboard from "./pages/dashboards/MechanicDashboard"

// Usuarios
import Users from "./pages/users/Users"
import CreateUser from "./pages/users/CreateUser"
import EditUser from "./pages/users/EditUser"

// Clientes
import Clients from "./pages/clients/Clients"
import CreateClient from "./pages/clients/CreateClient"
import EditClient from "./pages/clients/EditClient"

// Vehículos
import Vehicles from "./pages/vehicles/Vehicles"
import CreateVehicle from "./pages/vehicles/CreateVehicle"
import EditVehicle from "./pages/vehicles/EditVehicle"

// Configuración
import Settings from "./pages/Settings"

function RoleBasedDashboard() {
  const role = getCurrentUserRole()
  if (role === "admin") return <AdminDashboard />
  if (role === "frontdesk") return <FrontdeskDashboard />
  if (role === "mechanic") return <MechanicDashboard />
  return <Navigate to="/unauthorized" replace />
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ✅ Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* 🔐 Dashboard */}
            <Route element={<RoleProtectedRoute />}>
              <Route path="/dashboard" element={<RoleBasedDashboard />} />
            </Route>

            {/* 🔐 Usuarios */}
            <Route element={<RoleProtectedRoute />}>
              <Route path="/users" element={<Users />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/users/:id/edit" element={<EditUser />} />
            </Route>

            {/* 🔐 Clientes */}
            <Route element={<RoleProtectedRoute />}>
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/create" element={<CreateClient />} />
              <Route path="/clients/:id/edit" element={<EditClient />} />
            </Route>

            {/* 🔐 Vehículos */}
            <Route element={<RoleProtectedRoute />}>
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/create" element={<CreateVehicle />} />
              <Route path="/vehicles/:id/edit" element={<EditVehicle />} />
            </Route>

            {/* 🔐 Configuración */}
            <Route element={<RoleProtectedRoute />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* 🌐 Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)