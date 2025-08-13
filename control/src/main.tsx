// control/src/main.tsx

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ApolloProvider } from "@apollo/client"
import client from "./apollo/client"
import { AuthProvider, useAuth } from "./auth/AuthProvider"
import "./index.css"

// Públicas
import Login from "./pages/Login"
import Unauthorized from "./pages/Unauthorized"

// Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard"
import FrontdeskDashboard from "./pages/dashboards/FrontdeskDashboard"
import MechanicDashboard from "./pages/dashboards/MechanicDashboard"

// Users
import Users from "./pages/users/Users"
import CreateUser from "./pages/users/CreateUser"
import EditUser from "./pages/users/EditUser"

// Clients
import Clients from "./pages/clients/Clients"
import CreateClient from "./pages/clients/CreateClient"
import EditClient from "./pages/clients/EditClient"

// Vehicles
import Vehicles from "./pages/vehicles/Vehicles"
import CreateVehicle from "./pages/vehicles/CreateVehicle"
import EditVehicle from "./pages/vehicles/EditVehicle"

// Layout y guard
import Layout from "./components/Layout"
import RoleProtectedRoute from "./components/RoleProtectedRoute"

// Redirección al dashboard por rol
function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const role = (user.role || "").toLowerCase()
  if (role === "admin") return <Navigate to="/dashboard/admin" replace />
  if (role === "frontdesk") return <Navigate to="/dashboard/frontdesk" replace />
  if (role === "mechanic") return <Navigate to="/dashboard/mechanic" replace />
  return <Navigate to="/unauthorized" replace />
}

const allRoles = ["admin", "frontdesk", "mechanic"]

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Bloque autenticado para TODOS los roles */}
            <Route element={<RoleProtectedRoute allowedRoles={allRoles} />}>
              <Route element={<Layout />}>
                {/* Dashboards */}
                <Route path="/dashboard" element={<RoleRedirect />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/frontdesk" element={<FrontdeskDashboard />} />
                <Route path="/dashboard/mechanic" element={<MechanicDashboard />} />

                {/* Clients: admin + frontdesk */}
                <Route element={<RoleProtectedRoute allowedRoles={["admin", "frontdesk"]} />}>
                  <Route path="/clients">
                    <Route index element={<Clients />} />
                    <Route path="create" element={<CreateClient />} />
                    <Route path="edit/:clientId" element={<EditClient />} />
                  </Route>
                </Route>

                {/* Vehicles: admin + mechanic */}
                <Route element={<RoleProtectedRoute allowedRoles={["admin", "mechanic"]} />}>
                  <Route path="/vehicles">
                    <Route index element={<Vehicles />} />
                    <Route path="create" element={<CreateVehicle />} />
                    <Route path="edit/:vehicleId" element={<EditVehicle />} />
                  </Route>
                </Route>

                {/* Users: solo admin */}
                <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
                  <Route path="/users">
                    <Route index element={<Users />} />
                    <Route path="create" element={<CreateUser />} />
                    <Route path="edit/:userId" element={<EditUser />} />
                  </Route>
                </Route>

                {/* Settings → abre Users (solo admin) */}
                <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
                  <Route path="/settings" element={<Users />} />
                  {/* Si prefieres redirección: 
                  <Route path="/settings" element={<Navigate to="/users" replace />} /> 
                  */}
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)
