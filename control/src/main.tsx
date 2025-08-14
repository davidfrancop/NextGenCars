// control/src/main.tsx

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

// Settings
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
            {/* Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Dashboard con guard por rol */}
            <Route element={<RoleProtectedRoute allowedRoles={["admin", "frontdesk", "mechanic"]} />}>
              <Route path="/dashboard" element={<RoleBasedDashboard />} />
            </Route>

            {/* Users (admin) */}
            <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/users" element={<Users />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/users/edit/:userId" element={<EditUser />} />
            </Route>

            {/* Clients (admin, frontdesk) */}
            <Route element={<RoleProtectedRoute allowedRoles={["admin", "frontdesk"]} />}>
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/create" element={<CreateClient />} />
              <Route path="/clients/edit/:clientId" element={<EditClient />} />
            </Route>

            {/* Vehicles (admin, frontdesk, mechanic) */}
            <Route element={<RoleProtectedRoute allowedRoles={["admin", "frontdesk", "mechanic"]} />}>
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/create" element={<CreateVehicle />} />
              <Route path="/vehicles/edit/:vehicleId" element={<EditVehicle />} />
            </Route>

            {/* Settings (admin) */}
            <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)
